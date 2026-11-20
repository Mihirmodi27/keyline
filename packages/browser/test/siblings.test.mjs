import { strict as assert } from "node:assert";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { siblingsOf, strayPages } from "../audit/siblings.mjs";
import { add, newRun } from "../browse/findings.mjs";
import { run } from "../audit.mjs";
import { launch } from "../browse/playwright.mjs";

const look = (over = {}) => ({
  families: { Inter: 40 },
  sizes: { "16px": 30, "14px": 10 },
  weights: { 400: 35, 600: 5 },
  colors: { "rgb(20, 20, 20)": 30, "rgb(100, 100, 100)": 10 },
  surfaces: { "rgb(255, 255, 255)": 3 },
  radii: { "8px": 4 },
  gaps: { "16px": 6 },
  pads: { "16px": 4 },
  h1: "40px 600 Inter",
  measure: 680,
  at: {},
  ...over,
});
const page = (route, l = look(), extra = {}) => ({ route, look: l, shots: {}, ...extra });
const strays = (pages) => strayPages(Object.assign(newRun({ kind: "audit" }), { pages }), add).findings;

test("siblings: the same section in the same area; top-level pages with each other; never the home page", () => {
  const pages = [page("/"), page("/docs/a"), page("/docs/b"), page("/docs/c"), page("/about"), page("/pricing"), page("/blog"), page("/docs/x", look(), { area: "/docs/x/**" })];
  const of = (r) => siblingsOf(pages.find((p) => p.route === r), pages).map((p) => p.route);
  assert.deepEqual(of("/"), []);
  assert.deepEqual(of("/docs/a"), ["/docs/b", "/docs/c"]);
  assert.deepEqual(of("/about"), ["/pricing", "/blog"]);
  assert.deepEqual(of("/docs/x"), [], "a page in its own area has no siblings outside it");
});

test("a page that uses values none of its siblings use is reported, once per domain", () => {
  const odd = look({ sizes: { "16px": 20, "22px": 6, "13px": 4 }, h1: "56px 700 Inter", colors: { "rgb(20, 20, 20)": 30, "rgb(80, 60, 200)": 5 }, radii: { "20px": 3 }, measure: 1100, at: { "sizes|22px": { selector: "p.x", box: { x: 0, y: 0, w: 10, h: 10 } } } });
  const f = strays([page("/docs/a"), page("/docs/b"), page("/docs/c"), page("/docs/new", odd)]);
  assert.deepEqual(f.map((x) => x.rule).sort(), ["color/stray-page", "layout/stray-page", "type/stray-page"]);
  const type = f.find((x) => x.rule === "type/stray-page");
  assert.equal(type.page, "/docs/new");
  assert.equal(type.severity, "info");
  assert.match(type.detail, /22px text, 13px text and an h1 at 56px 700 Inter where they set it at 40px 600 Inter, which none of \/docs\/a, \/docs\/b, \/docs\/c use/);
  assert.deepEqual(type.box, { x: 0, y: 0, w: 10, h: 10 });
  assert.equal(type.selector, undefined, "matched by page and rule, so a kept one stays kept");
  assert.match(f.find((x) => x.rule === "layout/stray-page").detail, /20px corners and text 1100px wide where theirs is about 680px/);
});

test("pages that agree, values used once or twice, and pages with too few siblings say nothing", () => {
  assert.deepEqual(strays([page("/docs/a"), page("/docs/b"), page("/docs/c")]), []);
  assert.deepEqual(strays([page("/docs/a"), page("/docs/b"), page("/docs/c", look({ sizes: { "16px": 30, "11px": 2 } }))]), []);
  assert.deepEqual(strays([page("/docs/a"), page("/docs/b", look({ radii: { "30px": 9 } }))]), []);
});

test("the audit measures each page's look and flags the one that strays from its section", { timeout: 120000 }, async (t) => {
  try {
    const b = await launch({ log: () => {} });
    await b.close();
  } catch {
    t.skip("no browser could launch here");
    return;
  }
  const site = mkdtempSync(join(tmpdir(), "keyline-siblings-site-"));
  const doc = (body, css = "") => `<!doctype html><html lang=en><head><meta name=viewport content="width=device-width"><title>Docs</title><style>body{font:16px/1.5 Georgia,serif;color:#222;margin:0}main{max-width:640px;margin:0 auto;padding:24px}h1{font-size:40px;font-weight:600}${css}</style></head><body><main><h1>Docs</h1>${body}</main></body></html>`;
  const para = "<p>A paragraph long enough to count as running text, so the reading width of the page is measured from it and compared.</p>".repeat(4);
  for (const name of ["a", "b", "c"]) {
    mkdirSync(join(site, "docs", name), { recursive: true });
    writeFileSync(join(site, "docs", name, "index.html"), doc(para));
  }
  mkdirSync(join(site, "docs", "new"), { recursive: true });
  writeFileSync(join(site, "docs", "new", "index.html"), doc(para + '<p class="big">Big</p><p class="big">Bigger</p><p class="big">Biggest</p>', ".big{font-size:22px;color:#5b3fd0}h1{font-size:56px;font-weight:700}"));
  const out = mkdtempSync(join(tmpdir(), "keyline-siblings-out-"));
  await run(["--serve", site, "--routes", "/docs/a,/docs/b,/docs/c,/docs/new", "--no-check", "--out", out]);
  const report = JSON.parse(readFileSync(join(out, "findings.json"), "utf8"));
  const stray = report.findings.filter((f) => /stray-page$/.test(f.rule));
  assert.deepEqual([...new Set(stray.map((f) => f.page))], ["/docs/new"]);
  assert.ok(stray.some((f) => f.rule === "type/stray-page" && /22px text/.test(f.detail) && /h1 at 56px 700/.test(f.detail)), stray.map((f) => f.detail).join("\n"));
  assert.ok(stray.some((f) => f.rule === "color/stray-page"));
  assert.ok(report.pages.every((p) => p.look), "each page keeps its measured look");
});
