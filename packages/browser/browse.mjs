/**
 * Keyline's browser tools: the pages a product has, a walk through them, and
 * the report. The audit and the smoke test are built on these.
 *
 *   keyline pages   [--root .] [--base URL] [--json]
 *   keyline capture (--base URL | --serve DIR) [--root .] [--out keyline-report]
 *   keyline report  [DIR] [--compare PREVIOUS-DIR]
 *
 * Exit codes: 0 done, 1 the walk found errors, 2 a usage error.
 */
import { existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { parseOrExplain } from "./browse/args.mjs";
import { counts, writeRun } from "./browse/findings.mjs";
import { renderDir } from "./browse/report.mjs";
import { compareDirs } from "./browse/compare.mjs";
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

  keyline report [DIR] [--compare PREVIOUS-DIR]
      Re-render DIR/index.html from DIR/findings.json (default keyline-report).
      With --compare, first mark each finding new, still or back since the
      run in PREVIOUS-DIR, list what was fixed, and diff the screenshots.

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
  --compare <dir>       an earlier report to compare with (report, capture)
  --threshold <pct>     a page whose screenshot changed more than this gets a
                        visual/changed note (default 0.01; one changed heading
                        on a 1440×900 page is about 0.08)
  --no-diff             compare findings only, not screenshots
  -h, --help            this`;

/** What pages, capture and report take. */
export const BROWSE_OPTIONS = {
  values: ["base", "serve", "root", "out", "routes", "limit", "viewports", "themes", "compare", "threshold"],
  switches: ["headed", "json", "no-diff"],
};

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

/** Why `--compare` can't run, or null. A capture writes over its own folder, so the earlier run must live elsewhere. */
function compareProblem(dir, prev, { before = false } = {}) {
  const p = resolve(prev);
  if (p === dir) return `--compare needs an earlier report in another folder: ${before ? "a capture writes over its own, so copy it first (cp -R keyline-report keyline-report-before) or pass --out" : "this is the same one"}`;
  if (!existsSync(`${p}/findings.json`)) return `no findings.json in ${prev} to compare with`;
  return null;
}

const compareOptions = (opts) => ({ diff: !opts["no-diff"], threshold: Number(opts.threshold ?? 0.01) });

function sinceLine(run) {
  const c = run.compare;
  const v = c.visual;
  return `Since ${c.against}: ${c.new} new · ${c.returned} back · ${c.still} still · ${c.fixed} fixed${v ? ` · ${v.changed} of ${v.compared} screenshots changed` : ""}`;
}

export async function run(argv) {
  const opts = parseOrExplain(["pages", "capture", "report"].includes(argv[0]) ? argv[0] : "browse", argv, BROWSE_OPTIONS);
  if (!opts) return 2;
  const [cmd, arg] = opts._;
  if (opts.help || !cmd) {
    console.log(USAGE);
    return cmd ? 0 : 2;
  }

  if (cmd === "report") {
    const dir = resolve(arg ?? opts.out ?? "keyline-report");
    if (opts.compare) {
      const err = compareProblem(dir, opts.compare);
      if (err) {
        console.error(err);
        return 2;
      }
      const run = await compareDirs(dir, resolve(opts.compare), compareOptions(opts));
      console.log(sinceLine(run));
    }
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
    if (opts.compare) {
      const err = compareProblem(out, opts.compare, { before: true });
      if (err) {
        await t.stop();
        console.error(err);
        return 2;
      }
    }
    if (existsSync(`${out}/shots`)) rmSync(`${out}/shots`, { recursive: true });
    if (existsSync(`${out}/diffs`)) rmSync(`${out}/diffs`, { recursive: true });
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
      const final = opts.compare ? await compareDirs(out, resolve(opts.compare), compareOptions(opts)) : result;
      const file = renderDir(out);
      const c = counts(final.findings);
      // Against an earlier run, only errors this run added fail it, as with the detector's baseline.
      const failing = final.compare ? counts(final.findings.filter((f) => f.change === "new" || f.change === "returned")) : c;
      console.log(`\n${final.pages.length} pages · ${c.error} errors · ${c.warning} warnings · ${c.info} notes${final.compare ? `\n${sinceLine(final)}` : ""}\n${file}`);
      return failing.error ? 1 : 0;
    } finally {
      await t.stop();
    }
  }

  console.error(`no command '${cmd}'\n\n${USAGE}`);
  return 2;
}
