# Design system

> Keyline reads this before touching UI, and writes back to it when a decision changes. Edit it by hand whenever you like — it is the source of truth for intent, the code is the source of truth for values. Set up 2026-11-04.

## Profile

| | |
|---|---|
| Product | Tandem — a landing page for an app that finds meeting times across time zones for remote teams |
| Reader | Being persuaded: a prospective buyer who sees the page once, skims the hero, features and pricing, and decides whether to start free |
| Preset | `expressive` |
| Areas | — (one page) |
| Stack | Static HTML and CSS, no framework, no build step |
| Tokens live in | `styles.css` `:root` (28 custom properties) |
| Themes | `light` only. Two inverted bands inside it (`.section-dark` testimonials, `.final-card`), not a theme |
| Motion | CSS only: transitions, one `@keyframes float`, `scroll-behavior: smooth`; `prefers-reduced-motion` removes all |

**Evidence for the preset:** one page whose job is conversion — a hero with two calls to action, a logo strip, features, steps, testimonials, pricing, FAQ and a closing call to action; a fluid 42–68px headline set in a second display family (Inter Tight); a brand accent plus gradients and a floating product mock. Nothing is read at length or worked in. The user chose `expressive`.

## Type

**Families** — `family.text`: Inter (`--font`, Google Fonts, 400/600) with `Inter Fallback` (local Arial, `size-adjust` 106.95%, ascent 90.58%, descent 22.55%). `family.display`: Inter Tight (`--font-display`, Google Fonts, 600/700) on `h1`–`h4`, the wordmarks and prices, with `Inter Tight Fallback` (local Arial Bold, `size-adjust` 96%, ascent 100.92%, descent 25.13%). Size-adjust measured in Chrome from canvas widths of real copy; vertical metrics from Inter's 1984/494 on 2048 UPM. No mono.

**Ladder** — tokens in `styles.css` `:root`, all `proposed` 2026-11-04 (the project had none). `rem`, display fluid with a `rem` intercept.

| Role | Name here | Size | Leading | Tracking | Weight | Tier |
|---|---|---|---|---|---|---|
| `type.display` | `--text-display` (`.hero h1`) | `clamp(3.25rem, 2.144rem + 5.29cqi, 3.8125rem)` — 52 → 61px | 1 | −0.035em | `--weight-display` 700 | `--ink` |
| `type.heading` | `--text-heading` (`.section-head h2`, `.final-card h2`) | 2rem (32px) | 1.2 | −0.02em | 600 | `--ink` |
| `type.subheading` | `--text-sub` (`.feature h3`, `.step h3`, `.plan h3`) | 1.3125rem (21px) | 1.3 | −0.01em | 600 | `--ink` |
| `type.lead` | `--text-sub` (`.lead`, `.section-sub`, `.final-card p`) | 21px | 1.55 | 0 | 400 | `--ink-2` — separates from the subheading on weight and leading |
| `type.body` | `--text-body` (`body`, `.quote blockquote`) | 1.0625rem (17px) | 1.6 | 0 | 400 | `--ink` |
| `type.supporting` | `--text-body` (`.feature p`, `.step p`, `.faq details p`, `.checks`, `.plan-desc`) | 17px | 1.5 | 0 | 400 | `--ink-2` — separates on tier and tighter leading |
| ↳ question (project role) | `.faq summary` | 17px | 1.4 | 0 | 600 | `--ink` — separates on weight |
| `type.ui` | `--text-ui` (`.btn`, `.nav a`, `.link-quiet`) | 1rem (16px) | 1 | 0 | 600 buttons · 400 nav | `--ink-2` nav |
| `type.label` | `--text-label` (`.pill`, `.chip`, `.plan-tag`, `.footer h4`, `.step-num`) | 0.875rem (14px) | 1.3 | 0 | 600 | `--ink-2` |
| ↳ eyebrow (project role) | `--text-eyebrow` (`.eyebrow`) | 0.8125rem (13px) | 1.2 | +0.08em, capitals | 600 | accent — separates on case |
| `type.meta` | `--text-label` (`.fine`, `.per`, `.plans-note`, `.logos-title`, `.quote small`, footer links) | 14px | 1.5 | 0 | 400 | `--ink-3` — separates from label on weight and tier |
| `type.data` | `.amount` | `--text-heading` 32px | 1 | −0.02em | 600, tabular | `--ink` |
| ↳ mock figures (project role) | `--text-floor` (planner, suggestion card, avatars) | 0.75rem (12px), the floor | 1.3 | 0 | 400 / 600 | per cell, tabular |
| ↳ wordmark (project role) | `.brand`, `.logo-row li` | 19px | 1 | −0.02em | 700 | artwork — off the ladder by design |

