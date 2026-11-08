# Theming

Glass's theme switch, persistence and crossfade, with the values it ships. The mechanism, the head script's four requirements, persistence, `color-scheme`, two states or three, and theme islands are in `domains/color/theming-mechanics.md`; this file holds what Glass does and why.

## A data attribute, not `prefers-color-scheme`

```css
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));
```

Tailwind v4 drives `dark:` off the OS media query by default; Glass has a toggle, so `data-theme` on `<html>` is the mechanism (domain law 9). For a permanently-light region inside a dark page, re-declare the custom properties on its container rather than nesting the attribute (`domains/color/theming-mechanics.md`, **Theme islands**).

## No flash of wrong theme

```html
<head>
  <!-- Before the stylesheet. Blocking on purpose. -->
  <script>
    (function () {
      try {
        document.documentElement.dataset.theme =
          localStorage.getItem("theme") === "dark" ? "dark" : "light";
      } catch (e) {}
    })();
  </script>
  <link rel="stylesheet" href="…" />
</head>
```

Inline, blocking, before the stylesheet, in `try/catch`; it duplicates a few lines of the theme module, with a comment in each place pointing at the other (`domains/color/theming-mechanics.md`, **No flash of wrong theme**).

## Persistence and the crossfade

```ts
export type ThemeChoice = "light" | "dark";

const KEY = "theme";

export function getThemeChoice(): ThemeChoice {
  try {
    if (localStorage.getItem(KEY) === "dark") return "dark";
  } catch { /* localStorage unavailable */ }
  return "light";
}

export function applyTheme(choice: ThemeChoice): void {
  document.documentElement.dataset.theme = choice;
}

export function setThemeChoice(choice: ThemeChoice): void {
  try {
    localStorage.setItem(KEY, choice);
  } catch { /* preference just won't persist */ }

  // Crossfade only on explicit toggles.
  const root = document.documentElement;
  root.classList.add("theme-transition");
  applyTheme(choice);
  window.setTimeout(() => root.classList.remove("theme-transition"), 440);
}
```

Three functions for three callers — `getThemeChoice` for initial React state, `applyTheme` for the DOM write, `setThemeChoice` for the user action (`domains/color/theming-mechanics.md`, **Persistence**). The comparison is `=== "dark"`, so anything unrecognised falls through to light.

### The 440ms class

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

Why it's temporary, `!important`, inside `no-preference` and lists the pseudo-elements: `domains/color/theming-mechanics.md`, **The crossfade on toggle**. Glass's values:

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

**Multi-layer shadows.** A shadow whose *structure* changes between themes (the inset highlight weakening while the ambient shadows strengthen 10×) can't live in one colour token. Extract it to a shared constant:

```tsx
const SHADOW =
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_1px_1px_rgba(0,0,0,0.02),…] " +
  "dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_1px_1px_rgba(0,0,0,0.3),…]";
```

**Ring/border colours as alpha of a specific hue.** `ring-black/[0.06] dark:ring-white/[0.08]` encodes what the alpha ramp does, where the utility won't take a token. Prefer `gray-alpha-*` where you can; use the pair where you can't.

**Anything two-toned by design.** The frosted folder pocket uses `border-white/60 dark:border-white/[0.08]`: a bright top edge that must nearly vanish on dark, where it would read as a glowing line.
