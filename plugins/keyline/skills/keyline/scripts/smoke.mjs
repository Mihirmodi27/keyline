#!/usr/bin/env node
/**
 * Keyline's smoke test: walk a running product like a tester and report the
 * flows that break. Built on the shared walk (browse/walk.mjs) — which finds
 * the pages, screenshots them and records load failures, exceptions and failed
 * requests — plus passes that use the product:
 *
 *   links     every same-origin link's status, redirect chains and loops
 *   clicks    every control clicked from a fresh page: dead clicks, Escape on
 *             menus and dialogs, Back after moving, and state lost on reload
 *   stuck     spinners, skeletons and aria-busy still there after 8 s
 *   back      (part of clicks) Back restores the previous URL and content
 *   forms     submit empty, invalid and valid: errors by the field, success shown
 *   keyboard  Tab through: traps, focus you can't see, focus on hidden things
 *   phone     at 390px: sideways scroll, navigation that can't be reached
 *   shift     layout shift while loading on a slow connection
 *
 *   node smoke.mjs (--base URL | --serve DIR) [options]
 *   node smoke.mjs probe <name>        a page function, for an agent's own browser
 *   node smoke.mjs report [DIR]        re-render DIR/index.html
 *
 * Exit codes: 0 nothing broken, 1 errors found, 2 a usage error.
 */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { target } from "./browse.mjs";
import { add, counts, dedupe, writeRun } from "./browse/findings.mjs";
import { openContext, shotKey, withHelpers } from "./browse/capture.mjs";
import { launch } from "./browse/playwright.mjs";
import { renderDir } from "./browse/report.mjs";
import { discover } from "./browse/routes.mjs";
import { walk } from "./browse/walk.mjs";
import { checkClicks } from "./smoke/clicks.mjs";
import { CHECKS, isDestructivePath, loadConfig, policy as makePolicy, settings as makeSettings } from "./smoke/config.mjs";
import { checkForms } from "./smoke/forms.mjs";
import { checkKeyboard } from "./smoke/keyboard.mjs";
import { checkLinks } from "./smoke/links.mjs";
import { PAGE, expression } from "./smoke/page.mjs";
import { checkPhone } from "./smoke/phone.mjs";
import { checkShift } from "./smoke/shift.mjs";
import { openStep, pool, sourceFinder } from "./smoke/util.mjs";

const USAGE = `keyline smoke — walk a running product like a tester and report broken flows.

  keyline smoke (--base URL | --serve DIR) [options]
  keyline smoke probe <name> [--arg JSON]
                                  print a page function to run in your own browser:
                                  ${Object.keys(PAGE).join(", ")}
  keyline smoke report [DIR]      re-render DIR/index.html (default smoke-report)

Checks: ${CHECKS.join(", ")} (all by default).

Options:
  --base <url>          the running product, e.g. http://localhost:3000
  --serve <dir>         serve a static folder on a free port instead
  --root <dir>          the project's code, for routes and sources (default: .)
  --config <file>       settings (default: <root>/keyline.smoke.json)
  --out <dir>           where the report goes (default: smoke-report)
  --routes <a,b>        only these paths
  --limit <n>           at most this many pages (default 20)
  --only <checks>       only these checks, e.g. links,clicks
  --skip <checks>       every check but these
  --max-clicks <n>      controls clicked per page (default 30)
  --quiet-ms <n>        how long a click may take to do something (default 1500)
  --stuck-ms <n>        when a loading indicator counts as stuck (default 8000)
  --test-host <host>    treat this host as a test host too (writes may run)
  --allow-writes        on a test host, include destructive actions too
  --concurrency <n>     pages worked on at once (default 3)
  --headed              show the browser
  -h, --help            this

Writes (form submits; anything that says delete, remove, pay, buy, purchase,
unsubscribe, sign out or log out) run only on localhost, 127.0.0.1, *.localhost,
*.test or a host the config lists in testHosts; destructive ones only with
--allow-writes. Elsewhere every request that isn't GET, HEAD or OPTIONS is blocked.`;

