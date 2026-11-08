/**
 * What the smoke test runs inside a page. Each export is a function Playwright
 * serialises into the page (`page.evaluate(fn, arg)`), so none of them may
 * close over anything here: they share helpers through `window.__kl`, which
 * `HELPERS` installs and every exported function installs first.
 *
 * The same source works in an agent's own browser: `smoke.mjs probe <name>`
 * prints any of them as one expression to paste into its JavaScript tool.
 */

/** Installs window.__kl: visibility, accessible-ish names, selectors and boxes. Runs in the page. */
function installHelpers() {
  if (window.__kl) return;
  const sel =
    window.__keylineSelector ||
    function (el) {
      const parts = [];
      while (el && el.nodeType === 1 && parts.length < 4) {
        if (el.id) {
          parts.unshift("#" + CSS.escape(el.id));
          break;
        }
        parts.unshift(el.localName);
        el = el.parentElement;
      }
      return parts.join(" > ");
    };
  const box = (el) => {
    const r = el.getBoundingClientRect();
    return { x: Math.round(r.left + window.scrollX), y: Math.round(r.top + window.scrollY), w: Math.round(r.width), h: Math.round(r.height) };
  };
  const visible = (el) => {
    if (!el || !el.isConnected || el.nodeType !== 1) return false;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return false;
    if (el.checkVisibility && !el.checkVisibility({ opacityProperty: true, visibilityProperty: true, contentVisibilityAuto: true })) return false;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none" || Number(cs.opacity) === 0) return false;
    const vw = document.documentElement.clientWidth;
    if (r.right <= 0 || r.left >= vw || r.bottom + window.scrollY <= 0) return false;
    // Clipped to nothing (the "visually hidden" pattern).
    if (cs.clip === "rect(0px, 0px, 0px, 0px)" || cs.clipPath === "inset(50%)") return false;
    return true;
  };
  const clean = (s) => String(s || "").replace(/\s+/g, " ").trim().slice(0, 80);
  const name = (el) => {
    const labelled = el.getAttribute("aria-labelledby");
    if (labelled) {
      const t = labelled.split(/\s+/).map((id) => document.getElementById(id)?.innerText || "").join(" ");
      if (clean(t)) return clean(t);
    }
    return clean(
      el.getAttribute("aria-label") ||
        el.innerText ||
        (el.localName === "input" ? el.value : "") ||
        el.getAttribute("title") ||
        el.getAttribute("alt") ||
        el.querySelector?.("img[alt]")?.getAttribute("alt") ||
        el.querySelector?.("svg title")?.textContent ||
        "",
    );
  };
  const abs = (href) => {
    try {
      return new URL(href, location.href).href;
    } catch {
      return null;
    }
  };
  const noHash = (u) => (u ? u.replace(/#.*$/, "") : u);
  /** Text a reader can see on the page, as a set of words: what "the same content" is compared by. */
  const words = () => {
    const root = document.querySelector("main, [role=main]") || document.body;
    const text = (root?.innerText || "").toLowerCase();
    return [...new Set(text.match(/[\p{L}\p{N}]{2,}/gu) || [])].slice(0, 1500);
  };
  const OVERLAY = 'dialog[open], [role="dialog"], [role="alertdialog"], [aria-modal="true"], [role="menu"], [role="listbox"], [popover]:popover-open';
  const overlays = () => {
    let list = [];
    try {
      list = [...document.querySelectorAll(OVERLAY)];
    } catch {
      list = [...document.querySelectorAll(OVERLAY.replace(", [popover]:popover-open", ""))];
    }
    return list.filter(visible);
  };
  window.__kl = { sel, box, visible, name, clean, abs, noHash, words, overlays };
}

export const HELPERS = `(${installHelpers.toString()})();`;

/** Make a function that installs the helpers, then runs `fn(arg)`. */
function withKl(fn) {
  // eslint-disable-next-line no-new-func
  return new Function("arg", `${HELPERS}\nreturn (${fn.toString()})(arg);`);
}

/* ── Inventory: everything a tester would try ────────────────────────────── */

function inventoryFn(arg = {}) {
  const kl = window.__kl;
  const origin = location.origin;
  const doc = document.documentElement;
  const CONTROL = [
    "a[href]",
    "a[onclick]",
    "button",
    "input[type=button]",
    "input[type=submit]",
    "input[type=reset]",
    "input[type=image]",
    "summary",
    "[role=button]",
    "[role=link]",
    "[role=tab]",
    "[role=menuitem]",
    "[role=option]",
    "[role=switch]",
    "[role=checkbox]",
    "[onclick]",
  ].join(",");

  const disabled = (el) => el.matches(":disabled") || el.closest('[aria-disabled="true"], [inert], fieldset:disabled');
  const forms = [...document.forms];
  const all = [];
  const seen = new Set();
  for (const el of document.querySelectorAll(CONTROL)) {
    if (seen.has(el)) continue;
    // A control inside another control is the same click.
    if (el.parentElement?.closest(CONTROL) && !el.matches("a[href], button")) continue;
    seen.add(el);
    all.push(el);
  }
  // Elements that only say "click me" through the cursor: the div with an onClick handler.
  for (const el of document.body ? document.body.querySelectorAll("*") : []) {
    if (seen.has(el) || el.closest(CONTROL) || el.closest("label")) continue;
    if (/^(html|body|input|select|textarea|option|label|svg|path|use|img|video|audio|iframe|canvas)$/.test(el.localName)) continue;
    const cs = getComputedStyle(el);
    if (cs.cursor !== "pointer") continue;
    const parent = el.parentElement;
    if (parent && getComputedStyle(parent).cursor === "pointer") continue;
    if (el.querySelector(CONTROL + ", input, select, textarea, label")) continue;
    seen.add(el);
    all.push(el);
  }

  const clickables = [];
  for (const el of all) {
    if (disabled(el)) continue;
    const visible = kl.visible(el);
    if (!visible) continue;
    const hrefRaw = el.localName === "a" ? el.getAttribute("href") : null;
    const href = hrefRaw != null ? kl.abs(hrefRaw) : null;
    const form = el.form || el.closest("form");
    const type = (el.getAttribute("type") || "").toLowerCase();
    const isSubmit = Boolean(form) && ((el.localName === "button" && (type === "" || type === "submit")) || (el.localName === "input" && (type === "submit" || type === "image")));
    let kind = "pointer";
    if (el.localName === "a" && hrefRaw != null) kind = "link";
    else if (el.localName === "button" || el.localName === "input") kind = "button";
    else if (el.getAttribute("role") || el.localName === "summary") kind = "control";
    else if (el.hasAttribute("onclick")) kind = "button";
    clickables.push({
      i: clickables.length,
      kind,
      tag: el.localName,
      role: el.getAttribute("role"),
      text: kl.name(el),
      sel: kl.sel(el),
      box: kl.box(el),
      href,
      hrefRaw,
      target: el.getAttribute("target"),
      download: el.hasAttribute("download"),
      sameOrigin: href ? href.startsWith(origin + "/") || href === origin : null,
      placeholder: hrefRaw != null && /^\s*(#\s*|javascript:.*)?$/i.test(hrefRaw),
      hashOnly: hrefRaw != null && /^#./.test(hrefRaw.trim()),
      isSubmit,
      form: form ? forms.indexOf(form) : -1,
      haspopup: el.getAttribute("aria-haspopup"),
      expanded: el.getAttribute("aria-expanded"),
      controls: el.getAttribute("aria-controls"),
      inNav: Boolean(el.closest("nav, header, [role=navigation], [role=banner]")),
      // Already where it would take you: the selected tab, the current page's link. Clicking it should do nothing.
      current: (el.getAttribute("aria-selected") === "true" && /^(tab|option)$/.test(el.getAttribute("role") || "")) || (el.hasAttribute("aria-current") && el.getAttribute("aria-current") !== "false"),
      context: kl.clean(el.closest("form, section, [role=dialog], nav, header, footer, li, tr")?.getAttribute("aria-label") || ""),
    });
  }

  const formList = forms.map((form, i) => {
    const fields = [...form.elements]
      .filter((f) => /^(input|select|textarea)$/.test(f.localName) && !/^(hidden|submit|button|reset|image)$/i.test(f.type) && !f.disabled)
      .map((f) => {
        const label = kl.clean((f.labels && f.labels[0]?.innerText) || f.getAttribute("aria-label") || f.getAttribute("placeholder") || f.name || "");
        return {
          sel: kl.sel(f),
          tag: f.localName,
          type: (f.type || "text").toLowerCase(),
          name: f.name || null,
          label,
          required: f.required || f.getAttribute("aria-required") === "true" || /\*\s*$/.test(label),
          pattern: f.getAttribute("pattern"),
          minLength: f.minLength > 0 ? f.minLength : null,
          min: f.getAttribute("min"),
          max: f.getAttribute("max"),
          visible: kl.visible(f),
        };
      });
    const submit = [...form.querySelectorAll('button:not([type]), button[type=submit], input[type=submit], input[type=image]')].find(kl.visible) ||
      (form.id ? [...document.querySelectorAll(`[form="${CSS.escape(form.id)}"]`)].find((b) => b.type === "submit" && kl.visible(b)) : null);
    return {
      i,
      sel: kl.sel(form),
      box: kl.box(form),
      visible: kl.visible(form),
      method: (form.getAttribute("method") || "get").toLowerCase(),
      action: form.getAttribute("action") ? kl.abs(form.getAttribute("action")) : location.href,
      novalidate: form.noValidate,
      role: form.getAttribute("role"),
      name: kl.clean(form.getAttribute("aria-label") || form.querySelector("h1,h2,h3,legend")?.innerText || ""),
      text: kl.clean(form.innerText).slice(0, 200),
      fields,
      submit: submit ? { sel: kl.sel(submit), text: kl.name(submit), box: kl.box(submit) } : null,
    };
  });

  // Every same-origin link, visible or not, once per target: the link check reads these.
  // Keyed by URL and words, so placeholder links (all "#") stay apart for the phone pass.
  const links = [];
  const byKey = new Set();
  for (const a of document.querySelectorAll("a[href]")) {
    const href = kl.noHash(kl.abs(a.getAttribute("href")));
    if (!href || !/^https?:/.test(href)) continue;
    const key = href + "|" + kl.name(a);
    if (byKey.has(key)) continue;
    byKey.add(key);
    const vis = kl.visible(a);
    links.push({ key, href, sameOrigin: href.startsWith(origin + "/") || href === origin, text: kl.name(a), sel: kl.sel(a), box: vis ? kl.box(a) : null, visible: vis, inNav: Boolean(a.closest("nav, header, [role=navigation], [role=banner]")) });
  }

  // Wider than the screen: the widest element that pokes out, outside any scroller.
  let overflow = null;
  const vw = doc.clientWidth;
  if (doc.scrollWidth > vw + 1) {
    let worst = null;
    for (const el of document.body.querySelectorAll("*")) {
      const r = el.getBoundingClientRect();
      if (r.right <= vw + 1 || r.width === 0) continue;
      let clipped = false;
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        const ox = getComputedStyle(p).overflowX;
        if (ox !== "visible") {
          clipped = true;
          break;
        }
      }
      if (clipped) continue;
      const pr = el.parentElement?.getBoundingClientRect();
      if (pr && pr.right > vw + 1 && el.parentElement !== document.body) continue; // report the outermost
      if (!worst || r.right > worst.r.right) worst = { el, r };
    }
    // Outline something that's at least partly on screen: the off-screen element's nearest visible ancestor.
    let shown = worst?.el;
    while (shown && shown.parentElement && shown.parentElement !== document.body && shown.getBoundingClientRect().left >= vw) shown = shown.parentElement;
    overflow = {
      scrollWidth: doc.scrollWidth,
      width: vw,
      culprit: worst ? { sel: kl.sel(shown), box: kl.box(shown), text: kl.name(shown), past: kl.sel(worst.el), pastName: kl.name(worst.el), offscreen: worst.r.left >= vw } : null,
    };
  }

  return { url: location.href, clickables, forms: formList, links, overflow };
}

/** Find one clickable again in a fresh page and mark it for Playwright: `[data-keyline-target]`. */
function markFn({ match, attr = "data-keyline-target" }) {
  const kl = window.__kl;
  for (const old of document.querySelectorAll(`[${attr}]`)) old.removeAttribute(attr);
  let el = null;
  try {
    const candidates = [...document.querySelectorAll(match.sel)];
    el = candidates.find((c) => kl.name(c) === match.text) || (candidates.length === 1 ? candidates[0] : null);
  } catch {
    // An unparseable selector: fall through to text.
  }
  if (!el && match.text) {
    const tags = document.querySelectorAll(match.tag || "*");
    el = [...tags].find((c) => kl.name(c) === match.text && kl.visible(c)) || null;
  }
  if (!el) return null;
  el.setAttribute(attr, "");
  return { box: kl.box(el), sel: kl.sel(el) };
}

/* ── Stuck loading ───────────────────────────────────────────────────────── */

async function stuckFn({ after = 8000 } = {}) {
  const kl = window.__kl;
  const LOADER = /(^|[-_\s])(spinner|loader|loading|skeleton|shimmer|placeholder-glow|placeholder-wave)([-_\s]|$)/i;
  const isLoader = (el) =>
    el.getAttribute("aria-busy") === "true" ||
    (el.getAttribute("role") === "progressbar" && !el.hasAttribute("aria-valuenow")) ||
    (el.localName === "progress" && !el.hasAttribute("value")) ||
    (typeof el.className === "string" && LOADER.test(el.className));
  const find = () => {
    const hits = [...document.body.querySelectorAll("*")].filter((el) => isLoader(el) && kl.visible(el));
    return hits.filter((el) => !hits.some((o) => o !== el && o.contains(el)));
  };
  if (!find().length) return [];
  const wait = after - performance.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  return find().map((el) => ({
    sel: kl.sel(el),
    box: kl.box(el),
    text: kl.name(el),
    why: el.getAttribute("aria-busy") === "true" ? 'aria-busy="true"' : el.getAttribute("role") === "progressbar" ? "an indeterminate progressbar" : el.localName === "progress" ? "an indeterminate <progress>" : `class "${String(el.className).trim().slice(0, 60)}"`,
    seconds: Math.round(performance.now() / 100) / 10,
  }));
}

/* ── Watching a click ────────────────────────────────────────────────────── */

/**
 * Start watching the page. Mutations during the baseline (before `armFn`) mark
 * their nodes as background noise — a clock, a carousel — and are ignored after.
 */
function watchFn() {
  const kl = window.__kl;
  const target = document.querySelector("[data-keyline-target]");
  // Press, hover and focus markers that libraries set on the control itself are not an effect.
  const PRESS = /^data-(?:rac-)?(?:pressed|focus|focused|focus-visible|focus-within|hovered|hover|active)$/;
  const w = {
    armed: false,
    bg: new WeakSet(),
    count: 0,
    samples: [],
    own: new Map(), // attribute changes on the target or its ancestors: count only if they stuck
    focus: null,
    scroll: [0, 0],
    overlays: 0,
    expanded: null,
    words: null,
    target,
  };
  const describe = (m) => (m.type === "childList" ? `${m.addedNodes.length ? "added" : "removed"} in ${kl.sel(m.target.nodeType === 1 ? m.target : m.target.parentElement)}` : m.type === "attributes" ? `${m.attributeName} on ${kl.sel(m.target)}` : `text in ${kl.sel(m.target.parentElement)}`);
  const obs = new MutationObserver((list) => {
    for (const m of list) {
      if (m.type === "attributes" && /^data-keyline/.test(m.attributeName)) continue;
      if (!w.armed) {
        w.bg.add(m.target);
        continue;
      }
      if (w.bg.has(m.target)) continue;
      if (m.type === "attributes" && m.target.nodeType === 1 && target && m.target.contains(target)) {
        if (PRESS.test(m.attributeName)) continue;
        const key = m.attributeName;
        if (!w.own.has(m.target)) w.own.set(m.target, new Map());
        const byAttr = w.own.get(m.target);
        if (!byAttr.has(key)) byAttr.set(key, m.oldValue);
        continue;
      }
      w.count++;
      if (w.samples.length < 3) w.samples.push(describe(m));
    }
  });
  obs.observe(document, { subtree: true, childList: true, attributes: true, attributeOldValue: true, characterData: true });
  w.obs = obs;
  window.__klWatch = w;
  return true;
}

function armFn() {
  const kl = window.__kl;
  const w = window.__klWatch;
  if (!w) return false;
  w.armed = true;
  w.focus = document.activeElement;
  w.scroll = [window.scrollX, window.scrollY];
  w.overlays = kl.overlays().length;
  w.expanded = w.target?.getAttribute("aria-expanded") ?? null;
  w.words = kl.words();
  return { words: w.words };
}

function readFn() {
  const kl = window.__kl;
  const w = window.__klWatch;
  if (!w || !kl) return { gone: true };
  let own = 0;
  for (const [node, attrs] of w.own) for (const [attr, old] of attrs) if (node.getAttribute(attr) !== old) own++;
  const active = document.activeElement;
  const focusMoved = active !== w.focus && active && active !== document.body && !(w.target && w.target.contains(active)) && !(active === w.target);
  const overlays = kl.overlays();
  const expanded = w.target?.isConnected ? w.target.getAttribute("aria-expanded") : null;
  return {
    gone: false,
    mutations: w.count + own,
    samples: w.samples,
    focusMoved: Boolean(focusMoved),
    focusTo: focusMoved ? kl.sel(active) : null,
    scrolled: Math.abs(window.scrollX - w.scroll[0]) + Math.abs(window.scrollY - w.scroll[1]) > 4,
    opened: overlays.length > w.overlays || (w.expanded === "false" && expanded === "true"),
    overlays: overlays.map((o) => kl.sel(o)),
    overlaysBefore: w.overlays,
    expanded,
    expandedBefore: w.expanded,
    targetConnected: Boolean(w.target?.isConnected),
  };
}

/** After Escape: is what opened still open, and where did focus go? */
function afterEscapeFn() {
  const kl = window.__kl;
  const w = window.__klWatch;
  const target = w?.target ?? document.querySelector("[data-keyline-target]");
  return {
    overlays: kl.overlays().map((o) => kl.sel(o)),
    expanded: target?.isConnected ? target.getAttribute("aria-expanded") : null,
    focusOnTarget: Boolean(target && (document.activeElement === target || target.contains(document.activeElement))),
    focus: document.activeElement ? kl.sel(document.activeElement) : null,
  };
}

function wordsFn() {
  return window.__kl.words();
}

/* ── Keyboard ────────────────────────────────────────────────────────────── */

/**
 * Record how every focusable element looks before it has focus, so a Tab can
 * tell whether focus changed anything a reader can see. Transitions are
 * switched off so the focused style is read at its end state.
 */
function keyboardPrepFn() {
  const kl = window.__kl;
  const style = document.createElement("style");
  style.textContent = "*,*::before,*::after{transition-duration:0s!important;transition-delay:0s!important}";
  document.head.appendChild(style);
  const FOCUSABLE = 'a[href], button, input:not([type=hidden]), select, textarea, summary, iframe, [tabindex], [contenteditable=""], [contenteditable=true], audio[controls], video[controls]';
  const sig = (el) => {
    const parts = [];
    for (const pseudo of [null, "::before", "::after"]) {
      const cs = getComputedStyle(el, pseudo);
      if (pseudo && cs.content === "none") {
        parts.push("-");
        continue;
      }
      parts.push([cs.outlineStyle, cs.outlineWidth, cs.outlineColor, cs.outlineOffset, cs.boxShadow, cs.borderTopColor, cs.borderBottomColor, cs.borderBottomWidth, cs.backgroundColor, cs.backgroundImage, cs.color, cs.textDecorationLine, cs.transform, cs.opacity].join("|"));
    }
    return parts.join("¦");
  };
  const all = [...document.querySelectorAll(FOCUSABLE)].filter((el) => el.tabIndex >= 0 && !el.matches(":disabled") && !el.closest("[inert]"));
  const before = new Map();
  for (const el of all) {
    before.set(el, sig(el));
    if (el.parentElement) before.set(el.parentElement, sig(el.parentElement));
  }
  window.__klKb = { before, sig, ids: new WeakMap(), next: 1 };
  return { tabbable: all.filter((el) => kl.visible(el) || el.getBoundingClientRect().width > 0).length, total: all.length };
}

function keyboardReadFn() {
  const kl = window.__kl;
  const kb = window.__klKb;
  let el = document.activeElement;
  if (!el || el === document.body || el === document.documentElement) return { body: true };
  // Framework dev overlays sit after the page in the Tab order; reaching one is the end of the page.
  if (el.closest("nextjs-portal, vite-error-overlay, astro-dev-toolbar, [data-nextjs-dev-tools-button], #__next-build-watcher")) return { body: true, devtool: true };
  // Inside a shadow root the document only sees the host: follow focus in.
  while (el.shadowRoot && el.shadowRoot.activeElement) el = el.shadowRoot.activeElement;
  if (!kb.ids.has(el)) kb.ids.set(el, kb.next++);
  const id = kb.ids.get(el);
  const iframe = el.localName === "iframe";
  const before = kb.before.get(el);
  const parent = el.parentElement;
  const changed = before === undefined ? null : kb.sig(el) !== before || (parent && kb.before.has(parent) && kb.sig(parent) !== kb.before.get(parent));
  const modal = el.closest('dialog[open], [aria-modal="true"]');
  const r = el.getBoundingClientRect();
  const onScreen = r.width >= 1 && r.height >= 1 && r.bottom > 0 && r.right > 0 && r.left < document.documentElement.clientWidth && kl.visible(el);
  return {
    body: false,
    id,
    sel: kl.sel(el),
    text: kl.name(el),
    box: kl.box(el),
    iframe,
    ring: changed,
    onScreen,
    inModal: Boolean(modal && kl.visible(modal)),
  };
}

/* ── Forms ───────────────────────────────────────────────────────────────── */

/** The visible text near a form, so a submit can tell whether anything new appeared, and where. */
function textSnapshotFn({ formSel }) {
  const kl = window.__kl;
  const form = formSel ? document.querySelector(formSel) : null;
  const fields = form ? [...form.elements].filter((f) => /^(input|select|textarea)$/.test(f.localName) && f.type !== "hidden") : [];
  const fieldBoxes = fields.filter(kl.visible).map((f) => kl.box(f));
  const items = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const t = n.textContent.replace(/\s+/g, " ").trim();
    if (!t || !n.parentElement || /^(script|style|noscript|template)$/i.test(n.parentElement.localName)) continue;
    if (!kl.visible(n.parentElement)) continue;
    items.push({ text: t.slice(0, 120), box: kl.box(n.parentElement), sel: kl.sel(n.parentElement) });
  }
  const invalid = fields.filter((f) => f.getAttribute("aria-invalid") === "true" && kl.visible(f)).map((f) => kl.sel(f));
  const values = fields.map((f) => (f.type === "checkbox" || f.type === "radio" ? String(f.checked) : f.value)).join("\u0001");
  return { items, fieldBoxes, invalid, values, url: location.href, formConnected: Boolean(form?.isConnected) };
}

/** Listen for the browser's own validation (the `invalid` event) on a form's fields. */
function listenInvalidFn({ formSel }) {
  window.__klInvalid = [];
  const form = document.querySelector(formSel);
  if (!form) return false;
  for (const f of form.elements) f.addEventListener("invalid", () => window.__klInvalid.push(window.__kl.sel(f)), { once: true });
  return true;
}

function readInvalidFn() {
  return window.__klInvalid || [];
}

/** Submit a form the way a person does: its button, or Enter when it has none. */
function requestSubmitFn({ formSel }) {
  const form = document.querySelector(formSel);
  if (!form) return false;
  form.requestSubmit ? form.requestSubmit() : form.submit();
  return true;
}

/** Which of these links (keyed "url|words", as the inventory keys them) are on screen right now. */
function visibleHrefsFn({ keys }) {
  const kl = window.__kl;
  const shown = new Set([...document.querySelectorAll("a[href]")].filter(kl.visible).map((a) => kl.noHash(a.href) + "|" + kl.name(a)));
  return keys.filter((k) => shown.has(k));
}

export const PAGE = {
  visibleHrefs: withKl(visibleHrefsFn),
  inventory: withKl(inventoryFn),
  mark: withKl(markFn),
  stuck: withKl(stuckFn),
  watch: withKl(watchFn),
  arm: withKl(armFn),
  read: withKl(readFn),
  afterEscape: withKl(afterEscapeFn),
  words: withKl(wordsFn),
  keyboardPrep: withKl(keyboardPrepFn),
  keyboardRead: withKl(keyboardReadFn),
  textSnapshot: withKl(textSnapshotFn),
  listenInvalid: withKl(listenInvalidFn),
  readInvalid: withKl(readInvalidFn),
  requestSubmit: withKl(requestSubmitFn),
};

/** One expression an agent can paste into its browser's JavaScript tool. */
export function expression(name, arg = {}) {
  const fn = PAGE[name];
  if (!fn) throw new Error(`no page function '${name}' — one of ${Object.keys(PAGE).join(", ")}`);
  return `(${fn.toString()})(${JSON.stringify(arg)})`;
}

/** Jaccard similarity of two word lists: 1 is the same content, 0 nothing shared. */
export function similarity(a = [], b = []) {
  if (!a.length && !b.length) return 1;
  const A = new Set(a);
  const B = new Set(b);
  let both = 0;
  for (const w of A) if (B.has(w)) both++;
  return both / (A.size + B.size - both);
}
