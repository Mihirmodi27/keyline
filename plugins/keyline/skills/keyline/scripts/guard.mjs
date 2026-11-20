#!/usr/bin/env node
/**
 * Keyline's live guard: the detector, run on each file an agent edits, with
 * what it finds handed straight back to the agent so slop is fixed while the
 * file is still open instead of found by an audit later.
 *
 *   node guard.mjs             a post-edit hook: reads the hook's JSON on stdin
 *   node guard.mjs --staged    a pre-commit hook: checks staged UI files, exit 1 on errors
 *
 * As a hook it reads the edited file's path from the payload (Claude Code's
 * PostToolUse, and Codex's, whose apply_patch carries paths inside the patch),
 * checks that one file against the project's DESIGN.md, and prints errors and
 * warnings as `hookSpecificOutput.additionalContext`, which the model reads
 * beside the tool result. A clean file, a file that isn't UI, or anything that
 * goes wrong prints nothing: the guard never blocks an edit.
 *
 * Off: KEYLINE_GUARD=off in the environment, `| Guard | off |` under ## Profile
 * in DESIGN.md, or `keyline-ignore-file` in the file itself.
 */
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { check, run } from "./check.mjs";
import { readDesign } from "./check/design.mjs";
import { isInterfaceFile } from "./check/files.mjs";

