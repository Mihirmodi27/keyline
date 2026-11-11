# Colour and Theming

A near-monochrome reading site, a dense product with a full status palette and a brand page spending colour broadly differ in how much colour they spend, not in how it is organised: **a colour token encodes a job, not a lightness.** `border.default` is not "a bit darker than the hover surface", it is *the colour an edge is*. Indexed by intent, picking a colour means naming a role, a reviewer can catch a mistake in the diff, and a second theme is a re-tint of the same names rather than a second palette.

## Before you start

Reads `DESIGN.md` `## Colour`.

## Laws

### 1. A token is named for its job, not its lightness

**Every colour in the interface is a token, and every token answers one question — "what colour is a border?", "what colour is a pressed surface?" — never a position on a lightness scale.**

Indexed by lightness (`gray-100` lightest, `gray-900` darkest), every pick is a judgement — "a border, so… 300? 400?" — and six months later there are four border greys. Indexed by intent, the question has one answer, and a border at the pressed-surface step is visibly wrong in review. Brand hues too: `indigo-50` to `indigo-900` must still say which step is `accent`, `accent` hovered and `surface.selected`; `bg-indigo-600` here and `bg-indigo-700` there on one button means the ramp does no work. Map steps to roles; components reference the roles.

- **Intent can beat monotonicity.** A border sits *beside* content and must stay quieter than a pressed surface, which sits *under* it, so in light the border step may legitimately be lighter — in the Glass preset, `gray-400` (border) is lighter than `gray-300` (pressed).
- **"I need something between two steps" is a misdiagnosis.** The element has a different job from the one assumed; if no role fits, it's a new role, named and recorded — not an inline hex.

The allowed literals:

- **Illustration.** Colours inside an image, SVG artwork, or an HTML or SVG product mock or diagram marked `role="img"`. Text in it that a reader is meant to read still clears 4.5:1 against what is behind it.
- **Third-party marks.** Logos and provider marks — Google's, Slack's, a calendar provider's dot — keep their own colours. They are marks, not interface hues, and count against neither the one accent nor the exceptions (law 7).
- **Multi-layer values** built once as a shared constant (law 10).

### 2. Text tiers are their own tokens, never border steps

**A text colour is picked for text contrast, never a mid-ramp step borrowed from the border and fill range.**

Text needs 4.5:1 against its surface; a border or icon a user must see to operate a control, 3:1; a decorative edge, only visibility. One value rarely serves both, least in a *light* theme, where mid steps are light tints on white: a timestamp borrowing a border-hover step can sit at 1.66:1.

Dark mode hides this — the same indices sit far lighter on near-black, so every mid step passes, and a system reviewed in dark ships a light theme whose body copy fails. So `text.primary`, `text.secondary`, `text.tertiary` and any tiers between are separate tokens. Icons take their label's tier or one below — an icon has more visual mass than text at the same value — and both advance together on hover. Decorative marks with no text (bullets, dots, inactive rail markers) are `mark`, stay on the ramp and aren't held to text contrast; kept faint, a list doesn't read as a column of dark dots.

### 3. The ladder clears the floor and strictly descends, measured where it's worst

**Every text tier clears 4.5:1 against the worst surface it actually lands on, in the worst theme, and each tier is measurably below the one above it.**

- **Computed, not estimated.** Use `<keyline>/scripts/contrast.mjs` (`--ladder <surface> <tier> <tier> …`, top tier first), which composites translucent colours first — the number the reader sees. Where the surface itself is translucent — a wash over a surface, a glass header over an image — `--over <backdrop>` composites it over the backdrop before the text is measured: `node <keyline>/scripts/contrast.mjs --over "#0b1220" --ladder "rgba(250,250,250,0.82)" "#16161a" "#4b4b52"`.
- **The worst surface, not the page.** Tertiary text may pass on `surface.page` and fail on `surface.hover`, `surface.subtle` or `surface.selected`; measure on the surface leaving least contrast — the darkest in light, the lightest in dark.
- **Strictly descending, with a step you can see.** Above 4.5:1 the tiers crowd into a narrow band, and it's easy to pass WCAG and lose the hierarchy — tiers at 5.1 and 4.9 are one tier with two names. `--ladder` flags a tier not below the one above; the minimum *size* of the step is a dial.

### 4. Anything on an unknown backdrop takes a translucent colour

