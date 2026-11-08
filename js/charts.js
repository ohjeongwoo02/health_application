// Heatmap and line chart shared by records.html and desktop.html.
import { h, todayStr } from "./ui.js";
import { setsPerDay, monthCells, shiftMonth } from "./stats.js";

const fmt = (n) => n.toLocaleString("ko-KR");

// N weeks ending this week, columns = weeks, rows = Sun..Sat.
export function heatmap(records, weeks = 26) {
  const per = setsPerDay(records);
  const end = new Date(todayStr() + "T00:00:00");
  const start = new Date(end);
  start.setDate(end.getDate() - end.getDay() - (weeks - 1) * 7);
  const p = (n) => String(n).padStart(2, "0");
  const cells = [];
  for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
    const n = per.get(key) || 0;
    const l = n === 0 ? 0 : n < 5 ? 1 : n < 10 ? 2 : n < 15 ? 3 : 4;
    cells.push(h("span", { "data-l": l, title: `${key} · ${n}세트`, "aria-label": `${key} ${n}세트` }));
  }
  const levels = [0, 1, 2, 3, 4].map((l) => h("span", { "data-l": l }));
  return h("section", { class: "panel" },
    h("h2", {}, `최근 ${weeks === 26 ? "6개월" : "1년"} 운동일`),
    h("div", { class: "heat" }, cells),
    h("div", { class: "legend" }, "적음", levels, "많음"));
}

// Top-set weight per session, single series, with a crosshair tooltip.
export function chart(hist) {
  const W = 640, H = 240, L = 40, R = 12, T = 14, B = 26;
  const wrap = h("div", { class: "chart" });
  if (hist.length < 2) {
    wrap.append(h("p", { class: "empty" }, "기록이 2번 이상 쌓이면 그래프가 보입니다."));
    return wrap;
  }
  const ys = hist.map((x) => x.top);
  let lo = Math.min(...ys), hi = Math.max(...ys);
  const pad = Math.max((hi - lo) * 0.15, 2.5);
  lo = Math.max(0, lo - pad); hi += pad;
  const x = (i) => L + (i * (W - L - R)) / (hist.length - 1);
  const y = (v) => T + ((hi - v) * (H - T - B)) / (hi - lo);
  const ticks = [0, 1, 2, 3].map((i) => lo + ((hi - lo) * i) / 3);
  const lbl = [0, Math.floor((hist.length - 1) / 2), hist.length - 1];
  const svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="세션별 최고 중량">
    ${ticks.map((t) => `<line class="grid" x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}"/><text class="axis" x="${L - 6}" y="${y(t) + 4}" text-anchor="end">${Math.round(t)}</text>`).join("")}
    ${lbl.map((i) => `<text class="axis" x="${x(i)}" y="${H - 6}" text-anchor="${i === 0 ? "start" : i === hist.length - 1 ? "end" : "middle"}">${hist[i].date.slice(5)}</text>`).join("")}
    <polyline class="line" points="${hist.map((r, i) => `${x(i)},${y(r.top)}`).join(" ")}"/>
    <line class="cross" y1="${T}" y2="${H - B}" visibility="hidden"/>
    <circle class="dot" r="5" visibility="hidden"/>
  </svg>`;
  wrap.innerHTML = svg;
  const tip = h("div", { class: "tip", hidden: true });
  wrap.append(tip);
  const el = wrap.querySelector("svg"), cross = el.querySelector(".cross"), dot = el.querySelector(".dot");
  const show = (ev) => {
    const box = el.getBoundingClientRect();
    const vx = ((ev.clientX - box.left) / box.width) * W;
    const i = Math.max(0, Math.min(hist.length - 1, Math.round(((vx - L) / (W - L - R)) * (hist.length - 1))));
    const r = hist[i];
    cross.setAttribute("x1", x(i)); cross.setAttribute("x2", x(i)); cross.setAttribute("visibility", "visible");
    dot.setAttribute("cx", x(i)); dot.setAttribute("cy", y(r.top)); dot.setAttribute("visibility", "visible");
    tip.textContent = `${r.date} · ${r.top}kg · ${r.nSets}세트 · 볼륨 ${fmt(r.volume)}kg`;
    tip.style.left = `${(x(i) / W) * box.width}px`;
    tip.style.top = `${(y(r.top) / H) * box.height}px`;
    tip.hidden = false;
  };
  const hide = () => { tip.hidden = true; cross.setAttribute("visibility", "hidden"); dot.setAttribute("visibility", "hidden"); };
  el.addEventListener("pointermove", show);
  el.addEventListener("pointerdown", show);
  el.addEventListener("pointerleave", hide);
  return wrap;
}

// Month calendar + the picked day's workouts. view = { ym, day } belongs to the caller so it survives re-renders.
// compact (phone): a dot instead of "N종목" in each day, detail below instead of beside.
export function calendar(records, view, nameOf, { compact = false } = {}) {
  const byDay = new Map();
  for (const r of records) byDay.set(r.date, [...(byDay.get(r.date) || []), r]);
  const kinds = (list) => new Set(list.map((r) => r.exerciseId)).size;
  if (!view.day) { const t = todayStr(); view.day = byDay.has(t) ? t : [...byDay.keys()].sort().pop() || t; }
  if (!view.ym) view.ym = view.day.slice(0, 7);
  const wrap = h("div", { class: compact ? "cal compact" : "cal" });
  const go = (patch) => { Object.assign(view, patch); draw(); };

  function draw() {
    const today = todayStr();
    const [y, m] = view.ym.split("-");
    const cells = monthCells(view.ym).map((d) => {
      if (!d) return h("span", {});
      const n = kinds(byDay.get(d) || []);
      return h("button", {
        class: `cal-d${n ? " has" : ""}${d === today ? " today" : ""}`,
        "aria-pressed": String(d === view.day), "aria-label": n ? `${d} ${n}종목` : d,
        onclick: () => go({ day: d }),
      }, h("b", {}, String(+d.slice(8))), n ? h("i", {}, compact ? null : `${n}종목`) : null);
    });
    const list = [...(byDay.get(view.day) || [])].sort((a, b) => a.savedAt - b.savedAt);
    const [, dm, dd] = view.day.split("-");
    wrap.replaceChildren(
      h("section", { class: "panel" },
        h("div", { class: "cal-head" },
          h("h2", {}, `${y}년 ${+m}월`),
          h("div", {},
            h("button", { class: "cal-nav", "aria-label": "이전 달", onclick: () => go({ ym: shiftMonth(view.ym, -1) }) }, "‹"),
            h("button", { class: "cal-nav", "aria-label": "다음 달", onclick: () => go({ ym: shiftMonth(view.ym, 1) }) }, "›"))),
        h("div", { class: "cal-grid" }, ["일", "월", "화", "수", "목", "금", "토"].map((d) => h("span", { class: "cal-dow" }, d)), cells)),
      h("section", { class: "panel cal-detail" },
        h("h2", {}, `${+dm}월 ${+dd}일`),
        h("p", { class: "sub" }, list.length ? `${kinds(list)}종목 · ${list.reduce((a, r) => a + r.sets.length, 0)}세트` : "운동 기록 없음"),
        list.map((r) => h("div", { class: "cal-ex" },
          h("div", { class: "title" }, nameOf(r.exerciseId)),
          h("div", { class: "sub" }, r.sets.map((s) => `${s.weight}kg × ${s.reps}`).join(" · "))))));
  }
  draw();
  return wrap;
}
