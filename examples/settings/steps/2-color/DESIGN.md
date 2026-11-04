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

**Families** — `family.text`: Inter (Google Fonts `<link>`, `display=swap`, weights 400 and 500 only), fallback `system-ui` stack, declared as `--font`. No mono family. `font-synthesis: none` on `body`.

Type tokens in `styles.css` `:root` (proposed 2026-11-04, `rem` from a 16px root):

| Role | Name here | Size | Leading | Tracking | Weight | Tier |
|---|---|---|---|---|---|---|
| `type.title` | `--type-title` (`.page-head h1`) | 1.25rem (20px) | 1.3 | −0.02em | `--weight-strong` | `--text` |
| `type.heading` | `--type-heading` (`.card__head h2`, `.modal h2`) | 1rem (16px) | 1.35 | −0.02em | `--weight-strong` | `--text` |
| `type.body` | `--type-body` (`body`) | 0.875rem (14px) | 1.5 | 0 | `--weight-regular` | `--text` |
| ↳ row title (project role) | `.prefs__name`, `.connection__name`, `.danger-row__title`, `.photo__label`, `.sidenav__plan-name` | 14px | 1.5 | 0 | `--weight-strong` | `--text` — separated from body by weight |
| `type.supporting` | `.page-head p`, `.card__head p`, `.modal p` | 14px | 1.45 | 0 | `--weight-regular` | `--text-2` — separated by tier |
| `type.ui` | `--type-ui` (`.btn`, inputs, `.topnav a`, `.sidenav a`, `.reveal`, toast) | 0.8125rem (13px); inputs 1rem ≤760 | 1 in fixed-height boxes, 1.4 in nav rows | 0 | regular; strong on buttons, top nav and the active side-nav item | `--text-2` / `--text` |
| `type.label` | `--type-meta` (`.field label`) | 0.75rem (12px) | 1.3 | 0 | `--weight-strong` | `--text-2` |
| ↳ group label (project role) | `.sidenav__title`, `.prefs thead th` | 12px, sentence case | 1.3 | 0 | `--weight-regular` | `--text-3` — separated by tier and a hairline rule |
| ↳ badge | `.badge` | 12px | 1.3 | 0 | `--weight-regular` | status fg |
| `type.meta` | `--type-meta` (`.hint`, `.status`, `.msg`, `.rules`, `.footnote`, `.sidenav__plan-meta`, `.optional`, `kbd`) | 12px | 1.4 | 0 | `--weight-regular` | `--text-3` |
| `type.data` | `.num` (tabular), `.id` (tabular, slashed zero) — seat count, time-zone select, workspace ID digits | inherits | — | — | — | — |
| ↳ lettermark (artwork) | `.avatar` | 12 / 24 / 20px | — | +0.02em, capitals | `--weight-strong` | `#fff` on the avatar fill |
| ↳ brand | `.brand__name` | 14px | — | −0.02em | `--weight-strong` | `--text` |

Five sizes above the floor; ceiling 20 ÷ 14 = 1.43. **Weights** — `--weight-regular` 400 (body, hints, group labels, badges), `--weight-strong` 500 (headings, row titles, field labels, buttons, active nav item, `<strong>`). **Icons** — 18–20px boxes on a 20-unit grid draw ≈13px beside 13px text; stroke 1.5.

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

| Role | Name here | Value |
|---|---|---|
| `measure.app` | `.layout`, `.topbar__inner` | `max-width: 1280px`, columns `240px minmax(0, 760px)`, gap 56px |
| `measure.form` | `.layout` content column | 760px |
| ↳ password column | `.stack` | 420px |
| `gutter` | `.layout` / `.topbar__inner` padding | 32px (16px ≤760) |
| `space.tight` | `.field` gap | 6px |
| `space.group` | `.grid` / `.stack` gap | 20px |
| `space.section` | `.content` gap | 24px (the same between every card, and between the title and the first card) |

**Radius ladder**

| Role | Name here | Value |
|---|---|---|
| `radius.pill` | `99px`, `50%` | — |
| `radius.small` | `4px` (kbd), `6px` (topnav, reveal) | — |
| `radius.control` | `--radius-sm` | 8px |
| ↳ logo tile | `.connection__logo` | 10px (off ladder) |
| `radius.card` | `--radius` | 12px |
| `radius.container` | `.modal` | 16px |

**z-index ladder** — not documented in code; values as used.

| Role | Name here | Value |
|---|---|---|
| `z.raised` | `.sidenav` (sticky, ≤760) | 10 |
| `z.nav` | `.topbar` | 20 |
| `z.toast` | `.toast` | 50 |
| `z.skip-link` | `.skip` | 100 |

The dialog uses the browser's top layer (`showModal`), so it sits above every value here, including the toast.

**Breakpoints**

