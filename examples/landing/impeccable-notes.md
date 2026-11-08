# Impeccable on the landing scene

Run: `cp -R before impeccable`, then Impeccable `teach` (no user available, so its interview was answered as the brief's client would, using defaults where the brief is silent), then Impeccable `polish` on the whole page. No other Impeccable commands. Static HTML + CSS, opens from file://; the only external request is the Google Fonts stylesheet that `before/` already loaded.

## What teach decided

- **Register:** `brand` (a landing page; design is the product).
- **Users and purpose:** people who book meetings for distributed teams; the page must explain the overlap idea from the hero visual and get "Start free" clicks.
- **Personality:** fair, calm, exact. Lane: tech-minimal product marketing (the brief only says "modern and polished"; no references were given).
- **Anti-references (teach default):** the generic AI-built SaaS page (a centred eyebrow, headline and subhead in every section, identical icon-over-heading cards, gradient blobs, everything in bordered cards), the hero-metric template, looping decorative motion, decorative glass.
- **Colour strategy:** **Restrained**. Tinted cool neutrals plus one ember accent (about 10% of the surface or less) that means "the chosen time / act here". Blue, amber and green stay inside the product visual. Two night bands give the pacing. Light theme. The scene sentence: a team lead on a laptop in a daylit office between calls.
- **Accessibility:** WCAG 2.2 AA, reduced motion, colour never the only signal, 44px touch targets.
- **Files written:** `PRODUCT.md`, and, because code existed, `DESIGN.md` plus the `DESIGN.json` sidecar in scan mode (`document`, delegated from teach). Creative North Star: "The Shared Clock". After polish, the token values in DESIGN.md and DESIGN.json were updated to match the polished CSS, as polish's "consolidate tokens" clean-up step asks.

## What polish changed

| Area | Before | After |
|---|---|---|
| Bordered boxes | 24 (6 feature cards, 3 step cards, 3 quote cards, 3 plans, 6 FAQ boxes, window, suggestion card, final card) | 6 (3 plans, window, suggestion card, final card). Features, steps, quotes and FAQ are now lists separated by hairlines |
| Feature section | 3×2 grid of identical cards, each with a 44px tinted icon tile above the heading, hover lift | A sticky heading on the left; a two-column list on the right with 1px top rules and a 22px stroke icon inline with each heading; no hover (nothing there is clickable) |
| Drop shadows | 3 shadow tokens; 17 elements shadowed at rest (buttons, pill, step cards, 4 best-hour cells, window, suggestion card, featured plan) plus hover/open shadows on 12 more | 1 token (`--shadow-float`) on 3 elements: window, suggestion card, featured plan |
| Hard-coded colours in CSS | 90 hex/rgba literals, incl. pure `#fff` grounds and text | 0. All colours are OKLCH tokens; neutrals tinted to hue 265 (paper `oklch(99.3% 0.003 265)`, no pure white or black) |
| Decorative gradients | 2 radial blobs and a linear wash behind the hero, 2 on the testimonial band, 2 on the final card, 4 gradient avatars | All removed: flat paper, flat night (`oklch(17% 0.03 268)`), solid avatars |
| Section headings | 5 uppercase tracked eyebrows (13px, 0.08em) repeating the nav ("Features", "Pricing", "FAQ"...); 5 of 6 heads centred | Eyebrows removed; all heads left-aligned on the content edge |
| White text on ember | 2.85:1 (best-hour cells, Send invite, Most popular tag) | Ink on ember 6.23:1 |
| Ember text (eyebrows, icons, labels) | `#e2512a`: 3.86:1 on white, 3.60:1 on tint, 3.47:1 on wash | `oklch(53% 0.18 36)`: 5.64 / 5.34 / 5.00:1 |
| Focus ring on light grounds | `#ff6a3d`, 2.85:1 (below the 3:1 for UI) | Ember text, 5.64:1; bright ember on night bands, 6.39:1 |
| Tertiary text | `#6a7386`: 4.76:1 on white, 4.45:1 on tint (fail) | `oklch(50% 0.025 265)`: 5.89 / 5.57:1 |
| Avatar initials | White on gradients from 2.32:1 (orange) to 3.23:1 | 5.76 to 6.25:1 on solid tones |
| "Off" hour cells | 2.27:1 | 4.76:1 |
| Logo wordmarks (19px bold) | 3.75:1, and a hover colour change on things that are not links | 4.56:1, no hover |
| Check marks / confirm badge | Green on wash 2.92:1 | Badge 4.47:1 (graphic, 3:1 needed); chip text 6.12:1 |
| Motion | Suggestion card floated forever (6s loop); transitions `ease` at 150–200ms; smooth scroll always on | Loop removed; 160ms `cubic-bezier(0.25, 1, 0.5, 1)` (ease-out-quart) on colour/transform only; smooth scroll only under `prefers-reduced-motion: no-preference` |
| Section spacing | Every section 112px top and bottom | `clamp(80px, 10vw, 128px)`; testimonial band and final call to action `clamp(64px, 8vw, 96px)`; logo strip 40/48px |
| Type sizes | Card titles 19px (features) vs 20px (steps, plans); quotes 17px; planner text 9.5px on phones; planner label 11px uppercase | Titles 20px everywhere; quotes 18px; planner text 10px minimum; label 12px sentence case. Display (42–68px) and headline (30–44px) sizes unchanged |
| Line length | Lead `34em`; card paragraphs unbounded; final paragraph `34em` | Lead 58ch, feature/step paragraphs 44ch, FAQ answers 62ch, final paragraph 52ch; `text-wrap: balance` on headings and `pretty` on paragraphs |
| Pricing alignment | `min-height: 48px` hack on plan descriptions | Plans share rows through CSS subgrid |
| Touch targets | Header button 34px, footer links 20px, brand link 28px | 44px minimum on `pointer: coarse` for buttons, brand, Sign in, footer and inline links |
| Anchors under sticky header | None | `scroll-padding-top: header + 16px` |
| Semantics | Footer column headings `h4` straight after `h3`; features `div > article` | Footer headings `h2.footer-title`; features `ul > li`; decorative step numbers `aria-hidden` |
| Copy | `<title>` used an em dash; final CTA said "Book a demo" while the Business plan says "Talk to sales" | Colon in the title; "Talk to sales" in both places |

Checked in headless Chrome at 1440px and 500px: no horizontal overflow at either width.

## Left as it was

- Inter and Inter Tight. Both are on Impeccable's reflex-reject list, but its rule says an existing identity wins over that list, and polish aligns to the documented system rather than replacing it.
- The sticky translucent header (a functional use of blur, not decorative glass).
- Below 900px the header nav is hidden with nothing in its place (as in `before/`); a menu would need JS or a new pattern, which polish rules out.
- Text inside the product illustration stays at 10–12px on phones (it is a `role="img"` with a full text alternative), below polish's 14px mobile guideline.
- Section order, content and copy otherwise unchanged from `before/`.
