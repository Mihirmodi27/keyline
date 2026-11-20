# `/keyline audit`

An interface inspected as a reader meets it and as its code is written: what the eye lands on first, which laws it breaks, and the evidence for each. The target sets how far it goes:

- **One screen** — a route, file, component or flow is named, or the conversation is about one screen: a designer's close read, in chat. What the reader notices first, what's working, the few changes that matter most, ranked, each tied to a law, a score out of 10, and what it would take to reach 8–9. Follow **One screen** below.
- **The whole product** — nothing is named and no screen is in view, or the user asks for the app, the site, every page: every page at desktop and phone, light and dark, every law checked with evidence, AI slop and accessibility included, scored out of 10 and per domain, and written up as one report a person can read, filter and share. Follow **The whole product** below.

Both end with a score out of 10 (below) and a **To reach 8–9** section: 8 is the bar a screen clears before it ships, and `polish` works towards it in rounds.

Say which in your first line ("Auditing `/settings` as one screen"), so the user can widen or narrow it. `/keyline critique` and "review this" are this command on one screen.

**Changes no code.** It reports, and writes its findings into `DESIGN.md`.

## Decisions already made

Read `## Decisions` in `DESIGN.md` and `.keyline/decisions.json` before you raise anything. What they keep is settled: the detector and the report already leave those findings out, and your own read never raises them again, in any words. When a finding of yours would undo a recorded decision, say that instead, naming it: *"this conflicts with k3 (capitals on the eyebrow); the reason given was the brand guideline"*. Only the user can drop a decision.

A decision outlives the report, so only the user makes one. When they say a finding is deliberate, record it in their words: `npx trykeyline keep <file:line or report id> --reason "<their words>"` (or `node <keyline>/scripts/keep.mjs`). Never record one on your own judgement, and never to clear a finding you couldn't fix: a kept finding no longer counts against the score. A contrast failure on text can't be kept. Dismissing a finding inside this report (step 4 below) holds for this report alone.

## The score out of 10

One number a person reads first, in half points. Score what a reader meets, not the effort that went in.

| Score | Means |
|---|---|
| 10 | Nothing a careful designer would change |
| 9 | Every law holds; what's left is taste |
| 8 | **Ready to ship.** No reader meets a broken law: small strays at most, nothing a reader would notice |
| 7 | Close: one law a reader feels, in one place |
| 5–6 | Works, but a reader feels the faults: several laws broken, or one broken everywhere |
| 3–4 | Broken for someone: text they can't read, a control they can't reach, a button that does nothing |
| 1–2 | Broken across the board |

**Caps.** Evidence holds the score down whatever the judgement says. Never score above the lowest cap that applies:

- **6** while any error is open: broken for someone, whether the audit, the smoke test or your own read found it. Text that fails contrast is always one.
- **7** while a law a reader feels is broken: any open warning (a machine warning you judge wrong is dismissed, with the reason, not ignored), and on the whole product any domain scoring 2.
- **5** while a domain isn't working as a system: on the whole product, any domain scoring 0 or 1.
- **7** when the score comes from the code alone. What the reader sees hasn't been looked at.

**A re-score is a fresh look.** After changes, render and measure again, the same way as the first time. Don't tick off the list of what was changed. A change that didn't land, or a finding that comes back, earns nothing. Each half point gained names what earned it.

**To reach 8–9** is the path, not a repeat of the findings:

- which changes clear which cap, and in what order (polish order unless a cap says otherwise);
- the command that makes each one;
- the score you expect after them;
- anything that needs the owner's call because no law settles it: a dial off the preset, the brand colour, a feature.

At 8 or above, the section is **To reach 9**, or says what keeps it from 10 when that's taste.

## One screen

**Read:** `DESIGN.md`. Then the law headings (the `### N.` lines) of all six domain guides — enough to know which laws exist and cite them by number: `grep -n '^### [0-9]' <keyline>/domains/*/guide.md`. Read a law's full text only for the two or three domains where the screen's biggest problems sit, after step 3 has found them: `awk '/^## /{p = /^## Laws/} p' <keyline>/domains/<domain>/guide.md`. A screen audit ranks a few changes; it doesn't need every law in full.

**Steps:**

