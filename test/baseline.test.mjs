import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";
import { check } from "../plugins/keyline/skills/keyline/scripts/check.mjs";
import { compare, fingerprint, normalise } from "../plugins/keyline/skills/keyline/scripts/check/baseline.mjs";
import { add, newRun, readRun, writeRun } from "../plugins/keyline/skills/keyline/scripts/browse/findings.mjs";
import { compareDirs, compareRuns, diffPngs, matchKey } from "../plugins/keyline/skills/keyline/scripts/browse/compare.mjs";
import { render } from "../plugins/keyline/skills/keyline/scripts/browse/report.mjs";
import { launch } from "../plugins/keyline/skills/keyline/scripts/browse/playwright.mjs";

const CLI = fileURLToPath(new URL("../bin/keyline.mjs", import.meta.url));
const SLOPPY = fileURLToPath(new URL("./fixtures/sloppy", import.meta.url));
const cli = (...args) => spawnSync(process.execPath, [CLI, ...args], { encoding: "utf8", env: { ...process.env, NO_COLOR: "1" } });

function copyOf(fixture) {
  const dir = mkdtempSync(join(tmpdir(), "keyline-baseline-"));
  cpSync(fixture, dir, { recursive: true });
  return dir;
}

const prepend = (file, text) => writeFileSync(file, text + readFileSync(file, "utf8"));

/* ── The detector's baseline ─────────────────────────────────────────────── */

test("fingerprints ignore line numbers and spacing, not the rule, file or text", () => {
  const f = { rule: "layout/z-index", file: "a.css", line: 3 };
  const lines = ["", "", ".modal { z-index: 9999; }"];
  const shifted = ["/* new */", "", "", "", "  .modal  {  z-index: 9999; }"];
  assert.equal(fingerprint(f, lines), fingerprint({ ...f, line: 5 }, shifted));
  assert.notEqual(fingerprint(f, lines), fingerprint({ ...f, rule: "color/raw-color" }, lines));
  assert.notEqual(fingerprint(f, lines), fingerprint({ ...f, file: "b.css" }, lines));
  assert.notEqual(fingerprint(f, lines), fingerprint(f, ["", "", ".modal { z-index: 999; }"]));
  assert.equal(normalise("  a \t b  "), "a b");
});

test("every finding survives lines inserted above it", () => {
  const root = copyOf(SLOPPY);
  const before = check({ root }).findings;
  for (const file of ["src/styles.css", "src/App.tsx", "index.html"]) {
    prepend(join(root, file), file.endsWith(".css") ? "/* one */\n/* two */\n\n" : file.endsWith(".html") ? "<!-- one -->\n" : "// one\n// two\n\n");
  }
  const after = check({ root }).findings;
  assert.ok(after.some((f, i) => f.line !== before[i]?.line), "the lines did move");
  const split = compare(after, { findings: before });
  assert.deepEqual(split.counts, { new: 0, still: before.length, fixed: 0 });
});

test("new, fixed and still: and two identical lines count as two", () => {
  const baseline = {
    findings: [
      { fingerprint: "a", rule: "layout/z-index", file: "x.css", line: 1 },
      { fingerprint: "b", rule: "color/raw-color", file: "x.css", line: 2 },
      { fingerprint: "c", rule: "color/raw-color", file: "y.css", line: 9 },
    ],
  };
  const now = [
    { fingerprint: "a", rule: "layout/z-index", file: "x.css", line: 4 },
    { fingerprint: "a", rule: "layout/z-index", file: "x.css", line: 5 },
    { fingerprint: "d", rule: "motion/transition-all", file: "x.css", line: 6 },
  ];
  const split = compare(now, baseline, { files: ["x.css"] });
  assert.deepEqual(split.findings.map((f) => f.change), ["still", "new", "new"]);
  assert.deepEqual(split.fixed.map((f) => f.fingerprint), ["b"], "y.css wasn't checked, so c isn't fixed");
  assert.equal(compare(now, baseline, { files: ["x.css"], rules: ["layout"] }).fixed.length, 0, "a rule that didn't run fixes nothing");

  // A project-wide finding points at some file, but belongs to the whole project.
  const project = { findings: [{ fingerprint: "p", rule: "layout/skip-link", file: "index.html", line: 1, scope: "project" }] };
  assert.equal(compare([], project, { files: ["x.css"] }).fixed.length, 1, "gone from a whole-project run: fixed");
  assert.equal(compare([], project, { files: ["x.css"], partial: true }).fixed.length, 0, "a narrower run can't tell");
});

