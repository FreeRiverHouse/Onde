// Surfboard Service Worker - Offline PWA Support
// Version: 2.0.0 - Fixed caching to prevent stale build mismatches

const CACHE_NAME = 'surfboard-v3';
const API_CACHE = 'surfboard-api-v3';

// Background Sync tags
const SYNC_TRADING_STATS = 'sync-trading-stats';
const SYNC_MOMENTUM = 'sync-momentum';
const SYNC_ALL = 'sync-all';

// Pending sync requests (for browsers without Background Sync API)
let pendingSyncs = new Set();

// API routes to cache (network-first with cache fallback)
const API_ROUTES = [
  '/api/trading/stats',
  '/api/momentum',
  '/api/health',
  '/api/health/cron',
];

// Install: Skip precaching HTML pages (they change on every build)
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker v3.0.0 (force cache clear)...');
  // Don't precache HTML pages - they contain build-specific chunk references
  // Only cache truly static assets
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll([
          '/manifest.json',
          '/icon.svg',
          '/apple-icon.svg',
        ]);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate: Clean up ALL old caches to prevent stale chunk mismatches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker v2.0.0...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            // Delete ALL old versioned caches
            return name.startsWith('surfboard-') && 
                   name !== CACHE_NAME && 
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

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Received SKIP_WAITING message, activating new version');
    self.skipWaiting();
  }

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
  
  // Request background sync
  if (event.data && event.data.type === 'REQUEST_SYNC') {
    const syncTag = event.data.tag || SYNC_ALL;
    console.log('[SW] Sync requested:', syncTag);
    
    if ('sync' in self.registration) {
      self.registration.sync.register(syncTag)
        .then(() => console.log('[SW] Sync registered:', syncTag))
        .catch((err) => {
          console.log('[SW] Sync registration failed:', err);
          pendingSyncs.add(syncTag);
        });
    } else {
      pendingSyncs.add(syncTag);
    }
    
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage({ type: 'SYNC_QUEUED', tag: syncTag });
    }
  }
  
  // Manual sync trigger
  if (event.data && event.data.type === 'FORCE_SYNC') {
    const syncTag = event.data.tag || SYNC_ALL;
    performSync(syncTag).then((results) => {
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ type: 'SYNC_COMPLETE', tag: syncTag, results });
      }
      notifyClientsOfSync(syncTag, results);
    });
  }
});

// Fetch: Network-first for everything, cache only for offline fallback
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
    event.respondWith(networkFirstWithCache(request, API_CACHE, 60));
    return;
  }

  // Next.js static chunks: Network first, cache fallback
  // IMPORTANT: Don't use cache-first for chunks! Chunks change between builds.
  // The chunk filenames are content-hashed, so each build creates new ones.
  // Using cache-first can cause mismatches if old chunks are cached.
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(networkFirstWithCache(request, CACHE_NAME, 86400));
    return;
  }

  // HTML pages: Always network first (they reference build-specific chunks)
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirstWithCache(request, CACHE_NAME));
    return;
  }

  // Static assets (icons, manifest, etc.): Network first with cache
  if (isStaticAsset(url.pathname)) {
    event.respondWith(networkFirstWithCache(request, CACHE_NAME, 3600));
    return;
  }

  // Default: Network only
  event.respondWith(fetch(request));
});

// Check if URL is a static asset
function isStaticAsset(pathname) {
  return /\.(js|css|svg|png|jpg|jpeg|gif|ico|woff|woff2|ttf|eot)$/.test(pathname);
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
      console.log(`[SW] Serving from cache (offline):`, request.url);
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
  
  pendingSyncs.delete(event.tag);
});

// Perform the actual sync operations
async function performSync(syncTag) {
  console.log('[SW] Performing sync:', syncTag);
  const results = { success: [], failed: [] };
  
  const cache = await caches.open(API_CACHE);
  
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
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, { 
        cache: 'no-store',
        headers: { 'X-Background-Sync': 'true' }
      });
      
      if (response.ok) {
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
      } else {
        results.failed.push({ endpoint, status: response.status });
      }
    } catch (error) {
      results.failed.push({ endpoint, error: error.message });
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

console.log('[SW] Service worker loaded (v2.0.0 - Fixed caching)');
