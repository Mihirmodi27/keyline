#!/usr/bin/env node
/**
 * Keyline's command line.
 *
 *   npx trykeyline install                      asks which coding agent
 *   npx trykeyline install --tool codex,cursor  answers up front
 *   npx trykeyline install --user               for every project on this machine
 *   npx trykeyline update                       refresh every copy already installed
 *   npx trykeyline check                        the detector (see scripts/check.mjs)
 *   npx trykeyline audit | smoke | pages | capture | report | probe
 *                                               the browser tools, from the trykeyline-browser
 *                                               package at this version (see browser.mjs)
 *   npx trykeyline guard --install              check each UI file as the agent writes it
 *
 * Keyline is one skill folder. Each coding agent reads skills from its own
 * folder: Claude Code and Windsurf have their own; Codex, Cursor, Gemini CLI,
 * GitHub Copilot, OpenCode and most others share `.agents/skills` in a project.
 * The folder is always copied, never symlinked, so an agent reads real files,
 * and agents that share a folder share one copy.
 *
 * The skill ships inside this package, so installing copies rather than
 * downloads: it works offline and installs exactly the version npx resolved.
 */
import { cpSync, existsSync, lstatSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import { join, relative, resolve } from "node:path";
import { createInterface } from "node:readline/promises";

const SOURCE = fileURLToPath(new URL("../plugins/keyline/skills/keyline/", import.meta.url));
const { version } = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const NAME = "keyline";

/**
 * Where each agent reads skills from — in a project, and for the whole machine.
 * The ids and folders match the `skills` CLI (vercel-labs/skills), so a skill
 * installed either way lands in the same place.
 */
const home = homedir();
const configHome = process.env.XDG_CONFIG_HOME?.trim() || join(home, ".config");
const TOOLS = {
  "claude-code": {
    title: "Claude Code",
    project: ".claude/skills",
    global: join(process.env.CLAUDE_CONFIG_DIR?.trim() || join(home, ".claude"), "skills"),
  },
  codex: {
    title: "Codex",
    project: ".agents/skills",
    global: join(process.env.CODEX_HOME?.trim() || join(home, ".codex"), "skills"),
  },
  cursor: { title: "Cursor", project: ".agents/skills", global: join(home, ".cursor", "skills") },
  "gemini-cli": { title: "Gemini CLI", project: ".agents/skills", global: join(home, ".gemini", "skills") },
  "github-copilot": { title: "GitHub Copilot", project: ".agents/skills", global: join(home, ".copilot", "skills") },
  opencode: { title: "OpenCode", project: ".agents/skills", global: join(configHome, "opencode", "skills") },
  windsurf: { title: "Windsurf", project: ".windsurf/skills", global: join(home, ".codeium", "windsurf", "skills") },
  agents: {
    title: "Any other agent that reads .agents/skills",
    project: ".agents/skills",
    global: join(home, ".agents", "skills"),
  },
};
const ALIASES = { claude: "claude-code", gemini: "gemini-cli", copilot: "github-copilot", other: "agents" };
const TOOL_IDS = Object.keys(TOOLS);

/**
 * Keyline replaces the interface-skills packages. Left installed beside it,
 * their descriptions compete with Keyline's for the same requests, so install
 * offers to remove them.
 */
const SUPERSEDED = [
  "design-system-setup",
  "typographic-system",
  "color-and-theming",
  "layout-and-hierarchy",
  "surfaces-and-depth",
  "interface-motion",
  "product-patterns",
  "glass-typography",
  "glass-color",
  "glass-layout",
  "glass-and-depth",
  "glass-motion",
];

const USAGE = `Keyline ${version} — interface design laws for coding agents.

  npx trykeyline install [options]   install the skill
  npx trykeyline update  [options]   refresh every copy already installed
  npx trykeyline check  [paths…]     the laws that can be checked without a model
                                     (--json, --strict, --baseline; see npx trykeyline check --help)
  npx trykeyline keep <finding> --reason "…"
                                     record that a finding is deliberate, so no check,
                                     guard or report raises it again (--list, --drop)
  npx trykeyline audit --base <url>  measure every page in a browser and the code,
                                     in one report (see npx trykeyline audit --help)
  npx trykeyline smoke --base <url>  click through a running product and report
                                     broken flows (see npx trykeyline smoke --help)
  npx trykeyline pages | capture | report
                                     the walk under them: list the pages, visit
                                     and shoot each, re-render or --compare a report
  npx trykeyline probe <name>        print a page check to run in your own browser
                                     (the browser commands come from the
                                     trykeyline-browser package, fetched on first use)
  npx trykeyline guard --install     check each UI file as the agent writes it, and
                                     hand what's found straight back to it
                                     (--pre-commit for any agent; see npx trykeyline guard --help)
  npx trykeyline tools               list the agents it installs for

Options:
  -t, --tool <tool[,tool…]>   which agent — asked for when not given, Claude Code
                              when there's no terminal to ask on. One of:
                              ${TOOL_IDS.join(", ")}
  --agent <tool[,tool…]>      the same as --tool
  --user                     for every project on this machine, not just this one
  --dir <path>                into <path>, whatever the agent
  -f, --force                 overwrite a copy that's already there
  -h, --help                  this
  -v, --version               the version

Then, in your agent: /keyline init`;

function die(message) {
  console.error(`keyline: ${message}`);
  process.exit(1);
}

function toolId(name) {
  const id = ALIASES[name] ?? name;
  if (!TOOLS[id]) die(`no agent called '${name}' — use one of: ${TOOL_IDS.join(", ")}`);
  return id;
}

/* ── Arguments ──────────────────────────────────────────────────────────── */

const argv = process.argv.slice(2);

// `check` is the detector, which lives in the skill so an agent can run it without this CLI.
if (argv[0] === "check") {
  const { run } = await import(new URL("../plugins/keyline/skills/keyline/scripts/check.mjs", import.meta.url));
  process.exit(run(argv.slice(1)));
}
// `keep` records a decision the detector, the guard and the reports honour; it lives beside the detector, for the same reason.
if (argv[0] === "keep") {
  const { run } = await import(new URL("../plugins/keyline/skills/keyline/scripts/keep.mjs", import.meta.url));
  process.exit(run(argv.slice(1)));
}
// The browser tools are a second package, trykeyline-browser (see browser.mjs).
const { BROWSER_COMMANDS, runBrowser } = await import("./browser.mjs");
if (BROWSER_COMMANDS.includes(argv[0])) process.exit(await runBrowser(argv, version));
// `guard` wires the live guard (bin/guard.mjs) into an agent's hooks or git's.
if (argv[0] === "guard") {
  const { guardCommand } = await import("./guard.mjs");
  process.exit(await guardCommand(argv.slice(1)));
}
const command = argv[0] && !argv[0].startsWith("-") ? argv.shift() : null;
let dir = null;
let user = false;
let force = false;
const tools = [];

for (let i = 0; i < argv.length; i++) {
  const arg = argv[i];
  const value = () => (arg.includes("=") ? arg.slice(arg.indexOf("=") + 1) : argv[++i]);
  if (arg === "--user") user = true;
  else if (arg === "--dir" || arg.startsWith("--dir=")) {
    const path = value();
    if (!path) die("--dir needs a path");
    dir = resolve(path);
  } else if (["-t", "--tool", "--agent"].includes(arg) || arg.startsWith("--tool=") || arg.startsWith("--agent=")) {
    const v = value();
    if (!v) die("--tool needs an agent name");
    for (const name of v.split(",").map((s) => s.trim()).filter(Boolean)) tools.push(toolId(name));
  } else if (arg === "-f" || arg === "--force") force = true;
  else if (arg === "-h" || arg === "--help") {
    console.log(USAGE);
    process.exit(0);
  } else if (arg === "-v" || arg === "--version") {
    console.log(version);
    process.exit(0);
  } else die(`unknown option: ${arg} (try --help)`);
}

if (!command) {
  console.log(USAGE);
  process.exit(0);
}
if (command === "tools") {
  for (const id of TOOL_IDS) console.log(`${id.padEnd(16)} ${TOOLS[id].title}`);
  process.exit(0);
}
if (command !== "install" && command !== "update") die(`no command called '${command}' (try --help)`);

/* ── Helpers ────────────────────────────────────────────────────────────── */

const interactive = process.stdin.isTTY && process.stdout.isTTY;

async function prompt(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    return (await rl.question(question)).trim();
  } catch {
    // Ctrl+C or Ctrl+D at a question: stop quietly, having written nothing yet for this question.
    console.log("\nCancelled.");
    process.exit(130);
  } finally {
    rl.close();
  }
}

