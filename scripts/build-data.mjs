// Usage: node scripts/build-data.mjs
// Builds data/exercises.json and img/<id>.jpg from free-exercise-db (Unlicense).
import fs from "node:fs/promises";
import path from "node:path";

const BASE = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main";
const root = path.resolve(import.meta.dirname, "..");

async function get(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    const res = await fetch(url);
    if (res.ok) return res;
    await new Promise((r) => setTimeout(r, 500 * (i + 1)));
  }
  throw new Error("failed: " + url);
}

const src = await (await get(`${BASE}/dist/exercises.json`)).json();
let ko = {};
try { ko = JSON.parse(await fs.readFile(path.join(root, "data/ko.json"), "utf8")); } catch {}

await fs.mkdir(path.join(root, "img"), { recursive: true });
const items = [];
const usable = src.filter((e) => e.images && e.images.length);

let next = 0;
async function worker() {
  while (next < usable.length) {
    const e = usable[next++];
    const file = path.join(root, "img", `${e.id}.jpg`);
    try { await fs.access(file); } catch {
      const buf = Buffer.from(await (await get(`${BASE}/exercises/${e.images[0]}`)).arrayBuffer());
      await fs.writeFile(file, buf);
    }
  }
}
await Promise.all(Array.from({ length: 8 }, worker));

for (const e of usable) {
  items.push({
    id: e.id,
    name: e.name,
    koName: ko[e.id] || e.name,
    bodyPart: e.primaryMuscles[0],
    equipment: e.equipment || "other",
    image: `img/${e.id}.jpg`,
  });
}
await fs.mkdir(path.join(root, "data"), { recursive: true });
await fs.writeFile(path.join(root, "data/exercises.json"), JSON.stringify(items));
console.log("exercises:", items.length);