**A border, divider, hairline or hover wash that can sit over anything but a known opaque surface uses a translucent value, and that translucent set inverts between themes.**

A solid border on a translucent panel ignores what's behind it, and over a photograph or a scrolled page reads as a frame pasted on top; a translucent one — "a little more contrast than whatever is here" — stays right over anything. That is black at low alpha in light and *white* in dark, because a dark-mode edge is lighter than its surface and a black overlay would disappear. Built once, with the same role names in both themes, it needs no per-component theme branching.

`border.layered` is the canonical role; project roles under it are fine. Translucent *material* tints are colours and live here (as runtime values, law 10); blur, edge, shadow and fallback surface belong to the depth guide.

### 5. Focus is findable on every surface

**The focus colour clears 3:1 against every surface it can land on, is drawn with a gap of page colour between it and the element, and nothing it sits next to shares it.**

```css
:focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: 2px;
}
a:focus-visible { outline-offset: 3px; } /* ragged inline edges need more room */
```

`:focus-visible`, never `:focus`, so a click leaves no ring — except a skip link, which must appear on keyboard focus regardless of heuristics. The offset makes the ring an object, not a border; `outline`, not `box-shadow`, because forced-colours mode removes shadows and keeps outlines. `outline: none` without a replacement is a bug under every preset.

Focus may share a token with `accent` but may not sit beside it: an accent ring round an accent button on an accent-tinted row is invisible exactly where it's needed. If the accent is everywhere, the ring gets a different colour or a double ring (page-colour inner, focus-colour outer). Status colours keep out of the focus hue for the same reason.

A dark band on a light-only page — a testimonial strip, a closing call to action — is a local theme: `focus` is overridden inside it, like its surfaces and text, and measured against the band.

### 6. Colour never carries a signal alone

**Every state or status expressed in colour is also expressed in something that survives without colour — an icon, a word, a weight, a rule, a marker, a position.**

About one man in twelve has some colour-vision deficiency, and every reader loses hue in sunlight, greyscale screenshots, cheap projectors; a red border as the only sign of an error tells them nothing. Status is an icon plus a sentence, with colour reinforcing both: **shape carries the state, colour confirms it.** A status glyph whose shape moves with the work, a ring that fills until it is a check, reads in greyscale; so do priority bars. The case people miss is state *within* a neutral system: once every tier clears 4.5:1 only two or three greys are readable, too close to mean "selected" or "current", so a nav item marked active only by being one tier darker needs a rule, a marker, a fill or a weight as well.

A status palette is a set of **pairs**, each a foreground at 4.5:1 on the page and its own tint plus a tint that reads as a surface, not a highlighter, re-picked per theme.

→ Status pairs with a worked set, the glyph shapes, and the exception test in full: `domains/color/status-and-exceptions.md`

### 7. Colour is spent structurally

**Every hue has one job, written down. Each chromatic spend beyond the accent and the status palette is named for what it's for, with a reason that can't spread to another element or another job, and contained so that only the mark takes the colour.**

