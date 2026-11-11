# The intent-indexed ramp

Each Glass step, what it's for and how it was misused. Why a ramp indexed by job beats one indexed by lightness: domain law 1 in `domains/color/guide.md`.

## The steps

### 100 · 200 · 300 — surface and its states

A raised element's background, hover and pressed state: three states, one step apart, so the progression stays even.

- **100** is also a general subtle surface — an image wall's backdrop, a cover placeholder, a hover bar in a list.
- **200** also fills a small static thing that should read as an inert placeholder (faux body lines in a preview card).
- **300** also fills a small structural mark, such as a preview card's title bar.

### 400 — border

The default border, one of the two most-used steps.

**In light mode, 400 (`#eaeaea`) is lighter than 300 (`#e6e6e6`)** (domain law 1). The two are never adjacent in practice, so nothing looks wrong.

On anything translucent, use `gray-alpha-400` instead (§2 of `glass/color/guide.md`).

### 500 · 600 — border states (and where icons used to go)

500 is a hovered border, 600 an active one.

**600 used to be the resting colour of an icon, and that was a bug.** An icon should rest a tier below the label beside it, so `hover:text-gray-1000` gives both the same perceived jump — but 600 is 2.38:1 on white in the light theme, under even the 3:1 non-text floor (table below). Icons now rest on `quiet`, keeping the one-tier-below relationship on a token picked for contrast; see §4 of `glass/color/guide.md`.

500 was where the reference implementation put its **faint text** tier — timestamps, dates, read times. `#c9c9c9` on white is 1.66:1: illegible, below even the 3:1 non-text floor. Text tiers are now separate tokens (below).

500 keeps its border-hover intent and its use as the fill for *decorative* marks (list bullets, a 3px dot, an inactive rail marker).

### 700 · 800 — solid fill

A filled element that isn't the primary action: a small marker, a filled chip.

The reference implementation also used **800 as its muted text tier** — deks, secondary paragraphs, `<em>`, supporting copy. `#7d7d7d` on white is **4.12:1**, which **fails** WCAG AA for normal text (4.5:1). It was the site's most-used text colour, and it failed everywhere in the light theme. An earlier version of this file put it at "about 4.6:1"; computed, it's 4.12:1 (domain law 3).

### 900 — secondary text

Emphasised but not primary: a role title above its description, an ancestor row in a table of contents (the section you're inside while a child row is active), body copy where primary would be too heavy.

The gap between 900 (`#4d4d4d`) and 1000 (`#171717`) is deliberately large: secondary should be clearly a step down, not almost-primary.

### 1000 — primary text

Body copy, headings, active states, `<strong>`. `#171717`, not `#000000` (domain law 8).

Also the *fill* for an inverted element: a tooltip is `bg-gray-1000` with `text-background-100`.

**Not for a ticked box in a long list** (`domains/color/status-and-exceptions.md`, **Done, and where the reader is**). Glass's ticked box is a `gray-100` square on its 400 border with a `gray-1000` tick; a switch keeps the inverted fill.

### background-100 · background-200

Held out of the ramp because a page background is categorically different from a component surface. 100 is the page and card surface; 200 a subtle secondary surface.

`background-100` is also the **text** colour for anything inverted, which is why it's a token rather than a hardcoded white: a tooltip's text has to become near-black in the dark theme, and does so for free.

## Dark-mode re-tinting

The values are the dark block of `glass/color/assets/color-tokens.css`.

**It's not an inversion** (domain law 8). Inverting the light ramp would put 100 at `#0d0d0d` and 1000 at `#e8e8e8`, evenly spaced. The real dark ramp is *compressed at the bottom* (100→400 spans only `#1a1a1a`→`#2e2e2e`, twenty units) and *expanded in the middle* (400→500 jumps forty units), because dark surfaces must stay distinguishable at very low lightness, where the eye is more sensitive to small differences, while mid-greys need a big jump to separate "border" from "text."

**700 is identical in both themes** (`#8f8f8f`): a mid-grey solid fill needs the same value either way, the one step where semantic and value coincide.

**The step order stays monotonic in dark mode** (400 `#2e2e2e` > 300 `#282828`). No contradiction: the constraint is the *intent*, and in dark mode a slightly lighter border also happens to be the right lightness order.

Low steps are surfaces and high steps are text in both themes, so `border-gray-400` is a border in light and dark, with no `dark:` variant.

## Borders and text are different jobs

The hardest-won rule here (domain law 2), from auditing the reference implementation against this guide's own checklist. In the light theme:

| Step | Light value | As text on white | Verdict |
|---|---|---|---|
| 500 | `#c9c9c9` | 1.66:1 | illegible |
| 600 | `#a8a8a8` | 2.38:1 | fails even the 3:1 non-text floor |
| 700 | `#8f8f8f` | 3.23:1 | fails |
| 800 | `#7d7d7d` | 4.12:1 | fails |
| 900 | `#4d4d4d` | 8.45:1 | passes |
| 1000 | `#171717` | 17.93:1 | passes |

Against the near-black page the same indices pass — 800 is 7.53:1, 700 is 6.09:1 — so a system reviewed in dark ships this light theme.

### The fix: text tiers as their own tokens

`muted`, `quiet` and `faint`, per theme, are in `glass/color/assets/color-tokens.css`; their jobs are §4 of `glass/color/guide.md`.

**Every tier clears 4.5:1 in both themes**, including the worst real pairing: muted on `gray-100`, a subtle surface, at 5.79:1.

**The ladder stays strictly descending** (domain law 3) — 17.93 / 8.45 / 6.48 / 5.49 / 4.61 in light, 16.81 / 11.28 / 7.53 / 5.48 / 4.59 in dark.

**Only `faint` moved much in dark mode.** `muted` keeps the old 800 value, which already passed there: the failure was overwhelmingly a light-theme one.

## Common failures

**A surface step as a border.** `border-gray-200` looks fine in light mode and vanishes in dark, where 200 is a dark surface nearly flush with 100.

**A text step as an icon.** `text-gray-900` on a 20px icon reads as heavy as primary text and pulls focus off the label. Use `quiet`.

**A border step as text.** The one this guide got wrong for a whole revision (above).

**"Something between 500 and 600"**, and **auditing contrast in dark mode only**: domain laws 1 and 3. Here the worst surface is a subtle `gray-100`, not `background-100`.
