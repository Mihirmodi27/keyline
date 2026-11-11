/**
 * Which files Keyline reads. One walker for the detector (check.mjs) and the
 * inventory (scan.mjs), so the two skip the same folders and match ignores the
 * same way; each passes only the extensions and filters its job needs.
 */
import { readdirSync, statSync } from "node:fs";
import { basename, extname, join, relative, sep } from "node:path";

/** Dependencies, build output, served assets and reports. Dot-folders are skipped wholesale, bar `.storybook`. */
export const SKIP_DIRS = new Set([
  "node_modules", "dist", "build", "out", "coverage", "vendor", "storybook-static", "public", "static",
  "keyline-report", "smoke-report",
]);
export const STYLE = new Set([".css", ".scss", ".sass", ".less", ".pcss"]);
export const MARKUP = new Set([".tsx", ".jsx", ".ts", ".js", ".mjs", ".vue", ".svelte", ".astro", ".html", ".mdx"]);
/** Minified, declaration, test and story files: generated, or not the interface. */
export const GENERATED = /\.(min|test|spec|stories)\.|\.d\.[a-z]+$/;
/** Tool configs. Not the interface, though a Tailwind config holds theme values. */
export const CONFIG = /\.config\.[a-z]+$|^(eslint|postcss|tailwind|next|vite|vitest|jest|playwright)\.config\./;

const clean = (ig) => ig.replace(/\\/g, "/").replace(/^\.\//, "").replace(/\/+$/, "");

/** A test for paths relative to the root: `src/content` drops `src/content/a.tsx`, never `src/contentful`. */
export function ignoredBy(ignores = []) {
  const list = ignores.map(clean).filter(Boolean);
  return (rel) => list.some((ig) => rel === ig || rel.startsWith(ig + "/"));
}

/**
 * Every file under `paths` whose extension is in `accept` and whose name `skip`
 * doesn't match, up to `maxSize` bytes (bigger is a bundle, not source). Folders
 * in SKIP_DIRS and dot-folders are passed over unless named in `paths`;
 * symlinked folders aren't followed.
 * @returns {{ abs: string, rel: string, ext: string }[]} rel is relative to root, with `/`
 */
export function walk(root, { paths = [root], accept, skip = GENERATED, maxSize = 400_000, ignores = [] }) {
  const out = [];
  const ignored = ignoredBy(ignores);
  const rel = (abs) => relative(root, abs).split(sep).join("/");
  const file = (abs, name, size) => {
    const ext = extname(name);
    if (!accept.has(ext) || skip?.test(name)) return;
    if ((size ?? statSync(abs).size) > maxSize) return;
    out.push({ abs, rel: rel(abs) || name, ext });
  };
  const dir = (abs) => {
    let entries;
    try {
      entries = readdirSync(abs, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const child = join(abs, e.name);
      if (ignored(rel(child))) continue;
      if (e.isDirectory()) {
        if (!SKIP_DIRS.has(e.name) && (!e.name.startsWith(".") || e.name === ".storybook")) dir(child);
      } else {
        try {
          file(child, e.name);
        } catch {}
      }
    }
  };
  for (const p of paths) {
    const r = rel(p);
    if (r && ignored(r)) continue;
    let st;
    try {
      st = statSync(p);
    } catch {
      continue;
    }
    if (st.isDirectory()) dir(p);
    else file(p, basename(p), st.size);
  }
  return out;
}

const DETECTOR_SKIP = new RegExp(`${GENERATED.source}|${CONFIG.source}`);

/** The detector's files: style and markup, minus generated files and tool configs. */
export function collect(root, paths, ignores) {
  return walk(root, { paths, ignores, accept: new Set([...STYLE, ...MARKUP]), skip: DETECTOR_SKIP }).map((f) => ({
    ...f,
    kind: STYLE.has(f.ext) ? "style" : "markup",
  }));
}
