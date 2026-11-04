# Design system

> Keyline reads this before touching UI, and writes back to it when a decision changes. Edit it by hand whenever you like — it is the source of truth for intent, the code is the source of truth for values. Set up 2026-11-04.

## Profile

| | |
|---|---|
| Product | Northwind, a project-management app; this is its account settings page |
| Reader | Working — a returning user changing a few fields, scanning for the one setting they came for |
| Preset | `product` |
| Areas | None — one page |
| Stack | Static HTML, one stylesheet (`styles.css`), vanilla JS (`script.js`); no build, no framework |
| Tokens live in | `styles.css` `:root` (colour, shadow, radius, font) |
| Themes | `light`, `dark` — `@media (prefers-color-scheme: dark)` re-tints the same custom properties; `color-scheme` declared per theme |
| Motion | CSS transitions and keyframes only; JS toggles classes |

Evidence for `product`: a form-and-toggle settings screen inside an app shell (top bar with Projects / My tasks / Inbox / Reports, a section sidebar), 4 forms with save buttons, a preferences table, connection rows and a destructive action. No prose, no marketing. The codebase uses four weights and two uppercase labels, which the preset doesn't change — they are open issues.

## Type

**Families** — `family.text`: Inter (Google Fonts `<link>`, `display=swap`, weights 400, 500 and 600 only), fallback `system-ui` stack, declared as `--font`. No mono family. `font-synthesis: none` on `body`.

Type tokens in `styles.css` `:root` (proposed 2026-11-04, `rem` from a 16px root):

| Role | Name here | Size | Leading | Tracking | Weight | Tier |
|---|---|---|---|---|---|---|
| `type.title` | `--type-title` (`.page-head h1`) | 1.25rem (20px) | 1.3 | −0.02em | `--weight-heading` | `--text` |
| `type.heading` | `--type-heading` (`.card__head h2`, `.modal h2`) | 1rem (16px) | 1.35 | −0.02em | `--weight-heading` | `--text` |
| `type.body` | `--type-body` (`body`) | 0.875rem (14px) | 1.5 | 0 | `--weight-regular` | `--text` |
| ↳ row title (project role) | `.prefs__name`, `.connection__name`, `.danger-row__title`, `.photo__label`, `.sidenav__plan-name` | 14px | 1.5 | 0 | `--weight-strong` | `--text` — separated from body by weight |
| `type.supporting` | `.page-head p`, `.card__head p`, `.modal p` | 14px | 1.45 | 0 | `--weight-regular` | `--text-2` — separated by tier |
| `type.ui` | `--type-ui` (`.btn`, inputs, `.topnav a`, `.sidenav a`, `.reveal`, toast) | 0.8125rem (13px); inputs 1rem ≤760 | 1 in fixed-height boxes, 1.4 in nav rows | 0 | regular; strong on buttons, top nav and the active side-nav item | `--text-2` / `--text` |
| `type.label` | `--type-meta` (`.field label`) | 0.75rem (12px) | 1.3 | 0 | `--weight-strong` | `--text-2` |
| ↳ group label (project role) | `.sidenav__title` | 12px, sentence case | 1.3 | 0 | `--weight-regular` | `--text-3` — separated by tier and a hairline rule |
| ↳ table header label (project role) | `.prefs thead th` | 12px, sentence case | 1.3 | 0 | `--weight-strong` | `--text` on the `--surface-2` header row (the product table) |
| ↳ badge | `.badge` | 12px | 1.3 | 0 | `--weight-regular` | status fg |
| `type.meta` | `--type-meta` (`.hint`, `.status`, `.msg`, `.rules`, `.footnote`, `.sidenav__plan-meta`, `.optional`, `kbd`) | 12px | 1.4 | 0 | `--weight-regular` | `--text-3` |
| `type.data` | `.num` (tabular), `.id` (tabular, slashed zero) — seat count, time-zone select, workspace ID digits | inherits | — | — | — | — |
| ↳ lettermark (artwork) | `.avatar` | 12 / 24 / 20px | — | +0.02em, capitals | `--weight-strong` | `#fff` on the avatar fill |
| ↳ brand | `.brand__name` | 14px | — | −0.02em | `--weight-strong` | `--text` |

Five sizes above the floor; ceiling 20 ÷ 14 = 1.43. **Weights** — `--weight-regular` 400 (body, hints, group labels, badges), `--weight-strong` 500 (row titles, field labels, table header labels, buttons, active nav item, `<strong>`), `--weight-heading` 600 (proposed; `h1` and `h2` only). **Icons** — 18–20px boxes on a 20-unit grid draw ≈13px beside 13px text; stroke 1.5.

## Colour