const CHECK = fileURLToPath(new URL("./check.mjs", import.meta.url));
const MAX_SHOWN = 8;
// Script files are UI only when they hold markup or styles; a plain .ts module isn't worth a check.
const SCRIPT = /\.(ts|js|mjs)$/;
const LOOKS_LIKE_UI = /<[A-Za-z][\w.-]*[\s>/]|className|class:|style=|styled[.(]|\bcss`|\bkeyframes`|\btw`|\b(cn|clsx|cva|tv|twMerge)\(|@keyframes|transition\s*:|backdrop-filter/;

export const guardOff = (env = process.env) => /^(off|0|false|no|disabled?)$/i.test(String(env.KEYLINE_GUARD ?? "").trim());

/**
 * The edited files a hook payload names. Claude Code (and Codex for its own
 * tools) put one path in tool_input.file_path; Codex's apply_patch puts a patch
 * in tool_input.command whose `*** Add File:` and `*** Update File:` lines name
 * the files; Cursor's afterFileEdit puts it at the top level.
 */
export function editedFiles(payload) {
  const input = payload?.tool_input ?? {};
  const out = [];
  for (const p of [input.file_path, input.path, input.notebook_path, payload?.tool_response?.filePath, payload?.file_path]) {
    if (typeof p === "string" && p) {
      out.push(p);
      break;
    }
  }
  const patch = typeof input.command === "string" ? input.command : typeof input.patch === "string" ? input.patch : typeof input.input === "string" ? input.input : null;
  if (patch && /\*\*\* Begin Patch/.test(patch)) {
    for (const m of patch.matchAll(/^\*\*\* (?:Add|Update) File: (.+)$|^\*\*\* Move to: (.+)$/gm)) out.push((m[1] ?? m[2]).trim());
  }
  return [...new Set(out)];
}

/**
 * The project a file belongs to: the nearest folder above it holding DESIGN.md,
 * no higher than the project the agent was started in. Without one, that
 * project. A file outside the project has no root, and isn't checked.
 */
export function projectRoot(file, base) {
  const top = resolve(base);
  if (relative(top, file).startsWith("..") || isAbsolute(relative(top, file))) return null;
  for (let dir = dirname(file); ; dir = dirname(dir)) {
    if (readDesign(dir).found) return dir;
    if (dir === top || dirname(dir) === dir) return top;
  }
}

/** Check one edited file. Returns null when there's nothing to say. */
export function guardFile(file, { base = process.cwd(), env = process.env } = {}) {
  if (guardOff(env)) return null;
  // Compare real paths: the project and the edited file may be named through different symlinks.
  const real = (p) => {
    try {
      return realpathSync(p);
    } catch {
      return p;
    }
  };
  const abs = real(resolve(base, file));
  const root = projectRoot(abs, real(base));
  if (!root) return null;
  const rel = relative(root, abs).split(sep).join("/");
  if (!isInterfaceFile(rel) || !existsSync(abs)) return null;
  if (SCRIPT.test(rel)) {
    let text;
    try {
      text = readFileSync(abs, "utf8");
    } catch {
      return null;
    }
    if (!LOOKS_LIKE_UI.test(text)) return null;
  }
  let result;
  try {
    result = check({ root, only: [rel] });
  } catch (err) {
    // A broken .keyline/decisions.json is for `keyline check` to report; the guard stays quiet.
    if (err.code === "EDECISIONS") return null;
    throw err;
  }
  if (!result.design.guard) return null;
  // Info stays out, except where the fix is a name the project already has — a token, a component — and now is when it's cheap.
  const findings = result.findings.filter((f) => f.severity !== "info" || f.tokens?.length || f.use);
  if (findings.length === 0) return null;
  return { root, rel, design: result.design, findings };
}

/** The message the agent reads: short, worst first, each finding with its line, rule, law and fix. */
export function format({ root, rel, design, findings }) {
  const order = { error: 0, warning: 1, info: 2 };
  const sorted = [...findings].sort((a, b) => order[a.severity] - order[b.severity] || a.line - b.line);
  const n = (sev) => findings.filter((f) => f.severity === sev).length;
  const counts = [
    n("error") && `${n("error")} error${n("error") === 1 ? "" : "s"}`,
    n("warning") && `${n("warning")} warning${n("warning") === 1 ? "" : "s"}`,
    n("info") && `${n("info")} already in the system (a token or a component)`,
  ]
    .filter(Boolean)
    .join(", ");
  // The preset the file is judged by: its area's, when DESIGN.md puts it in one.
  const area = design.areaFor?.(rel);
  const system = !design.found ? "no DESIGN.md, so default verdicts" : area ? `area ${area.pattern}, preset ${area.preset}, from ${design.file}` : `preset ${design.preset ?? "not set"}, from ${design.file}`;
  const lines = [`Keyline guard: ${counts} in ${rel} (${system}). Fix these now, in the project's own tokens, before moving on. If one is a deliberate exception, put \`keyline-ignore <rule>: <reason>\` in a comment on that line instead. Only the user records a lasting decision (\`npx trykeyline keep\`); findings already kept by one aren't listed here.`];
  for (const f of sorted.slice(0, MAX_SHOWN)) lines.push(`- ${rel}:${f.line} ${f.severity} ${f.rule} (${f.law}): ${f.message}`);
  if (sorted.length > MAX_SHOWN) lines.push(`- …and ${sorted.length - MAX_SHOWN} more: node "${CHECK}" "${rel}" --root "${root}"`);
  return lines.join("\n");
}

/** The hook's stdout for a payload, or "" for silence. */
export function respond(payload, { env = process.env, cwd = process.cwd() } = {}) {
  if (guardOff(env)) return "";
  const base = env.CLAUDE_PROJECT_DIR || payload?.cwd || cwd;
  const messages = [];
  for (const file of editedFiles(payload)) {
    const r = guardFile(file, { base, env });
    if (r) messages.push(format(r));
  }
  if (messages.length === 0) return "";
  return JSON.stringify({ hookSpecificOutput: { hookEventName: payload?.hook_event_name || "PostToolUse", additionalContext: messages.join("\n\n").slice(0, 9500) } });
}

async function readStdin() {
  if (process.stdin.isTTY) return "";
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  return Buffer.concat(chunks).toString("utf8");
}

export async function main(argv) {
  if (argv[0] === "--staged" || argv[0] === "--changed") {
    // The pre-commit path: the same off switches, then the detector on git's files.
    const rootArg = argv.indexOf("--root");
    const root = rootArg >= 0 ? argv[rootArg + 1] : ".";
    if (guardOff() || !readDesign(resolve(root)).guard) return 0;
    return run(argv);
  }
  if (argv[0] === "-h" || argv[0] === "--help") {
    console.log("keyline guard — run as a post-edit hook (hook JSON on stdin), or with --staged as a pre-commit hook.");
    return 0;
  }
  try {
    const raw = await readStdin();
    if (!raw.trim()) return 0;
    const out = respond(JSON.parse(raw));
    if (out) process.stdout.write(out + "\n");
  } catch (e) {
    // Never break the agent's edit: say what went wrong where a person debugging hooks will look.
    if (process.env.KEYLINE_DEBUG) console.error(`keyline guard: ${e?.stack ?? e}`);
  }
  return 0;
}

// Run as a script — also through a symlink (node_modules/.bin, /tmp on macOS), where argv names the link.
const invoked = (() => {
  try {
    return process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
})();
if (invoked) {
  process.exitCode = await main(process.argv.slice(2));
}
