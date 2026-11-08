// Pure numbers for the records dashboard (records.html). No DOM here so it can be tested in node.

// Epley estimate of one-rep max.
const e1rm = (s) => s.weight * (1 + s.reps / 30);
const r1 = (x) => Math.round(x * 10) / 10;

export function recordStats(rec) {
  return {
    nSets: rec.sets.length,
    reps: rec.sets.reduce((a, s) => a + s.reps, 0),
    top: Math.max(...rec.sets.map((s) => s.weight)),
    volume: r1(rec.sets.reduce((a, s) => a + s.weight * s.reps, 0)),
    e1rm: r1(Math.max(...rec.sets.map(e1rm))),
  };
}

export function summary(records) {
  const days = new Set(records.map((r) => r.date));
  let sets = 0, volume = 0;
  for (const r of records) {
    const s = recordStats(r);
    sets += s.nSets;
    volume += s.volume;
  }
  const last = [...days].sort().pop() || null;
  return { days: days.size, sets, volume: Math.round(volume), last };
}

// date -> total sets that day
export function setsPerDay(records) {
  const m = new Map();
  for (const r of records) m.set(r.date, (m.get(r.date) || 0) + r.sets.length);
  return m;
}

// Oldest first, each with stats and a pr flag when top weight beat every earlier session.
export function exerciseHistory(records, exerciseId) {
  let best = -Infinity;
  return records
    .filter((r) => r.exerciseId === exerciseId)
    .sort((a, b) => (a.date === b.date ? a.savedAt - b.savedAt : a.date < b.date ? -1 : 1))
    .map((r) => {
      const s = recordStats(r);
      const pr = s.top > best;
      if (pr) best = s.top;
      return { ...r, ...s, pr };
    });
}

// Exercise ids with records, most-logged first.
export function loggedExercises(records) {
  const n = new Map();
  for (const r of records) n.set(r.exerciseId, (n.get(r.exerciseId) || 0) + 1);
  return [...n].sort((a, b) => b[1] - a[1]).map(([id]) => id);
}

// Calendar month "YYYY-MM": leading nulls for the days before the 1st (Sunday-first week), then each date.
export function monthCells(ym) {
  const [y, m] = ym.split("-").map(Number);
  const lead = new Date(y, m - 1, 1).getDay();
  const n = new Date(y, m, 0).getDate();
  return [...Array(lead).fill(null), ...Array.from({ length: n }, (_, i) => `${ym}-${String(i + 1).padStart(2, "0")}`)];
}

export function shiftMonth(ym, delta) {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
