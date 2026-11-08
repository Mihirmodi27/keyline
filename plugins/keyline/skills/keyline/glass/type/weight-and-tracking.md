# Weight and tracking

Glass's weights and tracking values, with the decisions behind them. Why two weights, why weight is a state signal and why tracking runs negative with size: domain laws 5 and 7 in `domains/type/guide.md`.

## Weight

### Two weights

400 and 500: a 100-unit gap, the smallest step most families offer, and enough. Keep the gap at 100 and the axis stays free for active nav rows, sub-headings, emphasis and lettermarks.

### Where each lands

**400 — the default.**
All body copy. All prose. Deks. Meta lines. Tags. Tooltips. Timestamps. Quiet nav rows. Pull quotes (already set apart by size, leading and a border; weight makes them strident).

**500 — structure and state.**
Headings h1–h4. `<strong>`. The active row in a table of contents. Names and wordmarks. Captions that label an image rather than describe it. Lettermarks. Company/role titles in a list, where the role is structural and the date supporting.

### Quiet and lifted, by scenario

The lists above are defaults; the choice is made per spot, by the rules in domain law 5. The same 13px line is 400 as a date under a title and 500 as the name heading a group, because the job changed, not the importance. With two weights, a step is the whole axis, so when a screen feels heavy the fix is moving lines back to 400, one context at a time; there's never a lighter scale to reach for.

### When 300 is legitimate

Rarely, and never for text read at length: at a very large display size (48px+), where 400 starts to look heavy, or a decorative numeral. If your interface tops out at 30px — most do — you don't need it. The reference implementation loaded 300 for a while and never used it; dropping it from the font request was a straight performance win.

### Weight as an accessibility signal

The active table-of-contents row takes the primary text colour *and* weight 500 (domain law 5):

```tsx
className={`… ${tone} ${state === "active" ? "font-medium" : ""}`}
```

Weight is cheaper here than a background pill, border or icon, each of which adds visual weight to a list meant to be quiet.

## Tracking

### The ladder

| Size | Tracking | Reasoning |
|---|---|---|
| 7.5px | −0.01em | Card lettering, set solid. The exception below the floor — see the note. |
| 8.5–11px | +0.02em | Tiny glyphs and near-caps need air or the counters close up. |
| 12–14px | 0 | Default metrics are designed for this range. Leave them. |
| 16px | −0.015em | Enough to look set; small enough to be invisible as a decision. |
| 18px | −0.02em | A page title is a tighter, more deliberate object than a section heading two pixels below. |

Only two rows are the negative-tracking-at-size rule, because the ladder tops out at 18px. An earlier table ran to 30px at −0.025em, with separate values for a 19px heading and a 19px quote; all three sizes left the ladder and took their tracking with them.

The 7.5px row doesn't contradict the 8.5–11px one: that lettering is set solid at near-caps size on a card, so the tightening compensates for the *setting*, not the size. It's also the one place a 600 weight is allowed. Two exceptions in one place hint you're outside the text system — which you are, since nobody reads it.

### The 8.5px lettermark

```tsx
<span className="… border border-gray-alpha-400 px-[3px] text-[8.5px] font-medium tracking-[0.02em] text-gray-800">
  {letters}
</span>
```

Not text but a mark: a two-or-three-letter stand-in for a logo, in the same 20px optical box as the real SVG logos beside it. It's below the readability floor on purpose — you recognise "TS" the way you recognise an icon (domain law 1). The `+0.02em` and the `px-[3px]` both keep the letters off the border box.
