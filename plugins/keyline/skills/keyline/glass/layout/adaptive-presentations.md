# Adaptive presentations

Glass's forks, views and breakpoints, for layout laws 8, 9 and 11; the fork test, capability queries, the touch audit and container breakpoints in general are in `domains/layout/forks-gating-and-disclosures.md`.

## Case 1: the navigation dock

```tsx
export function BottomNav() {
  return (
    <nav aria-label="Primary"
         className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center">
      <MobileDock />    {/* sm:hidden  */}
      <DesktopDock />   {/* hidden sm:block */}
    </nav>
  );
}
```

**`DesktopDock`** — icon buttons with a shared sliding highlight and tooltip; hovering an arrow opens a settings drop-up. Scrolling down collapses it to the avatar; hovering, scrolling up, or reaching either end of the page expands it.

**`MobileDock`** — the avatar and a menu button opening a drop-up sheet: pages as text rows, then socials, sound and theme. Toggling a preference leaves the sheet open; navigating or tapping outside closes it.

Almost nothing is shared, because every desktop interaction is hover-driven and touch fires none of them:

| Behaviour | Desktop | Mobile |
|---|---|---|
| Reveal pages | Always visible, collapse on scroll | Inside a sheet |
| Reveal settings | Hover an arrow | A row in the sheet |
| Item feedback | Sliding highlight + tooltip | `active:bg-highlight` |
| Labels | Tooltip on hover | Text in the row |
| Collapse on scroll | Yes | No — nothing brings it back |
| Press feedback | `active:scale-[0.92]` | `active:scale-[0.92]` |

What *is* shared is extracted — the destinations array, the icons, the preferences hook:

```tsx
function useNavPrefs() {
  const [soundOn, setSoundOn] = useState(true);
  const [theme, setTheme] = useState<ThemeChoice>(getThemeChoice);
  // …
  return { soundOn, setSound, theme, pickTheme, sync };
}
```

The collapse-on-scroll effect bails out entirely unless `(hover: hover) and (pointer: fine)` matches, so touch never attaches the listener (layout law 8).

### The `sync` subtlety

Both docks are always mounted (hidden by CSS), each with its own copy of the preferences, so a change in the desktop settings box before the viewport crossed the breakpoint would leave the mobile sheet showing a stale toggle.

```tsx
const toggle = () => {
  if (!open) sync();     // re-read the stored values as the sheet opens
  setOpen((o) => !o);
};
```

The desktop panel needs no equivalent: it *mounts fresh* on open and reads the values then, whereas the mobile trigger lives in the always-present dock, so its state outlives the panel.

## Case 2: the table of contents

Same tree, two containers, shared row rendering: `glass/layout/assets/SectionNav.tsx`. Both are rendered and CSS picks one — the rail in the 1280px frame from `xl` (§2 of the guide), the compact `<details>` above the article below that (`reveal mt-8 xl:hidden`). The props are memoised so both get one stable object:

```tsx
const nav = useMemo(() => ({ nodes: toc, active, onJump: jump }), [active, jump]);
```

The compact version is a `<details>` (layout law 11), and costs **one line** above the article, which is what makes a nav in the reading flow acceptable.

## Case 3: two views of one collection, chosen by the reader

The first two cases fork on a *device* capability; the gallery's **wall** and **roll** fork on a preference. The interaction model changes, not just the arrangement (layout law 8).

### The state can't live in either component

The control and what it controls are siblings, so a module store owns the value (its code is §6 of the guide), mirrored in a hook:

```ts
// Mirror it in a hook. Read in an EFFECT, not during render: on a
// server-rendered page the module and the server agree on "grid" for a fresh
// load, but arriving from another gallery with "roll" already picked would
// have the client's first paint disagree with the markup.
export function useGalleryLayout() {
  const [layout, setLayout] = useState<GalleryLayout>("grid");
  useEffect(() => {
    setLayout(getGalleryLayout());
    return onGalleryLayoutChange(setLayout);
  }, []);
  return { layout, pickLayout: setGalleryLayout };
}
```

### The choice doesn't persist

The theme persists to `localStorage` forever; the gallery layout lives in module memory, so a fresh load, a reload and a move between galleries all open on the wall (layout law 9; the reason is in §6 of the guide).

### The switch carries the position

Find the item nearest the viewport's centre before the outgoing layout unmounts and open the incoming one there — the measurement is `centreFrame` in `glass/motion/shared-element.md`.

### Each tile declares its own aspect ratio

```tsx
<figure style={{ aspectRatio: `${photo.w} / ${photo.h}` }}>
```

Nothing is cropped, so `object-cover` has nothing to do; nothing shifts on load; and one image travels between layouts undistorted, because both ends compute to the same shape.

## The touch-versus-hover audit

Glass's answers to the audit in `domains/layout/forks-gating-and-disclosures.md`:

| Hover behaviour | Touch equivalent |
|---|---|
| Icon label as a tooltip | Text label in the sheet |
| Settings box on hover | A row in the sheet |
| Company card on row hover | Sits below the row instead of beside it, at a wider breakpoint |
| Folder cards rising | Not available — but the folder is still a link to the same page |
| Dock collapse on scroll | Doesn't happen |

The folder-card lift is the honest case: a delight beat carrying no information, so touch users lose nothing they need.

## Where responsive utilities are still right

Arrangement, not interaction:

```tsx
"grid gap-4 sm:gap-6 grid-cols-3"           // grid density
"columns-3 gap-1 sm:columns-4"              // masonry columns
"pt-28 sm:pt-20"                            // page padding under fixed chrome
"absolute left-3 right-3 top-full … xl:left-full xl:top-1/2 xl:ml-6 xl:w-60"
```

The last is a hover card *below* its row on narrow screens and *beside* it at `xl`, where there's finally margin: only position moves, so it's correctly a breakpoint.

## Breakpoints in use

| Breakpoint | Width | What changes |
|---|---|---|
| `sm` | 640px | Mobile dock ↔ desktop dock. Page padding. Masonry columns. Stack columns. |
| `xl` | 1280px | The TOC rail appears. The hover card moves beside its row. |

Two for the whole site, both derived from content. Both are viewport breakpoints only because here the column *is* the page. `sm` coincides with the reading measure: below it the column is padding-limited, the natural place for the layout to change character. `xl` is where a 640px column finally leaves margin for a 196px rail. Type size is *not* on the list (`glass/type/scale.md`).

Glass uses no container breakpoints; where a pane shares the screen with something that opens and closes, see `domains/layout/forks-gating-and-disclosures.md`.
