# The shared-element highlight

The signature interaction of this system: one highlight rectangle and one tooltip per container, animating position and size to whichever child is hovered or focused. Why it beats per-item backgrounds, and when it's the wrong tool, is law 8; the details that keep it from flickering are in `domains/motion/patterns.md`, the shared highlight.

## The implementation

```tsx
type Hover = { x: number; y: number; w: number; h: number; cx: number; label: string };

const [hovered, setHovered] = useState<Hover | null>(null);

const enter = (el: HTMLElement, label: string) =>
  setHovered({
    x: el.offsetLeft,
    y: el.offsetTop,
    w: el.offsetWidth,
    h: el.offsetHeight,
    cx: el.offsetLeft + el.offsetWidth / 2,  // centre, for the tooltip
    label,
  });
```

```tsx
<ul className="relative isolate flex items-center …" onMouseLeave={() => setHovered(null)}>

  {/* The highlight — behind the icons, inside its own stacking context */}
  <m.div
    aria-hidden
    className="pointer-events-none absolute left-0 top-0 -z-10 rounded-[12px] bg-highlight"
    initial={false}
    animate={hovered
      ? { x: hovered.x, y: hovered.y, width: hovered.w, height: hovered.h, opacity: 1 }
      : { opacity: 0 }}
    transition={tween}
  />

  {items.map((item) => (
    <a
      key={item.label}
      onMouseEnter={(e) => enter(e.currentTarget, item.label)}
      onFocus={(e) => enter(e.currentTarget, item.label)}
      …
    />
  ))}
</ul>
```

Pair `onFocus` with `onBlur` where the list can lose focus without the pointer leaving.

## The tooltip variant

Same state, same spring, one axis:

```tsx
<m.div
  aria-hidden
  className="pointer-events-none absolute bottom-full left-0 mb-2"
  initial={false}
  animate={hovered ? { x: hovered.cx, opacity: 1 } : { opacity: 0 }}
  transition={tween}
>
  <div className="-translate-x-1/2 whitespace-nowrap rounded-md bg-gray-1000 px-2 py-1
                  text-[11px] leading-none text-background-100
                  shadow-[0_4px_10px_-4px_rgba(0,0,0,0.3)]">
    {hovered?.label}
  </div>
</m.div>
```

`bottom-full mb-2` places it above the container at any height; flip to `top-full mt-2` when the container is itself a dropdown, so the tooltip doesn't cover what opened it. It's `aria-hidden` because every item already carries an `aria-label` with the same text.

## The vertical list variant

For rows rather than icons only the container class changes: items carry the padding, so the bar is the same box everywhere, and a negative horizontal margin lets it bleed past the text column:

```tsx
<HighlightList
  className="reveal -mx-3 flex flex-col text-[14px] leading-[1.55]"
  itemClassName="group relative flex gap-10 px-3 py-2.5"
  items={…}
/>
```

`-mx-3` against `px-3` on each item: the bar extends 12px past the measure on both sides while the text sits exactly on it.

Here the bar uses `bg-gray-100` rather than `bg-highlight`: in a list on the page surface the subtle-surface token is right; in floating glass chrome, the elevated one.

## Interaction with active state

The active item shows a static background and drops it while the dock is hovered (`domains/motion/patterns.md`, current versus hovered):

```tsx
isActive
  ? `text-gray-1000 ${dockHover ? "" : "bg-highlight shadow-[0_2px_2px_rgba(0,0,0,0.04)]"}`
  : "text-gray-600 hover:text-gray-1000"
```

The glyph fills both when current and when hovered (§13 of `glass/motion/guide.md`), and the chip tells the two apart when both are on screen.

## Escalating to the GPU

What broke the DOM approach: a gallery with a masonry wall of ~100 tiles and a "roll" with one photo open above a filmstrip, the same photograph travelling between them. Three things break at once:

1. **Aspect ratios differ.** Consecutive photographs are 1:1 then 16:9; one `<img>` animated between the boxes distorts for the whole trip.
2. **The wall is expensive to re-lay-out.** Layout on 100 tiles is not a per-frame budget.
3. **The endpoints exist at different moments.** One rect is measurable only while the outgoing layout is rendered, the other only after the incoming one commits.

One viewport-sized canvas above the gallery draws a single photo into an arbitrary screen rect, so the trip is four numbers in a uniform and costs no reflow at any size:

```ts
export type Rect = { x: number; y: number; width: number; height: number };

/** Straight-line interpolation. Equal-aspect endpoints keep their aspect throughout. */
export function lerpRect(a: Rect, b: Rect, t: number): Rect { /* … */ }
```

The rules are law 13 and `domains/motion/performance.md`, escalating to the GPU. Here the wall stays DOM and the open photo is `alt=""`, its labels in the strip beside it.

**Failing returns `null`:**

```ts
export function createPhotoStage(canvas: HTMLCanvasElement): PhotoStage | null {
  try {
    /* … */
    // A failed shader link only warns in some libraries; the throw lands on the
    // first draw. Check the artefact that proves setup completed.
    if (!program.uniformLocations) return null;
    /* … */
  } catch {
    return null; // No WebGL, or a context that can't be set up.
  }
}
```

**Carry the reading position across** (law 8). Before the switch, find the tile nearest the viewport centre and open the other layout on *that* item, from *that* rect:

```ts
// Read while the OUTGOING layout is still rendered — from the layout store's
// synchronous subscriber, before React commits the incoming one.
export function centreFrame(): { id: string; rect: Rect } | null {
  const midX = window.innerWidth / 2, midY = window.innerHeight / 2;
  let best = null;
  for (const el of document.querySelectorAll<HTMLImageElement>("img[data-frame]")) {
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.bottom <= 0 || r.top >= window.innerHeight) continue;
    const d = Math.hypot(r.left + r.width / 2 - midX, r.top + r.height / 2 - midY);
    if (!best || d < best.d) best = { id: el.dataset.frame!, rect: r, d };
  }
  return best;
}
```

**Each end keeps its own shape**: two rects around a shared centre, each keeping its aspect through the linear lerp. The GPU path then matches the `<img>` fallback exactly: two absolutely-centred images, each at its own aspect, crossfading.

### Implementation notes that cost real time to find

**Mipmaps.** A 2000px photo in a 355px tile samples one texel in five, so without a mip chain it shimmers as the rect moves sub-pixel. Use trilinear (`LINEAR_MIPMAP_LINEAR`) so crossing mip levels as the photo grows doesn't step.

**Fade the last pixel of the edge** with one `smoothstep` across a pixel's width, fading *alpha only* on a non-premultiplied context, or the edge darkens toward black instead of disappearing.

**Don't call `WEBGL_lose_context` on teardown.** React reuses the node across a remount (StrictMode does on every mount), and the next context silently fails to compile its shaders. Drop the textures and references; the context goes with the element.
