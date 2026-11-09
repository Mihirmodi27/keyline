/**
 * Walk a running product: every route × viewport × theme, one fresh browser
 * context per pass. The first pass also follows the links each page renders,
 * so a client-side app's pages are found even when its server HTML shows none.
 *
 * `walk()` returns a run (see findings.mjs) with the pages, their shots and the
 * runtime findings every walk can make: pages that fail to load, error
 * statuses, console errors, uncaught exceptions and failed requests. Callers
 * pass `probes` to measure more inside each page and `judge` to turn what they
 * measured into findings: the audit and the smoke test are both a walk plus
 * their own probes and judges. `probeFor(viewport, theme, route)` adds probes
 * that depend on the pass.
 */
import { add, newRun } from "./findings.mjs";
import { THEMES, openContext, shotKey, visit, withHelpers } from "./capture.mjs";
import { discover } from "./routes.mjs";
import { launch } from "./playwright.mjs";

export async function walk({
  kind = "capture",
  title = null,
  base,
  root = null,
  out,
  routes = null,
  limit = 40,
  viewports = ["desktop", "phone"],
  themes = THEMES,
  probes = [],
  probeFor = null,
  judge = null,
  headless = true,
  reducedMotion = false,
  log = (m) => process.stderr.write(m + "\n"),
}) {
  const run = newRun({ kind, title, base, root });
  const found = routes ? { routes: routes.map((path) => ({ path, sources: ["given"] })), dynamic: [] } : await discover({ root, base, limit });
  const queue = found.routes.map((r) => r.path);
  const known = new Set(queue);
  for (const d of found.dynamic) {
    if (d.sample && !known.has(d.sample)) {
      queue.push(d.sample);
      known.add(d.sample);
    }
  }
  run.dynamic = found.dynamic.map((d) => ({ path: d.path, sample: d.sample, file: d.file ?? null }));

  const browser = await launch({ root: root ?? process.cwd(), headless, log });
  const pages = new Map();
  try {
    let first = true;
    for (const viewport of viewports) {
      for (const theme of themes) {
        const context = await withHelpers(await openContext(browser, { viewport, theme, reducedMotion }));
        for (let i = 0; i < queue.length; i++) {
          const route = queue[i];
          log(`  ${viewport} ${theme}  ${route}`);
          const v = await visit(context, { base, route, out, viewport, theme, probes: probeFor ? [...probes, ...probeFor(viewport, theme, route)] : probes });
          if (first) {
            for (const link of v.links) {
              if (!known.has(link) && known.size < limit) {
                known.add(link);
                queue.push(link);
              }
            }
          }
          const page = pages.get(route) ?? { route, url: v.url, title: v.title, status: v.status, finalUrl: v.finalUrl, shots: {} };
          if (v.shot) page.shots[shotKey(viewport, theme)] = v.shot;
          pages.set(route, page);
          runtimeFindings(run, v, first);
          if (judge) await judge(run, v);
        }
        await context.close();
        first = false;
      }
    }
  } finally {
    await browser.close();
  }
  run.pages = [...pages.values()];
  return run;
}

/** What any walk can say about a page from its load alone. Console and network only on the first pass, so one bug isn't reported four times. */
export function runtimeFindings(run, v, firstPass) {
  const at = { page: v.route, viewport: v.viewport, theme: v.theme, shot: v.shot ? shotKey(v.viewport, v.theme) : undefined };
  if (v.navError) {
    add(run, { ...at, rule: "runtime/load-failed", severity: "error", title: "The page didn't load", evidence: v.navError, detail: "Opening this URL failed or timed out, so nothing on it could be checked." });
    return;
  }
  if (v.status >= 400) {
    add(run, { ...at, rule: "runtime/http-status", severity: "error", title: `The page answers ${v.status}`, evidence: `HTTP ${v.status}`, detail: "A route the product links to or declares returns an error status." });
  }
  if (!firstPass) return;
  for (const e of v.log.pageErrors) {
    add(run, { ...at, rule: "runtime/exception", severity: "error", title: "An uncaught exception on load", evidence: e.text, detail: "Script threw while the page loaded. Whatever ran after it may be missing." });
  }
  // The browser logs every failed request as a console error too; those are reported once, as requests.
  for (const e of v.log.console.filter((c) => c.type === "error" && !/^Failed to load resource/.test(c.text))) {
    add(run, { ...at, rule: "runtime/console-error", severity: "warning", title: "A console error on load", evidence: e.text });
  }
  for (const r of v.log.failedRequests) {
    add(run, {
      ...at,
      rule: "runtime/request-failed",
      severity: r.sameOrigin ? "error" : "warning",
      title: r.sameOrigin ? "A request to the product failed" : "A third-party request failed",
      evidence: `${r.method} ${r.url.slice(0, 160)} → ${r.status ?? r.error}`,
    });
  }
}
