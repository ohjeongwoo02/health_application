// Usage: node scripts/check-ko.mjs  -> lists English words left untranslated in live RepDB names.
import { koName } from "../js/ko.js";
const data = await (await fetch("https://exercise-dataset.com/exercises.json")).json();
const left = {};
let n = 0;
for (const e of data.exercises) {
  const k = koName(e.name_en);
  const words = k.replace(/EZ|IT|JM|T바|V|TRX/g, "").match(/[A-Za-z']{2,}/g);
  if (words) { n++; for (const w of words) left[w.toLowerCase()] = (left[w.toLowerCase()] || 0) + 1; }
}
console.log("names with leftover English:", n, "of", data.exercises.length);
console.log(Object.entries(left).sort((a, b) => b[1] - a[1]).map(([w, c]) => `${w}:${c}`).join(" "));
