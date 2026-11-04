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

Neutrals re-tinted to one warm hue (OKLCH h 85, chroma ≤ 0.008), keeping each token's lightness; dark `--bg` at L 0.173. `color-scheme: light dark` on `:root`. The accent is spent on focus (and the logo's dot, which is artwork); nothing else on the page is orange except the artwork.

**Text** — measured with `scripts/contrast.mjs` on `--bg` and on the worst surface, `--surface-2`.

| Role | Name here | Light | on `--bg` / `--surface-2` | Dark | on `--bg` / `--surface-2` |
|---|---|---|---|---|---|
| `text.primary` | `--ink` | `#191713` | 17.15 / 15.87:1 | `#efeeeb` | 16.40 / 14.20:1 |
| `text.secondary` | `--ink-2` | `#44423d` | 9.62 / 8.90:1 | `#cac8c4` | 11.39 / 9.87:1 |
| `text.tertiary` | `--muted` | `#6b6964` | 5.25 / 4.86:1 | `#96938e` | 6.22 / 5.38:1 |
| `text.inverse` | `--bg` on `--ink` | | 17.15:1 (12.99:1 on hover) | | 16.40:1 (13.24:1 on hover) |
| `text.link` | — | links are `--ink`, underlined | | | |
| ↳ footer primary | `--footer-ink` on `--footer-bg` | `#e9e8e5` on `#171613` | 14.77:1 | on `#0c0b08` | 16.06:1 |
| ↳ footer tertiary | `--footer-muted` | `#a09e9a` | 6.77:1 (6.15:1 on `--footer-field`) | | 7.36:1 |

Steps between tiers (worst surface, light): 1.78×, 1.83× — dial 1.15×.

**Surfaces** — `surface.page` `--bg` `#fbfaf7` / `#11100d`; `surface.raised` `--surface` `#ffffff` / `#1a1916`; `surface.subtle` · `surface.hover` `--surface-2` `#f3f1ed` / `#201f1c`; `surface.inverse` `--footer-bg`, `--code-bg` `#171613` / `#0c0b08`; footer field `--footer-field` `#211f1c` (proposed).

**Lines and fills**

| Role | Name here | Light | Dark | Note |
|---|---|---|---|---|
| `border.default` · `border.divider` | `--line` | `#e5e2dd` | `#2c2b27` | decorative edges |
| `border.hover` | `--line-strong` | `#d4d1cc` | `#3c3a36` | |
| `border.control` (footer) | `--footer-control` (proposed) | `#73716e` | same | 3.38:1 on `--footer-field`, 3.72:1 on `--footer-bg` |
| `border.layered` (code, footer) | `--code-line`, `--footer-line` (proposed) | `rgba(255,255,255,.08)`, `#282623` | | |
| `fill.strong` · `fill.strong-hover` | `--ink`, `--ink-hover` (proposed) | `#191713`, `#302e29` | `#efeeeb`, `#d9d7d3` | footer: `--footer-ink`, `--footer-ink-hover` |
| `mark` | `--mark` (proposed) | `#a19e99` | `#575552` | bullets, pull-quote bar; 2.56:1, not held to text contrast |

**Signal** — `focus` = `--accent` `#e8590c` / `#ff7a2f`: worst 3.17:1 (light, `--surface-2`), 6.34:1 (dark, `--surface-2`), 5.05:1 / 7.57:1 on the footer. No status palette: nothing on the page reports state.

**Exceptions**
- `exception.syntax` — `--syntax-keyword`, `-function`, `-string`, `-number`, `-operator` (proposed), only inside `.code pre`: the reader parses token kinds in literal code; the reason can't spread because nothing else on the page is code. All ≥ 8.9:1 on `--code-bg`; comments use `--code-muted` (6.77:1).
- Artwork, not interface: the cover SVG and the three `.post-card__art` panels (`--art-*`, proposed). The two light panels are re-picked for dark.

## Layout

One column: the head, body, captions, contents disclosure and related list all sit at `--measure`. The cover diagram and the related row sit at `--wide`; header, footer and the rails' grid at `--page`.

| Role | Name here | Value |
|---|---|---|
| `measure.reading` | `--measure` | 588px — 70 characters of Source Serif 4 at 18px (8.38px average, measured in Chrome) |
| `measure.wide` | `--wide` | 880px (1.5 × measure) — cover, related |
| `measure.frame` | `--page` | 1280px |
| `measure.rail` | `--rail` (proposed) | 200px, gap `--rail-gap` 48px |
| `gutter` | `--gutter` | clamp(24px, 4vw, 40px) |
| `space.tight` / `space.group` / `space.section` | `--space-tight` / `--space-group` / `--space-section` (proposed) | 8 / 24 / 64px |
| `space.heading-above` · `space.heading-below` | `--space-heading-above` · `--space-heading-below` (proposed) | 48px · 12px — 4:1 |
| page top | `--page-top` (proposed) | 96px; 56px below `bp.column` |

