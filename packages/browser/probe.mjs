/**
 * The page checks as plain JavaScript, for an agent driving its own browser
 * (Claude's browser, a Playwright or Chrome DevTools MCP). Each prints as one
 * expression to paste into the browser's JavaScript tool; it returns plain
 * data. No Playwright is loaded to print one.
 *
 *   keyline probe audit [--arg '{"viewport":"phone","theme":"dark","firstPass":false}']
 *   keyline probe inventory | stuck | watch | arm | read | …   the smoke test's
 */
import { auditProbe } from "./audit/probe.mjs";
import { SELECTOR_HELPER } from "./browse/capture.mjs";
import { PAGE, expression } from "./smoke/page.mjs";

export const PROBES = ["audit", ...Object.keys(PAGE)];

/** The audit's own default: the first pass, where structure, type, copy and slop are measured too. */
const AUDIT_DEFAULT = { viewport: "desktop", theme: "light", firstPass: true };

/** One pasteable expression for a probe. The audit's carries the selector helpers capture.mjs installs. */
export function probeExpression(name, arg) {
  if (name === "audit") {
    return `(() => {${SELECTOR_HELPER}return (${auditProbe.toString()})(${JSON.stringify({ ...AUDIT_DEFAULT, ...arg })});\n})()`;
  }
  if (!PAGE[name]) throw new Error(`no probe called '${name}': one of ${PROBES.join(", ")}`);
  return expression(name, arg ?? (name === "stuck" ? { after: 8000 } : {}));
}
