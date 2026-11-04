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

Neutrals share one warm hue (OKLCH h 85) at chroma ≤ 0.01, written as `oklch()` in `styles.css`. `color-scheme` is declared in both theme blocks, and `dark` on the footer and code islands.

**Text** — checked against the worst surface each tier lands on (`--surface-2`: the related band, table caption, callout).

| Role | Name here | Light | Ratio | Dark | Ratio |
|---|---|---|---|---|---|
| `text.primary` | `--ink` | `oklch(0.21 0.006 85)` | 15.68:1 | `oklch(0.94 0.004 85)` | 13.80:1 |
| `text.secondary` | `--ink-2` | `oklch(0.4 0.008 85)` | 8.15:1 | `oklch(0.82 0.006 85)` | 9.42:1 |
| `text.tertiary` | `--muted` | `oklch(0.52 0.008 85)` | 4.88:1 | `oklch(0.66 0.008 85)` | 5.29:1 |
| `text.inverse` | `--bg` on `--ink` | | 16.97:1 | | 16.04:1 |
| `text.link` | — | links are `--ink`, underlined | | | |
| ↳ footer text (dark island in both themes) | `--footer-ink` · `--footer-muted` | `oklch(0.94 0.004 85)` · `oklch(0.74 0.008 85)` on `--footer-bg` `oklch(0.2 0.005 85)` | 15.18 · 7.85:1 | same on `oklch(0.13 0.004 85)` | 16.87 · 8.72:1 |
| ↳ code text (dark island in both themes) | `--code-ink` · `--code-string` · `--code-muted` | on `--code-bg` `oklch(0.22 0.005 85)` | 14.09 · 9.27 · 6.48:1 | on `oklch(0.21 0.005 85)` | 14.42 · 9.48 · 6.63:1 |

Steps between adjacent tiers: light 1.92× and 1.67×, dark 1.47× and 1.78× — all above the editorial 1.15× minimum.

**Surfaces**

| Role | Name here | Light | Dark |
|---|---|---|---|
| `surface.page` | `--bg` | `oklch(0.985 0.004 85)` | `oklch(0.17 0.005 85)` |
| `surface.raised` | `--surface` | `oklch(1 0 0)` | `oklch(0.21 0.006 85)` |
| `surface.subtle` · `surface.hover` | `--surface-2` | `oklch(0.958 0.007 85)` | `oklch(0.24 0.006 85)` |
| `surface.inverse` · `fill.strong` | `--ink` (skip link, avatars) | | |
| ↳ code surface | `--code-bg` | `oklch(0.22 0.005 85)` | `oklch(0.21 0.005 85)` |
| ↳ footer band | `--footer-bg` · `--footer-field` | `oklch(0.2 0.005 85)` · `oklch(0.25 0.005 85)` | `oklch(0.13 0.004 85)` · same field |

**Lines and fills**

| Role | Name here | Light | Dark |
|---|---|---|---|
| `border.default` · `border.divider` | `--line` | `oklch(0.9 0.008 85)` | `oklch(0.3 0.006 85)` |
| `border.hover` · `mark` | `--line-strong` | `oklch(0.82 0.01 85)` | `oklch(0.4 0.008 85)` |
| `border.control` (footer email field) | `--footer-field-line` | `oklch(0.56 0.008 85)` — 3.44:1 on the field, 3.89:1 on the band | same |
| `border.layered` (islands) | `--code-line` · `--footer-line` | `oklch(1 0 0 / 0.08)` · `/ 0.1` | same |
| `fill.strong-hover` | `--ink-hover` (proposed) | `oklch(0.32 0.006 85)` | `oklch(0.86 0.004 85)` |
| ↳ list bullets (`mark`) | `--muted` | | |

**Signal**

| Role | Name here | Light | Dark |
|---|---|---|---|
| `focus` · `accent` | `--accent` | `#e8590c` — 3.17:1 on `--surface-2` (worst), 5.06:1 on the footer band | `#ff7a2f` — 6.33:1 on `--surface-2`, 7.74:1 on the footer band |

No status palette: nothing on the page reports state. Table deltas are figures in ink.

**Exceptions**

- `exception.subscribe` — `--offer` `#b8430a`, `--offer-hover`, `--on-offer` white (5.46:1). The Subscribe button, in the header and the footer form: the only offer on the page, the interface speaking about the content rather than content. It cannot spread — there is no second offer — and nothing else takes it. Same value in both themes, measured in both.

**Allowed literals** — the cover SVG (`role="img"`), the post-card illustrations (`--art-*`, re-picked for dark), and the logo's dot (`--brand-mark`).