1. **Look at it.** Render it if you can — the running app, a preview, a screenshot through whatever browser tool you have — at a desktop and a phone width, in each theme. Read the code too, for what rendering hides (states, focus, reduced motion). If nothing can be rendered, say the audit is from code alone. With a headless Chrome and no other tool, `--screenshot --window-size=1440,900` shoots a page; dark mode needs the page's own theme switch (its `data-theme` or class) set in the URL or DOM, because Chrome's `--blink-settings` flag only gives light reliably. To measure as you look, `npx trykeyline audit --base <url> --quick --routes <path>` shoots the page at both widths and lists what it measured (contrast, names, targets, sizes, slop) in `keyline-report/`, and `node <keyline>/scripts/check.mjs --root <project root> --json <the screen's files>` adds the detector's findings with file and line. Use both as evidence, not as the read.
2. **Name what the screen is for and who reads it**, in one sentence. Everything below is measured against it.
3. **Read it as its reader would, in order:** what the eye lands on first, second, third — and whether that order matches what matters. Then how it groups, what competes, what's missing, what's noise.
4. **Tie each problem to a law**, by domain and number (`layout law 3`), so the fix is a rule rather than a taste. Where a named UX law explains *why* the reader feels it, name that too (`layout law 13, Fitts's law`) — it tells the owner the problem is about people, not preference. The names, and where Keyline holds each, are in `commands/ux-laws.md`.
5. **Score it** out of 10, as **The score out of 10** says: the anchor first, then the caps.

**Report:**

- **The read** — two or three sentences: what the screen gets right, and the one thing that most undercuts it.
- **Changes, most important first** — at most five. Each: what's wrong, as the reader feels it; the law; the evidence where there is a measurement (a ratio, a size, a `file:line`); the fix in a sentence, in the project's names; and the command that makes it (`/keyline layout`).
- **Keep** — what's working and shouldn't be touched by the fixes.
- **Score** — `7/10`, its anchor's words, and the cap holding it down, if one does.
- **To reach 8–9** — as **The score out of 10** says.

Don't pad to five. Don't list what's fine as a problem to fix. No HTML report for one screen: that's the whole product's.

**Write back:** each change that names a law goes under `## Open issues` in `DESIGN.md`, one line with its evidence, replacing entries for this screen now fixed.

## The whole product

**Read:** `DESIGN.md`; `system/reports.md` (the target, the two ways to drive a browser, the report format); the `## Auditing existing code` and `## Checklist` sections of every `domains/<domain>/guide.md` (all six unless the user narrows it), and under preset `glass` each `glass/<domain>/guide.md` checklist.

**Areas.** When `## Profile` lists areas, judge each page by its own: the runner writes each page's `preset` (and `area`) into `findings.json`, from its source file or its route. A marketing page on `expressive` is held to that preset's dials, not the product's.

**Pages beside their siblings.** The runner records each page's look as rendered (fonts, sizes, weights and the h1; text and surface colours; corners, gaps, insets and the reading width) and compares it with its siblings: the pages in the same area and the same section (`/docs/*`), or, for a top-level page, the other top-level pages. The home page is compared with nothing. A value a page uses again and again that none of its siblings use comes back as `type/stray-page`, `color/stray-page` or `layout/stray-page`, a note with the stray values and the siblings named. Look at the page beside one sibling before judging: a stray that's a mistake goes to the domain's command; a page that is a different kind of thing (a pricing table among articles) is the user's call, and if they say so it becomes an area in `DESIGN.md` or a kept decision, never a fix.

**Steps:**

1. **Find the target** as `system/reports.md` says: the URL the user named, the dev server already running, or the project's own dev script started in the background. A static build is served with `--serve <dir>`. Without anything to render, say the audit is from code alone and skip to step 3.

