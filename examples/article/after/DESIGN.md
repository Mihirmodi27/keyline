# Design system

> Keyline reads this before touching UI, and writes back to it when a decision changes. Edit it by hand whenever you like — it is the source of truth for intent, the code is the source of truth for values. Set up 2026-11-04.

## Profile

| | |
|---|---|
| Product | Field Notes, Halden's engineering blog: one long-form article page with site chrome, end matter and related posts |
| Reader | Reading — a ~1,200-word technical essay, start to finish |
| Preset | `editorial` |
| Areas | none |
| Stack | Static HTML + one stylesheet (`styles.css`), no framework, no JS |
| Tokens live in | `styles.css` `:root` (custom properties) |
| Themes | `light`, `dark` — `@media (prefers-color-scheme: dark)` re-tints `:root`; `color-scheme: light dark` declared in `index.html` |
| Motion | CSS transitions only, plus SMIL `animateMotion` in the cover SVG and a scroll-driven progress bar |

Evidence for the preset: one page whose content is ~1,200 words of serif body copy at a 680px measure, a table of contents rail, a drop cap and a pull quote; chrome is a thin header and a footer. The reader is reading.

## Type

**Families** — `family.text`: Source Serif 4 (`--font-read`, Google Fonts, 400 / 600 / 400 italic) for everything read: body, lead, dek, pull quote, callout and bio. `family.ui`: Inter (`--font-ui`, Google Fonts, 400 / 600) for interface text and for the title and headings, the brand's existing sans voice (see Decisions). `family.mono`: system stack (`--font-mono`: `ui-monospace, "SF Mono", Menlo, Consolas, monospace`).

Sizes are `rem` tokens in `:root` (proposed 2026-11-04, now in code). Six sizes above the 12px floor, plus the title's one phone step.

| Role | Name here | Size | Leading | Tracking | Weight | Tier |
|---|---|---|---|---|---|---|
| `type.title` | `--size-title` · `.article-title` | 2.5rem (40px); `--size-title-phone` 2rem (32px) under 640px | 1.2 | −0.02em | strong | `--ink` |
| `type.heading` | `--size-heading` · `.prose > h2`, `.related__head h2` | 1.5rem (24px) | 1.3 | −0.01em | strong | `--ink` |
| ↳ `pull-quote` (project role) | `.pullquote p` | 1.5rem (24px) | 1.4 | 0 | regular, true italic | `--ink` — parts from the heading on regular weight, the serif italic and the accent bar |
| `type.supporting` | `--size-dek` · `.article-dek` | 1.25rem (20px) | 1.5 | 0 | regular | `--ink-2` |
| ↳ author name | `.author-card__name` | 1.25rem (20px) | 1.3 | 0 | strong, Inter | `--ink` — separates from the dek on family, weight and tier |
| `type.subheading` | `--size-body` · `.post-card h3`, `.callout__title` | 1.125rem (18px) | 1.35 | 0 | strong, Inter | `--ink` |
| `type.lead` | `--size-body` · `.prose .lead` | 1.125rem (18px) | 1.85 | 0 | regular | `--ink` — separates on leading and tier |
| ↳ `drop-cap` (project role) | `.lead::first-letter` | 4.1em | 0.82 | 0 | strong, Inter | `--accent` |
| `type.body` | `--size-body` · `.prose > p, ul, ol`, `.callout p`, `.author-card__bio` | 1.125rem (18px) | 1.7 (bio 1.6) | 0 | regular | `--ink-2` |
| `type.ui` | `--size-ui` · nav, buttons, byline name, footer links, input, `.link-arrow` | 0.9375rem (15px) | 1 / 1.5 | 0 | regular; strong on buttons and the current page | `--muted` / `--ink` |
| `type.data` | `--size-ui` · `table` | 0.9375rem (15px) + `tabular-nums` | 1.5 | 0 | regular | `--ink-2` |
| `type.label` | `--size-meta` · `.kicker`, `thead th`, `.toc__title`, `.share__label`, `.footer-col__title`, `.delta` | 0.875rem (14px), sentence case | 1.5 | 0 | strong | `--muted` (kicker `--accent-ink`) |
| `type.meta` | `--size-meta` · byline meta, captions, `.post-card__meta`, cite, author role, tags, footer base | 0.875rem (14px) | 1.4–1.5 | 0 | regular | `--muted` |
| `type.code` | `--size-meta` · `.code pre`, `.code__bar`; inline `0.875em` | 0.875rem (14px) | 1.6 | 0 | regular, mono | `--code-ink` |
| lettermarks (exempt) | `.avatar--sm` | 10px | 1 | +0.02em | strong | — recognised, not read |