const FLAGS = new Set(["headed", "help", "allow-writes", "json"]);

export function parseArgs(argv) {
  const opts = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-h") {
      opts.help = true;
      continue;
    }
    if (!a.startsWith("--")) {
      opts._.push(a);
      continue;
    }
    const eq = a.indexOf("=");
    const k = eq > 0 ? a.slice(2, eq) : a.slice(2);
    opts[k] = FLAGS.has(k) ? true : eq > 0 ? a.slice(eq + 1) : argv[++i];
  }
  return opts;
}

/** Sign in once and return a storage state every context starts from. */
async function signIn(browser, { base, auth, root, log }) {
  if (!auth) return undefined;
  if (auth.storageState) {
    const path = resolve(root, auth.storageState);
    if (!existsSync(path)) throw new Error(`auth.storageState: no file at ${path}`);
    return path;
  }
  const login = auth.login;
  if (!login) return undefined;
  log(`Signing in at ${login.url ?? "/"} …`);
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await page.goto(new URL(login.url ?? "/", base).href, { waitUntil: "load", timeout: 30000 });
    for (const step of login.steps) {
      if (step.fill) {
        const value = process.env[step.env];
        if (value == null) throw new Error(`login: the environment variable ${step.env} isn't set`);
        await page.locator(step.fill).first().fill(value, { timeout: 10000 });
      } else if (step.click) {
        await page.locator(step.click).first().click({ timeout: 10000 });
      } else if (step.press) {
        await page.keyboard.press(step.press);
      } else if (step.waitFor) {
        const w = String(step.waitFor);
        if (w.startsWith("/")) await page.waitForURL((u) => new URL(u).pathname.startsWith(w), { timeout: 20000 });
        else await page.locator(w).first().waitFor({ timeout: 20000 });
      }
    }
    await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
    return await context.storageState();
  } finally {
    await context.close();
  }
}

/** Every context gets the same guard: forbidden URLs never load, and writes stop where they aren't allowed. */
function guard({ policy, settings, blocked }) {
  return async (context) => {
    await context.route("**/*", (route) => {
      const req = route.request();
      const url = req.url();
      const method = req.method();
      if (settings.forbidUrl(url)) {
        blocked.push(`${method} ${url} (forbidden by the config)`);
        return route.abort("blockedbyclient");
      }
      const write = !["GET", "HEAD", "OPTIONS"].includes(method);
      if (write && !policy.testHost) {
        blocked.push(`${method} ${url} (not a test host)`);
        return route.abort("blockedbyclient");
      }
      if (method === "DELETE" && !policy.allowWrites) {
        blocked.push(`${method} ${url} (destructive; --allow-writes runs it)`);
        return route.abort("blockedbyclient");
      }
      return route.fallback();
    });
  };
}

const NOUNS = {
  "flow/dead-click": ["dead click", "dead clicks"],
  "flow/broken-link": ["broken link", "broken links"],
  "flow/redirect-loop": ["redirect loop", "redirect loops"],
  "flow/redirect-chain": ["redirect chain", "redirect chains"],
  "flow/stuck-loading": ["stuck loading state", "stuck loading states"],
  "flow/state-lost": ["view lost on reload", "views lost on reload"],
  "flow/back-broken": ["broken Back", "broken Backs"],
  "flow/silent-validation": ["form that refuses input in silence", "forms that refuse input in silence"],
  "flow/validation-far": ["error shown away from its field", "errors shown away from their fields"],
  "flow/accepts-invalid": ["form that sends bad input", "forms that send bad input"],
  "flow/silent-success": ["submit with no confirmation", "submits with no confirmation"],
  "flow/dead-submit": ["submit that does nothing", "submits that do nothing"],
  "flow/submit-failed": ["form that fails", "forms that fail"],
  "flow/focus-trap": ["focus trap", "focus traps"],
  "flow/focus-invisible": ["page with invisible focus", "pages with invisible focus"],
  "flow/focus-hidden": ["page where focus goes off screen", "pages where focus goes off screen"],
  "flow/escape-ignored": ["menu Escape won't close", "menus Escape won't close"],
  "flow/focus-not-returned": ["menu that drops focus", "menus that drop focus"],
  "flow/phone-overflow": ["page wider than a phone", "pages wider than a phone"],
  "flow/phone-nav-missing": ["page whose navigation is lost on a phone", "pages whose navigation is lost on a phone"],
  "flow/phone-menu-dead": ["phone menu that doesn't open", "phone menus that don't open"],
  "flow/layout-shift": ["page that jumps while loading", "pages that jump while loading"],
  "flow/click-blocked": ["covered control", "covered controls"],
};

