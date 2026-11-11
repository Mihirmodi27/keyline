/**
 * What changed since the last run: which findings are new, which are still
 * there, which came back, which were fixed, and which pages look different.
 *
 *   keyline report keyline-report --compare keyline-report-before
 *
 * Findings are matched on rule + page + viewport + theme + selector (the title
 * when there's no selector) — the same key a run is de-duplicated on. Each
 * finding in the current run gets `change`:
 *
 *   "new"       not in the previous run
 *   "still"     in it too (a status a person set there — accepted, dismissed — carries over)
 *   "returned"  not in the previous run, but in that run's own `fixed` list: fixed once, back now
 *
 * The previous run's findings with no match go under `fixed`, if the current
 * run could have seen them again: their page was visited, at their viewport and
 * theme. Pages left out of this run say nothing about what was fixed on them.
 *
 * Screenshots present in both runs are diffed pixel by pixel in the browser
 * Playwright already drives (canvas, no image library), each diff written to
 * `diffs/`. A page × viewport × theme whose changed share is above the
 * threshold gets an info finding, `visual/changed`, boxed round what changed.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { split } from "../check/findings.mjs";
import { readRun, writeRun } from "./findings.mjs";
import { shotKey } from "./capture.mjs";

/** The identity of a finding across runs. */
export function matchKey(f) {
  return [f.rule, f.page ?? "", f.viewport ?? "", f.theme ?? "", f.selector ?? f.title].join("|");
}

/** Findings that describe a comparison, not the product, never take part in one. */
const isVisual = (f) => f.rule?.startsWith("visual/");

/** Remove what an earlier compare wrote, so comparing twice gives the same answer. */
export function clearCompare(run) {
  delete run.compare;
  delete run.fixed;
  run.findings = run.findings.filter((f) => !isVisual(f)).map(({ change, previous, diff, ...f }) => f);
  for (const p of run.pages ?? []) delete p.diffs;
  return run;
}

/** Mark `run`'s findings against `prev`. Mutates and returns `run`. */
export function compareRuns(run, prev, { against = null } = {}) {
  const fixedBefore = new Set((prev.fixed ?? []).map(matchKey));
  const { matched, left } = split(run.findings.filter((f) => !isVisual(f)), prev.findings.filter((f) => !isVisual(f)), matchKey);
  for (const [f, was] of matched) {
    if (was) {
      f.change = "still";
      f.previous = was.id;
      if ((!f.status || f.status === "open") && was.status && was.status !== "open") f.status = was.status;
    } else {
      f.change = fixedBefore.has(matchKey(f)) ? "returned" : "new";
    }
  }

  // Only what this run could have seen again counts as fixed.
  const routes = new Set(run.pages.map((p) => p.route));
  const passes = new Set(run.pages.flatMap((p) => Object.keys(p.shots ?? {})));
  const seen = (f) => {
    if (f.page && !routes.has(f.page)) return false;
    if (f.viewport && f.theme && passes.size && !passes.has(shotKey(f.viewport, f.theme))) return false;
    return true;
  };
  run.fixed = left.filter(seen).map(({ change, previous, ...f }, i) => ({ ...f, previous: f.id, id: `x${i + 1}`, change: "fixed" }));

  const count = (c) => run.findings.filter((f) => f.change === c).length;
  run.compare = {
    against,
    previous: { kind: prev.kind, started: prev.started, finished: prev.finished },
    new: count("new"),
    still: count("still"),
    returned: count("returned"),
    fixed: run.fixed.length,
  };
  return run;
}

/**
 * Diff two PNGs in a browser page. `before` and `after` are PNG buffers.
 * Returns the share of pixels that changed, a box round them, and a diff
 * image: the new shot washed out, changed pixels in red. Where the sizes
 * differ, the area only one shot covers counts as changed.
 */
