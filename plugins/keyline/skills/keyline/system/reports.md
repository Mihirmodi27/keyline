# Walking a running product, and the report

The commands that look at a product as a reader meets it (`audit`, `smoke`) share one machinery: find the pages, visit each at desktop and phone width in light and dark, measure, and write every finding to one report. This file is that machinery; each command says what it measures.

## The target

A walk needs a running product. In order of preference:

1. **A URL the user named**, or the dev server already running (check the project's `package.json` scripts and any `.claude/launch.json`; look for a listening localhost port before starting one).
2. **Start the dev server** with the project's own script, in the background, and wait for it to answer.
3. **A static folder** (plain HTML, a build output): `--serve <dir>` serves it on a free localhost port.

Never walk a production site for anything that writes (forms, purchases, deletes). Reading a production page is fine; the smoke test's write steps need a local or test host.

## Two ways to drive the browser

**The agent's own browser, when it has one.** Claude's browser tools, a Playwright MCP, Chrome DevTools MCP: open each page, take screenshots, run the command's checks with the tool's JavaScript evaluation, and write `findings.json` by hand in the format below. Then render it:

```sh
node <keyline>/scripts/browse.mjs report keyline-report
```

This path sees what the user sees (their sign-ins, their cookies) and needs no install.

**Keyline's runner, otherwise.** It loads Playwright from the project, or installs it once into `~/.cache/keyline`, and drives the installed Chrome (Playwright's Chromium if there's none):

```sh
node <keyline>/scripts/browse.mjs pages   --root . --base http://localhost:3000      # what will be visited
node <keyline>/scripts/browse.mjs capture --root . --base http://localhost:3000      # visit, shoot, report
node <keyline>/scripts/browse.mjs capture --serve dist                               # a static build
```

`capture` alone records only what any page load shows: pages that fail or answer 4xx/5xx, uncaught exceptions, console errors, failed requests. The commands add their own measurements on top. Ask before the first install if the user hasn't run Keyline's browser tools before; it is one `npm install` into a cache, not into their project.

## Finding the pages

`pages` merges three sources: the router's own files (Next app and pages routers, SvelteKit, Astro, Nuxt, Remix and React Router file routes, React Router route objects, plain `.html`), the running site's `/sitemap.xml`, and a crawl of its links. The walk also follows links each page renders, so a client-side app's pages are found.

A route with a parameter (`/projects/[id]`) is visited only with an example. The runner uses one when the crawl met a matching URL; otherwise list it, and ask the user for an example ID or pass the URL in `--routes`. Pages behind sign-in need a session: with the agent's browser, use the user's; with the runner, ask for test credentials from an environment variable, never in chat.

## The report

Every run is a folder, `keyline-report/` by default (`smoke-report/` for the smoke test):

```
keyline-report/
  findings.json   the run
  index.html      rendered from it: totals, scores, filters, each finding with a crop of its screenshot and the element outlined
  shots/          one PNG per page × viewport × theme
```

Add `keyline-report/` and `smoke-report/` to `.gitignore` unless the user wants reports committed. When the agent can publish pages (an artifact, a doc), offer to publish `index.html`; otherwise give its path.

### findings.json

```json
{
  "version": 1,
  "kind": "audit",
  "title": "Lumen",
  "base": "http://localhost:3000",
  "root": "/path/to/project",
  "started": "2026-11-08T10:00:00Z",
  "finished": "2026-11-08T10:06:00Z",
  "scores": { "type": 3, "color": 2, "layout": 2, "depth": 3, "motion": 4, "patterns": 2 },
  "summary": "One paragraph a person reads first: what a visitor feels, the three things that matter most.",
  "pages": [
    { "route": "/settings", "url": "http://localhost:3000/settings", "title": "Settings", "status": 200,
      "shots": { "desktop-light": { "path": "shots/settings--desktop-light.png", "width": 1440, "height": 3120 } } }
  ],
  "findings": [
    {
      "id": "f1",
      "kind": "audit",
      "domain": "color",
      "rule": "color/contrast",
      "law": "color law 2",
      "severity": "error",
      "title": "Timestamps fail contrast",
      "detail": "What's wrong, what the reader feels, what to do.",
      "evidence": "3.55:1, needs 4.5:1",
      "page": "/settings",
      "viewport": "desktop",
      "theme": "light",
      "shot": "desktop-light",
      "box": { "x": 1010, "y": 1060, "w": 120, "h": 18 },
      "selector": ".feed-time",
      "file": "src/components/Feed.tsx",
      "line": 42,
      "fix": "/keyline color",
      "status": "open"
    }
  ]
}
```

Only `rule` and `title` are required. `box` is in CSS pixels on the full-page screenshot named by `shot` (the element's `getBoundingClientRect()` plus the page's scroll offset); the report crops round it and outlines it. A smoke finding adds `steps`, the actions that reproduce it, in order. `status` is `open`, `accepted`, `dismissed` or `fixed`: a person or the auditing agent sets the first three, and `/keyline polish --from <dir>` works on what is open or accepted and marks what it fixed. The report leaves dismissed and fixed findings out of its counts. `scoresDraft: true` marks scores drafted from the measurements and not yet reviewed; the report says so beside them.

**Domains**: `type`, `color`, `layout`, `depth`, `motion`, `patterns` (the six passes), plus `a11y`, `copy`, `states`, `slop` (audit), `flow` (smoke), `runtime` (any walk) and `visual` (a comparison, below). **Severity**: `error` is broken for someone (unreadable, unreachable, does nothing, crashes); `warning` is a law broken in a way a reader feels; `info` is worth knowing.

### Writing good findings

- **One finding per problem per page.** The same missing label on twelve rows is one finding with the count in `evidence`; the same bug on every page is one finding per page, so the report can be filtered by page.
- **Measure, then say what it means.** `evidence` holds the number; `title` and `detail` say what a reader meets: "Timestamps are too faint to read in daylight", not "contrast 3.55".
- **Point at the source** when it can be found (`file`, `line`): grep for the selector's class or the text.
- **Name the fix**: the refining command that owns it, or the exact change when it's one line.

## Since the last run

A report says more next to the one before it. Keep the earlier folder (a capture writes over its own, so copy it first) and compare:

```sh
cp -R keyline-report keyline-report-before                                 # before the change
node <keyline>/scripts/browse.mjs capture --base http://localhost:3000 --compare keyline-report-before
node <keyline>/scripts/browse.mjs report keyline-report --compare keyline-report-before   # any run, including one written by hand
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
