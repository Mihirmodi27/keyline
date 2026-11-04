# Design system

> Keyline reads this before touching UI, and writes back to it when a decision changes. Edit it by hand whenever you like — it is the source of truth for intent, the code is the source of truth for values. Set up 2026-11-04.

## Profile

| | |
|---|---|
| Product | Lumen — product analytics for small SaaS teams; this is the main Overview dashboard |
| Reader | Working: a team member who opens it daily to scan headline metrics, a trend, top pages and team activity |
| Preset | `product` |
| Areas | None — one screen |
| Stack | Static HTML, one stylesheet, vanilla JS; no framework, no build step |
| Tokens live in | `styles.css` `:root` custom properties (colour, shadow, radius, sidebar width, font stacks) |
| Themes | `light`, `dark` — following the device via `@media (prefers-color-scheme: dark)` re-declaring `:root`; `color-scheme: light dark` in the head; no toggle |
| Motion | CSS transitions and one `@keyframes pop`; JS only toggles classes |

Evidence for `product`: a sidebar app shell with six destinations, four headline figures, a time-series chart, a sortable-looking data table and an activity feed; every number is a figure to compare, not copy to read. The longest running text on the page is a two-line feed entry.

## Type

**Families** — `family.text`: Inter (`--font`), from Google Fonts, 400 and 500 only, with `"Inter Fallback"` — local Arial at size-adjust 107.12%, ascent 90.44%, descent 22.52% — so the swap doesn't move text. `family.mono`: `--mono` system stack, now unused on this screen (no literal code appears; paths and hostnames are in the text face).

Sizes are tokens in `styles.css` `:root`, in `rem` (all *proposed*, 2026-11-04):

| Role | Name here | Size | Leading | Tracking | Weight | Tier |
|---|---|---|---|---|---|---|
| `type.title` (header-bar title, chrome) | `h1` → `--type-ui` | 13px | 1 | 0 | `--weight-strong` 500 | `--text` |
| `type.heading` | `.card-title` → `--type-heading` | 16px | 1.35 | −0.02em | 500 | `--text` |
| `type.supporting` | `.card-sub` → `--type-body` | 14px | 1.45 | 0 | 400 | `--text-2` |
| `type.body` | `body`, `.feed-body p` → `--type-body` | 14px | 1.5 / 1.45 | 0 | 400 | `--text` / `--text-2` |
| `type.ui` | `.nav-link`, `.crumb`, `.range-btn`, menu options, `.link`, search input → `--type-ui` | 13px (input 16px ≤ 860px) | 1 single-line, 1.4 rows | 0 | 400; 500 when current/selected | `--text-2` |
| `type.data` | `.pages` cells → `--type-ui` + `.num` | 13px | 1.5 | 0 | 400 | `--text` sorted column, `--text-2` others |
| ↳ headline figure (project role) | `.metric-value` → `--type-figure` | 24px | 1.15 | −0.04em | 400 | `--text` — data, not a tier; larger than its label, never heavier |
| ↳ secondary figure (project role) | `.chart-stats dd` → `--type-heading` | 16px | 1.35 | 0 | 400 | `--text` — separated from `.card-title` by weight and tracking |
| `type.label` | `.metric-label` → `--type-meta` | 12px | 1.3 | 0 | 500 | `--text-2` — leads its figure by position and weight |
| ↳ group label (project role) | `.nav-label` → `--type-meta` | 12px | 1.3 | 0, sentence case | 400 | `--text-3` — a hairline rule beneath |
| `type.meta` | `time`, `.metric-foot`, `.ws-plan`, `.me-mail`, axes, `.legend`, `dt`, `th`, chips, tooltip → `--type-meta` | 12px | 1 / 1.4 | 0 | 400; chips 500 | `--text-3` |
| brand wordmark (project role) | `.brand-name` → `--type-heading` | 16px | — | −0.02em | 500 | `--text` |

Five sizes (24 / 16 / 14 / 13 / 12); ceiling for headings 16 ÷ 14 = 1.14. **Weights** — `--weight-regular` 400: everything at rest. `--weight-strong` 500: section headings, the header title, names in the feed (`<strong>`), figure labels, chips, and the one state weight carries — current/selected (nav item, chosen range). `font-synthesis: none`. **Numerals** — tabular on `.num`, the tooltip and counts, scoped, not the root; paths take `slashed-zero` only. **Icons** — 18px boxes drawing ≈ 13px beside 13px text; stroke 1.5 on a 20 grid.

## Colour

Neutrals at OKLCH hue 265, chroma ≤ 0.012 (dial ≤ 0.015), spaced by contrast; each value carries its OKLCH source in a comment in `styles.css`. Token names are the project's own; `--green`, `--red`, `--amber` keep their hue names (never renamed) and are mapped to status roles here.

