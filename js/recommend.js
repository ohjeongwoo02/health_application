const round = (x) => Math.round(x * 100) / 100;

export function cleanSets(sets) {
  return (sets || []).filter(
    (s) =>
      s &&
      Number.isFinite(s.weight) &&
      Number.isFinite(s.reps) &&
      s.weight > 0 &&
      s.reps > 0,
  );
}

export function recommendNextWeight(sets, s) {
  const valid = cleanSets(sets);
  if (valid.length === 0) return null;
  const w = Math.max(...valid.map((x) => x.weight));
  const hit = valid.filter((x) => x.weight === w && x.reps >= s.targetReps).length;
  return round(hit >= s.qualifyingSets ? w + s.increment : w);
}

export function defaultSettings(equipment) {
  return {
    targetReps: 12,
    increment: equipment === "dumbbell" ? 2 : 5,
    qualifyingSets: 3,
    restSeconds: 90,
  };
}
