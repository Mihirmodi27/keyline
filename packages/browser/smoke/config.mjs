/**
 * The smoke test's settings and its safety rules.
 *
 * `keyline.smoke.json`, at the project root (or `--config <file>`), is
 * optional. Every key is:
 *
 *   {
 *     "base": "http://localhost:3000",
 *     "routes": ["/", "/settings"],                  // only these, instead of discovery
 *     "examples": { "/projects/[id]": "/projects/42" }, // a URL for each dynamic route
 *     "testHosts": ["staging.example.com"],          // hosts besides localhost where writes may run
 *     "auth": {
 *       "storageState": ".auth/state.json",           // a saved Playwright session, or:
 *       "login": {
 *         "url": "/login",
 *         "steps": [
 *           { "fill": "#email", "env": "SMOKE_EMAIL" },  // credentials only from the environment
 *           { "fill": "#password", "env": "SMOKE_PASSWORD" },
 *           { "click": "button[type=submit]" },
 *           { "waitFor": "/dashboard" }                 // a URL path, or a selector
 *         ]
 *       }
 *     },
 *     "forbid": { "selectors": [".danger-zone"], "urls": ["/admin/*", "/billing"] },
 *     "maxClicks": 30,
 *     "quietMs": 1500,
 *     "stuckMs": 8000
 *   }
 *
 * The rules: anything that writes (a form submit, or a control whose words or
 * URL say delete, remove, pay, buy, purchase, unsubscribe, sign out, log out)
 * runs only on a test host: localhost, 127.0.0.1, ::1, *.localhost, *.test,
 * or a host listed in `testHosts`. Of those, the destructive ones run only with
 * `--allow-writes`. Elsewhere, the runner also blocks every request that isn't
 * a GET, HEAD or OPTIONS, whatever started it.
 */
import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, join, resolve } from "node:path";

export const DEFAULTS = {
  maxClicks: 30,
  quietMs: 1500,
  stuckMs: 8000,
  limit: 20,
  concurrency: 3,
};

export const CHECKS = ["links", "clicks", "stuck", "back", "forms", "keyboard", "phone", "shift"];

/** Words that mean an action can't be taken back, or costs money, or ends the session. */
export const DESTRUCTIVE = /\b(delete|remove|destroy|erase|wipe|discard|deactivate|close account|cancel (?:my )?(?:subscription|plan|account)|pay|buy|purchase|checkout|check out|place order|unsubscribe|sign ?out|log ?out|logout|signout|revoke)\b/i;
const DESTRUCTIVE_PATH = /(^|[/_-])(delete|remove|destroy|logout|log-out|signout|sign-out|unsubscribe|checkout|purchase|pay|revoke)([/_.-]|$)/i;

export function isDestructive(...texts) {
  return texts.some((t) => t && DESTRUCTIVE.test(String(t)));
}

export function isDestructivePath(url) {
  try {
    const u = new URL(url, "http://x");
    return DESTRUCTIVE_PATH.test(u.pathname) || DESTRUCTIVE_PATH.test(u.search);
  } catch {
    return false;
  }
}

/** A host where writes may run: local, *.localhost, *.test, or one the config names. */
export function isTestHost(base, testHosts = []) {
  let host;
  try {
    host = new URL(base).hostname.toLowerCase().replace(/^\[|\]$/g, "");
  } catch {
    return false;
  }
  if (["localhost", "127.0.0.1", "::1", "0.0.0.0"].includes(host)) return true;
  if (host.endsWith(".localhost") || host.endsWith(".test")) return true;
  return testHosts.map((h) => String(h).toLowerCase()).includes(host);
}

