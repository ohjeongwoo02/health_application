const CACHE = "overload-v9";
const REPDB = "https://exercise-dataset.com/exercises.json";
const SHELL = [
  "./", "index.html", "records.html", "desktop.html", "manifest.webmanifest", "css/app.css", "css/dash.css",
  "js/app.js", "js/store.js", "js/recommend.js", "js/catalog.js", "js/timer.js", "js/i18n.js", "js/ui.js", "js/bodyicon.js", "js/repdb.js", "js/ko.js", "js/stats.js", "js/records.js", "js/charts.js", "js/desktop.js",
  "js/screens/today.js", "js/screens/picker.js", "js/screens/session.js", "js/screens/manage.js", "js/screens/history.js",
  "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(SHELL).then(() => c.add(REPDB).catch(() => {}))) // exercise list is best-effort
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
      if (res.ok && (new URL(e.request.url).origin === location.origin || e.request.destination === "image" || e.request.url === REPDB)) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
      }
      return res;
    })),
  );
});
