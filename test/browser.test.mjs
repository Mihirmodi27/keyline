import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { quoteForCmd } from "../bin/npm.mjs";

// The browser tools are a second package (packages/browser, trykeyline-browser).
// The core CLI runs them; from a checkout it uses the one beside it.
const ROOT = fileURLToPath(new URL("..", import.meta.url));
const CLI = join(ROOT, "bin/keyline.mjs");
const cli = (...args) => spawnSync(process.execPath, [CLI, ...args], { encoding: "utf8", env: { ...process.env, NO_COLOR: "1" } });
const read = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));

test("the core CLI hands the browser commands to trykeyline-browser", () => {
  const dir = mkdtempSync(join(tmpdir(), "keyline-delegate-"));
  writeFileSync(join(dir, "findings.json"), JSON.stringify({ version: 1, kind: "capture", pages: [], findings: [] }));
  const r = cli("report", dir);
  assert.equal(r.status, 0, r.stderr);
  assert.match(readFileSync(join(dir, "index.html"), "utf8"), /<html/);
  assert.equal(cli("audit", "--bsae", "x").status, 2, "the browser package's usage errors come through");
});

test("probe prints the audit's page checks as one expression, helpers included", () => {
  const r = cli("probe", "audit", "--arg", '{"viewport":"phone","theme":"dark"}');
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /window\.__keylineSelector = function/);
  assert.match(r.stdout, /"viewport":"phone","theme":"dark"/);
  assert.doesNotThrow(() => new Function(`return ${r.stdout}`), "it parses as JavaScript");
  assert.match(cli("probe", "inventory").stdout, /^\(/);
  assert.equal(cli("probe", "nothing").status, 2);
});

test("the core package ships no browser code, and both packages are one release", () => {
  const [pack] = JSON.parse(execFileSync("npm", ["pack", "--dry-run", "--json"], { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], shell: process.platform === "win32" }));
  const files = pack.files.map((f) => f.path);
  assert.ok(files.includes("plugins/keyline/skills/keyline/scripts/check.mjs"));
  assert.deepEqual(files.filter((f) => /^packages\/|^ci\/|scripts\/(browse|smoke|audit)\b|playwright/.test(f)), []);

  const core = read("package.json");
  const browser = read("packages/browser/package.json");
  assert.equal(browser.version, core.version);
  assert.equal(browser.dependencies.trykeyline, core.version);
  assert.deepEqual(Object.keys(core.dependencies ?? {}), [], "the core has no runtime dependencies");
  assert.equal(browser.peerDependenciesMeta.playwright.optional, true);
});

test("arguments are quoted for cmd.exe only when they need it", () => {
  assert.equal(quoteForCmd("trykeyline-browser@0.1.1"), "trykeyline-browser@0.1.1");
  assert.equal(quoteForCmd("http://x/?a=b&c=d"), '"http://x/?a=b&c=d"');
  assert.equal(quoteForCmd("C:\\Users\\A B\\cache\\"), '"C:\\Users\\A B\\cache\\\\"');
  assert.equal(quoteForCmd('say "hi"'), '"say \\"hi\\""');
});
