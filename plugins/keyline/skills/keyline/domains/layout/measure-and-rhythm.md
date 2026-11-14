# Measure and rhythm

## Deriving `measure.reading`

Set the measure in characters of `type.body`, then resolve it; a pixel number chosen first is a guess about an unmeasured font.

```css
:root {
  --measure-reading: 60ch;   /* ≈ 70 characters */
}
.prose { max-width: var(--measure-reading); margin-inline: auto; }
```

`ch` is the advance of the digit zero, which runs 10–20% wider than an average lowercase letter in most text faces, so `60ch` usually holds about 70 real characters. Measure once with the real font and copy, then keep the unit, which follows the font when the family changes. For a pixel token, resolve from the average character width and record both in `DESIGN.md`:

| `type.body` | Average character | 60 characters | 68 characters | 75 characters |
|---|---|---|---|---|
| 15px sans | ≈ 7.5px | 450px | 510px | 560px |
| 16px sans | ≈ 8px | 480px | 545px | 600px |
| 17px serif | ≈ 8.3px | 500px | 565px | 620px |
| 18px sans | ≈ 9px | 540px | 610px | 675px |

These are text widths; add two `gutter`s for the container. A longer line needs more leading for the return sweep — a pairing the type guide tunes against a stable measure.

### Check the narrowest case

The narrowest measure is the smallest supported viewport minus two `gutter`s — 360 − 2 × 20 = 320px, say. If the longest real `type.title` breaks into four lines there, or a long word overflows, fix the type ladder rather than shrinking the title on phones; a responsive type step usually means one size is too large for the narrowest column. The exception is an editorial article title, which takes its one phone step from the type dials. For a word that can't fit (a long compound, a URL), give prose `overflow-wrap: anywhere` rather than letting it widen the page.

### Why every template shares it

An index summary and its detail page are one piece of content at two lengths. With a 720px article and a 640px index, every click moves the text sideways and the reader rereads the first line to find their place — on every navigation, which is why a second measure needs a decision in `DESIGN.md`, not just a class.

## Page structure per preset

### Editorial — one column

One container, one measure, every template; non-text content leaves the column by being placed outside it, never by widening it.

### Product — an app shell

A working reader needs navigation, content and detail together, so the page is regions, each sized by the `measure.app` dial:

| Region | Holds | Collapses |
|---|---|---|
| Navigation | Every destination | Last — to an icon rail, then, below `bp.shell`, a sheet that opens always expanded |
| Content | The page, filling its panel, left-aligned at one `gutter`; forms and settings cap at `measure.form` | Never |
| Inspector | Detail on the selection | First — to an overlay sheet on `z.overlay` |

Settings help, onboarding copy, a changelog entry and an empty state's explanation still sit at `measure.reading`; a 1200px-wide paragraph of help text in a settings pane is the most common product failure of law 1. The inspector is detail, so it collapses first; navigation is how the reader leaves, so it stays longest. A centred column inside the content panel wastes the width a working reader opened the window for, and a page that sets its own `max-width` or padding drifts from its neighbours: the shell owns both.

**The sidebar.** Navigation is this one surface; a top bar repeating it puts a second band of chrome over every screen. Its top holds the workspace switcher, search (⌘K) and the product's primary utility; its footer holds the reader's own controls — theme, language, profile and role. Primary destinations sit flat at the top, with no heading, and never fold; the rest go under one quiet heading in collapsible folders, open state remembered and the current page's folder forced open. Nesting stops at one level: a small sub-section becomes a tab on its parent page, not a row under it. Administration lives in the account menu, not among destinations. Groups of destinations are parted by space and their group label alone: no hairline under a label and none between groups. Rows are dense, about 30px, with the workspace name at the nav's own size, so the sidebar reads as one list. Collapsed to an icon rail, icons hold their position while the width animates, labels become tooltips and counts become dots; the rail is toggled by a button and a shortcut and remembered, since it is a preference about the reader (layout law 9).

**Improving one screen of an existing app keeps its navigation surface.** Moving navigation is a restructure, and the icon rail a feature: neither is done unasked; list them under `## Open issues`.

### The product page

Top to bottom, every page in the shell has the same parts, so a reader learns one page and can read them all:

