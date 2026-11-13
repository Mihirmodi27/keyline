/**
 * The detector's rules. Each is one law from a domain guide that can be checked
 * from source text alone, with no model: a value, a pattern, or a signal that
 * is missing from the whole project.
 *
 * A rule gets the facts gathered from every file and returns findings. Severity:
 *   error    breaks accessibility or hides content — fails a check run
 *   warning  breaks a law in a way a reader feels
 *   info     a stray or a missing safeguard worth a look
 *
 * What a rule can't see — hierarchy, grouping, whether a card should be a
 * section — is left to `/keyline critique` and `/keyline audit`.
 */

const COLOR_FN = /\b(rgba?|hsla?|oklch|oklab|lab|lch|hwb)\(([^()]*(?:\([^()]*\)[^()]*)*)\)/gi;
const HEX = /(^|[^\w&-])#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})\b/i;
const WEIGHT_WORDS = { thin: 100, hairline: 100, extralight: 200, ultralight: 200, light: 300, normal: 400, regular: 400, medium: 500, semibold: 600, demibold: 600, bold: 700, extrabold: 800, ultrabold: 800, black: 900, heavy: 900 };
const LAYOUT_PROPS = /\b(width|height|min-width|min-height|max-width|max-height|top|left|right|bottom|inset|margin(?:-\w+)?|padding(?:-\w+)?)\b/;
const TAILWIND_ARBITRARY_COLOR = /^-?(?:bg|text|border(?:-[trblxyse])?|ring|ring-offset|outline|fill|stroke|from|via|to|shadow|decoration|divide|placeholder|caret|accent)-\[(?:color:)?(#[0-9a-f]{3,8}|(?:rgba?|hsla?|oklch|oklab)\([^\]]*\))\]/i;

const inFontFace = (d) => d.atRules.some((a) => /^@font-face/i.test(a));
const inTheme = (d) => d.atRules.some((a) => /^@theme\b/i.test(a));
const inKeyframes = (d) => d.atRules.some((a) => /^@(-webkit-)?keyframes/i.test(a));
const isDefinition = (d) => d.prop.startsWith("--") || inTheme(d);
const stripUrls = (v) => v.replace(/url\((?:[^()]|\([^()]*\))*\)/gi, "url()");

/** A literal colour in a value, ignoring colour functions that wrap a var(). */
function literalColor(value) {
  const v = stripUrls(value);
  const hex = v.match(HEX);
  if (hex) return `#${hex[2]}`;
  for (const m of v.matchAll(COLOR_FN)) if (!/var\(/.test(m[2])) return m[0];
  return null;
}

/** Every colour in a value is black or white, at any alpha. */
function neutralOnly(value) {
  const v = stripUrls(value);
  const colours = [...v.matchAll(/#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?)\([^)]*\)/gi)].map((m) => m[0].toLowerCase());
  return colours.length > 0 && colours.every((c) => /^#(0{3,4}|0{6}|0{8}|f{3,4}|f{6}|f{6}[0-9a-f]{2}|0{6}[0-9a-f]{2})$/.test(c) || /^rgba?\(\s*(0\s*[, ]\s*0\s*[, ]\s*0|255\s*[, ]\s*255\s*[, ]\s*255)\b/.test(c));
}

/**
 * The duration in each part of a transition or animation shorthand — the first
 * time in each comma-separated part. The second is a delay, which is choreography,
 * not a tier on the ladder.
 */
function shorthandDurations(value) {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < value.length; i++) {
    if (value[i] === "(") depth++;
    else if (value[i] === ")") depth--;
    else if (value[i] === "," && depth === 0) {
      parts.push(value.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(value.slice(start));
  return parts.map((p) => durationsIn(p.replace(/(?:var|calc)\((?:[^()]|\([^()]*\))*\)/g, ""))[0]).filter((n) => n !== undefined);
}

function durationsIn(value) {
  const out = [];
  for (const m of value.matchAll(/(?<![\w.-])(\d*\.?\d+)(ms|s)\b/g)) {
    const ms = m[2] === "s" ? parseFloat(m[1]) * 1000 : parseFloat(m[1]);
    out.push(Math.round(ms));
  }
  return out;
}

const tw = (facts, test) => facts.classes.filter((c) => test(c.base, c));
const first = (arr) => arr[0];
const where = (x) => ({ file: x.file, line: x.line });
const plural = (n, one, many = one + "s") => `${n} ${n === 1 ? one : many}`;
const list = (xs, n = 4) => xs.slice(0, n).join(", ") + (xs.length > n ? `, +${xs.length - n} more` : "");

/* ── Type ───────────────────────────────────────────────────────────────── */

const typeRules = [
  {
    id: "type/weights",
    domain: "type",
    law: "type law 5",
    title: "Too many font weights",
    check(facts, { design }) {
      const uses = new Map(); // weight → [locations]
      const add = (w, loc) => {
        if (!w || w < 100 || w > 1000) return;
        uses.set(w, [...(uses.get(w) ?? []), loc]);
      };
      for (const d of facts.decls) {
        if (inFontFace(d)) continue;
        if (d.prop === "font-weight" || (d.prop.startsWith("--") && /weight/.test(d.prop))) {
          const v = d.value.trim().toLowerCase();
          add(/^\d{3}$/.test(v) ? Number(v) : WEIGHT_WORDS[v], where(d));
        }
      }
      for (const c of tw(facts, (b) => /^font-(\w+|\[\d{3}\])$/.test(b))) {
        const w = c.base.slice(5);
        add(/^\[\d{3}\]$/.test(w) ? Number(w.slice(1, -1)) : WEIGHT_WORDS[w], where(c));
      }
      const allowed = { editorial: 2, glass: 2, product: 3, expressive: 3 }[design.preset] ?? 3;
      if (uses.size <= allowed) return [];
      const ranked = [...uses].sort((a, b) => b[1].length - a[1].length);
      const rare = ranked.at(-1);
      return [
        {
          ...first(rare[1]),
          severity: "warning",
          message: `${uses.size} font weights in use (${ranked.map(([w, l]) => `${w}×${l.length}`).join(", ")}); ${design.preset ? `the ${design.preset} preset allows ${design.preset === "product" ? "two, and a third only for a recorded job" : allowed}` : `more than ${allowed} rarely each have a job`}. Every weight needs a job you can name — fold ${rare[0]} into a neighbour, or record why it's needed under ## Decisions.`,
        },
      ];
    },
  },
  {
    id: "type/uppercase",
    domain: "type",
    law: "type dials: uppercase labels",
    title: "Uppercase labels",
    check(facts, { design }) {
      // Capitals are a valid label style; the finding is a project contradicting its own record.
      if (design.labelCase !== "sentence") return [];
      const hits = [
        ...tw(facts, (b) => b === "uppercase").map(where),
        ...facts.decls.filter((d) => d.prop === "text-transform" && /uppercase/i.test(d.value)).map(where),
      ];
      return hits.map((h) => ({
        ...h,
        severity: "warning",
        message: "Uppercase label, but DESIGN.md sets labels in sentence case — match it, or record the capitals as a label role under ## Type.",
      }));
    },
  },
  {
    id: "type/tracking-px",
    domain: "type",
    law: "type law 7",
    title: "Letter-spacing in px",
    check(facts) {
      const hits = [
        ...facts.decls.filter((d) => d.prop === "letter-spacing" && /(?<![\w.])-?\d*\.?\d+px/.test(d.value) && !/^0(px)?$/.test(d.value.trim())),
        ...tw(facts, (b) => /^tracking-\[-?[\d.]+px\]$/.test(b)),
      ];
      return hits.map((h) => ({ ...where(h), severity: "warning", message: "Letter-spacing in px. Tracking is a correction for size, so it has to scale with it: write it in em (−0.02em, not −0.32px)." }));
    },
  },
  {
    id: "type/viewport-font-size",
    domain: "type",
    law: "type dials: unit (WCAG 1.4.4)",
    title: "Text sized in viewport units alone",
    check(facts) {
      const hits = [
        ...facts.decls.filter((d) => (d.prop === "font-size" || (d.prop.startsWith("--") && /text|font-size/.test(d.prop))) && /\d(vw|vi|vmin|vmax|cqw)\b/.test(d.value) && !/clamp\(|calc\([^)]*(rem|px|em)/.test(d.value)),
        ...tw(facts, (b) => /^text-\[[\d.]+(vw|vi|vmin|vmax)\]$/.test(b)),
      ];
      return hits.map((h) => ({ ...where(h), severity: "error", message: "Font size in viewport units alone ignores the reader's zoom. Use clamp() with a rem intercept, e.g. clamp(2rem, 1.2rem + 3vw, 4rem)." }));
    },
  },
  {
    id: "type/italic",
    domain: "type",
    law: "type law 9",
    title: "Italic under a preset without it",
    check(facts, { design }) {
      if (!["product", "glass"].includes(design.preset)) return [];
      const hits = [
        ...tw(facts, (b) => b === "italic"),
        ...facts.decls.filter((d) => d.prop === "font-style" && /italic|oblique/.test(d.value) && !inFontFace(d)),
      ];
      return hits.map((h) => ({ ...where(h), severity: "warning", message: `Italic. The ${design.preset} preset maps emphasis to ${design.preset === "glass" ? "weight and colour" : "a quieter text tier"}, not a slanted style.` }));
    },
  },
  {
    id: "type/font-synthesis",
    domain: "type",
    law: "type law 9",
    title: "Browsers may fake missing styles",
    check(facts) {
      if (!facts.project.selfHostedFonts) return [];
      if (facts.decls.some((d) => d.prop === "font-synthesis" || d.prop === "font-synthesis-weight" || d.prop === "font-synthesis-style")) return [];
      return [{ ...facts.project.selfHostedFonts, severity: "info", message: "No font-synthesis rule. Set `font-synthesis: none` on the root, so a missing italic or bold shows up in review as a gap instead of shipping as a smeared fake." }];
    },
  },
  {
    id: "type/zoom-disabled",
    domain: "type",
    law: "type dials: responsive sizes",
    title: "Zoom disabled",
    check(facts) {
      return facts.zoomLocks.map((z) => ({ ...z, severity: "error", message: "The viewport stops pinch-zoom. Remove maximum-scale / user-scalable — it takes zoom from every reader. Make inputs 16px on touch widths instead, which is what stops iOS zooming on focus." }));
    },
  },
  {
    id: "type/fractional-size",
    domain: "type",
    law: "type law 1",
    title: "Font size off any ladder",
    check(facts) {
      const hits = [
        ...facts.decls.filter((d) => d.prop === "font-size" && /(?<![\w.])\d+\.\d+px\b/.test(d.value)),
        ...tw(facts, (b) => /^text-\[\d+\.\d+px\]$/.test(b)),
      ];
      return hits.map((h) => ({ ...where(h), severity: "info", message: "A fractional pixel font size is a value no role claimed — it hints differently across engines. Snap it to a size on the ladder, or name the role that needs it." }));
    },
  },
];

/* ── Colour ─────────────────────────────────────────────────────────────── */

const colorRules = [
  {
    id: "color/raw-color",
    domain: "color",
    law: "color law 1",
    title: "Colour typed inline",
    check(facts) {
      const out = [];
      for (const d of facts.decls) {
        if (isDefinition(d) || inFontFace(d) || /^(src|content|mask|mask-image|-webkit-mask-image|filter|font-family)$/.test(d.prop)) continue;
        // Print is ink on paper: black on white is the point, not a stray.
        if (d.atRules.some((a) => /^@media\b[^{]*\bprint\b/i.test(a))) continue;
        // Light and shade in a shadow recipe — white or black at some alpha — is the
        // recipe, not a palette colour; the recipe itself is what depth law 4 wants
        // kept in one definition. A tinted shadow (a blue glow) still counts.
        if (/^(box-shadow|text-shadow)$/.test(d.prop) && neutralOnly(d.value)) continue;
        // Gradient stops and filter lights only exist inside SVG artwork, which colour law 1 exempts.
        if (/^(stop-color|flood-color|lighting-color)$/.test(d.prop)) continue;
        const c = literalColor(d.value);
        if (!c) continue;
        // fill and stroke paint SVG: artwork (exempt) or an icon (should be currentColor). A regex can't tell which.
        if (/^(fill|stroke)$/.test(d.prop)) {
          out.push({ ...where(d), severity: "info", message: `\`${c}\` painted into \`${d.prop}\`. Inside artwork marked \`role="img"\` that's fine (colour law 1); on an icon, use \`currentColor\` so it follows its label.` });
          continue;
        }
        out.push({ ...where(d), severity: "warning", message: `\`${c}\` typed into \`${d.prop}\`${d.inline ? " in an inline style" : ""}. Give it a token named for its job (a text tier, a border, a status), so a theme or a contrast fix changes it once.` });
      }
      for (const c of tw(facts, (b) => TAILWIND_ARBITRARY_COLOR.test(b))) {
        out.push({ ...where(c), severity: "warning", message: `\`${c.base}\` puts a raw colour in a class. Map it to a token named for its job.` });
      }
      return out;
    },
  },
  {
    id: "color/focus-removed",
    domain: "color",
    law: "color law 5",
    title: "Focus outline removed with no replacement",
    check(facts) {
      const out = [];
      for (const d of facts.decls) {
        if (!/^outline(-style)?$/.test(d.prop) || !/^(none|0)$/.test(d.value.trim())) continue;
        const sel = d.selector;
        if (/:focus-visible|:focus:not\(:focus-visible\)/.test(sel)) continue;
        const restored = d.block?.decls.some((x) => /^(box-shadow|border-color|background|background-color)$/.test(x.prop)) && /:focus/.test(sel);
        if (restored) continue;
        if (facts.project.focusVisible && !/:focus\b/.test(sel)) continue;
        out.push({ ...where(d), severity: facts.project.focusVisible ? "warning" : "error", message: `\`${sel || "this rule"}\` removes the outline${facts.project.focusVisible ? " on :focus" : " and nothing in the project styles :focus-visible"}. Keyboard users lose their place: replace it with a visible :focus-visible ring at 3:1 on every surface.` });
      }
      for (const list of facts.classLists) {
        const removes = list.tokens.find((t) => (t.base === "outline-none" || t.base === "outline-0") && !t.variants.includes("focus-visible"));
        if (!removes) continue;
        const restores = list.tokens.some((t) => t.variants.includes("focus-visible") || t.variants.includes("focus-within") || (t.variants.includes("focus") && /^(ring|outline|border|shadow|bg)/.test(t.base)));
        if (restores) continue;
        // Focused only by script (roving focus, a listbox, a scroll region): the active item carries the signal.
        if (/\btab[iI]ndex\s*=\s*(\{\s*-1\s*\}|["']-1["'])/.test(list.tag)) continue;
        const field = /^<(input|textarea|select)\b|^<\w*(Input|Textarea|TextArea|Field)\b/.test(list.tag);
        if (field && facts.project.focusWithin) {
          out.push({ file: list.file, line: removes.line, severity: "info", message: `\`${removes.raw}\` on a field. Fine if its wrapper shows focus with \`focus-within:\` at 3:1 — mark it \`keyline-ignore\` then; otherwise give the field a visible focus-visible ring.` });
          continue;
        }
        out.push({ file: list.file, line: removes.line, severity: facts.project.focusVisible ? "warning" : "error", message: `\`${removes.raw}\` with no focus-visible style on the same element. Pair it with a visible ring, e.g. \`focus-visible:ring-2\` in the focus colour.` });
      }
      return out;
    },
  },
];

/* ── Layout ─────────────────────────────────────────────────────────────── */

const layoutRules = [
  {
    id: "layout/z-index",
    domain: "layout",
    law: "layout law 7",
    title: "z-index off the ladder",
    check(facts, { design }) {
      const uses = [];
      for (const d of facts.decls) {
        if (d.prop === "z-index" && /^-?\d+$/.test(d.value.trim())) uses.push({ ...where(d), z: Number(d.value.trim()), how: `z-index: ${d.value.trim()}` });
      }
      for (const c of tw(facts, (b) => /^-?z-(\d+|\[-?\d+\])$/.test(b))) {
        const n = Number(c.base.replace(/^-?z-\[?|\]$/g, "")) * (c.base.startsWith("-") ? -1 : 1);
        uses.push({ ...where(c), z: n, how: c.base });
      }
      const exempt = (z) => z === 0 || z === -1 || z === 1;
      if (design.zLadder) {
        const rungs = [...design.zLadder].filter((z) => !exempt(z));
        const long = rungs.length > 9 ? [{ file: design.file, line: design.lines.layout, severity: "info", message: `The z-index ladder in DESIGN.md has ${rungs.length} values. A ladder needs about seven named rungs; one that records every value in use approves them all.` }] : [];
        return long.concat(uses.filter((u) => !exempt(u.z) && !design.zLadder.has(u.z)).map((u) => ({ ...u, severity: "warning", message: `\`${u.how}\` isn't on the z-index ladder in DESIGN.md (${[...design.zLadder].sort((a, b) => a - b).join(", ")}). Use the rung for what this is, or add a rung.` })));
      }
      const out = uses.filter((u) => u.z >= 1000).map((u) => ({ ...u, severity: "warning", message: `\`${u.how}\` — a literal this high is a bug waiting for its pair. Put every z-index on one named ladder, ordered by how long a thing stays on screen.` }));
      const distinct = [...new Set(uses.map((u) => u.z).filter((z) => !exempt(z)))].sort((a, b) => a - b);
      if (distinct.length > 7) out.push({ ...where(uses[0]), severity: "info", message: `${distinct.length} distinct z-index values (${list(distinct.map(String), 8)}). A ladder needs about seven named rungs; record it in DESIGN.md under ## Layout.` });
      return out;
    },
  },
  {
    id: "layout/viewport-height",
    domain: "layout",
    law: "layout law 4",
    title: "100vh",
    check(facts) {
      const out = [];
      for (const d of facts.decls) {
        if (!/(?<![\w.])100vh\b/.test(d.value) || d.prop.startsWith("--")) continue;
        const fallback = d.block?.decls.some((x) => x !== d && x.prop === d.prop && /\b\d+(dvh|svh|lvh)\b/.test(x.value));
        if (!fallback) out.push({ ...where(d), severity: "warning", message: "`100vh` puts the element's bottom under a mobile browser's address bar. Use `100dvh` (or `svh` for a hero that must never be cut)." });
      }
      for (const c of tw(facts, (b) => /^(h|min-h|max-h)-screen$/.test(b))) {
        out.push({ ...where(c), severity: "warning", message: `\`${c.base}\` is 100vh, which ends under a mobile browser's address bar. Use \`${c.base.replace("screen", "dvh")}\`.` });
      }
      return out;
    },
  },
  {
    id: "layout/target-size",
    domain: "layout",
    law: "layout law 13",
    title: "Target smaller than 24px",
    check(facts) {
      const out = [];
      const MIN = 24;
      // Tailwind: a button or link whose resting height and width both come in under 24px.
      // With border-box sizing, padding doesn't grow a fixed size; a positioned pseudo-element does.
      for (const list of facts.classLists) {
        if (!/^<(button|Button|IconButton|a|Link|NavLink)\b|role\s*=\s*["']button/.test(list.tag || "")) continue;
        const resting = list.tokens.filter((t) => t.variants.length === 0);
        const size = (prefixes) => {
          for (const t of resting) {
            const m = t.base.match(new RegExp(`^(?:${prefixes})-(\\d*\\.?\\d+|\\[(\\d*\\.?\\d+)px\\]|px)$`));
            if (!m) continue;
            return m[1] === "px" ? 1 : m[2] !== undefined ? parseFloat(m[2]) : parseFloat(m[1]) * 4;
          }
          return null;
        };
        const h = size("size|h");
        const w = size("size|w");
        const grown = list.tokens.some((t) => t.variants.some((v) => v === "before" || v === "after") && /^-?inset/.test(t.base));
        if (h === null || w === null || grown) continue;
        if (Math.max(h, size("min-h") ?? 0) < MIN && Math.max(w, size("min-w") ?? 0) < MIN) {
          out.push({ file: list.file, line: list.line, severity: "warning", message: `A ${w}×${h}px target is hard to hit (Fitts's law). Give it at least 24×24px of hit area — 44px on touch — by sizing the control and keeping the icon small, or by insetting a \`before:\` pseudo-element past its edges.` });
        }
      }
      // CSS: a rule for a button or link that fixes both dimensions under 24px.
      // Only the subject of the selector counts: `.icon-btn .dot` sizes a dot inside a
      // button, not the button, so test the last compound of each selector in the list.
      const INTERACTIVE_COMPOUND = /^(button|a)(?![\w-])|^:(is|where)\([^)]*\b(button|a)\b|\[role=["']?button|\.[\w-]*(btn|button)(?![\w-])/i;
      const subjects = (sel) => sel.split(",").map((s) => s.trim().split(/\s*[>+~]\s*|\s+/).pop() ?? "");
      const INTERACTIVE = { test: (sel) => subjects(sel).some((c) => INTERACTIVE_COMPOUND.test(c)) };
      const px = (v) => {
        const m = (v ?? "").trim().match(/^(\d*\.?\d+)px$/);
        return m ? parseFloat(m[1]) : null;
      };
      const pseudoGrown = new Set(facts.decls.filter((d) => /::?(before|after)/.test(d.selector) && /^inset/.test(d.prop)).map((d) => d.selector.replace(/::?(before|after).*$/, "").trim()));
      const seenBlocks = new Set();
      for (const d of facts.decls) {
        if (!d.block || seenBlocks.has(d.block) || d.inline || !INTERACTIVE.test(d.selector) || /::?(before|after)|:hover|:active|:focus/.test(d.selector)) continue;
        seenBlocks.add(d.block);
        const get = (...props) => d.block.decls.find((x) => props.includes(x.prop));
        const hd = get("height", "block-size");
        const wd = get("width", "inline-size");
        if (!hd || !wd) continue;
        const h = Math.max(px(hd.value) ?? Infinity, px(get("min-height", "min-block-size")?.value) ?? 0);
        const w = Math.max(px(wd.value) ?? Infinity, px(get("min-width", "min-inline-size")?.value) ?? 0);
        if (h < MIN && w < MIN && !pseudoGrown.has(d.selector.trim())) {
          out.push({ file: d.file, line: hd.line, severity: "warning", message: `\`${d.selector.trim()}\` is a ${w}×${h}px target, hard to hit (Fitts's law). Give it at least 24×24px of hit area — 44px on touch — or inset a \`::before\` past its edges to grow the target without growing the drawing.` });
        }
      }
      return out;
    },
  },
  {
    id: "layout/skip-link",
    domain: "layout",
    law: "layout law 12",
    title: "No skip link",
    check(facts) {
      if (!facts.project.rootLayout || facts.project.skipLink) return [];
      return [{ file: facts.project.rootLayout, line: 1, severity: "info", message: "No skip link found. Make the first focusable element a link to `#main`, shown on focus, and give the main landmark that id." }];
    },
  },
];

/* ── Depth ──────────────────────────────────────────────────────────────── */

const backdropUses = (facts) => [
  ...facts.decls.filter((d) => /^(-webkit-)?backdrop-filter$/.test(d.prop) && !/^none$/.test(d.value.trim()) && !d.atRules.some((a) => /^@supports/i.test(a))),
  ...tw(facts, (b) => /^backdrop-(blur|saturate|brightness|contrast)/.test(b)),
];

const depthRules = [
  {
    id: "depth/backdrop-guard",
    domain: "depth",
    law: "depth law 15",
    title: "Translucency with no fallback",
    check(facts) {
      const uses = backdropUses(facts);
      if (!uses.length || facts.project.backdropSupports) return [];
      return [{ ...where(uses[0]), severity: "warning", message: `${plural(uses.length, "backdrop blur")} and no \`@supports (backdrop-filter: …)\` guard anywhere. Where the filter is missing the tint is all that's left: start opaque, and turn the translucency on inside the guard.` }];
    },
  },
  {
    id: "depth/prefix-pair",
    domain: "depth",
    law: "depth law 15",
    title: "Hand-written -webkit-backdrop-filter",
    check(facts) {
      if (!facts.project.lightningCss) return [];
      const out = [];
      for (const d of facts.decls) {
        if (d.prop !== "-webkit-backdrop-filter" || !d.block) continue;
        if (d.block.decls.some((x) => x.prop === "backdrop-filter")) {
          out.push({ ...where(d), severity: "warning", message: "Hand-written `-webkit-backdrop-filter` beside `backdrop-filter`. Lightning CSS (Tailwind v4) keeps only the last of the pair, so one engine loses the blur. Write only `backdrop-filter`; the pipeline adds the prefix." });
        }
      }
      return out;
    },
  },
  {
    id: "depth/reduced-transparency",
    domain: "depth",
    law: "depth law 15",
    title: "No reduced-transparency path",
    check(facts) {
      const uses = backdropUses(facts);
      if (!uses.length || facts.project.reducedTransparency) return [];
      return [{ ...where(uses[0]), severity: "info", message: "Translucent surfaces with no `prefers-reduced-transparency` branch. Under it, make each surface opaque and drop the filter — both halves." }];
    },
  },
];

/* ── Motion ─────────────────────────────────────────────────────────────── */

const motionRules = [
  {
    id: "motion/transition-all",
    domain: "motion",
    law: "motion law 13",
    title: "transition: all",
    check(facts) {
      const hits = [
        ...facts.decls.filter((d) => (d.prop === "transition" && /^all\b|,\s*all\b/.test(d.value.trim())) || (d.prop === "transition-property" && /\ball\b/.test(d.value))),
        ...tw(facts, (b) => b === "transition-all"),
      ];
      return hits.map((h) => ({ ...where(h), severity: "warning", message: "`all` transitions properties nobody chose, layout ones included. Name each: e.g. `color, background-color, opacity, transform`." }));
    },
  },
  {
    id: "motion/layout-property",
    domain: "motion",
    law: "motion law 13",
    title: "Animating layout",
    check(facts) {
      const out = [];
      for (const d of facts.decls) {
        if ((d.prop === "transition" || d.prop === "transition-property") && !/^all\b/.test(d.value.trim())) {
          const m = d.value.match(LAYOUT_PROPS);
          if (m) out.push({ ...where(d), severity: "warning", message: `Transitions \`${m[1]}\`, which re-lays out the page every frame. Animate \`transform\` and \`opacity\` instead, or record why this one can't.` });
        } else if (inKeyframes(d) && LAYOUT_PROPS.test(d.prop) && !d.prop.startsWith("--")) {
          out.push({ ...where(d), severity: "warning", message: `A keyframe animates \`${d.prop}\`, which re-lays out the page every frame. Use \`transform\` instead.` });
        }
      }
      for (const c of tw(facts, (b) => /^transition-\[[^\]]*(width|height|top|left|margin|padding)/.test(b))) {
        out.push({ ...where(c), severity: "warning", message: `\`${c.base}\` animates layout every frame. Animate \`transform\` and \`opacity\` instead.` });
      }
      return out;
    },
  },
  {
    id: "motion/reduced-motion",
    domain: "motion",
    law: "motion law 10",
    title: "No reduced-motion branch",
    check(facts) {
      if (facts.project.reducedMotion) {
        // A branch that zeroes every duration on * is a kill switch, not a substitute:
        // the fades that carry meaning go with the movement.
        const kill = facts.decls.find((d) => /^\*|[\s,]\*(?:::?(?:before|after))?\s*(?:,|$)/.test(d.selector.trim()) && d.atRules.some((a) => /prefers-reduced-motion\s*:\s*reduce/i.test(a)) && /^(transition|animation)(-duration)?$/.test(d.prop) && /^(none|0m?s|0\.0*1m?s)\b/i.test(d.value.trim()));
        return kill ? [{ ...where(kill), severity: "info", message: "The reduced-motion branch zeroes every duration on `*`. That turns motion off rather than substituting it: keep the fades and colour changes that say something changed, and drop only the travel and scale." }] : [];
      }
      if (!facts.project.animation) return [];
      return [{ ...facts.project.animation, severity: "error", message: "The project animates, and nothing anywhere reads `prefers-reduced-motion`. Give every movement a substitute under it — usually a short fade, or the end state at once." }];
    },
  },
  {
    id: "motion/duration-ladder",
    domain: "motion",
    law: "motion law 4",
    title: "Durations off the ladder",
    check(facts, { design }) {
      const uses = [];
      for (const d of facts.decls) {
        if (isDefinition(d)) continue;
        if (/^(transition|animation)$/.test(d.prop)) for (const ms of shorthandDurations(d.value)) uses.push({ ...where(d), ms });
        if (/^(transition|animation)-duration$/.test(d.prop)) for (const ms of durationsIn(d.value)) uses.push({ ...where(d), ms });
      }
      for (const c of tw(facts, (b) => /^duration-(\d+|\[[\d.]+m?s\])$/.test(b))) {
        const v = c.base.slice(9);
        uses.push({ ...where(c), ms: /^\d+$/.test(v) ? Number(v) : durationsIn(v.slice(1, -1))[0] });
      }
      uses.push(...facts.jsDurations);
      const real = uses.filter((u) => u.ms > 0);
      if (design.durations) {
        const ladder = [...design.durations].sort((a, b) => a - b);
        const out = real.filter((u) => !design.durations.has(u.ms)).map((u) => ({ ...u, severity: "info", message: `${u.ms}ms isn't on the motion ladder in DESIGN.md (${ladder.map((n) => n + "ms").join(", ")}). Use the tier for how much of the screen changes, or name the exemption.` }));
        // roles.md's one unrenameable rule: duration.* grows with the size of the change.
        // A ladder written down as found can break it, and then approves the inversion.
        const ORDER = ["micro", "state", "popover", "overlay", "route"];
        let prev = null;
        for (const role of ORDER.filter((r) => design.roles.has(r))) {
          const ms = design.roles.get(role);
          if (prev && ms <= prev.ms) out.push({ file: design.file, line: design.lines.motion, severity: "warning", message: `\`duration.${role}\` (${ms}ms) is no longer than \`duration.${prev.role}\` (${prev.ms}ms) in DESIGN.md. Durations grow with the size of the change, so a ladder written down as found needs its strays snapped to a tier, not recorded as one.` });
          if (!prev || ms > prev.ms) prev = { role, ms };
        }
        return out;
      }
      const distinct = [...new Set(real.map((u) => u.ms))].sort((a, b) => a - b);
      if (distinct.length <= 6) return [];
      return [{ ...where(real[0]), severity: "warning", message: `${distinct.length} different durations (${list(distinct.map((n) => n + "ms"), 8)}). Duration should come from a short ladder set by how much of the screen changes — three or four tiers, recorded in DESIGN.md under ## Motion.` }];
    },
  },
];

/* ── Patterns ───────────────────────────────────────────────────────────── */

const VAGUE = /^(ok|okay|yes|no|submit|click here|click|here|go|continue|confirm|done)$/i;
const SMALL_WORDS = new Set(["a", "an", "and", "as", "at", "by", "for", "in", "of", "on", "or", "the", "to", "with", "vs"]);

const patternRules = [
  {
    id: "patterns/vague-label",
    domain: "patterns",
    law: "patterns law 1",
    title: "Label says nothing about the action",
    check(facts) {
      const out = [];
      for (const l of facts.labels) {
        if (/click here/i.test(l.text) || (/^(button|Button)$/.test(l.element) && VAGUE.test(l.text))) {
          out.push({ ...where(l), severity: "info", message: `"${l.text}" doesn't say what happens. A button names its action ("Save changes", "Delete project"); a confirm button repeats its dialog's verb; a link is the thing itself, not "click here".` });
        }
      }
      return out;
    },
  },
  {
    id: "patterns/title-case",
    domain: "patterns",
    law: "patterns law 1",
    title: "Title Case label",
    check(facts) {
      const out = [];
      // Buttons only: link text is often a name, a title or a product, where capitals are right.
      for (const l of facts.labels.filter((x) => /^(button|Button)$/.test(x.element))) {
        const words = l.text.split(/\s+/).filter((w) => /^[A-Za-z][a-z']*$/.test(w) && !SMALL_WORDS.has(w.toLowerCase()));
        if (words.length < 2 || l.text.split(/\s+/).length > 6) continue;
        if (words.every((w) => /^[A-Z][a-z']+$/.test(w))) {
          const sentence = l.text.replace(/(\s)([A-Z])([a-z'])/g, (m, s, c, r) => s + c.toLowerCase() + r);
          out.push({ ...where(l), severity: "info", message: `"${l.text}" is in Title Case. Labels go in sentence case — "${sentence}" — keeping proper nouns as written.` });
        }
      }
      return out;
    },
  },
  {
    id: "patterns/nav-count",
    domain: "patterns",
    law: "patterns law 8",
    title: "Long navigation with no groups",
    check(facts) {
      return facts.navs
        .filter((n) => n.links > 9 && !n.grouped)
        .map((n) => ({ file: n.file, line: n.line, severity: "info", message: `This navigation writes out ${n.links} links in one flat run. Every option shown taxes the choice the reader came to make (Hick's law), and a flat run past a handful reads as noise (Miller's law): put the primary destinations first and group or disclose the rest.` }));
    },
  },
];

export const RULES = [...typeRules, ...colorRules, ...layoutRules, ...depthRules, ...motionRules, ...patternRules];
export const DOMAINS = ["type", "color", "layout", "depth", "motion", "patterns"];
