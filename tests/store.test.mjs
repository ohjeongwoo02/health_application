import test from "node:test";
import assert from "node:assert/strict";
import {
  emptyState, loadState, saveState, addRecord, lastRecord, exportJson, importJson,
} from "../js/store.js";

const fakeStorage = (init = {}) => {
  const m = { ...init };
  return { getItem: (k) => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = v; }, m };
};

test("loadState: missing / broken / throwing -> empty", () => {
  assert.deepEqual(loadState(fakeStorage()), emptyState());
  assert.deepEqual(loadState(fakeStorage({ "overload-v1": "{not json" })), emptyState());
  assert.deepEqual(loadState({ getItem() { throw new Error("denied"); } }), emptyState());
});

test("save/load round trip", () => {
  const st = addRecord(emptyState(), { exerciseId: "a", date: "2026-11-08", sets: [{ weight: 60, reps: 12 }] }, 1);
  const s = fakeStorage();
  saveState(s, st);
  assert.deepEqual(loadState(s), st);
});

test("addRecord ignores invalid-only sets", () => {
  const st = emptyState();
  const out = addRecord(st, { exerciseId: "a", date: "2026-11-08", sets: [{ weight: 0, reps: NaN }] }, 1);
  assert.equal(out.records.length, 0);
});

test("same day twice -> two records, lastRecord is latest", () => {
  let st = emptyState();
  const base = { exerciseId: "a", date: "2026-11-08" };
  st = addRecord(st, { ...base, sets: [{ weight: 60, reps: 10 }] }, 1);
  st = addRecord(st, { ...base, sets: [{ weight: 65, reps: 12 }] }, 2);
  assert.equal(st.records.length, 2);
  assert.equal(lastRecord(st, "a").savedAt, 2);
  assert.equal(lastRecord(st, "zzz"), null);
});

test("importJson validation", () => {
  assert.equal(importJson("garbage"), null);
  assert.equal(importJson(JSON.stringify({ version: 1, exercises: [], today: { date: "x", exerciseIds: [] }, records: "no" })), null);
  const st = addRecord(emptyState(), { exerciseId: "a", date: "2026-11-08", sets: [{ weight: 60, reps: 12 }] }, 1);
  assert.deepEqual(importJson(exportJson(st)), st);
});
