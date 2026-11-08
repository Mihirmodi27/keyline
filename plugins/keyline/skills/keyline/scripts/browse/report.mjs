/**
 * Render a run (findings.json) as one HTML page beside it: index.html, with
 * the shots folder next to it. No dependencies and no network: the page opens
 * from disk, prints, and can be published as-is.
 *
 * Each finding shows a crop of the screenshot it was seen in with the element
 * outlined. The crop is CSS: the shot is a background image sized and offset
 * so only the region around the box shows, which keeps the report folder to
 * one PNG per page however many findings point into it.
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { counts, readRun, sortFindings } from "./findings.mjs";

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const DOMAIN_NAMES = {
  type: "Type",
  color: "Colour",
  layout: "Layout",
  depth: "Depth",
  motion: "Motion",
  patterns: "Patterns",
  a11y: "Accessibility",
  copy: "Copy",
  states: "States",
  slop: "AI slop",
  flow: "Flows",
  runtime: "Runtime",
  visual: "Visual change",
};
const CHANGE_WORDS = { new: "New", returned: "Back", still: "Still" };
const KIND_TITLES = { audit: "Audit", smoke: "Smoke test", capture: "Capture", check: "Detector" };
const SCORE_WORDS = ["Broken", "Weak", "Mixed", "Good", "Excellent"];
const PAD = 72;

/** The crop around a box, clamped to the shot. All numbers in shot pixels. */
function crop(box, shot) {
  // Wide enough that the report's 832px column doesn't enlarge it much, tall enough to show context.
  const w = Math.min(shot.width, Math.max(box.w + PAD * 2, 880));
  const h = Math.min(shot.height, Math.max(box.h + PAD * 2, Math.round(w * 0.4)));
  const x = Math.max(0, Math.min(box.x + box.w / 2 - w / 2, shot.width - w));
  const y = Math.max(0, Math.min(box.y + box.h / 2 - h / 2, shot.height - h));
  return { x, y, w, h };
}

function figure(f, page) {
  const shot = f.shot && page?.shots?.[f.shot];
  if (!shot) return "";
  if (!f.box) {
    return `<a class="shot shot--whole" href="${esc(shot.path)}" target="_blank" rel="noopener"><img src="${esc(shot.path)}" alt="" loading="lazy"></a>`;
  }
  const c = crop(f.box, shot);
  const pct = (n, d) => ((n / d) * 100).toFixed(3) + "%";
  const bgSize = `${pct(shot.width, c.w)} auto`;
  const bgPos = `${c.w >= shot.width ? "0%" : pct(c.x, shot.width - c.w)} ${c.h >= shot.height ? "0%" : pct(c.y, shot.height - c.h)}`;
  const mark = `left:${pct(f.box.x - c.x, c.w)};top:${pct(f.box.y - c.y, c.h)};width:${pct(f.box.w, c.w)};height:${pct(f.box.h, c.h)}`;
  // Never wider than 1.25× the pixels it has, so a phone crop stays sharp.
  return `<a class="shot" href="${esc(shot.path)}" target="_blank" rel="noopener" style="max-width:${Math.round(c.w * 1.25)}px;aspect-ratio:${c.w}/${c.h};background-image:url('${esc(shot.path)}');background-size:${bgSize};background-position:${bgPos}" aria-label="Open the full screenshot"><span class="shot__mark" style="${mark}"></span></a>`;
}

/** A change can span the whole page; the crop shows where it starts, and the full shot and diff are a click away. */
const VISUAL_CROP = 560;
const firstPart = (box) => (box && box.h > VISUAL_CROP ? { ...box, h: VISUAL_CROP } : box);

/** A visual change shows the diff under the crop: the same region, changed pixels in red. */
function diffFigure(f) {
  if (!f.diff?.path) return "";
  const box = firstPart(f.diff.box ?? f.box);
  const shown = figure({ ...f, shot: "diff", box }, { shots: { diff: { path: f.diff.path, width: f.diff.width, height: f.diff.height } } });
  return `<p class="f__caption">The diff: red is what changed.</p>${shown}`;
}

