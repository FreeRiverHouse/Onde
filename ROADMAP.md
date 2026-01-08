# Onde - Roadmap 2026

> **"Facciamo fiorire il mondo. Questa è la missione."**

**Ultimo aggiornamento**: 2026-01-08 (sera) - Bio @Onde_FRH con tag @AnthropicAI e @grok, post Stella Stellina pubblicato

---

## 🔴 PRIORITÀ IMMEDIATE (Slack 7 Gen 2026)

### 1. Kanban Dashboard Agenti (🔥 SUBITO)
Ispirato a [@housecor](https://x.com/housecor/status/2008905575669662019):
- [ ] Dashboard unica per controllare tutti gli agenti
- [ ] Card ROSSA quando agente è bloccato
- [ ] Un posto per monitorare e interagire
- [ ] Integrazione con BIB Dashboard

### 2. Visual Style Unificato + Pina Pennello
- [ ] Creare personaggio **Pina Pennello** (giovane illustratrice, NON Mario con baffi)
- [ ] Aggiornare Gianni Parola
- [ ] Rifare TUTTE le immagini across the board col nuovo stile
- [ ] Aggiungere logo e facce autori nel back dei libri

### 3. Workflow Approvazione Veloce
Permettere a Mattia di approvare anche mentre lava i piatti:
- [x] **App Apple Watch "Onde Approve"** (CREATA 8 Gen 2026)
  - Due azioni: **Approva** (tap) e **Parla** (voce per task complessi)
  - Default: approva con tap
  - Se task richiede input specifico → voce
  - Feedback aptico (vibrazione) per conferme
  - Stack: SwiftUI standalone watchOS app
  - Path: `apps/onde-approve-watch/`
  - [ ] Deploy su Watch reale
  - [ ] Notifiche push quando agente è bloccato
- [ ] Bottone BT/USB rosso sul Mac
- [ ] Touch ID per email e acquisti Chrome
- [x] Telegram Bot con bottoni inline (funzionante)

---

## 🎯 Operation Tsunami - Piano Multimedia

### Valori Brand Onde
**Peaceful, growth oriented, kind, artistic, creative, inspiring, playful, friendly, relaxing, grateful, curious, open, wise, balanced**

### 🎬 Video Podcast - PROSSIMI EPISODI (PRIORITÀ ALTA!)
**Status**: Ep.01 Stella Stellina PUBBLICATO! Eccezionale risultato.

**Prossimi episodi da fare SUBITO:**
| # | Titolo | Testo | Status |
|---|--------|-------|--------|
| 01 | Stella Stellina | Lina Schwarz | ✅ LIVE su YouTube |
| 02 | Pioggerellina di Marzo | A.S. Novaro | DA FARE |
| 03 | La Befana | Guido Gozzano | DA FARE |
| 04 | Pulcino Bagnato | Tradizionale | DA FARE |
| 05 | Il Pesciolino d'Oro | Fiaba russa | DA FARE |

**Pipeline per ogni episodio:**
1. Testo → ElevenLabs (voce Marco/Gianni)
2. Immagine Gianni → Hedra lip sync
3. Upload YouTube + sottotitoli
4. Post su X con tutti i tag
5. Distribuisci su podcast platforms

### 📻 Distribuzione Podcast GRATUITA
**Piattaforme gratuite trovate:**

| Piattaforma | Costo | Note |
|-------------|-------|------|
| **Spotify for Creators** | GRATIS | Ex Anchor, diretto su Spotify |
| **Buzzsprout** | Free tier | Limitato ma funziona |
| **Podbean** | Free tier | Buone analytics |
| **YouTube** | GRATIS | Già attivo! |

**Per musica ambient (Onde Lounge):**
| Distributore | Costo | Royalties |
|--------------|-------|-----------|
| **Rebel Music** | GRATIS | 100% tue |
| **RouteNote** | GRATIS | 85% (prendono 15%) |
| **Level Music** | GRATIS | Warner-backed |

**Task immediato:**
- [ ] Creare account Spotify for Creators
- [ ] Upload Ep.01 Stella Stellina come podcast
- [ ] Setup RSS feed per distribuzione automatica

---

### 🎙️ Lip Sync Tool Interno (PRIORITÀ)
**Obiettivo**: Costruire sistema lip sync in-house per scalare podcast multilingua

**Perché**:
- Servizi esterni costano troppo (Hedra $12/mese = 4 min, non scala)
- Dobbiamo fare podcast in TUTTE le lingue
- Mac server disponibile per processing locale

**Stack Proposto**:
- **Wav2Lip** o **SadTalker** (modelli open source)
- Mac M-series come server di rendering
- Pipeline: Immagine + Audio → Video lip sync
- Target qualità: livello Hedra Character 3

**Task**:
- [ ] Setup ambiente Python con modelli lip sync
- [ ] Test qualità Wav2Lip vs SadTalker
- [ ] Pipeline automatica immagine+audio→video
- [ ] Benchmark performance su Mac

### 📢 Audio per Piattaforma (CTA Specifici)
**REGOLA**: Ogni piattaforma ha audio diverso con call-to-action specifico

| Piattaforma | CTA Audio | Note |
|-------------|-----------|------|
| **YouTube** | "Iscriviti al canale!" / "Subscribe!" | Fine video |
| **Spotify** | "Segui il podcast!" / "Follow!" | Fine episodio |
| **TikTok** | "Seguimi!" / "Follow!" | Breve |
| **Apple Podcasts** | "Lascia una recensione!" | Fine episodio |

**Workflow**:
1. Generare audio base (storia/poesia)
2. Aggiungere CTA specifico per piattaforma
3. Generare video lip sync per ogni versione

### 🎵 Onde Lounge - Canale Ambient (NUOVA VISIONE)
**Concept**: Canale YouTube con video lunghi ambient per relax, feste, studio, cucina

**Perché**:
- La musica ambient/lofi è una COMMODITY - decorazione, non arte
- Mercato enorme: study beats, dinner party music, relaxation
- Possiamo automatizzare completamente con Video Factory
- Zero competizione artistica - puro volume e qualità visiva

**Prodotto**:
- Video 1-4 ore con scenari animati stile Onde
- Musica AI-generated (Suno, Udio, o simili)
- Leggere animazioni su immagini statiche (parallax, particelle, luce)
- Titoli tipo: "Italian Countryside Sunset | 3 Hours Relaxing Music"

**Pipeline Video Factory**:
1. Generare immagini scenari (Grok, stile Onde)
2. Animare leggermente (zoom lento, particelle, luce)
3. Generare musica ambient AI (loop 10-30 min)
4. Assemblare video lungo (1-4 ore)
5. Upload automatico su YouTube

**Canale**: "Onde Lounge" o "Onde Ambient"

**Task**:
- [ ] Setup canale YouTube dedicato
- [ ] Test generazione musica AI (Suno/Udio)
- [ ] Pipeline animazione immagini (ffmpeg + effetti)
- [ ] Primo video test 1 ora
- [ ] Automazione completa

---

### 📚 Audiobooks & Podcast Expansion
**Concept**: Libri Onde come audiobook + podcast educativi

**Perché**:
- La gente impara in macchina, in palestra, camminando
- Stesso contenuto, nuovo formato, nuovo revenue stream
- ElevenLabs già integrato (voce Gianni Parola)

**Prodotti**:
- Audiobook completi dei libri Onde (AIKO, Salmo 23, etc.)
- Podcast "Onde Kids" - storie della buonanotte
- Podcast "Onde Learn" - pillole educative

---

### 💡 Tech Channel (Nuova Idea)
**Concept**: Canale tech separato con nuovo personaggio

**Personaggio**: Da creare - stile Gianni ma per tech/coding
**Contenuti**:
- Libro "Vibes Coding" - come programmare con AI
- Tutorial coding per principianti
- Behind the scenes di come costruiamo Onde

**Note**: Separato da Onde Kids - target adulti/teenager

---

### 🌊 Distribution Easy Strategy
**Filosofia**: Margine piccolo × Volume enorme = Profitto

**Come funziona**:
- Ogni contenuto tradotto in 6+ lingue automaticamente
- Ogni formato: libro, ebook, audiobook, video, podcast
- Ogni piattaforma: KDP, YouTube, Spotify, TikTok, Apple
- AI fa il 90% del lavoro, noi supervisioniamo

**Matematica**:
- 1 libro × 6 lingue × 4 formati = 24 prodotti
- 10 libri = 240 prodotti
- Anche $1/mese per prodotto = $240/mese passivi

**Onde = Prima Casa Editrice 100% AI?**
- Da verificare se siamo i primi
- Se sì, storytelling potentissimo per PR

---

### Fase 1: Fondamenta (Gennaio 2026)
- [ ] Definire visual style unificato
- [ ] Creare Pina Pennello
- [ ] Logo Onde definitivo
- [ ] Branding stilistico identitario

### Fase 2: Canali (Febbraio 2026)
- [ ] **YouTube Onde** - Video educational e buffi
- [ ] **Spotify** - Podcast, audiobook bambini
- [ ] **TikTok** - Contenuti brevi, animazioni
- [ ] **Account X** per Gianni e Pina (divertenti, ispiracionali, educativi)

### Fase 3: Prime Uscite a Tappeto (Marzo 2026)
- [ ] Uscite coordinate su tutti i canali
- [ ] Presenza social di Gianni e Pina

---

## 📚 Status Libri (aggiornato)

| Libro | Status | Progresso | Note |
|-------|--------|-----------|------|
| **AIKO** | Prima bozza completa | 100% | 8 cap + dedica + nota genitori, 9/9 illustrazioni |
| **Salmo 23** | Bozza V2 pronta | 90% | Review → KDP |
| **Antologia Poesia IT** | In produzione | 40% | Completare illustrazioni |
| **Piccole Rime** | Video pronti | 30% | ⚠️ LIBRO NON ANCORA USCITO |

---

## 📱 App "Onde STEM" / "Grow O Learn"

**Concept**: Il bimbo sceglie con quale personaggio giocare/imparare/creare
- Gianni insegna a scrivere
- Pina insegna a disegnare
- Eventualmente app dedicate

---

## 🚨 PRIORITÀ PRECEDENTI - Q1 2026

### 1. Definire Stile Unitario Onde (BLOCCANTE)
**Status**: IN CORSO - URGENTE
**Blocca**: Tutte le nuove generazioni di immagini

**Task immediato**:
- [ ] Generare 4 opzioni stilistiche su Grok (prompt già pronti in CLAUDE.md)
- [ ] Mattia sceglie lo stile definitivo
- [ ] Creare prompt templates e skill
- [ ] Documentare style guide completa
- [ ] Rifare immagini esistenti con nuovo stile

**Deadline**: Prima possibile - blocca produzione libri

---

## 📚 Publishing - Casa Editrice

### Q1 2026 (Gen-Mar)

**Obiettivo**: 5+ libri pubblicati su KDP

#### Libri in Lavorazione

| Libro | Collana | Status | Prossimo Step |
|-------|---------|--------|---------------|
| AIKO - AI Explained to Children | Tech | Review PDF | Feedback Mattia → KDP |
| Il Salmo 23 per Bambini | Spiritualità | Bozza V2 | EPUB → KDP |
| Il Potere dei Desideri | Spiritualità | Testo 100% | **BLOCCATO** (stile) |
| Piccole Rime (Antologia IT) | Poetry | Completo | Video approval |
| Il Respiro Magico | Spiritualità | In Queue | Da iniziare |

#### Video Content (Nuova Iniziativa)

**Status**: 3 video generati (stile Luzzati)
- [x] Stella Stellina ✅ LIVE su YouTube + postato su @Onde_FRH (8 Gen 2026)
- [x] Pulcino Bagnato
- [x] Pioggerellina
- [ ] Approvazione in PR Dashboard (localhost:3333)
- [x] Posting su @Onde_FRH (tagga @grok) ✅ Stella Stellina postato
- [ ] Generare video 4-10

**Goal**: Espandere su YouTube Shorts, TikTok, Instagram Reels

#### Libri in Queue (H1 2026)
1. Antologia Poesie EN (Stevenson, Lear, Rossetti)
2. AIKO traduzione IT
3. La Luce Dentro (Spiritualità)
4. Il Piccolo Inventore (Tech)

---

## 📱 App Development - STRATEGIA CAMBIATA

### ⚠️ DECISIONE: Abbandonare Unity per App Educative

**Motivazione**: Unity è OVERKILL per giochi educativi semplici

**Nuovo Stack Veloce**:
- React Native + Expo (iOS/Android in ore)
- Google AI Studio (prototipi web in 2 min)
- Rork ($20/mese) per MVP mobile rapidi
- PWA + Capacitor (web → Store in ore)

### Q1 2026 - Target: 5 App su App Store

| App | Status | GitHub Repo | Azione |
|-----|--------|-------------|--------|
| KidsChefStudio | Unity Phase 1 | FreeRiverHouse/KidsChefStudio | **CONVERTIRE** a React Native |
| **AIKO Interactive** | ✅ Su GitHub | FreeRiverHouse/aiko-interactive | Testare con Expo Go |
| **Moonlight Interactive** | ✅ Su GitHub | FreeRiverHouse/moonlight-interactive | Testare con Expo Go |
| **Moonlight Puzzle** | ✅ Su GitHub | FreeRiverHouse/moonlight-puzzle | Testare con Expo Go |
| **Mad Math** | ✅ Su GitHub | FreeRiverHouse/mad-math | Testare con Expo Go |
| Piccole Rime App | Pianificata | - | Sviluppare con React Native |
| Salmo 23 Kids | Pianificata | - | Sviluppare con React Native |

### 📲 Come Testare le App (Expo Go)
```bash
# Su Mac con Xcode e simulatore iOS:
cd ~/Projects/OndeStandaloneApps/aiko-interactive
npx expo start

# Scansiona QR code con Expo Go app su iPhone/iPad
# Oppure premi 'i' per aprire nel simulatore iOS
```

**Repo Expo Apps**: `FreeRiverHouse/OndeStandaloneApps` (monorepo)

### Q2 2026 - Target: 10 App Totali

**Revenue Goal**: $1k/mese da app Q1, $5k/mese Q2

---

## 🎯 PR Agency - Onde PR

### Attivo e Funzionante

**Account Gestiti**:
- @FreeRiverHouse (Building in public, tech, startup)
- @Onde_FRH (Casa editrice, cultura, libri)
- @magmatic__ (Personale, poesia, arte - Mattia)

**Automazione**:
- [x] Bot Telegram @OndePR_bot (comandi /frh, /onde, /magmatic)
- [x] Report giornaliero automatico (17:40)
- [x] Daily Tech Post automatico (21:30)
- [x] 40 post pre-scritti nel bank
- [x] PR Agent con Grok AI
- [x] PR Dashboard museo-style (localhost:3333)

### Q1 2026 - Espansione

**Immediate**:
- [x] Aggiornare bio @Onde_FRH: "AI Publishing House + PR Agency" + tag @AnthropicAI e @grok ✅
- [ ] Creare banner @Onde_FRH dimensioni corrette (1500x500) - tema notte per Storie della Buonanotte
- [ ] Instagram Content Revival (@magmatic__ - 5 anni di contenuti)
- [ ] Crescita organica @FreeRiverHouse

**Q1 Goals**:
- [ ] YouTube Shorts automation
- [ ] TikTok integration
- [ ] Instagram Reels automation
- [ ] PR Dashboard come prodotto SaaS multi-tenant

### 📱 Multi-Social Expansion (NUOVO)
**Strategia**: Ogni post viene archiviato e ripostato su tutti i social

**Piattaforme Target**:
| Piattaforma | Account | Status |
|-------------|---------|--------|
| **X** | @Onde_FRH, @FreeRiverHouse, @magmatic__ | ✅ Attivo |
| **Instagram** | @onde_publishing | DA CREARE |
| **TikTok** | @onde | DA CREARE |
| **Facebook** | Onde Publishing | DA CREARE |
| **LinkedIn** | Free River House | DA CREARE |

**Archivio Post**:
- Path: `OndePRDB/archive/posted/`
- Ogni post salvato con data, caption, media
- Facilita repost cross-platform

**Workflow**:
1. Crea post per X
2. Salva in archivio OndePRDB
3. Adatta e riposta su altri social
4. Track performance per piattaforma

---

## 🎮 VR/Gaming Projects

### BusinessIsBusiness
**Status**: Early Development (3 commits)
**Tipo**: VR Game - Frontend gamificato per Claude Code
**Platform**: Meta Quest

**Phase 1** (In Corso): Audio Prototype
- [ ] Agent system completato
- [ ] Voice pipeline implementata
- [ ] Server Bridge Mac ↔ Quest

**Q2 2026**: Phase 2 (2D Interface iPad/Mac)

### Unity Games (Status Congelato)

| Progetto | Status | Decisione |
|----------|--------|-----------|
| KidsChefStudio | Phase 1 | **FREEZE** → React Native |
| KidsGameStudio | Swift/Ready | Pubblicare su Store |
| KidsMusicStudio | Advanced | Valutare se completare o freeze |
| PIZZA-GELATO-RUSH | MVP | Freeze (non prioritario) |

---

## 🤖 PolyRoborto (Trading Bot)

**Status**: Production-Ready
**Tipo**: Copy-trading bot per Polymarket
**Revenue**: Potenziale guadagno passivo

**Q1 Action**: Deploy e monitor

---

## 💰 Revenue Goals

### Q1 2026 (Gen-Mar)
- **Libri KDP**: $200-500/mese
- **App Store**: $500-1000/mese
- **PolyRoborto**: Variable
- **PR Dashboard SaaS**: $0 (setup)
- **TOTAL TARGET**: $1,000/mese

### Q2 2026 (Apr-Giu)
- **Libri KDP**: $1k/mese (15+ libri)
- **App Store**: $3k/mese (10+ app)
- **PR Dashboard**: $1k/mese (primi clienti)
- **TOTAL TARGET**: $5,000/mese

---

## 🗓️ Timeline Chiave

### Gennaio 2026
- [ ] Definire stile Onde (settimana 1)
- [ ] Pubblicare AIKO + Salmo 23 (settimana 2-3)
- [ ] Setup React Native stack (settimana 2)
- [ ] Prima app React Native pubblicata (settimana 4)

### Febbraio 2026
- [ ] 3+ libri pubblicati
- [ ] 3 app React Native pubblicate
- [ ] Video expansion (YouTube Shorts, TikTok)

### Marzo 2026
- [ ] 5 libri totali pubblicati
- [ ] 5 app pubblicate
- [ ] PR Dashboard beta per primi clienti
- [ ] $1k/mese revenue raggiunto

---

## 🚫 Cosa NON Fare

### Illustrazioni
- ❌ NO Pixar, cartoon, plasticoso
- ❌ NO generare immagini prima di definire stile unitario
- ❌ NO stile americano bright

### Testi
- ❌ NO inventare citazioni di autori reali
- ❌ NO pubblicare poesie AI (per ora)
- ❌ NO modificare testi di autori in dominio pubblico

### X/Twitter
- ❌ NO hashtag (Grok analizza automaticamente)
- ❌ NO mischiare stili tra account diversi
- ❌ NO call-to-action su @magmatic__

---

## 🎨 Regole Creative

### Stile Illustrazioni Onde
✅ **APPROVATO**:
- Acquarello elegante europeo
- Vintage italiano anni '50 / Beatrix Potter
- Emanuele Luzzati (per Poetry)
- Colori morbidi, luce dorata
- Minimalismo raffinato

❌ **VIETATO**:
- Pixar / 3D / Cartoon
- Colori saturi plasticosi
- Stile americano

### Separazione Brand

**@FreeRiverHouse**:
- Stile: Building in public, tech, startup
- Tono: Professionale ma umano

**@Onde_FRH**:
- Stile: Casa editrice, cultura
- Tono: Colto, riflessivo

**@magmatic__**:
- Stile: Personale, poesia, arte
- Tono: Autentico, ZERO vendita

---

## 📊 Metriche di Successo

### Publishing
- Libri pubblicati / mese
- Download KDP
- Review rating (target: 4.5+)

### Apps
- App pubblicate / mese
- Download totali
- Revenue / app
- User retention

### PR
- Follower growth (organico)
- Engagement rate
- Post pubblicati / settimana

---

## 🔄 Review & Iterate

**Cadenza**: Fine mese
**Processo**:
1. Review revenue vs goals
2. Analisi performance progetti
3. Pivot su cosa funziona
4. Kill progetti morti

**Prossima Review**: 31 Gennaio 2026

---

*Documento vivo - aggiornato con priorità e decisioni correnti*
