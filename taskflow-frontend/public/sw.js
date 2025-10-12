const CACHE_NAME = 'taskflow-v1';
const API_CACHE = 'taskflow-api-v1';

const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
];

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static resources');
        return cache.addAll(STATIC_RESOURCES);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Installation failed', error);
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never cache Swagger routes
  if (url.pathname.startsWith('/swagger')) {
    event.respondWith(fetch(request));
    return;
  }

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  if (request.destination === 'document' || 
      request.destination === 'script' || 
      request.destination === 'style' ||
      request.destination === 'image') {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  event.respondWith(
    fetch(request)
      .catch(() => caches.match(request))
  );
});

async function handleApiRequest(request) {
  const url = new URL(request.url);
  const cache = await caches.open(API_CACHE);

  if (request.method === 'GET') {
    try {
      const networkResponse = await fetch(request);
      
      if (networkResponse.ok) {
        const responseClone = networkResponse.clone();
        await cache.put(request, responseClone);
        return networkResponse;
      }
      
      throw new Error('Network response not ok');
    } catch (error) {
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        console.log('Service Worker: Serving from cache', request.url);
        return cachedResponse;
      }
      
      return new Response(
        JSON.stringify({ 
          error: 'Offline', 
          message: 'No network connection and no cached data available' 
        }),
        {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }

  try {
    const response = await fetch(request);
    
    if (response.ok && (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE')) {
      const cacheKeys = await cache.keys();
      const urlPath = url.pathname;
      
      for (const cacheKey of cacheKeys) {
        const cacheUrl = new URL(cacheKey.url);
        if (cacheUrl.pathname.includes(urlPath.split('/')[2])) { // task or categories
          await cache.delete(cacheKey);
        }
      }
    }
    
    return response;
  } catch (error) {
    if (request.method !== 'GET') {
      await storeFailedRequest(request);
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'Request stored for sync when online',
        stored: request.method !== 'GET'
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

async function handleStaticRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      await cache.put(request, responseClone);
    }
    return networkResponse;
  } catch (error) {
    if (request.destination === 'document') {
      const indexResponse = await cache.match('/index.html');
      if (indexResponse) {
        return indexResponse;
      }
    }
    
    throw error;
  }
}

async function storeFailedRequest(request) {
  try {
    const requestData = {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: request.method !== 'GET' ? await request.text() : null,
      timestamp: Date.now()
    };

    const db = await openSyncDB();
    const transaction = db.transaction(['pending_requests'], 'readwrite');
    const store = transaction.objectStore('pending_requests');
    await store.add(requestData);
    
    console.log('Service Worker: Stored failed request for sync', request.url);
  } catch (error) {
    console.error('Service Worker: Failed to store request for sync', error);
  }
}

function openSyncDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('TaskFlowSync', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending_requests')) {
        const store = db.createObjectStore('pending_requests', { autoIncrement: true });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'taskflow-sync') {
    event.waitUntil(syncPendingRequests());
  }
});

async function syncPendingRequests() {
  try {
    const db = await openSyncDB();
    const transaction = db.transaction(['pending_requests'], 'readwrite');
    const store = transaction.objectStore('pending_requests');
    const requests = await store.getAll();

    console.log(`Service Worker: Syncing ${requests.length} pending requests`);

    for (const requestData of requests) {
      try {
        const response = await fetch(requestData.url, {
          method: requestData.method,
          headers: requestData.headers,
          body: requestData.body
        });

        if (response.ok) {
          await store.delete(requestData.id);
          console.log('Service Worker: Synced request', requestData.url);
        }
      } catch (error) {
        console.error('Service Worker: Failed to sync request', requestData.url, error);
      }
    }

    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        syncedCount: requests.length
      });
    });

  } catch (error) {
    console.error('Service Worker: Background sync failed', error);
  }
}

self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'TaskFlow', {
        body: data.body || 'You have a new notification',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        data: data.data || {}
      })
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});
