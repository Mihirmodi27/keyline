/**
 * What a component looks like, as a set of style values, so a new component
 * built like an existing one can be pointed back at it.
 *
 * A component's look is every class it writes (a Tailwind utility as written,
 * variants included; a plain class as the declarations its stylesheet gives
 * `.name`) and every style it sets inline or in CSS-in-JS. Class names never
 * count for themselves when a stylesheet defines them: `.cta` and `.btn` with
 * the same declarations are the same look.
 *
 * Route files (a Next page or layout, anything under pages/) are screens, not
 * components to reuse, and are left out; comparing pages is the audit's work.
 */
import { normValue } from "./tokens.mjs";

/** Below this many style values a component is too plain to call a copy of anything. */
export const MIN_VALUES = 6;
/** The share of style values two components must have in common (of all either uses). */
export const ALIKE = 0.8;

export const ROUTE_FILE = /(^|\/)(page|layout|template|loading|error|not-found|default|route|global-error)\.(tsx|jsx|ts|js)$|(^|\/)pages\//;

/** class name → the declarations stylesheets give it, from simple `.name` and `.name:hover` selectors. */
export function classStyles(decls) {
  const map = new Map();
  for (const d of decls) {
    if (d.prop.startsWith("--") || !d.selector || d.inline) continue;
    for (const part of d.selector.split(",")) {
      const m = part.trim().match(/^\.([\w-]+)((?::{1,2}[\w-]+(?:\([^)]*\))?)*)$/);
      if (!m) continue;
      const media = d.atRules.filter((a) => !/^@layer\b/i.test(a)).join(" ");
      if (!map.has(m[1])) map.set(m[1], new Set());
      map.get(m[1]).add(`${media ? media + " " : ""}${m[2]}${d.prop}:${normValue(d.value)}`);
    }
  }
  return map;
}

/** Every component in `facts` with its look: [{ component, values: Set }]. */
export function looks(facts, styles) {
  const byFile = new Map();
  for (const c of facts.components) {
    if (ROUTE_FILE.test(c.file)) continue;
    if (!byFile.has(c.file)) byFile.set(c.file, []);
    byFile.get(c.file).push({ component: c, values: new Set() });
  }
  for (const list of byFile.values()) list.sort((a, b) => a.component.line - b.component.line);
  const owner = (file, line) => {
    const list = byFile.get(file);
    if (!list) return null;
    // Classes above the first component (a `cva(…)` recipe, a class constant) are its.
    let found = list[0];
    for (const x of list) if (x.component.line <= line) found = x;
    return found;
  };
  for (const c of facts.classes) {
    const o = owner(c.file, c.line);
    if (!o) continue;
    const css = c.variants.length === 0 ? styles.get(c.base) : null;
    if (css) for (const v of css) o.values.add(v);
    else o.values.add([...c.variants, c.base].join(":"));
  }
  for (const d of facts.decls) {
    if (d.prop.startsWith("--")) continue;
    const o = owner(d.file, d.line);
    if (o) o.values.add(`${d.prop}:${normValue(d.value)}`);
  }
  return [...byFile.values()].flat();
}

/** How many values two looks share, of how many either uses. */
export function overlap(a, b) {
  let shared = 0;
  for (const v of a) if (b.has(v)) shared++;
  return { shared, of: a.size + b.size - shared };
}

/** The tagged row (DESIGN.md's ## Components) a component is, or null. */
export function taggedAs(tags, c) {
  return tags.find((t) => t.file === c.file && (!t.name || t.name === c.name)) ?? null;
}
