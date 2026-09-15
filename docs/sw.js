// Unregister service worker — app uses Firebase, no offline caching needed
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", () => {
  caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))));
  self.registration.unregister();
});
