# Keyline

Keyline keeps your coding agent's UI in your design system, and proves every change in a real browser before it ships.

Keyline reads your codebase once and writes a `DESIGN.md` that maps your own token names onto its roles and picks a preset for your reader. From then on your agent audits and fixes type, colour, layout, depth, motion and product patterns through that file: the same laws on every project, your values on yours. Keyline brings no look of its own.

Then it checks the result the way a designer and a tester would:

- **It clicks through your running app.** Every link and button from a fresh load, every form submitted empty, wrong and right, Back, Escape and reload, and each break comes with the steps to reproduce it. `npx trykeyline smoke`
- **It sees every page at desktop and phone, in light and dark.** Contrast measured against what's really behind the text, controls with no name, text cut off, sideways scroll and the tells of AI slop, scored in one HTML report. `npx trykeyline audit`
- **It fails a pull request only on what the change made worse.** Commit a baseline, and old findings stop blocking new work. `npx trykeyline check --baseline`
- **It walks every preview deploy** and marks what's new, fixed or back since the last one, and diffs the screenshots. `npx trykeyline capture`, then `npx trykeyline report --compare`

None of the four needs the skill. They run on whatever your agent wrote, through Keyline's commands or another design skill's.

```sh
npx trykeyline install
```

The npm package is `trykeyline`, because npm holds `keyline` too close to an older package's name. Everything else, the skill and the commands in your agent, is `keyline`.

Then, in your agent:

```
/keyline
```

On its own, `/keyline` tells you where your project stands and which command to run next.

## How it runs

You don't need to learn the commands. A project goes through three stages, and every report ends with the next step.

| Stage | Command | What you get |
|---|---|---|
| 1. Review | `/keyline audit` on one screen or the whole product | What's wrong with the interface as it is. No setup needed, and nothing changes |
| 2. Set up | `/keyline init` (`/keyline sync` later on) | `DESIGN.md`: your token names, a preset for your reader, and the review's findings as open issues |
| 3. Polish | `/keyline polish` | The fixes, one domain at a time, in rounds until the screen scores 8/10, recorded back to `DESIGN.md` |

Then it starts over: polish the next screen with open issues, or review one nobody has looked at yet.

## Commands

| Command | Does |
|---|---|
| `/keyline init` | Scans the codebase, maps its tokens onto roles, picks a preset, writes `DESIGN.md` with the open issues it found |
| `/keyline sync` | Reconciles `DESIGN.md` with code that has moved since |
| `/keyline audit` | Name a screen for a designer's read: what the reader feels first, what's working, the few changes that matter. Name nothing for the whole product: every page at desktop and phone, light and dark, plus the code; accessibility, contrast, AI slop and every law checked with evidence, scored 0–4, in one HTML report. Both score it out of 10, where 8 is ready to ship, and say what would take it to 8–9 |
| `/keyline smoke` | Uses your running app like a tester and reports what's broken, with the steps to reproduce each |
| `/keyline type` | Type scale, weights, leading, tracking, emphasis, numerals, font loading |
| `/keyline color` | Tokens by intent, text tiers by measured contrast, status colours, themes |
| `/keyline layout` | Measure, spacing that groups, radii, line weights, z-index, breakpoints, empty states |
| `/keyline depth` | Elevation, shadows, edges, scrims, translucent surfaces and their fallbacks |
| `/keyline motion` | Durations, curves, springs, open and close, reduced motion, scroll |
| `/keyline patterns` | Labels, buttons, destructive actions, forms, agent UIs, dashboards |
| `/keyline polish` | All six domains in order, one reviewable pass each, then a smoke test of what changed and a fresh score; it repeats until the screen reaches 8/10, or stops after three rounds and names what's holding it |

You don't have to name a command: ask for "tighter spacing" or "a review of the settings page" and the agent picks one.

`audit`, `smoke`, `init` and `sync` change no code. The refining commands change only what their domain owns, in your token names, and write decisions back to `DESIGN.md` so the next session starts from them.

## The smoke test

`/keyline smoke` walks your running app the way a tester would: every same-origin link (404s, redirect chains and loops), every button and clickable element clicked from a fresh load (a click that changes nothing in 1.5 s is a dead click), Back after every move, Escape on every menu and dialog, loaders still spinning after 8 s, views lost on reload, every form submitted empty, wrong and right (an error must appear by the field; success must show), Tab through each page (traps, invisible focus), a phone-width pass on the navigation, and layout shift on a slow connection. Each finding comes with the steps that reproduce it and a screenshot with the element outlined, in `smoke-report/index.html`.

```sh
npx trykeyline smoke --base http://localhost:3000    # a running dev server
npx trykeyline smoke --serve dist                    # a static build
```

