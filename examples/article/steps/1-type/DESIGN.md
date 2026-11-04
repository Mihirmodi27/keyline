# Design system

> Keyline reads this before touching UI, and writes back to it when a decision changes. Edit it by hand whenever you like — it is the source of truth for intent, the code is the source of truth for values. Set up 2026-11-04.

## Profile

| | |
|---|---|
| Product | Field Notes, the engineering blog of Halden (logistics). This page: one long-form article with its site chrome |
| Reader | Reading — a ~1,200-word technical essay, read top to bottom |
| Preset | `editorial` |
| Areas | None — one page |
| Stack | Static HTML + one stylesheet (`styles.css`), no framework, no JS |
| Tokens live in | `styles.css` `:root` (29 custom properties) |
| Themes | `light`, `dark` — `prefers-color-scheme` media query re-tints the same tokens; `color-scheme: light dark` declared. No toggle |
| Motion | CSS transitions only; one scroll-driven progress bar; SMIL `animateMotion` in the cover SVG |

Evidence for `editorial`: the page is one article — body copy set in a reading serif at a 680px measure with a table of contents rail; nothing on it is a tool or a pitch. The code currently *looks* more expressive than that (60px title, four weights, a second hue), which is listed below as open issues, not a reason to change the preset.

## Type

**Families** — one text family: Source Serif 4 (`--font-read`; `--font-ui` now points at it), Google Fonts, weights 400 and 600, `opsz` axis, `display=swap`. Ships tabular figures (probed in Chrome: `1111` and `0000` equal width with `tabular-nums`). `family.mono`: system stack (`--font-mono`: `ui-monospace, "SF Mono", Menlo, Consolas, monospace`) — one code block and a few inline spans don't earn a download. `font-synthesis: none`.

Ladder tokens (proposed, in `:root`): `--text-title` 1.625rem (26px), `--text-heading` 1.3125rem (21px), `--text-body` 1.125rem (18px), `--text-ui` 1rem (16px), `--text-meta` 0.875rem (14px); `--weight-regular` 400, `--weight-strong` 600. Five sizes above the floor; ceiling 26 ÷ 18 = 1.44. No responsive steps.

| Role | Name here | Size | Leading | Tracking | Weight | Tier |
|---|---|---|---|---|---|---|
| `type.title` | `.article-title` | `--text-title` 26px | 1.25 | −0.02em | 600 | `--ink` |
| `type.heading` | `.prose h2`, `.related__head h2` | `--text-heading` 21px | 1.3 | −0.015em | 600 | `--ink` |
| `type.subheading` | `.post-card h3`, `.author-card__name`, `.callout__title` | `--text-body` 18px | 1.4 | 0 | 600 | `--ink` — weight, tight leading |
| `type.lead` | `.prose .lead` | 18px | 1.85 | 0 | 400 | `--ink` — leading alone |
| `type.body` | `.prose` (container) | 18px | 1.7 | 0 | 400 | the baseline |
| `type.supporting` | `.article-dek` | 18px | 1.5 | 0 | 400 | `--ink-2` — tier, tighter leading |
| ↳ `pull-quote` (project role) | `.pullquote p` | 18px | 1.7 | 0 | 400, roman | `--ink` — a bar and an indent |
| `type.ui` | `.btn` (600), `.site-nav a`, `.toc a`, `.link-arrow`, `.author-card__links a`, `.footer-col a`, `.subscribe input` | `--text-ui` 16px | 1 single-line / 1.4 wrapping | 0 | 400; 600 on buttons and the current nav item | `--muted` / `--ink` |
| `type.data` | `table` | 16px, `tabular-nums`, units in row headers | 1.5 | 0 | 400 | `--ink-2` |
| `type.label` | `.kicker`, `.share__label`, `.toc__title`, `thead th`, `.author-card__eyebrow`, `.footer-col__title`, `.tags a`, `.code__lang`, `.delta`, `.pill` | `--text-meta` 14px, sentence case | 1.3 | 0 | 400 | `--muted` |
| `type.meta` | `.byline__meta`, `.post-card__meta`, `figcaption`, `caption`, `.author-card__role`, `.footer-brand p`, `.site-footer__base` | 14px, tabular in meta lines | 1.5 | 0 | 400 | `--muted` |
| `type.code` | `.code pre`, `.code__bar`; inline `code` 0.875em | 14px | 1.7 | 0 | 400 mono | `--code-ink` |
| ↳ lettermark (project role) | `.avatar--sm/md/lg` | 10 / 16 / 21px | — | +0.02em | 600 | recognised, not read |

