import test from "node:test";
import assert from "node:assert/strict";
import { createTimer } from "../js/timer.js";

const clock = () => {
  let t = 1_000_000;
  return { now: () => t, advance: (sec) => { t += sec * 1000; } };
};

test("counts down by wall clock", () => {
  const c = clock();
  const t = createTimer(c.now);
  t.start(90);
  assert.equal(t.remaining(), 90);
  c.advance(30);
  assert.equal(t.remaining(), 60);
  assert.equal(t.running(), true);
});

test("long background gap -> 0 and not running", () => {
  const c = clock();
  const t = createTimer(c.now);
  t.start(90);
  c.advance(300);
  assert.equal(t.remaining(), 0);
  assert.equal(t.running(), false);
});

test("stop -> 0", () => {
  const c = clock();
  const t = createTimer(c.now);
  t.start(90);
  t.stop();
  assert.equal(t.remaining(), 0);
  assert.equal(t.running(), false);
});

test("restart replaces previous run", () => {
  const c = clock();
  const t = createTimer(c.now);
  t.start(90);
  c.advance(10);
  t.start(60);
  assert.equal(t.remaining(), 60);
});