export async function diffPngs(page, before, after, { tolerance = 24 } = {}) {
  const r = await page.evaluate(
    async ({ a, b, tolerance }) => {
      const load = (src) =>
        new Promise((res, rej) => {
          const img = new Image();
          img.onload = () => res(img);
          img.onerror = () => rej(new Error("a screenshot couldn't be decoded"));
          img.src = src;
        });
      const [ia, ib] = await Promise.all([load(a), load(b)]);
      const w = Math.max(ia.naturalWidth, ib.naturalWidth);
      const h = Math.max(ia.naturalHeight, ib.naturalHeight);
      const pixels = (img) => {
        const c = new OffscreenCanvas(w, h);
        const ctx = c.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(img, 0, 0);
        return ctx.getImageData(0, 0, w, h).data;
      };
      const pa = pixels(ia);
      const pb = pixels(ib);
      const out = new ImageData(w, h);
      const d = out.data;
      let changed = 0;
      let x0 = w, y0 = h, x1 = -1, y1 = -1;
      for (let y = 0; y < h; y++) {
        const inA = y < ia.naturalHeight;
        const inB = y < ib.naturalHeight;
        for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4;
          const a1 = inA && x < ia.naturalWidth;
          const b1 = inB && x < ib.naturalWidth;
          const diff = !(a1 && b1) || Math.abs(pa[i] - pb[i]) > tolerance || Math.abs(pa[i + 1] - pb[i + 1]) > tolerance || Math.abs(pa[i + 2] - pb[i + 2]) > tolerance || Math.abs(pa[i + 3] - pb[i + 3]) > tolerance;
          if (diff) {
            changed++;
            if (x < x0) x0 = x;
            if (y < y0) y0 = y;
            if (x > x1) x1 = x;
            if (y > y1) y1 = y;
            d[i] = 230; d[i + 1] = 30; d[i + 2] = 30; d[i + 3] = 255;
          } else {
            const src = b1 ? pb : pa;
            const lum = 0.299 * src[i] + 0.587 * src[i + 1] + 0.114 * src[i + 2];
            const v = 255 - (255 - lum) * 0.22;
            d[i] = v; d[i + 1] = v; d[i + 2] = v; d[i + 3] = 255;
          }
        }
      }
      const c = new OffscreenCanvas(w, h);
      c.getContext("2d").putImageData(out, 0, 0);
      const blob = await c.convertToBlob({ type: "image/png" });
      const png = await new Promise((res) => {
        const fr = new FileReader();
        fr.onload = () => res(String(fr.result).split(",")[1]);
        fr.readAsDataURL(blob);
      });
      return {
        width: w,
        height: h,
        before: { width: ia.naturalWidth, height: ia.naturalHeight },
        after: { width: ib.naturalWidth, height: ib.naturalHeight },
        changed,
        total: w * h,
        box: changed ? { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 } : null,
        png,
      };
    },
    { a: `data:image/png;base64,${before.toString("base64")}`, b: `data:image/png;base64,${after.toString("base64")}`, tolerance },
  );
  return { ...r, percent: r.total ? Math.round((r.changed / r.total) * 100000) / 1000 : 0, png: Buffer.from(r.png, "base64") };
}

/** Every shot present in both runs, as pairs of files. */
export function shotPairs(run, dir, prev, prevDir) {
  const prevPages = new Map(prev.pages.map((p) => [p.route, p]));
  const pairs = [];
  for (const page of run.pages) {
    const was = prevPages.get(page.route);
    if (!was) continue;
    for (const [key, shot] of Object.entries(page.shots ?? {})) {
      const old = was.shots?.[key];
      if (!old) continue;
      const after = join(dir, shot.path);
      const before = join(prevDir, old.path);
      if (existsSync(after) && existsSync(before)) pairs.push({ page, key, shot, before, after });
    }
  }
  return pairs;
}

/**
 * Diff every shared shot and record it: `pages[].diffs[key]`, a PNG in
 * `diffs/`, and a `visual/changed` finding above `threshold` percent.
 */
