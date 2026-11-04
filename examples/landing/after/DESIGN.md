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

**Text** — light theme only; ratios from `contrast.mjs`, on `surface.page` (`#ffffff`) and on the worst light surface, `--bg-tint`.

| Role | Name here | Light | Ratio (page) | Ratio (`--bg-tint`) |
|---|---|---|---|---|
| `text.primary` | `--ink` | `#0d1424` | 18.38:1 | 17.17:1 |
| `text.secondary` | `--ink-2` | `#3a4356` | 9.92:1 | 9.27:1 |
| `text.tertiary` | `--ink-3` | `#646d80` (was `#6a7386`) | 5.20:1 | 4.85:1; 4.56:1 on `--night` (planner) |
| `text.inverse` | `--ink-inverse` | `#ffffff` | 18.38:1 on `--ink` | |
| `text.on-accent` | `--on-accent` → `--ink` | | 6.46:1 on `--accent` (white was 2.85:1) | |
| ↳ accent as text (eyebrows, icons) | `--accent-ink` | `#bf4318` (was `#e2512a`) | 5.21:1 | 4.87:1; 4.69:1 on `--accent-soft` |

**Dark bands** — `.section-dark` and `.final-card` are a local theme on the light page; each tier measured on its worst surface there.

| Role | Name here | Value | Ratio |
|---|---|---|---|
| `text.primary` | `--band-ink` | `#ffffff` | 17.40:1 on a quote card (`--band-raised` over `--dark`) |
| `text.secondary` | `--band-ink-2` | `#c8cedc` | 11.03:1; 5.50:1 under the final card's orange glow |
| `text.tertiary` | `--band-ink-3` | `#9aa3b8` | 6.88:1 |
| accent as text | `--band-accent-ink` | `#ff9a78` | 9.15:1 |
| `border.control` | `--band-control` | `rgba(255,255,255,.35)` | 3.19:1 |
| `focus` | `--focus` → `--accent` inside the bands | | 6.65:1 on `--dark` |

**Surfaces**

| Role | Name here | Light |
|---|---|---|
| `surface.page` · `surface.raised` | `--bg` | `#ffffff` |
| `surface.subtle` · `surface.hover` | `--bg-tint` | `#f6f7fb` |
| `material.translucent` tint | `--bg-glass` | `rgba(255,255,255,.8)` |
| `surface.inverse` | `--dark` | `#0b1020` |
| raised in a band | `--band-raised`, `--band-hover` | white at 4% / 8% |

**Lines and fills**

| Role | Name here | Light |
|---|---|---|
| `border.default` | `--line` | `#e4e7ee` |
| `border.divider` | `--line-2` | `#eef0f5` |
| `border.hover` | `--line-hover` | `#cdd2dd` (merged `#cdd2dd` and `#d6dae4`) |
| `border.layered` | `--line-layered` | `rgba(13,20,36,.08)` |
| `fill.strong` · `fill.strong-hover` | `--ink` · `--ink-hover` | `#0d1424` · `#1e2840` |

**Signal**

| Role | Name here | Light | Ratio |
|---|---|---|---|
| `accent` | `--accent` · `--accent-soft` · `--accent-line` | `#ff6a3d` · `#fff0ea` · `#ffd3c3` | — |
| `focus` | `--focus` → `--accent-ink` | `#bf4318` | 4.87:1 on `--bg-tint`, 4.69:1 on `--accent-soft` |
| `status.success` | `--ok` · `--ok-soft` · `--ok-line` | `#0b7a4f` · `#e3f6ee` · `#bfe8d5` | 4.78:1 fg on bg |

**Exceptions** — expressive allows up to four, named.

| Exception | Name here | For | Why it can't spread |
|---|---|---|---|
| `exception.person.1–4` | `--person-1` … `--person-4` | Telling four teammates apart (avatars) | Only on avatar discs |
| `exception.wash` | `--wash-hero`, `--wash-band`, `--wash-final` | Brand atmosphere: orange from above, blue from below | Backgrounds of the hero and the two dark bands only, never on text or controls |
| success in the how-it-works sequence | `--ok*` | "Connected", "Invite sent" — outcomes in the story the steps tell | Only on those two chips and the mock's "best time found" badge; the pricing ticks are now ink |

