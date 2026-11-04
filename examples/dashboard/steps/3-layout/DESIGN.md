# Design system

> Keyline reads this before touching UI, and writes back to it when a decision changes. Edit it by hand whenever you like — it is the source of truth for intent, the code is the source of truth for values. Set up 2026-11-04.

## Profile

| | |
|---|---|
| Product | Lumen — product analytics for small SaaS teams. This file covers the Overview dashboard, its one screen so far |
| Reader | Working: a team member checking traffic, sign-ups and alerts, daily, scanning and comparing |
| Preset | `product` |
| Areas | none |
| Stack | Static HTML, one stylesheet (`styles.css`), one script (`script.js`); no framework, no build |
| Tokens live in | `styles.css` `:root`, re-declared in `@media (prefers-color-scheme: dark)` |
| Themes | `light`, `dark` — following the device by `prefers-color-scheme`; `color-scheme: light dark` declared; no toggle |
| Motion | CSS transitions and one keyframe; `script.js` toggles classes and `hidden` |

Evidence for `product`: one working screen — an app shell with a sidebar of six destinations, a header bar, four headline figures, a chart, a sortable table and an activity feed; no long-form text anywhere; every number tabular already. The reader comes back daily to scan. (User confirmed `product`.)

## Type

**Families** — `family.text`: Inter (`--font`, Google Fonts `<link>`, weights 400 and 500 only), behind a metric-matched `"Inter Fallback"` (Arial at `size-adjust: 107.12%`, ascent 90.44%, descent 22.52%), `"cv11", "ss01"` on `body`, `font-synthesis: none`. `family.mono`: `--mono`, declared, nothing on this screen uses it — page paths and hostnames are in the text face with a slashed zero (type dials: families).

**Sizes** — `rem` tokens in `styles.css` `:root`, five above the floor:

| Role | Name here | Size | Leading | Tracking | Weight | Tier |
|---|---|---|---|---|---|---|
| ↳ `figure` (project role under `type.data`) | `--size-figure` · `.metric-value` | 1.5rem (24px) | 1.2 | −0.04em | 400 | `--text` — data, larger than its label, which leads by position and weight |
| `type.heading` | `--size-heading` · `.card-title` | 1rem (16px) | 1.35 | −0.02em | 500 | `--text` |
| ↳ `chart-stat` (project role under `type.data`) | `--size-heading` · `.chart-stats dd` | 1rem (16px) | 1.35 | −0.02em | 400 | `--text` — separates from the heading on weight and its label above |
| ↳ wordmark (project role under `type.heading`) | `--size-heading` · `.brand-name` | 1rem (16px) | 1.5 | −0.02em | 500 | `--text` — separates by the brand mark beside it |
| `type.body` · `type.supporting` | `--size-body` · `body`, `.feed-body p` | 0.875rem (14px) | 1.5 / 1.45 | 0 | 400 | `--text` / `--text-2` |
| `type.ui` | `--size-ui` · `.nav-link`, `.range-btn`, `.search`, menu options, `.link` | 0.8125rem (13px) | 1 in fixed-height controls, 1.4 where it wraps | 0 | 400; 500 when active or selected | `--text-2` |
| ↳ page title (`type.ui` in the header bar) | `--size-ui` · `h1` in `.crumbs` | 0.8125rem (13px) | 1.4 | 0 | 500 | `--text` — the last step of the breadcrumb |
| `type.data` | `--size-ui` · `.pages td` | 0.8125rem (13px) | 1.5 | 0 | 400; the row's path 500 | `--text` / `--text-2`, tabular |
| `type.label` | `--size-small` · `.metric-label`, `.chart-stats dt`, `.pages thead th`, `.legend` | 0.75rem (12px) | 1.3 | 0 | 500 (figure and column labels), 400 (legend) | `--text-2` / `--text-3` |
| ↳ group label (project role) | `--size-small` · `.nav-label` | 0.75rem (12px) | 1.3 | 0, sentence case | 400 | `--text-3` — a hairline rule beneath |
| `type.meta` | `--size-small` · `time`, `.card-sub`, `.crumb`, `.ws-plan`, axes, `.metric-foot`, `kbd`, tooltip | 0.75rem (12px) | 1.4 | 0 | 400 | `--text-3` |

`type.title` has no row: the page title sits in the header bar as chrome (type ladders: product), and no content heading opens the page. Inputs go to 16px under 560px.

