# Layout and Hierarchy

Layout says what belongs together, what outranks what and what sits on top, before anyone has read a word. **Space and structure are signal, so every value must mean one thing**: a gap says whether things belong together, a radius how deeply an object is nested, a line's weight whether it divides or bounds, a z-index how permanent a layer is. A value picked for how it looks rather than what it says is how a layout drifts into feeling arbitrary, and why the drift is so hard to name in review.

This guide speaks in roles such as `text.secondary`; the code says whatever `DESIGN.md` maps them to. The laws hold under every preset; how wide, how loose and how round are dials, set per preset and overridden with a reason.

## Before you start

Read `DESIGN.md` at the project root: `## Profile` for the preset and any areas on another one, `## Layout` for the project's name for each role and the decisions already made. Reason in roles; write code in the project's names.

- **No `DESIGN.md`:** run `/keyline init` for this domain only, do the task, then recommend the full setup.
- **A role you need has no row:** reuse a value already doing that job; otherwise add one in the project's naming style and record it in `DESIGN.md`.
- **The task would break a law or move a dial off its preset:** say so and ask; if the user confirms, record it with its reason under `## Decisions`.
- **Preset `glass`:** the values are in `DESIGN.md`; `glass/layout/guide.md` has the exact recipes behind them.

## Laws

### 1. Running text has one reading measure, and it doesn't move between templates

**Every block of running prose sits at `measure.reading`, defined once and shared by every template that shows prose.** Past about 80 characters the return sweep lands on the wrong line; under about 45 the eye spends more effort returning than reading. So the measure is set in characters of `type.body` and resolved to a width, not picked as a round pixel number. Sharing it buys **positional continuity**: clicking from an index summary to its detail page reads as the summary expanding, not as arriving somewhere else, and a template with its own width breaks that on every route in or out.

Non-prose content — an image wall, a data table or a diagram at `measure.wide`, a full-bleed band on an expressive page — may leave the measure, as may chrome and rails. **No paragraph longer than two lines may.** An article's cover — image or diagram — may run at `measure.wide` between the head and the body; images inside the body stay at the measure unless marked wide. **A divider is as wide as what it divides**: in a single-column reading layout, the measure, not the viewport. If a `type.title` wraps to four lines at the narrowest measure — the smallest viewport minus two `gutter`s, 320px say — the fix is usually the ladder (the type guide), not a responsive type step.

### 2. Space groups, and asymmetry is how it groups

**The gap inside a group must be visibly smaller than the gap around it, so a heading sits closer to what it introduces than to what came before.** With equal margins it belongs to neither neighbour. The ratio `space.heading-above : space.heading-below` matters more than the values: **between 2:1 and 5:1.** Below 2:1 the grouping is ambiguous; above 5:1 the group looks marooned. The Glass preset runs 44px above a prose heading and 12px below, about 3.7:1; the same shape holds at every scale.

This is the law of **proximity**: things near each other are read as one group before anything else about them is seen, so a gap that doesn't match the grouping overrides every other cue.

**Symmetric spacing is right only between peers.** Whether the gap between two sections is enough on its own, or needs a line or a panel, is law 3. Spacing values come from roles — `space.tight`, `space.group`, `space.section`, the heading pair — on one base unit, with half-steps where a ratio needs them; a one-off `margin-top: 37px` is either a missing role or a mistake, and review should be able to tell which.

**Clutter is a spacing problem before it is a colour or type one.** A screen that reads as cluttered or "randomly padded" has gaps that don't group: fix the gaps, the padding and the order of tiers first, and only then touch colour or weight. Inside a card the tiers part by space — the meta line, `space.tight`, the title, `space.group`, the details — not by rules.

→ Spacing ladders per preset, section rhythm, page padding and chrome clearance, viewport units: `domains/layout/measure-and-rhythm.md`

### 3. Sections stack, and every boundary between them can be seen

**A page is its sections stacked in reading order — or a content column beside a rail — each opened by its heading, and the reader can see where one ends and the next begins without reading. A grid of cards is for a collection of like objects, never for arranging a page's unlike sections.** A bento mosaic sizes each box to fill the mosaic rather than fit its content, turns reading order into a puzzle, and gives every region its own edge, padding and radius. Unboxing that mosaic is half the fix; the other half is putting back a boundary, or the sections run together into one long scroll of equal weight.

**What divides two sections is chosen by what they hold**, from this table — the one place Keyline decides whether a region is boxed (the depth guide builds whatever surface it gets):