Cover SVG labels are artwork (type law 1 exemption); `.cv-label--small` raised from 12 to 13 units so it clears 12px at full width.

**Weights** — `weight.regular` 400: all reading copy, meta, nav. `weight.strong` 600: title, headings, names, `<strong>`, buttons, labels, the current nav item. Only these two are requested from Google Fonts.

**Icons** — 20px glyphs at stroke 1.7–1.75 in 38px icon buttons (`type.ui` context) and beside the callout title.

## Colour

**Text** — measured with `scripts/contrast.mjs`, against `--bg` (`surface.page`) and the worst surface each tier lands on, `--surface-2`.

| Role | Name here | Light | Ratio on `--bg` · `--surface-2` | Dark | Ratio on `--bg` · `--surface-2` |
|---|---|---|---|---|---|
| `text.primary` | `--ink` | `#15171c` | 17.18 · 15.88 | `#eceef2` | 16.38 · 14.21 |
| `text.secondary` | `--ink-2` | `#3d424c` | 9.66 · 8.94 | `#c3c8d1` | 11.33 · 9.83 |
| `text.tertiary` | `--muted` | `#636975` | 5.28 · 4.89 | `#8d94a0` | 6.23 · 5.41 |
| `text.link` · category labels | `--accent-ink` | `#b8430a` | 5.23 · 4.84 | `#ff9a5c` | 8.40 on `--surface` |
| `text.inverse` | `--bg` on `--ink` | `#fbfaf7` | 17.18 | `#0e1015` | 16.38 |
| `text.on-accent` | `--on-accent` on `--accent-fill` | `#ffffff` on `#c84a0c` | 4.73 | `#15171c` on `#ff7a2f` | 6.90 |

Tier steps: 17.18 → 9.66 → 5.28 (1.78×, 1.83×), above the 1.15× minimum; tertiary 4.89 on its worst surface, above the 4.6 target.

Footer (its own dark band in both themes, a local theme): `--footer-ink` `#e9ebef` 15.33:1 on `--footer-bg`; `--footer-muted` `#9aa2ae` 7.10:1 (light) / 7.65:1 (dark), also the placeholder, 6.70:1 on `--footer-field`. Code: `--code-ink` 13.90:1, `--code-muted` 6.74:1, `--code-comment` `#7d8ca3` 5.27:1 (light) / 5.62:1 (dark) on `--code-bg`.

**Surfaces**

| Role | Name here | Light | Dark |
|---|---|---|---|
| `surface.page` | `--bg` | `#fbfaf7` | `#0e1015` (OKLCH L 0.173) |
| `surface.raised` | `--surface` | `#ffffff` | `#161920` |
| `surface.subtle` | `--surface-2` | `#f3f1ec` | `#1b1f27` |
| `surface.hover` | `--surface-hover` (proposed, now in code) | `#f3f1ec` | `#1b1f27` |
| `surface.inverse` | `--footer-bg` | `#11151c` | `#090b0f` |
| ↳ footer field | `--footer-field` | `#171b23` | `#171b23` |
| ↳ code | `--code-bg` | `#0f1724` | `#0a0f18` |

**Lines and fills**

