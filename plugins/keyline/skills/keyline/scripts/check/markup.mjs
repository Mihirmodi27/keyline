/**
 * What the detector needs from markup and script files, found without a parser:
 * class lists (attributes, class helpers, string constants), inline styles,
 * <style> blocks, CSS-in-JS templates, and the text of buttons and links.
 *
 * Regexes rather than an AST so it reads any framework's files the same way
 * and never fails on syntax it doesn't know. The cost is precision: a class
 * built by concatenation is invisible, and a string that only looks like a
 * class list can be read as one. Rules are written to tolerate both.
 */
import { blankComments, lineIndex, parseCss, parseInlineStyle } from "./css.mjs";

const CLASS_ATTR = /\b(?:class|className|class:list)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{\s*"([^"]*)"\s*\}|\{\s*'([^']*)'\s*\}|\{\s*`([^`]*)`\s*\})/g;
const CLASS_CALL = /\b(?:cn|clsx|cx|classNames|classnames|twMerge|twJoin|cva|tv)\s*\(/g;
const EXPR_STRING = /(?:[=:(,\[?]|\breturn|&&|\|\|)\s*(["'`])((?:(?!\1)[^\\\n]|\\.)*)\1/g;
const CLASSY = /^[\w\s:\-\[\]\/.#%(),!&>*@=+'"~]*$/;
const TAILWINDISH = /(?:^|\s)!?(?:[\w-]+:)*-?(?:p[xytrbl]?|m[xytrbl]?|text|bg|border|rounded|flex|grid|gap|w|h|min-w|min-h|max-w|max-h|font|leading|tracking|shadow|z|opacity|transition|duration|ease|animate|backdrop|ring|outline|uppercase|italic|hidden|block|inline|absolute|relative|fixed|sticky|top|left|right|bottom|inset|items|justify|self|space|overflow|cursor|select|pointer|translate|scale|rotate|blur|from|to|via|fill|stroke)(?:-[\w.\[\]#%/():,-]+)?(?=\s|$)/;

/** Split a class token into its variants and its utility, respecting [arbitrary:values]. */
export function splitClass(token) {
  let t = token.replace(/^!/, "").replace(/!$/, "");
  let depth = 0;
  let cut = -1;
  for (let i = 0; i < t.length; i++) {
    if (t[i] === "[" || t[i] === "(") depth++;
    else if (t[i] === "]" || t[i] === ")") depth--;
    else if (t[i] === ":" && depth === 0) cut = i;
  }
  return { variants: cut < 0 ? [] : t.slice(0, cut).split(":"), base: cut < 0 ? t : t.slice(cut + 1), raw: token };
}

function balanced(text, open, openCh, closeCh) {
  let depth = 0;
  let quote = null;
  for (let i = open; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      if (c === "\\") i++;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") quote = c;
    else if (c === openCh) depth++;
    else if (c === closeCh && --depth === 0) return i;
  }
  return -1;
}

/** Static parts of a template literal body; ${…} becomes spaces of equal length. */
const staticParts = (s) => s.replace(/\$\{[^}]*\}/g, (m) => " ".repeat(m.length));

export function readMarkup(source, ext) {
  // Blank JS comments only in script-like files; in HTML `//` is just text.
  const isHtmlLike = ext === ".html" || ext === ".vue" || ext === ".svelte" || ext === ".astro";
  let text = blankComments(source);
  if (!isHtmlLike) text = text.replace(/(^|[^:"'`\\])\/\/[^\n]*/g, (m, pre) => pre + " ".repeat(m.length - pre.length));
  text = text.replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, " "));
  const at = lineIndex(text);

  const classLists = []; // { line, tokens: [{...splitClass, line}], tag }
  const seen = new Set();
  const addList = (value, offset, origin) => {
    if (seen.has(offset)) return;
    seen.add(offset);
    const tokens = [];
    const re = /\S+/g;
    let m;
    while ((m = re.exec(value))) tokens.push({ ...splitClass(m[0]), line: at(offset + m.index) });
    if (tokens.length) classLists.push({ line: at(offset), tokens, tag: origin === "attribute" ? tagAround(offset, value.length) : "" });
  };

  /** The opening tag a class attribute sits in, for rules that need its element or attributes. */
  const tagAround = (offset, length) => {
    let lt = offset;
    while (lt > 0 && !(text[lt] === "<" && /[A-Za-z]/.test(text[lt + 1] ?? ""))) lt--;
    const rest = text.slice(offset + length, offset + length + 600);
    const gt = rest.search(/(?<![=-])>/);
    return text.slice(lt, offset + length + (gt < 0 ? 0 : gt + 1));
  };

  for (const m of text.matchAll(CLASS_ATTR)) {
    const idx = m.slice(1).findIndex((g) => g !== undefined);
    const value = m[idx + 1];
    const offset = m.index + m[0].indexOf(value, m[0].indexOf("="));
    addList(idx === 4 ? staticParts(value) : value, offset, "attribute");
  }
  for (const m of text.matchAll(CLASS_CALL)) {
    const open = m.index + m[0].length - 1;
    const close = balanced(text, open, "(", ")");
    if (close < 0) continue;
    const args = text.slice(open + 1, close);
    for (const s of args.matchAll(/(["'`])((?:(?!\1)[^\\]|\\.)*)\1/g)) {
      addList(s[1] === "`" ? staticParts(s[2]) : s[2], open + 1 + s.index + 1, "helper");
    }
  }
  if (ext !== ".html") {
    for (const m of text.matchAll(EXPR_STRING)) {
      const value = m[2];
      if (value.length < 3 || !CLASSY.test(value) || !TAILWINDISH.test(value)) continue;
      if (/^[a-z]+(-[a-z]+)*$/.test(value) && !/\s/.test(value) && !/^(uppercase|italic|transition-all|h-screen|min-h-screen|outline-none)$/.test(value)) continue;
      addList(m[1] === "`" ? staticParts(value) : value, m.index + m[0].lastIndexOf(m[1] + value) + 1, "string");
    }
  }

  // Styles: <style> blocks, style="…" attributes, style={{…}} objects, CSS-in-JS templates.
  const css = [];
  for (const m of text.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
    const body = source.slice(m.index + m[0].indexOf(">") + 1, m.index + m[0].lastIndexOf("</"));
    css.push(parseCss(body, at(m.index + m[0].indexOf(">") + 1)));
  }
  const inline = [];
  for (const m of text.matchAll(/\bstyle\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
    const body = m[1] ?? m[2];
    if (body.includes(":")) inline.push(...parseInlineStyle(body, at(m.index)));
  }
  for (const m of text.matchAll(/\bstyle\s*=\s*\{\{/g)) {
    const open = m.index + m[0].length - 1;
    const close = balanced(text, open, "{", "}");
    if (close < 0) continue;
    const body = text.slice(open + 1, close);
    for (const p of body.matchAll(/([A-Za-z]+)\s*:\s*("[^"]*"|'[^']*'|`[^`]*`|-?[\d.]+)/g)) {
      const prop = p[1].replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
      const value = p[2].replace(/^["'`]|["'`]$/g, "");
      inline.push({ prop, value, line: at(open + 1 + p.index), selector: "[style]", atRules: [], block: null, inline: true });
    }
  }
  for (const m of text.matchAll(/\b(?:styled(?:\.\w+|\([^)]*\))|css|createGlobalStyle|keyframes|injectGlobal)\s*`([^`]*)`/g)) {
    const bodyOffset = m.index + m[0].indexOf("`") + 1;
    css.push(parseCss(`x{${staticParts(m[1])}}`, at(bodyOffset)));
  }

  // Visible text of buttons and links, for the copy rules.
  const labels = [];
  for (const m of text.matchAll(/<(button|Button|a|Link)\b[^>]*>\s*([^<>{}]+?)\s*<\/\1>/g)) {
    labels.push({ element: m[1], text: m[2].replace(/\s+/g, " ").trim(), line: at(m.index + m[0].indexOf(m[2])) });
  }

  // Navigation blocks: how many links each writes out, and whether it groups them.
  // Links rendered from an array (`items.map`) are invisible here, so the count is a floor.
  const navs = [];
  for (const m of text.matchAll(/<nav\b[^>]*>([\s\S]*?)<\/nav>/g)) {
    const body = m[1];
    const links = (body.match(/<(?:a|Link|NavLink)\b/g) ?? []).length;
    const grouped = /<details\b|<h[2-6]\b|role\s*=\s*["']group|<section\b|<fieldset\b/.test(body) || (body.match(/<ul\b/g) ?? []).length > 1;
    navs.push({ line: at(m.index), links, grouped });
  }

  return { text, classLists, css, inline, labels, navs };
}
