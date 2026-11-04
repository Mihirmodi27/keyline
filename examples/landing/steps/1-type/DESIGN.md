# Design system

> Keyline reads this before touching UI, and writes back to it when a decision changes. Edit it by hand whenever you like — it is the source of truth for intent, the code is the source of truth for values. Set up 2026-11-04.

## Profile

| | |
|---|---|
| Product | Tandem — finds meeting times across time zones for remote teams. This is its one landing page |
| Reader | Being persuaded: a team lead seeing the product once, deciding whether to start free |
| Preset | `expressive` |
| Areas | — (one page) |
| Stack | Static HTML + one hand-written stylesheet, no framework, no build |
| Tokens live in | `styles.css` `:root` (28 custom properties) |
| Themes | `light` only. Two sections (testimonials `.section-dark`, `.final-card`) are dark bands on the light page, not a theme |
| Motion | CSS only |

Evidence for `expressive`: a single marketing page with a 68px display headline over 16px body, two radial-gradient hero and band backgrounds, a brand orange accent, a floating product mock — everything is aimed at one visit and one decision (Start free). User confirmed the preset.

## Type

**Families** — `family.text`: Inter (Google Fonts, 400/600) with `"Inter Fallback"`, a metric-matched local Arial (`size-adjust` 106.7% / 102.1% at 600, measured). `family.display`: Inter Tight (600/700) on `h1`–`h4`, `.brand`, `.amount`, `.step-num`, logo wordmarks, with `"Inter Tight Fallback"` (96.7%). `font-synthesis: none`.

| Role | Name here | Size | Leading | Tracking | Weight | Tier |
|---|---|---|---|---|---|---|
| `type.display` | `.hero h1` | `clamp(3.25rem, 2.39rem + 4.12cqi, 3.75rem)` (52 → 60px), container units on `.hero-copy` | 1.02 | −0.035em | `--weight-display` 700 | `--ink` |
| `type.heading` | `--text-heading` (`.section-head h2`, `.final-card h2`) | `clamp(1.75rem, 1.543rem + 0.884vw, 2.25rem)` (28 → 36px) | 1.2 | −0.02em | 600 | `--ink` |
| `type.subheading` | `--text-sub` (`.feature h3`, `.step h3`, `.plan h3`) | 1.3125rem (21px) | 1.3 | −0.01em | 600 | `--ink` |
| `type.lead` | `--text-lead` (`.lead`) | 1.1875rem (19px) | 1.6 | 0 | 400 | `--ink-2` |
| `type.supporting` | `--text-lead` (`.section-sub`, `.final-card p`) | 19px | 1.5 — separates from the lead on leading and position | 0 | 400 | `--ink-2` |
| `type.body` | `--text-body` (`body`, card copy, FAQ answers, quotes) | 1.0625rem (17px) | 1.6 | 0 | 400 | `--ink`, `--ink-2` in cards |
| ↳ FAQ question (project role) | `.faq summary` | 17px | 1.4 | 0 | 600 — separates on weight | `--ink` |
| `type.ui` | `--text-ui` (`.btn`, `.nav a`, `.checks`, `.plan-desc`) | 0.9375rem (15px) | 1 in controls; 1.5 where it wraps | 0 | 600 buttons / 400 nav | — |
| `type.meta` | `--text-meta` (`.fine`, `.per`, `.plans-note`, footer, `.btn-sm`, `.chip`, `.pill`) | 0.875rem (14px) | 1.4–1.5 | 0 | 400 | `--ink-3` |
| ↳ eyebrow (project role under `type.label`) | `--text-eyebrow` (`.eyebrow`, `.plan-tag`) | 0.8125rem (13px) | 1.2 | +0.08em caps on `.eyebrow` | 600 | accent — eyebrow separates on case, tag on its fill |
| `type.data` | `--text-price` (`.amount`) | 3rem (48px) | 1 | −0.03em | 600, tabular | `--ink` |

The product visual (`.product`, `role="img"`) is artwork and keeps its own px sizes (10–14px), off the ladder by type law 1.

**Weights** — `--weight-regular` 400 (reading, nav), `--weight-strong` 600 (headings, buttons, labels, `b`/`strong`), `--weight-display` 700 (the hero headline only). Eight sizes above the floor excluding display.

## Colour

**Text** — checked against `surface.page` (`#ffffff`) unless noted. Measured with `contrast.mjs`.

