# `/keyline audit`

Every law, checked with evidence, per domain — the full inspection `critique` is the summary of. Findings go into `DESIGN.md` so later sessions start from them.

**Read:** `DESIGN.md`, then the `## Auditing existing code` and `## Checklist` sections of every `domains/<domain>/guide.md` (all six unless the user narrows it). Under preset `glass`, also each `glass/<domain>/guide.md` checklist.

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

**Report:** a table of the six domains with score and finding count, then findings grouped by domain, worst first, one line each with evidence — `file:line`, a ratio, a count — and the law. Close with the order to fix in: usually the lowest score first, unless a law in another domain blocks it.

**Write back:** every finding under `## Open issues` in `DESIGN.md`, replacing entries now fixed. **Changes no code.**
