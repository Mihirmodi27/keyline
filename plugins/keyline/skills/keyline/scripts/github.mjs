#!/usr/bin/env node
/**
 * The detector in a pull request.
 *
 *   keyline check --changed origin/main --format github     annotations on the PR's lines
 *   node github.mjs summary keyline.json                    the run as Markdown, for $GITHUB_STEP_SUMMARY
 *   node github.mjs comment keyline.json [--pr N] [--repo owner/name]
 *                                                           post or update ONE summary comment on the PR
 *
 * Annotations are workflow commands printed to stdout (`::error file=…,line=…::…`):
 * GitHub draws them on the PR's diff with no token. It shows at most ten
 * errors and ten warnings per step, so they're printed errors first, and the
 * summary carries the rest.
 *
 * `comment` uses the `gh` CLI with GH_TOKEN (the workflow's GITHUB_TOKEN is
 * enough, with `pull-requests: write`). It finds its own earlier comment by a
 * hidden marker and edits it, so a PR never collects one comment per push.
 * keyline.json is `keyline check --json` output (or --json-file).
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const MARKER = "<!-- keyline-check -->";
const LEVEL = { error: "error", warning: "warning", info: "notice" };
const ORDER = { error: 0, warning: 1, info: 2 };

/** Workflow-command escaping: data loses newlines and %, properties also : and , */
const escData = (s) => String(s ?? "").replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
const escProp = (s) => escData(s).replace(/:/g, "%3A").replace(/,/g, "%2C");

/** One finding as a workflow command. `prefix` is the path from the repository's top to the checked root. */
export function annotation(f, { prefix = "" } = {}) {
  const props = [`file=${escProp(prefix + f.file)}`];
  if (f.line) props.push(`line=${f.line}`);
  props.push(`title=${escProp(`Keyline: ${f.rule}`)}`);
  return `::${LEVEL[f.severity] ?? "warning"} ${props.join(",")}::${escData(f.law ? `${f.message} (${f.law})` : f.message)}`;
}

/** The findings worth a line on the PR: against a baseline, only new ones. Errors first. */
export function toAnnotate(findings) {
  const list = findings.some((f) => f.change) ? findings.filter((f) => f.change === "new") : findings;
  return [...list].sort((a, b) => ORDER[a.severity] - ORDER[b.severity] || a.file.localeCompare(b.file) || a.line - b.line);
}

export function annotations(findings, opts) {
  return toAnnotate(findings).map((f) => annotation(f, opts));
}

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;
const escMd = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");

/**
 * The run as Markdown: the counts, then the findings that matter most. With
 * `repo` and `sha`, each location links to its line.
 */
export function summary(report, { repo = null, sha = null, server = "https://github.com", top = 10, prefix = report.prefix ?? "" } = {}) {
  const out = [MARKER, "### Keyline"];
  const against = report.baseline;
  const scope = report.changed ? ` in ${plural(report.changed.files, "changed file")} since \`${report.changed.base}\`` : ` in ${plural(report.files, "file")}`;
  const s = report.summary;
  if (against) {
    const n = s.new;
    out.push(`${n.error ? `**${plural(n.error, "new error")}**` : "No new errors"}, ${plural(n.warning, "new warning")}, ${n.info} new info${scope} · ${against.still} still · ${against.fixed} fixed, against \`${against.file}\`.`);
  } else {
    const total = s.error + s.warning + s.info;
    out.push(total ? `${s.error ? `**${plural(s.error, "error")}**` : "No errors"}, ${plural(s.warning, "warning")}, ${s.info} info${scope}.` : `Nothing the detector can see${scope}.`);
  }

  const shown = toAnnotate(report.findings);
  if (shown.length) {
    const link = (f) => {
      const path = `${prefix}${f.file}`;
      const text = `${path}${f.line ? `:${f.line}` : ""}`;
      return repo && sha ? `[${escMd(text)}](${server}/${repo}/blob/${sha}/${path.split("/").map(encodeURIComponent).join("/")}${f.line ? `#L${f.line}` : ""})` : `\`${escMd(text)}\``;
    };
    out.push("", "| | Rule | Where | |", "|---|---|---|---|");
    for (const f of shown.slice(0, top)) out.push(`| ${f.severity} | \`${f.rule}\` | ${link(f)} | ${escMd(f.message)} |`);
    if (shown.length > top) out.push("", `…and ${shown.length - top} more. Run \`npx trykeyline check${report.changed ? ` --changed ${report.changed.base}` : ""}${against ? " --baseline" : ""}\` to see them all.`);
  }
  if (against && report.fixed?.length) {
    out.push("", `<details><summary>Fixed since the baseline (${report.fixed.length})</summary>`, "");
    for (const f of report.fixed.slice(0, 50)) out.push(`- \`${f.rule}\` ${escMd(`${prefix}${f.file}:${f.line}`)}`);
    if (report.fixed.length > 50) out.push(`- …and ${report.fixed.length - 50} more`);
    out.push("", "</details>");
  }
  if (against && against.fixed && !against.new) out.push("", "Re-save the baseline (`npx trykeyline check --baseline save`) so fixed findings can't come back unnoticed.");
  return out.join("\n") + "\n";
}