test("checking one folder against the baseline doesn't fix project-wide findings", () => {
  const root = copyOf(SLOPPY);
  assert.equal(cli("check", "--root", root, "--baseline", "save").status, 0);
  const out = JSON.parse(cli("check", "src", "--root", root, "--baseline", "--json").stdout);
  assert.ok(!out.fixed.some((f) => f.scope === "project"), JSON.stringify(out.fixed.map((f) => f.rule)));
});

test("--baseline save, then --baseline: fails only on new errors, and says what's new and fixed", () => {
  const root = copyOf(SLOPPY);
  assert.equal(cli("check", "--root", root).status, 1, "the sloppy fixture has errors");
  const saved = cli("check", "--root", root, "--baseline", "save");
  assert.equal(saved.status, 0);
  assert.match(saved.stdout, /Saved \d+ findings/);
  assert.ok(existsSync(join(root, ".keyline/baseline.json")));

  assert.equal(cli("check", "--root", root, "--baseline").status, 0, "nothing new");
  prepend(join(root, "src/styles.css"), "/* moved */\n\n");
  assert.equal(cli("check", "--root", root, "--baseline").status, 0, "moved isn't new");

  // Fix one error, add a new warning: still passes. Then add a new error: fails.
  const html = join(root, "index.html");
  writeFileSync(html, readFileSync(html, "utf8").replace(/,?\s*(maximum-scale=1|user-scalable=no)/g, ""));
  writeFileSync(join(root, "src/styles.css"), readFileSync(join(root, "src/styles.css"), "utf8") + "\n.added { z-index: 5000; }\n");
  const warned = cli("check", "--root", root, "--baseline");
  assert.equal(warned.status, 0, "a new warning passes");
  assert.match(warned.stdout, /New since the baseline[\s\S]*layout\/z-index/);
  assert.match(warned.stdout, /Fixed since the baseline[\s\S]*type\/zoom-disabled/);
  assert.equal(cli("check", "--root", root, "--baseline", "--strict").status, 1, "but not with --strict");

  writeFileSync(join(root, "src/styles.css"), readFileSync(join(root, "src/styles.css"), "utf8") + ".gone:focus { outline: none; }\n");
  const json = cli("check", "--root", root, "--baseline", "--json");
  assert.equal(json.status, 1, "a new error fails");
  const out = JSON.parse(json.stdout);
  assert.ok(out.summary.new.error >= 1);
  assert.equal(out.baseline.new, out.findings.filter((f) => f.change === "new").length);
  assert.equal(out.baseline.fixed, out.fixed.length);
  assert.ok(out.fixed.some((f) => f.rule === "type/zoom-disabled"));
  assert.ok(out.findings.every((f) => f.fingerprint && ["new", "still"].includes(f.change)));
});

test("--baseline with no baseline is a usage error, and --baseline-file reads another", () => {
  const root = copyOf(SLOPPY);
  assert.equal(cli("check", "--root", root, "--baseline").status, 2);
  assert.equal(cli("check", "--root", root, "--baseline", "save", "--baseline-file", "ci/keyline.json").status, 0);
  assert.ok(existsSync(join(root, "ci/keyline.json")));
  assert.equal(cli("check", "--root", root, "--baseline-file", "ci/keyline.json").status, 0);
});

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