**Text** — measured with `scripts/contrast.mjs` on the worst surface each tier lands on (`--hover`, the nav and menu row hover). Product targets 15 · 7.5 · 4.8, step ≥ 1.4×.

| Role | Name here | Light | Ratio on `--hover` | Dark | Ratio on `--hover` |
|---|---|---|---|---|---|
| `text.primary` | `--text` | `#191c22` | 14.95:1 | `#e8ebf1` | 13.34:1 |
| `text.secondary` | `--text-2` | `#494d53` | 7.45:1 (step 2.0×) | `#adb1b9` | 7.41:1 (1.8×) |
| `text.tertiary` | `--text-3` | `#656970` | 4.83:1 (1.54×) | `#8a8e95` | 4.84:1 (1.53×) |
| `text.link` | `--accent-ink` | `#4a48d8` | 6.54:1 on `--surface` | `#a5a5ff` | 7.75:1 on `--surface` |

On `--bg`: 15.90 / 7.92 / 5.14 (light), 15.71 / 8.73 / 5.70 (dark).

**Surfaces**

| Role | Name here | Light | Dark |
|---|---|---|---|
| `surface.page` | `--bg` | `#f5f7fa` | `#0f1217` (OKLCH L 0.18) |
| `surface.subtle` | `--sidebar` | `#f8f9fb` | `#12151a` |
| `surface.raised` | `--surface` | `#ffffff` | `#181b20` (+0.04 L) |
| `surface.hover` (table) · table head · kbd | `--surface-2` | `#f2f3f7` | `#1c1f25` |
| `surface.hover` (nav, menu rows) | `--hover` *(proposed)* | `#eef0f4` | `#1f2228` |
| `surface.selected` | `--selected` *(proposed)* | `#e8ebf1` | `#24262c` |

**Lines and fills**

| Role | Name here | Light | Dark |
|---|---|---|---|
| `border.default` · `border.divider` | `--border` | `#e2e4e9` | `#2b2e34` |
| `border.hover` | `--border-strong` | `#cbced3` | `#3a3d44` |
| `border.control` | `--border-control` *(proposed)* | `#83868c` — 3.40:1 on `--bg`, 3.65:1 on `--surface` | `#686c73` — 3.27:1 on `--surface`, 3.56:1 on `--bg` |
| `fill.strong` (meters) | `--fill` *(proposed)* | `#898c92` | `#686c73` |
| chart comparison series (`mark`) | `--prev` | `#898c92` — 3.65:1 on `--surface` | `#686c73` — 3.27:1 |
| `scrim` | `--scrim` *(proposed)* | `rgba(15,18,23,.4)` | `rgba(0,0,0,.6)` |

**Signal**

| Role | Name here | Light | Dark |
|---|---|---|---|
| `accent` · `focus` | `--accent` | `#5b5bf0` — focus 4.66:1 on `--bg`, 4.19:1 on `--selected` | `#8282ff` — 5.18:1 on `--hover`, 4.74:1 on `--selected` |
| `surface` tint of accent | `--accent-soft` | `#eeeefe` — search focus halo only | `rgba(130,130,255,.14)` |
| `status.danger.fg` / `.bg` | `--red` / `--red-soft` | `#b8322a` on `#fdecea` — 5.21:1; 5.55 on `--bg`; 5.37 on `--surface-2` | `#ff7a6e` — 5.66:1 on its tint over `--surface` |
| `status.success.fg` / `.bg` | `--green` / `--green-soft` | `#0f7a47` on `#e6f6ee` — 4.82:1; 5.02 on `--bg` | `#3ccf8e` — 6.91:1 on its tint |
| `status.warning.fg` / `.bg` | `--amber` / `--amber-soft` *(proposed)* | `#9a5c00` on `#fff4e0` — 4.93:1 | `#f2b24c` — 7.30:1 on its tint |
| `status.info` | — | none: an info hue near h 250 sits within 40° of the indigo accent (h 277), so info takes no colour | — |

**Where colour goes** — the accent: links, focus, the chart's primary series and its row bars, the chosen range's check, the unread-notification dot ("your turn"). Danger: the conversion drop, the 61.3% bounce rate, the bounce alert in the feed — the three things that need a person. Everything else is neutral: rising deltas, routine feed events, the current nav item, the usage meter, the chart annotation.

**Exceptions**

- `exception.person.*` — *who*. `--person-1…3` with `-soft` tints, per theme; avatars only, never names or rows. Letters 7.20 / 5.61 / 5.00:1 light, 7.43 / 8.90 / 8.74:1 dark.
- Brand mark (`--brand-mark-from/to`) and Fieldnote's workspace logo (`--ws-logo-from/to`) are marks, not interface hues: they count against neither the accent nor the exceptions.

