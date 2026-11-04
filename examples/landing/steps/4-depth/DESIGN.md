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

Every interface colour is a custom property in `styles.css` `:root`; new names (marked *proposed*, 2026-11-04) follow the project's `--ink-*`, `--bg-*`, `--line-*` style. The two dark bands (`.section-dark`, `.final-card`) are a local theme: they re-declare the same names, plus `color-scheme: dark`.

**Text** — light checked on `surface.page` (`#ffffff`) and the worst light surface, `surface.subtle` (`#f6f7fb`); dark bands on `--dark` and on the quote card (`rgba(255,255,255,.04)` over `--dark`).

| Role | Name here | Light | On page | On `--bg-tint` | Dark band | On `--dark` | On quote card |
|---|---|---|---|---|---|---|---|
| `text.primary` | `--ink` | `#0d1424` | 18.38:1 | 17.17:1 | `#ffffff` | 18.93:1 | 17.40:1 |
| `text.secondary` | `--ink-2` | `#3a4356` | 9.92:1 | 9.27:1 | `#c8cedc` | 12.01:1 | 11.03:1 |
| `text.tertiary` | `--ink-3` | `#5f687b` | 5.60:1 | 5.23:1 | `#9aa3b8` | 7.49:1 | 6.88:1 |
| `text.inverse` | `--ink-inverse` (proposed) | `#ffffff` on `--ink` 18.38:1 | | | `#0b1020` on `#ffffff` | | |
| `text.on-accent` | `--ink-on-accent` (proposed) | `#0d1424` on `--accent` 6.46:1 | | | | | |
| `text.link` | `--accent-ink` | `#c0411a`, underlined, prose only | 5.23:1 | 4.89:1 | `#ff9a78` | 9.15:1 | |
| ↳ logo wall | `--ink-logo` (proposed) | `#7c8496` | 3.75:1 — 19px bold, large text | | | | |

Steps: 1.85× and 1.77× in light, 1.58× and 1.60× on the dark bands (expressive minimum 1.25×). Tertiary 5.23:1 on its worst light surface (target ≥ 4.6:1).

**Surfaces**

| Role | Name here | Light | Dark band |
|---|---|---|---|
| `surface.page` | `--bg` | `#ffffff` | — |
| `surface.subtle` | `--bg-tint` | `#f6f7fb` | — |
| `surface.raised` | `--bg-raised` (proposed) | `#ffffff` | `rgba(255,255,255,.04)` |
| `surface.hover` | `--bg-hover` (proposed) | `#f1f2f6` | `rgba(255,255,255,.08)` |
| `surface.inverse` | `--dark` | `#0b1020` | — |
| `material.translucent` tint | `--bg-chrome` (proposed) | `rgba(255,255,255,.8)` | — |

**Lines and fills**

| Role | Name here | Light | Dark band |
|---|---|---|---|
| `border.default` | `--line` | `#e4e7ee` | `rgba(255,255,255,.09)` |
| `border.divider` | `--line-2` | `#eef0f5` | — |
| `border.hover` | `--line-hover` (proposed) | `#d6dae4` | — |
| `border.control` | `--line-control` (proposed) | `#d6dae4` (1.40:1; unused in light, the ghost button keeps `--line`) | `rgba(255,255,255,.35)` (3.19:1 on `--dark`, `.btn-outline-light`) |
| `border.layered` | `--line-layered` (proposed) | `rgba(13,20,36,.08)` | — |
| `fill.strong` | `--ink` | `#0d1424` | `#ffffff` (`.btn-light`) |
| `fill.strong-hover` | `--ink-hover` (proposed) | `#1e2840` | `#e6e9f0` |
| `mark` | `--accent` (pill dot, brand ring) | `#ff6a3d` | — |

**Signal**

| Role | Name here | Light | Ratio | Dark band | Ratio |
|---|---|---|---|---|---|
| `accent` | `--accent` | `#ff6a3d` | fills only: plan tag, best hour, "Send invite" | — | — |
| ↳ accent as text and icons | `--accent-ink` | `#c0411a` | 5.23:1 white, 4.89:1 tint, 4.71:1 on `--accent-soft` | `#ff9a78` | 9.15:1 |
| ↳ tint · edge | `--accent-soft` · `--accent-line` (proposed) | `#fff0ea` · `#ffd3c3` | — | — | — |
| `focus` | `--focus` (proposed) | `#c0411a` | ≥ 4.29:1 on every light surface (worst: hero glow `#ffe3d6`) | `#ff9a78` | 9.15:1 on `--dark`, 4.19:1 on the orange glow |
| `status.success.fg` · `.bg` · `.solid` | `--ok-ink` · `--ok-soft` · `--ok` (proposed fg, bg) | `#0b7a4f` · `#e3f6ee` · `#12a26a` | 5.37:1 on page, 4.78:1 on its tint | — | — |

