---
name: Northwind
description: Account settings for a project-management app.
colors:
  primary: "oklch(0.52 0.19 268)"
  primary-hover: "oklch(0.46 0.18 268)"
  primary-wash: "oklch(0.955 0.025 268)"
  on-primary: "oklch(0.99 0.004 268)"
  canvas: "oklch(0.975 0.004 265)"
  surface: "oklch(0.995 0.002 265)"
  surface-alt: "oklch(0.982 0.003 265)"
  hairline: "oklch(0.925 0.007 265)"
  control-edge: "oklch(0.64 0.02 265)"
  ink: "oklch(0.22 0.03 265)"
  ink-secondary: "oklch(0.44 0.03 265)"
  ink-muted: "oklch(0.535 0.03 265)"
  success: "oklch(0.5 0.12 155)"
  success-wash: "oklch(0.965 0.03 155)"
  warning: "oklch(0.53 0.13 55)"
  caution: "oklch(0.78 0.15 80)"
  danger: "oklch(0.55 0.2 29)"
  danger-ink: "oklch(0.5 0.18 27)"
  danger-solid: "oklch(0.54 0.2 28)"
  danger-wash: "oklch(0.97 0.015 25)"
  danger-edge: "oklch(0.85 0.06 25)"
typography:
  headline:
    fontFamily: "Inter, Inter Fallback, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Inter, Inter Fallback, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, Inter Fallback, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "'cv11', 'ss01'"
  label:
    fontFamily: "Inter, Inter Fallback, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 500
  caption:
    fontFamily: "Inter, Inter Fallback, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
rounded:
  xs: "6px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  pill: "999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "8": "32px"
  "10": "40px"
  "14": "56px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.sm}"
    height: "38px"
    padding: "0 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    height: "38px"
    padding: "0 16px"
  button-danger:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.danger-ink}"
    rounded: "{rounded.sm}"
    height: "38px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    height: "40px"
    padding: "0 12px"
  section-panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "24px"
  badge-success:
    backgroundColor: "{colors.success-wash}"
    textColor: "{colors.success}"
    rounded: "{rounded.pill}"
    padding: "0 8px"
---

# Design System: Northwind

## 1. Overview

**Creative North Star: "The Quiet Control Panel"**

Northwind's settings are a control panel a person visits for one errand and leaves. The system is a cool neutral field tinted toward the accent hue (265), with a single indigo accent reserved for actions, selection and focus. Density is moderate: 14px body text, 40px controls, sections stacked in one 760px column beside a sticky section nav. Light and dark themes follow the operating system, because the scene is a team member at a desk mid-workday whose OS appearance already reflects their lighting.

The system rejects the generic SaaS admin template (every block a shadowed card, gradients on avatars, glassy headers, badges and pills everywhere) and strangeness without purpose (over-decorated buttons, mismatched form controls, gratuitous motion, invented affordances for standard tasks). It borrows the quiet density and unambiguous form states of Linear and Stripe settings.

Spacing runs on a 4px scale (4, 8, 12, 16, 20, 24, 32, 40, 56). Sections are 32px apart; the page title sits 24px above the first. Motion is 150ms for colour changes and 200ms for toggles, dialogs and toasts, all on one ease-out-quart curve.

**Key Characteristics:**
- One accent, used for primary actions, current selection, focus and "on" toggles only.
- Each settings section is one form with its own footer and one save action.
- Validation, saving and connection states are explicit, consistent and never colour-only.
- Flat at rest: panels are hairline-bordered, only floating layers cast shadows.
- One sans family (Inter) carries everything.

## 2. Colors

A restrained palette: tinted neutrals, one indigo accent, and semantic success, warning and danger pairs. Dark theme redefines the same tokens.

### Primary
- **Northwind Indigo** (primary): primary button fill, "on" toggles, seat meter, focus outline, links and the active nav icon. Hover deepens. In dark theme the fill stays mid-dark so white text holds 4.9:1, and a lighter **accent ink** (oklch 0.74 0.12 270) carries links and focus.
- **Indigo Wash** (primary-wash): selected nav item and avatar initials background.

### Neutral
- **Canvas**: page background behind the column and sidebar.
- **Surface**: section panels, inputs, secondary buttons, top bar.
- **Surface Alt**: section footers, row hover, search field.
- **Hairline**: panel borders and dividers. Decorative; never the only boundary of a control.
- **Control Edge**: input, select, search and secondary-button borders, "off" toggle track. Holds at least 3:1 against surface in both themes.
- **Ink / Ink Secondary / Ink Muted**: primary text, supporting text, hints and metadata. Ink Muted holds at least 4.8:1 on every background it sits on.

### Semantic
- **Success**: connected badge, saved status, met password rules, matching confirm field.
- **Warning**: unsaved-changes status (with a dot) and low-mid password strength. **Caution** is the third strength step only.
- **Danger**: invalid fields (border plus icon plus message), danger zone, destructive buttons; **Danger Solid** fills the final confirm button.