function summarise(run, { policy, checks }) {
  const s = run.stats;
  const did = [];
  if (checks.has("clicks")) did.push(`clicked ${s.clicks} ${s.clicks === 1 ? "control" : "controls"}`);
  if (checks.has("links")) did.push(`followed ${s.links} ${s.links === 1 ? "link" : "links"}`);
  const formsSkipped = run.skipped.filter((x) => /form/.test(x.what) && !/proper submit/.test(x.what)).length;
  if (checks.has("forms")) did.push(s.forms ? `submitted ${s.forms} ${s.forms === 1 ? "form" : "forms"} empty, wrong and right` : formsSkipped ? "submitted no forms" : "found no forms to submit");
  if (checks.has("keyboard")) did.push(`tabbed through ${s.tabbed} ${s.tabbed === 1 ? "page" : "pages"}`);
  if (checks.has("shift")) did.push("loaded each on a slow connection");
  const byRule = new Map();
  for (const f of run.findings) byRule.set(f.rule, (byRule.get(f.rule) ?? 0) + 1);
  const found = [...byRule]
    .filter(([rule]) => NOUNS[rule])
    .sort((a, b) => b[1] - a[1])
    .map(([rule, n]) => `${n} ${NOUNS[rule][n === 1 ? 0 : 1]}`);
  const runtime = run.findings.filter((f) => f.domain === "runtime" && f.severity === "error").length;
  if (runtime) found.push(`${runtime} runtime ${runtime === 1 ? "error" : "errors"}`);
  const pages = `${run.pages.length} ${run.pages.length === 1 ? "page" : "pages"}`;
  let text = `Walked ${pages} at desktop${checks.has("phone") ? " and phone" : ""} width; ${did.join(", ")}. `;
  text += found.length ? `Found ${found.join(", ")}.` : "Every flow tried worked.";
  if (!policy.testHost) text += " This isn't a test host, so nothing was submitted and every write request was blocked.";
  if (run.skipped.length) text += ` ${run.skipped.length} ${run.skipped.length === 1 ? "action was" : "actions were"} skipped for safety or by the config (listed in findings.json).`;
  return text;
}

function projectTitle(root, fallback) {
  try {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
    if (pkg.name) return pkg.name;
  } catch {
    // No package.json: use the page title.
  }
  return fallback;
}

/**
 * The whole smoke test. Returns the run (also written to `out`).
 * `browser` may be given (tests launch their own); otherwise one is launched and closed.
 */
