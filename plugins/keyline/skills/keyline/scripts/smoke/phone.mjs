/**
 * The phone pass: at 390px, is the page still one screen wide, and can a
 * person still reach every place the desktop navigation goes? Links hidden at
 * phone width need a menu button that shows them, and the menu it opens
 * should close on Escape.
 */
import { add } from "../browse/findings.mjs";
import { shotKey } from "../browse/capture.mjs";
import { PAGE } from "./page.mjs";
import { describe, open, openStep, pathOf, sleep } from "./util.mjs";

const MENU_WORDS = /\b(menu|nav|navigation|open menu|toggle|more)\b|☰|≡/i;

function toggleScore(c) {
  let s = 0;
  if (c.expanded != null) s += 4;
  if (c.controls) s += 3;
  if (c.haspopup) s += 2;
  if (MENU_WORDS.test(c.text)) s += 3;
  if (c.inNav) s += 1;
  if (c.box.y < 140) s += 1;
  return s;
}

export async function checkPhone({ run, context, base, route, desktop, phone, find, log }) {
  const at = { page: route, viewport: "phone", theme: "light", shot: shotKey("phone", "light") };
  if (phone?.overflow) {
    const o = phone.overflow;
    add(run, {
      ...at,
      box: o.culprit?.box,
      selector: o.culprit?.sel,
      ...(o.culprit ? (find?.(o.culprit) ?? {}) : {}),
      rule: "flow/phone-overflow",
      severity: "warning",
      title: "The page is wider than a phone screen",
      evidence: `${o.scrollWidth}px of content in a ${o.width}px screen${o.culprit ? `; ${o.culprit.offscreen ? `${o.culprit.pastName ? `“${o.culprit.pastName}”` : o.culprit.past} is entirely past the edge, inside ${o.culprit.sel}` : `widest: ${o.culprit.sel}`}` : ""}`,
      detail: "Everything can be dragged sideways, and whatever sits past the edge is easy to miss. Let the wide element wrap, shrink or scroll inside its own box.",
      fix: "/keyline layout",
      steps: [openStep(route, "phone"), "Swipe sideways", `The page scrolls ${o.scrollWidth - o.width}px to the side`],
    });
  }

  const desktopNav = [...new Set((desktop?.links ?? []).filter((l) => l.sameOrigin && l.visible && l.inNav).map((l) => l.key))];
  const shown = new Set((phone?.links ?? []).filter((l) => l.visible).map((l) => l.key));
  const missing = desktopNav.filter((k) => !shown.has(k));
  if (!missing.length) return;
  const label = (k) => {
    const l = desktop.links.find((x) => x.key === k);
    return l?.text ? `“${l.text}”` : pathOf(l?.href ?? k, base);
  };
  const names = missing.slice(0, 6).map(label).join(", ") + (missing.length > 6 ? ", …" : "");

  const toggles = (phone?.clickables ?? []).filter((c) => (c.kind !== "link" || c.placeholder) && toggleScore(c) >= 3).sort((a, b) => toggleScore(b) - toggleScore(a));
  if (!toggles.length) {
    add(run, {
      ...at,
      rule: "flow/phone-nav-missing",
      severity: "error",
      title: `On a phone, ${missing.length === 1 ? "a place in the navigation is" : `${missing.length} places in the navigation are`} out of reach`,
      evidence: `hidden at 390px with no menu button: ${names}`,
      detail: "The desktop navigation hides on a phone and nothing replaces it. Add a menu button that opens it, or let it wrap.",
      fix: "/keyline layout",
      steps: [openStep(route, "phone"), `Look for ${label(missing[0])}`, "It's hidden, and there's no menu button to show it"],
    });
    return;
  }

  const toggle = toggles[0];
  log(`  phone  ${route}  ${missing.length} nav links hidden; trying ${describe(toggle)}`);
  const { page, error } = await open(context, { base, route });
  try {
    if (error) return;
    const marked = await page.evaluate(PAGE.mark, { match: { sel: toggle.sel, text: toggle.text, tag: toggle.tag } });
    if (!marked) return;
    await page.evaluate(PAGE.watch);
    await sleep(250);
    await page.evaluate(PAGE.arm);
    const steps = [openStep(route, "phone"), `Tap ${describe(toggle)}`];
    try {
      await page.locator("[data-keyline-target]").first().click({ timeout: 2500 });
    } catch {
      return; // the click pass reports what blocks a control
    }
    await sleep(700);
    const read = await page.evaluate(PAGE.read).catch(() => null);
    const revealed = await page.evaluate(PAGE.visibleHrefs, { keys: missing }).catch(() => []);
    if (!revealed.length) {
      add(run, {
        ...at,
        box: toggle.box,
        selector: toggle.sel,
        ...(find?.(toggle) ?? {}),
        rule: "flow/phone-menu-dead",
        severity: "error",
        title: `On a phone, ${describe(toggle)} doesn't show the navigation`,
        evidence: `after the tap, still hidden: ${names}`,
        detail: "The menu button is there but what it should reveal stays hidden, so these pages can't be reached on a phone.",
        steps: [...steps, `${label(missing[0])} is still nowhere to be seen`],
      });
      return;
    }
    if (read?.opened) {
      await page.keyboard.press("Escape");
      await sleep(400);
      const still = await page.evaluate(PAGE.visibleHrefs, { keys: revealed }).catch(() => []);
      const after = await page.evaluate(PAGE.afterEscape).catch(() => null);
      if (still.length && after && (after.expanded === "true" || after.overlays.length > read.overlaysBefore)) {
        add(run, {
          ...at,
          box: toggle.box,
          selector: toggle.sel,
          rule: "flow/escape-ignored",
          severity: "warning",
          title: "On a phone, Escape doesn't close the menu",
          evidence: `${still.length} menu links still showing after Escape`,
          detail: "A keyboard (or switch, or screen reader) user closes an open menu with Escape.",
          fix: "/keyline patterns",
          steps: [...steps, "The menu opens", "Press Escape", "It stays open"],
        });
      }
    }
  } finally {
    await page.close().catch(() => {});
  }
}