async function askTools() {
  if (!interactive) {
    console.log("No terminal to ask on, so installing for Claude Code. Pass --tool to choose (try `keyline tools`).\n");
    return ["claude-code"];
  }
  console.log("Which agent?\n");
  TOOL_IDS.forEach((id, i) => console.log(`  ${i + 1}) ${TOOLS[id].title}`));
  console.log();
  for (;;) {
    const answer = (await prompt("Choose one or more, like 1 or 1,2 [1]: ")) || "1";
    const picks = answer.split(/[\s,]+/).filter(Boolean).map(Number);
    if (picks.length && picks.every((n) => Number.isInteger(n) && n >= 1 && n <= TOOL_IDS.length)) {
      console.log();
      return [...new Set(picks.map((n) => TOOL_IDS[n - 1]))];
    }
    console.log(`  Type numbers from 1 to ${TOOL_IDS.length}, separated by commas.`);
  }
}

const shown = (path) => (path.startsWith(process.cwd()) ? `./${relative(process.cwd(), path)}` : path.replace(home, "~"));

/** The folders to install into, each with the agents that read it. */
function destinations(ids, global) {
  const byPath = new Map();
  for (const id of ids) {
    const path = global ? TOOLS[id].global : resolve(TOOLS[id].project);
    byPath.set(path, [...(byPath.get(path) ?? []), TOOLS[id].title]);
  }
  // More than two readers only happens on an update sweep of the shared
  // .agents/skills folder, where naming all six says less than naming the folder.
  return [...byPath].map(([path, readers]) => ({
    path,
    label: readers.length > 2 ? `Every agent that reads ${shown(path)}` : readers.join(", "),
  }));
}

