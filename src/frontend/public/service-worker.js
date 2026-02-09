const CACHE_NAME = 'restaurant-app-v1';
const STATIC_CACHE = 'restaurant-static-v1';
const DYNAMIC_CACHE = 'restaurant-dynamic-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/generated/restaurant-icon-192x192.png',
  '/assets/generated/restaurant-icon-512x512.png',
  '/assets/generated/restaurant-logo-transparent.dim_200x200.png',
  '/assets/generated/appetizer-sample.dim_400x300.jpg',
  '/assets/generated/beverage-sample.dim_400x300.jpg',
  '/assets/generated/dessert-sample.dim_400x300.jpg',
  '/assets/generated/main-dish-sample.dim_400x300.jpg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch((error) => {
        console.error('[Service Worker] Failed to cache static assets:', error);
      });
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip Internet Computer canister calls and external APIs
  if (url.hostname.includes('.ic0.app') || 
      url.hostname.includes('.icp0.io') ||
      url.hostname.includes('stripe.com') ||
      url.hostname.includes('identity.ic0.app')) {
    return;
  }

  // Cache-first strategy for static assets
  if (STATIC_ASSETS.some(asset => url.pathname === asset || url.pathname.startsWith('/assets/'))) {
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request).then((fetchResponse) => {
          return caches.open(STATIC_CACHE).then((cache) => {
            cache.put(request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      }).catch(() => {
        // Return offline fallback if available
        return caches.match('/');
      })
    );
    return;
  }

  // Network-first strategy for app pages and dynamic content
  event.respondWith(
    fetch(request).then((response) => {
      // Clone the response before caching
      const responseToCache = response.clone();
      
      // Cache successful responses
      if (response.status === 200) {
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(request, responseToCache);
        });
      }
      
      return response;
    }).catch(() => {
      // Fallback to cache if network fails
      return caches.match(request).then((response) => {
        return response || caches.match('/');
      });
    })
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
