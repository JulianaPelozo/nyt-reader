const CACHE_NAME = 'local-lens-v1';

const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  '/images/icon-192.png',
  '/images/icon-512.png'
];


self.addEventListener('install', event => {
  console.log('[Service Worker] Instalando e cacheadando App Shell...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Força o novo SW a se ativar imediatamente
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

  if (urlsToCache.includes(requestUrl.pathname) || requestUrl.origin === location.origin) {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
    return;
  }


  if (requestUrl.host.includes('api.nytimes.com')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(event.request).then(cachedResponse => {
          const fetchPromise = fetch(event.request).then(networkResponse => {
            // Atualiza o cache com a nova resposta da rede
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
         
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }
});