export async function diffRuns(run, dir, prev, prevDir, { browser, threshold = 0.01, tolerance = 24, log = () => {} }) {
  const pairs = shotPairs(run, dir, prev, prevDir);
  if (!pairs.length) return { compared: 0, changed: 0 };
  const page = await browser.newPage();
  let changedPages = 0;
  try {
    for (const p of pairs) {
      const r = await diffPngs(page, readFileSync(p.before), readFileSync(p.after), { tolerance });
      const file = join("diffs", p.shot.path.split("/").pop());
      mkdirSync(dirname(join(dir, file)), { recursive: true });
      writeFileSync(join(dir, file), r.png);
      const [viewport, theme] = p.key.split("-");
      p.page.diffs ??= {};
      p.page.diffs[p.key] = { path: file, percent: r.percent, width: r.width, height: r.height, box: r.box, sizeChanged: r.before.width !== r.after.width || r.before.height !== r.after.height };
      log(`  ${viewport} ${theme}  ${p.page.route}  ${r.percent}% changed`);
      if (r.percent > threshold) {
        changedPages++;
        run.findings.push({
          id: `v${changedPages}`,
          kind: run.kind,
          domain: "visual",
          rule: "visual/changed",
          severity: "info",
          status: "open",
          title: "This page looks different since the last run",
          detail: "Red in the diff marks every pixel that changed. If the change wasn't meant, it's a regression; if it was, nothing to do.",
          evidence: `${r.percent}% of the page changed${p.page.diffs[p.key].sizeChanged ? ` · ${r.before.width}×${r.before.height} → ${r.after.width}×${r.after.height}` : ""}`,
          page: p.page.route,
          viewport,
          theme,
          shot: p.key,
          box: r.box ? clampBox(r.box, p.shot) : undefined,
          diff: { path: file, width: r.width, height: r.height, box: r.box },
        });
      }
    }
  } finally {
    await page.close();
  }
  return { compared: pairs.length, changed: changedPages };
}

function clampBox(box, shot) {
  const x = Math.min(box.x, shot.width - 1);
  const y = Math.min(box.y, shot.height - 1);
  return { x, y, w: Math.max(1, Math.min(box.w, shot.width - x)), h: Math.max(1, Math.min(box.h, shot.height - y)) };
}

/**
 * Compare the run in `dir` with the one in `prevDir`, write the marks into
 * `dir/findings.json`, and diff the screenshots unless `diff: false`. A browser
 * is launched only when there are shots to diff; if none can launch, the
 * findings are still compared and the diff is skipped with a note.
 */
export async function compareDirs(dir, prevDir, { diff = true, threshold = 0.01, tolerance = 24, browser = null, launch = null, log = (m) => process.stderr.write(m + "\n") } = {}) {
  const run = clearCompare(readRun(dir));
  const prev = readRun(prevDir);
  if (prev.kind !== run.kind) log(`Comparing a ${run.kind} with a ${prev.kind}: findings only one of them looks for will show as new or fixed.`);
  compareRuns(run, prev, { against: relative(dir, prevDir) || "." });

  if (diff && shotPairs(run, dir, prev, prevDir).length) {
    let own = null;
    try {
      if (!browser) {
        const start = launch ?? (await import("./playwright.mjs")).launch;
        own = await start({ root: run.root ?? process.cwd(), log });
      }
      log("Diffing screenshots …");
      run.compare.visual = { threshold, ...(await diffRuns(run, dir, prev, prevDir, { browser: browser ?? own, threshold, tolerance, log })) };
    } catch (err) {
      log(`Screenshots not diffed: ${String(err?.message ?? err).split("\n")[0]}`);
      run.compare.visual = { threshold, compared: 0, changed: 0, skipped: String(err?.message ?? err).split("\n")[0] };
    } finally {
      await own?.close();
    }
  }
  return writeRun(dir, run);
}
