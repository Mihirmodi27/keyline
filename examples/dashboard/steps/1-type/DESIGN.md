# Design system

> Keyline reads this before touching UI, and writes back to it when a decision changes. Edit it by hand whenever you like — it is the source of truth for intent, the code is the source of truth for values. Set up 2026-11-04.

## Profile

| | |
|---|---|
| Product | Lumen — product analytics for small SaaS teams; this is the workspace's main dashboard (Overview) |
| Reader | Working: a team member checking the same screen most days, scanning figures and comparing against the previous period |
| Preset | `product` |
| Areas | none — one page |
| Stack | Static HTML, one stylesheet (`styles.css`), one script (`script.js`); no framework, no build |
| Tokens live in | `styles.css` `:root` custom properties (light), redefined under `@media (prefers-color-scheme: dark)` |
| Themes | `light`, `dark` — by the `prefers-color-scheme` media query only; `<meta name="color-scheme" content="light dark">`. No toggle; kept as is (user decision) |
| Motion | CSS transitions and one keyframe; JS only for the chart hover, the date menu and the mobile nav |

Evidence for `product`: an app shell (sidebar + content), a 30-day chart with a previous-period comparison, a sortable-looking table of five numeric columns, a live activity feed, 14px body with 11.5–13px chrome, `tabular-nums` already on `.num`. Nothing on the page is read at length.

## Type

