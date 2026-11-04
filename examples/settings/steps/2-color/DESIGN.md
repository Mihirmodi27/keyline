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

Neutrals sit on the accent's hue (OKLCH h 264) at chroma ≤ 0.015; each re-picked value carries its OKLCH source in a comment in `styles.css`.

**Text** — measured with `scripts/contrast.mjs` against every surface the tier lands on; the worst is `--surface-hover` in both themes.

| Role | Name here | Light | on `--surface` / `--surface-hover` / `--bg` | Dark | on `--surface` / `--surface-hover` / `--bg` |
|---|---|---|---|---|---|
| `text.primary` | `--text` | `#15181f` | 17.76 / 16.01 / 16.57:1 | `#f0f2f4` | 15.82 / 14.03 / 17.09:1 |
| `text.secondary` | `--text-2` | `#4e535b` | 7.74 / 6.98 / 7.22:1 | `#c3c7cf` | 10.48 / 9.29 / 11.32:1 |
| `text.tertiary` | `--text-3` | `#666a73` | 5.42 / 4.89 / 5.06:1 | `#9498a1` | 6.14 / 5.45 / 6.64:1 |
| `text.on-accent` | `--on-accent` (proposed) | `#ffffff` | 5.69:1 on `--accent` | `#0d0f13` | 7.61:1 on `--accent` |
| `text.inverse` | `--surface` on `--text` | | | | |
| `text.link` | `--accent` | `#3e5bd8` | 5.69 / 5.13 / 5.31:1 | `#839ffc` | 7.04 / 6.25 / 7.61:1 |

Steps on the worst surface: 2.29× and 1.43× (light), 1.51× and 1.70× (dark) — product minimum 1.4×.

**Surfaces**

| Role | Name here | Light | Dark |
|---|---|---|---|
| `surface.page` | `--bg` | `#f6f7f9` | `#0d0f13` (L 0.17) |
| `surface.raised` | `--surface` | `#ffffff` | `#16181d` |
| `surface.subtle` | `--surface-2` | `#f9fafb` | `#1a1d23` |
| `surface.hover` | `--surface-hover` (proposed) | `#f2f3f6` | `#202329` |
| `surface.inverse` | `--text` | | |
| `scrim` | `--scrim` (proposed) | `rgba(16,24,40,.5)` | `rgba(0,0,0,.6)` |

**Lines and fills**

| Role | Name here | Light | Dark | Measured |
|---|---|---|---|---|
| `border.default` · `border.divider` | `--border` | `#e4e7ec` | `#2a2e35` | decorative |
| `border.control` | `--border-strong` | `#888c94` | `#6d727a` | 3.37 / 3.04:1 (surface / hover) · 3.67 / 3.25:1 — inputs, search, secondary buttons, switch off |
| `fill.strong` | `--accent` (switch on), `--text-2` (meter, strength 3–4) | | | |
| switch thumb | `--knob` (proposed) | `#ffffff` | `#ffffff` | |

**Signal**

| Role | Name here | Light | Dark | Measured |
|---|---|---|---|---|
| `accent` · `focus` | `--accent` | `#3e5bd8` | `#839ffc` | focus ≥ 5.13:1 (light) / 6.25:1 (dark) on every surface; `outline` 2px, offset 2px everywhere |
| `accent.hover` | `--accent-hover` | `#3249b8` | `#99b1fb` | |
| `status.success.fg` | `--ok` | `#067647` | `#47cd89` | 5.45 / 8.33:1 on `--surface-2` — "Saved" only |
| `status.warning.fg` | `--warn` | `#9d580c` | `#eca851` | 5.24 / 8.27:1 on `--surface-2` |
| `status.danger.fg` | `--danger-text` | `#b42318` | `#fda29b` | 6.05:1 on its tint / 9.15:1 |
| `status.danger` mark | `--danger` | `#c4320a` | `#f97066` | 5.52 / 6.37:1 (≥ 3) |
| `status.danger.bg` | `--danger-soft` | `#fef3f2` | 10 % red | |
| `status.danger.solid` | `--danger-solid` · `--danger-solid-hover` · `--on-danger` (proposed) | `#d92d20` · `#b42318` · `#fff` | same | white 4.83:1 |

Status glyphs (`--glyph-check`, `--glyph-alert`, `--glyph-dot`) are masks; only the glyph takes the status colour, the sentence stays in `--text-2`. No `status.info` — nothing on this screen reports information.

**Exceptions**

- `exception.person` — `--avatar` / `--on-avatar` (proposed): `#7d45a2` with white initials (6.47:1) / `#bc8fdd` with page-dark initials (7.41:1). Who someone is; avatars only, never names or rows. Replaces the accent gradient, which spent the action hue on decoration.
- Third-party logos (Google, Slack) keep their brand colours as artwork.

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

- 2026-11-04 — Theme control stays OS-only (no light/dark/system toggle), against the product dial, because the brief's theming is kept as built. (User decision.)
- 2026-11-04 — Keep the existing theming as it is: light and dark following the OS via `prefers-color-scheme`, no toggle. (User decision.)
- 2026-11-04 — Preset `product`. (User decision.)

## Open issues

- **Boxes as the default** — main screen: 5 section cards each holding many objects (profile 6 fields, notifications 4 rows, password 3 fields, connections 3 rows, danger 1 row), plus the plan card, an active-nav raised pill, 3 logo tiles, and a tinted `--surface-2` footer strip in 4 cards. 10+ boxes on one screen (depth law 2, layout law 3).
- **Layout — app shell** — product preset expects all navigation in one sidebar, no top bar; here a top bar carries the primary nav and a second sidebar carries settings sections.
- **Radii off a ladder** — 4, 6, 8, 10, 12, 16px; logo tile 10px and toast 10px have no role.
- **Z-index literals** — 10 / 20 / 50 / 100 with no ladder tokens.
- **Translucency without fallbacks** — top bar and scrim blur: no `@supports` guard, no `prefers-reduced-transparency` (depth law 15).
- **Motion** — durations typed inline (.05, .15, .18, .2s), two ad-hoc curves, no tokens; dialog opens animated and closes abruptly.
- **Fonts from a third-party host** — Inter still loads from Google Fonts (type law 12); self-hosting needs the font files added to the project.