## Layout

| Role | Name here | Value |
|---|---|---|
| `measure.reading` | `--measure` | 36rem (576px) ≈ 70 characters of 18px Source Serif 4 (measured: 680px held 83) |
| `measure.wide` | `--wide` | 54rem (864px), 1.5 × the measure — article head, cover, related grid |
| `measure.rail` | `--rail` (proposed) | 240px — share and contents rails |
| `measure.frame` | `--page` | 78rem (1248px) = 576 + 2 × (240 + 56) + 2 × 40 — header, article grid, footer |
| `gutter` | `--gutter` | `clamp(24px, 4vw, 40px)` |
| `space.tight` | `--space-tight` (proposed) | 8px — list items, kicker → title, chips |
| `space.group` | `--space-group` (proposed) | 24px — paragraphs, dek → byline, card padding, grid gaps |
| ↳ figure space (project role) | `--space-block` (proposed) | 40px — around code, table, callout, pull quote, author card; head → cover |
| `space.section` | `--space-section` (proposed) | 64px — head → body, before the tags rule, related band padding |
| `space.heading-above` · `space.heading-below` | `--space-heading-above` · `--space-heading-below` (proposed) | 48px · 14px — 3.4 : 1 |
| Page top | `.article-head` | 80px; 48px under 640px |

**Radius ladder**

| Role | Name here | Value |
|---|---|---|
| `radius.small` | `--radius-small` (proposed) | 4px — inline code |
| `radius.control` | `--radius-control` (proposed) | 8px — skip link |
| `radius.card` | `--radius` | 12px — code block, callout, author card, post cards (art flush, clipped) |
| `radius.container` | `--radius-container` (proposed) | 16px — the cover |
| `radius.pill` | `--radius-pill` (proposed) | 999px — buttons, icon buttons, nav items, chips, the email field |

**Lines**

| Role | Name here | Value | Used for |
|---|---|---|---|
| `hairline.chrome` | `--hairline-chrome` (proposed) | 0.5px (1px under `prefers-contrast: more`) | table row dividers, code bar, footer base rule |
| `hairline.object` | `--hairline-object` (proposed) | 1px | object edges, header edge, table head rule, section rules, chips |
| `rule.emphasis` | `--rule-emphasis` (proposed) | 2px | pull-quote bar, contents marker, focus ring |

**One table style** (editorial): no frame, a rule under the head, hairlines between rows, first and last columns flush with the text edge, caption below. **One chip shape**: pill, 1px edge, 6 × 12 padding (2 × 8 at the small size, `.pill`). The kicker is a text link, not a chip.

**z-index ladder**

| Role | Name here | Value |
|---|---|---|
| `z.nav` | `--z-nav` (`.site-header`, `.progress` — after the header in the DOM) | 50 |
| `z.skip-link` | `--z-skip-link` | 100 |

**Breakpoints**

