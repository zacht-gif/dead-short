// Cache-first service worker for offline play.
//
// CACHE_NAME must be bumped on every release, or returning players keep being
// served the old build from cache forever. build.js checks that this version
// matches the one in index.html and refuses to package a mismatch, because
// "forgot to bump the cache" is invisible until players report a stale game.
// Keeps the pre-rename name on purpose, like the other internal keys: it is a
// cache key, never shown to anyone, and leaving every 'wired-' identifier alone
// keeps one simple rule - anything still spelled 'wired' is load-bearing.
const CACHE_NAME = 'wired-v2.0.0';
const CACHE_FILES = [
  './', './index.html', './manifest.json', './icon.svg',
  './icons/icon-192.png', './icons/icon-512.png',
  './icons/maskable-512.png', './icons/apple-touch-icon-180.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CACHE_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only same-origin GETs are cacheable here; anything else is passed straight
  // through rather than being answered from a cache that can't hold it.
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
