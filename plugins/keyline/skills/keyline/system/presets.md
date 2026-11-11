# Presets

The laws in each domain guide hold under every preset. What a preset changes is the **dials**: how far the type scale may climb, how many weights there are, how much colour is spent and where, how long motion runs, how much of the page is allowed to be loud.

A preset is a starting character, not a costume. Pick the one whose *reader* matches the project's reader, record it in `DESIGN.md`, and then override individual dials where the project has a reason to. The override goes in the file with its reason — a dial moved without a reason is how a system turns back into a pile of values.

Each domain guide owns the numbers for its own dials, in its `## Dials` section. This file only sets the character and says, in a line per domain, what that character means. When the two ever disagree, the guide wins, and this file is the one to fix.

## How to pick

Ask what the reader is doing.

| If the reader is mostly… | Preset |
|---|---|
| Reading — articles, docs, a portfolio, a changelog, anything where the text is the product | `editorial` |
| Working — scanning, comparing, entering data, coming back every day | `product` |
| Being persuaded — landing pages, launches, campaigns, a brand site seen once | `expressive` |
| Wanting modimihir.com's exact system, values and components included | `glass` |

Mixed projects are normal. A SaaS app with a marketing site and docs is `product` with two areas overridden: the marketing routes `expressive`, the docs `editorial`. Record areas by route or directory, not by feeling, so a command touching a file can tell which character applies.

When the evidence doesn't settle it, propose one, say what evidence you used, and ask. Don't guess silently — the preset shapes every later decision.

## `editorial`

*The interface should disappear so the reading doesn't.* Restraint is the point, and a single loud moment reads as craft because nothing else competes with it.

- **Type** — a dense ladder that keeps the reading loudest.
- **Colour** — near-monochrome, the accent spent on focus.
- **Layout** — one reading measure every page shares.
- **Surfaces** — mostly flat; translucency, if any, only on chrome.
- **Motion** — short, and only where it makes a change legible.

## `product`

*The interface is a tool, and the reader is fluent in it.* Density, predictability and scannability beat atmosphere. Signal has to survive a screen full of data.

- **Type** — tighter, smaller steps; UI and data roles dominate.
- **Colour** — near-monochrome with a real status palette, and one accent hue that acts.
- **Layout** — an app shell rather than a single measure; tighter spacing, still grouped.
- **Surfaces** — content on the page, rows parted by hairlines; a card only for one object.
- **Motion** — shortest of the three; nothing delays a repeated action.

## `expressive`

*The interface is making an impression, usually once.* Scale, colour and motion are allowed to carry brand — but still by rule, or it turns into a template.

- **Type** — a real display tier far above body, possibly a second family.
- **Colour** — a brand palette used broadly, each colour placed by rule.
- **Layout** — sections may go full-bleed; paragraphs keep the measure.
- **Surfaces** — depth, gradients and translucency as brand material, each with its fallback.
- **Motion** — longer and more characterful on entrances; exits still get out of the way.

## `glass`

The Glass preset's exact values: `editorial` in character, with every dial already decided on [modimihir.com](https://modimihir.com). Offer it only when the user wants that system itself rather than their own — `/keyline init` copies its values from the tables in each `glass/<domain>/guide.md` into `DESIGN.md`, in the project's own names wherever the project already has names, and each guide supplies the exact recipes, with drop-in token files and components under its `assets/`.

A `glass` project can still override a dial. It should expect to: the Glass values were chosen for one text-heavy portfolio, and a project that isn't one will find the places they don't fit.
