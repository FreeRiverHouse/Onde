# PWA Status - onde.la

**Data:** 2026-02-03

## 📱 Stato Attuale

### ✅ Implementato
- `manifest.json` presente (orientato a Skin Studio)
- Icons SVG/PNG
- Meta tags mobile (viewport, apple-mobile-web-app)
- Theme color definito

### ❌ Non Implementato
- Service Worker (offline support)
- Cache API per libri/PDF
- Push notifications
- Background sync

## 🎯 Obiettivo: Offline Libri

Per permettere lettura offline dei libri:

### 1. Service Worker Base
```javascript
// sw.js
const CACHE_NAME = 'onde-books-v1';
const BOOKS_CACHE = [
  '/books/meditations-en.pdf',
  '/books/milo.pdf',
  // ...
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(BOOKS_CACHE))
  );
});
```

### 2. Registrazione
```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

### 3. Offline UI
- Indicatore stato connessione
- "Salva per offline" button sui libri
- Lista libri salvati

## 📋 TODO
- [ ] Creare sw.js con cache strategy
- [ ] Registrare in layout.tsx
- [ ] UI per download offline
- [ ] Test su mobile
