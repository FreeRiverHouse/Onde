# Salmo 23 Kids App

App React Native + Expo che porta il libro "Il Salmo 23 per Bambini" su dispositivi mobili.

## Caratteristiche

- 6 capitoli illustrati del Salmo 23 per bambini
- Navigazione intuitiva tra capitoli
- Audio narrazione (da implementare)
- Design caldo e accogliente stile Onde

## Struttura

```
salmo-23-kids/
├── App.js                    # Entry point con navigation
├── app.json                  # Config Expo
├── package.json              # Dipendenze
├── babel.config.js           # Babel config
└── src/
    ├── screens/
    │   ├── HomeScreen.js     # Schermata principale
    │   ├── ChapterListScreen.js  # Lista capitoli
    │   └── ChapterScreen.js  # Lettura capitolo
    ├── components/           # Componenti riutilizzabili
    └── assets/
        ├── images/           # Illustrazioni libro
        └── audio/            # Audio narrazioni
```

## Setup

```bash
# Installa dipendenze
npm install

# Avvia Expo
npx expo start

# iOS Simulator
npx expo start --ios

# Android Emulator
npx expo start --android
```

## TODO

- [ ] Copiare immagini da `/books/salmo-23-bambini/images/`
- [ ] Generare audio narrazione con ElevenLabs
- [ ] Aggiungere animazioni page turn
- [ ] Implementare playback audio con expo-av
- [ ] Aggiungere splash screen
- [ ] Creare icona app

## Contenuto

Basato sul libro "Il Salmo 23 per Bambini":
- Testi: Gianni Parola
- Illustrazioni: Pina Pennello (via Grok)
- Casa Editrice: Onde

## Path Libro Originale

`/Users/mattia/Projects/Onde/books/salmo-23-bambini/`

## Palette Colori

- Background: `#f5e6d3` (beige caldo)
- Testo primario: `#5a4a3a` (marrone scuro)
- Testo secondario: `#7a6a5a` (marrone medio)
- Accento: `#8B7355` (marrone caldo)
- Card backgrounds: variabili per capitolo
