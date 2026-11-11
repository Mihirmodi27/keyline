import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";
import { add, newRun, readRun, writeRun } from "../browse/findings.mjs";
import { compareDirs, compareRuns, diffPngs, matchKey } from "../browse/compare.mjs";
import { render } from "../browse/report.mjs";
import { launch } from "../browse/playwright.mjs";

const BIN = fileURLToPath(new URL("../bin/trykeyline-browser.mjs", import.meta.url));
const cli = (...args) => spawnSync(process.execPath, [BIN, ...args], { encoding: "utf8", env: { ...process.env, NO_COLOR: "1" } });

/* ── Comparing two report runs ───────────────────────────────────────────── */

function runWith(findings, { routes = ["/", "/settings"], fixed } = {}) {
  const run = newRun({ kind: "audit", title: "Lumen" });
  run.pages = routes.map((route) => ({ route, shots: { "desktop-light": { path: `shots/${route === "/" ? "home" : route.slice(1)}--desktop-light.png`, width: 100, height: 100 } } }));
  for (const f of findings) add(run, { viewport: "desktop", theme: "light", severity: "warning", ...f });
  if (fixed) run.fixed = fixed;
  return run;
}

test("compareRuns marks new, still and returned, lists fixed, and carries a person's status", () => {
  const faint = { rule: "color/contrast", title: "Faint", page: "/", selector: ".time" };
  const prev = runWith(
    [
      { ...faint, status: "accepted" },
      { rule: "a11y/name", title: "No name", page: "/", selector: "button.x" },
      { rule: "copy/vague", title: "Vague", page: "/gone", selector: ".cta" },
      { rule: "layout/measure", title: "Too wide", page: "/settings", viewport: "phone", theme: "dark" },
    ],
    { fixed: [{ rule: "type/uppercase", title: "Shouting", page: "/", viewport: "desktop", theme: "light", selector: ".eyebrow" }] },
  );
  const now = runWith([
    { ...faint, title: "Faint (reworded titles don't matter when there's a selector)" },
    { rule: "type/uppercase", title: "Shouting", page: "/", selector: ".eyebrow" },
    { rule: "depth/flat", title: "Flat", page: "/settings", selector: ".card" },
  ]);
  compareRuns(now, prev, { against: "../before" });
  const by = (rule) => now.findings.find((f) => f.rule === rule);
  assert.equal(by("color/contrast").change, "still");
  assert.equal(by("color/contrast").status, "accepted", "accepted carries over");
  assert.equal(by("type/uppercase").change, "returned");
  assert.equal(by("depth/flat").change, "new");
  // a11y/name is gone from a page this run saw: fixed. /gone wasn't visited, and phone-dark wasn't walked: neither counts.
  assert.deepEqual(now.fixed.map((f) => f.rule), ["a11y/name"]);
  assert.equal(now.fixed[0].change, "fixed");
  assert.deepEqual({ ...now.compare, previous: undefined }, { against: "../before", previous: undefined, new: 1, still: 1, returned: 1, fixed: 1 });
  assert.equal(matchKey({ rule: "r", title: "t" }), "r||||t");

  const html = render(now);
  assert.match(html, /Since last run/);
  assert.match(html, /class="chg chg--new">New</);
  assert.match(html, /class="chg chg--returned">Back</);
  assert.match(html, /<h3>Fixed<\/h3>[\s\S]*No name/);
  assert.match(html, /name="change"/);
});

test("report --compare writes the marks into findings.json, and comparing twice is the same", async () => {
  const before = mkdtempSync(join(tmpdir(), "keyline-before-"));
  const after = mkdtempSync(join(tmpdir(), "keyline-after-"));
  writeRun(before, runWith([{ rule: "a11y/name", title: "No name", page: "/", selector: "button" }]));
  writeRun(after, runWith([{ rule: "depth/flat", title: "Flat", page: "/", selector: ".card" }]));
  const r = cli("report", after, "--compare", before);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /1 new · 0 back · 0 still · 1 fixed/);
  const once = readRun(after);
  assert.equal(once.findings[0].change, "new");
  assert.equal(once.fixed[0].rule, "a11y/name");
  assert.match(readFileSync(join(after, "index.html"), "utf8"), /Since last run/);
  await compareDirs(after, before, { log: () => {} });
  const twice = readRun(after);
  assert.deepEqual(twice.compare, { ...once.compare });
  assert.deepEqual(twice.findings, once.findings);
  assert.equal(cli("report", after, "--compare", after).status, 2, "comparing a run with itself is a usage error");
});

