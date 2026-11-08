# Scroll and performance

Glass's values for the scroll and compositor rules. The scroll shape, hysteresis, the touch gate, scroll spies and what to animate are laws 12 and 13 and `domains/motion/performance.md`; the React hooks are in `glass/motion/assets/useScrollTick.ts`.

## The dock

The dock (`useCollapseOnScroll`) collapses on scroll-down with the domain's dead zone — 6px of intent either way, always expanded within 24px of the top and at `scrollHeight - 2`. It collapses only where `(hover: hover) and (pointer: fine)` matches; touch gets its own presentation (the Glass layout guide, `glass/layout/guide.md`, on adaptive presentations).

## Scroll spy

The spy is `useActiveSection`. Its reading line sits 120px below the viewport top (`READING_LINE = 120`), with the bottom clamp.

### Matching `scroll-mt`

```tsx
const ANCHOR = "scroll-mt-28";   // 112px — matched to READING_LINE = 120
```

Every heading carries `scroll-mt-28`, so a jump lands it 112px below the viewport top, just above the 120px line.

### Deep links without the router

```tsx
el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
window.history.replaceState(null, "", `#${id}`);
```

The URL stays copyable without a second scroll fighting the first.

## The `1fr` ↔ `0fr` grid trick, in Tailwind

Collapsing a region to zero width without animating `width`:

```tsx
<li
  className="grid transition-[grid-template-columns] duration-300 ease-geist motion-reduce:transition-none"
  style={{ gridTemplateColumns: expanded ? "1fr" : "0fr" }}
>
  <div className="flex min-w-0 items-center overflow-hidden">{children}</div>
</li>
```

`min-w-0` on the child is required (flex children default to `min-width: auto` and won't shrink below their content); `overflow-hidden` clips during the collapse.

## `backdrop-filter` and transforms

The animating wrapper and the glass surface are different elements (law 13):

```tsx
<DropMenu open={open}>            {/* animates scale + y */}
  <ul className="glass-panel …">  {/* carries the blur, never transformed */}
```

Where the panel itself must animate, carry more of the effect in the tint than the blur: `glass-panel` sits at 97% opacity because its blur is compromised while it animates.

## Timers

The hover-intent timer is `closeTimer`, cleared on unmount and reset on `pathname` (law 14, `domains/motion/patterns.md`).
