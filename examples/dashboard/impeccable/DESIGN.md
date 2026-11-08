---
name: Lumen
description: Product analytics for small SaaS teams. The Overview dashboard.
colors:
  canvas: "oklch(99.1% 0.002 270)"
  sidebar: "oklch(97.4% 0.004 270)"
  surface-raised: "oklch(96.6% 0.005 270)"
  hairline: "oklch(92.4% 0.007 270)"
  hairline-strong: "oklch(86.5% 0.009 270)"
  ink: "oklch(21% 0.034 268)"
  ink-secondary: "oklch(44.5% 0.03 266)"
  ink-tertiary: "oklch(52.5% 0.026 266)"
  signal-indigo: "oklch(56% 0.215 277)"
  signal-indigo-ink: "oklch(49% 0.21 276)"
  signal-indigo-wash: "oklch(95% 0.024 280)"
  on-signal: "oklch(99% 0.004 277)"
  gain-green: "oklch(50.5% 0.125 156)"
  gain-green-wash: "oklch(95.5% 0.035 156)"
  loss-red: "oklch(53% 0.185 29)"
  loss-red-wash: "oklch(95.5% 0.025 25)"
  previous-period: "oklch(64% 0.022 266)"
typography:
  metric:
    fontFamily: "Inter, Inter Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
    fontFeature: "\"tnum\""
  headline:
    fontFamily: "Inter, Inter Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Inter, Inter Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, Inter Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "\"cv11\", \"ss01\""
  label:
    fontFamily: "Inter, Inter Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.5
  caption:
    fontFamily: "Inter, Inter Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.35
  mono:
    fontFamily: "ui-monospace, SF Mono, Menlo, Consolas, monospace"
    fontSize: "12.5px"
    fontWeight: 400
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  full: "999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "24px"
  "6": "32px"
  "7": "48px"
components:
  nav-link:
    textColor: "{colors.ink-secondary}"
    rounded: "{rounded.md}"
    padding: "0 10px"
    height: "34px"
  nav-link-active:
    backgroundColor: "{colors.signal-indigo-wash}"
    textColor: "{colors.signal-indigo-ink}"
    rounded: "{rounded.md}"
  input-search:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "36px"
  button-control:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "36px"
  button-icon:
    textColor: "{colors.ink-secondary}"
    rounded: "{rounded.md}"
    size: "36px"
  delta-up:
    textColor: "{colors.gain-green}"
  delta-down:
    textColor: "{colors.loss-red}"
  menu:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.lg}"
    padding: "6px"
---

# Design System: Lumen

## 1. Overview

**Creative North Star: "The Quiet Instrument Panel"**

Lumen is a tool a small team glances at every day, so the system behaves like a good instrument panel: every dial is legible at a glance, nothing glows unless it is telling you something, and the layout never moves under your hand. Density is moderate: a 14px body, tabular figures wherever a number appears, and one indigo signal colour reserved for the current selection, links, focus and the live data line.

Structure comes from spacing and 1px hairlines, not boxes. The page is one near-white canvas; the sidebar is a second, slightly darker neutral layer. The headline metrics are a single ruled strip; the chart and the top-pages table share the main column, split by a hairline; recent activity sits in a rail whose rule is centred in the 48px gutter. Only things that float (menus, tooltip, mobile drawer) carry a shadow. Light is the default (a teammate on a laptop in a daylit office); dark follows the device. Spacing runs on a 4px base (4, 8, 12, 16, 24, 32, 48); content caps at 1440px with 32px gutters, 16px on phones.

It explicitly rejects the generic SaaS dashboard template named in PRODUCT.md: identical KPI cards with coloured pills, every section in a shadowed card, gradients on logos and progress bars, glassmorphism as styling, and neon or purple-gradient "AI tool" looks.

