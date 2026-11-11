# Radius, corners, and stacking

Glass's values for layout laws 5–7; the rules themselves, and the nesting worked through in general, are in `domains/layout/radius-lines-and-layers.md`.

## The nesting rule, through the site

Layout law 5, in the reference implementation's dock:

```
Dock:          rounded-2xl      (16px)   p-1  (4px padding)
  Icon button: rounded-[12px]   (12px)            16 − 4 = 12  ✓
    Avatar:    rounded-[10px]   (10px)   inset ~2px   12 − 2 = 10  ✓
```

Three levels, each derived. The avatar is `h-9 w-9` inside an `h-10 w-10` button — a 2px inset all round, so 10px.

The mobile sheet snaps to the ladder:

```
Sheet:  rounded-2xl   (16px)   p-1.5 (6px)
  Row:  rounded-xl    (12px)          16 − 6 = 10, rounded up to 12
```

## The ladder

| Radius | Class | For |
|---|---|---|
| full | `rounded-full` | Pills, tags, dots, markers |
| 2px | — | The focus ring's own radius |
| 5px | `rounded-[5px]` | A lettermark box (tiny, so a small radius) |
| 6px | `rounded-md` | Tooltips, the skip link |
| 9px | `rounded-[9px]` | Small cards in a stack |
| 10px | `rounded-[10px]` | Avatar inside a button; a list highlight bar |
| 12px | `rounded-xl` / `rounded-[12px]` | Cards, hover panels, disclosures, icon buttons |
| 16px | `rounded-2xl` / `rounded-[16px]` | Outer containers — a dock, a sheet, a pocket |

Radius scales with size, not importance (layout law 5): a 40px icon button gets 12px; a 300px panel gets 16px.

## Continuous corners

The rule is in §4 of the guide: `superellipse(1.5)` on every element and pseudo-element. **1.5 rather than 2** because a full squircle is noticeable — at small sizes it looks like a slightly swollen rectangle. Halfway reads as a well-drawn corner rather than an effect.

## Hairline weights

| Weight | Class | For |
|---|---|---|
| 0.5px | `border-[0.5px]`, `h-[0.5px]` | Chrome borders, dividers, glass edges |
| 1px | `border`, `ring-1`, `h-px` | Card borders, TOC markers |
| 2px | `outline-2`, `border-l-2` | Focus rings, an imported Markdown quote's rule |
| 3px | `w-[3px] rounded-full` | The pull-quote bar |

By job (layout law 6): two groups of icons within one dock, 0.5px; where a card ends, 1px; a focus ring, 2px. The authored pull quote's bar is 3px and rounded, so a flex child rather than a border (`glass/type/assets/prose.tsx`); imported Markdown, which can't take classes, keeps a 2px `gray-alpha-300` border.

Vertical dividers use `w-[0.5px]` with an explicit height and `self-center`:

```tsx
<span aria-hidden className="mx-0.5 h-6 w-[0.5px] self-center bg-gray-alpha-300" />
```

A 24px line in a 40px-tall row, one step lighter than the dock's `alpha-400` edge, because it's an internal articulation, not a boundary.

**The box form is a gap the reference implementation still has.** `h-[0.5px]` and `w-[0.5px]` with a background are boxes, which layout law 6 says a 1x screen can drop. Draw every hairline as a border instead: `border-t-[0.5px]` on the element, or an empty span carrying `border-l-[0.5px]` for a vertical divider, the same weight and colour by the more reliable route.

## Elevation tiers

Glass's shadow tiers — chrome, pocket, panel, card, transient — are depth's: `glass/depth/depth-cues.md`.

## The z-index ladder

The ladder is in §8 of the guide. **The 40/50 pair** in code:

```tsx
{open && (
  <div aria-hidden onClick={() => setOpen(false)}
       className="pointer-events-auto fixed inset-0 z-40 sm:hidden" />
)}
<div className="pointer-events-auto relative z-50 sm:hidden">
  {/* the menu */}
</div>
```

**`z-index: 10` for a hover lift:**

```tsx
<Link className="group relative block transition-[z-index] hover:z-10 focus-within:z-10">
```

Folder cards rising out of a pocket would otherwise be clipped by the next folder; `focus-within:z-10` gives keyboard focus the same lift.

## Stacking-context techniques

The general techniques are in `domains/layout/radius-lines-and-layers.md`. Glass's cases:

- **`isolate` plus negative z** scopes the dock's sliding highlight behind its icons but in front of the glass: the code is in `glass/depth/depth-cues.md`.
- **The nav strip** passes clicks through and carries no transform (§8 of the guide); a transform would trap the mobile sheet's full-bleed `w-screen` overlay inside the strip.

### `transform-origin` for menus

```tsx
const anchor = placement === "up" ? "origin-bottom" : "origin-top";
```

A menu scales **from its trigger's edge**, or it seems to detach and drift; off one side, use the corner: `origin-top-left`.
