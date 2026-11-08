# Long-form prose

How Glass sets the reading half: looser leading and spacing than anything else on the site, inside the *same* 640px measure, at the *same* two sizes. The blocks, their axes and the rules they keep are in `domains/type/prose-and-emphasis.md`; this file holds Glass's values and code.

## The container sets the register

```tsx
<div className="text-[14px] leading-[1.75] text-gray-1000">
```

Prose body is 14/1.75: a UI paragraph's size, noticeably more open (1.75 vs 1.55).

Why 1.75: a 576px text column at 14px holds roughly 85–95 characters a line, past comfortable, and long lines need more leading for the eye to find the next line's start. A shorter measure could pull it back toward 1.6.

## The reading column is two sizes

16 for headings, 14 for everything a reader reads. The blocks sharing 14px each own a different signal (domain law 4):

| Block | Size | The signal |
|---|---|---|
| Lead | 14 | leading at 1.9, and 32px below |
| Keyline | 14 | weight 500, and 36px of air on both sides |
| Body | 14 | leading at 1.75 — the baseline the others are read against |
| Pull quote | 14 | a 3px rounded bar and a 16px indent |
| Note | 13 | a 1px rule, the faint tier, and a step down in size |

## Keyline and note

Both came from one diagnosis: a body of writing that was 114 paragraphs and almost nothing else. What each is for, and the build check that keeps them honest: `domains/type/prose-and-emphasis.md`, **Two block types worth having**.

**`keyline`** — body size, weight 500, `my-9`.

```tsx
case "keyline":
  return <p className="reveal my-9 text-[14px] font-medium leading-[1.6] text-gray-1000">…</p>;
```

**`note`** — 13px, faint tier, a 1px left rule and 16px of indent.

```tsx
case "note":
  return <p className="reveal my-7 border-l border-gray-alpha-300 pl-4 text-[13px] leading-[1.6] text-faint">…</p>;
```

The note's rule is 1px and the quote's 3px, with the type inside four steps apart, so the two indented rules can't be mistaken for each other.

## Block spacing

| Block | Spacing | Note |
|---|---|---|
| Paragraph | `mb-6` (24px) | ~1.7× the type size. |
| Lead | `mb-8` (32px) | More air below, to set the opening apart. |
| Heading (h2) | `mt-10 mb-3` (40 / 12) | Asymmetric: a heading belongs to what follows it. |
| Keyline | `my-9` (36px) | Symmetric — it belongs to neither neighbour, which is the point. |
| Quote | `my-9` (36px) | More air than a paragraph, both sides. |
| Note | `my-7` (28px) | Stepped in from the quote so the two read differently. |
| Figure | `my-9` (36px) | |
| List | `mb-6`, items `space-y-2` | Matches paragraph spacing so a list reads as one block. |

The heading's 40 above and 12 below, ~3.3:1, is the domain's asymmetric heading space; the keyline is its symmetric exception.

## Headings inside prose

```tsx
<h2 className="mt-10 mb-3 text-[16px] font-medium leading-[1.2] tracking-[-0.015em]">
```

16px against 14px body is one step; the weight (500), the tight leading (1.2) and the 40px above do the real work.

It matches a page-level section heading and the detail page's own `<h1>`: three levels at one size, separated by position and spacing. Flatter than most article templates, and deliberate — the alternative was an in-body heading larger than the page title.

## Quotes

```tsx
<blockquote className="my-9 flex gap-4">
  <span aria-hidden className="w-[3px] shrink-0 rounded-full bg-gray-500" />
  <div className="text-[14px] leading-[1.75] text-gray-1000">…</div>
</blockquote>
```

The type matches the body around it, so the bar is the entire signal: the 2px `gray-alpha-300` border it replaced is domain law 4's example of auditing what's left after a signal goes. Why a flex child with no vertical margin: `domains/type/prose-and-emphasis.md`, **Quotes**.

- **`bg-gray-500`, from the grey ramp, not the alpha ramp.** It's a decorative mark on an opaque surface — see the Glass colour guide (`glass/color/guide.md`) on why decorative marks stay on the solid ramp.

Still absent: italic (globally disabled), quotation marks, background, colour step. Stepping the quote *down* to secondary, as earlier versions did, at body size just makes a de-emphasised paragraph.

The citation goes quieter and explicitly kills the browser's italic (domain law 9):

```tsx
<cite className="mt-2 block text-[13px] not-italic text-quiet">— {cite}</cite>
```

## Figures

```tsx
<figure className="reveal my-9">
  <div className="overflow-hidden rounded-[10px] bg-gray-100 ring-1 ring-gray-alpha-300">
    <div style={{ aspectRatio: b.aspect ?? "16 / 9" }}>
      <img src={b.src} alt={b.alt} loading="lazy" decoding="async" className="h-full w-full object-cover" />
    </div>
  </div>
  <figcaption className="mt-2.5 text-[13px] leading-[1.55] text-faint">{caption}</figcaption>
</figure>
```

The aspect ratio sits on a wrapper so the box is reserved before the image loads. `ring-1` rather than a border, so the outline stays out of the box model and the corner radius stays exact.

**The caption is the point of the figure, not a label on it**: what the thing was for, and which constraint shaped it. It sits at the note/meta tier (13px, faint).

## Lists

```tsx
<ul className="mb-6 list-disc space-y-2 pl-5 marker:text-gray-500">
```

The `marker:` variant puts the domain's quiet marker (`domains/type/prose-and-emphasis.md`, **Lists**) on `gray-500`; the same goes for `list-decimal`.

## Hand-rolled bullets in UI context

Outside prose, as in a role's responsibilities list, a custom marker gives finer control:

```tsx
<li className="flex gap-2.5 text-[14px] leading-[1.65]">
  <span aria-hidden className="mt-[9px] h-[3px] w-[3px] shrink-0 rounded-full bg-gray-500" />
  <span>{text}</span>
</li>
```

A 3px dot at the quiet tier, offset `mt-[9px]` onto the first line's optical centre. The 9px is derived: 14px × 1.65 leading = 23.1px line box, centre at ~11.5px; minus half the 3px dot = 10px; minus a hair because a dot reads slightly low against lowercase x-height = 9px.

`aria-hidden` matters — a decorative span inside a real `<li>` would otherwise be announced.

## Emphasis in prose

The mapping is §5 of `glass/type/guide.md`. **`<strong>` and the keyline are the same weight at the same size**, so a bolded clause can read as a keyline that failed to get its own line; keep it to a few words (domain law 9).

## Reveal on scroll

Every block carries `reveal`, so paragraphs fade up one by one as they enter the viewport instead of the article arriving as one slab. See the Glass motion guide (`glass/motion/guide.md`) for the implementation and its reduced-motion behaviour.

## The dek

```tsx
<p className="mt-2 text-[14px] leading-[1.55] text-muted">{dek}</p>
```

Body size, muted, tighter leading. It was 17px, the ladder's one odd number, sitting between a 30px title and 16px prose; with both gone it separates on colour and leading alone: 1.55, against the body's 1.75 and the lead's 1.9. Dek and lead are the domain's tightest pairing; check them first.

## Cover art and the measure

The cover image stays in the text's 640px column, not bled full-width, so the page reads as one block from title to last paragraph and the image belongs to the article rather than bannering it. A `16 / 7` default aspect ratio is reserved before load so nothing shifts — in-body figures default to `16 / 9`, and both take an explicit ratio when the source has one.
