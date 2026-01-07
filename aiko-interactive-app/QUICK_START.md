# 🚀 AIKO Interactive - Quick Start

## Testa l'App SUBITO (3 minuti)

### Opzione 1: Web Browser (più veloce)
```bash
cd aiko-interactive-app
npm start -- --web
```
Apri http://localhost:19006

### Opzione 2: iPhone/iPad (migliore esperienza)
1. **Scarica Expo Go** dall'App Store
2. **Lancia il server**:
   ```bash
   cd aiko-interactive-app
   npm start
   ```
3. **Scansiona il QR code** con Expo Go app
4. **L'app si carica** sul tuo dispositivo

### Opzione 3: Android
1. **Scarica Expo Go** da Google Play
2. Stesso processo dell'iPhone

---

## Build per App Store (quando pronto)

```bash
# Setup EAS (una volta sola)
npm install -g eas-cli
eas login

# Build iOS
eas build --platform ios --profile preview

# Build Android
eas build --platform android --profile preview
```

---

## Troubleshooting

**Errore: Module not found**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Expo non si connette**
- Assicurati che telefono e computer siano sulla stessa WiFi
- Disabilita firewall temporaneamente

**Immagini non si caricano**
- Verifica che tutte le 9 immagini siano in `assets/images/`
- Restart dell'app (`r` in terminal)

---

## Features da Testare

1. **Home Screen** - Tap "Start Reading"
2. **Chapter List** - Scorri i capitoli, tap su uno
3. **Chapter 1** - Leggi il testo, poi tap sul button gioco
4. **Discovery Game** - Tap AIKO 7+ volte per svegliarlo
5. **Chapter 2** - Prova il Pattern Matching game
6. **Navigation** - Back button funziona ovunque

---

## Performance

L'app dovrebbe essere:
- **Smooth** - 60 FPS su animazioni
- **Responsive** - Touch immediato
- **Fast** - Caricamento < 2 secondi

Se lenta, verifica che sia in **development mode** (production sarà molto più veloce).

---

*Path: /home/user/Onde/aiko-interactive-app*
