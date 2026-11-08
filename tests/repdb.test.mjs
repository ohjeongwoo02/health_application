import test from "node:test";
import assert from "node:assert/strict";
import { fromRepdb, ICON_BY_MUSCLE } from "../js/repdb.js";
import { ICON_PARTS } from "../js/bodyicon.js";
import { BODY_PART_KO } from "../js/i18n.js";

const raw = [
  { id: "bench-press", name_en: "Bench Press", body_part: "chest", primary_muscles: ["pectoralis_major"], images: { flat: { start: "images/flat/bench-press-start.webp", peak: "images/flat/bench-press-peak.webp" } } },
  { id: "bent-over-db-row", name_en: "Bent-Over Dumbbell Row", body_part: "back", primary_muscles: ["latissimus_dorsi"], images: { flat: { start: "images/flat/bent-over-db-row-start.webp", peak: "images/flat/bent-over-db-row-peak.webp" } } },
  { id: "cat-stretch", name_en: "Cat Stretch", body_part: "back", primary_muscles: ["erector_spinae"], images: { flat: { main: "images/flat/cat-stretch-main.webp" } } },
  { id: "weird", name_en: "Weird Move", body_part: "core", primary_muscles: [], images: {} },
];

test("maps RepDB records to catalog items", () => {
  const [a, b, c, d] = fromRepdb(raw);
  assert.deepEqual(a, { id: "bench-press", name: "Bench Press", koName: "벤치프레스", bodyPart: "chest", iconPart: "chest", equipment: "other", repdb: "bench-press-peak" });
  assert.equal(b.equipment, "dumbbell");
  assert.equal(c.repdb, "cat-stretch-main");
  assert.equal(c.iconPart, "lower back");
  assert.equal(d.repdb, undefined);
  assert.equal(d.iconPart, undefined);
});

test("every mapped muscle has an icon, every body part a Korean label", () => {
  for (const v of Object.values(ICON_BY_MUSCLE)) assert.ok(ICON_PARTS.includes(v), v);
  for (const k of ["upper_legs", "core", "full_body", "back", "chest", "shoulders", "upper_arms", "lower_legs", "lower_arms"]) {
    assert.ok(BODY_PART_KO[k], k);
  }
});
