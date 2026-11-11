# Measure and rhythm

Glass's values for layout laws 1–3; the derivations and reasons every preset shares are in `domains/layout/measure-and-rhythm.md`.

## The measure

`.col` (§1 of the guide) is 640px outer with 32px padding each side → **576px of text**.

At the 14px prose size that's about 90 characters a line (85–95, measured in Archivo), past the comfortable range on purpose: long lines are efficient once the reader is committed, and 1.75 leading compensates for the longer return sweep. At 16px the same column would hold 75–85.

The padding does double duty: on a 375px phone the column is `375 − 64 = 311px`, and on desktop the 32px keeps text off the edge of a maximised window.

That 311px once forced a responsive type step (a 30px title wrapping to three lines) until an 18px type ceiling removed it: layout law 1's narrowest-measure check, settled in the scale.

640px also equals Tailwind's `sm` breakpoint — convenient, not meaningful: below it the column is padding-limited, so the two coincide naturally.

The summary and detail pairs it keeps still: home-page role summary → `/experience`, writing index → article.

## What's allowed outside the column

**Non-text content.** The image galleries are a full-bleed CSS-columns masonry on a grey field with 4px gaps; confining it to 640px would only make the images small.

```tsx
<main className="min-h-[100dvh] bg-gray-100 p-1 pb-28">
  <div className="columns-3 gap-1 sm:columns-4">
```

Note `columns-3` then `sm:columns-4`: fewer columns on a phone, more on desktop — against the mobile-first instinct for grids, and right here because the tiles are photographs.

**Rails**, anchored to a wider frame (§2 of the guide), and **fixed chrome**: the nav strip spans the viewport for centring.

## Dividers at column width

```tsx
export function Divider() {
  return (
    <div className="col my-3" aria-hidden>
      <hr className="border-0 h-[0.5px] bg-gray-alpha-300" />
    </div>
  );
}
```

Reusing `.col` makes it exactly as wide as the text it separates. The `<hr>` reset and `aria-hidden` are layout law 6's; the half-pixel box is a gap the site still has (`glass/layout/radius-and-elevation.md`).

`my-3` (12px) on top of the sections' own `py-9` (36px) → 48px between the content of adjacent sections, the hairline centred in it.

## The spacing scale

Tailwind's 4px scale, with a preference for a few well-worn values:

| Value | px | Typical use |
|---|---|---|
| `0.5` | 2 | Nudges between adjacent icons |
| `1` | 4 | Gallery gaps, dock padding |
| `1.5` | 6 | Sub-title under a heading |
| `2` | 8 | List items, tag gaps |
| `2.5` | 10 | Row padding, marker gaps |
| `3` | 12 | Heading → paragraph, container padding |
| `3.5` | 14 | Heading → list |
| `4` | 16 | Paragraph gaps, grid gaps |
| `5` | 20 | Quote indent, section heading → content |
| `6` | 24 | Prose paragraph gaps, meta rows |
| `7` | 28 | Capability groups |
| `8` | 32 | Section heading → content, column padding |
| `9` | 36 | Home section padding |
| `10` | 40 | Prose heading top margin, section content after a rule |
| `11` | 44 | Between roles on the experience page |
| `14` | 56 | First section on a long page |
| `16` | 64 | Between major sections on a long page |
| `20`/`28` | 80/112 | Page top/bottom padding |

The values in heaviest use are `2.5`, `3.5`, `9`, `10` — mostly half-steps and odd numbers. They exist because 10/14/36/40 are where the *asymmetry ratios* land, not because the scale demanded them.

## Asymmetry, in detail

Layout law 2 at glass's values, beyond the guide's table (§3):

| Relationship | Inner | Outer | Ratio |
|---|---|---|---|
| Role title → its description | 2px | 6px | 3:1 |
| Case study title → body | 6px | 20px (between cards) | 3.3:1 |
| Capability heading → body | 8px | 32px (between capabilities) | 4:1 |

## Section rhythm

**Home page — peers.**

```tsx
<section className="py-9">   {/* 36px symmetric */}
```

**Long pages — hierarchy.**

```tsx
<section className="mt-16 border-t border-gray-alpha-300 pt-10">
```

64px above the rule, 40px below. The first section on such a page uses `mt-14` (56px) with no rule — there's nothing above it to separate from.

## Not every boundary gets a rule

```tsx
const SECTIONS = {
  work:       { node: <Work />,       rule: true },
  experience: { node: <Experience />, rule: true },
  life:       { node: <MyLife />,     rule: true },
  watching:   { node: <Watching />,   rule: false },
  socials:    { node: <Socials />,    rule: false },
};
```

Glass's divider decision (layout law 3): Work, Experience and Life are the substantial blocks and get separated; Watching and Socials read as a **coda** to Life, so they follow without a rule. The flag lives in layout code beside the sections, never in config (`domains/layout/measure-and-rhythm.md`, section rhythm).

## Page padding

```tsx
className="pb-20 pt-28 sm:pt-20"     // long page
className="pb-28 pt-28 sm:pt-20"     // index page
className="pt-28 pb-14 sm:pt-20 sm:pb-11"   // hero
```

**Top padding is generous** — 112px, 80px on phones; a long top margin signals "this is a document."

**Bottom padding accounts for the fixed dock.** `pb-28` (112px) on pages whose content can end near the viewport bottom, so the last line is never under the nav. A page ending in a footer can use less, because the footer's own `pb-28` covers it.

## `dvh` over `vh`

Anything sized to the viewport uses `dvh` (`domains/layout/measure-and-rhythm.md`, viewport units):

```tsx
className="min-h-[100dvh]"
className="max-h-[calc(100dvh-11rem)]"
```
