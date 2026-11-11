# Surfaces and Depth

Every surface claims a place: a table row, that it is part of the page; a sticky header, that content passes under it; a menu, that it arrived over the page and will leave; a dialog, that nothing else can be touched until it is answered. A surface whose depth contradicts its behaviour is lying — a dialog that looks like a menu, a card that seems to float but scrolls with the page.

## Before you start

Reads `DESIGN.md` `## Surfaces`.

Boundaries: the radius ladder and nesting rule, hairline weights and the z-index ladder are the layout guide's; surface, edge and tint colours, and why translucent tints are runtime values, the colour guide's; the timing of anything that lifts, glows or opens, the motion guide's; a confirmation's flow and a sign-in page's layout, the patterns guide's. This guide picks which a surface takes and checks they agree.

## Laws

### 1. Elevation is a named ladder of bundles, applied whole

**Every surface sits on exactly one level — `elevation.flat`, `.raised`, `.floating` or `.overlay` — and takes that level's surface, edge, shadow and z-layer together: four spellings of one fact.** The level follows what the thing *does* — sits in the flow, is lifted or stuck, is summoned and dismissed, or blocks until answered — not how important it feels.

Mixing parts is the bug the ladder prevents: a card given the menu's shadow on hover but not its layer is painted over by the next sibling, clipping the lift. A state change moves the whole bundle — a dragged card becomes floating in all four parts — while a hover that deepens a raised card's shadow is raised's own hover state.

A level is also one component. Every dialog is the system's dialog, a destructive confirmation included: a one-off with its own red icon circle, red heading and padding reads as out of the system however right its level. The danger goes on the one action that does it (the colour guide); surface, edge, shadow and scrim stay the overlay's.

The ladder has only the rungs this project uses; the dial lists the most a preset may have. A dead rung is worse than an absent one: the next person assumes it is load-bearing.

### 2. A card is one object, and never holds another card

**A card — a surface with its own edge — is reserved for one object the reader acts on or takes in whole, and a card never holds another card.** A box says "this is a thing". Put one round every section, stat and list and every region claims to be a thing, so none is; each nesting adds an edge, a padding and a radius, and a screen built of boxes in boxes reads as a template however good its type. **Which regions get a surface at all is decided once, in layout law 3's table**; this law builds what that table gives a surface, and keeps everything else off one.

- **One object** — a decision awaiting approval, a document, a side rail — is a card. A rail with two topics is one card in two parts, parted by a divider; several items of one kind (three pending approvals) share one card the same way, not a card each.
- **A section panel** (from layout law 3) is `elevation.flat`: an edge and no shadow, because it doesn't float. Nothing inside it is boxed again: its rows part by `border.divider`.
- **A note** — an aside or caveat — takes a hairline rule on its leading edge, not a tinted box.

The quiet devices that replace a box are layout law 3's. The test: take the edge away. If the object still reads as one thing from space and its heading, the edge was decoration. Then check the measure: columns of text left under layout law 1's floor want fewer columns.

### 3. Depth needs an edge as well as a shadow

**Any surface above `elevation.flat` has an edge that says where it ends, not only a shadow that says it is above.** A shadow is a soft gradient and cannot draw a boundary; without an edge the outline is mush, worst in dark themes, where shadows have almost no headroom. The edge is `border.default` on an opaque surface; on a translucent one or any backdrop it doesn't control, the translucent `border.layered` (colour law 4). Where the preset draws the edge as a half-pixel ring at the head of the shadow stack (Dials), it is still the edge: `prefers-contrast: more` swaps in a real 1px border, whose whole job there is a boundary you can find.

`forced-colors` drops every `box-shadow` but keeps the edge, so a surface designed with no visible edge still carries `1px solid transparent`, painted in the system text colour. `elevation.flat` has no shadow: an edge or a surface step, never a faint shadow posing as a border.

### 4. A shadow models one light, in layers, and lives in one definition

**A shadow is a contact layer plus one or two ambient layers from a single light above, with negative spread, felt rather than seen.** The faint 1px contact layer makes a surface look *resting on* something; two ambient layers fall off like a penumbra where one large blur reads as fog; negative spread keeps each tucked under the element — without it, stock presets look like glows. An optional inset top highlight does more for floating than any drop layer. Higher levels get more and longer layers; a transient tooltip drops the contact layer — it hovers.