| Role | Name here | Value | What changes |
|---|---|---|---|
| `bp.compact-nav` | `max-width: 1080px` | 1080px | Top nav links and the plan card hide; sidebar narrows to 200px |
| `bp.single-column` | `max-width: 760px` | 760px | Sidebar becomes a horizontal sticky strip; form grid goes to one column; search hides |

## Surfaces

| Level | Surface | Edge | Shadow | Layer |
|---|---|---|---|---|
| `elevation.flat` | `--bg` | — | — | — |
| `elevation.raised` | `--surface` (`.card`) | `--border` | `--shadow-md` | — |
| ↳ small raised | inputs, `.btn--secondary`, `.connection__logo`, active `.sidenav a` | `--border` / `--border-strong` | `--shadow-sm` | — |
| `elevation.raised` (chrome) | `.topbar` — `--surface` at 85% | `--border` bottom | none | `z-index: 20` |
| `elevation.overlay` | `.modal` `--surface` | `--border` | `--shadow-lg` | top layer |
| `elevation.overlay` (toast) | `--text` | none | `--shadow-lg` | `z-index: 50` |

`material.translucent` — `.topbar`: `color-mix(--surface 85%)` with `saturate(180%) blur(12px)`; `.modal::backdrop` blur(4px). No `@supports` guard, no reduced-transparency branch. `scrim` — `rgba(16, 24, 40, 0.5)`.

## Motion

No motion tokens; durations and curves typed inline.

| Role | Name here | Value | Used for |
|---|---|---|---|
| `duration.instant` | `.btn:active` transform | 50ms | press nudge |
| `duration.state` | inline | 150ms | sidenav, inputs, buttons, password rules |
| `duration.popover` | inline | 200ms | toggle track and knob, strength bars, toast |
| `duration.overlay` | `.modal[open]` `pop` | 180ms | dialog entrance |
| `ease.standard` | — | browser `ease`, plus `cubic-bezier(.3,.7,.4,1)` (toggle knob) and `cubic-bezier(.2,.8,.3,1)` (dialog) | — |

**Named exemptions**

| Exemption | Values | Why |
|---|---|---|
| Loading spinner | 700ms linear, infinite | Indeterminate progress while a save runs |
| Toast dwell | 2600ms | Reading time, not motion |

Reduced motion: every transition and animation is cut to 0.01ms globally; smooth scroll off.

## Patterns

**Nouns** — task, project, workspace, account. **Destructive** — "Delete account": last section, typed phrase `delete my account` in a native `<dialog>`. "Disconnect" acts immediately with no confirmation. **Saving** — one save button per section, a live status line ("Unsaved changes", "Saved just now"), a toast on success.

## Decisions

- 2026-11-04 — Done is uncoloured on this page: a connected service and a met password rule are states the reader passes through, not news. Green is kept for "Saved". (Law; colour law 7, `product` dial.)
- 2026-11-04 — Dark primary buttons take dark text (`--on-accent` `#0e1115`): white on `#6b85f0` was 3.37:1. (Law; colour law 8.)
- 2026-11-04 — Preset `product`. (User decision.)
- 2026-11-04 — Keep the existing theming as is: light and dark from `prefers-color-scheme`, no toggle. (User decision.)

## Open issues

- **Type law 12** — Inter comes from Google Fonts (two third-party origins) with `swap` and no metric-matched fallback; self-hosting needs the font files added to the project.
- **Layout law 3 / depth law 2** — 6 boxes on the main screen, each holding several objects: 5 section cards (Profile: photo + 4 fields + footer; Notifications: a 4-row table; Password: 3 fields; Connected accounts: 3 rows; Danger zone) and the sidebar plan card. Each connection logo sits in its own bordered, shadowed tile.
- **Layout law 2** — `.content` gap is 24px between everything: title→first section equals section→section; inside a card, heading→body (≈20px) is close to the section gap, so space doesn't group.
- **Layout law 7** — z-index ladder undocumented in code (10, 20, 50, 100); the toast (50) sits below the dialog's top layer, so a toast raised while the dialog is open is hidden behind it.
- **Depth law 15** — translucent top bar and blurred scrim with no `@supports (backdrop-filter)` guard and no `prefers-reduced-transparency` branch.
- **Depth law 4** — three shadow recipes plus inline ones (toggle knob, avatar ring, primary inset highlight); dark `--shadow-md` equals `--shadow-sm`.
- **Motion law 5** — three curves (browser `ease`, two hand-typed béziers) and no tokens; colour transitions run on the default `ease`.
- **Motion law 2** — 150 / 180 / 200ms with no ladder: the toggle knob (200ms) runs longer than the dialog (180ms).
- **Motion law 10** — reduced motion is a global 0.01ms kill rather than a branch with a substitute.
- **Patterns law 3** — "Disconnect" on Google and GitHub acts at once with no confirmation and no undo.
