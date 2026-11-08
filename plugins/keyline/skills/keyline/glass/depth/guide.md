# Glass and Depth

> **Glass preset.** This is the glass material running on [modimihir.com](https://modimihir.com), with its real values, meant to be copied whole. Read it beside `domains/depth/guide.md`, which holds the laws; this guide holds glass's values, recipes and decisions for them, and says where glass differs. Under any other preset, `domains/depth/guide.md` leads and this guide is only a worked example.

Glass is the preset built around translucency, so it spends depth law 6's ceiling: the material in four places, all floating chrome — the nav dock, the settings drop-up, the mobile sheet and one decorative pocket. Everything else is opaque. The material is the five parts in `domains/depth/translucent-materials.md` plus continuous corners (`glass/layout/guide.md`, §4).

## 1. Three tiers

Depth law 7, at glass's values:

| Tier | Blur | Saturate | Tint | Backdrop | Used for |
|---|---|---|---|---|---|
| `folder-glass` | **8px** | 1.4 | gradient, 55%→34% | Content you *want* recognised | A frosted pocket, cards peeking behind |
| `glass-nav` | **20px** | 1.8 | 72% | Arbitrary page content | Fixed chrome that content scrolls under |
| `glass-panel` | **24px** | 1.8 | **97%** | Anything, including other glass | A floating menu that must stay legible |

The pocket's cards should stay recognisable: 8px softens rather than obscures, and 1.4 saturation keeps the pocket quieter than its contents. Paragraphs, photographs and image walls scroll under fixed chrome; 20px leaves less to compete with its icons. The panel, least in control of its backdrop, gets the most defensive 24px.

> **A finding from the reference implementation:** a fourth material, `glass-menu` (16px / 1.8 / 72%), for "a menu over a surface you already know", is dead CSS: every menu needed `glass-panel`'s defensive tint, because its wrapper animates or it opens over other glass. Copy three tiers (depth law 1).

## 2. Saturation: 1.8 suppressing, 1.4 softening

Depth law 8:

```css
backdrop-filter: blur(20px) saturate(1.8);
```

**1.8 where you're suppressing the backdrop, 1.4 where you're only softening it.**

## 3. The 97% panel

`glass-panel` pairs a 24px blur with **97% opacity** because its menus' wrappers *scale open*, and a transform on an ancestor weakens `backdrop-filter` beneath it (depth law 9): for the whole animation the tint does the work. Where you can, the animating wrapper and the glass surface are different elements:

```tsx
<DropMenu open={open}>            {/* animates scale + y */}
  <ul className="glass-panel …">  {/* carries the blur, never transformed */}
```

## 4. Glass over glass

Depth law 11, on the site: the settings box (`glass-panel`) opens right above the dock (`glass-nav`). At 72% the drop-up would look like the dock growing taller; at 97% it's a separate panel.

## 5. Edge and shadow

### The hairline

```tsx
className="glass-nav rounded-2xl border-[0.5px] border-gray-alpha-400 p-1"
```

Depth law 3's translucent edge is the alpha ramp (`glass/color/guide.md`): `gray-alpha-400` sits *on* whatever's there, white page or photograph, where a solid `gray-400` reads as a pasted-on frame.

### The shadow stack

Four layers, one light source above (depth law 4), in **one class**, not inline:

```css
.dock-shadow {
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.6),   /* top-edge catch light */
    0 1px 1px rgba(0, 0, 0, 0.02),            /* contact */
    0 8px 16px -4px rgba(0, 0, 0, 0.04),      /* near ambient */
    0 24px 32px -8px rgba(0, 0, 0, 0.06);     /* far ambient */
}
:root[data-theme="dark"] .dock-shadow {
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 1px 1px rgba(0, 0, 0, 0.3),
    0 8px 16px -4px rgba(0, 0, 0, 0.5),
    0 24px 32px -8px rgba(0, 0, 0, 0.6);
}
```

Opacities are 2–6% in light. Dark is a different shadow, not a re-tint (depth law 5): shadows ~10× stronger (4% black on `#0b0b0b` is invisible), highlight ~6× weaker (0.6 white on dark is a glowing edge, not a catch light).

**Extracted the moment it appeared twice.** This ~400-character string was once inline in five places here, each with a dark twin. Not being a colour, it *can't* be a design token (colour law 10), so a class is its only home.

→ Every elevation tier, the pocket's edge, and stacking inside a glass surface: `glass/depth/depth-cues.md`

## 6. A gradient edge, without a wrapper or a mask

Depth law 13, on the one chromatic panel, whose edge runs deep navy to pale blue:

```css
.sv-panel {
  border: 1px solid transparent;
  background-image:
    linear-gradient(var(--sv-fill-top), var(--sv-fill-bottom)),      /* the fill */
    linear-gradient(180deg,                                          /* the stroke */
      var(--sv-edge-top) 0px,
      var(--sv-edge-mid) 120px,
      var(--sv-edge-bottom) 240px);
  background-origin: border-box;
  background-clip: padding-box, border-box;
}
```

**The stops are in pixels** because the panel opens from a 46px bar to 250px. With percentages it ran the whole navy-to-pale sweep inside 46px, *louder* than the panel it became, and shimmered as the ramp re-fitted each frame; at `0px / 120px / 240px` the top holds still and the colour grows downward.

### The glow

Depth law 14:

```css
box-shadow:
  0 1px 2px rgba(22, 39, 107, 0.05),          /* contact */
  -10px 0 20px -18px rgba(47, 90, 196, 0.38), /* left */
  10px 0 20px -18px rgba(47, 90, 196, 0.38),  /* right */
  0 10px 24px -16px rgba(47, 90, 196, 0.3);   /* below */
```

It lifts on hover **and stays lifted while open** (`.sv-panel:hover, .sv-panel[data-open="true"]`), so the colour reports the chevron's state. Transition at 220ms, off under `prefers-reduced-motion`.

### The sheen

A label shimmers once as the panel opens:

```css
.sv-sheen {
  background-image: linear-gradient(100deg,
    var(--sv-accent) 40%, var(--sv-sheen-hi) 50%, var(--sv-accent) 60%);
  background-size: 250% 100%;
  background-clip: text;
  color: transparent;
  animation: svSheen 700ms var(--ease-geist) both;
}
```

The class drops on `animationend`; under reduced motion, plain accent colour.

## 7. Text over glass

**Contrast on a translucent surface can't be computed**: the effective background is whatever is behind it. Glass's answers to depth law 10, in order:

1. **Raise the tint until it's effectively opaque behind text.** Hence `glass-panel` at 97%, where contrast against the tint *is* computable.
2. **Only high-contrast text on glass:** icons at `quiet`→`gray-1000` (not `gray-600`, 2.38:1 on white) and 13–14px rows at `gray-900`/`gray-1000`. Nothing muted, nothing small.
3. **No reading copy on glass.** No paragraph on the site sits on a translucent surface.

→ The tint values and a worked composite: `glass/depth/blur-and-tint.md`

## 8. Fallbacks

Depth law 15, at glass's tokens.

### `prefers-reduced-transparency`

```css
/* AFTER both theme blocks — it re-declares the same properties. */
@media (prefers-reduced-transparency: reduce) {
  :root, :root[data-theme="dark"] {
    --glass-nav-bg: var(--color-gray-100);
    --glass-panel-bg: var(--color-gray-100);
    --folder-glass-bg: var(--color-background-100);
  }
  .glass-nav, .glass-panel, .folder-glass {
    backdrop-filter: none;
  }
}
```

### `prefers-contrast: more`

```css
@media (prefers-contrast: more) {
  .glass-nav, .glass-panel, .folder-glass { border-color: var(--color-gray-1000); }
}
```

### `@supports` — the gap in the reference implementation

The reference implementation has **no `@supports` guard**, so without `backdrop-filter` it gets a bare 72% tint: legible, but weak. `glass/depth/assets/glass.css` ships with the guard:

```css
.glass-nav { background: var(--color-gray-100); }   /* opaque baseline */

@supports (backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)) {
  .glass-nav {
    background: var(--glass-nav-bg);
    backdrop-filter: blur(20px) saturate(1.8);
  }
}
```

**Don't hand-write `-webkit-backdrop-filter`.** Tailwind v4's Lightning CSS adds it and keeps only the last of a hand-written pair, so the site ships the prefix alone and Firefox loses every blur (`glass/depth/performance-and-fallbacks.md`).

## 9. Performance

Depth law 16, within glass's budget: three or four surfaces at most, each small — a dock a few hundred pixels wide, not a full-viewport overlay — and closed menus unmount.

→ What keeps it affordable here, and the prefix bug in detail: `glass/depth/performance-and-fallbacks.md`

## 10. Confirmations

A destructive confirmation takes `glass-panel` with the same hairline and shadow as every other floating panel (depth law 1; patterns law 4). The action carries the red (`glass/color/guide.md`). → The focus-return code: `glass/depth/depth-cues.md`

## Assets

- `glass/depth/assets/glass.css` — the three materials, all fallbacks, the missing `@supports` guard, `.dock-shadow`, the gradient-stroke panel. Pairs with `glass/color/assets/color-tokens.css` (tints, `--sv-*` stops).
- `glass/depth/assets/GlassPanel.tsx` — wrapper/surface split, hairline and stacking, as a component.

## Checklist

The domain checklist applies in full; these are glass's values for it.

- [ ] Three tiers only: `folder-glass` 8px / 1.4, `glass-nav` 20px / 1.8 / 72%, `glass-panel` 24px / 1.8 / 97%.
- [ ] Glass in the four places only: dock, settings drop-up, mobile sheet, pocket.
- [ ] Anything that animates or opens over glass is `glass-panel`, its wrapper apart from the surface.
- [ ] Edges `border-[0.5px] border-gray-alpha-400`; the pocket alone takes `border-white/60`.
- [ ] `.dock-shadow` as one class with its dark twin beside it.
- [ ] Gradient strokes stopped at `0px / 120px / 240px`; the glow holds while open; the sheen runs once.
- [ ] Icons at `quiet`→`gray-1000` and rows at `gray-900`/`gray-1000` on glass; no reading copy.
- [ ] Reduced transparency swaps the tints to `gray-100` / `background-100` and drops the filter, after both theme blocks.
- [ ] `prefers-contrast: more` turns the edge `gray-1000`.
- [ ] `@supports` guard with the `gray-100` baseline; source has only `backdrop-filter`, compiled CSS both.
- [ ] Destructive confirmations take `glass-panel`; focus returns to the opener.
