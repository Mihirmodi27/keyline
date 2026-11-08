---
name: Tandem
description: Meeting times that work in every time zone.
colors:
  ink: "oklch(18.5% 0.03 265)"
  ink-secondary: "oklch(38% 0.03 265)"
  ink-tertiary: "oklch(50% 0.025 265)"
  hairline: "oklch(91.5% 0.01 265)"
  hairline-soft: "oklch(95% 0.007 265)"
  hairline-strong: "oklch(84% 0.014 265)"
  paper: "oklch(99.3% 0.003 265)"
  paper-raised: "oklch(99.8% 0.002 265)"
  paper-tint: "oklch(97.4% 0.006 265)"
  ember: "oklch(69% 0.19 38)"
  ember-text: "oklch(53% 0.18 36)"
  ember-wash: "oklch(95.5% 0.025 40)"
  working-wash: "oklch(92.5% 0.04 259)"
  working-text: "oklch(42% 0.14 259)"
  flexible-wash: "oklch(94.5% 0.045 78)"
  flexible-text: "oklch(46% 0.1 70)"
  confirm-green: "oklch(52% 0.13 158)"
  night: "oklch(17% 0.03 268)"
  on-night: "oklch(97% 0.005 265)"
typography:
  display:
    fontFamily: "Inter Tight, Inter, system-ui, sans-serif"
    fontSize: "clamp(42px, 5.2vw, 68px)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Inter Tight, Inter, system-ui, sans-serif"
    fontSize: "clamp(30px, 3.4vw, 44px)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Inter Tight, Inter, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.2
rounded:
  sm: "8px"
  md: "14px"
  lg: "22px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "20px"
  lg: "32px"
  xl: "64px"
  section: "clamp(80px, 10vw, 128px)"
  section-tight: "clamp(64px, 8vw, 96px)"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: "12px 20px"
  button-primary-hover:
    backgroundColor: "oklch(27% 0.035 265)"
  button-ghost:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "12px 20px"
  chip:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink-secondary}"
    rounded: "{rounded.pill}"
    padding: "6px 12px"
  plan-card:
    backgroundColor: "{colors.paper-raised}"
    rounded: "{rounded.lg}"
    padding: "32px"
---

# Design System: Tandem

## 1. Overview

**Creative North Star: "The Shared Clock"**

Tandem's page is a clean product-marketing surface built around one object: a timeline where four teammates' days line up and one hour lights up for all of them. Everything else is set in a single neo-grotesque family on near-white paper, with dark ink and one warm ember accent. Density is moderate; sections are long and calm, and the product visual is the only richly detailed thing on the page.

The system is restrained by temperament: tinted neutrals, one accent that means "the chosen time" or "act here", and a small set of state colours that exist only inside the product visual (working, flexible, off, confirmed). It rejects the generic AI-built SaaS page named in PRODUCT.md: the centred eyebrow-headline-subhead stack repeated everywhere, identical icon-over-heading feature cards, gradient blobs, and every section wrapped in a bordered rounded card.

**Key Characteristics:**
- One family (Inter, with Inter Tight for display), weight and size carry hierarchy.
- Ember accent reserved for the best slot, the primary nudge and the plan you are being steered to.
- Product visual drawn in HTML and CSS, not a screenshot.
- Two dark bands (testimonials, final call to action) for pacing.
- Pill-shaped buttons and chips; larger radii on containers.

## 2. Colors

A cool, slightly blue-tinted neutral ramp with one warm ember accent and a state palette confined to the product visual.

### Primary
- **Ember**: the chosen hour in the timeline, the pill dot, the "Most popular" tag, the suggestion button. Meaning: "this one". Text on ember is always ink (6.2:1), never white (2.9:1).
- **Ember Text**: ember for text, icon strokes and the focus ring on light paper (5.6:1 on paper, 5.3:1 on paper tint).
- **Ember Wash**: pale ember ground behind the accent chip.

### Secondary
- **Working Wash / Working Text**: a teammate's working hours in the timeline.
- **Flexible Wash / Flexible Text**: early or late hours someone could stretch to.
- **Confirm Green**: "connected", "invite sent", plan check marks.

### Neutral
- **Ink**: headings, primary button, body text.
- **Ink Secondary**: paragraphs and nav links.
- **Ink Tertiary**: captions, fine print, metadata (at least 5.5:1 on every light ground).
- **Hairline**, **Hairline Soft**, **Hairline Strong**: dividers between list items, rows and steps.
- **Paper**, **Paper Raised**, **Paper Tint**: page, raised surfaces (app window, plans), alternate section grounds. No pure white anywhere.
- **Night** and **On Night**: dark bands and their text.