function card(f, page) {
  const where = [f.page, f.viewport, f.theme].filter(Boolean).join(" · ");
  const source = f.file ? `${f.file}${f.line ? `:${f.line}` : ""}` : "";
  const change = f.rule?.startsWith("visual/") ? "changed" : f.change;
  const badge = change === "changed" ? `<span class="chg chg--changed">Changed</span>` : CHANGE_WORDS[change] ? `<span class="chg chg--${esc(change)}">${CHANGE_WORDS[change]}</span>` : "";
  return `<article class="f" data-severity="${esc(f.severity)}" data-domain="${esc(f.domain)}" data-page="${esc(f.page ?? "")}" data-status="${esc(f.status ?? "open")}" data-change="${esc(change ?? "")}" id="${esc(f.id)}">
  <header class="f__head">
    <span class="sev sev--${esc(f.severity)}">${esc(f.severity)}</span>${badge}
    <h3 class="f__title">${esc(f.title)}</h3>
  </header>
  <p class="f__meta"><span>${esc(DOMAIN_NAMES[f.domain] ?? f.domain)}</span><code>${esc(f.rule)}</code>${f.law ? `<span>${esc(f.law)}</span>` : ""}${where ? `<span>${esc(where)}</span>` : ""}</p>
  ${f.detail ? `<p class="f__detail">${esc(f.detail)}</p>` : ""}
  ${f.evidence ? `<p class="f__evidence"><span>Measured</span> ${esc(f.evidence)}</p>` : ""}
  ${f.steps?.length ? `<ol class="f__steps">${f.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>` : ""}
  ${figure(f.diff ? { ...f, box: firstPart(f.box) } : f, page)}
  ${diffFigure(f)}
  <dl class="f__facts">
    ${f.selector ? `<div><dt>Element</dt><dd><code>${esc(f.selector)}</code></dd></div>` : ""}
    ${source ? `<div><dt>Source</dt><dd><code>${esc(source)}</code></dd></div>` : ""}
    ${f.fix ? `<div><dt>Fix with</dt><dd><code>${esc(f.fix)}</code></dd></div>` : ""}
  </dl>
</article>`;
}

function scoreTable(scores) {
  if (!scores) return "";
  const rows = Object.entries(scores)
    .map(([d, s]) => `<tr><th scope="row">${esc(DOMAIN_NAMES[d] ?? d)}</th><td><span class="meter" style="--v:${Number(s) / 4}"></span></td><td>${esc(s)}/4</td><td>${esc(SCORE_WORDS[s] ?? "")}</td></tr>`)
    .join("");
  return `<section class="block"><h2>Scores</h2><table class="scores"><tbody>${rows}</tbody></table></section>`;
}

function sinceSection(run) {
  const c = run.compare;
  if (!c) return "";
  const when = c.previous?.finished ? new Date(c.previous.finished).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "an earlier run";
  const v = c.visual;
  const total = (n, label) => `<li><b>${n}</b><span>${label}</span></li>`;
  const fixed = run.fixed ?? [];
  const fixedList = fixed.length
    ? `<h3>Fixed</h3><ul class="since__list">${fixed
        .map((f) => `<li><span class="sev sev--${esc(f.severity)}">${esc(f.severity)}</span> ${esc(f.title)} <span class="since__where"><code>${esc(f.rule)}</code> ${esc([f.page, f.viewport, f.theme].filter(Boolean).join(" · "))}</span></li>`)
        .join("")}</ul>`
    : "";
  const diffs = run.pages.flatMap((p) => Object.entries(p.diffs ?? {}).map(([key, d]) => ({ route: p.route, key, ...d })));
  diffs.sort((a, b) => b.percent - a.percent);
  const diffRows = diffs.length
    ? `<h3>Screenshots</h3><table class="since__diffs"><tbody>${diffs
        .map((d) => `<tr${d.percent > (v?.threshold ?? 0) ? "" : ` class="same"`}><th scope="row">${esc(d.route)}</th><td>${esc(d.key.replace("-", " · "))}</td><td>${d.percent > (v?.threshold ?? 0) ? `${esc(d.percent)}% changed` : d.percent > 0 ? `${esc(d.percent)}%, under the threshold` : "unchanged"}</td><td><a href="${esc(d.path)}" target="_blank" rel="noopener">diff</a></td></tr>`)
        .join("")}</tbody></table>`
    : v?.skipped
      ? `<p class="since__note">Screenshots weren't diffed: ${esc(v.skipped)}</p>`
      : "";
  return `<section class="block since"><h2>Since last run</h2>
<p class="lede">Against <code>${esc(c.against ?? "the previous report")}</code>, ${esc(when)}.</p>
<ul class="totals">${total(c.new, "New")}${total(c.returned, "Back again")}${total(c.still, "Still open")}${total(c.fixed, "Fixed")}${v ? total(v.changed, v.changed === 1 ? "Page changed" : "Pages changed") : ""}</ul>
${fixedList}${diffRows}</section>`;
}

const STYLE = `
:root{color-scheme:light dark;--bg:#fff;--fg:#171717;--muted:#5e5e5e;--faint:#737373;--line:rgba(0,0,0,.09);--chip:#f2f2f2;--err:#b42318;--err-bg:#fdecea;--warn:#8a5a00;--warn-bg:#fff4dc;--info:#1d4ed8;--info-bg:#e8efff;--mark:#c4321f}
@media (prefers-color-scheme:dark){:root{--bg:#0b0b0b;--fg:#ededed;--muted:#a0a0a0;--faint:#8f8f8f;--line:rgba(255,255,255,.1);--chip:#1a1a1a;--err:#ff8a80;--err-bg:#3a1512;--warn:#f5c26b;--warn-bg:#33270d;--info:#93b4ff;--info-bg:#152040;--mark:#ff6b57}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.55 ui-sans-serif,system-ui,-apple-system,"Helvetica Neue",sans-serif;-webkit-font-smoothing:antialiased}
code{font:13px/1.4 ui-monospace,"SF Mono",Menlo,monospace}
.wrap{max-width:880px;margin:0 auto;padding:64px 24px 96px}
h1{margin:0;font-size:28px;font-weight:500;letter-spacing:-.02em;line-height:1.2}
h2{margin:0 0 12px;font-size:16px;font-weight:500;letter-spacing:-.015em}
.lede{margin:8px 0 0;color:var(--muted)}
.summary{margin:24px 0 0;max-width:62ch}
.totals{display:flex;flex-wrap:wrap;gap:24px;margin:32px 0 0;padding:0;list-style:none}
.totals b{display:block;font-size:20px;font-weight:500;font-variant-numeric:tabular-nums}
.totals span{font-size:13px;color:var(--faint)}
.block{margin-top:48px}
.scores{border-collapse:collapse;width:100%;font-size:14px}
.scores th,.scores td{padding:8px 12px 8px 0;border-top:.5px solid var(--line);text-align:left;font-weight:400}
.scores td:nth-child(3){font-variant-numeric:tabular-nums;color:var(--muted);width:4em}
.scores td:last-child{color:var(--faint);width:7em}
.meter{display:block;height:6px;border-radius:9px;background:var(--chip);position:relative;overflow:hidden;min-width:120px}
.meter::after{content:"";position:absolute;inset:0;width:calc(var(--v)*100%);background:var(--fg);border-radius:inherit}
.filters{position:sticky;top:0;z-index:2;display:flex;flex-wrap:wrap;gap:8px;margin:48px -24px 0;padding:12px 24px;background:var(--bg);border-bottom:.5px solid var(--line)}
.filters select,.filters button{font:inherit;font-size:13px;color:var(--fg);background:var(--chip);border:0;border-radius:10px;padding:6px 10px;cursor:pointer}
.filters .count{margin-left:auto;font-size:13px;color:var(--faint);align-self:center}
.page-group{margin-top:40px}
.page-group>h2{display:flex;gap:12px;align-items:baseline}
.page-group>h2 small{font-size:13px;font-weight:400;color:var(--faint)}
.f{padding:24px 0;border-top:.5px solid var(--line)}
.f[hidden]{display:none}
.f__head{display:flex;gap:12px;align-items:baseline}
.f__title{margin:0;font-size:16px;font-weight:500;letter-spacing:-.01em}
.sev{flex:none;font-size:12px;padding:1px 8px;border-radius:999px}
.sev--error{color:var(--err);background:var(--err-bg)}
.sev--warning{color:var(--warn);background:var(--warn-bg)}
.sev--info{color:var(--info);background:var(--info-bg)}
.f__meta{display:flex;flex-wrap:wrap;gap:4px 14px;margin:6px 0 0;font-size:13px;color:var(--faint)}
.f__detail{margin:10px 0 0;max-width:68ch;color:var(--muted);font-size:14px}
.f__evidence{margin:8px 0 0;font-size:14px}
.f__evidence span{color:var(--faint)}
.f__steps{margin:10px 0 0;padding-left:20px;font-size:14px;color:var(--muted)}
.shot{position:relative;display:block;margin-top:16px;border-radius:12px;border:.5px solid var(--line);background-repeat:no-repeat;overflow:hidden;max-height:420px}
.shot--whole img{display:block;width:100%;height:auto}
.shot__mark{position:absolute;outline:2px solid var(--mark);outline-offset:2px;border-radius:4px;box-shadow:0 0 0 9999px rgba(0,0,0,.18)}
.f__facts{display:grid;gap:4px;margin:14px 0 0;font-size:13px}
.f__facts div{display:flex;gap:12px}
.f__facts dt{width:6em;flex:none;color:var(--faint)}
.f__facts dd{margin:0;min-width:0;overflow-wrap:anywhere}
.empty{margin-top:48px;color:var(--muted)}
.chg{flex:none;font-size:12px;padding:0 8px;border-radius:999px;border:.5px solid currentColor}
.chg--new{color:var(--err)}
.chg--returned{color:var(--warn)}
.chg--still{color:var(--faint)}
.chg--changed{color:var(--info)}
.f__caption{margin:12px 0 0;font-size:13px;color:var(--faint)}
.since h3{margin:28px 0 8px;font-size:14px;font-weight:500}
.since__list{margin:0;padding:0;list-style:none;font-size:14px}
.since__list li{display:flex;flex-wrap:wrap;gap:4px 10px;align-items:baseline;padding:8px 0;border-top:.5px solid var(--line)}
.since__where{font-size:13px;color:var(--faint)}
.since__diffs{border-collapse:collapse;width:100%;font-size:14px}
.since__diffs th,.since__diffs td{padding:8px 12px 8px 0;border-top:.5px solid var(--line);text-align:left;font-weight:400}
.since__diffs td{font-variant-numeric:tabular-nums;color:var(--muted)}
.since__diffs tr.same{color:var(--faint)}
.since__diffs a{color:inherit}
.since__note{font-size:14px;color:var(--muted)}
footer{margin-top:64px;font-size:13px;color:var(--faint)}
@media print{.filters{display:none}.f{break-inside:avoid}}
`;

const SCRIPT = `
const sel=(n)=>document.querySelector('[name="'+n+'"]');
function apply(){const s=sel('severity').value,d=sel('domain').value,p=sel('page').value,c=sel('change')?sel('change').value:'';let n=0;
document.querySelectorAll('.f').forEach(f=>{const show=(!s||f.dataset.severity===s)&&(!d||f.dataset.domain===d)&&(!p||f.dataset.page===p)&&(!c||f.dataset.change===c);f.hidden=!show;if(show)n++;});
document.querySelectorAll('.page-group').forEach(g=>{g.hidden=!g.querySelector('.f:not([hidden])');});
document.querySelector('.count').textContent=n+(n===1?' finding':' findings');}
document.querySelectorAll('.filters select').forEach(x=>x.addEventListener('change',apply));apply();
`;

export function render(run) {
  const findings = sortFindings(run.findings.filter((f) => f.status !== "dismissed"));
  const c = counts(findings);
  const pagesByRoute = new Map(run.pages.map((p) => [p.route, p]));
  const groups = new Map();
  for (const f of findings) {
    const key = f.page ?? "Whole product";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(f);
  }
  const option = (v, label) => `<option value="${esc(v)}">${esc(label)}</option>`;
  const domains = [...new Set(findings.map((f) => f.domain))];
  const title = `${KIND_TITLES[run.kind] ?? "Report"}${run.title ? `: ${run.title}` : ""}`;
  const when = run.finished ? new Date(run.finished) : new Date();

  const body = findings.length
    ? [...groups]
        .map(([route, list]) => {
          const page = pagesByRoute.get(route);
          return `<section class="page-group"><h2>${esc(route)}${page?.title ? ` <small>${esc(page.title)}</small>` : ""}</h2>${list.map((f) => card(f, page)).join("\n")}</section>`;
        })
        .join("\n")
    : `<p class="empty">Nothing found. ${run.pages.length} ${run.pages.length === 1 ? "page" : "pages"} checked.</p>`;

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><style>${STYLE}</style></head>
<body><main class="wrap">
<h1>${esc(title)}</h1>
<p class="lede">${esc(run.base ?? run.root ?? "")} · ${esc(when.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }))} · ${run.pages.length} ${run.pages.length === 1 ? "page" : "pages"}</p>
${run.summary ? `<p class="summary">${esc(run.summary)}</p>` : ""}
<ul class="totals"><li><b>${c.error}</b><span>Errors</span></li><li><b>${c.warning}</b><span>Warnings</span></li><li><b>${c.info}</b><span>Notes</span></li></ul>
${sinceSection(run)}
${scoreTable(run.scores)}
<nav class="filters" aria-label="Filter findings">
<select name="severity" aria-label="Severity">${option("", "Every severity")}${option("error", "Errors")}${option("warning", "Warnings")}${option("info", "Notes")}</select>
<select name="domain" aria-label="Area">${option("", "Every area")}${domains.map((d) => option(d, DOMAIN_NAMES[d] ?? d)).join("")}</select>
<select name="page" aria-label="Page">${option("", "Every page")}${[...groups.keys()].map((p) => option(p, p)).join("")}</select>
${run.compare ? `<select name="change" aria-label="Since last run">${option("", "Old and new")}${option("new", "New")}${option("returned", "Back again")}${option("still", "Still open")}${run.compare.visual ? option("changed", "Visual changes") : ""}</select>` : ""}
<span class="count" aria-live="polite"></span>
</nav>
${body}
<footer>Made by Keyline. The data is in findings.json beside this file; <code>/keyline polish --from ${esc(run.kind === "smoke" ? "smoke-report" : "keyline-report")}</code> fixes what's open.</footer>
</main><script>${SCRIPT}</script></body></html>
`;
}

/** Render `dir/findings.json` to `dir/index.html`. Returns the path. */
export function renderDir(dir) {
  const run = readRun(dir);
  const file = join(dir, "index.html");
  writeFileSync(file, render(run));
  return file;
}
