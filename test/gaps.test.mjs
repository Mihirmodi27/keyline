import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { check } from "../plugins/keyline/skills/keyline/scripts/check.mjs";
import { readDesign } from "../plugins/keyline/skills/keyline/scripts/check/design.mjs";

// Gaps the example reruns on 2026-11-12 found in the detector and the contrast script.

const project = (files) => {
  const dir = mkdtempSync(join(tmpdir(), "keyline-gaps-"));
  for (const [name, text] of Object.entries(files)) writeFileSync(join(dir, name), text);
  return dir;
};

test("SVG paint is a lead, not a warning: fill and stroke are info, gradient stops pass", () => {
  const root = project({
    "art.css": ".cover .label { fill: #9fb4cf; stroke: #c9d6e6; }\n.cover stop { stop-color: #ff7a1a; }\n.card { color: #333333; }\n",
  });
  const raw = check({ root, rules: ["color/raw-color"] }).findings;
  const by = (prop) => raw.filter((f) => f.message.includes(`\`${prop}\``));
  assert.equal(by("fill")[0]?.severity, "info");
  assert.equal(by("stroke")[0]?.severity, "info");
  assert.equal(by("stop-color").length, 0, "gradient stops only exist in artwork");
  assert.equal(by("color")[0]?.severity, "warning", "text colour typed inline still warns");
});

test("a z-index rung named by its project token is on the ladder", () => {
  const root = project({
    "DESIGN.md": [
      "# Design",
      "",
      "## Layout",
      "",
      "| Role | Token | Value |",
      "|---|---|---|",
      "| `z.popover` | `--z-popover` | 20 |",
      "| ↳ sticky header (project role) | `--z-header` — `.topbar` | 30 |",
      "| `elevation.floating` | `--surface-float`, peak 10% | `--z-popover` |",
      "",
    ].join("\n"),
  });
  assert.deepEqual([...readDesign(root).zLadder].sort((a, b) => a - b), [20, 30]);
});

test("contrast.mjs says when two colours come out identical", () => {
  const script = fileURLToPath(new URL("../plugins/keyline/skills/keyline/scripts/contrast.mjs", import.meta.url));
  const same = spawnSync(process.execPath, [script, "#16161a", "#16161a"], { encoding: "utf8" });
  assert.match(same.stderr, /same colour/);
  const fine = spawnSync(process.execPath, [script, "#ffffff", "#16161a"], { encoding: "utf8" });
  assert.equal(fine.stderr, "");
});
