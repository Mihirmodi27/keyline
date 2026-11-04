# Design system

> Keyline reads this before touching UI, and writes back to it when a decision changes. Edit it by hand whenever you like — it is the source of truth for intent, the code is the source of truth for values. Set up 2026-11-04.

## Profile

| | |
|---|---|
| Product | Tandem's landing page: an app that finds meeting times across time zones for remote teams |
| Reader | Being persuaded — a visitor seeing the product once, deciding whether to start free |
| Preset | `expressive` |
| Areas | — (one page) |
| Stack | Static HTML and CSS, no framework, no build step; `index.html` + `styles.css` |
| Tokens live in | `styles.css` `:root` (28 custom properties) |
| Themes | `light` only, no theme mechanism. Two inverted bands (`.section-dark`, `.final-card`) sit on `--dark` inside the light page |
| Motion | CSS only: `transition` on hovers, one `@keyframes float` loop |

## Type

**Families** — `family.text`: Inter (`--font`, Google Fonts `<link>`, 400 and 600 requested); `family.display`: Inter Tight (`--font-display`, 600 and 700 requested) on `h1`–`h4`, FAQ questions, prices and step numbers. Each has a metric-matched local fallback (`"Inter Fallback"`, `"Inter Tight Fallback"` over Arial, `size-adjust` and vertical overrides measured in Chrome). `font-synthesis: none` on `body`.

Type tokens (proposed, 2026-11-04) live in `styles.css` `:root`, in `rem`. Seven sizes above the 12px floor, excluding display.

| Role | Name here | Size | Leading | Tracking | Weight | Tier |
|---|---|---|---|---|---|---|
| `type.display` | `--text-display` (`.hero h1`) | clamp(3rem, 2.6rem + 1.7vw, 3.875rem) (48px at 375 → 62px at 1200) | 1.02 | −0.03em | `--weight-display` 700 | `text.primary` |
| `type.heading` | `--text-heading` (`.section-head h2`, `.final-card h2`) | clamp(1.75rem, 1.409rem + 1.455vw, 2.5rem) (28 → 40px) | 1.2 | −0.02em | 600 | `text.primary` |
| `type.subheading` | `--text-subheading` (`.feature h3`, `.step h3`, `.plan h3`) | 1.25rem (20px) | 1.3 | −0.01em | 600 | `text.primary` |
| ↳ question (project role) | `.faq summary` | 1.0625rem (17px) | 1.4 | −0.01em | 600, Inter Tight | `text.primary` — separated from body by weight and family |
| `type.lead` | `--text-lead` (`.lead`) | 1.25rem (20px) | 1.55 | 0 | 400 | `text.secondary` — separated from subheading by weight and leading |
| `type.body` | `--text-body` (`body`, `.quote blockquote`) | 1.0625rem (17px) | 1.6 | 0 | 400 | `text.primary` |
| `type.supporting` | `--text-body` (`.section-sub`, `.feature p`, `.step p`, `.plan-desc`, `.faq p`, `.final-card p`) | 1.0625rem (17px) | 1.5 | 0 | 400 | `text.secondary` — separated from body by tier and leading |
| `type.ui` | `--text-ui` (`.btn`, `.nav a`, `.checks`, `.step-num`) | 1rem (16px) | 1 / 1.4 wrapping | 0 | 600 buttons, 400 links and lists | — |
| `type.meta` | `--text-meta` (`.fine`, `.plans-note`, `.per`, `.logos-title`, footer, quote attribution) | 0.875rem (14px) | 1.5 | 0 | 400 | `text.tertiary` |
| ↳ group label | `.footer h4`, `.quote b` | 0.875rem (14px) | 1.2 / 1.5 | 0 | 600 | `text.primary` — separated by weight and tier |
| `type.label` | `--text-label` (`.pill`, `.plan-tag`, `.suggest-btn`) | 0.8125rem (13px) | 1.2 | 0 | 600 | — |
| ↳ eyebrow | `.eyebrow` | 0.8125rem (13px) | 1.2 | +0.08em, uppercase | 600 | — separated from label by case |
| ↳ chip | `.chip` (step illustrations) | 0.8125rem (13px) | 1.2 | 0 | 400 | `text.secondary` |
| `type.data` | `--text-price` (`.amount`) | 3rem (48px) | 1 | −0.03em | 600, tabular | `text.primary` |
| ↳ product visual | `--text-fine` (`.cells i`, `.hours-scale`, `.who small`, `.legend`, `.suggest-list`, avatars) | 0.75rem (12px), the floor | 1.4 | 0 | 400 / 600 | tabular |

