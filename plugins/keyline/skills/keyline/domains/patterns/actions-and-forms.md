# Actions and forms

## Destructive items in a menu

Every destroying or session-ending item takes the same place and treatment: last, after a divider, no icon, the danger treatment from the colour guide.

```tsx
<Menu>
  <MenuItem onSelect={rename}>Rename</MenuItem>
  <MenuItem onSelect={duplicate}>Duplicate</MenuItem>
  <MenuItem onSelect={openMoveTo}>Move to…</MenuItem>
  <MenuSeparator />
  <MenuItem tone="danger" onSelect={() => openConfirm(row, triggerRef)}>Delete</MenuItem>
</Menu>
```

The same holds in the profile menu (Sign out last, alone), in settings (a "Delete workspace" section last on the page, its button in the same danger treatment), and in a bulk-action bar (Delete at the end, set apart).

| Item | Destructive or session-ending? |
|---|---|
| Delete, Remove from project, Clear history, Revoke access, Leave workspace, Sign out | Yes — one treatment |
| Archive (restorable), Mark as done, Hide | No — ordinary items, ideally with Undo |
| Cancel (an unsaved form) | No — a ghost button, not danger |

## Proof in proportion to the loss

| Loss | Ask for | Example |
|---|---|---|
| Reversible | Nothing; Undo in a toast for 5–8s | Archive a task, move a card, remove a tag |
| One item, irreversible | A dialog; the button repeats the verb | Delete a note |
| Many items, or someone else's work | A dialog that counts what goes ("48 tasks, 12 notes") | Delete a folder |
| An account, a project, a workspace | Type a word to confirm | Delete project, delete account |

Escalate on what is lost, not on how serious the screen looks: a bulk delete of 200 rows deserves more than a delete of one project with nothing in it.

## The type-to-confirm dialog

One component, used for every large delete. It is the system's dialog with different contents, never a bespoke surface (depth law 1).

```tsx
export function ConfirmDestroy({ open, onOpenChange, title, consequence, word = "DELETE",
                                 action, pendingLabel, onConfirm, returnFocusTo }) {
  const [typed, setTyped] = useState("");
  const [state, setState] = useState<"idle" | "pending" | "error">("idle");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const matches = typed.trim().toLowerCase() === word.toLowerCase();

  async function confirm(e: React.FormEvent) {
    e.preventDefault();
    if (!matches || state === "pending") return;
    setState("pending");
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (err) {
      setState("error");
      setError(messageFor(err)); // words, not a code
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => state !== "pending" && onOpenChange(next)}
      initialFocus={inputRef}
      finalFocus={returnFocusTo}  /* the row or menu item that opened it */
    >
      <form onSubmit={confirm}>
        <DialogTitle>{title}</DialogTitle>
        <p>{consequence}</p>
        <label htmlFor="confirm-word">Type {word} to confirm</label>
        <input id="confirm-word" ref={inputRef} value={typed} autoComplete="off"
               onChange={(e) => setTyped(e.target.value)}
               aria-describedby={state === "error" ? "confirm-error" : undefined} />
        {state === "error" && <p id="confirm-error" role="alert">{error}</p>}
        <DialogFooter>
          <Button variant="ghost" type="button" onClick={() => onOpenChange(false)}
                  disabled={state === "pending"}>Cancel</Button>
          <Button tone="danger" type="submit" disabled={!matches || state === "pending"}>
            {state === "pending" ? pendingLabel : action}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
```

- **The input takes focus, not Cancel.** The typed word is the guard; focusing it saves a click without weakening it.
- **Case-insensitive**, trimmed: the reader proves intent, not typing accuracy.
- **Held open while pending**: Escape and the scrim do nothing until it settles, so a failure has somewhere to be reported.
- **Focus returns to what opened it**, the row's neighbour if the row is gone — depth law 12, with the code in `domains/depth/elevation-recipes.md`.

## Undo instead of confirm

For anything reversible, act at once and offer Undo:

```ts
async function archive(task: Task) {
  const before = store.snapshot(task.id);
  store.archive(task.id);
  toast("Task archived", { action: { label: "Undo", onClick: () => store.restore(before) } });
  try { await api.archive(task.id); }
  catch { store.restore(before); toast.error("Couldn't archive task", { action: retry(() => archive(task)) }); }
}
```

A confirm dialog in front of every reversible action trains the reader to click through dialogs, which is how the dangerous one gets clicked through too.

## Field anatomy

Label above, control, hint below; an error takes the hint's place rather than adding a line.

