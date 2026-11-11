/**
 * Theme persistence. Two explicit modes, Light or Dark; Light is the default.
 * The choice sticks in localStorage and is reflected on <html> via data-theme,
 * which the dark token overrides key off (color-tokens.css). Three functions
 * for three callers: initial React state, the DOM write, the user action.
 * Pair it with the head script at the bottom of this file.
 */

export type ThemeChoice = "light" | "dark";

const KEY = "theme";

/** `=== "dark"`, not a parse: anything unrecognised falls through to light.
    Every localStorage access is wrapped; it throws in some private modes. */
export function getThemeChoice(): ThemeChoice {
  try {
    if (localStorage.getItem(KEY) === "dark") return "dark";
  } catch {
    /* localStorage unavailable */
  }
  return "light";
}

export function applyTheme(choice: ThemeChoice): void {
  document.documentElement.dataset.theme = choice;
}

export function setThemeChoice(choice: ThemeChoice): void {
  try {
    localStorage.setItem(KEY, choice);
  } catch {
    /* preference just won't persist */
  }

  /* Crossfade on explicit toggles only: the class (motion-tokens.css) is
     added, then removed after 440ms — the 400ms fade plus a 40ms margin. */
  const root = document.documentElement;
  root.classList.add("theme-transition");
  applyTheme(choice);
  window.setTimeout(() => root.classList.remove("theme-transition"), 440);
}

/* ─────────────────────────────────────────────────────────────────────────
   The no-flash head script. Copy this into index.html, inline, in <head>,
   BEFORE the stylesheet. It duplicates the read above on purpose.

     <script>
       (function () {
         try {
           document.documentElement.dataset.theme =
             localStorage.getItem("theme") === "dark" ? "dark" : "light";
         } catch (e) {}
       })();
     </script>

   Inline, blocking, before the stylesheet, in try/catch; for SSR, render
   the attribute from a cookie. Why each, and what a third "system" state
   would add: domains/color/theming-mechanics.md.
   ───────────────────────────────────────────────────────────────────────── */