Strength follows **what is immediately behind the surface**, not the theme: a tooltip on `surface.inverse` needs the same strong shadow in both themes, since its own surface is what the shadow separates. On a tinted ground the shadow takes the ground's hue, darkened; neutral black on a warm cream page reads as dirt.

Nobody spots a `0.04` that became `0.05` in one of five copies, so **a layered shadow has one definition per level, extracted the moment it appears twice**, which every use points at.

### 5. Dark themes lift surfaces by lightening them

**In a dark theme each level above the page is lighter than the one beneath it; the shadow is a secondary cue.** Raised means more contrast against the page. Light-theme raised surfaces may sit a step either side of it — white cards on a grey page, grey panels on a white one — so long as every level steps the same way, and whether there are cards at all is layout law 3's call; dark-theme ones are always lighter, because a black shadow on a near-black page has nowhere to go, and strengthening shadows alone leaves every level looking like the page. The dark shadow is its own per-theme recipe — drop layers far stronger, at the dial's dark peak, the highlight at a fraction of its strength — and the page is never `#000` (colour law 8). Hence the Glass preset's dark chrome tint, lighter than its dark page, and shadow opacities of 2–6% in light, 30–60% in dark.

### 6. Translucency has to be earned, and usually isn't

**A translucent surface claims that content continues underneath and that seeing it helps. Where either half is false, the surface is opaque.** It holds for chrome that content scrolls under, for a floating layer whose context helps the reader, and for art — a frosted pocket on an illustration, whose backdrop is drawn, still and meant to be seen. Art earns it more often than chrome: nobody reads through it. A product keeps its art, generative or illustrated, translucent or not, to one inset panel — the half of a sign-in page beside an unboxed form — and never frosts over art that is still moving. It fails for:

- **A section, panel or sidebar in the flow** — it's the page, not floating.
- **A card in a grid or a row in a list** — nothing meaningful is behind it, and a filter per row is the worst cost profile.
- **Anything holding reading copy** (law 10).
- **A flat, single-colour backdrop** — nothing to reveal; use the tint.
- **Content behind that must stay readable** — that wants an opaque, shadowed surface beside it, not a blur over it.
- **Video, canvas or anything animating** — the filter re-runs every backdrop frame.
- **A preset that disallows it** (Dials) — in fluent product tools borders and opaque surfaces do the work, and translucency is decoration that costs contrast.

Even a preset built around the material uses it in four places, all floating chrome: the ceiling, not the target.

### 7. Blur scales with uncertainty about the backdrop

**Blur radius is set by how little you know about what's behind the surface, not by its size or importance.**

| Tier | Blur | Saturate | Tint opacity | Backdrop |
|---|---|---|---|---|
| Soften | 6–10px | 1.2–1.4 | 35–60% | Content you want recognised |
| Chrome | 16–24px | 1.6–1.8 | 70–80% | Arbitrary content passing under |
| Defensive | 20–28px | 1.6–1.8 | 92–97% | Anything, including other translucent surfaces |

Role-tier ranges, not dial values; the preset picks which tiers exist (Dials). Cost scales with area, not radius, so don't trim blur to save frames.

### 8. Blur needs saturation

**Every `backdrop-filter` blur carries a `saturate()` correction.** Blur averages colours toward grey, and blur plus a pale tint alone is the cloudy, dirty wash "glassmorphism" describes; the correction is free in the same pass. Go lower where the backdrop is itself the subject; above about 2.0, colours turn radioactive.

### 9. The tint carries legibility when the blur can't

**A translucent surface is legible from its tint alone; the blur is a bonus.** A transformed or filtered ancestor — a menu's scaling wrapper, for the whole animation — weakens or breaks `backdrop-filter` beneath it, and a 72% tint without its blur is unreadable over a busy page. Animate one element and filter another; failing that, thicken the tint to the defensive tier (→ `domains/depth/translucent-materials.md`, the wrapper and the surface).

### 10. Translucent text is checked against the worst backdrop

