# Glass Layout

> **Glass preset.** This is the layout system running on [modimihir.com](https://modimihir.com), with its real values, meant to be copied whole. Read it beside `domains/layout/guide.md`, which holds the laws; this guide holds glass's values, recipes and decisions for them, and says where glass differs. Under any other preset, `domains/layout/guide.md` leads and this guide is only a worked example.

For mostly-text interfaces, where layout should get out of the way. One decision drives the rest: **a single 640px reading measure on every page**, so moving between pages never moves the text.

## 1. One measure

```css
.col {
  max-width: 640px;
  margin: 0 auto;
  padding: 0 32px;
}
```

At most 576px of text, roughly 75–85 characters at 16px: the top of comfortable, chosen for sustained reading. **Every page uses the class** (layout law 1).

- **Non-text content may leave the column**: a masonry image wall has no reading measure, so it goes full-bleed.
- **An article's cover image stays in it.** Bled wide, it becomes a banner *above* the article, not part of it.
- **Dividers are column width** (layout law 1).

## 2. Rails live outside the column, anchored to a wider frame

```tsx
<div className="relative mx-auto max-w-[1280px]">
  {/* Absolute, so it sits outside the reading column entirely */}
  <div className="absolute inset-y-0 left-8 hidden w-[196px] xl:block">
    <div className="sticky top-28 max-h-[calc(100dvh-11rem)] overflow-y-auto">
      <SectionNav … />
    </div>
  </div>

  <div className="col">{/* the reading column, untouched */}</div>
</div>
```

Rail and column share one centred 1280px frame, so their gap holds from 1280px up (layout law 4, which explains the absolute wrapper, the sticky child and the `dvh` cap). **`xl:block`**: below 1280px there's no margin, and the rail becomes a disclosure above the text (§6).

## 3. Spacing groups; asymmetry is the mechanism

```
mt-11  (44px)   ← heading
mb-3   (12px)
                ← the paragraph it introduces
```

~3.5:1 above to below makes them one unit (layout law 2). It holds at every scale:

| Relationship | Inner | Outer | Ratio |
|---|---|---|---|
| Heading → its paragraph | 12px below | 44px above | 3.7:1 |
| List items → the next block | 8px between | 24px below | 3:1 |
| Bio paragraphs → the links after | 16px between | 32px after last | 2:1 |
| Section heading → its content | 16–32px | 36px+ between sections | ~2:1 |

**Home sections** use `py-9` (36px each side), symmetric, since they're peers. Long pages use `mt-16 border-t pt-10` (64px, hairline, 40px): the rule marks a real change of subject.

**Glass's divider** (layout law 3): the home page rules off its three substantial sections — Work, Experience, Life — and lets the two that read as a coda to Life, Watching and Socials, follow on without a rule.

→ The full spacing scale and where each value is used: `glass/layout/measure-and-rhythm.md`

## 4. The radius ladder nests

```
rounded-full     pills, tags, dots
rounded-md    6  tooltips
rounded-[9px] 9  small cards in a stack
rounded-[10px]10 an avatar inside a button
rounded-xl   12  cards, hover panels, disclosures
rounded-[12px]12 icon buttons, highlight bars
rounded-2xl  16  the outer container (a dock, a sheet)
```

Each nesting is derived by layout law 5; the dock and the sheet are worked through in `glass/layout/radius-and-elevation.md`.

```css
* , *::before, *::after {
  corner-shape: superellipse(1.5);
}
```

Glass sets the corner shape on everything, pseudo-elements included, with no exception for pills and circles.

## 5. Hairlines: 0.5px vs 1px

| Weight | For |
|---|---|
| `0.5px` | Chrome borders, dividers, glass edges |
| `1px` | Card borders, rings, disclosure outlines |
| `2px` | Quote rules, focus rings |
| `1px` (`h-px`) | Table-of-contents markers |

Weight follows the job (layout law 6): dividing icon groups inside one dock, 0.5px; defining a card's edge, 1px. On translucent surfaces the edge is the **alpha ramp** (`border-gray-alpha-400`; see `glass/color/guide.md`).

## 6. Two presentations, not one responsive layout

Where pointer and touch interact differently, glass ships **two components** (layout law 8):

```tsx
<nav aria-label="Primary" className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center">
  <MobileDock />   {/* sm:hidden — avatar + a menu button opening a sheet */}
  <DesktopDock />  {/* hidden sm:block — hover-revealed icons, sliding highlight */}
</nav>
```

The desktop dock reveals pages and settings **on hover**, collapsing on scroll; touch fires none of it. `SectionNav` (a sticky rail) and `SectionNavCompact` (a `<details>` disclosure) likewise render one tree through a shared `Rows`.

### The same fork, chosen by the reader

Galleries offer a masonry **wall** (everything at once) or a **roll** (one photograph above a filmstrip), picked from a small dock: same data, same route. The state lives in a module both sides subscribe to, as with theme or sound:

```ts
let current: GalleryLayout = "grid";
export function setGalleryLayout(layout: GalleryLayout) {
  current = layout;
  for (const fn of listeners) fn(layout);
}
```

**The gallery layout doesn't persist** (layout law 9). The theme persists forever; the gallery layout lives in module memory and resets to the wall as each collection mounts. *The wall shows the whole collection, what you want on arrival; the roll is somewhere you go on purpose, and neither a previous visit nor the other gallery should decide it for you.* The switch opens on the photograph nearest the viewport's centre (`glass/motion/shared-element.md`), and each tile declares its own aspect ratio so one image travels between layouts undistorted.

→ Both docks, the table of contents, the gallery, the touch audit and the breakpoints in use: `glass/layout/adaptive-presentations.md`

## 7. Content gating: no empty states

One flag, three places (layout law 10):

```ts
// content/index.ts — one derivation, everything else reads it.
export const has = { writing: posts.length > 0, /* … */ };

export const sectionHasContent = { /* home-page sections */ };
/** Route path → whether it should exist. Unlisted paths always exist. */
export const routeEnabled: Record<string, boolean> = { "/writing": has.writing, /* … */ };
```

```ts
const PAGES = [
  has.experience && { to: "/experience", … },
  has.playground && { to: "/playground", … },
  has.writing    && { to: "/writing", … },
].filter(Boolean);
```

An empty collection loses its **nav icon**, **route** and **home-page entry** from one flag. On the file-based router the gate is in the page, and a catch-all sends the rest, old links included, somewhere real:

```tsx
// app/writing/page.tsx
export default function Page() {
  if (!has.writing) redirect("/");
  return <Writing />;
}

// app/[...rest]/page.tsx — anything that isn't a real route lands somewhere real.
export default function CatchAll() {
  redirect("/");
}
```

**`routeEnabled` outlived the client router**: the sitemap, metadata and nav still read it. Sections drop out *before* dividers are placed:

```tsx
const shown = site.sections.filter((name) => SECTIONS[name] && sectionHasContent[name]);
```

```tsx
// One or two folders stay folder-sized and centred rather than stretching
// across a three-up grid. (640px column − gaps) ÷ 3 ≈ 200px each.
const COLS  = ["", "grid-cols-1", "grid-cols-2", "grid-cols-3"];
const WIDTH = ["", "max-w-[200px]", "max-w-[420px]", ""];
```

Asked to shrink the folders by a quarter, shrink them and keep three to a row (layout law 8).

## 8. The z-index ladder

| z | Layer |
|---|---|
| 100 | Skip link — must beat everything |
| 60 | A once-a-session overlay — over the dock, under the skip link |
| 50 | Fixed navigation |
| 40 | Tap-outside catcher — under the nav, over the page |
| 30 | A pocket front, over its own contents |
| 20 | Hover cards, dropdowns |
| 10 | A hovered item lifting above its siblings |
| −10 | A sliding highlight, behind content inside `isolate` |

Ordered by permanence (layout law 7). The gaps paid off: a later greeting overlay took 60 without renumbering, covering the dock — or it wouldn't cover the page — but never the skip link, so keyboard users can tab past a two-second greeting. The pocket front at 30 is glass's own rung.

The nav strip spans the viewport for centring, so it passes clicks through:

```tsx
<nav className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center">
  <div className="pointer-events-auto">{/* the dock */}</div>
</nav>
```

The strip carries **no transform**, which would trap the mobile sheet's full-bleed overlay inside it (layout law 7).

→ The radius nestings, hairline classes and stacking-context code: `glass/layout/radius-and-elevation.md`

## 9. Structural accessibility

Layout law 12, in glass's markup:

```tsx
<a href="#main" className="skip">Skip to content</a>
```

- **`<nav>` labels**: "Primary", "On this page".
- **Heading levels**: `h1` page, `h2` sections, `h3` sub-sections, `h4` cards; two elements at 14px/500 can be `h3` and `h4`.
- **Menu triggers** carry `aria-haspopup` beside `aria-expanded` and `aria-controls`.

### A disclosure should hide its content, not remove it

Where a custom animation rules out `<details>`, glass collapses height to zero (layout law 11):

```tsx
<motion.div
  initial={false}
  animate={{ height: open ? "auto" : 0 }}
  inert={!open}
  aria-hidden={!open}
  className="overflow-hidden"
>
```

The content stays in the served HTML, for crawlers, `llms.txt` and find-in-page.

```css
@media print {
  nav, footer, .skip { display: none; }
  .reveal { opacity: 1; transform: none; }
  a { color: inherit; text-decoration: none; }
}
```

## Assets

- `glass/layout/assets/layout-tokens.css` — column, spacing, radius ladder, continuous corners, hairlines, skip link, print.
- `glass/layout/assets/SectionNav.tsx` — two presentations of one tree, with shared row rendering.

## Checklist

The domain checklist applies in full; these are glass's values for it.

- [ ] `.col` — 640px, 32px padding — on every page; article covers stay in it.
- [ ] Rails in the 1280px frame: `left-8`, `w-[196px]`, `sticky top-28`, `max-h-[calc(100dvh-11rem)]`, shown from `xl`.
- [ ] Prose headings `mt-11` / `mb-3`; home sections `py-9`; long pages `mt-16 border-t pt-10`, the first `mt-14`.
- [ ] Rules between Work, Experience and Life only; Watching and Socials follow on.
- [ ] Radii from the ladder: 6 / 9 / 10 / 12 / 16px and full; `superellipse(1.5)` on everything.
- [ ] 0.5px chrome, 1px object edges, 2px marks; `gray-alpha` on translucent surfaces.
- [ ] `MobileDock` / `DesktopDock` and `SectionNav` / `SectionNavCompact`, sharing data and rows.
- [ ] The gallery opens on the wall; its layout lives in module memory.
- [ ] `pb-28` under the dock on every page that can end near the viewport bottom.
- [ ] z-index on the ladder: 100 / 60 / 50 / 40 / 30 / 20 / 10 / −10.
- [ ] Dynamic Tailwind classes written as literal strings.