**Families** — `family.text`: Inter via Google Fonts (`--font`), weights 400 and 500 only, `display=swap`, with a metric-matched `"Inter Fallback"` over local Arial (size-adjust 107.12%, ascent 90.44%, descent 22.52%, line-gap 0 — next/font's published values for Inter). No mono: paths and hostnames stay in the text face with a slashed zero (product dial: mono only if code is the product). Body keeps `font-feature-settings: "cv11", "ss01"`; `font-synthesis: none`.

**Ladder** — tokens in `styles.css` `:root`, in `rem` (product dial). Five sizes, no responsive steps; ceiling 20 ÷ 14 = 1.43.

| Role | Name here | Size | Leading | Tracking | Weight | Tier | Separates on |
|---|---|---|---|---|---|---|---|
| `type.title` | `h1` · `--fs-title` | 1.25rem (20px) | 1.3 | −0.02em | 500 | `--text` | size |
| ↳ `stat` (project role: a headline figure) | `.metric-value` · `--fs-title` | 20px | 1.3 | 0 | 400 | `--text` | weight (regular against the title's 500), tabular figures; never above its owning heading |
| `type.heading` | `.card-title`, `.brand-name` · `--fs-heading` | 1rem (16px) | 1.35 | −0.02em | 500 | `--text` | size |
| ↳ section figure (project role under `stat`) | `.chart-stats dd` · `--fs-heading` | 16px | 1.35 | 0 | 400 | `--text` | weight, tabular figures |
| `type.body` | `body` · `--fs-body` | 0.875rem (14px) | 1.5 | 0 | 400 | `--text` | the baseline |
| `type.supporting` | `.card-sub`, `.feed-body p` | 14px | 1.45 | 0 | 400 | `--text-2` | tier |
| `type.ui` | `.nav-link`, `.range-btn`, `.search input`, `.range-menu li`, `.link`, `.ws-name`, `.me-name`, `.usage-link`, `.tooltip` · `--fs-ui` | 0.8125rem (13px) | 1 in fixed-height controls; 1.4 in rows | 0 | 400; 500 when current/selected | `--text-2` | size, curve |
| `type.data` | `.pages` | 13px | 1.5 | 0 | 400; the row's path 500 | `--text` (views), `--text-2` | tabular figures |
| `type.label` | `.metric-label`, `.chart-stats dt`, `.legend`, `.pages thead th` · `--fs-meta` | 0.75rem (12px) | 1.3 | 0 | 400 | `--text-2` (`--text-3` on column headers) | tier |
| ↳ group label (project role) | `.nav-label` | 12px | 1.3 | 0, sentence case | 400 | `--text-3` | tier (a rule beneath is the layout pass's) |
| `type.meta` | `time`, `.crumb`, `.ws-plan`, `.me-mail`, `.metric-foot`, axis labels, `kbd`, `.nav-count`, `.annotation-label` | 12px | 1 on axes; 1.4 elsewhere | 0 | 400 | `--text-3` | tier |

**Weights** — `--fw-regular` 400: everything at rest, figures included. `--fw-strong` 500: headings, the current nav row and selected menu row, a table row's path, names in the feed (`<strong>`), deltas, the date-range label. No third weight.

**Numerals** — tabular on `.num`, deltas, counts, axis labels, tooltip values, numeric table cells and `time`. Scoped rather than global: Inter's `tnum` also widens hyphens in words (`Sign-ups`, `/docs/getting-started`).

**Icons** — 16px box (glyph ≈ 13.5px on the 20-unit grid) beside 13px UI text, 8px gap; stroke 1.6.

## Colour

**Text** — measured with `scripts/contrast.mjs` against each theme's surfaces; the worst is shown.

| Role | Name here | Light | Ratio (worst: `--bg`) | Dark | Ratio (worst: `--surface-2`) |
|---|---|---|---|---|---|
| `text.primary` | `--text` | `#0f1729` | 16.67:1 | `#eef0f5` | 15.13:1 |
| `text.secondary` | `--text-2` | `#4a5468` | 7.10:1 | `#a9b0c0` | 7.93:1 |
| `text.tertiary` | `--text-3` | `#7a8396` | **3.55:1** ✗ | `#7c8496` | 4.60:1 |
| `text.link` | `--accent-ink` | `#4a48d8` | 6.54:1 on white | `#a5a5ff` | 8.20:1 on `--surface` |
| `text.on-accent` | `#fff` (raw) | — | — | — | — |

**Surfaces**

| Role | Name here | Light | Dark |
|---|---|---|---|
| `surface.page` | `--bg` | `#f6f7f9` | `#0b0d12` |
| `surface.subtle` | `--sidebar` | `#fbfbfc` | `#0e1016` |
| `surface.raised` | `--surface` | `#ffffff` | `#12151c` |
| `surface.hover` | `--surface-2` (table rows, menu rows); `rgba(127,135,155,.1)` raw (nav) | `#f9fafb` | `#171b23` |
| `surface.selected` | `--accent-soft` | `#eeeefe` | `rgba(130,130,255,.14)` |
| `surface.floating` | `--surface` | `#ffffff` | `#12151c` |

**Lines and fills**

| Role | Name here | Light | Dark |
|---|---|---|---|
| `border.default` · `border.divider` | `--border` | `#e6e8ec` | `#232835` |
| `border.control` | `--border` (shared) | `#e6e8ec` — 1.14:1 on `--bg` ✗ | `#232835` — 1.32:1 ✗ |
| `border.hover` | `--border-strong` | `#d6d9df` | `#2f3545` |
| `mark` (previous-period line) | `--prev` | `#b8bfcc` | `#4a5263` |

**Signal**

| Role | Name here | Light | Dark |
|---|---|---|---|
| `accent` · `focus` | `--accent` | `#5b5bf0` — focus 4.36:1 on `--accent-soft` (worst) | `#8282ff` — 5.41:1 on `--surface-2` |
| `status.success.fg` / `.bg` | `--green` / `--green-soft` | `#138a52` / `#e6f6ee` — **3.93:1** ✗ | `#3ccf8e` / 12% — 7.42:1 |
| `status.danger.fg` / `.bg` | `--red` / `--red-soft` | `#c8372d` / `#fdecea` — 4.54:1 | `#ff7a6e` / 12% — 6.07:1 |
| `status.warning.fg` | `--amber` | `#b26b00` (declared, unused) | `#f2b24c` |

**Exceptions** (as found) — brand-mark gradient `#7b7bff → #4a48d8`; workspace avatar gradient `#f59e0b → #e8590c`; usage-bar gradient `--accent → #9b7bff`; three avatar tints (`.av-violet`, `.av-amber`, `.av-teal`) with their own dark values. None is named for a job.

## Layout

| Role | Name here | Value |
|---|---|---|
| `measure.app` | `.content` | max 1440px, padding 24px 32px 48px |
| sidebar width | `--sidebar-w` | 248px |
| `gutter` | `.content` padding at < 860px | 16px |
| `space.group` | `.content` gap, `.grid` gap | 20px (16px < 860px) |
| `space.tight` | `.metrics` gap | 16px |

**Radius ladder (as found)** — `--radius` 12px (cards), 10px (workspace, usage, menu), 9px (controls), 8px (nav rows, `--radius-sm` unused), 7px, 6px, 5px, 99px pills, 50% avatars. Eleven values.

**Z-index (as found)** — tooltip 5, topbar 20, range menu 30, scrim 40, sidebar (mobile) 50. Raw numbers, no tokens.

**Breakpoints (as found)** — 1280px (narrower rail), 1100px (rail stacks under, metrics 2-up), 860px (sidebar becomes a drawer), 560px (phone).

## Surfaces

| Level | Surface | Edge | Shadow | Layer |
|---|---|---|---|---|
| `elevation.flat` | `--bg` | — | — | — |
| `elevation.raised` | `--surface` (cards, metrics, controls) | `--border` | `--shadow` / `--shadow-sm` (dark: none / 2% ring) | — |
| `elevation.floating` | `--surface` (range menu, tooltip) | `--border` | `--shadow-pop` | 30 / 5 |
| `elevation.overlay` | `--sidebar` (mobile drawer) | `--border` | `--shadow-pop` | 50 |
| `scrim` | `.scrim` | — | `rgba(10,14,22,.4)` | 40 |
| `material.translucent` (`.chrome`) | `.topbar` — `--bg` at 82% | `--border` | `saturate(180%) blur(12px)` | 20 |

## Motion

| Role | Name here | Value | Used for |
|---|---|---|---|
| `duration.micro` | inline | 0.12s | tooltip and hover-line fade, table row hover |
| `duration.state` | inline | 0.15s | nav, control borders, chevron rotate |
| `duration.popover` | inline | 0.14s | range menu `pop` keyframe |
| `duration.overlay` | inline | 0.22s | mobile sidebar slide |
| `ease.standard` | — | `ease-out`, `ease`, browser default | mixed |

Reduced motion: a global `transition: none; animation: none` under `prefers-reduced-motion: reduce`.

## Patterns

**Nouns** — page, event, funnel, cohort, visitor, sign-up, workspace. **Period** — "prior 30 days" (metrics) vs "previous period" (chart legend, tooltip). **Shortcuts** — ⌘K focuses search; Escape closes the date menu and the mobile nav. **Destructive** — none on this screen.

## Decisions

- 2026-11-04 — Tabular figures scoped to numeric roles instead of the product dial's global setting: Inter's `tnum` also spaces out hyphens in running text. (Agent recommendation, under the user's "take your recommendations".)
- 2026-11-04 — Theming stays as the page had it: light and dark from `prefers-color-scheme`, no toggle. (User decision.)

## Open issues

- `text.tertiary` (`--text-3`) is 3.55:1 on `--bg`, 3.81:1 on `--surface` in light — fails 4.5:1. 18 uses: captions, timestamps, axis labels, column headers, placeholders.
- `border.control` shares `--border`: 1.14:1 light, 1.32:1 dark on the page — search field and controls don't reach 3:1.
- `status.success` pair `--green` on `--green-soft` is 3.93:1 in light (`--green` alone on white 4.39:1) — the up-deltas fail 4.5:1.
- Inter still comes from Google Fonts (third-party; type law 12 wants it self-hosted). Weights are trimmed to the two in use and a metric-matched fallback is in place; self-hosting needs the font files added to the project.
- Boxes as the default: 7 boxes in the content area (4 stat tiles, chart card, activity card, table card) plus 2 in the sidebar (workspace, usage). The activity card holds 7 objects, the table card 7 rows, the chart card a chart and 3 stats; chart / table / activity sit in a bento grid of unlike sections. A row of four stat tiles. (depth law 2, layout law 3)
- Second highlight hue: `--green` / `--red` deltas on every metric, a green and blue feed icon on routine events — colour on what isn't asking for a person; the `.fi-blue` icon uses the accent for a "digest sent" event.
- Chromatic gradients typed raw (brand mark, workspace avatar, usage bar `#9b7bff`), avatar tints raw — 32 raw colour literals outside the tokens.
- Sticky topbar is translucent (`backdrop-filter`) with no `@supports` guard and no reduced-transparency branch.
- Eleven radii, none nesting by inner = outer − padding; z-index typed raw (5, 20, 30, 40, 50).
- `100vh` on the shell and sidebar; no skip link.
- Durations 0.12 / 0.14 / 0.15 / 0.22s typed inline; easing `ease`, `ease-out` and default mixed; no colour curve.
- Product preset has no top bar; here a sticky header holds the page title, search, date range and notifications (the brief asks for this header). No navigation lives in it.
