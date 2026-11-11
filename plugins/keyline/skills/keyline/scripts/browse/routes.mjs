/**
 * Every page a product has, found three ways and merged:
 *
 *   1. From the code: the router's own files (Next app and pages routers,
 *      SvelteKit, Astro, Nuxt, Remix/React Router file routes, route objects
 *      and <Route path> in a React Router app, plain .html files).
 *   2. From /sitemap.xml on the running site.
 *   3. From a crawl of the running site: same-origin links, breadth first.
 *
 * A route with a parameter (`/projects/[id]`) can't be visited until someone
 * names an example; it's returned with `dynamic: true` and, when the crawl met a
 * matching URL, that URL as its `sample`.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { walk } from "../check/files.mjs";

/** Route files: what a router reads, and plain HTML. */
const ROUTE_FILES = new Set([".tsx", ".ts", ".jsx", ".js", ".mdx", ".md", ".svelte", ".astro", ".vue", ".html"]);

/** Every route-shaped file under `dir`, as absolute paths, skipping what the detector skips (dependencies, build output, reports, dot-folders). */
const files = (dir) => walk(dir, { accept: ROUTE_FILES, skip: null, maxSize: Infinity }).map((f) => f.abs);

const segs = (rel) => rel.split(sep).filter(Boolean);
const toPath = (parts) => "/" + parts.filter(Boolean).join("/");
const isDynamic = (path) => /\[|:|\$|\*/.test(path);

function readDeps(root) {
  try {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
    return { ...pkg.dependencies, ...pkg.devDependencies };
  } catch {
    return {};
  }
}

/** Next.js app router: every page.* under app/, route groups and slots dropped. */
function nextApp(root) {
  const out = [];
  for (const base of ["app", "src/app"]) {
    const dir = join(root, base);
    for (const file of files(dir)) {
      if (!/[\\/]page\.(tsx|ts|jsx|js|mdx|md)$/.test(file)) continue;
      const all = segs(relative(dir, file)).slice(0, -1);
      // A _private folder opts its whole subtree out of routing.
      if (all.some((s) => s.startsWith("_"))) continue;
      const parts = all.filter((s) => !/^\(.*\)$/.test(s) && !s.startsWith("@"));
      out.push({ path: toPath(parts), file: relative(root, file), source: "next-app" });
    }
  }
  return out;
}

/** Next.js pages router: files under pages/, minus _app, _document, _error and api/. */
function nextPages(root) {
  const out = [];
  for (const base of ["pages", "src/pages"]) {
    const dir = join(root, base);
    for (const file of files(dir)) {
      if (!/\.(tsx|ts|jsx|js|mdx|md)$/.test(file)) continue;
      const parts = segs(relative(dir, file));
      if (parts[0] === "api" || /^_(app|document|error)\./.test(parts.at(-1))) continue;
      parts[parts.length - 1] = parts.at(-1).replace(/\.\w+$/, "");
      if (parts.at(-1) === "index") parts.pop();
      out.push({ path: toPath(parts), file: relative(root, file), source: "next-pages" });
    }
  }
  return out;
}

function sveltekit(root) {
  const dir = join(root, "src/routes");
  return files(dir)
    .filter((f) => /[\\/]\+page\.svelte$/.test(f))
    .map((file) => {
      const parts = segs(relative(dir, file)).slice(0, -1).filter((s) => !/^\(.*\)$/.test(s));
      return { path: toPath(parts), file: relative(root, file), source: "sveltekit" };
    });
}

function astro(root) {
  const dir = join(root, "src/pages");
  return files(dir)
    .filter((f) => /\.(astro|md|mdx|html)$/.test(f))
    .map((file) => {
      const parts = segs(relative(dir, file));
      parts[parts.length - 1] = parts.at(-1).replace(/\.\w+$/, "");
      if (parts.at(-1) === "index") parts.pop();
      return { path: toPath(parts), file: relative(root, file), source: "astro" };
    });
}

function nuxt(root) {
  const dir = join(root, "pages");
  return files(dir)
    .filter((f) => f.endsWith(".vue"))
    .map((file) => {
      const parts = segs(relative(dir, file));
      parts[parts.length - 1] = parts.at(-1).replace(/\.vue$/, "");
      if (parts.at(-1) === "index") parts.pop();
      return { path: toPath(parts), file: relative(root, file), source: "nuxt" };
    });
}

/** Remix and React Router v7 flat routes: app/routes/a.b._index.tsx → /a/b. */
function flatRoutes(root) {
  const dir = join(root, "app/routes");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => /\.(tsx|ts|jsx|js|mdx)$/.test(f) || existsSync(join(dir, f, "route.tsx")))
    .map((name) => {
      const parts = name.replace(/\.(tsx|ts|jsx|js|mdx)$/, "").split(".").filter((s) => s !== "_index" && !s.startsWith("_"));
      return { path: toPath(parts.map((p) => p.replace(/^\$/, ":"))), file: join("app/routes", name), source: "flat-routes" };
    })
    .filter((r) => !r.file.includes("resources") && !r.path.includes("api"));
}

