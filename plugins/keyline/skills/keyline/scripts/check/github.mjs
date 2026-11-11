/**
 * Findings as GitHub workflow annotations, for `keyline check --format github`:
 *
 *   ::error file=src/a.css,line=3,title=Keyline%3A motion/transition-all::…
 *
 * GitHub draws them on a pull request's lines with no token. It shows at most
 * ten errors and ten warnings per step, so they're printed errors first. The
 * step summary and the PR comment are the Action's (ci/github.mjs in the repo).
 */
import { bySeverity } from "./findings.mjs";

const LEVEL = { error: "error", warning: "warning", info: "notice" };

/** Workflow-command escaping: data loses newlines and %, properties also : and , */
const escData = (s) => String(s ?? "").replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
const escProp = (s) => escData(s).replace(/:/g, "%3A").replace(/,/g, "%2C");

/** One finding as a workflow command. `prefix` is the path from the repository's top to the checked root. */
export function annotation(f, { prefix = "" } = {}) {
  const props = [`file=${escProp(prefix + f.file)}`];
  if (f.line) props.push(`line=${f.line}`);
  props.push(`title=${escProp(`Keyline: ${f.rule}`)}`);
  return `::${LEVEL[f.severity] ?? "warning"} ${props.join(",")}::${escData(f.law ? `${f.message} (${f.law})` : f.message)}`;
}

/** The findings worth a line on the PR: against a baseline, only new ones. Errors first. */
export function toAnnotate(findings) {
  const list = findings.some((f) => f.change) ? findings.filter((f) => f.change === "new") : findings;
  return [...list].sort((a, b) => bySeverity(a, b) || a.file.localeCompare(b.file) || a.line - b.line);
}

export function annotations(findings, opts) {
  return toAnnotate(findings).map((f) => annotation(f, opts));
}
