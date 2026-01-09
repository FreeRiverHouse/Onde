# KidsChefStudio

**App di cucina educativa per bambini**

Stack: React Native + Expo

---

## Concept

KidsChefStudio e' un gioco educativo dove i bambini imparano a cucinare attraverso mini-giochi interattivi. Ogni ricetta e' divisa in passaggi semplici con:
- Ingredienti illustrati
- Azioni drag-and-drop (mescolare, tagliare, versare)
- Timer visivi
- Risultato finale animato

---

## Target

- **Eta'**: 4-10 anni
- **Lingue**: IT, EN, ES, DE, FR
- **Piattaforme**: iOS, Android

---

## Features MVP

### Ricette Base (5 ricette)
1. **Pizza Margherita** - Impasto, salsa, mozzarella
2. **Biscotti** - Impasto, formine, forno
3. **Frullato di Frutta** - Frutta, frullatore, decorazione
4. **Insalata Colorata** - Lavare, tagliare, condire
5. **Panino** - Scegliere ingredienti, assemblare

### Meccaniche di Gioco
- Drag-and-drop ingredienti
- Tap-to-chop (tagliare)
- Swipe-to-stir (mescolare)
- Timer countdown
- Stelle per completamento

### Gamification
- 3 stelle per ricetta
- Badge sbloccabili
- Cappello chef personalizzabile
- Suoni divertenti

---

## Monetizzazione

- **Free**: 2 ricette + funzionalita' base
- **Premium ($2.99)**: Tutte le ricette + badge
- **In-App Purchases**: Pacchetti ricette aggiuntive ($0.99 ciascuno)

---

## Tech Stack

```
React Native + Expo (SDK 51+)
├── Navigation: expo-router
├── Animations: react-native-reanimated
├── Gestures: react-native-gesture-handler
├── Audio: expo-av
├── Storage: @react-native-async-storage
├── Analytics: expo-firebase-analytics
├── Purchases: react-native-purchases (RevenueCat)
└── Build: Expo EAS
```

---

## Struttura Progetto

```
kids-chef-studio/
├── app/                    # Expo Router pages
│   ├── index.tsx          # Home/Menu ricette
│   ├── recipe/[id].tsx    # Schermata ricetta
│   ├── play/[id].tsx      # Gameplay ricetta
│   └── settings.tsx       # Impostazioni
├── src/
│   ├── components/        # UI components
│   │   ├── Ingredient.tsx
│   │   ├── KitchenItem.tsx
│   │   ├── Timer.tsx
│   │   └── StarRating.tsx
│   ├── data/
│   │   └── recipes.json   # Dati ricette
│   ├── hooks/
│   │   └── useRecipe.ts
│   └── utils/
│       └── sounds.ts
├── assets/
│   ├── images/
│   │   ├── ingredients/   # PNG ingredienti
│   │   ├── tools/         # Utensili cucina
│   │   └── backgrounds/   # Sfondi
│   └── audio/
│       ├── music/         # Background music
│       └── sfx/           # Sound effects
├── app.json
├── eas.json
└── package.json
```

---

## Setup Sviluppo

```bash
# Installare dipendenze
npm install

# Avviare in dev
npx expo start

# Build iOS
eas build --platform ios

# Build Android
eas build --platform android
```

---

## Stile Grafico

### Palette Colori
- **Primario**: Arancione caldo (#FF6B35)
- **Secondario**: Verde mela (#4CAF50)
- **Sfondo**: Crema (#FFF8E7)
- **Accento**: Giallo (#FFD93D)

### Stile Illustrazioni
- Cartoonesco ma elegante
- Ingredienti con espressioni simpatiche
- NO Pixar 3D, stile flat colorato
- Bordi arrotondati, ombre morbide

### Font
- Titoli: Rounded (es. Nunito Bold)
- Testo: Sans-serif friendly (es. Poppins)

---

## Ricetta Esempio: Pizza

### Steps
1. **Prepara l'impasto** - Drag farina + acqua nella ciotola, swipe per mescolare
2. **Stendi l'impasto** - Tap-tap-tap per stendere
3. **Aggiungi salsa** - Drag salsa, swipe per spalmare
4. **Metti la mozzarella** - Drag mozzarella, tap per spezzettare
5. **Cuoci** - Timer 30 secondi con animazione forno
6. **Finito!** - Risultato con stelle

### Assets Necessari (per ricetta)
- 5-6 ingredienti PNG (trasparente)
- 1 sfondo cucina
- Animazioni: mescolamento, cottura, risultato
- SFX: sizzle, chop, ding

---

## Prossimi Passi

1. [ ] Setup progetto Expo (`npx create-expo-app`)
2. [ ] Configurare expo-router
3. [ ] Creare componenti base
4. [ ] Implementare prima ricetta (Pizza)
5. [ ] Aggiungere audio
6. [ ] Test su device fisico
7. [ ] Generare asset grafici con Grok
8. [ ] Build con EAS
9. [ ] Submit App Store

---

## Note Legali

- COPPA compliant (no tracking bambini < 13)
- Parental gate per acquisti
- Privacy policy required
- No ads per bambini

---

*Onde Apps - KidsChefStudio*
*Creato: Gennaio 2026*
