// Desktop records viewer (desktop.html): same data as records.html (localStorage or a backup file), wide master-detail layout.
import { loadState, importJson } from "./store.js";
import { h, mount } from "./ui.js";
import { heatmap, chart, calendar } from "./charts.js";
import { summary, recordStats, exerciseHistory, loggedExercises } from "./stats.js";

const root = document.getElementById("dt");
const storage = (() => { try { return window.localStorage; } catch { return { getItem: () => null }; } })();
let state = loadState(storage);
let fromFile = null; // backup file name (view only, never saved)
let selected = null; // exercise id, null = all
let query = "";
let cloud = null; // set when sync.js loads; while signed in, data comes from the cloud instead of localStorage
const calView = { ym: null, day: null };

const fmt = (n) => n.toLocaleString("ko-KR");
const nameOf = (id) => {
  const ex = state.exercises.find((e) => e.id === id);
  return ex ? (ex.koName && ex.koName !== ex.name ? `${ex.name} (${ex.koName})` : ex.name) : id;
};
const tile = (k, v) => h("div", { class: "tile" }, h("div", { class: "v" }, v), h("div", { class: "k" }, k));

async function openFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  const next = importJson(await file.text());
  e.target.value = "";
  if (!next) { alert("올바른 백업 파일이 아닙니다"); return; }
  state = next; fromFile = file.name; selected = null;
  render();
}

function logTable(recs) {
  const rows = [...recs].sort((a, b) => (a.date === b.date ? b.savedAt - a.savedAt : a.date < b.date ? 1 : -1));
  return h("div", { class: "tablewrap" }, h("table", {},
    h("thead", {}, h("tr", {}, ["날짜", "운동", "세트", "최고", "볼륨", "추정 1RM"].map((t) => h("th", {}, t)))),
    h("tbody", {}, rows.map((r) => {
      const s = recordStats(r);
      return h("tr", {},
        h("td", {}, r.date), h("td", {}, nameOf(r.exerciseId)),
        h("td", { class: "sets" }, r.sets.map((x) => `${x.weight}×${x.reps}`).join(", ")),
        h("td", {}, `${s.top}kg`), h("td", {}, `${fmt(s.volume)}kg`), h("td", {}, `${s.e1rm}kg`));
    }))));
}

function render() {
  const all = state.records;
  const ids = loggedExercises(all);
  if (selected && !ids.includes(selected)) selected = null;
  const q = query.trim().toLowerCase();
  const shownIds = ids.filter((id) => nameOf(id).toLowerCase().includes(q));
  const recs = selected ? all.filter((r) => r.exerciseId === selected) : all;
  const s = summary(recs);
  const count = (id) => all.filter((r) => r.exerciseId === id).length;
  const item = (id, label, n) => h("button", { class: "item", "aria-current": String(selected === id), onclick: () => { selected = id; render(); } }, h("span", {}, label), h("span", {}, n));
  const search = h("input", { class: "search", placeholder: "운동 검색", value: query, oninput: (e) => { query = e.target.value; render(); const i = root.querySelector("input.search"); i.focus(); i.setSelectionRange(query.length, query.length); } });
  mount(root,
    h("div", { class: "topbar" },
      h("a", { class: "brand", href: "index.html" }, "운동 기록."),
      h("div", { class: "acts" },
        cloud?.user ? h("span", { class: "sub" }, cloud.user.email) : null,
        cloud ? h("button", { class: cloud.user ? "btn" : "btn primary", onclick: cloud.user ? cloud.signOut : cloud.signIn }, cloud.user ? "로그아웃" : "Google 로그인 (휴대폰 기록 연동)") : null,
        h("label", { class: "btn" }, "백업 파일 열기", h("input", { type: "file", accept: "application/json,.json", hidden: true, onchange: openFile })))),
    h("aside", {},
      fromFile ? h("p", { class: "sub" }, `백업 파일: ${fromFile} (저장되지 않음)`) : null,
      search,
      h("div", { class: "list" }, item(null, "전체", all.length), shownIds.map((id) => item(id, nameOf(id), count(id))))),
    h("main", {},
      all.length === 0
        ? h("p", { class: "empty" }, cloud && !cloud.user
          ? "휴대폰 앱의 '운동 관리 → PC 연동'에서 로그인한 Google 계정으로 오른쪽 위에서 로그인하세요."
          : "기록이 없습니다. 휴대폰 앱의 '운동 관리 → 백업 내보내기' 파일을 열어도 됩니다.")
        : [
            h("div", { class: "tiles" }, tile("운동한 날", `${s.days}일`), tile("총 세트", fmt(s.sets)), tile("총 볼륨", `${fmt(s.volume)}kg`), tile("마지막 운동", s.last)),
            calendar(recs, calView, nameOf),
            heatmap(recs, 52),
            selected ? h("section", { class: "panel" }, h("h2", {}, `${nameOf(selected)} · 세션별 최고 중량 (kg)`), chart(exerciseHistory(all, selected))) : null,
            h("section", { class: "panel" }, h("h2", {}, `전체 기록 ${recs.length}건`), logTable(recs)),
          ]));
}

render();
// another tab (the app page) saved: re-read, unless viewing a backup file
window.addEventListener("storage", (e) => { if (e.key === "overload-v1" && !fromFile && !cloud?.user) { state = loadState(storage); render(); } });
import("./sync.js").then((m) => {
  cloud = m.cloud;
  m.watch((st) => { if (!fromFile) state = st || loadState(storage); render(); });
  render();
}).catch(() => {});
