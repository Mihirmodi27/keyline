#!/usr/bin/env node
/**
 * The audit's machine half: walk every page of a running product at desktop
 * and phone, light and dark; measure contrast, names, targets, overflow, the
 * type actually rendered, copy and the tells of AI slop inside each page; add
 * the detector's findings from the source; draft a score per domain; write
 * keyline-report/ (findings.json, index.html, shots/).
 *
 * The agent's half follows (commands/audit.md): look at the shots, add the
 * findings only judgement can make, settle the scores, write the summary, and
 * re-render with `browse.mjs report`.
 *
 *   node audit.mjs --base http://localhost:3000 [--root .]
 *   node audit.mjs --serve dist
 *   node audit.mjs --base … --quick [--routes /pricing]     one page, the quick read
 *
 * Exit codes: 0 done, 1 errors found, 2 a usage error.
 */
import { existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { add, counts, writeRun } from "./browse/findings.mjs";
import { shotKey } from "./browse/capture.mjs";
import { renderDir } from "./browse/report.mjs";
import { walk } from "./browse/walk.mjs";
import { parseArgs, target } from "./browse.mjs";
import { auditProbe } from "./audit/probe.mjs";
import { check } from "./check.mjs";

const USAGE = `keyline audit — every page, measured, in one report.

  keyline audit (--base URL | --serve DIR) [options]

Options:
  --base <url>        the running product
  --serve <dir>       serve a static folder instead
  --root <dir>        the project's code: routes, and the detector (default: .)
  --out <dir>         where the report goes (default: keyline-report)
  --routes <a,b>      only these paths
  --limit <n>         at most this many pages (default 40)
  --quick             one page (the first route, or /), desktop and phone, light only
  --no-check          skip the source detector
  --motion            leave motion on (default: reduced, so pages are shot settled)
  --headed            show the browser
  -h, --help          this`;

/** The six domains the scores are kept for, and where the audit's own rules fall among them. */
export const SCORED = ["type", "color", "layout", "depth", "motion", "patterns"];
const SCORE_DOMAIN = {
  a11y: "patterns",
  copy: "patterns",
  states: "patterns",
  runtime: "patterns",
  "a11y/target-size": "layout",
  "a11y/headings": "type",
  "color/contrast": "color",
  "slop/gradient-text": "color",
  "slop/purple-gradient": "color",
  "slop/glass-everywhere": "depth",
  "slop/card-grid": "depth",
  "slop/eyebrows": "type",
  "slop/emoji-bullets": "patterns",
  "slop/generic-copy": "patterns",
  "slop/placeholder-brands": "patterns",
};

export const FIX = {
  type: "/keyline type",
  color: "/keyline color",
  layout: "/keyline layout",
  depth: "/keyline depth",
  motion: "/keyline motion",
  patterns: "/keyline patterns",
};

export function scoreDomain(f) {
  const domain = f.domain ?? f.rule.split("/")[0];
  return SCORE_DOMAIN[f.rule] ?? (SCORED.includes(domain) ? domain : SCORE_DOMAIN[domain] ?? "patterns");
}

/**
 * A draft score per domain from the findings: 4 with nothing to report, down
 * by each distinct rule broken (an error 1.5, a warning 0.75, a note 0.15),
 * plus up to 1 more for how many places break it. The agent settles the
 * real score; the draft keeps a mechanical floor under the judgement.
 */
export function draftScores(findings) {
  const scores = {};
  for (const d of SCORED) {
    const rules = new Map();
    for (const f of findings) {
      if (f.status === "dismissed" || f.status === "fixed" || scoreDomain(f) !== d) continue;
      const w = f.severity === "error" ? 1.5 : f.severity === "warning" ? 0.75 : 0.15;
      const r = rules.get(f.rule) ?? { w: 0, n: 0 };
      rules.set(f.rule, { w: Math.max(r.w, w), n: r.n + 1 });
    }
    // Each rule broken costs its weight once, plus a little for how widely it's broken.
    const penalty = [...rules.values()].reduce((sum, r) => sum + r.w + Math.min(1, (r.n - 1) * 0.1), 0);
    scores[d] = Math.max(0, Math.min(4, Math.round(4 - penalty)));
  }
  return scores;
}

/** The detector's findings, as report findings pointing at source lines. */
export function sourceFindings(run, root, ignores = []) {
  const result = check({ root, paths: ["."], ignores: ["keyline-report", "smoke-report", "node_modules", ".next", "dist", "build", ...ignores] });
  for (const f of result.findings) {
    const [title, ...rest] = f.message.split(/(?<=\.)\s+/);
    add(run, {
      kind: "check",
      rule: f.rule,
      domain: f.domain,
      law: f.law,
      severity: f.severity,
      title: title.replace(/\.$/, ""),
      detail: rest.join(" ") || undefined,
      file: f.file,
      line: f.line,
      fix: FIX[f.domain],
    });
  }
  return result;
}

export async function run(argv) {
  const opts = parseArgs(argv);
  if (opts.help || opts.h) {
    console.log(USAGE);
    return 0;
  }
  const t = await target(opts);
  if (!t) {
    console.error("audit needs --base <url> or --serve <dir>\n");
    console.error(USAGE);
    return 2;
  }
  const out = resolve(opts.out ?? "keyline-report");
  if (existsSync(`${out}/shots`)) rmSync(`${out}/shots`, { recursive: true });
  const quick = Boolean(opts.quick);
  const routes = opts.routes ? String(opts.routes).split(",").map((s) => s.trim()) : quick ? ["/"] : null;

  try {
    const signatures = new Map();
    const result = await walk({
      kind: "audit",
      title: opts.title ?? null,
      base: t.base,
      root: t.root,
      out,
      routes: quick ? routes.slice(0, 1) : routes,
      limit: quick ? 1 : Number(opts.limit ?? 40),
      viewports: ["desktop", "phone"],
      themes: quick ? ["light"] : ["light", "dark"],
      headless: !opts.headed,
      // Shot and measured as a reader sees the page once it settles: opening sequences and
      // scroll reveals done. --motion audits with motion on, as a first visit plays it.
      reducedMotion: !opts.motion,
      // Structure, type, copy and slop are measured once per page, on the first (desktop, light) pass.
      probeFor: (viewport, theme) => [{ name: "audit", fn: auditProbe, arg: { viewport, theme, firstPass: viewport === "desktop" && theme === "light" } }],
      judge: (run, v) => {
        const raw = v.results.audit;
        // A page without a dark theme renders the same colours in the dark pass; skip its repeats.
        const meta = Array.isArray(raw) ? raw.find((f) => f.meta) : null;
        if (meta) {
          const key = `${v.route}|${v.viewport}`;
          if (v.theme === "light") signatures.set(key, meta.signature);
          else if (signatures.get(key) === meta.signature) return;
        }
        if (!Array.isArray(raw)) {
          if (raw?.error) add(run, { rule: "runtime/probe-failed", severity: "info", title: "The audit's checks couldn't run on this page", evidence: raw.error, page: v.route, viewport: v.viewport, theme: v.theme });
          return;
        }
        for (const f of raw.filter((f) => !f.meta)) {
          add(run, {
            ...f,
            kind: "audit",
            page: v.route,
            viewport: v.viewport,
            theme: v.theme,
            shot: v.shot && f.box ? shotKey(v.viewport, v.theme) : undefined,
            fix: f.fix ?? FIX[scoreDomain(f)],
          });
        }
      },
    });

    if (!opts["no-check"] && t.root && existsSync(t.root)) sourceFindings(result, t.root);
    result.scores = draftScores(result.findings);
    result.scoresDraft = true;
    writeRun(out, result);
    const file = renderDir(out);
    const c = counts(result.findings);
    console.log(`\n${result.pages.length} ${result.pages.length === 1 ? "page" : "pages"} · ${c.error} errors · ${c.warning} warnings · ${c.info} notes\n${file}`);
    return c.error ? 1 : 0;
  } finally {
    await t.stop();
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  run(process.argv.slice(2)).then(
    (code) => process.exit(code),
    (err) => {
      console.error(err?.stack ?? err);
      process.exit(2);
    },
  );
}
