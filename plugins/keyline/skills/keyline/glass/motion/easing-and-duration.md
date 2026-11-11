# Easing and duration

The glass ladder in code, and the reasons behind its values. Why duration tracks area, and why a hover over ~150ms lags across a list, are in `domains/motion/ladder-and-curves.md`; the tiers themselves are in §1 of `glass/motion/guide.md`.

## The 100ms tier

```tsx
className="transition-opacity duration-100 ease-out hover:opacity-60"
```

Text links fade to 60% opacity in 100ms with `ease-out`, not the house curve: opacity clamps at 1, so the overshoot is a wasted tail (law 5). 100ms is at the edge of perceptible, which is the point: a hover response should feel like it *already happened*.

## The 150ms tier does most of the work

Colour, background, small transforms, icon swaps, the marker that grows in a table of contents:

```tsx
"transition-colors duration-150 ease-geist"
"transition-[width,background-color] duration-150 ease-geist"
"transition-[color,background-color,box-shadow,transform] duration-150 ease-geist"
```

Every property enumerated, never `transition-all` (law 13).

## Where 200ms is right

The gap between 150 and 200 maps to *whether other things move too*:

- A chevron rotating 180° in a disclosure: the rotation is small, but the panel opening below it isn't.
- A hover card scaling in: a new object with content, appearing over existing content.
- The menu glyph's two bars rotating into a cross: two elements moving in opposition read as one compound gesture.
- A hover wash across a whole card or panel: the 100ms that suits a link reads as a cut over that much area, and a pointer settles on a card rather than sweeping a column of them.

## Why route transitions are 260ms

```css
.route-fade { animation: routeFade 260ms var(--ease-geist) both; }
@keyframes routeFade { from { opacity: 0 } to { opacity: 1 } }
```

260ms is the shortest crossfade that still reads as intentional; below ~200ms a full-viewport opacity change looks like a rendering artefact (law 3 caps it). Opacity only, because a directional transition implies a spatial relationship between routes, and the site map (home, experience, writing, playground) is flat.

Keying the wrapper on the pathname replays the CSS animation on every navigation:

```tsx
<div key={pathname} className="route-fade">
```

`both` on the fill mode holds the `from` state before the animation starts, preventing a one-frame flash of fully opaque content.

## Why the theme crossfade breaks both rules

```css
@media (prefers-reduced-motion: no-preference) {
  :root.theme-transition,
  :root.theme-transition *,
  :root.theme-transition *::before,
  :root.theme-transition *::after {
    transition: background-color 400ms ease, color 400ms ease, border-color 400ms ease,
      fill 400ms ease, stroke 400ms ease, box-shadow 400ms ease !important;
  }
}
```

**400ms, longest on the ladder**: every surface, text colour, border, icon fill and shadow at once. At 150ms it reads as a jarring flash; at 400ms, as the lights coming up. **Plain `ease`, not the house curve**, because colour has no mass (law 5).

The class is applied only on an explicit toggle, then removed:

```ts
export function setThemeChoice(choice: ThemeChoice): void {
  try { localStorage.setItem(KEY, choice); } catch { /* won't persist */ }
  const root = document.documentElement;
  root.classList.add("theme-transition");
  applyTheme(choice);
  window.setTimeout(() => root.classList.remove("theme-transition"), 440);
}
```

It exists for ~440ms, the duration plus a 40ms margin, and its `!important` beats every component's own `transition-colors duration-150` for that window. Why it's scoped this way is in `domains/motion/patterns.md`, theme cross-fade.

## The overshoot in the house curve

```
cubic-bezier(0.175, 0.885, 0.32, 1.1)
```

The `1.1` in the final control point takes the value past its target near the end and back: a small (~10%), brief overshoot. That number makes 150ms colour transitions feel like something *happened* rather than was *set*. Character beyond it belongs to springs (law 5).

## The filter curve

The class of properties the house curve can't have, and why, is law 5. Glass's monotone curve:

```ts
// Lines staggering in behind a blur: filter: blur(4px) → blur(0px).
// --ease-geist would pass through a NEGATIVE radius to settle back.
const EASE = [0.16, 1, 0.3, 1] as const;   // expo-out: decelerates hard, never exceeds 1
```

## Durations that legitimately sit off the ladder

The pair that shows the discipline, from one gallery component (§1 of `glass/motion/guide.md`):

```ts
const DISSOLVE = 0.62;  // stepping between photographs — the subject
const FLIGHT   = 0.42;  // the same photo moving between layouts — a state change
```

The dissolve is the content being watched, so it gets 620ms to read as a dissolve rather than a cut; the flight only has to be *followable*, with the photograph on screen at both ends, so it stays inside the overlay tier. The greeting's gating is §14 of the guide.
