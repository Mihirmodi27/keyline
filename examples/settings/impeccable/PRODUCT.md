# Product

## Register

product

## Users

Members of teams that run their work in Northwind, a project-management app. The page's sample user is Priya Anand, a senior product designer at Halcyon Studio on a 20-seat Team plan. They arrive at account settings rarely and with one errand in mind: fix their name or photo, cut down notification noise, change a password, link Google, GitHub or Slack, or leave for good. They are mid-workday, at a desk, and want to get back to their projects quickly.

## Product Purpose

Account settings is where a Northwind user controls how they appear to teammates (profile), how Northwind reaches them (email and push notifications for mentions, comments, task assignments and a weekly summary), how they sign in (password, connected accounts), and whether their account exists at all (danger zone). Success is a change made once, confirmed visibly, with no doubt about whether it saved, and no destructive action taken by accident.

## Brand Personality

Modern, polished, clear. The brief asks for "modern and polished"; the existing copy is plain and direct ("These actions are permanent and can't be undone."), so the voice stays short, specific and calm. The interface should feel trustworthy and quiet: it serves the errand and gets out of the way.

## Anti-references

- A generic SaaS admin template: every block a shadowed card, gradients on avatars, glassy headers, badges and pills everywhere.
- Strangeness without purpose: over-decorated buttons, mismatched form controls, gratuitous motion, invented affordances for standard tasks.
- Settings pages where it is unclear which save button covers which fields, or whether anything saved.

Reference tools for the category (no references were named in the brief; these are teach's suggested category references): Linear and Stripe settings, for their quiet density and unambiguous form states.

## Design Principles

1. **The errand comes first.** Each section is one job with one clear save; nothing on the page competes with the task in hand.
2. **Earned familiarity.** Standard controls behave exactly as people expect; polish shows in the details, not in novelty.
3. **State is never ambiguous.** Unsaved, saving, saved, invalid and connected each have a visible, consistent signal that does not rely on colour alone.
4. **Danger is contained.** Destructive actions are visually separated and require deliberate confirmation.

## Accessibility & Inclusion

The brief does not specify a level, so the default applies: WCAG 2.1 AA. Text meets 4.5:1 (3:1 for large text); form-control boundaries and focus indicators meet 3:1. Full keyboard operation with visible focus. Respect `prefers-reduced-motion` and the system light/dark preference. Colour is never the only carrier of state (validation, connection status, password rules). Touch targets at least 44px on touch devices.
