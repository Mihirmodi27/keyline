# `/keyline layout`

**Guide:** `domains/layout/guide.md` · **`DESIGN.md` section:** `## Layout` · **Procedure:** `commands/refine.md` · **Alias:** `spacing`

Lets the layout carry the hierarchy: one reading measure every template shares, spacing that groups (a heading closer to what it introduces than to what came before), radii that nest, line weights by job, one z-index ladder, breakpoints named for what changes, and boxes only where something is genuinely a separate object.

Typical finds: equal margins above and below a heading; every section in a card, cards in cards, a bento grid of unlike things; a radius inside a radius that doesn't subtract the padding; `z-index: 9999`; a hover-only control with no touch path; content that unmounts when collapsed. Deeper references: `measure-and-rhythm.md`, `radius-lines-and-layers.md`, `forks-gating-and-disclosures.md`.
