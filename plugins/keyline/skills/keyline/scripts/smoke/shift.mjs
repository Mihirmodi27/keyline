/**
 * Load each page on a slow connection and record what moves while it loads:
 * the browser's own layout-shift entries, scored as Cumulative Layout Shift
 * (the worst burst of shifts, each burst under 5 s with gaps under 1 s).
 * A fast local server hides most shifts; throttling brings back what a reader
 * on a train sees — text that jumps when an image or a font arrives.
 */
import { add } from "../browse/findings.mjs";
import { shotKey } from "../browse/capture.mjs";
import { sleep } from "./util.mjs";

export const SLOW = { latency: 150, downloadKbps: 1600, uploadKbps: 750, cpu: 2 };

function recordShifts() {
  window.__klShifts = [];
  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if (e.hadRecentInput) continue;
        window.__klShifts.push({ value: e.value, t: e.startTime, sources: (e.sources || []).map((s) => ({ node: s.node, now: s.currentRect, was: s.previousRect })) });
      }
    }).observe({ type: "layout-shift", buffered: true });
  } catch {
    window.__klShifts = null;
  }
}

function readShifts() {
  const list = window.__klShifts;
  if (!list) return null;
  const sel = window.__keylineSelector || ((n) => n?.localName ?? null);
  return list.map((e) => ({
    value: e.value,
    t: Math.round(e.t),
    sources: e.sources.map((s) => ({
      sel: s.node && s.node.nodeType === 1 && s.node.isConnected ? sel(s.node) : s.node?.parentElement?.isConnected ? sel(s.node.parentElement) : null,
      now: { x: Math.round(s.now.x), y: Math.round(s.now.y + window.scrollY), w: Math.round(s.now.width), h: Math.round(s.now.height) },
      dy: Math.round(s.now.y - s.was.y),
      dx: Math.round(s.now.x - s.was.x),
    })),
  }));
}

/** CLS as Chrome scores it: the largest session window. */
export function cls(entries) {
  let best = { value: 0, entries: [] };
  let cur = { value: 0, entries: [] };
  for (const e of entries) {
    const last = cur.entries.at(-1);
    if (last && (e.t - last.t > 1000 || e.t - cur.entries[0].t > 5000)) cur = { value: 0, entries: [] };
    cur.value += e.value;
    cur.entries.push(e);
    if (cur.value > best.value) best = { value: cur.value, entries: [...cur.entries] };
  }
  return best;
}

export async function checkShift({ run, context, base, route, log, find }) {
  const page = await context.newPage();
  try {
    await page.addInitScript(recordShifts);
    const cdp = await context.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: SLOW.latency, downloadThroughput: (SLOW.downloadKbps * 1024) / 8, uploadThroughput: (SLOW.uploadKbps * 1024) / 8 });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: SLOW.cpu }).catch(() => {});
    try {
      await page.goto(new URL(route, base).href, { waitUntil: "load", timeout: 60000 });
    } catch {
      return;
    }
    await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
    await sleep(1500);
    const entries = await page.evaluate(readShifts).catch(() => null);
    if (!entries) return;
    const score = cls(entries);
    log(`  shift  ${route}  CLS ${score.value.toFixed(3)}`);
    run.stats.shiftChecked++;
    if (score.value < 0.1) return;
    const sources = score.entries.flatMap((e) => e.sources).filter((s) => s.sel);
    const worst = sources.sort((a, b) => Math.abs(b.dy) + Math.abs(b.dx) - (Math.abs(a.dy) + Math.abs(a.dx)))[0];
    const moved = worst ? `${worst.sel} moved ${Math.abs(worst.dy) >= Math.abs(worst.dx) ? `${Math.abs(worst.dy)}px ${worst.dy > 0 ? "down" : "up"}` : `${Math.abs(worst.dx)}px sideways`}` : "";
    add(run, {
      page: route,
      viewport: "desktop",
      theme: "light",
      shot: shotKey("desktop", "light"),
      box: worst?.now,
      selector: worst?.sel,
      ...(worst ? (find?.({ sel: worst.sel }) ?? {}) : {}),
      rule: "flow/layout-shift",
      severity: score.value >= 0.25 ? "error" : "warning",
      title: "The page jumps while it loads",
      evidence: `layout shift ${score.value.toFixed(2)} (good is under 0.1) on a slow connection${moved ? `; ${moved}` : ""}`,
      detail: "Content moves after it first appears, so a reader loses their place or taps the wrong thing. Reserve space for images, embeds and late content (width and height, aspect-ratio, min-height), and use metric-matched fallback fonts.",
      fix: "/keyline layout",
      steps: [`Open ${route} at desktop width on a slow connection (${SLOW.latency} ms, ${SLOW.downloadKbps / 1000} Mbps, CPU ×${SLOW.cpu})`, "Watch the page while it loads", moved ? `${cap(moved)} after it first appeared` : "Content moves after it first appeared"],
    });
  } finally {
    await page.close().catch(() => {});
  }
}

const cap = (s) => s[0].toUpperCase() + s.slice(1);
