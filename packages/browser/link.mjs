/**
 * Development only (not in the published package): point node_modules/trykeyline
 * at this checkout, so the browser package imports the core it sits beside,
 * not a published copy. `npm test` at the root runs it first.
 *
 * Not an npm workspace: npm would install the published trykeyline into
 * node_modules to satisfy this package's dependency, shadowing the checkout.
 */
import { existsSync, lstatSync, mkdirSync, realpathSync, rmSync, symlinkSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = realpathSync(fileURLToPath(new URL("../../", import.meta.url)));
const link = join(root, "node_modules", "trykeyline");
const linked = () => {
  try {
    return realpathSync(link) === root;
  } catch {
    return false;
  }
};
if (!linked()) {
  if (existsSync(link) || lstatSync(link, { throwIfNoEntry: false })) rmSync(link, { recursive: true, force: true });
  mkdirSync(join(root, "node_modules"), { recursive: true });
  // A junction on Windows needs no admin rights; elsewhere the type is ignored.
  symlinkSync(root, link, "junction");
}