Colour is attention, spent because of what the element *is*, never as decoration. "It's important", "it's new" or "it's the brand colour" can spread, and becomes a palette within two components, because every author thinks their element qualifies; a reason naming a category of one can't. Only the mark takes the colour, never the text inside. Record each as `exception.<what-it's-for>` in `DESIGN.md`, a family as `exception.<question>.<member>`, with its reason; how many a system holds is a dial. First ask whether weight, position and space can do the job. Most can. That test is for colour being *added*.

**Colour the design already has stays.** When improving an existing interface, its brand colour stays wherever it does a job: the selected nav item, the primary data series, a progress or usage bar, a brand mark, the gradient every avatar shares. Each of those is the owner's decision and part of how the product is recognised. Turning it grey is a regression that no law asks for. Colour comes out only when it breaks a law, and the change cites that law: text under its contrast floor, a second hue competing with the primary action, colour carrying a state on its own, or body text dyed for emphasis. Even then, the first fix is the shade (re-pick it until it passes) rather than taking the colour away. Muting the brand for calm is a dial for a new system, not a fix for an existing one.

**One hue acts.** The accent's jobs — primary action, focus, "your turn" — share one hue, and it marks one action per view. A second highlight hue beside it splits one meaning in two; whatever wanted it goes to a status pair, a neutral marker or weight.

**Where the reader *is* takes the accent as a tint, not a fill.** Under product and expressive, the current nav item sits on `surface.selected`: the accent at about 25% over the surface it sits on, with the icon and label in `accent.ink`. Measure that label at 4.5:1 on the tint in each theme, and deepen the ink, not the tint, until it passes. The tint marks a place and the solid fill marks the action, so the selected item and the primary button never read as two calls to act. A page tab marks its current tab with layout law 3's underline instead, in `text.primary`. **This is the one definition of current**: the type guide adds weight to it, the motion guide moves it, neither re-picks it. Editorial and glass keep the current item neutral (a marker, a rule or weight), because a reading page has little chrome and the accent there belongs to focus.

**"Too grey" is answered with jobs, not decoration**: one hue family per question the reader can't answer at a glance — what, how, where, who — and no hue crosses into another's job. Whether done takes success colour is a dial; a chart's primary series takes the accent at full strength; code takes syntax highlighting under every preset, counted against no limit.

→ The exception test and containment, hue families, figures, done states, charts, live and AI marks, destructive rows: `domains/color/status-and-exceptions.md`

### 8. A theme is a re-pick, not a reuse

**Every coloured value — accent, focus, status pair, exception, each hue in a family, every stop of every gradient — is chosen afresh for each theme and measured there.**

- **Accents.** A hue at 4.5:1 on white has far less on near-black; reused, it dims the ring and links. Re-pick its lightness (usually trimming chroma) and re-check `text.on-accent`, which often flips from light to dark. A dark fill that keeps white text is too dark to be text on the dark page; no one value is both, so dark adds a lighter `accent.ink` for links, icons and brand text.
- **Small marks, against every ground.** Area colours shared across themes fell to 1.8:1 on a light frame. A mark the reader needs clears 3:1 on every ground it sits on — panel, frame, hover row — in each theme.
- **Gradients move every stop.** The darkest stop can sit a few points above a dark page and vanish down half its length; lightening only that stop compresses the ramp until it isn't one gradient. Move every stop by roughly the same amount.
- **Near-black, not black.** Dark `surface.page` sits a little above `#000`: pure black gives shadows nothing to sit on and glares against light text. Light `text.primary` is near-black too: pure black on white halates at small sizes.
- **"Raised" is ordered, and in dark it is lighter** (depth law 5). Dark fills are tinted, not darkened, so they don't punch a hole in the page.
- **Not a mechanical inversion,** which puts every gap in the wrong place. Space each theme's surfaces by contrast against *its own* page, so hover and pressed read as the same steps in both, with a large jump between the last edge step and the lowest text tier.

### 9. One mechanism sets the theme, before first paint

**When the user can choose a theme, an attribute or class on the root element is the mechanism — not the `prefers-color-scheme` media query — and it is set by a blocking inline script before the stylesheet applies.**

A toggle and a media query are two sources of truth, and once a user has chosen, the OS shouldn't win; the media query may seed the first visit, not be the switch. (Without a toggle it is the only source, and fine.)

The script is inline in `<head>`, blocking, before the stylesheet, and in `try/catch` because storage throws in some privacy modes. Skip any of the four and dark-mode users get a white flash on every load, the most noticeable bug a themed site can have. Under SSR, render the attribute from a cookie. Declare `color-scheme` per theme, or scrollbars, form controls and autofill stay light on a black page.

### 10. Values that change by context are runtime; the vocabulary is build-time

**A value that has to change with theme, user preference or container is a runtime custom property on the root; the fixed vocabulary may be build-time tokens. Anything that isn't a single colour — a gradient, a shadow stack — is runtime regardless.**

A build-time token (a Sass variable, an inlined JS constant, a static theme object) can't be re-declared by a media query, so `prefers-reduced-transparency`, `prefers-contrast: more` and the toggle can't reach it; and no token system has a slot for `linear-gradient()` or a four-layer `box-shadow`. A preference block re-declaring theme values at the same specificity goes **after** every theme block and names every theme selector.

→ The head script, persistence, two or three states, the crossfade, theme islands, runtime vs build-time per stack, preference overrides: `domains/color/theming-mechanics.md`

## Dials