**Key Characteristics:**
- One sans family (Inter, with a metric-matched Arial fallback), product scale of 12/13/14/16/20/26px, tabular numerals.
- Restrained colour: neutrals tinted to hue 270, one indigo signal, green and red only for gain and loss.
- Hairlines before boxes; shadows only for things that float.
- Controls 36px tall, 44px on coarse pointers.
- 150ms state transitions on ease-out-quart; 220ms for the drawer; no choreography.

## 2. Colors

A restrained, cool-tinted neutral system with one indigo signal and a gain/loss pair. All values are OKLCH; dark mode redefines the same tokens under `prefers-color-scheme: dark`.

### Primary
- **Signal Indigo**: the current-period line, the selected nav icon, focus rings, table view bars (at 45%) and the usage meter.
- **Signal Indigo Ink**: text-weight indigo for links and the active nav label (6.6:1 on the canvas).
- **Signal Indigo Wash**: the active nav item and the chart annotation.
- **On Signal**: the glyph on the brand mark (near-white in light, near-black in dark).

### Secondary
- **Gain Green** and **Loss Red**: change figures as plain coloured text (5.4:1 and 5.7:1 on the canvas), alert icons, the bounce-rate flag. Their washes appear only behind the round status icons in the feed.

### Neutral
- **Canvas**: the page, top bar, controls and menus.
- **Sidebar**: the navigation column, one step darker.
- **Raised Surface**: menu and button press states, inline code, neutral feed icons, the ⌘K key.
- **Hairline** and **Strong Hairline**: dividers, the table header rule, control borders, the chart baseline.
- **Ink**, **Secondary Ink**, **Tertiary Ink**: text tiers at 17.3:1, 7.4:1 and 5.3:1 on the canvas.
- **Previous Period**: the dashed comparison line (3.3:1).
- **Identity tints** (violet, amber, teal, in the stylesheet as `--av-*`): people and workspace avatars only.

### Named Rules
**The One Signal Rule.** Indigo marks selection, links, focus and the current-period data. If indigo appears on anything else, it is wrong. A mail icon is not a state, so it is neutral.

**The Gain/Loss Rule.** Green and red mean up and down (or alert), always with an arrow, sign, icon or screen-reader word beside them. Never colour alone.

**The Tertiary Floor Rule.** Tertiary Ink must hold 4.5:1 on every surface it sits on, the sidebar included. It carries axis ticks, timestamps and table headers, which are small.

## 3. Typography

**Body Font:** Inter (with Inter Fallback, a size-adjusted local Arial, then the system stack)
**Mono Font:** ui-monospace, SF Mono, Menlo, Consolas (paths, hostnames, code)

**Character:** One neutral sans carries headings, labels, data and body; mono marks things the user would type into a URL bar.

### Hierarchy
- **Metric** (600, 26px, 1.2, -0.02em, tabular): the four headline numbers. Largest thing on the page, but not a hero.
- **Headline** (600, 20px, 1.25): the page title.
- **Title** (600, 16px, 1.3): section titles; also the chart summary figures.
- **Body** (400, 14px, 1.5): feed text, controls, nav.
- **Label** (500, 13px): metric names, table cells, legends, links, change figures.
- **Caption** (400 to 500, 12px): axis ticks, timestamps, table headers, sidebar group labels, crumbs. On phones (≤560px) caption becomes 13px and label 14px.

### Named Rules
**The Tabular Rule.** Every figure that can sit above or beside another figure uses tabular numerals.

**The Six Sizes Rule.** Text uses the six sizes above and nothing between them; mono paths at 12.5px are the one exception.

## 4. Elevation

Flat by default. Resting content has no shadow: no metric cards, no section cards, no shadowed controls. Depth comes from the sidebar's darker neutral and from hairlines. Shadows appear only on layers that float above the page. The top bar is solid, not blurred.

### Shadow Vocabulary
- **Pop** (`box-shadow: 0 12px 32px -8px oklch(25% 0.03 270 / 0.18), 0 2px 6px oklch(25% 0.03 270 / 0.06)`): date-range menu, chart tooltip, mobile drawer. In dark mode: `0 16px 40px -8px oklch(5% 0.01 270 / 0.6), 0 0 0 1px` the hairline.
- **Separation ring** (`box-shadow: 0 0 0 2px` canvas): the unread dot and the chart hover dot, to cut them out of what sits behind.

