---
name: keyline
description: "Design, review and fix interfaces with one set of laws applied in the project's own tokens, names and character. Commands: init (scan the codebase and write DESIGN.md), sync, critique, audit, type, color, layout, depth, motion, patterns, polish. Use when the user wants to set up or document a design system, review or audit a UI, or improve typography, type scale, font weights, colour, contrast, theming, dark mode, spacing, padding, alignment, layout, hierarchy, radii, z-index, cards, shadows, elevation, glass or translucent surfaces, animation, transitions, hover and focus states, reduced motion, UI copy, labels, buttons, forms, dialogs, empty states, dashboards, tables, agent and AI chat interfaces — on websites, landing pages, apps and components. Also for screens that feel generic, boxy, cluttered, flat, noisy, inconsistent or template-made, and for building new UI that should look considered from the first commit. Not for backend-only work."
---

# Keyline

Keyline gives an agent the judgement of a careful interface designer, as laws it can apply and check. **The laws are the same for every project; the values never are.** A setup pass reads the codebase once and writes `DESIGN.md`, which maps the project's own token names onto Keyline's roles and picks a preset for its reader. Every other command works through that file, in the project's names.

Paths in these files are relative to this skill's folder. In shell commands it is written `<keyline>` — substitute the folder this file is in.

## Running it

`/keyline <command> [target]` — the target is a route, file, directory or component; without one, the command takes the whole project, or the screen the conversation is about.

| Command | Does | Changes code |
|---|---|---|
| `init` | Scans the codebase, maps its tokens onto roles, picks a preset, writes `DESIGN.md` with the open issues it found | No |
| `sync` | Reconciles `DESIGN.md` with code that has moved since: drift, new tokens, issues fixed or new | No |
| `critique` | A designer's read of one screen: what the reader feels first, what's working, the few changes that matter most | No |
| `audit` | Every law checked with evidence, per domain, scored; findings go to `DESIGN.md` | No |
| `type` | Type scale, weights, leading, tracking, emphasis, numerals, fonts | Yes |
| `color` | Tokens by intent, text tiers by measured contrast, status colours, themes | Yes |
| `layout` | Measure, spacing that groups, radii, line weights, z-index, breakpoints, empty states | Yes |
| `depth` | Elevation levels, shadows, edges, scrims, translucent surfaces and their fallbacks | Yes |
| `motion` | Durations, curves, springs, open and close, reduced motion, scroll, hover intent | Yes |
| `patterns` | Behaviour and words: labels, buttons, destructive actions, forms, agent UIs, dashboards | Yes |
| `polish` | All six domains in order, one reviewable pass each | Yes |

**No command named?** Pick the one the request is about, say which, and go: "set up", "document", "extract" → `init`; "review", "what's wrong", "feedback" → `critique`; "check everything", "lint", "score" → `audit`; "font", "headings", "typography" → `type`; "colour", "contrast", "dark mode" → `color`; "spacing", "padding", "alignment", "cramped" → `layout`; "shadow", "card", "glass", "modal" → `depth`; "animate", "transition", "feels janky" → `motion`; "copy", "labels", "form", "dialog" → `patterns`; "make it better", "clean this up", "finish" → `polish`. Building something new runs the relevant domains' **Building it for a project** sections, in polish order. `colour`, `typography`, `spacing`, `animate` and `copy` work as aliases.

## Before any command

1. **Read `DESIGN.md`** at the project root. `## Profile` gives the preset and any areas on another preset; each domain has its own section; `## Decisions` overrides the preset's defaults and must be respected; `## Open issues` is what's already known.
2. **No `DESIGN.md`:** for `init`, that's the job. For anything else, run `init`'s scan and mapping for the domains this command touches, do the task, then recommend a full `/keyline init`. Don't refuse.
3. **Load the command's file**, `commands/<command>.md`. It says which guides to read; read them, don't work from memory of them.
4. **Preset `glass`:** the exact system from modimihir.com. Read `glass/<domain>/guide.md` beside each domain guide; its values and `assets/` are the recipes.

## What every command holds to

- **The project's names, always.** Reason in roles (`text.secondary`, `duration.small`), write code in whatever the project calls them. Never rename a project's tokens; never add a second token system beside the first.
- **Measure, don't estimate.** Mechanical laws are checked by `<keyline>/scripts/check.mjs`; contrast comes from `<keyline>/scripts/contrast.mjs`; inventories from `<keyline>/scripts/scan.mjs`; counts from the code. A finding carries its evidence: a ratio, a count, a `file:line`.
- **Laws hold under every preset; dials move between them.** A change that would break a law, or move a dial off the preset, is said out loud and asked about first. When the user agrees, it goes under `## Decisions` with its date and reason.
- **Keep what the design already chose.** An existing interface keeps its brand colour and gradients wherever they do a job, and its corners stay at least as round. Only a law removes something, and the report names that law: a pass that leaves the screen greyer or boxier than it found it has to say why.
- **Findings are not fixes.** `init`, `sync`, `critique` and `audit` change no code. The refining commands change only what their domain owns, and name the owning domain for anything else they notice.
- **Write back.** A decision that changes the system — a new role, a moved dial, a law knowingly broken — goes into `DESIGN.md`, so the next session starts from it. Fixed issues come off `## Open issues`.
- **Look at the result.** When the project can be rendered, render it after a change and look at both themes, a narrow width, and reduced motion where they apply. Code that reads right can still look wrong.

## Where things are

| Folder | Holds |
|---|---|
| `commands/` | One file per command: what to read, the steps, what to report |
| `system/` | Setup: the canonical `roles.md`, the four `presets.md`, the `design-md.md` format, `detection.md` for each stack |
| `domains/<domain>/` | Each domain's `guide.md` — laws, dials per preset, building, auditing, checklist — and its deeper references |
| `glass/<domain>/` | The `glass` preset: modimihir.com's exact values, with drop-in tokens and components in `assets/` |
| `scripts/` | `check.mjs` (the detector: 24 mechanical laws, `--json`, exit codes for CI), `scan.mjs` (token and value inventory) and `contrast.mjs` (measured contrast, translucency composited). Node 18+, no dependencies |
