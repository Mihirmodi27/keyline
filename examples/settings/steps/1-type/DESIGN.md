# Design system

> Keyline reads this before touching UI, and writes back to it when a decision changes. Edit it by hand whenever you like — it is the source of truth for intent, the code is the source of truth for values. Set up 2026-11-04.

## Profile

| | |
|---|---|
| Product | Northwind, a project-management app; this is its account settings page |
| Reader | Working — a fluent user changing a few settings and leaving |
| Preset | `product` |
| Areas | none |
| Stack | Static HTML, one stylesheet (`styles.css`), vanilla JS (`script.js`); no framework |
| Tokens live in | `styles.css` `:root` (25 custom properties) |
| Themes | `light`, `dark` — `@media (prefers-color-scheme: dark)` re-defines the `:root` tokens; `color-scheme` declared per theme; no toggle (kept as is: user decision) |
| Motion | CSS transitions and one `@keyframes` (dialog), no library |

## Type

**Families** — `family.text`: Inter (Google Fonts `<link>`, `wght@400;500;600`), fallback `system-ui` stack, declared as `--font`. No mono. `font-synthesis: none` on `body`.

Sizes are `rem` tokens in `styles.css` `:root` (proposed 2026-11-04, in the project's short-name style).

| Role | Name here | Size | Leading | Tracking | Weight | Tier |
|---|---|---|---|---|---|---|
| `type.title` | `--fs-title` · `.page-head h1` | 1.25rem (20px) | 1.3 | −0.02em | `--weight-heading` 600 | `text.primary` |
| `type.heading` | `--fs-heading` · `.card__head h2`, `.modal h2` | 1rem (16px) | 1.35 | −0.02em | `--weight-heading` 600 | `text.primary` |
| `type.body` | `--fs-body` · `body`, input values | 0.875rem (14px) | 1.5 | 0 | 400 | `text.primary` |
| `type.supporting` | `--fs-body` · `.page-head p`, `.card__head p`, `.modal p` | 14px | 1.45 | 0 | 400 | `text.secondary` — separates on tier |
| ↳ row title (project role) | `--fs-body` · `.prefs__name`, `.connection__name`, `.photo__label`, `.danger-row__title`, `.sidenav__plan-name` | 14px | 1.5 | 0 | 500 | `text.primary` — separates on weight |
| ↳ brand name | `--fs-body` · `.brand__name` | 14px | 1.5 | −0.02em | 500 | `text.primary` |
| `type.ui` | `--fs-ui` · `.btn`, `.sidenav a`, `.topnav a`, `.search input`, `.toast` | 0.8125rem (13px) | 1 in fixed-height boxes, 1.4 in nav rows | 0 | 500 buttons; 400 nav, 500 when current | per control |
| `type.label` | `--fs-ui` · `.field label` | 13px | 1.3 | 0 | 500 | `text.primary` |
| ↳ help text (project role, reading copy) | `--fs-ui` · `.hint`, `.msg`, `.rules` | 13px | 1.45 | 0 | 400 | `text.tertiary` / `status.danger.fg` |
| `type.meta` | `--fs-meta` · `.status`, `.badge`, `.optional`, `.footnote`, `.sidenav__plan-meta`, `.reveal` | 0.75rem (12px) | 1.4–1.5 | 0 | 400 (`.reveal` 500) | `text.tertiary` |
| ↳ group label | `--fs-meta` · `.sidenav__title`, `.prefs thead th` | 12px, capitals by `text-transform` (the words are written in sentence case) | 1.3 | +0.06em | 500 | `text.tertiary` — separates on case |
| ↳ keyboard hint | `--fs-micro` · `.search kbd` | 0.6875rem (11px) | 1.4 | 0 | 400 | `text.tertiary` |
| `type.data` | `.num`, time-zone `select` | inherits | — | 0 | — | tabular, slashed zero |

Lettermarks: `.avatar--lg` initials at `--fs-title`, `.avatar--sm` at `--fs-meta`. Icons beside nav and field text are 16px boxes (≈13px drawn), stroke 1.6 on a 20 grid. Fields are 1rem under 760px so iOS doesn't zoom on focus.

**Weights** — three, the third recorded: `--weight-regular` 400, `--weight-strong` 500, `--weight-heading` 600.

| Size | Quiet, 400 | Lifted, 500 | Heading, 600 |
|---|---|---|---|
| 20 | — | — | page title |
| 16 | — | — | section and dialog headings |
| 14 | body, descriptions, input values | row titles, brand name | — |
| 13 | help text, nav items | buttons, field labels, current nav item | — |
| 12 | meta, badges | group labels (in capitals), the password Show button | — |

## Colour

**Text** — measured with `scripts/contrast.mjs` against `surface.page` and the worst surface each tier lands on.

| Role | Name here | Light | Ratio (`--surface` · `--bg`) | Dark | Ratio (`--surface` · `--surface-2`) |
|---|---|---|---|---|---|
| `text.primary` | `--text` | `#101828` | 17.75 · 16.56:1 | `#f2f4f7` | 16.30 · 15.65:1 |
| `text.secondary` | `--text-2` | `#475467` | 7.69 · 7.17:1 | `#c2c7d0` | 10.58 · 10.16:1 |
| `text.tertiary` | `--text-3` | `#667085` | 4.97 · 4.64:1 | `#8e95a2` | 5.96 · 5.73:1 |
| `text.inverse` | `--surface` on `--text` | `#ffffff` | 17.75:1 | `#14171c` | 16.30:1 |
| `text.on-accent` | `#fff` (raw) | `#fff` | 5.69:1 on `--accent` | `#fff` | **3.37:1** on `--accent` |
| `text.link` | `--accent` (`.link`) | `#3e5bd8` | 5.69:1 | `#6b85f0` | 5.34:1 |

**Surfaces**

| Role | Name here | Light | Dark |
|---|---|---|---|
| `surface.page` | `--bg` | `#f6f7f9` | `#0c0e12` |
| `surface.raised` | `--surface` | `#ffffff` | `#14171c` |
| `surface.hover` | `--surface-2` | `#f9fafb` | `#181b21` |
| `surface.subtle` | `--surface-2` (card footer band, search field) — shares the hover token | `#f9fafb` | `#181b21` |
| `surface.selected` | `.sidenav a.is-active`: `--surface` + `--shadow-sm` + inset `--border` | — | — |
| `surface.inverse` | `--text` (toast, skip link) | `#101828` | `#f2f4f7` |

**Lines and fills**

| Role | Name here | Light | Dark |
|---|---|---|---|
| `border.default` · `border.divider` | `--border` | `#e4e7ec` | `#262a32` |
| `border.control` | `--border-strong` | `#d0d5dd` (1.47:1 on `--surface`) | `#353a44` (1.57:1) |
| `border.hover` | `--text-3` (input hover) | `#667085` | `#8e95a2` |
| `fill.strong` | `--accent` (primary button, toggle on, meter) | `#3e5bd8` | `#6b85f0` |
| `fill.strong-hover` | `--accent-hover` | `#3249b8` | `#8299f3` |
| `mark` | `--border` (strength steps off), `--border-strong` (rule circles, toggle off track) | — | — |

**Signal**

| Role | Name here | Light | Dark |
|---|---|---|---|
| `focus` | `--accent` outline; `--ring` halo on inputs | `#3e5bd8` (5.69:1 on `--surface`) | `#6b85f0` (5.34:1) |
| `accent` · `accent.hover` | `--accent` · `--accent-hover`; `--accent-soft` defined, unused | `#3e5bd8` · `#3249b8` | `#6b85f0` · `#8299f3` |
| `status.danger.fg` | `--danger-text` (and `--danger` for icons) | `#b42318` (6.57:1) | `#fda29b` (9.25:1) |
| `status.danger.bg` | `--danger-soft`; edge `--danger-border` | `#fef3f2` | `rgba(240,68,56,.1)` |
| `status.danger.solid` | `#d92d20` / hover `#b42318` (raw) | — | — |
| `status.success.fg` · `.bg` | `--ok` · `--ok-soft` | `#067647` (5.69:1) | `#47cd89` (8.86:1) |
| `status.warning.fg` | `--warn` | `#dc6803` (**3.49:1**) | `#dc6803` (4.95:1 on `--surface-2`) |

**Exceptions** — the avatar gradient (`#7b8ff5 → #3e5bd8 → #2a3fa3`, raw), which is the brand hue doing the job of a person's placeholder; third-party logos (Google, Slack) in their own colours, which identify the service. Password strength step 3 `#eaaa08` (raw) is a fourth status hue.

## Layout

| Role | Name here | Value |
|---|---|---|
| `measure.frame` | `.layout`, `.topbar__inner` `max-width` | 1280px |
| `measure.rail` | `.layout` first column | 240px (200px < 1080px) |
| `measure.form` | `.layout` second column | `minmax(0, 760px)` |
| ↳ narrow form | `.stack` | 420px |
| `gutter` | `.layout` / `.topbar__inner` padding | 32px (16px < 760px) |
| `space.tight` | `.field` gap | 6px |
| `space.group` | `.grid` / `.stack` gap | 20px |
| `space.section` | `.content` gap | 24px |
| `space.heading-above` · `space.heading-below` | `.card__head` padding-top · gap to `.card__body` | 22px · 20px |

**Radius ladder**

| Role | Name here | Value |
|---|---|---|
| `radius.pill` | `99px`, `50%` | — |
| `radius.small` | inline (`.search kbd`) | 4px |
| ↳ nav / reveal | inline (`.topnav a`, `.reveal`) | 6px |
| `radius.control` | `--radius-sm` | 8px |
| ↳ logo tile | inline (`.connection__logo`) | 10px |
| `radius.card` | `--radius` | 12px |
| `radius.container` | inline (`.modal`) | 16px |

**z-index ladder**

| Role | Name here | Value |
|---|---|---|
| `z.raised` | `.sidenav` (sticky, < 760px) | 10 |
| `z.nav` | `.topbar` | 20 |
| `z.toast` | `.toast` | 50 |
| `z.skip-link` | `.skip` | 100 |
| `z.overlay` | `dialog.modal` | top layer (`showModal()`) |

**Breakpoints**

| Role | Name here | Value | What changes |
|---|---|---|---|
| `bp.compact-nav` | `@media (max-width: 1080px)` | 1080px | Top nav and plan card hide; rail narrows to 200px |
| `bp.single-column` | `@media (max-width: 760px)` | 760px | Rail becomes a sticky horizontal tab strip; search hides; form grid goes to one column |

## Surfaces

| Level | Surface | Edge | Shadow | Layer |
|---|---|---|---|---|
| `elevation.flat` | `--surface` (inputs, logo tiles) | `--border-strong` / `--border` | `--shadow-sm` | — |
| `elevation.raised` | `.card` `--surface` | `--border` | `--shadow-md` | — |
| ↳ sticky chrome | `.topbar` 85% `--surface` | `--border` bottom | none | `z.nav` |
| `elevation.overlay` | `.modal` `--surface` | `--border` | `--shadow-lg` | top layer |
| `scrim` | `.modal::backdrop` | — | `rgba(16,24,40,.5)` + `blur(4px)` | — |
| toast | `--text` | none | `--shadow-lg` | `z.toast` |

`material.translucent` `.chrome` — `.topbar`: `color-mix(--surface 85%)` + `saturate(180%) blur(12px)`; no `@supports` guard, no reduced-transparency branch.

## Motion

No duration or easing tokens; every value is inline.

| Role | Name here | Value | Used for |
|---|---|---|---|
| press | inline `.btn` `transform` | 50ms | button press nudge |
| hover / state | inline | 150ms | sidenav, field borders, buttons, rule circles |
| toggle / strength / toast | inline | 200ms | toggle track and knob, strength steps, toast in/out |
| dialog open | inline `@keyframes pop` | 180ms | modal entrance |
| spinner | inline `@keyframes spin` | 700ms linear, infinite | loading buttons |

Curves: `cubic-bezier(.3,.7,.4,1)` (toggle knob), `cubic-bezier(.2,.8,.3,1)` (dialog), browser `ease` everywhere else. Reduced motion: a global `.01ms` override on every transition and animation, and `scroll-behavior: auto`.

## Patterns

**Nouns** — account, profile, project, task, workspace. **Destructive** — "Delete account" last on the page, behind a dialog that names what is lost and needs the typed phrase "delete my account". **Save model** — one save button per form section, with an inline status ("Unsaved changes", "Saving…", "✓ Saved just now") and a toast.

## Decisions

- 2026-11-13 — Group labels (`.sidenav__title`, `.prefs thead th`) are set in capitals, as the page already had them: 12px, +0.06em, 500, `text.tertiary`, by `text-transform` over words written in sentence case. The first type pass had moved them to sentence case; capitals on a label role are a valid choice and a refining pass keeps the case a project has. Two values did move: weight 600 → 500 (600 is for headings, and the ladder sets a group label strong in capitals) and the table header's tracking 0.05 → 0.06em, so the role has one value. No hairline under the sidebar's label. (Type dials, uppercase labels; `ladders.md` group-label row; layout, the sidebar.)
- 2026-11-04 — Three weights, not two: 500 lifts row titles, field labels and buttons, so headings at 500 differed from the rows under them by size alone; 600 is reserved for the page title and section/dialog headings. (User decision by delegation — recommendation taken; type guide dial override.)
- 2026-11-04 — Page title 20px, not 28px: the `product` ceiling is 1.6 × body. (Law; type dials.)
- 2026-11-04 — Theme follows the OS through `prefers-color-scheme`, no toggle. (User decision: keep the theming the page already has.)
- 2026-11-04 — Preset `product`. (User decision.)

## Open issues

- **type law 12** — Inter comes from Google Fonts with `swap` and no metric-matched fallback; self-hosting needs the font files added to the project.
- **color law 1** — ten raw colours outside the tokens (`#fff` on accent ×2, `#d92d20`/`#b42318` danger button, `#eaaa08`, toggle knob `#fff` and shadow, scrim, avatar gradient). Detector.
- **color law 3** — `--warn` as text ("Unsaved changes") is 3.49:1 on `--surface` in light; fails 4.5:1.
- **color law 8** — white text on dark `--accent` `#6b85f0` is 3.37:1: every primary button fails in dark. The light value was reused instead of re-picked.
- **`border.control`** — `--border-strong` is 1.47:1 (light) / 1.57:1 (dark) on `--surface`; inputs and the off toggle track need 3:1 to read as controls.
- **color law 1 (coupling)** — `--surface-2` does `surface.hover` and `surface.subtle` (footer band, search field); `--border` doubles as the ghost button's hover fill (`styles.css:350`).
- **color law 7** — the current section in the rail is shown by a white raised chip, not the accent; `product` puts the current nav item on an accent tint with accent icon and label.
- **depth law 2 / layout law 3** — six boxes on the main screen holding more than one object: five section cards (Profile with photo + four fields; Notifications with four rows; Password with three fields; Connected accounts with three services; Danger zone) and the plan card in the rail; plus three bordered, shadowed logo tiles and three tinted footer strips.
- **depth law 15** — the translucent top bar and the blurred scrim have no `@supports` guard and no `prefers-reduced-transparency` branch.
- **depth law 4** — shadows outside the three shadow tokens: toggle knob `0 1px 3px rgba(16,24,40,.2)`, avatar ring, primary-button inner highlight.
- **motion law 4 / 5** — no duration or easing tokens; five durations and three curves inline.
- **motion law 10** — reduced motion is a blanket `.01ms` kill on everything, not a branch with substitutes.
