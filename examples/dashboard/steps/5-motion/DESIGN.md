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

**Ladder** — tokens in `styles.css` `:root`, in `rem` (product dial). Five sizes, no responsive steps; the largest (20px) is now only the headline figure; ceiling 20 ÷ 14 = 1.43.

| Role | Name here | Size | Leading | Tracking | Weight | Tier | Separates on |
|---|---|---|---|---|---|---|---|
| `type.title` | `h1`, in the header bar | 13px (`--fs-ui`) — the nav's size (layout pass, product page anatomy) | 1.4 | 0 | 500 | `--text` | weight, position after the breadcrumb |
| ↳ `stat` (project role: a headline figure) | `.metric-value` · `--fs-title` | 1.25rem (20px) | 1.3 | 0 | 400 | `--text` | weight (regular against the title's 500), tabular figures; never above its owning heading |
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

Neutrals derived in OKLCH at hue 265, chroma ≤ 0.012 (product dial ≤ 0.015), hex in `styles.css` with the OKLCH source in a comment. Every ratio below is from `scripts/contrast.mjs`; translucent washes were composited over the surface first.

**Text** — product: three tiers, tertiary ≥ 4.8:1 on its worst surface, adjacent tiers ≥ 1.4× apart.

| Role | Name here | Light | Ratio (worst: `--surface-2`) | Dark | Ratio (worst: `--surface-2`) |
|---|---|---|---|---|---|
| `text.primary` | `--text` | `#181b20` | 15.38:1 | `#e5e8ed` | 13.44:1 |
| `text.secondary` | `--text-2` | `#44484e` | 8.20:1 (1.88× step) | `#b0b4bc` | 7.94:1 (1.69×) |
| `text.tertiary` | `--text-3` | `#60636a` | 5.36:1 (1.53×); 5.14:1 on a hovered sidebar row | `#92959d` | 5.51:1 (1.44×); 5.18:1 on a hovered row |
| `text.link` | `--accent-ink` | `#4a48d8` — 6.54:1 on white | | `#a5a5ff` — 7.97:1 on `--surface` | |
| `text.on-accent` | `--on-accent` (proposed) | `#ffffff` | | `#0f1216` | |

Links sit 1.41:1 from the `--text-2` sentence around them, so in-text links (`.feed-body a`) carry an underline too.

**Surfaces**

| Role | Name here | Light | Dark |
|---|---|---|---|
| `surface.page` | `--bg` | `#ffffff` | `#0f1216` (L 0.18) |
| `surface.subtle` | `--sidebar` | `#f7f8fa` | `#14161b` |
| `surface.raised` | `--surface` | `#ffffff` (= page, with an edge) | `#16181d` (lifted) |
| `surface.hover` (on a raised surface) · header band | `--surface-2` | `#f0f2f4` | `#1c1f25` |
| `surface.hover` (layered wash) | `--hover` (proposed) | `rgba(24,27,32,.05)` | `rgba(229,232,237,.06)` |
| where the reader is · focused option | `--current` (proposed) | `rgba(24,27,32,.07)` | `rgba(229,232,237,.08)` |
| `scrim` | `--scrim` (proposed) | `rgba(10,14,22,.4)` | `rgba(0,0,0,.6)` |

**Lines and fills**

| Role | Name here | Light | Dark |
|---|---|---|---|
| `border.default` · `border.divider` | `--border` | `#dfe1e5` | `#2b2e34` |
| `border.hover` | `--border-strong` | `#c8cad0` | `#3f424a` |
| `border.control` | `--border-control` (proposed) | `#83868c` — 3.65:1 on white | `#6b6f76` — 3.52:1 on `--surface` |
| `mark` — previous-period series | `--prev` | `#8f9299` — 3.12:1 | `#6e7279` — 3.68:1 |
| `mark` — in-row share bars (decorative) | `--bar` (proposed) | `#c8cad0` | `#3f424a` |
| `fill.strong` — usage meter | `--text-2` | | |

**Signal**

| Role | Name here | Light | Dark |
|---|---|---|---|
| `accent` · `focus` | `--accent` | `#5b5bf0` — focus 4.35:1 on `--current` (worst) | `#8282ff` — 5.18:1 on `--surface-2` (worst) |
| `status.danger` fg / bg | `--red` / `--red-soft` | `#b24039` / `#fef0ee` — 5.70 page · 5.13 tint · 5.08 hover | `#dd766c` / `#311b18` — 6.15 · 5.29 · 5.41 |
| `status.warning` fg / bg | `--amber` / `--amber-soft` | `#8d5d1c` / `#fdf1e5` — 5.65 · 5.08 · 5.04 | `#c38c46` / `#2c1f0e` — 6.40 · 5.47 · 5.63 |
| `status.success` fg / bg | `--green` / `--green-soft` | `#25793f` / `#ebf8ec` — 5.40 · 4.93 · 4.82 | `#5da56e` / `#152619` — 6.32 · 5.35 · 5.56 |

`status.info` is left out: nothing on the page reports information that needs a colour, and an info blue would sit beside the indigo accent.

**What each hue does**
- **Accent (indigo)** — links, focus, the range menu's check, the unread-notification dot ("your turn"). Not the current nav row (neutral `--current` pill + weight 500 + `aria-current`), not the chart, not the share bars, not feed icons.
- **Danger** — only what needs a person: the conversion-rate drop, the bounce-rate alert in the feed, the 61.3% bounce cell (with an alert glyph and screen-reader text, so colour never carries it alone).
- **Success, warning** — defined and measured; nothing on this screen currently reports them. Rising figures are not news that needs anyone, so up-deltas are ink on a neutral chip; the arrow carries the direction.
- **Chart** — current period in ink (`--text`), previous period in `--prev`, dashed. Series are not the accent's job.

**Exceptions**
- `exception.person.*` — who did it. Avatars only (`.av-1`…`.av-3`), never names or rows. Hues 330 / 110 / 210, each ≥ 40° from the accent (277) and the status hues; re-picked per theme. Lettermarks: light 5.44 / 5.12 / 4.84:1, dark 7.17 / 7.32 / 7.40:1 on their tints.
- Brand mark — the logo's gradient lives inside its SVG as artwork, not in CSS.

## Layout

**Structure** — the product app shell: a 248px sidebar holding all navigation (workspace switcher as a row of the nav list at the nav's size), and a main panel. The panel is a page under its own **header bar** (52px, sticky): breadcrumb `Fieldnote / app.fieldnote.io /` then the `h1` at the nav's size (13/500), the page's actions at the end — the search field, the date range and notifications as quiet ghost buttons. No navigation lives in the bar. Content fills the panel, left-aligned at one `gutter`; the page sets no width of its own.

Below the bar, in reading order: the **stat strip** (four figures, each over its label, parted by vertical hairlines — no tiles), then a **content column** (Daily visitors, Top pages) beside the **activity rail**, parted by a vertical hairline. Sections are unboxed: a heading row, then the content on the page.

| Role | Name here | Value |
|---|---|---|
| nav region | `--sidebar-w` | 248px |
| rail (inspector-width region) | `--rail-w` (proposed) | 320px |
| `gutter` | `--gutter` (proposed) | 32px; 16px below `bp.shell` |
| `space.tight` | `--space-tight` (proposed) | 8px |
| `space.group` | `--space-group` (proposed) | 16px |
| `space.section` · `space.heading-above` | `--space-section` (proposed) | 32px |
| `space.heading-below` | `--space-heading-below` (proposed) | 12px — pair ratio 32 : 12 ≈ 2.7:1 (dial 2–3:1) |
| page top space | `.content` padding-top | 20px under the header bar (16px below `bp.shell`) |

**Radius ladder** (product dial, nestings derived inward):

| Role | Name here | Value | Nesting |
|---|---|---|---|
| `radius.small` | `--radius-sm` | 4px | chips; menu options (menu 10 − padding 6 = 4); `kbd` in the search (6 − 4 inset = 2, snapped to 4); workspace lettermark (row 6 − 4 inset) |
| `radius.control` | `--radius-control` (proposed) | 6px | search, ghost buttons, nav rows, tooltip, skip link |
| `radius.card` | `--radius` | 10px | the table frame, the usage card, the range menu |
| `radius.pill` | `99px` / `50%` | — | meter tracks, share bars, avatars, dots only |

**Lines** — `hairline.chrome` and `hairline.object` both `--hairline` (proposed) 0.5px, drawn as borders, 1px under `prefers-contrast: more`; dividers take `--divider` (proposed), a colour step lighter than `--border`, so none outranks its object's edge. `rule.emphasis` `--rule-emphasis` (proposed) 2px: focus rings, the selected option's check.

**One table style** — `.table-wrap` + `.pages`: a 0.5px frame at `radius.card`, a tinted 36px header row with `text.primary` labels (the sorted column at 500), 48px rows, 0.5px `--divider` between rows only, a hover wash.
**One group-label style** — `.nav-label`: 12px sentence case, `--text-3`, a hairline beneath.
**One chip shape** — 20px tall, 4px radius, 6px padding, 12px text (`.delta`, `.flag`, `.nav-count`, `.annotation-label`, `kbd` at 24px inside the field); only fill and text vary.

**Z ladder** — `--z-popover` 20 (range menu, chart tooltip) · `--z-nav` 50 (header bar) · `--z-overlay` 60 (mobile sidebar sheet, and its scrim one step earlier in the document) · `--z-skip-link` 100. Unused rungs left out.

**Breakpoints**, named for what changes:
- `bp.shell` — window ≤ 860px: the sidebar becomes a sheet over a scrim, the header bar wraps (toolbar on its own row), the gutter drops to 16px, the search input goes to 16px text.
- `bp.rail` — main panel ≤ 960px (container query): the activity rail drops under the column; the date range hides its dates.
- `bp.narrow` — main panel ≤ 560px: the strip runs two figures a row, chart stats stack, the table keeps path, views and bounce rate.

**Accessibility structure** — skip link to `#main`; the sidebar `aside` labelled "Primary", its `nav` "Sections"; `aria-current` on the current row; one `h1`, an `h2` per section; the figures are a `dl`.

## Surfaces

Product: content unboxed; four levels, each one bundle; opaque materials only; edges carry most of the separation.

| Level | What uses it | Surface | Edge | Shadow | Layer |
|---|---|---|---|---|---|
| `elevation.flat` | page, sections, stat strip, the table (its frame is the product table style, not a card), the usage card (one object), the search field | `--bg`; `--surface` for the usage card | `--border` / `--border-control` hairline, or none | none | page flow |
| `elevation.raised` | the sticky header bar | `--bg` | `--border` hairline beneath | `--shadow` — contact + 1 ambient | `--z-nav` |
| `elevation.floating` | the date-range menu; the chart tooltip (transient) | `--surface-float` (proposed; dark +0.04 L) | 0.5px `--border` ring at the head of the shadow (dark `--border-strong`); `1px transparent` border for forced colours, `--text` under `prefers-contrast: more` | `--shadow-pop` — ring + contact + 1 ambient; `--shadow-tip` (proposed) drops the contact layer | `--z-popover` |
| `elevation.overlay` | the sidebar as a sheet below `bp.shell` | `--surface-overlay` (proposed; dark +0.08 L) | ring, as floating | `--shadow-overlay` (proposed) — ring + contact + 1 longer ambient | `--z-overlay` |

Peak opacities (light / dark): raised 6% / 40%, floating 10% / 55%, overlay 16% / 60%. Dark surfaces lift: page L 0.18 → raised 0.21 → floating 0.25 → overlay 0.29. Text on them, dark: tertiary 5.39:1 on floating, 4.80:1 on overlay (it never sits on `--current` there).

**Scrim** — `--scrim`, 40% light / 60% dark, no blur; only behind the sheet. Closing the sheet — Escape, scrim or button — returns focus to the menu button.

**Materials** — opaque only. The header bar was translucent (`backdrop-filter: saturate(180%) blur(12px)` over an 82% tint); product chrome takes none, so it is now opaque, and no fallback block is needed.

## Motion

Product ladder, tokens in `styles.css` `:root`. Tiers strictly ascend: 80 < 100 < 150 < 200ms.

| Role | Name here | Value | Used for |
|---|---|---|---|
| `duration.instant` | `transition-duration: 0s` on `:active` | 0 | press feedback: the `--current` step, no scale |
| `duration.micro` | `--dur-micro` (proposed) | 80ms | table row wash (rows swept in bulk) |
| `duration.state` | `--dur-state` (proposed) | 100ms | nav rows, workspace row, ghost buttons: background and colour |
| `duration.popover` | `--dur-popover` (proposed) | 150ms | date menu entrance, its chevron, the chart tooltip and hover line fading in |
| `duration.overlay` | `--dur-overlay` (proposed) | 200ms | the nav sheet sliding in, its scrim fading in |
| `duration.exit` | `--dur-exit` (proposed) | 100ms | everything leaving: the menu, the sheet, the tooltip |
| `ease.standard` | `--ease-standard` (proposed) | `cubic-bezier(0.2, 0, 0, 1)` | everything that moves; no overshoot |
| `ease.colour` | `--ease-colour` (proposed) | `ease-out` | colour and opacity |
| `ease.exit` | `--ease-exit` (proposed) | `ease-in` | exits |

No springs (nothing is dragged or re-targets), no loops, no set pieces, no route transition, no sound. Hover is a wash, never travel. Every transition names its properties.

**Reduced motion** — per component, not a global off switch: the menu and the nav sheet fade instead of travelling (sheet at `--dur-state`); colour washes, the chevron and the short exits stay.

**Exits** — the date menu stays mounted while it plays `pop-out` (100ms, ease-in); `script.js` hides it afterwards, and re-opening mid-exit takes over at once. Focus and `aria-expanded` move immediately. The closed sheet is `visibility: hidden` after its exit, so it leaves the tab order.

## Patterns

**Nouns** — page, event, funnel, cohort, visitor, sign-up, workspace. **Period** — "prior 30 days" (metrics) vs "previous period" (chart legend, tooltip). **Shortcuts** — ⌘K focuses search; Escape closes the date menu and the mobile nav. **Destructive** — none on this screen.

## Decisions

- 2026-11-04 — Light `surface.page` moved from `#f6f7f9` to white, with cards equal to the page and edged (colour law 8: raised is never lighter than the page in light). Dark page raised to L 0.18 (product dial 0.17–0.21). (Agent recommendation.)
- 2026-11-04 — Tabular figures scoped to numeric roles instead of the product dial's global setting: Inter's `tnum` also spaces out hyphens in running text. (Agent recommendation, under the user's "take your recommendations".)
- 2026-11-04 — Theming stays as the page had it: light and dark from `prefers-color-scheme`, no toggle. (User decision.)

## Open issues

- Headline figures (20px) sit under a header-bar title at 13px: type law 3 says nothing outranks its owning heading, while the product page puts the title at the nav's size. Read here as: the bar is chrome, the strip is the page's overview. Needs a user decision.
- The sidebar doesn't collapse to an icon rail (product shell dial). Adding it is a feature, outside this pass.
- The stat strip's figures don't filter anything (product dial: figures filter the table below); here they don't count the table's rows, so there is nothing to filter.
- Inter still comes from Google Fonts (third-party; type law 12 wants it self-hosted). Weights are trimmed to the two in use and a metric-matched fallback is in place; self-hosting needs the font files added to the project.
