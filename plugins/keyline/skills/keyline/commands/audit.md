# `/keyline audit`

Every law, checked with evidence, per domain — the full inspection `critique` is the summary of. Findings go into `DESIGN.md` so later sessions start from them.

**Read:** `DESIGN.md`, then from every `domains/<domain>/guide.md` (all six unless the user narrows it):

- **The checklist** — each law's `### N.` heading and its bold first sentence: `awk 'FNR==1{p=0; print "== " FILENAME} /^## /{p = /^## Laws/} p' <keyline>/domains/*/guide.md | grep -oE '^(== |### ).*|^\*\*([^*]|\*[^*])+\*\*'`
- **`## Auditing existing code`**, and `## Checklist` where a guide still has one: `awk 'FNR==1{p=0; print "== " FILENAME} /^## /{p = /^## (Auditing|Checklist)/} p' <keyline>/domains/*/guide.md`

Read a law's full text where a finding needs it. Under preset `glass`, also each `glass/<domain>/guide.md` checklist (there is no `glass/patterns/`): `awk 'FNR==1{p=0; print "== " FILENAME} /^## /{p = /^## Checklist/} p' <keyline>/glass/*/guide.md`

**Steps:**

1. **Detector:** `node <keyline>/scripts/check.mjs --root <project root> --json --ignore <prose and example dirs>`. Every finding it returns is evidence already — file, line, law — so start each domain from its findings and spend your reading on what it can't see: hierarchy, grouping, whether a box should exist. Treat a finding as a lead, not a verdict; one you judge wrong goes in the report as such, and gets a `keyline-ignore` comment only if the user agrees.
2. **Inventory:** `node <keyline>/scripts/scan.mjs . --ignore <prose and example dirs>`.
3. **Contrast:** every text tier, the focus ring (`--min 3`) and status colours, per theme, with `<keyline>/scripts/contrast.mjs`.
4. **Per domain, in polish order** — type, colour, layout, depth, motion, patterns — run that guide's audit: its searches, then its evidence per law. Render where the guide asks you to look (widths, themes, reduced motion, keyboard).
5. **Score each domain** from what you found, the detector's findings and yours together:

| Score | Means |
|---|---|
| 4 | Every law holds; nothing to report |
| 3 | Small strays — a handful of one-off values, nothing a reader would notice |
| 2 | A law broken in a way a reader feels — a hierarchy inversion, a failed contrast tier, a box around everything |
| 1 | Several laws broken across templates; the domain isn't working as a system |
| 0 | No system: values typed inline, nothing on a ladder |

**Report:** a table of the six domains with score and finding count, then findings grouped by domain, worst first, one line each with evidence — `file:line`, a ratio, a count — and the law, with its UX-law name where one explains it (`commands/ux-laws.md`). Close with the order to fix in: usually the lowest score first, unless a law in another domain blocks it.

**Write back:** every finding under `## Open issues` in `DESIGN.md`, replacing entries now fixed.

**No `DESIGN.md` yet** (stage 1 of the flow in `SKILL.md`): audit from the code. Every step runs as written. Choose the preset the reader points to (`system/presets.md`) and say which you assumed and why. The detector has no preset to read, so its preset rules fall back to their neutral verdicts; judge those findings, and score the dials, against the preset you assumed. Write nothing back: there's no file yet, and `init` records these findings as its open issues.

**Next** (format in `SKILL.md`, `## The flow`): with no `DESIGN.md`, `init`, so the findings are kept and the fixes land in the project's names. With one, `polish` on the screen with the most findings; the lowest-scoring domain's own command when that domain holds most of them.