export async function smoke({ base, root, out, config = {}, opts = {}, browser: given = null, headless = true, log = (m) => process.stderr.write(m + "\n") }) {
  const settings = makeSettings(opts, config);
  const policy = makePolicy({ base, testHosts: settings.testHosts, allowWrites: settings.allowWrites });
  const checks = settings.checks;
  const skipped = [];
  const blocked = [];
  const find = sourceFinder(root);
  const prepare = guard({ policy, settings, blocked });
  log(`Smoke test of ${base}${policy.testHost ? " (a test host: forms will be submitted)" : " (not a test host: no writes)"}`);

  // Pages: given, configured, or discovered — with an example for each dynamic route.
  const reachable = (path) => {
    const href = new URL(path, base).href;
    if (settings.forbidUrl(href)) return false;
    return settings.allowWrites || !isDestructivePath(href);
  };
  let routes;
  let dynamic = [];
  const list = (v) => String(v).split(",").map((s) => s.trim()).filter(Boolean);
  if (opts.routes) routes = list(opts.routes);
  else if (config.routes?.length) routes = config.routes;
  else {
    const found = await discover({ root, base, limit: settings.limit });
    routes = found.routes.map((r) => r.path);
    for (const d of found.dynamic) {
      const example = settings.examples[d.path] ?? d.sample;
      if (example) routes.push(example);
      dynamic.push({ path: d.path, sample: example ?? null, file: d.file ?? null });
    }
  }
  for (const [pattern, example] of Object.entries(settings.examples)) {
    if (!routes.includes(example) && !dynamic.some((d) => d.path === pattern)) routes.push(example);
  }
  routes = [...new Set(routes)].filter(reachable).slice(0, settings.limit);
  if (!routes.length) routes = ["/"];

  const browser = given ?? (await launch({ root, headless, log }));
  try {
    const storageState = await signIn(browser, { base, auth: config.auth, root, log });
    const fresh = async (viewport = "desktop") => {
      const context = await withHelpers(await openContext(browser, { viewport, theme: "light", storageState }));
      await prepare(context);
      context.setDefaultTimeout(15000);
      return context;
    };

    // 1. The walk: every page at desktop and phone, an inventory of each, and loaders that never stop.
    const inventories = { desktop: new Map(), phone: new Map() };
    const probes = [{ name: "inventory", fn: PAGE.inventory }];
    if (checks.has("stuck")) probes.push({ name: "stuck", fn: PAGE.stuck, arg: { after: settings.stuckMs } });
    const run = await walk({
      kind: "smoke",
      title: config.title ?? null,
      base,
      root,
      out,
      routes,
      limit: settings.limit,
      viewports: checks.has("phone") ? ["desktop", "phone"] : ["desktop"],
      themes: ["light"],
      probes,
      browser,
      storageState,
      prepare,
      follow: reachable,
      log,
      judge: (run, v) => {
        const inv = v.results?.inventory;
        if (inv && !inv.error) inventories[v.viewport].set(v.route, inv);
        if (v.viewport !== "desktop") return;
        for (const s of Array.isArray(v.results?.stuck) ? v.results.stuck : []) {
          add(run, {
            page: v.route,
            viewport: "desktop",
            theme: "light",
            shot: shotKey("desktop", "light"),
            box: s.box,
            selector: s.sel,
            ...(find(s) ?? {}),
            rule: "flow/stuck-loading",
            severity: "error",
            title: `A loading state never finishes${s.text ? `: “${s.text}”` : ""}`,
            evidence: `${s.why} still showing ${s.seconds} s after the page started loading`,
            detail: "Whatever this waits for never arrives, or never says so. Show the content, an empty state, or an error with a way to retry.",
            fix: "/keyline patterns",
            steps: [openStep(v.route), `Wait ${settings.stuckMs / 1000} s`, `${s.text ? `“${s.text}”` : s.sel} is still loading`],
          });
        }
      },
    });
    run.dynamic = dynamic;
    run.title ??= projectTitle(root, run.pages.find((p) => p.route === "/")?.title ?? run.pages[0]?.title ?? null);
    run.stats = { clicks: 0, links: 0, forms: 0, tabbed: 0, shiftChecked: 0 };
    run.checks = [...checks];
    run.skipped = skipped;
    run.blocked = blocked;
    run.testHost = policy.testHost;
    const visited = run.pages.filter((p) => inventories.desktop.has(p.route)).map((p) => p.route);

    // 2. Links.
    let broken = new Set();
    if (checks.has("links")) {
      const context = await fresh();
      try {
        broken = await checkLinks({ run, request: context.request, base, inventories: inventories.desktop, settings, skipped, log });
      } finally {
        await context.close();
      }
    }

    // 3–7. The passes that use each page, a few pages at a time, each in its own context.
    const perPage = async (name, viewport, fn) => {
      if (!checks.has(name)) return;
      await pool(visited, settings.concurrency, async (route) => {
        const context = await fresh(viewport);
        try {
          await fn({ context, route });
        } catch (err) {
          log(`  ${name} ${route}: ${String(err?.message ?? err).split("\n")[0]}`);
        } finally {
          await context.close().catch(() => {});
        }
      });
    };
    const common = { run, base, settings, policy, skipped, log, find };
    if (!checks.has("clicks") && (checks.has("back"))) checks.add("clicks"); // Back is checked on the clicks that move
    await perPage("clicks", "desktop", ({ context, route }) => checkClicks({ ...common, context, route, inventory: inventories.desktop.get(route) }));
    await perPage("forms", "desktop", ({ context, route }) => checkForms({ ...common, context, route, inventory: inventories.desktop.get(route) }));
    await perPage("keyboard", "desktop", ({ context, route }) => checkKeyboard({ ...common, context, route }));
    await perPage("phone", "phone", ({ context, route }) => checkPhone({ ...common, context, route, desktop: inventories.desktop.get(route), phone: inventories.phone.get(route) }));
    await perPage("shift", "desktop", ({ context, route }) => checkShift({ ...common, context, route }));

    // A 404 the walk found by following a link is already reported, better, as that link.
    const ownUrl = (f) => {
      try {
        return (new URL(f.evidence.split(" ")[1]).pathname.replace(/\/+$/, "") || "/") === f.page;
      } catch {
        return false;
      }
    };
    run.findings = dedupe(run.findings.filter((f) => !(broken.has(f.page) && (f.rule === "runtime/http-status" || (f.rule === "runtime/request-failed" && ownUrl(f))))));
    run.summary = summarise(run, { policy, checks });
    return run;
  } finally {
    if (!given) await browser.close();
  }
}

