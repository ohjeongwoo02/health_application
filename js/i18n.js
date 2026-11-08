export const BODY_PART_KO = {
  chest: "가슴",
  back: "등",
  shoulders: "어깨",
  upper_arms: "팔(이두·삼두)",
  lower_arms: "전완",
  core: "복근·코어",
  upper_legs: "하체(허벅지·엉덩이)",
  lower_legs: "종아리",
  full_body: "전신",
};

export function bodyPartLabel(key) {
  return BODY_PART_KO[key] ?? key;
}
