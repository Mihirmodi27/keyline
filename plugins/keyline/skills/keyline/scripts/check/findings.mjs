/**
 * What every Keyline report does with its findings, whatever made them: the
 * detector (check.mjs, its baseline, the PR annotations) and the browser
 * reports (trykeyline-browser's audit, smoke test and capture).
 */

/** Worst first. */
export const SEVERITIES = ["error", "warning", "info"];

/** A sort comparator: errors, then warnings, then info. */
export const bySeverity = (a, b) => SEVERITIES.indexOf(a.severity) - SEVERITIES.indexOf(b.severity);

/**
 * Findings counted by severity and by domain. `domains` are listed even at
 * zero; `skip` leaves findings out (a report's dismissed and fixed ones).
 */
export function tally(findings, { domains = [], skip = null } = {}) {
  const c = { error: 0, warning: 0, info: 0, byDomain: Object.fromEntries(domains.map((d) => [d, 0])) };
  for (const f of findings) {
    if (skip?.(f)) continue;
    c[f.severity]++;
    c.byDomain[f.domain] = (c.byDomain[f.domain] ?? 0) + 1;
  }
  return c;
}

/**
 * What a finding is about, for matching it across runs: the same key the
 * baseline, a report's --compare and a recorded decision use.
 *
 * - Found in the source (the detector's, in any report): its fingerprint, the
 *   rule + file + the text of the line (baseline.mjs), so moving code doesn't
 *   change it. A report written before findings carried one falls back to the
 *   rule, file and title.
 * - Seen on a page (the audit's, the smoke test's): the rule, page, viewport,
 *   theme and element; the title stands in when there's no element.
 */
export function matchKey(f) {
  if (f.fingerprint) return `source|${f.fingerprint}`;
  if (f.file && !f.page) return `source|${f.rule}|${f.file}|${f.title ?? f.message ?? ""}`;
  return [f.rule, f.page ?? "", f.viewport ?? "", f.theme ?? "", f.selector ?? f.title].join("|");
}

/**
 * What makes two findings in one run the same finding, so a report lists it
 * once: on a page, the match key (one problem seen twice on one page); in the
 * source, the line too, since two identical lines are two findings.
 */
export function dedupeKey(f) {
  if (f.file && !f.page) return `source|${f.rule}|${f.file}|${f.line ?? ""}|${f.fingerprint ?? f.title ?? f.message ?? ""}`;
  return matchKey(f);
}

/**
 * Match today's findings against an earlier run's, one for one by `key`.
 * Returns `matched`, each current finding with the earlier one it matched
 * (or null: it's new), and `left`, the earlier findings nothing matched (the
 * candidates for fixed). Two identical findings today against one before is
 * one still and one new.
 */
export function split(current, previous, key) {
  const pool = new Map();
  for (const p of previous) {
    const k = key(p);
    if (!pool.has(k)) pool.set(k, []);
    pool.get(k).push(p);
  }
  const matched = current.map((f) => [f, pool.get(key(f))?.shift() ?? null]);
  return { matched, left: [...pool.values()].flat() };
}
