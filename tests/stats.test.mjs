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

import { monthCells, shiftMonth } from "../js/stats.js";

test("monthCells: Sunday-first padding and month length", () => {
  const nov = monthCells("2026-11"); // Nov 1 2026 is a Sunday
  assert.equal(nov[0], "2026-11-01");
  assert.equal(nov.length, 30);
  const feb = monthCells("2026-02"); // Feb 1 2026 is a Sunday, 28 days
  assert.equal(feb.filter(Boolean).length, 28);
  const mar = monthCells("2026-03"); // Mar 1 2026 is a Sunday too; Apr 1 is a Wednesday
  assert.equal(mar[0], "2026-03-01");
  const apr = monthCells("2026-04");
  assert.deepEqual(apr.slice(0, 4), [null, null, null, "2026-04-01"]);
  assert.equal(monthCells("2028-02").filter(Boolean).length, 29);
});

test("shiftMonth crosses years", () => {
  assert.equal(shiftMonth("2026-12", 1), "2027-01");
  assert.equal(shiftMonth("2026-01", -1), "2025-12");
  assert.equal(shiftMonth("2026-11", 0), "2026-11");
});
