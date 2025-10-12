const CACHE_NAME = 'agency-cache-v1';
const OFFLINE_URL = '/offline.html';

// Files to cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/logo192.png',
  '/logo512.png',
  '/manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // Cache static assets
      await cache.addAll(STATIC_ASSETS);
      // Cache offline page
      const offlineResponse = new Response(
        '<html><body><h1>Offline</h1><p>You are currently offline.</p></body></html>',
        {
          headers: { 'Content-Type': 'text/html' }
        }
      );
      await cache.put(OFFLINE_URL, offlineResponse);
    })()
  );
  // Force waiting service worker to become active
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Clean up old caches
      const cacheKeys = await caches.keys();
      await Promise.all(
        cacheKeys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
      // Take control of all clients
      await clients.claim();
    })()
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    (async () => {
      try {
        // Try network first
        const response = await fetch(event.request);
        // Cache successful responses
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, response.clone());
        }
        return response;
      } catch (error) {
        // Network failed, try cache
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        // If HTML request, return offline page
        if (event.request.mode === 'navigate') {
          const cache = await caches.open(CACHE_NAME);
          return cache.match(OFFLINE_URL);
        }
        // Otherwise, propagate error
        throw error;
      }
    })()
  );
});

// Sync event
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// Background sync function
async function syncData() {
  const db = await openOfflineDB();
  const tx = db.transaction('sync_queue', 'readwrite');
  const store = tx.objectStore('sync_queue');
  const pendingItems = await store.index('status').getAll('pending');

  for (const item of pendingItems) {
    try {
      // Attempt to sync with server
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
      });

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`);
      }

      // Update sync status
      item.status = 'completed';
      await store.put(item);
    } catch (error) {
      // Handle sync failure
      item.retryCount++;
      item.status = item.retryCount >= 3 ? 'failed' : 'pending';
      item.error = error.message;
      await store.put(item);
    }
  }

  await tx.done;
  db.close();
}

// Helper function to open IndexedDB
async function openOfflineDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('agency_offline_db', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('sync_queue')) {
        const store = db.createObjectStore('sync_queue', { keyPath: 'id' });
        store.createIndex('status', 'status');
      }
    };
  });
}