### Named Rules
**The One Meaning Rule.** Ember means "the chosen time" or "act here". It never decorates.

**The Visual-Only Palette Rule.** Blue, amber and green belong to the product visual and its echoes (step chips, check marks). They never colour page chrome.

## 3. Typography

**Display Font:** Inter Tight (with Inter, system-ui)
**Body Font:** Inter (with system-ui, -apple-system, Segoe UI)

**Character:** One neo-grotesque voice, tightened for display. Calm, technical, unshowy; the product visual supplies the personality.

### Hierarchy
- **Display** (700, clamp(42px, 5.2vw, 68px), 1.02): the hero headline only.
- **Headline** (700, clamp(30px, 3.4vw, 44px), 1.1): section headings.
- **Title** (600, 20px, 1.15): feature, step and plan names, one size everywhere.
- **Body** (400, 16px, 1.6): paragraphs; lead at 19px. Keep lines under 75ch.
- **Label** (500, 12 to 13px): pill, chips, window chrome. No uppercase eyebrows; section headings stand alone.

### Named Rules
**The Tabular Time Rule.** Every hour, offset and price is set with tabular numerals so columns of time line up.

## 4. Elevation

Flat by default. Content sits on the page separated by hairlines and spacing. One shadow exists, and only three things wear it: the app window, the suggestion card and the featured plan.

### Shadow Vocabulary
- **Floating** (`box-shadow: 0 2px 4px oklch(18.5% 0.03 265 / 0.04), 0 24px 60px -20px oklch(18.5% 0.03 265 / 0.28)`): app window, suggestion card, featured plan.

### Named Rules
**The Only-What-Floats Rule.** A shadow says "this sits above the page". Only the app window, the suggestion card and the featured plan float.

## 5. Components

### Buttons
- **Shape:** fully rounded pill (999px).
- **Primary:** ink ground, paper text, 12px 20px; 15px semibold. Large variant 15px 24px at 16px.
- **Hover / Focus:** hover lightens the ink ground over 160ms ease-out-quart; focus is a 2px Ember Text outline offset 3px (bright Ember on night bands); active nudges down 1px. 44px minimum height on coarse pointers.
- **Ghost:** paper ground, hairline border, ink text. On dark bands: a light button and a translucent outline button.

### Chips
- **Style:** pill, paper-tint ground, hairline border, 13px medium ink-secondary text. Variants: confirm (green wash), accent (ember wash).

### Cards / Containers
- Only three things are boxed: the app window, the suggestion card and the three pricing plans. Features, steps, testimonials and FAQ items are ruled lists (1px top or bottom hairline), not cards.
- **Corner Style:** 22px for the window and plans, 14px for the suggestion card, 28px for the final call-to-action band.
- **Background:** paper raised.
- **Shadow Strategy:** see Elevation.
- **Internal Padding:** 32px for plans; plan rows align across columns with subgrid.

### Navigation
- Sticky 68px bar, translucent paper with a blur, hairline bottom. Links 15px medium ink-secondary, ink on hover. Hidden below 900px; the "Start free" button stays.

### The Overlap Timeline (signature)
A 12-column grid of hour cells per teammate (avatar, name, city and UTC offset on the left). Cells are working (blue wash), flexible (amber wash) or off (cool grey); the shared best hour is solid ember in every row, with its UTC label in ember deep above. A suggestion card, overlapping the window, lists each person's local time. It does not animate.

## 6. Do's and Don'ts

### Do:
- **Do** reserve Ember for the chosen hour, the primary nudge and the recommended plan.
- **Do** let the overlap timeline carry the explanation; keep copy beside it short and specific.
- **Do** use tabular numerals for every time, offset and price.
- **Do** meet WCAG 2.2 AA: 4.5:1 for body text, 3:1 for large text and focus rings.
- **Do** honour `prefers-reduced-motion`.

### Don't:
- **Don't** build the generic AI-built SaaS page: a centred eyebrow-headline-subhead stack in every section, identical icon-over-heading feature cards, soft gradient blobs, every section wrapped in a bordered rounded card.
- **Don't** use the hero-metric template (big number, small label, gradient accent).
- **Don't** loop decorative motion (floating cards, pulsing dots).
- **Don't** use glassmorphism as decoration.
- **Don't** use `border-left` or `border-right` over 1px as a coloured stripe, or gradient text.
- **Don't** use em dashes in copy.
