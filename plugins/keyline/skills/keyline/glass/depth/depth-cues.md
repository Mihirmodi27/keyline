# Depth cues

Glass's edges, shadows and tiers, for depth laws 1–5; the bundle and the shadow derivation in general are in `domains/depth/elevation-recipes.md`. Corners and the nesting rule are layout's: `glass/layout/radius-and-elevation.md`.

## 1. The hairline

Every glass surface here pairs blur with a border:

```tsx
className="glass-nav rounded-2xl border-[0.5px] border-gray-alpha-400 p-1"
```

**Why the alpha ramp.** Because it inverts to white-based in dark mode (the Glass colour guide, `glass/color/guide.md`), the border is automatically lighter than its surface in dark mode and darker in light — "one step more contrast than the surface" in both directions.

**Why 0.5px.** On a small floating dock, 1px reads as heavy; 0.5px reads as an edge.

**The exception.** The decorative folder pocket uses a solid `border-white/60` with `dark:border-white/[0.08]`. A literal white works because it's a *decorative* material over content it controls, and the bright edge is part of the effect. The dark value drops to `0.08` from `0.6` because on a dark surface a bright edge reads as a glowing line, not a catch light.

Vertical dividers inside the dock are layout's (`glass/layout/radius-and-elevation.md`).

## 2. The shadow stack

`.dock-shadow` lives in `glass/depth/assets/glass.css`, both themes side by side; depth law 4 gives each layer's job. Light to dark:

```
inset 0 1px 0 rgba(255,255,255,0.10),     /* highlight:  0.6  → 0.10 */
0 1px 1px rgba(0,0,0,0.3),                /* shadows:    0.02 → 0.3  */
0 8px 16px -4px rgba(0,0,0,0.5),          /*             0.04 → 0.5  */
0 24px 32px -8px rgba(0,0,0,0.6)          /*             0.06 → 0.6  */
```

A 4%-black shadow on a `#0b0b0b` surface is invisible; dark mode needs 30–60% black before a shadow registers. It's also why the dark page is `#0b0b0b`, not `#000000` (depth law 5).

Because the structure changes and not just the values, elevation **cannot be a single token**. It needs a per-theme pair — the one place raw `rgba()` outside the token file is acceptable — and it belongs in a **CSS class**, not a JS constant:

```tsx
<div className="glass-nav dock-shadow rounded-2xl border-[0.5px] border-gray-alpha-400 p-1">
```

The reference implementation started with an exported constant and moved to the class:

- **It's ~400 characters of arbitrary-value syntax either way**, but in a class it's four readable lines you can compare against the four in the dark block.
- **A shared constant is still imported and interpolated at every site**, so a `grep` for the shadow finds five hits rather than one definition.
- **The escaping is a hazard** (`domains/depth/elevation-recipes.md`, one definition per level).

## 3. Elevation tiers

**More layers as the element floats higher and persists longer** (depth law 4).

| Tier | Recipe | Radius | For |
|---|---|---|---|
| **Chrome** | 4 layers (inset + contact + 2 ambient) | 16px | Fixed docks, floating menus, sheets |
| **Pocket** | `inset 0 1px 0 rgba(255,255,255,0.8)` + `0 10px 28px -12px rgba(0,0,0,0.22)` | 16px | A large decorative material |
| **Panel** | `0 8px 24px -8px rgba(0,0,0,0.12)` / dark `0.6` | 12px | Hover cards |
| **Card** | `0 4px 12px -4px rgba(0,0,0,0.22)` + `ring-1 ring-black/[0.06]` / dark `ring-white/[0.08]` | 9px | Cards in a stack |
| **Transient** | `0 4px 10px -4px rgba(0,0,0,0.3)` | 6px | Tooltips |

**A tooltip's shadow is 30% black in *both* themes.** It sits on `bg-gray-1000`, near-black in light mode and near-white in dark, so the surface sets its requirement (depth law 4).

**The stacked card uses a `ring`, not a `border`.** A ring doesn't affect layout, so it can't shift a card positioned by transform mid-animation. `ring-black/[0.06] dark:ring-white/[0.08]` carries the alpha ramp's information in a utility that doesn't take a token.

### A confirmation takes an existing tier

A destructive confirmation takes the panel the rest of the system floats (depth law 1), in the pattern patterns law 4 sets out. Its focus returns to the opener, held on open:

```tsx
const opener = useRef<HTMLElement | null>(null);
const open = () => { opener.current = document.activeElement as HTMLElement; setOpen(true); };
const close = () => { setOpen(false); requestAnimationFrame(() => opener.current?.focus()); };
```

## 4. Stacking inside a glass surface

A sliding highlight must sit **behind** the icons but **in front of** the surface's own tint:

```tsx
<ul className="glass-nav relative isolate flex items-center …">
  <m.div className="pointer-events-none absolute left-0 top-0 -z-10 rounded-[12px] bg-highlight" />
  {/* icons, in normal flow, above the bar */}
</ul>
```

`-z-10` alone would drop the bar behind the container, tint included; `isolate` scopes it, so the bar goes behind the icons but not behind the glass (layout law 7).

`bg-highlight` is a token, white in light mode and `#2c2c2c` in dark: an elevated surface within an elevated surface, lighter than the glass in light mode and lighter again in dark, so it can't be a fixed colour.

The enclosing fixed strip carries **no transform**: it would weaken the `backdrop-filter` in its subtree *and* trap the mobile sheet's full-bleed overlay (depth law 9).
