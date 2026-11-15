# UI copy

Copy in a product is interface, not prose: it is scanned in passing, compared across screens, and read again a thousand times. Each rule below makes a label faster to recognise the second time. Several follow Apple's Human Interface Guidelines on writing (developer.apple.com/design/human-interface-guidelines/writing), restated here for the web and in Keyline's terms.

## Voice and tone

**Voice is chosen once.** Decide who reads the product, which words they already use, and how it should leave them feeling, then write it in one line under `## Patterns`: "Plain and direct, like a colleague who knows the work." The glossary below is the voice's vocabulary.

**Tone moves with the moment.** The same voice is plainer when something failed or money is moving, and allowed some warmth when something good is finished:

| Moment | Tone | Write |
|---|---|---|
| A payment fails | Plain, specific, no apology theatre | Payment declined. Check the card's expiry date or use another card. |
| A save fails | Plain, with the way out | Couldn't save the draft. Your changes are kept here — Retry |
| A goal is reached | Warm, brief | Every task closed this week. |
| First run | Welcoming, short, useful | Projects you create or join appear here. |

**Clear beats clever.** Read the line aloud; cut every word that can go. Wit belongs, if anywhere, in a moment with nothing at stake, never on a button or an error.

## Labels

| Instead of | Write | Why |
|---|---|---|
| Record a voice note | Record | The surrounding screen already says what is recorded |
| Request a feature | Help & feedback | The item also takes questions and bug reports; a label covers everything behind it |
| Submit | Send · Save changes · Create project | Say what happens, not that a form was posted |
| OK · Yes | Delete project · Sign out | The confirm button repeats the dialog's verb, so it reads correctly without the question |
| Click here to view details | View details · or make the row itself the link | "Click here" carries no information out of context |
| Are you sure you want to delete? | Delete "Riverside"? | Name the thing, drop the hedge |
| Manage Team Members | Members | Sentence case; the verb is implied by the page |
| NEW TASK | New task | Uppercase strips word shapes and reads as shouting |
| Let's do it! · Sounds good! | Send · Create project | A cheerful label hides what the button does |
| Your settings · My projects | Settings · Projects | The possessive adds nothing when there is only one kind; keep it for telling two apart ("Your tasks" beside "Team tasks") |
| § 4.2 | Section 4.2 | A symbol is a code the reader has to know; the word isn't |

**Verb first, object only when needed.** One primary action on a screen needs no object ("Save"). Two verbs that could be confused do ("Save draft", "Publish"). A destructive button always takes its object ("Delete project"), because the object is what's lost.

**Labels in menus are nouns or verbs, not both styles at once.** A menu of "Rename", "Duplicate", "Move to…", "Delete" is all verbs; "Settings", "Members", "Billing" is all places. An ellipsis means the item asks for more before acting.

**Tooltips on icon buttons say the same words a text button would**, plus the shortcut: "Filter  F".

**No internal vocabulary reaches the screen.** No tool, API or probe names, and no "sample", "synthetic", "simulated" or "placeholder" badges: a demo must not look staged. The reader's nouns come from the glossary, never from the code.

## Sentence case, including generated labels

Every label, title, column header, tab, field name and toast is sentence case. Keep acronyms, proper nouns and third-party product names as written ("Export to CSV", "Connect GitHub").

Labels assembled from keys need a converter with an exception list, or the first acronym breaks it:

```ts
const KEEP = new Set(["ID", "URL", "API", "CSV", "PDF", "AI", "SSO"]);

export function labelFromKey(key: string): string {
  const words = key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .split(/\s+/);
  return words
    .map((w, i) => {
      const upper = w.toUpperCase();
      if (KEEP.has(upper)) return upper;
      const lower = w.toLowerCase();
      return i === 0 ? lower[0].toUpperCase() + lower.slice(1) : lower;
    })
    .join(" ");
}
// dueDate → "Due date"; project_id → "Project ID"; AI_summary → "AI summary"
```

Prefer a hand-written label map for anything the reader sees often; the converter is the fallback for long-tail keys, tool names and imported fields.

## Row second lines

The formula is **`{type} from {origin}`**, in the product's nouns:

| Instead of | Write |
|---|---|
| Issue added to Riverside | Task from Riverside |
| Created by voice note on 3 Mar | Note from site walk |
| New item in Inbox | Request from Northgate |
| Riverside · Task · Open · 2h ago · Sam | Task from Riverside — with status as a glyph, time and owner in their own slots |

- **Type** is the kind of thing, from the product's glossary. If the list holds one type only, drop it: "From Riverside". The same goes for any value shared by every row: a column with one value throughout is dropped and stated once under the title ("All in Riverside").
- **Origin** is where it came from or lives: a project, a meeting, a person, a source. Pick the one the reader sorts by.
- **No verbs of history** ("added", "created", "moved"). They describe one moment, and the moment is already in the time slot.
- **No status in the sentence.** Status has a glyph and a colour (the colour guide); words would say it twice.

## The glossary

One noun per kind of thing, everywhere: navigation, page titles, row lines, toasts, empty states, buttons. Record it in `DESIGN.md`:

```markdown
## Patterns

**Voice** — plain and direct, like a colleague who knows the work; warm only when something is finished.
**Nouns** — task (never "issue", "item" or "action"); note (a recording once processed); project; member (never "user" in UI).
**Row second line** — `{type} from {origin}`; origin is the project, or "Personal" for notes outside one.
```

A synonym in one corner of the product reads as a second kind of thing. When a new screen needs a word, look it up first.

