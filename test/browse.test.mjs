import { strict as assert } from "node:assert";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { add, dedupe, newRun, readRun, writeRun } from "../plugins/keyline/skills/keyline/scripts/browse/findings.mjs";
import { render, renderDir } from "../plugins/keyline/skills/keyline/scripts/browse/report.mjs";
import { discover, linkPath, routesFromCode } from "../plugins/keyline/skills/keyline/scripts/browse/routes.mjs";
import { serve } from "../plugins/keyline/skills/keyline/scripts/browse/serve.mjs";

function project(files) {
  const root = mkdtempSync(join(tmpdir(), "keyline-routes-"));
  for (const [path, body] of Object.entries(files)) {
    mkdirSync(join(root, path, ".."), { recursive: true });
    writeFileSync(join(root, path), body);
  }
  return root;
}

test("Next app router: groups and slots drop out, params are dynamic", () => {
  const root = project({
    "package.json": JSON.stringify({ dependencies: { next: "16" } }),
    "src/app/page.tsx": "",
    "src/app/(marketing)/pricing/page.tsx": "",
    "src/app/@modal/login/page.tsx": "",
    "src/app/projects/[id]/page.tsx": "",
    "src/app/_internal/page.tsx": "",
  });
  const paths = routesFromCode(root).map((r) => `${r.path}${r.dynamic ? "*" : ""}`).sort();
  assert.deepEqual(paths, ["/", "/login", "/pricing", "/projects/[id]*"]);
});

test("Next pages router skips _app, _document and api", () => {
  const root = project({
    "package.json": JSON.stringify({ dependencies: { next: "14" } }),
    "pages/index.tsx": "",
    "pages/about.tsx": "",
    "pages/_app.tsx": "",
    "pages/api/hello.ts": "",
    "pages/blog/[slug].tsx": "",
  });
  assert.deepEqual(routesFromCode(root).map((r) => r.path).sort(), ["/", "/about", "/blog/[slug]"]);
});

test("React Router paths are read from source", () => {
  const root = project({
    "package.json": JSON.stringify({ dependencies: { "react-router-dom": "6" } }),
    "src/routes.tsx": `import { createBrowserRouter } from "react-router-dom";\nexport const r = createBrowserRouter([{ path: "/" }, { path: "/settings" }, { path: "/users/:id" }]);\n<Route path="/help" />`,
  });
  assert.deepEqual(routesFromCode(root).map((r) => r.path).sort(), ["/", "/help", "/settings", "/users/:id"]);
});

test("plain HTML folders become routes", () => {
  const root = project({ "index.html": "", "about/index.html": "", "docs/intro.html": "" });
  assert.deepEqual(routesFromCode(root).map((r) => r.path).sort(), ["/", "/about", "/docs/intro.html"]);
});

test("linkPath keeps same-origin pages and drops assets and other sites", () => {
  const o = "http://localhost:3000";
  assert.equal(linkPath("/settings/", `${o}/`, o), "/settings");
  assert.equal(linkPath("guide", `${o}/docs/`, o), "/docs/guide");
  assert.equal(linkPath("https://example.com/x", `${o}/`, o), null);
  assert.equal(linkPath("/logo.svg", `${o}/`, o), null);
  assert.equal(linkPath("mailto:a@b.c", `${o}/`, o), null);
});

test("discover crawls a served folder and fills a dynamic route from it", async () => {
  const root = project({
    "index.html": `<a href="/projects/42/">A project</a><a href="/about/">About</a>`,
    "about/index.html": "<p>about</p>",
    "projects/42/index.html": "<p>42</p>",
  });
  const s = await serve(root);
  try {
    const { routes } = await discover({ root, base: s.url });
    assert.deepEqual(routes.map((r) => r.path).sort(), ["/", "/about", "/projects/42"]);
  } finally {
    await s.close();
  }
});

test("the static server redirects a folder to its slash", async () => {
  const root = project({ "a/index.html": "<p>a</p>" });
  const s = await serve(root);
  try {
    const res = await fetch(`${s.url}/a`, { redirect: "manual" });
    assert.equal(res.status, 301);
    assert.equal(res.headers.get("location"), "/a/");
    assert.equal((await fetch(`${s.url}/missing`)).status, 404);
  } finally {
    await s.close();
  }
});

test("findings: defaults, dedupe, and a round trip through findings.json", () => {
  const run = newRun({ kind: "audit", title: "Test" });
  add(run, { rule: "color/contrast", title: "Faint", page: "/", severity: "error", selector: ".a" });
  add(run, { rule: "color/contrast", title: "Faint", page: "/", severity: "error", selector: ".a" });
  add(run, { rule: "type/uppercase", title: "Shouting", page: "/", severity: "info" });
  assert.equal(run.findings[0].domain, "color");
  assert.equal(dedupe(run.findings).length, 2);
  assert.throws(() => add(run, { title: "no rule" }));
  const dir = mkdtempSync(join(tmpdir(), "keyline-run-"));
  writeRun(dir, run);
  const back = readRun(dir);
  assert.equal(back.findings.length, 2);
  assert.equal(back.findings[0].severity, "error");
});

test("the report escapes text, draws boxes and skips dismissed findings", () => {
  const run = newRun({ kind: "audit", title: "<Lumen>" });
  run.pages.push({ route: "/", title: "Home", shots: { "desktop-light": { path: "shots/home.png", width: 1440, height: 3000 } } });
  add(run, { rule: "a11y/name", title: "Button <b>has no name</b>", page: "/", shot: "desktop-light", box: { x: 100, y: 200, w: 40, h: 40 } });
  add(run, { rule: "copy/vague", title: "Hidden one", page: "/", status: "dismissed" });
  const html = render(run);
  assert.match(html, /Audit: &lt;Lumen&gt;/);
  assert.match(html, /Button &lt;b&gt;has no name&lt;\/b&gt;/);
  assert.match(html, /class="shot__mark"/);
  assert.doesNotMatch(html, /Hidden one/);
  const dir = mkdtempSync(join(tmpdir(), "keyline-report-"));
  writeRun(dir, run);
  assert.match(readFileSync(renderDir(dir), "utf8"), /<!doctype html>/);
});
