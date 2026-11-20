import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { check } from "../plugins/keyline/skills/keyline/scripts/check.mjs";
import { indexTokens, normColor } from "../plugins/keyline/skills/keyline/scripts/check/tokens.mjs";
import { parseCss } from "../plugins/keyline/skills/keyline/scripts/check/css.mjs";
import { format, guardFile } from "../plugins/keyline/skills/keyline/scripts/guard.mjs";

function project(files) {
  const root = mkdtempSync(join(tmpdir(), "keyline-tokens-"));
  for (const [rel, text] of Object.entries(files)) {
    mkdirSync(join(root, rel, ".."), { recursive: true });
    writeFileSync(join(root, rel), text);
  }
  return root;
}
const TOKENS = `:root {
  --ink: #1a1a1a;
  --fg: #1a1a1a;
  --space-4: 16px;
  --radius-card: 12px;
  --text-body: 15px;
  --shadow-raised: 0 1px 2px rgba(0, 0, 0, 0.2);
  --accent: var(--brand);
}
@media (prefers-color-scheme: dark) { :root { --line: #333333; } }
[data-theme="dark"] { --muted: #444444; }
`;
const of = (r, rule) => r.findings.filter((f) => f.rule === rule);

test("colours match across spellings; other values only as written, with spaces and a leading zero evened out", () => {
  assert.equal(normColor("#ABC"), "#aabbcc");
  assert.equal(normColor("#aabbccff"), "#aabbcc");
  assert.equal(normColor("rgb(26, 26, 26)"), "#1a1a1a");
  assert.equal(normColor("rgba(0 0 0 / .5)"), "#00000080");
  const idx = indexTokens(parseCss(TOKENS).decls);
  assert.deepEqual(idx.find("color", "rgb(26,26,26)"), ["--ink", "--fg"]);
  assert.deepEqual(idx.find("shadow", "0 1px 2px rgba(0,0,0,.2)"), ["--shadow-raised"]);
  assert.deepEqual(idx.find("space", "1rem"), [], "no conversion between units");
});

test("only base definitions are tokens: not a dark theme's, not a media query's, not an alias", () => {
  const idx = indexTokens(parseCss(TOKENS).decls);
  assert.deepEqual(idx.find("color", "#333333"), []);
  assert.deepEqual(idx.find("color", "#444444"), []);
  assert.equal(idx.count, 5, "five values; --ink and --fg share one");
  // Tailwind v4's @theme is a base definition too.
  assert.deepEqual(indexTokens(parseCss("@theme { --color-ink: #1a1a1a; --radius-lg: 12px; }").decls).find("radius", "12px"), ["--radius-lg"]);
});

test("a raw value names the token that holds it, in its own family only", () => {
  const root = project({
    "src/tokens.css": TOKENS,
    "src/card.css": ".card { color: #1a1a1a; padding: 16px 12px; border-radius: 12px; font-size: 15px; margin: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.2); }\n.x { border-radius: 16px; color: #333333; }\n",
  });
  const r = check({ root });
  const color = of(r, "color/raw-color");
  assert.match(color[0].message, /is the value of `--ink` and `--fg`\. Use the one named for this job/);
  assert.deepEqual(color[0].tokens, ["--ink", "--fg"]);
  assert.match(color[1].message, /Give it a token named for its job/, "a colour only a dark theme defines has no token to name");
  assert.equal(of(r, "layout/raw-space").length, 1);
  assert.match(of(r, "layout/raw-space")[0].message, /`16px` in `padding` is the value of `--space-4`/);
  assert.equal(of(r, "layout/raw-radius").length, 1, "16px is a space, not a corner; 12px margin is not a radius");
  assert.equal(of(r, "type/raw-size")[0].severity, "info");
  assert.deepEqual(of(r, "depth/raw-shadow")[0].tokens, ["--shadow-raised"]);
});

test("a run over one file, as the guard makes, still finds the tokens defined elsewhere", () => {
  const root = project({ "app/globals.css": TOKENS, "app/page.css": ".hero { border-radius: 12px; }\n" });
  const r = check({ root, only: ["app/page.css"] });
  assert.deepEqual(of(r, "layout/raw-radius").map((f) => f.file), ["app/page.css"]);
  assert.deepEqual(of(r, "layout/raw-radius")[0].tokens, ["--radius-card"]);
});

test("Tailwind arbitrary values name the token too", () => {
  const root = project({
    "app/globals.css": "@theme { --color-ink: #1a1a1a; --radius-card: 12px; --spacing-gutter: 24px; }\n",
    "app/page.tsx": 'export default () => <div className="bg-[#1a1a1a] rounded-[12px] px-[24px] rounded-[4px]" />;\n',
  });
  const r = check({ root });
  assert.match(of(r, "color/raw-color")[0].message, /`bg-\[#1a1a1a\]` puts a raw colour in a class, the value of `--color-ink`/);
  assert.match(of(r, "layout/raw-radius")[0].message, /`rounded-\[12px\]` is the value of `--radius-card`.*its utility/);
  assert.equal(of(r, "layout/raw-radius").length, 1);
  assert.equal(of(r, "layout/raw-space").length, 1);
});

test("a project with no tokens gets no token findings, and raw-color says what it always said", () => {
  const root = project({ "a.css": ".a { color: #1a1a1a; border-radius: 12px; }\n" });
  const r = check({ root });
  assert.equal(of(r, "layout/raw-radius").length, 0);
  assert.equal(of(r, "color/raw-color")[0].tokens, undefined);
  assert.match(of(r, "color/raw-color")[0].message, /Give it a token named for its job/);
});

test("the guard passes on a raw value with a token, and no other info", () => {
  const root = project({ "app/globals.css": TOKENS, "app/page.css": ".hero { border-radius: 12px; }\n" });
  const g = guardFile("app/page.css", { base: root, env: {} });
  assert.equal(g.findings.length, 1);
  assert.match(format(g), /Keyline guard: 1 raw value with a token in app\/page\.css/);
  assert.match(format(g), /`12px` in `border-radius` is the value of `--radius-card`/);
  const quiet = project({ "app/page.css": ".hero { border-radius: 12px; }\n" });
  assert.equal(guardFile("app/page.css", { base: quiet, env: {} }), null);
});