Neutrals re-picked 2026-11-04 on hue 264 at chroma ≤ 0.014 (the `product` dial); the old greys ran at 0.035–0.04 and read blue.

**Text** — light checked on `--bg` (its darkest surface for text) and `--surface-3`; dark on `--surface-2` and `--surface-3` (lightest). Ratios from `contrast.mjs`.

| Role | Name here | Light | Ratio (`--bg` · `--surface-3`) | Dark | Ratio (`--surface-2` · `--surface-3`) |
|---|---|---|---|---|---|
| `text.primary` | `--text` | `#13161d` | 16.89 · 15.88 | `#eff0f3` | 14.78 · 13.49 |
| `text.secondary` | `--text-2` | `#474b53` | 8.17 · 7.68 | `#b8bcc2` | 8.83 · 8.06 |
| `text.tertiary` | `--text-3` | `#62666f` | 5.37 · 5.05 | `#93979d` | 5.74 · 5.24 |
| `text.on-accent` | `--on-accent` (proposed) | `#ffffff` on `--accent` | 5.69 | `#0e1115` on `--accent` | 5.62 |
| `text.inverse` | `--surface` on `--text` (toast, skip link) | `#ffffff` | 16.9+ | `#16191d` | 14+ |
| `text.link` | `.link` → `--accent` | `#3e5bd8` | 5.44 on `--surface-2` | `#6b85f0` | 5.00 on `--surface-2` |

Steps: light 2.07× · 1.52×, dark 1.67× · 1.54× (product minimum 1.4×); tertiary clears the 4.8:1 target on every surface.

**Surfaces**

| Role | Name here | Light | Dark |
|---|---|---|---|
| `surface.page` | `--bg` | `#f6f7f9` | `#0e1115` (OKLCH L 0.175) |
| `surface.raised` | `--surface` | `#ffffff` | `#16191d` |
| `surface.subtle` / `surface.hover` | `--surface-2` | `#f9fafb` | `#1b1d23` |
| `surface.pressed` / hover on subtle | `--surface-3` (proposed) | `#eff0f3` | `#22252a` |
| `surface.inverse` | `--text` | `#13161d` | `#eff0f3` |

**Lines and fills**

| Role | Name here | Light | Dark | Measured |
|---|---|---|---|---|
| `border.default` / `border.divider` | `--border` | `#e4e6ea` | `#282b31` | visibility only |
| `border.control` | `--border-strong` | `#8f929a` | `#656970` | 3.11:1 · 3.20:1 on `--surface` |
| `border.hover` | `--border-hover` (proposed) | `#5a5e65` | `#8e929a` | — |
| `fill.strong` | `--accent` (switch on, primary button, meter) | `#3e5bd8` | `#6b85f0` | — |
| switch knob | `--thumb` (proposed) | `#ffffff` | `#ffffff` | — |

**Signal**

| Role | Name here | Light | Dark | Note |
|---|---|---|---|---|
| `focus` | `--accent`, `:focus-visible` outline 2px, offset 2px — inputs and search included | `#3e5bd8` | `#6b85f0` | light 4.99–5.69:1, dark 4.57–5.62:1 across `--bg`…`--surface-3` |
| `accent` · `accent.hover` | `--accent` · `--accent-hover` | `#3e5bd8` · `#3249b8` | `#6b85f0` · `#8299f3` | primary action, switches on, links, focus, unread dot |
| `status.success` fg · bg | `--ok` · `--ok-soft` | `#067647` (5.45 on `--surface-2`) · `#ecfdf3` | `#47cd89` (8.31) · 12% | the "saved" check only |
| `status.danger` fg · bg · solid | `--danger-text` · `--danger-soft` · `--danger` | `#b42318` (6.29) · `#fef3f2` · `#d92d20` | `#fda29b` (8.68) · 10% · `#d92d20` | solid text `--on-danger` 4.83:1; hover `--danger-hover` |
| `status.warning` fg | `--warn` | `#915c08` (5.38) | `#db9d4f` (7.18) | the "unsaved" dot, weak-password bars |
| `status.info` | — | — | — | no info message on this page |

**Exceptions** — `exception.person` (`--person` / `--on-person`): the avatar fill, answering *who*; a muted teal at h 200, ≥ 50° from success and accent; initials 5.06:1 light, 7.35:1 dark. Third-party marks (Google, Slack, GitHub) keep their own colours.

**Rules recorded** — status lines and field messages keep their words in `--text-2`; only the glyph takes the status colour. Connection state is a filled dot vs a ring, uncoloured. Met password rules are an ink tick on a neutral circle (`--tick`, per theme). The current nav item is ink, not accent.

## Layout

Tokens in `styles.css` `:root`, proposed 2026-11-04 in the project's short-name style.