| The sections | The divider |
|---|---|
| Peer regions of a working page — a dashboard's overview, trends and action items; an admin page's bands; a record's detail groups | A full-bleed hairline (`hairline.chrome` in `border.divider`) between each, running to the panel's edges, with `space.section` above and below; none after the last |
| Unlike regions within one section — a chart over the table it summarises, content beside its rail | A hairline between them: horizontal, or vertical and centred in the gap beside a rail |
| Prose sections in a reading column — an article, docs, an essay | Space and the heading pair (law 2); a measure-wide rule only at a change of subject — an appendix, the author block, related reading — never at every heading |
| Groups of settings or form fields that save or reset together | A panel each: a hairline frame at `radius.card`, no shadow, its title and one line of description at the top, its save action inside it |
| A landing page's sections | Space at the section gap; a section of another kind — a logo strip, a testimonial, the closing call to action — becomes a full-bleed tinted band, and the band's edges are the divider |
| Sections on a tinted page ground — a dashboard whose page is `surface.subtle` with its regions as surfaces on it | Each region is a surface (`elevation.flat` or `raised` on `surface.raised`, depth law 1); the ground between them is the divider, so no lines |
| Items in a collection | Hairlines between rows, or a grid of like cards — not a section boundary |

**An existing design's divider stays.** Improving a design whose sections are panels keeps the panels and makes them quieter — one edge, nothing boxed inside, no shadow on what doesn't float — rather than unboxing it into a page that runs together. **One device per kind of boundary across the product** (similarity): lines between some peer sections and space between others reads as unfinished. **The test is a squint**: blur a screenshot until the text goes, and each section should still read as its own block. Where two run together, move one device up — space, then a line, then a band or a panel — and where the page reads as stripes or a stack of boxes, move one down.

**Common region is real, which is why boxes are scarce.** A shared boundary makes things read as one group strongly enough to beat proximity, so boxing every region erases the grouping it was meant to show. Inside a section, the quietest device that holds a group wins: space (law 2), then a tint or a hairline, and a card only for one object the reader acts on (depth law 2). Figures are the commonest case: a set of stats is one row, each figure over its label, parted by vertical hairlines, not a tile per figure; the row wraps and stacks cleanly where tiles become a column of boxes. Where the figures count what the table below holds, they are also its filter. Boxed figures are a decision to record, and the boxes stay quiet: no hover lift, no icon tile, no more padding above than beside.

The quiet devices carry the rest, one job each, and **each has one style across the product** — two table styles or two group-label styles read as two products stitched together. Which style is a dial:

- **A group label** in editorial is `type.label` in sentence case over a hairline rule. In product it is one group bar — a tinted band holding a chevron, the name, a count and the add action, sticky while its group scrolls. The tint is earned by being a control; a tinted strip behind a heading that does none of this is still decoration.
- **A table** in editorial has no frame: a hairline under its header, `border.divider` between rows, and its first column flush with the heading above, so the table's edge is the text's edge. In product it has one shared frame — `radius.card` in a hairline, a tinted header row, hairlines between rows only.
- **Page-level tabs** are text on one shared hairline, with `rule.emphasis` under the current tab and no box round the row. A segmented control is for switching a mode between two or three options, not for navigation.
- **Chips, badges and tags share one shape**, one height, padding and radius per size, and vary only in fill and text. Three chip shapes on one screen are three components nobody chose.

→ The product page — header bar, stat strip, table frame, group bars, toolbars, forms and dashboards: `domains/layout/measure-and-rhythm.md`

### 4. Rails anchor to the same frame as the content

**A sticky sidebar, table of contents or margin note is positioned against the same centred frame as the content column, so the gap between them holds as the window widens.** Against the viewport, a rail drifts from the text it indexes: fine at 1280px, a stranger at 2400px.

```css
.frame { position: relative; max-width: var(--measure-frame); margin-inline: auto; }
.frame > .rail {
  position: absolute; inset-block: 0; inset-inline-start: var(--gutter);
  width: var(--measure-rail);
}
.rail > .rail-inner {
  position: sticky; top: var(--rail-top);
  max-height: calc(100dvh - var(--rail-top) - var(--space-section));
  overflow-y: auto;
}
```

The absolute wrapper spans the section so the sticky child has a track, and keeps the column centred, where a flex row would push it off. **A sticky panel is capped to the dynamic viewport and scrolls inside itself** — `dvh`, because `vh` ignores mobile browser chrome. Where the rail no longer fits, it becomes an in-flow disclosure above the content, never simply hidden. A shell's navigation and inspector are rails too, sized as regions of the shell, not floated against the window. Anything fixed to an edge reserves its own clearance, checked template by template.

