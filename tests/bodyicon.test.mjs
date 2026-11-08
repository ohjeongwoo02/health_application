import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { bodyIconSvg, ICON_PARTS } from "../js/bodyicon.js";

const items = JSON.parse(fs.readFileSync(new URL("../data/exercises.json", import.meta.url), "utf8"));

test("every body part in the catalog has its own highlighted icon", () => {
  const parts = [...new Set(items.map((i) => i.bodyPart))];
  for (const p of parts) {
    assert.ok(ICON_PARTS.includes(p), `no icon for ${p}`);
    const svg = bodyIconSvg(p);
    assert.match(svg, /^<svg[^>]*viewBox="0 0 60 100"/);
    assert.ok(svg.includes('class="hl"'), `${p} has no highlight`);
  }
});

test("icons differ per body part", () => {
  const set = new Set(ICON_PARTS.map((p) => bodyIconSvg(p)));
  assert.equal(set.size, ICON_PARTS.length);
});

test("unknown part still returns a plain silhouette without highlight", () => {
  const svg = bodyIconSvg("nope");
  assert.match(svg, /^<svg/);
  assert.ok(!svg.includes('class="hl"'));
});