## Layout

The app shell: one navigation surface (the sidebar), a header bar, then the content panel with the activity feed as a rail beside it. Sections stack, each opened by its heading; nothing on the page is a card except the table's frame and the sidebar's usage meter. All values are tokens in `styles.css` `:root` (*proposed* 2026-11-04 unless noted).

| Role | Name here | Value |
|---|---|---|
| `measure.app` | `.content` | fills the panel, left-aligned (the old `max-width: 1440px` removed: the shell owns width) |
| nav region | `--sidebar-w` (existing) | 248px |
| `measure.rail` | `--rail-w` | 340px — the activity rail |
| header bar | `--header-h` | 52px min (controls 34px) |
| `gutter` | `--gutter` | 32px; 16px ≤ 860px |
| `space.tight` | `--space-tight` | 6px |
| `space.group` | `--space-group` | 16px |
| `space.section` | `--space-section` | 32px — between the stat strip, sections and rail |
| `space.heading-above` · `space.heading-below` | `--space-section` · `.card-head` margin | 32px · 12px — 2.67:1 |
| page top space | `.content` padding-top | 24px under the header bar (16px ≤ 860px) |

**Radius ladder**

| Role | Name here | Value | Used on |
|---|---|---|---|
| `radius.small` | `--radius-xs` | 4px | kbd, inline path tokens |
| `radius.control` | `--radius-sm` (existing, was 8px and unused) | 6px | buttons, search, nav rows, menu rows, logo tiles, focus ring |
| `radius.card` | `--radius-md` | 10px | table frame, tooltip, usage meter |
| `radius.container` | `--radius` (existing) | 12px | the range menu: 6px padding holds 6px rows (12 − 6) |
| `radius.pill` | `--radius-pill` | 999px | chips, avatars, dots, tracks |

**Lines** — `hairline.chrome` and `hairline.object` share `--hairline` 0.5px (1px under `prefers-contrast: more`); the divider steps down in colour (`--divider` under `--border`). `rule.emphasis` 2px: the focus ring.

**One of each device** — one table style (hairline frame at `radius.card`, tinted head in `--text-2`, `--divider` between rows only); one group-label style (`.nav-label`, over a hairline); one chip shape (`.nav-count`, `.delta`, `.flag`: 20px tall, pill, 6px sides).

**z-index ladder**

| Role | Name here | Value |
|---|---|---|
| `z.raised` | `--z-raised` | 10 |
| `z.popover` | `--z-popover` | 20 |
| `z.nav` | `--z-nav` | 50 |
| `z.overlay` | `--z-overlay` | 60 |
| `z.skip-link` | `--z-skip-link` | 100 |

The mobile sheet and its scrim share `z.overlay` and stack by document order (scrim first).

**Breakpoints** — three; the content ones on the panel container (`container: panel`), the shell one on the window.

| Role | Name here | Value | What changes |
|---|---|---|---|
| `bp.rail` | `@container panel (max-width: 900px)` | panel 900px | the activity rail stacks under the table; the stat strip goes 2 × 2; range dates hide |
| `bp.shell` | `@media (max-width: 860px)` | window 860px | the sidebar becomes a sheet with a scrim; the toolbar wraps; inputs go to 16px |
| `bp.phone` | `@container panel (max-width: 560px)` | panel 560px | comparison text, two table columns, half the x-axis labels and the annotation label hide |

Every hover style is gated on `(hover: hover) and (pointer: fine)`. Skip link → `#main`.

## Surfaces

Four levels, all opaque. Product: hairlines do more work than shadows; buttons are flat; no translucency.

| Level | Used by | Surface | Edge | Shadow | Layer |
|---|---|---|---|---|---|
| `elevation.flat` | page sections, stat strip, table frame, sidebar, usage meter, controls | `--bg`, `--sidebar`, `--surface` | `--border` at `--hairline` (controls `--border-control`) | — | flow |
| `elevation.raised` | the sticky header bar | `--bg` (opaque; was a translucent blur) | `--border` bottom hairline | `--shadow` | `--z-nav` |
| `elevation.floating` | range menu, chart tooltip | `--surface-float` *(proposed)*: white · dark `#21242a` (L 0.26) | 0.5px `--border` ring at the head of `--shadow-pop`; `1px solid transparent` border for forced colours; a real `--text` border under `prefers-contrast: more` | `--shadow-pop`: contact + 1 ambient, 10% light / 55% dark | `--z-popover`, `--z-raised` |
| `elevation.overlay` | the mobile nav sheet (≤ 860px) | `--sidebar` | ring in `--shadow-overlay` | `--shadow-overlay` *(proposed)*: 16% / 60% | `--z-overlay` |

