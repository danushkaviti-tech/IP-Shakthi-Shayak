const CACHE_NAME = "ip-sakti-v3.2-live";
const STATIC_ASSETS = [
  "/manifest.json",
  "/icons/icon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// Install Event: cache static shell icons and skip waiting
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Event: immediately purge all old cache versions and claim clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Direct network-first for all app pages & dynamic assets
self.addEventListener("fetch", (event) => {
  if (
    event.request.method !== "GET" ||
    event.request.url.includes("/api/") ||
    event.request.mode === "navigate"
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
