import { strict as assert } from "node:assert";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { carryHistory, draftScore, draftScores, scoreCaps, scoreDomain, run } from "../audit.mjs";
import { render } from "../browse/report.mjs";
import { launch } from "../browse/playwright.mjs";

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

const all = (n) => ({ type: n, color: n, layout: n, depth: n, motion: n, patterns: n });

test("the score out of 10 maps all 3s to the ship bar and all 4s to 10", () => {
  assert.equal(draftScore(all(4), []), 10);
  assert.equal(draftScore(all(3), []), 8);
  assert.equal(draftScore({ ...all(4), motion: 3 }, []), 9.5); // 2 + 2 × 23/6, to the half point
  assert.equal(draftScore(null, []), null);
});

test("the score out of 10 is held under caps the evidence sets", () => {
  // One open error holds a near-perfect product at 6.
  assert.equal(draftScore(all(4), [{ rule: "color/contrast", severity: "error" }]), 6);
  // A fixed or dismissed error doesn't.
  assert.equal(draftScore(all(4), [{ rule: "color/contrast", severity: "error", status: "fixed" }]), 10);
  // An open warning holds it at 7; a note doesn't.
  assert.equal(draftScore(all(3), [{ rule: "copy/vague-label", severity: "warning" }]), 7);
  assert.equal(draftScore(all(3), [{ rule: "copy/vague-label", severity: "info" }]), 8);
  // A domain at 2 holds it at 7; at 1, at 5.
  assert.equal(draftScore({ ...all(4), layout: 2 }, []), 7);
  assert.equal(draftScore({ ...all(4), layout: 1 }, []), 5);
  const caps = scoreCaps({ ...all(3), color: 2 }, [{ rule: "a11y/name", severity: "error" }]);
  assert.deepEqual(caps.map((c) => c.max), [6, 7]);
  assert.match(caps[1].why, /colour/);
});

test("history carries over only for a run over the same pages", () => {
  const dir = mkdtempSync(join(tmpdir(), "keyline-history-"));
  writeFileSync(join(dir, "findings.json"), JSON.stringify({ version: 1, kind: "audit", score: 7, history: [5.5], pages: [{ route: "/a" }, { route: "/b" }], findings: [] }));
  assert.deepEqual(carryHistory(dir, ["/b", "/a"]), [5.5, 7]);
  assert.deepEqual(carryHistory(dir, ["/a"]), []);
  assert.deepEqual(carryHistory(join(dir, "missing"), ["/a"]), []);
});

test("comparing with an earlier audit carries its score trail, idempotently", async () => {
  const { compareRuns } = await import("../browse/compare.mjs");
  const prev = { version: 1, kind: "audit", score: 7, history: [5.5], pages: [], findings: [] };
  const now = { version: 1, kind: "audit", score: 8.5, pages: [], findings: [] };
  compareRuns(now, prev);
  compareRuns(now, prev);
  assert.deepEqual(now.history, [5.5, 7]);
});

test("the report headlines the score, its trail, and a score settled above its caps", () => {
  const base = { version: 1, kind: "audit", title: "T", pages: [], finished: new Date().toISOString() };
  const html = render({ ...base, scores: all(3), score: 8.5, history: [6, 7.5], findings: [] });
  assert.match(html, /<b>8\.5<\/b><span>\/10<\/span>/);
  assert.match(html, /Ready to ship/);
  assert.match(html, /6 → 7\.5 → 8\.5/);
  assert.match(html, /By area/);
  const over = render({ ...base, scores: all(4), score: 9, findings: [{ id: "f1", rule: "color/contrast", title: "x", severity: "error", status: "open" }] });
  assert.match(over, /Settled above what the evidence allows: at most 6/);
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
  assert.equal(typeof report.score, "number");
  assert.ok(report.score <= 6, "the fixture has errors, so its draft is held at 6 or under");
  assert.match(readFileSync(join(out, "index.html"), "utf8"), /drafted from the measurements/);
});

test("placePages: each page takes its area's preset, by its source file or else its route, and the report says so", async () => {
  const { mkdtempSync, writeFileSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { placePages } = await import("../audit.mjs");
  const { newRun } = await import("../browse/findings.mjs");
  const { render } = await import("../browse/report.mjs");
  const root = mkdtempSync(join(tmpdir(), "keyline-audit-areas-"));
  writeFileSync(join(root, "DESIGN.md"), "## Profile\n\n| | |\n|---|---|\n| Preset | `product` |\n| Areas | `app/(marketing)/** → expressive` · `/docs/** → editorial` |\n");
  const run = newRun({ kind: "audit", root });
  run.pages = [
    { route: "/about", file: "app/(marketing)/about/page.tsx", shots: {} },
    { route: "/docs/start", shots: {} },
    { route: "/settings", file: "app/settings/page.tsx", shots: {} },
  ];
  placePages(run, root);
  assert.deepEqual(run.pages.map((p) => [p.route, p.preset, p.area ?? null]), [
    ["/about", "expressive", "app/(marketing)/**"],
    ["/docs/start", "editorial", "/docs/**"],
    ["/settings", "product", null],
  ]);
  run.findings.push({ id: "f1", rule: "layout/hierarchy", title: "Flat", page: "/about", severity: "warning", status: "open", domain: "layout" });
  assert.match(render(run), /<small class="area">expressive · app\/\(marketing\)\/\*\*<\/small>/);
});
