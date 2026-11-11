import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { check } from "../plugins/keyline/skills/keyline/scripts/check.mjs";
import { changedFiles, stagedFiles } from "../plugins/keyline/skills/keyline/scripts/check/git.mjs";
import { RULES } from "../plugins/keyline/skills/keyline/scripts/check/rules.mjs";
import { editedFiles } from "../plugins/keyline/skills/keyline/scripts/guard.mjs";

const fixture = (name) => fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url));
const GUARD = fileURLToPath(new URL("../plugins/keyline/skills/keyline/scripts/guard.mjs", import.meta.url));
const CLI = fileURLToPath(new URL("../bin/keyline.mjs", import.meta.url));
const HOOKS = fileURLToPath(new URL("../plugins/keyline/hooks/hooks.json", import.meta.url));

// Tests never read this machine's Claude Code or Codex settings.
const isolated = () => {
  const home = mkdtempSync(join(tmpdir(), "keyline-home-"));
  return { ...process.env, KEYLINE_GUARD: "", CLAUDE_PROJECT_DIR: "", CLAUDE_CONFIG_DIR: join(home, ".claude"), CODEX_HOME: join(home, ".codex") };
};

/** Run the guard as Claude Code would: a PostToolUse payload on stdin. */
function hook(cwd, file, { env = {}, tool = "Edit" } = {}) {
  const payload = { session_id: "t", cwd, hook_event_name: "PostToolUse", tool_name: tool, tool_input: { file_path: join(cwd, file) }, tool_response: { filePath: join(cwd, file) } };
  return spawnSync(process.execPath, [GUARD], { input: JSON.stringify(payload), encoding: "utf8", env: { ...isolated(), ...env } });
}

function project(files) {
  const root = mkdtempSync(join(tmpdir(), "keyline-guard-"));
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text);
  }
  return root;
}