| Dial | editorial | product | expressive |
|---|---|---|---|
| Palette | Near-monochrome neutral | Near-monochrome neutral plus a status palette | Brand palette used broadly, each hue placed by rule |
| Neutral chroma (OKLCH C) | 0–0.01 | 0–0.015, toward brand hue | 0–0.03, toward brand hue |
| What the accent does | Focus, and nothing else | Primary action, focus, selection, the primary data series | Brand surfaces, action, focus, selection |
| Brand colour already in the design | Kept where it has a job | Kept where it has a job | Kept where it has a job |
| Chromatic exceptions beyond accent and status | ≤ 1 | None by default; a hue family per question the reader can't answer at a glance (what, where, who), plus one-member exceptions — each listed | ≤ 4, each named |
| Hues that call for action | 1, the accent | 1, the accent | Brand hues, each placed by rule |
| Completed states | Uncoloured | `status.success` where completion is the news; uncoloured in a sequence passed through | Uncoloured, or per brand, sequences included, counted among the exceptions |
| Current location | Uncoloured: a marker, rule or weight | `surface.selected` (law 7) with icon and label in `accent.ink` | As product, or per brand |
| Link colour | Text colour, underlined | `accent` | `accent` or a brand hue, underlined in prose |
| Text tiers, `text.primary` to `text.tertiary` | 3–5 | 3 | 3–4 |
| Minimum step between adjacent tiers (ratio of ratios) | 1.15× | 1.4× | 1.25× |
| `text.tertiary` target on its worst surface | ≥ 4.6:1 | ≥ 4.8:1 | ≥ 4.6:1 |
| Status palette | Only if something reports state | `danger`, `warning`, `success`, `info` — required | As needed |
| Theme control | Light and dark, following the device; a toggle optional, two-state if added | Light and dark, following the device; a toggle optional, light, dark and system if added | One theme allowed; if two, following the device, a toggle optional, two-state if added |
| Dark `surface.page` lightness (OKLCH L) | 0.14–0.18 | 0.17–0.21 | 0.12–0.18 |

**Palette and neutral chroma.** Near-monochrome makes the accent and the one exception loud by default, but every state must then be carried by something other than colour (law 6). Tinted greys tie to the brand, but past about 0.015 chroma they read as colour, and a tinted `text.tertiary` beside a status foreground can look like a status.

**Exceptions and done.** An editorial page's content is prose, so its colour can be the one offer, and nothing on it is a task to finish. A product holds many kinds of record in many places by many people and is scanned, not read; in grey alone every row must be read to be sorted, which is usually what "too grey" means, and its boards exist to show what got done. So it starts from the status palette alone and adds a family, or colours done, when a question can't be answered at a glance, never because a screen looks plain.

**What the accent does.** Restricted to focus, colour *is* where the keyboard is. On primary actions it shows a working user the next step — worth it in a product, at the price of law 5's care for the ring beside accent buttons.

**Links.** Text-coloured links keep a reading page calm and leave colour for focus, but must be underlined because colour isn't carrying them. Accent links scan faster in a product, where links are navigation, not citation.

**Tiers, step and tertiary target.** More tiers give prose finer emphasis, but each must clear the floor, so every extra one shrinks the steps; a light theme rarely fits more than five. A product has fewer, more distinct tiers, told apart at a glance across a dense table, and a wider margin above 4.5:1 to absorb the surfaces the floor wasn't measured on (hover, selected, zebra rows).

**Theme control.** Following the device needs no control and no head script (law 9). A toggle, where one is wanted: two states are predictable; "system" changes the page when the OS crosses sunset, surprising someone who chose from the page's menu. Three follow the OS for those who want it, and cost a live listener.

**Dark page lightness.** Lower is more dramatic but leaves less room below the raised steps; a product's dark theme stacks panels, so its page sits higher.

## Building it for a project

