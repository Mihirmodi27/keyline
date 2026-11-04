# Design system

> Keyline reads this before touching UI, and writes back to it when a decision changes. Edit it by hand whenever you like — it is the source of truth for intent, the code is the source of truth for values. Set up 2026-11-04.

## Profile

| | |
|---|---|
| Product | Field Notes, Halden's engineering blog: one long-form article page with site chrome, end matter and related posts |
| Reader | Reading — a ~1,200-word technical essay, start to finish |
| Preset | `editorial` |
| Areas | none |
| Stack | Static HTML + one stylesheet (`styles.css`), no framework, no JS |
| Tokens live in | `styles.css` `:root` (custom properties) |
| Themes | `light`, `dark` — `@media (prefers-color-scheme: dark)` re-tints `:root`; `color-scheme: light dark` declared in `index.html` |
| Motion | CSS transitions only, plus SMIL `animateMotion` in the cover SVG and a scroll-driven progress bar |

Evidence for the preset: one page whose content is ~1,200 words of serif body copy at a 680px measure, a table of contents rail, a drop cap and a pull quote; chrome is a thin header and a footer. The reader is reading.

## Type

**Families** — `family.text`: Source Serif 4 (`--font-read`, Google Fonts, 400 / 600 / 400 italic) for everything read: body, lead, dek, pull quote, callout and bio. `family.ui`: Inter (`--font-ui`, Google Fonts, 400 / 600) for interface text and for the title and headings, the brand's existing sans voice (see Decisions). `family.mono`: system stack (`--font-mono`: `ui-monospace, "SF Mono", Menlo, Consolas, monospace`).

Sizes are `rem` tokens in `:root` (proposed 2026-11-04, now in code). Six sizes above the 12px floor, plus the title's one phone step.

| Role | Name here | Size | Leading | Tracking | Weight | Tier |
|---|---|---|---|---|---|---|
| `type.title` | `--size-title` · `.article-title` | 2.5rem (40px); `--size-title-phone` 2rem (32px) under 640px | 1.2 | −0.02em | strong | `--ink` |
| `type.heading` | `--size-heading` · `.prose > h2`, `.related__head h2` | 1.5rem (24px) | 1.3 | −0.01em | strong | `--ink` |
| ↳ `pull-quote` (project role) | `.pullquote p` | 1.5rem (24px) | 1.4 | 0 | regular, true italic | `--ink` — parts from the heading on regular weight, the serif italic and the accent bar |
| `type.supporting` | `--size-dek` · `.article-dek` | 1.25rem (20px) | 1.5 | 0 | regular | `--ink-2` |
| ↳ author name | `.author-card__name` | 1.25rem (20px) | 1.3 | 0 | strong, Inter | `--ink` — separates from the dek on family, weight and tier |
| `type.subheading` | `--size-body` · `.post-card h3`, `.callout__title` | 1.125rem (18px) | 1.35 | 0 | strong, Inter | `--ink` |
| `type.lead` | `--size-body` · `.prose .lead` | 1.125rem (18px) | 1.85 | 0 | regular | `--ink` — separates on leading and tier |
| ↳ `drop-cap` (project role) | `.lead::first-letter` | 4.1em | 0.82 | 0 | strong, Inter | `--accent` |
| `type.body` | `--size-body` · `.prose > p, ul, ol`, `.callout p`, `.author-card__bio` | 1.125rem (18px) | 1.7 (bio 1.6) | 0 | regular | `--ink-2` |
| `type.ui` | `--size-ui` · nav, buttons, byline name, footer links, input, `.link-arrow` | 0.9375rem (15px) | 1 / 1.5 | 0 | regular; strong on buttons and the current page | `--muted` / `--ink` |
| `type.data` | `--size-ui` · `table` | 0.9375rem (15px) + `tabular-nums` | 1.5 | 0 | regular | `--ink-2` |
| `type.label` | `--size-meta` · `.kicker`, `thead th`, `.toc__title`, `.share__label`, `.footer-col__title`, `.delta` | 0.875rem (14px), sentence case | 1.5 | 0 | strong | `--muted` (kicker `--accent-ink`) |
| `type.meta` | `--size-meta` · byline meta, captions, `.post-card__meta`, cite, author role, tags, footer base | 0.875rem (14px) | 1.4–1.5 | 0 | regular | `--muted` |
| `type.code` | `--size-meta` · `.code pre`, `.code__bar`; inline `0.875em` | 0.875rem (14px) | 1.6 | 0 | regular, mono | `--code-ink` |
| lettermarks (exempt) | `.avatar--sm` | 10px | 1 | +0.02em | strong | — recognised, not read |

Cover SVG labels are artwork (type law 1 exemption); `.cv-label--small` raised from 12 to 13 units so it clears 12px at full width.

**Weights** — `weight.regular` 400: all reading copy, meta, nav. `weight.strong` 600: title, headings, names, `<strong>`, buttons, labels, the current nav item. Only these two are requested from Google Fonts.