Illustration (allowed literals, not counted): the planner's hour hues `--work*`, `--edge*`, `--night*` inside `.product` (`role="img"`). Third-party marks: the Google and Outlook dots on `.chip .g` / `.chip .o`.

## Layout

| Role | Name here | Value |
|---|---|---|
| `measure.reading` | `--measure` (proposed) | 36rem (576px ≈ 62 characters of 17px Inter) — section heads, lead, FAQ answers, final-CTA copy, stacked steps and quotes |
| `measure.wide` | `--container` | 1200px incl. 32px padding (1136px content) |
| `gutter` | `.container` padding | 32px; 20px ≤ 640px |
| `space.tight` | `--space-tight` (proposed) | 8px |
| `space.group` | `--space-group` (proposed) | 24px — plan gap, quote indent and spacing |
| `space.section` | `--space-section` (proposed) | 128px top and bottom; 80px ≤ 640px |
| `space.heading-above` · `space.heading-below` | `--space-section` · `--space-head` (proposed) | 128 : 40 = 3.2 : 1 (phone 80 : 28 = 2.9 : 1). Inside the head: eyebrow → h2 12px, h2 → dek 16px |
| `hairline.object` · `hairline.chrome` | `--hairline` (proposed) | 1px |
| `rule.emphasis` | `--rule` (proposed) | 3px — the quote bar; the featured plan's 2px edge |

**Structure** — sections stack, each opened by its head. Boxes kept: the three plan cards (each one object with its own action), the final call-to-action card, the product visual. Unboxed: six features (two columns, icon beside its title and text, 56 × 64px gaps), three steps (columns on one rule, the number sitting on it), three quotes (a 3px accent quote bar each), six FAQ items (one list parted by hairlines). Boxes per screen: 32 → 7 (3 plans, final card, window, suggestion card, the hero pill) plus step chips.

**Radius ladder**

| Role | Name here | Value |
|---|---|---|
| `radius.pill` | `999px` | buttons, chips, pill, tags |
| `radius.small` | `--radius-sm` | 8px — skip link, focus ring, suggestion badge |
| `radius.control` | `--radius` | 12px (was 14) — feature icon tiles, suggestion card |
| `radius.card` | `--radius-lg` | 20px (was 22) — plans, product window, final card on phones |
| `radius.container` | `--radius-xl` (proposed) | 28px — final call-to-action card |

Product-visual cells (6px / 4px) and legend swatches (3px) are artwork.

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
| `bp.phone` | `max-width: 640px` | 640px | Gutter 20px; section space 80px; planner compacts; features one column |

Every hover style sits inside `@media (hover: hover) and (pointer: fine)`. Anchor targets carry `scroll-margin-top: 88px` for the sticky header. Footer column headings are `h2` (were `h4`, chosen for size).

## Surfaces

