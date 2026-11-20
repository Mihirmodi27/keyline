import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { check } from "../plugins/keyline/skills/keyline/scripts/check.mjs";
import { guardFile } from "../plugins/keyline/skills/keyline/scripts/guard.mjs";
import { DECISIONS_FILE, applyDecisions, decide, readDecisions } from "../plugins/keyline/skills/keyline/scripts/check/decisions.mjs";

const CLI = fileURLToPath(new URL("../bin/keyline.mjs", import.meta.url));
const DECIDED = fileURLToPath(new URL("./fixtures/decided", import.meta.url));

function project() {
  const dir = mkdtempSync(join(tmpdir(), "keyline-decisions-"));
  cpSync(DECIDED, dir, { recursive: true });
  spawnSync("git", ["init", "-q"], { cwd: dir });
  spawnSync("git", ["config", "user.name", "Ada Lovelace"], { cwd: dir });
  return dir;
}
const cli = (root, ...args) => spawnSync(process.execPath, [CLI, ...args, "--root", root], { encoding: "utf8", env: { ...process.env, NO_COLOR: "1" } });
const rules = (r) => r.findings.map((f) => `${f.line} ${f.rule}`);

/* ── Recording a decision ────────────────────────────────────────────────── */

test("keep records a source finding, and check stops raising it but still counts it", () => {
  const root = project();
  assert.ok(rules(check({ root })).includes("5 type/uppercase"));

  const r = cli(root, "keep", "src/App.tsx:5", "--reason", "The hero eyebrow is in capitals by brand guideline");
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /Kept k1: type\/uppercase at src\/App.tsx:5/);

  const { list } = readDecisions(root);
  assert.equal(list.length, 1);
  assert.deepEqual({ ...list[0], key: undefined, date: undefined }, {
    id: "k1",
    key: undefined,
    rule: "type/uppercase",
    where: "src/App.tsx:5",
    text: '<h2 className="uppercase">Group</h2>',
    reason: "The hero eyebrow is in capitals by brand guideline",
    by: "Ada Lovelace",
    date: undefined,
  });
  assert.match(readFileSync(join(root, "DESIGN.md"), "utf8"), /## Decisions\n\n- \d{4}-\d\d-\d\d — Kept `type\/uppercase` at `src\/App.tsx:5`: The hero eyebrow.*\(Ada Lovelace; k1 in \.keyline\/decisions\.json\)/);

  const after = check({ root });
  assert.ok(!rules(after).includes("5 type/uppercase"));
  assert.deepEqual(after.kept.map((f) => [f.rule, f.decision.id]), [["type/uppercase", "k1"]]);

  const human = cli(root, "check");
  assert.match(human.stdout, /1 finding kept by a decision in \.keyline\/decisions\.json/);
  const json = JSON.parse(cli(root, "check", "--json").stdout);
  assert.equal(json.summary.kept, 1);
  assert.equal(json.kept[0].decision, "k1");
  assert.equal(json.kept[0].reason, "The hero eyebrow is in capitals by brand guideline");
});

test("a decision follows its line when code moves, and goes stale when the line itself changes", () => {
  const root = project();
  cli(root, "keep", "src/App.tsx:5", "--reason", "deliberate");
  const app = join(root, "src/App.tsx");
  writeFileSync(app, "// a new first line\n" + readFileSync(app, "utf8"));
  const moved = check({ root });
  assert.deepEqual(moved.kept.map((f) => f.line), [6]);
  assert.deepEqual(moved.stale, []);

  writeFileSync(app, readFileSync(app, "utf8").replace(">Group<", ">Groups<"));
  const changed = check({ root });
  assert.ok(rules(changed).includes("6 type/uppercase"), "the changed line is raised again");
  assert.deepEqual(changed.stale.map((d) => d.id), ["k1"]);
  assert.match(cli(root, "check").stdout, /1 decision in \.keyline\/decisions\.json matches nothing now \(k1\)/);
  // A run over part of the project can't tell, so it says nothing.
  assert.deepEqual(check({ root, only: ["src/App.tsx"] }).stale, []);
});

