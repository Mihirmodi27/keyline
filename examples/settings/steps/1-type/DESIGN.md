# Design system

> Keyline reads this before touching UI, and writes back to it when a decision changes. Edit it by hand whenever you like — it is the source of truth for intent, the code is the source of truth for values. Set up 2026-11-04.

## Profile

| | |
|---|---|
| Product | Northwind, a project-management app — this is its account settings screen |
| Reader | Working: a fluent, returning user changing a few values and leaving |
| Preset | `product` |
| Areas | None |
| Stack | Static HTML, one stylesheet, one script; no framework, no build |
| Tokens live in | `styles.css` `:root` (29 custom properties) |
| Themes | `light`, `dark` — `@media (prefers-color-scheme: dark)` redefines the same tokens; `color-scheme` declared. Follows the OS, no toggle |
| Motion | CSS only; one `prefers-reduced-motion` block |

Evidence for `product`: a form-and-toggle settings screen inside an app shell (top bar with Projects / My tasks / Inbox / Reports, a section sidebar), save buttons per section, validation states, a status palette already present (`--ok`, `--warn`, `--danger`). No long-form prose; no marketing.

## Type

**Families** — `family.text`: Inter (Google Fonts `<link>`, weights 400 · 500 only; `display=swap`), then `"Inter Fallback"` — a metric-matched `@font-face` over local Arial (`size-adjust: 107.12%`, ascent 90.44 %, descent 22.52 %) — then `system-ui`. `font-feature-settings: "cv11", "ss01"`; `font-variant-numeric: tabular-nums` and `font-synthesis: none` on `body`. No mono family.

