# Performance and fallbacks

Glass's budget and fallbacks, for depth laws 15 and 16. The cost model, what to avoid, how to measure, containment and the fallback order in general are in `domains/depth/fallbacks-and-performance.md`; glass's fallback code is in §8 of the guide.

## What makes it affordable here

The reference implementation runs three or four glass surfaces and stays smooth on a phone.

**Small surfaces.** The dock is a few hundred pixels wide and 48px tall; the settings box is smaller. Nothing spans the viewport.

**Few of them, and only while needed.** The menus **unmount** when closed rather than sitting at `opacity: 0`:

```tsx
<AnimatePresence>
  {open && <m.div …>{children}</m.div>}
</AnimatePresence>
```

**No animated blur**, and **nothing animating behind the glass**: the backdrop is text and static images.

**The wrapper animates, the surface filters.** The `DropMenu` split in §3 of the guide is a double win: the wrapper animates on the compositor, and the child's filter isn't recomputed against a moving containing block every frame.

## Reduced transparency, per material

The substitutions are per material, not blanket-white: chrome goes to `gray-100`, the raised-surface token, so the dock still reads as raised; the decorative pocket goes to `background-100`, fully opaque, since its whole purpose was translucency. The block names both `:root` and `:root[data-theme="dark"]`, or it wins in one theme only.

## `prefers-contrast: more`

An 8%-alpha hairline is the first thing to disappear under a contrast preference, so the edge goes to `gray-1000`, primary text colour, and the surface stays.

## `@supports`

Without the guard, the reference implementation's surfaces get a bare tint where `backdrop-filter` is missing: legible but weak, marginal at 72% over a photograph. Support is very good (Firefox shipped it unflagged in 103, mid-2022), so it's a small risk, not a live bug. `glass/depth/assets/glass.css` in this guide ships with the guard in place.

## The `-webkit-` prefix on the site

Safari still requires it, and Safari is where glass looks best, but the build adds it (`domains/depth/fallbacks-and-performance.md`, the prefix and the pipeline). The reference implementation hand-wrote the pair and shipped the bug: `.glass-nav`, `.glass-menu`, `.glass-panel` and `.folder-glass` all compile prefixed-only, so Firefox loses every blur. Hand-write the prefixed `none` in the reduced-transparency block and Firefox keeps blurring for the users who asked it to stop.
