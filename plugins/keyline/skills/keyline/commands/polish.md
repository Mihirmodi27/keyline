# `/keyline polish`

All six refining commands on one target, in order, each as its own reviewable pass. The finishing pass before something ships, and the default when the user says "make this better".

**Order:** `type` → `color` → `layout` → `depth` → `motion` → `patterns`. Each builds on the one before: type settles the roles colour gives tiers to; spacing groups type that has stopped moving; surfaces sit on finished spacing and colour; motion animates surfaces that exist; words are checked last, in the product as it now stands. If a `patterns` change alters a label's length enough to move the layout, recheck that spot.

**Steps:**

1. Read `DESIGN.md`. If it's missing, run `/keyline init` first and say so — polish without a profile is guessing.
2. Agree the target: one screen, flow or component. "The whole app" is several polishes; offer to start with the screen readers see most.
3. Run `commands/refine.md` once per domain, in order, reading each domain's guide when its turn comes. Keep each pass to its domain.
4. **Settle.** Later passes create and change elements the earlier ones never saw — the depth pass turns a callout into a note, and nothing has given the note its type role. Re-run each earlier domain's checklist (`commands/refine.md` step 8) on the elements later passes created or changed, and fix within that domain.
5. Render the result beside the starting point.

Polish improves the screen it's given; it doesn't move navigation or add features (`commands/refine.md`, the limits).

**Report**, per domain in order: what changed and why, in a line or two each — a domain with nothing to fix says so — then what the settling pass changed. Then what was measured, what went into `DESIGN.md`, and anything left for later with its command.

**Next** (format in `SKILL.md`, `## The flow`), once, at the end of the whole polish rather than after each domain: `polish` on the next screen with open issues; with none left, `audit` on a screen no report has covered.

If the user wants to review as you go, stop after each domain and show it before starting the next.

## From a report: `/keyline polish --from keyline-report`

After an audit, polish can work through the report instead of a target. Read `<dir>/findings.json`, and take every finding whose `status` is `open` or `accepted`; skip `dismissed` ones. Group them by the command in their `fix`. Run the passes in polish order as above, each on the pages and files its findings name, and fix those findings first. Then hold the rest of that page to the domain's laws as usual.

- **Mark each finding** you fixed `status: "fixed"`. One you decide not to fix stays `open`, with a line in `detail` saying why.
- **Re-measure when done.** Run `npx trykeyline audit` again with `--routes` set to the pages you touched, or the detector for source findings. A finding that comes back is not fixed.
- **Re-render** with `npx trykeyline report <dir>`.
- **Report** what was fixed, what's still open, and what the new measurements say.

Findings from `/keyline smoke` with `fix` commands work the same way.