**Weights** — 400 reads; 600 marks structure (title, headings, subheadings, `<strong>`) and state (current nav item, primary action labels, the byline name). **Icons** — 20px, stroke 1.75, beside 16–18px text.

## Colour

**Text** — checked against `--bg` unless noted.

| Role | Name here | Light | Ratio | Dark | Ratio |
|---|---|---|---|---|---|
| `text.primary` | `--ink` | `#15171c` | 17.18:1 | `#eceef2` | 16.38:1 |
| `text.secondary` | `--ink-2` | `#3d424c` | 9.66:1 | `#c3c8d1` | 11.33:1 |
| `text.tertiary` | `--muted` | `#6a707b` | 4.77:1 (4.41:1 on `--surface-2` ✗) | `#8d94a0` | 6.23:1 (5.41:1 on `--surface-2`) |
| `text.inverse` | `--bg` on `--ink` (`.btn--primary`, `.skip`) | `#fbfaf7` | 17.18:1 | `#0e1015` | 16.38:1 |
| `text.on-accent` | `#fff` (literal) | `#fff` on `#e8590c` | 3.58:1 ✗ | `#fff` on `#ff7a2f` | 2.60:1 ✗ |
| `text.link` | `--accent-ink` | `#b8430a` | 5.23:1 | `#ff9a5c` | 9.09:1 |
| ↳ footer primary | `--footer-ink` on `--footer-bg` | `#e9ebef` | 15.33:1 | same | 16.50:1 |
| ↳ footer tertiary | `--footer-muted` on `--footer-bg` | `#9aa2ae` | 7.10:1 | same | 7.65:1 |

**Surfaces**

| Role | Name here | Light | Dark |
|---|---|---|---|
| `surface.page` | `--bg` | `#fbfaf7` | `#0e1015` |
| `surface.raised` | `--surface` | `#ffffff` | `#161920` |
| `surface.subtle` | `--surface-2` | `#f3f1ec` | `#1b1f27` |
| `surface.hover` | `--surface-2` (shared with `surface.subtle`) | | |
| `surface.inverse` | `--footer-bg`, `--code-bg` | `#11151c`, `#0f1724` | `#090b0f`, `#0a0f18` |

**Lines and fills**

| Role | Name here | Light | Dark | Note |
|---|---|---|---|---|
| `border.default` · `border.divider` | `--line` | `#e6e2da` | `#262b35` | 1.24:1 on `--bg` |
| `border.hover` / `border.control` | `--line-strong` | `#d6d1c6` | `#343a46` | 1.46:1 on `--bg` — below 3:1 for a control edge |
| `fill.strong` | `--ink` (primary button) | | | |
| `mark` | `--accent` (list bullets, drop cap, code-file dot) | | | |

**Signal**

| Role | Name here | Light | Dark | Note |
|---|---|---|---|---|
| `focus` | `--accent` | `#e8590c` | `#ff7a2f` | 3.17:1 worst (on `--surface-2`), 7.32:1 dark |
| `accent` · `accent.hover` | `--accent`, `--accent-ink`, `--accent-soft`, `--accent-line` | `#e8590c` … | `#ff7a2f` … | spent on: focus, progress bar, kicker, drop cap, bullets, pull-quote rule, callout, tag hover, TOC hover, card meta, button hover, links |
| `status.success` | `--good`, `--good-soft` | `#137a4a` on `#e5f4ec` 4.73:1 | `#5fd39a` on `#12291f` 8.27:1 | used only for the table's `.delta` chips |

**Exceptions** — the cover illustration and the three `.post-card__art` panels are artwork with their own palette (navy, peach, sage) in literals. They are figures, not interface.

## Layout

| Role | Name here | Value |
|---|---|---|
| `measure.reading` | `--measure` | 680px |
| `measure.wide` | `--wide` | 1120px (cover, related) |
| `measure.frame` | `--page` | 1280px (header, article grid, footer) |
| `measure.rail` | `.toc` max-width | 240px; share rail is content-sized |
| `gutter` | `--gutter` | clamp(16px, 4vw, 40px) |
| `space.heading-above` · `space.heading-below` | `.prose h2` margin | 2.4em / 0.7em (72px / 21px) |
| `space.section` | `.related` margin/padding | 96px / 72px |

