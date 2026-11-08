/**
 * Visit a page the way a reader would, and keep what the run needs: the HTTP
 * status, console errors, uncaught exceptions, failed requests, the links the
 * page actually rendered, a full-page screenshot, and whatever the caller's
 * probes measure inside the page.
 *
 * A probe is `{ name, fn }`: `fn` runs in the page (Playwright's
 * `page.evaluate`) after the page has settled and been scrolled through, and
 * returns plain data. The audit's checks and the smoke test's element
 * inventory are probes; the core knows nothing about either.
 */
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { linkPath } from "./routes.mjs";

export const VIEWPORTS = {
  desktop: { name: "desktop", width: 1440, height: 900, isMobile: false, hasTouch: false },
  phone: { name: "phone", width: 390, height: 844, isMobile: true, hasTouch: true },
};

export const THEMES = ["light", "dark"];

/** A screenshot taller than this is clipped: a 40,000px page is a bug, not a picture. */
const MAX_SHOT_HEIGHT = 9000;

export function shotKey(viewport, theme) {
  return `${viewport}-${theme}`;
}

export function shotFile(route, viewport, theme) {
  const slug = route === "/" ? "home" : route.replace(/^\//, "").replace(/[^a-z0-9]+/gi, "-").replace(/-+$/, "").toLowerCase();
  return join("shots", `${slug}--${viewport}-${theme}.png`);
}

/**
 * One browser context per viewport × theme: colour scheme and touch are
 * context-wide, and a fresh context means no state leaks between passes.
 */
export async function openContext(browser, { viewport = "desktop", theme = "light", reducedMotion = false, storageState } = {}) {
  const vp = VIEWPORTS[viewport] ?? viewport;
  return browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: vp.isMobile,
    hasTouch: vp.hasTouch,
    colorScheme: theme,
    reducedMotion: reducedMotion ? "reduce" : "no-preference",
    deviceScaleFactor: 1,
    storageState,
  });
}

/** Scroll to the bottom in steps and back, so lazy images and reveal-on-scroll content are present. */
async function settle(page) {
  await page.evaluate(async () => {
    const step = Math.max(400, Math.floor(window.innerHeight * 0.8));
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    for (let y = 0; y < document.documentElement.scrollHeight && y < 40000; y += step) {
      window.scrollTo(0, y);
      await wait(60);
    }
    window.scrollTo(0, 0);
    await wait(120);
    await document.fonts?.ready;
  });
}

/**
 * Wire a page's listeners. Returned arrays fill as the page runs, so a smoke
 * step can read them before and after a click.
 */
export function listen(page, origin) {
  const log = { console: [], pageErrors: [], failedRequests: [] };
  page.on("console", (msg) => {
    if (msg.type() === "error" || msg.type() === "warning") log.console.push({ type: msg.type(), text: msg.text().slice(0, 500), at: msg.location()?.url ?? null });
  });
  page.on("pageerror", (err) => log.pageErrors.push({ text: String(err?.message ?? err).slice(0, 500) }));
  page.on("requestfailed", (req) => {
    const failure = req.failure()?.errorText ?? "failed";
    if (/ERR_ABORTED/.test(failure)) return; // navigations and cancelled prefetches
    log.failedRequests.push({ url: req.url(), method: req.method(), status: null, error: failure, sameOrigin: req.url().startsWith(origin) });
  });
  page.on("response", (res) => {
    if (res.status() >= 400) log.failedRequests.push({ url: res.url(), method: res.request().method(), status: res.status(), error: null, sameOrigin: res.url().startsWith(origin) });
  });
  return log;
}

/**
 * Visit one route in an open context. Returns the page record for
 * findings.json plus the raw logs and probe results for the caller to judge.
 */
export async function visit(context, { base, route, out, viewport = "desktop", theme = "light", probes = [], shoot = true, timeout = 30000 }) {
  const page = await context.newPage();
  const origin = new URL(base).origin;
  const log = listen(page, origin);
  const url = new URL(route, base).href;
  let status = null;
  let navError = null;
  try {
    const res = await page.goto(url, { waitUntil: "load", timeout });
    status = res?.status() ?? null;
    await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
    await settle(page);
  } catch (err) {
    navError = String(err?.message ?? err).split("\n")[0];
  }

  const title = await page.title().catch(() => "");
  const finalUrl = page.url();
  const links = navError
    ? []
    : [
        ...new Set(
          (await page.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href"))).catch(() => []))
            .map((h) => linkPath(h, finalUrl, origin))
            .filter(Boolean),
        ),
      ];

  const results = {};
  if (!navError) {
    for (const probe of probes) {
      try {
        results[probe.name] = await page.evaluate(probe.fn, probe.arg);
      } catch (err) {
        results[probe.name] = { error: String(err?.message ?? err).split("\n")[0] };
      }
    }
  }

  let shot = null;
  if (shoot && !navError) {
    const file = shotFile(route, viewport, theme);
    mkdirSync(dirname(join(out, file)), { recursive: true });
    const size = await page.evaluate(() => ({ w: document.documentElement.clientWidth, h: document.documentElement.scrollHeight }));
    const height = Math.min(size.h, MAX_SHOT_HEIGHT);
    await page.screenshot({ path: join(out, file), fullPage: true, animations: "disabled", clip: { x: 0, y: 0, width: size.w, height } });
    shot = { path: file, width: size.w, height, clipped: size.h > MAX_SHOT_HEIGHT };
  }

  await page.close();
  return { route, url, finalUrl, title, status, navError, links, log, results, shot, viewport, theme };
}

/** Selector for an element, short enough to read and stable enough to find again. Runs in the page. */
export const SELECTOR_HELPER = `
window.__keylineSelector = function (el) {
  if (!(el instanceof Element)) return null;
  if (el.id && /^[A-Za-z][\\w-]*$/.test(el.id)) return '#' + el.id;
  const parts = [];
  while (el && el.nodeType === 1 && parts.length < 5) {
    let part = el.localName;
    const testId = el.getAttribute('data-testid');
    if (testId) { parts.unshift(part + '[data-testid="' + testId + '"]'); break; }
    const cls = [...el.classList].filter((c) => /^[A-Za-z][\\w-]*$/.test(c) && c.length < 30).slice(0, 2);
    if (cls.length) part += '.' + cls.join('.');
    const parent = el.parentElement;
    if (parent) {
      const same = [...parent.children].filter((c) => c.localName === el.localName);
      if (same.length > 1) part += ':nth-of-type(' + (same.indexOf(el) + 1) + ')';
    }
    parts.unshift(part);
    if (el.id) break;
    el = parent;
  }
  return parts.join(' > ');
};
window.__keylineBox = function (el) {
  const r = el.getBoundingClientRect();
  return { x: Math.round(r.left + window.scrollX), y: Math.round(r.top + window.scrollY), w: Math.round(r.width), h: Math.round(r.height) };
};
`;

/** Install the helpers on every page of a context, before any probe runs. */
export async function withHelpers(context) {
  await context.addInitScript(SELECTOR_HELPER);
  return context;
}