**Sizes** — tokens in `styles.css` `:root`, in `rem` (proposed names, in the project's short `--x-y` style):

| Role | Name here | Size | Leading | Tracking | Weight | Tier |
|---|---|---|---|---|---|---|
| `type.title` | `--type-title` · `.page-head h1` | 1.25rem (20px) | 1.3 | −0.02em | strong | `text.primary` |
| `type.heading` | `--type-heading` · `.card__head h2`, `.modal h2` | 1rem (16px) | 1.35 | −0.02em | strong | `text.primary` |
| `type.body` | `--type-body` · `body` | 0.875rem (14px) | 1.5 | 0 | regular | `text.primary` |
| ↳ row title (project role) | `.prefs__name`, `.photo__label`, `.connection__name`, `.danger-row__title`, `.sidenav__plan-name` | 14px | 1.5 | 0 | strong | `text.primary` — separated by weight |
| `type.supporting` | `.page-head p`, `.card__head p`, `.modal p` | 14px | 1.45 | 0 | regular | `text.secondary` — separated by tier |
| `type.ui` | `--type-ui` · `.btn`, `.reveal`, `.topnav a`, `.sidenav a`, inputs, `.toast` | 0.8125rem (13px); inputs 1rem (16px) ≤ 760px | 1 in fixed-height controls, 1.4 in nav rows | 0 | regular; strong on buttons and the active nav item | `text.secondary` / `text.primary` |
| ↳ row second line (project role) | `.prefs .hint`, `.connection .hint`, `.danger-row .hint` | 13px | 1.45 | 0 | regular | `text.tertiary` |
| `type.label` | `--type-meta` · `.field label`, `.badge` | 0.75rem (12px) | 1.3 | 0 | regular | `text.secondary` |
| ↳ group label (project role) | `.sidenav__title`, `.prefs thead th` | 12px | 1.3 | 0, sentence case | regular | `text.tertiary` — separated by tier |
| `type.meta` | `--type-meta` · `.hint`, `.msg`, `.status`, `.rules`, `.footnote`, `.optional`, `.sidenav__plan-meta`, `kbd` | 12px | 1.4 | 0 | regular | `text.tertiary` |
| ↳ lettermark (project role) | `.avatar` initials | 12px / 1.5rem / 1.25rem ≤ 760px | — | 0 | strong | on the avatar fill — recognised, not read |
| ↳ wordmark | `.brand__name` | 14px | 1.5 | 0 | strong | `text.primary` |

Five sizes on the ladder (20 · 16 · 14 · 13 · 12); ceiling 20 ÷ 14 = 1.43. No responsive sizes except 16px inputs at touch widths.

**Weights** — `--weight-regular` 400; `--weight-strong` 500: headings, row titles, buttons, links, the active nav item, `<strong>`.

**Icons** — 14px beside 13px nav and search text, 6px gap; 16px status and chevron icons inside 40px fields.

## Colour

**Text** — measured with `scripts/contrast.mjs` against each surface the tier lands on; worst surface is `--bg` in light, `--surface-2` in dark.

| Role | Name here | Light | on `--surface` / `--surface-2` / `--bg` | Dark | on `--surface` / `--surface-2` / `--bg` |
|---|---|---|---|---|---|
| `text.primary` | `--text` | `#101828` | 17.75 / 16.98 / 16.56:1 | `#f2f4f7` | 16.30 / 15.65 / 17.53:1 |
| `text.secondary` | `--text-2` | `#475467` | 7.69 / 7.36 / 7.17:1 | `#c2c7d0` | 10.58 / 10.16 / 11.38:1 |
| `text.tertiary` | `--text-3` | `#667085` | 4.97 / 4.76 / 4.64:1 | `#8e95a2` | 5.96 / 5.73 / 6.41:1 |
| `text.on-accent` | `#fff` (literal) | `#ffffff` | 5.69:1 on `--accent` | `#ffffff` | **3.37:1** on `--accent` |
| `text.inverse` | `--surface` (reused) | `#ffffff` on `--text` | — | `#14171c` on `--text` | — |
| `text.link` | `--accent` via `.link` | `#3e5bd8` | 5.69 / — / 5.31:1 | `#6b85f0` | 5.34 / — / 5.74:1 |

Ladder strictly descends in both themes.

**Surfaces**

| Role | Name here | Light | Dark |
|---|---|---|---|
| `surface.page` | `--bg` | `#f6f7f9` | `#0c0e12` |
| `surface.raised` | `--surface` | `#ffffff` | `#14171c` |
| `surface.subtle` · `surface.hover` | `--surface-2` (one token, two jobs) | `#f9fafb` | `#181b21` |
| `surface.inverse` | `--text` (reused for `.skip`, `.toast`) | `#101828` | `#f2f4f7` |

**Lines and fills**

| Role | Name here | Light | Dark | Ratio on `--surface` |
|---|---|---|---|---|
| `border.default` · `border.divider` | `--border` | `#e4e7ec` | `#262a32` | 1.24 / 1.25:1 |
| `border.control` | `--border-strong` | `#d0d5dd` | `#353a44` | **1.47 / 1.57:1** |
| `border.hover` | `--text-3` (on inputs) | `#667085` | `#8e95a2` | 4.97 / 5.96:1 |
| `fill.strong` | `--accent` (toggles, meter, primary button) | `#3e5bd8` | `#6b85f0` | 5.69 / 5.34:1 |

**Signal**

| Role | Name here | Light | Dark | Note |
|---|---|---|---|---|
| `focus` · `accent` | `--accent` | `#3e5bd8` | `#6b85f0` | Outline ring 5.31:1 on `--bg` light; field focus uses `--ring` (28–35 % alpha halo) plus an accent border |
| `accent.hover` | `--accent-hover` | `#3249b8` | `#8299f3` | |
| — | `--accent-soft` | `#eef1fd` | 14 % accent | Defined, never used |
| `status.success.fg` · `.bg` | `--ok` · `--ok-soft` | `#067647` · `#ecfdf3` | `#47cd89` · 12 % | 5.40:1 light |
| `status.warning.fg` | `--warn` | `#dc6803` | (same) | **3.34:1** on `--surface-2` light — used as text in `.status.is-dirty` |
| `status.danger.fg` | `--danger-text` | `#b42318` | `#fda29b` | 6.57 / 9.25:1 |
| `status.danger` (icon / border) | `--danger` | `#c4320a` | `#f97066` | |
| `status.danger.bg` | `--danger-soft` | `#fef3f2` | 10 % | |
| `status.danger` edge | `--danger-border` | `#fecdca` | 35 % | |
| `status.danger.solid` | `#d92d20` / `#b42318` (literals) | — | — | No token; same in both themes |

**Exceptions** — the avatar gradient (`#7b8ff5 → #3e5bd8 → #2a3fa3`, literals) and third-party logos (Google, Slack: brand colours, allowed as content).

## Layout

| Role | Name here | Value |
|---|---|---|
| `measure.frame` | `.layout`, `.topbar__inner` max-width | 1280px |
| `measure.rail` | `.layout` first column | 240px (200px < 1080px) |
| `measure.app` | `.layout` second column | `minmax(0, 760px)` |
| `measure.reading` | `.danger-row .hint`, `.stack` | 480px, 420px (ad hoc) |
| `gutter` | `.layout` / `.topbar__inner` padding | 32px (16px < 760px) |
| `space.section` | `.content` gap | 24px |
| `space.group` | `.grid` / `.stack` gap | 20px |
| `space.tight` | `.field` gap | 6px |

**Radii** — `--radius-sm` 8px (controls), `--radius` 12px (cards), plus literals 4px (`kbd`), 6px (top-nav links, reveal), 10px (logo tile, toast), 16px (modal), 99px / 50% (pills, avatars). Six non-round values.

**Z-index** — literals: `.sidenav` 10 (< 760px), `.topbar` 20, `.toast` 50, `.skip` 100. Dialog uses the top layer.

**Breakpoints** — 1080px (top nav and plan card hide; rail narrows), 760px (single column; section nav becomes a sticky horizontal strip).

## Surfaces

| Level | Surface | Edge | Shadow | Layer |
|---|---|---|---|---|
| `elevation.flat` | `--bg` | — | — | — |
| `elevation.raised` | `--surface` (`.card`, `.sidenav__plan`, active nav item) | `--border` | `--shadow-md` (cards), `--shadow-sm` (nav item, inputs, buttons, logo tiles) | — |
| `elevation.raised` (sticky chrome) | `.topbar`: 85 % `--surface` + `saturate(180%) blur(12px)` | `--border` bottom | — | 20 |
| `elevation.floating` | `.toast`: `--text` | — | `--shadow-lg` | 50 |
| `elevation.overlay` | `.modal`: `--surface` | `--border` | `--shadow-lg` | top layer |
| `scrim` | `.modal::backdrop` | rgba(16,24,40,.5) + `blur(4px)` | | |

`material.translucent`: the top bar and the scrim. No `@supports` guard, no `prefers-reduced-transparency` branch.

## Motion

| Role | Name here | Value | Used for |
|---|---|---|---|
| `duration.instant` | literal | .05s | `.btn:active` nudge |
| `duration.state` | literal | .15s | nav, field border, button, rule check colours |
| `duration.state` (2nd value) | literal | .2s | toggle track and knob, strength bar, toast |
| `duration.popover` | literal | .18s | dialog `pop` keyframes |
| `ease.standard` | — | browser `ease` default on all transitions | |
| — | literals | `cubic-bezier(.3,.7,.4,1)` (toggle knob), `cubic-bezier(.2,.8,.3,1)` (dialog) | |

No duration or easing tokens. Reduced motion: every transition and animation cut to .01ms, smooth scrolling off. Dialog has an open animation, no close.

## Patterns

**Nouns** — task, project, comment, workspace, seat. **Saves** — one save per section form, "Save profile", "Save preferences", "Update password"; inline status line (`Unsaved changes` / `Saving…` / `✓ Saved just now`) plus a toast. **Destructive** — "Delete account" opens a dialog that needs the typed phrase `delete my account`. Connect / Disconnect run immediately, no confirmation.

## Decisions

- 2026-11-04 — Keep the existing theming as it is: light and dark following the OS via `prefers-color-scheme`, no toggle. (User decision.)
- 2026-11-04 — Preset `product`. (User decision.)

## Open issues

- **Contrast — `border.control`** `--border-strong` is 1.47:1 (light) / 1.57:1 (dark) on `--surface`: input edges and the off toggle track fail 3:1 (color law). Toggle off track uses the same token.
- **Contrast — `text.on-accent` in dark** white on `--accent` `#6b85f0` is 3.37:1: primary buttons and Connect fail 4.5:1.
- **Contrast — `status.warning` as text** `--warn` on `--surface-2` is 3.34:1 in light (`.status.is-dirty`, "Unsaved changes").
- **Boxes as the default** — main screen: 5 section cards each holding many objects (profile 6 fields, notifications 4 rows, password 3 fields, connections 3 rows, danger 1 row), plus the plan card, an active-nav raised pill, 3 logo tiles, and a tinted `--surface-2` footer strip in 4 cards. 10+ boxes on one screen (depth law 2, layout law 3).
- **Raw colours** — 10 `color/raw-color` findings: `#fff` on accent and danger fills, the danger solid `#d92d20`/`#b42318`, strength-bar `#eaaa08`, toggle knob `#fff`, avatar gradient.
- **Second highlight hue / success where completion isn't the news** — green "Connected" badges with dots on two of three rows; the green strength bar and green "valid" confirm border.
- **Layout — app shell** — product preset expects all navigation in one sidebar, no top bar; here a top bar carries the primary nav and a second sidebar carries settings sections.
- **Radii off a ladder** — 4, 6, 8, 10, 12, 16px; logo tile 10px and toast 10px have no role.
- **Z-index literals** — 10 / 20 / 50 / 100 with no ladder tokens.
- **Translucency without fallbacks** — top bar and scrim blur: no `@supports` guard, no `prefers-reduced-transparency` (depth law 15).
- **Motion** — durations typed inline (.05, .15, .18, .2s), two ad-hoc curves, no tokens; dialog opens animated and closes abruptly.
- **Unused tokens** — `--accent-soft`.
- **Fonts from a third-party host** — Inter still loads from Google Fonts (type law 12); self-hosting needs the font files added to the project.