| Role | Name here | Light | Ratio |
|---|---|---|---|
| `text.primary` | `--ink` | `#0d1424` | 18.38:1 |
| `text.secondary` | `--ink-2` | `#3a4356` | 9.92:1 (9.27:1 on `--bg-tint`) |
| `text.tertiary` | `--ink-3` | `#6a7386` | 4.76:1 — **4.45:1 on `--bg-tint`** |
| `text.inverse` | `#fff` (literal) | `#ffffff` | 18.38:1 on `--ink` |
| ↳ dark band primary | `#e7eaf2` (literal) | | 15.73:1 on `--dark` |
| ↳ dark band tertiary | `#9aa3b8` (literal) | | 7.49:1 on `--dark` |
| `text.on-accent` | `#fff` on `--accent` | | **2.85:1** |
| ↳ accent as text | `--accent-ink` | `#e2512a` | **3.86:1** (3.60:1 on `--bg-tint`, 3.47:1 on `--accent-soft`) |

**Surfaces**

| Role | Name here | Light |
|---|---|---|
| `surface.page` | `--bg` | `#ffffff` |
| `surface.subtle` | `--bg-tint` | `#f6f7fb` |
| `surface.raised` | `#fff` (literal) | `#ffffff` |
| `surface.hover` | `--bg-tint`, `#f1f2f6` (literal) | |
| `surface.inverse` | `--dark` | `#0b1020` |

**Lines and fills**

| Role | Name here | Light |
|---|---|---|
| `border.default` | `--line` | `#e4e7ee` (1.24:1 on white) |
| `border.divider` | `--line-2` | `#eef0f5` |
| `border.hover` | `#d6dae4`, `#cdd2dd` (literals) | |
| `fill.strong` | `--ink` | `#0d1424` |
| `fill.strong-hover` | `#1e2840` (literal) | |

**Signal**

| Role | Name here | Light | Ratio |
|---|---|---|---|
| `accent` | `--accent` | `#ff6a3d` | — |
| `focus` | `--accent` (shared) | `#ff6a3d` | **2.85:1** on white, 2.66:1 on `--bg-tint` (needs 3:1) |
| `status.success` | `--ok` · `#e3f6ee` · `#0b7a4f` | | `#0b7a4f` on `#e3f6ee` 4.78:1; `--ok` on `#e3f6ee` 2.92:1 |

**Exceptions** — chromatic spends beyond the accent.

| Exception | Name here | For |
|---|---|---|
| Planner hours | `--work`/`--work-soft`, `--edge`/`--edge-soft`, `--night` | Working / flexible / off hours in the product visual; `.cells .n` text 2.27:1 |
| Avatars | `.a1`–`.a4` gradients | Telling four people apart |
| Background washes | hero and dark-band radial gradients, orange + blue | Brand atmosphere |
| Calendar dots | `.chip .g`, `.chip .o` | Google / Outlook |

## Layout

| Role | Name here | Value |
|---|---|---|
| `measure.wide` | `--container` | 1200px (incl. 32px padding) |
| `measure.reading` | `.section-head` max-width / `.lead` | 680px / 34em — no shared token |
| `gutter` | `.container` padding | 32px (20px ≤ 640px) |
| `space.section` | `.section` padding | 112px (72px ≤ 640px) |
| `space.heading-below` | `.section-head` margin-bottom | 56px (40px ≤ 640px) |
| `space.group` | grid gaps | 20px |

**Radius ladder**

| Role | Name here | Value |
|---|---|---|
| `radius.pill` | `999px` | buttons, chips, pill |
| `radius.small` | `--radius-sm` | 8px (skip link only); cells 6px, sw 3px, badge 10px, icon 12px as literals |
| `radius.control` | `--radius` | 14px (FAQ items, suggestion card) |
| `radius.card` | `--radius-lg` | 22px |
| `radius.container` | `.final-card` | 28px (literal) |

**z-index ladder**

| Role | Name here | Value |
|---|---|---|
| `z.nav` | `.site-header` | 50 |
| `z.skip-link` | `.skip` | 100 |

**Breakpoints**

| Role | Name here | Value | What changes |
|---|---|---|---|
| `bp.stack-hero` | `max-width: 1080px` | 1080px | Hero and FAQ stack to one column |
| `bp.nav` | `max-width: 900px` | 900px | Nav links hide; features 2 columns; steps, quotes, plans one column |
| `bp.phone` | `max-width: 640px` | 640px | Gutter 20px; planner compacts; features one column |

