export const BODY_PART_KO = {
  abdominals: "복근",
  abductors: "외전근(엉덩이 옆)",
  adductors: "내전근(허벅지 안쪽)",
  biceps: "이두",
  calves: "종아리",
  chest: "가슴",
  forearms: "전완",
  glutes: "둔근",
  hamstrings: "햄스트링",
  lats: "광배근",
  "lower back": "허리",
  "middle back": "등 중부",
  neck: "목",
  quadriceps: "대퇴사두",
  shoulders: "어깨",
  traps: "승모근",
  triceps: "삼두",
};

export function bodyPartLabel(key) {
  return BODY_PART_KO[key] ?? key;
}
