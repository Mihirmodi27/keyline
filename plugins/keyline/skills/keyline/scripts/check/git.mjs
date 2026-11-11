/**
 * Which files git names, for `keyline check --changed <base>` and `--staged`.
 *
 * Changed: the files a pull request touches, plus anything edited and not yet
 * committed. Staged: what the next commit holds (a pre-commit hook).
 *
 * The comparison starts from the merge base of <base> and HEAD, so commits
 * that landed on the base after the branch was cut don't count. A shallow CI
 * checkout often has no merge base; there it compares with <base> itself,
 * which on a pull request's merge commit is exactly the PR's changes.
 */
import { execFileSync } from "node:child_process";
import { realpathSync } from "node:fs";
import { relative, resolve, sep } from "node:path";

/** git reports real paths; a root reached through a symlink (macOS's /var → /private/var) must be compared as one too. */
const real = (p) => {
  try {
    return realpathSync(resolve(p));
  } catch {
    return resolve(p);
  }
};

function git(cwd, ...args) {
  return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024 });
}

/** The repository's top folder and the path from it to `root` ("" at the top), or null outside git. */
export function repoOf(root) {
  try {
    const top = git(root, "rev-parse", "--show-toplevel").trim();
    const prefix = relative(top, real(root)).split(sep).join("/");
    return { top, prefix: prefix ? `${prefix}/` : "" };
  } catch {
    return null;
  }
}

const list = (out) => out.split("\0").filter(Boolean);

/** Paths git gave (relative to the repository's top) as paths relative to `root`, minus those outside it. */
function within(root, repo, paths) {
  return [...new Set(paths)]
    .map((p) => relative(real(root), resolve(repo.top, p)).split(sep).join("/"))
    .filter((p) => p && !p.startsWith("../"))
    .sort();
}

/**
 * Files added, copied, modified or renamed since `base`, and untracked files,
 * relative to `root`. Files outside `root` are left out. Throws with a
 * sentence a person can act on when `root` isn't in git or `base` isn't a
 * commit; the second carries `code: "ENOCOMMIT"`, so a caller can treat the
 * word as something else.
 */
export function changedFiles(root, base) {
  const repo = repoOf(root);
  if (!repo) throw new Error(`${root} isn't inside a git repository, so there's nothing to compare with ${base}`);
  try {
    git(root, "rev-parse", "--verify", "--quiet", `${base}^{commit}`);
  } catch {
    const err = new Error(`no commit called ${base}. In CI, fetch it first: actions/checkout with fetch-depth: 0, or git fetch origin <branch>`);
    err.code = "ENOCOMMIT";
    throw err;
  }
  let from;
  let mergeBase = true;
  try {
    from = git(root, "merge-base", base, "HEAD").trim();
  } catch {
    from = base;
    mergeBase = false;
  }
  // `git diff <commit>` is that commit against the working tree: committed, staged and unstaged changes alike.
  const changed = list(git(repo.top, "diff", "--name-only", "--diff-filter=ACMR", "--no-renames", "-z", from, "--"));
  const untracked = list(git(repo.top, "ls-files", "--others", "--exclude-standard", "-z"));
  return { base, from, mergeBase, files: within(root, repo, [...changed, ...untracked]), prefix: repo.prefix };
}

/**
 * Files staged for the next commit (added, copied, modified or renamed),
 * relative to `root`. The detector reads files on disk, so a file staged in
 * part is checked as it is in the working tree. Throws when `root` isn't in git.
 */
export function stagedFiles(root) {
  const repo = repoOf(root);
  if (!repo) throw new Error("--staged needs a git repository");
  const staged = list(git(repo.top, "diff", "--cached", "--name-only", "--diff-filter=ACMR", "--no-renames", "-z"));
  return { files: within(root, repo, staged), prefix: repo.prefix };
}
