// Surfboard Service Worker - Offline PWA Support
// Version: 1.1.0 - Added Background Sync

const CACHE_NAME = 'surfboard-v1';
const STATIC_CACHE = 'surfboard-static-v1';
const API_CACHE = 'surfboard-api-v1';

// Background Sync tags
const SYNC_TRADING_STATS = 'sync-trading-stats';
const SYNC_MOMENTUM = 'sync-momentum';
const SYNC_ALL = 'sync-all';

// Pending sync requests (for browsers without Background Sync API)
let pendingSyncs = new Set();

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
  
  // Request background sync (for when client wants to queue a refresh)
  if (event.data && event.data.type === 'REQUEST_SYNC') {
    const syncTag = event.data.tag || SYNC_ALL;
    console.log('[SW] Sync requested:', syncTag);
    
    // Try to register a sync (if supported)
    if ('sync' in self.registration) {
      self.registration.sync.register(syncTag)
        .then(() => console.log('[SW] Sync registered:', syncTag))
        .catch((err) => {
          console.log('[SW] Sync registration failed, will retry on connect:', err);
          pendingSyncs.add(syncTag);
        });
    } else {
      // Fallback: store pending sync and retry when online
      pendingSyncs.add(syncTag);
      console.log('[SW] Background Sync not supported, queued for retry');
    }
    
    // Notify client
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage({ type: 'SYNC_QUEUED', tag: syncTag });
    }
  }
  
  // Manual sync trigger (for testing or forced refresh)
  if (event.data && event.data.type === 'FORCE_SYNC') {
    const syncTag = event.data.tag || SYNC_ALL;
    console.log('[SW] Force sync:', syncTag);
    performSync(syncTag).then((results) => {
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ type: 'SYNC_COMPLETE', tag: syncTag, results });
      }
      // Notify all clients about the refresh
      notifyClientsOfSync(syncTag, results);
    });
  }
});

// Background Sync event handler
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === SYNC_TRADING_STATS) {
    event.waitUntil(performSync(SYNC_TRADING_STATS));
  } else if (event.tag === SYNC_MOMENTUM) {
    event.waitUntil(performSync(SYNC_MOMENTUM));
  } else if (event.tag === SYNC_ALL) {
    event.waitUntil(performSync(SYNC_ALL));
  }
  
  // Remove from pending syncs if it was there
  pendingSyncs.delete(event.tag);
});

// Perform the actual sync operations
async function performSync(syncTag) {
  console.log('[SW] Performing sync:', syncTag);
  const results = { success: [], failed: [] };
  
  const cache = await caches.open(API_CACHE);
  
  // Determine which endpoints to refresh
  const endpoints = [];
  if (syncTag === SYNC_TRADING_STATS || syncTag === SYNC_ALL) {
    endpoints.push('/api/trading/stats');
  }
  if (syncTag === SYNC_MOMENTUM || syncTag === SYNC_ALL) {
    endpoints.push('/api/momentum');
  }
  if (syncTag === SYNC_ALL) {
    endpoints.push('/api/health');
    endpoints.push('/api/health/cron');
  }
  
  // Fetch and cache each endpoint
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, { 
        cache: 'no-store',
        headers: { 'X-Background-Sync': 'true' }
      });
      
      if (response.ok) {
        // Add timestamp to cached response
        const headers = new Headers(response.headers);
        headers.set('sw-cache-time', Date.now().toString());
        headers.set('sw-sync-time', new Date().toISOString());
        
        const body = await response.blob();
        const cachedResponse = new Response(body, {
          status: response.status,
          statusText: response.statusText,
          headers: headers
        });
        
        await cache.put(endpoint, cachedResponse);
        results.success.push(endpoint);
        console.log('[SW] Synced:', endpoint);
      } else {
        results.failed.push({ endpoint, status: response.status });
        console.log('[SW] Sync failed:', endpoint, response.status);
      }
    } catch (error) {
      results.failed.push({ endpoint, error: error.message });
      console.log('[SW] Sync error:', endpoint, error.message);
    }
  }
  
  return results;
}

// Notify all clients about sync completion
async function notifyClientsOfSync(syncTag, results) {
  const clients = await self.clients.matchAll({ type: 'window' });
  for (const client of clients) {
    client.postMessage({
      type: 'SYNC_COMPLETE',
      tag: syncTag,
      results: results,
      timestamp: new Date().toISOString()
    });
  }
}

// When coming online, process pending syncs
self.addEventListener('online', () => {
  console.log('[SW] Online detected, processing pending syncs');
  pendingSyncs.forEach((tag) => {
    performSync(tag).then((results) => {
      notifyClientsOfSync(tag, results);
      pendingSyncs.delete(tag);
    });
  });
});

console.log('[SW] Service worker loaded (v1.1.0 with Background Sync)');
