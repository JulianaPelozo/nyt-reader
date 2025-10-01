const CACHE_NAME = 'local-lens-v1';

const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  '/img/icon-192.png',
  '/img/icon-512.png',
  '/offline.html'
];

self.addEventListener('install', event => {
  console.log('[Service Worker] Instalando e cacheando App Shell...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  console.log('[Service Worker] Ativando e limpando caches antigos...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deletando cache obsoleto:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // ✅ Garante que "/" também funcione offline
  if (requestUrl.origin === location.origin) {
    let pathname = requestUrl.pathname === '/' ? '/index.html' : requestUrl.pathname;

    if (urlsToCache.includes(pathname)) {
      event.respondWith(
        caches.match(pathname).then(response => {
          return response || fetch(event.request);
        })
      );
      return;
    }
  }

  // ✅ Network-first para a API do NYT
  if (requestUrl.host.includes('api.nytimes.com')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(event.request).then(cachedResponse => {
          const fetchPromise = fetch(event.request).then(networkResponse => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // ✅ Fallback offline
  event.respondWith(
    fetch(event.request).catch(() => caches.match('/offline.html'))
  );
});