**Radii** — `--radius-small` 4px (inline code), `--radius-control` 8px (skip link), `--radius` 12px (`radius.card`: code, callout, author card, post cards), `--radius-container` 16px (cover), 999px pills on buttons, nav, inputs and chips (single-line only). Nesting: post-card art and code bar are flush (gap 0, clipped by the parent).

**Lines** — `--hairline-chrome` 0.5px (table rows, contents rail, code bar divider), `--hairline-object` 1px (edges, table head, tags rule), `--rule-emphasis` 2px (pull-quote bar, contents hover marker).

**Z-index** — `--z-nav` 50 (sticky header), `--z-progress` 60 (reading bar above the header), `--z-skip-link` 100.

**Breakpoints** — `bp.rail` 1200px: rails no longer fit beside the measure; share rail moves in-flow below the article, contents become a `<details>` above the lead, related turns to one column. `bp.column` 700px: padding-limited; header splits into two rows with the nav scrolling sideways, cover and code go full-bleed.

**Hover** — every `:hover` rule sits in one `@media (hover: hover) and (pointer: fine)` block; each is decoration on a link or button that works by tap.

**Forks** — contents: a sticky rail (`nav.toc`) at ≥ 1200px, an in-flow `<details class="toc-inline">` below; same six links. **Tables** — one style, unframed: 1px head rule, 0.5px row dividers, first column flush with the text. **Chips** — one shape (`.tags a`, `.pill`): 4px 10px, pill radius, 14px label; fill varies. The kicker is a text label, not a chip.

## Surfaces

Two levels in use; the page has nothing that floats or blocks.

| Level | Surface | Edge | Shadow | Layer |
|---|---|---|---|---|
| `elevation.flat` | `--bg`; post cards `--surface`; code `--code-bg` | `--line` 1px (cards), `--code-line` (code) — or none: sections, the table, the author block and the cover sit unboxed | none | — |
| `elevation.raised` (sticky chrome only) | `.site-header`: `--bg` opaque baseline, `--chrome-tint` in `@supports` | `--line` 1px bottom | none | `--z-nav` |

**Cards** — only the three related posts (one object each, the reader acts on it). The author block, the table and the callout are unboxed; the callout is a note with a 1px `--line-strong` rule on its leading edge.

**Material** — `material.translucent.defensive`, header only: `blur(24px) saturate(1.7)`, tint 95% (`--chrome-tint` `rgba(251,250,247,.95)` / `rgba(26,25,22,.95)`, the dark one at `--surface` for the lift). At 95% the worst backdrop (the navy cover in light, `--ink` text in dark) leaves `--muted` at 4.76:1 / 5.63:1; at the old 82% it fell to 3.44:1 / 3.60:1. Fallbacks in order after every theme block: opaque `--bg` baseline, `@supports`, `prefers-reduced-transparency` (tint → `--bg`, filter none), `prefers-contrast: more` (edge → `--ink`), `forced-colors` (edge → `CanvasText`). Both `backdrop-filter` spellings hand-written (no build step).

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

- 2026-11-04 — `--shadow` removed: nothing on an editorial article floats, and the five uses (cover, code, table, author card, card hover) made flat things look liftable. (Polish, depth pass.)

- 2026-11-04 — Removed `--accent-ink`, `--accent-soft`, `--accent-line`, `--good`, `--good-soft`: the accent now does focus only, and the table's green deltas reported no state. (Polish, colour pass.)

- 2026-11-04 — One text family (Source Serif 4) for reading and UI; Inter and JetBrains Mono dropped. The editorial dial is one family plus a system mono, and the UI/reading split is carried by size, leading and tier. (Polish, type pass; on the user's standing instruction to take Keyline's recommendations.)
- 2026-11-04 — The drop cap is gone: at 4.1em (74px) it outranked the title (type law 3). (Polish, type pass.)

- 2026-11-04 — Theming stays as it is: light and dark through `prefers-color-scheme`, no toggle. (User decision.)
- 2026-11-04 — Preset `editorial`. (User decision.)

## Open issues

Type
- Fonts load from Google Fonts with no metric-matched fallback (type law 12). Self-hosting needs the font files in the repo; a fallback needs their metrics. Not done in this pass.

Colour
- Theme control is the media query only, no toggle (the editorial dial wants a two-state control) — kept by decision.



Motion
- Durations typed inline (0.15s, 0.2s) with the `ease` keyword; no tokens.
- Cover packets loop indefinitely; post cards lift on hover; reduced motion leaves the progress bar and lift running.

Patterns
- Footer form has a placeholder for an example address and no visible label; submit does nothing.
- "Keep reading" heading plus "All posts →"; share icons with no visible label beyond an uppercase "Share".
