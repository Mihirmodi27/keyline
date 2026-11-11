/**
 * Playwright, only when a browser is needed. It's an optional peer of this
 * package, never a dependency: the scripts that drive a page load it from the
 * project if it has it, or from beside this package, else from Keyline's own
 * cache, installing it there once (`~/.cache/keyline`, or $KEYLINE_CACHE) at
 * the version below. The browser is the installed Chrome when there is one,
 * so nothing large is downloaded; Playwright's own Chromium otherwise.
 *
 * An agent with its own browser tools (Claude's browser, a Playwright MCP) can
 * skip all of this: the commands say how to walk the pages with those tools
 * and write findings.json by hand, then render it with `keyline report`.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { runNpm } from "trykeyline/npm";

export const CACHE = process.env.KEYLINE_CACHE?.trim() || join(homedir(), ".cache", "keyline");
/** What a first run installs into the cache: one exact version, so every machine drives the same Playwright. */
export const PLAYWRIGHT_VERSION = "1.65.0";
const HERE = dirname(fileURLToPath(import.meta.url));

function resolveFrom(base) {
  try {
    return createRequire(join(base, "noop.js")).resolve("playwright");
  } catch {
    return null;
  }
}

async function importFrom(path) {
  const mod = await import(pathToFileURL(path).href);
  const pw = mod.chromium ? mod : mod.default;
  if (!pw?.chromium) throw new Error(`${path} didn't export chromium`);
  return { pw, dir: dirname(path) };
}

/** Find Playwright, or install it into the cache. `install: false` throws instead. */
export async function loadPlaywright({ root = process.cwd(), install = true, log = (m) => process.stderr.write(m + "\n") } = {}) {
  for (const base of [root, HERE, CACHE]) {
    const found = resolveFrom(base);
    if (found) return importFrom(found);
  }
  if (!install) {
    throw new Error("Playwright isn't installed. Run with install allowed, or `npm i -D playwright` in the project.");
  }
  log(`Keyline drives a browser with Playwright. Installing it once into ${CACHE} …`);
  mkdirSync(CACHE, { recursive: true });
  const pkg = join(CACHE, "package.json");
  if (!existsSync(pkg)) writeFileSync(pkg, JSON.stringify({ name: "keyline-cache", private: true }) + "\n");
  // npm is npm.cmd on Windows, which Node only spawns through a shell.
  const r = runNpm("npm", ["install", "--no-audit", "--no-fund", "--prefix", CACHE, `playwright@${PLAYWRIGHT_VERSION}`], { stdio: ["ignore", "inherit", "inherit"] });
  if (r.error || r.status !== 0) throw new Error(`couldn't install Playwright into ${CACHE}${r.error ? `: ${r.error.message}` : ""}. Install it in the project instead: npm i -D playwright`);
  const found = resolveFrom(CACHE);
  if (!found) throw new Error(`installed Playwright but can't resolve it from ${CACHE}`);
  return importFrom(found);
}

/** Chrome if it's installed, Playwright's Chromium if not (downloaded once). `install: false` never installs anything: it throws instead. */
export async function launch({ root, headless = true, log, install = true } = {}) {
  const { pw, dir } = await loadPlaywright({ root, log, install });
  try {
    return await pw.chromium.launch({ headless, channel: "chrome" });
  } catch {
    // No installed Chrome; fall through to Playwright's own build.
  }
  try {
    return await pw.chromium.launch({ headless });
  } catch (err) {
    if (!install) throw err;
    (log ?? ((m) => process.stderr.write(m + "\n")))("Downloading Playwright's Chromium once …");
    execFileSync(process.execPath, [join(dir, "cli.js"), "install", "chromium"], { stdio: ["ignore", "inherit", "inherit"] });
    return pw.chromium.launch({ headless });
  }
}
