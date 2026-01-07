# App Factory Plan 2026 - RASTRELLARE

## Stack Raccomandato (ABBANDONIAMO UNITY)

### Perché NON Unity
- Troppo complesso per giochi educativi semplici
- Build falliscono continuamente
- Tempo di sviluppo: settimane invece di ore
- Overkill per puzzle, quiz, storie interattive

### Nuovo Stack VELOCE

| Tool | Uso | Tempo Deploy |
|------|-----|--------------|
| **React Native + Expo** | App cross-platform (iOS/Android) | Ore |
| **Google AI Studio** | Prototipi web apps | 2 minuti |
| **Rork** ($20/mese) | MVP mobile velocissimi | Minuti |
| **PWA + Capacitor** | Web → App Store | Ore |
| **FlutterFlow** | No-code Flutter apps | Ore |

### Flusso di Lavoro
1. **Prototipo**: Google AI Studio / v0.dev / bolt.new
2. **MVP Mobile**: Rork o Expo
3. **Produzione**: React Native + Expo EAS Build
4. **Deploy**: App Store + Play Store

---

## APP DA SVILUPPARE - PRIORITÀ

### TIER 1: Esistenti da Finire (SUBITO)

| App | Stato | Azione | Target |
|-----|-------|--------|--------|
| **KidsChefStudio** | Unity OK | MIGRARE a React Native | 2 settimane |
| **KidsMusicStudio** | Unity WIP | MIGRARE a React Native | 2 settimane |
| **KidsGameStudio** | Concept | Iniziare in React Native | 2 settimane |

### TIER 2: Nuove App Educative (Q1 2026)

| App | Concept | Monetizzazione | Mercato |
|-----|---------|----------------|---------|
| **AIKO Interactive** | Libro AI → App con quiz, mini-games | Freemium + IAP | Global |
| **Piccole Rime** | Poesie italiane animate + audio | $2.99 | IT/Global |
| **Salmo 23 Kids** | Meditazione guidata per bambini | Freemium | USA/Global |
| **Mindful Kids** | Respirazione, emozioni, calma | Subscription | Global |
| **ABC della Gentilezza** | Storie interattive gentilezza | $1.99 | IT/Global |

### TIER 3: App Spirituali/Manifestazione (Q2 2026)

| App | Concept | Monetizzazione | Mercato |
|-----|---------|----------------|---------|
| **Law of Attraction Kids** | Mini-games manifestazione | Freemium | USA/UK |
| **Gratitude Journal Jr** | Diario gratitudine per bambini | $2.99 | Global |
| **Dream Board Kids** | Vision board interattivo | Freemium + IAP | Global |
| **Positive Affirmations** | Audio + animazioni affermazioni | Subscription | Global |

### TIER 4: Puzzle & Activity (Q2 2026)

| App | Concept | Monetizzazione | Mercato |
|-----|---------|----------------|---------|
| **Poetry Puzzles** | Puzzle con versi poesia | $1.99 | Global |
| **Word Garden** | Gioco parole per bambini | Freemium | Global |
| **Color & Calm** | Coloring + musica rilassante | Freemium + IAP | Global |
| **Story Builder** | Crea storie interattive | Subscription | Global |

---

## ARCHITETTURA TECNICA

### Template Base React Native + Expo

```
app-template/
├── src/
│   ├── screens/          # Schermate
│   ├── components/       # UI riutilizzabili
│   ├── assets/          # Immagini, audio
│   ├── hooks/           # Custom hooks
│   └── services/        # API, analytics
├── app.json             # Config Expo
└── eas.json             # Build config
```

### Features Standard per Ogni App
- [ ] Onboarding animato
- [ ] Parental gate (moltiplicazione)
- [ ] No ads per bambini < 13 (COPPA)
- [ ] Offline mode
- [ ] Analytics (Firebase)
- [ ] In-app purchases (RevenueCat)
- [ ] Push notifications
- [ ] Multi-lingua (IT, EN, ES, DE, FR, KO, JA)

### CI/CD Pipeline
1. GitHub Actions → Build automatico
2. Expo EAS → Build iOS/Android
3. TestFlight + Internal Testing
4. App Store + Play Store submit

---

## CALENDARIO RILASCI

### Gennaio 2026
- [ ] Setup nuovo stack React Native
- [ ] Migrare KidsChefStudio (prototipo)
- [ ] AIKO Interactive MVP

### Febbraio 2026
- [ ] KidsChefStudio su App Store
- [ ] KidsMusicStudio migrazione
- [ ] Piccole Rime app
- [ ] Salmo 23 Kids app

### Marzo 2026
- [ ] 5 app su App Store
- [ ] Mindful Kids
- [ ] Law of Attraction Kids

### Q2 2026
- [ ] 10+ app su entrambi store
- [ ] Revenue target: $5k/mese

---

## RISORSE

### Tool AI per Accelerare
- **Immagini**: Grok (multi-tab = 20 img/minuto)
- **UI**: v0.dev, bolt.new
- **Codice**: Claude Code, Cursor
- **Prototipi**: Google AI Studio

### Asset Libraries
- LottieFiles (animazioni)
- Freepik/Flaticon (icone)
- ElevenLabs (voci narranti)
- Suno (musica)

---

## METRICHE SUCCESSO

| Metrica | Target Q1 | Target Q2 |
|---------|-----------|-----------|
| App pubblicate | 5 | 15 |
| Downloads totali | 10k | 50k |
| Revenue mensile | $1k | $5k |
| Rating medio | 4.5+ | 4.7+ |
| Paesi | 10 | 30 |

---

*Ultimo aggiornamento: 2026-01-06*
*Prossimo review: 2026-01-13*
