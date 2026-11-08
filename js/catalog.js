export async function loadCatalog(fetchFn) {
  const res = await fetchFn("data/exercises.json");
  if (!res.ok) throw new Error("catalog load failed");
  return res.json();
}

export function filterCatalog(items, opts = {}) {
  const q = (opts.query || "").trim().toLowerCase();
  const part = opts.bodyPart;
  return items.filter((it) => {
    if (part && part !== "all" && it.bodyPart !== part) return false;
    if (!q) return true;
    return it.name.toLowerCase().includes(q) || (it.koName || "").toLowerCase().includes(q);
  });
}

export function bodyParts(items) {
  return [...new Set(items.map((i) => i.bodyPart))].sort();
}