| Part | Shape |
|---|---|
| Header bar | About 44px; breadcrumb at the start, the page's own actions at the end as quiet ghost buttons, related ones together (search beside upload); the page title at the nav's size, not a display heading. Tabs take their own row under it |
| Stat strip | The figures under the header (patterns law 12 picks which), parted by hairlines, at the type guide's figure size; each filters the table below to what it counts, and shows when it's the active filter |
| Toolbar | Search, then filters as icons with tooltips — a text label on every filter crowds the bar — then the view switch; on touch the filters open as a labelled sheet |
| Content | The table, board or list, at the panel's full width |

**The table.** One shared component on every page, in the style the product chose from layout law 3 (`table.style`): rows around 44px at one height, hairlines between rows only (no column rules), a plain-fill hover, `text.primary` header labels. A table that doesn't use it is a second table style.

**The group bar.** One shared component: a tinted band about 36px tall holding a chevron, the group's name, its count and an add action, sticky under the header row while its group scrolls. How long lists open, summarise and search is patterns law 8.

**Forms.** A form or settings page caps at `measure.form`, left-aligned in the panel: at the panel's full width a switch ends up a screen's width from its label. The field that decides the rest goes first, at the form's full width — a category before the free text that depends on it.

**Overviews and dashboards.** What a dashboard holds and in what order is patterns law 12; on the page, each of its sections is parted from the next by a full-bleed hairline (layout law 3).

### Expressive — bands with a measure inside

Sections may run to the viewport edge as bands — a colour field, a full-bleed image, a product shot — but the text inside sits at `measure.reading`, or narrower for a short statement. A two-line headline may span the band; the paragraph under it may not. Card grids and multi-column text inside a band cap at `measure.wide`, about 1200–1280px; only the band itself and its media run edge to edge, or a three-up grid on a 2560px screen becomes three strips.

```css
.band { padding-block: var(--space-section); }
.band > .text { max-width: var(--measure-reading); margin-inline: auto; padding-inline: var(--gutter); }
```

## Spacing ladders per preset

One base unit (4px), a role for every job. `space.tight`, `space.group`, `space.section` and the pair ratio are the layout dials; the heading pair's defaults land inside that ratio. Values are defaults; the ratios must survive.

| Role | editorial | product | expressive |
|---|---|---|---|
| `space.heading-above` | 40–48px | 16–24px | 48–80px |
| `space.heading-below` | 12px | 8px | 16px |

Half-steps (6px, 10px, 14px, 44px) are legitimate when a ratio lands between whole steps; a value used once with no role behind it isn't.

## Asymmetry at every scale

| Relationship | Inner | Outer | Ratio |
|---|---|---|---|
| Prose heading → its paragraph | 12px | 44px above | ≈ 3.7:1 |
| List items → the next block | 8px | 24px | 3:1 |
| Card title → its body, cards in a stack | 6px | 20px between cards | ≈ 3.3:1 |
| Inside a dense card: meta line → title, title → details | 6px | 12px | 2:1 |
| Board cards → the next lane | 8px between cards | 12px between lanes | 1.5:1, held by the lane's own edge |
| Field label → its input, fields in a form | 4–6px | 16px | ≈ 3:1 |
| Role title → its dates | 2px | 6px | 3:1 |

Ratios cluster between 2:1 and 4:1. A form with `gap: 16px` on everything puts each label as far from its input as from the one above, and on a long form readers attach labels to the wrong field. A border round every field only adds noise over the spacing bug; tighten label-to-input to 4–6px and the form groups itself. The same goes for a screen called cluttered: check its gaps against this table — padding inside a card (12px on a dense board), tiers within it, gaps between peers — before reaching for colour, weight or another rule.

## Section rhythm

Layout law 3's table picks each boundary's divider; this is how each is built. **Peers get symmetric space**: sections on a dashboard or an admin page are siblings, so each gets the same space above and below its divider. **A change of subject gets asymmetry**, with more space above the rule than below, because the content below belongs to the heading that follows.

Peer sections of a working page — a full-bleed hairline, none after the last:

```css
.section { margin-inline: calc(var(--gutter) * -1); padding: var(--space-section) var(--gutter); }
.section:not(:last-child) { border-bottom: var(--hairline-chrome) solid var(--border-divider); }
```

