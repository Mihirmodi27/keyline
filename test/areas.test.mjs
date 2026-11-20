import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { check } from "../plugins/keyline/skills/keyline/scripts/check.mjs";
import { guardFile, format } from "../plugins/keyline/skills/keyline/scripts/guard.mjs";
import { parseAreas, readDesign } from "../plugins/keyline/skills/keyline/scripts/check/design.mjs";
import { fingerprint } from "../plugins/keyline/skills/keyline/scripts/check/baseline.mjs";

function mixed({ areas = "`app/(marketing)/** → expressive` · `app/blog/** → editorial`" } = {}) {
  const root = mkdtempSync(join(tmpdir(), "keyline-areas-"));
  writeFileSync(join(root, "DESIGN.md"), `# Design system\n\n## Profile\n\n| | |\n|---|---|\n| Preset | \`product\` |\n| Areas | ${areas} |\n`);
  const put = (rel, css) => {
    mkdirSync(join(root, rel, ".."), { recursive: true });
    writeFileSync(join(root, rel), css);
  };
  put("app/(marketing)/page.css", ".a{font-weight:400}.b{font-weight:500}.c{font-weight:600}.d{font-weight:700}\n.e{font-style:italic}\n");
  put("app/blog/post.css", ".a{font-weight:400}.b{font-weight:500}.c{font-weight:600}\n.q{font-style:italic}\n");
  put("app/dashboard/page.css", ".a{font-weight:400}.b{font-weight:500}\n.e{font-style:italic}\n");
  return root;
}
const seen = (r, rule) => r.findings.filter((f) => f.rule === rule).map((f) => f.file);

test("parseAreas reads pattern → preset pairs in the forms people write them, and not the template's example", () => {
  const pairs = (c) => parseAreas(c).map((a) => `${a.pattern}=${a.preset}`);
  assert.deepEqual(pairs("`app/(marketing)/** → expressive` · `app/blog/** → editorial`"), ["app/(marketing)/**=expressive", "app/blog/**=editorial"]);
  assert.deepEqual(pairs("app/docs -> editorial; /pricing/** => expressive"), ["app/docs=editorial", "/pricing/**=expressive"]);
  assert.deepEqual(pairs("src/marketing → Expressive<br>src/docs → editorial"), ["src/marketing=expressive", "src/docs=editorial"]);
  assert.deepEqual(pairs("Routes or directories on a different preset, e.g. `app/(marketing)/** → expressive`"), []);
  assert.deepEqual(pairs("none"), []);
});

test("a file takes its area's preset, the most specific area winning; a bare folder and folder/** cover the folder", () => {
  const root = mixed({ areas: "`app/(marketing)/** → expressive` · `app/(marketing)/docs → editorial` · `/pricing/** → glass`" });
  const d = readDesign(root);
  assert.equal(d.presetFor("app/(marketing)/page.tsx"), "expressive");
  assert.equal(d.presetFor("app/(marketing)/docs/page.tsx"), "editorial");
  assert.equal(d.presetFor("app/(marketing)/docsx/page.tsx"), "expressive");
  assert.equal(d.presetFor("app/dashboard/page.tsx"), "product");
  // Route areas place pages, not source files.
  assert.equal(d.presetFor("pricing/page.tsx"), "product");
  assert.equal(d.presetForPage("/pricing"), "glass");
  assert.equal(d.presetForPage("/pricing/team"), "glass");
  assert.equal(d.presetForPage("/about", "app/(marketing)/about/page.tsx"), "expressive");
  assert.equal(d.presetForPage("/about"), "product");
});

test("italics are judged by each file's area: flagged in the product app, allowed in the editorial and expressive areas", () => {
  const r = check({ root: mixed() });
  assert.deepEqual(seen(r, "type/italic"), ["app/dashboard/page.css"]);
});

test("font weights are counted per area, each against its own preset", () => {
  const r = check({ root: mixed() });
  const weights = r.findings.filter((f) => f.rule === "type/weights");
  assert.deepEqual(weights.map((f) => [f.area, f.message.match(/the (\w+) preset allows (\w+)/).slice(1)]), [
    ["app/(marketing)/**", ["expressive", "3"]],
    ["app/blog/**", ["editorial", "2"]],
  ]);
  assert.match(weights[0].message, /^In app\/\(marketing\)\/\*\*: 4 font weights/);
  // One finding per area, each its own identity.
  assert.notEqual(weights[0].fingerprint, weights[1].fingerprint);
});

test("outside every area nothing changes: the same preset, the same fingerprints a baseline already holds", () => {
  const f = { rule: "type/weights", file: "a.css", line: 1 };
  assert.equal(fingerprint(f, [], { project: true }), fingerprint({ ...f, file: "b.css" }, [], { project: true }));
  assert.notEqual(fingerprint(f, [], { project: true }), fingerprint({ ...f, area: "app/blog/**" }, [], { project: true }));
  const flat = mixed({ areas: "none" });
  assert.deepEqual(seen(check({ root: flat }), "type/italic").sort(), ["app/(marketing)/page.css", "app/blog/post.css", "app/dashboard/page.css"]);
});

test("a run over one file (the guard, --changed) keeps that file's area finding, and says which area judged it", () => {
  const root = mixed();
  const one = check({ root, only: ["app/blog/post.css"] });
  assert.deepEqual(one.findings.map((f) => [f.rule, f.area]), [["type/weights", "app/blog/**"]]);
  const g = guardFile("app/blog/post.css", { base: root, env: {} });
  assert.match(format(g), /\(area app\/blog\/\*\*, preset editorial, from DESIGN\.md\)/);
  assert.equal(guardFile("app/dashboard/page.css", { base: root, env: {} }).findings[0].rule, "type/italic");
});
