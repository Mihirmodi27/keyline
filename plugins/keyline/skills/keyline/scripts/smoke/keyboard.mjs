/**
 * Tab through a page from the top, as a keyboard user does, until focus leaves
 * the page. Along the way: does each stop show that it has focus, is it on
 * screen at all, and does focus ever loop back on itself before the end
 * (a trap)? A loop inside an open modal dialog is what a modal should do; a
 * loop anywhere else is a trap.
 */
import { add } from "../browse/findings.mjs";
import { shotKey } from "../browse/capture.mjs";
import { PAGE } from "./page.mjs";
import { open, openStep } from "./util.mjs";

const name = (f) => (f.text ? `“${f.text}”` : f.sel);

export async function checkKeyboard({ run, context, base, route, log, find }) {
  const { page, error } = await open(context, { base, route });
  try {
    if (error) return;
    const prep = await page.evaluate(PAGE.keyboardPrep);
    const budget = Math.min(prep.total + 8, 160);
    log(`  keys   ${route}  ${prep.total} focusable`);
    const order = [];
    const invisible = new Map();
    const hidden = new Map();
    let trap = null;
    let presses = 0;
    for (; presses < budget; presses++) {
      await page.keyboard.press("Tab");
      const f = await page.evaluate(PAGE.keyboardRead).catch(() => null);
      if (!f) break; // Tab moved to another document
      if (f.body) {
        if (order.length) break; // a full lap: focus left the page
        continue;
      }
      const prev = order.findIndex((o) => o.id === f.id);
      if (prev >= 0) {
        if (f.iframe && order.at(-1)?.id === f.id) continue; // moving through a frame's own controls
        const cycle = order.slice(prev);
        if (cycle.every((o) => o.inModal)) break; // an open modal keeps focus, as it should
        trap = { cycle, at: prev };
        break;
      }
      order.push(f);
      if (!f.onScreen) hidden.set(f.id, f);
      else if (f.ring === false) invisible.set(f.id, f);
    }
    run.stats.tabbed++;
    const at = { page: route, viewport: "desktop", theme: "light", shot: shotKey("desktop", "light") };

    if (trap) {
      const first = trap.cycle[0];
      const loop = [...trap.cycle.map(name), name(first)].join(" → ");
      add(run, {
        ...at,
        box: first.onScreen ? first.box : undefined,
        selector: first.sel,
        ...(find?.(first) ?? {}),
        rule: "flow/focus-trap",
        severity: "error",
        title: trap.cycle.length === 1 ? `Tab gets stuck on ${name(first)}` : `Tab loops between ${trap.cycle.length} controls and can't leave`,
        evidence: `${loop}; ${order.length} of ${prep.total} focusable elements reached`,
        detail: "A keyboard user can't get past this point: everything after it on the page is unreachable. Remove the key handler that moves focus back, or scope it to an open modal.",
        steps: [openStep(route), `Press Tab ${trap.at + 1} times, to ${name(first)}`, "Keep pressing Tab", `Focus goes ${loop} and never reaches the rest of the page`],
      });
    }
    if (invisible.size) {
      const list = [...invisible.values()];
      const first = list[0];
      add(run, {
        ...at,
        box: first.box,
        selector: first.sel,
        ...(find?.(first) ?? {}),
        rule: "flow/focus-invisible",
        severity: "error",
        title: list.length === 1 ? `${name(first)} shows no sign of focus` : `${list.length} controls show no sign of focus`,
        evidence: `${list.slice(0, 6).map(name).join(", ")}${list.length > 6 ? ", …" : ""}: no outline, ring, colour or underline changes on focus`,
        detail: "A keyboard user can't see where they are. Give every focusable element a visible :focus-visible style, in the focus colour.",
        fix: "/keyline color",
        steps: [openStep(route), `Press Tab until focus reaches ${name(first)}`, "Nothing on screen changes to show it"],
      });
    }
    if (hidden.size) {
      const list = [...hidden.values()];
      add(run, {
        ...at,
        selector: list[0].sel,
        ...(find?.(list[0]) ?? {}),
        rule: "flow/focus-hidden",
        severity: "warning",
        title: list.length === 1 ? `Tab stops on ${name(list[0])}, which can't be seen` : `Tab stops on ${list.length} things that can't be seen`,
        evidence: `${list.slice(0, 6).map(name).join(", ")}${list.length > 6 ? ", …" : ""}: off screen, zero-size or transparent when focused`,
        detail: "Focus disappears for a while: usually the links of a closed menu or drawer. Hide closed panels with `display: none`, `hidden` or `inert`, not only by moving them away.",
        steps: [openStep(route), `Press Tab until focus reaches ${name(list[0])}`, "Focus is somewhere you can't see"],
      });
    }
  } finally {
    await page.close().catch(() => {});
  }
}
