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
| `surface.pressed` | `--surface-pressed` (proposed) | `#e8e9ed` | `#282b32` |
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

**Structure** — an app shell: one sidebar (`.shell-nav`, `--shell-nav` 240px) holds every destination — brand and notifications, search, the primary nav (Projects, My tasks, Inbox, Reports), the Settings group with this page's five sections (current folder open), and the plan and account in its footer. No top bar. The page sits under its own 44px header bar (`.pagebar`, breadcrumb Settings / Account), sections stacked in reading order, each opened by its `h2`, with no panel round any of them.

| Role | Name here | Value |
|---|---|---|
| `measure.reading` | `--measure-reading` (proposed) | 30rem (480px ≈ 65 characters of 14px Inter) — page and section descriptions, the danger-zone help text |
| `measure.app` | `.content` | fills the panel, left-aligned; capped by `--measure-form` |
| ↳ form measure (project role) | `--measure-form` (proposed) | 760px — see Decisions |
| `measure.rail` | `--shell-nav` (proposed) | 240px |
| `gutter` | `--gutter` (proposed) | 16px below `bp.shell` |
| page padding | `--page-pad` (proposed) | 32px at `bp.shell` and up, `--gutter` below |
| `space.tight` | `--space-tight` (proposed) | 6px — label → input, title → description |
| `space.group` | `--space-group` (proposed) | 16px — between fields, heading block → content, content → actions |
| `space.section` | `--space-section` (proposed) | 40px — between sections |
| `space.heading-above` · `-below` | `--space-section` · `--space-group` | 40 : 16 = 2.5:1 |

**Radii** — `--radius-pill` 999px (switches, badges, meter) · `--radius-xs` 4px (`kbd`, the Show button inside a field) · `--radius-sm` 6px (inputs, buttons, nav rows) · `--radius` 8px (the table frame, logo tiles, toast) · `--radius-lg` 12px (the dialog).

**Lines** — `--hairline` 0.5px for every object edge and divider (table frame and its row rules, connection rows, sidebar edge, header bar, badges, the dialog); 1px for control edges (`border.control`); 2px for focus.

**Tables** — one style: `.prefs`, a hairline frame at `--radius`, a `--surface-2` header row with `text.primary` labels, hairlines between rows only, a hover wash.

**Z-index** — `--z-raised` 10 (sticky header bar) · `--z-dismiss` 40 (the scrim behind the nav sheet) · `--z-nav` 50 (the nav sheet) · `--z-toast` 70 · `--z-skip-link` 100. The dialog uses the top layer.

**Breakpoints** — `bp.shell` 760px on the window: the sidebar becomes a sheet opened from a menu button in the header bar. `bp.fields` 600px on the `.content` container: the field grid stacks, connection rows wrap, the danger row stacks.

## Surfaces

Content sits on the page: no section, list or figure is boxed. The table keeps the product table's hairline frame (flat, no shadow). Every shadow is one of three definitions, each led by a 0.5px `--border` ring that is the level's edge; surfaces that carry a ring also carry `border: 1px solid transparent` for forced colours, and `prefers-contrast: more` turns it into a real edge.

| Level | Surface | Edge | Shadow | Layer |
|---|---|---|---|---|
| `elevation.flat` | `--bg`, `--surface-2` (sidebar), `--surface` (inputs, active nav row) | `--hairline` `--border`, 1px `--border-strong` on controls | — | page flow |
| `elevation.raised` | `--bg` (`.pagebar`), `--knob` | `--hairline` bottom edge (pagebar); ring (knob) | `--shadow-sm` on the knob only — see Decisions | `--z-raised` |
| `elevation.floating` | `--surface-floating` (proposed: `#fff` / dark `#1f2228`, L 0.25) for the nav sheet; `--text` for the toast | ring in `--shadow-md` | `--shadow-md`: contact + 1 ambient, 10 % light / 55 % dark | `--z-nav` (sheet), `--z-toast` |
| `elevation.overlay` | `--surface-overlay` (proposed: `#fff` / dark `#282b32`, L 0.29) for `.modal` | ring in `--shadow-lg` | `--shadow-lg`: 16 % light / 60 % dark | top layer |
| `scrim` | `--scrim` — 40 % light, 60 % dark, no blur; the dialog only | | | |

The nav sheet's outside-click catcher (`.shell-scrim`) is transparent: the sheet is floating, not modal. The dialog returns focus to its opener on close. **Materials** — opaque only; no `backdrop-filter` anywhere.

## Motion

