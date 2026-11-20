/**
 * What the detector takes from DESIGN.md: the preset (which turns some rules on
 * or off), the areas on another preset, the component each role belongs to, the case it records for labels, the motion ladder, the z-index ladder, and whether the live
 * guard runs (`| Guard | off |` under ## Profile). Everything else in the file is for the agent; the
 * detector only needs what changes a verdict.
 *
 * Areas are the `| Areas |` row under ## Profile: the parts of the product
 * whose reader is doing something else, each on its own preset.
 *
 *   | Areas | `app/(marketing)/** → expressive` · `app/blog/** → editorial` |
 *
 * A pattern is a path in the project (`app/blog/**`, or `app/blog` for the
 * whole folder) or, starting with `/`, a route on the running site (`/blog/**`).
 * `**` crosses folders, `*` doesn't. Where two areas both match, the more
 * specific wins: the one with more of its pattern spelt out.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const PRESETS = ["editorial", "product", "expressive", "glass"];

/** A glob as a regular expression over a whole path. A pattern with no wildcard covers its folder too. */
function globToRe(pattern) {
  // `blog/**` and a bare `blog` both cover the folder (or route) itself and everything under it.
  const p = pattern.endsWith("/**") ? `${pattern.slice(0, -3)}{,/**}` : /[*?]/.test(pattern) || /\.\w+$/.test(pattern) ? pattern : `${pattern.replace(/\/$/, "")}{,/**}`;
  let re = "";
  for (let i = 0; i < p.length; i++) {
    const c = p[i];
    if (p.startsWith("{,/**}", i)) {
      re += "(?:/.*)?";
      i += 5;
    } else if (p.startsWith("**/", i)) {
      re += "(?:.*/)?";
      i += 2;
    } else if (p.startsWith("**", i)) {
      re += ".*";
      i += 1;
    } else if (c === "*") re += "[^/]*";
    else if (c === "?") re += "[^/]";
    else re += c.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  }
  return new RegExp(`^${re}$`);
}

/**
 * The areas in an `| Areas |` cell: `pattern → preset` pairs, separated by
 * `·`, `;`, `,` or line breaks, with or without backticks. The template's own
 * example ("e.g. …") and "none" are not areas.
 */
