import { h } from "../ui.js";
import { filterCatalog, bodyParts } from "../catalog.js";
import { bodyPartLabel } from "../i18n.js";
import { defaultSettings } from "../recommend.js";

const PAGE = 60;

export function render(root, ctx) {
  let part = "all";
  let query = "";
  let shown = PAGE;

  const input = h("input", {
    type: "search", class: "search", placeholder: "운동 검색 (영어 / 한국어)",
    oninput: (e) => { query = e.target.value; shown = PAGE; draw(); },
  });
  const chips = h("div", { class: "chips" });
  const list = h("div", { class: "pick-list" });

  function pick(it) {
    const st = ctx.getState();
    const exercises = st.exercises.some((e) => e.id === it.id)
      ? st.exercises
      : [...st.exercises, { id: it.id, name: it.name, koName: it.koName, equipment: it.equipment, ...defaultSettings(it.equipment) }];
    const ids = st.today.exerciseIds.includes(it.id) ? st.today.exerciseIds : [...st.today.exerciseIds, it.id];
    ctx.setState({ ...st, exercises, today: { ...st.today, exerciseIds: ids } });
    ctx.navigate("#/");
  }

  function drawChips() {
    chips.replaceChildren(...["all", ...bodyParts(ctx.catalog)].map((p) =>
      h("button", { class: "chip" + (p === part ? " on" : ""), onclick: () => { part = p; shown = PAGE; draw(); } },
        p === "all" ? "전체" : bodyPartLabel(p))));
  }

  function draw() {
    drawChips();
    const found = filterCatalog(ctx.catalog, { bodyPart: part, query });
    const rows = found.slice(0, shown).map((it) =>
      h("button", { class: "card row pick", onclick: () => pick(it) },
        h("img", { src: it.image, alt: "", loading: "lazy", width: 80, height: 54 }),
        h("div", {}, h("div", { class: "title" }, it.name), h("small", { class: "ko" }, it.koName))));
    list.replaceChildren(
      ...rows,
      found.length === 0 ? h("p", { class: "empty" }, ctx.catalogError ? "운동 목록을 불러오지 못했습니다." : "검색 결과가 없습니다.") : null,
      found.length > shown ? h("button", { class: "btn", onclick: () => { shown += PAGE; draw(); } }, `더 보기 (${found.length - shown}개 남음)`) : null,
    );
  }

  root.replaceChildren(
    h("header", {}, h("a", { class: "back", href: "#/" }, "←"), h("h1", {}, "운동 추가")),
    input, chips, list,
  );
  draw();
}
