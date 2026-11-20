# When the guard speaks

Keyline may run as a live guard: after you edit a UI file, a hook checks that file with `check.mjs` and adds a note beside the tool result that starts **`Keyline guard:`**, listing errors and warnings as `file:line severity rule (law): message`. That note is Keyline's detector, not the user, and it's about the edit you just made. Before moving on:

- **Fix each finding now**, in the project's own tokens — the message names the fix. Errors first. Fixing means changing the code, not adding an ignore comment.
- **A finding that names what already exists** — a token a raw value equals, a component the new one copies or a hand-styled element duplicates — is fixed by using that name: the token, or the component with a variant. If the new one really is a different thing, say what makes it different, and give it a look of its own.
- **A deliberate exception** — a decision recorded in `DESIGN.md`, or a case the rule can't see — gets `keyline-ignore <rule>: <reason>` in a comment on that line, with a real reason. Say which you ignored and why.
- **A finding outside your task** (the file was already like that): fix it if it's small and in what you touched; otherwise mention it and leave it.
- **Don't argue with it in a loop.** If a fix brings the same finding back twice, stop, say what you tried, and move on.

The guard is off when `KEYLINE_GUARD=off` is set or `DESIGN.md` has a `| Guard | off |` row under `## Profile`; don't turn it off yourself unless the user asks.
