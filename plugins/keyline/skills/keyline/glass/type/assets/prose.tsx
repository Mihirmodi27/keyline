/**
 * Long-form prose renderer — the reading half of the type system.
 *
 * Two sizes: 16px headings, 14px for everything read, so the 14px blocks
 * each separate on a different axis (the table in glass/type/long-form-prose.md).
 *
 * Spacing: 40px above a heading, 12px below; the keyline is the one
 * symmetric block (glass/type/long-form-prose.md). Text tiers come from
 * glass/color/guide.md; `reveal` from glass/motion.
 */

import { Fragment, type ReactNode } from "react";

export type Block =
  | { type: "p" | "lead" | "keyline" | "note"; text: string }
  | { type: "h2"; text: string }
  | { type: "quote"; text: string; cite?: string }
  | { type: "figure"; src: string; alt: string; caption: string; aspect?: string }
  | { type: "ul" | "ol"; items: string[] };

export function Prose({ blocks }: { blocks: Block[] }) {
  return (
    <div className="text-[14px] leading-[1.75] text-gray-1000">
      {blocks.map((b, i) => {
        switch (b.type) {
          /* The opening paragraph. Same size as the body; the 1.9 leading is
             the entire difference, and it's what stops a piece reading as one
             undifferentiated block from the first screen. */
          case "lead":
            return (
              <p key={i} className="reveal mb-8 text-[14px] leading-[1.9] text-gray-1000">
                {renderInline(b.text)}
              </p>
            );

          case "p":
            return (
              <p key={i} className="reveal mb-6">
                {renderInline(b.text)}
              </p>
            );

          /* The one sentence a section is for. Authored by promoting a
             sentence out of a paragraph and DELETING it from the paragraph —
             a section that gains a keyline gets shorter. One per section.
             Everything that makes it a landmark comes from weight and from
             the 36px of air, so it can never outrank the heading above it. */
          case "keyline":
            return (
              <p
                key={i}
                className="reveal my-9 text-[14px] font-medium leading-[1.6] text-gray-1000"
              >
                {renderInline(b.text)}
              </p>
            );

          /* An aside set outside the argument — a caveat, a scope limit, a
             piece of provenance. Its rule is 1px against the quote's 3px and
             its type is four steps down, so two indented rules on one page
             can't be mistaken for each other. */
          case "note":
            return (
              <p
                key={i}
                className="reveal my-7 border-l border-gray-alpha-300 pl-4 text-[13px] leading-[1.6] text-faint"
              >
                {renderInline(b.text)}
              </p>
            );

          /* 16px against 14px body — one step, and the weight, the tight
             leading and the 40px above do the real work. This is the same
             size as the page's own title, separated by position alone. */
          case "h2":
            return (
              <h2
                key={i}
                className="reveal mt-10 mb-3 text-[16px] font-medium leading-[1.2] tracking-[-0.015em] text-gray-1000"
              >
                {renderInline(b.text)}
              </h2>
            );

          /* The type is identical to the body around it, so THE BAR IS THE
             ENTIRE SIGNAL — which is why it's a real one. It used to be a 2px
             alpha-300 border, ten percent black, near enough invisible on a
             white page; survivable only while the quote was also two steps
             larger than the body. When you remove one signal, audit the ones
             you left in.

             A flex child rather than a border-left, because a border can't be
             rounded on its own and a squared-off bar reads as a table rule.
             No vertical margin on it, so flex's default `stretch` runs it the
             full height of the quote including the citation. */
          case "quote":
            return (
              <blockquote key={i} className="reveal my-9 flex gap-4">
                <span aria-hidden className="w-[3px] shrink-0 rounded-full bg-gray-500" />
                <div className="text-[14px] leading-[1.75] text-gray-1000">
                  {renderInline(b.text)}
                  {/* not-italic is required — <cite> carries UA italics that the
                      global `em, i { font-style: normal }` rule doesn't reach. */}
                  {b.cite && (
                    <cite className="mt-2 block text-[13px] not-italic text-quiet">— {b.cite}</cite>
                  )}
                </div>
              </blockquote>
            );

          /* Aspect ratio declared on a wrapper so the box is reserved before
             the image loads and nothing shifts. `ring-1` rather than a border,
             so the outline doesn't participate in the box model and the corner
             radius stays exact.

             The caption is the point of the figure, not a label on it — what
             the thing was for, and which constraint shaped it. Set at the note
             tier so it reads as apparatus; at body size it would compete with
             the paragraph after it. */
          case "figure":
            return (
              <figure key={i} className="reveal my-9">
                <div className="overflow-hidden rounded-[10px] bg-gray-100 ring-1 ring-gray-alpha-300">
                  <div style={{ aspectRatio: b.aspect ?? "16 / 9" }}>
                    <img
                      src={b.src}
                      alt={b.alt}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
                <figcaption className="mt-2.5 text-[13px] leading-[1.55] text-faint">
                  {renderInline(b.caption)}
                </figcaption>
              </figure>
            );

          /* marker: drops the bullets to the quiet tier. At the text colour
             they read as a column of dark dots pulling the eye down the left
             edge; quiet, they read as structure. space-y-2 inside vs mb-6
             below — items belong to each other more than to what follows. */
          case "ul":
            return (
              <ul key={i} className="reveal mb-6 list-disc space-y-2 pl-5 marker:text-gray-500">
                {b.items.map((it, j) => (
                  <li key={j}>{renderInline(it)}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="reveal mb-6 list-decimal space-y-2 pl-5 marker:text-gray-500">
                {b.items.map((it, j) => (
                  <li key={j}>{renderInline(it)}</li>
                ))}
              </ol>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}

/**
 * Inline markdown for **strong** (500 + primary), *em* (muted, no slant) and
 * [links](/there) — §5 of glass/type/guide.md. Keep strong to a few words:
 * at this size it is the keyline's weight.
 */
const TOKENS = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)\s]+\))/g;
const LINK = /^\[([^\]]+)\]\(([^)\s]+)\)$/;

const LINK_CLASS =
  "underline decoration-gray-alpha-500 decoration-1 underline-offset-[3px] " +
  "transition-[opacity,text-decoration-color] duration-150 ease-geist " +
  "hover:decoration-gray-1000 hover:opacity-70";

export function renderInline(text: string): ReactNode {
  const tokens = text.split(TOKENS).filter(Boolean);
  return (
    <>
      {tokens.map((tok, i) => {
        if (tok.startsWith("**") && tok.endsWith("**")) {
          return (
            <strong key={i} className="font-medium text-gray-1000">
              {tok.slice(2, -2)}
            </strong>
          );
        }

        const link = LINK.exec(tok);
        if (link) {
          const [, label, href] = link;
          // In-app paths route through the framework's Link; everything else
          // (mailto:, other origins, files) is a plain anchor, and an http(s)
          // one opens away from the site.
          const external = /^https?:/.test(href);
          return (
            <a
              key={i}
              href={href}
              className={LINK_CLASS}
              {...(external ? { target: "_blank", rel: "noopener" } : {})}
            >
              {label}
            </a>
          );
        }

        if (tok.startsWith("*") && tok.endsWith("*")) {
          return (
            <em key={i} className="text-muted">
              {tok.slice(1, -1)}
            </em>
          );
        }
        return <Fragment key={i}>{tok}</Fragment>;
      })}
    </>
  );
}

/** The same string with its markers removed — for titles, meta and plain text. */
export function stripInlineMarkup(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)\s]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1");
}
