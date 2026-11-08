import { bodyIconSvg } from "./bodyicon.js";

export function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === "class") el.className = v;
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else if (k === "value" || k === "checked") el[k] = v;
    else if (v === true) el.setAttribute(k, "");
    else el.setAttribute(k, v);
  }
  for (const kid of kids.flat()) {
    if (kid == null || kid === false) continue;
    el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  }
  return el;
}

// English name first, Korean name beneath it (when different).
export function exName(ex) {
  const ko = ex.koName && ex.koName !== ex.name ? h("small", { class: "ko" }, ex.koName) : null;
  return [ex.name, ko];
}

export function icon(part) {
  const el = document.createElement("span");
  el.className = "icon";
  el.innerHTML = bodyIconSvg(part);
  return el;
}

export function todayStr() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
