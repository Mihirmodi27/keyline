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

**Text** — checked against `--bg` (light, the worst surface text lands on) and `--surface-2` (dark, the lightest surface).

| Role | Name here | Light | Ratio | Dark | Ratio |
|---|---|---|---|---|---|
| `text.primary` | `--text` | `#101828` | 16.56:1 | `#f2f4f7` | 15.65:1 |
| `text.secondary` | `--text-2` | `#475467` | 7.17:1 | `#c2c7d0` | 10.16:1 |
| `text.tertiary` | `--text-3` | `#667085` | 4.64:1 | `#8e95a2` | 5.73:1 |
| `text.on-accent` | `#fff` (raw) | `#ffffff` on `--accent` | 5.69:1 | `#ffffff` on `--accent` | **3.37:1** |
| `text.inverse` | `--surface` on `--text` (toast, skip link) | `#ffffff` | 16.56:1+ | `#14171c` | 15.6:1≈ |
| `text.link` | `.link` → `--accent` | `#3e5bd8` | 5.31:1 | `#6b85f0` | 5.74:1 (on `--bg`) |

Ladder strictly descends in both themes.

**Surfaces**

| Role | Name here | Light | Dark |
|---|---|---|---|
| `surface.page` | `--bg` | `#f6f7f9` | `#0c0e12` |
| `surface.raised` | `--surface` | `#ffffff` | `#14171c` |
| `surface.subtle` / `surface.hover` | `--surface-2` (card foot, hovered rows, inputs in search) | `#f9fafb` | `#181b21` |
| `surface.inverse` | `--text` (toast, skip link) | `#101828` | `#f2f4f7` |

**Lines and fills**

| Role | Name here | Light | Dark | Against `--surface` |
|---|---|---|---|---|
| `border.default` / `border.divider` | `--border` | `#e4e7ec` | `#262a32` | 1.24:1 light |
| `border.control` | `--border-strong` | `#d0d5dd` | `#353a44` | **1.47:1** light · **1.57:1** dark |
| `border.hover` | `--text-3` (input hover) | `#667085` | `#8e95a2` | — |
| `fill.strong` | `--accent` (toggle on, primary button, meter) | `#3e5bd8` | `#6b85f0` | — |

**Signal**

| Role | Name here | Light | Dark | Note |
|---|---|---|---|---|
| `focus` | `--accent` outline 2px; inputs use `--ring` halo + accent border | `#3e5bd8` | `#6b85f0` | outline 5.69:1 on `--surface`; the `--ring` halo alone is 1.51:1 |
| `accent` · `accent.hover` | `--accent` · `--accent-hover` | `#3e5bd8` · `#3249b8` | `#6b85f0` · `#8299f3` | `--accent-soft` defined, never used |
| `status.success` fg · bg | `--ok` · `--ok-soft` | `#067647` · `#ecfdf3` (5.40:1) | `#47cd89` · 12% tint | |
| `status.danger` fg · bg · solid | `--danger-text` · `--danger-soft` · `#d92d20` (raw) | `#b42318` (6.57:1 on white) · `#fef3f2` · `#d92d20` | `#fda29b` · 10% tint · `#d92d20` | `--danger` `#c4320a` is a second danger fg used for icons and invalid borders |
| `status.warning` fg | `--warn` | `#dc6803` | `#dc6803` (not re-picked) | **3.34:1** on `--surface-2` light |
| `status.info` | — | — | — | absent |

**Exceptions** — brand logos (Google, Slack) keep their own colours: they identify a third party, the reader's question is "which service". The avatar gradient (`#7b8ff5 → #3e5bd8 → #2a3fa3`, raw) and the strength meter's four colours (`--danger`, `--warn`, `#eaaa08`, `--ok`) are unlisted chromatic spends.

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

- 2026-11-04 — Preset `product`. (User decision.)
- 2026-11-04 — Keep the existing theming as is: light and dark from `prefers-color-scheme`, no toggle. (User decision.)

## Open issues

- **Type law 12** — Inter comes from Google Fonts (two third-party origins) with `swap` and no metric-matched fallback; self-hosting needs the font files added to the project.
- **Colour law 3** — `--warn` `#dc6803` as text ("Unsaved changes") is 3.34:1 on `--surface-2` in light; white on dark `--accent` `#6b85f0` (primary buttons, Connect) is 3.37:1.
- **Colour law 2 / roles** — `--border-strong`, the edge of every input and select, is 1.47:1 on `--surface` (light) and 1.57:1 (dark); `border.control` needs 3:1.
- **Colour law 5** — inputs drop the outline on `:focus` for an accent border plus a `--ring` halo that is 1.51:1; focus survives only as a 1px border colour change.
- **Colour law 1** — 14 raw colour literals in `styles.css` (`#fff` ×6 as text-on-accent and toggle knob, `#d92d20`/`#b42318` danger solid, `#eaaa08`, avatar gradient).
- **Colour law 7** — success green spent on finished states: "Connected" badges, met password rules, the confirm field's valid border; the strength meter uses four hues; the avatar has a gradient. `--danger` and `--danger-text` are two danger foregrounds.
- **Colour law 8** — `--warn` and the danger solid `#d92d20` are not re-picked for dark.
- **Layout law 3 / depth law 2** — 6 boxes on the main screen, each holding several objects: 5 section cards (Profile: photo + 4 fields + footer; Notifications: a 4-row table; Password: 3 fields; Connected accounts: 3 rows; Danger zone) and the sidebar plan card. Each connection logo sits in its own bordered, shadowed tile.
- **Layout law 2** — `.content` gap is 24px between everything: title→first section equals section→section; inside a card, heading→body (≈20px) is close to the section gap, so space doesn't group.
- **Layout law 7** — z-index ladder undocumented in code (10, 20, 50, 100); the toast (50) sits below the dialog's top layer, so a toast raised while the dialog is open is hidden behind it.
- **Depth law 15** — translucent top bar and blurred scrim with no `@supports (backdrop-filter)` guard and no `prefers-reduced-transparency` branch.
- **Depth law 4** — three shadow recipes plus inline ones (toggle knob, avatar ring, primary inset highlight); dark `--shadow-md` equals `--shadow-sm`.
- **Motion law 5** — three curves (browser `ease`, two hand-typed béziers) and no tokens; colour transitions run on the default `ease`.
- **Motion law 2** — 150 / 180 / 200ms with no ladder: the toggle knob (200ms) runs longer than the dialog (180ms).
- **Motion law 10** — reduced motion is a global 0.01ms kill rather than a branch with a substitute.
- **Patterns law 3** — "Disconnect" on Google and GitHub acts at once with no confirmation and no undo; the sidebar's "Danger zone" item is red on hover and when active.