**Exceptions** — three, against expressive's four:

- `exception.done` — `status.success` on what Tandem has finished for you: the step chips "Connected" and "Invite sent", the "Best time found" badge and the pricing check marks. Expressive colours completion per brand; only the chip edge, tint and check take it.
- `exception.person.1–4` — `--person-1`…`--person-4` gradients on avatars, so four teammates read apart in the planner, the step-2 stack and the testimonials. Initials in `--person-ink`.
- `exception.glow` — `--glow-hero`, `--glow-dark`, `--glow-final`: orange from the top, blue from the far corner, only behind the hero and the two dark bands.

Not counted: the planner's availability family (`--work-*`, `--edge-*`, `--night`) lives inside the product visual (`role="img"`, colour law 1); the Google and Outlook dots are provider marks (`--mark-google`, `--mark-outlook`).

## Layout

| Role | Name here | Value |
|---|---|---|
| `measure.frame` · `measure.wide` | `--container` | 1200px, `.container` padding 32px |
| `measure.reading` | `--measure` (proposed) | 33rem (528px ≈ 62 characters of 17px Inter): `.lead`, `.section-sub`, `.final-card p`, `.faq details p` |
| `gutter` | `.container` padding | 32px; 20px under 640px |
| `space.tight` | `--space-tight` (proposed) | 8px — subheading → its copy |
| `space.group` | `--space-group` (proposed) | 24px — between plan cards |
| ↳ list gap | `.features`, `.steps`, `.quotes` | 56px rows · 40px columns, each item opened by a 1px `--line` hairline |
| `space.heading-below` | `--space-head` (proposed) | 56px (40px under 640px) — section head → content |
| `space.section` | `--space-section` (proposed) | 112px (72px under 640px); hero 88/96px; logo band 48/56px |
| Heading pair | `.section-head` | 224px of section padding above, 56px below — 4:1. Hero: 48px from the announcement pill, 16px to the lead — 3:1 |

**Sections** — stacked in reading order, each opened by its head. Features, steps, testimonials and FAQ sit on the page, items parted by hairlines; the three plans and the closing call to action stay cards (one object each, acted on). One chip shape per size: 13px label, 6px × 12px padding, pill radius (pill, chips, plan tag).

**Radius ladder** — the existing radii are the floor (layout dials).

| Role | Name here | Value |
|---|---|---|
| `radius.pill` | `999px` | buttons, pill, chips, plan tag |
| `radius.small` | `--radius-sm` | 8px — skip link, suggestion badge |
| `radius.card` | `--radius` | 14px — suggestion card, feature icon tile |
| `radius.container` | `--radius-lg` | 22px — product window, plan cards, closing card on phones |
| ↳ band | `--radius-xl` (proposed) | 28px — closing call to action |

Inside the product visual (artwork): cells 6px (4px on phones), swatches 3px.

**Lines** — `hairline.chrome` 1px `--line-2` (inside the window, plan check list); `hairline.object` 1px `--line` (card edges, list items, FAQ rows); the featured plan's 1.5px `--ink` edge and the 2px focus ring are `rule.emphasis`.

**z-index ladder**

| Role | Name here | Value |
|---|---|---|
| `z.nav` | `.site-header` | 50 |
| `z.skip-link` | `.skip` | 100 |

**Breakpoints** — on the window.

| Role | Name here | Value | What changes |
|---|---|---|---|
| `bp.stack-hero` | `@media (max-width: 1080px)` | 1080px | Hero and FAQ go to one column |
| `bp.nav-row` | `@media (max-width: 900px)` | 900px | Header links take their own row; features 2-up; steps, quotes and plans single column |
| `bp.phone` | `@media (max-width: 640px)` | 640px | Gutter 20px; planner collapses to initials; suggestion card joins the flow |

Every hover style is gated on `(hover: hover) and (pointer: fine)`. Anchor targets in `main` carry `scroll-margin-top` for the sticky header (68px; 112px under 900px).

## Surfaces

