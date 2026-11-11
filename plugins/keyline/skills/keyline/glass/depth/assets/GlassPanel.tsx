/**
 * The glass surface, as a component: the wrapper/surface split and the three
 * depth cues — material, hairline, shadow — in one place. Pairs with
 * glass/depth/assets/glass.css (the materials) and
 * glass/color/assets/color-tokens.css (the tints and the ramps).
 */

import type { ReactNode } from "react";

/* The elevation stack as a utility string, for codebases that can't add a
   stylesheet. Prefer the `.dock-shadow` class in glass.css; the layers and
   why the class won are in glass/depth/depth-cues.md §2. */
export const SHADOW =
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_1px_1px_rgba(0,0,0,0.02),0_8px_16px_-4px_rgba(0,0,0,0.04),0_24px_32px_-8px_rgba(0,0,0,0.06)] " +
  "dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_1px_1px_rgba(0,0,0,0.3),0_8px_16px_-4px_rgba(0,0,0,0.5),0_24px_32px_-8px_rgba(0,0,0,0.6)]";

/* The translucent-ramp hairline (glass/depth/depth-cues.md §1). */
const HAIRLINE = "border-[0.5px] border-gray-alpha-400";

export type GlassTier = "nav" | "panel";

/**
 * A glass surface with all three depth cues attached.
 *
 * `tier` picks the material (nav 20px / 72%, panel 24px / 97%:
 * glass/depth/guide.md §1). `isolate` is on by default so a sliding highlight
 * at -z-10 stays in front of the tint (glass/depth/depth-cues.md §4).
 */
export function GlassSurface({
  tier = "panel",
  as: Tag = "div",
  isolate = true,
  className = "",
  children,
}: {
  tier?: GlassTier;
  as?: "div" | "ul" | "nav" | "aside";
  isolate?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const material = tier === "nav" ? "glass-nav" : "glass-panel";

  return (
    <Tag
      className={`${material} ${HAIRLINE} ${SHADOW} relative ${
        isolate ? "isolate" : ""
      } rounded-2xl ${className}`}
    >
      {children}
    </Tag>
  );
}

/* The wrapper / surface split: the wrapper animates, the surface blurs, and
   they are never the same node (glass/depth/guide.md §3); closed menus
   unmount (glass/depth/performance-and-fallbacks.md).

     <DropMenu open={open}>              // animates scale + y. No filter.
       <GlassSurface tier="panel">       // filters. Never transformed.
         …
       </GlassSurface>
     </DropMenu>
*/
