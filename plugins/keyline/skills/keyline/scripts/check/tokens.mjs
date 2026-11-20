/**
 * The project's tokens by value, so a value typed raw can name the token it
 * bypasses: `#0a0a0a` in a `color` is `--ink`'s value, `12px` in a
 * `border-radius` is `--radius-card`'s.
 *
 * A token is a custom property defined at the base of the cascade — on `:root`,
 * `html`, `:host`, or in Tailwind v4's `@theme` — with a value of its own.
 * A definition under a dark selector or a media query is a theme's or a
 * width's value, not the token's; an alias (`var(--x)`) has no value to match.
 *
 * Families keep a match honest: an `8px` padding never names a radius token.
 * A colour token is known by its value; the others by name and value together.
 */

/** Which family a token's name puts it in, for the families a name decides. */
const NAMED = [
  ["radius", /radius|rounded|corner/],
  ["shadow", /shadow|elevation/],
  ["size", /^--(text|font-size|fs|type)-|font-size|text-size/],
  ["space", /^--(space|spacing|gap|gutter|inset|pad|padding|margin|stack)\b|-(space|spacing|gap|gutter)\b/],
];
const NOT_SIZE = /line-height|leading|tracking|letter|weight|family|color|colour/;

const LENGTH = /^-?(\d*\.?\d+)(px|rem|em)$/;
const BASE_SELECTOR = /^(:root|html|:host)$/;
const DARK = /dark|\[data-theme|\.theme-|prefers-color-scheme/;

/** Two-digit hex for a channel 0–255. */
const hex2 = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");

/**
 * A colour in one spelling: lowercase six- or eight-digit hex for hex and
 * integer rgb()/rgba(), opaque alpha dropped. Anything else (oklch, hsl, a
 * percentage) is compared as written, lowercased with its spaces collapsed.
 */
export function normColor(c) {
  const s = String(c).trim().toLowerCase();
  let m = s.match(/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/);
  if (m) {
    let h = m[1];
    if (h.length <= 4) h = [...h].map((x) => x + x).join("");
    return `#${h.endsWith("ff") && h.length === 8 ? h.slice(0, 6) : h}`;
  }
  m = s.match(/^rgba?\(\s*(\d+)\s*[, ]\s*(\d+)\s*[, ]\s*(\d+)\s*(?:[,/]\s*(\d*\.?\d+)\s*)?\)$/);
  if (m) {
    const a = m[4] === undefined ? 1 : parseFloat(m[4]);
    return `#${hex2(+m[1])}${hex2(+m[2])}${hex2(+m[3])}${a >= 1 ? "" : hex2(a * 255)}`;
  }
  return normValue(s);
}

/** Any other value in one spelling: lowercase, spaces collapsed, none after commas or inside parentheses, a leading zero restored. */
export function normValue(v) {
  return String(v)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ",")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/(^|[\s(,])\.(\d)/g, (_, lead, d) => `${lead}0.${d}`);
}

const isColor = (v) => /^#[0-9a-f]{3,8}$/i.test(v) || /^(rgba?|hsla?|oklch|oklab|lab|lch|hwb|color)\(/i.test(v);

/** Values too common to be a token's alone: nobody should be told `0` is `--space-0`. */
export function trivial(v) {
  return /^(0|0px|0rem|1px|auto|none|inherit|initial|unset|currentcolor|transparent)$/i.test(v) || /%$/.test(v);
}

/** Whether a definition is the token's base value, not a theme's or a width's. */
function atBase(d) {
  const at = d.atRules.filter((a) => !/^@(layer|theme)\b/i.test(a));
  if (at.length) return false;
  if (d.atRules.some((a) => /^@theme\b/i.test(a))) return true;
  const parts = d.selector.split(",").map((s) => s.trim());
  return parts.some((s) => BASE_SELECTOR.test(s)) && !DARK.test(d.selector);
}

/**
 * Index the token definitions among `decls`: family → normalised value → the
 * names that hold it, in the order they're defined.
 */
export function indexTokens(decls) {
  const index = new Map();
  const add = (family, value, name) => {
    if (!index.has(family)) index.set(family, new Map());
    const byValue = index.get(family);
    const names = byValue.get(value) ?? [];
    if (!names.includes(name)) names.push(name);
    byValue.set(value, names);
  };
  for (const d of decls) {
    if (!d.prop.startsWith("--") || !atBase(d)) continue;
    const value = d.value.replace(/\s*!important$/i, "").trim();
    if (!value || /\bvar\(/i.test(value) || trivial(value)) continue;
    if (isColor(value)) {
      add("color", normColor(value), d.prop);
      continue;
    }
    for (const [family, re] of NAMED) {
      if (!re.test(d.prop)) continue;
      if (family === "size" && (NOT_SIZE.test(d.prop) || !(LENGTH.test(value) || /^clamp\(/i.test(value)))) continue;
      if ((family === "radius" || family === "space") && !(LENGTH.test(value) || /^(clamp|calc|min|max)\(/i.test(value))) continue;
      add(family, normValue(value), d.prop);
      break;
    }
  }
  return {
    count: [...index.values()].reduce((n, m) => n + m.size, 0),
    /** The tokens of `family` whose value is `value`, or an empty list. */
    find(family, value) {
      if (!value || trivial(value)) return [];
      const v = family === "color" ? normColor(value) : normValue(value);
      return index.get(family)?.get(v) ?? [];
    },
  };
}

/** `--a`, or `--a` and `--b`, or `--a`, `--b` and 2 more, each in backticks. */
export function nameTokens(names) {
  const q = names.map((n) => `\`${n}\``);
  if (q.length === 1) return q[0];
  if (q.length === 2) return `${q[0]} and ${q[1]}`;
  if (q.length === 3) return `${q[0]}, ${q[1]} and ${q[2]}`;
  return `${q[0]}, ${q[1]} and ${q.length - 2} more`;
}

/** A Tailwind arbitrary value as CSS: `[12px]` → `12px`, `[0_1px_2px_#000]` → `0 1px 2px #000`. */
export function arbitrary(base) {
  const m = base.match(/-\[(?:[a-z-]+:)?([^\]]+)\]$/i);
  return m ? m[1].replace(/_/g, " ") : null;
}
