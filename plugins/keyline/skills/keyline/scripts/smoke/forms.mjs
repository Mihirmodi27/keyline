/**
 * Submit every form three ways, each from a fresh load: empty, with one value
 * the field can't accept, and filled in properly. The first two must say what's
 * wrong, next to the field; the last must show that it worked.
 *
 * A submit is a write. Forms run only on a test host, and a form whose words
 * say delete, pay, unsubscribe and the like only with --allow-writes. Search
 * forms only read, so they run anywhere, and only filled in.
 */
import { add } from "../browse/findings.mjs";
import { shotKey } from "../browse/capture.mjs";
import { isDestructive } from "./config.mjs";
import { PAGE } from "./page.mjs";
import { normalUrl, open, openStep, pathOf, sleep } from "./util.mjs";

const TEXTLIKE = new Set(["text", "email", "url", "tel", "password", "search", "number", "textarea", ""]);
const ERROR_WORDS = /\b(error|invalid|required|failed|wrong|try again|couldn.t|can.t be|cannot be|must|missing|not valid|please (enter|fill|provide|choose))\b/i;

function today(offset = 0) {
  const d = new Date(Date.now() + offset);
  return d.toISOString().slice(0, 10);
}

/** A value a reasonable person would type into this field. */
export function validValue(f) {
  const hint = `${f.name ?? ""} ${f.label ?? ""}`.toLowerCase();
  let v;
  switch (f.type) {
    case "email":
      v = "keyline.smoke@example.test";
      break;
    case "url":
      v = "https://example.test";
      break;
    case "tel":
      v = "5555550123";
      break;
    case "number":
    case "range":
      v = f.min != null && f.min !== "" ? String(f.min) : f.max != null && f.max !== "" ? String(Math.min(1, Number(f.max))) : "1";
      break;
    case "date":
      v = today();
      break;
    case "datetime-local":
      v = `${today()}T12:00`;
      break;
    case "time":
      v = "12:00";
      break;
    case "month":
      v = today().slice(0, 7);
      break;
    case "color":
      v = "#336699";
      break;
    case "password":
      v = "Keyline-smoke-1";
      break;
    case "search":
      v = "keyline";
      break;
    default:
      if (/e-?mail/.test(hint)) v = "keyline.smoke@example.test";
      else if (/phone|mobile|tel/.test(hint)) v = "5555550123";
      else if (/zip|postal|post code/.test(hint)) v = "94107";
      else if (/url|website|link/.test(hint)) v = "https://example.test";
      else if (/first/.test(hint)) v = "Keyline";
      else if (/last|surname/.test(hint)) v = "Tester";
      else if (/name/.test(hint)) v = "Keyline Tester";
      else if (/city|town/.test(hint)) v = "Springfield";
      else if (f.tag === "textarea") v = "A message from Keyline's smoke test.";
      else v = "Keyline smoke test";
  }
  if (f.minLength && v.length < f.minLength) v = v.padEnd(f.minLength, "x");
  return v;
}

/** A value this field should refuse, or null when it has no rule to break. */
export function invalidValue(f) {
  const hint = `${f.name ?? ""} ${f.label ?? ""}`.toLowerCase();
  if (f.type === "email" || (f.type === "text" && /e-?mail/.test(hint))) return { value: "not-an-email", why: "not an email address" };
  if (f.type === "url") return { value: "not a url", why: "not a URL" };
  if (f.type === "number" && f.min != null && f.min !== "") return { value: String(Number(f.min) - 1), why: `below the minimum, ${f.min}` };
  if (f.type === "number" && f.max != null && f.max !== "") return { value: String(Number(f.max) + 1), why: `above the maximum, ${f.max}` };
  if (f.pattern) return { value: "!!", why: `doesn't match the pattern ${f.pattern}` };
  if (f.minLength > 1) return { value: "a", why: `shorter than ${f.minLength} characters` };
  if (f.type === "tel" || /phone|mobile/.test(hint)) return { value: "not a number", why: "not a phone number" };
  return null;
}

