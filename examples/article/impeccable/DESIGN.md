---
name: Field Notes
description: The engineering blog of Halden, a European parcel logistics company.
colors:
  paper: "#fbfaf7"
  surface: "#fefdfb"
  surface-sunk: "#f3f1ec"
  ink: "#15171c"
  ink-soft: "#3d424c"
  muted: "#5f6570"
  rule: "#e6e2da"
  rule-strong: "#d6d1c6"
  signal-orange: "#e8590c"
  signal-orange-ink: "#b8430a"
  signal-orange-wash: "#fff1e8"
  signal-orange-rule: "#f8c9ab"
  on-signal: "#1a0d05"
  good: "#137a4a"
  good-wash: "#e5f4ec"
  night: "#0f1724"
  night-ink: "#dbe3ee"
  footer-night: "#11151c"
  footer-ink: "#e9ebef"
  footer-muted: "#9aa2ae"
typography:
  display:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "clamp(36px, 5vw, 60px)"
    fontWeight: 700
    lineHeight: 1.06
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "30px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  dek:
    fontFamily: "Source Serif 4, Georgia, Times New Roman, serif"
    fontSize: "clamp(18px, 2vw, 22px)"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "Source Serif 4, Georgia, Times New Roman, serif"
    fontSize: "20px"
    fontWeight: 400
    lineHeight: 1.7
  ui:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.4
  label:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    letterSpacing: "0.08em"
  code:
    fontFamily: "JetBrains Mono, ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.7
rounded:
  sm: "6px"
  md: "14px"
  lg: "20px"
  pill: "999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "24px"
  "6": "32px"
  "7": "48px"
  "8": "64px"
  "9": "96px"
  measure: "640px"
  wide: "1120px"
  page: "1280px"
  gutter: "clamp(16px, 4vw, 40px)"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.signal-orange}"
    textColor: "{colors.on-signal}"
  button-accent:
    backgroundColor: "{colors.signal-orange}"
    textColor: "{colors.on-signal}"
    rounded: "{rounded.pill}"
    height: "44px"
  kicker:
    backgroundColor: "{colors.signal-orange-wash}"
    textColor: "{colors.signal-orange-ink}"
    rounded: "{rounded.pill}"
    padding: "6px 12px"
  tag:
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.pill}"
    padding: "0 14px"
    height: "36px"
  callout:
    backgroundColor: "{colors.signal-orange-wash}"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.md}"
    padding: "24px"
  code-block:
    backgroundColor: "{colors.night}"
    textColor: "{colors.night-ink}"
    rounded: "{rounded.md}"
  post-card:
    textColor: "{colors.ink}"
---

# Design System: Field Notes

## 1. Overview

**Creative North Star: "The Well-Run Depot"**

Field Notes is a reading surface first. A warm off-white paper carries a large serif reading column; a crisp sans handles every piece of chrome, heading and label; one signal orange (the colour of a hi-vis vest and a depot sorting label) marks the few things that should catch the eye. Dark navy night surfaces are reserved for the evidence that is technical by nature: the cover diagram, the code block and the footer.

The density is low and the pacing is long-form: a 640px measure, generous paragraph spacing, sections separated by space rather than boxes. Polish here means order, the feeling of a depot where every parcel is where the scanner says it is. The system rejects generic SaaS marketing blog templates (gradient heroes, centered stacks, grids of identical cards), content-marketing clutter (share bars, pop-ups, newsletter modals) and developer costume (neon on black, monospace everywhere).

**Key Characteristics:**
- One reading column at 640px (about 70 characters at 20px), with quiet rails (share left, contents right) on wide screens.
- Serif for reading (Source Serif 4), sans for structure (Inter), mono only for real code (JetBrains Mono).
- Warm tinted neutrals in light mode, cool navy-tinted neutrals in dark mode.
- A single signal orange accent; green appears only to mark an improvement in data.
- Light and dark themes follow the device (`prefers-color-scheme`).

## 2. Colors

A restrained palette: warm paper neutrals, one signal orange used sparingly, and navy night surfaces for technical evidence.

### Primary
- **Signal Orange** (signal-orange): the accent. Focus rings, list markers, the reading-progress bar, the cover's hot shards, the callout icon. Never body text.
- **Signal Orange Ink** (signal-orange-ink): the text-safe darker orange for links, the kicker and hover states.
- **On Signal** (on-signal): the near-black label colour for anything set on Signal Orange (buttons, avatars): 5.3:1 light, 7.3:1 dark.
- **Signal Orange Wash / Rule** (signal-orange-wash, signal-orange-rule): the tinted fill and border of the kicker and the callout.

### Secondary
- **Depot Green** (good, good-wash): only for a positive change in a data table. Never decorative.

### Neutral
- **Warm Paper** (paper): the page background.
- **Surface** (surface): the share buttons' fill.
- **Sunk Paper** (surface-sunk): hover fills, inline code, the related-posts band.
- **Ink / Ink Soft / Muted** (ink, ink-soft, muted): headings and strong text; reading copy; metadata and labels.
- **Rule / Rule Strong** (rule, rule-strong): hairlines and tag outlines.
- **Night** (night, night-ink): code block surface and its text. **Footer Night** (footer-night, footer-ink, footer-muted): the footer.

