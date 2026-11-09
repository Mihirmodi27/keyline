import { strict as assert } from "node:assert";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { draftScores, scoreDomain, run } from "../plugins/keyline/skills/keyline/scripts/audit.mjs";
import { launch } from "../plugins/keyline/skills/keyline/scripts/browse/playwright.mjs";

test("draft scores fall with each rule broken, errors most", () => {
  const scores = draftScores([
    { rule: "color/contrast", severity: "error" },
    { rule: "color/contrast", severity: "error" },
    { rule: "type/many-sizes", severity: "warning" },
    { rule: "a11y/target-size", severity: "warning" },
    { rule: "slop/card-grid", severity: "info" },
    { rule: "a11y/name", severity: "error", status: "dismissed" },
  ]);
  assert.equal(scores.color, 2); // one error rule, seen twice: 4 − 1.5 − 0.1
  assert.equal(scores.type, 3);
  assert.equal(scores.layout, 3);
  assert.equal(scores.depth, 4); // a note barely moves it
  assert.equal(scores.patterns, 4); // the dismissed error doesn't count
  assert.equal(scores.motion, 4);
});

test("audit rules fall into the six scored domains", () => {
  assert.equal(scoreDomain({ rule: "a11y/target-size" }), "layout");
  assert.equal(scoreDomain({ rule: "slop/gradient-text" }), "color");
  assert.equal(scoreDomain({ rule: "copy/vague-label" }), "patterns");
  assert.equal(scoreDomain({ rule: "type/tiny-text" }), "type");
});

const SLOPPY = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Fixture</title>
<style>
  body { margin: 0; font-family: sans-serif; background: #fff; color: #111; }
  .hero { height: 420px; background: linear-gradient(135deg, rgb(124, 58, 237), rgb(79, 70, 229)); }
  .grad { background: linear-gradient(90deg, #f0f, #0ff); -webkit-background-clip: text; background-clip: text; color: transparent; font-size: 48px; }
  .faint { color: #c8c8c8; font-size: 14px; }
  .tiny { font-size: 10px; }
  .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .card { border: 1px solid #ddd; border-radius: 12px; padding: 16px; }
  .wide { width: 900px; }
  .icon-btn { width: 30px; height: 30px; }
</style></head><body>
<div class="hero"><h1 class="grad">Unlock the power of seamless work</h1></div>
<p class="faint">Updated two minutes ago by the system.</p>
<p class="tiny">Small print nobody can read.</p>
<button class="icon-btn"></button>
<a href="/x">Click here</a>
<img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=">
<p>Oops! We couldn't save your changes.</p>
<div class="cards">${'<div class="card">Feature</div>'.repeat(6)}</div>
<div class="wide">A block wider than a phone.</div>
<div role="img" aria-label="A sample screen"><p class="faint">Faint text inside a picture</p></div>
</body></html>`;

test("the audit finds the problems planted in a page", { timeout: 120000 }, async (t) => {
  try {
    const b = await launch({ log: () => {} });
    await b.close();
  } catch {
    t.skip("no browser could launch here");
    return;
  }
  const site = mkdtempSync(join(tmpdir(), "keyline-audit-site-"));
  mkdirSync(join(site, "x"));
  writeFileSync(join(site, "index.html"), SLOPPY);
  writeFileSync(join(site, "x", "index.html"), "<!doctype html><html lang=en><title>x</title><main><h1>X</h1></main></html>");
  const out = mkdtempSync(join(tmpdir(), "keyline-audit-out-"));
  const code = await run(["--serve", site, "--routes", "/,/x", "--no-check", "--out", out]);
  assert.equal(code, 1, "errors were found, so the run fails");
  const report = JSON.parse(readFileSync(join(out, "findings.json"), "utf8"));
  const rules = new Set(report.findings.map((f) => f.rule));
  for (const rule of [
    "color/contrast",
    "a11y/name",
    "a11y/img-alt",
    "a11y/lang",
    "a11y/landmarks",
    "type/tiny-text",
    "copy/vague-label",
    "copy/interjection",
    "copy/we",
    "slop/generic-copy",
    "slop/gradient-text",
    "slop/purple-gradient",
    "slop/card-grid",
    "layout/horizontal-overflow",
    "layout/viewport-meta",
  ]) {
    assert.ok(rules.has(rule), `expected ${rule}; got ${[...rules].join(", ")}`);
  }
  assert.ok(report.findings.some((f) => f.rule === "layout/viewport-meta" && f.page === "/x"), "the page with no viewport tag is the one flagged");
  assert.ok(!report.findings.some((f) => f.rule === "layout/viewport-meta" && f.page === "/"));
  // Text inside role="img" is an illustration: not measured.
  assert.ok(!report.findings.some((f) => f.rule === "color/contrast" && /inside a picture/.test(f.detail)));
  // A page without a dark theme isn't reported twice.
  assert.ok(!report.findings.some((f) => f.rule === "color/contrast" && f.theme === "dark"));
  assert.equal(report.scoresDraft, true);
  assert.match(readFileSync(join(out, "index.html"), "utf8"), /drafted from the measurements/);
});
