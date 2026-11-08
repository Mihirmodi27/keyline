/**
 * Click everything a person could click, one at a time, from a freshly loaded
 * page, and watch what changes: the URL, the DOM, the network, dialogs, new
 * tabs, downloads, scroll and focus. A click that changes none of them within
 * the quiet window (1.5 s) is a dead click.
 *
 * Every click starts from a fresh load of the route. A click that changed
 * nothing leaves the page as it found it, so the next click reuses that page
 * rather than loading it again; anything that changed the page gets a reload.
 *
 * Clicks that do something get follow-ups on the spot:
 *   - opened a menu or dialog → press Escape: it should close, and focus should come back
 *   - moved to another URL    → press Back: the previous URL and content should return
 *   - moved without a reload  → open that URL fresh: the same content should be there
 */
import { add } from "../browse/findings.mjs";
import { shotKey } from "../browse/capture.mjs";
import { isDestructive } from "./config.mjs";
import { PAGE, similarity } from "./page.mjs";
import { describe, normalUrl, open, openStep, pathOf, sleep } from "./util.mjs";

const IGNORED_TYPES = new Set(["image", "font", "media", "texttrack", "manifest", "other"]);
const stripQuery = (u) => u.replace(/[?#].*$/, "");

/** Which of a page's clickables to try, most likely to be broken first. */
export function plan(inventory, { base, settings, policy, skipped, route }) {
  const out = [];
  const hrefs = new Set();
  const seen = new Set();
  const rank = (c) => (c.kind === "link" ? (c.placeholder ? 1 : c.hashOnly ? 2 : 3) : 0);
  const sorted = [...(inventory?.clickables ?? [])].sort((a, b) => rank(a) - rank(b) || a.i - b.i);
  for (const c of sorted) {
    if (c.isSubmit) continue; // the forms pass submits forms, under its own rules
    if (c.current) continue; // the selected tab, the current page: doing nothing is right
    const key = `${c.sel}|${c.text}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (c.kind === "link" && !c.placeholder) {
      if (!c.sameOrigin) continue; // never leave the product
      if (c.download) continue;
      if (settings.forbidUrl(c.href)) {
        skipped.push({ what: `${describe(c)} on ${route}`, why: "the config forbids its URL" });
        continue;
      }
      const target = normalUrl(c.href);
      if (!c.hashOnly && hrefs.has(target)) continue; // one click per destination is enough
      hrefs.add(target);
    }
    const destructive = isDestructive(c.text, c.context) || (c.href && isDestructive(pathOf(c.href, base).replace(/[/_-]/g, " ")));
    const why = destructive ? policy.blocks({ write: true, destructive: true }) : null;
    if (why) {
      skipped.push({ what: `${describe(c)} on ${route}`, why });
      continue;
    }
    out.push(c);
  }
  if (out.length > settings.maxClicks) {
    skipped.push({ what: `${out.length - settings.maxClicks} more controls on ${route}`, why: `past --max-clicks ${settings.maxClicks}` });
  }
  return out.slice(0, settings.maxClicks);
}

export async function checkClicks({ run, context, base, route, inventory, settings, policy, skipped, log, find }) {
  const controls = plan(inventory, { base, settings, policy, skipped, route });
  if (!controls.length) return;
  log(`  clicks ${route}  ${controls.length} controls`);
  const origin = new URL(base).origin;
  const at = (c) => ({ page: route, viewport: "desktop", theme: "light", shot: shotKey("desktop", "light"), box: c.box, selector: c.sel, ...(find?.(c) ?? {}) });
  const quiet = settings.quietMs;
  const deadPlaceholders = [];
  let backChecks = { soft: 0, hard: 0 };
  let current = null;
  let dirty = true;

  const fresh = async () => {
    await current?.page.close().catch(() => {});
    const opened = await open(context, { base, route });
    const flags = { armed: false, requests: [], baseline: new Set(), popup: false, download: false, dialog: null, errors: [], failed: [] };
    const page = opened.page;
    page.on("request", (req) => {
      const url = req.url();
      if (!flags.armed) {
        flags.baseline.add(stripQuery(url));
        return;
      }
      if (IGNORED_TYPES.has(req.resourceType()) || flags.baseline.has(stripQuery(url))) return;
      flags.requests.push(`${req.method()} ${pathOf(url, base)}`);
    });
    page.on("popup", (p) => {
      if (flags.armed) flags.popup = true;
      p.close().catch(() => {});
    });
    page.on("download", (d) => {
      if (flags.armed) flags.download = true;
      d.cancel().catch(() => {});
    });
    page.on("dialog", (d) => {
      if (flags.armed) flags.dialog = `${d.type()}: ${d.message().slice(0, 120)}`;
    });
    page.on("pageerror", (err) => flags.armed && flags.errors.push(String(err?.message ?? err).slice(0, 300)));
    page.on("response", (res) => {
      if (flags.armed && res.status() >= 500 && res.url().startsWith(origin)) flags.failed.push(`${res.request().method()} ${pathOf(res.url(), base)} → ${res.status()}`);
    });
    page.on("requestfailed", (req) => {
      const e = req.failure()?.errorText ?? "";
      if (flags.armed && req.url().startsWith(origin) && !/ERR_ABORTED/.test(e)) flags.failed.push(`${req.method()} ${pathOf(req.url(), base)} → ${e}`);
    });
    current = { page, flags };
    dirty = false;
    return current;
  };

  for (const c of controls) {
    if (dirty || !current) await fresh();
    const { page, flags } = current;
    const steps = [openStep(route), `Click ${describe(c)}`];

    const marked = await page.evaluate(PAGE.mark, { match: { sel: c.sel, text: c.text, tag: c.tag } }).catch(() => null);
    if (!marked) {
      dirty = true;
      continue;
    }
    if (settings.forbidSelectors.length) {
      const forbidden = await page.$eval("[data-keyline-target]", (el, sels) => sels.some((s) => { try { return Boolean(el.closest(s)); } catch { return false; } }), settings.forbidSelectors).catch(() => false);
      if (forbidden) {
        skipped.push({ what: `${describe(c)} on ${route}`, why: "the config forbids its selector" });
        continue;
      }
    }
    const target = page.locator("[data-keyline-target]").first();
    await target.scrollIntoViewIfNeeded({ timeout: 2000 }).catch(() => {});
    await page.evaluate(PAGE.watch).catch(() => {});
    await sleep(350); // baseline: whatever moves on its own now is noise later
    const urlBefore = page.url();
    const armed = await page.evaluate(PAGE.arm).catch(() => null);
    Object.assign(flags, { armed: true, requests: [], popup: false, download: false, dialog: null, errors: [], failed: [] });

    try {
      await target.click({ timeout: 2500 });
    } catch (err) {
      flags.armed = false;
      const msg = String(err?.message ?? err);
      if (/intercepts pointer events/.test(msg)) {
        const by = msg.match(/<[^>]+>/)?.[0]?.slice(0, 120) ?? "another element";
        add(run, {
          ...at(c),
          rule: "flow/click-blocked",
          severity: "error",
          title: `Something covers ${describe(c)}`,
          evidence: `the click lands on ${by}`,
          detail: "A pointer can't reach this control: another element sits on top of it. Usually an overlay, a sticky bar or a transparent box that should have `pointer-events: none`.",
          steps: [...steps, `The click lands on ${by} instead`],
        });
      }
      dirty = true;
      continue;
    }

    const t0 = Date.now();
    let read = null;
    let effect = null;
    for (;;) {
      await sleep(150);
      effect = null;
      if (flags.popup) effect = "opened a new tab";
      else if (flags.download) effect = "started a download";
      else if (flags.dialog) effect = `opened a browser ${flags.dialog}`;
      else if (normalUrl(page.url()) !== normalUrl(urlBefore)) effect = `moved to ${pathOf(page.url(), base)}`;
      if (!effect) {
        read = await page.evaluate(PAGE.read).catch(() => ({ gone: true }));
        if (read.gone) effect = "loaded a new document";
        else if (read.opened) effect = "opened something";
        else if (read.mutations > 0) effect = `changed the page (${read.samples[0] ?? "DOM"})`;
        else if (read.focusMoved) effect = `moved focus to ${read.focusTo}`;
        else if (read.scrolled) effect = "scrolled the page";
        else if (flags.requests.length) effect = `sent ${flags.requests[0]}`;
      }
      if (effect || Date.now() - t0 >= quiet) break;
    }
    if (!effect) {
      flags.armed = false;
      if (c.placeholder) deadPlaceholders.push(c);
      else {
        add(run, {
          ...at(c),
          rule: "flow/dead-click",
          severity: "error",
          title: `Clicking ${describe(c)} does nothing`,
          evidence: `no URL change, DOM change, request, dialog or focus move within ${quiet / 1000} s`,
          detail: "It looks clickable and isn't. Wire it to what it promises, or stop it looking like a control.",
          steps: [...steps, `Wait ${quiet / 1000} s: nothing on the page, the URL or the network changes`],
        });
      }
      continue;
    }

    // Something happened. Let it finish, then look closer.
    await sleep(350);
    flags.armed = false;
    const urlAfter = page.url();
    const moved = normalUrl(urlAfter) !== normalUrl(urlBefore);
    const sameOrigin = urlAfter.startsWith(origin);
    const final = moved ? null : await page.evaluate(PAGE.read).catch(() => ({ gone: true }));
    const did = `${effect[0].toUpperCase()}${effect.slice(1)}`;

    for (const e of flags.errors) {
      add(run, { ...at(c), rule: "runtime/click-exception", severity: "error", title: `Clicking ${describe(c)} throws an error`, evidence: e, detail: "Script fails when this control is used; whatever it was meant to do may be half done.", steps: [...steps, `An uncaught exception: ${e.slice(0, 120)}`] });
    }
    for (const f of flags.failed.slice(0, 2)) {
      add(run, { ...at(c), rule: "runtime/click-request-failed", severity: "error", title: `Clicking ${describe(c)} sends a request that fails`, evidence: f, steps: [...steps, `The request fails: ${f}`] });
    }

    // Escape should close what the click opened, and hand focus back.
    if (final && !final.gone && final.opened) {
      await page.keyboard.press("Escape");
      await sleep(400);
      const after = await page.evaluate(PAGE.afterEscape).catch(() => null);
      if (after) {
        const stillOpen = after.overlays.length > final.overlaysBefore || (final.expandedBefore === "false" && after.expanded === "true");
        if (stillOpen) {
          add(run, {
            ...at(c),
            rule: "flow/escape-ignored",
            severity: "warning",
            title: `Escape doesn't close what ${describe(c)} opens`,
            evidence: final.overlays.length ? `still open: ${after.overlays.slice(-1)[0] ?? final.overlays.slice(-1)[0]}` : 'aria-expanded stays "true"',
            detail: "Keyboard and screen-reader users close menus and dialogs with Escape; without it they're stuck inside or must hunt for a close button.",
            fix: "/keyline patterns",
            steps: [...steps, did, "Press Escape", "It stays open"],
          });
        } else if (!after.focusOnTarget && final.targetConnected) {
          add(run, {
            ...at(c),
            rule: "flow/focus-not-returned",
            severity: "warning",
            title: `Closing what ${describe(c)} opens loses focus`,
            evidence: `focus is on ${after.focus ?? "nothing"} after Escape`,
            detail: "When a menu or dialog closes, focus should return to the control that opened it, so a keyboard user carries on from where they were.",
            fix: "/keyline patterns",
            steps: [...steps, did, "Press Escape", `Focus lands on ${after.focus ?? "the page"}, not the control`],
          });
        }
      }
    }

    if (moved && sameOrigin) {
      // The watcher survives only when the click moved without loading a new document.
      const soft = await page.evaluate(() => Boolean(window.__klWatch)).catch(() => false);
      // Moved without a new document: the URL must be enough to get this view back.
      if (soft && settings.checks.has("stuck")) {
        const wordsAfter = await page.evaluate(PAGE.words).catch(() => []);
        const deep = await open(context, { base, route: urlAfter });
        const wordsDeep = deep.error ? [] : await deep.page.evaluate(PAGE.words).catch(() => []);
        await deep.page.close().catch(() => {});
        const sim = similarity(wordsAfter, wordsDeep);
        if (deep.error || (deep.status ?? 200) >= 400 || sim < 0.5) {
          add(run, {
            ...at(c),
            rule: "flow/state-lost",
            severity: deep.status >= 400 || deep.error ? "error" : "warning",
            title: `The view ${describe(c)} opens is lost on reload`,
            evidence: deep.error ?? (deep.status >= 400 ? `${pathOf(urlAfter, base)} answers ${deep.status}` : `${Math.round(sim * 100)}% of the words match after opening ${pathOf(urlAfter, base)} directly`),
            detail: "The click changed the URL without loading a page, but loading that URL fresh — a reload, a shared link, a bookmark — doesn't show the same thing.",
            steps: [...steps, `The URL becomes ${pathOf(urlAfter, base)}`, "Reload, or open that URL in a new tab", deep.status >= 400 ? `It answers ${deep.status}` : "Different content shows"],
          });
        }
      }
      // Back should undo the move.
      const budget = soft ? backChecks.soft < 6 : backChecks.hard < 2;
      if (budget && settings.checks.has("back")) {
        soft ? backChecks.soft++ : backChecks.hard++;
        await page.waitForLoadState("load", { timeout: 10000 }).catch(() => {});
        await page.goBack({ waitUntil: "load", timeout: 10000 }).catch(() => null);
        await page.waitForLoadState("networkidle", { timeout: 2500 }).catch(() => {});
        await sleep(300);
        const urlBack = page.url();
        const wordsBack = await page.evaluate(PAGE.words).catch(() => []);
        const sim = similarity(armed?.words ?? [], wordsBack);
        if (normalUrl(urlBack) !== normalUrl(urlBefore)) {
          add(run, {
            ...at(c),
            rule: "flow/back-broken",
            severity: "error",
            title: `Back doesn't return from where ${describe(c)} goes`,
            evidence: `back lands on ${urlBack === "about:blank" ? "a blank page" : pathOf(urlBack, base)}, not ${pathOf(urlBefore, base)}`,
            detail: "The browser's Back button should undo a move. Here it skips the page or leaves the product — usually `history.replaceState` where `pushState` was meant, or a redirect that adds a history entry.",
            steps: [...steps, `The URL becomes ${pathOf(urlAfter, base)}`, "Press the browser's Back button", `It lands on ${pathOf(urlBack, base)}`],
          });
        } else if (sim < 0.5) {
          add(run, {
            ...at(c),
            rule: "flow/back-broken",
            severity: "warning",
            title: `Back returns to the URL but not the page ${describe(c)} left`,
            evidence: `${Math.round(sim * 100)}% of the words match the page before the click`,
            detail: "The address is right but the content isn't: the app doesn't render from the URL when history moves.",
            steps: [...steps, `The URL becomes ${pathOf(urlAfter, base)}`, "Press the browser's Back button", "The URL is back but the content differs"],
          });
        }
      }
    }
    dirty = true;
  }
  await current?.page.close().catch(() => {});

  if (deadPlaceholders.length) {
    const first = deadPlaceholders[0];
    const names = deadPlaceholders.map((c) => `“${c.text || c.sel}”`);
    add(run, {
      ...at(first),
      rule: "flow/dead-click",
      severity: "error",
      title: deadPlaceholders.length === 1 ? `The link ${names[0]} goes nowhere` : `${deadPlaceholders.length} links go nowhere`,
      evidence: `${names.slice(0, 8).join(", ")}${names.length > 8 ? ", …" : ""} — href="${first.hrefRaw}" and no handler`,
      detail: "Placeholder links: they look like navigation and click to nothing. Give each its real URL, or make it a button that does something.",
      steps: [openStep(route), `Click ${describe(first)}`, `Wait ${quiet / 1000} s: nothing changes`],
    });
  }
  run.stats.clicks += controls.length;
}
