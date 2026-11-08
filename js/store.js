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

// Cloud sync shape: exercises in one doc, records split by month so no doc nears Firestore's 1MB cap.
export function toCloudDocs(state) {
  const docs = { exercises: { list: state.exercises } };
  for (const r of state.records) {
    const id = `m-${r.date.slice(0, 7)}`;
    (docs[id] ||= { records: [] }).records.push(r);
  }
  return docs;
}

export function fromCloudDocs(entries) {
  const st = emptyState();
  for (const [id, data] of entries) {
    if (id === "exercises") st.exercises = data.list || [];
    else if (id.startsWith("m-")) st.records.push(...(data.records || []));
  }
  return st;
}

// Which docs changed since the last successful push (sent = {docId: hash}).
export function cloudDiff(docs, sent) {
  const hash = (s) => { let x = 5381; for (let i = 0; i < s.length; i++) x = (x * 33 + s.charCodeAt(i)) | 0; return String(x); };
  const next = {}, set = [], del = [];
  for (const [id, data] of Object.entries(docs)) {
    next[id] = hash(JSON.stringify(data));
    if (sent[id] !== next[id]) set.push(id);
  }
  for (const id of Object.keys(sent)) if (!(id in docs)) del.push(id);
  return { next, set, del };
}