```tsx
<div className="field">
  <label htmlFor={id}>{label}</label>
  <Control id={id} aria-invalid={!!error || undefined}
           aria-describedby={error || hint ? `${id}-note` : undefined} />
  {(error || hint) && (
    <p id={`${id}-note`} className={error ? "field-error" : "field-hint"}>
      {error ?? hint}
    </p>
  )}
</div>
```

Selects, date pickers and menus use the system's components, never the OS-native control.

Reserve the note's line height when a field has a hint, so the swap never moves the field below. Validate on blur and on submit, not on every keystroke; clear a field's error as soon as its value changes.

**A form-level failure** — the server refused, the network dropped — is one line above the primary button, with an icon and `role="alert"`, saying what to do next. The fields keep what the reader typed.

## The deciding field first

Order a form by dependency, not by importance:

| Instead of | Do |
|---|---|
| Description, then Category | Category (full width), then the fields it shapes, then Description |
| Free text, then "Is this private?" | Private or shared first, if it changes who can be mentioned |
| Every field shown, half disabled | Fields appear once the deciding answer allows them, in place, without reflowing what's above |

The deciding field is full width because it is the one question every reader answers; the rest can sit in pairs.

## The sign-in screen

| Region | Holds |
|---|---|
| Form column, about 360px, unboxed | Title ("Sign in"), one muted line, fields, the one brand button, the secondary path as a link ("Create an account") |
| Art panel, from a wide breakpoint | The depth guide's art panel on the other half (`domains/depth/elevation-recipes.md`); moving only if the auth routes are an `expressive` area in `## Profile`, otherwise one still frame |
| Phone | The form alone; the art is decoration and goes first |

- **No card around the form.** The page is the surface; a card on an otherwise empty page is a box around nothing.
- **One primary button**, reading the verb: "Sign in", "Create account", "Send link".
- **Errors**: field errors replace hints; "Wrong email or password" is a form-level line, never a field error that tells an attacker which half was right.
- **Password managers** need `autocomplete="email"` / `"current-password"` / `"new-password"` and real `<form>` submission.
- The panel's build and theme scope are the depth guide's art-panel recipe (`domains/depth/elevation-recipes.md`); its motion is the motion guide's ambient class, with a still frame under reduced motion; inputs at 16px on phones, so the browser doesn't zoom, are the type guide.

## Pending states by how long the wait is

| Wait | The reader sees | Where |
|---|---|---|
| Under 100ms | The control's own press state | On the control |
| ≈ 400ms – 1s | The label turns to its progressive form ("Save" → "Saving…"), width held, the control disabled against a second press | In the button |
| 1s – 10s | A skeleton of what's coming: the rows, the panel's shape, never a centred spinner over a blank region | In the region that will change |
| Over 10s | Determinate progress — "Importing 340 of 1,200" — with Cancel, and a notice when it's done if the reader has left | In the region, then a toast off screen |

Show the pending state only once the threshold passes, so a fast response never flashes it:

```tsx
function usePending(pending: boolean, after = 400) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!pending) return setShown(false);
    const t = setTimeout(() => setShown(true), after);
    return () => clearTimeout(t);
  }, [pending, after]);
  return shown;
}

// <button disabled={saving} style={{ minWidth }}>{usePending(saving) ? "Saving…" : "Save"}</button>
```

A skeleton, once shown, stays for at least ≈ 300ms, or a response that lands just after the threshold makes the region flicker twice.

## Forgiving inputs

Normalise on blur and on submit, and keep what was typed visible until then:

| Field | Accept | Store |
|---|---|---|
| Email | Capitals, leading and trailing spaces | Trimmed, domain lower-cased |
| Phone | Spaces, dashes, brackets, a leading `+` or `00` | E.164 (`+447700900123`) |
| Card, IBAN, codes | Spaces and dashes, pasted in any grouping | Digits only; displayed back in groups of four |
| Date | "12 Mar", "12/3", "tomorrow", a picker | ISO date; displayed in the reader's locale |
| Amount | "1,200", "1200.00", a currency symbol | A number in minor units |

`inputmode` and `autocomplete` do half the work — `inputmode="numeric"` for codes, `"email"`, `"tel"` — so the right keyboard arrives and the browser fills what it knows. An error names the fix ("Add the year"), not the rule broken ("Invalid format").

## Progress through a flow, and its end

- **Show position and what's left**: "Step 2 of 3" or a short list of named steps, the current one marked, earlier ones ticked and revisitable.
- **Start with credit**: a setup checklist opens with the step the reader just finished already ticked.
- **No step counter for one screen**, and none that changes length mid-flow; if a branch adds steps, show the new count when the branch is chosen.
- **The end state** names what happened in the product's nouns ("Riverside project created"), shows the thing itself or a link to it, and offers the next action ("Invite your team"). It is a screen, not a toast that leaves the reader on the last form.
