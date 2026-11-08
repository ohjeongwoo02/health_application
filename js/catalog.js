import { REPDB_URL, fromRepdb } from "./repdb.js";

// Bump when the item mapping or Korean dictionary changes, so old caches are replaced.
const CACHE_KEY = "overload-catalog-v1";

function readCache(storage) {
  try {
    const list = JSON.parse(storage.getItem(CACHE_KEY));
    return Array.isArray(list) && list.length ? list : null;
  } catch {
    return null;
  }
}

// Cache-first: the converted list (~100KB) is kept in storage, so the 2.6MB download happens once
// and the list also works offline inside the iOS app (no service worker there).
export async function loadCatalog(fetchFn, storage) {
  const cached = storage && readCache(storage);
  if (cached) return cached;
  const res = await fetchFn(REPDB_URL);
  if (!res.ok) throw new Error("catalog load failed");
  const items = fromRepdb((await res.json()).exercises);
  try { storage && storage.setItem(CACHE_KEY, JSON.stringify(items)); } catch {}
  return items;
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

export function imageUrl(item) {
  return item && item.repdb ? `https://exercise-dataset.com/images/flat/${item.repdb}.webp` : null;
}