| Role | Name here | Light | Dark |
|---|---|---|---|
| `border.default` · `border.divider` | `--line` | `#e6e2da` | `#262b35` |
| `border.hover` | `--line-strong` | `#d6d1c6` | `#343a46` |
| `border.layered` | `--line-layered` (proposed, now in code) | `rgba(21, 23, 28, 0.1)` | `rgba(255, 255, 255, 0.08)` |
| `border.control` | `--footer-field-line` (proposed) | `#606a79` — 3.34:1 on the band, 3.15:1 on the field | `#5d6675` — 3.40:1 on the band |
| ↳ code lines | `--code-edge`, `--code-line` | white at 6% / 8% | same |
| `fill.strong` | `--ink` (primary button) | `#15171c` | `#eceef2` |
| `mark` | `--accent` (bullets, drop cap, quote bar, code-file dot) | `#e8590c` | `#ff7a2f` |

**Signal**

| Role | Name here | Light | Dark |
|---|---|---|---|
| `focus` | `--focus` (proposed) → `--accent`; `--footer-ink` inside the footer | `#e8590c` — 3.43:1 on `--bg`, 3.17:1 on `--surface-2`, 3.24:1 on `--accent-soft`; footer ring 15.33:1 | `#ff7a2f` — 7.32:1 on `--bg`, 6.35:1 on `--surface-2` |
| `accent` | `--accent` | `#e8590c` | `#ff7a2f` |
| ↳ accent fill | `--accent-fill`, `--accent-fill-hover` (proposed) | `#c84a0c`, `#b8430a` | `#ff7a2f`, `#ff9a5c` |
| ↳ accent tint | `--accent-soft`, `--accent-line` | `#fff1e8`, `#f8c9ab` | `#2a1a11`, `#5a2f17` |
| ↳ footer accent | `--footer-accent`, `--footer-accent-soft` | `#ff9a5c`, orange at 16% | same |
| `status.success` | `--good`, `--good-soft` | `#137a4a` on `#e5f4ec` 4.73:1 | `#5fd39a` on `#12291f` 8.27:1 |

The orange is the brand's, already spent on jobs — category labels, the drop cap, bullets, the quote bar, the reading-progress bar, the subscribe action, the avatar gradient — and stays on all of them (colour law 7, "colour the design already has stays").

**Exceptions**

- `status.success` on the table's change column: the column reports the outcome the article is about, and every figure carries its minus sign, so colour isn't the only carrier.
- Code syntax colours (`--code-keyword` … `--code-comment`): a reading aid, counted against no limit.
- Artwork (`--avatar-fill`, `--art-*`, the cover SVG): illustration, exempt from the palette; tokens only so they live in one place.

## Layout

| Role | Name here | Value |
|---|---|---|
| `measure.reading` | `--measure` | 600px ≈ 70 characters of 18px Source Serif 4 (measured in the browser; was 680px ≈ 80) |
| `measure.wide` | `--wide` | 1120px (cover, related posts) |
| `measure.frame` | `--page` | 1280px (header, article grid with its rails, footer) |
| ↳ head column | `.article-head` | 860px for the title; the dek sits at `--measure` |
| `measure.rail` | `.toc` | max 240px, sticky at 112px, capped at `100dvh` and scrolling inside |
| `gutter` | `--gutter` | `clamp(24px, 4vw, 40px)` |
| `space.tight` | `--space-tight` (proposed, now in code) | 8px |
| `space.group` | `--space-group` (proposed) | 24px |
| ↳ prose block | `--space-block` (proposed) | 40px around a figure, table, code block or callout, and the head's bottom |
| `space.section` | `--space-section` (proposed) | 64px |
| `space.heading-above` · `space.heading-below` | `--space-heading-above` · `--space-heading-below` (proposed) | 56px · 16px (3.5 : 1) |
| page top space | `.article-head` | 88px (56px under 640px) |

**One device, one style** — table: no frame, a 1px `--line-strong` rule under the header, `--hairline-chrome` dividers between rows, first column flush with the text. Chips (`.kicker`, `.tags a`, `.delta`, `.pill`): one shape, 3px × 12px padding, 1px border, pill radius, 14px; they vary only in fill and edge colour.

**Radius ladder** — the existing radii are the floor; 18px containers snapped up to 20px.