1. **List the jobs.** From `roles.md`, keep the colour roles this project has and strike the rest — no dark theme, no dark column; no status, no status rows. Add project roles under their nearest parent.
2. **Choose the neutral:** a hue (the brand's, or none) and a chroma from the dial, in OKLCH.
3. **Fix the ends, per theme:** `surface.page` and `text.primary` near-white and near-black in light, the dial's dark lightness and a light grey in dark.
4. **Place surfaces and lines** (`surface.raised`, `surface.hover`, `surface.pressed`, `surface.subtle`, `border.default`, `border.hover`) as small steps down from the page in light (or `surface.raised` a step up, white on a grey page), up in dark, spaced by contrast against it; what must be seen (an input's edge, an icon, the focus ring) clears 3:1.
5. **Solve the text tiers from contrast targets** (tertiary at the dial's target, the rest at least the minimum step apart) on each tier's worst surface; verify per theme with `contrast.mjs --ladder`.
6. **Derive the accent from the brand hue**, per theme: `text.on-accent` at 4.5:1 and `focus` at 3:1 on every surface; then its hover and the `surface.selected` tint (law 7; translucent, so it re-tints with the theme), re-measuring the lowest text tier on it too.
7. **Status pairs**, if the preset needs them; **exceptions and hue families**, each passing law 7, every mark at 3:1 on its grounds.
8. **The translucent set**: black at low alpha in light, white in dark, for `border.layered` and any layered washes.
9. **Write it** as custom properties, one block per theme, with the framework's tokens pointing at them (law 10), and record the ratios in `DESIGN.md`.

→ The contrast formula, surface spacing, the brand ramp, per-preset targets, and *Harbour*, a worked `product` example with a teal hue, measured on its worst surfaces: `domains/color/deriving-a-ramp.md`

## Auditing existing code

Collect evidence, then measure. The greps assume CSS, Tailwind or CSS-in-JS; adapt them.

| Look for | Grep for | Law |
|---|---|---|
| Colour literals outside token files and artwork | `#[0-9a-fA-F]{3,8}\b`, `rgba?\(`, `hsla?\(`, `oklch\(` | 1 |
| The same job at several values | every value used for borders; for captions and meta | 1 |
| Mid-ramp steps used as text | `text-(gray\|neutral\|slate\|zinc)-(300\|400\|500)`, or the project's equivalent | 2 |
| Icons on a text-primary tier by default | icons with the top text colour at rest | 2 |
| Solid borders on translucent surfaces | `backdrop-filter` elements, then their border values | 4 |
| Lost focus | `outline:\s*(none\|0)`, `:focus\b` without `-visible`, `ring-0` | 5 |
| Colour-only status | error or success styling with no icon or message; nav active by colour alone | 6 |
| Uncounted colour | each hue outside accent, focus and status, and its job; third-party marks and `role="img"` illustration aside | 7 |
| Greyed brand (when comparing to the original) | a brand colour or gradient the original spent on selection, a data series, a meter, a mark or avatars, now grey or muted with no law cited | 7 |
| A second action hue; done coloured against the dial | two hues on buttons, links or "needs you" markers; success colour on passed steps, checks or the current nav item | 7 |
| A hue doing two jobs | a type or area hue on state or text; danger red on a live or recording state; status colour on a plain count or a zero | 7 |
| Reused accents and half-moved gradients | some gradient stops re-declared per theme, not all; single-value accents | 8 |
| Faint marks | type, area and person hues shared across themes; each measured at `--min 3` on panel, frame and hover | 8 |
| Pure black | `#000\b`, `#000000`, `black` on surfaces | 8 |
| Two theme mechanisms | `prefers-color-scheme` in CSS alongside a toggle; missing `color-scheme` | 9 |
| Flash of wrong theme | theme set in a component effect, not an inline head script | 9 |
| Compiled context values | build-time tints or gradients a preference query must replace | 10 |

Then measure, in every theme: each text tier on its worst surface (`contrast.mjs --ladder`), the focus colour at `--min 3` on every surface it can land on, each status foreground on the page and its tint.

## Writing back to DESIGN.md

- **The ratios.** Every text tier and the focus colour, per theme, with the surface measured on; re-measure when a value in `## Colour` changes.
- **New roles.** Any you added — a missing `surface.selected`, a tier between secondary and tertiary — in the project's naming style, marked `proposed` until accepted.
- **Exceptions.** Each `exception.<name>` under **Exceptions**: what it's for, and why that reason can't spread; a family with its question, its members and the marks it may take.

## Checklist

- [ ] Control edges and icons that must be seen clear 3:1.
- [ ] Each `status.*` is a fg/bg pair per theme, fg at 4.5:1 on the page and its tint.
- [ ] Dark `surface.page` and light `text.primary` are near-black, not `#000`; `color-scheme` is declared in every theme.
- [ ] Every brand colour and gradient the original spent on a job is still there, or the law that removed it is named.
- [ ] Product and expressive: the current nav item's label clears 4.5:1 in `accent.ink` on its tint; the primary chart series is the accent at full strength.
