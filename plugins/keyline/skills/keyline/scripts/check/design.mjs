/**
 * What the detector takes from DESIGN.md: the preset (which turns some rules on
 * or off), the motion ladder and the z-index ladder. Everything else in the
 * file is for the agent; the detector only needs what changes a verdict.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const PRESETS = ["editorial", "product", "expressive", "glass"];

function section(md, heading) {
  const m = md.match(new RegExp(`^##\\s+${heading}\\b[^\\n]*\\n([\\s\\S]*?)(?=^##\\s|(?![\\s\\S]))`, "mi"));
  return m ? m[1] : "";
}

export function readDesign(root) {
  const name = existsSync(root) ? readdirSync(root).find((f) => f.toLowerCase() === "design.md") : null;
  if (!name) return { found: false, preset: null, durations: null, zLadder: null };
  const md = readFileSync(join(root, name), "utf8");

  const profile = section(md, "Profile");
  const presetRow = profile.split("\n").find((l) => /^\|\s*Preset\s*\|/i.test(l)) ?? "";
  const preset = PRESETS.find((p) => new RegExp(`\`${p}\`|\\b${p}\\b`).test(presetRow.split("|").slice(2).join("|"))) ?? null;

  // Durations: every ms / s value in the Motion section's table rows.
  const motion = section(md, "Motion");
  const durations = new Set();
  for (const row of motion.split("\n").filter((l) => l.startsWith("|"))) {
    for (const m of row.matchAll(/(?<![\w.])(\d+(?:\.\d+)?)(ms|s)\b/g)) durations.add(m[2] === "s" ? Math.round(parseFloat(m[1]) * 1000) : Math.round(parseFloat(m[1])));
  }

  // z-index: rows whose role is z.* — their values are the ladder.
  const layout = section(md, "Layout");
  const zLadder = new Set();
  for (const row of layout.split("\n").filter((l) => /^\|\s*`?z\./.test(l))) {
    const cells = row.split("|").slice(1, -1).map((c) => c.trim());
    for (const c of cells.slice(1)) for (const m of c.matchAll(/(?<![\w.#-])(-?\d+)(?![\w.%])/g)) zLadder.add(Number(m[1]));
  }

  return {
    found: true,
    file: name,
    preset,
    durations: durations.size ? durations : null,
    zLadder: zLadder.size ? zLadder : null,
  };
}