**Icons** — 20px glyphs at stroke 1.7–1.75 in 38px icon buttons (`type.ui` context) and beside the callout title.

## Colour

**Text** — measured with `scripts/contrast.mjs`, against `--bg` (`surface.page`) and the worst surface each tier lands on, `--surface-2`.

| Role | Name here | Light | Ratio on `--bg` · `--surface-2` | Dark | Ratio on `--bg` · `--surface-2` |
|---|---|---|---|---|---|
| `text.primary` | `--ink` | `#15171c` | 17.18 · 15.88 | `#eceef2` | 16.38 · 14.21 |
| `text.secondary` | `--ink-2` | `#3d424c` | 9.66 · 8.94 | `#c3c8d1` | 11.33 · 9.83 |
| `text.tertiary` | `--muted` | `#6a707b` | 4.77 · **4.41 ✗** | `#8d94a0` | 6.23 · 5.41 |
| `text.link` | `--accent-ink` | `#b8430a` | 5.23 · 4.84 | `#ff9a5c` | — · 8.40 on `--surface` |
| `text.inverse` | `--bg` on `--ink` | `#fbfaf7` | 17.18 | `#0e1015` | 16.38 |
| `text.on-accent` | `#fff` (inline) | `#ffffff` on `--accent` | **3.58 ✗** | `#ffffff` on `--accent` | **2.60 ✗** |

Footer (its own dark band in both themes): `--footer-ink` `#e9ebef` 15.33:1 on `--footer-bg`; `--footer-muted` `#9aa2ae` 7.10:1 (light) / 7.65:1 (dark).

**Surfaces**

| Role | Name here | Light | Dark |
|---|---|---|---|
| `surface.page` | `--bg` | `#fbfaf7` | `#0e1015` |
| `surface.raised` | `--surface` | `#ffffff` | `#161920` |
| `surface.subtle` · `surface.hover` | `--surface-2` (one token, two jobs) | `#f3f1ec` | `#1b1f27` |
| `surface.inverse` | `--footer-bg` | `#11151c` | `#090b0f` |
| ↳ code | `--code-bg` | `#0f1724` | `#0a0f18` |

**Lines and fills**

| Role | Name here | Light | Dark |
|---|---|---|---|
| `border.default` · `border.divider` | `--line` | `#e6e2da` | `#262b35` |
| `border.hover` | `--line-strong` | `#d6d1c6` | `#343a46` |
| `border.control` | none — the subscribe input uses `#2c323d` inline, 1.34:1 on its fill | | |
| `fill.strong` | `--ink` (primary button) | `#15171c` | `#eceef2` |
| `mark` | `--accent` (bullets, drop cap) | `#e8590c` | `#ff7a2f` |

**Signal**

| Role | Name here | Light | Dark |
|---|---|---|---|
| `focus` · `accent` | `--accent` | `#e8590c` — 3.43:1 on `--bg`, 3.17:1 on `--surface-2`, 3.24:1 on `--accent-soft` | `#ff7a2f` — 7.32:1 on `--bg` |
| `accent.hover` | `#ff7a2f` (inline, subscribe button) | | |
| ↳ accent tint | `--accent-soft`, `--accent-line` | `#fff1e8`, `#f8c9ab` | `#2a1a11`, `#5a2f17` |
| `status.success` | `--good`, `--good-soft` | `#137a4a` on `#e5f4ec` 4.73:1 | `#5fd39a` on `#12291f` 8.27:1 |

**Exceptions** — chromatic spend beyond the orange accent, none named yet: the green `--good` delta chips; three post-card art palettes typed inline (navy, peach, sage); the cover SVG's navy-and-orange palette; six syntax colours in `.tk-*`.

## Layout

| Role | Name here | Value |
|---|---|---|
| `measure.reading` | `--measure` | 680px |
| `measure.wide` | `--wide` | 1120px (cover, related) |
| `measure.frame` | `--page` | 1280px (header, article grid, footer) |
| ↳ head column | `.article-head` | 860px (inline) |
| `measure.rail` | `.toc` | max 240px (inline); share rail unsized |
| `gutter` | `--gutter` | `clamp(16px, 4vw, 40px)` |
| `space.heading-above` · `space.heading-below` | `.prose h2` | 2.4em · 0.7em (72px · 21px at 30px) |
| `space.section` | `.related` | 96px above, 72px inside |

**Radius ladder** — one token, the rest inline.

| Role | Name here | Value |
|---|---|---|
| `radius.pill` | inline | 999px (buttons, nav, tags, kicker, chips) |
| `radius.small` | inline | 6px (inline code, focus ring), 2px (bullets) |
| `radius.control` | inline | 8px (skip link) |
| `radius.card` | `--radius` | 14px (code, table, callout) |
| `radius.container` | inline | 18px (author card, post cards), 20px (cover) |

**z-index ladder**