**Weights** — `--weight-regular` 400 (all reading copy, nav, meta), `--weight-strong` 600 (headings, buttons, labels, `<b>`/`<strong>`), `--weight-display` 700 (the hero headline and the wordmarks only). `font-synthesis: none`.

**Icons** — `.btn svg` 1em, the size of its label.

## Colour

**Text** — checked against `--bg` (#fff) unless noted. Measured with `scripts/contrast.mjs`.

| Role | Name here | Light | Ratio on `--bg` | Ratio on `--bg-tint` |
|---|---|---|---|---|
| `text.primary` | `--ink` | `#0d1424` | 18.38:1 | 17.17:1 |
| `text.secondary` | `--ink-2` | `#3a4356` | 9.92:1 | 9.27:1 |
| `text.tertiary` | `--ink-3` | `#6a7386` | 4.76:1 | **4.45:1** ✗ |
| `text.inverse` | `#fff` (literal, 22 uses) | `#ffffff` | 18.93:1 on `--dark` | — |
| ↳ inverse secondary (project role) | `#e7eaf2` · `#c8cedc` · `#9aa3b8` (literals) | — | 15.73 · 12.01 · 7.49:1 on `--dark` | — |
| `text.on-accent` | `#fff` (literal) | `#ffffff` | **2.85:1** on `--accent` ✗ | — |
| ↳ accent text (project role) | `--accent-ink` | `#e2512a` | **3.86:1** ✗ | **3.47:1** on `--accent-soft` ✗ |

**Surfaces**

| Role | Name here | Light |
|---|---|---|
| `surface.page` | `--bg` | `#ffffff` |
| `surface.subtle` | `--bg-tint` | `#f6f7fb` |
| `surface.raised` | `#fff` (literal on `.feature`, `.step`, `.plan`, `.faq details`, `.window`, `.suggest`) | `#ffffff` |
| `surface.hover` | `--bg-tint` (`.btn-ghost:hover`) · `#f1f2f6` (`.btn-light:hover`) | — |
| `surface.inverse` | `--dark` | `#0b1020` |
| — | `--dark-2` | `#151c30` — defined, never used |

**Lines and fills**

| Role | Name here | Light | Note |
|---|---|---|---|
| `border.default` | `--line` | `#e4e7ee` | 1.24:1 on white |
| `border.divider` | `--line-2` | `#eef0f5` | |
| `border.hover` | `#cdd2dd` · `#d6dae4` (literals) | | two values for one job |
| `border.layered` | `rgba(13, 20, 36, 0.06)` · `rgba(13, 20, 36, 0.08)` | | header and mock edges |
| `fill.strong` | `--ink` | `#0d1424` | shares the token with `text.primary` |
| `fill.strong-hover` | `#1e2840` (literal) | | |
| `mark` | `#e2e4ea` (window dots) | | |

**Signal**

| Role | Name here | Light | Note |
|---|---|---|---|
| `focus` | `--accent` | `#ff6a3d` | **2.85:1** on white ✗ (needs 3:1) |
| `accent` | `--accent` | `#ff6a3d` | best-time cell, plan tag, "Send invite", pill dot, brand mark |
| `accent.soft` (project role) | `--accent-soft` | `#fff0ea` | icon tiles, accent chip |
| `status.success` | `--ok` · `#e3f6ee` · `#0b7a4f` | `#12a26a` | fg on its bg 2.92:1 (`--ok`), 4.78:1 (`#0b7a4f`) |

**Exceptions** — chromatic spends beyond the accent, none named:

- `exception.availability.*` — the planner's three states: `--work` / `--work-soft` (blue), `--edge` / `--edge-soft` (amber), `--night` (grey). Text on them: `#1f4fae` on `--work-soft` 6.09:1, `#8a5a10` on `--edge-soft` 5.10:1, `#9aa1b0` on `--night` **2.27:1** ✗.
- `exception.person.*` — avatar gradients `.a1`–`.a4` (orange, blue, green, purple).
- Calendar provider dots `.chip .g` / `.chip .o` (`#3b82f6`, `#0ea5e9`).
- Hero, testimonial and final-card radial gradients in orange and blue.

## Layout

| Role | Name here | Value |
|---|---|---|
| `measure.wide` | `--container` | 1200px (content 1136px) |
| `measure.reading` | `.section-head` `max-width` · `.lead` / `.final-card p` | 680px · 34em |
| `gutter` | `.container` padding | 32px (20px under 640px) |
| `space.section` | `.section` · `.final` padding | 112px (72px under 640px) |
| `space.heading-below` | `.section-head` margin-bottom | 56px (40px) |
| `space.group` | grid gaps | 20px |

**Radii** — `--radius-sm` 8px, `--radius` 14px, `--radius-lg` 22px, plus literals 28px (final card), 12px (icon tile), 10px (badge), 6px (cells, focus ring), 4px, 3px, 999px pills, 50% circles. Twelve values.

**Z-index** — header 50, skip link 100. No ladder named.

**Breakpoints** — 1080px (hero and FAQ stack), 900px (nav hides, grids collapse), 640px (phone).

## Surfaces

| Level | Surface | Edge | Shadow | Layer |
|---|---|---|---|---|
| `elevation.flat` | `--bg` / `--bg-tint` | `--line` | none | — |
| `elevation.raised` | `#fff` | `--line` | `--shadow-sm` · `--shadow` (feature hover, open FAQ) | — |
| `elevation.floating` | `#fff` (`.window`, `.suggest`, `.plan-featured`) | `rgba(13,20,36,.08)` | `--shadow-lg` | — |
| sticky chrome | `rgba(255,255,255,.8)` + `saturate(180%) blur(14px)` | `rgba(13,20,36,.06)` | none | 50 |

`material.translucent` — the header only. No `@supports` guard, no reduced-transparency branch.

## Motion

| Role | Name here | Value | Used for |
|---|---|---|---|
| `duration.state` | — (inline) | 0.15s | button and nav colour |
| `duration.popover` | — (inline) | 0.2s | feature lift, FAQ border, FAQ plus icon, logo colour |
| — | `@keyframes float` | 6s, infinite | the suggestion card bobbing |
| `ease.standard` | — | `ease` (13 uses) | everything |

Reduced motion: `animation: none` and `transition: none` on everything, `scroll-behavior: auto`.

## Patterns

**Calls to action** — "Start free" (×4: header, hero, Free plan, final), "See how it works", "Start 14-day trial", "Talk to sales", "Book a demo", "Sign in". **Nouns** — team, member, teammate, calendar, meeting, invite.

## Decisions

- 2026-11-04 — The price (`.amount`, 32px) outranks its plan's name (`.plan h3`, 21px), knowingly breaking type law 3 inside a plan card: the figure is the comparison the reader came for. It is held to `--text-heading`, so it never outranks the section heading. (User decision, on Keyline's recommendation.)
- 2026-11-04 — Fonts stay on Google Fonts rather than self-hosted (type law 12): self-hosting needs the font files downloaded into the project, which this pass didn't do. The weights requested are trimmed to the four used and each family has a metric-matched fallback. (User decision; open to revisit.)
- 2026-11-04 — Preset `expressive`. (User decision.)
- 2026-11-04 — Light theme only, with the testimonials and closing call to action as inverted bands; no dark theme is planned. (User decision: keep the theming the page already has.)

