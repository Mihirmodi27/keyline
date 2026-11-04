# `/keyline init`

Fit Keyline to this project: find out once what it calls things, who it's for and where it already breaks the laws, and write that down in `DESIGN.md` at the project root.

**Read:** `system/guide.md`, then `system/roles.md`, `system/presets.md` and `system/design-md.md`. `system/detection.md` when the scan leaves you unsure where a stack keeps its tokens.

**Steps:** follow `system/guide.md` from step 1 to step 5 — scan, map by usage, measure contrast, choose the preset from the reader, ask at most four questions, write the file. Before writing `## Open issues`, read the law headings (the `### N.` lines) of each domain guide you cite, so every citation names the right law.

- **`DESIGN.md` already exists:** this is `/keyline sync`, not a rewrite. Say so and run that instead.
- **A new project with no interface yet:** there is nothing to scan. Ask what the product is and who reads it, propose a preset, and write `## Profile` with the preset's defaults from each domain guide's `## Dials`, marked as defaults. Generate tokens only if asked (`system/guide.md` §6).
- **Asked for one domain only** (by another command finding `DESIGN.md` missing): write `## Profile` and that domain's section, and leave the rest for a full run.

**Report**, briefly: the preset and the evidence for it, how many roles mapped cleanly, which names you proposed, and the three open issues that matter most. Then the next step — usually `/keyline critique` on the main screen, or `/keyline polish` if the user wants changes.

**Changes no code.** Generating tokens is a separate request.
