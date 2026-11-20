/**
 * Decisions Keyline remembers: findings a person has looked at and decided
 * are deliberate, so no check, guard, audit or polish raises them again.
 *
 *   npx trykeyline keep <finding> --reason "…"     record one (keep.mjs)
 *   npx trykeyline keep --list | --drop k3          read them, take one back
 *
 * .keyline/decisions.json, committed beside the baseline, so a teammate, CI
 * and any agent read the same record:
 *
 *   {
 *     "version": 1,
 *     "decisions": [
 *       { "id": "k1", "key": "source|9f2c…", "rule": "color/raw-color",
 *         "where": "src/cta.css:12", "text": "color: #e11d48;",
 *         "reason": "the brand red on the call to action, by design",
 *         "by": "Mihir Modi", "date": "2026-11-20" }
 *     ]
 *   }
 *
 * `key` is the finding's identity (matchKey in findings.mjs): for the
 * detector's findings the fingerprint (rule, file, the text of the line), so
 * a decision follows the line when code moves, and lapses when the line
 * itself changes; for a finding on a page, the rule, page, viewport, theme and
 * element. Each decision covers one finding: two identical lines need two.
 *
 * A rule judged across the whole project is matched in a baseline by its rule
 * alone. When its finding is about one line (a duration off the ladder), the
 * decision keys on that line's print (`lineprint`), so it keeps that use only
 * and lapses with it. When the finding is the project's (too many weights in
 * an area, too many durations), the decision is the project's too: `where`
 * says so, and it holds until the finding goes away.
 *
 * A decision is the user's, never the agent's own: an agent that dismissed
 * what it couldn't fix would raise its own score. Each one says who made it,
 * and every report lists them.
 *
 * How it relates to a `keyline-ignore <rule>: <reason>` comment: that one is
 * the same kind of decision written into the code, for a source line, and it
 * travels with the line. A recorded decision lives outside the code, so it
 * also covers what only a browser sees, and they're all in one list.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { matchKey } from "./findings.mjs";

export const DECISIONS_FILE = ".keyline/decisions.json";

/** Rules no decision may keep: text people can't read is never deliberate (colour law, and audit.md). */
export const NEVER_KEPT = new Set(["color/contrast"]);

/** A decisions file that can't be read, so a caller can say so instead of crashing. */
export class DecisionsError extends Error {
  constructor(message) {
    super(message);
    this.code = "EDECISIONS";
  }
}

/** The project's decisions; an empty list when there's no file. Throws DecisionsError when the file is broken. */
export function readDecisions(root) {
  const file = join(root, DECISIONS_FILE);
  if (!existsSync(file)) return { file, list: [] };
  let data;
  try {
    data = JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    throw new DecisionsError(`${DECISIONS_FILE} isn't valid JSON (${e.message}). Fix it, or restore it: git checkout -- ${DECISIONS_FILE}`);
  }
  if (data?.version !== 1 || !Array.isArray(data.decisions) || data.decisions.some((d) => typeof d?.key !== "string" || typeof d?.id !== "string")) {
    throw new DecisionsError(`${DECISIONS_FILE} isn't a decisions file this Keyline reads: it needs "version": 1 and a "decisions" list, each with an id and a key.`);
  }
  return { file, list: data.decisions };
}

export function writeDecisions(root, list) {
  const file = join(root, DECISIONS_FILE);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify({ version: 1, decisions: list }, null, 2) + "\n");
  return file;
}

/** Where a finding is, the way a person reads it: `src/a.css:12`, or `/pricing · phone · dark · .hero .eyebrow`. */
export function where(f) {
  if (projectWide(f)) return `the whole project${f.area ? ` (area ${f.area})` : ""}`;
  if (f.file && !f.page) return `${f.file}${f.line ? `:${f.line}` : ""}`;
  return [f.page ?? "the whole product", f.viewport, f.theme, f.selector].filter(Boolean).join(" · ");
}

/**
 * Split findings against the decisions. `open` are the findings no decision
 * keeps; `kept` are the rest, each with its `decision`; `unused` are the
 * decisions nothing matched in this run (stale, if the run saw everything).
 */
export function applyDecisions(findings, list) {
  const { pairs, unused } = matchDecisions(findings, list);
  const open = [];
  const kept = [];
  for (const [f, d] of pairs) {
    if (d) kept.push({ ...f, decision: d });
    else open.push(f);
  }
  return { open, kept, unused };
}

/**
 * Each finding with the decision that keeps it, or null; one decision per
 * finding, so two identical findings against one decision is one kept, one
 * open. `unused` are the decisions nothing matched.
 */
export function matchDecisions(findings, list) {
  const pool = new Map();
  for (const d of list) {
    if (!pool.has(d.key)) pool.set(d.key, []);
    pool.get(d.key).push(d);
  }
  const pairs = findings.map((f) => [f, pool.get(keyOf(f))?.shift() ?? null]);
  return { pairs, unused: [...pool.values()].flat() };
}

