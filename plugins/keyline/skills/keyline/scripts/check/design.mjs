/**
 * What the detector takes from DESIGN.md: the preset (which turns some rules on
 * or off), the case it records for labels, the motion ladder and the z-index ladder. Everything else in the
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
  if (!name) return { found: false, preset: null, labelCase: null, durations: null, roles: new Map(), zLadder: null };
  const md = readFileSync(join(root, name), "utf8");
  const headingLine = (h) => {
    const i = md.search(new RegExp(`^##\\s+${h}\\b`, "mi"));
    return i < 0 ? 1 : md.slice(0, i).split("\n").length;
  };

  const profile = section(md, "Profile");
  const presetRow = profile.split("\n").find((l) => /^\|\s*Preset\s*\|/i.test(l)) ?? "";
  const preset = PRESETS.find((p) => new RegExp(`\`${p}\`|\\b${p}\\b`).test(presetRow.split("|").slice(2).join("|"))) ?? null;

  // Label case: capitals are a choice the Type table records per role. A row that
  // records them allows them; "sentence" means the table names sentence case and no row sets capitals.
  const typeRows = section(md, "Type").split("\n").filter((l) => l.startsWith("|"));
  const labelCase = typeRows.some((l) => /\b(uppercase|capitals)\b/i.test(l)) ? "capitals" : typeRows.some((l) => /\bsentence case\b/i.test(l)) ? "sentence" : null;

  // Durations: every ms / s value in the Motion section's table rows. Rows on a
  // canonical duration.* role (before any "Named exemptions" line) are also kept by
  // role, so the detector can check they grow with the size of the change.
  const motion = section(md, "Motion");
  const durations = new Set();
  const roles = new Map();
  let inExemptions = false;
  for (const line of motion.split("\n")) {
    if (!line.startsWith("|")) {
      if (/exemption/i.test(line)) inExemptions = true;
      continue;
    }
    for (const m of line.matchAll(/(?<![\w.])(\d+(?:\.\d+)?)(ms|s)\b/g)) {
      const ms = m[2] === "s" ? Math.round(parseFloat(m[1]) * 1000) : Math.round(parseFloat(m[1]));
      durations.add(ms);
      const role = line.split("|")[1]?.match(/duration\.(\w+)/)?.[1];
      if (!inExemptions && role && !roles.has(role)) roles.set(role, ms);
    }
  }

  // z-index: rows whose role is z.*, or a project role whose name is a z utility
  // or mentions one — their values are the ladder.
  const layout = section(md, "Layout");
  const zLadder = new Set();
  // A project rung (`--z-header`, `$z-header`, a `z-header` utility) counts when it opens the token cell, the row's second.
  const zCell = (c) => /^`(--|\$)?z-[\w-]+`/.test(c);
  for (const row of layout.split("\n").filter((l) => /^\|\s*`?z\./.test(l) || (l.startsWith("|") && (/`-?z-\[?-?\d|`z\./.test(l) || zCell((l.split("|")[2] ?? "").trim()))))) {
    const cells = row.split("|").slice(1, -1).map((c) => c.trim());
    for (const c of cells.slice(1)) for (const m of c.matchAll(/(?<![\w.#-])(-?\d+)(?![\w.%])/g)) zLadder.add(Number(m[1]));
  }

  return {
    found: true,
    file: name,
    lines: { motion: headingLine("Motion"), layout: headingLine("Layout") },
    preset,
    labelCase,
    durations: durations.size ? durations : null,
    roles,
    zLadder: zLadder.size ? zLadder : null,
  };
}