| Level | Surface | Edge | Shadow | Layer | Used on |
|---|---|---|---|---|---|
| `elevation.flat` | `--bg` / `--bg-tint` / `--bg-raised` | `--line` (1px) or a surface step | none | — | Plan cards (the featured plan's edge is 1.5px `--ink`), the closing call to action (a `--dark` surface step, `1px solid transparent` for forced colours), every button but one |
| `elevation.raised` | `--ink` fill | the fill itself | `--shadow-sm`: inset highlight + contact 12% + one ambient 16% | — | The hero's "Start free" only — the buttons dial's one raised accent |
| ↳ chrome | `--bg-chrome` `rgba(255,255,255,.92)`, opaque `--bg` without `backdrop-filter` | `--line-layered` | none | `z.nav` 50 | `.site-header` |
| showcase (named decorative level) | `--bg-raised` | `--line-layered` | `--shadow-lg`: inset highlight + contact 6% + two ambient 12% / 16% | — | The product visual's window and suggestion card |

**Material**

| Tier | Blur | Saturate | Tint | Fallback | Used on |
|---|---|---|---|---|---|
| `material.translucent.defensive` | 24px | 170% | 92% white | opaque `--bg` outside `@supports` and under `prefers-reduced-transparency`; `--ink-3` edge under `prefers-contrast: more`; `CanvasText` edge under `forced-colors` | `.site-header` — `--ink-2` links measure 8.39:1 over `--dark`, the worst backdrop |

**Glows** — `--glow-accent`, side-weighted, on the planner's best hour. Brand glows behind the hero and dark bands are colour exceptions (`exception.glow`).

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

- 2026-11-04 — Only the hero's "Start free" keeps a shadow; the header and plan buttons, the ghost button, the announcement pill and the featured plan are flat. The featured plan is marked by its 1.5px ink edge and tag, not a floating shadow it doesn't earn. (Law; depth law 1, depth buttons dial.)
- 2026-11-04 — Header translucency at the defensive tier (92% tint, 24px blur): its links are `--ink-2` over whatever scrolls under, the dark band included. (Law; depth law 7.)
- 2026-11-04 — Features, steps, testimonials and FAQ unboxed (22 boxes → 4: three plans and the closing card), each item opened by a hairline. Taking the edge away left every group reading from space and its heading. (Law; layout law 3, depth law 2.)
- 2026-11-04 — Below 900px the header links move to their own row instead of disappearing: hiding them left no way to reach them. (Law; layout law 8.)
- 2026-11-04 — Text on the orange accent is `--ink`, not white: white was 2.85:1, ink is 6.46:1, and the orange stays exactly as it was. (Law; colour law 3.)
- 2026-11-04 — `--accent-ink` deepened from `#e2512a` to `#c0411a` and `--ink-3` from `#6a7386` to `#5f687b`, so eyebrows, links and tertiary text clear 4.5:1 on the tinted sections. (Law; colour law 3.)
- 2026-11-04 — Prose links take `--accent-ink`, underlined (expressive link dial). (Law; colour dials.)
- 2026-11-04 — Hero headline derived from its 506px column at about 19 characters a line: 62px at most, not 68px, and no `max-width: 11ch` forcing three lines. (Law; type display tier.)
- 2026-11-04 — The closing CTA heading uses `--text-heading`, not a 52px size of its own: one display moment per page. (Law; type law 3.)
- 2026-11-04 — Body and supporting copy at 17px (the expressive dial's floor, Inter's large x-height), card copy no longer at 15px. (Law; type dials.)
- 2026-11-04 — Light only, with the two inverted bands kept: no second theme planned. (User decision: keep the theming the page already has.)
- 2026-11-04 — Preset `expressive`: a landing page whose reader is being persuaded. (User decision.)

## Open issues

Type
- Fonts come from Google Fonts, not self-hosted: two extra origins before the first frame's text (type law 12). The fallbacks are metric-matched, so the swap no longer reflows; self-hosting needs the font files downloaded into the project.

Colour
- The ghost button's edge (`--line` `#e4e7ee`, 1.24:1 on white) is under the 3:1 `border.control` asks; the label carries the control. Raising it to 3:1 would put a mid-grey ring on the hero's secondary action — left for a decision.
- Neutrals are tinted towards blue, not the orange brand hue (expressive neutral chroma dial: "toward brand hue"). The design chose cool neutrals; left as found.

Motion
- The suggestion card floats on a 6s infinite loop (motion law 1, motion law 15).
- No duration or easing tokens; 150ms and 200ms used for the same job (hover colour), `ease` everywhere (motion law 2, motion law 5).
- Feature cards lift on hover and logos recolour on hover, but neither is interactive (motion law 1).
- Reduced motion removes every transition and animation rather than substituting (motion law 10).

Patterns
- Feature cards and customer logos respond to hover like links but go nowhere (patterns law 14).
