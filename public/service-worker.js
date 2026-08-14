/* Leap.ai does not use a service worker or PWA offline caching.
 *
 * Older deployments of this template registered a service worker that cached
 * the SPA shell and kept serving stale bundles (which pointed at localhost)
 * long after new builds were deployed. This file exists so that any stale
 * worker's update check succeeds, installs this worker, and is then removed —
 * wiping its caches in the process. After this runs once, the browser is
 * back to fetching fresh assets on every visit.
 */
self.addEventListener("install", () => {
  // Don't wait; take over as soon as possible so the cleanup runs.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Clear every cache this or any older worker created.
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      } catch (err) {
        // Ignore — some requests (e.g. chrome-extension://) can't be cached
        // anyway; the unregister below is what actually ends the staleness.
      }
      // Remove this worker and stop controlling the page.
      await self.registration.unregister();
      // Reload every controlled tab so they drop the old cached shell.
      const clients = await self.clients.matchAll({ type: "window" });
      for (const client of clients) {
        try {
          await client.navigate(client.url);
        } catch (err) {
          // A tab may be on about:blank or an extension page — skip it.
        }
      }
    })()
  );
});

// Serve nothing from cache: always fall through to the network.
self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
