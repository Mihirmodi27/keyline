import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { check } from "../plugins/keyline/skills/keyline/scripts/check.mjs";
import { RULES } from "../plugins/keyline/skills/keyline/scripts/check/rules.mjs";

const fixture = (name) => fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url));
const CLI = fileURLToPath(new URL("../bin/keyline.mjs", import.meta.url));
const ids = (r) => new Set(r.findings.map((f) => f.rule));

test("a sloppy project trips every rule that applies without a preset", () => {
  const r = check({ root: fixture("sloppy") });
  const found = ids(r);
  const presetOnly = new Set(["type/italic"]);
  for (const rule of RULES) {
    if (presetOnly.has(rule.id)) assert.ok(!found.has(rule.id), `${rule.id} needs a preset`);
    else assert.ok(found.has(rule.id), `expected ${rule.id}`);
  }
});

test("findings carry a file, a line, a law and a known severity", () => {
  for (const f of check({ root: fixture("sloppy") }).findings) {
    assert.ok(f.file && f.line > 0, `${f.rule} has a location`);
    assert.match(f.law, /\w/);
    assert.ok(["error", "warning", "info"].includes(f.severity));
  }
});

test("a project that keeps the laws has no findings", () => {
  assert.deepEqual(check({ root: fixture("clean") }).findings, []);
});

test("DESIGN.md decides the verdicts: preset, ladders, suppressions", () => {
  const r = check({ root: fixture("decided") });
  assert.equal(r.design.preset, "product");
  assert.deepEqual([...r.design.durations].sort(), [150, 200]);
  const by = (rule) => r.findings.filter((f) => f.rule === rule);

  assert.equal(by("type/italic").length, 1, "product has no italic");
  assert.equal(by("type/uppercase")[0].severity, "warning", "product sets labels in sentence case");
  assert.deepEqual(by("layout/z-index").map((f) => f.line), [6], "z-10 is on the ladder, z-30 isn't");
  assert.deepEqual(by("motion/duration-ladder").map((f) => f.line), [6], "250ms flagged; 400ms is suppressed");
});

test("regressions from the launch smoke test stay fixed", () => {
  const r = check({ root: fixture("regressions") });
  const at = (rule) => r.findings.filter((f) => f.rule === rule).map((f) => `${f.file}:${f.line}`);
  assert.deepEqual(at("layout/target-size"), ["src/styles.css:3"], "a dot inside a button isn't a target; a 16px button is");
  assert.deepEqual(at("type/zoom-disabled"), ["index.html:2"], "a viewport tag locks zoom; prose that names maximum-scale=1 doesn't");
  assert.deepEqual(at("motion/reduced-motion"), ["src/styles.css:6"], "zeroing every duration on * is a kill switch");
  const ladder = r.findings.filter((f) => f.rule === "motion/duration-ladder" && f.file === "DESIGN.md");
  assert.equal(ladder.length, 1, "one inversion, and the 900ms exemption isn't a rung");
  assert.match(ladder[0].message, /duration\.popover.*140ms.*duration\.state.*150ms/, "popover shorter than state is flagged");
});

test("an apostrophe in JSX text doesn't derail class extraction", () => {
  const r = check({ root: fixture("sloppy"), rules: ["color/raw-color"] });
  assert.ok(r.findings.some((f) => f.file === "src/App.tsx" && f.line === 7), "inline style after JSX text is still read");
});

test("--rule narrows to a rule or a domain", () => {
  const r = check({ root: fixture("sloppy"), rules: ["depth"] });
  assert.ok(r.findings.length > 0);
  assert.ok(r.findings.every((f) => f.domain === "depth"));
});

test("the CLI exits 1 on errors, 0 when clean, 2 on bad usage", () => {
  const run = (...args) => spawnSync(process.execPath, [CLI, "check", ...args], { encoding: "utf8" });
  assert.equal(run("--root", fixture("sloppy")).status, 1);
  assert.equal(run("--root", fixture("clean")).status, 0);
  assert.equal(run("--root", fixture("decided")).status, 0, "warnings alone pass");
  assert.equal(run("--root", fixture("decided"), "--strict").status, 1, "--strict fails on warnings");
  assert.equal(run("--rule", "nope").status, 2);
  assert.equal(run("--root", "/no/such/dir").status, 2);

  const json = JSON.parse(run("--root", fixture("sloppy"), "--json").stdout);
  assert.equal(json.findings.length, json.summary.error + json.summary.warning + json.summary.info);
});
