import { strict as assert } from "node:assert";
import { mkdtempSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { loadPlaywright } from "../browse/playwright.mjs";
import { serve } from "../browse/serve.mjs";
import { SMOKE_OPTIONS, smoke } from "../smoke.mjs";
import { parseArgs } from "../browse/args.mjs";
import { BROWSE_OPTIONS } from "../browse.mjs";
import { isDestructive, isTestHost, loadConfig, policy, settings, urlMatcher } from "../smoke/config.mjs";
import { invalidValue, validValue } from "../smoke/forms.mjs";
import { follow } from "../smoke/links.mjs";
import { expression, similarity } from "../smoke/page.mjs";
import { cls } from "../smoke/shift.mjs";

const SITE = fileURLToPath(new URL("./fixtures/smoke-site/", import.meta.url));

/* ── Without a browser ──────────────────────────────────────────────────── */

test("test hosts: local names, *.localhost, *.test and configured hosts only", () => {
  for (const u of ["http://localhost:3000", "http://127.0.0.1:5173", "http://[::1]:8080", "http://app.localhost", "https://shop.test"]) assert.equal(isTestHost(u), true, u);
  for (const u of ["https://example.com", "https://localhost.example.com", "https://test.example.com", "https://staging.example.com"]) assert.equal(isTestHost(u), false, u);
  assert.equal(isTestHost("https://staging.example.com", ["staging.example.com"]), true);
});

test("destructive words are caught, ordinary ones aren't", () => {
  for (const t of ["Delete project", "Remove member", "Pay now", "Buy", "Purchase plan", "Unsubscribe", "Sign out", "Log out", "Logout"]) assert.equal(isDestructive(t), true, t);
  for (const t of ["Save", "Export CSV", "Show details", "Subscribe to updates", "Payment history", "Reset filters"]) assert.equal(isDestructive(t), false, t);
});

test("policy: writes on test hosts, destructive writes only when allowed", () => {
  const local = policy({ base: "http://localhost:3000" });
  assert.equal(local.blocks({ write: true }), null);
  assert.match(local.blocks({ write: true, destructive: true }), /allow-writes/);
  assert.equal(policy({ base: "http://localhost:3000", allowWrites: true }).blocks({ write: true, destructive: true }), null);
  const prod = policy({ base: "https://example.com", allowWrites: true });
  assert.match(prod.blocks({ write: true }), /test host/);
  assert.match(prod.blocks({ write: true, destructive: true }), /test host/);
});

test("forbidden URLs: globs, regexes and substrings", () => {
  const m = urlMatcher(["/admin/*", "/^\\/billing(\\/|$)/", "logout"]);
  assert.equal(m("http://x.test/admin/users"), true);
  assert.equal(m("http://x.test/billing"), true);
  assert.equal(m("http://x.test/api/logout?next=/"), true);
  assert.equal(m("http://x.test/settings"), false);
});

test("config: credentials come from the environment, never the file", () => {
  const dir = mkdtempSync(join(tmpdir(), "keyline-smoke-config-"));
  writeFileSync(join(dir, "keyline.smoke.json"), JSON.stringify({ auth: { login: { url: "/login", steps: [{ fill: "#password", value: "hunter2" }] } } }));
  assert.throws(() => loadConfig({ root: dir }), /environment variable/);
  writeFileSync(join(dir, "keyline.smoke.json"), JSON.stringify({ auth: { login: { url: "/login", steps: [{ fill: "#password", env: "SMOKE_PASSWORD" }] } }, maxClicks: 5 }));
  const config = loadConfig({ root: dir });
  assert.equal(settings({}, config).maxClicks, 5);
  assert.equal(settings({ "max-clicks": "9" }, config).maxClicks, 9);
  assert.deepEqual(loadConfig({ root: mkdtempSync(join(tmpdir(), "keyline-none-")) }), { path: null });
  assert.throws(() => settings({ only: "links,nope" }, {}), /no check called 'nope'/);
});

test("arguments: --allow-writes is a flag, not a value-taker", () => {
  const o = parseArgs(["--allow-writes", "--base", "http://localhost:3000", "--only=links"], SMOKE_OPTIONS);
  assert.equal(o["allow-writes"], true);
  assert.equal(o.base, "http://localhost:3000");
  assert.equal(o.only, "links");
});

test("arguments: a value splits at the first = only, and an unknown or valueless option is an error", () => {
  assert.equal(parseArgs(["--base=http://x/?a=b&c=d"], BROWSE_OPTIONS).base, "http://x/?a=b&c=d");
  assert.match(parseArgs(["--bsae", "http://x"], BROWSE_OPTIONS).error, /unknown option --bsae/);
  assert.match(parseArgs(["--strict"], BROWSE_OPTIONS).error, /unknown option --strict/);
  assert.match(parseArgs(["--base"], BROWSE_OPTIONS).error, /--base needs a value/);
  assert.match(parseArgs(["--headed=yes"], BROWSE_OPTIONS).error, /takes no value/);
  assert.deepEqual(parseArgs(["report", "-h"], BROWSE_OPTIONS), { _: ["report"], help: true });
});

test("form values: plausible ones, and ones a field should refuse", () => {
  assert.equal(validValue({ type: "email" }), "keyline.smoke@example.test");
  assert.equal(validValue({ type: "text", name: "full_name" }), "Keyline Tester");
  assert.equal(validValue({ type: "text", minLength: 30 }).length, 30);
  assert.equal(invalidValue({ type: "email" }).value, "not-an-email");
  assert.equal(invalidValue({ type: "number", min: "1" }).value, "0");
  assert.equal(invalidValue({ type: "text", name: "nickname" }), null);
});

test("similarity and layout-shift scoring", () => {
  assert.equal(similarity(["a", "b"], ["a", "b"]), 1);
  assert.equal(similarity(["a", "b"], ["c"]), 0);
  // Two bursts: the larger one is the score.
  const score = cls([
    { t: 100, value: 0.05 },
    { t: 400, value: 0.05 },
    { t: 3000, value: 0.2 },
  ]);
  assert.equal(score.value.toFixed(2), "0.20");
});

test("page functions print as one pasteable expression", () => {
  const src = expression("inventory");
  assert.match(src, /^\(function anonymous\(arg/);
  assert.match(src, /installHelpers/);
  assert.throws(() => expression("nope"));
});

test("links: redirect chains and loops are followed hop by hop", async () => {
  const server = createServer((req, res) => {
    const hops = { "/a": "/b", "/b": "/c", "/c": "/done", "/loop1": "/loop2", "/loop2": "/loop1" };
    if (hops[req.url]) res.writeHead(301, { location: hops[req.url] }).end();
    else if (req.url === "/done") res.writeHead(200).end("ok");
    else res.writeHead(404).end();
  });
  await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
  const base = `http://127.0.0.1:${server.address().port}`;
  // The shape of Playwright's APIRequestContext that follow() uses.
  const request = {
    fetch: async (url) => {
      const res = await fetch(url, { redirect: "manual" });
      return { status: () => res.status, headers: () => Object.fromEntries(res.headers), dispose: async () => {} };
    },
  };
  try {
    const chain = await follow(request, `${base}/a`);
    assert.equal(chain.status, 200);
    assert.equal(chain.chain.length, 4);
    assert.equal((await follow(request, `${base}/loop1`)).loop, true);
    assert.equal((await follow(request, `${base}/nope`)).status, 404);
  } finally {
    server.close();
  }
});

/* ── In a browser: the planted bugs ─────────────────────────────────────── */

async function browserOrSkip(t) {
  try {
    const { pw } = await loadPlaywright({ install: false, log: () => {} });
    try {
      return await pw.chromium.launch({ headless: true, channel: "chrome" });
    } catch {
      return await pw.chromium.launch({ headless: true });
    }
  } catch (err) {
    t.skip(`no browser to drive: ${String(err?.message ?? err).split("\n")[0]}`);
    return null;
  }
}

test("smoke finds every planted bug, and nothing on the working controls", { timeout: 180000 }, async (t) => {
  const browser = await browserOrSkip(t);
  if (!browser) return;
  const s = await serve(SITE);
  const out = mkdtempSync(join(tmpdir(), "keyline-smoke-run-"));
  try {
    const run = await smoke({
      base: s.url,
      root: SITE,
      out,
      browser,
      opts: { skip: "shift", "stuck-ms": "3000", "quiet-ms": "1200" },
      log: () => {},
    });
    const on = (rule, pred = () => true) => run.findings.filter((f) => f.rule === rule && pred(f));
    const sel = (s) => (f) => (f.selector ?? "").includes(s);

    assert.equal(on("flow/dead-click", sel("#export")).length, 1, "the dead Export button");
    assert.equal(on("flow/broken-link", (f) => /missing/.test(f.title)).length, 1, "the link to /missing/");
    assert.equal(on("flow/stuck-loading").length, 1, "the spinner that never stops");
    assert.equal(on("flow/silent-validation", sel("#join")).length, 1, "the form with no error message");
    assert.equal(on("flow/focus-trap").length, 1, "the focus trap");
    assert.equal(on("flow/focus-invisible", sel("#share")).length, 1, "the button with focus styled away");
    assert.equal(on("flow/escape-ignored", sel("#more")).length, 1, "the menu Escape won't close");

    // The working controls aren't reported.
    for (const id of ["#details-toggle", "#share", "#more", "#apply"]) assert.equal(on("flow/dead-click", sel(id)).length, 0, `${id} works`);
    assert.equal(run.findings.filter((f) => f.page === "/about").length, 0, "the clean page is clean");
    // The 404 the walk met is folded into the broken link, not reported again.
    assert.equal(on("runtime/http-status").length, 0);

    // Every smoke finding can be reproduced, and points at the page.
    for (const f of run.findings.filter((f) => f.domain === "flow")) {
      assert.ok(f.steps?.length >= 2, `${f.rule} has steps`);
      assert.match(f.steps[0], /^Open /);
    }
    const dead = on("flow/dead-click", sel("#export"))[0];
    assert.ok(dead.box && dead.shot === "desktop-light", "the dead click is outlined on the shot");
    assert.equal(dead.file, "index.html", "and found in the source");
  } finally {
    await browser.close();
    await s.close();
  }
});
