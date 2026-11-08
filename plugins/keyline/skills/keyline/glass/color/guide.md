# Glass Colour

> **Glass preset.** This is the colour system running on [modimihir.com](https://modimihir.com), with its real values, meant to be copied whole. Read it beside `domains/color/guide.md`: the laws and their reasons are there, and this guide holds only what Glass decides — its ramps, its tokens, its recipes and why it chose them. Under any other preset, the domain guide leads and this guide is only a worked example.

Monochrome, built on [Geist](https://vercel.com/geist)'s grayscale semantics under Apple-style translucent materials. Each step of the grey ramp is a job, not a lightness (domain law 1): `gray-400` is *the colour a border is*, and dark mode re-tints the same indices.

## 1. The intent-indexed ramp

| Step | Intent | Light | Dark |
|---|---|---|---|
| 100 | Raised element's surface | `#f2f2f2` | `#1a1a1a` |
| 200 | Surface, hovered | `#ebebeb` | `#212121` |
| 300 | Surface, active/pressed | `#e6e6e6` | `#282828` |
| 400 | **Border** | `#eaeaea` | `#2e2e2e` |
| 500 | Border, hovered — and decorative marks | `#c9c9c9` | `#707070` |
| 600 | Border, active | `#a8a8a8` | `#7d7d7d` |
| 700 | Solid fill (button, marker) | `#8f8f8f` | `#8f8f8f` |
| 800 | Solid fill, hovered | `#7d7d7d` | `#a0a0a0` |
| 900 | **Secondary text** | `#4d4d4d` | `#c4c4c4` |
| 1000 | **Primary text** | `#171717` | `#ededed` |

Two surfaces sit apart; a page background is not a component surface:

| Token | Intent | Light | Dark |
|---|---|---|---|
| `background-100` | Page / card surface | `#ffffff` | `#0b0b0b` |
| `background-200` | Subtle secondary surface | `#fafafa` | `#161616` |

**400 is lighter than 300 in the light theme** (`#eaeaea` vs `#e6e6e6`): intent wins over monotonicity (domain law 1).

**Steps 500–800 are borders and fills, never text** (§4).

→ Each step and its misuse: `glass/color/intent-ramp.md`

## 2. The parallel translucent ramp

Glass's translucent set (domain law 4), for borders on glass, dividers, hairlines and overlays:

```css
--color-gray-alpha-100: #0000000d;   /*  5% */
--color-gray-alpha-200: #00000015;   /*  8% */
--color-gray-alpha-300: #0000001a;   /* 10% */
--color-gray-alpha-400: #00000014;   /*  8% */
--color-gray-alpha-500: #00000036;   /* 21% */
--color-gray-alpha-600: #0000003d;   /* 24% */
```

In dark mode it inverts to **white**-based:

```css
:root[data-theme="dark"] {
  --color-gray-alpha-100: #ffffff0d;
  --color-gray-alpha-400: #ffffff17;
  /* … */
}
```

**Solid ramp for opaque surfaces, alpha ramp for anything layered:** a solid `gray-400` border on a translucent panel ignores what's behind it; `gray-alpha-400` sits *on* it, white page or photograph.

## 3. One accent for focus — and at most one deliberate exception

```css
--color-blue-700: #006bff;   /* light */
--color-blue-700: #3b82f6;   /* dark */
```

One accent, for the focus ring only, the editorial setting of the accent dial. Links stay monochrome; blue ones read as unstyled defaults and dull a blue ring.

```css
:focus-visible {
  outline: 2px solid var(--color-blue-700);
  outline-offset: 2px;
  border-radius: 2px;
}
a:focus-visible { outline-offset: 3px; }
```

Why `:focus-visible`, the offset and the wider link offset: domain law 5. The dark value is brighter (`#3b82f6` vs `#006bff`), re-picked rather than reused (domain law 8).

### The second exception, if you allow one

Glass spends its one exception on a collapsed "short version" panel atop a long case study: **the panel is an offer rather than content** ("do you want the three-line version?"), and nothing else on the site is an offer, so the reason can't spread (domain law 7).

```css
:root {
  --sv-edge-top: #16276b;      /* navy, top of the stroke */
  --sv-edge-mid: #2f5ac4;
  --sv-edge-bottom: #6d97ea;   /* lighter blue, bottom */
  --sv-fill-top: #f4f6fc;
  --sv-fill-bottom: #eef2fa;
  --sv-accent: #2f5ac4;        /* the mark only */
}
```

Only the mark takes `--sv-accent`; the text stays in the page's ink (domain law 7). In dark mode every stop moves (domain law 8):

```css
:root[data-theme="dark"] {
  --sv-edge-top: #24407f;   /* was #16276b */
  --sv-edge-mid: #3f6ed0;
  --sv-edge-bottom: #86adf7;
  --sv-fill-top: #171d2a;   /* tinted, not darkened */
  --sv-fill-bottom: #1b2230;
  --sv-accent: #86adf7;
}
```

A `#16276b` stop on a `#0b0b0b` page loses the stroke's darker half, so the whole ramp lifts, not just that end. The fill is *tinted* to `gray-100`'s weight, not darkened, so it doesn't punch a hole in the page (the glass-tint rule, §6). The material — a 1px gradient stroke, a side-weighted glow, no wrapper — belongs to `glass/depth/guide.md`.

### Status colour is not an exception

Nothing on the site reports state, so Glass ships no status pair; if you add one, it follows domain law 6 and `domains/color/status-and-exceptions.md` (`glass/color/intent-ramp.md` has Glass's notes). Every destructive or session-ending action (delete, clear, sign out) shares one red treatment, wherever it sits.

## 4. Text is a five-tier ladder — and it is *not* the grey ramp

The lower three tiers are **their own tokens**, set by contrast (domain laws 2 and 3):

| Tier | Token | Light | Dark | Job |
|---|---|---|---|---|
| Primary | `gray-1000` | 17.93:1 | 16.81:1 | Body copy, headings, active state |
| Secondary | `gray-900` | 8.45:1 | 11.28:1 | Emphasis short of primary, ancestor rows |
| Muted | `muted` `#5e5e5e` / `#a0a0a0` | 6.48:1 | 7.53:1 | Deks, supporting copy, `<em>` |
| Quiet | `quiet` `#696969` / `#878787` | 5.49:1 | 5.48:1 | Resting icons, state labels, `<cite>` |
| Faint | `faint` `#757575` / `#7a7a7a` | 4.61:1 | 4.59:1 | Dates, read times, meta |

In a light theme only 900 and 1000 of the grey ramp read as text; the site shipped mid steps as text until an audit caught it (the failure table and fix: `glass/color/intent-ramp.md`).

**Icons go on `quiet`, not a tier of their own.** They need only 3:1, but usually sit beside a label at the same colour, and two tokens kept matched is more coupling than it saves. An icon rests a tier *below* its label (domain law 2); both go to primary on hover.

**Decorative marks stay on the grey ramp**: `bg-gray-500` for a bullet, a 3px dot or an inactive rail marker (domain law 2's `mark`).

**`<em>` maps to *muted*.** Italics are off globally (`glass/type/guide.md`), so `*em*` recedes to `muted` and `**strong**` advances to `gray-1000` + weight 500.

## 5. Theming: one attribute, one set of tokens

`data-theme` on `<html>` drives dark mode, not `prefers-color-scheme`, so a toggle can override the OS (domain law 9):

```css
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));
```

The dark theme is one block re-tinting the same names:

```css
:root[data-theme="dark"] {
  color-scheme: dark;
  --color-gray-100: #1a1a1a;      /* low steps become dark surfaces */
  --color-gray-1000: #ededed;     /* high steps become light text */
  --color-gray-alpha-100: #ffffff0d;
  --color-background-100: #0b0b0b;
  /* … */
}
```

Utilities read the variables, so most of the site needs **no per-component `dark:` classes**. Dark surfaces are `#0b0b0b`, not `#000000` (domain law 8).

### No flash of wrong theme

A blocking inline script in `<head>`, before any paint (domain law 9):

```html
<script>
  (function () {
    try {
      document.documentElement.dataset.theme =
        localStorage.getItem("theme") === "dark" ? "dark" : "light";
    } catch (e) {}
  })();
</script>
```

→ Persistence, toggle crossfade, light/dark/system trade-offs: `glass/color/theming.md`

## 6. Some colours are runtime, not build-time

The ramps and surfaces are vocabulary, in `@theme`; the **glass tints** are plain `:root` properties (domain law 10):

```css
:root {
  --glass-nav-bg:    rgba(242, 242, 242, 0.72);
  --glass-panel-bg:  rgba(243, 243, 243, 0.97);
  --folder-glass-bg: linear-gradient(to bottom, rgba(255,255,255,0.55), rgba(255,255,255,0.34));
}
```

The `prefers-reduced-transparency` fallback swaps each for a solid tint at runtime, and one isn't a colour at all. Gradients put the `--sv-*` family in `:root` too (two multi-stop gradients and a four-layer `box-shadow`).

The nav tint is `#f2f2f2` (`gray-100`), not white: grey chrome reads as an object, not a hole in the page. Dark tints are *lighter* than the dark page (domain law 8).

The reduced-transparency swap comes **after** both theme blocks and names both selectors (domain law 10):

```css
@media (prefers-reduced-transparency: reduce) {
  :root, :root[data-theme="dark"] {
    --glass-nav-bg: var(--color-gray-100);
    --glass-panel-bg: var(--color-gray-100);
    --folder-glass-bg: var(--color-background-100);
  }
}
```

Dropping the `backdrop-filter` is the other half, and both are required. Blur, saturation, elevation shadows and text contrast over glass belong to `glass/depth/guide.md`.

## Assets

- `glass/color/assets/color-tokens.css` — ramps, themes, glass tints and their fallback swap, focus ring; pairs with `glass/depth/assets/glass.css` (material classes).
- `glass/color/assets/theme.ts` — persistence, toggle crossfade, no-flash head script.

## Checklist

The domain checklist, plus Glass's values:

- [ ] Steps used for their intent: borders at 400, surfaces at 100–300, the page on `background-100`.
- [ ] **No step from 500 to 800 as text**; text is `gray-900`/`gray-1000` or muted/quiet/faint.
- [ ] Resting icons on `quiet`; decorative marks on `gray-500`.
- [ ] `gray-alpha-*` for anything layered, white-based in dark.
- [ ] `blue-700` for focus only, `#006bff` light and `#3b82f6` dark; links monochrome.
- [ ] At most the one `--sv-*` exception, every stop re-picked for dark.
- [ ] `data-theme` on `<html>`, set by the head script; dark page `#0b0b0b`.
- [ ] Glass tints and `--sv-*` in `:root`, not `@theme`; the reduced-transparency swap last.
- [ ] Contrast checked in both themes; muted text on a subtle surface is what fails.
- [ ] Glass surfaces audited against the `glass/depth/guide.md` checklist.
