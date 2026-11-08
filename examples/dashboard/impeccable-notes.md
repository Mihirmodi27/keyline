# Impeccable on the dashboard scene

Source: `before/` copied to `impeccable/`. Impeccable skill only (installed at `~/.agents/skills/impeccable`): setup gates, then `teach` (which delegated to `document` for DESIGN.md), then `polish`. No other skills.

## What teach set up

No user was available, so I answered teach's interview as the client, using only BRIEF.md and the existing page. Where the brief says nothing, I used teach's defaults.

- **Register:** `product`. The brief asks for a dashboard, and the code has an app shell, a data table and side navigation.
- **Users and purpose** (from the brief): small SaaS teams doing a daily check of how the period went.
- **Personality:** "modern, polished" comes from the brief. "Trustworthy" and the references (Linear, Stripe) are teach's defaults for product. The anti-references come from Impeccable's own bans: hero-metric template, identical card grids, glassmorphism, gradient decoration.
- **Accessibility:** teach's default, WCAG AA. The brief does not mention it.
- **Theme:** the scene sentence is "a teammate on a laptop in a daylit office", so light is the default. Dark still follows the device, as in `before`.
- **Colour strategy:** **Restrained**, the product default. That means tinted neutrals (hue 270) plus one indigo signal used only for selection, links, focus and the current-period line. Green and red are used only for gain and loss.
- **DESIGN.md:** Creative North Star "The Quiet Instrument Panel". After polish I updated it to the final tokens and added a DESIGN.json sidecar.

Files written: `PRODUCT.md`, `DESIGN.md`, `DESIGN.json`. I also edited `index.html`, `styles.css` and `script.js`. The page is still static and opens from file://.

## What polish changed

Measurements come from headless Chrome at 1440×900 in the light theme, using the same script on `before/` and `impeccable/`. Contrast is WCAG 2 relative luminance, worked out from the token values.

1. **Bordered boxes: 12 → 2.**
   - The four KPI cards became one strip with no boxes: 1px vertical hairlines between columns and one hairline underneath. This removes the "hero-metric template / identical card grid" ban.
   - The chart, table and activity cards were also unboxed. The table sits under the chart with a hairline between them. Activity is a rail whose 1px rule sits in the middle of the 48px gutter.
   - The workspace switcher and the usage box lost their borders.
   - Only search and the date-range button keep borders.
2. **Shadowed elements: 16 → 3.**
   - Removed the resting shadows on cards, controls and the brand mark.
   - Kept a shadow only on floating layers: the menu, the tooltip and the drawer. The other two are the separation rings on the unread dot and the chart hover dot.
   - The top bar's `backdrop-filter: saturate(180%) blur(12px)` became a solid background (1 → 0).
   - CSS gradients went from 3 → 0 (brand mark, workspace avatar, usage bar).
3. **Type scale: 12 sizes → 6 tokens.**
   - Before: 11, 11.5, 12, 12.04, 12.5, 13, 13.5, 14, 15, 16, 22, 30px. After: 12/13/14/16/20/26px.
   - Two sizes fall outside the six tokens: mono paths at 12.5px and inline code at 12.88px.
   - h1 22 → 20px, metric values 30 → 26px, section titles 15 → 16px.
   - Sidebar group labels went from 11px uppercase with 0.06em tracking to 12px sentence case.
   - On phones (≤560px), label text 13 → 14px and captions 12 → 13px.
4. **Contrast** (light theme):
   - Tertiary text `#7a8396` scored 3.81:1 on white, 3.55:1 on the canvas and 3.64:1 on the table header. It is now `oklch(52.5% 0.026 266)`: 5.26:1 on the canvas, 5.01:1 on the sidebar and 4.89:1 on the raised surface. It carries axis ticks, timestamps, table headers and metadata.
   - The green delta pill was 3.93:1. It is now plain green text at 5.37:1.
   - Red deltas: 4.54:1 on the pill → 5.65:1 as text.
   - The previous-period line was 1.85:1 and is now 3.28:1, which clears 3:1 for graphics.
   - In dark mode, tertiary text is 6.10:1, the previous-period line 3.38:1, and the brand-mark glyph 6.37:1 (dark ink on the indigo).
   - The whole palette moved from hex to OKLCH tokens, with neutrals tinted toward the accent hue. There is no `#fff` left, and no hard-coded hex or rgba anywhere in the stylesheet.
5. **Copy and terminology:**
   - The metrics said "prior 30 days", the legend "Previous period" and the tooltip "Previous". All three now say "previous period".
   - Subtitles no longer repeat the date range, which the picker owns: "…, last 30 days" became "Unique visitors per day" and "Sorted by views". The filler subtitle "Your team and your tracking" was removed.
6. **Colour as the only signal:**
   - Delta arrows were `aria-hidden`, so screen readers heard "17.5%" with no direction. Each delta now has an sr-only "Up" or "Down".
   - The 61.3% bounce flag was a red pill. It is now red text with an alert icon and sr-only text: "above the 60% alert threshold".
   - The mail icon in the feed was drawn in the accent colour (class `fi-blue`) and is now neutral. Feed classes were renamed by meaning: `fi-gain`, `fi-loss` and `fi-neutral`.
   - The nav count pill (border plus pill) became a plain tertiary figure.
7. **Interaction and keyboard:**
   - Picking a date range used to update only the label, so "Last 7 days" still showed "Oct 6 – Nov 4". The dates now update with it.
   - The range menu gained Home and End keys.
   - The chart is focusable: arrow keys and Home/End step through the days and Esc closes the readout. Before, the chart was mouse and touch only.
   - Every button and link has `:active` press states.
   - Controls are 36px, and 44px on coarse pointers (`@media (pointer: coarse)`), including nav links and menu options. Before, they were 38px with no touch sizing.
8. **Mobile drawer:**
   - When closed, the drawer was moved off-screen but its links could still be reached with Tab. It is now `visibility: hidden` when closed.
   - While it is open, the page behind it is `inert` and focus moves to the current nav item.
   - Widening past 860px closes it. This was checked over CDP.
9. **Motion and loading:**
   - All transitions use one token, `cubic-bezier(0.25, 1, 0.5, 1)` (ease-out-quart), at 150ms. The drawer uses 220ms. Before, transitions used the default `ease`.
   - Added an "Inter Fallback" `@font-face` (local Arial with size-adjust 107.1% and ascent/descent overrides), so the font swap does not move text.

## Checks

- No console errors or exceptions in either theme.
- No horizontal scroll at 500px.
- Keyboard checks passed for the chart, the range menu and the drawer.
- Screenshots were checked at 1440px (light and dark) and 500px.