/** A glob (`/admin/*`), a regex (`/^\/admin/`), or a plain substring. */
export function urlMatcher(patterns = []) {
  const tests = patterns.map((p) => {
    const s = String(p);
    if (s.length > 2 && s.startsWith("/") && s.endsWith("/") && /[\\^$()|[\]]/.test(s)) {
      const re = new RegExp(s.slice(1, -1));
      return (u) => {
        try {
          const url = new URL(u, "http://x");
          return re.test(url.pathname + url.search) || re.test(u);
        } catch {
          return re.test(u);
        }
      };
    }
    if (s.includes("*")) {
      const re = new RegExp("^" + s.split("*").map((x) => x.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*") + "$");
      return (u) => {
        try {
          const url = new URL(u, "http://x");
          return re.test(url.pathname) || re.test(url.href);
        } catch {
          return re.test(u);
        }
      };
    }
    return (u) => u.includes(s);
  });
  return (u) => tests.some((t) => t(u));
}

export function loadConfig({ root = ".", file = null } = {}) {
  const path = file ? (isAbsolute(file) ? file : resolve(file)) : join(resolve(root), "keyline.smoke.json");
  if (!existsSync(path)) {
    if (file) throw new Error(`no config at ${file}`);
    return { path: null };
  }
  let config;
  try {
    config = JSON.parse(readFileSync(path, "utf8"));
  } catch (err) {
    throw new Error(`${path} isn't valid JSON: ${err.message}`);
  }
  validate(config, path);
  return { ...config, path };
}

function validate(config, path) {
  const login = config.auth?.login;
  if (!login) return;
  if (!Array.isArray(login.steps)) throw new Error(`${path}: auth.login.steps must be a list`);
  for (const step of login.steps) {
    if (step.fill && !step.env) {
      throw new Error(`${path}: the login step filling ${step.fill} needs "env", the environment variable holding the value. Credentials never go in the config.`);
    }
    if ("value" in step || "password" in step) {
      throw new Error(`${path}: a login step has an inline value. Put it in an environment variable and name it with "env".`);
    }
  }
}

/** Settings from defaults, then the config, then the command line. */
export function settings(opts, config) {
  const list = (v) => (v ? String(v).split(",").map((s) => s.trim()).filter(Boolean) : null);
  const only = list(opts.only);
  const skip = list(opts.skip) ?? [];
  for (const c of [...(only ?? []), ...skip]) {
    if (!CHECKS.includes(c)) throw new Error(`no check called '${c}' — use ${CHECKS.join(", ")}`);
  }
  const testHosts = [...(config.testHosts ?? []), ...(list(opts["test-host"]) ?? [])];
  return {
    checks: new Set((only ?? CHECKS).filter((c) => !skip.includes(c))),
    maxClicks: Number(opts["max-clicks"] ?? config.maxClicks ?? DEFAULTS.maxClicks),
    quietMs: Number(opts["quiet-ms"] ?? config.quietMs ?? DEFAULTS.quietMs),
    stuckMs: Number(opts["stuck-ms"] ?? config.stuckMs ?? DEFAULTS.stuckMs),
    limit: Number(opts.limit ?? DEFAULTS.limit),
    concurrency: Math.max(1, Number(opts.concurrency ?? DEFAULTS.concurrency)),
    allowWrites: Boolean(opts["allow-writes"]),
    testHosts,
    forbidSelectors: config.forbid?.selectors ?? [],
    forbidUrl: urlMatcher(config.forbid?.urls ?? []),
    examples: config.examples ?? {},
  };
}

/**
 * What the runner may do on this host. `write` is a form submit or anything
 * that sends data; `destructive` is a write that can't be taken back.
 */
export function policy({ base, testHosts = [], allowWrites = false }) {
  const test = isTestHost(base, testHosts);
  return {
    testHost: test,
    allowWrites,
    mayWrite: test,
    mayDestroy: test && allowWrites,
    /** Why an action is skipped, or null when it may run. */
    blocks({ write = false, destructive = false } = {}) {
      if (destructive && !test) return "it would change data, and this isn't a test host";
      if (destructive && !allowWrites) return "it looks destructive; run with --allow-writes on a test host to include it";
      if (write && !test) return "it submits data, and this isn't a test host";
      return null;
    },
  };
}