### 5. Nested radii: inner = outer − padding

**Where one rounded object sits in another's corner, the inner radius is the outer radius minus the gap between their edges.** This is geometry, not taste: only then do the curves share a centre. Too large and the corner pinches; too small and the gap swells at the corners — visible even to people who couldn't say what's wrong. A 16px container with 4px of padding holds 12px buttons; a 12px button with an avatar inset 2px gives the avatar 10px. Snap to the ladder when the difference is 2px or less.

The law binds concentric corners only: an inner corner tucked inside the outer one's curve, inset by less than the outer radius. Inset further, or set away from the corners — an icon tile in a padded card, a `kbd` in a search field — the two curves have no centre to share, and the inner element takes a radius for its own size from the ladder. So outer − padding reaching zero means the corners are no longer concentric, not that the inner corner goes square.

**Radius scales with size, not importance** — and sub-proportionally, or a large panel reads as a lozenge. `radius.pill` is only for things with no top and bottom — tags, dots, toggles, markers — never anything holding a paragraph.

### 6. A line's weight says what it's doing

**Lines are assigned by job — `hairline.chrome` for a divider inside one object, `hairline.object` for an object's edge, `rule.emphasis` for a deliberate mark such as a quote bar or a focus ring — and an internal divider is never more prominent than its object's edge**, or the object reads as two. Where chrome and object share a weight, the divider steps down in colour (`border.divider` against `border.default`). Three jobs, at most three weights. **A frame and the dividers inside it are one drawing**: same weight, same inset, meeting cleanly, or a table's edge and its row rules disagree in a way readers see as "the thickness is off" without naming it. Hairlines are drawn as borders, which a 1× screen rounds up to a pixel, never as half-pixel boxes, which it drops; focus rings and `prefers-contrast: more` never take a half pixel. On a translucent or unknown backdrop the line is translucent (`border.layered`; its colour is the colour guide's). A non-structural divider is `aria-hidden`, and an `<hr>` needs its UA border reset.

### 7. The z-index ladder is documented, sparse, and ordered by permanence

**Every z-index comes from one named ladder with gaps between the rungs; a literal `z-index: 9999` is a bug waiting for its pair.** The longer something stays on screen, the higher it sits; the skip link beats everything. Gaps of ten let a later layer, like the Glass preset's once-a-session greeting overlay, take a free rung without renumbering. Two pairs are constraints, not choices:

- **A dismiss catcher sits above the page and directly below what it dismisses**: above its menu it eats the menu's clicks; below the page it catches nothing. `z.dismiss` serves the navigation; a content popover renders its own catcher in its portal, catcher first.
- **`z.skip-link` sits above `z.overlay`**, so a keyboard user tabbing during a splash or a modal can always get past it.

| Role | Default | Holds |
|---|---|---|
| `z.skip-link` | 100 | The skip link |
| `z.toast` | 70 | Toasts, over modals |
| `z.overlay` | 60 | Modals, sheets, once-a-session overlays |
| `z.nav` | 50 | Fixed navigation |
| `z.dismiss` | 40 | The navigation's tap-outside catchers |
| `z.popover` | 20 | Hover cards, dropdowns, content menus |
| `z.raised` | 10 | A hovered or focused item |
| `z.below` | −10 | A highlight behind content |

A negative layer needs an `isolation: isolate` parent, and **a `transform`, `filter`, `backdrop-filter`, `perspective`, `contain` or `will-change` on an ancestor traps `position: fixed` descendants inside it** — check every ancestor before reaching for a higher number.

→ Radius ladders and hairline weights per preset, nesting worked through, stacking-context techniques: `domains/layout/radius-lines-and-layers.md`

### 8. Fork the component when the interaction model changes, not when the arrangement does

**Arrangement changes — column count, wrapping, padding, a card moving from below its row to beside it — are breakpoint work. Interaction-model changes — hover-revealed versus tap-to-open, a sticky rail versus an inline disclosure — are two components sharing their data and row rendering**, because one component serving both grows a hover path, a touch path, a collapse rule only one uses, and state that means different things in each. Two mounted presentations holding state need a sync point or a shared store.

**Breakpoints are named for what changes at them and derived from the content** (`bp.rail`, `bp.shell`), not copied from a device list. **Inside a shell they are measured on the container, not the window**: the content panel narrows when the sidebar opens, so a list and detail split on window width crushes the detail. Query the panel; the list gives way first, and the detail sizes its own gutters, rail and labels so its actions never clip. **Item size and column count are separate decisions**: "make them 25% smaller" keeps the count unless the count was asked about. **Capability, not width, decides hover**: every hover style is gated on `(hover: hover) and (pointer: fine)` together, decoration included; `any-hover` is too permissive for a touchscreen laptop. **Never hide an affordance where it can't come back**: a dock that collapses on scroll and expands on hover loses navigation on a phone for good, so check capability where you hide, not where you reveal. Every hover that carries information or an action has a touch path; decoration needs no touch equivalent, but is still gated.

