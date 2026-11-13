# `/keyline critique`

A designer's read of one screen, flow or component: what a reader notices first, what's working, and the few changes that would matter most. Judgement, ranked — not a checklist. For every law checked with evidence, use `/keyline audit`.

**Read:** `DESIGN.md`. Then the law headings (the `### N.` lines) of all six domain guides — enough to know which laws exist and cite them by number: `grep -n '^### [0-9]' <keyline>/domains/*/guide.md`. Read a law's full text only for the two or three domains where the screen's biggest problems sit, after step 3 has found them: `awk '/^## /{p = /^## Laws/} p' <keyline>/domains/<domain>/guide.md`. A critique ranks a few changes; it doesn't need every law in full, which is what `/keyline audit` is for.

**No `DESIGN.md` yet** (stage 1 of the flow in `SKILL.md`): critique from the code. Name things by the project's own tokens and components, choose the preset its reader points to (`system/presets.md`), and say in the read which you assumed and why. The numbers for its dials are in each guide's `## Dials`, under that preset's column: `awk 'FNR==1{p=0; print "== " FILENAME} /^## /{p = /^## Dials/} p' <keyline>/domains/*/guide.md`.

**Steps:**

1. **Look at it.** Render it if you can — the running app, a preview, a screenshot through whatever browser tool you have — at a desktop and a phone width, in each theme. Read the code too, for what rendering hides (states, focus, reduced motion). If nothing can be rendered, say the critique is from code alone. With a headless Chrome and no other tool, `--screenshot --window-size=1440,900` shoots a page; dark mode needs the page's own theme switch (its `data-theme` or class) set in the URL or DOM, because Chrome's `--blink-settings` flag only gives light reliably.
2. **Name what the screen is for and who reads it**, in one sentence. Everything below is measured against it.
3. **Read it as its reader would, in order:** what the eye lands on first, second, third — and whether that order matches what matters. Then how it groups, what competes, what's missing, what's noise.
4. **Tie each problem to a law**, by domain and number (`layout law 3`), so the fix is a rule rather than a taste. Where a named UX law explains *why* the reader feels it, name that too (`layout law 13, Fitts's law`) — it tells the owner the problem is about people, not preference. The names, and where Keyline holds each, are in `commands/ux-laws.md`.

**Report:**

- **The read** — two or three sentences: what the screen gets right, and the one thing that most undercuts it.
- **Changes, most important first** — at most five. Each: what's wrong, as the reader feels it; the law; the fix in a sentence, in the project's names; and the command that makes it (`/keyline layout`).
- **Keep** — what's working and shouldn't be touched by the fixes.

Don't pad to five. Don't list what's fine as a problem to fix.

**Next** (format in `SKILL.md`, `## The flow`): with no `DESIGN.md`, `init`, so the fixes land in the project's names and these findings are kept as open issues. With one, the command the top change names, on this screen; `polish` when the changes span two or more domains.