## Open issues

- `focus` (`--accent` #ff6a3d) is 2.85:1 on white — under the 3:1 a focus ring needs. `styles.css:76`.
- `text.on-accent`: white on `--accent` is 2.85:1 — "Send invite", "Most popular" tag and the best-time cells fail 4.5:1. `styles.css:420, 530, 900`.
- `--accent-ink` used as text is 3.86:1 on white and 3.47:1 on `--accent-soft` — every eyebrow, the "15" hour label and the accent chip fail 4.5:1 (the icon-tile strokes, at 3.47:1, clear the 3:1 icons need). `styles.css:634, 679, 782`.
- `text.tertiary` (`--ink-3`) is 4.45:1 on `--bg-tint` — FAQ intro and step copy on tinted bands. Used 14 times.
- Planner "off" cells: `#9aa1b0` on `--night` 2.27:1. Logo names `#7c8496` on white 3.75:1. `--ok` checkmarks on `#e3f6ee` 2.92:1.
- `--ink` does two jobs: `text.primary` and `fill.strong` (primary button, step numbers, skip link).
- 64 raw colour literals bypass the tokens (detector: `color/raw-color`); `#fff` alone 22 times. `--work`, `--edge`, `--dark-2` defined and never used.
- Boxes as the default: six feature cards in a tile grid, three step cards, three quote cards, three plan cards, six FAQ cards, a final card — 22 boxes below the hero, each holding one object; plus five uppercase eyebrows, five chip shapes (`.pill`, `.chip`, `.window-chip`, `.plan-tag`, `.suggest-btn`) and green "Connected"/"Invite sent" chips on steps the reader only passes through.
- Twelve radius values; 28px final card and 22px cards on no ladder relationship with their padding.
- z-index 50 and 100 typed inline, no ladder.
- Translucent header has no `@supports` guard and no `prefers-reduced-transparency` branch.
- Durations typed inline (0.15s, 0.2s, 6s); one curve, `ease`, for everything; the suggestion card loops forever.
