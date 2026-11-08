import test from "node:test";
import assert from "node:assert/strict";
import { recommendNextWeight, defaultSettings, cleanSets } from "../js/recommend.js";

const bench = { targetReps: 12, increment: 5, qualifyingSets: 3 };
const sets = (w, reps) => reps.map((r) => ({ weight: w, reps: r }));

test("3 of 4 sets hit target -> add increment", () => {
  assert.equal(recommendNextWeight(sets(65, [12, 12, 12, 9]), bench), 70);
});

test("only 2 sets hit target -> keep weight", () => {
  assert.equal(recommendNextWeight(sets(60, [12, 12, 11, 10]), bench), 60);
});

test("dumbbell +2kg", () => {
  assert.equal(
    recommendNextWeight(sets(16, [12, 12, 12]), { targetReps: 12, increment: 2, qualifyingSets: 3 }),
    18,
  );
});

test("heaviest weight is the base weight", () => {
  const a = [{ weight: 60, reps: 12 }, ...sets(65, [12, 12, 12])];
  assert.equal(recommendNextWeight(a, bench), 70);
  const b = [...sets(60, [12, 12, 12]), { weight: 65, reps: 8 }];
  assert.equal(recommendNextWeight(b, bench), 65);
});

test("no valid sets -> null", () => {
  assert.equal(recommendNextWeight([], bench), null);
  assert.equal(recommendNextWeight([{ weight: 0, reps: 10 }, { weight: 60, reps: NaN }], bench), null);
});

test("decimal weights have no float residue", () => {
  assert.equal(
    recommendNextWeight(sets(62.5, [12, 12, 12]), { targetReps: 12, increment: 2.5, qualifyingSets: 3 }),
    65,
  );
  assert.equal(
    recommendNextWeight(sets(0.1, [12, 12, 12]), { targetReps: 12, increment: 0.2, qualifyingSets: 3 }),
    0.3,
  );
});

test("cleanSets drops invalid sets", () => {
  const out = cleanSets([
    { weight: 60, reps: NaN },
    { weight: 0, reps: 10 },
    { weight: -5, reps: 5 },
    { weight: 60, reps: 12 },
  ]);
  assert.deepEqual(out, [{ weight: 60, reps: 12 }]);
});

test("defaultSettings", () => {
  assert.equal(defaultSettings("dumbbell").increment, 2);
  assert.equal(defaultSettings("barbell").increment, 5);
  assert.equal(defaultSettings().restSeconds, 90);
  assert.equal(defaultSettings().targetReps, 12);
  assert.equal(defaultSettings().qualifyingSets, 3);
});
