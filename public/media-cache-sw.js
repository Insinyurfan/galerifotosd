const CACHE_NAME = "galeri-sdn-media-v1";
const MAX_IMAGE_CACHE_ITEMS = 80;

async function trimImageCache(cache) {
  const requests = await cache.keys();
  if (requests.length <= MAX_IMAGE_CACHE_ITEMS) return;

  const deleteCount = requests.length - MAX_IMAGE_CACHE_ITEMS;
  await Promise.all(requests.slice(0, deleteCount).map((request) => cache.delete(request)));
}

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const isDriveThumbnail =
    event.request.method === "GET" &&
    event.request.destination === "image" &&
    url.hostname === "drive.google.com" &&
    url.pathname.startsWith("/thumbnail");

  if (!isDriveThumbnail) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(event.request);
      if (cachedResponse) return cachedResponse;

      const networkResponse = await fetch(event.request);
      await cache.put(event.request, networkResponse.clone());
      await trimImageCache(cache);
      return networkResponse;
    })
  );
});
