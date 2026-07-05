// Cache-first service worker: after one visit, the playground works with the
// network fully severed. Version-bump CACHE on breaking asset changes.
const CACHE = "glifex-v1";
const ASSETS = ["./", "index.html", "style.css", "app.js", "assertions.js", "runtimes.js", "problems.generated.json"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
});
self.addEventListener("fetch", (e) => {
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
    const copy = res.clone();
    caches.open(CACHE).then((c) => c.put(e.request, copy));
    return res;
  })));
});