**Text contrast on a translucent surface is measured against the tint composited over the lightest *and* darkest backdrop it can land on — never against the tint as if opaque.** A 72% near-white tint is near-white over a white page and mid-grey over a dark photograph: `text.tertiary` clears 5.1:1 on one and manages 2.6:1 on the other, as scrolling carries it between them. The opaque-tint number is a fiction.

Make it true, in order: raise the tint until it is effectively opaque behind text (at 95% the backdrop contributes a few per cent); over arbitrary content at the chrome tier, carry only `text.primary`, and icons at their label's tier — at 72% over a dark image even `text.secondary` falls to about 4.2:1; keep reading copy off translucent surfaces.

→ The compositing arithmetic and a worked check: `domains/depth/translucent-materials.md`

### 11. Translucency over translucency needs a tier gap

**Where one translucent surface overlaps another, the upper one is a visibly different tier — much heavier tint, or opaque.** Stacked blurs don't compose, and two surfaces at one tint read as one object: a panel over a dock at the dock's tint looks like the dock grew. At most one meaningful blur in any vertical stack.

### 12. A scrim says "modal", and only modal

**`elevation.overlay` brings a `scrim`; nothing below it does.** It says the rest of the interface is paused: a menu with one falsely claims to be modal; a dialog without one looks like a menu that won't close. A floating layer's outside-click catcher is transparent. The scrim darkens toward the ground's hue, stronger in dark themes, where dimming near-black barely registers and the overlay's surface step (law 5) does most of the separating. A blurred scrim — a full-viewport filter, the costliest surface there is — appears only where the preset allows and never animates its radius.

Modal also hands back what it took: **on close, focus returns to whatever opened it.** A dialog opened from state — a row's menu item, a shortcut, a selection — has no trigger for the primitive to fall back to, so store the opener before opening and restore it, or the next Tab starts from the top of the page.

→ Restoring focus, including when the opener is gone: `domains/depth/elevation-recipes.md`

### 13. Gradients on resizing elements are anchored in pixels

**A gradient stroke or fill on an element that changes size places its stops in absolute units, and a gradient stroke is two background layers on one box.** Percentage stops rescale with the box, so a panel opening from a 46px bar runs its whole sweep inside the closed bar — louder closed than open — and shimmers as it grows. Anchored at `0px / 120px / 240px`, the top holds still and the colour grows downward. The stroke also needs `background-origin: border-box`, or every side gets the wrong end of the ramp — which looks almost right.

→ The stroke's two layers, with no wrapper or mask: `domains/depth/translucent-materials.md`

### 14. Light is emitted from the sides and passes once

**A coloured glow is weighted to the sides so it reads as emission; a sheen crosses once and then stops.** One centred coloured shadow is a drop shadow that happens to be blue. A glow reporting a state — hovered, open — holds as long as the state. A looping sheen claims the thing is still working, so it runs once and is removed: `background-clip: text` with transparent text left in place is a selection and forced-colours hazard. Under reduced motion: no sweep, the plain colour.

### 15. Every material has its fallbacks, and they come last

**Each material ships an opaque baseline, then the material inside `@supports`, then its `prefers-reduced-transparency`, `prefers-contrast: more` and `forced-colors` rules — after every theme block that sets the same properties.** The order is the law: opaque first makes the non-supporting path the default, and so the tested one; why preferences go after every theme block is colour law 10.

Reduced transparency needs both halves, an opaque surface *and* no filter: filter only leaves a thin tint over live content, tint only still pays for the blur. High contrast promotes the edge to a real border and leaves the surface alone; forced colours needs law 3's edge. Read the *compiled* CSS: a prefixing pipeline may treat a hand-written `-webkit-backdrop-filter` for Safari as a duplicate and drop the standard property Firefox needs.

→ The full fallback block, in order: `domains/depth/fallbacks-and-performance.md`

### 16. Translucency has a budget, counted in area

**A `backdrop-filter` costs its area on every frame its backdrop changes — for chrome over a scrolling page, every frame of every scroll.** The budget is a count of surfaces and a ceiling on their size, per preset (Dials). Closed menus unmount, since at `opacity: 0` or `visibility: hidden` a filtered element still pays its pass; blur radius never animates; nothing filtered sits over video. Transitioning `box-shadow` repaints every frame too: across a list, put the lifted shadow on a pseudo-element and fade its opacity.

