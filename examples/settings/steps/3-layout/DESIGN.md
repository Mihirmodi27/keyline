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

**Text** — measured with `scripts/contrast.mjs` on the worst surface each tier lands on (`--surface-hover`, the hovered notification row).

| Role | Name here | Light | Ratio | Dark | Ratio |
|---|---|---|---|---|---|
| `text.primary` | `--text` | `#101828` | 16.11:1 | `#f2f4f7` | 15.0:1 |
| `text.secondary` | `--text-2` | `#475467` | 6.98:1 | `#c2c7d0` | 9.61:1 |
| `text.tertiary` | `--text-3` | `#5f6b7e` | 4.90:1 | `#8e95a2` | 5.41:1 |
| `text.inverse` | `--surface` on `--text` | `#ffffff` | 17.75:1 | `#14171c` | 16.30:1 |
| `text.on-accent` | `--on-accent` | `#ffffff` | 5.69:1 on `--accent` | `#ffffff` | 4.92:1 on `--accent` |
| `text.link` · `accent.ink` | `--accent-ink` | `#3249b8` | 6.10:1 on `--accent-soft` over `--bg` | `#8299f3` | 6.03:1 on `--accent-soft` over `--bg`, 6.85:1 on `--bg` |

Steps (ratio of ratios, light): primary → secondary 2.31×, secondary → tertiary 1.42× (dial ≥ 1.4×).

**Surfaces**

| Role | Name here | Light | Dark |
|---|---|---|---|
| `surface.page` | `--bg` | `#f6f7f9` | `#101318` (OKLCH L 0.186) |
| `surface.raised` | `--surface` | `#ffffff` | `#14171c` |
| `surface.subtle` | `--surface-2` | `#f9fafb` | `#181b21` |
| `surface.hover` | `--surface-hover` (proposed) | `#f2f4f7` | `#1d2027` |
| `surface.selected` | `--accent-soft` — the accent at 15% over `--bg`; one job, the current nav item (`.sidenav a.is-active`) | `rgba(62,91,216,.15)` | `rgba(74,102,224,.15)` |
| `surface.inverse` | `--text` (toast, skip link) | `#101828` | `#f2f4f7` |

**Lines and fills**

| Role | Name here | Light | Dark |
|---|---|---|---|
| `border.default` · `border.divider` | `--border` | `#e4e7ec` | `#262a32` |
| `border.control` | `--border-strong` | `#848c9b` (3.38:1 on `--surface`, 3.07:1 on `--surface-hover`) | `#666d7c` (3.46:1 · 3.14:1) |
| `border.hover` | `--text-3` (input hover) | `#5f6b7e` | `#8e95a2` |
| `fill.strong` | `--accent` | `#3e5bd8` | `#4a66e0` |
| `fill.strong-hover` | `--accent-hover` | `#3249b8` | `#3f5bd6` |
| toggle knob | `--thumb` (proposed) | `#ffffff` | `#ffffff` |
| `mark` | `--border` (strength steps off), `--border-strong` (rule circles) | — | — |

**Signal**

| Role | Name here | Light | Dark |
|---|---|---|---|
| `focus` | `--focus` (proposed), `outline` 2px, offset 2px | `#3e5bd8` (5.69:1 on `--surface`) | `#8299f3` (6.85:1 on `--bg`) |
| `accent` · `accent.hover` | `--accent` · `--accent-hover` | `#3e5bd8` · `#3249b8` | `#4a66e0` · `#3f5bd6` |
| `status.danger.fg` | `--danger-text` (`--danger` for icons) | `#b42318` (6.57:1) | `#fda29b` (9.25:1) |
| `status.danger.bg` | `--danger-soft`; edge `--danger-border` | `#fef3f2` | `rgba(240,68,56,.1)` |
| `status.danger.solid` | `--danger-solid` · `--danger-solid-hover` (proposed) | `#d92d20` (white 4.83:1) · `#b42318` | same |
| `status.success.fg` · `.bg` | `--ok` · `--ok-soft` | `#067647` (5.69:1) | `#47cd89` (8.86:1) |
| `status.warning.fg` | `--warn` | `#b54708` (5.19:1 on `--surface-2`) | `#f79009` (7.65:1) |
| `scrim` | `--scrim` (proposed) | `rgba(16,24,40,.5)` | `rgba(0,0,0,.6)` |

**Exceptions** — `--avatar-fill`, the brand gradient every avatar shares (re-picked per theme, every stop moved); third-party logos in their own colours.

## Layout

| Role | Name here | Value |
|---|---|---|
| `measure.frame` | `.layout`, `.topbar__inner` `max-width` | 1280px |
| `measure.rail` | `.layout` first column | 240px (200px < 1080px) |
| `measure.form` | `.layout` second column | `minmax(0, 760px)` |
| ↳ narrow form | `.stack` | 420px |
| `measure.reading` | `.section__head p` | 65ch (help prose only) |
| `gutter` | `--gutter` (proposed) | 32px (16px < 760px) |
| `space.tight` | `--space-tight` (proposed) | 6px — label → field |
| `space.group` | `--space-group` (proposed) | 16px — between fields; heading block → content |
| `space.section` | `--space-section` (proposed) | 40px (32px < 760px) — between settings sections |
| `space.heading-above` · `space.heading-below` | `--space-section` · `--space-group` | 40px · 16px — 2.5:1 |
| page top space | `.layout` padding-top | 24px under the top bar |

**Sections** — stacked on the page, each opened by its heading (`.section`, `.section__head`, `.section__body`, `.section__foot`); no box round a section, no rule between them. Single objects keep an edge: the notifications table (one hairline frame, tinted header row, hairlines between rows — the one table style) and the delete-account row. The plan card in the rail is a card for one object.

