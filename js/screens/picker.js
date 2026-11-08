import { h, thumb, mount } from "../ui.js";
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
  let catalog = [];
  let status = "loading";

  function pick(it) {
    const st = ctx.getState();
    const exercises = st.exercises.some((e) => e.id === it.id)
      ? st.exercises
      : [...st.exercises, { id: it.id, name: it.name, koName: it.koName, equipment: it.equipment, bodyPart: it.bodyPart, iconPart: it.iconPart, repdb: it.repdb, ...defaultSettings(it.equipment) }];
    const ids = st.today.exerciseIds.includes(it.id) ? st.today.exerciseIds : [...st.today.exerciseIds, it.id];
    ctx.setState({ ...st, exercises, today: { ...st.today, exerciseIds: ids } });
    ctx.navigate("#/");
  }

  function drawChips() {
    mount(chips, ...["all", ...bodyParts(catalog)].map((p) =>
      h("button", { class: "chip" + (p === part ? " on" : ""), onclick: () => { part = p; shown = PAGE; draw(); } },
        p === "all" ? "전체" : bodyPartLabel(p))));
  }

  function draw() {
    drawChips();
    const found = filterCatalog(catalog, { bodyPart: part, query });
    const rows = found.slice(0, shown).map((it) =>
      h("button", { class: "card row pick", onclick: () => pick(it) },
        thumb(it),
        h("div", {}, h("div", { class: "title" }, it.name), h("small", { class: "ko" }, it.koName))));
    mount(list, 
      ...rows,
      found.length === 0 ? h("p", { class: "empty" }, status === "loading" ? "운동 목록을 불러오는 중…" : status === "error" ? "운동 목록을 불러오지 못했습니다. 인터넷 연결을 확인해 주세요." : "검색 결과가 없습니다.") : null,
      found.length > shown ? h("button", { class: "btn", onclick: () => { shown += PAGE; draw(); } }, `더 보기 (${found.length - shown}개 남음)`) : null,
    );
  }

  mount(root, 
    h("header", {}, h("a", { class: "back", href: "#/" }, "←"), h("h1", {}, "운동 추가")),
    input, chips, list,
  );
  draw();
  ctx.getCatalog().then((items) => { catalog = items; status = "ok"; draw(); }).catch(() => { status = "error"; draw(); });
}