export async function run(argv) {
  const opts = parseArgs(argv);
  const [cmd, arg] = opts._;
  if (opts.help) {
    console.log(USAGE);
    return 0;
  }
  if (cmd === "probe") {
    try {
      const given = opts.arg ? JSON.parse(opts.arg) : arg === "stuck" ? { after: Number(opts["stuck-ms"] ?? 8000) } : {};
      console.log(expression(arg ?? "inventory", given));
      return 0;
    } catch (err) {
      console.error(err.message);
      return 2;
    }
  }
  if (cmd === "report") {
    console.log(renderDir(resolve(arg ?? opts.out ?? "smoke-report")));
    return 0;
  }
  if (cmd) {
    console.error(`no command '${cmd}'\n\n${USAGE}`);
    return 2;
  }

  const root = resolve(opts.root ?? opts.serve ?? ".");
  let config;
  try {
    config = loadConfig({ root, file: opts.config ?? null });
  } catch (err) {
    console.error(err.message);
    return 2;
  }
  if (!opts.base && !opts.serve && config.base) opts.base = config.base;
  const t = await target({ ...opts, root });
  if (!t) {
    console.error("smoke needs --base <url>, --serve <dir>, or a base in keyline.smoke.json\n");
    console.error(USAGE);
    return 2;
  }
  const out = resolve(opts.out ?? "smoke-report");
  if (existsSync(join(out, "shots"))) rmSync(join(out, "shots"), { recursive: true });
  try {
    const result = await smoke({ base: t.base, root: t.root, out, config, opts, headless: !opts.headed });
    writeRun(out, result);
    const file = renderDir(out);
    const c = counts(result.findings);
    console.log(`\n${result.summary}\n\n${result.pages.length} pages · ${c.error} errors · ${c.warning} warnings · ${c.info} notes\n${file}`);
    return c.error ? 1 : 0;
  } finally {
    await t.stop();
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  run(process.argv.slice(2)).then(
    (code) => process.exit(code),
    (err) => {
      console.error(err?.stack ?? err);
      process.exit(2);
    },
  );
}