**Radius ladder**

| Role | Name here | Value |
|---|---|---|
| `radius.pill` | `99px`, `50%` | toggles, badges, meter, avatars |
| `radius.small` | `--radius-xs` (proposed) | 4px — `kbd`; the Show button inset 6px in an 8px field (8 − 6 = 2, snapped) |
| `radius.control` | `--radius-sm` | 8px — fields, buttons, nav items |
| `radius.card` | `--radius` | 12px — table frame, danger row, plan card, logo tiles, toast |
| `radius.container` | `--radius-lg` (proposed) | 16px — dialog |

**Lines** — `hairline.chrome` · `hairline.object`: `--hairline` 0.5px in `--border` (top bar edge, table frame and rows, connection rows, plan card, dialog). Control edges stay 1px in `--border-strong`, because they must be seen (3:1). `rule.emphasis`: the 2px focus outline.

**z-index ladder**

| Role | Name here | Value |
|---|---|---|
| `z.raised` | `--z-raised` | 10 |
| ↳ section strip (phones) | `--z-subnav` | 40 |
| `z.nav` | `--z-nav` | 50 |
| `z.overlay` | `dialog.modal` | top layer (`showModal()`) |
| `z.toast` | `--z-toast` | 70 |
| `z.skip-link` | `--z-skip` | 100 |

**Breakpoints**

| Role | Name here | Value | What changes |
|---|---|---|---|
| `bp.compact-nav` | `@media (max-width: 1080px)` | 1080px | Top nav and plan card hide; rail narrows to 200px |
| `bp.single-column` | `@media (max-width: 760px)` | 760px | Rail becomes a sticky horizontal section strip; search hides; fields go to one column and 16px text |

Hover styles are gated on `(hover: hover) and (pointer: fine)`; nothing hover-only carries information.

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

- 2026-11-13 — `surface.selected` (`--accent-soft`) is the accent at 15% over the page it sits on, down from 25%, in both themes; the hue is unchanged. A tint marks where the reader is and the solid fill marks the action, and at 25% the current item read close to a second button. The label and icon stay `--accent-ink`, which already clears 4.5:1 on the lighter tint (6.10:1 light on `#ffffff`, 6.03:1 dark on `#101318`), so the ink did not move. (Law; colour law 7, current location.)
- 2026-11-13 — Group labels (`.sidenav__title`, `.prefs thead th`) are set in capitals, as the page already had them: 12px, +0.06em, 500, `text.tertiary`, by `text-transform` over words written in sentence case. The first type pass had moved them to sentence case; capitals on a label role are a valid choice and a refining pass keeps the case a project has. Two values did move: weight 600 → 500 (600 is for headings, and the ladder sets a group label strong in capitals) and the table header's tracking 0.05 → 0.06em, so the role has one value. No hairline under the sidebar's label. (Type dials, uppercase labels; `ladders.md` group-label row; layout, the sidebar.)
- 2026-11-04 — Settings sections sit on the page instead of in five cards, and the tinted footer bands are gone; light `--bg` is now white, the white the cards were, so the unboxed page doesn't turn grey. (Law; depth law 2 and layout law 3. The page colour is a colour change the layout pass surfaced.)
- 2026-11-04 — Structural lines are 0.5px (`--hairline`); control edges stay 1px. (Law-adjacent; the `product` hairline dial, with controls kept visible under colour law 2.)
- 2026-11-04 — Breakpoints stay on the window, not containers: the content column is not a resizable panel. (Dial left; no panel resizes here.)
- 2026-11-04 — Passed password rules are an ink check on a neutral circle, and the matching confirm field has no green border: passing a check in a sequence isn't the news, and the green border was colour alone. Saved confirmations and "Connected" keep `--ok`. (Law; colour law 6 and the completed-states dial.)
- 2026-11-04 — Inputs, secondary buttons and the off toggle track darkened to 3:1 (`--border-strong`): a control's edge must be seen. (Law; colour law 2.)
- 2026-11-04 — Dark `--accent` deepened to `#4a66e0` for white button text; links, focus and the current nav item take the lighter `--accent-ink`. (Law; colour law 8.)
- 2026-11-04 — Greys keep their existing cool tint (OKLCH C ≈ 0.035, above the `product` dial's 0.015): the palette is the design's own, and the dial describes a new system. (Keep what the design chose.)
- 2026-11-04 — Three weights, not two: 500 lifts row titles, field labels and buttons, so headings at 500 differed from the rows under them by size alone; 600 is reserved for the page title and section/dialog headings. (User decision by delegation — recommendation taken; type guide dial override.)
- 2026-11-04 — Page title 20px, not 28px: the `product` ceiling is 1.6 × body. (Law; type dials.)
- 2026-11-04 — Theme follows the OS through `prefers-color-scheme`, no toggle. (User decision: keep the theming the page already has.)
- 2026-11-04 — Preset `product`. (User decision.)

## Open issues

- **type law 12** — Inter comes from Google Fonts with `swap` and no metric-matched fallback; self-hosting needs the font files added to the project.
- **color dials** — no `status.info` pair: nothing on this page reports information, so none was added.
- **layout law 4** — the plan card is simply hidden below 1080px rather than moving in-flow; moving it is a restructure, left for the owner.
- **depth law 15** — the translucent top bar and the blurred scrim have no `@supports` guard and no `prefers-reduced-transparency` branch.
- **depth law 4** — shadows outside the three shadow tokens: toggle knob `0 1px 3px rgba(16,24,40,.2)`, avatar ring, primary-button inner highlight.
- **motion law 4 / 5** — no duration or easing tokens; five durations and three curves inline.
- **motion law 10** — reduced motion is a blanket `.01ms` kill on everything, not a branch with substitutes.
