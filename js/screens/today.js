import { h, exName, icon } from "../ui.js";
import { lastRecord } from "../store.js";
import { recommendNextWeight } from "../recommend.js";

export function render(root, ctx) {
  const st = ctx.getState();
  const list = st.today.exerciseIds.map((id) => st.exercises.find((e) => e.id === id)).filter(Boolean);
  root.replaceChildren(
    h("header", {}, h("h1", {}, "오늘 운동"), h("p", { class: "sub" }, st.today.date)),
    ...list.map((ex) => {
      const last = lastRecord(st, ex.id);
      const rec = last ? recommendNextWeight(last.sets, ex) : null;
      return h("a", { class: "card row", href: `#/session/${encodeURIComponent(ex.id)}` },
        icon(ex.bodyPart),
        h("div", { class: "grow" },
          h("div", { class: "title" }, exName(ex)),
          h("div", { class: "sub" }, rec == null ? "기록 없음" : `다음 추천: ${rec} kg`)),
        h("span", { class: "chev" }, "›"));
    }),
    list.length ? null : h("p", { class: "empty" }, "아직 고른 운동이 없습니다."),
    h("a", { class: "btn dashed", href: "#/pick" }, "+ 운동 추가"),
    h("nav", { class: "bar" },
      h("a", { class: "btn", href: "#/manage" }, "운동 관리"),
      h("a", { class: "btn", href: "#/history" }, "기록")),
  );
}