## Dials

| Dial | editorial | product | expressive |
|---|---|---|---|
| What gets a surface | Layout law 3's table; a card only for one object | Layout law 3's table; a card only for one object | Layout law 3's table; a card for one object or a named brand object |
| Cards nested in cards | Never | Never | Never |
| Translucency | Chrome only (a sticky header, a dock), or none | None on chrome or content — hairlines and opaque surfaces do the work; art only | Brand material, each use named |
| Translucent tiers | ≤ 2 (chrome, defensive) | Soften, on art only | ≤ 3 |
| Translucent surfaces on screen at once | ≤ 3, none wider than the reading measure except fixed chrome | 0, or 1 on art | ≤ 4; full-viewport only as a static overlay scrim |
| Buttons | Flat | Flat | Flat; the primary call to action may carry the page's one raised accent, a small shadow at `elevation.raised` |
| Elevation levels, at most | 3: flat, floating, overlay (raised only for sticky chrome) | 4: flat, raised, floating, overlay | 4, plus at most one named decorative level |
| `elevation.flat` separates by | Space or a surface step; edges rare | Space, and hairlines between rows (`border.divider`) — never an edge round a group of unlike content; a data table, one object, may take one hairline frame and a tinted header row | Surface step or edge, per brand |
| Edge above `elevation.flat` | A `hairline.*` border | A 0.5px `border.default` ring at the head of the shadow stack; a real 1px border under `prefers-contrast: more` | A border, or a named gradient stroke |
| Floating shadow, peak layer opacity (light / dark) | 6% / 50% | 10% / 55% | 16% / 60% |
| Shadow layers on floating | Contact + 2 ambient + inset highlight | Contact + 1 ambient | Contact + 2 ambient + inset highlight |
| Dark surface lift per level (OKLCH L) | +0.05 | +0.04 | +0.06 |
| Scrim (black-toward-ground opacity, light / dark) | 32% / 56% | 40% / 60% | 48% / 64%, brand-tinted allowed |
| Scrim blur | None | None | ≤ 8px, never animated |
| Gradient strokes and glows | At most one, as the colour system's exception | None | Allowed, each named for its job |

**Translucency.** Moving up a preset trades contrast certainty, a fallback path and a filter pass per surface for atmosphere. Fluent, daily product readers gain nothing from atmosphere and lose a lot to a header dimming to mid-grey over a data table. Editorial allows it on chrome because seeing the page being read scroll under keeps the reader oriented. Product's one opening is art: its backdrop is drawn, still and carries no text, so the material costs no contrast, and keeping it there is what lets the rest of the product stay opaque.

**Edge.** A ring inside the shadow sits quieter than a border beside rows parted by hairlines and moves with the shadow as one definition; it is still law 3's edge, so the contrast swap and the transparent border for forced colours go with it.

**Levels, at most.** A ceiling, not a target: a project ships only the levels it has a job for. Editorial pages mostly have nothing to pick up, so `elevation.raised` has no job; inventing one makes cards look liftable when they aren't. Product's dense screens hold draggable, sticky, floating and modal things at once. A fifth level usually means two differ too little to tell apart.

**Buttons.** A button sits in the flow, so it is flat. On an expressive landing page the one primary call to action may lift a step as the page's one raised accent, its own solid fill serving as law 3's edge; a shadow on every button is a shadow on none.

**Shadow strength.** Stronger shadows buy separation on busy screens at the cost of calm; past a point the eye reads a shadow as a shape. In every preset, if you can point at the shadow as a shadow, it's one step too strong for editorial.

Radii and corner shape are the layout guide's (layout law 5 and its dials).

## Building it for a project

**1. Classify every real component**, not a hypothetical list:

