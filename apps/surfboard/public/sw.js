// Surfboard Service Worker - Offline PWA Support
// Version: 1.0.0

const CACHE_NAME = 'surfboard-v1';
const STATIC_CACHE = 'surfboard-static-v1';
const API_CACHE = 'surfboard-api-v1';

// Static assets to precache
const PRECACHE_ASSETS = [
  '/',
  '/betting',
  '/house',
  '/corde',
  '/pr',
  '/manifest.json',
  '/icon.svg',
  '/apple-icon.svg',
  '/robots.txt',
];

// API routes to cache (network-first with cache fallback)
const API_ROUTES = [
  '/api/trading/stats',
  '/api/momentum',
  '/api/health',
  '/api/health/cron',
];

// Install: Precache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Precaching static assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            // Delete old versioned caches
            return name.startsWith('surfboard-') && 
                   name !== CACHE_NAME && 
                   name !== STATIC_CACHE && 
                   name !== API_CACHE;
          })
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Handle messages from clients (for manual update trigger)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Received SKIP_WAITING message, activating new version');
    self.skipWaiting();
  }
});

// Fetch: Implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip cross-origin requests (except fonts)
  if (url.origin !== location.origin && !url.hostname.includes('fonts.')) {
    return;
  }

  // API routes: Network first, cache fallback
  if (API_ROUTES.some(route => url.pathname.startsWith(route))) {
    event.respondWith(networkFirstWithCache(request, API_CACHE, 60)); // 60s TTL
    return;
  }

  // Static assets: Cache first, network fallback
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirstWithNetwork(request, STATIC_CACHE));
    return;
  }

  // HTML pages: Network first, cache fallback (for offline)
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirstWithCache(request, STATIC_CACHE));
    return;
  }

  // Default: Network only
  event.respondWith(fetch(request));
});

// Check if URL is a static asset
function isStaticAsset(pathname) {
  return /\.(js|css|svg|png|jpg|jpeg|gif|ico|woff|woff2|ttf|eot)$/.test(pathname) ||
         pathname.startsWith('/_next/static/');
}

// Cache-first strategy
async function cacheFirstWithNetwork(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    // Return cached, but refresh in background
    refreshCache(request, cache);
    return cached;
  }
  
  // No cache, fetch from network
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('[SW] Network error, no cache available');
    return new Response('Offline', { status: 503 });
  }
}

// Network-first strategy with cache fallback
async function networkFirstWithCache(request, cacheName, ttlSeconds = 300) {
  const cache = await caches.open(cacheName);
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      // Clone and cache with timestamp
      const responseToCache = response.clone();
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cache-time', Date.now().toString());
      
      const body = await responseToCache.blob();
      const cachedResponse = new Response(body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });
      
      cache.put(request, cachedResponse);
    }
    return response;
  } catch (error) {
    // Network failed, try cache
    const cached = await cache.match(request);
    
    if (cached) {
      const cacheTime = cached.headers.get('sw-cache-time');
      const age = cacheTime ? (Date.now() - parseInt(cacheTime)) / 1000 : Infinity;
      
      // Return cached even if stale when offline
      console.log(`[SW] Serving cached (age: ${Math.round(age)}s):`, request.url);
      return cached;
    }
    
    // No cache, return offline response
    if (request.headers.get('accept')?.includes('application/json')) {
      return new Response(JSON.stringify({ 
        error: 'Offline', 
        cached: false,
        message: 'No network connection and no cached data available'
      }), { 
        status: 503, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    return new Response('Offline - No cached version available', { status: 503 });
  }
}

// Background cache refresh
async function refreshCache(request, cache) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response);
    }
  } catch (e) {
    // Ignore - just a background refresh
  }
}

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
  
  if (event.data === 'clearCache') {
    caches.keys().then((names) => {
      names.forEach((name) => {
        if (name.startsWith('surfboard-')) {
          caches.delete(name);
        }
      });
    });
  }
});

console.log('[SW] Service worker loaded');
