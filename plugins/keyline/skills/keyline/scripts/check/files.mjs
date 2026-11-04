/**
 * Which files the detector reads. The same skips as scan.mjs, so the two never
 * disagree about what counts as the project's interface.
 */
import { readdirSync, statSync } from "node:fs";
import { extname, join, relative, sep } from "node:path";

export const SKIP_DIRS = new Set([
  "node_modules", ".git", ".next", ".nuxt", ".output", ".svelte-kit", ".turbo",
  ".vercel", ".cache", "dist", "build", "out", "coverage", "vendor",
  "storybook-static", ".claude", ".agents", "public", "static",
]);
export const STYLE = new Set([".css", ".scss", ".sass", ".less", ".pcss"]);
export const MARKUP = new Set([".tsx", ".jsx", ".ts", ".js", ".mjs", ".vue", ".svelte", ".astro", ".html", ".mdx"]);
const SKIP_FILES = /\.(min|d|test|spec|stories|config)\.[a-z]+$|^(eslint|postcss|tailwind|next|vite|vitest|jest|playwright)\.config\./;

/** Every style and markup file under `paths`, relative to `root`, minus ignores. */
export function collect(root, paths, ignores) {
  const out = [];
  const ignored = (rel) => ignores.some((ig) => ig && (rel === ig || rel.startsWith(ig.endsWith("/") ? ig : ig + "/")));
  const visit = (abs) => {
    const rel = relative(root, abs).split(sep).join("/");
    if (rel && ignored(rel)) return;
    let st;
    try {
      st = statSync(abs);
    } catch {
      return;
    }
    if (st.isDirectory()) {
      const name = abs.split(sep).pop();
      if (rel && (SKIP_DIRS.has(name) || (name.startsWith(".") && name !== ".storybook"))) return;
      for (const e of readdirSync(abs)) visit(join(abs, e));
      return;
    }
    const ext = extname(abs);
    if (!(STYLE.has(ext) || MARKUP.has(ext))) return;
    if (SKIP_FILES.test(abs.split(sep).pop())) return;
    if (st.size > 400_000) return; // generated bundles, not source
    out.push({ abs, rel: rel || abs.split(sep).pop(), ext, kind: STYLE.has(ext) ? "style" : "markup" });
  };
  for (const p of paths) visit(p);
  return out;
}
