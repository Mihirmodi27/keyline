import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { collect, ignoredBy, MARKUP, STYLE, walk } from "../plugins/keyline/skills/keyline/scripts/check/files.mjs";
import { check } from "../plugins/keyline/skills/keyline/scripts/check.mjs";

const SCAN = fileURLToPath(new URL("../plugins/keyline/skills/keyline/scripts/scan.mjs", import.meta.url));

/** A project tree where every file says `@layer`, so scan's signal for it lists every file scanned. */
function tree(files) {
  const root = mkdtempSync(join(tmpdir(), "keyline-files-"));
  for (const f of files) {
    mkdirSync(dirname(join(root, f)), { recursive: true });
    writeFileSync(join(root, f), "/* @layer */\n");
  }
  return root;
}

test("an ignore drops a path and what's inside it, never a sibling that shares its prefix", () => {
  const ignored = ignoredBy(["src/content", "./docs/"]);
  assert.ok(ignored("src/content"));
  assert.ok(ignored("src/content/post.tsx"));
  assert.ok(!ignored("src/contentful/client.tsx"));
  assert.ok(ignored("docs/a.tsx"));
  assert.ok(!ignored("docsite/a.tsx"));

  const root = tree(["src/content/post.tsx", "src/contentful/client.tsx"]);
  try {
    const rels = walk(root, { accept: MARKUP, ignores: ["src/content"] }).map((f) => f.rel);
    assert.deepEqual(rels, ["src/contentful/client.tsx"]);
    const scan = JSON.parse(spawnSync(process.execPath, [SCAN, root, "--json", "--ignore", "src/content"], { encoding: "utf8" }).stdout);
    assert.deepEqual(scan.signals["css layers"], ["src/contentful/client.tsx"]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("scan and check read the same files, bar the extras an inventory wants", () => {
  const root = tree([
    "src/App.tsx", "src/styles.css", "src/content/post.tsx", "src/contentful/client.tsx", ".storybook/preview.tsx",
    // Skipped by both: dependencies, build output, dot-folders, reports, generated and test files.
    "node_modules/pkg/index.css", "dist/app.css", ".next/page.css", "keyline-report/index.html", "smoke-report/index.html",
    "public/site.css", "src/Button.test.tsx", "src/Button.stories.tsx", "src/bundle.min.css", "src/types.d.ts",
    // Read by scan only: a config can declare the theme, and Stylus or CommonJS can hold values.
    "tailwind.config.js", "src/theme.styl", "src/tokens.cjs",
  ]);
  try {
    const checked = collect(root, [root], ["src/content"]).map((f) => f.rel).sort();
    assert.deepEqual(checked, [".storybook/preview.tsx", "src/App.tsx", "src/contentful/client.tsx", "src/styles.css"]);
    assert.equal(check({ root, ignores: ["src/content"] }).files, checked.length);

    const out = spawnSync(process.execPath, [SCAN, root, "--json", "--ignore", "src/content"], { encoding: "utf8" });
    const scan = JSON.parse(out.stdout);
    const scanned = [...scan.signals["css layers"]].sort();
    assert.equal(scan.filesScanned, scanned.length);
    const extras = ["src/theme.styl", "src/tokens.cjs", "tailwind.config.js"];
    assert.deepEqual(scanned.filter((f) => !extras.includes(f)), checked, "with the same extensions, the same files");
    assert.deepEqual(scanned.filter((f) => extras.includes(f)), extras);

    // And with the detector's extensions and skips, the shared walker is the detector's walk.
    const same = walk(root, { accept: new Set([...STYLE, ...MARKUP]), ignores: ["src/content"] }).map((f) => f.rel).filter((f) => f !== "tailwind.config.js").sort();
    assert.deepEqual(same, checked);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
