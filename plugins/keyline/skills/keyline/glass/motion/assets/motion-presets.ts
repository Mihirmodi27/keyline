/**
 * Motion presets — the springs and tweens glass uses. Why each number is what
 * it is: glass/motion/springs.md. Opacity never springs (motion law 6).
 */

/** Shared highlight or tooltip re-targeting: moving, not arriving. */
export const SLIDE = {
  type: "spring",
  bounce: 0.2,
  duration: 0.4,
  opacity: { duration: 0.16, ease: "easeOut" },
} as const;

/** Cards rising out of a folder — the one playful moment. */
export const LIFT = { type: "spring", bounce: 0.28, duration: 0.5 } as const;

/** Squash and stretch: GROW on scaleY and y, CROSS on scaleX (glass/motion/guide.md §4). */
export const GROW = { type: "spring", stiffness: 620, damping: 19, mass: 0.85 } as const;
export const CROSS = { type: "spring", stiffness: 380, damping: 30 } as const;

/** Closing: a flat tween that gets out of the way. */
export const CLOSE = { duration: 0.13, ease: "easeIn" } as const;

/* Icon fill: the filled layer sits over the outline at the same coordinates
   and cross-fades in place (glass/motion/guide.md §13). ease-out, not the
   house curve. */
export const fillFade = (on: boolean) =>
  `transition-opacity duration-200 ease-out motion-reduce:transition-none ${
    on ? "opacity-100" : "opacity-0"
  }`;

/** The inverse — interior lines the fill swallows (a briefcase's divider). */
export const detailFade = (on: boolean) =>
  `transition-opacity duration-200 ease-out motion-reduce:transition-none ${
    on ? "opacity-0" : "opacity-100"
  }`;
