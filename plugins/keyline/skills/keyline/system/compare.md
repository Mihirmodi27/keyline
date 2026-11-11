# Comparing runs

Read beside `system/reports.md`, whose report format this assumes.

## Since the last run

A report says more next to the one before it. Keep the earlier folder (a capture writes over its own, so copy it first) and compare:

```sh
cp -R keyline-report keyline-report-before                                  # before the change
npx trykeyline capture --base http://localhost:3000 --compare keyline-report-before
npx trykeyline report keyline-report --compare keyline-report-before        # any run, including one written by hand
```

**Findings** are matched on rule + page + viewport + theme + `selector` (the `title` when there's no selector), the key a run is de-duplicated on, so reword a title freely when the finding has a selector. Each finding in the newer run gets `change`:

| `change` | Means |
|---|---|
| `new` | Not in the previous run |
| `still` | In it too. A `status` a person set there (`accepted`, `dismissed`) carries over, so a dismissed finding stays dismissed |
| `returned` | Not in the previous run, but in that run's `fixed` list: fixed once, back now |

The previous run's findings with no match go in a top-level `fixed` array (each with `change: "fixed"`, `previous` its old id, and an `x` id), but only if this run could have seen them again: their page was visited, at their viewport and theme. A page left out of this run says nothing about what was fixed on it. The run also gets `compare`:

```json
"compare": {
  "against": "../keyline-report-before",
  "previous": { "kind": "audit", "started": "…", "finished": "…" },
  "new": 3, "still": 41, "returned": 1, "fixed": 6,
  "visual": { "threshold": 0.01, "compared": 16, "changed": 2 }
}
```

**Screenshots** present in both runs (same page, same viewport and theme) are diffed pixel by pixel in the browser the runner already drives: both PNGs are decoded onto a canvas, so no image library is added. A pixel counts as changed when any channel moves by more than 24 of 255, which ignores anti-aliasing noise; where the shots differ in size, the area only one covers counts as changed. Each diff is written to `diffs/` (the new shot washed out, changed pixels in red) and recorded on its page:

```json
"diffs": { "desktop-light": { "path": "diffs/settings--desktop-light.png", "percent": 2.37, "width": 1440, "height": 3120, "box": { "x": 0, "y": 640, "w": 1440, "h": 410 }, "sizeChanged": false } }
```

A shot whose changed share is above the threshold (`--threshold`, in percent, default `0.01`, so a changed heading on a 1440×900 page, about 0.08%, counts) gets an `info` finding, `visual/changed`, with `box` round everything that changed and `diff` pointing at the diff image. It is neither new nor still; it describes the comparison. `--no-diff` compares findings only. If no browser can launch, the findings are still compared and `compare.visual.skipped` says why.

The HTML report gains a **Since last run** section (the counts, what was fixed, every diffed screenshot with its share changed), a badge on each finding (New, Back, Still, Changed) and a filter for them. Compared against a run, `capture` exits 1 only on errors that are new or back, as the detector does against its baseline.

### The detector's baseline

The detector has the same idea for source code, so a codebase with years of findings can adopt it without fixing everything first:

```sh
npx trykeyline check --baseline save    # record today's findings in .keyline/baseline.json; commit it
npx trykeyline check --baseline         # new, fixed and still; exits 1 only on NEW errors (new warnings too with --strict)
```

A finding's fingerprint is its rule, its file and the text of its line, trimmed and with whitespace collapsed, never the line number, so code inserted above it or reindented doesn't make it new; editing the line itself does. Two identical lines with the same finding count as two. A project-wide finding (no reduced-motion branch anywhere, no skip link, too many weights) is matched on its rule alone. Only a file the run checked and a rule it ran can count as fixed, so `--rule` and a narrower path don't fake fixes, and a project-wide finding counts as fixed only in a run over the whole project. `--json` adds `change` to each finding, `summary.new`, `baseline` (the counts) and `fixed`. Re-save the baseline after a clean-up, so a fixed finding that comes back counts as new; `--baseline-file <path>` keeps it elsewhere. In a pull request, `--changed <base>` narrows the report to the files the branch changed; every file is still read, so project-wide facts hold.
