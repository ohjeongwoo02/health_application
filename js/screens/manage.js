import { h, exName } from "../ui.js";
import { defaultSettings } from "../recommend.js";
import { exportJson, importJson } from "../store.js";

const FIELDS = [
  ["targetReps", "목표 횟수", 1, true],
  ["increment", "증량 폭(kg)", 0.01, false],
  ["qualifyingSets", "기준 세트 수", 1, true],
  ["restSeconds", "휴식(초)", 1, true],
];

export function render(root, ctx) {
  function update(id, key, el, int) {
    const v = int ? parseInt(el.value, 10) : parseFloat(el.value.replace(",", "."));
    const st = ctx.getState();
    const ex = st.exercises.find((e) => e.id === id);
    if (!Number.isFinite(v) || v <= 0) { el.value = ex[key]; return; }
    ctx.setState({ ...st, exercises: st.exercises.map((e) => (e.id === id ? { ...e, [key]: v } : e)) });
  }

  function exerciseCard(ex) {
    return h("div", { class: "card" },
      h("div", { class: "title" }, exName(ex)),
      h("div", { class: "grid" }, FIELDS.map(([key, label, , int]) =>
        h("label", {}, label,
          h("input", { class: "num", type: "text", inputmode: "decimal", value: String(ex[key]), onchange: (e) => update(ex.id, key, e.target, int) })))));
  }

  const name = h("input", { class: "search", placeholder: "새 운동 이름" });
  const dump = h("textarea", { class: "dump", rows: 4, readonly: true, hidden: true });

  function addCustom() {
    const n = name.value.trim();
    if (!n) return;
    const st = ctx.getState();
    ctx.setState({ ...st, exercises: [...st.exercises, { id: `custom-${Date.now()}`, name: n, equipment: "other", ...defaultSettings() }] });
    render(root, ctx);
  }

  function doExport() {
    const text = exportJson(ctx.getState());
    dump.value = text;
    dump.hidden = false;
    try {
      const a = h("a", { href: URL.createObjectURL(new Blob([text], { type: "application/json" })), download: `overload-backup-${new Date().toISOString().slice(0, 10)}.json` });
      document.body.append(a); a.click(); a.remove();
    } catch {}
  }

  async function doImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const next = importJson(await file.text());
    e.target.value = "";
    if (!next) { alert("올바른 백업 파일이 아닙니다"); return; }
    if (!confirm("현재 기록을 이 백업으로 교체할까요?")) return;
    ctx.setState(next);
    ctx.navigate("#/");
  }

  const exs = ctx.getState().exercises;
  root.replaceChildren(
    h("header", {}, h("a", { class: "back", href: "#/" }, "←"), h("h1", {}, "운동 관리")),
    ...(exs.length ? exs.map((ex) => exerciseCard(ex)) : [h("p", { class: "empty" }, "등록된 운동이 없습니다.")]),
    h("h2", {}, "새 운동 직접 만들기"),
    name,
    h("button", { class: "btn", onclick: addCustom }, "+ 새 운동"),
    h("h2", {}, "백업"),
    h("p", { class: "sub" }, "사파리 데이터를 지우면 기록이 사라집니다. 가끔 백업하세요."),
    h("div", { class: "row2" },
      h("button", { class: "btn", onclick: doExport }, "백업 내보내기"),
      h("label", { class: "btn" }, "가져오기", h("input", { type: "file", accept: "application/json,.json", hidden: true, onchange: doImport }))),
    dump,
    h("p", { class: "sub credit" }, "운동 이미지: ", h("a", { href: "https://repdb.co", target: "_blank", rel: "nofollow noopener" }, "Exercise data by RepDB (repdb.co)")),
  );
}
