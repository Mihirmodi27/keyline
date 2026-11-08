/**
 * A baseline: what the detector found on one day, so a later run can say what
 * is new, what is fixed and what is still there. It lets a codebase with years
 * of findings adopt the detector without fixing everything first — the run
 * fails only on what a change adds.
 *
 *   keyline check --baseline save     write .keyline/baseline.json
 *   keyline check --baseline          compare against it
 *
 * A finding is matched by a fingerprint of its rule, its file and the text of
 * its line (trimmed, whitespace collapsed), never its line number, so code
 * inserted above it doesn't make it new. A project-wide finding is matched on
 * its rule alone. Identical lines with the same finding
 * are counted: two today against one in the baseline is one new finding.
 *
 * .keyline/baseline.json:
 *
 *   {
 *     "version": 1,
 *     "tool": "keyline check",
 *     "created": ISO,
 *     "findings": [ { "fingerprint": "9f2c…", "rule", "severity", "file", "line", "message" } ]
 *   }
 *
 * Commit it. Re-save it when findings are fixed, so a fixed finding that comes
 * back counts as new.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

export const BASELINE_FILE = ".keyline/baseline.json";

/** The line's text, as it reads whatever its indentation and spacing. */
export function normalise(text) {
  return String(text ?? "").trim().replace(/\s+/g, " ");
}

/**
 * rule + file + the line's text. `lines` is the file's source split on "\n".
 * When the line can't be read (a file the run didn't open), the message stands
 * in for it, with its numbers removed so a count changing doesn't make it new.
 * A project-wide rule (`scope: "project"`: no reduced-motion branch anywhere,
 * no skip link) is one finding however it's pointed at, so it is the rule alone.
 */
export function fingerprint(finding, lines, { project = false } = {}) {
  const text = lines && finding.line ? lines[finding.line - 1] : undefined;
  const anchor = project
    ? "project"
    : text !== undefined && normalise(text)
      ? `${finding.file}\0line:${normalise(text)}`
      : `${finding.file}\0message:${normalise(String(finding.message ?? "").replace(/\d+(\.\d+)?/g, "#"))}`;
  return createHash("sha1").update(`${finding.rule}\0${anchor}`).digest("hex").slice(0, 16);
}

export function readBaseline(file) {
  if (!existsSync(file)) return null;
  const b = JSON.parse(readFileSync(file, "utf8"));
  if (b.version !== 1 || !Array.isArray(b.findings)) throw new Error(`${file} isn't a baseline this Keyline reads`);
  return b;
}

export function writeBaseline(file, findings) {
  const sorted = [...findings].sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.rule.localeCompare(b.rule));
  const baseline = {
    version: 1,
    tool: "keyline check",
    created: new Date().toISOString(),
    findings: sorted.map((f) => ({ fingerprint: f.fingerprint, rule: f.rule, severity: f.severity, file: f.file, line: f.line, message: f.message, ...(f.scope ? { scope: f.scope } : {}) })),
  };
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(baseline, null, 2) + "\n");
  return baseline;
}

/**
 * Split today's findings against a baseline. Each current finding gets
 * `change: "new" | "still"`; `fixed` holds the baseline's entries with no
 * match today. Only entries the run could have seen again count as fixed: in
 * a file it checked (`files`, relative paths) and a rule it ran (`rules`).
 */
export function compare(findings, baseline, { files = null, rules = null } = {}) {
  const left = new Map();
  for (const b of baseline.findings) {
    if (!left.has(b.fingerprint)) left.set(b.fingerprint, []);
    left.get(b.fingerprint).push(b);
  }
  const marked = findings.map((f) => {
    const pool = left.get(f.fingerprint);
    if (pool?.length) {
      pool.shift();
      return { ...f, change: "still" };
    }
    return { ...f, change: "new" };
  });
  const seen = files ? new Set(files) : null;
  const ran = (b) => !rules || rules.some((r) => r === b.rule || r === b.rule.split("/")[0]);
  const fixed = [...left.values()].flat().filter((b) => (!seen || seen.has(b.file) || b.scope === "project") && ran(b));
  fixed.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
  const count = (change) => marked.filter((f) => f.change === change).length;
  return { findings: marked, fixed, counts: { new: count("new"), still: count("still"), fixed: fixed.length } };
}
