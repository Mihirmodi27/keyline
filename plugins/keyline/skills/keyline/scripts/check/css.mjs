/**
 * A forgiving CSS reader: enough structure for lint rules, no dependencies.
 *
 * It returns every declaration with its line, the selector it sits under and
 * the at-rules around it, plus every at-rule prelude. It doesn't validate and
 * it doesn't resolve var(); nested rules (SCSS, CSS nesting) keep their
 * innermost selector. Comments are blanked rather than removed, so offsets and
 * line numbers stay true to the source.
 */

/** Replace comments with spaces, keeping newlines, so positions survive. */
export function blankComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
}

/** Lines start offsets, for fast offset → line lookups on big files. */
export function lineIndex(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i++) if (text.charCodeAt(i) === 10) starts.push(i + 1);
  return (offset) => {
    let lo = 0;
    let hi = starts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (starts[mid] <= offset) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  };
}

/**
 * @param {string} source CSS text
 * @param {number} baseLine line number of the first character (for <style> blocks)
 */
export function parseCss(source, baseLine = 1) {
  const text = blankComments(source);
  const at = lineIndex(text);
  const decls = [];
  const atRules = [];
  const stack = []; // open blocks: { kind: 'rule'|'at', prelude, block: { decls } }
  let start = 0;
  let quote = null;
  let paren = 0;

  const context = () => ({
    selector: [...stack].reverse().find((s) => s.kind === "rule")?.prelude ?? "",
    atRules: stack.filter((s) => s.kind === "at").map((s) => s.prelude),
    block: stack.at(-1)?.block ?? null,
  });

  const pushDecl = (from, to) => {
    const raw = text.slice(from, to);
    const colon = raw.indexOf(":");
    if (colon < 1) return;
    const prop = raw.slice(0, colon).trim().toLowerCase();
    if (!/^(--)?[a-z-]+$/.test(prop) && !/^--[\w-]+$/.test(prop)) return;
    const value = raw.slice(colon + 1).trim();
    const lead = from + raw.search(/\S/);
    const ctx = context();
    const d = { prop, value, line: at(lead) + baseLine - 1, selector: ctx.selector, atRules: ctx.atRules, block: ctx.block };
    decls.push(d);
    ctx.block?.decls.push(d);
  };

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      if (c === "\\") i++;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'") quote = c;
    else if (c === "(") paren++;
    else if (c === ")") paren = Math.max(0, paren - 1);
    else if (paren > 0) continue;
    else if (c === "{") {
      const prelude = text.slice(start, i).trim().replace(/\s+/g, " ");
      const kind = prelude.startsWith("@") ? "at" : "rule";
      const lead = start + text.slice(start, i).search(/\S/);
      if (kind === "at") atRules.push({ prelude, line: at(Math.max(lead, 0)) + baseLine - 1 });
      stack.push({ kind, prelude, block: { decls: [] } });
      start = i + 1;
    } else if (c === ";") {
      if (stack.length) pushDecl(start, i);
      else {
        const prelude = text.slice(start, i).trim();
        if (prelude.startsWith("@")) atRules.push({ prelude, line: at(start + text.slice(start, i).search(/\S/)) + baseLine - 1 });
      }
      start = i + 1;
    } else if (c === "}") {
      if (stack.length) pushDecl(start, i);
      stack.pop();
      start = i + 1;
    }
  }
  return { decls, atRules };
}

/** Parse a `style="..."` attribute's body. */
export function parseInlineStyle(body, line) {
  return parseCss(`x{${body}}`, line).decls.map((d) => ({ ...d, selector: "[style]", inline: true }));
}