The negative margin lets the line reach the panel's edges while the content keeps its gutter; a line that stops at the gutter reads as a rule under one section rather than a boundary between two.

A change of subject in a reading column — a measure-wide rule, the first section without one:

```css
.major-section {
  margin-top: var(--space-section);          /* e.g. 64px */
  padding-top: calc(var(--space-section) * 0.625);   /* e.g. 40px */
  border-top: var(--hairline-object) solid var(--border-divider);
}
.major-section:first-child { border-top: 0; padding-top: 0; }
```

A settings group — a panel with its own save:

```css
.settings-group { border: var(--hairline-object) solid var(--border-default); border-radius: var(--radius-card); padding: var(--space-group); }
.settings-group + .settings-group { margin-top: var(--space-group); }
.settings-group > .row + .row { border-top: var(--hairline-chrome) solid var(--border-divider); }
```

In prose, a short closing block that reads as a coda follows on without a rule; ruling it off promotes it to a peer. A band — a logo strip, a stat band — keeps the edges that mark it as a band. **Decide the kind of each boundary in the layout code beside the sections**, so it applies to whichever subset is present, and never expose it as a setting: someone will switch every rule on, or every rule off.

## Page padding and chrome clearance

- **Top space signals a document.** Editorial pages, and expressive ones without a hero, start well below the top edge; product content starts close under the page's header bar, which already framed it (values: the layout dials).
- **Fixed chrome reserves its own clearance.** Under a fixed bottom bar or dock, the page's bottom padding must exceed the bar's height plus its offset on every template whose content can end near the viewport bottom; a page ending in a footer can rely on the footer's padding.
- **Audit it per template.** The long article ends in a padded footer; the short index without one puts its last item under the bar — the layout bug that most often survives review, because the test page is always a long one.

## Viewport units

| Unit | Means | Use |
|---|---|---|
| `dvh` | The visible height, tracking mobile browser chrome | The default for anything sized to the viewport |
| `svh` | The height with chrome fully shown | A hero that must never be cut off |
| `lvh` | The height with chrome fully hidden | Rarely — a background that must always cover |
| `vh` | Equal to `lvh` on most mobile browsers | Avoid; a `100vh` element's bottom sits under the address bar |

A sticky rail is capped at `calc(100dvh - top offset - bottom margin)` with `overflow-y: auto`.

## Worked example: *Manifest*

A fictional freight-tracking app — `product`, docs area `editorial`, Inter at 14px in the app and 16px in the docs:

```css
:root {
  --measure-reading: 34rem;       /* 544px ≈ 65 characters of Inter at 16px — docs and all help text */
  --measure-app: 100%;            /* content fills its panel, left-aligned */
  --shell-nav: 240px;
  --shell-inspector: 360px;
  --gutter: 16px;                 /* the smallest width; 24px from tablet up */
  --measure-form: 45rem;          /* 720px — forms and settings in the panel */

  --space-tight: 6px;
  --space-group: 16px;
  --space-section: 32px;
  --space-heading-above: 24px;    /* 3:1 */
  --space-heading-below: 8px;

  --radius-container: 16px;       /* panel, 4px padding … */
  --radius-card: 12px;            /* … holds 12px rows */
  --radius-control: 8px;          /* button, 2px inset … */
  --radius-small: 6px;            /* … holds a 6px badge */
  --radius-pill: 9999px;

  --hairline-chrome: 0.5px;       /* a border: one device pixel on 2×, 1px on 1×; divider uses border.divider */
  --hairline-object: 0.5px;       /* table frames match their row rules */
  --rule-emphasis: 2px;

  --z-below: -10; --z-raised: 10; --z-popover: 20; --z-dismiss: 40;
  --z-nav: 50; --z-overlay: 60; --z-toast: 70; --z-skip-link: 100;
}
```

The same values land as `--spacing-*`, `--radius-*` and `--container-*` variables in a Tailwind v4 `@theme` block, under `theme.extend.spacing`, `borderRadius`, `maxWidth` and `zIndex` in a Tailwind config, or as `space`, `radii`, `sizes` and `zIndices` keys in a JS theme object — whichever the project already uses, under its own names.
