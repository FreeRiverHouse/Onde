# Salmo 23 Kids - Guida Test su Expo Go

## Panoramica

**Salmo 23 Kids** e' l'app companion del libro "Il Salmo 23 per Bambini". Offre una versione interattiva della storia con illustrazioni, testo e audio narrazione.

**Stack:** React Native + Expo
**Target:** iOS/Android
**Eta' target:** 3-8 anni

---

## Prerequisiti

### 1. Ambiente di Sviluppo

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Expo CLI**: `npm install -g expo-cli`

### 2. Expo Go sul Telefono

Installa Expo Go da App Store (iOS) o Play Store (Android).

---

## Avvio Progetto

```bash
# Vai alla cartella
cd /Users/mattia/Projects/Onde/apps/salmo-23-kids

# Installa dipendenze (prima volta)
npm install

# Avvia Expo
npx expo start
```

### Test su Dispositivo

1. Assicurati che telefono e Mac siano sulla **stessa rete WiFi**
2. Avvia `npx expo start`
3. Scannerizza il QR code con Expo Go

### Test su Simulatore

```bash
# iOS
npx expo start --ios

# Android
npx expo start --android
```

---

## Checklist Funzionalita'

### Home Screen
- [ ] Splash/titolo visibile
- [ ] Bottone "Inizia la Storia" funzionante
- [ ] Credits visibili

### Lista Capitoli
- [ ] 6 capitoli listati
- [ ] Card colorate per capitolo
- [ ] Tap apre capitolo corretto

### Schermata Capitolo
- [ ] Titolo capitolo visibile
- [ ] Placeholder illustrazione
- [ ] Testo storia leggibile (font grande)
- [ ] Bottone audio presente
- [ ] Navigazione Indietro/Avanti funzionante
- [ ] Ultimo capitolo torna alla Home

### Audio (da implementare)
- [ ] Bottone "Ascolta la Storia"
- [ ] Playback/Pausa
- [ ] Audio sincronizzato al capitolo

### Design
- [ ] Palette colori coerente (beige/marrone)
- [ ] Font leggibile per bambini
- [ ] Touch target grandi (>= 44pt)

### Offline
- [ ] App funziona senza internet

---

## Screenshot da Catturare

```
/Users/mattia/Projects/Onde/apps/salmo-23-kids/screenshots/
├── home.png
├── chapter-list.png
├── chapter-1.png
├── chapter-4.png (valle oscura)
├── chapter-6.png (finale)
└── navigation.png
```

---

## Prossimi Passi

1. Copiare immagini da `books/salmo-23-bambini/images/` a `src/assets/images/`
2. Generare audio con ElevenLabs (voce Marco)
3. Implementare playback audio con expo-av
4. Test su device fisico
5. Pubblicare su App Store

---

## Path Libro Originale

```
/Users/mattia/Projects/Onde/books/salmo-23-bambini/
├── images/
│   ├── 00-copertina.jpg
│   ├── 01-pastore.jpg
│   ├── 02-acque-tranquille.jpg
│   ├── 03-sentieri.jpg
│   ├── 04-valle-oscura.jpg
│   ├── 05-tavola.jpg
│   └── 06-casa-signore.jpg
└── libro.md  # Testo completo
```

---

*Ultimo aggiornamento: 2026-01-09*
*Task: apps-new-002*
