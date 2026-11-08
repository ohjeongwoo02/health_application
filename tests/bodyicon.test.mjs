import test from "node:test";
import assert from "node:assert/strict";
import { bodyIconSvg, ICON_PARTS } from "../js/bodyicon.js";

test("every icon part is a valid, highlighted SVG", () => {
  for (const p of ICON_PARTS) {
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