**Scrim** — `--scrim`: 40% light, 60% dark, no blur, only under the nav sheet. **Materials** — opaque only. **Row hover on a floating surface** — `--wash` *(proposed)*, black 5% light / white 5% dark.

## Motion

| Role | Name here | Value | Used for |
|---|---|---|---|
| `duration.state` | literal | 150ms (`0.15s` ×6) | nav hover colour, borders, chevron |
| — | literal | 120ms (`0.12s` ×3) | table row hover, chart hover and tooltip fade |
| `duration.popover` | literal | 140ms (`0.14s`) | range menu `pop` |
| `duration.overlay` | literal | 220ms (`0.22s`) | mobile sidebar slide |
| `ease.standard` | `ease`, `ease-out`, default | — | three curves, no token |

Reduced motion: one global `* { transition: none !important; animation: none !important }`.

## Patterns

**Nouns** — page (a path), event, funnel, cohort, teammate, workspace. **Shortcuts** — ⌘K / Ctrl+K focuses search; Escape closes the range menu and the mobile nav. **Destructive** — none on this screen.

## Decisions

- 2026-11-04 — The mobile nav sheet keeps the `--sidebar` surface in dark rather than lifting two steps to L 0.30: on 0.30, `--text-3` (nav counts, group labels) falls to 4.14:1. Scrim and `--shadow-overlay` carry the level. (Law; colour law 3 over the depth recipe.)
- 2026-11-04 — Header bar opaque, no backdrop blur: `product` allows no translucency on chrome. (Law; depth law 6.)
- 2026-11-04 — Light page `--bg` is white, replacing the grey: with the cards gone the content sits on the page, and the page is the surface it was sitting on. Supersedes keeping the grey page. (Law; colour law 8, made in the layout pass.)
- 2026-11-04 — Headline metrics are a stat strip parted by hairlines, and chart, table and activity sit on the page; only the table keeps a frame. (Law; layout law 3, depth law 2.)
- 2026-11-04 — Rising deltas and routine feed events are neutral; red is kept for the conversion drop, the 61.3% bounce rate and the bounce alert. Colour points at what needs a person, and growth is not an action item. (Law; colour law 7.)
- 2026-11-04 — Current nav item on a neutral `--selected` pill at 500 with `aria-current`, not the accent: where the reader is, is position, not a call to act. (Law; colour law 7, product dial.)
- 2026-11-04 — Page title "Overview" set as header-bar chrome (13px/500, last item of the breadcrumb), not a 22px heading: an app's page title labels where you are, and a page uses either a header-bar title or a content `type.title`, never both. (Law; type ladders, product.)
- 2026-11-04 — Headline figures at 24px/400, not 30px/600: a figure is data, larger than its label but never heavier, and product runs two weights. (Law; type law 3, law 5.)
- 2026-11-04 — Paths take `slashed-zero` but not `tabular-nums`: Inter's `tnum` widens the hyphen in `/docs/getting-started`. (Law; type numerals.)
- 2026-11-04 — Keep the existing theming: light and dark following the device through `prefers-color-scheme`, no toggle. (User decision; matches the `product` theme-control dial.)
- 2026-11-04 — Preset `product`. (User decision.)

## Open issues

**Type**
- Inter still loads from Google Fonts rather than self-hosted (now 2 weights, with a metric-matched fallback) — type law 12. Self-hosting needs the font files fetched into the project.

**Colour**
- `--amber` warning pair and `status.info` are defined but unused on this screen — kept because `product` requires the status palette.
- Fieldnote's workspace logo puts white on orange at 2.15–3.58:1; it is a third-party mark and was left as is.

**Layout**
- The stat-strip figures don't filter the table (layout dial: product stat strip): Visitors, Sign-ups, Conversion and Revenue don't count the table's rows, so there is nothing to filter. Left as is.
- No sidebar collapse to an icon rail — a shell feature, not added when improving a screen (layout dial: the shell).

**Depth**
- None open.

**Motion**
- Global reduced-motion kill switch — motion law 10.
- Three curves (`ease`, `ease-out`, default) and durations 120 / 140 / 150 / 220ms with no tokens — motion law 2, law 5.
- Range menu has no exit (hidden instantly) — motion law 7 (fine), but its entrance uses `scale` on a menu — check against the ladder.

**Patterns**
- "View all" and "All pages" link text; "Custom range…" option does nothing — patterns law 14.
- Notification button has no count or state for screen readers beyond the dot — patterns law 14.
- Activity feed: required by the brief; keep it, make it earn its place — patterns law 12.