Form submits and anything that says delete, pay, buy, unsubscribe or log out run only on `localhost`, `*.localhost`, `*.test` or hosts you list as test hosts, and destructive ones only with `--allow-writes`; anywhere else the runner only reads and blocks every write request. Sign-in, example URLs for dynamic routes and forbidden areas go in an optional `keyline.smoke.json`, with credentials read from environment variables. With its own browser tools your agent runs the same checks in your session; otherwise Keyline installs Playwright once into `~/.cache/keyline` and drives your installed Chrome.

## The audit report

`/keyline audit` walks the running product in a browser: every page Keyline can find (router files, sitemap, a crawl), at desktop and phone width, in light and dark. It measures what a reader meets — text contrast against what's really behind it, controls with no name, tap targets too small, sideways scroll, text cut off, the type actually rendered, copy left half-done, and the tells of AI slop (stock phrases, purple gradients, gradient headlines, emoji bullets, a card around everything) — adds the detector's findings from the source, and your agent adds what only judgement sees. Everything lands in one report:

```
keyline-report/
  index.html      the score out of 10 and per domain, a summary, every finding with its screenshot cropped and the element outlined
  findings.json   the same, for CI or the next run
  shots/
```

`/keyline polish --from keyline-report` then fixes what's open, a domain at a time, marks what it fixed, and re-audits until the report reaches 8/10; the report shows the trail (`6 → 7.5 → 8.5`). The measuring half runs on its own too:

```sh
npx trykeyline audit --base http://localhost:3000       # a running app
npx trykeyline audit --serve dist                       # a static build
```

It drives your installed Chrome through Playwright, which it installs once into `~/.cache/keyline` — not into your project — the first time a browser is needed. Agents with their own browser tools can use those instead.

## The detector

Twenty-four of the laws can be checked from source alone, with no model and no API key:

```sh
npx trykeyline check            # human report; exits 1 on errors
npx trykeyline check --json     # every finding, for CI or an agent
npx trykeyline check --strict   # warnings fail the run too
```

It reads CSS, Tailwind classes, inline styles, `<style>` blocks and CSS-in-JS, in React, Vue, Svelte, Astro and plain HTML, and it reads `DESIGN.md` so the verdicts follow your preset, the case you record for labels, and your motion and z-index ladders. A few of the things it catches: `transition: all`; animation with no reduced-motion branch; an outline removed with nothing in its place; `100vh`; `z-index: 9999`; colours typed inline instead of tokens; translucency with no `@supports` fallback; pinch-zoom disabled; uppercase labels where `DESIGN.md` records sentence case, and Title Case buttons. `npx trykeyline check --rules` lists all of them, each with the law it comes from.

`/keyline audit` runs it first and spends its own reading on what a detector can't see — hierarchy, grouping, whether a box should exist at all.

On a codebase that already has findings, record them once and fail only on what a change adds:

```sh
npx trykeyline check --baseline save   # writes .keyline/baseline.json; commit it
npx trykeyline check --baseline        # what's new, fixed and still; exits 1 only on new errors
```

Findings are matched on rule, file and the text of the line, not its number, so moving code doesn't make it new.

Silence a line with a `keyline-ignore` comment on it or the line above, naming the rule if you like (`/* keyline-ignore type/uppercase */`); a whole file with `keyline-ignore-file`. Leave out paths with `--ignore src/content`.

In CI, or on just what a branch changed:

```yaml
- run: npx trykeyline check
- run: npx trykeyline check --changed origin/main
```

## Decisions it remembers

A review that raises the same thing every time stops being read. When you decide a finding is deliberate, record it once, and nothing raises it again: not the detector, not the guard while the agent writes, not the audit, not polish, not a teammate's run or CI.

```sh
npx trykeyline keep src/cta.css:12 --reason "the brand red on the call to action"
npx trykeyline keep f12 --reason "…"    # a finding in keyline-report, at every width and theme it was seen in
npx trykeyline keep --list              # every decision, why, and who made it
npx trykeyline keep --drop k3           # take one back: the finding is raised again
```

Each decision goes in `.keyline/decisions.json` and as one line under `## Decisions` in `DESIGN.md`, where the agent reads it before it works. Commit both, and every person, agent and CI run reads the same memory.

- **It follows the code.** A decision about a source line matches the rule, file and text of the line, as the baseline does: code moving around it changes nothing, and a change to the line itself raises it again. `npx trykeyline check` names any decision that no longer matches anything, and `/keyline sync` asks what to do with it.
- **It's never hidden.** Every report counts what decisions kept, and `check --all` and the audit report list each one with its reason and who decided.
- **It's yours, not the agent's.** The agent records one only when you say a finding is deliberate, in your words. A kept finding stops counting against the score, so the agent never keeps one to clear something it couldn't fix. A contrast failure on text can't be kept.

