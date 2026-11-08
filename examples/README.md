# Examples

Four pages, each built by a plain coding agent from a short brief, then improved twice by fresh agents: once with Impeccable, once with Keyline. They are the before-and-afters the landing page shows, and a regression suite for the skill: rerun Keyline on `before/` after changing a guide, and compare.

| Scene | Brief | Preset | Detector: before → Impeccable → Keyline |
|---|---|---|---|
| [`dashboard`](dashboard/) | Analytics dashboard for a SaaS tool | `product` | 41 → 5 → 0 |
| [`settings`](settings/) | Account settings for a project-management app | `product` | 15 → 1 → 0 |
| [`landing`](landing/) | Landing page for a scheduling app | `expressive` | 69 → 13 → 0 |
| [`article`](article/) | Engineering-blog article | `editorial` | 39 → 22 → 0 |

Detector counts are every finding (errors, warnings and info). `before/` has no `DESIGN.md`, so it is checked without a preset; `after/` is checked against the one `init` wrote. `impeccable/` has Impeccable's own Stitch-format `DESIGN.md`, which names no Keyline preset, so it is checked without one. The detector is Keyline's, so read the middle column as how far Impeccable's output lands from Keyline's laws, not as a score of Impeccable.

## How each was made

1. **`BRIEF.md`** — a short client brief, ending "Make it look modern and polished", the way people ask.
2. **`before/`** — a fresh agent with no Keyline and no design skills read only the brief and built the page as static HTML and CSS. Nothing was edited afterwards.
3. **`after/`** — a fresh agent copied `before/`, ran `/keyline init` (the preset was given; everything else was its own recommendation) and `/keyline polish`, using only the skill's files.
4. **`impeccable/`** — a fresh agent copied `before/` and ran Impeccable (installed 2026-11-06) with no other skill and without seeing `after/`: `teach` first, because its polish won't run without a `PRODUCT.md`, answering teach's interview as the brief's client and taking its defaults where the brief is silent; then `polish` on the whole page. `impeccable-notes.md` is that agent's account of what changed.
5. **`steps/1-type` … `steps/6-patterns`** — the page after each domain's pass, in polish order; `after/` equals `steps/6-patterns`.
6. **`notes.json`** — what each pass changed, with the law and measured values, for the landing page's annotations.

The `after/DESIGN.md` in each scene is what `init` wrote and the passes updated: the open issues and decisions there are the agent's.

## Screenshots

```sh
node examples/shoot.mjs            # every scene, every state, light
node examples/shoot.mjs landing --dark
```

Writes `<scene>/shots/<state>-fold.png` (first 1440×900), `-desktop.png` (full page) and `-phone.png` (500px wide — headless Chrome clamps anything narrower). They're ignored by git.