const isSearch = (form) => form.role === "search" || form.fields.some((f) => f.type === "search") || (form.fields.length === 1 && /^(q|query|search|s|keywords?)$/i.test(form.fields[0].name ?? ""));

async function fill(page, fields, values) {
  for (const f of fields) {
    if (!f.visible) continue;
    const loc = page.locator(f.sel).first();
    const v = values.get(f);
    try {
      if (f.tag === "select") {
        if (v === "") await loc.selectOption({ index: 0 }, { timeout: 1500 });
        else {
          const count = await loc.locator("option").count();
          await loc.selectOption({ index: count > 1 ? 1 : 0 }, { timeout: 1500 });
        }
      } else if (f.type === "checkbox") {
        if (v === "") await loc.uncheck({ timeout: 1500 });
        else if (f.required) await loc.check({ timeout: 1500 });
      } else if (f.type === "radio") {
        if (v !== "" && f.required) await loc.check({ timeout: 1500 });
      } else if (f.type === "file" || f.type === "range") {
        // Left as it is.
      } else if (TEXTLIKE.has(f.type) || f.tag === "textarea" || v != null) {
        await loc.fill(v ?? "", { timeout: 1500 });
      }
    } catch {
      // A field that won't take input (read-only, custom widget) keeps its value.
    }
  }
}

/** Submit one way and see what the page says. */
async function attempt(context, { base, route, form, values, quiet }) {
  const { page, log } = await open(context, { base, route });
  const origin = new URL(base).origin;
  const requests = [];
  const failures = [];
  let dialog = null;
  page.on("request", (req) => {
    if (req.method() !== "GET" || (req.resourceType() === "document" && req.url() !== page.url())) requests.push(`${req.method()} ${pathOf(req.url(), base)}`);
  });
  page.on("response", (res) => {
    const m = res.request().method();
    if (res.status() >= 400 && (m !== "GET" || res.request().resourceType() === "document") && res.url().startsWith(origin)) failures.push(`${m} ${pathOf(res.url(), base)} → ${res.status()}`);
  });
  page.on("dialog", (d) => {
    dialog = `${d.type()}: ${d.message().slice(0, 120)}`;
  });
  try {
    if (!(await page.locator(form.sel).count())) return { missing: true };
    await fill(page, form.fields, values);
    await page.evaluate(PAGE.listenInvalid, { formSel: form.sel });
    const before = await page.evaluate(PAGE.textSnapshot, { formSel: form.sel });
    await page.evaluate(() => (window.__klFormMark = true));
    const errorsBefore = log.pageErrors.length;
    if (form.submit) await page.locator(form.submit.sel).first().click({ timeout: 2500 }).catch(() => page.evaluate(PAGE.requestSubmit, { formSel: form.sel }));
    else await page.evaluate(PAGE.requestSubmit, { formSel: form.sel });

    const t0 = Date.now();
    while (Date.now() - t0 < quiet) {
      await sleep(150);
      if (requests.length || dialog || normalUrl(page.url()) !== normalUrl(before.url)) break;
    }
    await page.waitForLoadState("load", { timeout: 8000 }).catch(() => {});
    await page.waitForLoadState("networkidle", { timeout: 3000 }).catch(() => {});
    await sleep(400);
    const reloaded = !(await page.evaluate(() => window.__klFormMark === true).catch(() => false));
    const native = reloaded ? [] : await page.evaluate(PAGE.readInvalid).catch(() => []);
    const after = await page.evaluate(PAGE.textSnapshot, { formSel: form.sel }).catch(() => null);
    const had = new Set(before.items.map((t) => t.text));
    const fresh = (after?.items ?? []).filter((t) => !had.has(t.text));
    const near = (item) =>
      before.fieldBoxes.some((b) => item.box.y < b.y + b.h + 160 && item.box.y + item.box.h > b.y - 80 && item.box.x < b.x + b.w + 400 && item.box.x + item.box.w > b.x - 400) ||
      (form.box && item.box.y >= form.box.y - 40 && item.box.y <= form.box.y + form.box.h + 80);
    return {
      native,
      fresh,
      freshNear: fresh.filter(near),
      freshFar: fresh.filter((t) => !near(t)),
      ariaInvalid: after?.invalid ?? [],
      moved: normalUrl(page.url()) !== normalUrl(before.url) || reloaded,
      url: page.url(),
      requests,
      failures,
      dialog,
      errors: log.pageErrors.slice(errorsBefore).map((e) => e.text),
      reset: after && after.formConnected && after.values !== before.values,
      gone: after && !after.formConnected,
    };
  } finally {
    await page.close().catch(() => {});
  }
}

