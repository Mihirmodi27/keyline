# `/keyline sync`

Bring `DESIGN.md` back in line with code that has moved since it was written. An audit of the file, not a rewrite of it.

**Read:** `system/design-md.md` for the format.

**Steps:**

1. Rescan with `node <keyline>/scripts/scan.mjs . --ignore <prose and example dirs>`, using the same ignores as last time if `DESIGN.md` records them.
2. Compare against every table in `DESIGN.md`: values that changed, tokens that appeared or disappeared, roles now done by a different token, a theme or area that's new.
3. Re-measure every text tier with `<keyline>/scripts/contrast.mjs --ladder`, per theme, against its worst surface.
4. Walk `## Open issues`: strike what's fixed (with the evidence that it is), keep what isn't, add what's new.
5. Propose the edits as a short diff and apply them. Every name the user chose and every `## Decisions` entry survives; a decision the code now contradicts is reported, never silently dropped.

**Report:** what drifted, what's newly fixed, what's newly broken, and anything in `## Decisions` the code no longer follows.

**Next** (format in `SKILL.md`, `## The flow`): `polish` on the screen most open issues fall on (`SKILL.md`, flow rule 3); with none open, `critique` on a screen no report has covered.