const sh = (cwd, ...args) => {
  const r = spawnSync("git", args, { cwd, encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  return r.stdout;
};
function repo(files) {
  const root = project(files);
  sh(root, "init", "-q", "-b", "main");
  sh(root, "config", "user.email", "t@example.com");
  sh(root, "config", "user.name", "t");
  sh(root, "config", "commit.gpgsign", "false");
  return root;
}

/* ── The hook ───────────────────────────────────────────────────────────── */

test("the plugin ships a PostToolUse hook on Edit, Write and MultiEdit that runs the guard", () => {
  const { hooks } = JSON.parse(readFileSync(HOOKS, "utf8"));
  const [group] = hooks.PostToolUse;
  assert.equal(group.matcher, "Edit|Write|MultiEdit");
  assert.equal(group.hooks[0].type, "command");
  assert.match(group.hooks[0].command, /^node "\$\{CLAUDE_PLUGIN_ROOT\}\/skills\/keyline\/scripts\/guard\.mjs"$/);
});

test("a sloppy edit comes back as additionalContext: worst first, at most eight, each with line, rule, law and fix", () => {
  const r = hook(fixture("sloppy"), "src/styles.css");
  assert.equal(r.status, 0);
  const out = JSON.parse(r.stdout);
  assert.equal(out.hookSpecificOutput.hookEventName, "PostToolUse");
  const text = out.hookSpecificOutput.additionalContext;
  assert.match(text, /^Keyline guard: \d+ errors?, \d+ warnings? in src\/styles\.css/);
  const items = text.split("\n").filter((l) => /^- src\/styles\.css:\d+ /.test(l));
  assert.equal(items.length, 8);
  for (const l of items) assert.match(l, /^- src\/styles\.css:\d+ (error|warning) [a-z]+\/[a-z-]+ \(.+?\): \S/);
  assert.ok(!/ info /.test(text), "info findings stay out of the agent's way");
  const sev = items.map((l) => l.split(" ")[2]);
  assert.deepEqual(sev, [...sev].sort(), "errors before warnings");
  assert.match(text, /\n- …and \d+ more: node ".*check\.mjs" "src\/styles\.css"/);
  assert.ok(text.length < 10_000, "inside Claude Code's additionalContext cap");
});

test("a clean edit, a file that isn't UI, and a plain script are silent", () => {
  assert.equal(hook(fixture("clean"), "src/App.tsx").stdout, "");
  assert.equal(hook(fixture("clean"), "src/tokens.css").stdout, "");
  assert.equal(hook(fixture("clean"), "package.json").stdout, "");
  const root = project({ "src/util.ts": "export const add = (a: number, b: number) => a + b; // color: #f00\n", "README.md": "# hi\n" });
  assert.equal(hook(root, "src/util.ts").stdout, "");
  assert.equal(hook(root, "README.md").stdout, "");
});

test("a .ts file that holds styles is checked", () => {
  const root = project({ "src/theme.ts": "export const card = css`\n  transition: all 200ms;\n`;\n" });
  assert.match(JSON.parse(hook(root, "src/theme.ts").stdout).hookSpecificOutput.additionalContext, /motion\/transition-all/);
});

test("files outside the project, in skipped folders, or missing are silent, and bad input never fails the edit", () => {
  const root = project({ "node_modules/x/a.css": ".a { transition: all 1s; }\n", "dist/a.css": ".a { transition: all 1s; }\n" });
  assert.equal(hook(root, "node_modules/x/a.css").stdout, "");
  assert.equal(hook(root, "dist/a.css").stdout, "");
  assert.equal(hook(root, "gone.css").stdout, "");
  assert.equal(hook(root, "../elsewhere.css").stdout, "");
  const junk = spawnSync(process.execPath, [GUARD], { input: "not json", encoding: "utf8", env: isolated() });
  assert.equal(junk.status, 0);
  assert.equal(junk.stdout, "");
});

test("project-wide signals are read from the whole project, not just the edited file", () => {
  const files = { "src/a.css": ".a { transition: opacity 200ms; }\n.b:focus { outline: none; }\n" };
  const lonely = project(files);
  const found = JSON.parse(hook(lonely, "src/a.css").stdout).hookSpecificOutput.additionalContext;
  assert.match(found, /error motion\/reduced-motion/);
  assert.match(found, /error color\/focus-removed/);

  const guarded = project({ ...files, "src/base.css": "@media (prefers-reduced-motion: reduce) { .a { transition: opacity 100ms; } }\n:focus-visible { outline: 2px solid; }\n" });
  const text = JSON.parse(hook(guarded, "src/a.css").stdout).hookSpecificOutput.additionalContext;
  assert.ok(!/reduced-motion/.test(text), "reduced motion is handled in another file");
  assert.match(text, /warning color\/focus-removed/, "with focus-visible elsewhere, a removed :focus outline is a warning, not an error");
});

test("the nearest DESIGN.md above the file sets the verdicts", () => {
  const root = project({ "apps/web/DESIGN.md": "## Profile\n\n| | |\n|---|---|\n| Preset | `product` |\n", "apps/web/src/a.css": ".a { text-transform: uppercase; }\n" });
  const text = JSON.parse(hook(root, "apps/web/src/a.css").stdout).hookSpecificOutput.additionalContext;
  assert.match(text, /preset product, from DESIGN\.md/);
  assert.match(text, /src\/a\.css:1 warning type\/uppercase/);
});

test("Codex's apply_patch names its files inside the patch", () => {
  const patch = "*** Begin Patch\n*** Update File: src/a.css\n@@\n-a\n+b\n*** Add File: src/b.tsx\n+x\n*** Delete File: src/c.css\n*** End Patch\n";
  assert.deepEqual(editedFiles({ tool_name: "apply_patch", tool_input: { command: patch } }), ["src/a.css", "src/b.tsx"]);
  assert.deepEqual(editedFiles({ tool_input: { file_path: "/x/a.css" } }), ["/x/a.css"]);
  assert.deepEqual(editedFiles({ file_path: "/x/a.css", edits: [] }), ["/x/a.css"], "Cursor's afterFileEdit shape");
  const root = project({ "src/a.css": ".a { transition: all 1s; }\n" });
  const payload = { cwd: root, hook_event_name: "PostToolUse", tool_name: "apply_patch", tool_input: { command: "*** Begin Patch\n*** Update File: src/a.css\n*** End Patch" } };
  const r = spawnSync(process.execPath, [GUARD], { input: JSON.stringify(payload), encoding: "utf8", env: isolated() });
  assert.match(JSON.parse(r.stdout).hookSpecificOutput.additionalContext, /motion\/transition-all/);
});

/* ── Off switches ───────────────────────────────────────────────────────── */

test("KEYLINE_GUARD=off silences the guard", () => {
  for (const v of ["off", "0", "false"]) assert.equal(hook(fixture("sloppy"), "src/styles.css", { env: { KEYLINE_GUARD: v } }).stdout, "");
});

test("a Guard row in DESIGN.md turns it off for the project, and on when it says on", () => {
  const css = { "src/a.css": ".a { transition: all 1s; }\n" };
  const off = project({ ...css, "DESIGN.md": "# Design system\n\n## Profile\n\n| | |\n|---|---|\n| Preset | `product` |\n| Guard | off |\n" });
  assert.equal(hook(off, "src/a.css").stdout, "");
  const on = project({ ...css, "DESIGN.md": "## Profile\n\n| | |\n|---|---|\n| Preset | `product` |\n| Guard | on |\n" });
  assert.notEqual(hook(on, "src/a.css").stdout, "");
});

test("keyline-ignore-file silences one file", () => {
  const root = project({ "src/a.css": "/* keyline-ignore-file: vendored */\n.a { transition: all 1s; }\n" });
  assert.equal(hook(root, "src/a.css").stdout, "");
});

/* ── Files from git, and the pre-commit hook ────────────────────────────── */

test("--staged takes only staged UI files, and --changed adds unstaged and untracked ones", () => {
  const root = repo({ "src/ok.css": ".a { color: var(--ink); }\n", "src/old.css": ".a { color: var(--ink); }\n" });
  sh(root, "add", ".");
  sh(root, "commit", "-qm", "base");
  writeFileSync(join(root, "src/old.css"), ".a { transition: all 1s; }\n"); // changed, not staged
  writeFileSync(join(root, "src/new.css"), ".b { z-index: 9999; }\n");
  writeFileSync(join(root, "notes.md"), "# notes\n");
  writeFileSync(join(root, "src/loose.css"), ".c { height: 100vh; }\n"); // untracked
  sh(root, "add", "src/new.css", "notes.md");

  assert.deepEqual(stagedFiles(root).files, ["notes.md", "src/new.css"]);
  assert.deepEqual(changedFiles(root, "HEAD").files, ["notes.md", "src/loose.css", "src/new.css", "src/old.css"]);

  const staged = check({ root, only: stagedFiles(root).files });
  assert.equal(staged.files, 1, "notes.md isn't UI");
  assert.deepEqual([...new Set(staged.findings.map((f) => f.file))], ["src/new.css"]);

  const run = (...args) => spawnSync(process.execPath, [CLI, "check", ...args, "--json"], { cwd: root, encoding: "utf8", env: isolated() });
  const changed = JSON.parse(run("--changed").stdout);
  assert.deepEqual([...new Set(changed.findings.map((f) => f.file))].sort(), ["src/loose.css", "src/new.css", "src/old.css"]);
  const narrowed = JSON.parse(run("--changed", "HEAD", "src/old.css").stdout);
  assert.deepEqual([...new Set(narrowed.findings.map((f) => f.file))], ["src/old.css"], "a path after the base narrows the list");
  assert.equal(spawnSync(process.execPath, [CLI, "check", "--staged"], { cwd: tmpdir(), encoding: "utf8" }).status, 2, "outside git is a usage error");
});

test("the pre-commit hook stops a commit with errors in staged files, and the off switches let it through", () => {
  const root = repo({ "README.md": "# r\n" });
  sh(root, "add", ".");
  sh(root, "commit", "-qm", "base");
  // A hook that's already there keeps running; ours is added after it.
  const hooks = join(root, ".git", "hooks");
  mkdirSync(hooks, { recursive: true });
  writeFileSync(join(hooks, "pre-commit"), "#!/bin/sh\necho theirs\n");
  chmodSync(join(hooks, "pre-commit"), 0o755);
  const env = isolated();
  const guard = (...args) => spawnSync(process.execPath, [CLI, "guard", ...args], { cwd: root, encoding: "utf8", env });
  assert.equal(guard("--pre-commit").status, 0);
  // The hook looks for an installed skill; give it this checkout's.
  mkdirSync(join(root, "node_modules"), { recursive: true });
  spawnSync("ln", ["-s", fileURLToPath(new URL("..", import.meta.url)), join(root, "node_modules", "trykeyline")]);
  const text = readFileSync(join(hooks, "pre-commit"), "utf8");
  assert.match(text, /echo theirs[\s\S]*# >>> keyline guard/);

  writeFileSync(join(root, "a.css"), ".a { font-size: 4vw; }\n"); // an error
  sh(root, "add", "a.css");
  const blocked = spawnSync("git", ["commit", "-qm", "sloppy"], { cwd: root, encoding: "utf8", env });
  assert.notEqual(blocked.status, 0, "errors stop the commit");
  assert.match(blocked.stdout + blocked.stderr, /type\/viewport-font-size/);

  const through = spawnSync("git", ["commit", "-qm", "anyway"], { cwd: root, encoding: "utf8", env: { ...env, KEYLINE_GUARD: "off" } });
  assert.equal(through.status, 0, through.stderr);

  writeFileSync(join(root, "b.css"), ".b { font-size: 4vw; }\n");
  writeFileSync(join(root, "DESIGN.md"), "## Profile\n\n| | |\n|---|---|\n| Guard | off |\n");
  sh(root, "add", ".");
  assert.equal(spawnSync("git", ["commit", "-qm", "off"], { cwd: root, encoding: "utf8", env }).status, 0, "DESIGN.md switch");

  assert.equal(guard("--pre-commit", "--uninstall").status, 0);
  assert.equal(readFileSync(join(hooks, "pre-commit"), "utf8"), "#!/bin/sh\necho theirs\n", "their hook is left as it was");
});

/* ── Installing the agent hooks ─────────────────────────────────────────── */

test("guard --install adds the hook to .claude/settings.json beside what's there, once, and --uninstall takes only it out", () => {
  const theirs = { permissions: { allow: ["Bash(ls)"] }, hooks: { PostToolUse: [{ matcher: "Write", hooks: [{ type: "command", command: "prettier --write" }] }] } };
  const root = project({ ".claude/settings.json": JSON.stringify(theirs) });
  const env = isolated();
  const guard = (...args) => spawnSync(process.execPath, [CLI, "guard", ...args], { cwd: root, encoding: "utf8", env });

  const first = guard("--install");
  assert.equal(first.status, 0, first.stderr);
  assert.match(first.stdout, /installed the skill for Claude Code/);
  assert.ok(existsSync(join(root, ".claude/skills/keyline/scripts/guard.mjs")));
  guard("--install");
  const settings = JSON.parse(readFileSync(join(root, ".claude/settings.json"), "utf8"));
  assert.deepEqual(settings.permissions, theirs.permissions);
  const ours = settings.hooks.PostToolUse.filter((g) => /keyline/.test(g.hooks[0].command));
  assert.equal(ours.length, 1, "installing twice adds it once");
  assert.equal(ours[0].matcher, "Edit|Write|MultiEdit");
  assert.equal(ours[0].hooks[0].command, 'node "$CLAUDE_PROJECT_DIR/.claude/skills/keyline/scripts/guard.mjs"');

  // The installed command works as Claude Code would run it.
  writeFileSync(join(root, "a.css"), ".a { transition: all 1s; }\n");
  const payload = JSON.stringify({ cwd: root, hook_event_name: "PostToolUse", tool_name: "Write", tool_input: { file_path: join(root, "a.css") } });
  const ran = spawnSync("sh", ["-c", ours[0].hooks[0].command], { input: payload, encoding: "utf8", env: { ...env, CLAUDE_PROJECT_DIR: root } });
  assert.match(JSON.parse(ran.stdout).hookSpecificOutput.additionalContext, /motion\/transition-all/);

  assert.equal(guard("--uninstall").status, 0);
  assert.deepEqual(JSON.parse(readFileSync(join(root, ".claude/settings.json"), "utf8")), theirs);
});

test("guard --install skips Claude Code when the plugin already runs the guard", () => {
  const root = project({ ".claude/settings.json": JSON.stringify({ enabledPlugins: { "keyline@keyline": true } }) });
  const r = spawnSync(process.execPath, [CLI, "guard", "--install"], { cwd: root, encoding: "utf8", env: isolated() });
  assert.match(r.stdout, /plugin is on/);
  assert.equal(JSON.parse(readFileSync(join(root, ".claude/settings.json"), "utf8")).hooks, undefined);
});

test("guard --install --tool codex writes .codex/hooks.json; other agents are pointed at --pre-commit", () => {
  const root = project({});
  const env = isolated();
  const r = spawnSync(process.execPath, [CLI, "guard", "--install", "--tool", "codex"], { cwd: root, encoding: "utf8", env });
  assert.equal(r.status, 0, r.stderr);
  const { hooks } = JSON.parse(readFileSync(join(root, ".codex/hooks.json"), "utf8"));
  assert.equal(hooks.PostToolUse[0].matcher, "apply_patch|Edit|Write");
  assert.match(hooks.PostToolUse[0].hooks[0].command, /\.agents\/skills\/keyline\/scripts\/guard\.mjs/);
  assert.equal(spawnSync(process.execPath, [CLI, "guard", "--uninstall", "--tool", "codex"], { cwd: root, encoding: "utf8", env }).status, 0);
  assert.ok(!existsSync(join(root, ".codex/hooks.json")));

  const cursor = spawnSync(process.execPath, [CLI, "guard", "--install", "--tool", "cursor"], { cwd: root, encoding: "utf8", env });
  assert.equal(cursor.status, 2);
  assert.match(cursor.stderr, /--pre-commit/);
});

/* ── Keeping the guard honest ───────────────────────────────────────────── */

test("every rule that reads a project-wide signal says so, so a partial run confirms it", () => {
  for (const rule of RULES) {
    const reads = /facts\.project\b/.test(rule.check.toString());
    assert.equal(rule.signal === "project", reads, `${rule.id} ${reads ? "reads facts.project but has no" : "doesn't read facts.project but has"} signal: "project"`);
  }
});