### 9. A view choice is about the thing, so it doesn't persist by default

**When the reader can switch between presentations of one collection, the choice resets on arrival unless you can name why it shouldn't, and the switch carries the reader's position across.** Persist preferences about the *reader* — theme, sound, motion, density — not about a *thing*, or readers land in a mode picked weeks ago for another collection and don't remember choosing it; the Glass galleries open on the wall every time, because the whole collection is what you want on arrival. A product's saved view — a board grouped by assignee, a filtered table — is the legitimate exception: persist it as a named, visible thing and record the decision, never as a toggle that silently turns sticky. So is board or list on a working page the reader returns to daily: persist it per page, the switch always visible in the page header, and let the default win where the default is the point. Which second view a collection gets is patterns law 10. On the switch, open the incoming view on the item nearest the viewport centre; leaving a grid at item 60 and arriving at item 1 is worse than not switching.

### 10. Owner-curated content disappears when empty

**When a collection the site's owner curates is empty, its route, navigation entry, section and any divider around it all go — derived from one flag.** When the data is the user's own, the reader can act, so it gets an empty state instead (patterns law 9).

"No posts yet" on a portfolio publishes an absence to visitors who can do nothing about it: an admission, not information. Navigation, router, section list, sitemap and metadata all read the one flag, because which routes exist is content, not routing; sections are filtered before dividers are placed, and an emptied route redirects somewhere real, not to a 404. At every count the layout looks deliberate: one or two items in a three-up grid stay item-sized, not stretched.

→ Forks and the touch audit, container breakpoints, reader-chosen views and which a collection gets, gating code for route tables and file-based routers, empty-state anatomy: `domains/layout/forks-gating-and-disclosures.md`

### 11. A disclosure hides its content; it doesn't unmount it

**Collapsed content stays in the served markup — a native `<details>`, or animated to zero height with `inert` and `aria-hidden` — and is unmounted only when it is genuinely expensive or genuinely absent**, because content that exists only after a click is lost to crawlers, find-in-page and text export. `inert` makes keeping it safe: without it, collapsed content is still tabbable and announced, so a keyboard user tabs into invisible prose and a screen reader reads a section shown as closed. `aria-hidden` alongside covers engines without `inert`; `display: none` can't be animated, so it's no answer where the close is. Prefer `<details>` wherever the animation allows. A menu's wrapper stays mounted while its panel unmounts, so `aria-controls` always resolves. A collapsed group's bar carries a summary and opens to a search (patterns law 8).

### 12. Structure is accessibility, and it's decided with the layout

**Landmarks, heading levels, the skip link and anchor offsets are layout decisions, made in the same pass as the layout, not retrofitted.**

- A skip link off-screen by transform (never `display: none`, which drops it from the tab order), on `z.skip-link`, targeting an `id="main"` on every template.
- Every `<nav>` labelled — three unlabelled navs make a page unnavigable by landmark.
- **Heading levels follow structure, not size.** Two headings at one size can legitimately be `h3` and `h4`; never pick a level for its default style.
- `scroll-margin-top` on every anchor target, matched to the scroll spy's reading line, or a jump lands above the line and the contents highlights the previous section.
- `aria-current` on the active row, `aria-pressed` on toggles, `aria-expanded` and `aria-controls` on disclosure and menu triggers; decorative spans `aria-hidden`; in-page links as real anchors with the handler layered on top.
- Print is a presentation: chrome hidden; scroll-revealed content forced visible per motion law 11.

### 13. A target is as big as the pointer needs, and placed where the pointer already is

**Every control has a hit area of at least 24 × 24px under a fine pointer and 44 × 44px on touch, and the action used most sits closest to where the reader's attention already is.** Fitts's law: the time to hit a target grows with its distance and shrinks with its size, so a 16px icon button in a corner costs a reach and a correction every time it's used. **The hit area is not the drawing**: an icon stays 16px while padding or a `::before` inset grows the target round it, so size never has to be bought with visual weight. Adjacent targets on touch keep at least 8px between their hit areas, or the larger finger presses both.

