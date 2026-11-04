# How a refining command works

`type`, `color`, `layout`, `depth`, `motion` and `patterns` share one procedure. Each command's own file names its guide and what it covers; this is the rest.

1. **Read the domain's `guide.md` in full**, and the references its laws point to for the parts the target touches. Under preset `glass`, read `glass/<domain>/guide.md` too, and take values and components from its `assets/`.
2. **Read the domain's section of `DESIGN.md`** and every `## Decisions` entry it covers. A decision beats a dial; never "fix" a decided value back.
3. **Find the problems first.** Run `node <keyline>/scripts/check.mjs <target> --root <project root> --rule <domain>` for what can be checked mechanically, then the guide's `## Auditing existing code` on the target only, and list what breaks a law before changing anything. With no target, take the screen the conversation is about; if there isn't one, ask which, or offer the whole project as a longer pass.
4. **Fix in the project's names**, at the smallest scope that removes the cause — a token over twenty call sites, a shared component over its instances. Add a role only where the guide's `## Building it` says one is missing, in the project's naming style, marked `proposed` in `DESIGN.md`. Where the project has no tokens for the domain at all — no type tokens, no motion tokens — propose a full set in the project's style, each marked `proposed`, and fix against it.
5. **Stay in the domain.** Something another domain owns — a colour noticed while fixing type — is reported with its owning command, not fixed. The exception: a fix that belongs to an earlier domain in polish order but only became visible in this pass — the note this pass made from a callout now needs its type role — is made here, and reported as that domain's.
6. **Sweep.** A change to a shared rule applies everywhere the rule does: walk every route that uses it and report what moved. A partial update is the commonest interface bug.
7. **Look at it** rendered, before and after, in each theme and at a narrow width; for motion, also with reduced motion on.
8. **Write back** to `DESIGN.md`: the domain's section if a role or value changed, `## Decisions` for anything moved off the preset (with the user's go-ahead) and for any change a law forced that a later session might undo (marked *law*), and strike fixed `## Open issues`.
9. **Run the guide's `## Checklist`** on what you changed, and the detector again on the target: nothing you touched should still be flagged.

**Two limits hold in every pass:**

- **The brief wins over the preset.** An element the product or its brief requires stays, even where a dial or a law would cut it — a dashboard's activity feed, a top bar the product has. The pass changes how it's built, not whether it exists.
- **Improving is not restructuring.** Improving an existing screen doesn't move its navigation or add features — a collapsible icon rail, a theme toggle, a new view. Those go under `## Open issues` unless the user asks for them.
- **Improving keeps what the design already chose.** Its brand colour and gradients stay wherever they do a job, and its corners stay at least as round as they were. A dial describes a new system, so an existing design is never greyed or sharpened to fit one. Only a law removes something, and the report names it. When a pass would make the screen plainer than it was, check whether a law actually asked for that.

**Report:** what was wrong, as a reader would feel it; what changed, by token or component, with the law; what was measured (sizes, ratios, durations); and anything noticed outside the domain, with its command.
