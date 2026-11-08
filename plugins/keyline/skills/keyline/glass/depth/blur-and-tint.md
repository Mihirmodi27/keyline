# Blur, saturation, and tint

Glass's values for depth laws 7–10; why blur greys, what the tint does and how to composite text are in `domains/depth/translucent-materials.md`.

## Saturation

| Saturate | When |
|---|---|
| 1.4 | Only *softening* a backdrop you want recognised |
| 1.8 | *Suppressing* a backdrop (the default) |
| >2.0 | Almost never — colours look radioactive |
| 1.0 | Never; this is just omitting it |

The reference implementation uses 1.4 on the folder pocket, deliberately: the cards behind it are the subject, and pushing their saturation would make the pocket louder than its contents. The three chrome surfaces use 1.8. Roughly, the more you blur, the more saturation you need: 8px / 1.4 and 20px / 1.8 both come out "colour preserved".

## The tint values

```css
:root {
  --glass-nav-bg:    rgba(242, 242, 242, 0.72);
  --glass-panel-bg:  rgba(243, 243, 243, 0.97);
  --folder-glass-bg: linear-gradient(to bottom, rgba(255,255,255,0.55), rgba(255,255,255,0.34));
}

:root[data-theme="dark"] {
  --glass-nav-bg:    rgba(26, 26, 26, 0.72);
  --glass-panel-bg:  rgba(22, 22, 22, 0.97);
  --folder-glass-bg: linear-gradient(to bottom, rgba(48,48,48,0.5), rgba(30,30,30,0.34));
}
```

The three tint rules in `domains/depth/translucent-materials.md`, at these values:

- **The nav tint is `#f2f2f2`, not white**, matching `gray-100`, the "raised surface" token.
- **The dark tints are lighter than the dark page**: `#1a1a1a` and `#161616` against `#0b0b0b`.
- **The pocket is a gradient**, brighter at the top, and **its dark gradient is grey-based**, not white-based. Its inset highlight is also brighter than the chrome's (`rgba(255,255,255,0.8)` vs `0.6`): a bigger, more decorative surface gets more pronounced light modelling.

They live in `:root`, not `@theme`, because the reduced-transparency fallback replaces them and one is a gradient (colour law 10; `glass/color/guide.md`).

## The 97% panel, in full

The stated reason in the reference implementation:

> Its own animating transform weakens `backdrop-filter`, so the tint carries the opacity rather than the blur.

Two more reasons. **The settings box opens directly above the nav dock**, glass over glass: at 72% each it would look like the dock had grown taller, so the heavy tint buys tier separation as well as legibility (depth law 11). And at 97% the backdrop contributes ~3%, so you can *compute* text contrast against the tint, which you cannot at 72%.

## Text over glass, worked

A 72% `#f2f2f2` tint composites to about `#f5f5f5` over a white page and around `#b8b8b8` over a dark photograph. Text at `gray-800` (`#7d7d7d`) clears AA on the first and fails on the second, and the same pixel does both as the page scrolls — hence §7 of the guide. The reduced-transparency fallback helps as a side effect, swapping in a solid token so contrast is real for the users most likely to need it.
