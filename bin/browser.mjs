/**
 * The browser tools — audit, smoke, pages, capture, report, probe — are a
 * second package, trykeyline-browser, so this one stays small and never
 * pulls in Playwright. `npx trykeyline audit …` runs them from, in order:
 *
 *   1. this repository's packages/browser, when running from a checkout;
 *   2. trykeyline-browser installed in the project, at this version;
 *   3. `npx -y trykeyline-browser@<this version>`, fetched once into npx's cache.
 *
 * The same version, so the skill this package installs and the tools it
 * describes always agree.
 */
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { runNpm } from "./npm.mjs";

export const BROWSER_COMMANDS = ["audit", "smoke", "pages", "capture", "report", "probe"];
const PACKAGE = "trykeyline-browser";
const BIN = "bin/trykeyline-browser.mjs";

/** The bin of a local trykeyline-browser at `version`, or null. */
export function localBrowser(version, { cwd = process.cwd() } = {}) {
  const checkout = fileURLToPath(new URL(`../packages/browser/${BIN}`, import.meta.url));
  if (existsSync(checkout)) return checkout;
  try {
    const pkg = createRequire(join(cwd, "noop.js")).resolve(`${PACKAGE}/package.json`);
    if (JSON.parse(readFileSync(pkg, "utf8")).version === version) return join(dirname(pkg), BIN);
  } catch {
    // Not installed in the project.
  }
  return null;
}

/** Run a browser command. Returns its exit code. */
export async function runBrowser(argv, version) {
  const local = localBrowser(version);
  if (local) {
    let main;
    try {
      ({ main } = await import(pathToFileURL(local).href));
    } catch (err) {
      if (err?.code !== "ERR_MODULE_NOT_FOUND" || !/'trykeyline'/.test(err.message)) throw err;
      console.error("keyline: this checkout's browser tools import trykeyline from node_modules. Link it first: node packages/browser/link.mjs");
      return 2;
    }
    return main(argv);
  }
  const r = runNpm("npx", ["-y", `${PACKAGE}@${version}`, ...argv], { stdio: "inherit" });
  if (r.error) {
    console.error(`keyline: couldn't run ${PACKAGE} through npx (${r.error.message}). Install it with \`npm i -D ${PACKAGE}@${version}\`.`);
    return 2;
  }
  return r.status ?? 1;
}
