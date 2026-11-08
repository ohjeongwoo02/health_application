import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { BODY_PART_KO } from "../js/i18n.js";

const items = JSON.parse(fs.readFileSync(new URL("../data/exercises.json", import.meta.url), "utf8"));
const ko = JSON.parse(fs.readFileSync(new URL("../data/ko.json", import.meta.url), "utf8"));

test("800+ exercises with required fields and existing images", () => {
  assert.ok(items.length >= 800);
  for (const it of items) {
    for (const k of ["id", "name", "koName", "bodyPart", "equipment", "image"]) assert.ok(it[k], `${it.id} missing ${k}`);
    assert.ok(fs.existsSync(new URL("../" + it.image, import.meta.url)), `${it.image} missing`);
  }
});

test("unique ids", () => {
  assert.equal(new Set(items.map((i) => i.id)).size, items.length);
});

test("every bodyPart has a Korean label", () => {
  for (const it of items) assert.ok(BODY_PART_KO[it.bodyPart], it.bodyPart);
});

test("every exercise has a real Korean name (not just the English fallback)", () => {
  const missing = items.filter((i) => !ko[i.id]).map((i) => i.id);
  assert.deepEqual(missing, []);
});
