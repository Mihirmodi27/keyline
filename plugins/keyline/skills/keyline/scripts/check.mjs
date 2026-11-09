#!/usr/bin/env node
/**
 * Keyline's detector: the laws that can be checked from source text, with no
 * model and no API key.
 *
 *   node check.mjs [paths…]           human report; exit 1 on any error
 *   node check.mjs src --json         every finding, for CI or an agent
 *   node check.mjs --strict           warnings fail the run too
 *   node check.mjs --ignore src/content --rule motion/transition-all
 *   node check.mjs --baseline save    record today's findings in .keyline/baseline.json
 *   node check.mjs --baseline         report what's new, fixed and still since then
 *   node check.mjs --changed origin/main --format github
 *                                     only the files a branch changed, as PR annotations
 *   node check.mjs --staged           only what's staged (a pre-commit hook)
 *   node check.mjs --changed main     only what changed since main
 *
 * It reads DESIGN.md at the root for the preset and the motion and z-index
 * ladders, so a verdict follows the project's own decisions. Silence one line
 * with a `keyline-ignore` comment on it or up to two lines above (optionally
 * naming rules, then a reason: `keyline-ignore type/uppercase: a logo`), or a
 * whole file with
 * `keyline-ignore-file`.
 *
 * Exit codes: 0 clean (or only warnings and info), 1 findings that fail the
 * run, 2 a usage error. Against a baseline, only new findings fail it.
 */
import { existsSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { collect, isInterfaceFile } from "./check/files.mjs";
import { lineIndex, parseCss } from "./check/css.mjs";
import { readMarkup } from "./check/markup.mjs";
import { readDesign } from "./check/design.mjs";
import { DOMAINS, RULES } from "./check/rules.mjs";
import { BASELINE_FILE, compare, fingerprint, readBaseline, writeBaseline } from "./check/baseline.mjs";
import { changedFiles, repoOf } from "./check/git.mjs";
import { annotations } from "./github.mjs";

const USAGE = `keyline check — the interface laws that can be checked without a model.

  npx trykeyline check [paths…] [options]
  node <skill>/scripts/check.mjs [paths…] [options]   (the same, from an installed skill)

Options:
  --json              every finding as JSON (the same as --format json)
  --format <f>        human (default), json, or github: workflow annotations
                      that GitHub draws on a pull request's lines
  --json-file <path>  also write the JSON report here, whatever --format says
  --changed [ref]     only report on files changed since <ref> (its merge base
                      with HEAD; default HEAD), plus uncommitted and untracked ones
  --staged            only the files staged in git (for a pre-commit hook)
  --strict            fail on warnings as well as errors
  --quiet             errors only
  --all               don't cap repeated findings in the report
  --ignore <path>     leave out a path (repeatable), e.g. prose or fixtures
  --rule <id[,id…]>   run only these rules (repeatable)
  --root <dir>        the project: paths are read from here, and DESIGN.md and
                      package.json found here (default: .)
  --rules             list the rules and exit
  --baseline save     record today's findings in .keyline/baseline.json
  --baseline          compare against it: show what's new, fixed and still,
                      and fail only on new errors (new warnings with --strict)
  --baseline-file <f> a baseline somewhere else (default .keyline/baseline.json)
  -h, --help          this`;

const MOTION_IMPORT = /from\s+["'](?:motion(?:\/[\w-]+)?|framer-motion|gsap|@react-spring\/[\w-]+|react-spring|animejs)["']/;
const ROOT_LAYOUTS = [
  "app/layout.tsx", "app/layout.jsx", "app/layout.js", "src/app/layout.tsx", "src/app/layout.jsx", "src/app/layout.js",
  "pages/_document.tsx", "pages/_document.jsx", "src/pages/_document.tsx", "pages/_app.tsx", "src/pages/_app.tsx",
  "index.html", "src/index.html", "src/app.html", "src/layouts/Layout.astro", "app.vue", "src/App.vue",
];

/** Gather everything the rules look at, across every file. */
export function gather(root, files) {
  const facts = {
    decls: [], atRules: [], classLists: [], classes: [], labels: [], navs: [], zoomLocks: [], jsDurations: [],
    project: { focusVisible: false, focusWithin: false, backdropSupports: false, reducedTransparency: false, reducedMotion: false, animation: null, selfHostedFonts: null, lightningCss: false, rootLayout: null, skipLink: false },
    sources: new Map(),
  };
  const p = facts.project;
  const noteAnimation = (loc) => (p.animation ??= loc);

  for (const f of files) {
    let source;
    try {
      source = readFileSync(f.abs, "utf8");
    } catch {
      continue;
    }
    if (/keyline-ignore-file/.test(source)) continue;
    facts.sources.set(f.rel, source.split("\n"));
    const sheets = [];

    if (f.kind === "style") {
      sheets.push(parseCss(source));
    } else {
      const m = readMarkup(source, f.ext);
      sheets.push(...m.css);
      facts.decls.push(...m.inline.map((d) => ({ ...d, file: f.rel })));
      for (const list of m.classLists) {
        facts.classLists.push({ ...list, file: f.rel });
        for (const t of list.tokens) facts.classes.push({ ...t, file: f.rel });
      }
      facts.labels.push(...m.labels.map((l) => ({ ...l, file: f.rel })));
      facts.navs.push(...m.navs.map((n) => ({ ...n, file: f.rel })));
      const at = lineIndex(m.text);
      // A zoom lock lives in a viewport value: a <meta name="viewport"> tag, a string
      // that also sets width=device-width, or a viewport object's maximumScale /
      // userScalable. The phrase alone in prose or docs ("never maximum-scale=1") isn't one.
      const LOCK = /maximum-scale\s*=\s*1(?:\.0)?\b|user-scalable\s*=\s*(?:no|0)\b/g;
      const VIEWPORT_VALUE = /<meta\b[^>]*\bviewport\b[^>]*>|["'`][^"'`\n<>]*width\s*=\s*device-width[^"'`\n<>]*["'`]/gi;
      for (const v of m.text.matchAll(VIEWPORT_VALUE)) for (const z of v[0].matchAll(LOCK)) facts.zoomLocks.push({ file: f.rel, line: at(v.index + z.index) });
      for (const z of m.text.matchAll(/\bmaximumScale\s*:\s*1\b|\buserScalable\s*:\s*false\b/g)) facts.zoomLocks.push({ file: f.rel, line: at(z.index) });
      if (MOTION_IMPORT.test(m.text)) {
        const imp = m.text.match(MOTION_IMPORT);
        noteAnimation({ file: f.rel, line: at(imp.index) });
        for (const d of m.text.matchAll(/\bduration\s*:\s*(\d*\.?\d+)\b/g)) {
          // A spring's duration is a settling time set by its character, not a tier.
          const open = m.text.lastIndexOf("{", d.index);
          const close = m.text.indexOf("}", d.index);
          if (/type\s*:\s*["']spring|\bbounce\s*:|\bstiffness\s*:/.test(m.text.slice(open, close))) continue;
          const v = parseFloat(d[1]);
          facts.jsDurations.push({ file: f.rel, line: at(d.index), ms: Math.round(v < 20 ? v * 1000 : v) });
        }
      }
      if (/next\/font\/local|@fontsource/.test(m.text)) p.selfHostedFonts ??= { file: f.rel, line: 1 };
      if (/href=\{?["']#(main|content|main-content)["']|>\s*Skip to\b|\bskip-link\b|\bskip-to-content\b/i.test(m.text)) p.skipLink = true;
    }

    for (const s of sheets) {
      facts.decls.push(...s.decls.map((d) => ({ ...d, file: f.rel })));
      facts.atRules.push(...s.atRules.map((a) => ({ ...a, file: f.rel })));
      for (const a of s.atRules) {
        if (/^@supports.*backdrop-filter/i.test(a.prelude)) p.backdropSupports = true;
        if (/^@(-webkit-)?keyframes/i.test(a.prelude)) noteAnimation({ file: f.rel, line: a.line });
        if (/^@font-face/i.test(a.prelude)) p.selfHostedFonts ??= { file: f.rel, line: a.line };
        if (/^@import\s+["']tailwindcss/.test(a.prelude)) p.lightningCss = true;
      }
      for (const d of s.decls) {
        if (/:focus-visible/.test(d.selector)) p.focusVisible = true;
        if (/^(transition|transition-property|animation|animation-name)$/.test(d.prop) && !/^(none|0s?)$/.test(d.value.trim())) noteAnimation({ file: f.rel, line: d.line });
      }
    }

    if (/prefers-reduced-motion|useReducedMotion|reducedMotion|motion-reduce:|motion-safe:/.test(source)) p.reducedMotion = true;
    if (/prefers-reduced-transparency/.test(source)) p.reducedTransparency = true;
    if (/supports-\[backdrop-filter|supports-backdrop|CSS\.supports\(\s*["']backdrop-filter/.test(source)) p.backdropSupports = true;
    if (/:focus-visible|focus-visible:/.test(source)) p.focusVisible = true;
    if (/:focus-within|focus-within:/.test(source)) p.focusWithin = true;
  }

  for (const c of facts.classes) {
    if (/^(transition|animate-|duration-)/.test(c.base) && c.base !== "animate-none" && c.base !== "transition-none") {
      noteAnimation({ file: c.file, line: c.line });
      break;
    }
  }

  // Tailwind v4 compiles through Lightning CSS; so does anything that depends on it directly.
  try {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    if (deps.lightningcss || /^[\^~]?4/.test(deps.tailwindcss ?? "") || deps["@tailwindcss/postcss"] || deps["@tailwindcss/vite"]) p.lightningCss = true;
  } catch {}
  p.rootLayout = ROOT_LAYOUTS.find((l) => existsSync(join(root, l))) ?? null;
  return facts;
}

/** Whether a finding is silenced by a keyline-ignore comment on its line or up to two above. */
function suppressed(facts, f) {
  const lines = facts.sources.get(f.file);
  if (!lines || !f.line) return false;
  for (const l of [lines[f.line - 1], lines[f.line - 2], lines[f.line - 3]]) {
    const m = l?.match(/keyline-ignore(?!-file)((?:[\s,]+[a-z]+(?:\/[a-z-]+)?)*)/);
    if (!m) continue;
    // Rule ids or domains may follow; anything after them (": because…") is the reason.
    const named = m[1].split(/[\s,]+/).filter((r) => r.includes("/") || DOMAINS.includes(r));
    if (named.length === 0 || named.some((r) => r === f.rule || r === f.domain)) return true;
  }
  return false;
}

/**
 * Rules whose verdict depends on a signal anywhere in the project — a
 * reduced-motion branch, a focus-visible style, an @supports guard. Checking a
 * few files, the signal may sit in a file that wasn't read, so a finding from
 * one of these is confirmed against the whole project before it's reported.
 */
export const PROJECT_RULES = new Set([
  "type/font-synthesis", "color/focus-removed", "layout/skip-link", "depth/backdrop-guard",
  "depth/prefix-pair", "depth/reduced-transparency", "motion/reduced-motion",
]);

function runRules(facts, design, rules) {
  const findings = [];
  for (const rule of RULES) {
    if (rules && !rules.some((r) => r === rule.id || r === rule.domain)) continue;
    for (const f of rule.check(facts, { design })) {
      const finding = { rule: rule.id, domain: rule.domain, law: rule.law, severity: f.severity, file: f.file, line: f.line, message: f.message };
      if (suppressed(facts, finding)) continue;
      if (rule.scope === "project") finding.scope = "project";
      finding.fingerprint = fingerprint(finding, facts.sources.get(finding.file), { project: rule.scope === "project" });
      findings.push(finding);
    }
  }
  return findings;
}

/**
 * Check a project. `paths` walks folders; `only` instead names files (relative
 * to the root) and reports findings in those files alone, with verdicts that
 * still hold for the whole project.
 */
export function check({ root = ".", paths = ["."], ignores = [], rules = null, only = null } = {}) {
  const absRoot = resolve(root);
  // DESIGN.md lives at the project root. Checking one folder with no --root, look in it too.
  let design = readDesign(absRoot);
  if (!design.found && !only && paths.length === 1 && existsSync(resolve(absRoot, paths[0], "DESIGN.md"))) design = readDesign(resolve(absRoot, paths[0]));

  let files;
  let findings;
  if (only) {
    const rels = [...new Set(only.map((p) => relative(absRoot, resolve(absRoot, p)).split(sep).join("/")))];
    const picked = rels.filter((rel) => isInterfaceFile(rel) && existsSync(join(absRoot, rel)));
    files = collect(absRoot, picked.map((rel) => join(absRoot, rel)), ignores);
    const mine = new Set(files.map((f) => f.rel));
    findings = runRules(gather(absRoot, files), design, rules);
    // A rule whose verdict needs the whole project: one listed here, or one the rules mark as project-scoped.
    const isProject = (f) => PROJECT_RULES.has(f.rule) || f.scope === "project";
    const needsProject = [...new Set(findings.filter(isProject).map((f) => f.rule))];
    if (needsProject.length) {
      // Only when it matters: a clean file never pays for the walk.
      const whole = runRules(gather(absRoot, collect(absRoot, [absRoot], ignores)), design, needsProject);
      findings = findings.filter((f) => {
        if (!isProject(f)) return true;
        return whole.some((w) => w.rule === f.rule) && !whole.some((w) => w.rule === f.rule && mine.has(w.file));
      });
      // Where the whole-project run places a finding in these files, its version wins (its severity knows the project).
      findings.push(...whole.filter((w) => mine.has(w.file)));
    }
    findings = findings.filter((f) => mine.has(f.file));
  } else {
    files = collect(absRoot, paths.map((p) => resolve(absRoot, p)), ignores);
    findings = runRules(gather(absRoot, files), design, rules);
  }
  const order = { error: 0, warning: 1, info: 2 };
  findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || order[a.severity] - order[b.severity]);
  const checked = files.map((f) => f.rel);
  return { files: checked.length, checked, design, findings, rules };
}

/* ── Files from git ─────────────────────────────────────────────────────── */

function git(cwd, args) {
  const r = spawnSync("git", args, { cwd, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  return r.status === 0 ? r.stdout : null;
}

/**
 * The files git names — staged, or changed since `base` — relative to `root`,
 * or null when `root` isn't in a git repository. The detector reads the files
 * on disk, so a file staged in part is checked as it is in the working tree.
 */
export function gitFiles(root, { staged = false, base = "HEAD" } = {}) {
  const absRoot = resolve(root);
  const top = git(absRoot, ["rev-parse", "--show-toplevel"])?.trim();
  if (!top) return null;
  const lists = [];
  if (staged) lists.push(git(absRoot, ["diff", "--cached", "--name-only", "--diff-filter=ACMR", "-z"]));
  else {
    const from = git(absRoot, ["merge-base", base, "HEAD"])?.trim() || base;
    lists.push(git(absRoot, ["diff", "--name-only", "--diff-filter=ACMR", "-z", from]));
    lists.push(git(absRoot, ["ls-files", "--others", "--exclude-standard", "--full-name", "-z"]));
  }
  const out = new Set();
  // git answers with real paths; the root may have come through a symlink (/tmp on macOS).
  const real = realpathSync(absRoot);
  for (const list of lists) {
    for (const name of (list ?? "").split("\0").filter(Boolean)) {
      const rel = relative(real, join(top, name)).split(sep).join("/");
      if (!rel.startsWith("../") && !isAbsolute(rel)) out.add(rel);
    }
  }
  return [...out];
}

/* ── Report ─────────────────────────────────────────────────────────────── */

function summarise(findings) {
  const bySeverity = { error: 0, warning: 0, info: 0 };
  const byDomain = Object.fromEntries(DOMAINS.map((d) => [d, 0]));
  for (const f of findings) {
    bySeverity[f.severity]++;
    byDomain[f.domain]++;
  }
  return { ...bySeverity, byDomain };
}

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

function human(result, { all, color, baseline, changed }) {
  const paint = (code, s) => (color ? `\x1b[${code}m${s}\x1b[0m` : s);
  const sev = { error: (s) => paint("31", s), warning: (s) => paint("33", s), info: (s) => paint("36", s) };
  const dim = (s) => paint("2", s);
  const out = [];
  const d = result.design;
  out.push(`Keyline check — ${changed ? `${plural(result.files, "changed file")} since ${changed.base}` : `${result.files} files`}${d.found ? `, preset ${d.preset ?? "not set"} (${d.file})` : ", no DESIGN.md (run /keyline init for verdicts that follow your system)"}`);
  out.push("");

  // Against a baseline, the detail is what's new; what was already there is a count (or, with --all, a second list).
  const sections = baseline
    ? [
        { heading: "New since the baseline", list: result.findings.filter((f) => f.change === "new") },
        ...(all ? [{ heading: "Still there", list: result.findings.filter((f) => f.change === "still") }] : []),
      ]
    : [{ heading: null, list: result.findings }];

  for (const { heading, list } of sections) {
    if (heading && list.length) {
      out.push(paint("1", `${heading}`));
      out.push("");
    }
    const shown = new Map();
    const hidden = new Map();
    let file = null;
    for (const f of list) {
      const n = (shown.get(f.rule) ?? 0) + 1;
      if (!all && n > 8) {
        hidden.set(f.rule, (hidden.get(f.rule) ?? 0) + 1);
        continue;
      }
      shown.set(f.rule, n);
      if (f.file !== file) {
        if (file) out.push("");
        out.push(paint("1", f.file));
        file = f.file;
      }
      out.push(`  ${String(f.line).padStart(4)}  ${sev[f.severity](f.severity.padEnd(7))}  ${f.rule}`);
      out.push(`        ${f.message} ${dim(`(${f.law})`)}`);
    }
    if (hidden.size) {
      out.push("");
      for (const [rule, n] of hidden) out.push(dim(`  …${n} more ${rule} — run with --all to see them`));
    }
    if (list.length) out.push("");
  }

  if (baseline?.fixed.length) {
    out.push(paint("1", "Fixed since the baseline"));
    out.push("");
    for (const f of baseline.fixed.slice(0, all ? Infinity : 20)) out.push(`  ${paint("32", "✓")} ${f.file}:${f.line}  ${dim(f.rule)}`);
    if (!all && baseline.fixed.length > 20) out.push(dim(`  …${baseline.fixed.length - 20} more — run with --all to see them`));
    out.push("");
  }

  const s = summarise(result.findings);
  out.push(DOMAINS.map((dm) => `${dm} ${s.byDomain[dm]}`).join(dim(" · ")));
  const total = result.findings.length;
  const scope = result.rules ? ` in ${result.rules.join(", ")}` : "";
  if (baseline) {
    const n = summarise(result.findings.filter((f) => f.change === "new"));
    const created = baseline.created ? new Date(baseline.created).toLocaleDateString("en-GB", { dateStyle: "medium" }) : "an earlier run";
    out.push(dim(`Against ${baseline.file}, saved ${created}:`));
    const head = n.error ? sev.error(`✖ ${plural(n.error, "new error")}`) : paint("32", "✓ no new errors");
    out.push(`${head}, ${plural(n.warning, "new warning")}, ${n.info} new info · ${baseline.counts.still} still · ${paint("32", `${baseline.counts.fixed} fixed`)}`);
    if (baseline.counts.still && !all) out.push(dim(`The ${baseline.counts.still} still there are listed with --all, or without --baseline.`));
  } else {
    out.push(total === 0 ? paint("32", `✓ nothing the detector can see${scope} — run /keyline critique for what it can't`) : `${s.error ? sev.error(`✖ ${plural(s.error, "error")}`) : "✓ no errors"}, ${plural(s.warning, "warning")}, ${s.info} info`);
  }
  return out.join("\n");
}

export function parseCheckArgs(argv) {
  const opts = { format: "human", strict: false, quiet: false, all: false, ignores: [], rules: null, root: ".", paths: [], baseline: null, baselineFile: null, changed: null, staged: false, jsonFile: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const value = () => (a.includes("=") ? a.slice(a.indexOf("=") + 1) : argv[++i]);
    if (a === "--json") opts.format = "json";
    else if (a === "--format" || a.startsWith("--format=")) opts.format = value();
    else if (a === "--json-file" || a.startsWith("--json-file=")) opts.jsonFile = value();
    else if (a.startsWith("--changed=")) opts.changed = value();
    else if (a === "--changed") {
      // The base is optional (default HEAD): take the next word only if git knows it as a commit.
      const next = argv[i + 1];
      const isRev = next && !next.startsWith("-") && git(resolve(opts.root), ["rev-parse", "--verify", "--quiet", `${next}^{commit}`]) !== null;
      opts.changed = isRev ? argv[++i] : "HEAD";
    }
    else if (a === "--strict") opts.strict = true;
    else if (a === "--quiet") opts.quiet = true;
    else if (a === "--all") opts.all = true;
    else if (a === "--ignore" || a.startsWith("--ignore=")) opts.ignores.push(value());
    else if (a === "--rule" || a.startsWith("--rule=")) opts.rules = [...(opts.rules ?? []), ...value().split(",").map((s) => s.trim()).filter(Boolean)];
    else if (a === "--root" || a.startsWith("--root=")) opts.root = value();
    else if (a === "--baseline") {
      // `--baseline` alone compares; `--baseline save` writes. Only those words are taken as its value, so a path after it stays a path.
      opts.baseline = ["save", "compare"].includes(argv[i + 1]) ? argv[++i] : "compare";
    } else if (a.startsWith("--baseline=")) opts.baseline = value();
    else if (a === "--baseline-file" || a.startsWith("--baseline-file=")) opts.baselineFile = value();
    else if (a === "--staged") opts.staged = true;
    else if (a === "--rules") opts.listRules = true;
    else if (a === "-h" || a === "--help") opts.help = true;
    else if (a.startsWith("-")) return { error: `unknown option ${a} (try --help)` };
    else opts.paths.push(a);
  }
  if (opts.baseline && !["save", "compare"].includes(opts.baseline)) return { error: `--baseline takes save or nothing, not ${opts.baseline}` };
  if (opts.baselineFile && !opts.baseline) opts.baseline = "compare";
  if (!["human", "json", "github"].includes(opts.format)) return { error: `--format takes human, json or github, not ${opts.format}` };
  if (opts.staged && opts.changed) return { error: "--staged and --changed don't go together" };
  if (opts.staged && opts.baseline === "save") return { error: "a baseline is the whole project: save it without --staged" };
  if (opts.jsonFile === undefined || opts.jsonFile === "") return { error: "--json-file needs a path" };
  if (opts.changed && opts.baseline === "save") return { error: "a baseline is the whole project: save it without --changed" };
  opts.json = opts.format === "json";
  return opts;
}

export function run(argv) {
  const opts = parseCheckArgs(argv);
  if (opts.error) {
    console.error(`keyline check: ${opts.error}`);
    return 2;
  }
  if (opts.listRules) {
    for (const r of RULES) console.log(`${r.id.padEnd(28)} ${r.title} (${r.law})`);
    return 0;
  }
  if (opts.help) {
    console.log(USAGE);
    return 0;
  }
  if (opts.rules) {
    const known = new Set([...RULES.map((r) => r.id), ...DOMAINS]);
    const bad = opts.rules.filter((r) => !known.has(r));
    if (bad.length) {
      console.error(`keyline check: no rule called ${bad.join(", ")} (try --rules)`);
      return 2;
    }
  }
  if (!existsSync(resolve(opts.root))) {
    console.error(`keyline check: no such directory: ${opts.root}`);
    return 2;
  }
  for (const p of opts.paths) {
    if (!existsSync(resolve(opts.root, p))) {
      console.error(`keyline check: no such path: ${p}`);
      return 2;
    }
  }

  const baselineName = opts.baselineFile ?? BASELINE_FILE;
  const baselinePath = resolve(opts.root, baselineName);
  let saved = null;
  if (opts.baseline === "compare") {
    try {
      saved = readBaseline(baselinePath);
    } catch (err) {
      console.error(`keyline check: ${err.message}`);
      return 2;
    }
    if (!saved) {
      console.error(`keyline check: no baseline at ${baselineName} — record one with \`keyline check --baseline save\``);
      return 2;
    }
  }

  let changed = null;
  if (opts.changed) {
    try {
      changed = changedFiles(resolve(opts.root), opts.changed);
    } catch (err) {
      console.error(`keyline check: ${err.message}`);
      return 2;
    }
    if (!changed.mergeBase) console.error(`keyline check: ${opts.changed} and HEAD share no history here (a shallow clone?), so this compares with ${opts.changed} itself`);
  }

  let only = changed ? changed.files : null;
  if (opts.staged) {
    only = gitFiles(opts.root, { staged: true });
    if (!only) {
      console.error("keyline check: --staged needs a git repository");
      return 2;
    }
    changed = { base: "the last commit (staged)", staged: true, files: only };
  }
  // Paths, when given, narrow git's list to those folders.
  if (only && opts.paths.length) {
    const within = opts.paths.map((p) => relative(resolve(opts.root), resolve(opts.root, p)).split(sep).join("/"));
    only = only.filter((rel) => within.some((w) => w === "" || rel === w || rel.startsWith(w + "/")));
  }
  const result = check({ root: opts.root, paths: opts.paths.length ? opts.paths : ["."], ignores: opts.ignores, rules: opts.rules, only });

  // A baseline holds everything found, whatever --quiet shows.
  if (opts.baseline === "save") {
    writeBaseline(baselinePath, result.findings);
    const s = summarise(result.findings);
    const line = `Saved ${plural(result.findings.length, "finding")} (${plural(s.error, "error")}, ${plural(s.warning, "warning")}, ${s.info} info) to ${baselineName}. From now on, \`keyline check --baseline\` fails only on new ones. Commit the file.`;
    if (opts.json) console.log(JSON.stringify({ baseline: { file: baselineName, saved: result.findings.length }, summary: s }, null, 2));
    else console.log(line);
    return 0;
  }

  let baseline = null;
  if (saved) {
    const split = compare(result.findings, saved, { files: result.checked, rules: opts.rules, partial: Boolean(changed) || opts.paths.length > 0 });
    result.findings = split.findings;
    baseline = { file: baselineName, created: saved.created, counts: split.counts, fixed: split.fixed };
  }
  if (opts.quiet) {
    result.findings = result.findings.filter((f) => f.severity === "error");
    if (baseline) {
      baseline.fixed = baseline.fixed.filter((f) => f.severity === "error");
      baseline.counts = { new: result.findings.filter((f) => f.change === "new").length, still: result.findings.filter((f) => f.change === "still").length, fixed: baseline.fixed.length };
    }
  }
  const s = summarise(result.findings);
  const failing = summarise(baseline ? result.findings.filter((f) => f.change === "new") : result.findings);

  const prefix = changed?.prefix ?? repoOf(resolve(opts.root))?.prefix ?? "";
  const report = () => {
    const design = { found: result.design.found, file: result.design.file ?? null, preset: result.design.preset, durations: result.design.durations ? [...result.design.durations] : null, zLadder: result.design.zLadder ? [...result.design.zLadder] : null };
    const out = { files: result.files, design, summary: s, findings: result.findings, prefix };
    if (changed) out.changed = { base: changed.base, from: changed.from, mergeBase: changed.mergeBase, files: result.files };
    if (baseline) {
      out.summary = { ...s, new: { error: failing.error, warning: failing.warning, info: failing.info } };
      out.baseline = { file: baseline.file, created: baseline.created, ...baseline.counts };
      out.fixed = baseline.fixed;
    }
    return JSON.stringify(out, null, 2);
  };
  if (opts.jsonFile) writeFileSync(resolve(opts.jsonFile), report() + "\n");

  if (opts.format === "json") {
    console.log(report());
  } else if (opts.format === "github") {
    // Annotations go to stdout, where the runner reads them; a closing line says what was checked.
    for (const line of annotations(result.findings, { prefix })) console.log(line);
    const scope = changed ? `${plural(result.files, "changed file")} since ${changed.base}` : plural(result.files, "file");
    const counted = baseline ? `${plural(failing.error, "new error")}, ${plural(failing.warning, "new warning")}, ${failing.info} new info · ${baseline.counts.still} still · ${baseline.counts.fixed} fixed` : `${plural(s.error, "error")}, ${plural(s.warning, "warning")}, ${s.info} info`;
    console.log(`Keyline: ${counted} in ${scope}.`);
  } else {
    if (changed && result.files === 0) console.log(`No changed files to check since ${changed.base}.`);
    else console.log(human(result, { all: opts.all, color: process.stdout.isTTY && !process.env.NO_COLOR, baseline, changed }));
  }
  return failing.error > 0 || (opts.strict && failing.warning > 0) ? 1 : 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = run(process.argv.slice(2));
}
