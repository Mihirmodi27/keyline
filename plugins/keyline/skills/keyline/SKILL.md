---
name: keyline
description: "Design, review and fix interfaces with one set of laws, applied in the project's own tokens and names. Commands: init (write DESIGN.md), sync, critique, audit, type, color, layout, depth, motion, patterns, polish. Use to set up or document a design system, critique or audit a UI, or improve typography, colour, contrast, dark mode, spacing, layout, hierarchy, cards, shadows, glass and translucent surfaces, animation, hover and focus states, UI copy, forms, dashboards, and agent and AI chat interfaces. Also for screens that feel generic, boxy, cluttered or template-made, and for building new UI. Not for backend-only work."
---

# Keyline

Keyline gives an agent the judgement of a careful interface designer, as laws it can apply and check. **The laws are the same for every project; the values never are.** A setup pass reads the codebase once and writes `DESIGN.md`, which maps the project's own token names onto Keyline's roles and picks a preset for its reader. Every other command works through that file, in the project's names.

Paths in these files are relative to this skill's folder. In shell commands it is written `<keyline>` — substitute the folder this file is in.

## Running it

`/keyline <command> [target]` — the target is a route, file, directory or component; without one, the command takes the whole project, or the screen the conversation is about. `/keyline` alone says where the project stands in the flow below and which command comes next.

| Command | Does |
|---|---|
| `init` | Scans the codebase and writes `DESIGN.md` |
| `sync` | Reconciles `DESIGN.md` with code that has moved |
| `critique` | A designer's ranked read of one screen |
| `audit` | Every law checked with evidence, scored per domain |
| `type` | Scale, weights, leading, tracking, numerals, fonts |
| `color` | Tokens, contrast, status colours, themes |
| `layout` | Measure, spacing, radii, lines, z-index, breakpoints |
| `depth` | Elevation, shadows, scrims, translucent surfaces |
| `motion` | Durations, curves, springs, reduced motion |
| `patterns` | Labels, buttons, forms, dialogs, agent UIs, dashboards |
| `polish` | All six domains in order, one pass each |

**No command named?** Pick the one the request is about, say which, and go: "set up", "document", "extract" → `init`; "review", "what's wrong", "feedback" → `critique`; "check everything", "lint", "score" → `audit`; "font", "headings", "typography" → `type`; "colour", "contrast", "dark mode" → `color`; "spacing", "padding", "alignment", "cramped" → `layout`; "shadow", "card", "glass", "modal" → `depth`; "animate", "transition", "feels janky" → `motion`; "copy", "labels", "form", "dialog" → `patterns`; "make it better", "clean this up", "finish" → `polish`. Building something new runs the relevant domains' `## Building it for a project` sections, in polish order (patterns has none; its nearest is `## Iterating on feedback`). `colour`, `typography`, `spacing`, `animate` and `copy` work as aliases.

## The flow

Users shouldn't need to know the commands. A project goes through Keyline in three stages, and every report hands over to the next one.

| Stage | Command | What it leaves for the next stage |
|---|---|---|
| 1. Review | `critique` for a ranked read of one screen, or `audit` for every law, scored | What's wrong, before anything is written down or changed |
| 2. Set up | `init`, or `sync` when `DESIGN.md` already exists | `DESIGN.md`: the project's names, its preset, and the review's findings as `## Open issues` |
| 3. Polish | `polish`, or one domain command when one domain holds the problem | The fixes, recorded back to `DESIGN.md` |

After stage 3 the flow turns over: polish the next screen with open issues, or review a screen nobody has looked at yet. `type`, `color`, `layout`, `depth`, `motion` and `patterns` are stage 3 aimed at one domain; `polish` runs all six.

**Where a project stands**, worked out from the files, in this order:

