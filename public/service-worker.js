/* Leap.ai service worker — installable PWA with offline support.
 *
 * Strategy (learned from an earlier stale-shell incident):
 *  - Navigations (index.html / routes) are NETWORK-FIRST: the shell is always
 *    fetched fresh, so a new deploy is never shadowed by a cached page.
 *  - Only content-hashed build assets (/assets/*.js, *.css) are cached
 *    first — their hash changes on every deploy, so stale bundles are
 *    impossible.
 *  - API calls are never cached (auth + freshness).
 *  - When offline, navigations fall back to the last cached shell, then to
 *    /offline.html.
 */
const VERSION = "leap-v1";
const SHELL_CACHE = VERSION + "-shell";
const ASSET_CACHE = VERSION + "-assets";

const PRECACHE = [
  "/",
  "/offline.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      await Promise.all(
        PRECACHE.map((url) => cache.add(url).catch(() => {}))
      );
      self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  // Navigations: network first, cached shell as fallback, then offline page.
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          const cache = await caches.open(SHELL_CACHE);
          cache.put("/", response.clone());
          return response;
        } catch (err) {
          const cached = await caches.match("/");
          return cached || caches.match("/offline.html");
        }
      })()
    );
    return;
  }

  // Content-hashed build assets: cache-first (immutable by hash).
  if (url.pathname.startsWith("/assets/")) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(ASSET_CACHE);
        const hit = await cache.match(request);
        if (hit) return hit;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      })()
    );
    return;
  }

  // Everything else (manifest, icons, favicon): stale-while-revalidate.
  event.respondWith(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      const hit = await cache.match(request);
      const network = fetch(request)
        .then((response) => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        })
        .catch(() => hit);
      return hit || network;
    })()
  );
});
