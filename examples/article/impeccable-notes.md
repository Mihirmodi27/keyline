# Impeccable on the article scene

Run: `teach` (PRODUCT.md, then `document` in scan mode for DESIGN.md + DESIGN.json), then `polish` on the whole page. No other Impeccable commands. The interview questions were answered from BRIEF.md and the existing page; where the brief said nothing, the skill's defaults were used. Polish quality bar: flagship (a published article).

## What teach chose

- **Register:** brand (long-form content; the blog is the product).
- **Colour strategy:** Restrained. Warm tinted paper neutrals, one signal orange accent kept well under 10% of the screen, and navy "night" surfaces only for the cover diagram, the code block and the footer. Green is limited to positive deltas in the data table.
- **Personality:** candid, precise, unhurried. Anti-references: generic SaaS blog templates (gradient hero, centred stack, grid of identical cards), content-marketing clutter, developer costume. Accessibility floor: WCAG 2.2 AA, reduced motion, light and dark.
- **Fonts:** kept Inter / Source Serif 4 / JetBrains Mono. Inter is on Impeccable's reflex-reject list, but the skill says an existing brand's choice wins over the list.

## What polish changed

Measured in Chrome at 1440 px wide unless stated. Contrast ratios are WCAG 2.x.

**Reading measure**
- Body column 680 → 640 px. Body line length about 75 → 70 characters at 20 px.
- Callout copy 16 → 17 px. Line length 80 → 70 characters.
- Author bio 16 → 17 px (70 characters, unchanged).
- Dek line length 69 → 63 characters (it now uses the column width instead of its own 700 px box).
- Added `text-wrap: pretty` to prose, dek, callout and bio. Tried `hyphens: auto` on phones, saw three breaks in one paragraph, and took it out.

**Contrast**
- Button labels on orange: white on #e8590c was 3.58:1 (light) and white on #ff7a2f was 2.60:1 (dark). Both now use #1a0d05 text: 5.31:1 and 7.32:1. Applies to the header Subscribe hover, the footer Subscribe button and the avatars (white initials on the gradient went as low as 2.09:1).
- Muted text #6a707b → #5f6570: 4.77 → 5.62:1 on paper. The table caption had been 4.41:1 on its sunk background and is now 5.62:1 on paper.
- Code comments #6b7b92 → #8494ab: 4.17 → 5.82:1 on #0f1724.
- Footer placeholder #6c7480 → #8a919c: 3.65 → 5.43:1.

**Elevation and containers**
- Drop shadows at rest 4 → 0 (cover, code block, table, author card), and the hover shadow on related cards is gone too.
- The table is no longer a bordered white box: it is hairline rules on the paper, with the caption underneath and no fill.
- The author card is no longer a bordered, shadowed panel: it is a section with a rule above it.
- Related posts are no longer three bordered cards that lift 3 px on hover. They have no boxes, sit under a ruled heading, and the title turns orange and underlined on hover. On tablets they become rows lined up with the reading column (before, the rows were 640 px wide under a heading 840 px wide).

**Absolute bans removed**
- The pull quote's 4 px orange left border is now two hairlines (above and below) plus an orange opening quotation mark hung in the margin. The quote is upright semibold serif instead of italic.
- The contents rail's 2 px orange hover stripe is now a 1 px ink segment.
- Em dashes in the copy 10 → 0 (5 pairs replaced with parentheses or commas), and the em-dash prefix on the pull quote attribution is gone. The wording is unchanged.

**Bugs fixed**
- `:focus-visible { border-radius: 6px }` turned every pill (buttons, nav, kicker, tags) into a 6 px rectangle when it had focus. The rule is gone, so outlines follow each element's own shape.
- The author name had `.prose h2` styles leaking onto it: 30 px with a 72 px top margin, when 22 px / 4 px was intended. Fixed with a scoped selector, which also removes an `!important`.
- Tags rendered in the serif because they inherited prose styles. They are now Inter.
- Reading time "9 min read" → "6 min read". The body is 1,096 words plus one code block and one table.

**Layout and alignment**
- On desktop the article head was centred in an 860 px box over a 680 px left-aligned column. It now sits on the same grid as the body: the kicker, dek and byline start on the column's left edge, and the title extends into the right rail (up to 860 px).
- Spacing is now a 4/8/12/16/24/32/48/64/96 px scale with tokens. The one-off values 6, 7, 10, 14, 18, 22, 28, 56, 72 and 88 px are mapped onto it, apart from a few optical paddings.
- There is now a type token scale (12, 13, 14, 15, 17, 20, 22, 30 px plus clamps). The related heading (28 px) and the section heading (30 px) were different sizes for the same role; both are now 30 px. Card titles 19 → 20 px.
- Radii 6/14/18/20 px → 6/14/20 px.

**States, touch and motion**
- Touch targets under `pointer: coarse`: icon buttons 38 → 44 px, buttons 38 → 44 px, tags about 40 → 44 px, footer and author links about 23 → 43 px. On desktop, buttons and icon buttons are 40 px.
- The current nav item was shown only by colour. It is now also semibold with a 2 px orange underline.
- Added states that were missing: kicker hover, icon-button active, footer input hover, footer input `required` with an orange `:user-invalid` stroke, and a lighter orange focus ring in the footer.
- The code block and the table scroll sideways, so both now take keyboard focus (`tabindex="0"`, labelled regions).
- Every transition `ease` → ease-out-quart `cubic-bezier(0.25, 1, 0.5, 1)`, 150 ms or 220 ms tokens. Reduced motion also cuts transitions to 0.01 ms, on top of the existing rules that hide the cover packets and stop smooth scrolling.
- On phones the smallest text 12–13 → 13 px for uppercase labels and 14 px for everything else; code stays 14 px instead of dropping to 13.

**Colour hygiene**
- Hard-coded colours in the footer, code and avatar rules were moved into tokens. `#fff` text and fills were removed from the CSS. The drop cap (a 4.1 em orange Inter initial in a serif paragraph) was removed as decoration.

## Not changed or not verified

- The header still uses backdrop blur. It is functional (text scrolls under a sticky bar), so it was kept.
- The cover SVG's labels shrink to about 4 px on a 375 px phone. This was already true before and was left alone.
- Fonts still load from Google Fonts with `display=swap`, so the fonts can still swap visibly on load (FOUT). No fallback metrics were added.
- The share buttons and the subscribe form are still `href="#"` / `return false` stubs.
- Checked in Chrome only: light and dark, at 1440, 900 and 375 px. Not tested on real devices or in other browsers.
