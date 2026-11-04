# Design system

> Keyline reads this before touching UI, and writes back to it when a decision changes. Edit it by hand whenever you like — it is the source of truth for intent, the code is the source of truth for values. Set up 2026-11-04.

## Profile

| | |
|---|---|
| Product | Field Notes, the engineering blog of Halden (logistics): one long-form article page with site chrome, related posts and a subscribe footer |
| Reader | Reading — engineers reading a ~1,200-word technical essay end to end |
| Preset | `editorial` |
| Areas | none |
| Stack | Static HTML + one hand-written stylesheet (`styles.css`); no framework, no build |
| Tokens live in | `styles.css` `:root` (custom properties) |
| Themes | `light`, `dark` — `@media (prefers-color-scheme: dark)` re-declares `:root`; `<meta name="color-scheme" content="light dark">`; no toggle |
| Motion | CSS transitions, one scroll-driven animation (`.progress`), SMIL `animateMotion` in the cover SVG |

Evidence for the preset: the page is one article; running text is set in a serif reading face (`--font-read`, Source Serif 4) at a 680px measure (`--measure`) with a table of contents and share rail beside it — the reader is reading. User confirmed `editorial`.

## Type

**Families** — `family.text` (reading — title, headings, body, dek, quote, notes, bio, card titles): `--font-read` Source Serif 4 (Google Fonts, opsz axis, true italic; 400, 600, 400 italic requested). `family.ui` (navigation, buttons, byline, labels, table, forms, footer): `--font-ui` Inter (Google Fonts; 400, 600 requested). `family.mono`: `--font-mono`, a system stack (`ui-monospace, "SF Mono", Menlo, Consolas`) — one code block and two inline spans don't earn a download.

