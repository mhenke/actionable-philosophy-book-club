const CACHE = 'dev';  // replaced at deploy time by CI inject step
const PRECACHE = [
  './',
  './index.html',
  './dist/app.js',
  './dist/tailwind.css',
  './dist/vendor/marked.min.js',
  './dist/vendor/purify.min.js',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Never cache manifest.json — always fresh from network
  if (event.request.url.includes('manifest.json')) {
    event.respondWith(fetch(event.request));
    return;
  }
  event.respondWith(
    caches.match(event.request).then(cached => {
      const fetchPromise = fetch(event.request).then(response => {
        if (response.ok) {
          const cloned = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, cloned));
        }
        return response;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
