const APP_VERSION = 'V3.2.23';
const CACHE_NAME = 'pr-explorer-v3-2-23-poi-targets-20260605';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './version.json',
  './style.css',
  './app.js',
  './pr-data.js',
  './pr-status-fetcher.js',
  './events-data.js',
  './markets-data.js',
  './poi-data.js',
  './webcam-data.js',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png',
  './kml/Route von Pestana Promenade nach PR 1.2.kml',
  './kml/Route von Pestana Promenade nach PR 1.3.kml',
  './kml/Route von Pestana Promenade nach PR 10.kml',
  './kml/Route von Pestana Promenade nach PR 11.kml',
  './kml/Route von Pestana Promenade nach PR 12.kml',
  './kml/Route von Pestana Promenade nach PR 13.1.kml',
  './kml/Route von Pestana Promenade nach PR 13.kml',
  './kml/Route von Pestana Promenade nach PR 14.kml',
  './kml/Route von Pestana Promenade nach PR 15.kml',
  './kml/Route von Pestana Promenade nach PR 16.kml',
  './kml/Route von Pestana Promenade nach PR 2.kml',
  './kml/Route von Pestana Promenade nach PR 3.1.kml',
  './kml/Route von Pestana Promenade nach PR 3.kml',
  './kml/Route von Pestana Promenade nach PR 4.kml',
  './kml/Route von Pestana Promenade nach PR 5.kml',
  './kml/Route von Pestana Promenade nach PR 6.1.kml',
  './kml/Route von Pestana Promenade nach PR 6.2.kml',
  './kml/Route von Pestana Promenade nach PR 6.3.kml',
  './kml/Route von Pestana Promenade nach PR 6.4.kml',
  './kml/Route von Pestana Promenade nach PR 6.5.kml',
  './kml/Route von Pestana Promenade nach PR 6.6.kml',
  './kml/Route von Pestana Promenade nach PR 6.8.kml',
  './kml/Route von Pestana Promenade nach PR 6.kml',
  './kml/Route von Pestana Promenade nach PR 7.kml',
  './kml/Route von Pestana Promenade nach PR 8.kml',
  './kml/Route von Pestana Promenade nach PR 9.1.kml',
  './kml/Route von Pestana Promenade nach PR 9.kml',
  './kml/Route von Pestana Promenade nach PR17.kml',
  './kml/Route von Pestana Promenade nach PR18.kml',
  './kml/Route von Pestana Promenade nach PR19.kml',
  './kml/Route von Pestana Promenade nach PR20.kml',
  './kml/Route von Pestana Promenade nach PR21.kml',
  './kml/Route von Pestana Promenade nach PR22.kml',
  './kml/Route von Pestana Promenade nach PR27.kml',
  './kml/Route von Pestana Promenade nach PR28.kml',
  './kml/Route von Pestana Promenade nach PR_1.1.kml',
  './kml/Route von Pestana Promenade nach PR_1.kml',
  './README.md',
  './CHANGELOG.md'
];

const EXTERNAL_ASSETS = [
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(CORE_ASSETS);
    await Promise.allSettled(EXTERNAL_ASSETS.map(url => cache.add(url)));
  })());
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
    if (response && response.ok && request.method === 'GET') cache.put(request, response.clone());
    return response;
  } catch (e) {
    return await cache.match(request, { ignoreSearch: true }) || await cache.match('./index.html');
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request, { ignoreSearch: true });
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok && request.method === 'GET') cache.put(request, response.clone());
  return response;
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Navigation immer frisch versuchen; bei Offline auf lokale App-Hülle zurückfallen.
  if (req.mode === 'navigate' || url.pathname.endsWith('/index.html')) {
    event.respondWith(networkFirst(req));
    return;
  }

  // App-Code und App-Daten nicht stumpf aus altem Cache nehmen.
  // Das verhindert den iOS-Homescreen-Zustand: neue HTML-Hülle + alte/fehlende JS-Daten.
  const isSameOrigin = url.origin === self.location.origin;
  const isAppAsset = isSameOrigin && /\.(js|css|json|webmanifest)$/i.test(url.pathname);
  if (isAppAsset) {
    event.respondWith(networkFirst(req));
    return;
  }

  event.respondWith(cacheFirst(req));
});
