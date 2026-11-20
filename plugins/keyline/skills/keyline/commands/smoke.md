# `/keyline smoke`

Use the running product the way a tester would — click everything, follow every link, submit every form, Tab through every page, open it on a phone and on a slow connection — and report the flows that break. Every finding comes with the steps that reproduce it. Where `audit` asks whether the interface keeps the laws, `smoke` asks whether it works.

Inside a polish round, smoke runs on the pages that round touched (`--routes`), and any error it leaves open holds the score out of 10 at 6 (`commands/audit.md`). The safety rules below still hold.

**Read:** `system/reports.md` (the target, the two ways to drive a browser, the report format). `DESIGN.md` isn't needed; the findings that a refining command fixes name it.

## What it checks

| Check | How | Finding |
|---|---|---|
| Links | Every same-origin link requested once, redirects followed hop by hop | `flow/broken-link` (4xx, 5xx, fails), `flow/redirect-chain` (2+ hops), `flow/redirect-loop` |
| Dead clicks | Every button, `[role=button]`, tab, link, `[onclick]` and `cursor: pointer` element clicked from a fresh load. Watched for ~1.5 s: URL, DOM mutations, requests, dialogs, new tabs, downloads, focus, scroll | `flow/dead-click` (placeholder `href="#"` links grouped into one), `flow/click-blocked` (something covers it), `runtime/click-exception`, `runtime/click-request-failed` |
| Menus and dialogs | A click that opens one: press Escape | `flow/escape-ignored`, `flow/focus-not-returned` |
| Back | A click that changes the URL: press Back | `flow/back-broken` (wrong URL, or right URL with other content) |
| Stuck states | Spinners, skeletons, `aria-busy`, indeterminate progress still showing after 8 s; a URL changed without a reload, then opened fresh | `flow/stuck-loading`, `flow/state-lost` |
| Forms | Submitted empty, with one invalid value, and filled in properly | `flow/silent-validation` (no message), `flow/validation-far` (message away from the field), `flow/accepts-invalid`, `flow/dead-submit`, `flow/silent-success`, `flow/submit-failed`, `flow/submit-refused` (info) |
| Keyboard | Tab from the top until focus leaves the page | `flow/focus-trap`, `flow/focus-invisible`, `flow/focus-hidden` (focus on something off screen) |
| Phone | 390px: page width, and every desktop nav link reachable through a menu button that opens and closes | `flow/phone-overflow`, `flow/phone-nav-missing`, `flow/phone-menu-dead`, `flow/escape-ignored` |
| Layout shift | Loaded at 150 ms latency, 1.6 Mbps, CPU ×2; Chrome's layout-shift entries scored as CLS | `flow/layout-shift` (≥ 0.1 warning, ≥ 0.25 error) |
| Runtime | What the walk sees on load | `runtime/*` (load failures, error statuses, exceptions, console errors, failed requests) |

Not reported, because doing nothing is right: the selected tab, a link to the current page (`aria-current`), disabled controls, native checkboxes, radios and selects, links to other sites (never followed), and anything the config forbids.

## Safety

**Writes run only on a test host:** `localhost`, `127.0.0.1`, `::1`, `*.localhost`, `*.test`, or a host listed in `testHosts`. A write is a form submit, or any control whose words or URL say delete, remove, destroy, pay, buy, purchase, checkout, unsubscribe, sign out or log out. Of those, the destructive ones run only with `--allow-writes`. Search forms only read, so they run anywhere.

On any other host the runner submits nothing and **blocks every request that isn't GET, HEAD or OPTIONS**, whatever started it. On a test host without `--allow-writes` it still blocks `DELETE`. Links whose URL looks destructive (`/logout`, `/delete/42`) are neither followed nor requested, since a GET there can do exactly what it says. Before a run against anything but a local server, tell the user which host it is and that it will only read.

Never put credentials in the config or the chat. Sign-in comes from a saved session or from environment variables.

## Configuration

Optional: `keyline.smoke.json` at the project root, or `--config <file>`.

