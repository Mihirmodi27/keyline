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

**Text** — measured with `scripts/contrast.mjs`. Light page; the dark bands have their own ladder.

| Role | Name here | Value | On `--bg` | On `--bg-tint` (worst light surface) |
|---|---|---|---|---|
| `text.primary` | `--ink` | `#0d1424` | 18.38:1 | 17.17:1 |
| `text.secondary` | `--ink-2` | `#3a4356` | 9.92:1 | 9.27:1 |
| `text.tertiary` | `--ink-3` | `#636c7f` | 5.27:1 | 4.93:1 (4.63:1 on `--night`) |
| `text.on-accent` | `--ink-on-accent` (proposed) → `--ink` | `#0d1424` | 6.46:1 on `--accent` | — |
| ↳ accent as text (project role) | `--accent-ink` | `#c2410c` | 5.18:1 | 4.84:1 · 4.66:1 on `--accent-soft` |
| `text.inverse` | `--ink-on-dark` (proposed) | `#ffffff` | 18.93:1 on `--dark` | — |
| ↳ inverse secondary | `--ink-on-dark-2` (proposed) | `#c8cedc` | 12.01:1 on `--dark`, 5.50:1 on the final card's warm corner (`#78392d`) | — |
| ↳ inverse tertiary | `--ink-on-dark-3` (proposed) | `#9aa3b8` | 7.49:1 on `--dark`, 6.35:1 on a quote card | — |
| ↳ accent on dark | `--accent-on-dark` (proposed) | `#ff9a78` | 9.15:1 on `--dark` | — |

Ladder steps: 18.38 → 9.92 (1.85×) → 5.27 (1.88×); on dark 18.93 → 12.01 (1.58×) → 7.49 (1.60×). Dial minimum 1.25×.

**Surfaces**

| Role | Name here | Value |
|---|---|---|
| `surface.page` | `--bg` | `#ffffff` |
| `surface.subtle` | `--bg-tint` | `#f6f7fb` |
| `surface.raised` | `--bg-raised` (proposed) | `#ffffff` |
| `surface.hover` | `--bg-hover` (proposed) | `#f1f2f6` |
| `surface.inverse` | `--dark` | `#0b1020` |
| ↳ raised on dark | `--dark-raised` (proposed) | `rgba(255,255,255,.04)` |
| `material.translucent` tint | `--bg-chrome` (proposed) | `rgba(255,255,255,.8)` |

**Lines and fills**

| Role | Name here | Value | Note |
|---|---|---|---|
| `border.default` | `--line` | `#e4e7ee` | |
| `border.divider` | `--line-2` | `#eef0f5` | |
| `border.hover` | `--line-strong` (proposed) | `#d3d8e2` | replaces `#cdd2dd` and `#d6dae4` |
| `border.layered` | `--line-layered` (proposed) · `--line-on-dark` | `rgba(13,20,36,.08)` · `rgba(255,255,255,.1)` | |
| `fill.strong` | `--ink` | `#0d1424` | still shares its token with `text.primary` (see open issues) |
| `fill.strong-hover` | `--ink-hover` (proposed) | `#1e2840` | |
| `mark` | `--mark` (proposed) | `#c4c9d4` | window dots |

**Signal**

| Role | Name here | Value | Note |
|---|---|---|---|
| `focus` | `--focus` (proposed) | `#e2512a` | 3.86:1 on `--bg`, 3.60:1 on `--bg-tint`, 3.47:1 on `--accent-soft`, 4.91:1 on `--dark`. Re-pointed to `--ink-on-dark` inside `.final-card` (8.67:1 on its warm corner) |
| `accent` | `--accent` | `#ff6a3d` | brand: the best-time cell, the "Most popular" tag, "Send invite", the pill dot, the brand mark, the washes |
| `accent.soft` | `--accent-soft` · `--accent-line` | `#fff0ea` · `#ffd3c3` | icon tiles, the accent chip |
| `status.success` | `--ok` (fg) · `--ok-soft` (bg) · `--ok-line` | `#0b7a4f` · `#e3f6ee` · `#bfe8d5` | fg 4.78:1 on its tint. Used where the outcome is the news: "Best time found", "Invite sent" — each with a check glyph |

**Exceptions** (expressive allows ≤ 4, each named)

1. `exception.availability` — `--work*` (blue), `--edge*` (amber), `--night*`: the planner's working / flexible / off hours. Only inside the product mock. Off hours carry a dashed edge (`--night-line`, 3.12:1) so the state survives without hue.
2. `exception.person` — `--person-1`…`--person-4` (rose, violet, teal, slate): who a row or quote belongs to. Chosen off the accent, availability and success hues; only the avatar disc takes them.
3. Brand washes — `--wash-hero`, `--wash-dark`, `--wash-final`: accent orange and the availability blue as atmosphere behind content, never on text or controls.

Done states: "Connected" (a step the reader passes through) is a neutral chip with an ink check; pricing ticks are ink on a neutral disc — inclusion, not success.

## Layout

