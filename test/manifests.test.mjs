import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// The plugin carries two manifests: Claude Code reads .claude-plugin/plugin.json,
// and Copilot and other Agent Plugins hosts read plugin.json at the plugin root.
// They have to describe the same release, and the open one may only use the
// fields Agent Plugins 1.0.0 allows.
const read = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), "utf8"));
const claude = read("plugins/keyline/.claude-plugin/plugin.json");
const open = read("plugins/keyline/plugin.json");
const pkg = read("package.json");

test("both plugin manifests describe the same release", () => {
  for (const field of ["name", "version", "description", "author", "homepage", "repository", "license", "keywords"]) {
    assert.deepEqual(open[field], claude[field], `plugin.json and .claude-plugin/plugin.json differ on "${field}"`);
  }
  assert.equal(open.version, pkg.version, "plugin version and package.json version differ");
});

test("the root plugin.json keeps to Agent Plugins 1.0.0", () => {
  const allowed = new Set(["$schema", "name", "version", "description", "author", "homepage", "repository", "license", "keywords", "extensions"]);
  assert.equal(open.$schema, "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json");
  assert.match(open.name, /^(?!.*(?:--|\.\.))[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/);
  for (const field of Object.keys(open)) assert.ok(allowed.has(field), `"${field}" is not an Agent Plugins 1.0.0 field`);
  for (const field of Object.keys(open.author ?? {})) assert.ok(["name", "email", "url"].includes(field), `author.${field} is not allowed`);
});