All sizes are `rem` tokens in `styles.css` `:root` (`--text-*`, proposed 2026-11-04 in the project's `--name` style).

| Role | Name here | Size | Leading | Tracking | Weight | Tier |
|---|---|---|---|---|---|---|
| `type.title` | `--text-title` (`.article-title`) | 2.5rem (40px); 2rem (32px) under 640px | 1.2 | −0.02em | 600 serif | `--ink` |
| `type.heading` | `--text-heading` (`.prose > h2`, `.related__head h2`) | 1.5rem (24px) | 1.3 | −0.015em | 600 serif | `--ink` |
| ↳ pull quote (project role) | `.pullquote p` | 1.5rem (24px) | 1.35 | 0 | 400 italic serif | `--ink` — separated from the heading by regular weight, italic voice and the bar |
| `type.lead` | `--text-lead` (`.prose .lead`) | 1.25rem (20px) | 1.75 | 0 | 400 serif | `--ink` |
| ↳ drop cap (project role, ornament) | `.lead::first-letter` | 4.1em | 0.82 | 0 | 600 serif | spans three lines of the lead |
| `type.supporting` | `.article-dek` | 1.25rem (20px) | 1.5 | 0 | 400 serif | `--ink-2` — separated from the lead by tier and tighter leading |
| ↳ card and author titles (project role under `type.subheading`) | `.post-card h3`, `.author-card__name` | 1.25rem (20px) | 1.3 | 0 | 600 serif | `--ink` |
| `type.body` | `--text-body` (`.prose > p`, lists) | 1.125rem (18px) | 1.7 | 0 | 400 serif | `--ink-2` |
| `type.ui` | `--text-ui` (nav, `.btn`, byline name, footer links, `.link-arrow`) | 1rem (16px) | 1 single line / 1.5 | 0 | 400; 600 for buttons, names and the current nav item | `--muted` / `--ink` |
| ↳ note (project role) | `.callout p`, `.author-card__bio` | 1rem (16px) | 1.6 | 0 | 400 serif | `--ink-2` |
| `type.meta` | `--text-meta` (byline meta, captions, figcaptions, card meta, TOC rows, footer base) | 0.875rem (14px) | 1.4–1.5 | 0 | 400 | `--muted` |
| `type.data` | `table` | 0.875rem (14px), tabular | 1.5 | 0 | 400 | `--ink` / `--ink-2` |
| `type.label` | `--text-label` (TOC title, share label, table head, tags, kicker, eyebrow, footer column titles, code bar) | 0.8125rem (13px), sentence case | 1.3 | 0 | 400; 600 for group titles | `--muted` |
| `type.code` | `--text-code` (`.code pre`; inline `0.875em`) | 0.9375rem (15px) | 1.6 | 0 | 400 mono | `--code-ink` |
| ↳ lettermark (project role) | `.avatar--sm` | 0.625rem (10px) | — | +0.02em | 600 | decorative initials, `aria-hidden`, below the floor on purpose |

Seven sizes above the 12px floor (40, 24, 20, 18, 16, 14, 13) plus code; ceiling 40 ÷ 18 = 2.22.

**Weights** — `weight.regular` 400 (`--weight-regular`): all running text, labels, data. `weight.strong` 600 (`--weight-strong`): title and headings, `<strong>`, names and buttons, the current nav item, group titles. `font-synthesis: none` on `html`.

**Icons** — 20px box (≈ 16.7px drawn on the 24 grid), stroke 1.75, beside `type.ui`.

**Numerals** — tabular in the table and the byline meta; proportional (the serif's oldstyle) in prose.

## Colour

**Text** — checked against the worst surface each tier lands on.

| Role | Name here | Light | Ratio (worst surface) | Dark | Ratio (worst surface) |
|---|---|---|---|---|---|
| `text.primary` | `--ink` | `#15171c` | 15.88:1 on `--surface-2` | `#eceef2` | 14.21:1 on `--surface-2` |
| `text.secondary` | `--ink-2` | `#3d424c` | 8.94:1 on `--surface-2` | `#c3c8d1` | 9.83:1 on `--surface-2` |
| `text.tertiary` | `--muted` | `#6a707b` | **4.41:1** on `--surface-2` (4.77:1 on `--bg`) | `#8d94a0` | 5.41:1 on `--surface-2` |
| `text.link` | `--accent-ink` | `#b8430a` | 4.84:1 on `--surface-2` | `#ff9a5c` | 7.88:1 on `--surface-2` |
| `text.inverse` | `--bg` on `--ink` | `#fbfaf7` | 17.18:1 | `#0e1015` | 16.38:1 |
| ↳ footer text (project roles, a dark band in both themes) | `--footer-ink` · `--footer-muted` | `#e9ebef` · `#9aa2ae` | 15.33 · 7.10:1 on `--footer-bg` | same | 16.50 · 7.65:1 |

**Surfaces**

| Role | Name here | Light | Dark |
|---|---|---|---|
| `surface.page` | `--bg` | `#fbfaf7` | `#0e1015` (OKLCH L 0.173) |
| `surface.raised` | `--surface` | `#ffffff` | `#161920` |
| `surface.subtle` · `surface.hover` | `--surface-2` | `#f3f1ec` | `#1b1f27` |
| `surface.inverse` | `--ink` (skip link, primary button) | `#15171c` | `#eceef2` |
| ↳ code surface (project role) | `--code-bg` | `#0f1724` | `#0a0f18` |
| ↳ footer band (project role) | `--footer-bg` | `#11151c` | `#090b0f` |

**Lines and fills**

| Role | Name here | Light | Dark |
|---|---|---|---|
| `border.default` · `border.divider` | `--line` | `#e6e2da` (1.24:1 on `--bg`) | `#262b35` |
| `border.hover` | `--line-strong` | `#d6d1c6` | `#343a46` |
| `fill.strong` | `--ink` (`.btn--primary`) | `#15171c` | `#eceef2` |

**Signal**

| Role | Name here | Light | Dark |
|---|---|---|---|
| `focus` · `accent` | `--accent` | `#e8590c` — 3.17:1 on `--surface-2` (worst), 3.43:1 on `--bg` | `#ff7a2f` — 7.32:1 on `--bg` |
| `accent.hover` | `--accent-ink` | `#b8430a` | `#ff9a5c` |
| ↳ accent tint (project role) | `--accent-soft` · `--accent-line` | `#fff1e8` · `#f8c9ab` | `#2a1a11` · `#5a2f17` |
| `status.success` | `--good` · `--good-soft` | `#137a4a` 4.73:1 on its tint | `#5fd39a` 8.27:1 on its tint |

**Exceptions** — none recorded. The orange accent is currently spent on ~14 jobs (see Open issues).

## Layout

| Role | Name here | Value |
|---|---|---|
| `measure.reading` | `--measure` | 680px |
| `measure.wide` | `--wide` | 1120px (cover, related grid) |
| `measure.frame` | `--page` | 1280px (header, article grid, footer) |
| `measure.rail` | `.toc` max-width | 240px |
| `gutter` | `--gutter` | `clamp(16px, 4vw, 40px)` |
| `space.heading-above` · `space.heading-below` | `.prose h2` margin | 2.4em · 0.7em (72px · 21px at 30px) |

**Radius ladder**

| Role | Name here | Value |
|---|---|---|
| `radius.pill` | literal | 999px (buttons, nav, tags, kicker, icon buttons) |
| `radius.small` | literal | 6px (inline code, focus ring) |
| `radius.card` | `--radius` | 14px (code, table, callout) |
| `radius.container` | literal | 18px (author card, post cards), 20px (cover) |

**z-index ladder**

| Role | Name here | Value |
|---|---|---|
| `z.nav` | `.site-header` | 50 |
| ↳ reading progress (project role) | `.progress` | 60 |
| `z.skip-link` | `.skip` | 100 |

**Breakpoints**

| Role | Name here | Value | What changes |
|---|---|---|---|
| `bp.rails` | `max-width: 1180px` | 1180px | Share rail and table of contents are hidden (not moved) |
| `bp.nav` | `max-width: 960px` | 960px | Site nav hidden; related cards stack; footer to three columns |
| `bp.phone` | `max-width: 640px` | 640px | Article head left-aligned; cover and code go full-bleed; smaller prose |

## Surfaces

| Level | Surface | Edge | Shadow | Layer |
|---|---|---|---|---|
| `elevation.flat` | `--surface-2` / `--accent-soft` | `--line` / `--accent-line` | none | — |
| `elevation.raised` | `--surface` | `--line` | `--shadow` | — (cover, code, table, author card, post-card hover) |
| sticky header | `color-mix(--bg 82%)` + `blur(14px) saturate(180%)` | `--line` | none | 50 |

`material.translucent`: the sticky header only; no `@supports` guard, no `prefers-reduced-transparency` branch.

## Motion

| Role | Name here | Value | Used for |
|---|---|---|---|
| `duration.state` | literal | 150ms (`0.15s`) | button, nav, icon-button, toc, tag colour |
| `duration.popover` | literal | 200ms (`0.2s`) | post-card lift, link arrow nudge |
| `ease.standard` | `ease` | `ease` | everything |

**Named exemptions**

| Exemption | Values | Why |
|---|---|---|
| Cover packets | 1.4s–3.6s, infinite | SMIL `animateMotion` loops in the cover diagram; hidden under reduced motion |
| Reading progress | scroll-linked | `animation-timeline: scroll(root)`, not time-based |

Reduced motion: hides the cover packets and turns off smooth scroll; transitions are not branched.

## Patterns

**Nouns** — post (cards, "All posts"), article, tags, topics. **Primary action** — Subscribe (header button scrolls to the footer form; form button submits).

## Decisions

- 2026-11-04 — Light and dark both follow the device through `prefers-color-scheme`; no toggle. (User decision: keep the page's existing theming.)
- 2026-11-04 — Preset `editorial`. (User decision.)

## Open issues

- `type.body` is set in `--ink-2` (`text.secondary`) rather than `text.primary` — colour pass.
- Type law 12: fonts still come from `fonts.googleapis.com` with no metric-matched fallback. Self-hosting needs the font files added to the project, and the fallback's `size-adjust`/`ascent-override` must be computed from their metrics (`fontaine`/Capsize), not guessed. Left open.
- Colour law 7: the orange accent does ~14 jobs — kicker pill, drop cap, bullets, pull-quote bar, progress bar, avatars, card meta, byline hover, button hover, tag hover, callout, code-file dot, footer pill, links; editorial spends the accent on focus only, ≤ 1 exception.
- Colour law 3: `--muted` is 4.41:1 on `--surface-2` in light (table caption, related band) — fails 4.5:1, and is below the editorial 4.6:1 tertiary target on `--bg` too (4.77 passes).
- Colour law 3: white text on `--accent` (button hover, footer Subscribe) is 3.58:1 light / 2.60:1 dark — fails 4.5:1.
- Colour law 3: the code comment colour `#6b7b92` is 4.17:1 on `--code-bg`.
- Colour law 1: 31 inline colour literals in `styles.css` outside artwork (code tokens, footer input, post-card art, pill, avatar gradient).
- Colour dial (neutral chroma): text greys run at OKLCH C 0.018–0.019 (cool, H≈263) while lines and surfaces are warm (H≈86) — two neutral hues, over the 0.01 dial.
- Colour law 6 / dial: table deltas carry "better" in green pills (`--good`) — success colour on a figure where completion isn't the news.
- Colour law 2 / border.control: the footer email input edge `#2c323d` is 1.34:1 on its fill — under 3:1; bordered share buttons 1.24:1.
- Depth law 2 / layout law 3: boxes on the article screen — cover (shadow), code block (shadow), table (frame + shadow), callout (tinted box), author card (shadow, holds avatar + name + role + bio + three links), kicker pill, five tag chips, bordered share buttons, related band holding three cards. The author card holds more than one object.
- Depth law 15: the sticky header's `backdrop-filter` has no `@supports` guard and no reduced-transparency branch; the `-webkit-` line is hand-written.
- Layout law 7: z-index values 50/60/100 typed inline, no ladder.
- Motion law 1 / editorial dial: the cover's packet animation loops indefinitely ("nothing loops").
- Motion law 5: `ease` everywhere; no named curve; durations 150/200ms inline.
- Motion law 10: reduced motion hides packets but leaves transitions, the card lift and the arrow nudge untouched.
- Patterns: "Data" is marked current in the nav by colour alone (`--ink` vs `--muted`) — colour law 6.
