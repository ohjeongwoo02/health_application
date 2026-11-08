import { koName } from "./ko.js";

export const REPDB_URL = "https://exercise-dataset.com/exercises.json";

// RepDB primary muscle -> our body-silhouette icon
export const ICON_BY_MUSCLE = {
  hip_flexors: "quadriceps", quadriceps: "quadriceps", hamstrings: "hamstrings",
  rectus_abdominis: "abdominals", transverse_abdominis: "abdominals", obliques: "abdominals",
  latissimus_dorsi: "lats", rhomboids: "middle back", trapezius: "traps",
  erector_spinae: "lower back", quadratus_lumborum: "lower back",
  pectoralis_major: "chest",
  anterior_deltoid: "shoulders", lateral_deltoid: "shoulders", posterior_deltoid: "shoulders", infraspinatus_teres_minor: "shoulders",
  triceps_brachii: "triceps", biceps_brachii: "biceps", brachialis: "biceps",
  forearm_flexors: "forearms", forearm_extensors: "forearms", brachioradialis: "forearms",
  gluteus_maximus: "glutes", gluteus_medius: "glutes",
  gastrocnemius: "calves", soleus: "calves", tibialis_anterior: "calves",
  adductors: "adductors", abductors: "abductors",
};

// Convert RepDB exercise records (loaded at runtime, never stored in this repo) to catalog items.
export function fromRepdb(records) {
  return records.map((r) => {
    const f = r.images && r.images.flat;
    const file = f ? f.peak || f.main || f.start : "";
    const item = {
      id: r.id,
      name: r.name_en,
      koName: koName(r.name_en),
      bodyPart: r.body_part,
      iconPart: ICON_BY_MUSCLE[(r.primary_muscles || [])[0]],
      equipment: /dumbbell|\bdb\b/i.test(r.name_en) ? "dumbbell" : "other",
    };
    if (file) item.repdb = file.replace("images/flat/", "").replace(".webp", "");
    return item;
  });
}