| Role | Name here | Value |
|---|---|---|
| `measure.app` | `.layout`, `.topbar__inner` | `max-width: 1280px`; rail 240px + content, gap 56px, centred |
| `measure.form` | `--measure-form` | 760px — the content column |
| ↳ password column | `.stack` | 420px |
| `measure.rail` | `.sidenav` column | 240px (200px ≤ 1080); sticky at 84px, capped `100dvh − 108px`, scrolls inside |
| `gutter` | `--gutter` | 32px; 16px ≤ 760 |
| `space.tight` | `--space-tight` | 6px — label → input, heading → description |
| `space.group` | `--space-group` | 16px — between fields, photo → fields, content → actions |
| `space.heading-below` | `--space-heading-below` | 12px — a section's heading block → its content |
| `space.section` · `space.heading-above` | `--space-section` | 32px — between sections; pair 32 : 12 ≈ 2.7 : 1 |
| page top | `.layout` padding-top | 24px under the top bar |

**Sections** — stacked on the page, each opened by its `h2`; no panel round a section (`.card` keeps its name, draws no box). Save buttons sit at the end of their section. **Table** — the notifications table is the product table: one hairline frame at `--radius`, a `--surface-2` header row, hairlines between rows only. **Lists** — connection rows unframed, parted by hairlines.

**Radius ladder**

| Role | Name here | Value |
|---|---|---|
| `radius.pill` | `99px`, `50%` | switches, badges, meters, avatars |
| `radius.small` | `--radius-xs` (proposed) | 4px — `kbd`, the Show button inside a field |
| `radius.control` | `--radius-sm` | 6px (was 8px) — inputs, buttons, nav items |
| `radius.card` | `--radius` | 8px (was 12px) — table frame, plan card, logo tiles, toast |
| `radius.container` | `--radius-lg` (proposed) | 12px (was 16px) — the dialog |

**Lines** — `hairline.chrome` and `hairline.object`: `--hairline` 0.5px (proposed) on dividers, the table frame, the top bar's edge, the plan card; controls (inputs, buttons, switches) keep a 1px edge at 3:1. `rule.emphasis`: the 2px focus outline.

**z-index ladder**

| Role | Name here | Value |
|---|---|---|
| `z.raised` | `--z-raised` | 10 |
| `z.nav` | `--z-nav` | 50 |
| `z.toast` | `--z-toast` | 70 |
| `z.skip-link` | `--z-skip-link` | 100 |

The dialog is in the browser's top layer, above every rung.

**Breakpoints**

| Role | Name here | Value | What changes |
|---|---|---|---|
| `bp.compact-nav` | `@media (max-width: 1080px)` | 1080px | Top-bar links and the plan card go; the rail narrows to 200px |
| `bp.single-column` | `@media (max-width: 760px)` | 760px | The rail becomes a sticky horizontal strip; gutter 16px; search goes |
| `bp.form-columns` | `@container (max-width: 560px)` on `.content` | 560px | The profile field grid goes to one column |

Every hover style is gated on `(hover: hover) and (pointer: fine)`.

## Surfaces

Four levels, each one bundle; shadows from one light, one definition per level per theme (`--shadow-sm`, `--shadow-md`, `--shadow-lg`). Floating and overlay draw their edge as a 0.5px `--border` ring at the head of the shadow, with a transparent 1px border for forced colours and a real one under `prefers-contrast: more`.

| Level | Surface | Edge | Shadow (light · dark peak) | Layer | Used by |
|---|---|---|---|---|---|
| `elevation.flat` | `--bg`; `--surface` for objects | `--hairline` `--border` | none | — | sections, the notifications table, connection rows, the plan card, inputs, buttons |
| `elevation.raised` | `--surface` | `--hairline` `--border` bottom | `--shadow-sm` 6% · 40% | `--z-nav` / `--z-raised` | the sticky top bar; the sticky section strip on phones |
| ↳ switch knob | `--thumb` | — | `--shadow-thumb` | — | `.toggle__track::after` |
| `elevation.floating` | `--text` (`surface.inverse`) | ring | `--shadow-md` 10% · 55% | `--z-toast` | the toast |
| `elevation.overlay` | `--surface-overlay` (proposed): `#ffffff` · `#21242a` | ring | `--shadow-lg` 16% · 60% | top layer | the delete dialog |

`scrim` — `--scrim`: `rgb(19 22 29 / 0.40)` light, `rgb(0 0 0 / 0.60)` dark, no blur. Dark lift (OKLCH L): page 0.175 → raised 0.21 → overlay 0.26. `material.translucent` — none: the top bar was translucent and is now opaque (the `product` dial). Buttons are flat.

## Motion

