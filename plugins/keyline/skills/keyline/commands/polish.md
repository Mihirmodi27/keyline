# `/keyline polish`

All six refining commands on one target, in order, each as its own reviewable pass, run in rounds until the target scores 8 out of 10 (`commands/audit.md`, **The score out of 10**). It's the finishing pass before something ships, and the default when the user says "make this better".

Each round is the passes, then a smoke test of what they touched, then a fresh score. `--to 9` raises the bar. `--once` runs a single round with no loop.

**Order:** `type` → `color` → `layout` → `depth` → `motion` → `patterns`. Each builds on the one before: type settles the roles colour gives tiers to; spacing groups type that has stopped moving; surfaces sit on finished spacing and colour; motion animates surfaces that exist; words are checked last, in the product as it now stands. If a `patterns` change alters a label's length enough to move the layout, recheck that spot.

**Steps:**

1. Read `DESIGN.md`. If it's missing, run `/keyline init` first and say so — polish without a profile is guessing.
2. Agree the target: one screen, flow or component. "The whole app" is several polishes; offer to start with the screen readers see most.
3. **Score where it starts.** Use an audit of this target from this conversation or `keyline-report/` if one exists. Otherwise, audit it now (`commands/audit.md`, one screen): the read, the score out of 10, and **To reach 8–9**. That list leads round 1.

### One round

4. Run `commands/refine.md` once per domain, in order, reading each domain's guide when its turn comes. Keep each pass to its domain.
5. **Settle.** Later passes create and change elements the earlier ones never saw — the depth pass turns a callout into a note, and nothing has given the note its type role. Re-run each earlier domain's checklist (`commands/refine.md` step 8) on the elements later passes created or changed, and fix within that domain.
6. Render the result beside the starting point.
7. **Smoke the pages you touched.** Run `npx trykeyline smoke --base <url> --routes <the pages>`, or the same checks with your own browser (`commands/smoke.md`). Writes run only on a test host, as that file says. Fix what it finds before scoring: anything this round broke, and design findings with the command in their `fix`. A bug that was there before the round is outside polish's limits: report it as what's holding the score, with its steps. Any error left open holds the score at 6.
8. **Score again**, the same way as the first time: the same pages, widths and themes, rendered and measured fresh (`commands/audit.md`, **A re-score is a fresh look**). Write the new **To reach 8–9**.

### The loop

9. **At the bar** (8, or what `--to` set): stop and report.
10. **Below it:** run the next round from the new list.
11. **Stop below the bar** after three rounds, or sooner when a round leaves the score where it was. Report what's holding it down: usually a cap that needs a call no law settles, such as a dial off the preset, the brand colour, a feature, or a fix outside this target. Ask for that call.

**Decisions hold.** Leave alone whatever `## Decisions` and `.keyline/decisions.json` keep (`commands/audit.md`, **Decisions already made**), and don't undo one with a fix. Never record a decision to clear something you couldn't fix: name it as what's holding the score, and ask. If the user says it's deliberate, record it in their words with `npx trykeyline keep`, and score again.

Between rounds, carry on without asking. This is the loop the user started, and the exception to waiting in `SKILL.md`. Stop early only when a change needs the user's call (`SKILL.md`, a law broken or a dial moved), or when they asked to review as you go.

**Nothing to render.** A score from the code alone is capped at 7, and the smoke test can't run. Run one round, say the loop can't reach the bar without a running target, and ask for one.

Polish improves the screen it's given; it doesn't move navigation or add features (`commands/refine.md`, the limits).

**Report**, once at the end of the whole polish:

- **The trail**: the score at each round, with what earned each gain (`5.5 → 7 → 8.5`).
- **The verdict**: either **Ready to ship** at the final score, or **Below the bar**, held at the score by the cap or call named. Never call a target below the bar ready, or finished.
- **Per domain, in order**: what changed and why, in a line or two each. A domain with nothing to fix says so. Then what the settling passes changed.
- **What the smoke test found**, and what was fixed.
- What was measured, what went into `DESIGN.md`, and anything left for later, with its command.

**Next** (format in `SKILL.md`, `## The flow`), once, at the end of the whole polish rather than after each round or domain. At the bar: `polish` on the next screen with open issues; with none left, `audit` on a screen no report has covered. Below it: the call that's blocking it, put as the question.

If the user wants to review as you go, stop after each domain and show it before starting the next. The rounds still run; each one waits for their go.

## From a report: `/keyline polish --from keyline-report`

After an audit, polish can work through the report instead of a target. Read `<dir>/findings.json`, and take every finding whose `status` is `open` or `accepted`; skip `dismissed` ones, which include those a recorded decision keeps (`decided`). Group them by the command in their `fix`. Run the passes in polish order as above, each on the pages and files its findings name, and fix those findings first. Then hold the rest of that page to the domain's laws as usual.

- **Mark each finding** you fixed `status: "fixed"`. One you decide not to fix stays `open`, with a line in `detail` saying why.
- **Smoke the pages you touched**, as in a round.
- **Re-measure when done**, into a round folder inside the report over the same pages, then compare: `npx trykeyline audit --out keyline-report/round-2 --routes <the report's pages>`, then `npx trykeyline report keyline-report/round-2 --compare keyline-report`. Round 3 goes in `round-3` and compares with `round-2`. Inside the report folder, the rounds stay out of git and out of the detector. The comparison marks what's fixed, new and back, keeps the dismissals, and carries the score trail. Re-running into the old folder would lose your own findings and dismissals. For source findings, the detector is enough. A finding that comes back is not fixed.
- **Judge again** (`commands/audit.md`, whole product, steps 3–5). Your own findings from the last round don't carry over: re-check each one and add back any that still stands. Then settle the score out of 10 and re-render the round's folder with `npx trykeyline report`. The next round works from that folder. A runner older than 0.3 writes no `score` or `history`: work the score out from the rubric, write it into `findings.json` as `score`, and give the trail in chat.
- **Loop** as above until the report reaches the bar, then **report** what was fixed, what's still open, the trail and the verdict.

Findings from `/keyline smoke` with `fix` commands work the same way.
