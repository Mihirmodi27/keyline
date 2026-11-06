#!/usr/bin/env node
/**
 * Keyline's detector: the laws that can be checked from source text, with no
 * model and no API key.
 *
 *   node check.mjs [paths…]           human report; exit 1 on any error
 *   node check.mjs src --json         every finding, for CI or an agent
 *   node check.mjs --strict           warnings fail the run too
 *   node check.mjs --ignore src/content --rule motion/transition-all
 *
 * It reads DESIGN.md at the root for the preset and the motion and z-index
 * ladders, so a verdict follows the project's own decisions. Silence one line
 * with a `keyline-ignore` comment on it or up to two lines above (optionally
 * naming rules, then a reason: `keyline-ignore type/uppercase: a logo`), or a
 * whole file with
 * `keyline-ignore-file`.
 *
 * Exit codes: 0 clean (or only warnings and info), 1 findings that fail the
 * run, 2 a usage error.
 */
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { collect } from "./check/files.mjs";
import { lineIndex, parseCss } from "./check/css.mjs";
import { readMarkup } from "./check/markup.mjs";
import { readDesign } from "./check/design.mjs";
import { DOMAINS, RULES } from "./check/rules.mjs";

const USAGE = `keyline check — the interface laws that can be checked without a model.

  keyline check [paths…] [options]

Options:
  --json              every finding as JSON
  --strict            fail on warnings as well as errors
  --quiet             errors only
  --all               don't cap repeated findings in the report
  --ignore <path>     leave out a path (repeatable), e.g. prose or fixtures
  --rule <id[,id…]>   run only these rules (repeatable)
  --root <dir>        the project: paths are read from here, and DESIGN.md and
                      package.json found here (default: .)
  --rules             list the rules and exit
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
      for (const z of m.text.matchAll(/maximum-scale\s*=\s*1(?:\.0)?\b|user-scalable\s*=\s*(?:no|0)\b|maximumScale\s*:\s*1\b|userScalable\s*:\s*false\b/g)) facts.zoomLocks.push({ file: f.rel, line: at(z.index) });
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

export function check({ root = ".", paths = ["."], ignores = [], rules = null } = {}) {
  const absRoot = resolve(root);
  const files = collect(absRoot, paths.map((p) => resolve(absRoot, p)), ignores);
  // DESIGN.md lives at the project root. Checking one folder with no --root, look in it too.
  let design = readDesign(absRoot);
  if (!design.found && paths.length === 1 && existsSync(resolve(absRoot, paths[0], "DESIGN.md"))) design = readDesign(resolve(absRoot, paths[0]));
  const facts = gather(absRoot, files);
  const findings = [];
  for (const rule of RULES) {
    if (rules && !rules.some((r) => r === rule.id || r === rule.domain)) continue;
    for (const f of rule.check(facts, { design })) {
      const finding = { rule: rule.id, domain: rule.domain, law: rule.law, severity: f.severity, file: f.file, line: f.line, message: f.message };
      if (!suppressed(facts, finding)) findings.push(finding);
    }
  }
  const order = { error: 0, warning: 1, info: 2 };
  findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || order[a.severity] - order[b.severity]);
  return { files: files.length, design, findings, rules };
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

function human(result, { all, color }) {
  const paint = (code, s) => (color ? `\x1b[${code}m${s}\x1b[0m` : s);
  const sev = { error: (s) => paint("31", s), warning: (s) => paint("33", s), info: (s) => paint("36", s) };
  const dim = (s) => paint("2", s);
  const out = [];
  const d = result.design;
  out.push(`Keyline check — ${result.files} files${d.found ? `, preset ${d.preset ?? "not set"} (${d.file})` : ", no DESIGN.md (run /keyline init for verdicts that follow your system)"}`);
  out.push("");

  const shown = new Map();
  const hidden = new Map();
  let file = null;
  for (const f of result.findings) {
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

  const s = summarise(result.findings);
  out.push("");
  out.push(DOMAINS.map((dm) => `${dm} ${s.byDomain[dm]}`).join(dim(" · ")));
  const total = result.findings.length;
  const scope = result.rules ? ` in ${result.rules.join(", ")}` : "";
  out.push(total === 0 ? paint("32", `✓ nothing the detector can see${scope} — run /keyline critique for what it can't`) : `${s.error ? sev.error(`✖ ${s.error} error${s.error === 1 ? "" : "s"}`) : "✓ no errors"}, ${s.warning} warning${s.warning === 1 ? "" : "s"}, ${s.info} info`);
  return out.join("\n");
}

export function run(argv) {
  const opts = { json: false, strict: false, quiet: false, all: false, ignores: [], rules: null, root: ".", paths: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const value = () => (a.includes("=") ? a.slice(a.indexOf("=") + 1) : argv[++i]);
    if (a === "--json") opts.json = true;
    else if (a === "--strict") opts.strict = true;
    else if (a === "--quiet") opts.quiet = true;
    else if (a === "--all") opts.all = true;
    else if (a === "--ignore" || a.startsWith("--ignore=")) opts.ignores.push(value());
    else if (a === "--rule" || a.startsWith("--rule=")) opts.rules = [...(opts.rules ?? []), ...value().split(",").map((s) => s.trim()).filter(Boolean)];
    else if (a === "--root" || a.startsWith("--root=")) opts.root = value();
    else if (a === "--rules") {
      for (const r of RULES) console.log(`${r.id.padEnd(28)} ${r.title} (${r.law})`);
      return 0;
    } else if (a === "-h" || a === "--help") {
      console.log(USAGE);
      return 0;
    } else if (a.startsWith("-")) {
      console.error(`keyline check: unknown option ${a} (try --help)`);
      return 2;
    } else opts.paths.push(a);
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

  const result = check({ root: opts.root, paths: opts.paths.length ? opts.paths : ["."], ignores: opts.ignores, rules: opts.rules });
  if (opts.quiet) result.findings = result.findings.filter((f) => f.severity === "error");
  const s = summarise(result.findings);

  if (opts.json) {
    const design = { found: result.design.found, file: result.design.file ?? null, preset: result.design.preset, durations: result.design.durations ? [...result.design.durations] : null, zLadder: result.design.zLadder ? [...result.design.zLadder] : null };
    console.log(JSON.stringify({ files: result.files, design, summary: s, findings: result.findings }, null, 2));
  } else {
    console.log(human(result, { all: opts.all, color: process.stdout.isTTY && !process.env.NO_COLOR }));
  }
  return s.error > 0 || (opts.strict && s.warning > 0) ? 1 : 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = run(process.argv.slice(2));
}