**Weights** — `--weight-regular` 400 (reading, links, lists), `--weight-strong` 600 (headings, labels, button labels, `<b>`), `--weight-display` 700 (the hero only). The wordmark and the customer logo names stay at 700/19px as artwork (type law 1's artwork exemption).

**Icons** — 18px beside 16px button text; feature icons 22px in their 44px tile.

## Colour

**Text** — on `surface.page` (`#ffffff`) and on the worst light surface, `surface.subtle` (`#f6f7fb`).

| Role | Name here | Light | Ratio on page | Ratio on `--bg-tint` |
|---|---|---|---|---|
| `text.primary` | `--ink` | `#0d1424` | 18.38:1 | 17.17:1 |
| `text.secondary` | `--ink-2` | `#3a4356` | 9.92:1 | 9.27:1 |
| `text.tertiary` | `--ink-3` | `#6a7386` | 4.76:1 | **4.45:1** |
| `text.inverse` | `#fff` (literal) | `#ffffff` | 18.38:1 on `--ink` | — |
| `text.on-accent` | `#fff` (literal) | `#ffffff` | **2.85:1** on `--accent` | — |

On the inverted bands (`--dark` `#0b1020`): `#ffffff` 18.93:1, `#e7eaf2` 15.73:1, `#c8cedc` 12.01:1, `#9aa3b8` 7.49:1 — all literals, no tokens.

**Surfaces**

| Role | Name here | Light |
|---|---|---|
| `surface.page` | `--bg` | `#ffffff` |
| `surface.subtle` | `--bg-tint` | `#f6f7fb` |
| `surface.raised` | `#fff` (literal) | `#ffffff` |
| `surface.hover` | `--bg-tint` (`.btn-ghost`), `#f1f2f6` (`.btn-light`) | — |
| `surface.inverse` | `--dark` | `#0b1020` |

**Lines and fills**

| Role | Name here | Light |
|---|---|---|
| `border.default` | `--line` | `#e4e7ee` (1.24:1 on white) |
| `border.divider` | `--line-2` | `#eef0f5` |
| `border.hover` | `#d6dae4`, `#cdd2dd` (literals) | — |
| `fill.strong` | `--ink` | `#0d1424` |
| `fill.strong-hover` | `#1e2840` (literal) | — |

**Signal**

| Role | Name here | Light | Ratio |
|---|---|---|---|
| `accent` | `--accent` | `#ff6a3d` | 2.85:1 on white |
| ↳ accent as text | `--accent-ink` | `#e2512a` | 3.86:1 on white, 3.60:1 on `--bg-tint`, 3.47:1 on `--accent-soft` |
| ↳ accent tint | `--accent-soft` | `#fff0ea` | — |
| `focus` | `--accent` (shared) | `#ff6a3d` | **2.85:1** on white — below 3:1 |
| `status.success.fg` · `.bg` · `.solid` | `#0b7a4f` (literal) · `#e3f6ee` (literal) · `--ok` `#12a26a` | — | 4.78:1 fg on bg |

**Exceptions** — chromatic spends beyond the accent, as found:

- `exception.hours.*` — the planner's three availability states: `--work`/`--work-soft` (blue, working), `--edge`/`--edge-soft` (amber, flexible), `--night` (grey, off). Answers "is this hour inside someone's day?" in the product visual. Cell text: 6.09:1, 5.10:1, **2.27:1** (off).
- `exception.person.1–4` — avatar gradients `.a1`–`.a4` (orange, blue, green, violet).
- Hero and inverted-band glows — orange and blue radial gradients behind `.hero`, `.section-dark`, `.final-card`.
- Calendar-provider dots in step 1 (`#3b82f6`, `#0ea5e9`).

## Layout

| Role | Name here | Value |
|---|---|---|
| `measure.frame` | `--container` | 1200px, `.container` padding 32px |
| `measure.reading` | — | none: `.lead` 34em, `.section-head` 680px, `.final-card p` 34em, `.footer-brand p` 24em |
| `gutter` | `.container` padding | 32px (20px under 640px) |
| `space.section` | `.section` · `.final` padding | 112px (72px under 640px); hero 88/96px; logos 48/56px |
| `space.heading-above` · `space.heading-below` | eyebrow→h2 12px, h2→sub 16px, head→content 56px | — |
| `space.group` | grid gaps | 20px (cards), 12px (FAQ) |

**Radius ladder**

| Role | Name here | Value |
|---|---|---|
| `radius.pill` | `999px` | 999px (buttons, pill, chips, plan tag) |
| `radius.small` | `--radius-sm` | 8px (skip link) — plus strays 3, 4, 6, 10, 12px |
| `radius.card` | `--radius` | 14px (suggest card, FAQ items) |
| `radius.container` | `--radius-lg` | 22px (window, features, steps, quotes, plans); `.final-card` 28px literal |

**z-index ladder**

| Role | Name here | Value |
|---|---|---|
| `z.nav` | `.site-header` | 50 |
| `z.skip-link` | `.skip` | 100 |

**Breakpoints**

| Role | Name here | Value | What changes |
|---|---|---|---|
| `bp.stack-hero` | `@media (max-width: 1080px)` | 1080px | Hero and FAQ go to one column |
| `bp.tablet` | `@media (max-width: 900px)` | 900px | Nav hides; features 2-up; steps, quotes, plans single column |
| `bp.phone` | `@media (max-width: 640px)` | 640px | Gutter 20px; planner collapses to initials; suggestion card joins the flow |

## Surfaces

| Level | Surface | Edge | Shadow | Layer |
|---|---|---|---|---|
| `elevation.flat` | `#fff` on `--bg` / `--bg-tint` | `--line` | none (`.feature`, `.plan`, FAQ) | — |
| `elevation.raised` | `#fff` | `--line` | `--shadow-sm` (`.step`, `.btn-ghost`, `.pill`); `--shadow` on hover (`.feature`, open FAQ) | — |
| `elevation.floating` | `#fff` | `rgba(13,20,36,.08)` | `--shadow-lg` (`.window`, `.suggest`, `.plan-featured`) | — |
| chrome | `rgba(255,255,255,.8)` + `saturate(180%) blur(14px)` | `rgba(13,20,36,.06)` | none | `z.nav` 50 |

`material.translucent` — the sticky header only; no `@supports` guard, no reduced-transparency branch.

## Motion

No motion tokens; every value inline.

| Role | Name here | Value | Used for |
|---|---|---|---|
| `duration.state` | inline | 150ms | button, nav and link colour; button press transform |
| ↳ (stray) | inline | 200ms | feature-card lift, logo colour, FAQ border/shadow and icon rotation |
| `ease.standard` | `ease` | `ease` | everything |

| Exemption | Values | Why |
|---|---|---|
| Suggestion card float | 6s `ease-in-out` infinite | None recorded — a loop |

Reduced motion: a blanket `animation: none !important; transition: none !important` on `*`.

## Patterns

**Nouns** — meeting, teammate, time zone, working hours, invite. **Primary action** — "Start free" (header, hero, Free plan, final CTA). **Secondary** — "See how it works", "Talk to sales", "Book a demo".

## Decisions

- 2026-11-04 — Hero headline derived from its 506px column at about 19 characters a line: 62px at most, not 68px, and no `max-width: 11ch` forcing three lines. (Law; type display tier.)
- 2026-11-04 — The closing CTA heading uses `--text-heading`, not a 52px size of its own: one display moment per page. (Law; type law 3.)
- 2026-11-04 — Body and supporting copy at 17px (the expressive dial's floor, Inter's large x-height), card copy no longer at 15px. (Law; type dials.)
- 2026-11-04 — Light only, with the two inverted bands kept: no second theme planned. (User decision: keep the theming the page already has.)
- 2026-11-04 — Preset `expressive`: a landing page whose reader is being persuaded. (User decision.)

## Open issues

Type
- Fonts come from Google Fonts, not self-hosted: two extra origins before the first frame's text (type law 12). The fallbacks are metric-matched, so the swap no longer reflows; self-hosting needs the font files downloaded into the project.

Colour
- `text.tertiary` `--ink-3` is 4.45:1 on `--bg-tint` — below 4.5:1 where it lands in tinted sections (colour law 3).
- `text.on-accent` white on `--accent` is 2.85:1 — `.plan-tag`, `.suggest-btn`, `.cells .best` (colour law 3).
- `--accent-ink` as text is 3.86:1 on white and 3.60:1 on `--bg-tint` — the eyebrows, the best hour label, `.chip.accent` (3.47:1) (colour law 3).
- `focus` shares `--accent` at 2.85:1 on white — below 3:1 (colour law 5).
- Off-hours cell numerals `#9aa1b0` on `--night` are 2.27:1; logo names `#7c8496` are 3.75:1 (colour law 3).
- 70 distinct colour literals; `#fff` typed 22 times for three jobs (raised surface, inverse text, on-accent text) (colour law 1).
- Success green spent on step chips ("Connected", "Invite sent") in a sequence the reader passes through, and on every pricing check (colour law 7).

Layout
- No shared reading measure: 34em, 680px, 24em and 16ch for running text (layout law 1).
- Off-ladder radii 3, 4, 6, 10, 12, 28px beside the 8/14/22 ladder (layout law 5).
- Section heads are centred over left-aligned card grids, with 56px below the head and 12px above the h2 (layout law 2).

Depth
- 22 boxes on the one screen: 6 feature cards (a 3×2 tile grid), 3 step cards holding chip boxes inside them, 3 quote cards, 3 plan cards, 6 FAQ boxes, 1 closing card — plus the product visual's window and suggestion card (depth law 2, layout law 3).
- The sticky header's backdrop blur has no `@supports` guard and no `prefers-reduced-transparency` branch (depth law 15).
- Six shadow recipes, three as tokens and three inline (`.btn-primary`, `.cells .best` glow, `.pill-dot` ring) (depth law 4).

Motion
- The suggestion card floats on a 6s infinite loop (motion law 1, motion law 15).
- No duration or easing tokens; 150ms and 200ms used for the same job (hover colour), `ease` everywhere (motion law 2, motion law 5).
- Feature cards lift on hover and logos recolour on hover, but neither is interactive (motion law 1).
- Reduced motion removes every transition and animation rather than substituting (motion law 10).

Patterns
- Feature cards and customer logos respond to hover like links but go nowhere (patterns law 14).
