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

**Text** — measured with `scripts/contrast.mjs`, worst surface noted.

| Role | Name here | Light | Ratio (worst surface) | Dark | Ratio (worst surface) |
|---|---|---|---|---|---|
| `text.primary` | `--text` | `#0f1729` | 16.67:1 on `--bg` | `#eef0f5` | 15.13:1 on `--surface-2` |
| `text.secondary` | `--text-2` | `#4a5468` | 7.10:1 on `--bg` | `#a9b0c0` | 7.93:1 on `--surface-2` |
| `text.tertiary` | `--text-3` | `#7a8396` | **3.55:1** on `--bg` (3.81 on `--surface`) — fails | `#7c8496` | 4.60:1 on `--surface-2` |
| link / accent text | `--accent-ink` | `#4a48d8` | 6.54:1 on `--surface` | `#a5a5ff` | 8.20:1 on `--surface` |

**Surfaces**

| Role | Name here | Light | Dark |
|---|---|---|---|
| `surface.page` | `--bg` | `#f6f7f9` | `#0b0d12` (OKLCH L 0.159) |
| `surface.subtle` | `--sidebar` | `#fbfbfc` | `#0e1016` |
| `surface.raised` | `--surface` | `#ffffff` | `#12151c` |
| `surface.hover` | `--surface-2` (menu rows, table rows), `rgba(127,135,155,.1)` literal (nav) | `#f9fafb` | `#171b23` |
| `surface.selected` | `--accent-soft` (current nav item) | `#eeeefe` | `rgba(130,130,255,.14)` |

**Lines and fills**

| Role | Name here | Light | Dark |
|---|---|---|---|
| `border.default` · `border.divider` · `border.control` | `--border` | `#e6e8ec` (1.14:1 on `--bg`) | `#232835` (1.49:1 on `--surface`) |
| `border.hover` | `--border-strong` | `#d6d9df` (1.41:1 on `--surface`) | `#2f3545` |
| `fill.strong` | `--accent` (usage bar, chart line, table bars) | `#5b5bf0` | `#8282ff` |
| chart comparison series | `--prev` | `#b8bfcc` (1.85:1 on `--surface`) | `#4a5263` (2.33:1) |

**Signal**

| Role | Name here | Light | Dark |
|---|---|---|---|
| `focus` · `accent` | `--accent` | `#5b5bf0` — 4.67:1 on `--bg`, 4.36:1 on `--accent-soft` | `#8282ff` — 5.41:1 on `--surface-2` |
| `status.success.fg` / `.bg` | `--green` / `--green-soft` | `#138a52` on `#e6f6ee` — **3.93:1**, fails | `#3ccf8e` — 9.14:1 on `--surface` |
| `status.danger.fg` / `.bg` | `--red` / `--red-soft` | `#c8372d` on `#fdecea` — 4.54:1 | `#ff7a6e` — 7.18:1 |
| `status.warning.fg` | `--amber` | `#b26b00` — declared, unused | `#f2b24c` |
| `status.info` | — | none | none |

**Exceptions** (unnamed today) — person hues `.av-violet` / `.av-amber` / `.av-teal` (literals per theme); workspace avatar orange gradient; brand mark indigo gradient; usage bar gradient ending in `#9b7bff`; feed icons coloured by event kind (`.fi-green`, `.fi-blue`, `.fi-red`, `.fi-grey`).

## Layout

| Role | Name here | Value |
|---|---|---|
| `measure.app` | `.content` | fills the panel, `max-width: 1440px` |
| `measure.rail` (nav) | `--sidebar-w` | 248px |
| inspector-like column | `.grid` second track | 360px (320px ≤ 1280px) |
| `gutter` | `.content` padding | 32px; 16px ≤ 860px |
| `space.tight` | literals | 2–8px |
| `space.group` | `.metrics` gap, `.card-head` margin | 16px / 18px |
| `space.section` | `.content` gap, `.grid` gap | 20px |

**Radius ladder** — `--radius` 12px (cards), `--radius-sm` 8px (declared, unused); literals 10px (workspace, usage, menu), 9px (controls), 8px (nav rows, brand mark), 7px, 6px, 5px, 99px (pills), 50% (avatars). 11 distinct values.

**z-index** — literals only: 5 (tooltip), 20 (topbar), 30 (range menu), 40 (scrim), 50 (mobile sidebar). No ladder.

**Breakpoints** (window)

| Role | Name here | Value | What changes |
|---|---|---|---|
| `bp.wide` | `@media (max-width: 1280px)` | 1280px | Activity column narrows to 320px; search narrows |
| `bp.stack` | `@media (max-width: 1100px)` | 1100px | Activity drops under the table; metrics two-up; range dates hidden |
| `bp.shell` | `@media (max-width: 860px)` | 860px | Sidebar becomes an off-canvas sheet with a scrim |
| `bp.phone` | `@media (max-width: 560px)` | 560px | Smaller figures; table drops two columns |

## Surfaces

