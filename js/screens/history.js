import { h, mount } from "../ui.js";
import { calendar } from "../charts.js";

const calView = { ym: null, day: null }; // keeps the picked month/day while moving between screens

export function render(root, ctx) {
  const st = ctx.getState();
  const names = new Map(st.exercises.map((e) => [e.id, e]));
  const nameOf = (id) => names.get(id)?.name || id;
  const recs = [...st.records].sort((a, b) => b.savedAt - a.savedAt);
  const byDate = new Map();
  for (const r of recs) byDate.set(r.date, [...(byDate.get(r.date) || []), r]);

  mount(root,
    h("header", {}, h("a", { class: "back", href: "#/" }, "←"), h("h1", {}, "기록")),
    byDate.size === 0 ? h("p", { class: "empty" }, "아직 기록이 없습니다.") : calendar(st.records, calView, nameOf, { compact: true }),
    h("a", { class: "btn", href: "records.html" }, "기록 대시보드 (그래프·통계)"),
    ...[...byDate].map(([date, list]) =>
      h("section", {}, h("h2", {}, date), list.map((r) =>
        h("div", { class: "card" },
          h("div", { class: "title" }, nameOf(r.exerciseId)),
          h("div", { class: "sub" }, r.sets.map((s) => `${s.weight}kg × ${s.reps}`).join("  ·  ")))))),
  );
}
