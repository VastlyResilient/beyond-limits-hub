/* Beyond Limits Hub - service worker.
   Goal: the app opens instantly and still opens with no signal (a tutor in a
   school basement is the real case). Hashed build assets are immutable, so they
   are cache-first; navigations are network-first with a cached shell fallback so
   a new deploy is picked up on the next connection. Never caches the AI API. */
const V = "blhub-v1";
const SHELL = ["./", "./index.html", "./manifest.webmanifest",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-maskable-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(V);
    await Promise.allSettled(SHELL.map((u) => c.add(new Request(u, { cache: "reload" }))));
    self.skipWaiting();
  })());
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== V).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

const isApi = (url) => url.hostname.endsWith("railway.app") || url.pathname.includes("/api/");

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || isApi(url)) return;   // never touch the API

  if (req.mode === "navigate") {
    e.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const c = await caches.open(V);
        c.put("./index.html", fresh.clone());
        return fresh;
      } catch {
        const c = await caches.open(V);
        return (await c.match("./index.html")) || (await c.match("./")) ||
          new Response("<h1>Offline</h1><p>Reconnect to load the Hub.</p>",
            { headers: { "Content-Type": "text/html" } });
      }
    })());
    return;
  }

  e.respondWith((async () => {
    const c = await caches.open(V);
    const hit = await c.match(req);
    if (hit) return hit;
    try {
      const res = await fetch(req);
      if (res && res.status === 200 && res.type === "basic") c.put(req, res.clone());
      return res;
    } catch {
      return hit || Response.error();
    }
  })());
});
