import test from "node:test";
import assert from "node:assert/strict";
import { recordStats, summary, setsPerDay, exerciseHistory, loggedExercises } from "../js/stats.js";

const rec = (exerciseId, date, sets, savedAt) => ({ exerciseId, date, sets: sets.map(([weight, reps]) => ({ weight, reps })), savedAt });
const R = [
  rec("bench", "2026-11-01", [[60, 12], [60, 10]], 1),
  rec("squat", "2026-11-01", [[80, 5]], 2),
  rec("bench", "2026-11-04", [[65, 8]], 3),
  rec("bench", "2026-11-06", [[62.5, 10]], 4),
];

test("recordStats", () => {
  assert.deepEqual(recordStats(R[0]), { nSets: 2, reps: 22, top: 60, volume: 1320, e1rm: 84 });
});

test("summary", () => {
  assert.deepEqual(summary(R), { days: 3, sets: 5, volume: 1320 + 400 + 520 + 625, last: "2026-11-06" });
  assert.deepEqual(summary([]), { days: 0, sets: 0, volume: 0, last: null });
});

test("setsPerDay", () => {
  assert.equal(setsPerDay(R).get("2026-11-01"), 3);
});

test("exerciseHistory sorts by date and flags PRs", () => {
  const h = exerciseHistory([...R].reverse(), "bench");
  assert.deepEqual(h.map((x) => x.date), ["2026-11-01", "2026-11-04", "2026-11-06"]);
  assert.deepEqual(h.map((x) => x.pr), [true, true, false]);
});

test("loggedExercises: most logged first", () => {
  assert.deepEqual(loggedExercises(R), ["bench", "squat"]);
});