/** React Router route objects and <Route path="…">, read from source text. */
function routerConfig(root) {
  const out = [];
  const re = /(?:<Route[^>]*\spath=|\bpath:\s*)["'`](\/?[^"'`]*)["'`]/g;
  for (const file of files(join(root, "src"))) {
    if (!/\.(tsx|ts|jsx|js)$/.test(file)) continue;
    const text = readFileSync(file, "utf8");
    if (!/react-router|createBrowserRouter|<Route\b/.test(text)) continue;
    for (const m of text.matchAll(re)) {
      if (m[1] === "*" || m[1].startsWith("http")) continue;
      out.push({ path: m[1].startsWith("/") ? m[1] : "/" + m[1], file: relative(root, file), source: "react-router" });
    }
  }
  return out;
}

/** Plain HTML: every .html file outside build output. */
function staticHtml(root) {
  return files(root)
    .filter((f) => f.endsWith(".html"))
    .map((file) => {
      const rel = relative(root, file).split(sep).join("/");
      const path = "/" + rel.replace(/(^|\/)index\.html$/, "$1").replace(/\/$/, "");
      return { path: path || "/", file: rel, source: "html" };
    });
}

/** Routes the code declares. */
export function routesFromCode(root) {
  const deps = readDeps(root);
  const found = [];
  if (deps.next) found.push(...nextApp(root), ...nextPages(root));
  if (deps["@sveltejs/kit"]) found.push(...sveltekit(root));
  if (deps.astro) found.push(...astro(root));
  if (deps.nuxt) found.push(...nuxt(root));
  if (deps["@remix-run/react"] || deps["@react-router/dev"]) found.push(...flatRoutes(root));
  if (deps["react-router"] || deps["react-router-dom"]) found.push(...routerConfig(root));
  if (!found.length) found.push(...staticHtml(root));
  return found.map((r) => ({ ...r, path: r.path.replace(/\/+$/, "") || "/", dynamic: isDynamic(r.path) }));
}

/** Paths listed in the running site's sitemap, same origin only. */
export async function routesFromSitemap(base) {
  try {
    const res = await fetch(new URL("/sitemap.xml", base));
    if (!res.ok) return [];
    const xml = await res.text();
    const origin = new URL(base).origin;
    return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)]
      .map((m) => m[1])
      .filter((u) => u.startsWith(origin))
      .map((u) => ({ path: new URL(u).pathname.replace(/\/+$/, "") || "/", source: "sitemap", dynamic: false }));
  } catch {
    return [];
  }
}

/**
 * Same-origin links, breadth first, read from server HTML. A client-rendered
 * app shows few links this way; capture.mjs adds the links each page renders.
 */
export async function crawl(base, { limit = 40, depth = 2 } = {}) {
  const origin = new URL(base).origin;
  const seen = new Set(["/"]);
  const failed = new Set();
  let frontier = ["/"];
  for (let d = 0; d < depth && frontier.length && seen.size < limit; d++) {
    const next = [];
    for (const path of frontier) {
      let html = "";
      try {
        const res = await fetch(new URL(path, base), { redirect: "follow" });
        if (!res.ok || !(res.headers.get("content-type") ?? "").includes("html")) {
          if (!res.ok) failed.add(path);
          continue;
        }
        html = await res.text();
      } catch {
        failed.add(path);
        continue;
      }
      for (const m of html.matchAll(/<a\b[^>]*\shref=["']([^"'#]+)/gi)) {
        const p = linkPath(m[1], new URL(path, base).href, origin);
        if (p && !seen.has(p) && seen.size < limit) {
          seen.add(p);
          next.push(p);
        }
      }
    }
    frontier = next;
  }
  // The seed is a guess; keep it only if it answered. Linked paths stay: a broken link is a finding, not noise.
  if (failed.has("/")) seen.delete("/");
  return [...seen].map((path) => ({ path, source: "crawl", dynamic: false }));
}

/** A same-origin page path for an href, or null (assets, mail, other sites). */
export function linkPath(href, from, origin) {
  try {
    const u = new URL(href, from);
    if (u.origin !== origin) return null;
    if (/\.(png|jpe?g|gif|svg|webp|avif|ico|pdf|zip|css|js|mjs|json|xml|txt|mp4|webm|woff2?)$/i.test(u.pathname)) return null;
    return u.pathname.replace(/\/index\.html$/, "/").replace(/\/+$/, "") || "/";
  } catch {
    return null;
  }
}

/** Fill a dynamic route from a concrete path that matches its shape. */
function sampleFor(route, paths) {
  // A catch-all ([...slug], *) matches any path, so no known page is an example of it.
  if (/\[\.\.\.|\*/.test(route.path)) return null;
  const re = new RegExp("^" + route.path.split("/").map((s) => (/^\[|^:|^\$/.test(s) ? "[^/]+" : s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))).join("/") + "$");
  return paths.find((p) => re.test(p) && !isDynamic(p)) ?? null;
}

/**
 * Everything, merged: code first (it knows files), then the sitemap and the
 * crawl. Returns `{ routes, dynamic }` — routes to visit, and parameterised
 * routes still waiting for an example.
 */
export async function discover({ root, base = null, limit = 40 } = {}) {
  const code = root ? routesFromCode(root) : [];
  const live = base ? [...(await routesFromSitemap(base)), ...(await crawl(base, { limit }))] : [];
  const byPath = new Map();
  for (const r of [...code, ...live]) {
    const prev = byPath.get(r.path);
    byPath.set(r.path, prev ? { ...prev, sources: [...new Set([...prev.sources, r.source])] } : { ...r, sources: [r.source] });
  }
  const all = [...byPath.values()];
  const concrete = all.filter((r) => !r.dynamic).map((r) => r.path);
  const dynamic = all.filter((r) => r.dynamic).map((r) => ({ ...r, sample: sampleFor(r, concrete) }));
  const routes = all.filter((r) => !r.dynamic).sort((a, b) => a.path.localeCompare(b.path)).slice(0, limit);
  return { routes, dynamic };
}
