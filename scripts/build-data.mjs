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

// RepDB (repdb.co) images are loaded from their server at runtime; we only store the file name.
const rep = await (await get("https://exercise-dataset.com/exercises.json")).json();
const norm = (s) => s.toLowerCase().replace(/\bdb\b/g, "dumbbell").replace(/\bez[- ]?bar\b/g, "ezbar")
  .replace(/pull[- ]?ups?/g, "pullup").replace(/push[- ]?ups?/g, "pushup").replace(/sit[- ]?ups?/g, "situp")
  .replace(/[^a-z0-9 ]/g, " ").split(/\s+/)
  .filter((w) => w && !["the", "a", "with", "on", "of", "medium", "grip", "barbell"].includes(w))
  .map((w) => w.replace(/s$/, "")).sort().join(" ");
const repIndex = new Map();
for (const r of rep.exercises) {
  const f = r.images?.flat;
  const file = (f?.peak || f?.main || f?.start || "").replace("images/flat/", "").replace(".webp", "");
  if (file && !repIndex.has(norm(r.name_en))) repIndex.set(norm(r.name_en), file);
}

const items = [];
const usable = src;

for (const e of usable) {
  items.push({
    id: e.id,
    name: e.name,
    koName: ko[e.id] || e.name,
    bodyPart: e.primaryMuscles[0],
    equipment: e.equipment || "other",
    ...(repIndex.has(norm(e.name)) ? { repdb: repIndex.get(norm(e.name)) } : {}),
  });
}
await fs.mkdir(path.join(root, "data"), { recursive: true });
await fs.writeFile(path.join(root, "data/exercises.json"), JSON.stringify(items));
console.log("exercises:", items.length);
