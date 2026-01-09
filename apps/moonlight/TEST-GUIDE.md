# Moonlight Interactive - Guida Test su Expo Go

## Panoramica

**Moonlight Interactive** e' un virtual pet in stile Tamagotchi moderno. Il giocatore si prende cura di Moonlight, un personaggio kawaii che deve essere nutrito, fatto giocare e messo a dormire. L'app include un sistema di stanze, animazioni fluide e meccaniche di gioco coinvolgenti.

**Stack:** React Native + Expo + Expo Router
**Target:** iOS/Android via Expo Go (sviluppo) + App Store/Play Store (produzione)
**Genere:** Virtual Pet / Tamagotchi
**Pubblico:** Bambini 4-10 anni

---

## Progetti Disponibili

Esistono 2 versioni dell'app in `/Users/mattia/Projects/OndeStandaloneApps/`:

| Versione | Path | Note |
|----------|------|------|
| **moonlight** | `/moonlight/` | Versione base, UI semplice |
| **moonlight-new** | `/moonlight-new/` | Versione avanzata con Expo Router |

**CONSIGLIATO**: Testare `moonlight-new` (versione piu' completa)

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
  npx expo --version
  ```

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

---

## Avvio Progetto

### Versione Base (moonlight)

```bash
cd /Users/mattia/Projects/OndeStandaloneApps/moonlight
npm install
npx expo start
```

### Versione Avanzata (moonlight-new) - CONSIGLIATA

```bash
cd /Users/mattia/Projects/OndeStandaloneApps/moonlight-new
npm install
npx expo start
```

### Opzioni Utili

```bash
# Pulisci cache (se ci sono problemi)
npx expo start --clear

# Modalita' tunnel (se QR non funziona)
npx expo start --tunnel

# Avvio diretto iOS
npx expo start --ios

# Avvio diretto Android
npx expo start --android
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

---

## Features da Testare

### Core Gameplay

| Feature | Versione Base | Versione New | Come Testare |
|---------|---------------|--------------|--------------|
| Personaggio animato | Emoji statico | Bounce animation | Osserva il personaggio, deve "saltellare" |
| Feed (Mangia) | OK | OK + animazione | Tap "Mangia" - costa 5 coins |
| Sleep (Dormi) | OK | OK + animazione | Tap "Dormi" - rigenera energia |
| Play (Gioca) | OK | OK + movimento | Tap "Gioca" - consuma energia, guadagna coins |
| Sistema coins | OK | OK | Inizia con 100, varia con azioni |
| Barre status | OK | OK animate | Health, Hunger, Energy |

### Features Avanzate (solo moonlight-new)

| Feature | Come Testare |
|---------|--------------|
| **Multiple Rooms** | Tap sulle icone in alto (Camera, Cucina, Salotto) |
| **Room transitions** | Cambia stanza - sfondo cambia colore |
| **Activity bubbles** | Durante azioni, appare fumetto ("Gnam gnam...", "Zzz...") |
| **Disabilitazione bottoni** | Durante un'azione, altri bottoni devono essere grigi |
| **Mood dinamico** | L'emoji del personaggio cambia in base agli stats |

### Checklist Funzionalita'

- [ ] App si avvia senza crash
- [ ] Header mostra "Moonlight" e coins
- [ ] Personaggio visibile con animazione bounce
- [ ] Bottone "Mangia" funziona e toglie coins
- [ ] Bottone "Gioca" funziona e aggiunge coins
- [ ] Bottone "Dormi" funziona e rigenera energy
- [ ] Barre status si aggiornano in tempo reale
- [ ] Mood emoji cambia quando stats bassi
- [ ] (New) Cambio stanza funziona
- [ ] (New) Fumetto attivita' appare
- [ ] UI responsive su diversi iPhone

---

## Bug Noti da Verificare

### 1. Race Condition nelle Azioni
**Descrizione**: Se l'utente spamma i bottoni velocemente durante un'azione, potrebbero verificarsi stati inconsistenti.
**Come testare**: Durante "Dormi" (3 sec), provare a cliccare altri bottoni ripetutamente.
**Expected**: Bottoni devono essere disabilitati durante l'azione.

### 2. Coins Negativi
**Descrizione**: Verificare che non si possa andare sotto 0 coins.
**Come testare**: Spendere tutti i coins con "Mangia" (5 coins ciascuno).
**Expected**: "Mangia" non deve funzionare se coins < 5.

### 3. Stats Over 100
**Descrizione**: Gli stats non devono superare 100.
**Come testare**: Ripetere "Dormi" molte volte quando energy e' gia' alto.
**Expected**: Energy deve fermarsi a 100.

### 4. Stato Iniziale dopo Ricarica
**Descrizione**: Verificare che lo stato iniziale sia consistente.
**Come testare**: Ricarica l'app (shake > Reload) e verifica stats iniziali.
**Expected**: Health 80, Hunger 60, Energy 90, Coins 100.

### 5. Animazioni Bloccate (moonlight-new)
**Descrizione**: L'animazione bounce potrebbe bloccarsi dopo un po'.
**Come testare**: Lasciare l'app aperta per 5+ minuti.
**Expected**: Il personaggio deve continuare a saltellare.

---

## Miglioramenti Suggeriti

### Priorita' Alta (MVP)

1. **Persistenza Dati**
   - Salvare stato con AsyncStorage
   - Ripristinare stats al riavvio
   - Timer reale (pet ha fame anche quando app chiusa)

2. **Effetti Sonori**
   - Suono quando mangia (gnam)
   - Suono quando gioca (risata)
   - Musica di sottofondo rilassante

3. **Tutorial Iniziale**
   - Prima apertura: spiegazione meccaniche
   - Indicatori visivi sui bottoni

### Priorita' Media

1. **Sistema di Livelli**
   - XP e progressione
   - Sbloccare nuove stanze
   - Sbloccare vestiti/accessori

2. **Personalizzazione**
   - Scegliere nome del pet
   - Cambiare colore/aspetto
   - Arredare stanze

3. **Notifiche Push**
   - Avvisa quando hunger basso
   - Reminder giornalieri

### Priorita' Bassa (Future)

1. **Mini-Games**
   - Memory (gia' esiste come moonlight-puzzle)
   - Catch the stars
   - Puzzle

2. **Social Features**
   - Visitare pet degli amici
   - Scambio regali

3. **Contenuti Stagionali**
   - Decorazioni natalizie
   - Eventi speciali

---

## Screenshot da Catturare

### Per App Store

1. **Splash Screen** - Logo Moonlight
2. **Home Camera** - Personaggio nella camera
3. **Azione Mangia** - Fumetto "Gnam gnam..."
4. **Cambio Stanza** - Vista cucina
5. **Stats Bassi** - Mood triste del personaggio
6. **Azione Gioca** - Animazione movimento

### Come Catturare Screenshot

**iOS (Simulatore):**
```bash
xcrun simctl io booted screenshot ~/Downloads/moonlight-screen.png
```

**iOS (Fisico):**
- Premi Power + Volume Su contemporaneamente

---

## Comandi Debug

```bash
# Log in tempo reale
npx expo start

# Shake telefono per menu debug
# Oppure: Cmd+D (iOS Simulator)

# Reload app
# Premi 'r' nel terminale

# Apri React DevTools
# Premi 'j' nel terminale
```

---

## Build per App Store

```bash
# Setup EAS
npx eas-cli login
npx eas-cli build:configure

# Build iOS
eas build --platform ios

# Build Android
eas build --platform android
```

---

## Files Progetto (moonlight-new)

```
moonlight-new/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx    # Tab navigation
│   │   └── index.tsx      # Main game screen (11KB)
│   ├── _layout.tsx        # Root layout
│   └── modal.tsx          # Modal screen
├── components/            # UI components
├── assets/               # Immagini, icone
├── app.json              # Expo config
└── package.json          # Dependencies
```

---

## Riferimenti

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Animated](https://reactnative.dev/docs/animated)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- Moonlight Puzzle: `/Users/mattia/Projects/OndeStandaloneApps/moonlight-puzzle/`

---

## Contatti

**Task ID:** apps-expo-002
**Brand:** Onde Kids
**Bundle ID:** com.freeriverhouse.moonlight

---

*Ultimo aggiornamento: 2026-01-09*
*Report generato da Code Worker*
