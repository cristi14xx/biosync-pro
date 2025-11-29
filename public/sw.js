// Schimbă această versiune la fiecare update major!
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `biosync-pro-${CACHE_VERSION}`;

// Fișiere esențiale pentru offline
const STATIC_ASSETS = [
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/favicon.svg'
];

// Install - cache doar assets-urile statice
self.addEventListener('install', (event) => {
  console.log(`[SW] Installing version ${CACHE_VERSION}`);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
  );
  // Forțează activarea imediată a noului SW
  self.skipWaiting();
});

// Activate - șterge cache-urile vechi
self.addEventListener('activate', (event) => {
  console.log(`[SW] Activating version ${CACHE_VERSION}`);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith('biosync-pro-') && cacheName !== CACHE_NAME)
          .map((cacheName) => {
            console.log(`[SW] Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          })
      );
    })
  );
  // Preia controlul imediat asupra tuturor tab-urilor
  self.clients.claim();
});

// Fetch - Network First pentru HTML/JS, Cache First pentru imagini
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Nu cache-ui request-urile API
  if (url.href.includes('generativelanguage.googleapis.com')) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Pentru HTML și JS - Network First (întotdeauna încearcă să ia ultima versiune)
  if (event.request.mode === 'navigate' || 
      event.request.destination === 'script' ||
      event.request.destination === 'style' ||
      url.pathname === '/') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Salvează în cache pentru offline
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Fallback la cache dacă e offline
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // Pentru imagini și alte assets - Cache First
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((response) => {
          // Cache noul response
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        });
      })
  );
});

// Ascultă mesaje de la app pentru a forța update
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