const installedAt = (path) => existsSync(join(path, NAME, "SKILL.md"));
const supersededAt = (path) => SUPERSEDED.filter((s) => existsSync(join(path, s)));

function copyTo(path) {
  const target = join(path, NAME);
  mkdirSync(path, { recursive: true });
  rmSync(target, { recursive: true, force: true });
  cpSync(SOURCE, target, { recursive: true });
}

async function retire(path) {
  const old = supersededAt(path);
  if (old.length === 0) return;
  console.log(`  Found interface-skills here, which Keyline replaces: ${old.join(", ")}.`);
  const links = old.filter((s) => lstatSync(join(path, s)).isSymbolicLink());
  if (links.length) console.log(`  (${links.join(", ")} ${links.length === 1 ? "is a link" : "are links"}; removing ${links.length === 1 ? "it" : "them"} leaves the target alone.)`);
  if (!interactive) {
    console.log("  Left in place — remove them by hand, or rerun in a terminal, so they don't compete with Keyline.");
    return;
  }
  const answer = ((await prompt("  Remove them? [Y/n]: ")) || "y").toLowerCase();
  if (!answer.startsWith("y")) return;
  for (const s of old) rmSync(join(path, s), { recursive: true, force: true });
  console.log(`  ✓ removed ${old.length}`);
}

if (!existsSync(join(SOURCE, "SKILL.md"))) die("the package is missing its SKILL.md — reinstall it");

/* ── update ─────────────────────────────────────────────────────────────── */

if (command === "update") {
  // Every place Keyline is already installed — in this project and on this machine.
  const scopes = dir ? [{ path: dir, label: shown(dir) }] : [...destinations(TOOL_IDS, false), ...destinations(TOOL_IDS, true)];
  const found = scopes.filter((d) => installedAt(d.path));
  if (found.length === 0) {
    console.log("Keyline isn't installed here or for this user — run `npx trykeyline install`.");
    process.exit(0);
  }
  for (const d of found) {
    copyTo(d.path);
    console.log(`✓ ${d.label} → ${shown(join(d.path, NAME))}`);
  }
  console.log(`\nKeyline ${version}, ${found.length} ${found.length === 1 ? "copy" : "copies"} updated.`);
  process.exit(0);
}

/* ── install ────────────────────────────────────────────────────────────── */

const dests = dir ? [{ path: dir, label: shown(dir) }] : destinations(tools.length ? tools : await askTools(), user);
let installed = 0;

for (const d of dests) {
  console.log(`${d.label} → ${shown(join(d.path, NAME))}`);
  if (installedAt(d.path) && !force) {
    console.log("  · already installed — `npx trykeyline update` refreshes it, --force overwrites it");
  } else {
    copyTo(d.path);
    console.log(`  ✓ keyline ${version}`);
    installed++;
  }
  await retire(d.path);
  console.log();
}

if (installed > 0) {
  console.log("Next, in your agent:");
  console.log("  /keyline init       scan this project and write DESIGN.md");
  console.log("  /keyline audit      then a designer's read of any screen, or of the whole product");
}