```
One object, or a region layout law 3 gives a surface?    no  → on the page, divided as layout law 3 says. Stop.
Scrolls with its neighbours, part of the page flow?      → elevation.flat. Edge or surface step. Stop.
Picked up, dragged, or stuck while content passes under? → elevation.raised
Summoned over content, dismissed on its own?             → elevation.floating  (no scrim)
Blocks everything until answered?                        → elevation.overlay   (with scrim)

Then, for raised and above, the material:
  Preset allows translucency here?                                   no  → material.opaque
  Content keeps moving under it, and seeing it helps?                no  → material.opaque
  Holds reading copy?                                                yes → material.opaque
  Carries text below text.primary over an unknown backdrop?          yes → the defensive tier
  It or an ancestor animates a transform?                            yes → split wrapper/surface, or defensive
  Over another translucent surface?                                  yes → a tier gap, or opaque
  Otherwise → material.translucent at the tier law 7 gives its backdrop.
```

**2. Build each level as a bundle**: surface from the colour guide (`surface.raised`, `surface.inverse`, the dark lift from the Dials), edge from `border.default` or `border.layered` at a `hairline.*` weight, shadow per law 4 at the preset's strength, layer from the layout guide's `z.*` ladder; one shadow per level per theme.

**3. Derive the dark theme separately**: lift each surface by the dial's step, rebuild the shadow at dark opacities with a weaker highlight, and check the edge alone still separates each level from the one below.

**4. Add materials last**, fallbacks in order (law 15), counted against the budget.

**5. Measure** every text tier on every translucent surface against its worst backdrop (law 10) with `contrast.mjs --over` (colour law 3); the focus ring at 3:1 on each level's surface.

→ Bundle tables per preset and theme, shadow derivation and a worked example: `domains/depth/elevation-recipes.md`
→ Blur, saturation, tint, gradient strokes, glows and sheens: `domains/depth/translucent-materials.md`

## Auditing existing code

Start from the setup scan's `Shadows` and `Backdrop filters` tables, then grep for what it can't pair:

```sh
rg -n "box-shadow|shadow-\[|shadow-(sm|md|lg|xl|2xl)" src
rg -n "backdrop-filter|backdrop-blur|-webkit-backdrop" src
rg -n "prefers-reduced-transparency|prefers-contrast|forced-colors|@supports" src
rg -n "z-index|z-\[|\bz-[0-9]" src
rg -n "background-clip:\s*text|animation:.*infinite" src
rg -n "border rounded|rounded-\S+ border|border-\S+ rounded|<Card\b" src   # boxes: count per screen
```

Then collect evidence per law:

- **Boxes**, per screen: every edged or shadowed region, and what it holds. A card round a section, a list, a table or a single figure, a card inside a card, a tile per stat, a tinted strip behind a label — each is a finding. Screenshot the screen and count edges; a working screen rarely needs more than a few cards.

- **Distinct shadows**, clustered: more than levels means improvised ones; list each stray with its file.
- **Bundles** for each component above flat: a shadow with no edge, a floating shadow on a flat element, a modal without a scrim, a menu with one — each is a finding.
- **Dark theme**: does each surface lift, or just its shadow? Is the page `#000`?
- **Each filtered element**: saturation, tint, ancestors' transforms, what it can overlap, text tiers against the worst backdrop.
- **Fallbacks**: present, both halves of reduced transparency, *after* the theme blocks; the prefix in compiled CSS.
- **Budget**: filtered surfaces visible at once, any at `opacity: 0` rather than unmounted, any animated blur.

## Writing back to DESIGN.md

- **`## Surfaces`** — the bundle table (`Level | Surface | Edge | Shadow | Layer`) in the project's names, per theme where surface or shadow differs, plus a material table (`Tier | Blur | Saturate | Tint | Fallback | Used on`) if it uses translucency. Write it on first build or audit; update it as levels change.
- **Proposed roles** — level surfaces the canonical list lacks (`surface.floating`, `surface.overlay`), marked `proposed`.

## Checklist

- [ ] Every dialog, destructive confirmations included, is the system's dialog; closing one returns focus to its opener, stored when it opened from state.
- [ ] A ring edge becomes a real 1px border under `prefers-contrast: more`; an edgeless surface carries `1px solid transparent` for `forced-colors`.
- [ ] Animating wrapper and filtered surface are separate elements, or the tint is defensive.
- [ ] Compiled CSS has both `backdrop-filter` and `-webkit-backdrop-filter`.
- [ ] Closed filtered surfaces unmount; no animated blur; nothing filtered over video.
