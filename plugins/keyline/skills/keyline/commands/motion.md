# `/keyline motion`

**Guide:** `domains/motion/guide.md` · **`DESIGN.md` section:** `## Motion` · **Procedure:** `commands/refine.md` · **Alias:** `animate`

Makes every animation explain a change: durations scaled to how much of the screen moves, one standard curve, a colour curve that never overshoots, springs named by character, closing faster than opening, shared elements that travel, reduced motion as a real alternative, content never hidden behind an animation that might not run, and scroll work that stays off the main thread.

Typical finds: `transition: all`; a dozen durations where three would do; a menu that closes as slowly as it opens; reveal-on-scroll that leaves content invisible without JavaScript; hover effects that fire on touch; animating `top` and `height` instead of transforms. Check every change with reduced motion on. Deeper references: `ladder-and-curves.md`, `patterns.md`, `guards.md`, `performance.md`.
