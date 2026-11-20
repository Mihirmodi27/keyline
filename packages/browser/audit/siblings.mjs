/**
 * Does each page belong beside its siblings? The probe records a page's look
 * (audit/probe.mjs: fonts, sizes, weights and the h1; text and surface colours;
 * corners, gaps, insets and the reading width), and this compares each page
 * with the pages it sits among.
 *
 * Siblings are the pages in the same area of DESIGN.md (an editorial docs area
 * is allowed its own look) and the same section of the site (`/docs/*`); a
 * top-level page with no section is compared with the other top-level pages.
 * The home page is compared with nothing: it's the one page expected to stand
 * apart. With fewer than two siblings there's nothing to compare against.
 *
 * A stray is a value this page uses again and again that none of its siblings
 * uses at all — a 22px size, a fourth grey, a 20px corner. One finding per page
 * per domain, as a note: whether the stray is a mistake or the page's job is
 * the reader's call, and a deliberate one is kept (`npx trykeyline keep`).
 */
import { shotKey } from "../browse/capture.mjs";

/** What a value has to be used for, on this page, before its absence elsewhere counts. */
const DIMS = [
  { domain: "type", dim: "families", min: 3, say: (k) => `the font ${k}` },
  { domain: "type", dim: "sizes", min: 3, say: (k) => `${k} text` },
  { domain: "type", dim: "weights", min: 3, say: (k) => `weight ${k}` },
  { domain: "color", dim: "colors", min: 3, say: (k) => `text in ${k}` },
  { domain: "color", dim: "surfaces", min: 2, say: (k) => `surfaces in ${k}` },
  { domain: "layout", dim: "radii", min: 2, say: (k) => `${k} corners` },
  { domain: "layout", dim: "gaps", min: 2, say: (k) => `${k} gaps` },
  { domain: "layout", dim: "pads", min: 2, say: (k) => `${k} insets` },
];
const LAW = { type: "type law 1", color: "color law 1", layout: "layout law 2" };
const FIX = { type: "/keyline type", color: "/keyline color", layout: "/keyline layout" };
const HEAD = { type: "Type here", color: "Colour here", layout: "Spacing and corners here" };

const section = (route) => route.split("/").filter(Boolean)[0] ?? "";
const depth = (route) => route.split("/").filter(Boolean).length;

/** The pages `page` is compared with. */
export function siblingsOf(page, pages) {
  if (depth(page.route) === 0) return [];
  const peers = pages.filter((p) => p !== page && p.look && depth(p.route) > 0 && (p.area ?? null) === (page.area ?? null));
  const inSection = peers.filter((p) => section(p.route) === section(page.route));
  if (inSection.length >= 2) return inSection;
  // No section of its own (or too small a one): the other top-level pages, each standing for its section.
  return depth(page.route) === 1 ? peers.filter((p) => depth(p.route) === 1 && section(p.route) !== section(page.route)) : [];
}

const list = (xs, n = 3) => (xs.length <= n ? xs.join(", ") : `${xs.slice(0, n).join(", ")} and ${xs.length - n} more`);
const sentence = (xs) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs.at(-1)}`);

/** The most common value among `values`, when at least two agree and they're at least half; else null. */
function shared(values) {
  const n = new Map();
  for (const v of values) if (v != null) n.set(v, (n.get(v) ?? 0) + 1);
  const [top, count] = [...n.entries()].sort((a, b) => b[1] - a[1])[0] ?? [null, 0];
  return count >= 2 && count >= values.length / 2 ? top : null;
}

/** What strays on one page, by domain: [{ domain, strays: [text], at }]. */
export function straysOf(page, siblings) {
  const byDomain = new Map();
  const add = (domain, text, at) => {
    if (!byDomain.has(domain)) byDomain.set(domain, { domain, strays: [], at: null });
    const d = byDomain.get(domain);
    d.strays.push(text);
    d.at ??= at ?? null;
  };
  const look = page.look;
  for (const { domain, dim, min, say } of DIMS) {
    const keys = Object.entries(look[dim] ?? {})
      .filter(([k, n]) => n >= min && !siblings.some((s) => s.look[dim]?.[k]))
      .sort((a, b) => b[1] - a[1])
      .map(([k]) => k);
    if (keys.length) add(domain, `${list(keys.map(say))}`, look.at?.[`${dim}|${keys[0]}`]);
  }
  const h1 = shared(siblings.map((s) => s.look.h1));
  if (look.h1 && h1 && look.h1 !== h1) add("type", `an h1 at ${look.h1} where they set it at ${h1}`, look.at?.h1);
  const widths = siblings.map((s) => s.look.measure).filter(Boolean).sort((a, b) => a - b);
  if (look.measure && widths.length >= 2) {
    const mid = widths[Math.floor(widths.length / 2)];
    const agree = widths.every((w) => Math.abs(w - mid) <= 24);
    if (agree && Math.abs(look.measure - mid) > 48) add("layout", `text ${look.measure}px wide where theirs is about ${mid}px`, null);
  }
  return [...byDomain.values()];
}

/** Add a finding for each page whose look strays from its siblings'. */
export function strayPages(run, add) {
  const pages = run.pages.filter((p) => p.look);
  for (const page of pages) {
    const siblings = siblingsOf(page, pages);
    if (siblings.length < 2) continue;
    const names = list(siblings.map((s) => s.route));
    for (const { domain, strays, at } of straysOf(page, siblings)) {
      add(run, {
        kind: "audit",
        rule: `${domain}/stray-page`,
        domain,
        law: LAW[domain],
        severity: "info",
        title: `${HEAD[domain]} differs from its sibling pages`,
        detail: `This page has ${sentence(strays)}, which none of ${names} use. Bring it onto the values they share, or, if it's a different kind of page, say so: an area in DESIGN.md, or a kept decision.`,
        evidence: strays.join("; "),
        page: page.route,
        viewport: "desktop",
        theme: "light",
        // No selector: a page finding is matched by it, and the first stray element can change between runs.
        box: at?.box ?? undefined,
        shot: at?.box && page.shots?.[shotKey("desktop", "light")] ? shotKey("desktop", "light") : undefined,
        fix: FIX[domain],
      });
    }
  }
  return run;
}