CSS only. Tokens in `styles.css` `:root` (proposed names):

| Role | Name here | Value | Used for |
|---|---|---|---|
| `duration.instant` | `transition-duration: 0s` on `:active` | 0 | button press: a `--surface-pressed` step, no travel |
| `duration.micro` | `--duration-micro` | 80ms | table row hover wash |
| `duration.state` | `--duration-state` | 100ms | nav, button, field-edge, strength-bar and switch colours; the switch thumb's 16px travel |
| `duration.popover` | `--duration-popover` | 150ms | the toast arriving (8px rise + fade) |
| `duration.overlay` | `--duration-overlay` | 200ms | the dialog opening (8px rise, 0.98 → 1, fade), the nav sheet sliding in |
| `duration.exit` | `--duration-exit` | 100ms | dialog, toast and nav sheet leaving — flat, `ease-in`, less travel (4px) |
| `ease.standard` | `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | everything that moves |
| `ease.colour` | `--ease-colour` | `ease-out` | colour and opacity |
| `ease.exit` | `--ease-exit` | `ease-in` | exits |
| ↳ progress loop (exemption, law 4) | `@keyframes spin` | 700ms `linear`, infinite | the button spinner while a save or connection runs — a loop reporting a wait, not a state change |

No springs: nothing is dragged or thrown. One loop: the button spinner, a progress indicator. Hover is a wash, never travel; the sidebar's hover previews the same fill and edge the current row carries (one signal for chosen). The dialog's open and close use `@starting-style` and `transition-behavior: allow-discrete` on `display` and `overlay`.

**Reduced motion** — per component, no global switch: the dialog and toast fade in place, the nav sheet fades instead of sliding, the spinner stops (the "Saving…" status line carries the wait), smooth scrolling is off; the 100ms colour changes and the thumb's 16px move stay.

## Patterns

**Nouns** — task, project, comment, workspace, seat, member; a third-party service is a "connected account".
**Saves** — one per section form, its button naming what it saves: "Save profile", "Save preferences", "Update password". The result shows in the section's status line ("Unsaved changes" · "Saving…" · "Saved just now"), so saves raise no toast.
**Toasts** — failures, Undo and results off screen only: "That photo is over 4 MB. Try a smaller one."; "Google disconnected · Undo" (6s); "Account scheduled for deletion. Check your email to finish."
**Errors** — say what to do: "Enter your email address.", "Enter a valid email address, like name@company.com.", "Enter your full name."; a form-level line in the status slot: "Fix the highlighted field to save your profile."
**Destructive** — Delete account: last section on the page, set apart by the page's one rule, danger ground. Disconnect is reversible, so it asks nothing and offers Undo; Connect and Disconnect show "Connecting…" / "Disconnecting…" while they run.
**Confirmation** — the system dialog: title names the thing, body lists what is lost, a visible "Type delete my account to confirm" label, the input focused on open, the button repeating the verb and disabled until the phrase matches (case-insensitive, trimmed), "Deleting…" while it runs with Escape and Cancel held off, focus back to the opener on close.
**Shortcuts** — ⌘K / Ctrl+K focuses search (shown in the field); Escape closes one layer (the dialog, or the nav sheet).

## Decisions

- 2026-11-04 — The sticky header bar is drawn by its hairline edge alone, without the raised shadow: on a product screen hairlines do the work, and a shadow under a bar with nothing scrolled beneath it reads as a stray. (Recommendation taken; depth law 1 bundle.)
- 2026-11-04 — Settings forms cap at `--measure-form` 760px rather than filling the panel: a two-column field grid and the switch columns must stay near their labels. (Recommendation taken; layout dial `measure.app`.)
- 2026-11-04 — The sidebar does not collapse to an icon rail: this page is one screen of a larger app, and adding a remembered collapse control is product work beyond the brief. (Recommendation taken; layout dial `Page structure`.)
- 2026-11-04 — Keep the existing theming: light and dark following the OS via `prefers-color-scheme`, no toggle — against the product dial's light/dark/system control. (User decision.)
- 2026-11-04 — Preset `product`. (User decision.)

## Open issues

- **Fonts from a third-party host** — Inter still loads from Google Fonts (type law 12); self-hosting needs the font files added to the project.
- **Theme switch** — when the OS flips theme, controls with colour transitions cross-fade over 100ms while everything else snaps (motion law 2, `duration.theme`). Needs one page-wide treatment: instant, or a single 250ms cross-fade.
- **No `status.info` pair** — the product dial requires four status pairs; nothing on this screen reports information, so none was added.
