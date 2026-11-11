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

Deep links scroll with `scrollIntoView({ behavior: reduce ? "auto" : "smooth" })` and set the hash with `history.replaceState` (`domains/motion/performance.md`, scroll spies).

## The dock's collapse

The dock's icon row collapses on `grid-template-columns` `1fr` ↔ `0fr`, 300ms on the house curve, with `min-w-0 overflow-hidden` on the child (the technique: `domains/motion/performance.md`, what to animate). The menu's wrapper/surface split is §3 of `glass/depth/guide.md`.

## Timers

The hover-intent timer is `closeTimer`, cleared on unmount and reset on `pathname` (law 14, `domains/motion/patterns.md`).
