import { cleanSets } from "./recommend.js";

const KEY = "overload-v1";

export function emptyState() {
  return { version: 1, exercises: [], today: { date: "", exerciseIds: [] }, records: [] };
}

function valid(s) {
  return (
    s && typeof s === "object" && s.version === 1 &&
    Array.isArray(s.exercises) && Array.isArray(s.records) &&
    s.today && Array.isArray(s.today.exerciseIds)
  );
}

export function loadState(storage) {
  try {
    const raw = storage.getItem(KEY);
    if (!raw) return emptyState();
    const s = JSON.parse(raw);
    return valid(s) ? s : emptyState();
  } catch {
    return emptyState();
  }
}

export function saveState(storage, state) {
  storage.setItem(KEY, JSON.stringify(state));
}

export function addRecord(state, rec, now) {
  const sets = cleanSets(rec.sets);
  if (sets.length === 0) return state;
  return {
    ...state,
    records: [...state.records, { exerciseId: rec.exerciseId, date: rec.date, sets, savedAt: now }],
  };
}

export function lastRecord(state, exerciseId) {
  let best = null;
  for (const r of state.records) {
    if (r.exerciseId === exerciseId && (!best || r.savedAt > best.savedAt)) best = r;
  }
  return best;
}

export function exportJson(state) {
  return JSON.stringify(state, null, 2);
}

export function importJson(text) {
  try {
    const s = JSON.parse(text);
    return valid(s) ? s : null;
  } catch {
    return null;
  }
}
