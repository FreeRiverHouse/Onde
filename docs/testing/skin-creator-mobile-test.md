# Skin Creator - Mobile Testing Checklist

## 🎯 URL da testare
https://onde.la/games/skin-creator/

## 📱 Device da testare

### iOS
- [ ] iPhone SE (small screen)
- [ ] iPhone 14/15 (standard)
- [ ] iPhone 14/15 Pro Max (large)
- [ ] iPad (tablet)

### Android
- [ ] Samsung Galaxy (mid-range)
- [ ] Pixel (stock Android)
- [ ] Budget device (<$200)

## ✅ Checklist per ogni device

### 1. Caricamento
- [ ] Pagina carica in <3 secondi
- [ ] No errori JavaScript in console
- [ ] Canvas 3D renderizza correttamente

### 2. Touch Controls
- [ ] Tap su canvas funziona per disegnare
- [ ] Pinch-to-zoom funziona (se implementato)
- [ ] Swipe per ruotare 3D preview
- [ ] Nessun zoom accidentale del browser

### 3. UI/UX Mobile
- [ ] Toolbar visibile e usabile
- [ ] Bottoni abbastanza grandi (min 44x44px tap target)
- [ ] Color picker funziona
- [ ] Body part selector funziona
- [ ] Nessun overflow orizzontale

### 4. Funzionalità Core
- [ ] Disegno pixel preciso
- [ ] Colori applicati correttamente
- [ ] Undo/Redo funziona
- [ ] Clear funziona
- [ ] 3D preview aggiorna in real-time

### 5. Download
- [ ] Bottone download visibile
- [ ] Download funziona su mobile
- [ ] File PNG valido e corretto

### 6. Landscape Mode
- [ ] Layout si adatta
- [ ] Tutto rimane usabile
- [ ] 3D preview non si rompe

### 7. Performance
- [ ] Smooth drawing (no lag)
- [ ] 3D preview fluido (30+ FPS)
- [ ] No memory leaks dopo uso prolungato

## 🐛 Bug da segnalare

| Device | Issue | Severity | Notes |
|--------|-------|----------|-------|
| | | | |

## 📊 Quick Test (5 minuti per device)

1. Apri URL
2. Disegna qualcosa sulla testa
3. Cambia colore, disegna sul corpo
4. Ruota 3D preview
5. Scarica PNG
6. Verifica file scaricato

## 🛠️ Tools per testing remoto

- **BrowserStack**: browserstack.com (ha free tier)
- **LambdaTest**: lambdatest.com
- **Chrome DevTools**: Device Mode (F12 → toggle device toolbar)

## 📝 Note

Priorità testing:
1. iPhone (maggioranza traffico mobile)
2. Android mid-range (mercato più grande)
3. Tablet (UX diversa)

---

*Ultimo update: 2026-02-03*
