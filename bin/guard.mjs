/**
 * `npx trykeyline guard` — wire the live guard into a project that doesn't use the
 * Claude Code plugin (which carries its own hook).
 *
 *   npx trykeyline guard --install                 Claude Code: a PostToolUse hook in .claude/settings.json
 *   npx trykeyline guard --install --tool codex    Codex: a PostToolUse hook in .codex/hooks.json
 *   npx trykeyline guard --pre-commit              any agent: a git pre-commit hook on staged UI files
 *   …the same with --uninstall                  takes it out again
 *   npx trykeyline guard --staged                  what the pre-commit hook runs
 *
 * The hooks call the guard script inside an installed copy of the skill, so the
 * guard is the same version as the skill the agent reads. If the skill isn't
 * installed for that agent yet, --install copies it into the project first.
 */
import { chmodSync, cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { homedir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SOURCE = fileURLToPath(new URL("../plugins/keyline/skills/keyline/", import.meta.url));
const GUARD = "scripts/guard.mjs";
const BEGIN = "# >>> keyline guard";
const END = "# <<< keyline guard";

export const GUARD_USAGE = `keyline guard — check each UI file as the agent writes it.

  npx trykeyline guard --install [--tool claude-code|codex]
                       add a post-edit hook: every UI file the agent edits is
                       checked, and what's found goes straight back to it
  npx trykeyline guard --pre-commit
                       for any agent: a git pre-commit hook that checks the
                       staged UI files and stops the commit on errors
  npx trykeyline guard --uninstall [--tool …] [--pre-commit]
                       take the hook out again
  npx trykeyline guard --staged | --changed [base]
                       run the check the pre-commit hook runs

Off for a while: KEYLINE_GUARD=off. Off for a project: a \`| Guard | off |\` row
under ## Profile in DESIGN.md. Off for a file: a keyline-ignore-file comment.

The Claude Code plugin (/plugin install keyline@keyline) carries the hook
already; --install is for projects that installed the skill with npx.`;

const home = homedir();
const claudeHome = () => process.env.CLAUDE_CONFIG_DIR?.trim() || join(home, ".claude");
const codexHome = () => process.env.CODEX_HOME?.trim() || join(home, ".codex");

/**
 * Per agent: where its settings live, where its skill copy lives (project, then
 * user), and how its hook command finds that copy from wherever it runs.
 */
const AGENTS = {
  "claude-code": {
    title: "Claude Code",
    settings: (root) => join(root, ".claude", "settings.json"),
    projectSkill: ".claude/skills/keyline",
    userSkill: () => join(claudeHome(), "skills", "keyline"),
    // Claude Code sets CLAUDE_PROJECT_DIR for hooks; quoted, so a space in the path survives.
    command: (skill, root) => (skill.startsWith(root) ? `node "$CLAUDE_PROJECT_DIR/${relative(root, skill)}/${GUARD}"` : `node "${join(skill, GUARD)}"`),
    matcher: "Edit|Write|MultiEdit",
    event: "PostToolUse",
  },
  codex: {
    title: "Codex",
    settings: (root) => join(root, ".codex", "hooks.json"),
    projectSkill: ".agents/skills/keyline",
    userSkill: () => join(codexHome(), "skills", "keyline"),
    // Codex runs hooks from the session's folder and documents no project variable, so ask git.
    command: (skill, root) => (skill.startsWith(root) ? `node "$(git rev-parse --show-toplevel)/${relative(root, skill)}/${GUARD}"` : `node "${join(skill, GUARD)}"`),
    // apply_patch is Codex's file editor; its hook input says apply_patch whatever the matcher.
    matcher: "apply_patch|Edit|Write",
    event: "PostToolUse",
  },
};
const ALIASES = { claude: "claude-code" };

const isOurs = (command) => typeof command === "string" && /keyline/.test(command) && command.includes(GUARD);

function readJson(path) {
  if (!existsSync(path)) return {};
  const text = readFileSync(path, "utf8");
  if (!text.trim()) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${path} isn't valid JSON — fix it by hand, then run this again`);
  }
}

const writeJson = (path, value) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(value, null, 2) + "\n");
};

