/** Small things every smoke pass shares: a worker pool, a fresh page, steps in words, and finding the source. */
import { existsSync, readFileSync } from "node:fs";
import { walk } from "../check/files.mjs";
import { VIEWPORTS, listen } from "../browse/capture.mjs";

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Run `fn` over `items`, `n` at a time. */
export async function pool(items, n, fn) {
  const out = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i], i);
    }
  };
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, worker));
  return out;
}

/** Open a route in a fresh page and let it settle. Returns the page, its log and the response status. */
export async function open(context, { base, route, timeout = 30000, idle = 2500 }) {
  const page = await context.newPage();
  const log = listen(page, new URL(base).origin);
  page.on("dialog", (d) => d.dismiss().catch(() => {}));
  let status = null;
  let error = null;
  try {
    const res = await page.goto(new URL(route, base).href, { waitUntil: "load", timeout });
    status = res?.status() ?? null;
    await page.waitForLoadState("networkidle", { timeout: idle }).catch(() => {});
  } catch (err) {
    error = String(err?.message ?? err).split("\n")[0];
  }
  return { page, log, status, error };
}

/** The first step of every reproduction. */
export function openStep(route, viewport = "desktop") {
  const vp = VIEWPORTS[viewport];
  return `Open ${route} at ${viewport} width (${vp.width}×${vp.height})`;
}

/** How a person would name a control in a step: its words, then what it is. */
export function describe(c) {
  const what = c.kind === "link" ? "link" : c.role ? c.role : c.tag === "summary" ? "disclosure" : c.kind === "pointer" ? `clickable ${c.tag}` : "button";
  const words = c.text ? `“${c.text}”` : "with no name";
  return `the ${what} ${words}`;
}

/** URL without a bare trailing "#", so `href="#"` doesn't count as moving. */
export function normalUrl(u) {
  return String(u ?? "").replace(/#$/, "");
}

export function pathOf(url, base) {
  try {
    const u = new URL(url, base);
    return u.origin === new URL(base).origin ? u.pathname + u.search + u.hash : u.href;
  } catch {
    return url;
  }
}

/* ── Pointing at the source ──────────────────────────────────────────────── */

const SOURCE = new Set([".html", ".htm", ".js", ".jsx", ".ts", ".tsx", ".vue", ".svelte", ".astro", ".md", ".mdx"]);

/**
 * Find where an element is written, by its id, its text or a class from its
 * selector. Cheap and best-effort: the first file and line that mentions it.
 * Files are walked as the detector walks them, the first time one is asked for.
 */
export function sourceFinder(root) {
  if (!root || !existsSync(root)) return () => null;
  let files = null;
  const load = () => {
    files = [];
    for (const f of walk(root, { accept: SOURCE }).slice(0, 3000)) {
      try {
        files.push({ path: f.rel, lines: readFileSync(f.abs, "utf8").split("\n") });
      } catch {
        // Unreadable: not a source to point at.
      }
    }
  };
  const find = (needle) => {
    for (const f of files) {
      const i = f.lines.findIndex((l) => l.includes(needle));
      if (i >= 0) return { file: f.path, line: i + 1 };
    }
    return null;
  };
  return ({ sel, text } = {}) => {
    if (!files) load();
    const id = sel?.match(/#([A-Za-z][\w-]*)/)?.[1];
    if (id) {
      const hit = find(`id="${id}"`) ?? find(`id='${id}'`) ?? find(`id={"${id}"}`);
      if (hit) return hit;
    }
    if (text && text.length >= 4 && text.length <= 60) {
      const hit = find(`>${text}<`) ?? find(`"${text}"`) ?? find(text);
      if (hit) return hit;
    }
    const cls = sel?.match(/\.([A-Za-z][\w-]{2,})/g)?.map((c) => c.slice(1)).filter((c) => !/^(is|has)-/.test(c));
    for (const c of cls ?? []) {
      const hit = find(`"${c}"`) ?? find(` ${c}"`) ?? find(`"${c} `) ?? find(` ${c} `);
      if (hit) return hit;
    }
    return null;
  };
}
