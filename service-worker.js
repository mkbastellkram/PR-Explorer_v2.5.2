const APP_VERSION = 'V3.2.4';
const CACHE_NAME = 'pr-explorer-v3-2-4-detail-parken-20260603o';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './version.json',
  './style.css?v=3.2.4-20260603o',
  './app.js?v=3.2.4-20260603o',
  './pr-data.js?v=3.2.4-20260603o',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png',
  './README.md',
  './CHANGELOG.md',
  './PROMPT_CHATGPT_ROADMAP.md'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name !== CACHE_NAME && name.startsWith('pr-explorer-')).map(name => caches.delete(name)));
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
    return await cache.match(request, { ignoreSearch: false }) || await cache.match('./index.html');
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
