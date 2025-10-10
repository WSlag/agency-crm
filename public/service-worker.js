const CACHE_NAME = 'agency-crm-v1';
const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_RESOURCES);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, then network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip Firebase requests
  if (event.request.url.includes('firestore.googleapis.com')) return;
  if (event.request.url.includes('firebase-settings.crashlytics.com')) return;
  if (event.request.url.includes('firebase.googleapis.com')) return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached response if found
      if (response) return response;

      // Otherwise, fetch from network
      return fetch(event.request).then((response) => {
        // Don't cache if not a success response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Cache the response
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});