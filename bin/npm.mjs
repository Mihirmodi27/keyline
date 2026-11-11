/**
 * Run npm or npx, on every platform. On Windows they are `.cmd` scripts, and
 * Node (since 18.20 and 20.12) refuses to spawn a `.cmd` without a shell; with
 * one, Node joins the arguments with spaces and quotes nothing, so each is
 * quoted here the way a Windows program reads its command line. Shared with
 * trykeyline-browser as `trykeyline/npm`.
 */
import { spawnSync } from "node:child_process";

const windows = process.platform === "win32";

/** One argument, quoted for cmd.exe and the C runtime's parser when it needs it. */
export function quoteForCmd(arg) {
  const s = String(arg);
  if (/^[\w./:=@,+-]+$/.test(s)) return s;
  return `"${s.replace(/(\\*)"/g, '$1$1\\"').replace(/(\\+)$/, "$1$1")}"`;
}

/** spawnSync for `npm` or `npx`. Same options and result as spawnSync. */
export function runNpm(tool, args, options = {}) {
  return windows ? spawnSync(tool, args.map(quoteForCmd), { ...options, shell: true }) : spawnSync(tool, args, options);
}