### Named Rules
**The Float-Only Rule.** A shadow means "this is above the page". If it does not open, hover or slide in, it gets no shadow.

## 5. Components

### Buttons and controls
- **Shape:** 8px radius, 36px tall (44px on coarse pointers).
- **Bordered controls** (search, date range): canvas fill, Strong Hairline border; hover darkens the border to Tertiary Ink; press fills Raised Surface.
- **Icon buttons** (notifications, menu): borderless; hover gets a 7% neutral wash, press Raised Surface.
- **Focus:** 2px Signal Indigo outline, 2px offset, everywhere.

### Date range picker
- Two parts: bold range name, then the concrete dates (tabular) after a hairline. Choosing an option updates both. The listbox menu (12px radius, Pop shadow) supports arrows, Home/End, Enter and Escape, and returns focus to the button.

### Inputs / Fields
- **Search:** 300px (220px at ≤1280px, fills the row on phones), magnifier icon, ⌘K hint. Focus turns the border indigo with a 3px indigo wash ring.

### Navigation
- Sidebar links: 14px medium, Secondary Ink, 8px radius, 34px tall. Hover gets a neutral wash; the active item gets Signal Indigo Wash with Indigo Ink. Group labels are 12px sentence case. Counts are plain tertiary figures, not pills. Below 860px the sidebar becomes a drawer (220ms, ease-out-quart) behind a scrim; when closed it is `visibility: hidden`, and while open the page behind is `inert`.

### Metric strip
- Four columns divided by 1px hairlines, with a hairline under the strip. Label, then value, then a change line: the coloured arrow and figure, then "vs [prior value] previous period" in Tertiary Ink. Two columns at ≤1100px.

### Chart
- Current-period line (2.25px Signal Indigo) over a faded area fill; dashed previous-period line; solid hairline gridlines at 70%; one annotation. Hover or focus shows a rule, a dot and a tooltip; arrow keys and Home/End step through days. Summary figures below align with the plot.

### Activity feed
- A vertical timeline: 32px avatar or status icon (green or red wash for gain or alert, neutral otherwise), bold actor, plain sentence, 12px timestamp, joined by a 1px rail.

### Table
- Full-width, no box: 12px header row over a Strong Hairline, 13px tabular cells, hairlines between rows, no row hover (rows are not interactive). Mono paths with a 3px indigo bar showing share of views. Flagged values get the alert icon in Loss Red plus screen-reader text.

## 6. Do's and Don'ts

### Do:
- **Do** keep Signal Indigo to selection, links, focus and the current-period line (The One Signal Rule).
- **Do** pair every green or red with an arrow, sign, icon or screen-reader word.
- **Do** use tabular numerals for every figure.
- **Do** hold text to WCAG AA: 4.5:1 for text, 3:1 for chart lines, icons and focus rings, in both themes.
- **Do** name comparisons the same way everywhere: "previous period".
- **Do** group with spacing and 1px hairlines before reaching for a box.

### Don't:
- **Don't** build "the generic SaaS dashboard template: a row of identical KPI cards (big number, small label, coloured pill), every section in its own shadowed card, gradients on logos and progress bars."
- **Don't** use "glassmorphism and decorative blur used as styling rather than function." The top bar is solid.
- **Don't** over-decorate controls: "heavy shadows, pill badges on everything, colour used as ornament instead of meaning."
- **Don't** drift toward "neon-on-black analytics styling and purple-gradient AI-tool aesthetics."
- **Don't** bring "marketing-page typography inside the app (display fonts, oversized hero numbers)."
- **Don't** use a coloured side-stripe border wider than 1px on any row, card or alert.
- **Don't** repeat the date range inside section subtitles; the picker owns it.