**Weights** — `--weight` 400: body, figures, data. `--weight-strong` 500: headings, the current nav item, selected menu option, figure and column labels, names in the feed, the row's path, chips.

**Numerals** — `tabular-nums` on `.num`, `time`, chart axes, tooltips and counts; not on the root, and not on paths (Inter's `tnum` widens hyphens).

**Icons** — `.icon` 16px on a 20-unit grid (≈ 13px drawn), stroke 1.6, beside 13px UI text; 12px arrows in chips.

## Colour

**Text** — checked against each tier's worst surface: `--bg` in light (the darkest surface text lands on), `--surface-2` in dark (the lightest). Measured with `contrast.mjs`. Product targets: tertiary ≥ 4.8:1, each step ≥ 1.4× the next.

| Role | Name here | Light | Ratio | Dark | Ratio |
|---|---|---|---|---|---|
| `text.primary` | `--text` | `#0f1729` | 16.67:1 | `#eef0f5` | 15.13:1 |
| `text.secondary` | `--text-2` | `#4a5468` | 7.10:1 (×2.35) | `#a9b0c0` | 7.93:1 (×1.91) |
| `text.tertiary` | `--text-3` | `#636c7e` | 4.93:1 (×1.44) | `#848c9e` | 5.11:1 (×1.55) |
| `accent.ink` (project role) | `--accent-ink` | `#4a48d8` | 6.54:1 on `--surface`; 4.70:1 on `--selected` | `#a5a5ff` | 8.20:1 on `--surface`; ≈ 6.2:1 on `--selected` |
| `text.on-accent` | `--on-accent` | `#ffffff` | on brand gradients; workspace lettermark ≥ 3.02:1 (a mark, recognised not read) | `#ffffff` | same |

**Surfaces**

| Role | Name here | Light | Dark |
|---|---|---|---|
| `surface.page` | `--bg` | `#f6f7f9` | `#0b0d12` (OKLCH L 0.159) |
| `surface.subtle` | `--sidebar` | `#fbfbfc` | `#0e1016` |
| `surface.raised` | `--surface` | `#ffffff` | `#12151c` |
| `surface.hover` | `--surface-2` | `#f9fafb` | `#171b23` |
| ↳ hover wash on the sidebar (project role, `border.layered` family) | `--wash` (proposed) | `rgba(127,135,155,0.12)` | `rgba(255,255,255,0.06)` |
| `surface.selected` | `--selected` (proposed) | accent at 22%: `rgba(91,91,240,0.22)` | `rgba(130,130,255,0.22)` |
| accent tint for marks (project role) | `--accent-soft` | `#eeeefe` | `rgba(130,130,255,0.14)` |

**Lines and fills**

| Role | Name here | Light | Dark |
|---|---|---|---|
| `border.default` · `border.divider` | `--border` | `#e6e8ec` | `#232835` |
| `border.control` | `--border-control` (proposed) | `#868c99` — 3.15:1 on `--bg` | `#60697b` — 3.31:1 on `--surface` |
| `border.hover` | `--border-strong` (dividers); controls hover to `--text-3` | `#d6d9df` | `#2f3545` |
| `mark` — previous-period series | `--prev` | `#868c99` — 3.15:1 on `--bg` | `#60697b` — 3.31:1 on `--surface` |
| usage meter | `--meter` | `--accent → #8a6af5` (end 3.13:1 on its track) | `--accent → #a58bff` |

**Signal**

| Role | Name here | Light | Dark |
|---|---|---|---|
| `accent` · `focus` | `--accent` | `#5b5bf0` (4.67:1 on `--bg`) | `#8282ff` (6.10:1 on `--bg`) |
| `status.success` fg / bg | `--green` / `--green-soft` | `#0c7a48` on `#e6f6ee` — 4.82:1; 5.03:1 on `--bg` | `#3ccf8e` / 12% — 9.14:1 |
| `status.danger` fg / bg | `--red` / `--red-soft` | `#c8372d` on `#fdecea` — 4.54:1; 4.85:1 on `--bg` | `#ff7a6e` / 12% — 7.18:1 |
| `status.warning` fg / bg | `--amber` / `--amber-soft` | `#9a5c00` on `#fdf3e1` — 4.89:1; 5.02:1 on `--bg` | `#f2b24c` / 12% — 7.84:1 |
| `status.info` | takes the accent hue (`--accent` / `--accent-soft`) | info at h ≈ 250 would sit 27° from the accent at h 277, so it takes the accent's hue and has no token of its own | |

Neutrals keep their slate tint (text tiers OKLCH C 0.031–0.038, hue ≈ 265) — see `## Decisions`.

**Chart** — one primary series in `--accent` at full strength (the line, its area wash and the table's view bars); the previous period in `--prev`, dashed.

**Exceptions** — chromatic spend beyond accent and status:

- `exception.person.*` — `--person-violet`, `--person-amber`, `--person-teal`, each with a `-soft` tint, per theme. *Who* at a glance: avatars only, never names or rows.
- Brand marks, kept from the original design: `--brand-gradient` and `--brand-shadow` (the Lumen mark), `--ws-gradient` (the workspace avatar), `--meter` (the usage meter). Each re-declared per theme.

## Layout

App shell: one navigation surface (the sidebar), then the content panel under its header bar. The panel holds the headline-figure strip, then a content column (chart, then table) beside the activity rail.

| Role | Name here | Value |
|---|---|---|
| `measure.app` | `.content` | fills the panel, left-aligned, `max-width: 1440px` |
| `measure.rail` (navigation) | `--sidebar-w` | 248px |
| activity rail (project role under `measure.rail`) | `.grid` column | `clamp(300px, 30%, 360px)` |
| `gutter` | `--gutter` (proposed) | 32px; 16px under `bp.shell` |
| `space.tight` | `--space-tight` (proposed) | 8px |
| `space.group` | `--space-group` (proposed) | 16px |
| `space.section` · `space.heading-above` | `--space-section` (proposed) | 32px |
| `space.heading-below` | `--space-heading-below` (proposed) | 12px — 32 : 12 ≈ 2.7 : 1 |
| header bar | `.topbar` | min 52px; breadcrumb and title at the start, search and the page's actions (ghost buttons) at the end |
| page top space | `.content` | 24px under the header bar; 16px under `bp.shell` |

**Lines** — `hairline.chrome` · `hairline.object`: `--hairline` (proposed) 0.5px for every structural line (sidebar edge, header rule, figure dividers, table frame and rows, the activity card); control edges stay 1px in `--border-control` (a 3:1 line a reader must find). `rule.emphasis`: the 2px focus ring.

**Radius ladder**

| Role | Name here | Value |
|---|---|---|
| `radius.pill` | `--radius-pill` (proposed) | 999px — chips, meters, bars |
| `radius.small` | `--radius-sm` | 6px — `kbd`, menu rows (10 − 6 = 4, snapped), the workspace avatar (12 − 6) |
| `radius.control` | `--radius-control` (proposed) | 10px — search, buttons, nav rows, menu, tooltip, usage panel |
| `radius.card` | `--radius` | 12px — the activity card, the table frame, the workspace switcher |

**z-index ladder**

| Role | Name here | Value |
|---|---|---|
| `z.raised` | `--z-raised` | 10 |
| `z.popover` | `--z-popover` | 20 |
| sticky header bar (project rung) | `--z-header` | 30 |
| `z.dismiss` | `--z-dismiss` | 40 |
| `z.nav` | `--z-nav` | 50 |
| `z.skip-link` | `--z-skip-link` | 100 |

**Breakpoints**

| Role | Name here | Value | What changes |
|---|---|---|---|
| `bp.shell` | `@media (max-width: 860px)` | window 860px | The sidebar becomes a sheet behind a menu button; the toolbar takes its own row; gutter 16px |
| `bp.rail` | `@container main (max-width: 860px)` | panel 860px | The activity rail drops below the column; figures go two-up |
| `bp.compact` | `@container main (max-width: 560px)` | panel 560px | The table keeps path, views and bounce; the chart shortens; inputs go to 16px |

Every hover style sits behind `(hover: hover) and (pointer: fine)`. A skip link targets `#main`.

**Boxes on the Overview screen** — three: the activity rail (a side rail, one object), the table's frame, and the workspace switcher (a control). Figures are one hairline-parted strip; the chart is unboxed.

## Surfaces

| Level | Surface | Edge | Shadow | Layer |
|---|---|---|---|---|
| `elevation.flat` | `--bg` | — | — | — |
| `elevation.raised` (every card, figure tile, control) | `--surface` | `--border` 1px | `--shadow` (cards), `--shadow-sm` (controls) | — |
| `elevation.floating` (range menu, chart tooltip) | `--surface` | `--border` 1px | `--shadow-pop` | 30 / 5 |
| `elevation.overlay` (navigation sheet) | `--sidebar` | `--border` right | `--shadow-pop` | 50, scrim 40 |

**Material** — `.topbar` is translucent: `color-mix(--bg 82%)`, `saturate(180%) blur(12px)`, no `@supports` guard, no reduced-transparency path.

**Boxes on the Overview screen** — 9 bordered regions: 4 figure tiles, the chart card, the activity card, the table card, and in the sidebar the workspace switcher and the usage panel. Holding more than one object: the chart card (chart, legend, a three-figure stat row), the activity card (7 feed items), the table card (heading and table), the usage panel (meter, figure and link). The chart, table and activity cards are a bento of unlike sections in one grid.

## Motion

| Role | Name here | Value | Used for |
|---|---|---|---|
| hover colour (no token) | literal | 150ms | nav links, workspace, search, range button, chevron |
| row and tooltip fade (no token) | literal | 120ms | table row hover, chart hover line, tooltip |
| menu open (no token) | `@keyframes pop` | 140ms `ease-out` | range menu entrance, scale 0.98 + 4px |
| sheet (no token) | literal | 220ms `ease` | mobile navigation sheet |

No duration or easing tokens; transitions default to `ease`. Reduced motion: one global `* { transition: none !important; animation: none !important }`.

## Patterns

**Nouns** — page (a tracked URL), event, funnel, cohort, visitor, sign-up, teammate. **Shortcuts** — ⌘K / Ctrl+K focuses search; Escape closes the range menu and the navigation sheet, one layer each; arrow keys move through the range menu. **Destructive** — none on this screen. **Remembered views** — none.

## Decisions

- 2026-11-04 — Figures in one hairline-parted strip, chart and table unboxed on the page (the table keeps one frame), activity kept as the one card: product stacks sections and boxes only single objects. (Law; layout law 3, depth law 2.)
- 2026-11-04 — Range picker and notifications are ghost buttons in the header bar; only the search field keeps an edge. (Law; layout: the product page's header bar.)
- 2026-11-04 — Neutrals keep their slate tint (C ≈ 0.03, above product's 0.015) and the dark page stays at L 0.159 (below product's 0.17–0.21): both are the existing design's choices, and no law asks for them to change. (User decision: keep the existing theming.)
- 2026-11-04 — The 61.3% bounce flag carries an alert glyph and screen-reader text beside its red. (Law; color law 6.)
- 2026-11-04 — The table's view bars run in the accent at full strength, not 55% opacity: they are the primary series. (Law; color law 7.)
- 2026-11-04 — Page title moved into the breadcrumb at 13/500, from a 22/600 heading in the header bar: a product header bar titles the page as chrome. (Law; type ladders: product.)
- 2026-11-04 — Headline figures at 24/400, not 30/600: figures are data and their labels keep the lead by weight. (Law; type law 3, type law 5.)
- 2026-11-04 — Preset `product`. (User decision.)
- 2026-11-04 — Theming stays as built: light and dark following the device, no toggle. (User decision.)

## Open issues

Type
- Inter still comes from the Google Fonts CDN; self-hosting needs the font files added to the project. (type law 12)

Depth
- Cards and figure tiles carry shadows as content in the flow. (depth law 2)
- Controls (search, range, icon buttons, workspace) carry `--shadow-sm`; product buttons are flat. (depth dials)
- Translucent header bar under `product`, which allows none on chrome; no `@supports` guard, no reduced-transparency branch. (depth laws 6, 15)
- Dark floating surfaces (range menu) are the same `--surface` as cards — no lift. (depth law 5)
- Scrim is 40% in both themes. (depth dials)

Motion
- Global reduced-motion kill switch. (motion law 10)
- Durations 120, 140, 150, 220ms as literals with no ladder; product's is 80 / 100 / 150 / 200ms. (motion law 2)
- Default `ease` on every transition; menu on `ease-out`, sheet on `ease`. (motion law 5)

Patterns
- Workspace switcher and notifications button are styled as controls and do nothing. (patterns law 14)
- The overview has no action items section; the one item that needs a person (bounce over 60%) is fifth in the feed. (patterns law 12)
