/**
 * Every same-origin link, requested once: what it answers, and how many
 * redirects it takes to get there. A link that ends in 4xx or 5xx is broken;
 * two or more redirects is a chain worth flattening; a URL seen twice in one
 * chain is a loop no browser will finish.
 */
import { add } from "../browse/findings.mjs";
import { shotKey } from "../browse/capture.mjs";
import { isDestructivePath } from "./config.mjs";
import { openStep, pathOf, pool } from "./util.mjs";

const MAX_HOPS = 8;

/** Follow one URL's redirects by hand, so each hop is seen. */
export async function follow(request, url) {
  const chain = [];
  let current = url;
  for (let hop = 0; hop <= MAX_HOPS; hop++) {
    if (chain.some((c) => c.url === current)) return { chain, status: chain.at(-1)?.status ?? null, loop: true };
    let res;
    try {
      res = await request.fetch(current, { method: "GET", maxRedirects: 0, failOnStatusCode: false, timeout: 15000 });
    } catch (err) {
      chain.push({ url: current, status: null, error: String(err?.message ?? err).split("\n")[0] });
      return { chain, status: null, error: chain.at(-1).error };
    }
    const status = res.status();
    chain.push({ url: current, status });
    const location = res.headers()["location"];
    await res.dispose().catch(() => {});
    if (status >= 300 && status < 400 && location) {
      current = new URL(location, current).href;
      continue;
    }
    return { chain, status };
  }
  return { chain, status: chain.at(-1)?.status ?? null, tooLong: true };
}

/**
 * `inventories` is route → the desktop inventory. Adds findings to `run`;
 * returns the broken target paths so the walk's own 404 findings for them can
 * be folded into these.
 */
export async function checkLinks({ run, request, base, inventories, settings, skipped, log }) {
  const targets = new Map(); // href → [{ route, link }]
  for (const [route, inv] of inventories) {
    for (const link of inv?.links ?? []) {
      if (!link.sameOrigin) continue;
      if (!targets.has(link.href)) targets.set(link.href, []);
      const list = targets.get(link.href);
      const same = list.find((t) => t.route === route);
      if (!same) list.push({ route, link });
      else if (!same.link.visible && link.visible) same.link = link; // outline the copy a reader can see
    }
  }
  const hrefs = [...targets.keys()].filter((href) => {
    if (settings.forbidUrl(href)) {
      skipped.push({ what: `link ${pathOf(href, base)}`, why: "the config forbids it" });
      return false;
    }
    // Following /logout or /delete/42 with GET can do exactly that, and the request shares the session.
    if (isDestructivePath(href) && !settings.allowWrites) {
      skipped.push({ what: `link ${pathOf(href, base)}`, why: "its URL looks destructive; --allow-writes includes it" });
      return false;
    }
    return true;
  });
  log(`  links  ${hrefs.length} same-origin targets`);
  const results = new Map();
  await pool(hrefs, 6, async (href) => results.set(href, await follow(request, href)));

  const broken = new Set();
  for (const [href, r] of results) {
    const redirects = r.chain.filter((c) => c.status >= 300 && c.status < 400).length;
    const path = pathOf(href, base);
    const hops = r.chain.map((c) => `${pathOf(c.url, base)} ${c.status ?? c.error}`).join(" → ");
    for (const { route, link } of targets.get(href)) {
      const at = {
        page: route,
        viewport: "desktop",
        theme: "light",
        shot: link.box ? shotKey("desktop", "light") : undefined,
        box: link.box ?? undefined,
        selector: link.sel,
      };
      const click = `${link.visible ? "Click" : "Find (it's hidden at this width)"} the link “${link.text || path}”`;
      if (r.loop) {
        add(run, { ...at, rule: "flow/redirect-loop", severity: "error", title: `A link redirects in a circle: ${path}`, evidence: hops, steps: [openStep(route), click, "The browser gives up: the redirects come back to a URL already visited"], detail: "Following this link never arrives anywhere; browsers stop and show an error page." });
      } else if (r.error) {
        add(run, { ...at, rule: "flow/broken-link", severity: "error", title: `A link fails to load: ${path}`, evidence: hops, steps: [openStep(route), click, `The request fails: ${r.error}`] });
        broken.add(new URL(r.chain.at(-1).url).pathname);
      } else if (r.status >= 400) {
        const final = r.chain.at(-1).url;
        add(run, {
          ...at,
          rule: "flow/broken-link",
          severity: "error",
          title: `A link leads to a ${r.status}: ${path}`,
          evidence: hops,
          detail: r.status >= 500 ? "The page this link opens fails on the server." : "The page this link opens doesn't exist. Fix the href or restore the page.",
          steps: [openStep(route), click, `It answers ${r.status}${final !== href ? ` at ${pathOf(final, base)}` : ""}`],
        });
        broken.add(new URL(final).pathname.replace(/\/+$/, "") || "/");
      } else if (r.tooLong || redirects >= 2) {
        add(run, {
          ...at,
          rule: "flow/redirect-chain",
          severity: "warning",
          title: `A link takes ${redirects} redirects to arrive: ${path}`,
          evidence: hops,
          detail: "Each hop is a round trip before the page starts loading. Point the link at where it ends up.",
          steps: [openStep(route), click, `It redirects ${redirects} times before answering`],
        });
      }
    }
  }
  run.stats.links = results.size;
  return broken;
}