Distance is the other half. A menu opens where it was clicked; a dialog's primary button sits where the eye finishes the dialog; a row's actions sit on the row, not in a toolbar across the screen. **The edges of the screen are infinitely deep for a mouse** — a pointer can't overshoot them — which is why the dock and the menu bar live there, and why a destructive action never takes the corner where a hurried flick lands (patterns law 3). Below a phone width, the frequent actions move within thumb reach, at the bottom, not into a top corner.

## Dials

| Dial | editorial | product | expressive |
|---|---|---|---|
| `measure.reading`, in characters of `type.body` | 65–75; default 70 | 60–70; default 65 — prose inside the product only | 55–70; default 62 |
| Page structure | One column every template shares | App shell: one navigation surface — a sidebar holding every destination, no top bar repeating it — then content and an optional inspector; every page under its own header bar (breadcrumb, title, actions), which is not navigation | Sections may go full-bleed; text at the measure |
| `measure.wide` | ≈ 1.5 × `measure.reading` | = `measure.app` | Card grids and multi-column text cap at ≈ 1200–1280px; only full-bleed bands and media run edge to edge |
| `measure.app` | — | Content fills its panel, left-aligned; forms and settings cap at `measure.form`, ≈ 640–760px; nav 220–264px; inspector 320–400px | — |
| `gutter` (smallest width) | 24–32px | 16px, growing to 24–32px from tablet up | 20–24px |
| Column grid: `grid.columns` / `space.column` | None — the measure is the grid | 4 / 8 / 12 on the content panel, measured on the container; 16px, 24px from tablet up | 4 / 8 / 12 on the window for card grids and section layouts; 16px, 24px from tablet up; prose still at the measure |
| `target.min`, fine pointer / touch | 24 / 44px | 24 / 44px | 24 / 48px |
| `space.tight` / `space.group` / `space.section` | 8 / 16–24 / 48–72px | 4–8 / 12–16 / 24–32px | 8–12 / 24–32 / 96–160px |
| Heading pair ratio, above : below | 3:1–4:1 | 2:1–3:1 | 3:1–5:1 |
| Section divider values (law 3's table picks the device) | Rule 1px, measure-wide; `space.section` 48–72px either side | Hairline 0.5px, full-bleed; `space.section` 32px either side; settings panels in a 0.5px frame | Bands full-bleed, tint one step off the page; rules, where used, 1px |
| Tables and group labels | No frame; label over a rule | One shared frame with a tinted header row; one tinted, sticky group bar | No frame; label over a rule |
| Stats | One hairline-parted row | A strip under the page header whose figures filter the table | One row |
| Page top space | 80–112px; ≈ 48–64px at phone widths | 16–24px under the page's header bar | Set by the hero; without one, as editorial |
| Radius: `small` / `control` / `card` / `container` | 4 / 8 / 12 / 16px | 4–6 / 8 / 12 / 16px | Either 0 throughout, or 8 / 12 / 20 / 28px |
| Corner shape | `superellipse(1.5)` as enhancement | `superellipse(1.5)` as enhancement | Any, applied globally; `superellipse(1.5–2)` when round |
| `hairline.chrome` / `hairline.object` / `rule.emphasis` | 0.5 / 1 / 2px | 0.5 / 0.5 / 2px, divider a colour step lighter | 1 / 1–2 / 3–4px |
| Breakpoints | 2–3, on the window; the third where the header's links stop fitting | 3, on containers | 3–4, on the window |
| Rail appears at | `measure.reading` + 2 × (rail + gap) + gutters ≈ 1200–1280px | Always a region; collapses at `bp.shell` | Rarely has rails |

The `glass` preset takes its values from `glass/layout/`.

**The measure.** Editorial's committed reader sits high, since long lines are efficient in sustained reading when leading pays for the return sweep. Product text is scanned in bursts and sits lower; expressive body runs larger, so fewer characters fit. Below 55 or above 80 characters costs reading on any preset.

**Density.** Product halves editorial's spacing, since a working reader compares side by side and scrolling is friction, but keeps the asymmetry: a dense form with equal gaps is where grouping goes first. Expressive sections are scenes with large gaps, and the heading ratio still holds inside them.

**The shell.** In product, navigation is one surface: in an app, a sidebar holding every destination, with the reader's own controls — account, role, theme — in its footer, and no top bar repeating it. A top bar that repeats it splits navigation across two edges and puts a second band of chrome over every screen. Every page still has a header bar — breadcrumb, title, actions — and that is not a navigation bar. **Improving one screen of an existing app keeps its navigation surface**: moving navigation is a restructure, done only when asked and otherwise listed under `## Open issues`. Primary destinations sit at the top; the long tail goes in collapsible folders, open state remembered and the current page's folder forced open; administration lives in the account menu, not among destinations. Rows are dense, about 30px, with the workspace name at the nav's own size, so the sidebar reads as one list. The sidebar collapses to an icon rail — icons hold their position while the width animates, labels become tooltips, counts become dots — toggled by a button and a shortcut and remembered, since it is a preference about the reader (law 9); it is a feature, so when improving an existing screen, don't add it — list it under `## Open issues`. Below `bp.shell` it opens as a sheet, always expanded. **Pages fill the content panel**, left-aligned at one `gutter` (16px at the smallest width, 24–32px from tablet up), each under its own header bar — breadcrumb at the start, the page's actions at the end as quiet buttons — which titles the page rather than repeating navigation. Forms and settings cap at `measure.form`, about 640–760px, so a switch stays within reach of its label. A page sets neither its own width nor its outer padding; the shell does, once.

**Tables and group labels.** Editorial tables share a text column's edge, so a frame only adds a box. A product panel has no column to align to: tables run full width beside toolbars and figures, so a frame says where the data stops, and a reader scrolling hundreds of rows in collapsible groups needs the group's name and its controls in view. What both keep is law 3: one table style and one group-label style, used identically everywhere.

**Radius.** A sharp system (0 throughout) is a legitimate expressive character that satisfies the nesting law trivially; what costs is mixing a round button into a square card. Round systems read modern through a soft corner: an 8px control and 12px card, drawn as a light superellipse (a squircle) where the browser supports `corner-shape`, and a plain round corner of the same radius where it doesn't. When improving an existing design, its radii are the floor: keep them, and change one only to satisfy the nesting law.

**Hairlines.** A `0.5px` border is one device pixel on 2× screens and rounds up to 1px on 1×, so it never vanishes. Product draws every structural line at 0.5px, because a dense screen is mostly rows and a 1px rule on each reads heavy; editorial keeps a 1px object edge for the few objects it has.

**Breakpoints.** A single-column site needs two: where the column becomes padding-limited, and where a rail fits. A header with many links needs a third, where they stop fitting on one line, or between the two it has nowhere to go.

**The column grid.** A page of unlike things side by side — a dashboard's panels, a landing page's feature rows, a card collection beside filters — needs a shared set of edges, or every block picks its own width and nothing lines up. A column grid supplies them: columns, the gaps between them (`space.column`), and the page's outer padding (`gutter`; Material calls this the *margin*, and its *gutter* is our `space.column`). The usual counts are 4 columns on a phone, 8 on a tablet and 12 above, with the gap at 16px growing to 24px. **Material's thresholds — 600, 905 and 1240px — are a starting point, not the law**: move each to where this content actually stops fitting, and name it for what changes (law 8). Past the widest step the content stops growing, capped at `measure.wide`, and the outer padding takes the extra width rather than the columns stretching across a 2560px screen.

The grid is a set of edges to align to, not a set of boxes. A block spans whole columns and nothing starts inside a column gap; the gap is part of the spacing system, on the base unit like every other value. **Editorial has no column grid**: one reading column is its own grid, and a 12-column grid behind a single measure only adds numbers. Column count is arrangement, so it changes at breakpoints; item size is a separate decision (law 8). In a product shell the grid lives inside the content panel and is measured on that container, so opening the sidebar drops a step rather than squeezing twelve columns into a narrowed panel.

```css
.grid { display: grid; grid-template-columns: repeat(var(--grid-columns), minmax(0, 1fr)); gap: var(--space-column); }
@container panel (min-width: 600px) { .grid { --grid-columns: 8; --space-column: 24px; } }
@container panel (min-width: 905px) { .grid { --grid-columns: 12; } }
```

## Building it for a project

1. **Read the preset and the areas.** A `product` app with `app/(docs)/** → editorial` gets a shell for the app and a single column for the docs, sharing one `measure.reading`.
2. **Set the measure from the type**: a character count from the dials for `family.text` at `type.body`, resolved to a width by measuring the font (a 16px sans averages about 8px per character, so 70 characters ≈ 560px) or in `ch`, which runs wider than an average letter. Check it at the narrowest viewport minus two `gutter`s with the project's longest `type.title`.
3. **Derive the frame.** With a rail, `measure.frame` = `measure.reading` + 2 × (`measure.rail` + gap) + 2 × `gutter`, and `bp.rail` is that width; for a shell, set the region widths and where the inspector, then the nav, collapses.
4. **Build spacing from ratios**: the base (4px) and `space.section`, the heading pair at the preset's ratio, then `space.tight` and `space.group` so every group's inner gap is at most half its outer one.
5. **Stack the sections and pick each boundary's divider** from law 3's table, one device per kind of boundary — or the one the existing design already uses: each a heading and its content, figures in hairline-parted rows; list the things that are single objects, which alone get a card (the depth guide). Pick the one table style and the one group-label style for the preset.
6. **Build the radius ladder inward** from `radius.container` through every concentric nesting (container → control → avatar), subtracting padding and snapping; anything inset past the outer radius takes the rung for its size. **Set the corner shape** from the dial in the same step: under editorial and product, `corner-shape: superellipse(1.5)` on everything, with pills and circles kept `round` (the snippet in `radius-lines-and-layers.md`). It costs one rule and is what makes rounded corners read as squircles rather than boxes.
7. **Assign the three line jobs** per the preset, drawn as borders; no divider outranks its object's edge, and a frame matches the dividers inside it.
8. **Write the z ladder** from law 7, dropping unused rungs and keeping the gaps.
9. **List the forks and the gates**: which components ship twice and why; which collections are owner-curated (gated) and which are user data (empty states).
10. **Under product or expressive, set the column grid** if the pages place unlike blocks side by side: column counts per step, `space.column`, and each breakpoint moved to where the content stops fitting. Skip it for a single reading column.
11. **Size every target**: icon buttons, close buttons, row actions and chips that act get the dial's hit area, grown by padding or a pseudo-element rather than a bigger icon.

→ Worked example (*Manifest*, a fictional `product` app with `editorial` docs) and its Tailwind and JS-theme forms: `domains/layout/measure-and-rhythm.md`

## Auditing existing code

Start from the setup scan's frequencies for measures, spacing, radii, z-index and breakpoints, then collect per law:

| Law | Look for | Evidence |
|---|---|---|
| 1 | Distinct `max-width` / `max-w-*` on prose templates; prose in full-width containers; product pages setting their own width or outer padding | Measures by route |
| 2 | Headings with equal margins or a ratio under 2:1; one-off spacing values; rules parting a card's tiers | Ratio per heading style; strays with counts |
| 3 | Sections that run together under a squint, or a page of stripes and boxes; peer sections divided by more than one device; card grids arranging unlike sections; existing panels unboxed; a tile per stat, or stat boxes that lift or hold icon tiles; tinted strips that aren't group controls; more than one table or group-label style, or the preset's other one; boxed tab rows; more than one chip shape | Per screen: each box and what it holds; table, group-label and chip styles with counts |
| 4 | Viewport-positioned sticky elements; `100vh`; sticky panels without `overflow-y`; fixed bottom chrome | File and line; pages ending under the chrome |
| 5 | Rounded elements in a rounded element's corner; square inner corners where the inset passed the outer radius | Outer, padding, inner, mismatch |
| 6 | Border widths by job; dividers stronger than their object's edge; frames heavier than their dividers; half-pixel lines drawn as boxes; `<hr>` without a border reset | Counts per weight; offenders |
| 7 | Every `z-index` / `z-*` literal | Sorted values and what each holds; catchers above menus; overlays above the skip link; transformed ancestors of fixed elements |
| 8 | `onMouseEnter`/`:hover` with no touch path; `any-hover`; hide-on-scroll without a capability check; window media queries on components inside a resizable panel | Each behaviour's touch equivalent, or "none"; panes that clip with the sidebar open |
| 9 | View toggles written to storage | Key, what it controls, any reason |
| 10 | "No … yet" on owner-curated collections; grids that stretch one or two items | Route or component |
| 11 | Disclosure content rendered conditionally; collapsed content without `inert` | Component, and what's missing from the HTML |
| 12 | Skip link and `id="main"`; unlabelled `<nav>`; heading levels chosen for size; anchors without `scroll-margin-top`; no print reset for hidden reveals | Per template |
| 13 | Icon, close and row-action buttons under 24px (44px on touch) with no padding or pseudo-element growing the hit area; touch targets closer than 8px; frequent actions far from what they act on; destructive actions in a corner | Element, drawn size, hit size |
| Dials | Blocks side by side that share no edges; a 12-column grid behind a single reading column; columns stretching past `measure.wide` | Page, and the edges that don't line up |

In a browser, resize from 320px to 2560px watching the rail gap, tab through collapsed disclosures, and run find-in-page on a closed one. Report one line per finding with its evidence — a ratio, a count, a file — under `## Open issues`, and fix nothing unless asked.

## Writing back to DESIGN.md

- **Layout table rows** for every role set or found — measures, gutter, spacing roles, the heading pair and its ratio, the radius ladder and its nestings, the three line jobs, the z ladder, breakpoints named for what changes — plus one line per forked component naming the interaction model each version serves.
- **The gate list**: owner-curated collections (gated) and user data (empty states).
- **Decisions**, dated, with the reason: any dial moved off the preset (a 1px chrome hairline in an editorial project), persisted view preference, layer added to the ladder, or template allowed a different measure.
- **Open issues** for every law the code breaks, with evidence, removed when the fix lands.
- **Proposed roles**, marked `proposed`, for a job with no row — a rail width, a frame width, a toast layer.

## Checklist

- [ ] Prose sits at one `measure.reading`, defined once and shared by every template; no paragraph over two lines escapes it.
- [ ] Only non-text content, chrome and rails leave the measure; dividers are as wide as what they divide.
- [ ] The narrowest measure fits the longest `type.title` without a responsive type step — except an editorial article title's one phone step (type dials).
- [ ] Headings sit closer to what follows than what precedes: `space.heading-above : space.heading-below` between 2:1 and 5:1.
- [ ] Clutter is fixed with gaps, padding and tier order before colour or type; a card's tiers part by space.
- [ ] Symmetric spacing only between peers.
- [ ] Every spacing value is a role on the base unit; strays are listed.
- [ ] Sections stack in reading order, each opened by its heading, and each boundary takes law 3's divider for what it holds — one device per kind across the product, an existing design's panels kept; every section survives the squint test; card grids only for collections of like objects; no bento mosaic.
- [ ] Stats sit in one row parted by hairlines (product: a strip that filters its table; any boxes stay quiet); tabs are text on a shared hairline.
- [ ] One table style and one group-label style, the preset's: unframed with labels over a rule, or one shared frame with one sticky group bar.
- [ ] One chip shape per size across the product.
- [ ] Product: one navigation surface — a sidebar holding every destination, no top bar repeating it; every page under its own header bar, which is not navigation; an existing app's navigation surface kept unless a restructure is asked for, and shell features it lacks listed, not added; pages fill the panel, forms and settings cap at `measure.form`, and no page sets its own width or padding.
- [ ] Rails anchor to the content's frame; sticky panels are capped with `dvh` and scroll within.
- [ ] Below `bp.rail` the rail becomes an in-flow disclosure; fixed chrome has clearance on every template.
- [ ] Corner shape matches the dial: editorial and product carry the `superellipse(1.5)` rule, with pills and circles `round`.
- [ ] Inner radius = outer − padding at every concentric corner (inset under the outer radius); elements away from the corners take the ladder's radius for their size, never square by subtraction; `radius.pill` only on things without a top and bottom.
- [ ] `hairline.chrome`, `hairline.object`, `rule.emphasis` have one job each; no divider outranks its object's edge; a frame matches its dividers; hairlines are borders; `border.layered` on translucent backdrops.
- [ ] Every z-index is on the ladder; `z.dismiss` sits under what it dismisses; `z.skip-link` tops `z.overlay`.
- [ ] No transformed or filtered ancestor traps a fixed descendant; negative layers sit in an isolated parent.
- [ ] Components fork where the interaction model differs, share data and rows, and sync state both hold.
- [ ] Breakpoints are named for what changes, and measured on the container inside a shell; resizing keeps the column count unless asked; every hover style, decoration included, is gated on `(hover: hover) and (pointer: fine)`.
- [ ] No affordance hides where it can't come back; every informative hover has a touch path.
- [ ] View choices reset on arrival unless a recorded decision says otherwise; switching keeps the reader's place.
- [ ] Empty owner-curated collections lose route, nav entry, section and divider (user-data empty states: patterns law 9).
- [ ] Grids look deliberate at 1, 2 and n items.
- [ ] Collapsed disclosures keep their content in the HTML, with `inert` and `aria-hidden`, or use `<details>`; closed groups show a summary and open to a matching search.
- [ ] Skip link by transform with `id="main"`; every `<nav>` labelled; heading levels follow structure; anchors carry `scroll-margin-top`; print hides chrome.
- [ ] Every control's hit area is at least 24px (44px on touch), grown by padding or a pseudo-element, not a bigger icon; touch targets sit 8px apart; frequent actions sit on what they act on.
- [ ] Product and expressive pages that place unlike blocks side by side share a column grid; its breakpoints sit where the content stops fitting; columns stop at `measure.wide`; editorial has none.
- [ ] Dials (`measure.reading`, spacing density, heading ratio, radius ladder, hairline weights, breakpoint count) match the preset, or the difference is under `## Decisions`.