**Radii** — `--radius` 14px (code, table, callout), 18px (author card, post cards), 20px (cover), 999px (buttons, nav, chips, inputs), 8px (skip link), 6px (inline code, focus ring), 2px (bullet). No nesting rule applied.

**Z-index** — `.site-header` 50, `.progress` 60, `.skip` 100. Literals, no ladder.

**Breakpoints** — 1180px (rails drop), 960px (nav hides, related goes single-column), 640px (phone type and padding).

## Surfaces

| Level | Surface | Edge | Shadow | Layer |
|---|---|---|---|---|
| `elevation.flat` | `--bg` | `--line` | — | — |
| `elevation.raised` | `--surface` | `--line` | `--shadow` | — |
| ↳ sticky header (chrome) | `color-mix(--bg 82%)` + `blur(14px) saturate(180%)` | `--line` bottom | — | 50 |

`--shadow` is applied to the cover, code block, table, author card and hovered post cards — five things, none of which floats. `material.translucent`: the header only, with no `@supports` guard and no reduced-transparency branch.

## Motion

| Role | Name here | Value | Used for |
|---|---|---|---|
| `duration.state` | literal | 0.15s | button, nav, TOC, tag hovers |
| `duration.popover`? | literal | 0.2s | post-card lift, arrow nudge |
| `ease.standard` | `ease` (keyword) | — | everything |

Reduced motion: hides the cover's packets and turns off smooth scrolling. The reading-progress bar and card lift are untouched. The cover packets loop forever.

## Patterns

**Nouns** — post (cards, "All posts"), article (skip link). **Actions** — Subscribe (header link, footer form). The footer form has a visually-hidden label and a placeholder; it does nothing on submit.

## Decisions

- 2026-11-04 — One text family (Source Serif 4) for reading and UI; Inter and JetBrains Mono dropped. The editorial dial is one family plus a system mono, and the UI/reading split is carried by size, leading and tier. (Polish, type pass; on the user's standing instruction to take Keyline's recommendations.)
- 2026-11-04 — The drop cap is gone: at 4.1em (74px) it outranked the title (type law 3). (Polish, type pass.)

- 2026-11-04 — Theming stays as it is: light and dark through `prefers-color-scheme`, no toggle. (User decision.)
- 2026-11-04 — Preset `editorial`. (User decision.)

## Open issues

Type
- Fonts load from Google Fonts with no metric-matched fallback (type law 12). Self-hosting needs the font files in the repo; a fallback needs their metrics. Not done in this pass.

Colour
- `--muted` is 4.41:1 on `--surface-2` (table caption, light) — fails 4.5:1.
- `text.on-accent`: `#fff` on `--accent` is 3.58:1 light, 2.60:1 dark (`.btn--primary:hover`, `.subscribe .btn`) — fails.
- Footer input placeholder `#6c7480` on `#171b23`: 3.65:1 — fails if it carries meaning (it shows the expected format).
- Accent spent on 12+ jobs (kicker, drop cap, bullets, rules, card meta, links, hovers…); `editorial` spends it on focus.
- A second hue: `--good` green on the five `.delta` chips — success colour where improvement is already the column's whole point.
- 31 raw colour literals outside tokens in interface CSS (detector, color law 1), e.g. `#fff`, `#ff9a5c`, `#ff7a2f`, `rgba(255,255,255,.06)`, avatar gradient.
- `--line-strong` 1.46:1 and the footer input border `#2c323d` 1.42:1 — control edges below 3:1.

Layout / boxes
- Boxes on the article: cover (shadowed), code, table (shadowed), callout (tinted), author card (shadowed, holds 6 objects: avatar, eyebrow, name, role, bio, links), 3 post cards on a tinted band, plus 4 chip shapes (kicker, tags, delta, careers pill). The author card is the one holding more than one object.
- Radii 14/18/20px chosen per component; no ladder.
- Article head is centred at 860px while the body is left-aligned at 680px — two measures.
- Z-index literals (50/60/100), no ladder.

Depth
- `--shadow` on five non-floating objects (cover, code, table, author card, post-card hover).
- Header blur has no `@supports` guard and no `prefers-reduced-transparency` branch (detector, depth law 15).

Motion
- Durations typed inline (0.15s, 0.2s) with the `ease` keyword; no tokens.
- Cover packets loop indefinitely; post cards lift on hover; reduced motion leaves the progress bar and lift running.

Patterns
- Footer form has a placeholder for an example address and no visible label; submit does nothing.
- "Keep reading" heading plus "All posts →"; share icons with no visible label beyond an uppercase "Share".
