# Theming

Glass's theme switch, persistence and crossfade, with the values it ships. The mechanism, the head script's four requirements, persistence, `color-scheme`, two states or three, and theme islands are in `domains/color/theming-mechanics.md`; this file holds what Glass does and why.

## A data attribute, not `prefers-color-scheme`

```css
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));
```

Tailwind v4 drives `dark:` off the OS media query by default; Glass has a toggle, so `data-theme` on `<html>` is the mechanism (domain law 9). For a permanently-light region inside a dark page, re-declare the custom properties on its container rather than nesting the attribute (`domains/color/theming-mechanics.md`, **Theme islands**).

## No flash of wrong theme, persistence and the crossfade

The code lives in `glass/color/assets/theme.ts` — the three functions and, at the bottom, the inline head script — and the 440ms `.theme-transition` rule in `glass/motion/assets/motion-tokens.css`. The head script duplicates a few lines of the theme module, with a comment in each place pointing at the other. The mechanism, the head script's four requirements, the three callers and why the crossfade class is temporary and `!important`: `domains/color/theming-mechanics.md`.

Glass's values:

- **The comparison is `=== "dark"`**, so anything unrecognised falls through to light.
- **440ms**: 400ms plus a 40ms margin so nothing is cut off. For those 440ms it has to beat every component's own `transition-colors duration-150`.
- **400ms**: the longest duration in the system, for its largest change — every surface, text colour, border, icon fill and shadow at once.
- **Plain `ease`, not the house curve.** The house easing overshoots, and on a colour that sends the background past its target and back — a wobble in the light.

## `color-scheme`

```css
:root { color-scheme: light; }
:root[data-theme="dark"] { color-scheme: dark; }
```

What it re-tints, and the white scrollbar track that shows it's missing: `domains/color/theming-mechanics.md`, **`color-scheme`**.

## Two states, not three

The reference implementation ships **two** explicit modes, Light and Dark, with Light as the default. No "System": a theme control should be predictable, and "System" changes the theme when the OS crosses a sunset threshold, which surprises someone who picked it from the site's own menu. Two `aria-pressed` buttons are also simpler to build and explain than a tri-state. What three would cost — the head script resolving `system`, and a live listener — is in `domains/color/theming-mechanics.md`, **Two states or three**.

## Where `dark:` variants are still needed

Most components need no theme branching; the test for when one does is in `domains/color/theming-mechanics.md`. Glass's cases:

**Multi-layer shadows.** A shadow whose *structure* changes between themes (the inset highlight weakening while the ambient shadows strengthen 10×) can't live in one colour token, but Glass keeps it out of `dark:` too: it's one class, `.dock-shadow`, with its `:root[data-theme="dark"]` twin beside it (`glass/depth/depth-cues.md`, §2), not a JS constant.

**Ring/border colours as alpha of a specific hue.** `ring-black/[0.06] dark:ring-white/[0.08]` encodes what the alpha ramp does, where the utility won't take a token. Prefer `gray-alpha-*` where you can; use the pair where you can't.

**Anything two-toned by design.** The frosted folder pocket uses `border-white/60 dark:border-white/[0.08]`: a bright top edge that must nearly vanish on dark, where it would read as a glowing line.