export function parseAreas(cell) {
  const text = String(cell ?? "").replace(/<br\s*\/?>/gi, ";");
  if (/\be\.g\./i.test(text) || /^\s*(none|—|-|n\/a)?\s*$/i.test(text)) return [];
  const out = [];
  for (const m of text.matchAll(/`?\s*([^`|;,·→]+?)\s*`?\s*(?:→|->|=>)\s*`?\s*(editorial|product|expressive|glass)\b\s*`?/gi)) {
    const pattern = m[1].trim().replace(/^\.\//, "");
    if (!pattern) continue;
    out.push({ pattern, preset: m[2].toLowerCase(), route: pattern.startsWith("/"), re: globToRe(pattern), weight: pattern.replace(/[*?]/g, "").length });
  }
  return out;
}

/** The most specific area matching `path` among `areas`, or null. Ties go to the one listed later. */
function bestArea(areas, path) {
  let best = null;
  for (const a of areas) if (a.re.test(path) && (!best || a.weight >= best.weight)) best = a;
  return best;
}

/**
 * The `## Components` table: which component does each role, so a copy of it
 * or a hand-styled element doing its job can be pointed back at it.
 *
 *   | Role | Component | Notes |
 *   | `button` | `Button` in `src/components/ui/button.tsx` | variants: default, quiet |
 *
 * The role is the first cell; the second names the file and, optionally, the
 * export (`Button`, or `button.tsx#Button`). Without an export, every component
 * in the file is the role's.
 */
export function parseComponents(text, unread = []) {
  const out = [];
  for (const row of String(text ?? "").split("\n")) {
    if (!row.trim().startsWith("|") || /^\|\s*:?-{2,}/.test(row.trim()) || /\be\.g\./i.test(row)) continue;
    const cells = row.split("|").slice(1, -1).map((c) => c.trim());
    const role = cells[0]?.replace(/`/g, "").trim().toLowerCase();
    if (!role || !/^[a-z][\w.-]*$/.test(role) || role === "role") continue;
    const cell = cells[1] ?? "";
    const path = cell.match(/[\w@~.()[\]/-]+\.(?:tsx|jsx|vue|svelte|astro|ts|js|mjs)\b/)?.[0];
    if (!path) {
      // A role with something written for it that isn't a file: say so, rather than drop it in silence.
      if (cell && !/^(—|–|-|none|n\/a)(\s|$)/i.test(cell.replace(/`/g, "").trim())) unread.push({ role, cell });
      continue;
    }
    const name = cell.match(/#([A-Z]\w*)/)?.[1] ?? [...cell.matchAll(/`([A-Z]\w*)`/g)].map((m) => m[1])[0] ?? null;
    out.push({ role, file: path.replace(/^\.\//, ""), name });
  }
  return out;
}

function section(md, heading) {
  const m = md.match(new RegExp(`^##\\s+${heading}\\b[^\\n]*\\n([\\s\\S]*?)(?=^##\\s|(?![\\s\\S]))`, "mi"));
  return m ? m[1] : "";
}

export function readDesign(root) {
  const name = existsSync(root) ? readdirSync(root).find((f) => f.toLowerCase() === "design.md") : null;
  if (!name) return withAreas({ found: false, preset: null, areas: [], components: [], labelCase: null, durations: null, roles: new Map(), zLadder: null, guard: true });
  const md = readFileSync(join(root, name), "utf8");
  const headingLine = (h) => {
    const i = md.search(new RegExp(`^##\\s+${h}\\b`, "mi"));
    return i < 0 ? 1 : md.slice(0, i).split("\n").length;
  };

  const profile = section(md, "Profile");
  const presetRow = profile.split("\n").find((l) => /^\|\s*Preset\s*\|/i.test(l)) ?? "";
  const preset = PRESETS.find((p) => new RegExp(`\`${p}\`|\\b${p}\\b`).test(presetRow.split("|").slice(2).join("|"))) ?? null;
  const areasRow = profile.split("\n").find((l) => /^\|\s*Areas?\s*\|/i.test(l)) ?? "";
  const areasCell = areasRow.split("|").slice(2).join(" ").trim();
  const areas = parseAreas(areasCell);
  // Written, but not as `pattern → preset`: say so, rather than judge every file by the base preset in silence.
  const areasUnread = areas.length === 0 && Boolean(areasCell) && !/^(none|—|-|n\/a)$/i.test(areasCell) && !/\be\.g\./i.test(areasCell);

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

  // `| Guard | off |` under ## Profile turns the live guard off for this project.
  const guardRow = profile.split("\n").find((l) => /^\|\s*Guard\s*\|/i.test(l)) ?? "";
  const guard = !/\b(off|no|false|disabled?)\b/i.test(guardRow.split("|").slice(2).join("|"));

  const componentsUnread = [];
  const components = parseComponents(section(md, "Components"), componentsUnread);
  // A listed file that's gone: copies of it can't be found, so say so rather than go quiet.
  const componentsMissing = components.filter((c) => !existsSync(join(root, c.file)));

  return withAreas({
    found: true,
    components,
    componentsMissing,
    componentsUnread,
    guard,
    file: name,
    lines: { motion: headingLine("Motion"), layout: headingLine("Layout") },
    preset,
    areas,
    areasUnread,
    labelCase,
    durations: durations.size ? durations : null,
    roles,
    zLadder: zLadder.size ? zLadder : null,
  });
}

/**
 * Give a design the questions the rules ask of it: which area a file or a
 * route is in, and so which preset judges it. Outside every area, the
 * project's preset.
 */
function withAreas(design) {
  const files = design.areas.filter((a) => !a.route);
  const routes = design.areas.filter((a) => a.route);
  design.areaFor = (file) => (file ? bestArea(files, String(file).replace(/^\.\//, "")) : null);
  design.presetFor = (file) => design.areaFor(file)?.preset ?? design.preset;
  /** A page: by its source file when the router names one, else by its route. */
  design.areaForPage = (route, file) => (file && design.areaFor(file)) || (route ? bestArea(routes, route) : null);
  design.presetForPage = (route, file) => design.areaForPage(route, file)?.preset ?? design.preset;
  return design;
}