| Level | Surface | Edge | Shadow | Layer | Used on |
|---|---|---|---|---|---|
| `elevation.flat` | `--bg`, `--bg-tint`, `--dark` (bands) | `--line` (plans), 2px `--ink` (featured plan) | — | — | plans, final card, sections |
| `elevation.raised` | `--bg-glass` / `--bg`; `--ink` fill | `--line-layered`; the button's own fill | `--shadow-sm` | `z.nav` 50 for the header | sticky header; the hero's primary call to action (the page's one raised accent) |
| `elevation.floating` (named decorative level: the product visual) | `--bg` | `--line-layered` | `--shadow-lg` | — | `.window`, `.suggest` |

Shadows: one light from above, contact + ambient layers with negative spread, navy-tinted to the ink; `--shadow-sm` = inset highlight + 2px contact + 12px ambient; `--shadow-lg` = expressive floating recipe (inset 0.6 highlight, 6% / 10% / 16% layers). Buttons other than the hero's primary are flat. No overlay level, no scrim.

**Material** — `material.translucent.chrome` on `.site-header` only.

| Tier | Blur | Saturate | Tint | Fallback | Used on |
|---|---|---|---|---|---|
| chrome | 20px | 1.8 | `--bg-glass` 80% white | opaque `--bg` without `@supports`; `--bg` and no filter under reduced transparency; `--ink` edge under more contrast; `CanvasText` edge in forced colours | sticky header — `--ink-2` 6.38:1 over the tint composited on `--dark`, the worst backdrop |

## Motion

| Role | Name here | Value | Used for |
|---|---|---|---|
| `duration.instant` | — | 0ms | button press (`translateY(1px)` on `:active`, not transitioned) |
| `duration.micro` | `--duration-micro` (proposed) | 120ms | nav and footer link colour |
| `duration.state` | `--duration-state` (proposed) | 200ms | button fill, edge and text colour |
| `duration.popover` | `--duration-popover` (proposed) | 280ms | FAQ plus turning to × as its answer opens |
| `ease.standard` | `--ease` (proposed) | `cubic-bezier(0.34, 1.2, 0.64, 1)` | the FAQ icon's rotation |
| `ease.colour` | `--ease-colour` (proposed) | `ease` | every colour transition |

**Named exemptions** — motion off the ladder on purpose.

| Exemption | Values | Why |
|---|---|---|
| Suggestion card drift | 6000ms, `ease-in-out`, 2 iterations | Ambient (motion law 4), hero only: the product visual settles as the page opens, then rests. Was infinite; a static page can't pause it off screen, so it is finite. Off under reduced motion and on phones |

Reduced motion: smooth scroll off, the drift off, the FAQ icon turns instantly; colour transitions stay because they move nothing. No springs, no reveals, no set pieces.

## Patterns

**Nouns** — meeting, teammate, team, calendar, invite, plan. **Calls to action** — "Start free" (header, hero, Free plan, final card), "Start 14-day trial" (Team), "Talk to sales" (Business), "Book a demo" (final card), "See how it works" (scrolls to how it works, marked with a down arrow, not a play icon). **Links** — email addresses are `mailto:` links. **Inert things don't react** — logos, features and the hero pill have no hover state.

## Decisions

- 2026-11-04 — "See how it works" carries a down arrow, not a play icon: it scrolls to the steps, and there is no video. (Law; patterns law 14.)
- 2026-11-04 — Feature-card lift and logo hover removed: neither answers "what changed?" (features aren't links, logos aren't links). (Law; motion law 1.)
- 2026-11-04 — One raised button on the page (the hero's "Start free"); the header, ghost and plan buttons and the hero pill are flat; the featured plan is marked by its 2px ink edge, not a floating shadow. (Law; depth law 1, buttons dial.)
- 2026-11-04 — Features, steps, quotes and FAQ are unboxed; only plans, the final call to action and the product visual keep a surface. (Law; layout law 3, depth law 2.)
- 2026-11-04 — Text on the orange accent is `--ink`, not white: white measured 2.85:1. (Law; colour law 3.)
- 2026-11-04 — Pricing ticks are ink on a neutral circle, not green: they mark inclusion, not an outcome, and fourteen green ticks outshouted the featured plan. (Law; colour law 7.)
- 2026-11-04 — Section and final-CTA headings capped at 36px (were 44px and 52px), so the hero display clears 1.5× them at every width. (Law; type law 3, display tier.)
- 2026-11-04 — Preset `expressive`. (User decision.)
- 2026-11-04 — Keep the existing theming: light page with two dark bands, no dark theme added. (User decision.)

## Open issues

Type
- Fonts load from Google Fonts, not self-hosted, and the display file isn't preloaded (type law 12). Metric-matched local fallbacks now hold the lines if the swap happens; self-hosting needs the font files downloaded into the project.

Layout
- Steps (≈ 38 characters a line) and quotes (≈ 35) sit below the 45-character floor in three columns; kept at three because the steps are a left-to-right sequence and the quotes a set of peers (layout law 1).

Patterns
- "Start free" in the header and hero scrolls to `#pricing` rather than starting sign-up, and footer, plan and sign-in links point at `#` — placeholders until real routes exist (patterns law 14).