| Role | Name here | Value |
|---|---|---|
| `radius.pill` | inline `999px` | buttons, nav items, chips, the quote bar |
| `radius.small` | `--radius-small` (proposed) | 6px — inline code, focus ring |
| `radius.control` | `--radius-control` (proposed) | 8px — skip link |
| `radius.card` | `--radius` | 14px — code block, callout |
| `radius.container` | `--radius-container` (proposed) | 20px — cover, author card, post cards |

**Lines** — `hairline.chrome` `--hairline-chrome` 0.5px (header edge, table row dividers, footer base rule); `hairline.object` 1px (object edges, rule under a table header, contents rail); `rule.emphasis` `--rule-emphasis` 3px (pull-quote bar, rounded). The focus ring stays 2px (colour law 5).

**z-index ladder**

| Role | Name here | Value |
|---|---|---|
| `z.nav` | `--z-nav` | 50 |
| ↳ `z.progress` (project rung) | `--z-progress` | 60 |
| `z.skip-link` | `--z-skip-link` | 100 |

**Breakpoints**

| Role | Name here | Value | What changes |
|---|---|---|---|
| `bp.rails` | inline | 1180px | Share and contents leave the margins: contents becomes an in-flow `<details>` above the lead, share a row after the article |
| `bp.nav` | inline | 960px | Primary nav hides; related posts stack as rows; footer to 3 columns |
| `bp.phone` | inline | 640px | Head left-aligned, title one step down, cover and code full-bleed, footer to 2 columns |

Every hover style is gated on `(hover: hover) and (pointer: fine)`.

## Surfaces

Two levels in use; editorial allows three (flat, floating, overlay — raised only for sticky chrome). No shadows: `--shadow` removed.

| Level | Surface | Edge | Shadow | Layer |
|---|---|---|---|---|
| `elevation.flat` | `--bg`; cards on `--surface`; code on `--code-bg` | `--line` 1px (author card, post cards), `--code-edge` (code), `--line-layered` (cover) | none | — |
| `elevation.raised` (sticky chrome only) | `--bg`, then `--chrome-tint` | `--hairline-chrome` `--line-layered` | none | `--z-nav` |

**Cards** — one object each: the author card, each related post, the code block, the cover figure. The callout is an aside, built as a note: a 1px `--accent` rule on its leading edge, no tint, no box. The table is unboxed (layout).

**Material** — one translucent surface, the sticky header.

| Tier | Blur | Saturate | Tint | Fallback | Used on |
|---|---|---|---|---|---|
| `material.translucent.defensive` | 24px | 1.7 | `--chrome-tint`, `--bg` at 94% | opaque `--bg` baseline; `@supports` turns the material on; `prefers-reduced-transparency` → opaque, no filter; `prefers-contrast: more` → 1px `--ink` edge; `forced-colors` → `CanvasText` edge | `.site-header` |

Header text over its worst backdrop (the navy cover, `#0f1724`): `--ink` 15.22, `--ink-2` 8.56, `--muted` 4.68:1; dark over `#fbfaf7`: `--muted` 5.46:1. Defensive rather than chrome because the nav carries `--muted` text over arbitrary content.

**Corner shape** — `superellipse(1.5)` on the cover, code block, author card and post cards, behind `@supports`.

## Motion

| Role | Name here | Value | Used for |
|---|---|---|---|
| `duration.instant` | `--duration-instant` | 0ms | button press (`scale(0.96)` on `:active`) |
| `duration.micro` | `--duration-micro` | 100ms | reserved: opacity-only hover (none yet) |
| `duration.state` | `--duration-state` | 150ms | nav, buttons, icon buttons, contents links, tags, "All posts" colour |
| `duration.popover` | `--duration-popover` | 200ms | post-card hover wash, in |
| `ease.standard` | `--ease-standard` | `cubic-bezier(0.22, 1, 0.36, 1)` | transforms (the press release) |
| `ease.colour` | `--ease-colour` | `ease` | every colour and border transition |