A `keyline-ignore <rule>: <reason>` comment is the same kind of decision written into the code, for one source line. Use whichever you'd rather read: the comment beside the line, or one list that also covers what only a browser sees.

## In pull requests

Keyline can read only what a pull request changed and put its findings on the PR's lines. Add [`examples/github/keyline.yml`](examples/github/keyline.yml) as `.github/workflows/keyline.yml`, or the step on its own:

```yaml
permissions:
  contents: read
  pull-requests: write   # only for comment: true

jobs:
  keyline:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: Mihirmodi27/keyline@main
        with:
          comment: true
```

| Input | Default | Does |
|---|---|---|
| `base` | the PR's base branch | Compare with this ref. Off a pull request with no `base`, the whole project is checked |
| `strict` | `false` | Fail on (new) warnings too |
| `baseline` | `auto` | Use `.keyline/baseline.json` when it's committed, so only findings the PR adds are annotated and fail it. `true` requires it, `false` ignores it, or give a path |
| `comment` | `false` | Post one summary comment (the counts and the top ten findings, each linked to its line) and edit it on every push, rather than adding one per push |
| `path` | `.` | The project's root, where `DESIGN.md` is, in a monorepo |
| `args` | | More `keyline check` options, e.g. `--ignore src/content` |

The annotations need no token: they're printed as workflow commands, and GitHub draws them on the diff. GitHub shows at most ten errors and ten warnings per step, so they're printed errors first, and the job summary (and the comment) list the rest. Commenting uses the workflow's own `GITHUB_TOKEN` through `gh`. The default one-commit checkout is enough; the Action fetches the base branch itself.

On a codebase that already has findings, save a baseline first (`npx trykeyline check --baseline save`, commit `.keyline/baseline.json`). Without one, every finding in a touched file is annotated, old ones included.

The same works anywhere, without the Action:

```sh
npx trykeyline check --changed origin/main                  # only files changed since the merge base, plus uncommitted ones
npx trykeyline check --changed origin/main --format github  # as ::error / ::warning / ::notice annotations
npx trykeyline check --changed origin/main --baseline --json-file keyline.json
```

### Walking a preview

The example's second job is optional. When a preview deploy finishes (Vercel, Netlify and others report one as a deployment status), it runs `npx trykeyline capture` against the preview URL, which visits every page at desktop and phone, light and dark, records errors, failed requests and console errors, and screenshots each, then uploads `keyline-report/` as a workflow artifact. Run it by hand from the Actions tab with any URL. Keep the previous run's artifact and `npx trykeyline report keyline-report --compare keyline-report-before` marks what's new, fixed or back, and diffs the screenshots. A preview behind deployment protection needs its bypass, and Playwright installs into the runner's cache on first use.

`--staged` checks only the files staged in git, and `--changed [base]` only the files changed since `base` (default `HEAD`), committed or not. Verdicts that depend on the whole project — whether anything reads `prefers-reduced-motion`, whether focus is styled anywhere — still come from the whole project.

## Live guard

The detector can also run while the agent writes. After every edit to a UI file — CSS, Sass, TSX, JSX, Vue, Svelte, Astro, HTML, or a `.ts` file holding styles or markup — Keyline checks that one file against your `DESIGN.md` and hands the errors and warnings straight back to the agent: up to eight, worst first, each with its line, rule, law and fix. The agent fixes them before it moves on, so slop never reaches a review. A clean file says nothing.

**Claude Code plugin:** on already. The plugin carries a `PostToolUse` hook on Edit, Write and MultiEdit.

**Claude Code, installed with npx:**

```sh
npx trykeyline guard --install
```

adds the same hook to `.claude/settings.json` (commit it, and the whole team gets it). `npx trykeyline guard --uninstall` takes it out.

**Codex:** `npx trykeyline guard --install --tool codex` adds a `PostToolUse` hook to `.codex/hooks.json`; Codex asks you to trust the project's `.codex/` folder before it runs it. It reads the files out of `apply_patch`'s patch. Built to Codex's hook docs, but not yet run against a live Codex.

**Any agent, through git:**

```sh
npx trykeyline guard --pre-commit
```

adds a pre-commit hook that checks the staged UI files and stops the commit on errors (warnings are shown, not fatal). It goes beside a hook that's already there, not over it. This is the guard for Cursor, Windsurf, Copilot, OpenCode and the rest; the agent sees the failure when it commits.

