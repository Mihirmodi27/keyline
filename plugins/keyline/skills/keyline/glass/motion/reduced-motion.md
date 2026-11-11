# Reduced motion

Glass's substitutes and the code that takes them. The principle, the full substitution table, imperative APIs and testing are law 10 and `domains/motion/guards.md`; reduced transparency and high contrast are §8 of `glass/depth/guide.md`.

## The glass substitutes

The rows where glass sets a value or has a component the domain table doesn't name; every other row is as `domains/motion/guards.md`.

| Original | Reduced-motion path | Reasoning |
|---|---|---|
| Spring slide (highlight, tooltip) | 150ms tween | The state change is the message; physics is decoration. |
| Squash-and-stretch open | Plain 150ms fade | Presence still communicated, no scaling. |
| Card lift on hover | No hover variant at all | Motion is the whole interaction; static is correct. |
| Press scale | **Keep it** | 8% on a 40px button, 0ms: below any threshold of concern. |
| First-open theatre (staggered lines) | Same open, zero-length transitions | The disclosure opens; the choreography doesn't run. |
| A GPU dissolve between images | Fall back to the plain `<img>` | The no-WebGL path, already built. |
| Icon fill crossfade | Instant swap (`motion-reduce:transition-none`) | The state is the message; the 200ms fade isn't. |

## In JavaScript

`useReducedMotion()` from Motion; branch the *transition*, keep the animation: `reduce ? { duration: 0.15 } : SLIDE`.

Where motion is the whole point of a variant-driven interaction, drop the trigger, on focus as well as hover:

```tsx
<m.div
  variants={container}
  initial="rest"
  animate="rest"
  whileHover={reduce ? undefined : "hover"}
  whileFocus={reduce ? undefined : "hover"}
>
```

For presence, branch the offsets themselves:

```tsx
initial={reduce ? { opacity: 0 } : { opacity: 0, scaleY: 0.82, scaleX: 0.94, y: away }}
animate={reduce ? { opacity: 1 } : { opacity: 1, scaleY: 1, scaleX: 1, y: 0 }}
exit={reduce
  ? { opacity: 0, transition: CLOSE }
  : { opacity: 0, scaleY: 0.9, scaleX: 0.97, y: away, transition: CLOSE }}
```

The exit keeps `CLOSE` in both branches: 130ms `easeIn` is already flat, so it needs no substitute.

## The blur crossfade

```tsx
const blur = reduce ? "blur(0px)" : "blur(4px)";

<m.span
  initial={{ opacity: 0, filter: blur }}
  animate={{ opacity: 1, filter: "blur(0px)", transition: { duration: 0.28, ease: "easeOut" } }}
  exit={{ opacity: 0, filter: blur, transition: { duration: 0.18, ease: "easeIn" } }}
>
```

One variable turns a blur-crossfade into a plain crossfade; `blur(0px)` → `blur(0px)` is a no-op the browser optimises away, so there's no second code path. Note the asymmetry: 280ms in, 180ms out.

## In CSS

The `.reveal` reset, the route fade's `animation: none` and the theme crossfade's `no-preference` opt-in are all in `glass/motion/assets/motion-tokens.css`.

### Tailwind's `motion-reduce:` variant

```tsx
className="transition-transform duration-200 ease-geist motion-reduce:transition-none"
```

Apply it to every `transition-*` that moves something. Colour-only ones don't strictly need it (a 150ms colour fade isn't a vestibular trigger), but consistency costs nothing.

## Set pieces

The greeting never plays under reduced motion, decided in its inline gate (§14 of the guide). **The `?intro` replay override, for development, does not defeat the preference**: it's a preference, not a cache. The "seen" flag is still written.
