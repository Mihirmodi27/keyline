# Springs

How glass's springs were arrived at. The two vocabularies, tuning by symptom and where springs are wrong are in `domains/motion/ladder-and-curves.md` and law 6.

## SLIDE — a shared element re-targeting

```ts
const SLIDE = {
  type: "spring", bounce: 0.2, duration: 0.4,
  opacity: { duration: 0.16, ease: "easeOut" },
} as const;
```

`bounce: 0.2` sits near the floor of "perceptibly springy", as a highlight should (`spring.snappy` in the domain reference).

`duration: 0.4` is longer than it sounds: the spring covers most of the distance in the first ~150ms and spends the tail settling, landing about as fast as a 200ms tween while staying re-targetable. The 160ms `easeOut` opacity outpaces the position spring, so the element is fully visible while it settles, which makes the settle readable.

## LIFT — cards rising out of a folder

```ts
const LIFT = { type: "spring", bounce: 0.28, duration: 0.5 } as const;
```

The one playful moment: hovering a folder on the home page lifts four preview cards out of a frosted pocket, a delight beat with 40% more bounce and 25% more duration than anything else. Being the *only* one is why it works.

## GROW / CROSS — the disagreeing pair

```ts
const GROW  = { type: "spring", stiffness: 620, damping: 19, mass: 0.85 } as const;
const CROSS = { type: "spring", stiffness: 380, damping: 30 } as const;
```

|  | GROW | CROSS | Effect |
|---|---|---|---|
| stiffness | 620 | 380 | GROW pulls harder → moves sooner |
| damping | 19 | 30 | GROW resists less → overshoots |
| mass | 0.85 | 1 (default) | GROW is lighter → accelerates faster |

All three push the same way — GROW fast and loose, CROSS slow and controlled — so on `scaleY` and `scaleX` of one panel it's briefly **taller and narrower** than at rest, then settles. `y` rides `GROW` alongside `scaleY` (§4 of `glass/motion/guide.md`).

## CLOSE — a tween, not a spring

```ts
const CLOSE = { duration: 0.13, ease: "easeIn" } as const;
```

130ms, under the state tier, on `easeIn` (law 7).

## Reduced-motion substitutes

Every spring has a flat replacement at the state-tier duration: 150ms, default easing, no overshoot. See `reduced-motion.md` for the complete set.
