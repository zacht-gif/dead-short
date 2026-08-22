// Cache-first service worker for offline play.
//
// Bump CACHE_NAME on any change to the files listed in CACHE_FILES, or clients
// will keep serving the old copy forever. tools/test.mjs asserts that every
// path here exists on disk, so an added file that never made it into this list
// fails the suite rather than silently breaking offline play.
const CACHE_NAME = 'wired-v2';

// index.html is the only file the game genuinely cannot start without, so it is
// the only one whose failure should fail the install.
const CORE_FILE = './index.html';
const CACHE_FILES = [
  './index.html',
  './manifest.json',
  './icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon-180.png',
];

// Deliberately not addAll(): it is atomic, so one entry that 404s or redirects
// rejects the whole install and the app silently has no offline mode at all.
// The flip side is that a per-file install can succeed while half-empty and
// stay that way, so this only ever adds what is actually missing, runs again on
// activate, and is backed up by the runtime fill in the fetch handler below.
async function precache(cache) {
  const have = new Set((await cache.keys()).map((r) => new URL(r.url).pathname));
  const missing = CACHE_FILES.filter(
    (f) => !have.has(new URL(f, self.location.href).pathname)
  );
  const results = await Promise.allSettled(missing.map((f) => cache.add(f)));
  const failed = missing.filter((_, i) => results[i].status === 'rejected');
  if (failed.length) {
    // Visible in DevTools rather than silent: a missing icon means no install
    // prompt, and nothing else would ever say so.
    console.warn('[wired sw] could not cache:', failed.join(', '));
  }
  return failed;
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Fail loudly if the app itself cannot be stored — claiming offline
      // support without the page is worse than not claiming it.
      await cache.add(CORE_FILE);
      await precache(cache);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)));
      // Second chance for anything the install could not reach.
      await precache(await caches.open(CACHE_NAME));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;

  // Shared challenge links carry a query string (?challenge=..&score=..), and a
  // cache lookup keyed on the full URL never matches the cached ./index.html.
  // Online that quietly falls through to the network; offline the link just
  // fails. Navigations therefore ignore the search string and fall back to the
  // one document this app has.
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match(req, { ignoreSearch: true })
        .then((hit) => hit || caches.match(CORE_FILE))
        .then((hit) => hit || fetch(req))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      // Runtime fill: whatever the running app actually asks for ends up in the
      // cache, so a partial precache repairs itself on the next online visit
      // instead of leaving the app permanently half-offline.
      return fetch(req).then((res) => {
        if (res && res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      });
    })
  );
});
