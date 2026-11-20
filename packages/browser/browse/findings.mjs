/**
 * One format for everything Keyline reports about a running product: the
 * audit, the smoke test, a plain capture. Each run is a folder:
 *
 *   keyline-report/
 *     findings.json   the run, below
 *     index.html      the report, rendered from findings.json by report.mjs
 *     shots/          one PNG per page × viewport × theme
 *
 * findings.json:
 *
 *   {
 *     "version": 1,
 *     "kind": "audit" | "smoke" | "capture",
 *     "title": "Lumen", "base": "http://localhost:3000", "root": "/abs/project",
 *     "started": ISO, "finished": ISO,
 *     "scores": { "type": 3, … } | null,          // 0–4 per domain, audit only
 *     "score": 7.5 | null,                        // out of 10, audit only; 8 is ready to ship (score.mjs)
 *     "history": [6, 7],                          // earlier runs' scores over the same pages, oldest first
 *     "summary": "one paragraph a person reads first" | null,
 *     "pages": [ { "route": "/settings", "url": …, "title": …, "status": 200,
 *                  "shots": { "desktop-light": { "path": "shots/…png", "width": 1440, "height": 3120 } } } ],
 *     "findings": [ Finding ]
 *   }
 *
 * A Finding (only `rule` and `title` are required):
 *
 *   id        stable within the run, e.g. "f12"
 *   kind      "audit" | "smoke" | "capture" | "check"
 *   domain    type | color | layout | depth | motion | patterns | a11y | slop | flow | copy | states | runtime | visual
 *   rule      "a11y/name", "flow/dead-click", "slop/purple-hero" …
 *   law       "patterns law 1" — the law it comes from, when there is one
 *   severity  "error" | "warning" | "info"
 *   title     one line a person understands without the rule id
 *   detail    what's wrong, what the reader feels, what to do
 *   evidence  the measurement: "2.36:1", "click changed nothing", "404"
 *   page      the route it was seen on
 *   viewport  "desktop" | "phone"
 *   theme     "light" | "dark"
 *   shot      the key of the page's shot it was seen in, e.g. "desktop-light"
 *   box       { x, y, w, h } in CSS pixels on that full-page shot — drawn in the report
 *   selector  a CSS selector for the element
 *   file      source file, relative to the project root, and `line`
 *   fix       the command that fixes it: "/keyline color", "/keyline polish --from keyline-report"
 *   steps     smoke only: the steps that reproduce it, in order
 *   status    "open" (default) | "accepted" | "dismissed" | "fixed" — set by a person, the auditing agent, or polish --from
 *
 * Compared with an earlier run (`report --compare`, see compare.mjs), each
 * finding also has `change` ("new" | "still" | "returned"), the run has
 * `compare` (the counts) and `fixed` (the earlier run's findings that are
 * gone), and each page has `diffs`, its screenshot diffs by shot key.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { SEVERITIES, bySeverity, tally } from "trykeyline/check/findings";
import { DOMAINS as LAW_DOMAINS } from "trykeyline/check/rules";

/** The six law domains, and what only a rendered page shows. */
export const DOMAINS = [...LAW_DOMAINS, "a11y", "copy", "states", "slop", "flow", "runtime", "visual"];

export function newRun({ kind, title = null, base = null, root = null }) {
  return {
    version: 1,
    kind,
    title,
    base,
    root,
    started: new Date().toISOString(),
    finished: null,
    scores: null,
    score: null,
    history: [],
    summary: null,
    pages: [],
    findings: [],
  };
}

/** Add a finding, filling defaults and an id. Returns it. */
export function add(run, f) {
  if (!f.rule || !f.title) throw new Error(`a finding needs a rule and a title: ${JSON.stringify(f)}`);
  const finding = {
    id: f.id ?? `f${run.findings.length + 1}`,
    kind: f.kind ?? run.kind,
    domain: f.domain ?? f.rule.split("/")[0],
    severity: SEVERITIES.includes(f.severity) ? f.severity : "warning",
    status: f.status ?? "open",
    ...f,
  };
  run.findings.push(finding);
  return finding;
}

/** The same problem seen on many pages is one finding per page, but not twice on one page. */
export function dedupe(findings) {
  const seen = new Set();
  return findings.filter((f) => {
    const key = [f.rule, f.page, f.viewport, f.theme, f.selector ?? f.title].join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function sortFindings(findings) {
  return [...findings].sort((a, b) => bySeverity(a, b) || String(a.page).localeCompare(String(b.page)) || a.rule.localeCompare(b.rule));
}

/** Open findings by severity and domain: dismissed and fixed ones don't count. */
export function counts(findings) {
  return tally(findings, { skip: (f) => f.status === "dismissed" || f.status === "fixed" });
}

export function writeRun(dir, run) {
  mkdirSync(dir, { recursive: true });
  run.finished ??= new Date().toISOString();
  run.findings = sortFindings(dedupe(run.findings)).map((f, i) => ({ ...f, id: `f${i + 1}` }));
  writeFileSync(join(dir, "findings.json"), JSON.stringify(run, null, 2) + "\n");
  return run;
}

export function readRun(dir) {
  const file = join(dir, "findings.json");
  if (!existsSync(file)) throw new Error(`no findings.json in ${dir}`);
  const run = JSON.parse(readFileSync(file, "utf8"));
  if (run.version !== 1) throw new Error(`findings.json version ${run.version} isn't one this Keyline reads`);
  return run;
}
