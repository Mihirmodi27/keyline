#!/usr/bin/env node
/**
 * Record that a finding is deliberate, so no check, guard, audit or polish
 * raises it again. The record is .keyline/decisions.json (check/decisions.mjs)
 * plus one line under DESIGN.md's ## Decisions; commit both.
 *
 *   node keep.mjs src/cta.css:12 --reason "the brand red on the call to action"
 *   node keep.mjs f12 --reason "…"          a finding in keyline-report/findings.json
 *   node keep.mjs --list
 *   node keep.mjs --drop k3
 *
 * A decision is the user's: an agent runs this only when the user has said
 * the finding is deliberate, in their words, and passes those words as the
 * reason.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { check } from "./check.mjs";
import { DECISIONS_FILE, decide, drop, keyOf, noteInDesign, readDecisions, unnoteInDesign } from "./check/decisions.mjs";

const USAGE = `keyline keep — record that a finding is deliberate, so Keyline stops raising it.

  npx trykeyline keep <finding> --reason "<why>"
  npx trykeyline keep --list
  npx trykeyline keep --drop <id[,id…]>

<finding> is either
  file:line           a detector finding on that line (add --rule <id> when the line has several)
  f12                 a finding in a report's findings.json (keyline-report, or --report <dir>).
                      One seen on a page is kept at every width and theme it was seen in.

Options:
  --reason, -m <why>  required: why it's deliberate, in the words of whoever decided
  --rule <id>         which finding on the line
  --report <dir>      the report the id comes from (default keyline-report, then smoke-report)
  --by <name>         who decided (default: git's user.name)
  --root <dir>        the project (default .)
  --list              every decision recorded, and who made it
  --drop <id>         take a decision back: the finding is raised again

Decisions go in ${DECISIONS_FILE} and DESIGN.md's ## Decisions. Commit both.
A contrast failure on text can't be kept.`;

function parse(argv) {
  const o = { root: ".", what: null, reason: null, rule: null, report: null, by: null, list: false, drop: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const value = () => (a.includes("=") ? a.slice(a.indexOf("=") + 1) : argv[++i]);
    if (a === "--reason" || a === "-m" || a.startsWith("--reason=")) o.reason = value();
    else if (a === "--rule" || a.startsWith("--rule=")) o.rule = value();
    else if (a === "--report" || a.startsWith("--report=")) o.report = value();
    else if (a === "--by" || a.startsWith("--by=")) o.by = value();
    else if (a === "--root" || a.startsWith("--root=")) o.root = value();
    else if (a === "--list") o.list = true;
    else if (a === "--drop" || a.startsWith("--drop=")) o.drop = String(value() ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    else if (a === "-h" || a === "--help") o.help = true;
    else if (a.startsWith("-")) return { error: `unknown option ${a} (try --help)` };
    else if (!o.what) o.what = a;
    else return { error: `one finding at a time: ${o.what}, then ${a}` };
  }
  return o;
}

const whoAmI = (root) => {
  const r = spawnSync("git", ["config", "user.name"], { cwd: root, encoding: "utf8" });
  return (r.status === 0 && r.stdout.trim()) || process.env.USER || process.env.USERNAME || "someone";
};

/** The detector's findings on one source line. */
function onLine(root, file, line, rule) {
  const abs = isAbsolute(file) ? file : resolve(root, file);
  const rel = relative(root, abs).split(sep).join("/");
  if (rel.startsWith("..") || !existsSync(abs)) throw new Error(`no such file in the project: ${file}`);
  const result = check({ root, only: [rel] });
  const at = (list) => list.filter((f) => f.file === rel && f.line === line && (!rule || f.rule === rule));
  const open = at(result.findings);
  if (open.length) return { rel, open, lines: readFileSync(abs, "utf8").split("\n") };
  const kept = at(result.kept);
  if (kept.length) return { rel, open: [], kept };
  throw new Error(`the detector finds nothing${rule ? ` called ${rule}` : ""} on ${rel}:${line}${rule ? "" : ". Run keyline check on the file to see what it finds, and where"}`);
}

