import { strict as assert } from "node:assert";
import { mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { add, dedupe, newRun, readRun, writeRun } from "../browse/findings.mjs";
import { render, renderDir } from "../browse/report.mjs";
import { discover, linkPath, routesFromCode } from "../browse/routes.mjs";
import { serve } from "../browse/serve.mjs";

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

test("routes are walked as the detector walks: a broken link, a report or a dot-folder never breaks or pads the list", () => {
  const root = project({ "index.html": "", "keyline-report/index.html": "", ".cache/x.html": "", "node_modules/pkg/index.html": "" });
  symlinkSync(join(root, "nowhere"), join(root, "broken.html"));
  assert.deepEqual(routesFromCode(root).map((r) => r.path), ["/"]);
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

test("dedupe keeps a source finding per line: the same raw colour in two files is two findings", () => {
  const run = newRun({ kind: "audit" });
  const raw = { kind: "check", rule: "color/raw-color", title: "`#9a9a9a` typed into `color`", severity: "warning" };
  add(run, { ...raw, file: "a.css", line: 1, fingerprint: "aaaa" });
  add(run, { ...raw, file: "b.css", line: 1, fingerprint: "bbbb" });
  add(run, { ...raw, file: "b.css", line: 1, fingerprint: "bbbb" });
  assert.deepEqual(dedupe(run.findings).map((f) => f.file), ["a.css", "b.css"]);
});

test("decisions: keep a page finding by its report id, at every width it was seen; the report lists it apart; drop reopens it", async () => {
  const { mkdtempSync, readFileSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { spawnSync } = await import("node:child_process");
  const { renderDir } = await import("../browse/report.mjs");
  const CLI = new URL("../../../bin/keyline.mjs", import.meta.url).pathname;
  const root = mkdtempSync(join(tmpdir(), "keyline-report-decisions-"));
  const out = join(root, "keyline-report");
  const run = newRun({ kind: "audit", root });
  const eyebrow = { rule: "type/caps", title: "Capitals on a label", page: "/", selector: ".hero .eyebrow", severity: "warning" };
  add(run, { ...eyebrow, viewport: "desktop", theme: "light" });
  add(run, { ...eyebrow, viewport: "phone", theme: "dark" });
  add(run, { rule: "color/contrast", title: "Faint", page: "/", selector: ".time", viewport: "desktop", theme: "light", severity: "error" });
  writeRun(out, run);
  const id = readRun(out).findings.find((f) => f.rule === "type/caps").id;
  const keep = (...a) => spawnSync(process.execPath, [CLI, "keep", ...a, "--root", root, "--by", "Ada"], { encoding: "utf8" });

  const contrast = readRun(out).findings.find((f) => f.rule === "color/contrast").id;
  assert.equal(keep(contrast, "--reason", "we like it").status, 2);

  const r = keep(id, "--reason", "the brand sets eyebrows in capitals");
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /Kept k1: .* \/ · desktop · light · \.hero \.eyebrow/);
  assert.match(r.stdout, /Kept k2: .* \/ · phone · dark · \.hero \.eyebrow/);

  renderDir(out);
  const kept = readRun(out).findings.filter((f) => f.decided);
  assert.deepEqual(kept.map((f) => [f.viewport, f.status, f.by]), [["desktop", "dismissed", "Ada"], ["phone", "dismissed", "Ada"]]);
  const html = readFileSync(join(out, "index.html"), "utf8");
  assert.match(html, /2 findings kept by a decision, not counted/);
  assert.match(html, /the brand sets eyebrows in capitals/);

  // A fresh run of the same pages is marked the same way: the decision outlives the report.
  const fresh = newRun({ kind: "audit", root });
  add(fresh, { ...eyebrow, viewport: "desktop", theme: "light" });
  writeRun(join(root, "next"), fresh);
  assert.equal(readRun(join(root, "next")).findings[0].decided, "k1");

  assert.equal(keep("--drop", "k1,k2").status, 0);
  renderDir(out);
  assert.equal(readRun(out).findings.filter((f) => f.decided || f.status === "dismissed").length, 0);
  assert.doesNotMatch(readFileSync(join(out, "index.html"), "utf8"), /kept by a decision/);
});