Tokens in `styles.css` `:root`, proposed 2026-11-04 at the `product` dials. CSS transitions only; one small script places the section marker.

| Role | Name here | Value | Used for |
|---|---|---|---|
| `duration.instant` | `.btn:active` | 0ms | the pressed-surface step |
| `duration.micro` | `--duration-micro` | 80ms | a table row's hover wash |
| `duration.state` | `--duration-state` | 100ms | colour on controls and nav items, input edges, a switch's track and knob, a rule's tick, strength bars |
| `duration.popover` | `--duration-popover` | 150ms | the toast arriving; the section marker travelling |
| `duration.overlay` | `--duration-overlay` | 200ms | the dialog and its scrim arriving |
| `duration.exit` | `--duration-exit` | 100ms | the toast leaving |
| ↳ overlay exit | `--duration-exit-overlay` | 130ms | the dialog and its scrim leaving |
| `ease.standard` | `--ease` | `cubic-bezier(0.2, 0, 0, 1)` | everything that moves |
| `ease.colour` | `--ease-colour` | `ease-out` | colour and opacity |
| `ease.exit` | `--ease-exit` | `ease-in` | the toast and dialog leaving |

**Named exemptions**

| Exemption | Values | Why |
|---|---|---|
| Loading spinner | 700ms linear, infinite | A progress indicator: it loops only while a save or connection runs (motion law 1) |
| Toast dwell | 2600ms | Reading time before the toast leaves, not motion |
| Simulated save | 800ms | The demo's stand-in for a network round trip, not motion |
| Simulated connect | 700ms | The demo's stand-in for a network round trip, not motion |

**Springs** — none. The section marker re-targets, which `product` gives `spring.snappy` (0 bounce, 0.25s); in CSS it is a `--ease` tween at `--duration-popover`, which re-targets from where it is but restarts its velocity. **Press** — a pressed-surface step at once, no travel. **Reduced motion** — the dialog and toast fade without travel or scale; the marker keeps a flat 100ms tween; smooth scrolling is off; colour changes and the spinner stay.

## Patterns

**Nouns** — task, project, workspace, account. **Destructive** — "Delete account": last section, typed phrase `delete my account` in a native `<dialog>`. "Disconnect" acts immediately with no confirmation. **Saving** — one save button per section, a live status line ("Unsaved changes", "Saved just now"), a toast on success.

## Decisions

- 2026-11-04 — The current section is one marker that travels down the rail, not a fill on each link: identity persists, so the element travels (motion law 8). Without JavaScript and on the phone strip, the link keeps its own fill. (Law.)
- 2026-11-04 — The top bar is opaque, not frosted: `product` allows no translucency on chrome, and the blur had no `@supports` or reduced-transparency fallback. (Law; depth law 6, `product` dial.)
- 2026-11-04 — The delete dialog is the system dialog: its red warning-icon circle is gone; the danger sits on the Delete account button. (Law; depth law 1.)
- 2026-11-04 — A third weight, 600, for `h1` and `h2` only (`--weight-heading`): with the sections unboxed, a 16/500 heading sat 2px above the 14/500 row titles (Mentions, Google, Delete account) and the sections ran together. 500 is spent lifting row titles, and nothing in a row goes above it. (Agent recommendation under the user's standing go-ahead; the type guide's recorded-third dial.)
- 2026-11-04 — Sections unboxed: the five setting groups sit on the page under their headings, the save row at the end of each. (Law; layout law 3, depth law 2.)
- 2026-11-04 — Controls keep a 1px edge while dividers and frames go to 0.5px: an input's edge must be seen at 3:1, and halving it on a 2× screen halves what is seen. (Law; colour roles `border.control`.)
- 2026-11-04 — Done is uncoloured on this page: a connected service and a met password rule are states the reader passes through, not news. Green is kept for "Saved". (Law; colour law 7, `product` dial.)
- 2026-11-04 — Dark primary buttons take dark text (`--on-accent` `#0e1115`): white on `#6b85f0` was 3.37:1. (Law; colour law 8.)
- 2026-11-04 — Preset `product`. (User decision.)
- 2026-11-04 — Keep the existing theming as is: light and dark from `prefers-color-scheme`, no toggle. (User decision.)

## Open issues

- **Type law 12** — Inter comes from Google Fonts (two third-party origins) with `swap` and no metric-matched fallback; self-hosting needs the font files added to the project.
- **Layout law 7** — the toast sits on `--z-toast` (70) but the dialog is in the top layer, so a toast raised while the dialog is open would sit under it; none does today (the delete toast fires after close). Moving the toast into the top layer (`popover`) would settle it.
- **Patterns law 3** — "Disconnect" on Google and GitHub acts at once with no confirmation and no undo.
