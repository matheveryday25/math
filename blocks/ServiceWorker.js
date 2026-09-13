const cacheName = "reun-Block Blast Puzzle-1.1";
const contentToCache = [
    "https://quantil.jsdelivr.net/gh/matheveryday25/math/blocks/Build/BlockBlast1.1-8.loader.js",
    "https://quantil.jsdelivr.net/gh/matheveryday25/math/blocks/Build/BlockBlast1.1-8.framework.js.unityweb",
    "https://quantil.jsdelivr.net/gh/matheveryday25/math/blocks/Build/BlockBlast1.1-8.data.unityweb",
    "https://quantil.jsdelivr.net/gh/matheveryday25/math/blocks/Build/BlockBlast1.1-8.wasm.unityweb",
    "https://quantil.jsdelivr.net/gh/matheveryday25/math/blocks/TemplateData/style.css"

];

self.addEventListener('install', function (e) {
    console.log('[Service Worker] Install');
    
    e.waitUntil((async function () {
      const cache = await caches.open(cacheName);
      console.log('[Service Worker] Caching all: app shell and content');
      await cache.addAll(contentToCache);
    })());
});

self.addEventListener('fetch', function (e) {
    e.respondWith((async function () {
      let response = await caches.match(e.request);
      console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
      if (response) { return response; }

      response = await fetch(e.request);
      const cache = await caches.open(cacheName);
      console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
      cache.put(e.request, response.clone());
      return response;
    })());
});
