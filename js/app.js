import { loadState, saveState } from "./store.js";
import { loadCatalog } from "./catalog.js";
import { todayStr } from "./ui.js";
import * as today from "./screens/today.js";
import * as picker from "./screens/picker.js";
import * as session from "./screens/session.js";
import * as manage from "./screens/manage.js";
import * as history from "./screens/history.js";

const storage = (() => {
  try { return window.localStorage; } catch { return { getItem: () => null, setItem() {} }; }
})();

let state = loadState(storage);
let catalogPromise = null;
let cleanup = null;

function rollDay() {
  const d = todayStr();
  if (state.today.date !== d) state = { ...state, today: { date: d, exerciseIds: [] } };
}

const ctx = {
  getState: () => state,
  setState(next) {
    state = next;
    try { saveState(storage, state); } catch (e) { console.error("save failed", e); }
  },
  navigate(hash) {
    if (location.hash === hash) route(); else location.hash = hash;
  },
  // RepDB exercise list: loaded on first use (2.6MB), then cached by the service worker.
  getCatalog() {
    if (!catalogPromise) catalogPromise = loadCatalog(fetch).catch((e) => { catalogPromise = null; throw e; });
    return catalogPromise;
  },
  params: [],
};

const routes = { "": today, pick: picker, session, manage, history };

function route() {
  if (typeof cleanup === "function") cleanup();
  cleanup = null;
  rollDay();
  const [name = "", ...params] = location.hash.replace(/^#\/?/, "").split("/");
  const screen = routes[name] || today;
  const root = document.getElementById("app");
  window.scrollTo(0, 0);
  cleanup = screen.render(root, { ...ctx, params });
}

window.addEventListener("hashchange", route);

route();
