// Records dashboard (records.html): reads the same localStorage as the app, or a backup file for viewing elsewhere.
import { loadState, importJson } from "./store.js";
import { h, mount } from "./ui.js";
import { heatmap, chart } from "./charts.js";
import { summary, exerciseHistory, loggedExercises } from "./stats.js";

const root = document.getElementById("dash");
const storage = (() => { try { return window.localStorage; } catch { return { getItem: () => null }; } })();
let state = loadState(storage);
let fromFile = null; // file name when viewing a backup (view only, never saved)
let selected = null;

const fmt = (n) => n.toLocaleString("ko-KR");
const nameOf = (id) => {
  const ex = state.exercises.find((e) => e.id === id);
  return ex ? (ex.koName && ex.koName !== ex.name ? `${ex.name} (${ex.koName})` : ex.name) : id;
};

async function openFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  const next = importJson(await file.text());
  e.target.value = "";
  if (!next) { alert("올바른 백업 파일이 아닙니다"); return; }
  state = next;
  fromFile = file.name;
  selected = null;
  render();
}

function tile(k, v) {
  return h("div", { class: "tile" }, h("div", { class: "v" }, v), h("div", { class: "k" }, k));
}

function exercisePanel(ids) {
  if (!selected || !ids.includes(selected)) selected = ids[0];
  const hist = exerciseHistory(state.records, selected);
  const best = hist.reduce((a, r) => (r.top > a.top ? r : a), hist[0]);
  const sel = h("select", { class: "search", onchange: (e) => { selected = e.target.value; render(); } },
    ids.map((id) => h("option", { value: id, selected: id === selected }, nameOf(id))));
  return h("section", { class: "panel" },
    h("h2", {}, "운동별 진행"),
    sel,
    h("p", { class: "sub" }, `최고 ${best.top}kg (${best.date}) · 추정 1RM 최고 ${Math.max(...hist.map((r) => r.e1rm))}kg · ${hist.length}회 기록`),
    h("p", { class: "sub" }, "세션별 최고 중량 (kg)"),
    chart(hist),
    h("div", { class: "scroll" }, h("table", {},
      h("thead", {}, h("tr", {}, h("th", {}, "날짜"), h("th", { class: "hide-sm" }, "세트"), h("th", {}, "최고"), h("th", {}, "볼륨"), h("th", {}, "추정 1RM"))),
      h("tbody", {}, [...hist].reverse().map((r) => h("tr", {},
        h("td", {}, r.date, r.pr ? h("span", { class: "pr" }, "PR") : null),
        h("td", { class: "sets hide-sm" }, r.sets.map((s) => `${s.weight}×${s.reps}`).join(", ")),
        h("td", {}, `${r.top}kg`),
        h("td", {}, `${fmt(r.volume)}kg`),
        h("td", {}, `${r.e1rm}kg`)))))));
}

function recentDays(records) {
  const byDate = new Map();
  for (const r of [...records].sort((a, b) => b.savedAt - a.savedAt)) byDate.set(r.date, [...(byDate.get(r.date) || []), r]);
  const days = [...byDate].sort((a, b) => (a[0] < b[0] ? 1 : -1)).slice(0, 14);
  return h("section", { class: "panel" },
    h("h2", {}, "최근 운동한 날"),
    days.map(([date, list]) => h("div", { class: "day" },
      h("div", { class: "title" }, date),
      list.map((r) => h("div", { class: "sub" }, `${nameOf(r.exerciseId)} — ${r.sets.map((s) => `${s.weight}kg×${s.reps}`).join(", ")}`)))));
}

function render() {
  const recs = state.records;
  const s = summary(recs);
  const ids = loggedExercises(recs);
  mount(root,
    h("header", {},
      h("h1", {}, "기록 대시보드"),
      h("div", { class: "row2" },
        h("a", { class: "btn", href: "index.html" }, "앱으로"),
        h("label", { class: "btn" }, "백업 파일 열기", h("input", { type: "file", accept: "application/json,.json", hidden: true, onchange: openFile })))),
    fromFile ? h("p", { class: "sub" }, `백업 파일 보기: ${fromFile} (저장되지 않음)`) : null,
    recs.length === 0
      ? h("p", { class: "empty" }, "아직 기록이 없습니다. 다른 기기에서 보려면 앱의 '운동 관리 → 백업 내보내기' 파일을 열어주세요.")
      : [
          h("div", { class: "tiles" },
            tile("운동한 날", `${s.days}일`),
            tile("총 세트", fmt(s.sets)),
            tile("총 볼륨", `${fmt(s.volume)}kg`),
            tile("마지막 운동", s.last)),
          heatmap(recs),
          exercisePanel(ids),
          recentDays(recs),
        ],
  );
}

render();
// another tab (the app page) saved: re-read, unless viewing a backup file
window.addEventListener("storage", (e) => { if (e.key === "overload-v1" && !fromFile) { state = loadState(storage); render(); } });
