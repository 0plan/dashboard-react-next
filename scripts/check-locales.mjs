import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";

const root = new URL("../locales/", import.meta.url);
function files(locale) {
  return readdirSync(new URL(`${locale}/`, root)).filter(file => file.endsWith(".json")).sort();
}

function messages(locale, file) {
  const path = `${locale}/${file}`;
  const data = JSON.parse(readFileSync(new URL(path, root), "utf8"));
  assert.ok(data && typeof data === "object" && !Array.isArray(data), `${path}: expected an object`);
  assert.ok(Object.keys(data).length, `${path}: empty dictionary`);
  for (const [key, text] of Object.entries(data)) {
    assert.ok(key.trim() && typeof text === "string" && text.trim(), `${path}: empty key or translation for "${key}"`);
  }
  return data;
}

function placeholders(text) {
  return [...text.matchAll(/{{(\w+)}}/g)].map(match => match[1]).sort();
}

const pages = files("ko");
assert.deepEqual(files("en"), pages, "ko/en must contain matching page files");
for (const name of ["common", "login", "dashboard", "not-found"]) {
  assert.ok(pages.includes(`${name}.json`), `Missing ${name}.json`);
}
for (const file of pages) {
  const ko = messages("ko", file);
  const en = messages("en", file);
  assert.deepEqual(Object.keys(en).sort(), Object.keys(ko).sort(), `${file}: ko/en keys differ`);
  for (const key of Object.keys(ko)) {
    assert.deepEqual(placeholders(en[key]), placeholders(ko[key]), `${file}:${key}: ko/en placeholders differ`);
  }
}
console.log(`ko/en: ${pages.length} namespaces, matching keys and placeholders, no empty translations.`);
