import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { check } from "../plugins/keyline/skills/keyline/scripts/check.mjs";
import { changedFiles } from "../plugins/keyline/skills/keyline/scripts/check/git.mjs";
import { annotation, annotations } from "../plugins/keyline/skills/keyline/scripts/check/github.mjs";
import { MARKER, comment, summary } from "../ci/github.mjs";

const CLI = fileURLToPath(new URL("../bin/keyline.mjs", import.meta.url));
const cli = (cwd, ...args) => spawnSync(process.execPath, [CLI, "check", ...args], { cwd, encoding: "utf8", env: { ...process.env, NO_COLOR: "1" } });
const ENV = { ...process.env, GIT_AUTHOR_NAME: "t", GIT_AUTHOR_EMAIL: "t@example.com", GIT_COMMITTER_NAME: "t", GIT_COMMITTER_EMAIL: "t@example.com" };
const git = (cwd, ...args) => execFileSync("git", args, { cwd, env: ENV, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

function write(root, files) {
  for (const [path, body] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), body);
  }
}

/** A repo with a main branch, a feature branch cut from it, and a commit on main after the cut. */
function repo() {
  const root = mkdtempSync(join(tmpdir(), "keyline-pr-"));
  git(root, "init", "-q", "-b", "main");
  write(root, {
    "web/a.css": ".a { color: var(--text); }\n",
    "web/b.css": ".b { color: var(--text); }\n",
    "web/gone.css": ".g { color: var(--text); }\n",
    "web/motion.css": ".m { transition: opacity 200ms; }\n@media (prefers-reduced-motion: reduce) { .m { transition: none; } }\n",
    "docs/x.css": ".x { color: var(--text); }\n",
  });
  git(root, "add", "-A");
  git(root, "commit", "-qm", "base");
  git(root, "checkout", "-qb", "feature");
  write(root, { "web/a.css": ".a { color: var(--text); z-index: 9999; }\n", "docs/x.css": ".x { z-index: 9999; }\n" });
  rmSync(join(root, "web/gone.css"));
  git(root, "add", "-A");
  git(root, "commit", "-qm", "feature work");
  // After the cut, main moves on: that change is not the branch's.
  git(root, "checkout", "-q", "main");
  write(root, { "web/b.css": ".b { z-index: 9999; }\n" });
  git(root, "commit", "-qam", "main moves");
  git(root, "checkout", "-q", "feature");
  // Uncommitted and untracked work counts too.
  write(root, { "web/new.css": ".n { transition: all 200ms; }\n", "web/notes.txt": "not checked\n" });
  return root;
}

