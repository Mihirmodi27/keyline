# trykeyline-browser

The browser half of [Keyline](https://github.com/Mihirmodi27/keyline): the audit, the smoke test, and the walk and report under them. It lives in its own package so `trykeyline` and the skill it installs stay small and never pull in Playwright.

You don't install it by hand. `npx trykeyline audit|smoke|pages|capture|report|probe` runs this package at the same version, fetching it the first time:

```sh
npx trykeyline audit --base http://localhost:3000
npx trykeyline smoke --serve dist
npx trykeyline probe audit     # the audit's page checks as one expression, for your own browser tool
```

Playwright is an optional peer. It's used from your project when it's there; otherwise it's installed once into `~/.cache/keyline` (or `$KEYLINE_CACHE`), and drives your installed Chrome.

MIT licence.