/* ── Screenshot diffs ────────────────────────────────────────────────────── */

const CRC = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
/** A solid PNG with one optional rectangle of another colour, encoded by hand: no image library. */
function png(w, h, bg, rect) {
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 3 + 1)] = 0;
    for (let x = 0; x < w; x++) {
      const inside = rect && x >= rect.x && x < rect.x + rect.w && y >= rect.y && y < rect.y + rect.h;
      const [r, g, b] = inside ? rect.color : bg;
      raw.set([r, g, b], y * (w * 3 + 1) + 1 + x * 3);
    }
  }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(td));
    return Buffer.concat([len, td, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr.set([8, 2, 0, 0, 0], 8);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}

async function browserOrSkip(t) {
  try {
    return await launch({ log: () => {}, install: false });
  } catch (err) {
    t.skip(`no browser could launch: ${String(err?.message ?? err).split("\n")[0]}`);
    return null;
  }
}

test("screenshots are diffed in the browser: share changed, a box round it, a diff image", async (t) => {
  const browser = await browserOrSkip(t);
  if (!browser) return;
  try {
    const page = await browser.newPage();
    const white = [255, 255, 255];
    const same = await diffPngs(page, png(40, 30, white), png(40, 30, white));
    assert.equal(same.changed, 0);
    assert.equal(same.box, null);

    const moved = await diffPngs(page, png(40, 30, white), png(40, 30, white, { x: 10, y: 5, w: 4, h: 3, color: [200, 0, 0] }));
    assert.equal(moved.changed, 12);
    assert.equal(moved.percent, 1);
    assert.deepEqual(moved.box, { x: 10, y: 5, w: 4, h: 3 });
    assert.deepEqual([...moved.png.subarray(1, 4)].map((c) => String.fromCharCode(c)).join(""), "PNG");

    const taller = await diffPngs(page, png(40, 30, white), png(40, 40, white));
    assert.equal(taller.changed, 400, "the rows only the new shot has count as changed");

    // Through compareDirs: a visual/changed finding and a diff file.
    const before = mkdtempSync(join(tmpdir(), "keyline-shots-a-"));
    const after = mkdtempSync(join(tmpdir(), "keyline-shots-b-"));
    for (const [dir, image] of [[before, png(40, 30, white)], [after, png(40, 30, white, { x: 0, y: 0, w: 40, h: 3, color: [0, 0, 0] })]]) {
      mkdirSync(join(dir, "shots"));
      writeFileSync(join(dir, "shots/home--desktop-light.png"), image);
      const run = newRun({ kind: "capture" });
      run.pages = [{ route: "/", shots: { "desktop-light": { path: "shots/home--desktop-light.png", width: 40, height: 30 } } }];
      writeRun(dir, run);
    }
    const run = await compareDirs(after, before, { browser, log: () => {} });
    assert.equal(run.pages[0].diffs["desktop-light"].percent, 10);
    assert.ok(existsSync(join(after, run.pages[0].diffs["desktop-light"].path)));
    const v = run.findings.find((f) => f.rule === "visual/changed");
    assert.equal(v.severity, "info");
    assert.deepEqual(v.box, { x: 0, y: 0, w: 40, h: 3 });
    assert.deepEqual(run.compare.visual, { threshold: 0.01, compared: 1, changed: 1 });
    const quiet = await compareDirs(after, before, { browser, threshold: 50, log: () => {} });
    assert.equal(quiet.findings.filter((f) => f.rule === "visual/changed").length, 0, "under the threshold, no finding");
  } finally {
    await browser.close();
  }
});