test("--changed picks the branch's files since the merge base, plus uncommitted and untracked ones", () => {
  const root = repo();
  const all = changedFiles(root, "main");
  assert.equal(all.mergeBase, true);
  assert.deepEqual(all.files, ["docs/x.css", "web/a.css", "web/new.css", "web/notes.txt"], "b.css moved on main, gone.css was deleted");
  const web = changedFiles(join(root, "web"), "main");
  assert.deepEqual(web.files, ["a.css", "new.css", "notes.txt"], "relative to the root, nothing outside it");
  assert.equal(web.prefix, "web/");
  assert.throws(() => changedFiles(root, "no-such-branch"), /no commit called no-such-branch/);
  assert.throws(() => changedFiles(mkdtempSync(join(tmpdir(), "keyline-nogit-")), "main"), /isn't inside a git repository/);
});

test("check --changed reports only changed files, but still reads the whole project", () => {
  const root = repo();
  const r = check({ root: join(root, "web"), only: new Set(changedFiles(join(root, "web"), "main").files) });
  assert.deepEqual([...new Set(r.findings.map((f) => f.file))].sort(), ["a.css", "new.css"]);
  assert.equal(r.files, 2, "two changed files the detector reads");
  assert.ok(!r.findings.some((f) => f.rule === "motion/reduced-motion"), "the reduced-motion branch in an unchanged file still counts");

  const out = cli(join(root, "web"), "--changed", "main");
  assert.match(out.stdout, /2 changed files since main/);
  assert.doesNotMatch(out.stdout, /b\.css/);
  assert.equal(cli(join(root, "web"), "--changed", "nope").status, 2);
  assert.notEqual(cli(join(root, "web"), "--changed").status, 2, "a bare --changed compares with HEAD, as the guard uses it");
  assert.equal(cli(join(root, "web"), "--changed", "main", "--baseline", "save").status, 2, "a baseline is the whole project");
});

test("--changed with a baseline: only new findings, and nothing outside the change counts as fixed", () => {
  const root = repo();
  const web = join(root, "web");
  git(root, "stash", "-q", "-u");
  assert.equal(cli(web, "--baseline", "save").status, 0);
  git(root, "stash", "pop", "-q");
  const json = JSON.parse(cli(web, "--changed", "main", "--baseline", "--json").stdout);
  // The baseline holds the committed branch (a.css's z-index); the untracked file's finding is the new one.
  assert.deepEqual(json.findings.map((f) => [f.file, f.rule, f.change]), [["a.css", "layout/z-index", "still"], ["new.css", "motion/transition-all", "new"]]);
  assert.deepEqual(json.fixed, []);
  assert.deepEqual(json.changed, { base: "main", from: json.changed.from, mergeBase: true, files: 2 });
});

test("annotations: workflow commands with escaping, levels, the repo path, errors first", () => {
  const f = { rule: "color/raw-color", law: "color law 1", severity: "warning", file: "src/a,b.css", line: 7, message: "100% wrong:\nreally" };
  assert.equal(annotation(f, { prefix: "web/" }), "::warning file=web/src/a%2Cb.css,line=7,title=Keyline%3A color/raw-color::100%25 wrong:%0Areally (color law 1)");
  assert.match(annotation({ ...f, severity: "info" }), /^::notice /);
  assert.match(annotation({ ...f, severity: "error" }), /^::error /);
  const list = annotations([
    { ...f, severity: "info", line: 1 },
    { ...f, severity: "error", line: 9 },
    { ...f, severity: "warning", line: 3 },
  ]);
  assert.deepEqual(list.map((l) => l.split(" ")[0]), ["::error", "::warning", "::notice"]);
  assert.equal(annotations([{ ...f, change: "still" }, { ...f, change: "new", line: 8 }]).length, 1, "against a baseline, only new findings");
});

test("--format github prints annotations and one closing line, with paths from the repository's top", () => {
  const root = repo();
  const out = cli(join(root, "web"), "--changed", "main", "--format", "github");
  const lines = out.stdout.trim().split("\n");
  assert.ok(lines.slice(0, -1).every((l) => /^::(error|warning|notice) file=web\/[\w.]+\.css,line=\d+,title=Keyline%3A [a-z]+\/[a-z-]+::/.test(l)), out.stdout);
  assert.match(lines.at(-1), /^Keyline: \d+ errors?, \d+ warnings?, \d+ info in 2 changed files since main\.$/);
  assert.equal(cli(root, "--format", "xml").status, 2);
});

test("the summary and the comment: one marked comment, edited in place, none for a clean run", () => {
  const report = {
    files: 2,
    summary: { error: 1, warning: 0, info: 0, new: { error: 1, warning: 0, info: 0 } },
    findings: [{ rule: "color/focus-removed", severity: "error", file: "a.css", line: 3, message: "Outline | removed", change: "new" }],
    baseline: { file: ".keyline/baseline.json", new: 1, still: 4, fixed: 1 },
    fixed: [{ rule: "layout/z-index", file: "b.css", line: 2 }],
    changed: { base: "origin/main", files: 2 },
    prefix: "web/",
  };
  const md = summary(report, { repo: "o/r", sha: "abc" });
  assert.ok(md.startsWith(MARKER));
  assert.match(md, /\*\*1 new error\*\*/);
  assert.match(md, /\[web\/a\.css:3\]\(https:\/\/github\.com\/o\/r\/blob\/abc\/web\/a\.css#L3\)/);
  assert.match(md, /Outline \\\| removed/, "pipes don't break the table");
  assert.match(md, /Fixed since the baseline \(1\)/);

  const calls = [];
  const fake = (existing) => (args) => {
    calls.push(args.slice(0, 3).join(" "));
    return args.includes("--jq") ? existing : "";
  };
  const quiet = { log: () => {} };
  assert.ok(comment(report, { repo: "o/r", pr: 5, run: fake(""), ...quiet }).created);
  assert.equal(comment(report, { repo: "o/r", pr: 5, run: fake("42\n"), ...quiet }).updated, "42");
  assert.deepEqual(calls.filter((c) => c.includes("-X")), ["api -X POST", "api -X PATCH"]);
  const clean = { ...report, findings: [], summary: { error: 0, warning: 0, info: 0, new: { error: 0, warning: 0, info: 0 } } };
  assert.equal(comment(clean, { repo: "o/r", pr: 5, run: fake(""), ...quiet }), null, "nothing to say, nothing posted");
  assert.ok(comment(clean, { repo: "o/r", pr: 5, run: fake("42"), ...quiet }).updated, "but an earlier comment is brought up to date");
});
