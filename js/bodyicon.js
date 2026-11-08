// Simple body silhouette with the worked muscle highlighted. Pure string output.
const r = (x, y, w, h, rx = 2) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/>`;
const c = (cx, cy, rad) => `<circle cx="${cx}" cy="${cy}" r="${rad}"/>`;
const p = (pts) => `<polygon points="${pts}" stroke-linejoin="round"/>`;

const BODY = [
  c(30, 8, 6), r(27, 13, 6, 5, 2),
  p("14,18 46,18 41,52 19,52"), p("19,52 41,52 43,61 17,61"),
  r(6, 18, 8, 22, 4), r(6, 41, 7, 20, 3.5), r(46, 18, 8, 22, 4), r(47, 41, 7, 20, 3.5),
  r(17, 61, 12, 24, 5), r(18, 86, 9, 14, 4), r(31, 61, 12, 24, 5), r(33, 86, 9, 14, 4),
].join("");

// view: "front" | "back" (only used as a small caption), shapes: highlighted parts
const MUSCLES = {
  chest: ["front", [p("16,20 44,20 43,33 17,33")]],
  shoulders: ["front", [c(12, 21, 6), c(48, 21, 6)]],
  biceps: ["front", [r(6, 22, 8, 15, 4), r(46, 22, 8, 15, 4)]],
  forearms: ["front", [r(6, 41, 7, 20, 3.5), r(47, 41, 7, 20, 3.5)]],
  abdominals: ["front", [r(22, 34, 16, 18, 4)]],
  quadriceps: ["front", [r(17, 62, 12, 22, 5), r(31, 62, 12, 22, 5)]],
  adductors: ["front", [r(25, 62, 4, 20, 2), r(31, 62, 4, 20, 2)]],
  neck: ["front", [r(27, 13, 6, 5, 2)]],
  traps: ["back", [p("26,14 34,14 46,23 30,36 14,23")]],
  lats: ["back", [p("15,26 28,34 26,47 20,47"), p("45,26 32,34 34,47 40,47")]],
  "middle back": ["back", [r(23, 27, 14, 12, 3)]],
  "lower back": ["back", [r(23, 40, 14, 12, 3)]],
  triceps: ["back", [r(6, 22, 8, 18, 4), r(46, 22, 8, 18, 4)]],
  glutes: ["back", [c(24, 58, 7), c(36, 58, 7)]],
  hamstrings: ["back", [r(17, 62, 12, 22, 5), r(31, 62, 12, 22, 5)]],
  calves: ["back", [r(18, 86, 9, 14, 4), r(33, 86, 9, 14, 4)]],
  abductors: ["back", [r(14, 54, 6, 12, 3), r(40, 54, 6, 12, 3)]],
};

export const ICON_PARTS = Object.keys(MUSCLES);

export function bodyIconSvg(part) {
  const m = MUSCLES[part];
  const hl = m ? `<g class="hl" fill="var(--accent)">${m[1].join("")}</g>` : "";
  const label = m ? (m[0] === "back" ? "뒷면" : "앞면") : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" class="body-icon" viewBox="0 0 60 100" role="img" aria-label="${label}"><g fill="var(--line)">${BODY}</g>${hl}</svg>`;
}
