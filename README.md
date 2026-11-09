# Keyline

Interface design laws for coding agents.

Keyline reads your codebase once and writes a `DESIGN.md` that maps your own token names onto its roles and picks a preset for your reader. From then on your agent critiques, audits and fixes type, colour, layout, depth, motion and product patterns through that file: the same laws on every project, your values on yours.

```sh
npx trykeyline install
```

The npm package is `trykeyline`, because npm holds `keyline` too close to an older package's name. Everything else, the skill and the commands in your agent, is `keyline`.

Then, in your agent:

```
/keyline init
```

## Commands

| Command | Does |
|---|---|
| `/keyline init` | Scans the codebase, maps its tokens onto roles, picks a preset, writes `DESIGN.md` with the open issues it found |
| `/keyline sync` | Reconciles `DESIGN.md` with code that has moved since |
| `/keyline critique` | A designer's read of one screen: what the reader feels first, what's working, the few changes that matter. The audit's quick mode |
| `/keyline audit` | Every page of the running product at desktop and phone, light and dark, plus the code: accessibility, contrast, AI slop and every law checked with evidence, scored 0–4, in one HTML report |
| `/keyline type` | Type scale, weights, leading, tracking, emphasis, numerals, font loading |
| `/keyline color` | Tokens by intent, text tiers by measured contrast, status colours, themes |
| `/keyline layout` | Measure, spacing that groups, radii, line weights, z-index, breakpoints, empty states |
| `/keyline depth` | Elevation, shadows, edges, scrims, translucent surfaces and their fallbacks |
| `/keyline motion` | Durations, curves, springs, open and close, reduced motion, scroll |
| `/keyline patterns` | Labels, buttons, destructive actions, forms, agent UIs, dashboards |
| `/keyline polish` | All six domains in order, one reviewable pass each |

You don't have to name a command: ask for "tighter spacing" or "a review of the settings page" and the agent picks one.

`critique`, `audit`, `init` and `sync` change no code. The refining commands change only what their domain owns, in your token names, and write decisions back to `DESIGN.md` so the next session starts from them.

## The audit report

`/keyline audit` walks the running product in a browser: every page Keyline can find (router files, sitemap, a crawl), at desktop and phone width, in light and dark. It measures what a reader meets — text contrast against what's really behind it, controls with no name, tap targets too small, sideways scroll, text cut off, the type actually rendered, copy left half-done, and the tells of AI slop (stock phrases, purple gradients, gradient headlines, emoji bullets, a card around everything) — adds the detector's findings from the source, and your agent adds what only judgement sees. Everything lands in one report:

```
keyline-report/
  index.html      scores, a summary, every finding with its screenshot cropped and the element outlined
  findings.json   the same, for CI or the next run
  shots/
```

`/keyline polish --from keyline-report` then fixes what's open, a domain at a time, and marks what it fixed. The measuring half runs on its own too:

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

It reads CSS, Tailwind classes, inline styles, `<style>` blocks and CSS-in-JS, in React, Vue, Svelte, Astro and plain HTML, and it reads `DESIGN.md` so the verdicts follow your preset and your motion and z-index ladders. A few of the things it catches: `transition: all`; animation with no reduced-motion branch; an outline removed with nothing in its place; `100vh`; `z-index: 9999`; colours typed inline instead of tokens; translucency with no `@supports` fallback; pinch-zoom disabled; uppercase labels and Title Case buttons where the preset says sentence case. `npx trykeyline check --rules` lists all of them, each with the law it comes from.

`/keyline audit` runs it first and spends its own reading on what a detector can't see — hierarchy, grouping, whether a box should exist at all.

Silence a line with a `keyline-ignore` comment on it or the line above, naming the rule if you like (`/* keyline-ignore type/uppercase */`); a whole file with `keyline-ignore-file`. Leave out paths with `--ignore src/content`.

In CI:

```yaml
- run: npx trykeyline check
```

## Presets

The laws hold everywhere. A preset sets the dials — how far the type scale climbs, how much colour is spent, how long motion runs — for what your reader is doing:

| Preset | For a reader who is |
|---|---|
| `editorial` | Reading: articles, docs, portfolios, changelogs |
| `product` | Working: dashboards, tools, anything used daily |
| `expressive` | Being persuaded: landing pages, launches, campaigns |
| `glass` | Getting [modimihir.com](https://modimihir.com)'s exact system, with drop-in tokens and components |

Mixed projects are normal: `product`, with the marketing routes on `expressive`. Any dial can be moved, and the move is recorded in `DESIGN.md` with its reason.

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

Claude Code names a plugin's skills after the plugin, so installed this way the command is `/keyline:keyline init`, `/keyline:keyline critique` and so on. Installed with `npx trykeyline install`, it's `/keyline`.

**With the [`skills` CLI](https://github.com/vercel-labs/skills):** `npx skills add Mihirmodi27/keyline --agent claude-code`.

Or run the installer straight from GitHub: `npx github:Mihirmodi27/keyline install`.

### Coming from interface-skills

Keyline replaces both interface-skills packages: the adaptable set became the commands, and the Glass package became the `glass` preset. `npx trykeyline install` finds the old skills and offers to remove them, since their descriptions would compete with Keyline's for the same requests. A `DESIGN.md` written by the old setup skill works as it is.

## Requirements

Node 18 or later, for the installer and for the three scripts the skill runs: the detector, a token inventory and a contrast checker. None of them needs a dependency, a model or an API key.

## Licence

MIT © Mihir Modi