/* ── The PR comment ─────────────────────────────────────────────────────── */

function gh(args, { input } = {}) {
  return execFileSync("gh", args, { encoding: "utf8", input, stdio: [input ? "pipe" : "ignore", "pipe", "inherit"] });
}

/** The PR number from the event that started the workflow, when there is one. */
export function prFromEvent(path = process.env.GITHUB_EVENT_PATH) {
  try {
    const event = JSON.parse(readFileSync(path, "utf8"));
    return event.pull_request?.number ?? (event.issue?.pull_request ? event.issue.number : null);
  } catch {
    return null;
  }
}

/**
 * Post the summary as the PR's Keyline comment, or edit the one already
 * there. A clean run with no earlier comment posts nothing.
 */
export function comment(report, { repo, pr, sha, run = gh, log = (m) => console.log(m) }) {
  const body = summary(report, { repo, sha });
  const ids = run(["api", `repos/${repo}/issues/${pr}/comments`, "--paginate", "--jq", `.[] | select(.body | contains("${MARKER}")) | .id`]).split("\n").filter(Boolean);
  const clean = report.baseline ? report.summary.new.error + report.summary.new.warning + report.summary.new.info === 0 : report.findings.length === 0;
  if (!ids.length && clean) {
    log("Nothing to report and no earlier comment: not commenting.");
    return null;
  }
  // The body goes through a file: gh reads `-F body=@file` verbatim, whatever the Markdown holds.
  const dir = mkdtempSync(join(tmpdir(), "keyline-comment-"));
  const file = join(dir, "body.md");
  writeFileSync(file, body);
  try {
    if (ids.length) {
      run(["api", "-X", "PATCH", `repos/${repo}/issues/comments/${ids[0]}`, "-F", `body=@${file}`, "--silent"]);
      log(`Updated the Keyline comment on #${pr}.`);
      return { updated: ids[0], body };
    }
    run(["api", "-X", "POST", `repos/${repo}/issues/${pr}/comments`, "-F", `body=@${file}`, "--silent"]);
    log(`Commented on #${pr}.`);
    return { created: true, body };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

export function main(argv) {
  const [cmd, file, ...rest] = argv;
  const opt = (name) => {
    const i = rest.indexOf(`--${name}`);
    return i >= 0 ? rest[i + 1] : null;
  };
  if (!cmd || !file || !["summary", "comment"].includes(cmd)) {
    console.error("usage: github.mjs summary <keyline.json>\n       github.mjs comment <keyline.json> [--pr N] [--repo owner/name] [--sha SHA]");
    return 2;
  }
  const report = JSON.parse(readFileSync(resolve(file), "utf8"));
  const repo = opt("repo") ?? process.env.GITHUB_REPOSITORY ?? null;
  const sha = opt("sha") ?? process.env.KEYLINE_SHA ?? process.env.GITHUB_SHA ?? null;
  if (cmd === "summary") {
    process.stdout.write(summary(report, { repo, sha }));
    return 0;
  }
  const pr = opt("pr") ?? prFromEvent();
  if (!repo || !pr) {
    console.error("comment needs a pull request: run it on a pull_request event, or pass --pr and --repo");
    return 2;
  }
  comment(report, { repo, pr, sha });
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    process.exitCode = main(process.argv.slice(2));
  } catch (err) {
    console.error(`keyline: ${String(err?.message ?? err).split("\n")[0]}`);
    process.exitCode = 1;
  }
}
