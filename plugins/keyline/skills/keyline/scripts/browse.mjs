#!/usr/bin/env node
/**
 * Keyline's browser tools: the pages a product has, a walk through them, and
 * the report. The audit and the smoke test are built on these.
 *
 *   node browse.mjs pages   [--root .] [--base URL] [--json]
 *   node browse.mjs capture (--base URL | --serve DIR) [--root .] [--out keyline-report]
 *   node browse.mjs report  [DIR]
 *
 * Exit codes: 0 done, 1 the walk found errors, 2 a usage error.
 */
import { existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { counts, writeRun } from "./browse/findings.mjs";
import { renderDir } from "./browse/report.mjs";
import { discover } from "./browse/routes.mjs";
import { serve } from "./browse/serve.mjs";
import { walk } from "./browse/walk.mjs";

const USAGE = `keyline browse — find a product's pages, walk them, and report.

  keyline pages   [--root .] [--base URL] [--json]
      Every route: from the router's files, the sitemap and a crawl.

  keyline capture (--base URL | --serve DIR) [options]
      Visit every page at desktop and phone, light and dark; screenshot each,
      record load failures, error statuses, console errors, exceptions and
      failed requests; write findings.json and index.html.

  keyline report [DIR]
      Re-render DIR/index.html from DIR/findings.json (default keyline-report).

Options:
  --base <url>          the running product, e.g. http://localhost:3000
  --serve <dir>         serve a static folder on a free port instead
  --root <dir>          the project's code, for routes (default: .)
  --out <dir>           where the report goes (default: keyline-report)
  --routes <a,b>        only these paths
  --limit <n>           at most this many pages (default 40)
  --viewports <list>    desktop,phone (default both)
  --themes <list>       light,dark (default both)
  --headed              show the browser
  --json                pages as JSON
  -h, --help            this`;

export function parseArgs(argv) {
  const opts = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) {
      opts._.push(a);
      continue;
    }
    const [k, inline] = a.slice(2).split("=");
    // A switch takes no value: a known one, or any option followed by another option or nothing.
    const flag = ["json", "headed", "help", "strict", "quick", "no-check", "allow-writes"].includes(k) || (inline === undefined && (i + 1 >= argv.length || argv[i + 1].startsWith("--")));
    opts[k] = flag ? true : (inline ?? argv[++i]);
  }
  return opts;
}

const list = (v, fallback) => (v ? String(v).split(",").map((s) => s.trim()).filter(Boolean) : fallback);

/** The base URL to walk: the one given, or a static server over --serve. */
export async function target(opts) {
  if (opts.base) return { base: opts.base, root: resolve(opts.root ?? "."), stop: async () => {} };
  if (opts.serve) {
    const dir = resolve(opts.serve);
    if (!existsSync(dir)) throw new Error(`no folder ${opts.serve}`);
    const s = await serve(dir);
    return { base: s.url, root: resolve(opts.root ?? dir), stop: s.close };
  }
  return null;
}

export async function run(argv) {
  const opts = parseArgs(argv);
  const [cmd, arg] = opts._;
  if (opts.help || opts.h || !cmd) {
    console.log(USAGE);
    return cmd ? 0 : 2;
  }

  if (cmd === "report") {
    const dir = resolve(arg ?? opts.out ?? "keyline-report");
    console.log(renderDir(dir));
    return 0;
  }

  if (cmd === "pages") {
    const t = await target(opts);
    const found = await discover({ root: t?.root ?? resolve(opts.root ?? "."), base: t?.base ?? null, limit: Number(opts.limit ?? 200) });
    await t?.stop();
    if (opts.json) {
      console.log(JSON.stringify(found, null, 2));
      return 0;
    }
    for (const r of found.routes) console.log(`${r.path.padEnd(40)} ${r.sources.join(", ")}`);
    if (found.dynamic.length) {
      console.log(`\nNeed an example to visit:`);
      for (const d of found.dynamic) console.log(`${d.path.padEnd(40)} ${d.sample ? `→ ${d.sample}` : "no example found"}`);
    }
    return 0;
  }

  if (cmd === "capture") {
    const t = await target(opts);
    if (!t) {
      console.error("capture needs --base <url> or --serve <dir>\n");
      console.error(USAGE);
      return 2;
    }
    const out = resolve(opts.out ?? "keyline-report");
    if (existsSync(`${out}/shots`)) rmSync(`${out}/shots`, { recursive: true });
    try {
      const result = await walk({
        kind: "capture",
        base: t.base,
        root: t.root,
        out,
        routes: opts.routes ? list(opts.routes) : null,
        limit: Number(opts.limit ?? 40),
        viewports: list(opts.viewports, ["desktop", "phone"]),
        themes: list(opts.themes, ["light", "dark"]),
        headless: !opts.headed,
      });
      writeRun(out, result);
      const file = renderDir(out);
      const c = counts(result.findings);
      console.log(`\n${result.pages.length} pages · ${c.error} errors · ${c.warning} warnings · ${c.info} notes\n${file}`);
      return c.error ? 1 : 0;
    } finally {
      await t.stop();
    }
  }

  console.error(`no command '${cmd}'\n\n${USAGE}`);
  return 2;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  run(process.argv.slice(2)).then(
    (code) => process.exit(code),
    (err) => {
      console.error(err?.message ?? err);
      process.exit(2);
    },
  );
}
