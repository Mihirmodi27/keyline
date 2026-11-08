# `/keyline critique`

A designer's read of one screen, flow or component: what a reader notices first, what's working, and the few changes that would matter most. Judgement, ranked — not a checklist. For every law checked with evidence, use `/keyline audit`.

**Read:** `DESIGN.md`. Then the law headings (the `### N.` lines) of all six `domains/<domain>/guide.md` — enough to know which laws exist and cite them by number. Read a law's full text only for the two or three domains where the screen's biggest problems sit, after step 3 has found them. A critique ranks a few changes; it doesn't need every law in full, which is what `/keyline audit` is for.

**Steps:**

1. **Look at it.** Render it if you can — the running app, a preview, a screenshot through whatever browser tool you have — at a desktop and a phone width, in each theme. Read the code too, for what rendering hides (states, focus, reduced motion). If nothing can be rendered, say the critique is from code alone. With a headless Chrome and no other tool, `--screenshot --window-size=1440,900` shoots a page; dark mode needs the page's own theme switch (its `data-theme` or class) set in the URL or DOM, because Chrome's `--blink-settings` flag only gives light reliably.
2. **Name what the screen is for and who reads it**, in one sentence. Everything below is measured against it.
3. **Read it as its reader would, in order:** what the eye lands on first, second, third — and whether that order matches what matters. Then how it groups, what competes, what's missing, what's noise.
4. **Tie each problem to a law**, by domain and number (`layout law 3`), so the fix is a rule rather than a taste. Where a named UX law explains *why* the reader feels it, name that too (`layout law 13, Fitts's law`) — it tells the owner the problem is about people, not preference. The names are reasons, not a checklist: cite one only where it fits the finding.

| UX law | The reader… | Where Keyline holds it |
|---|---|---|
| Aesthetic-usability | forgives a polished screen, and overlooks its problems in testing | Here: judge the laws, not the polish — a beautiful screen still gets every check |
| Hick's law | takes longer to choose as choices grow | patterns law 8 |
| Fitts's law | hits big, near targets faster | layout law 13 |
| Jakob's law | expects this product to work like the others they use | patterns law 14 |
| Miller's law | holds only a few chunks at once | patterns law 8 |
| Doherty threshold | keeps pace with responses under ≈ 400ms | patterns law 15; motion law 3 |
| Proximity | groups what sits close | layout law 2 |
| Similarity | groups what looks alike | patterns law 3; layout law 3 (one style per device) |
| Common region | groups what shares a boundary | layout law 3 — the quietest boundary that holds, a card last |
| Visual hierarchy | reads in the order size, weight, colour and position set | type laws 3–4; layout law 2; step 3 above |
| Progressive disclosure | copes when detail arrives on request | patterns law 8; layout law 11 |
| Recognition over recall | finds seeing easier than remembering | patterns law 16; patterns law 7 (shortcuts shown where the action lives) |
| Von Restorff | remembers the one thing that differs | colour law 7; motion law 9; one primary button (patterns law 13) |
| Peak-end rule | remembers the best or worst moment and the end | patterns law 17 |
| Goal-gradient | speeds up near the goal | patterns law 17 |
| Serial position | remembers the first and last items | patterns law 3; primary destinations first in the shell (layout dials) |
| Tesler's law | shouldn't carry complexity the product can | patterns law 16 |
| Postel's law | types things in many forms | patterns law 16 |
| Occam's razor | is served by the fewest parts that do the job | motion law 1; patterns law 12; `commands/refine.md` |
| Feedback loops | needs to see every action land | patterns law 15 |

**Report:**

- **The read** — two or three sentences: what the screen gets right, and the one thing that most undercuts it.
- **Changes, most important first** — at most five. Each: what's wrong, as the reader feels it; the law; the fix in a sentence, in the project's names; and the command that makes it (`/keyline layout`).
- **Keep** — what's working and shouldn't be touched by the fixes.

Don't pad to five. Don't list what's fine as a problem to fix. **Changes no code.**
