const APP_VERSION = 'V3.0.1';
const CACHE_NAME = `pr-explorer-${APP_VERSION}-20260602b`;
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './version.json',
  './style.css?v=3.0.1-20260602b',
  './prx-v3.0.1.css?v=3.0.1-20260602b',
  './app.js?v=3.0.1-20260602b',
  './prx-v3.0.1.js?v=3.0.1-20260602b',
  './pr-data.js?v=3.0.1-20260602b',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png',
  './README.md',
  './CHANGELOG.md',
  './README_TESTING.md',
  './README_LAYER.md',
  './CHANGELOG_V3.0.1.md',
  './PROMPT_CHATGPT_ROADMAP.md',
  './audit-schema-v3.0.1.json'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(
      names
        .filter(name => name !== CACHE_NAME && name.startsWith('pr-explorer-'))
        .map(name => caches.delete(name))
    );
    await self.clients.claim();
  })());
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request, { cache: 'no-store' });
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch (e) {
    const cached = await cache.match(request, { ignoreSearch: false }) || await cache.match(new URL(request.url).pathname);
    return cached || cache.match('./index.html');
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request, { ignoreSearch: false });
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok && request.method === 'GET') cache.put(request, response.clone());
  return response;
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (req.mode === 'navigate' || url.pathname.endsWith('/index.html')) {
    event.respondWith(networkFirst(req));
    return;
  }
  event.respondWith(cacheFirst(req));
});
