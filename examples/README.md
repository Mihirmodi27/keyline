# Examples

Four pages, each built twice from the same brief: once by a plain coding agent, then improved by the same kind of agent running Keyline. They are the before-and-afters the landing page shows, and a regression suite for the skill: rerun Keyline on `before/` after changing a guide, and compare.

| Scene | Brief | Preset | Detector, before → after |
|---|---|---|---|
| [`dashboard`](dashboard/) | Analytics dashboard for a SaaS tool | `product` | 41 → 0 |
| [`settings`](settings/) | Account settings for a project-management app | `product` | 15 → 0 |
| [`landing`](landing/) | Landing page for a scheduling app | `expressive` | 69 → 0 |
| [`article`](article/) | Engineering-blog article | `editorial` | 39 → 0 |

Detector counts are every finding (errors, warnings and info). `before/` has no `DESIGN.md`, so it is checked without a preset; `after/` is checked against the one `init` wrote.

## How each was made

1. **`BRIEF.md`** — a short client brief, ending "Make it look modern and polished", the way people ask.
2. **`before/`** — a fresh agent with no Keyline and no design skills read only the brief and built the page as static HTML and CSS. Nothing was edited afterwards.
3. **`after/`** — a fresh agent copied `before/`, ran `/keyline init` (the preset was given; everything else was its own recommendation) and `/keyline polish`, using only the skill's files.
4. **`steps/1-type` … `steps/6-patterns`** — the page after each domain's pass, in polish order; `after/` equals `steps/6-patterns`.
5. **`notes.json`** — what each pass changed, with the law and measured values, for the landing page's annotations.

The `after/DESIGN.md` in each scene is what `init` wrote and the passes updated: the open issues and decisions there are the agent's.

## Screenshots

```sh
node examples/shoot.mjs            # every scene, every state, light
node examples/shoot.mjs landing --dark
```

Writes `<scene>/shots/<state>-fold.png` (first 1440×900), `-desktop.png` (full page) and `-phone.png` (500px wide — headless Chrome clamps anything narrower). They're ignored by git.