/** Remove our hook from a settings object; returns whether anything was removed. */
function strip(settings, event) {
  const groups = settings.hooks?.[event];
  if (!Array.isArray(groups)) return false;
  let removed = false;
  const kept = [];
  for (const g of groups) {
    const hooks = (g.hooks ?? []).filter((h) => {
      const ours = isOurs(h.command) || isOurs([h.command, ...(h.args ?? [])].join(" "));
      removed ||= ours;
      return !ours;
    });
    if (hooks.length) kept.push({ ...g, hooks });
  }
  if (kept.length) settings.hooks[event] = kept;
  else delete settings.hooks[event];
  if (Object.keys(settings.hooks).length === 0) delete settings.hooks;
  return removed;
}

/** Whether the Keyline plugin is switched on for Claude Code, which would run the guard twice. */
function pluginEnabled(root) {
  for (const path of [join(root, ".claude", "settings.json"), join(root, ".claude", "settings.local.json"), join(claudeHome(), "settings.json")]) {
    try {
      const enabled = readJson(path).enabledPlugins ?? {};
      if (Object.entries(enabled).some(([id, on]) => on && /^keyline@/.test(id))) return path;
    } catch {}
  }
  return null;
}

function installHook(id, root, { force, log }) {
  const a = AGENTS[id];
  if (id === "claude-code" && !force) {
    const where = pluginEnabled(root);
    if (where) {
      log(`The Keyline plugin is on (${where.replace(home, "~")}), and it runs the guard already. Nothing added; --force adds it anyway.`);
      return;
    }
  }
  let skill = [resolve(root, a.projectSkill), a.userSkill()].find((p) => existsSync(join(p, GUARD)));
  if (!skill) {
    skill = resolve(root, a.projectSkill);
    mkdirSync(dirname(skill), { recursive: true });
    rmSync(skill, { recursive: true, force: true });
    cpSync(SOURCE, skill, { recursive: true });
    log(`✓ installed the skill for ${a.title} → ./${relative(root, skill)} (the guard runs from it)`);
  }
  const path = a.settings(root);
  const settings = readJson(path);
  strip(settings, a.event);
  settings.hooks ??= {};
  settings.hooks[a.event] ??= [];
  settings.hooks[a.event].push({ matcher: a.matcher, hooks: [{ type: "command", command: a.command(skill, root), timeout: 10 }] });
  writeJson(path, settings);
  log(`✓ ${a.title}: guard added to ./${relative(root, path)}`);
  if (id === "codex") log("  Codex runs project hooks once you trust the project's .codex/ folder — it asks the first time.");
}

function uninstallHook(id, root, { log }) {
  const a = AGENTS[id];
  const path = a.settings(root);
  if (!existsSync(path)) return log(`· ${a.title}: no guard in ./${relative(root, path)}`);
  const settings = readJson(path);
  if (!strip(settings, a.event)) return log(`· ${a.title}: no guard in ./${relative(root, path)}`);
  if (Object.keys(settings).length === 0 && id === "codex") rmSync(path);
  else writeJson(path, settings);
  log(`✓ ${a.title}: guard removed from ./${relative(root, path)}`);
}

/* ── git pre-commit ─────────────────────────────────────────────────────── */

function hooksDir(root) {
  const r = spawnSync("git", ["rev-parse", "--git-path", "hooks"], { cwd: root, encoding: "utf8" });
  return r.status === 0 ? resolve(root, r.stdout.trim()) : null;
}

/**
 * The block the pre-commit hook runs. It looks for the skill where the
 * installer puts it, then in node_modules, then asks npx, so it keeps working
 * whichever way the project installed Keyline.
 */
export const PRE_COMMIT_BLOCK = `${BEGIN} — checks staged UI files; \`npx trykeyline guard --pre-commit --uninstall\` removes this
keyline_guard=
for keyline_dir in .claude/skills/keyline .agents/skills/keyline .windsurf/skills/keyline node_modules/trykeyline/plugins/keyline/skills/keyline; do
  if [ -f "$keyline_dir/${GUARD}" ]; then keyline_guard="$keyline_dir/${GUARD}"; break; fi
done
if [ -n "$keyline_guard" ]; then
  node "$keyline_guard" --staged || exit 1
else
  npx --yes trykeyline guard --staged || exit 1
fi
${END}`;

