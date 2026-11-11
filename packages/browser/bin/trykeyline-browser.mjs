#!/usr/bin/env node
/**
 * Keyline's browser tools, a separate package so the core (`trykeyline`) and
 * its skill stay free of Playwright. `npx trykeyline audit …` runs this.
 *
 *   trykeyline-browser audit (--base URL | --serve DIR) [options]
 *   trykeyline-browser smoke (--base URL | --serve DIR) [options]
 *   trykeyline-browser pages | capture | report [options]
 *   trykeyline-browser probe <name> [--arg JSON]
 *
 * Exit codes: 0 done, 1 errors found, 2 a usage error.
 */
import { readFileSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parseOrExplain } from "../browse/args.mjs";

const { version } = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));

const USAGE = `trykeyline-browser ${version} — Keyline's browser tools (also: npx trykeyline <command>).

  audit (--base URL | --serve DIR)   every page measured, with the detector's findings, in one report
  smoke (--base URL | --serve DIR)   click through the product and report broken flows
  pages                              the pages it would visit
  capture (--base URL | --serve DIR) visit, screenshot and report load errors
  report [DIR] [--compare DIR]       re-render a report, or mark what changed since another
  probe <name> [--arg JSON]          print a page check to run in your own browser

Each takes --help. Playwright loads from the project, or installs once into
~/.cache/keyline, when a command first needs a browser.`;

export async function main(argv) {
  const [cmd, ...rest] = argv;
  if (cmd === "audit") return (await import("../audit.mjs")).run(rest);
  if (cmd === "smoke") return (await import("../smoke.mjs")).run(rest);
  if (cmd === "pages" || cmd === "capture" || cmd === "report") return (await import("../browse.mjs")).run(argv);
  if (cmd === "probe") {
    const opts = parseOrExplain("probe", rest, { values: ["arg"] });
    if (!opts) return 2;
    const { PROBES, probeExpression } = await import("../probe.mjs");
    if (opts.help || !opts._[0]) {
      console.log(`keyline probe <name> [--arg JSON] — one expression for your browser's JavaScript tool.\n\nProbes: ${PROBES.join(", ")}`);
      return opts.help ? 0 : 2;
    }
    try {
      console.log(probeExpression(opts._[0], opts.arg ? JSON.parse(opts.arg) : undefined));
      return 0;
    } catch (err) {
      console.error(`keyline probe: ${err.message}`);
      return 2;
    }
  }
  if (cmd === "-v" || cmd === "--version") {
    console.log(version);
    return 0;
  }
  if (!cmd || cmd === "-h" || cmd === "--help") {
    console.log(USAGE);
    return cmd ? 0 : 2;
  }
  console.error(`trykeyline-browser: no command '${cmd}'\n\n${USAGE}`);
  return 2;
}

const isMain = () => {
  try {
    return process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
};
if (isMain()) {
  main(process.argv.slice(2)).then(
    (code) => process.exit(code),
    (err) => {
      console.error(err?.stack ?? err);
      process.exit(2);
    },
  );
}
