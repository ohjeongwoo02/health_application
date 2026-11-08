import test from "node:test";
import assert from "node:assert/strict";
import { filterCatalog, bodyParts } from "../js/catalog.js";

const items = [
  { id: "a", name: "Barbell Bench Press", koName: "바벨 벤치프레스", bodyPart: "chest", equipment: "barbell", image: "img/a.jpg" },
  { id: "b", name: "Dumbbell Bench Press", koName: "덤벨 벤치프레스", bodyPart: "chest", equipment: "dumbbell", image: "img/b.jpg" },
  { id: "c", name: "Shoulder Press", koName: "숄더프레스", bodyPart: "shoulders", equipment: "barbell", image: "img/c.jpg" },
  { id: "d", name: "Squat", koName: "스쿼트", bodyPart: "quadriceps", equipment: "barbell", image: "img/d.jpg" },
];
const ids = (r) => r.map((x) => x.id);

test("english query is case-insensitive", () => {
  assert.deepEqual(ids(filterCatalog(items, { query: "BENCH" })), ["a", "b"]);
});

test("korean query", () => {
  assert.deepEqual(ids(filterCatalog(items, { query: "벤치" })), ["a", "b"]);
  assert.deepEqual(ids(filterCatalog(items, { query: "스쿼트" })), ["d"]);
});

test("whitespace-only query behaves like no query", () => {
  assert.deepEqual(ids(filterCatalog(items, { query: "   " })), ids(items));
  assert.deepEqual(ids(filterCatalog(items, { bodyPart: "chest", query: "  " })), ["a", "b"]);
});

test("no match -> empty array", () => {
  assert.deepEqual(filterCatalog(items, { query: "zzzz" }), []);
});

test("bodyPart + query combine; 'all' means all", () => {
  assert.deepEqual(ids(filterCatalog(items, { bodyPart: "chest", query: "dumbbell" })), ["b"]);
  assert.deepEqual(ids(filterCatalog(items, { bodyPart: "all" })), ids(items));
});

test("bodyParts unique and sorted", () => {
  assert.deepEqual(bodyParts(items), ["chest", "quadriceps", "shoulders"]);
});