| Role | Name here | Value |
|---|---|---|
| `measure.reading` | `--measure` (proposed) | 33rem (528px) — 62 characters of 17px Inter. Every lead, section intro, FAQ answer and the closing paragraph |
| `measure.wide` | `--container` | 1200px (content 1136px) |
| `gutter` | `--gutter` (proposed) | 32px; 20px under `bp.phone` |
| `space.tight` | `--space-tight` (proposed) | 8px — a heading to its text, chips in a row |
| `space.group` | `--space-group` (proposed) | 24px — grid gaps, inside cards between groups |
| `space.heading-below` (section) | `--space-head` (proposed) | 40px; 24px under `bp.phone` |
| `space.section` | `--space-section` (proposed) | 128px; 80px under `bp.phone`. Pair ratio 3.2 : 1 (3.3 : 1 on phones) |
| `hairline.chrome` · `hairline.object` | `--hairline` (proposed) | 1px |
| `rule.emphasis` | `--rule-emphasis` (proposed) | 3px — the focus ring; the featured plan's edge is 2px (object, emphasised) |

**Radii** — `--radius-sm` 8px (small: cells, badges, skip link) · `--radius` 12px (control: icon tiles, FAQ rows) · `--radius-lg` 20px (card) · `--radius-xl` 28px (container: the closing band) · 999px pills (chips, buttons) · 50% (avatars, dots, legend swatches). The suggestion badge nests at 20 − 16 = 4px.

**Chips** — one shape per size: 14px label, 6px × 12px padding, pill (`.pill`, `.chip`, `.plan-tag`); the mock's own chip (`.window-chip`) is the 12px size.

**Z ladder** — `--z-nav` 50 (sticky header) · `--z-skip` 100 (skip link, moved off-screen by `transform`).

**Breakpoints** — `bp.hero-stacks` 1080px (hero copy and product visual stack; FAQ to one column) · `bp.nav-wraps` 900px (section links move to a second header row, grids collapse) · `bp.phone` 640px (one column, tighter gutter and rhythm).

**Anchors** — every `[id]` has `scroll-margin-top` of the header height + `--space-group`.

## Surfaces

| Level | Used on | Surface | Edge | Shadow | Layer |
|---|---|---|---|---|---|
| `elevation.flat` | sections, features, steps, quotes, FAQ rows (unboxed — space and hairlines); plan cards; buttons; chips | `--bg` / `--bg-tint` / `--bg-raised` | `--line` 1px where an object needs one | none | — |
| `elevation.raised` | the sticky header; the featured plan (a named brand object) | `--bg-chrome` over `--bg-raised` · `--bg-raised` | `--line-layered` · 2px `--ink` | none · `--shadow` | `--z-nav` · — |
| `elevation.floating` | the product visual (`.window`, `.suggest`) — art | `--bg-raised` | `--line-layered` | `--shadow-lg`: contact + 2 ambient + inset highlight, peak 16% | — |

No `elevation.overlay` (nothing modal on the page). The closing call to action (`.final-card`) is the one named brand band: `--wash-final` on `--radius-xl`, flat.

**Cards** — 4 below the hero (3 plans, the closing band), down from 22. Features, steps and quotes sit on the page, parted by space and a top hairline; FAQ rows are a list parted by `--line`.

**Material** — one translucent surface, the header, at the chrome tier:

| Tier | Blur | Saturate | Tint | Fallback | Used on |
|---|---|---|---|---|---|
| chrome | 20px | 1.8 | `--bg-chrome` 80% white | opaque `--bg-raised` baseline, material inside `@supports`; reduced transparency → opaque and no filter; more contrast → `--ink` edge; forced colours → `CanvasText` edge | `.site-header` |

Header text (`--ink-2`) over the tint composited on the darkest backdrop it crosses (`--dark`): 6.37:1.

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

- 2026-11-04 — `measure.wide` stays capped at 1200px rather than the expressive dial's "viewport minus two gutters": the three-up grids of features, steps, quotes and plans would stretch past readable card widths on large screens. Bands still run full-bleed. (User decision, on Keyline's recommendation.)
- 2026-11-04 — The price (`.amount`, 32px) outranks its plan's name (`.plan h3`, 21px), knowingly breaking type law 3 inside a plan card: the figure is the comparison the reader came for. It is held to `--text-heading`, so it never outranks the section heading. (User decision, on Keyline's recommendation.)
- 2026-11-04 — Fonts stay on Google Fonts rather than self-hosted (type law 12): self-hosting needs the font files downloaded into the project, which this pass didn't do. The weights requested are trimmed to the four used and each family has a metric-matched fallback. (User decision; open to revisit.)
- 2026-11-04 — Preset `expressive`. (User decision.)
- 2026-11-04 — Light theme only, with the testimonials and closing call to action as inverted bands; no dark theme is planned. (User decision: keep the theming the page already has.)

## Open issues

- `--ink` does two jobs: `text.primary` and `fill.strong` (primary button, step numbers, skip link).
- `--dark-2` and `--edge` are defined and never used.
- Durations typed inline (0.15s, 0.2s, 6s); one curve, `ease`, for everything; the suggestion card loops forever.
