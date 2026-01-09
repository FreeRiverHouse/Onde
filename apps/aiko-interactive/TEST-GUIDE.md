# AIKO Interactive - Guida Test su Expo Go

## Panoramica

**AIKO Interactive** e' l'app companion del libro "AIKO: AI Spiegata ai Bambini". Trasforma la storia di Sofia e AIKO in un'esperienza interattiva con quiz, mini-games e contenuti educativi sull'intelligenza artificiale.

**Stack:** React Native + Expo
**Target:** iOS/Android via Expo Go (sviluppo) + App Store/Play Store (produzione)

---

## Prerequisiti

### 1. Ambiente di Sviluppo

- **Node.js** >= 18.x (LTS consigliato)
  ```bash
  node --version  # Verifica versione
  ```

- **npm** >= 9.x o **yarn**
  ```bash
  npm --version
  ```

- **Expo CLI** (globale)
  ```bash
  npm install -g expo-cli
  # oppure
  npx expo --version
  ```

- **Git** (per clonare/push)

### 2. Expo Go sul Telefono

**iOS:**
1. Apri App Store
2. Cerca "Expo Go"
3. Installa l'app di Expo
4. Accedi con account Expo (opzionale ma consigliato)

**Android:**
1. Apri Play Store
2. Cerca "Expo Go"
3. Installa l'app di Expo
4. Accedi con account Expo (opzionale)

### 3. Account Expo (Opzionale ma Consigliato)

Crea un account gratuito su https://expo.dev per:
- Scansionare QR code piu' facilmente
- Vedere cronologia progetti
- Build cloud con EAS

---

## Avvio Progetto

### Prima Volta (Setup)

```bash
# Vai alla cartella del progetto
cd /Users/mattia/Projects/Onde/apps/aiko-interactive

# Installa dipendenze
npm install

# Avvia Metro bundler + server Expo
npx expo start
```

### Avvii Successivi

```bash
cd /Users/mattia/Projects/Onde/apps/aiko-interactive
npx expo start
```

### Opzioni Utili

```bash
# Pulisci cache (se ci sono problemi)
npx expo start --clear

# Solo QR code (senza menu interattivo)
npx expo start --tunnel

# Modalita' LAN (stesso WiFi)
npx expo start --lan

# Modalita' localhost (solo emulatore)
npx expo start --localhost
```

---

## Test su Dispositivo Fisico

### iOS (iPhone/iPad)

1. **Assicurati che iPhone e Mac siano sulla STESSA rete WiFi**
2. Avvia `npx expo start` nel terminale
3. Apri l'app **Expo Go** su iPhone
4. Scannerizza il QR code mostrato nel terminale
5. L'app si carichera' automaticamente

**Troubleshooting iOS:**
- Se il QR non funziona, prova `npx expo start --tunnel`
- Se carica lento, controlla connessione WiFi
- Se crasha, chiudi completamente Expo Go e riprova

### Android

1. **Assicurati che telefono e Mac siano sulla STESSA rete WiFi**
2. Avvia `npx expo start` nel terminale
3. Apri l'app **Expo Go** su Android
4. Scannerizza il QR code mostrato nel terminale
5. L'app si carichera' automaticamente

**Troubleshooting Android:**
- Abilita "USB debugging" nelle opzioni sviluppatore
- Se il QR non funziona, copia il link `exp://...` e aprilo in Expo Go
- Prova `npx expo start --tunnel` se sei dietro firewall

---

## Test su Emulatore/Simulatore

### iOS Simulator (solo Mac)

```bash
# Avvia il progetto
npx expo start

# Premi 'i' per aprire iOS Simulator
# Oppure
npx expo start --ios
```

**Prerequisito:** Xcode installato + Command Line Tools

### Android Emulator

```bash
# Avvia il progetto
npx expo start

# Premi 'a' per aprire Android Emulator
# Oppure
npx expo start --android
```