Why not a post-edit hook for the others: Cursor's `afterFileEdit` hook names the file but can't send anything back to the agent, and its `postToolUse` hook, which can, doesn't document where an edited file's path is. Gemini CLI documents an `AfterTool` hook that could, but Google retired Gemini CLI for Antigravity CLI in June 2026. The guard script reads both payload shapes, so wiring either is a small change once it's documented.

**Turning it off:**

| For | Do |
|---|---|
| A session or a commit | `KEYLINE_GUARD=off` in the environment |
| The project | A `\| Guard \| off \|` row under `## Profile` in `DESIGN.md` |
| One file | A `keyline-ignore-file` comment in it |
| One line | A `keyline-ignore <rule>: <reason>` comment on it |

The guard never blocks an edit: a file it can't read, a payload it doesn't understand, or a bug of its own means silence, not a failed tool call.

## Presets

The laws hold everywhere. A preset sets the dials — how far the type scale climbs, how much colour is spent, how long motion runs — for what your reader is doing:

| Preset | For a reader who is |
|---|---|
| `editorial` | Reading: articles, docs, portfolios, changelogs |
| `product` | Working: dashboards, tools, anything used daily |
| `expressive` | Being persuaded: landing pages, launches, campaigns |

### Glass

`glass` isn't a reader type. It's one finished system: [modimihir.com](https://modimihir.com)'s exact values, with drop-in tokens and components. Pick it when you want that system itself rather than your own. It reads as `editorial`, with every dial already decided.

Mixed projects are normal: `product`, with the marketing routes on `expressive` and the docs on `editorial`. `init` records each part as an area under `## Profile`:

```
| Areas | `app/(marketing)/** → expressive` · `app/docs/** → editorial` |
```

From then on everything judges a file by its area: the detector and the live guard by the file's path, the audit by each page's source file or its route (`/docs/** → editorial`). Italics are fine in the docs and flagged in the app; font weights are counted per area, each against its own preset. `npx trykeyline check` lists the areas it read, the guard names the one a file is in, and the audit report puts each page's preset beside its name.

Any dial can be moved, and the move is recorded in `DESIGN.md` with its reason.

## Installing

`npx trykeyline install` asks which agent you use and copies the skill into that agent's folder. Flags answer up front:

```sh
npx trykeyline install --tool codex,cursor     # several agents
npx trykeyline install --tool claude-code --user   # every project on this machine
npx trykeyline update                          # refresh every copy already installed
```

| Agent | `--tool` | This project | Every project (`--user`) |
|---|---|---|---|
| Claude Code | `claude-code` | `.claude/skills` | `~/.claude/skills` |
| Codex | `codex` | `.agents/skills` | `~/.codex/skills` |
| Cursor | `cursor` | `.agents/skills` | `~/.cursor/skills` |
| Gemini CLI | `gemini-cli` | `.agents/skills` | `~/.gemini/skills` |
| GitHub Copilot | `github-copilot` | `.agents/skills` | `~/.copilot/skills` |
| OpenCode | `opencode` | `.agents/skills` | `~/.config/opencode/skills` |
| Windsurf | `windsurf` | `.windsurf/skills` | `~/.codeium/windsurf/skills` |
| Any agent that reads `.agents/skills` | `agents` | `.agents/skills` | `~/.agents/skills` |

**Claude Code plugin:**

```
/plugin marketplace add Mihirmodi27/keyline
/plugin install keyline@keyline
```

Claude Code names a plugin's skills after the plugin, so installed this way the command is `/keyline:keyline init`, `/keyline:keyline audit` and so on. Installed with `npx trykeyline install`, it's `/keyline`.

**With the [`skills` CLI](https://github.com/vercel-labs/skills):** `npx skills add Mihirmodi27/keyline --agent claude-code`.

Or run the installer straight from GitHub: `npx github:Mihirmodi27/keyline install`.

### Coming from interface-skills

Keyline replaces both interface-skills packages: the adaptable set became the commands, and the Glass package became the `glass` preset. `npx trykeyline install` finds the old skills and offers to remove them, since their descriptions would compete with Keyline's for the same requests. A `DESIGN.md` written by the old setup skill works as it is.

## Requirements

Node 18 or later, for the installer and for the three scripts the skill runs: the detector, a token inventory and a contrast checker. None of them needs a dependency, a model or an API key. The audit and the smoke test drive a browser, so they ship as a second package, [`trykeyline-browser`](packages/browser): `npx trykeyline audit`, `smoke`, `pages`, `capture`, `report` and `probe` run it at the same version, fetching it the first time, and it installs Playwright once into `~/.cache/keyline` and drives your installed Chrome.

## Licence

MIT © Mihir Modi
