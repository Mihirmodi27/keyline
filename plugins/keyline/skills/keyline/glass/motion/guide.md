# Glass motion

> **Glass preset.** The motion system running on [modimihir.com](https://modimihir.com), with its real values, meant to be copied whole. Read it beside `domains/motion/guide.md`: the laws live there, and this guide holds only what glass sets — its durations, curve, springs and tokens, its recipes and code, and the decisions behind them. Under any other preset it is only a worked example.

State is CSS transitions; springs and presence use [Motion](https://motion.dev). "Law" below means a motion law in the domain guide.

## 1. The duration ladder

Tiers by area, not importance (law 2):

| Tier | Duration | What moves | Easing |
|---|---|---|---|
| Instant | 0ms | Press feedback, focus rings | none |
| Micro | 100ms | Link opacity on hover | `ease-out` |
| State | **150ms** | Colour, background, small transforms, icon swaps | the house curve |
| Popover | **200ms** | A disclosure chevron, a hover card, a menu glyph | the house curve |
| Overlay | **300ms** | Reveal-on-scroll, a collapsing region | the house curve |
| Route | 260ms | An incoming page fading in | the house curve |
| Theme | 400ms | Every colour on the page at once | plain `ease` |

Three numbers carry almost everything: **150 / 200 / 300**. **Route is 260ms**, not 300: 260 is the shortest crossfade on the critical path that doesn't read as a flicker. **Theme is 400ms with plain `ease`**, the largest change on the longest duration, and colour gets no overshoot. Nothing on the ladder exceeds 400ms.

**Hover takes its tier by area:** a link's opacity 100ms, a wash across a whole card 200ms.

### Two things that sit off the ladder

Glass uses two of law 4's classes:

**The subject of the moment.** Stepping between gallery photographs dissolves over **620ms**: the photograph *is* the content, and a noise-thresholded dissolve needs time to read as a dissolve rather than a cut. The same photo's flight between two layouts stays at 420ms, in the overlay tier, because that *is* a state change with the photo on screen at both ends. **Same component, two durations, decided by whether the motion is the subject or the report.**

**A once-a-session set piece.** The opening screen runs 560ms in, holds 1400ms, about 2.5 seconds in all, defensible only because it plays once per tab (§14).

## 2. One easing curve

```css
--ease-geist: cubic-bezier(0.175, 0.885, 0.32, 1.1);
```

One curve for the whole site. The `1.1` end control point overshoots slightly and settles back, physical but not bouncy. The exceptions:

- **100ms opacity hovers and icon fills** (§13): `ease-out`. Opacity entrances (`.reveal`, the route fade) keep the house curve on purpose: on opacity the overshoot clamps at 1.
- **The theme crossfade**: plain `ease`.
- **Anything spring-driven**: no bezier at all.
- **Any track that also drives a filter**, or any property floored at zero (law 5): expo-out, `cubic-bezier(0.16, 1, 0.3, 1)`, which never exceeds 1. It is the same intent in a curve legal for the property, not a second character.

→ The tiers in code, the theme crossfade, and the overshoot: `glass/motion/easing-and-duration.md`

## 3. Springs, tuned by character

Three springs, each with a job (law 6), plus the close:

```ts
// Highlight or tooltip re-targeting: moving, not arriving — almost no bounce.
const SLIDE = { type: "spring", bounce: 0.2, duration: 0.4,
                opacity: { duration: 0.16, ease: "easeOut" } } as const;

// Cards rising out of a folder. Playful on purpose — the only place that is.
const LIFT = { type: "spring", bounce: 0.28, duration: 0.5 } as const;

// Opening a menu: two springs that DISAGREE (§4).
const GROW  = { type: "spring", stiffness: 620, damping: 19, mass: 0.85 } as const;
const CROSS = { type: "spring", stiffness: 380, damping: 30 } as const;

// Closing: flat and quick.
const CLOSE = { duration: 0.13, ease: "easeIn" } as const;
```

Opacity is split out of every spring, as `SLIDE` does (law 6).

→ How these numbers were arrived at: `glass/motion/springs.md`

## 4. Squash and stretch, out of physics

The best motion detail in the system, in four lines of config. A menu scales open from its anchored edge: `GROW` is light and underdamped, and sails past its final size; `CROSS` is heavily damped and arrives late. Through the overshoot the panel is briefly **taller and narrower** than it ends up.

```tsx
transition={{
  scaleY: GROW,   // the grow axis overshoots
  y:      GROW,   // travel rides the same spring, so they stay locked
  scaleX: CROSS,  // the cross axis lags
  opacity: { duration: 0.14, ease: "easeOut" },
}}
```

→ The principle: `domains/motion/ladder-and-curves.md`, squash and stretch. The component: `glass/motion/assets/DropMenu.tsx`

## 5. Asymmetric open and close

| Direction | Character | Duration |
|---|---|---|
| Open | spring, overshoots | ~400ms effective |
| Close | tween, `easeIn`, flat | 130ms |

Why exits get out of the way is law 7. The exit offsets are smaller too: open starts from `scaleY: 0.82, scaleX: 0.94`, exit only goes to `scaleY: 0.9, scaleX: 0.97`.

## 6. Shared elements

In the dock and in lists, **one** highlight and **one** tooltip animate their `x / y / width / height` to whichever item is hovered (law 8):

```tsx
// One element. It re-targets. It does not remount.
<m.div
  aria-hidden
  className="pointer-events-none absolute left-0 top-0 -z-10 rounded-[12px] bg-highlight"
  initial={false}
  animate={hovered
    ? { x: hovered.x, y: hovered.y, width: hovered.w, height: hovered.h, opacity: 1 }
    : { opacity: 0 }}
  transition={SLIDE}
/>
```

The details that keep it from flickering are in `domains/motion/patterns.md`, the shared highlight; in Tailwind they are `isolate` on the container and `-z-10` on the highlight.

→ The tooltip and vertical-list variants, and the active state: `glass/motion/shared-element.md`

### When the DOM element isn't enough

A *photograph* travelling between layouts escalates to the GPU (law 13), opening on the tile nearest the viewport centre (law 8): `glass/motion/shared-element.md`, escalating to the GPU

## 7. Reduced motion

Every animated component takes its own branch (law 10):

```tsx
const reduce = useReducedMotion();
const tween = reduce ? { duration: 0.15 } : SLIDE;
```

The glass substitutes: a spring slide becomes a 150ms tween; the squash-and-stretch open becomes a plain fade.

```tsx
// No elastic scaling, but you still see it appear.
initial={reduce ? { opacity: 0 } : { opacity: 0, scaleY: 0.82, scaleX: 0.94, y: 4 }}
```

Imperative APIs get the preference passed in: `scrollIntoView({ behavior: reduce ? "auto" : "smooth" })`. Reduced transparency and high contrast are §8 of `glass/depth/guide.md`.

→ Every glass substitute: `glass/motion/reduced-motion.md`

## 8. Scroll

One passive listener and one rAF per behaviour (law 12; the shape is in `domains/motion/performance.md`).

**The dock's dead zone** is 6px of intent either way, and it is always open within 24px of the top or at the bottom. **It collapses only where `(hover: hover) and (pointer: fine)` matches**, so a hover can reopen it.

→ Scroll spy, `scroll-mt` alignment, the grid collapse: `glass/motion/scroll-performance.md`

## 9. Reveal on scroll

300ms on the house curve, 8px of travel, `threshold: 0`, `rootMargin: "0px 0px -40px 0px"`, marked by `data-in`; the guards are law 11, whose two bugs are this site's. → `glass/motion/assets/motion-tokens.css`, `glass/motion/assets/useReveal.ts`

## 10. Performance: `m` not `motion`

`m.div` inside `<LazyMotion features={domAnimation} strict>`, never a bare `motion.*` (`domains/motion/performance.md`). The menu's wrapper scales and its `glass-panel` child carries the blur (law 13; `glass/depth/guide.md` §3).

## 11. Hover intent

A 100ms grace period on close (law 14):

```ts
const closeBoxSoon = () => {
  clearTimeout(closeTimer.current);
  closeTimer.current = window.setTimeout(() => setConfigOpen(false), 100);
};
```

The hover bridge here is `pt-2.5` of wrapper padding between a button and the pill below it.

**Hover is a wash, never a translate-up** (law 1). The folder's rising cards (`LIFT`) are the one exception, and being the only one is the point (`glass/motion/springs.md`).

## 12. Press and sound

```
active:scale-[0.92]   /* 8% — felt, not seen */
```

On `pointerdown` (law 3).

Sound is *on* by default here, defensible only on a personal site: a synthesised "tok" on hover and click, muteable; `[data-quiet-hover]` silences hover on dense surfaces. → `glass/motion/sound.md`; the rules: `domains/motion/patterns.md`, sound

## 13. Fill means chosen

Law 9, in glass's mechanism: the filled variant is the outline with its interior painted, layered *over* the stroke at the same coordinates, so the layers cross-fade in place.

```tsx
export const fillFade = (on: boolean) =>
  `transition-opacity duration-200 ease-out motion-reduce:transition-none ${on ? "opacity-100" : "opacity-0"}`;

// The inverse, for interior lines the fill swallows (a briefcase's divider).
export const detailFade = (on: boolean) =>
  `transition-opacity duration-200 ease-out motion-reduce:transition-none ${on ? "opacity-0" : "opacity-100"}`;
```

**200ms `ease-out`, not the house curve** (§2). The knockout mask for interior lines is in `domains/motion/patterns.md`, fill means chosen.

**How the marks that can't fill signal instead:**

| Mark | Why fill is wrong | What it does instead |
|---|---|---|
| Brand marks — socials, a tech stack | Official solid silhouettes; an outline is an off-brand redrawing | Colour: quiet at rest, full on hover |
| Open strokes — chevrons, arrows, checks, menu bars | No interior to paint | A stroke-weight ladder by role |
| A mark on static content, or a lone toggle | Never hovered, never current — or the only mark on screen | Stays in the default state |

## 14. Set pieces play once

Two set pieces, each once a session (law 15): the opening screen, and a summary panel's first reveal.

```ts
// Once a session, per item. The theatre is a welcome; a re-run is a delay.
const seenKey = (slug: string) => `short-version:${slug}`;
```

The inline gate's glass condition:

```js
// Home page, first landing, not a deep link (/#work), never under reduced motion.
document.documentElement.dataset.intro = "on";
```

The summary panel's lines branch the transition, never the style, on the client-only flag:

```tsx
variants={{
  shut: { opacity: 0, y: 6, filter: "blur(4px)" },   // constant, both renders
  open: { opacity: 1, y: 0, filter: "blur(0px)",
          transition: { duration: reduce ? 0 : theatre ? 0.34 : 0.16, ease: EASE } },
}}
```

"Seen" is recorded in `onAnimationComplete`, which also makes a second open in one visit as quiet as a second visit. The gate, the hydration rule and the "seen" bookkeeping are in `domains/motion/guards.md`.

Collapsibles animate height and stay mounted (law 11), so the content stays in the served HTML for a crawler or an `llms.txt`.

## Assets

- `glass/motion/assets/motion-tokens.css` — easing curve, duration ladder, `.reveal`, route fade, theme crossfade.
- `glass/motion/assets/motion-presets.ts` — every spring and tween above, plus reduced-motion substitutes.
- `glass/motion/assets/DropMenu.tsx` — the squash-and-stretch menu.
- `glass/motion/assets/useScrollTick.ts` — rAF-throttled scroll with hysteresis.
- `glass/motion/assets/useReveal.ts` — the IntersectionObserver hook and its guards.

## Checklist

The domain checklist first; then glass's values:

- [ ] Every duration on the ladder: no 250ms, 500ms or 1s.
- [ ] Off-ladder timing is the subject of the moment (the 620ms dissolve) or a once-a-session set piece, and says which.
- [ ] `--ease-geist` everywhere, opacity entrances included, plus `ease-out` for 100ms opacity hovers and icon fills, plain `ease` for the theme fade, and expo-out on any track driving a filter.
- [ ] Menus open on the `GROW`/`CROSS` pair and close on `CLOSE`.
- [ ] Hover timed by area: a link 100ms, a card-sized wash 200ms.
- [ ] No translate on hover, bar the folder's rising cards.
- [ ] Icon fills cross-fade at 200ms `ease-out`.
- [ ] `LazyMotion` + `m` + `strict`; no bare `motion.*`.
- [ ] Dense hover surfaces carry `data-quiet-hover`.
