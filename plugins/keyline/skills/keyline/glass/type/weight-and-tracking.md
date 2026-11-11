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

The lists are defaults; the choice is made per spot (domain law 5): the same 13px line is 400 as a date under a title and 500 as the name heading a group.

### 300

Not loaded. The reference implementation loaded it for a while and never used it; dropping it from the font request was a straight performance win.

### Weight as an accessibility signal

The active table-of-contents row takes the primary text colour *and* weight 500 (domain law 5):

```tsx
className={`… ${tone} ${state === "active" ? "font-medium" : ""}`}
```

## Tracking

The values are §4 of `glass/type/guide.md`. Only 16px and 18px are the negative-tracking-at-size rule, because the ladder tops out at 18px. The 7.5px card lettering's −0.01em doesn't contradict the lettermarks' +0.02em: it is set solid at near-caps size, so the tightening compensates for the *setting*, not the size.

### The 8.5px lettermark

```tsx
<span className="… border border-gray-alpha-400 px-[3px] text-[8.5px] font-medium tracking-[0.02em] text-gray-800">
  {letters}
</span>
```

Not text but a mark: a two-or-three-letter stand-in for a logo, in the same 20px optical box as the real SVG logos beside it. It's below the readability floor on purpose — you recognise "TS" the way you recognise an icon (domain law 1). The `+0.02em` and the `px-[3px]` both keep the letters off the border box.