| Level | Surface | Edge | Shadow | Layer |
|---|---|---|---|---|
| `elevation.flat` (sidebar) | `--sidebar` | `--border` right edge | — | — |
| `elevation.raised` (metric tiles, chart, table, activity cards; controls) | `--surface` | `--border` 1px | `--shadow` / `--shadow-sm` | — |
| `elevation.raised` (sticky top bar) | `color-mix(--bg 82%)` translucent, `blur(12px) saturate(180%)` | `--border` bottom | — | 20 |
| `elevation.floating` (range menu, chart tooltip) | `--surface` | `--border` | `--shadow-pop` | 30 / 5 |
| `elevation.overlay` (mobile nav sheet) | `--sidebar` | `--border` | `--shadow-pop` | 50, scrim 40 |

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

- 2026-11-04 — Page title "Overview" set as header-bar chrome (13px/500, last item of the breadcrumb), not a 22px heading: an app's page title labels where you are, and a page uses either a header-bar title or a content `type.title`, never both. (Law; type ladders, product.)
- 2026-11-04 — Headline figures at 24px/400, not 30px/600: a figure is data, larger than its label but never heavier, and product runs two weights. (Law; type law 3, law 5.)
- 2026-11-04 — Paths take `slashed-zero` but not `tabular-nums`: Inter's `tnum` widens the hyphen in `/docs/getting-started`. (Law; type numerals.)
- 2026-11-04 — Keep the existing theming: light and dark following the device through `prefers-color-scheme`, no toggle. (User decision; matches the `product` theme-control dial.)
- 2026-11-04 — Preset `product`. (User decision.)

## Open issues

**Type**
- Inter still loads from Google Fonts rather than self-hosted (now 2 weights, with a metric-matched fallback) — type law 12. Self-hosting needs the font files fetched into the project.

**Colour**
- `--text-3` is 3.55:1 on `--bg` and 3.81:1 on `--surface` in light — fails 4.5:1; used 18 times (timestamps, captions, axis labels, placeholders) — colour law 3.
- `--border` is the edge of the search field, range button and icon buttons at 1.14:1 against `--bg` (light), 1.49:1 (dark) — `border.control` needs 3:1 — colour law 2.
- Success chip `--green` on `--green-soft` 3.93:1 in light — colour law 6 pair fails.
- Current nav item coloured with the accent (`--accent-ink` on `--accent-soft`) — current location is uncoloured under `product` — colour law 7.
- Rising deltas green, three of four headline figures — colour points at what needs a person; growth is not an action item — colour law 7.
- Feed icons in four colours by event kind, and three person hues for avatars, none recorded as a family — colour law 7.
- Second highlight hue `#9b7bff` in the usage bar gradient; brand-mark and workspace gradients as literals — colour law 7, law 1.
- 20 colour literals outside tokens (`#fff`, gradients, avatar colours, `rgba(127,135,155,.1)` hover) — colour law 1.
- Neutral chroma OKLCH C 0.03–0.038 on the text greys; dial is ≤ 0.015 — colour dials.
- Dark `--bg` at OKLCH L 0.159; dial 0.17–0.21 — colour dials.
- `--prev` comparison line 1.85:1 on `--surface` in light — a mark the reader needs clears 3:1 — colour law 8.

**Layout**
- Boxes on the main screen: 4 stat tiles, 3 section cards (chart, activity, table) arranged as a mosaic, plus the sidebar usage box and the workspace button — 9 edged regions. Stat tiles and the chart/activity/table bento are layout law 3; depth law 2.
- The chart card holds two objects (the chart and its three summary figures); the table card holds a heading row and the table — depth law 2.
- 11 radius values with no ladder; `--radius-sm` declared and unused — layout law 5.
- z-index literals 5, 20, 30, 40, 50 with no ladder — layout law 7.
- `100vh` on `.app` and `.sidebar` — layout law 4.
- No skip link, no `id="main"` — layout law 12.
- Spacing strays: 18px, 14px, 11px, 7px, 3px — layout law 2.
- Hover styles not gated on `(hover: hover) and (pointer: fine)` — layout law 8.

**Depth**
- Translucent sticky top bar (`backdrop-filter`) — `product` allows no translucency on chrome — depth law 6; no `@supports` guard or reduced-transparency branch — depth law 15.
- Cards carry a shadow and a border at `elevation.flat`'s job (they scroll with the page) — depth law 2, law 3.

**Motion**
- Global reduced-motion kill switch — motion law 10.
- Three curves (`ease`, `ease-out`, default) and durations 120 / 140 / 150 / 220ms with no tokens — motion law 2, law 5.
- Range menu has no exit (hidden instantly) — motion law 7 (fine), but its entrance uses `scale` on a menu — check against the ladder.

**Patterns**
- "View all" and "All pages" link text; "Custom range…" option does nothing — patterns law 14.
- Notification button has no count or state for screen readers beyond the dot — patterns law 14.
- Activity feed: required by the brief; keep it, make it earn its place — patterns law 12.