| Role | Name here | Value | What changes |
|---|---|---|---|
| `bp.rail` | `max-width: 77.99rem` | 1248px | Contents becomes a closed disclosure above the text; share becomes a row beside it |
| `bp.nav` | `max-width: 960px` | 960px | Header links stop fitting and hide (the footer's Topics list repeats them); related cards stack |
| `bp.phone` | `max-width: 640px` | 640px | Head left-aligned, title one step down; cover and code full-bleed |

**Forks** — the contents is one `<details>`: forced open beside the text (summary inert), a closed disclosure below `bp.rail`; a seven-line script keeps it in step with the width. Every hover style sits under `(hover: hover) and (pointer: fine)`.

## Surfaces

Two levels in use; editorial allows flat, floating, overlay, with raised only for sticky chrome. No floating or overlay surfaces exist on this page, so no shadow tokens are defined (the old `--shadow` was removed with its last use).

| Level | Surface | Edge | Shadow | Layer |
|---|---|---|---|---|
| `elevation.flat` | `--bg`; `--surface-2` for the related band; `--surface` for post cards; `--code-bg` for the code island | `--line` at `--hairline-object` (cards), `--code-line` (code) — or none: the cover, table, note and author block sit on the page | none | — |
| `elevation.raised` | `.site-header`: `--chrome-tint` (`--bg` at 80%) | `--line-layered` at `--hairline-object` | none | `--z-nav` |

**Material**

| Tier | Blur | Saturate | Tint | Fallback | Used on |
|---|---|---|---|---|---|
| `material.translucent.chrome` | 20px | 1.8 | `--bg` at 80% (`--chrome-tint`) | opaque `--bg` baseline, enhanced inside `@supports`; `prefers-reduced-transparency` drops tint and filter; `prefers-contrast: more` and `forced-colors` strengthen the edge | `.site-header` only |

Header text over the worst backdrop (the cover's navy `#0D1828` scrolling under, light theme): `--ink` 11.09:1, `--ink-2` 5.77:1, `--muted` 3.45:1 — so header links and "by Halden" use `--ink-2`, never `--muted`. Dark theme over the cover's orange: `--ink-2` 8.08:1.

**Boxes** — post cards (one post each) and the code island. The callout is a note (a 1px `--line-strong` rule on its leading edge, quieter than the 2px ink pull-quote bar); the table and the author block are unboxed.

## Motion

CSS transitions only; tokens in `styles.css` `:root` (proposed 2026-11-04). Only the rungs this page uses are defined.

| Role | Name here | Value | Used for |
|---|---|---|---|
| `duration.instant` | `transition-duration: 0s` on `:active` | 0ms | press: `.btn` and `.icon-btn` scale to 0.96 on pointer-down |
| `duration.state` | `--duration-state` | 150ms | colour and background on buttons, nav, contents, chips; the press releasing |
| `duration.popover` | `--duration-popover` | 200ms | a post card's wash arriving (border colour) |
| `ease.standard` | `--ease-standard` | `cubic-bezier(0.22, 1, 0.36, 1)` | transforms (the press) |
| `ease.colour` | `--ease-colour` | `ease` | every colour, background and border transition |

**Named exemptions**

| Exemption | Values | Why |
|---|---|---|
| Card wash leave | 250ms (`--duration-wash-out`) | Hover leave runs a little longer than its 200ms arrival (motion law 7; editorial dial 200 in · 250 out) |
| Cover packets | 1.4s–3.6s per pass, 2–4 passes, then rest | Subject (motion law 4): the motion is the diagram's content, the dual write. Plays on load and stops, never loops; hidden under reduced motion |
| Reading progress | scroll-linked | `animation-timeline: scroll(root)` — follows the reader's own scroll, not time |

No springs (nothing is dragged or re-targets). Reduced motion: the cover rests without packets and anchor jumps are instant; colour fades and the 0.96 press stay. No hover travel anywhere: the "All posts" arrow underlines instead of nudging, post cards wash instead of lifting.

## Patterns

**Nouns** — post (cards, "All posts"), article, tags, topics. **Primary action** — Subscribe (header button scrolls to the footer form; form button submits).

## Decisions

- 2026-11-04 — Cover packets play a few passes then rest; no hover travel (arrow nudge and card lift removed). (Law; motion laws 1 and 4, editorial "nothing loops" — don't restore the loop.)
- 2026-11-04 — Callout built as a ruled note, author block and table unboxed, no shadows on the cover, code or cards, no hover lift on post cards. (Law; depth law 2 and the editorial levels dial — `raised` is only for the sticky header.)
- 2026-11-04 — Reading measure 36rem (≈ 70 characters), not 680px (≈ 83); cover and article head narrowed to 1.5 × the measure; table unframed. (Law; layout laws 1 and 3 — don't widen them back.)
- 2026-11-04 — The orange spends once: focus, plus `exception.subscribe`. Drop cap, kicker, bullets, pull-quote bar, progress bar, avatars, card meta, links, hovers, callout and table deltas are neutral, and code highlighting is carried by weight and tier, not hues. (Law; colour law 7 and the editorial accent dial — don't re-colour them.)
- 2026-11-04 — Body copy in `--ink`, not `--ink-2`. (Law; `type.body` is `text.primary`.)
- 2026-11-04 — Light and dark both follow the device through `prefers-color-scheme`; no toggle. (User decision: keep the page's existing theming.)
- 2026-11-04 — Preset `editorial`. (User decision.)

## Open issues

- Type law 12: fonts still come from `fonts.googleapis.com` with no metric-matched fallback. Self-hosting needs the font files added to the project, and the fallback's `size-adjust`/`ascent-override` must be computed from their metrics (`fontaine`/Capsize), not guessed. Left open.
- Layout law 8: below 960px the header's topic links are hidden with no menu; the footer's Topics list repeats them, so they come back, but not at the top. A menu would be a new feature — left for the owner.
- Layout law 1 cost: at the 70-character measure the code block's two longest lines (the SELECT string, the comment) scroll inside the block; at 680px they fit.
- Patterns: "Data" is marked current in the nav by colour alone (`--ink` vs `--muted`) — colour law 6.
