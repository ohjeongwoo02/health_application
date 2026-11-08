// Usage: node scripts/build-data.mjs
// Builds data/exercises.json from free-exercise-db (Unlicense).
import fs from "node:fs/promises";
import path from "node:path";

const BASE = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main";
const root = path.resolve(import.meta.dirname, "..");

async function get(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("failed: " + url);
  return res;
}

const src = await (await get(`${BASE}/dist/exercises.json`)).json();
let ko = {};
try { ko = JSON.parse(await fs.readFile(path.join(root, "data/ko.json"), "utf8")); } catch {}

const items = [];
const usable = src;

for (const e of usable) {
  items.push({
    id: e.id,
    name: e.name,
    koName: ko[e.id] || e.name,
    bodyPart: e.primaryMuscles[0],
    equipment: e.equipment || "other",
  });
}
await fs.mkdir(path.join(root, "data"), { recursive: true });
await fs.writeFile(path.join(root, "data/exercises.json"), JSON.stringify(items));
console.log("exercises:", items.length);
