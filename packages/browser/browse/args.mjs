/**
 * Arguments for the browser tools. Each command names the options it takes:
 * `values` take one (`--base URL` or `--base=URL`, split at the first `=`
 * only, so a URL keeps its query), `switches` take none. Anything else that
 * starts with a dash is an error, so a typo (`--bsae`) is never dropped in
 * silence. `-h` and `--help` are always known.
 *
 * @returns {{ _: string[], [option: string]: string | boolean | string[] } | { error: string }}
 */
export function parseArgs(argv, { values = [], switches = [] } = {}) {
  const opts = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-h" || a === "--help") {
      opts.help = true;
      continue;
    }
    if (!a.startsWith("-") || a === "-") {
      opts._.push(a);
      continue;
    }
    const eq = a.indexOf("=");
    const name = a.startsWith("--") ? (eq > 0 ? a.slice(2, eq) : a.slice(2)) : a;
    if (switches.includes(name)) {
      if (eq > 0) return { error: `--${name} takes no value` };
      opts[name] = true;
    } else if (values.includes(name)) {
      const value = eq > 0 ? a.slice(eq + 1) : argv[++i];
      if (value === undefined || value === "" || (eq < 0 && value.startsWith("--"))) return { error: `--${name} needs a value` };
      opts[name] = value;
    } else {
      return { error: `unknown option ${a.startsWith("--") ? `--${name}` : a}` };
    }
  }
  return opts;
}

/** Parse, or print why not and a pointer to --help. Returns null on a usage error (the caller exits 2). */
export function parseOrExplain(command, argv, spec) {
  const opts = parseArgs(argv, spec);
  if (!opts.error) return opts;
  console.error(`keyline ${command}: ${opts.error} (try --help)`);
  return null;
}