/** The key a decision stores for a finding, and matches it on. */
export const keyOf = (f) => (f.lineprint ? `source|${f.lineprint}` : matchKey(f));

/** Whether a finding is the whole project's, not one line's: a project rule's verdict with no line print. */
export const projectWide = (f) => f.scope === "project" && !f.lineprint && f.file && !f.page;

/** The next free id: k1, k2, … never reusing a dropped one's number while later ones exist. */
export function nextId(list) {
  const n = list.reduce((max, d) => Math.max(max, Number(String(d.id).replace(/^k/, "")) || 0), 0);
  return `k${n + 1}`;
}

/**
 * Record decisions for these findings. Returns the new entries; a finding a
 * decision already keeps is left alone. Throws DecisionsError for a rule that
 * can't be kept, or without a reason.
 */
export function decide(root, findings, { reason, by, date = new Date().toISOString().slice(0, 10), text = () => undefined } = {}) {
  if (!reason || !String(reason).trim()) throw new DecisionsError("a decision needs a reason: --reason \"why this is deliberate\"");
  const banned = findings.find((f) => NEVER_KEPT.has(f.rule));
  if (banned) throw new DecisionsError(`${banned.rule} can't be kept: text people read has to clear its contrast. Fix the colour, or, if the text is decoration nobody reads, hide it from assistive tech.`);
  const { list } = readDecisions(root);
  const already = new Set(list.map((d) => d.key));
  const added = [];
  for (const f of findings) {
    const key = keyOf(f);
    if (already.has(key)) continue;
    already.add(key);
    const entry = { id: nextId([...list, ...added]), key, rule: f.rule, where: where(f) };
    const line = projectWide(f) ? undefined : text(f);
    if (line) entry.text = line;
    Object.assign(entry, { reason: String(reason).trim(), by: by || "someone", date });
    added.push(entry);
  }
  if (added.length) writeDecisions(root, [...list, ...added]);
  return added;
}

/** Take decisions back by id. Returns the ones removed. */
export function drop(root, ids) {
  const { list } = readDecisions(root);
  const gone = list.filter((d) => ids.includes(d.id));
  if (gone.length) writeDecisions(root, list.filter((d) => !ids.includes(d.id)));
  return gone;
}

/* ── The human record in DESIGN.md ───────────────────────────────────────── */

const designFile = (root) => {
  const name = existsSync(root) ? readdirSync(root).find((f) => f.toLowerCase() === "design.md") : null;
  return name ? join(root, name) : null;
};

/** "at `src/a.css:12`", or "across the whole project" for a decision that isn't about one place. */
export const placed = (d, code = (s) => s) => (/^the whole project/.test(d.where) ? `across ${d.where}` : `at ${code(d.where)}`);

/** The line a decision adds under `## Decisions`, ending with its id so it can be found again. */
export const designLine = (d) => `- ${d.date} — Kept \`${d.rule}\` ${placed(d, (s) => `\`${s}\``)}: ${d.reason.replace(/\.$/, "")}. (${d.by}; ${d.id} in ${DECISIONS_FILE})`;

/**
 * Write each decision as one line under DESIGN.md's `## Decisions`, where the
 * agent reads every decision before it works. No DESIGN.md: nothing to do.
 */
export function noteInDesign(root, entries) {
  const file = designFile(root);
  if (!file || !entries.length) return null;
  const md = readFileSync(file, "utf8");
  const lines = entries.map(designLine).join("\n");
  const at = md.search(/^##\s+Decisions\b[^\n]*$/m);
  let out;
  if (at < 0) {
    out = `${md.replace(/\s*$/, "")}\n\n## Decisions\n\n${lines}\n`;
  } else {
    const after = md.slice(at).search(/\n(?=##\s)/);
    const end = after < 0 ? md.length : at + after;
    const head = md.slice(0, end).replace(/\s*$/, "");
    out = `${head}\n${lines}\n${after < 0 ? "" : "\n" + md.slice(end).replace(/^\s*/, "")}`;
  }
  writeFileSync(file, out);
  return file;
}

/** Remove the DESIGN.md lines of dropped decisions. */
export function unnoteInDesign(root, ids) {
  const file = designFile(root);
  if (!file || !ids.length) return null;
  const md = readFileSync(file, "utf8");
  const mark = new RegExp(`; (${ids.map((i) => i.replace(/[^\w]/g, "")).join("|")}) in ${DECISIONS_FILE.replace(/\./g, "\\.")}\\)\\s*$`);
  const out = md
    .split("\n")
    .filter((l) => !mark.test(l))
    .join("\n");
  if (out !== md) writeFileSync(file, out);
  return file;
}