2. **Measure every page.** With Keyline's runner:

   ```sh
   npx trykeyline audit --base <url> --root <project root> [--title "<product>"]
   ```

   It finds the pages (router files, sitemap, crawl), visits each at desktop and phone in light and dark, and measures inside the rendered page:
   - **Accessibility:** controls with no name, images with no alt, missing landmarks, `lang` and headings, tap targets under 24px.
   - **Contrast:** every run of text against what's actually behind it, in each theme.
   - **Layout:** sideways scroll on a phone, text cut off.
   - **Type:** the sizes and weights actually rendered, text under 12px, lines too long.
   - **Copy:** placeholder text, interjections, "we" in errors, vague labels.
   - **AI slop:** stock phrases, placeholder brands, gradient headlines, purple gradient panels, glass everywhere, emoji bullets, eyebrows on every heading, grids of identical boxed cards.

   It adds the detector's findings from the source with file and line, drafts a score per domain, and writes `keyline-report/`. Pages are shot with reduced motion so they show their settled state; pass `--motion` to audit a first visit as it plays. A page behind sign-in, or a route that needs an example ID, follows `system/reports.md`.

   **With the agent's own browser instead**, visit the same pages at the same widths and themes, run the same checks with the browser's JavaScript evaluation (`npx trykeyline probe audit` prints the runner's checks as one expression to paste into it; pass `--arg '{"viewport":"phone","theme":"dark","firstPass":false}'` for each later pass; it fetches no browser), and write `findings.json` by hand. Then run the detector (`node <keyline>/scripts/check.mjs --root <project root> --json`) and add its findings.

3. **Read what the machine can't.** Open the screenshots in `keyline-report/shots/` and the code, and judge, domain by domain in polish order, with each guide's audit section:
   - hierarchy, and what the eye lands on first;
   - grouping, and whether a box should exist at all;
   - one style per kind of thing (one table style, one chip shape);
   - states: empty, loading, error, long text and none (patterns laws 9, 15, 16);
   - whether the copy keeps one voice (patterns law 23);
   - whether the page looks designed for its reader or assembled from a template.

   Add each as a finding in `findings.json` (format in `system/reports.md`): `kind: "audit"`, the domain, a rule id of your own (`layout/hierarchy`, `states/empty-missing`, `slop/template-feel`), the law, the page, a `selector` for the element whenever there is one, and a `shot` and `box` when you can point at it. The selector is how the next run, `--compare` and a recorded decision know it's the same finding; a title alone stops matching the moment it's worded differently. Where a UX law explains why the reader feels it, name it in `detail` (`commands/ux-laws.md`).

4. **Judge the machine's findings too.** A measurement is a lead, not a verdict. A finding that is right by the numbers but wrong for this product gets `status: "dismissed"` with the reason in `detail`. Examples: an uppercase eyebrow under the `expressive` preset, which allows them; small text inside an illustration; a tap target the user has accepted. Never dismiss a contrast failure on text people read. A finding the report already marks `decided` is kept by a recorded decision: leave it as it is.

5. **Score each domain** 0–4 and replace the draft in `scores`:

   | Score | Means |
   |---|---|
   | 4 | Every law holds; nothing to report |
   | 3 | Small strays — a handful of one-off values, nothing a reader would notice |
   | 2 | A law broken in a way a reader feels — a hierarchy inversion, a failed contrast tier, a box around everything |
   | 1 | Several laws broken across templates; the domain isn't working as a system |
   | 0 | No system: values typed inline, nothing on a ladder |

   Then **settle the score out of 10** in `score`. The runner drafts it as 2 + 2 × the mean of the domain scores, so all 3s is 8, held under the caps. Move it by judgement within **The score out of 10**, never above a cap. Set `scoresDraft` to `false`. The report shows the score above the domain table, with the caps holding it and, when an earlier run in the same folder covered the same pages, the trail (`6 → 7.5 → 8.5`). A score settled above its caps is flagged there. A runner older than 0.3 writes no `score`: work it out the same way, write it into `findings.json` as `score`, and give it in chat.

6. **Write the summary**, `summary` in `findings.json`: one paragraph a person reads first, written as the one-screen read is, for the whole product. Say what a visitor feels, the three things that matter most, what's working that the fixes shouldn't touch, and the order to fix in (usually the lowest score first, unless a law in another domain blocks it).

7. **Render and hand over:**

   ```sh
   npx trykeyline report keyline-report
   ```

   Look at `index.html` yourself before giving it to the user; publishing it and `.gitignore` follow `system/reports.md`.

8. **Write back:** every open finding that names a law goes under `## Open issues` in `DESIGN.md`, one line each with its evidence, replacing entries now fixed.

**Report** in chat, kept short; the detail is in the report. Give:
- the summary paragraph;
- the score out of 10, with the cap holding it down, and the domain table;
- the worst five findings, one line each with evidence and law;
- **To reach 8–9**;
- the path to (or link for) the report.

**No `DESIGN.md` yet** (stage 1 of the flow in `SKILL.md`): audit from the code. Both targets run as written. Choose the preset the reader points to (`system/presets.md`) and say which you assumed and why. The detector has no preset to read, so its preset rules fall back to their neutral verdicts; judge those findings, and score the dials, against the preset you assumed. The score out of 10 is unaffected: it scores what the reader meets. Skip the write-back steps: there's no file yet, and `init` records these findings as its open issues.

**Next** (format in `SKILL.md`, `## The flow`): with no `DESIGN.md`, `init`, so the findings are kept and the fixes land in the project's names. With one, below 8: for one screen, `polish` on that screen, which works in rounds until it reaches 8; for the whole product, `polish --from keyline-report`. At 8 or above, the **To reach 9** change's own command, or `audit` on a screen no report has covered.