/** A report's findings.json, and where it is. */
function report(root, dirArg) {
  const dirs = dirArg ? [resolve(root, dirArg)] : ["keyline-report", "smoke-report"].map((d) => resolve(root, d));
  for (const dir of dirs) {
    const file = join(dir, "findings.json");
    if (existsSync(file)) return { dir, file, run: JSON.parse(readFileSync(file, "utf8")) };
  }
  throw new Error(`no findings.json in ${dirArg ?? "keyline-report or smoke-report"}: give the report with --report <dir>, or keep a source line as file:line`);
}

export function run(argv) {
  const o = parse(argv);
  if (o.error) {
    console.error(`keyline keep: ${o.error}`);
    return 2;
  }
  if (o.help || (!o.what && !o.list && !o.drop)) {
    console.log(USAGE);
    return o.help ? 0 : 2;
  }
  const root = resolve(o.root);
  try {
    if (o.list) {
      const { list } = readDecisions(root);
      if (!list.length) console.log(`No decisions recorded in ${DECISIONS_FILE}.`);
      for (const d of list) console.log(`${d.id.padEnd(5)} ${d.rule}  ${d.where}\n      ${d.reason} (${d.by}, ${d.date})`);
      return 0;
    }

    if (o.drop) {
      const gone = drop(root, o.drop);
      const missing = o.drop.filter((id) => !gone.some((d) => d.id === id));
      if (gone.length) unnoteInDesign(root, gone.map((d) => d.id));
      for (const d of gone) console.log(`Dropped ${d.id}: ${d.rule} at ${d.where} will be raised again.`);
      if (missing.length) console.error(`keyline keep: no decision called ${missing.join(", ")} (see --list)`);
      return missing.length ? 2 : 0;
    }

    const by = o.by || whoAmI(root);
    let targets;
    let text = () => undefined;
    let fromReport = null;
    const source = o.what.match(/^(.+):(\d+)$/);
    if (/^f\d+$/.test(o.what)) {
      fromReport = report(root, o.report);
      const f = fromReport.run.findings.find((x) => x.id === o.what);
      if (!f) throw new Error(`no finding ${o.what} in ${relative(root, fromReport.file) || fromReport.file}`);
      // One element on one page: kept wherever the run saw it, at every width and theme.
      targets = f.page ? fromReport.run.findings.filter((x) => x.rule === f.rule && x.page === f.page && (x.selector ?? x.title) === (f.selector ?? f.title)) : [f];
    } else if (source) {
      const { rel, open, lines, kept } = onLine(root, source[1], Number(source[2]), o.rule);
      if (kept) {
        for (const f of kept) console.log(`Already kept: ${f.rule} at ${rel}:${f.line} by ${f.decision.id}. Reason: ${f.decision.reason} (${f.decision.by}).`);
        return 0;
      }
      if (open.length > 1) throw new Error(`${rel}:${source[2]} has ${open.length} findings: ${[...new Set(open.map((f) => f.rule))].join(", ")}. Name one with --rule`);
      targets = open;
      text = (f) => lines[f.line - 1]?.trim() || undefined;
    } else {
      throw new Error(`not a finding: ${o.what}. Give file:line, or a report id like f12`);
    }

    const added = decide(root, targets, { reason: o.reason, by, text });
    if (!added.length) {
      console.log("Already kept: a decision covers it.");
      return 0;
    }
    const design = noteInDesign(root, added);

    if (fromReport) {
      // The report says so too, at once; the next render keeps it in step with the record.
      const byKey = new Map(added.map((d) => [d.key, d]));
      for (const f of fromReport.run.findings) {
        const d = byKey.get(keyOf(f));
        if (d) Object.assign(f, { status: "dismissed", decided: d.id, reason: d.reason, by: d.by });
      }
      writeFileSync(fromReport.file, JSON.stringify(fromReport.run, null, 2) + "\n");
    }

    for (const d of added) console.log(`Kept ${d.id}: ${d.rule} at ${d.where}. Reason: ${d.reason} (${d.by}).`);
    console.log(`Recorded in ${DECISIONS_FILE}${design ? " and under DESIGN.md's ## Decisions" : ""}. Commit ${design ? "both" : "it"}.`);
    if (fromReport) console.log(`Redraw the report: npx trykeyline report ${relative(root, fromReport.dir) || "."}`);
    return 0;
  } catch (err) {
    console.error(`keyline keep: ${err.message}`);
    return 2;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = run(process.argv.slice(2));
}