export async function checkForms({ run, context, base, route, inventory, settings, policy, skipped, log, find }) {
  const forms = (inventory?.forms ?? []).filter((f) => f.visible && f.fields.some((x) => x.visible)).slice(0, 4);
  if (!forms.length) return;
  log(`  forms  ${route}  ${forms.length}`);
  for (const form of forms) {
    const search = isSearch(form);
    const label = form.name ? `the “${form.name}” form` : form.submit?.text ? `the form sent with “${form.submit.text}”` : "the form";
    const destructive = isDestructive(form.name, form.submit?.text, form.text.slice(0, 120)) || isDestructive(pathOf(form.action, base).replace(/[/_-]/g, " "));
    const why = search && !destructive ? null : policy.blocks({ write: true, destructive });
    if (why) {
      skipped.push({ what: `${label} on ${route}`, why });
      continue;
    }
    const visibleFields = form.fields.filter((f) => f.visible);
    const press = `Click “${form.submit?.text || "Submit"}”`;
    const at = {
      page: route,
      viewport: "desktop",
      theme: "light",
      shot: shotKey("desktop", "light"),
      box: form.box,
      selector: form.sel,
      ...(find?.({ sel: form.sel, text: form.submit?.text }) ?? {}),
    };
    const steps = (...s) => [openStep(route), ...s];
    run.stats.forms++;

    // 1 and 2: wrong input should be refused, out loud, by the field.
    const tries = [];
    if (!search) {
      tries.push({ how: "empty", values: new Map(visibleFields.map((f) => [f, ""])), steps: ["Leave every field empty", press], required: visibleFields.some((f) => f.required) });
      const bad = visibleFields.map((f) => [f, invalidValue(f)]).find(([, v]) => v);
      if (bad) {
        const [field, inv] = bad;
        const values = new Map(visibleFields.map((f) => [f, f === field ? inv.value : validValue(f)]));
        tries.push({ how: "invalid", values, steps: [`Fill the form properly, except “${field.label || field.name}”: type “${inv.value}” (${inv.why})`, press], required: true });
      }
    }
    for (const t of tries) {
      const r = await attempt(context, { base, route, form, values: t.values, quiet: settings.quietMs });
      if (r.missing) break;
      if (r.native.length || r.freshNear.length) continue; // the browser's message, or the app's, by the field
      if (r.freshFar.length || r.dialog) {
        const where = r.dialog ? `a browser ${r.dialog}` : `“${r.freshFar[0].text}”`;
        add(run, {
          ...at,
          rule: "flow/validation-far",
          severity: "warning",
          title: `${cap(label)} reports ${t.how === "empty" ? "missing" : "wrong"} input away from the field`,
          evidence: `the only message is ${where}`,
          detail: "The message exists but not where the eye is. Put it under the field it's about, and point the field at it with aria-describedby.",
          fix: "/keyline patterns",
          steps: steps(...t.steps, `The message appears at ${r.dialog ? "an alert" : r.freshFar[0].sel}, away from the field`),
        });
        continue;
      }
      if (r.ariaInvalid.length) {
        add(run, {
          ...at,
          rule: "flow/silent-validation",
          severity: "warning",
          title: `${cap(label)} marks fields invalid without saying why`,
          evidence: `aria-invalid on ${r.ariaInvalid.slice(0, 3).join(", ")}; no message appears`,
          detail: "A red border alone doesn't tell anyone what to fix, and colour isn't seen by everyone. Add the message beside the field.",
          fix: "/keyline patterns",
          steps: steps(...t.steps, "The field turns invalid but no words say why"),
        });
        continue;
      }
      if (r.moved || r.requests.length) {
        if (!t.required) continue; // nothing was required, so sending it is fine
        add(run, {
          ...at,
          rule: "flow/accepts-invalid",
          severity: "warning",
          title: `${cap(label)} sends ${t.how === "empty" ? "empty required fields" : "a value it should refuse"}`,
          evidence: r.requests[0] ?? `moved to ${pathOf(r.url, base)}`,
          detail: "Nothing stops the submit, and nothing comes back by the field. Validate before sending, and show the server's answer next to the field it's about.",
          fix: "/keyline patterns",
          steps: steps(...t.steps, r.requests[0] ? `It sends ${r.requests[0]} with no message` : "The page moves on with no message"),
        });
        continue;
      }
      add(run, {
        ...at,
        rule: "flow/silent-validation",
        severity: "error",
        title: `${cap(label)} refuses ${t.how === "empty" ? "an empty submit" : "a wrong value"} in silence`,
        evidence: `no message, no aria-invalid, no request within ${settings.quietMs / 1000} s`,
        detail: "The submit does nothing and says nothing: the person can't tell whether it broke or what to change. Show what's wrong under each field.",
        fix: "/keyline patterns",
        steps: steps(...t.steps, "Nothing appears: no error, no change"),
      });
    }

    // 3: done right, it should visibly work.
    if (visibleFields.some((f) => f.type === "password")) {
      skipped.push({ what: `a proper submit of ${label} on ${route}`, why: "it takes a password; sign-in is set up in keyline.smoke.json, not guessed" });
      continue;
    }
    if (visibleFields.some((f) => f.type === "file" && f.required)) continue;
    const values = new Map(visibleFields.map((f) => [f, validValue(f)]));
    const r = await attempt(context, { base, route, form, values, quiet: settings.quietMs });
    if (r.missing) continue;
    const fillStep = search ? `Type “${validValue(visibleFields[0])}”` : "Fill every field with a plausible value";
    if (r.failures.length || r.errors.length) {
      add(run, {
        ...at,
        rule: "flow/submit-failed",
        severity: "error",
        title: `${cap(label)} fails when filled in properly`,
        evidence: r.failures[0] ?? r.errors[0],
        steps: steps(fillStep, press, r.failures[0] ? `The request fails: ${r.failures[0]}` : `An exception: ${r.errors[0]}`),
      });
      continue;
    }
    const refusal = [...r.freshNear, ...r.freshFar].find((t) => ERROR_WORDS.test(t.text));
    if (refusal && !r.moved) {
      add(run, {
        ...at,
        rule: "flow/submit-refused",
        severity: "info",
        title: `${cap(label)} refuses a plausible submission`,
        evidence: `“${refusal.text}”`,
        detail: "Keyline's test values were turned down. That may be right (a real account, a unique name), or the rule may be stricter than its label says.",
        steps: steps(fillStep, press, `It answers “${refusal.text}”`),
      });
      continue;
    }
    if (r.native.length) continue; // the browser refused one of Keyline's values (a pattern it couldn't guess): no verdict
    if (r.moved || r.fresh.length || r.dialog || r.reset || r.gone) continue;
    add(run, {
      ...at,
      rule: r.requests.length ? "flow/silent-success" : "flow/dead-submit",
      severity: r.requests.length ? "warning" : "error",
      title: r.requests.length ? `${cap(label)} gives no sign it worked` : `Submitting ${label} does nothing`,
      evidence: r.requests.length ? `${r.requests[0]} succeeded; the page didn't change` : `no request, no message, no change within ${settings.quietMs / 1000} s`,
      detail: r.requests.length ? "The data was sent, but the person sees the same form and will likely send it again. Confirm it: a message, a cleared form, or the next page." : "The submit is wired to nothing.",
      fix: r.requests.length ? "/keyline patterns" : undefined,
      steps: steps(fillStep, press, "Nothing on the page changes"),
    });
  }
}

const cap = (s) => s[0].toUpperCase() + s.slice(1);
