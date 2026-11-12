# `/keyline audit`

An interface inspected as a reader meets it and as its code is written: what the eye lands on first, which laws it breaks, and the evidence for each. The target sets how far it goes:

- **One screen** — a route, file, component or flow is named, or the conversation is about one screen: a designer's close read, in chat. What the reader notices first, what's working, and the few changes that matter most, ranked, each tied to a law. Follow **One screen** below.
- **The whole product** — nothing is named and no screen is in view, or the user asks for the app, the site, every page: every page at desktop and phone, light and dark, every law checked with evidence, AI slop and accessibility included, scored per domain and written up as one report a person can read, filter and share. Follow **The whole product** below.

Say which in your first line ("Auditing `/settings` as one screen"), so the user can widen or narrow it, and end either one as **Ask before you stop** says. `/keyline critique` and "review this" are this command on one screen.

**Changes no code.** It reports, and writes its findings into `DESIGN.md`.

## One screen

**Read:** `DESIGN.md`. Then the law headings (the `### N.` lines) of all six domain guides — enough to know which laws exist and cite them by number: `grep -n '^### [0-9]' <keyline>/domains/*/guide.md`. Read a law's full text only for the two or three domains where the screen's biggest problems sit, after step 3 has found them: `awk '/^## /{p = /^## Laws/} p' <keyline>/domains/<domain>/guide.md`. A screen audit ranks a few changes; it doesn't need every law in full.

**Steps:**

1. **Look at it.** Render it if you can — the running app, a preview, a screenshot through whatever browser tool you have — at a desktop and a phone width, in each theme. Read the code too, for what rendering hides (states, focus, reduced motion). If nothing can be rendered, say the audit is from code alone. With a headless Chrome and no other tool, `--screenshot --window-size=1440,900` shoots a page; dark mode needs the page's own theme switch (its `data-theme` or class) set in the URL or DOM, because Chrome's `--blink-settings` flag only gives light reliably. To measure as you look, `npx trykeyline audit --base <url> --quick --routes <path>` shoots the page at both widths and lists what it measured (contrast, names, targets, sizes, slop) in `keyline-report/`, and `node <keyline>/scripts/check.mjs --root <project root> --json <the screen's files>` adds the detector's findings with file and line. Use both as evidence, not as the read.
2. **Name what the screen is for and who reads it**, in one sentence. Everything below is measured against it.
3. **Read it as its reader would, in order:** what the eye lands on first, second, third — and whether that order matches what matters. Then how it groups, what competes, what's missing, what's noise.
4. **Tie each problem to a law**, by domain and number (`layout law 3`), so the fix is a rule rather than a taste. Where a named UX law explains *why* the reader feels it, name that too (`layout law 13, Fitts's law`) — it tells the owner the problem is about people, not preference. The names, and where Keyline holds each, are in `commands/ux-laws.md`.

**Report:**

- **The read** — two or three sentences: what the screen gets right, and the one thing that most undercuts it.
- **Changes, most important first** — at most five. Each: what's wrong, as the reader feels it; the law; the evidence where there is a measurement (a ratio, a size, a `file:line`); the fix in a sentence, in the project's names; and the command that makes it (`/keyline layout`).
- **Keep** — what's working and shouldn't be touched by the fixes.

Don't pad to five. Don't list what's fine as a problem to fix. No scores and no HTML report for one screen: those are the whole product's.

**Write back:** each change that names a law goes under `## Open issues` in `DESIGN.md`, one line with its evidence, replacing entries for this screen now fixed.

## The whole product

**Read:** `DESIGN.md`; `system/reports.md` (the target, the two ways to drive a browser, the report format); the `## Auditing existing code` and `## Checklist` sections of every `domains/<domain>/guide.md` (all six unless the user narrows it), and under preset `glass` each `glass/<domain>/guide.md` checklist.

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
   - whether the copy keeps one voice (patterns law 18);
   - whether the page looks designed for its reader or assembled from a template.

   Add each as a finding in `findings.json` (format in `system/reports.md`): `kind: "audit"`, the domain, a rule id of your own (`layout/hierarchy`, `states/empty-missing`, `slop/template-feel`), the law, the page, and a `shot` and `box` when you can point at it. Where a UX law explains why the reader feels it, name it in `detail` (`commands/ux-laws.md`).

4. **Judge the machine's findings too.** A measurement is a lead, not a verdict. A finding that is right by the numbers but wrong for this product gets `status: "dismissed"` with the reason in `detail`. Examples: an uppercase eyebrow under the `expressive` preset, which allows them; small text inside an illustration; a tap target the user has accepted. Never dismiss a contrast failure on text people read.

5. **Score each domain** 0–4 and replace the draft in `scores`; set `scoresDraft` to `false`:

   | Score | Means |
   |---|---|
   | 4 | Every law holds; nothing to report |
   | 3 | Small strays — a handful of one-off values, nothing a reader would notice |
   | 2 | A law broken in a way a reader feels — a hierarchy inversion, a failed contrast tier, a box around everything |
   | 1 | Several laws broken across templates; the domain isn't working as a system |
   | 0 | No system: values typed inline, nothing on a ladder |

6. **Write the summary**, `summary` in `findings.json`: one paragraph a person reads first, written as the one-screen read is, for the whole product. Say what a visitor feels, the three things that matter most, what's working that the fixes shouldn't touch, and the order to fix in (usually the lowest score first, unless a law in another domain blocks it).

7. **Render and hand over:**

   ```sh
   npx trykeyline report keyline-report
   ```

   Look at `index.html` yourself before giving it to the user; publishing it and `.gitignore` follow `system/reports.md`.

8. **Write back:** every open finding that names a law goes under `## Open issues` in `DESIGN.md`, one line each with its evidence, replacing entries now fixed.

**Report** in chat, kept short; the detail is in the report. Give:
- the summary paragraph;
- the score table;
- the worst five findings, one line each with evidence and law;
- the path to (or link for) the report.

## Ask before you stop

Every audit, either scope, ends by asking the user what they'd like to do next — one short question in your own words, written for what you found (not a stock line), followed by the two or three next steps that fit, most useful first. For one screen: make the top change with the command it names, take the next screen, or widen to the whole product. For the whole product: `/keyline polish --from keyline-report` to fix what's open a domain at a time, start with the lowest-scoring domain, or publish the report. Then wait for the answer: the audit changes no code, so nothing starts until the user picks.
