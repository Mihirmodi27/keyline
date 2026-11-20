import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { check } from "../plugins/keyline/skills/keyline/scripts/check.mjs";
import { format, guardFile } from "../plugins/keyline/skills/keyline/scripts/guard.mjs";

function project(files) {
  const root = mkdtempSync(join(tmpdir(), "keyline-components-"));
  for (const [rel, text] of Object.entries(files)) {
    mkdirSync(join(root, rel, ".."), { recursive: true });
    writeFileSync(join(root, rel), text);
  }
  return root;
}
const LOOK = "inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium";
const comp = (name, cls = LOOK, tag = "span") => `export function ${name}({ children }) {\n  return <${tag} className="${cls}">{children}</${tag}>;\n}\n`;
const design = (rows) => `# Design system\n\n## Profile\n\n| | |\n|---|---|\n| Preset | \`product\` |\n\n## Components\n\n| Role | Component | Notes |\n|---|---|---|\n${rows}\n`;
const of = (r, rule) => r.findings.filter((f) => f.rule === rule);

test("a component built like another is reported once, on the later one, naming the original", () => {
  const r = check({ root: project({ "src/ui/Button.tsx": comp("Button"), "src/marketing/CtaButton.tsx": comp("CtaButton", LOOK + " shadow-sm") }) });
  const found = of(r, "depth/component-copy");
  assert.equal(found.length, 1);
  assert.equal(found[0].file, "src/ui/Button.tsx", "untagged, the later of the pair by path carries it");
  assert.match(found[0].message, /`Button` is built like `CtaButton` \(src\/marketing\/CtaButton\.tsx\): 8 of 9 style values the same/);
  assert.equal(found[0].severity, "info");
});

test("a tag in DESIGN.md decides which is the original", () => {
  const r = check({
    root: project({
      "DESIGN.md": design("| `button` | `Button` in `src/ui/Button.tsx` | |"),
      "src/ui/Button.tsx": comp("Button"),
      "src/marketing/CtaButton.tsx": comp("CtaButton"),
    }),
  });
  const found = of(r, "depth/component-copy");
  assert.deepEqual(found.map((f) => f.file), ["src/marketing/CtaButton.tsx"]);
  assert.match(found[0].message, /built like `Button` \(src\/ui\/Button\.tsx, DESIGN\.md's `button`\)/);
  assert.deepEqual(found[0].use, { name: "Button", file: "src/ui/Button.tsx", role: "button" });
});

test("plain CSS compares declarations, not class names", () => {
  const css = (c) => `.${c} { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 6px; font-weight: 500; }\n.${c}:hover { opacity: 0.9; }\n`;
  const r = check({
    root: project({
      "src/a.css": css("btn") + css("cta"),
      "src/Btn.tsx": comp("Btn", "btn", "button"),
      "src/Cta.tsx": comp("Cta", "cta", "button"),
    }),
  });
  assert.equal(of(r, "depth/component-copy").length, 1);
});

test("variants in one file, route files, plain components and different looks are not copies", () => {
  const r = check({
    root: project({
      "src/Buttons.tsx": comp("Primary") + comp("Secondary"),
      "app/page.tsx": comp("Home"),
      "app/about/page.tsx": comp("About"),
      "src/Tiny.tsx": comp("Tiny", "p-2 flex"),
      "src/Tiny2.tsx": comp("Tiny2", "p-2 flex"),
      "src/Card.tsx": comp("Card", "rounded-xl border p-6 bg-white shadow-sm grid gap-4"),
    }),
  });
  assert.deepEqual(of(r, "depth/component-copy"), []);
});

test("a run over one file reports the copy in the file in hand, against the whole project", () => {
  const root = project({ "src/ui/Button.tsx": comp("Button"), "src/z/CtaButton.tsx": comp("CtaButton") });
  const r = check({ root, only: ["src/ui/Button.tsx"] });
  assert.deepEqual(of(r, "depth/component-copy").map((f) => f.file), ["src/ui/Button.tsx"]);
  const g = guardFile("src/z/CtaButton.tsx", { base: root, env: {} });
  assert.match(format(g), /1 already in the system/);
  assert.match(format(g), /depth\/component-copy/);
});

test("a hand-styled element doing a tagged component's job is pointed at it", () => {
  const files = {
    "DESIGN.md": design("| `button` | `src/components/ui/button.tsx#Button` | |\n| dialog | `Dialog` in `src/components/ui/dialog.tsx` | |"),
    "src/components/ui/button.tsx": 'export function Button(p) { return <button className="px-4" {...p} />; }\n',
    "src/components/ui/select.tsx": 'export function Select() { return <button className="h-9 w-full" />; }\n',
    "src/app/Toolbar.tsx": 'export function Toolbar() {\n  return <div>\n    <button className="px-3 py-1 rounded">Save</button>\n    <button onClick={go}>Plain</button>\n    <input className="w-full" />\n    <div role="dialog" className="fixed inset-0" />\n  </div>;\n}\n',
  };
  const r = check({ root: project(files) });
  const found = of(r, "depth/hand-rolled");
  assert.deepEqual(found.map((f) => `${f.file}:${f.line}`), ["src/app/Toolbar.tsx:3", "src/app/Toolbar.tsx:6"], "the library's own folder and an unstyled button are fine; input has no tag");
  assert.match(found[0].message, /A `<button>` styled by hand\. DESIGN\.md gives `button` to `Button` \(src\/components\/ui\/button\.tsx\)/);
  assert.match(found[1].message, /gives `dialog` to `Dialog`/);
  assert.equal(of(check({ root: project({ "src/app/Toolbar.tsx": files["src/app/Toolbar.tsx"] }) }), "depth/hand-rolled").length, 0, "no tags, nothing to point at");
});

test("check lists the components DESIGN.md names, and warns about one whose file is gone", () => {
  const root = project({ "DESIGN.md": design("| `button` | `Button` in `src/ui/Button.tsx` | |\n| card | `src/ui/Card.tsx` | |"), "src/ui/Button.tsx": comp("Button") });
  const r = check({ root });
  assert.deepEqual(r.design.components.map((c) => c.role), ["button", "card"]);
  assert.deepEqual(r.design.componentsMissing.map((c) => c.file), ["src/ui/Card.tsx"]);
});