test("keep refuses without a reason, on a line with several findings and no --rule, and on text contrast", () => {
  const root = project();
  assert.equal(cli(root, "keep", "src/App.tsx:5").status, 2);
  const several = cli(root, "keep", "src/App.tsx:6", "--reason", "x");
  assert.equal(several.status, 2);
  assert.match(several.stderr, /2 findings: layout\/z-index, motion\/duration-ladder\. Name one with --rule/);
  assert.equal(cli(root, "keep", "src/App.tsx:6", "--rule", "layout/z-index", "--reason", "the toast sits above the sheet").status, 0);
  assert.throws(() => decide(root, [{ rule: "color/contrast", page: "/", selector: ".x", title: "Faint" }], { reason: "we like it" }), /can't be kept/);
  assert.equal(readDecisions(root).list.length, 1);
});

test("keeping twice is a no-op, and --drop raises the finding again and takes its line out of DESIGN.md", () => {
  const root = project();
  cli(root, "keep", "src/App.tsx:5", "--reason", "deliberate");
  const again = cli(root, "keep", "src/App.tsx:5", "--reason", "again");
  assert.equal(again.status, 0);
  assert.match(again.stdout, /Already kept/);
  assert.equal(readDecisions(root).list.length, 1);

  assert.match(cli(root, "keep", "--list").stdout, /k1 {4}type\/uppercase {2}src\/App\.tsx:5\n {6}deliberate \(Ada Lovelace/);
  const dropped = cli(root, "keep", "--drop", "k1");
  assert.equal(dropped.status, 0);
  assert.equal(readDecisions(root).list.length, 0);
  assert.doesNotMatch(readFileSync(join(root, "DESIGN.md"), "utf8"), /k1 in/);
  assert.ok(rules(check({ root })).includes("5 type/uppercase"));
  assert.equal(cli(root, "keep", "--drop", "k9").status, 2);
});

test("the guard leaves kept findings out, and stays silent on a broken decisions file", () => {
  const root = project();
  const before = guardFile("src/App.tsx", { base: root, env: {} });
  assert.ok(before.findings.some((f) => f.rule === "type/uppercase"));
  cli(root, "keep", "src/App.tsx:5", "--reason", "deliberate");
  const after = guardFile("src/App.tsx", { base: root, env: {} });
  assert.ok(!after.findings.some((f) => f.rule === "type/uppercase"));

  writeFileSync(join(root, DECISIONS_FILE), "{ not json");
  assert.equal(guardFile("src/App.tsx", { base: root, env: {} }), null);
  const r = cli(root, "check");
  assert.equal(r.status, 2);
  assert.match(r.stderr, /isn't valid JSON/);
});

test("one decision keeps one finding: two identical lines need two", () => {
  const list = [{ id: "k1", key: "source|aa" }];
  const f = { rule: "color/raw-color", file: "a.css", line: 1, fingerprint: "aa" };
  const { open, kept, unused } = applyDecisions([f, { ...f, line: 2 }], list);
  assert.equal(kept.length, 1);
  assert.equal(open.length, 1);
  assert.deepEqual(unused, []);
});

test("a baseline saved with decisions holds only what's still open", () => {
  const root = project();
  cli(root, "keep", "src/App.tsx:5", "--reason", "deliberate");
  assert.equal(cli(root, "check", "--baseline", "save").status, 0);
  const saved = JSON.parse(readFileSync(join(root, ".keyline/baseline.json"), "utf8"));
  assert.ok(!saved.findings.some((f) => f.rule === "type/uppercase"));
  // Dropping the decision makes the finding new against that baseline.
  cli(root, "keep", "--drop", "k1");
  const r = JSON.parse(cli(root, "check", "--baseline", "--json").stdout);
  assert.ok(r.findings.some((f) => f.rule === "type/uppercase" && f.change === "new"));
});

test("a decisions file in a project with no DESIGN.md still works", () => {
  const root = mkdtempSync(join(tmpdir(), "keyline-decisions-bare-"));
  mkdirSync(join(root, "src"));
  writeFileSync(join(root, "src/a.css"), ".a { transition: all 200ms; }\n");
  const r = cli(root, "keep", "src/a.css:1", "--rule", "motion/transition-all", "--reason", "a prototype");
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /Commit it\./);
  assert.ok(!existsSync(join(root, "DESIGN.md")));
  assert.ok(!check({ root }).findings.some((f) => f.rule === "motion/transition-all"));
});
