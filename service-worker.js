const APP_VERSION = 'V3.0.7';
const CACHE_NAME = `pr-explorer-${APP_VERSION}-20260603f`;
const CORE_ASSETS = [
 './','./index.html','./manifest.webmanifest','./version.json',
 './style.css?v=3.0.7-20260603f','./prx-v3.0.7.css?v=3.0.7-20260603f','./app.js?v=3.0.7-20260603f','./prx-v3.0.7.js?v=3.0.7-20260603f','./pr-data.js?v=3.0.7-20260603f',
 './icon-180.png','./icon-192.png','./icon-512.png','./README.md','./CHANGELOG.md','./README_TESTING.md','./README_LAYER.md','./PROMPT_CHATGPT_ROADMAP.md'
];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(CORE_ASSETS)));});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{const n=await caches.keys();await Promise.all(n.filter(x=>x!==CACHE_NAME&&x.startsWith('pr-explorer-')).map(x=>caches.delete(x)));await self.clients.claim();})());});
async function networkFirst(r){const c=await caches.open(CACHE_NAME);try{const res=await fetch(r,{cache:'no-store'});if(res&&res.ok)c.put(r,res.clone());return res;}catch(e){return await c.match(r,{ignoreSearch:false})||await c.match('./index.html');}}
async function cacheFirst(r){const c=await caches.open(CACHE_NAME);const m=await c.match(r,{ignoreSearch:false});if(m)return m;const res=await fetch(r);if(res&&res.ok&&r.method==='GET')c.put(r,res.clone());return res;}
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(r.mode==='navigate'||u.pathname.endsWith('/index.html')){e.respondWith(networkFirst(r));return;}e.respondWith(cacheFirst(r));});