```json
{
  "base": "http://localhost:3000",
  "routes": ["/", "/settings", "/projects"],
  "examples": { "/projects/[id]": "/projects/42" },
  "testHosts": ["staging.example.com"],
  "auth": {
    "login": {
      "url": "/login",
      "steps": [
        { "fill": "#email", "env": "SMOKE_EMAIL" },
        { "fill": "#password", "env": "SMOKE_PASSWORD" },
        { "click": "button[type=submit]" },
        { "waitFor": "/dashboard" }
      ]
    }
  },
  "forbid": { "selectors": [".danger-zone", "[data-billing]"], "urls": ["/admin/*", "/^\\/billing/"] },
  "maxClicks": 30
}
```

`auth` is either `{ "storageState": ".auth/state.json" }` (a saved Playwright session) or `login` steps: `fill` (with `env`, never a value), `click`, `press`, `waitFor` (a path or a selector). `forbid.urls` takes globs, `/regexes/` or substrings; forbidden URLs are never loaded, clicked or requested, and forbidden selectors are never clicked. `examples` gives a URL for each dynamic route the walk can't fill in itself.

## Steps

1. **Find the target**, as `system/reports.md` says: a URL the user named, the dev server already running, the dev server started, or `--serve` on a static build. Note whether it's a test host.
2. **Pages behind sign-in?** With your own browser, use the user's session. With the runner, ask for a test account in environment variables and write the `login` steps into `keyline.smoke.json`. Dynamic routes with no example: ask for one.
3. **Run the checks**, by one of the two paths below.
4. **Read the report yourself before handing it over.** Open a few findings' crops. A finding you judge wrong (an intentional no-op, a test-only spinner) gets `"status": "dismissed"` in `findings.json` and a re-render, and you say so. Don't dismiss to make the numbers look better.
5. **Report**: the summary line, errors first (title, page, the steps), then what was skipped and why. Offer to fix: bugs in the code directly; design-owned findings with the command in their `fix` field (`/keyline patterns` for validation and menus, `/keyline color` for focus rings, `/keyline layout` for overflow and shift).

### With Keyline's runner

```sh
npx trykeyline smoke --base http://localhost:3000 --root .
npx trykeyline smoke --serve dist                       # a static build
npx trykeyline smoke --base http://localhost:3000 --only links,clicks
```

It writes `smoke-report/` (findings.json, index.html, shots/) and exits 1 when it found errors. Useful options: `--routes /a,/b`, `--limit 20` pages, `--max-clicks 30` per page, `--skip shift`, `--quiet-ms 1500`, `--stuck-ms 8000`, `--test-host <host>`, `--allow-writes`, `--headed` to watch it. A run takes about a minute for a small site; most of it is the clicks.

### With your own browser

When you have browser tools (Claude's browser, a Playwright or Chrome DevTools MCP), you can do the same with the user's session. Keyline's page-side functions run unchanged in any page, and printing one fetches no browser:

```sh
npx trykeyline probe inventory     # every control, form and link, with selectors and boxes
npx trykeyline probe stuck         # loaders still showing after 8 s
npx trykeyline probe watch         # then `arm`, click, `read`: did the click change anything?
```

Each prints one expression for your JavaScript tool. Then, per page:

1. Open it, screenshot it at desktop and phone width, run `inventory` and `stuck`.
2. **Links:** fetch each same-origin `href` with redirects off, following `Location` by hand.
3. **Clicks:** for each control, reload, run `mark` with `{ "match": { "sel", "text", "tag" } }`, run `watch`, wait ~350 ms, run `arm`, click `[data-keyline-target]`, wait 1.5 s, run `read`. Nothing in `mutations`, `focusMoved`, `scrolled`, `opened`, the URL or your network log means dead. If `opened`, press Escape and run `afterEscape`; if the URL changed, go back and compare.
4. **Forms** (test host only): submit empty, invalid, valid; compare `textSnapshot` before and after.
5. **Keyboard:** run `keyboardPrep`, then Tab and `keyboardRead` until it returns `body`.
6. Write `smoke-report/findings.json` by hand, `"kind": "smoke"`, every finding with `steps`, plus `box` and `shot` where there's an element. Render it:

```sh
npx trykeyline report smoke-report
```

**Changes no code.** `.gitignore` follows `system/reports.md`.