### Named Rules
**The One Signal Rule.** Signal Orange covers well under 10% of any screen. It marks, it never fills large areas outside the cover art.

**The Readable Text Rule.** Every text colour on every surface meets 4.5:1 (3:1 for text 24px and up). Labels on orange are measured, not assumed.

## 3. Typography

**Display Font:** Inter (with system-ui)
**Body Font:** Source Serif 4 (with Georgia)
**Label/Mono Font:** JetBrains Mono, code only

**Character:** a precise, neutral sans for structure against a warm, bookish serif for reading. The pairing says "engineers who write well".

### Hierarchy
- **Display** (700, clamp(34px, 5vw, 60px), 1.06): the article title only.
- **Headline** (700, 30px, 1.2): section headings in the article and the related band.
- **Title** (700, 20 to 22px, 1.3): related-post titles (20px), author name (22px).
- **Dek** (Source Serif 4 400, clamp(18px, 2vw, 22px), 1.5): the subtitle.
- **Body** (Source Serif 4 400, 20px, 1.7): reading copy, capped at the 640px measure (about 70 characters). 18px on phones.
- **UI** (Inter 500, 13 to 17px on the --text-* scale): navigation, byline, buttons, tags, captions; callout and bio copy at 17px.
- **Label** (Inter 600, 11 to 12px, 0.08em, uppercase): rail and column labels, table heads.

### Named Rules
**The Two Voices Rule.** Serif is for things you read; sans is for things you scan or click. Never set reading copy in Inter or UI labels in the serif.

## 4. Elevation

Flat. Nothing on the page floats, so nothing casts a shadow: depth comes from hairline rules (rule, rule-strong), tonal fills (sunk paper, orange wash) and the dark night surfaces. The only layered element is the sticky header, which uses a translucent paper fill with backdrop blur and a bottom hairline so text scrolling beneath it stays legible.

### Named Rules
**The Flat-By-Default Rule.** Surfaces sit flat on the paper. A shadow must answer "what is this floating above?"; if there is no answer, use a rule or nothing.

## 5. Components

### Buttons
- **Shape:** full pill (999px).
- **Primary:** ink fill, paper text, 40px tall (44px on touch), 16px side padding, Inter 600 14px.
- **Accent:** Signal Orange fill with On Signal text (footer subscribe).
- **Hover / Focus:** fill shifts to Signal Orange with On Signal text; 2px orange focus outline offset 3px that follows the pill shape; 1px press-down on active.
- **Icon button:** 40px circle (44px on touch), 20px stroked icon, sunk-paper fill on hover.

### Chips
- **Kicker:** orange wash pill with orange-ink text, links to the topic.
- **Tags:** outlined Inter pills (rule-strong), 36px tall (44px on touch), muted `#` prefix, orange wash on hover.

### Cards / Containers
- **Corner Style:** 14px for the code block, callout and related-post art, 20px for the cover.
- **Background:** only the callout (orange wash) and code (night) are filled; the table, author block and related posts sit on the paper between rules.
- **Shadow Strategy:** none, see Elevation.
- **Border:** 1px rule.
- **Internal Padding:** 24px (16px on phones).

### Inputs / Fields
- **Style:** footer email field, pill, dark fill (#171b23) with a 1px #2c323d stroke, 44px tall, placeholder #8a919c (5.4:1).
- **Focus:** the light orange outline (#ff9a5c) used across the footer.
- **Error:** required; after interaction an invalid address turns the stroke light orange.

### Navigation
- **Header:** sticky, translucent paper with backdrop blur, 68px tall; topic links as Inter 500 14px muted pills, ink on hover; the current topic is ink, 600 and underlined in orange.
- **Contents rail:** sticky ordered list with a 1px left rule; on hover a link turns ink and its 1px rule segment turns ink.
- **Mobile:** topic nav and both rails hide below 960px and 1180px respectively.

### Pull quote
Upright semibold serif (26 to 32px) between two hairlines, with an orange opening quotation mark hung in the left margin; plain attribution beneath in muted Inter.

### Callout
Orange wash panel with a 1px orange rule border and a stroked warning-triangle icon in Signal Orange Ink.

### Related posts
Three posts under a ruled "Keep reading" heading: art, muted meta, a 20px title and the author. No card boxes or lift; on hover the title turns Signal Orange Ink with an underline. On tablets they become rows aligned to the reading column.

## 6. Do's and Don'ts

### Do:
- **Do** keep the reading column at the 640px measure and body copy at 20px (18px on phones).
- **Do** keep Signal Orange under 10% of the screen; use Signal Orange Ink for orange text.
- **Do** measure every text-on-colour pair against 4.5:1, including button labels on orange.
- **Do** use rules and space to separate sections before reaching for a box.
- **Do** honour `prefers-reduced-motion` and `prefers-color-scheme`.

### Don't:
- **Don't** make it look like a generic SaaS marketing blog template: no gradient hero, no centered stack, no grid of identical cards.
- **Don't** bury the article under share bars, pop-ups, newsletter modals or sticky banners.
- **Don't** use developer costume: no neon on black, no monospace outside real code.
- **Don't** use `border-left` or `border-right` wider than 1px as a coloured accent stripe on quotes, callouts or list items.
- **Don't** use gradient text, decorative glassmorphism, or em dashes in copy.
- **Don't** use pure `#000` or `#fff`; tint toward the palette.