export function withoutBlock(text) {
  return text.replace(new RegExp(`\\n?${BEGIN}[\\s\\S]*?${END}\\n?`, "g"), "\n").replace(/\n{3,}/g, "\n\n");
}

function installPreCommit(root, { log }) {
  const dir = hooksDir(root);
  if (!dir) throw new Error("--pre-commit needs a git repository");
  const path = join(dir, "pre-commit");
  const existing = existsSync(path) ? readFileSync(path, "utf8") : "";
  const base = withoutBlock(existing).trimEnd() || "#!/bin/sh";
  if (existing && !existing.includes(BEGIN) && /^\s*exec\b/m.test(existing)) log("  Your pre-commit hook has an `exec` line, so a block after it never runs — move the Keyline block above it.");
  mkdirSync(dir, { recursive: true });
  writeFileSync(path, `${base}\n\n${PRE_COMMIT_BLOCK}\n`);
  chmodSync(path, 0o755);
  log(`✓ pre-commit: staged UI files are checked before each commit (${path.replace(root + "/", "./").replace(home, "~")})`);
}

function uninstallPreCommit(root, { log }) {
  const dir = hooksDir(root);
  const path = dir && join(dir, "pre-commit");
  if (!path || !existsSync(path) || !readFileSync(path, "utf8").includes(BEGIN)) return log("· pre-commit: no guard to remove");
  const rest = withoutBlock(readFileSync(path, "utf8")).trim();
  if (!rest || rest === "#!/bin/sh") rmSync(path);
  else writeFileSync(path, rest + "\n");
  log("✓ pre-commit: guard removed");
}

/* ── The command ────────────────────────────────────────────────────────── */

export async function guardCommand(argv, { cwd = process.cwd(), log = console.log } = {}) {
  const opts = { install: false, uninstall: false, preCommit: false, force: false, tools: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--staged" || a === "--changed") {
      const { main } = await import(new URL(`../plugins/keyline/skills/keyline/${GUARD}`, import.meta.url));
      return main(argv.slice(i));
    }
    if (a === "--install") opts.install = true;
    else if (a === "--uninstall") opts.uninstall = true;
    else if (a === "--pre-commit") opts.preCommit = true;
    else if (a === "-f" || a === "--force") opts.force = true;
    else if (["-t", "--tool", "--agent"].includes(a) || a.startsWith("--tool=") || a.startsWith("--agent=")) {
      const v = a.includes("=") ? a.slice(a.indexOf("=") + 1) : argv[++i];
      for (const name of (v ?? "").split(",").map((s) => s.trim()).filter(Boolean)) {
        const id = ALIASES[name] ?? name;
        if (!AGENTS[id]) {
          console.error(`keyline guard: no post-edit hook for '${name}' — the guard hooks into ${Object.keys(AGENTS).join(" and ")}; for any other agent use --pre-commit`);
          return 2;
        }
        opts.tools.push(id);
      }
    } else if (a === "-h" || a === "--help") {
      log(GUARD_USAGE);
      return 0;
    } else {
      console.error(`keyline guard: unknown option ${a} (try --help)`);
      return 2;
    }
  }
  if (!opts.install && !opts.uninstall && !opts.preCommit) {
    log(GUARD_USAGE);
    return 0;
  }
  const root = resolve(cwd);
  try {
    if (opts.uninstall) {
      if (opts.preCommit) uninstallPreCommit(root, { log });
      // Uninstall with no --tool takes the guard out of every agent's settings.
      if (!opts.preCommit || opts.tools.length) for (const id of opts.tools.length ? opts.tools : Object.keys(AGENTS)) uninstallHook(id, root, { log });
      return 0;
    }
    if (opts.preCommit) installPreCommit(root, { log });
    if (opts.install) for (const id of opts.tools.length ? opts.tools : ["claude-code"]) installHook(id, root, { force: opts.force, log });
    return 0;
  } catch (e) {
    console.error(`keyline guard: ${e.message}`);
    return 1;
  }
}
