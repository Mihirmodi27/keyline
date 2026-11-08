#!/usr/bin/env node
/**
 * Screenshot every state of every example, full page, at desktop and phone width.
 *
 *   node examples/shoot.mjs                 every scene, every state
 *   node examples/shoot.mjs dashboard       one scene
 *
 * States are before/, steps/<n>-<domain>/, impeccable/ and after/; shots land in
 * <scene>/shots/<state>-fold.png (the first 1440×900, what a visitor sees),
 * <state>-desktop.png (the full page) and <state>-phone.png. Light scheme
 * unless --dark. Drives headless Chrome over
 * the DevTools protocol (Node 22+ has WebSocket built in), because Chrome's own
 * --screenshot can't do a full page. Phone is 500px wide: headless Chrome clamps
 * anything narrower and then writes a cropped image at the requested width.
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = fileURLToPath(new URL(".", import.meta.url));
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const SHOTS = [
  { label: "fold", width: 1440, full: false },
  { label: "desktop", width: 1440, full: true },
  { label: "phone", width: 500, full: true },
];
const PORT = 9333;

const args = process.argv.slice(2);
const dark = args.includes("--dark");
const named = args.filter((a) => !a.startsWith("--"));
const scenes = named.length
  ? named
  : readdirSync(ROOT, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);

function states(scene) {
  const dir = join(ROOT, scene);
  const out = [];
  if (existsSync(join(dir, "before/index.html"))) out.push(["before", join(dir, "before/index.html")]);
  if (existsSync(join(dir, "steps"))) {
    for (const s of readdirSync(join(dir, "steps")).sort()) {
      if (existsSync(join(dir, "steps", s, "index.html"))) out.push([s, join(dir, "steps", s, "index.html")]);
    }
  }
  if (existsSync(join(dir, "impeccable/index.html"))) out.push(["impeccable", join(dir, "impeccable/index.html")]);
  if (existsSync(join(dir, "after/index.html"))) out.push(["after", join(dir, "after/index.html")]);
  return out;
}

const chrome = spawn(CHROME, [
  "--headless=new", `--remote-debugging-port=${PORT}`, "--hide-scrollbars", "--no-first-run",
  "--force-color-profile=srgb", `--user-data-dir=${mkdtempSync(join(tmpdir(), "keyline-shoot-"))}`, "about:blank",
], { stdio: "ignore" });

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let target;
for (let i = 0; i < 50 && !target; i++) {
  await wait(200);
  try {
    target = (await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()).find((t) => t.type === "page");
  } catch {}
}
if (!target) {
  chrome.kill();
  throw new Error("Chrome didn't start");
}

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let id = 0;
const pending = new Map();
ws.addEventListener("message", (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  }
});
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const n = ++id;
    pending.set(n, (m) => (m.error ? reject(new Error(`${method}: ${m.error.message}`)) : resolve(m.result)));
    ws.send(JSON.stringify({ id: n, method, params }));
  });

await send("Page.enable");
await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: dark ? "dark" : "light" }] });
let count = 0;
for (const scene of scenes) {
  const list = states(scene);
  if (!list.length) continue;
  mkdirSync(join(ROOT, scene, "shots"), { recursive: true });
  for (const [state, file] of list) {
    for (const { label, width, full } of SHOTS) {
      await send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: label === "phone" });
      await send("Page.navigate", { url: pathToFileURL(file).href });
      await wait(1200); // fonts, and any entrance animation, settle
      const { contentSize } = await send("Page.getLayoutMetrics");
      const height = full ? Math.min(Math.ceil(contentSize.height), 12000) : 900;
      const { data } = await send("Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: full,
        clip: { x: 0, y: 0, width, height, scale: 1 },
      });
      writeFileSync(join(ROOT, scene, "shots", `${state}-${label}${dark ? "-dark" : ""}.png`), Buffer.from(data, "base64"));
      count++;
    }
  }
  console.log(`${scene}: ${list.length} states`);
}
ws.close();
chrome.kill();
console.log(`${count} screenshots`);
