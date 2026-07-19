// idk

const CACHE_NAME = 'offline-cache-v1';
const OFFLINE_PAGES = new Set();

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  self.skipWaiting(); 
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim(); 
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  if (url.origin !== location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log('Service Worker: Serving from cache:', event.request.url);
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
          console.log('Service Worker: Cached new resource:', event.request.url);
        });

        return response;
      }).catch(() => {
        console.log('Service Worker: Network failed for:', event.request.url);
        return new Response('Offline - Page not cached', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/plain'
          })
        });
      });
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_PAGE') {
    const urlToCache = event.data.url;
    
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.add(urlToCache).then(() => {
          console.log('Service Worker: Page cached:', urlToCache);
          event.ports[0].postMessage({ success: true });
        });
      }).catch((error) => {
        console.error('Service Worker: Failed to cache page:', error);
        event.ports[0].postMessage({ success: false, error: error.message });
      })
    );
  }
});