**Prerequisito:** Android Studio + AVD configurato

---

## Checklist Funzionalita' da Verificare

### Navigazione e UI
- [ ] App si avvia senza crash
- [ ] Splash screen visibile
- [ ] Transizioni fluide tra schermate
- [ ] Bottoni rispondono al tap (feedback visivo)
- [ ] Testo leggibile (font size adeguato)
- [ ] Immagini caricate correttamente

### Contenuti AIKO
- [ ] Storia di Sofia e AIKO accessibile
- [ ] Illustrazioni del libro visibili
- [ ] Capitoli navigabili in ordine
- [ ] Audio narrazioni (se presenti) funzionanti

### Quiz e Mini-Games
- [ ] Quiz carica correttamente
- [ ] Risposte selezionabili
- [ ] Feedback corretto/sbagliato visibile
- [ ] Punteggio aggiornato
- [ ] Mini-games giocabili
- [ ] Controlli touch responsivi

### Audio
- [ ] Musica di sottofondo (se presente)
- [ ] Effetti sonori
- [ ] Voce narrante (se presente)
- [ ] Controllo volume funzionante
- [ ] Pausa/riprendi audio

### Offline Mode
- [ ] App funziona senza connessione internet
- [ ] Contenuti pre-caricati accessibili
- [ ] Nessun errore di rete mostrato

### Performance
- [ ] Nessun lag evidente
- [ ] Animazioni fluide (60fps)
- [ ] Memoria non eccessiva
- [ ] Batteria non si scarica velocemente

### Parental Gate
- [ ] Gate attivo prima di acquisti/link esterni
- [ ] Domanda matematica appropriata
- [ ] Non bypassabile da bambino

### Multi-Lingua (se implementato)
- [ ] Italiano funzionante
- [ ] Inglese funzionante
- [ ] Cambio lingua senza crash

---

## Screenshot da Catturare per Documentazione

### Screenshot Essenziali

1. **Splash Screen** - Prima schermata con logo
2. **Home/Menu Principale** - Panoramica navigazione
3. **Schermata Capitolo** - Esempio di contenuto storia
4. **Quiz in Azione** - Domanda con opzioni visibili
5. **Mini-Game** - Gameplay attivo
6. **Risultato/Punteggio** - Schermata di fine quiz
7. **Impostazioni** - Menu settings

### Come Catturare Screenshot

**iOS (Simulatore):**
```bash
# Da terminale
xcrun simctl io booted screenshot screenshot.png

# Oppure: Cmd + S nel Simulator
```

**iOS (Fisico):**
- Premi Power + Volume Su contemporaneamente

**Android (Emulatore):**
- Bottone screenshot nella toolbar dell'emulatore
- Oppure: Ctrl + S

**Android (Fisico):**
- Premi Power + Volume Giu' contemporaneamente

### Dove Salvare

```
/Users/mattia/Projects/Onde/apps/aiko-interactive/screenshots/
├── splash.png
├── home.png
├── chapter.png
├── quiz.png
├── minigame.png
├── score.png
└── settings.png
```

---

## Comandi Utili Debug

```bash
# Log in tempo reale
npx expo start --dev-client

# Shake telefono per aprire menu debug
# Oppure: Cmd+D (iOS) / Cmd+M (Android)

# Reload app
# Premi 'r' nel terminale

# Apri React DevTools
# Premi 'j' nel terminale
```

---

## Build per App Store (Produzione)

Quando l'app e' pronta per la pubblicazione:

```bash
# Build iOS
eas build --platform ios

# Build Android
eas build --platform android

# Build entrambi
eas build --platform all
```

**Nota:** Richiede account Expo con piano (anche free funziona con limiti)

---

## Riferimenti

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [Expo Go](https://expo.dev/client)
- Libro AIKO: `/Users/mattia/Projects/Onde/books/aiko-ai-children/`

---

*Ultimo aggiornamento: 2026-01-09*
*Task: apps-expo-001*