1. No `DESIGN.md` → stage 1, `critique` on the main screen. **Or:** `audit`, for every law scored.
2. `DESIGN.md` behind the code — style or token files changed in commits made after `DESIGN.md` last was (`git log -1 --format=%cI -- DESIGN.md` against the same for those files; outside git, their modification times) → stage 2, `sync`.
3. `## Open issues` has entries → stage 3, `polish` on the screen most of them fall on. An issue cited at a shared stylesheet's line falls on every screen that uses it; when they spread evenly, take the screen readers see most.
4. Nothing open → stage 1 again, `critique` on a screen no report has covered.

**`/keyline` alone:** show the three stages and mark the one the project is at with its evidence in a line ("no `DESIGN.md` yet", "7 open issues, 4 on `/settings`"). Its **Next** line is the offer; run nothing until the user picks.

**Every report ends with the next step**, as its last line:

> **Next:** `/keyline polish /settings` — stage 3: the four open issues there are layout and colour.

One command with its target, and the reason in the user's terms. A second route goes on its own line as **Or:** only when it's as good a fit: the stage's other command (`audit` beside `critique`), or a different stage the user has asked for — changes now, or a read before any. Each command's file says which command comes next for it. Write the command the way the user calls this skill: `/keyline:keyline` when it runs as a Claude Code plugin, `/keyline` otherwise, or the agent's own prefix if it uses another.

## Before any command

1. **Read `DESIGN.md`** at the project root. `## Profile` gives the preset and any areas on another preset; each domain has its own section; `## Decisions` overrides the preset's defaults and must be respected; `## Open issues` is what's already known.
2. **No `DESIGN.md`:** for `init`, that's the job. `critique` and `audit` are stage 1 and review from the code; their files say how. For anything else, run `init` for the domains this command touches — `## Profile` and those domains' sections — do the task, then recommend a full `/keyline init`. Don't refuse.
3. **Load the command's file**, `commands/<command>.md`. It says which guides to read, and which sections; read them, don't work from memory of them.
4. **Preset `glass`:** the exact system from modimihir.com. Beside each domain guide, read `glass/<domain>/guide.md` for the exact recipes behind the values in `DESIGN.md`; from its `assets/`, take only the files its `## Assets` list names for what you're changing. There is no `glass/patterns/`: patterns take the dials of the preset nearest the reader.

## What every command holds to

- **The project's names, always.** Reason in roles (`text.secondary`, `duration.small`), write code in whatever the project calls them. Never rename a project's tokens; never add a second token system beside the first. Where a role you need has no row, reuse a value already doing that job; otherwise add one in the project's naming style, marked `proposed`.
- **Measure, don't estimate.** Mechanical laws are checked by `<keyline>/scripts/check.mjs`; contrast comes from `<keyline>/scripts/contrast.mjs`; inventories from `<keyline>/scripts/scan.mjs`; counts from the code. A finding carries its evidence: a ratio, a count, a `file:line`.
- **Laws hold under every preset; dials move between them.** A change that would break a law, or move a dial off the preset, is said out loud and asked about first. When the user agrees, it goes under `## Decisions` with its date and reason.
- **Keep what the design already chose.** An existing interface keeps its brand colour and gradients wherever they do a job, and its corners stay at least as round. Only a law removes something, and the report names that law: a pass that leaves the screen greyer or boxier than it found it has to say why.
- **Findings are not fixes.** `init`, `sync`, `critique` and `audit` change no code. The refining commands change only what their domain owns, and name the owning domain for anything else they notice.
- **Write back.** A decision that changes the system — a new role, a moved dial, a law knowingly broken, a change a law forced that a later session might undo (marked *law*) — goes into `DESIGN.md`, so the next session starts from it: roles and values in the domain's section, decisions under `## Decisions` (format: `system/design-md.md`). Open issues are one line each with evidence; fixed ones come off.
- **Look at the result.** When the project can be rendered, render it before and after a change and look at both themes, a narrow width, and reduced motion where they apply. Code that reads right can still look wrong. Smoke-test every page you touched for corners, padding and alignment: mixed corner radii on one screen fail it.