## Messages

**Toasts** say what happened, then offer the one thing to do about it:

| Case | Write |
|---|---|
| Undo window | Task moved to Done · Undo |
| Failure, retryable | Couldn't move task — Retry |
| Failure, needs the reader | Couldn't save: the project was archived · View project |
| Result off screen | Note added to Riverside · Open |

Never "Successfully …" (the outcome is the message), never an exclamation mark, never an error code without words. A move the reader watched happen needs no toast.

**Errors** say what to do, not what went wrong inside, as close to the problem as they can sit:

| Instead of | Write | Why |
|---|---|---|
| Invalid date range | Enter a date after the start date | The reader needs the fix, not the verdict |
| That password is too short | Use at least 8 characters | Say the rule as the way through |
| Don't use numbers or symbols | Use only letters | Positive instructions read faster and don't scold |
| Oops! Something went wrong | Couldn't load the report — Retry | Interjections sound insincere at the worst moment |
| We're having trouble loading this | Couldn't load this page | "We" is nobody the reader can see; name what failed |
| You entered an invalid email | Enter an email like name@example.com | Don't blame; show the shape that works |

Field errors replace the field's hint (`domains/patterns/actions-and-forms.md`). An error many people hit is a design problem: change the field or the flow so it can't happen, rather than polishing the message.

**Empty states** — one line on what goes here, and the action that makes the first one:

| Case | Line | Action |
|---|---|---|
| New, nothing yet | Tasks from your notes and meetings land here. | New task |
| Filtered to nothing | No tasks match "Overdue" and "Assigned to me". | Clear filters |
| Search with no results | Nothing matches "riverbank". | Search all projects |

**Confirmations** — the title asks with the thing's name; the body says what is lost in plain words; the button repeats the verb:

> **Delete "Riverside"?**
> Its 48 tasks, 12 notes and every file attached to them will be deleted for everyone. This can't be undone.
> [Cancel] [Delete project]

**How to say it depends on how urgent it is:**

| The message is… | Deliver it as | Because |
|---|---|---|
| About one field, as it's filled | Inline, under the field | It belongs where the eye already is |
| The result of something just done | A toast, with Undo or Retry | It confirms without stopping the work |
| A decision that can't wait, or loses data | A dialog | It must be answered before going on |
| About something away from the screen | A notification, or a badge in the product | The reader isn't looking; don't interrupt unless it can't wait |
| Always true about the page | A line on the page | Not a message at all |

## Flows

A task of several screens uses one set of words for moving through it (law 17 for the shape):

- **Start** with the task's name or "Get started", once, on the first screen only.
- **Between steps**, choose "Continue" or "Next", or name the next step ("Choose a plan"), and keep the choice across every flow in the product.
- **Back** is "Back", never "Previous" on one screen and "Return" on another.
- **End** on what happened and what's next ("Project created · Open project"), not a bare "Done" or "Success".

## Fields and settings

**Every field has a label that stays visible** and, where the format isn't obvious, a hint that shows it: "name@example.com", "DD/MM/YYYY", "As it appears on the card". A placeholder alone is not a label (law 16).

**A setting is labelled by the thing it controls** ("Weekly summary"), and its description says what happens when it's on: "Email a summary of the week's tasks every Monday." The reader infers the off state.

**To send someone to a setting, link to it**, open on the right row. "Go to Settings › Notifications › Email" is a path the reader has to walk; a link is one click.

## Words anyone can read

- **Plain words over jargon.** "Sign in", not "Authenticate"; "Couldn't connect", not "Network error 503". A term of the trade is fine when the reader is in that trade (law 2's glossary decides).
- **No gendered terms** where the person's gender isn't the point: "they", "everyone", "team", "staff".
- **No idioms or wordplay in interface text**: they don't translate and don't survive a screen reader.
- **Whole strings, ready to translate.** Never build a sentence from fragments (`"Delete " + name + "?"`); keep the sentence whole with a placeholder (`Delete "{name}"?`), leave room for text 30–40% longer, and format dates, numbers and plurals with `Intl`.
- **Describe images by what they're for**, not what they look like: alt text on a chart says what it shows ("Sign-ups doubled in March"), and decorative images take `alt=""`.

## Pronouns and device words

- **"Your" and "my" sparingly**, and never both: pick the reader's perspective ("Your projects") or none, and keep it product-wide.
- **Never "we".** The reader can't tell who it is, and in an error it shifts the subject to the company. Say what happened to the thing.
- **Verbs match the device**: "tap" on touch layouts, "click" with a pointer, and "select", "choose" or "open" in text shared by both. A phone layout that says "click" was written for another screen.

## Calls to action, links and sign-ups

On a landing page or an article the words are most of the interface (law 14):

| Instead of | Write | Why |
|---|---|---|
| Get started · beside Start free | Start free · Book a demo | Each call to action names what happens next, so two can't be mistaken for each other |
| Learn more · Click here | Pricing · Read the case study | Link text names its destination, and still does in a list of links read out of context |
| An email field labelled only by "you@example.com" | "Email" above the field; "One essay a month. Unsubscribe any time." below it | A placeholder vanishes on typing; the line says what arrives and how often |

## Numbers in copy

Counts beside a noun agree with it ("1 task", "3 tasks", "No tasks" — never "0 task(s)"). Use the platform's plural rules (`Intl.PluralRules`) once there is more than one language. A count that reports a problem takes its status colour; a plain count stays in ink (the colour guide).