## Surfaces

| Level | Surface | Edge | Shadow | Layer |
|---|---|---|---|---|
| `elevation.flat` | `#fff` | `--line` | — | — (feature, plan, FAQ) |
| `elevation.raised` | `#fff` | `--line` | `--shadow-sm` / `--shadow` on hover | — (step, ghost button, feature hover) |
| `elevation.floating` | `#fff` | `rgba(13,20,36,.08)` | `--shadow-lg` | — (window, suggestion card, featured plan) |
| sticky header | `rgba(255,255,255,.8)` + `saturate(180%) blur(14px)` | `rgba(13,20,36,.06)` | — | 50 |

`material.translucent` — the header only. No `@supports` guard, no `prefers-reduced-transparency` branch.

## Motion

| Role | Name here | Value | Used for |
|---|---|---|---|
| `duration.state` | `0.15s` (literal) | 150ms | button, nav colour |
| `duration.popover` | `0.2s` (literal) | 200ms | feature hover lift, FAQ open, logo colour, FAQ icon rotate |
| `ease.standard` | `ease` (literal) | `ease` | everything |

**Named exemptions** — none recorded. `float` (6s, `ease-in-out`, infinite) on `.suggest` is a loop with no exemption.

Reduced motion: every animation and transition removed (`!important`), smooth scroll off.

## Patterns

**Nouns** — meeting, teammate, team, calendar, invite. **Primary action** — "Start free" (header, hero, Free plan, final CTA).

## Decisions

- 2026-11-04 — Section and final-CTA headings capped at 36px (were 44px and 52px), so the hero display clears 1.5× them at every width. (Law; type law 3, display tier.)
- 2026-11-04 — Preset `expressive`. (User decision.)
- 2026-11-04 — Keep the existing theming: light page with two dark bands, no dark theme added. (User decision.)

## Open issues

Type
- Fonts load from Google Fonts, not self-hosted, and the display file isn't preloaded (type law 12). Metric-matched local fallbacks now hold the lines if the swap happens; self-hosting needs the font files downloaded into the project.

Colour
- Accent-as-text `--accent-ink` 3.86:1 on white, 3.60:1 on `--bg-tint` — every eyebrow fails (colour law 3).
- White on `--accent` 2.85:1: `.plan-tag`, `.suggest-btn`, `.cells .best` (colour law 3).
- Focus ring `--accent` 2.85:1 on white, 2.66:1 on `--bg-tint` (colour law 5).
- `--ink-3` 4.45:1 on `--bg-tint` (`.fine`-style meta in tinted sections) (colour law 3).
- Logo wordmarks `#7c8496` 3.75:1; planner "off" cells `#9aa1b0` on `--night` 2.27:1 (colour law 3).
- 64 raw colour literals bypass the tokens, incl. `#fff` ×22 (colour law 1).
- Success green spent on a sequence the reader passes through (`.chip.ok` "Connected", "Invite sent") and on all 14 pricing ticks (colour law 7).
- Orange + blue washes, blue planner, four avatar hues, green ticks: chromatic spends not named or counted (colour law 7).

Layout
- Boxes per screen: 6 feature cards, 3 step cards, 3 quote cards, 3 plan cards, 6 FAQ boxes, 1 final card, 2 product-visual windows, 8 chips — 32 boxes; features, steps and quotes are tile grids (layout law 3, depth law 2).
- Radii off a ladder: 3, 4, 6, 8, 10, 12, 14, 22, 28, 999px (layout law 5).
- Reading measures typed per element (680px, 34em, 24em, 16ch, 11ch) — no shared token (layout law 1).
- Section rhythm symmetric: 112px top and bottom on every section, so headings don't group with what follows (layout law 2).

Depth
- Translucent header with no `@supports` guard and no reduced-transparency branch (depth law 15).
- Cards for every feature, step and quote — content that could sit on the page (depth law 2).
- Shadows defined three ways: tokens, a raw button shadow, a coloured glow on `.cells .best` (depth law 4).

Motion
- `.suggest` floats forever (6s infinite) — a loop that makes no change legible (motion laws 1, 15).
- No duration or easing tokens; `ease` everywhere (motion laws 2, 5).
- Reduced motion removes everything with `!important` rather than substituting (motion law 10).
- Feature cards lift on hover though they aren't clickable (motion law 1).

Patterns
- Two different primary labels for the same action ("Start free", "Start 14-day trial") — check (patterns law 1).
