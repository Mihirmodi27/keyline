# Glass Typography

> **Glass preset.** This is the type system running on [modimihir.com](https://modimihir.com), with its real values, meant to be copied whole. Read it beside `domains/type/guide.md`: the laws and their reasons are there, and this guide holds only what Glass decides — its ladder, its values, its recipes and why it chose them. Under any other preset, the domain guide leads and this guide is only a worked example.

For interfaces where the text *is* the product — portfolios, docs, writing. The aim: **a reader should never notice the typography, only the hierarchy.** The example is Archivo in a 640px measure with Tailwind v4 tokens.

## 1. The role ladder

Each role gets a size in steps of 1–2px, as densely as the roles demand (domain law 1):

| Role | Size | Leading | Tracking | Weight | Text tier |
|---|---|---|---|---|---|
| Index page title (h1) | 18 | 1.25 | −0.02em | 500 | primary |
| Detail page title (h1) | 16 | 1.3 | −0.015em | 500 | primary |
| Section heading (h2) | 16 | 1.2 | −0.015em | 500 | primary |
| Prose heading (h2) | 16 | 1.2 | −0.015em | 500 | primary |
| Keyline — a section's claim | 14 | 1.6 | — | 500 | primary |
| Lead paragraph | 14 | 1.9 | — | 400 | primary |
| Prose body | 14 | 1.75 | — | 400 | primary |
| Pull quote | 14 | 1.75 | — | 400 | primary |
| Dek / standfirst | 14 | 1.55 | — | 400 | muted |
| Reading paragraph | 14 | 1.65 | — | 400 | primary or muted |
| Sub-heading (h3/h4) | 14 | 1.4 | — | 500 | primary |
| UI row | 14 | 1 | — | 400 | secondary |
| Summary line | 13.5 | 1.6 | — | 400 | primary |
| List row / dense label | 13 | 1.4 | — | 400 | secondary |
| Note, caption, meta, fact | 13 | 1.5–1.6 | — | 400 | faint or quiet |
| Code | 12.5 | 1.6 | — | 400 mono | secondary |
| Tag, micro-label | 12 | — | — | 400 | muted |
| Tooltip | 11 | 1 | — | 400 | inverted |
| Lettermark | 8.5 | 1 | +0.02em | 500 | muted |
| Card lettering | 7.5 | 1.2 | −0.01em | 600 | primary |

Text tiers (`primary` → `quiet`) come from the Glass colour guide (`glass/color/guide.md`). Only the top two are grey-ramp steps (`gray-1000`, `gray-900`); `muted` / `quiet` / `faint` are separate tokens picked for contrast (colour law 2).

**Eighteen is the ceiling, and it's lower than you think.** An earlier ladder topped out at 30px, with a 19px prose heading, a 17px dek and a 16px prose body. Case studies and articles opened at 30px and every other page at 18px, so a case study felt like a different site (domain law 2). The rest of the site ran on **two sizes**, 16 for headings and 14 for everything read; the detail templates came down to those, and the four sizes were deleted, not replaced. One element likewise takes one role on every page, and sibling controls match (domain law 2).

### When size stops doing the work

Collapse the ladder and eight roles share 14px — the constraint the system is *for*. Each separates on a different axis (domain law 4):

| Role | The signal | Not |
|---|---|---|
| Keyline | weight 500, and 36px of air on both sides | a size step |
| Lead | leading — 1.9 against the body's 1.75 | a size step |
| Pull quote | a 3px rounded bar and a 16px indent | a size step |
| Dek | the muted tier, and tighter leading at 1.55 | a size step |

At one size, the 17px keyline that once shouted over a 16px heading can't return (domain law 3).

The cost is a flatter page: titles and section headings are both 16px, separated by position and spacing. It's the right flat, because the home page already worked that way and the detail pages were the outlier.

**Nothing in this ladder resizes.** The old step, a 30px title dropping to 26px below `sm`, went with the size that needed it (the domain's responsive-sizes dial).

→ Full derivation, including how to add a role without bloating the ladder: `glass/type/scale.md`

## 2. Two weights

Load 400 and 500. That is the system.

- **400** — all body copy, all reading copy, all quiet UI.
- **500** — headings at every level, active states, `<strong>`, lettermarks.

Quiet or lifted is set by what the line is doing there, one lift per group, one weight per set of titles; no 600, no 700 (domain law 5).

**The one exception** is a single `font-semibold`, on 7.5px folder-card lettering. Below about 8px a 500 doesn't survive rasterisation as a weight — too few pixels across a stem — so it's 600 or nothing. It's below the readable floor, on something recognised rather than read: the only kind of exception to accept, and one is the right number.

A contents rail's active row takes `font-medium` *and* primary colour, so state is never on colour alone; no state greys a title (domain laws 3 and 5).

→ Weight and tracking in depth, including when 300 is legitimate: `glass/type/weight-and-tracking.md`

## 3. Leading runs inverse to size

Glass's values on the three curves (domain law 6):

| Job | Range | Rule |
|---|---|---|
| **Display** — titles, headings | 1.2 – 1.3 | Bigger means tighter. A 16px heading at 1.65 reads as two loose lines, not one heading. |
| **Reading** — paragraphs, prose | 1.55 – 1.9 | Longer passages, more open: prose body 14/1.75 against a UI paragraph's 14/1.55. |
| **UI** — rows, tooltips, labels | 1 – 1.4 | Single-line text in a fixed-height box takes `leading-none`. |

**Two headings at one size can still differ**: a detail-page title is 16/1.3 and a section heading 16/1.2, because titles wrap and section headings are one word. In prose the 0.15 step between lead (1.9) and body (1.75) is the whole signal, so it must be exact.

## 4. Tracking is negative and scales with size

```
≤14px      0
16px      −0.015em    (headings and detail-page titles)
18px      −0.02em     (index-page titles — the top of the ladder)
7.5px     −0.01em     (card lettering, which is set solid and needs pulling in)
tiny caps +0.02em     (8.5px lettermarks, 11px initials)
```

Why each direction, and never on body copy: domain law 7. With no large sizes the system barely needs tracking — two negative values, 2px apart.

## 5. Emphasis without italic or bold

```css
/* Italics are switched off globally. */
em, i { font-style: normal; }
```

Archivo's true italic is a separate file whose slant fights its geometric letterforms, so emphasis moves to two axes the system already has:

- `*emphasis*` → the **muted** text colour. It recedes rather than tilts.
- `**strong**` → weight 500 + the **primary** text colour. It advances.

```tsx
// From the inline markdown renderer
if (bold) return <strong className="font-medium text-gray-1000">{text}</strong>;
if (em)   return <em className="text-muted">{text}</em>;
```

Why the mapping works, and the semantic tags it keeps: domain law 9 and `domains/type/prose-and-emphasis.md`.

## 6. Numerals

```css
body { font-variant-numeric: tabular-nums; }
```

Glass sets the numerals dial (domain law 10) globally, not per component: text-heavy interfaces put numbers in columns that should align — date ranges, timestamps, read times, versions. Proportional numerals win only inside a running sentence, too rare to set the default.

## 7. One family, self-hosted

One family, plus the one second register that passes domain law 5:

```css
--font-sans: var(--font-archivo), system-ui, -apple-system, "Helvetica Neue", sans-serif;
/* Code, commands and paths. System stack on purpose — a second webfont for the
   few monospace runs on the site isn't worth the request. */
--font-mono: ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace;
```

A few `<code>` spans and two code blocks don't justify a request. *A second family earns a download only if it's carrying reading copy.*

### Self-host, and let the loader generate the fallback

```tsx
// next/font — fetched at build time, served from your own origin.
const archivo = Archivo({ subsets: ["latin"], display: "swap", variable: "--font-archivo" });
```

Google's CDN cost the site three round trips over two third-party hosts before the font was requested; self-hosted, it rides the existing connection with a `<link rel="preload">` alongside the HTML (domain law 12). `display: swap` stays, and `next/font` synthesises the metric-matched fallback, a local face scaled to Archivo's metrics, so a swap that *does* happen doesn't move the line.

**Where a swap costs most here** is the opening screen, one line alone on the page; tune loading for that frame.

```css
body {
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
```

## 8. Prose you don't control

Imported Markdown, styled by element in one scoped class on the same ladder (domain law 11):

```css
.skill-prose            { font-size: 14px; line-height: 1.65; color: var(--color-muted); }
.skill-prose h2         { margin: 44px 0 12px; font-size: 16px; font-weight: 500; }
.skill-prose h3         { margin: 32px 0 10px; font-size: 14px; font-weight: 500; }
.skill-prose h4         { margin: 24px 0  8px; font-size: 13px; font-weight: 500; }
.skill-prose > :first-child { margin-top: 0; }
```

What Glass adds to the domain's mapping (`domains/type/prose-and-emphasis.md`):

- **`h4` at 13px, secondary tier.**
- **A wrapping `.table-scroll` div on each table**, and `overflow-x: auto` on the `<pre>`.
- **Its own `<ul>` marker**: `list-style: none` and a 3px `::before` dot matching the hand-rolled bullets, because a UA disc at 14px is far too heavy.

## 9. UI copy and reading copy are different systems

Glass's two systems (domain law 8):

|  | UI copy | Reading copy |
|---|---|---|
| Size | 11–16 | 13–18 |
| Leading | 1 – 1.55 | 1.55 – 1.9 |
| Lives in | chrome, rows, labels, nav | a constrained measure |
| Optimised for | scanning, glancing | sustained reading |
| Colour | often secondary/quiet | primary |

The ranges overlap, so leading and measure carry the distinction. Reading leading on a UI row is the usual symptom here: it grows, and the dock loses its rhythm.

**Labels are sentence case, generated ones included** (patterns law 1), and **icons beside text** follow domain law 13: 13px text, a 13–14px icon, a 4–6px gap.

→ How prose blocks are set — headings, quotes, lists, spacing: `glass/type/long-form-prose.md`

## Assets

- `glass/type/assets/type-tokens.css` — the ladder as CSS custom properties and Tailwind v4 `@theme` tokens, the role classes, and a scoped block for imported Markdown.
- `glass/type/assets/prose.tsx` — the long-form renderer: the two-size column, the `lead` / `keyline` / `note` / `quote` / `figure` blocks and their axes, inline emphasis and link mapping.

## Applying this to an existing codebase

Inventory and sweep as the domain guide does (**Auditing existing code**). Moving a codebase onto Glass, the order that pays:

1. **Collapse weights first** — the highest-leverage change, and the most visible.
2. **Map sizes onto the ladder above**, by role.
3. **Set leading per curve.** Most drift is here.
4. **Add tracking only above 14px.**
5. **Switch emphasis to weight + colour.** Then delete the italic font file.
6. **Sweep**, moving raw sizes onto Glass's role tokens. → Its `tailwind-merge` registration: `glass/type/scale.md`

## Checklist

The domain checklist, plus Glass's values:

- [ ] Two weights loaded and used, 400 and 500; 600 only on the 7.5px card lettering.
- [ ] Every size is on the ladder above; nothing above 18px; no role resizes.
- [ ] The 14px roles separate as the table in §1 says.
- [ ] Tracking: −0.015em at 16px, −0.02em at 18px, +0.02em on lettermarks and initials, −0.01em on card lettering; nothing else.
- [ ] No `font-style: italic` in output; `em` maps to muted; `<strong>` is 500 + primary.
- [ ] `tabular-nums` global; live-updating numbers verified stable.
- [ ] Archivo self-hosted through the loader, `display: swap`, generated fallback; mono a system stack.
- [ ] Imported prose under one scoped class, with the §8 additions.
- [ ] Sentence case on every label, generated ones included.
- [ ] Icons beside text sized to it: 13px text, 13–14px icon, 4–6px gap.
