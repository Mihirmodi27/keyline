# `/keyline audit`

The whole product, inspected as a reader meets it and as its code is written: every page at desktop and phone, light and dark, every law checked with evidence, AI slop and accessibility included, scored per domain and written up as one report a person can read, filter and share. `/keyline critique` is the quick read of one screen; this is the inspection.

**Report:** a table of the six domains with score and finding count, then findings grouped by domain, worst first, one line each with evidence — `file:line`, a ratio, a count — and the law, with its UX-law name where one explains it (`commands/ux-laws.md`). Close with the order to fix in: usually the lowest score first, unless a law in another domain blocks it.

**Write back:** every finding under `## Open issues` in `DESIGN.md`, replacing entries now fixed.

**Changes no code.** It writes the report, and the findings into `DESIGN.md`.

## Steps

1. **Find the target** as `system/reports.md` says: the URL the user named, the dev server already running, or the project's own dev script started in the background. A static build is served with `--serve <dir>`. Without anything to render, say the audit is from code alone and skip to step 3.

2. **Measure every page.** With Keyline's runner:

   ```sh
   node <keyline>/scripts/audit.mjs --base <url> --root <project root> [--title "<product>"]
   ```

   It finds the pages (router files, sitemap, crawl), visits each at desktop and phone in light and dark, and measures inside the rendered page:
   - **Accessibility:** controls with no name, images with no alt, missing landmarks, `lang` and headings, tap targets under 24px.
   - **Contrast:** every run of text against what's actually behind it, in each theme.
   - **Layout:** sideways scroll on a phone, text cut off.
   - **Type:** the sizes and weights actually rendered, text under 12px, lines too long.
   - **Copy:** placeholder text, interjections, "we" in errors, vague labels.
   - **AI slop:** stock phrases, placeholder brands, gradient headlines, purple gradient panels, glass everywhere, emoji bullets, eyebrows on every heading, grids of identical boxed cards.

   It adds the detector's findings from the source with file and line, drafts a score per domain, and writes `keyline-report/`. Pages are shot with reduced motion so they show their settled state; pass `--motion` to audit a first visit as it plays. A page behind sign-in, or a route that needs an example ID, follows `system/reports.md`.

   **With the agent's own browser instead**, visit the same pages at the same widths and themes, run the same checks with the browser's JavaScript evaluation (the probe in `scripts/audit/probe.mjs` is plain JavaScript you can run as-is, with the helpers from `scripts/browse/capture.mjs`), and write `findings.json` by hand. Then run the detector (`node <keyline>/scripts/check.mjs --root <project root> --json`) and add its findings.

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

6. **Write the summary**, `summary` in `findings.json`: one paragraph a person reads first. Say what a visitor feels, the three things that matter most, and the order to fix in (usually the lowest score first, unless a law in another domain blocks it).

7. **Render and hand over:**

   ```sh
   node <keyline>/scripts/browse.mjs report keyline-report
   ```

   Look at `index.html` yourself before giving it to the user; publishing it and `.gitignore` follow `system/reports.md`.

8. **Write back:** every open finding that names a law goes under `## Open issues` in `DESIGN.md`, one line each with its evidence, replacing entries now fixed.

## Report

In chat, keep it short; the detail is in the report. Give:
- the summary paragraph;
- the score table;
- the worst five findings, one line each with evidence and law;
- the path to (or link for) the report;
- the next step: `/keyline polish --from keyline-report` fixes what's open, a domain at a time.
