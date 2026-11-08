# Settings: with Impeccable

Work folder: `impeccable/` (copied from `before/`). Flow run: Impeccable setup gates → `teach` (no PRODUCT.md existed) → `document` in scan mode (teach's Step 5, code exists) → `polish` on the whole page. With no user available, the interview answers came from the brief and the existing page; where the brief said nothing, I took teach's defaults (WCAG 2.1 AA; Linear and Stripe from its suggested category references).

## What teach chose

- **Register:** `product` (a settings surface inside an app: forms, side nav, app shell).
- **Colour strategy:** Restrained (the product default): tinted neutrals and one indigo accent kept for actions, selection and focus, plus semantic success, warning and danger pairs.
- **Theme:** follows the system (light and dark both kept). Scene sentence: a team member at a desk mid-workday, opening settings for a one-minute errand, with the OS appearance already matching their lighting.
- **Personality:** modern, polished, clear. Anti-references: a generic SaaS admin template (shadowed cards everywhere, gradient avatars, glassy headers) and "strangeness without purpose."
- **Files written:** `PRODUCT.md`, `DESIGN.md` (Stitch format; first written as a scan of the before tokens, then refreshed to the polished tokens in polish's clean-up step), `DESIGN.json` (sidecar).

## What polish changed

Colour and contrast. All ratios below were computed with the WCAG formula after converting OKLCH to sRGB.
- Tokens moved from hex to OKLCH, with every neutral tinted toward hue 265. `#ffffff` and other raw colour literals in the CSS went from 57 to 0. Hard-coded `#fff`, `#d92d20`, `#eaaa08` and the avatar gradient are now tokens.
- Input, select, search and secondary-button borders: `#d0d5dd` at **1.47:1** → `oklch(0.64 0.02 265)` at **3.32:1** against the surface in light mode. In dark mode, `#353a44` at **1.57:1** → **3.39:1**.
- Toggle "off" track: **1.47:1** → **3.32:1** in light mode, and **1.57:1** → **3.39:1** in dark mode.
- Primary button in dark mode: white on `#6b85f0` at **3.37:1** (fails AA) → near-white on `oklch(0.55 0.17 270)` at **4.90:1**. The hover state now darkens instead of lightening (**6.09:1**). Links and focus in dark mode use a separate lighter accent ink at **7.66:1**.
- "Unsaved changes" status: `#dc6803` at **3.34:1** on the footer → `oklch(0.53 0.13 55)` at **5.25:1**, and it now has a dot so the state is not carried by colour alone.
- Muted text stays between 4.8:1 and 5.1:1 in light mode and between 5.6:1 and 6.4:1 in dark mode.

Surfaces and depth.
- Panel shadows were removed: 5 section panels with `shadow-md` → 5 hairline-bordered panels with no shadow. Inputs and buttons lost their 1px shadows. `box-shadow` declarations went from 17 → 8. What remains is focus rings, the toggle knob, the dialog and the toast.
- Nested boxes inside panels or the sidebar were removed: 3 bordered and shadowed logo tiles, the bordered "Team plan" box (now a rule above plain text), the ring around the avatar, and the border on the "Not connected" badge. That is 10 bordered containers → 5.
- The top bar's `backdrop-filter: blur(12px)` translucency → a solid surface. The dialog backdrop's `blur(4px)` → a plain scrim. `backdrop-filter` uses went from 3 → 0.
- Avatar `linear-gradient(135deg, #7b8ff5, #3e5bd8, #2a3fa3)` with white initials → an indigo wash with indigo initials.
- Active sidebar item: a raised white chip (shadow plus inset border) → the indigo wash (danger wash for Danger zone).

Typography.
- Font sizes went from 10 distinct values (11, 12, 13, 14, 15, 16, 18, 20, 24, 28) to a token scale: 13, 14, 16, 18, 24 (plus 11px kbd and avatar initials).
- `font-weight: 650` on the h1 and brand was never loaded (Inter was requested at 400/500/600/700), so it rendered as a synthesised weight → 600. Loaded weights trimmed to 400/500/600.
- h1 28px/650 → 24px/600. The brand name 15px → 16px. Row titles (connection names, Delete account) went from 600 to 500, matching labels and notification names.
- Uppercase, letter-spaced overlines ("SETTINGS", "ACTIVITY / EMAIL / PUSH") → sentence-case 13px/500 captions.
- Section descriptions and row hints: measure was uncapped (about 100ch in a 712px column) → `max-width: 60ch`. Added `text-wrap: balance` on headings and `pretty` on paragraphs.
- Added a metric-matched "Inter Fallback" `@font-face` (Arial with size-adjust 107.12% and ascent/descent overrides) to stop the font-swap shift.
- At 760px and below, small text goes from 13px to 14px.

Spacing and layout.
- Added a 4px spacing scale. Off-scale values such as the 22px panel head and 14px footer were snapped to 24px and 12px (footer min-height 64px).
- Gap between sections: 24px → 32px. Page title to first section: 24px.
- Sidebar width: 240px → 220px.

Copy.
- Removed the intro under the h1 ("Manage your profile, how Northwind reaches you…"), which only restated the title and the sidebar.
- "Cancel" (a reset button) → "Discard changes", and it is now hidden until the form has unsaved changes.
- Removed the em dash from the stylesheet header.

Interaction states and behaviour (script.js).
- Save buttons used to grow by about 20px while loading (a spinner was prepended) → the label hides and the spinner overlays it at the same width. Verified over CDP: 114.33px before and during loading. `aria-busy` is set while saving.
- An oversized photo used to show only a toast → an inline error under the photo hint (`role="alert"`).
- "Remove" photo used to be enabled when there was no photo → disabled until a photo is uploaded. Focus returns to Upload after removing.
- Added hover states to toggles, the search field and secondary or danger borders. All transitions use one curve: ease-out-quart `cubic-bezier(0.25,1,0.5,1)` at 150ms or 200ms, replacing the default `ease` and two ad-hoc curves.
- Under reduced motion, the loading spinner keeps a slow spin instead of freezing.

Accessibility.
- `aria-describedby` fixes:
  - Current password is now linked to its error message.
  - New password links both its rules and its message. Before, the script's `ensureMsg` overwrote the rules reference.
  - The delete dialog now has `aria-describedby`.
- Password rules now announce ", met" or ", not met yet" (previously only an icon and colour change).
- Touch (`pointer: coarse`): buttons 32 or 38px → 44px, the notification icon button 36px → 44px, sidebar links at least 44px, and toggle hit areas grow to about 44px.
- Dead CSS removed: `text-overflow: ellipsis` on connection hints never applied, so long emails now wrap with `overflow-wrap: anywhere`.

Unchanged by choice: the per-section panels with footer save bars, the native `<dialog>` with typed confirmation for account deletion, the table layout for notification toggles, the sticky section nav and its phone strip, and all sections and content the brief requires.

## Verification

Rendered in headless Chrome at 1440px (light and dark) and 500px. There is no horizontal overflow. These were driven over CDP:
- The dirty status and Discard behave as described.
- An invalid email blocks the save.
- A valid save goes Saving → "✓ Saved just now".
- The password rules text updates.
- The `aria-describedby` lists are correct.

Not done: no real-device testing and no screen-reader pass.
