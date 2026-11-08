import { h, exName, todayStr, mount } from "../ui.js";
import { lastRecord, addRecord } from "../store.js";
import { recommendNextWeight } from "../recommend.js";
import { createTimer, beep } from "../timer.js";

function summary(sets) {
  const ws = [...new Set(sets.map((s) => s.weight))];
  return ws.length === 1
    ? `${ws[0]}kg × ${sets.map((s) => s.reps).join("/")}`
    : sets.map((s) => `${s.weight}×${s.reps}`).join(" / ");
}

export function render(root, ctx) {
  const id = decodeURIComponent(ctx.params[0] || "");
  const st = ctx.getState();
  const ex = st.exercises.find((e) => e.id === id);
  if (!ex) { ctx.navigate("#/"); return; }

  const last = lastRecord(st, id);
  const rec = last ? recommendNextWeight(last.sets, ex) : null;
  const startWeight = rec ?? "";

  const timer = createTimer(Date.now);
  let wasRunning = false;
  const timerEl = h("div", { class: "timer", hidden: true });
  const rows = [];
  const list = h("div", { class: "sets" });

  function addRow(weight) {
    const n = rows.length + 1;
    const w = h("input", { class: "num", type: "text", inputmode: "decimal", placeholder: "kg", value: weight === "" ? "" : String(weight) });
    const r = h("input", { class: "num", type: "text", inputmode: "numeric", placeholder: "회", value: "" });
    const d = h("input", {
      type: "checkbox", class: "done", "aria-label": `세트 ${n} 완료`,
      onchange: (e) => { if (e.target.checked) timer.start(ex.restSeconds); else timer.stop(); tick(); },
    });
    rows.push({ w, r });
    list.append(h("div", { class: "set" }, h("span", { class: "n" }, `세트${n}`), w, h("span", {}, "kg"), r, h("span", {}, "회"), d));
  }

  function tick() {
    const rem = timer.remaining();
    if (rem > 0) {
      wasRunning = true;
      timerEl.hidden = false;
      timerEl.textContent = `휴식 ${Math.floor(rem / 60)}:${String(rem % 60).padStart(2, "0")}`;
    } else if (wasRunning) {
      wasRunning = false;
      beep();
      timerEl.hidden = false;
      timerEl.textContent = "휴식 끝!";
    } else {
      timerEl.hidden = true;
    }
  }

  function save() {
    const sets = rows.map((x) => ({
      weight: parseFloat(x.w.value.replace(",", ".")),
      reps: parseInt(x.r.value, 10),
    }));
    const cur = ctx.getState();
    const next = addRecord(cur, { exerciseId: id, date: todayStr(), sets }, Date.now());
    if (next === cur) { alert("입력된 세트가 없습니다"); return; }
    ctx.setState(next);
    ctx.navigate("#/");
  }

  for (let i = 0; i < 4; i++) addRow(startWeight);

  mount(root, 
    h("header", {}, h("a", { class: "back", href: "#/" }, "←"), h("h1", {}, exName(ex))),
    h("p", { class: "rec" }, rec == null ? "추천 무게 없음 (첫 기록)" : ["오늘 추천: ", h("b", {}, `${rec} kg`)]),
    last ? h("p", { class: "sub" }, `지난번 ${summary(last.sets)}`) : null,
    list,
    h("div", { class: "row2" },
      h("button", { class: "btn", onclick: () => addRow(rows.length ? rows[rows.length - 1].w.value : startWeight) }, "+ 세트"),
      h("button", { class: "btn primary", onclick: save }, "저장")),
    timerEl,
  );

  const iv = setInterval(tick, 250);
  const onVis = () => tick();
  document.addEventListener("visibilitychange", onVis);
  let lock = null;
  try { navigator.wakeLock?.request("screen").then((l) => { lock = l; }).catch(() => {}); } catch {}

  return () => {
    clearInterval(iv);
    document.removeEventListener("visibilitychange", onVis);
    try { lock?.release(); } catch {}
  };
}
