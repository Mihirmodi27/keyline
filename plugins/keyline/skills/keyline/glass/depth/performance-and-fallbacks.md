# Performance and fallbacks

Glass's budget and fallbacks, for depth laws 15 and 16. The cost model, what to avoid, how to measure, containment and the fallback order in general are in `domains/depth/fallbacks-and-performance.md`.

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

## The fallbacks

The code is in `glass/depth/assets/glass.css` (baselines, `@supports`, the filter half of reduced transparency, `prefers-contrast`) and `glass/color/assets/color-tokens.css` (the tint half). Two decisions it encodes: the substitutions are per material, not blanket-white — chrome goes to `gray-100` so the dock still reads as raised, the decorative pocket to opaque `background-100` — and the `@supports` guard is one the live site lacks, a small risk given support (Firefox unflagged since 103) but cheap to close.

## The `-webkit-` prefix on the site

Safari still requires it, and Safari is where glass looks best, but the build adds it (`domains/depth/fallbacks-and-performance.md`, the prefix and the pipeline). The reference implementation hand-wrote the pair and shipped the bug: `.glass-nav`, `.glass-menu`, `.glass-panel` and `.folder-glass` all compile prefixed-only, so Firefox loses every blur. Hand-write the prefixed `none` in the reduced-transparency block and Firefox keeps blurring for the users who asked it to stop.
