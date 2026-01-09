# Mad Math - Guida Test su Expo Go

## Panoramica

**Mad Math** e' un'app di matematica per bambini che rende divertente l'apprendimento delle operazioni base. Include giochi, sfide e progressione con livelli.

**Stack:** React Native + Expo
**Target:** iOS/Android via Expo Go (sviluppo) + App Store/Play Store (produzione)
**Eta' target:** 5-10 anni

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

### 2. Expo Go sul Telefono

**iOS:**
1. Apri App Store
2. Cerca "Expo Go"
3. Installa l'app di Expo

**Android:**
1. Apri Play Store
2. Cerca "Expo Go"
3. Installa l'app di Expo

---

## Avvio Progetto

### Prima Volta (Setup)

```bash
# Vai alla cartella del progetto
cd /Users/mattia/Projects/Onde/apps/mad-math

# Installa dipendenze
npm install

# Avvia Metro bundler + server Expo
npx expo start
```

### Avvii Successivi

```bash
cd /Users/mattia/Projects/Onde/apps/mad-math
npx expo start
```

### Opzioni Utili

```bash
# Pulisci cache (se ci sono problemi)
npx expo start --clear

# Modalita' tunnel (se LAN non funziona)
npx expo start --tunnel

# Solo iOS Simulator
npx expo start --ios

# Solo Android Emulator
npx expo start --android
```

---

## Test su Dispositivo Fisico

### iOS (iPhone/iPad)

1. Assicurati che iPhone e Mac siano sulla **stessa rete WiFi**
2. Avvia `npx expo start` nel terminale
3. Apri l'app **Expo Go** su iPhone
4. Scannerizza il QR code
5. L'app si carichera' automaticamente

### Android

1. Assicurati che telefono e Mac siano sulla **stessa rete WiFi**
2. Avvia `npx expo start` nel terminale
3. Apri l'app **Expo Go** su Android
4. Scannerizza il QR code
5. L'app si carichera' automaticamente

---

## Test su Simulatore

### iOS Simulator (solo Mac)

```bash
npx expo start --ios
# Oppure premi 'i' dopo aver avviato expo start
```

**Prerequisito:** Xcode + Command Line Tools installati

### Android Emulator

```bash
npx expo start --android
# Oppure premi 'a' dopo aver avviato expo start
```

**Prerequisito:** Android Studio + AVD configurato

---

## Checklist Funzionalita' da Verificare

### UI e Navigazione
- [ ] App si avvia senza crash
- [ ] Splash screen con logo Mad Math
- [ ] Menu principale accessibile
- [ ] Transizioni fluide tra schermate
- [ ] Bottoni con feedback visivo al tap
- [ ] Font leggibile per bambini (size grande)

### Operazioni Matematiche

**Addizione:**
- [ ] Problemi generati correttamente (es: 3 + 5 = ?)
- [ ] Risposta corretta accettata
- [ ] Risposta sbagliata segnalata
- [ ] Feedback sonoro/visivo

**Sottrazione:**
- [ ] Problemi generati correttamente (es: 8 - 3 = ?)
- [ ] No numeri negativi per bambini piccoli
- [ ] Feedback corretto

**Moltiplicazione:**
- [ ] Tabelline base (1-10)
- [ ] Difficolta' progressiva

**Divisione:**
- [ ] Solo divisioni esatte (no decimali)
- [ ] Difficolta' appropriata

### Gamification
- [ ] Sistema punteggio funzionante
- [ ] Stelle/badge per completamento
- [ ] Progressione livelli
- [ ] Effetti celebrativi (animazioni, suoni)

### Audio
- [ ] Musica di sottofondo (opzionale)
- [ ] Effetti sonori (corretto/sbagliato)
- [ ] Feedback vocale (opzionale)
- [ ] Controllo volume/mute

### Parental Gate
- [ ] Gate attivo prima di impostazioni
- [ ] Domanda matematica difficile (per adulti)
- [ ] Gate attivo prima di acquisti IAP
- [ ] Non bypassabile da bambino

### Accessibilita'
- [ ] Colori ad alto contrasto
- [ ] Testo grande
- [ ] Touch target >= 44pt

### Performance
- [ ] Nessun lag durante calcoli
- [ ] Animazioni fluide
- [ ] Memoria stabile

### Offline Mode
- [ ] Gioco funziona senza internet
- [ ] Progressi salvati localmente

---

## Screenshot da Catturare

### Screenshot Essenziali

1. **Splash Screen** - Logo Mad Math
2. **Home/Menu** - Selezione operazione
3. **Gameplay Addizione** - Problema attivo
4. **Risposta Corretta** - Feedback positivo
5. **Risposta Sbagliata** - Feedback errore
6. **Fine Livello** - Punteggio/stelle
7. **Progressione** - Mappa livelli
8. **Impostazioni** - Con parental gate

### Dove Salvare

```
/Users/mattia/Projects/Onde/apps/mad-math/screenshots/
├── splash.png
├── home.png
├── gameplay-addition.png
├── correct-answer.png
├── wrong-answer.png
├── level-complete.png
├── progression-map.png
└── settings.png
```

---

## Debug

```bash
# Log in tempo reale
npx expo start

# Shake telefono per menu debug
# Cmd+D (iOS) / Cmd+M (Android)

# Reload app: premi 'r' nel terminale
# DevTools: premi 'j' nel terminale
```

---

## Note Pedagogiche

### Principi Design Mad Math

1. **Incoraggiamento**: Mai criticare errori, sempre incoraggiare
2. **Ripetizione**: Problemi sbagliati riproposti per rinforzare
3. **Progressione**: Difficolta' graduale, mai frustrante
4. **Celebrazione**: Ogni successo e' una festa
5. **Pausa**: Permettere pause senza penalita'

### Bilanciamento Difficolta'

| Eta' | Addizione | Sottrazione | Moltiplicazione | Divisione |
|------|-----------|-------------|-----------------|-----------|
| 5-6  | 1-10      | 1-10        | -               | -         |
| 7-8  | 1-20      | 1-20        | x1, x2, x5      | /2, /5    |
| 9-10 | 1-100     | 1-100       | x1-10           | /1-10     |

---

## Riferimenti

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- App Factory Plan: `/Users/mattia/Projects/Onde/APP-FACTORY-PLAN.md`

---

*Ultimo aggiornamento: 2026-01-09*
*Task: apps-expo-004*
