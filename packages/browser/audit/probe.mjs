/**
 * The audit's measurements inside a rendered page. `auditProbe` is passed to
 * Playwright's `page.evaluate`, so it must be self-contained: no imports, no
 * closures over this module. It relies on the helpers capture.mjs installs on
 * every page (`__keylineSelector`, `__keylineBox`).
 *
 * It returns raw findings — rule, severity, title, detail, evidence, selector,
 * box, law — and audit.mjs adds the page, viewport, theme and shot. Which
 * checks run depends on the pass: contrast in every theme, target size and
 * overflow at phone width, structure, type, copy and slop once per page.
 *
 * Everything here is a measurement a machine can make. Judgement (hierarchy,
 * grouping, whether a box should exist, whether the copy sounds like the
 * product) is the agent's, from the screenshots, written into the same report.
 */
export function auditProbe({ viewport, theme, firstPass, limit = 12 }) {
  const out = [];
  const sel = (el) => window.__keylineSelector?.(el) ?? el.tagName.toLowerCase();
  const box = (el) => window.__keylineBox?.(el) ?? null;
  const push = (f) => out.push(f);
  // The layout width: a phone browser widens innerWidth to fit content that overflows, which would hide the overflow.
  const vw = document.documentElement.clientWidth || window.innerWidth;
  // What the theme actually changed: a page with no dark theme renders the same colours in both passes.
  const bodyCs = getComputedStyle(document.body);
  out.push({ meta: true, signature: `${getComputedStyle(document.documentElement).backgroundColor}|${bodyCs.backgroundColor}|${bodyCs.color}` });

  const visible = (el) => {
    if (!(el instanceof Element)) return false;
    const r = el.getBoundingClientRect();
    if (r.width <= 2 || r.height <= 2) return false;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none" || Number(cs.opacity) === 0) return false;
    // Visually hidden for screen readers (.sr-only and friends): not on screen, so not measured.
    if ((cs.clip && cs.clip !== "auto") || /inset\(50%\)/.test(cs.clipPath)) return false;
    if (el.closest("[aria-hidden='true'], [hidden], [inert]")) return false;
    return true;
  };

  /* ── Colour, through a canvas so every CSS colour syntax lands in sRGB ── */
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const rgbaCache = new Map();
  const rgba = (str) => {
    if (rgbaCache.has(str)) return rgbaCache.get(str);
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = "#000";
    ctx.fillStyle = str;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    const v = str === "transparent" || /rgba?\([^)]*,\s*0\)$/.test(str) ? [0, 0, 0, 0] : [r, g, b, a / 255];
    rgbaCache.set(str, v);
    return v;
  };
  const over = (top, bottom) => {
    const a = top[3] + bottom[3] * (1 - top[3]);
    if (a === 0) return [0, 0, 0, 0];
    return [0, 1, 2].map((i) => (top[i] * top[3] + bottom[i] * bottom[3] * (1 - top[3])) / a).concat(a);
  };
  const lum = ([r, g, b]) => {
    const c = (v) => {
      v /= 255;
      return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * c(r) + 0.7152 * c(g) + 0.0722 * c(b);
  };
  const ratio = (a, b) => {
    const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (l1 + 0.05) / (l2 + 0.05);
  };
  const hex = ([r, g, b]) => "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

  /** The opaque colour behind an element, or null when an image or gradient is in the way. */
  const background = (el) => {
    let layers = [];
    for (let n = el; n; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage && cs.backgroundImage !== "none") return null;
      const c = rgba(cs.backgroundColor);
      if (c[3] > 0) layers.push(c);
      if (c[3] >= 1) break;
    }
    let base = rgba(getComputedStyle(document.documentElement).backgroundColor);
    if (base[3] < 1) base = over(base, theme === "dark" ? [0, 0, 0, 1] : [255, 255, 255, 1]);
    for (const c of layers.reverse()) base = over(c, base);
    return base;
  };

  /* ── Contrast: every rendered run of text, grouped so one bad style is one finding.
        Measured at desktop width in each theme; the phone pass would only repeat it. ── */
  const groups = new Map();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: (t) => (t.textContent.trim().length > 1 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
  });
  const textEls = new Set();
  for (let t = walker.nextNode(); t; t = walker.nextNode()) {
    const el = t.parentElement;
    // Text inside a picture (role="img", an SVG) is part of an illustration, not text to read: its alt is what's read.
    if (el && !textEls.has(el) && !["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE"].includes(el.tagName) && !el.closest('[role="img"], svg') && visible(el)) textEls.add(el);
  }
  for (const el of viewport === "desktop" ? textEls : []) {
    const cs = getComputedStyle(el);
    let fg = rgba(cs.color);
    let opacity = 1;
    let blended = false;
    for (let n = el; n; n = n.parentElement) {
      const ns = getComputedStyle(n);
      opacity *= Number(ns.opacity);
      if (ns.mixBlendMode !== "normal") blended = true;
    }
    // Blended text (mix-blend-mode: difference over a photo, say) shows a colour no stylesheet names; the agent judges it from the shot.
    if (blended) continue;
    fg = [fg[0], fg[1], fg[2], fg[3] * opacity];
    // Transparent text is a layout or effect layer (a measuring copy, a crossfade's hidden face), not something read.
    if (fg[3] < 0.15) continue;
    const bg = background(el);
    if (!bg) continue;
    const solid = over(fg, bg);
    const r = ratio(solid, bg);
    const size = parseFloat(cs.fontSize);
    const weight = Number(cs.fontWeight) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const floor = large ? 3 : 4.5;
    if (r >= floor) continue;
    const key = `${hex(solid)}|${hex(bg)}|${Math.round(size)}`;
    const g = groups.get(key) ?? { el, r, floor, fg: hex(solid), bg: hex(bg), size, count: 0, sample: el.textContent.trim().slice(0, 40) };
    g.count++;
    // Point at an instance that's on the page, not one scrolled away inside a carousel.
    const onPage = (n) => {
      const b = n.getBoundingClientRect();
      return b.left >= 0 && b.right <= vw;
    };
    if (!onPage(g.el) && onPage(el)) {
      g.el = el;
      g.sample = el.textContent.trim().slice(0, 40);
    }
    groups.set(key, g);
  }
  [...groups.values()]
    .sort((a, b) => a.r - b.r)
    .slice(0, limit)
    .forEach((g) =>
      push({
        rule: "color/contrast",
        law: "color law 2",
        severity: g.r < 3 ? "error" : "warning",
        title: g.r < 3 ? "Text too faint to read" : "Text below its contrast floor",
        detail: `"${g.sample}" and ${g.count - 1 || "no"} other${g.count === 2 ? "" : "s"} like it: ${g.fg} on ${g.bg} at ${Math.round(g.size)}px.`,
        evidence: `${g.r.toFixed(2)}:1, needs ${g.floor}:1`,
        selector: sel(g.el),
        box: box(g.el),
      }),
    );

  /* ── Interactive elements: names, targets, labels ── */
  const INTERACTIVE = "a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button], [role=link], [role=tab], [role=menuitem], [role=checkbox], [role=switch], [tabindex]:not([tabindex='-1'])";
  const interactive = [...document.querySelectorAll(INTERACTIVE)].filter((el) => visible(el) && !el.closest('[role="img"]'));
  // Words that are never names, so a label capitalising them is Title Case, not a product name ("Claude Code").
  const COMMON = new Set("a an and the to for of with in on up out now all more new your my our account changes details settings started free demo plan order cart started contact us here view get save add create delete edit remove cancel submit continue next back sign log try start book read learn download upload send open close show hide manage see join buy".split(" "));

  const labelText = (el) => {
    const ids = el.getAttribute("aria-labelledby");
    if (ids) return ids.split(/\s+/).map((id) => document.getElementById(id)?.textContent ?? "").join(" ").trim();
    if (el.getAttribute("aria-label")) return el.getAttribute("aria-label").trim();
    if (el.matches("input, select, textarea")) {
      const forLabel = el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
      const wrap = el.closest("label");
      const t = (forLabel?.textContent || wrap?.textContent || "").trim();
      if (t) return t;
      if (["submit", "button", "reset"].includes(el.type)) return el.value?.trim() ?? "";
      return el.getAttribute("title")?.trim() ?? "";
    }
    const text = (el.innerText ?? el.textContent ?? "").trim();
    if (text) return text;
    const img = el.querySelector("img[alt]");
    if (img?.alt.trim()) return img.alt.trim();
    const svgTitle = el.querySelector("svg title");
    if (svgTitle?.textContent.trim()) return svgTitle.textContent.trim();
    return el.getAttribute("title")?.trim() ?? "";
  };

  if (firstPass) {
    let unnamed = 0;
    let placeholderOnly = 0;
    for (const el of interactive) {
      const name = labelText(el);
      if (!name) {
        if (el.matches("input, textarea") && el.placeholder) {
          if (placeholderOnly++ < limit)
            push({ rule: "copy/placeholder-label", law: "patterns law 16", severity: "warning", title: "A field labelled only by its placeholder", detail: `"${el.placeholder}" vanishes as soon as someone types, and screen readers may not announce it. Give the field a visible label.`, selector: sel(el), box: box(el) });
          continue;
        }
        if (unnamed++ < limit)
          push({ rule: "a11y/name", law: "patterns law 1", severity: "error", title: "A control with no name", detail: "A screen reader announces it as just its role. Give it visible text, or an aria-label naming what it does.", evidence: `<${el.tagName.toLowerCase()}${el.getAttribute("role") ? ` role="${el.getAttribute("role")}"` : ""}>`, selector: sel(el), box: box(el) });
        continue;
      }
      const label = name.replace(/\s+/g, " ");
      if (/^(click here|here|learn more|read more|more|submit|ok|go|link)$/i.test(label)) {
        push({ rule: "copy/vague-label", law: "patterns law 1", severity: "warning", title: `"${label}" doesn't say what happens`, detail: "Name the action or the destination: Save changes, View pricing, Read the case study.", selector: sel(el), box: box(el) });
      } else if (el.matches("button, [role=button], input[type=submit]") && /^([A-Z][a-z']+)( [A-Z][a-z']+){1,4}$/.test(label) && label.split(" ").slice(1).some((w) => COMMON.has(w.toLowerCase()))) {
        push({ rule: "copy/title-case", law: "patterns law 1", severity: "info", title: `"${label}" is in Title Case`, detail: "Labels read faster in sentence case: only the first word and names capitalised.", selector: sel(el), box: box(el) });
      }
    }
    if (unnamed > limit) push({ rule: "a11y/name", law: "patterns law 1", severity: "error", title: `${unnamed - limit} more controls with no name`, evidence: `${unnamed} in all` });

    const imgs = [...document.querySelectorAll("img")].filter((i) => visible(i) && !i.hasAttribute("alt"));
    imgs.slice(0, limit).forEach((i) => push({ rule: "a11y/img-alt", law: "patterns law 14", severity: "error", title: "An image with no alt text", detail: "Say what it's for (\"Sign-ups doubled in March\"), or alt=\"\" if it's decoration.", evidence: (i.currentSrc || i.src).split("/").pop()?.slice(0, 60), selector: sel(i), box: box(i) }));

    if (!document.documentElement.lang) push({ rule: "a11y/lang", severity: "warning", title: "The page doesn't declare its language", detail: "Add lang to <html> so screen readers pronounce it and browsers offer translation correctly." });
    if (!document.querySelector("main, [role=main]")) push({ rule: "a11y/landmarks", law: "layout law 12", severity: "warning", title: "No main landmark", detail: "Wrap the page's content in <main>, so keyboard and screen-reader users can jump straight to it." });
    const h1s = [...document.querySelectorAll("h1")].filter(visible);
    if (!h1s.length) push({ rule: "a11y/headings", law: "type law 3", severity: "warning", title: "No top-level heading", detail: "The page has no visible h1; screen-reader users navigate by headings and start from it." });
    if (h1s.length > 1) push({ rule: "a11y/headings", law: "type law 3", severity: "info", title: `${h1s.length} top-level headings`, detail: "One h1 names the page; the rest are h2 and below.", selector: sel(h1s[1]), box: box(h1s[1]) });
    let prev = 0;
    for (const h of [...document.querySelectorAll("h1, h2, h3, h4, h5, h6")].filter(visible)) {
      const level = Number(h.tagName[1]);
      if (prev && level > prev + 1) {
        push({ rule: "a11y/headings", law: "type law 3", severity: "info", title: `Heading jumps from h${prev} to h${level}`, detail: `"${h.textContent.trim().slice(0, 50)}" skips a level, so the outline a screen reader builds has a hole.`, selector: sel(h), box: box(h) });
        break;
      }
      prev = level;
    }
  }

  if (viewport === "phone" && theme === "light") {
    const rects = interactive.map((el) => el.getBoundingClientRect());
    const centre = (r) => [r.left + r.width / 2, r.top + r.height / 2];
    const small = new Map();
    interactive.forEach((el, i) => {
      const r = rects[i];
      if (r.width >= 24 && r.height >= 24) return;
      const cs = getComputedStyle(el);
      // A link inside running text is exempt (WCAG 2.5.8): its size is the text's.
      if (cs.display === "inline" && el.parentElement && el.parentElement.textContent.trim().length > el.textContent.trim().length + 20) return;
      // So is a small target with room around it: no other target's centre within 24px of its own.
      const [cx, cy] = centre(r);
      const crowded = rects.some((o, j) => {
        if (j === i) return false;
        const [ox, oy] = centre(o);
        return Math.abs(ox - cx) < 24 && Math.abs(oy - cy) < 24;
      });
      if (!crowded) return;
      const key = `${Math.round(r.width)}x${Math.round(r.height)}|${el.parentElement?.tagName}.${el.parentElement?.className}`;
      const g = small.get(key) ?? { el, r, n: 0 };
      g.n++;
      small.set(key, g);
    });
    [...small.values()].slice(0, limit).forEach((g) =>
      push({ rule: "a11y/target-size", law: "layout law 13", severity: "warning", title: g.n > 1 ? `${g.n} tap targets too small and too close together` : "A tap target too small and too close to its neighbours", detail: "Under 24×24px on a phone, with another target within reach of a thumb. Pad the hit area (padding or a pseudo-element) without changing the look.", evidence: `${Math.round(g.r.width)}×${Math.round(g.r.height)}px`, selector: sel(g.el), box: box(g.el) }),
    );

    const meta = document.querySelector('meta[name="viewport"]')?.content ?? "";
    if (!/width\s*=\s*device-width/.test(meta))
      push({ rule: "layout/viewport-meta", law: "layout law 8", severity: "error", title: "The page isn't set up for phones", detail: "Without <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">, phones render it at desktop width and shrink it to fit, so every size on it is too small to read.", evidence: meta ? `content="${meta}"` : "no viewport meta tag" });

    const doc = document.documentElement;
    if (doc.scrollWidth > vw + 1) {
      const wide = [...document.body.querySelectorAll("*")].filter((el) => {
        const r = el.getBoundingClientRect();
        if (r.right <= vw + 1 || !visible(el)) return false;
        const p = el.parentElement?.getBoundingClientRect();
        return !p || p.right <= vw + 1;
      });
      push({ rule: "layout/horizontal-overflow", law: "layout law 8", severity: "error", title: "The page scrolls sideways on a phone", detail: wide.length ? `It starts at ${sel(wide[0])}${wide.length > 1 ? ` and ${wide.length - 1} more` : ""}.` : "Something is wider than the screen.", evidence: `${doc.scrollWidth}px wide in a ${vw}px viewport`, selector: wide[0] ? sel(wide[0]) : undefined, box: wide[0] ? box(wide[0]) : undefined });
    }
  }

  /* ── Text cut off without an ellipsis ── */
  if (theme === "light") {
    let clipped = 0;
    for (const el of textEls) {
      const cs = getComputedStyle(el);
      if (!/hidden|clip/.test(cs.overflowX + cs.overflow) || cs.textOverflow === "ellipsis") continue;
      if (el.scrollWidth <= el.clientWidth + 2 && el.scrollHeight <= el.clientHeight + 2) continue;
      if (cs.webkitLineClamp && cs.webkitLineClamp !== "none") continue;
      if (clipped++ < 4)
        push({ rule: "layout/clipped-text", law: "layout law 8", severity: "warning", title: "Text is cut off", detail: `"${el.textContent.trim().slice(0, 50)}" overflows a box that hides it, with no ellipsis to say there's more.`, selector: sel(el), box: box(el) });
    }
  }

  if (firstPass) {
    /* ── Type: the ladder as rendered ── */
    const sizes = new Map();
    const weights = new Set();
    let tiny = 0;
    for (const el of textEls) {
      const cs = getComputedStyle(el);
      const s = Math.round(parseFloat(cs.fontSize) * 2) / 2;
      sizes.set(s, (sizes.get(s) ?? 0) + 1);
      weights.add(Number(cs.fontWeight) || 400);
      if (s < 12 && !el.closest("sup, sub, svg") && tiny++ < 3)
        push({ rule: "type/tiny-text", law: "type law 1", severity: "warning", title: "Text below the 12px floor", detail: `"${el.textContent.trim().slice(0, 40)}" is set at ${s}px.`, evidence: `${s}px`, selector: sel(el), box: box(el) });
    }
    // Display sizes (32px and up) are their own tier; the ladder is what sits under them.
    const ladder = [...sizes.keys()].filter((s) => s < 32).sort((a, b) => a - b);
    if (ladder.length > 8)
      push({ rule: "type/many-sizes", law: "type law 1", severity: "warning", title: `${ladder.length} text sizes below the display tier`, detail: "A scale nobody chose. Assign each size to a role and fold the strays onto the ladder.", evidence: ladder.join(", ") + "px" });
    if (weights.size > 3)
      push({ rule: "type/many-weights", law: "type law 5", severity: "warning", title: `${weights.size} font weights on one page`, detail: "Two weights, each with one job, read as a system; four read as four templates.", evidence: [...weights].sort().join(", ") });
    for (const p of [...document.querySelectorAll("p, li")].filter((el) => visible(el) && el.textContent.trim().length > 240)) {
      const cs = getComputedStyle(p);
      const perLine = p.getBoundingClientRect().width / (parseFloat(cs.fontSize) * 0.5);
      if (perLine > 95) {
        push({ rule: "type/long-measure", law: "layout law 1", severity: "warning", title: "Lines too long to read comfortably", detail: "Running text past ~80 characters a line makes the eye lose its place on the return sweep. Cap the column.", evidence: `≈ ${Math.round(perLine)} characters a line`, selector: sel(p), box: box(p) });
        break;
      }
    }

    /* ── Copy: words that read as unfinished, cute or vague ── */
    // Copy is read from the page minus its illustrations.
    const pictureText = [...document.querySelectorAll('[role="img"]')].map((n) => n.innerText).filter(Boolean);
    const bodyText = pictureText.reduce((text, p) => text.replace(p, ""), document.body.innerText);
    const say = (re, rule, severity, title, detail, law) => {
      const m = bodyText.match(re);
      if (m) push({ rule, law, severity, title, detail, evidence: `"${m[0].trim().slice(0, 80)}"` });
    };
    say(/lorem ipsum[^.]{0,40}|\bTODO\b|\bTBD\b|\[object Object\]|\bundefined\b|\bNaN\b/i, "copy/placeholder-text", "error", "Placeholder or broken text on the page", "Leftover filler, or a value that failed to render.", "patterns law 14");
    say(/\b(oops|whoops|uh[- ]oh)\b[^.!\n]{0,60}/i, "copy/interjection", "warning", "An interjection where a plain message belongs", "Say what happened and what to do; \"Oops\" sounds insincere at the worst moment.", "patterns law 18");
    say(/\bwe('re| are) (having trouble|sorry|unable)[^.!\n]{0,50}|\bwe (couldn't|can't|could not|were unable to|weren't able to)\b[^.!\n]{0,50}/i, "copy/we", "warning", "\"We\" in an error message", "The reader can't tell who \"we\" is. Name what happened to the thing: \"Couldn't load the report\".", "patterns law 18");
    say(/\bsuccessfully\b[^.!\n]{0,40}/i, "copy/successfully", "info", "\"Successfully\" in a message", "The outcome is the message: \"Project created\", not \"Project successfully created\".", "patterns law 18");
    if (viewport === "phone") say(/\bclick (here|on|the|to)\b[^.!\n]{0,40}/i, "copy/device-verb", "info", "\"Click\" on a touch layout", "Use \"tap\" on touch, or \"select\"/\"open\" where both apply.", "patterns law 18");

    /* ── AI slop: the tells of a page nobody designed ── */
    const slop = (rule, title, detail, evidence, el, severity = "warning", law) =>
      push({ rule, law, severity, title, detail, evidence, selector: el ? sel(el) : undefined, box: el ? box(el) : undefined });

    const generic = bodyText.match(/\b(unlock the (full )?power|supercharge|revolutioni[sz]e|next[- ]level|seamless(ly)?|elevate your|game[- ]chang(er|ing)|cutting[- ]edge|all[- ]in[- ]one (platform|solution)|in (just )?(a few )?(seconds|minutes)|built for the future|harness the power|effortless(ly)?|empower(s|ing)? (you|teams))\b/gi);
    if (generic?.length) slop("slop/generic-copy", "Stock marketing phrases", "These lines could sit on any product's page. Say what this one does, for whom, in its own nouns.", [...new Set(generic.map((g) => g.toLowerCase()))].slice(0, 5).join(", "), null, "warning", "patterns law 18");

    const brands = bodyText.match(/\b(Acme( Corp| Inc)?|Globex|Initech|Hooli|Umbrella Corp|Contoso|Lorem Co)\b/);
    if (brands) slop("slop/placeholder-brands", "Placeholder company names", "Logos or testimonials from companies that don't exist read as fake social proof.", brands[0], null, "warning");

    let gradientText = null;
    let purple = null;
    let glass = 0;
    let emoji = 0;
    let emojiEl = null;
    let eyebrows = 0;
    for (const el of document.body.querySelectorAll("*")) {
      if (!visible(el)) continue;
      const cs = getComputedStyle(el);
      if (cs.backdropFilter && cs.backdropFilter !== "none") glass++;
      const img = cs.backgroundImage;
      if (img && img.includes("gradient")) {
        if (!gradientText && (cs.backgroundClip === "text" || cs.webkitBackgroundClip === "text")) gradientText = el;
        const r = el.getBoundingClientRect();
        if (!purple && r.width > vw * 0.6 && r.height > 240) {
          const hues = [...img.matchAll(/rgba?\((\d+),\s*(\d+),\s*(\d+)/g)].map(([, r, g, b]) => {
            const [R, G, B] = [r, g, b].map((v) => v / 255);
            const max = Math.max(R, G, B);
            const min = Math.min(R, G, B);
            if (max - min < 0.2) return null;
            const h = max === R ? ((G - B) / (max - min)) % 6 : max === G ? (B - R) / (max - min) + 2 : (R - G) / (max - min) + 4;
            return (h * 60 + 360) % 360;
          });
          if (hues.some((h) => h !== null && h >= 245 && h <= 300)) purple = el;
        }
      }
      if (/^(LI|H2|H3|H4|P|BUTTON|A|SPAN)$/.test(el.tagName) && el.children.length <= 2 && /^\s*\p{Extended_Pictographic}/u.test(el.textContent)) {
        emoji++;
        emojiEl ??= el;
      }
      if (cs.textTransform === "uppercase" && parseFloat(cs.letterSpacing) > parseFloat(cs.fontSize) * 0.05 && parseFloat(cs.fontSize) <= 14) {
        const next = el.nextElementSibling;
        if (next && /^H[1-4]$/.test(next.tagName)) eyebrows++;
      }
    }
    if (gradientText) slop("slop/gradient-text", "Gradient-filled headline text", "A signature of generated landing pages; it also drops contrast where the gradient goes light. Set the headline in ink and let the words carry it.", null, gradientText, "warning", "color law 7");
    if (purple) slop("slop/purple-gradient", "A large purple gradient panel", "The default \"AI product\" hero. Use the brand's own colour, or none.", null, purple, "warning", "color law 7");
    if (glass > 4) slop("slop/glass-everywhere", "Frosted glass on many surfaces", "Translucency is for chrome over moving content. On everything it's texture, and it costs every frame.", `${glass} elements with backdrop-filter`, null, "warning", "depth law 10");
    if (emoji >= 3) slop("slop/emoji-bullets", "Emoji used as icons or bullets", "Emoji at the start of headings and list items read as generated. Use the product's icon set, or nothing.", `${emoji} elements`, emojiEl, "info");
    if (eyebrows >= 3) slop("slop/eyebrows", "An uppercase eyebrow over every heading", "Spaced capitals above each section heading is a template habit; let the heading open the section.", `${eyebrows} headings`, null, "info", "type dials");

    // Many same-styled bordered or shadowed siblings: the card grid that boxes everything.
    for (const parent of document.body.querySelectorAll("*")) {
      const kids = [...parent.children].filter(visible);
      if (kids.length < 6) continue;
      const cls = kids[0].className;
      if (typeof cls !== "string" || !cls || !kids.every((k) => k.className === cls)) continue;
      const cs = getComputedStyle(kids[0]);
      const boxed = (parseFloat(cs.borderTopWidth) > 0 || cs.boxShadow !== "none") && parseFloat(cs.borderTopLeftRadius) > 0;
      if (boxed && !parent.matches("ul[role=listbox], table, tbody, nav")) {
        slop("slop/card-grid", "A grid of identical boxed cards", "Every item in its own bordered card reads as a template. Sit the items on the page, parted by space or hairlines; keep a card for one object taken in whole.", `${kids.length} cards`, parent, "info", "depth law 2");
        break;
      }
    }
  }

  return out;
}