### Named Rules
**The One Voice Rule.** Indigo appears only where the user can act or where something is selected or focused. It is never decoration.

**The 3:1 Edge Rule.** Anything the user types into or toggles has an edge of at least 3:1 against its background. Hairlines are for grouping, not for controls.

## 3. Typography

**Body Font:** Inter (with a metric-matched Arial fallback, then system-ui)

**Character:** A single neutral grotesque tuned with `cv11` and `ss01`; hierarchy comes from weight and colour, not from a second family. Three weights only: 400, 500, 600.

### Hierarchy
- **Headline** (600, 24px, 1.25, -0.015em): the page title only.
- **Title** (600, 16px, 1.4, -0.01em): section titles; 18px in the dialog.
- **Body** (400, 14px, 1.5): descriptions and values. Descriptions cap at 60ch.
- **Label** (500, 14px): field labels, row names, provider names.
- **Caption** (400, 13px; 14px at 760px and below): hints, messages, status, badges, column heads.

### Named Rules
**The No Shouting Rule.** No uppercase tracked overlines. Column heads and the sidebar heading are sentence-case captions.

## 4. Elevation

Flat by default. Section panels sit on the canvas with a hairline border and no shadow; controls have no shadow. Depth appears only where a layer floats over the page.

### Shadow Vocabulary
- **Knob** (`box-shadow: 0 1px 2px oklch(0.22 0.03 265 / 0.25)`): the toggle knob, the one physical object on the page.
- **Float** (`box-shadow: 0 1px 2px oklch(0.22 0.03 265 / 0.06), 0 16px 40px -12px oklch(0.22 0.03 265 / 0.22)`): the delete dialog and the toast. Dark theme adds a 1px hairline ring.
- **Focus ring** (`box-shadow: 0 0 0 3px` accent at 30%): inputs and search on focus, with the border turning indigo.

### Named Rules
**The Flat-At-Rest Rule.** If it does not float, it does not cast a shadow.

## 5. Components

### Buttons
- **Shape:** gently rounded (8px), 38px tall; small variant 32px; 44px on touch devices.
- **Primary:** indigo fill, near-white text, 600 weight.
- **Secondary:** surface fill, control-edge border, ink text; hover darkens the border.
- **Ghost:** no fill, secondary ink; hover fills surface-alt.
- **Danger:** surface fill, danger edge, danger ink; the dialog's confirm is danger-solid.
- **Loading:** the label hides and a spinner takes its place at the same width; `aria-busy` is set.

### Section panels
- **Corner Style:** 12px.
- **Background:** surface, with a surface-alt footer band (min 64px) holding status on the left and actions on the right.
- **Shadow Strategy:** none (Flat-At-Rest).
- **Border:** 1px hairline; the danger zone uses danger-edge.
- **Internal Padding:** 24px (16px on phones).

### Inputs / Fields
- **Style:** 40px, 8px radius, control-edge border, surface fill.
- **Focus:** indigo border plus a 3px translucent ring.
- **Error:** danger border, inline icon, and a message beneath linked by `aria-describedby`. Valid confirm field turns success.

### Toggles
- 38 × 22px track with a 44px hit area on touch; "off" is control-edge, "on" is indigo; hover deepens either.

### Navigation
- Solid top bar (60px) with a hairline beneath. Sticky left section nav; the active item takes the indigo wash with an indigo icon (danger wash for Danger zone). Below 760px it becomes a horizontally scrolling strip.

### Status line
- Footer text: "Unsaved changes" (warning, with a dot), "Saving…", "✓ Saved just now" (success), or an error. "Discard changes" appears only while the form is dirty.

### Dialog
- Native `<dialog>` for the delete confirmation, 440px, plain scrim with no blur; typing the phrase enables the solid danger button.

## 6. Do's and Don'ts

### Do:
- **Do** keep indigo for actions, selection and focus only.
- **Do** give every section exactly one primary save action in its footer.
- **Do** show unsaved, saving, saved and invalid states in the footer status and at the field, never by colour alone.
- **Do** keep control edges at 3:1 or better and text at 4.5:1 or better in both themes.
- **Do** use the token scales; no raw hex, no off-scale spacing.

### Don't:
- **Don't** build a generic SaaS admin template: every block a shadowed card, gradients on avatars, glassy headers, badges and pills everywhere.
- **Don't** add strangeness without purpose: over-decorated buttons, mismatched form controls, gratuitous motion, invented affordances for standard tasks.
- **Don't** leave it unclear which save button covers which fields, or whether anything saved.
- **Don't** nest boxes inside panels (logo tiles, ringed avatars, boxed sidebar widgets).
- **Don't** use a side-stripe border as an accent on any panel or alert.
- **Don't** use uppercase tracked labels or weights outside 400/500/600.
