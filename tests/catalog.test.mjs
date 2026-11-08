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

import { loadCatalog } from "../js/catalog.js";

const repdbJson = { exercises: [{ id: "bench-press", name_en: "Bench Press", body_part: "chest", primary_muscles: ["pectoralis_major"], images: { flat: { peak: "images/flat/bench-press-peak.webp" } } }] };
const okFetch = () => { okFetch.calls++; return Promise.resolve({ ok: true, json: () => Promise.resolve(repdbJson) }); };
const badFetch = () => { badFetch.calls++; return Promise.reject(new Error("offline")); };
const memStorage = () => { const m = {}; return { getItem: (k) => m[k] ?? null, setItem: (k, v) => { m[k] = v; } }; };

test("loadCatalog: first load fetches and caches; later loads use the cache without fetching", async () => {
  okFetch.calls = 0; badFetch.calls = 0;
  const st = memStorage();
  const a = await loadCatalog(okFetch, st);
  assert.equal(a[0].id, "bench-press");
  assert.equal(okFetch.calls, 1);
  const b = await loadCatalog(badFetch, st);
  assert.deepEqual(b, a);
  assert.equal(badFetch.calls, 0);
});

test("loadCatalog: offline with nothing cached rejects; broken cache is ignored", async () => {
  await assert.rejects(() => loadCatalog(badFetch, memStorage()));
  const st = memStorage();
  st.setItem("overload-catalog-v1", "{not json");
  const a = await loadCatalog(okFetch, st);
  assert.equal(a[0].id, "bench-press");
});

test("loadCatalog: works without storage", async () => {
  const a = await loadCatalog(okFetch);
  assert.equal(a.length, 1);
});
