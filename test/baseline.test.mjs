import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { check } from "../plugins/keyline/skills/keyline/scripts/check.mjs";
import { compare, fingerprint, normalise } from "../plugins/keyline/skills/keyline/scripts/check/baseline.mjs";

const CLI = fileURLToPath(new URL("../bin/keyline.mjs", import.meta.url));
const SLOPPY = fileURLToPath(new URL("./fixtures/sloppy", import.meta.url));
const cli = (...args) => spawnSync(process.execPath, [CLI, ...args], { encoding: "utf8", env: { ...process.env, NO_COLOR: "1" } });

function copyOf(fixture) {
  const dir = mkdtempSync(join(tmpdir(), "keyline-baseline-"));
  cpSync(fixture, dir, { recursive: true });
  return dir;
}

const prepend = (file, text) => writeFileSync(file, text + readFileSync(file, "utf8"));

/* ── The detector's baseline ─────────────────────────────────────────────── */

test("fingerprints ignore line numbers and spacing, not the rule, file or text", () => {
  const f = { rule: "layout/z-index", file: "a.css", line: 3 };
  const lines = ["", "", ".modal { z-index: 9999; }"];
  const shifted = ["/* new */", "", "", "", "  .modal  {  z-index: 9999; }"];
  assert.equal(fingerprint(f, lines), fingerprint({ ...f, line: 5 }, shifted));
  assert.notEqual(fingerprint(f, lines), fingerprint({ ...f, rule: "color/raw-color" }, lines));
  assert.notEqual(fingerprint(f, lines), fingerprint({ ...f, file: "b.css" }, lines));
  assert.notEqual(fingerprint(f, lines), fingerprint(f, ["", "", ".modal { z-index: 999; }"]));
  assert.equal(normalise("  a \t b  "), "a b");
});

test("every finding survives lines inserted above it", () => {
  const root = copyOf(SLOPPY);
  const before = check({ root }).findings;
  for (const file of ["src/styles.css", "src/App.tsx", "index.html"]) {
    prepend(join(root, file), file.endsWith(".css") ? "/* one */\n/* two */\n\n" : file.endsWith(".html") ? "<!-- one -->\n" : "// one\n// two\n\n");
  }
  const after = check({ root }).findings;
  assert.ok(after.some((f, i) => f.line !== before[i]?.line), "the lines did move");
  const split = compare(after, { findings: before });
  assert.deepEqual(split.counts, { new: 0, still: before.length, fixed: 0 });
});

test("new, fixed and still: and two identical lines count as two", () => {
  const baseline = {
    findings: [
      { fingerprint: "a", rule: "layout/z-index", file: "x.css", line: 1 },
      { fingerprint: "b", rule: "color/raw-color", file: "x.css", line: 2 },
      { fingerprint: "c", rule: "color/raw-color", file: "y.css", line: 9 },
    ],
  };
  const now = [
    { fingerprint: "a", rule: "layout/z-index", file: "x.css", line: 4 },
    { fingerprint: "a", rule: "layout/z-index", file: "x.css", line: 5 },
    { fingerprint: "d", rule: "motion/transition-all", file: "x.css", line: 6 },
  ];
  const split = compare(now, baseline, { files: ["x.css"] });
  assert.deepEqual(split.findings.map((f) => f.change), ["still", "new", "new"]);
  assert.deepEqual(split.fixed.map((f) => f.fingerprint), ["b"], "y.css wasn't checked, so c isn't fixed");
  assert.equal(compare(now, baseline, { files: ["x.css"], rules: ["layout"] }).fixed.length, 0, "a rule that didn't run fixes nothing");

  // A project-wide finding points at some file, but belongs to the whole project.
  const project = { findings: [{ fingerprint: "p", rule: "layout/skip-link", file: "index.html", line: 1, scope: "project" }] };
  assert.equal(compare([], project, { files: ["x.css"] }).fixed.length, 1, "gone from a whole-project run: fixed");
  assert.equal(compare([], project, { files: ["x.css"], partial: true }).fixed.length, 0, "a narrower run can't tell");
});

test("checking one folder against the baseline doesn't fix project-wide findings", () => {
  const root = copyOf(SLOPPY);
  assert.equal(cli("check", "--root", root, "--baseline", "save").status, 0);
  const out = JSON.parse(cli("check", "src", "--root", root, "--baseline", "--json").stdout);
  assert.ok(!out.fixed.some((f) => f.scope === "project"), JSON.stringify(out.fixed.map((f) => f.rule)));
});

test("--baseline save, then --baseline: fails only on new errors, and says what's new and fixed", () => {
  const root = copyOf(SLOPPY);
  assert.equal(cli("check", "--root", root).status, 1, "the sloppy fixture has errors");
  const saved = cli("check", "--root", root, "--baseline", "save");
  assert.equal(saved.status, 0);
  assert.match(saved.stdout, /Saved \d+ findings/);
  assert.ok(existsSync(join(root, ".keyline/baseline.json")));

  assert.equal(cli("check", "--root", root, "--baseline").status, 0, "nothing new");
  prepend(join(root, "src/styles.css"), "/* moved */\n\n");
  assert.equal(cli("check", "--root", root, "--baseline").status, 0, "moved isn't new");

  // Fix one error, add a new warning: still passes. Then add a new error: fails.
  const html = join(root, "index.html");
  writeFileSync(html, readFileSync(html, "utf8").replace(/,?\s*(maximum-scale=1|user-scalable=no)/g, ""));
  writeFileSync(join(root, "src/styles.css"), readFileSync(join(root, "src/styles.css"), "utf8") + "\n.added { z-index: 5000; }\n");
  const warned = cli("check", "--root", root, "--baseline");
  assert.equal(warned.status, 0, "a new warning passes");
  assert.match(warned.stdout, /New since the baseline[\s\S]*layout\/z-index/);
  assert.match(warned.stdout, /Fixed since the baseline[\s\S]*type\/zoom-disabled/);
  assert.equal(cli("check", "--root", root, "--baseline", "--strict").status, 1, "but not with --strict");

  writeFileSync(join(root, "src/styles.css"), readFileSync(join(root, "src/styles.css"), "utf8") + ".gone:focus { outline: none; }\n");
  const json = cli("check", "--root", root, "--baseline", "--json");
  assert.equal(json.status, 1, "a new error fails");
  const out = JSON.parse(json.stdout);
  assert.ok(out.summary.new.error >= 1);
  assert.equal(out.baseline.new, out.findings.filter((f) => f.change === "new").length);
  assert.equal(out.baseline.fixed, out.fixed.length);
  assert.ok(out.fixed.some((f) => f.rule === "type/zoom-disabled"));
  assert.ok(out.findings.every((f) => f.fingerprint && ["new", "still"].includes(f.change)));
});

test("--baseline with no baseline is a usage error, and --baseline-file reads another", () => {
  const root = copyOf(SLOPPY);
  assert.equal(cli("check", "--root", root, "--baseline").status, 2);
  assert.equal(cli("check", "--root", root, "--baseline", "save", "--baseline-file", "ci/keyline.json").status, 0);
  assert.ok(existsSync(join(root, "ci/keyline.json")));
  assert.equal(cli("check", "--root", root, "--baseline-file", "ci/keyline.json").status, 0);
});