Hover on a card is a wash — the edge steps to `--line-strong` — with no travel. Hover gated on `(hover: hover) and (pointer: fine)`.

**Named exemptions**

| Exemption | Values | Why |
|---|---|---|
| Hover leave | 250ms (`--duration-leave`) | A wash fading behind a pointer that has moved on (motion law 7) |
| Cover packets | 1.4s–3.6s per lap, 3 laps (7 on the bridge line), then rest | Subject: the motion is the diagram's content, dual writes flowing into the bridge; finite because nothing pauses it off screen; hidden under reduced motion |
| Reading progress | scroll-linked | A progress indicator; it reports state |

**Reduced motion** — the cover packets are hidden and smooth scrolling is off; colour washes and the press scale stay.

## Patterns

**Nouns** — post (never "article" or "story" in chrome), topic (the nav and footer's categories), tag. **Calls to action** — one verb, "Subscribe", in the header and the footer, both leading to the same form. **Share** — "Copy link" is a button that copies and says "Copied" in the share label (polite live region); email shares by `mailto:`. **Subscribe** — a visible "Email" label above the field; the line above it says what arrives and how often ("One email a fortnight, no tracking pixels"). **Keyboard** — Tab order, the skip link, `<details>` for the contents under 1180px.

## Decisions

- 2026-11-04 — Cover packets play three laps and rest instead of looping forever; post cards no longer rise 3px on hover; the "All posts" arrow no longer nudges. (Law; motion laws 1 and 4.)
- 2026-11-04 — The callout is a note — a leading-edge accent rule, no tint or box — and the cover, code block, author card and post cards lost their shadows: editorial pages are flat, and an aside is not a card. (Law; depth laws 1–2.)
- 2026-11-04 — `--wide` stays 1120px (≈ 1.9 × the new measure, above the ≈ 1.5 × dial): the cover diagram and the related grid already use it, and shrinking them would cost the page its one large picture. (Keeps the existing design; layout dial `measure.wide`.)
- 2026-11-04 — The table lost its card frame, shadow and tinted caption strip: editorial tables share the text's edge. (Law; layout law 3.)
- 2026-11-04 — Filled orange buttons use `--accent-fill` (`#c84a0c` light) rather than `--accent`: white on `#e8590c` was 3.58:1. Dark flips `--on-accent` to near-black. (Law; colour laws 3 and 8.)
- 2026-11-04 — `--muted` re-picked from `#6a707b` to `#636975`: 4.41:1 on `--surface-2`. (Law; colour law 3.)
- 2026-11-04 — Inter keeps the title and headings as well as interface text: it is the page's existing heading voice, and the reading face stays the serif. (User decision via recommendation; type dial "families" — editorial lists Inter only for interface text.)
- 2026-11-04 — Body stepped from 20px to 18px and the title from 60px to 40px (2.22 × body), to sit inside the editorial body range and ceiling. (Preset dial; user chose `editorial`.)
- 2026-11-04 — Mono is a system stack, not a JetBrains Mono download: one code block and a diagram's labels. (Type dial "families".)
- 2026-11-04 — Preset `editorial`, existing light/dark theming kept as it is (media query). (User decision.)

## Open issues

Type
- Inter and Source Serif 4 still load from Google Fonts with no metric-matched fallback (type law 12). Needs the font files self-hosted and their metrics measured; not possible in this pass without downloading them.
- Cover SVG labels are 13–18 units in a 1200-unit viewBox: at a 500px viewport they render ≈ 5–7px, below the 12px floor; the caption carries the meaning there (type law 1). Fixing it needs a narrow version of the diagram.

Colour

Layout
- Boxes left on the article: cover frame, code block, callout (the brief asks for a callout box), author card, the related band's three cards — each one object. Table frame removed; four chip shapes unified to one.

Depth

Motion

Patterns
- The subscribe form submits nowhere (`action="#"`, `onsubmit="return false"`); the button reacts but does nothing until it has a real endpoint (patterns law 14).
- Nav, tag, related-post and LinkedIn links are `href="#"` placeholders from the mock (patterns law 14).