| Role | Name here | Value |
|---|---|---|
| `z.nav` | `.site-header` | 50 |
| ↳ progress bar | `.progress` | 60 |
| `z.skip-link` | `.skip` | 100 |

**Breakpoints**

| Role | Name here | Value | What changes |
|---|---|---|---|
| `bp.rails` | inline | 1180px | Share and table-of-contents rails disappear |
| `bp.nav` | inline | 960px | Primary nav hides; related posts stack as rows; footer to 3 columns |
| `bp.phone` | inline | 640px | Head left-aligned, cover and code full-bleed, smaller body, footer to 2 columns |

## Surfaces

| Level | Surface | Edge | Shadow | Layer |
|---|---|---|---|---|
| `elevation.flat` | `--bg` | `--line` | none | — |
| `elevation.raised` | `--surface` | `--line` | `--shadow` | — (cover, code, table, author card, post-card hover) |
| `elevation.raised` (chrome) | `--bg` at 82% | `--line` bottom | none | 50 |

`material.translucent`: the sticky header, `color-mix(--bg 82%)` + `saturate(180%) blur(14px)`, with no `@supports` guard and no reduced-transparency branch.

## Motion

| Role | Name here | Value | Used for |
|---|---|---|---|
| `duration.state` | inline | 0.15s | nav, buttons, icon buttons, TOC, tags |
| `duration.popover` | inline | 0.2s | post-card lift, arrow nudge |
| `ease.standard` | inline | `ease` | everything |

**Named exemptions** — none recorded. Cover packets loop indefinitely (1.4s–3.6s SMIL); reading progress is scroll-driven. Reduced motion hides the packets and turns off smooth scroll.

## Decisions

- 2026-11-04 — Inter keeps the title and headings as well as interface text: it is the page's existing heading voice, and the reading face stays the serif. (User decision via recommendation; type dial "families" — editorial lists Inter only for interface text.)
- 2026-11-04 — Body stepped from 20px to 18px and the title from 60px to 40px (2.22 × body), to sit inside the editorial body range and ceiling. (Preset dial; user chose `editorial`.)
- 2026-11-04 — Mono is a system stack, not a JetBrains Mono download: one code block and a diagram's labels. (Type dial "families".)
- 2026-11-04 — Preset `editorial`, existing light/dark theming kept as it is (media query). (User decision.)

## Open issues

Type
- Inter and Source Serif 4 still load from Google Fonts with no metric-matched fallback (type law 12). Needs the font files self-hosted and their metrics measured; not possible in this pass without downloading them.
- Cover SVG labels are 13–18 units in a 1200-unit viewBox: at a 500px viewport they render ≈ 5–7px, below the 12px floor; the caption carries the meaning there (type law 1). Fixing it needs a narrow version of the diagram.

Colour
- `--muted` on `--surface-2` is 4.41:1 in light (table caption) (colour law 3).
- White on `--accent` (subscribe button, primary button hover) is 3.58:1 light, 2.60:1 dark (colour law 3).
- `.tk-c` code comments `#6b7b92` on `--code-bg` 4.17:1 light, 4.45:1 dark; placeholder `#6c7480` on `#171b23` 3.65:1 (colour law 3).
- 31 raw colours typed outside tokens (detector, colour law 1).
- `--surface-2` is both a region surface and the hover fill (colour law 1); `--accent` is accent, focus, bullets and drop cap.
- Green `--good` delta chips are a second hue in an editorial page, and unnamed chromatic spend in the post-card art (colour law 7).
- Subscribe input border 1.34:1 — `border.control` needs 3:1 (colour law 3).

Layout
- 13 boxes or chips on the article: kicker pill, cover frame, 3 bordered share buttons, code card, table card with a tinted caption strip, 5 delta chips, callout box, 5 tag pills, author card, a tinted related band with 3 cards. Four chip shapes (kicker tint, tag outline, delta tint, footer pill) (layout law 3, depth law 2).
- Radii: seven values on no ladder (2, 6, 8, 14, 18, 20, 999); post cards and author card at 18px beside 14px code and table (layout law 5).
- `.article-head` at 860px and the dek at 700px: neither the reading measure nor the frame (layout law 1).
- z-index values 50 / 60 / 100 undocumented (layout law 7).

Depth
- Five things carry `--shadow` on a flat editorial page — cover, code, table, author card, post-card hover (depth laws 1–2).
- Header translucency has no `@supports` guard and no `prefers-reduced-transparency` branch; `-webkit-backdrop-filter` hand-written (depth law 15).

Motion
- `ease` everywhere; no named curve or duration tokens (motion law 5).
- Cover packets loop forever; `editorial` has nothing looping (motion law 1, dials).
- `.post-card:hover` lifts 3px and adds a shadow; `.btn:active` nudges 1px (motion law 1).

Patterns
- Subscribe form has no visible label and no submit feedback (`onsubmit="return false"`) (patterns law 14).
- Share "Copy link" is an `<a href="#">` (patterns law 14).
