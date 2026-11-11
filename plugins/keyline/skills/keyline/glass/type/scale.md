# The scale, derived

Why the ladder in `glass/type/guide.md` looks the way it does, and how to extend it without wrecking it. The case against modular scales, and the general method for adding and cutting roles, are in `domains/type/ladders.md`.

## Role-first

A modular scale gives too few sizes in the 11–16px band, where Glass needs 11, 12, 13, 14 and 16 — tooltip, tag, timestamp, nav row and paragraph are five jobs at five densities — and hands out 22, 27 and 34 above an 18px ceiling. Every size here exists because a specific piece of the interface needs it. Grouped by where they appear:

**Content — one measure, top to bottom**
- 18px index-page title, the largest role: `/writing`, `/work`, `/experience`, `/resume`, `/skills`, a skill's own page. It labels a collection, and it's the only place tracking goes to −0.02em.
- 16px everything structural — a detail page's title, a section heading, a prose heading. Three roles, separated by leading (1.3 for a wrapping title, 1.2 for a heading) and position.
- 14px everything read — body, lead, keyline, pull quote, dek, sub-headings. Six roles at one size, where the system does its real work; §1 of `glass/type/guide.md` tabulates how they stay apart.
- 13.5px summary lines. The half-pixel is deliberate: a collapsed summary is read once, deciding whether to continue — a hair above the note tier, below the body it summarises. Use half-steps at most once.
- 13px the apparatus — notes, captions, citations, facts, meta, back links.

**Chrome — dense, scannable**
- 12.5px code. Monospace runs wide, so it steps down to occupy the same measure as the prose around it — the one size that compensates for a *family* rather than a role.
- 12px. Tags, prev/next labels, hover-card titles; small enough to read as annotation.
- 11px. Tooltips and avatar initials. The floor for anything a user is expected to read.
- 8.5px lettermarks, 7.5px card lettering. Below the floor on purpose — recognised rather than read (the 600 exception: §2 of the guide).

**What was deleted**

An earlier ladder had 30, 19, 17 and 15. All four are gone, cut from the top down (domain law 1):

| Size | Was | Why it went |
|---|---|---|
| 30 | Article title | Two templates opening two steps above every other page. Now 16. |
| 19 | Prose heading, pull quote | Came down with the title — an in-body heading can't outrank the page's own. Now 16 and 14. |
| 17 | Article dek | Existed only to sit between 30 and 16; with both gone, no gap to fill. Now 14, muted. |
| 15 | `<body>` base | A default nothing used explicitly — a size waiting to be used by accident. |

## Adding a role

Ask the three questions in `domains/type/ladders.md`. Here the first — can an existing size take it with different leading or weight? — is the answer 80% of the time: 14px carries four roles this way.

## The 1–2px step

In the 11–16px band the steps are 1px, and that is enough (`domains/type/ladders.md`, **Small steps are not small**): a 13px meta line and a 14px paragraph are told apart mostly by faint against primary, and position. Above 16px there is one step, 18, where the ladder stops — the system's most consequential choice; §1 of `glass/type/guide.md` argues it.

## Responsive behaviour

**Nothing resizes.** The 30px article title used to drop to 26px below `sm`, because in a ~311px phone column it wrapped to three lines; at an 18px ceiling the rule went with the size. Why fixing the ladder beats tuning a breakpoint, and why sizes hold on a phone: `domains/type/ladders.md`, **Viewports**.

## Fixed sizes, not `rem`, and why that's a choice

The reference implementation uses `px` throughout (`text-[14px]`, not `text-sm` or `0.875rem`), to keep the 1px steps of the 11–16 band exact under a scaled root; the trade is the domain's unit dial. Moving to `rem`, convert at a fixed 16px root: 18px → 1.125rem, 14px → 0.875rem, 13px → 0.8125rem.

## Keeping every element on it

Every type change ends in the sweep in `domains/type/type-audit.md`: every route, raw sizes moved onto role tokens, the same element checked across pages. Glass's role names, registered with `tailwind-merge` so `cn()` doesn't file `text-copy` as a colour and drop it:

```ts
import { extendTailwindMerge } from "tailwind-merge";

export const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["page", "section", "copy", "summary", "dense", "code", "micro", "tip", "mark", "card"] }],
    },
  },
});
```

Then check the *rendered* size of one element per role, not the source: the class can be written there and never reach the markup.
