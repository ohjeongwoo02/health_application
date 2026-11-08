import { h, mount } from "../ui.js";

export function render(root, ctx) {
  const st = ctx.getState();
  const names = new Map(st.exercises.map((e) => [e.id, e]));
  const recs = [...st.records].sort((a, b) => b.savedAt - a.savedAt);
  const byDate = new Map();
  for (const r of recs) byDate.set(r.date, [...(byDate.get(r.date) || []), r]);

  mount(root, 
    h("header", {}, h("a", { class: "back", href: "#/" }, "←"), h("h1", {}, "기록")),
    byDate.size === 0 ? h("p", { class: "empty" }, "아직 기록이 없습니다.") : null,
    ...[...byDate].map(([date, list]) =>
      h("section", {}, h("h2", {}, date), list.map((r) => {
        const ex = names.get(r.exerciseId);
        return h("div", { class: "card" },
          h("div", { class: "title" }, ex ? ex.name : r.exerciseId),
          h("div", { class: "sub" }, r.sets.map((s) => `${s.weight}kg × ${s.reps}`).join("  ·  ")));
      }))),
  );
}
