# Product

## Register

product

## Users

Small SaaS teams, typically two to ten people: founders, product managers, growth or marketing leads, and the engineer who installed the tracking snippet. They open Lumen on a laptop or desktop during the working day, usually as a short check-in ("how did the last 30 days go, and did anything change?") rather than a long analysis session. Some check from a phone between meetings.

The job on the Overview screen: see the four numbers that matter (visitors, sign-ups, conversion rate, revenue) against the previous period, see the daily shape of traffic, find which pages carry it, and notice what the team or the tracking did recently. From there they drill into Events, Funnels, Retention or Users.

## Product Purpose

Lumen is a product-analytics tool sized for small SaaS teams: the questions a five-person company asks, without the setup and seat cost of enterprise analytics. The Overview dashboard is the home screen of a workspace. It succeeds when a teammate can answer "are we up or down, and why" in under a minute, trusts the numbers, and knows where to click next.

## Brand Personality

Modern, polished, trustworthy.

Voice is plain and specific: numbers first, short labels, no hype, no exclamation marks. The interface should feel like a well-made tool that gets out of the way, closer to Linear or Stripe's dashboard than to a marketing site. Emotional goal: calm confidence. A drop in a metric is stated clearly, not dramatised.

## Anti-references

- The generic SaaS dashboard template: a row of identical KPI cards (big number, small label, coloured pill), every section in its own shadowed card, gradients on logos and progress bars.
- Glassmorphism and decorative blur used as styling rather than function.
- Over-decorated controls: heavy shadows, pill badges on everything, colour used as ornament instead of meaning.
- Neon-on-black "analytics" styling and purple-gradient AI-tool aesthetics.
- Marketing-page typography inside the app (display fonts, oversized hero numbers).

## Design Principles

1. **Numbers first.** The data is the interface. Every visual choice should make a figure easier to read, compare or trust; anything that competes with the figures goes.
2. **Earned familiarity.** Use the patterns people already know from the best tools (side nav, top bar, date range, table, feed). Do not reinvent standard affordances for flavour.
3. **State, not decoration.** Colour and motion carry meaning: up, down, alert, selected, focused. If a colour or animation does not signal a state, remove it.
4. **One period, one vocabulary.** The selected date range governs the whole screen; comparisons are always "vs previous period" and are named the same way everywhere.
5. **Quiet structure.** Group with spacing and hairlines before reaching for boxes and shadows.

## Accessibility & Inclusion

- WCAG 2.2 AA: 4.5:1 for text, 3:1 for large text, icons, chart lines and focus indicators.
- Never rely on colour alone for up/down or alert states; pair colour with an arrow, sign or label (red/green colour-blind users are a real share of any team).
- Full keyboard operation: nav, search (with the shortcut), date-range menu, and the chart's day-by-day readout.
- Respect `prefers-reduced-motion`; motion is never needed to understand the page.
- Light and dark themes follow the device setting and must both pass the contrast targets above.
