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
let catalog = [];
let catalogError = false;
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
  get catalog() { return catalog; },
  get catalogError() { return catalogError; },
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

try { catalog = await loadCatalog(fetch); } catch { catalogError = true; }
route();
