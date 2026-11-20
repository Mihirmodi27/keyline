/**
 * The score out of 10: one number a person reads first, drafted from the six
 * domain scores (0–4) and held under caps that come from evidence. The audit
 * drafts it; the agent settles it (commands/audit.md); the report renders it
 * and recomputes the caps, so a score settled above them shows as such.
 */

/** The score out of 10 a product has to reach before it ships. */
export const SHIP = 8;

const NAMES = { type: "type", color: "colour", layout: "layout", depth: "depth", motion: "motion", patterns: "patterns" };
const named = (ds) => ds.map((d) => NAMES[d] ?? d).join(", ");

const isOpen = (f) => f.status !== "dismissed" && f.status !== "fixed";

/**
 * What holds the score out of 10 down, whatever the judgement: each cap is
 * evidence a reader would meet. The agent settling the score may go lower
 * than the lowest cap, never higher.
 */
export function scoreCaps(scores, findings) {
  const caps = [];
  const errors = findings.filter((f) => isOpen(f) && f.severity === "error").length;
  if (errors) caps.push({ max: 6, why: `${errors} open ${errors === 1 ? "error" : "errors"}: broken for someone` });
  const warnings = findings.filter((f) => isOpen(f) && f.severity === "warning").length;
  if (warnings) caps.push({ max: 7, why: `${warnings} open ${warnings === 1 ? "warning" : "warnings"}: a law a reader feels` });
  const at = (test) => Object.entries(scores ?? {}).filter(([, s]) => test(s)).map(([d]) => d);
  const broken = at((s) => s <= 1);
  if (broken.length) caps.push({ max: 5, why: `${named(broken)} not working as a system` });
  const felt = at((s) => s === 2);
  if (felt.length) caps.push({ max: 7, why: `a law a reader feels is broken in ${named(felt)}` });
  return caps.sort((a, b) => a.max - b.max);
}

/**
 * A draft score out of 10 from the domain scores: 2 + 2 × their mean, so all
 * 4s is 10, all 3s is 8 (ready to ship), all 2s is 6. Then held under the
 * caps, and rounded to the half point.
 */
export function draftScore(scores, findings) {
  const values = Object.values(scores ?? {});
  if (!values.length) return null;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const capped = Math.min(2 + 2 * mean, ...scoreCaps(scores, findings).map((c) => c.max));
  return Math.round(capped * 2) / 2;
}
