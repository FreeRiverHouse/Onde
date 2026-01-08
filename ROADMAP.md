# Onde - Roadmap 2026

> **"Facciamo fiorire il mondo. Questa è la missione."**

**Ultimo aggiornamento**: 2026-01-08 - Aggiunto Onde Books (store indipendente + app famiglia)

---

## 📚 ONDE BOOKS - Store Indipendente + App Famiglia (NUOVO 8 Gen 2026)

**Obiettivo**: Bypassare Amazon KDP e vendere ebook direttamente. Creare un'app di lettura bella per famiglie.

### 🔥 Perché Farlo
- Amazon KDP ha limite ridicolo di 3 titoli/giorno
- Amazon prende il 30-65% dei guadagni
- Nessun controllo sull'esperienza utente
- Le app di lettura esistenti fanno SCHIFO (design tech, non da bibliofili)

### 🏗️ Architettura

| Componente | Descrizione | Target |
|------------|-------------|--------|
| **Onde Books Portal** | Dashboard admin per gestire libri, ordini, utenti | Noi (Onde) |
| **Onde Books App** | App di lettura per famiglie | Clienti |

### 📖 "Onde Books" - L'App Cliente
**Concept**: App di lettura per famiglie con design da amanti dei libri, non da tech.

**Features MVP**:
- 📚 Libreria personale (libri gratuiti + a pagamento)
- 🎨 Layout bellissimi (typography curata, margini, luce notturna)
- 👨‍👩‍👧‍👦 Profili famiglia (genitori + bambini)
- 💳 Checkout semplice (Stripe)
- 📖 Lettura offline
- 🌙 Modalità notte per storie della buonanotte

**Features Future**:
- 🎧 Audiobook integrati
- 📺 Video delle storie
- 🏆 Gamification lettura per bambini
- 🌍 Multilingua

### 🏠 Hosting Self-Hosted (ZERO COSTI)
**Infrastruttura**: Mac di Mattia (già sempre acceso, già ha Minecraft server pubblico)

| Componente | Soluzione | Costo |
|------------|-----------|-------|
| Server | Mac locale | $0 |
| Port forwarding | Router già configurato | $0 |
| Dominio | ondereading.com (o simile) | ~$12/anno |
| SSL | Let's Encrypt | $0 |
| Pagamenti | Stripe (2.9% + $0.30/tx) | Solo su vendite |
| Storage ebook | Locale su Mac | $0 |

**Costo totale**: ~$12/anno + commissioni Stripe sulle vendite

### 🛠️ Stack Tecnico
```
Frontend: Next.js (React)
Backend: Next.js API routes
Database: SQLite (locale) o Postgres
Payments: Stripe
Auth: NextAuth.js
Storage: File system locale
Reader: epub.js o simile
```

### 📋 Task MVP
- [ ] Setup progetto Next.js
- [ ] Pagina catalogo libri
- [ ] Pagina dettaglio libro
- [ ] Reader ebook integrato (epub.js)
- [ ] Integrazione Stripe checkout
- [ ] Sistema account utenti
- [ ] Profili famiglia
- [ ] Download offline
- [ ] Deploy su Mac locale
- [ ] Dominio + SSL

### 💡 Modello Business
| Tipo | Prezzo | Note |
|------|--------|------|
| **Libri gratuiti** | $0 | Lead magnet, fidelizzazione |
| **Libri singoli** | $0.99-$4.99 | Acquisto diretto |
| **Bundle famiglia** | $9.99/mese | Accesso a tutto il catalogo |
| **Libri premium** | $9.99+ | Edizioni speciali, illustrate |

### 🎯 Vantaggi vs Amazon
| | Amazon KDP | Onde Books |
|--|------------|--------------|
| Commissioni | 30-65% | ~3% (solo Stripe) |
| Limite upload | 3/giorno | Illimitato |
| Controllo UX | Zero | Totale |
| Dati clienti | Amazon li tiene | Nostri |
| Branding | Generico | Onde style |
| Prezzo minimo | $0.99 | Qualsiasi |

### 🚀 Timeline
- **Settimana 1**: Setup base, catalogo, reader
- **Settimana 2**: Stripe, account utenti
- **Settimana 3**: Deploy, test, polish
- **Settimana 4**: Launch soft con libri esistenti

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

## 💰 MONEY PRINTING FACTORY - Video AI Passivi (NUOVO 8 Gen 2026)

**Obiettivo**: Creare canali YouTube con video AI che generano revenue passiva

### 🔥 L'Idea (da Mattia)
- Video tipo "camino che brucia" fanno MILIARDI di views
- Facili da fare con AI (immagini + musica + loop)
- Nessuna competizione artistica, puro volume
- Revenue passiva una volta pubblicati

### 📺 Canali da Creare
| Canale | Contenuto | Status |
|--------|-----------|--------|
| **Onde Lounge** | Chill music, ambient, lo-fi | DA CREARE |
| **Onde Music** | Musica rilassante italiana | DA CREARE |
| **[Chill Music Channel]** | Study beats, rain sounds | DA CREARE |

### 🎬 Tipi di Video da Produrre
1. **Fireplace/Camino** - Video camino 3-10 ore, suoni crepitio
2. **Rain sounds** - Pioggia su finestra, tetto, foresta
3. **Chill/Lo-fi beats** - Musica studio, concentrazione
4. **Nature ambient** - Foresta, mare, montagna
5. **Italian countryside** - Paesaggi italiani + musica soft

### 🛠️ Pipeline Produzione
1. **Immagine**: Grok genera scena (stile Onde o realistico)
2. **Animazione**: Leggero movimento (parallax, particelle, luce)
3. **Musica**: Suno/Udio genera loop 10-30 min
4. **Assemblaggio**: FFmpeg crea video 1-10 ore
5. **Upload**: Automatico su YouTube

### ⚡ Task Immediati
- [ ] Creare canale YouTube "Onde Lounge"
- [ ] Test: generare 1 video camino 1 ora
- [ ] Test: generare 1 video chill music
- [ ] Pipeline automatica per produzione batch
- [ ] Analisi competitor (canali che fanno milioni views)

### 💡 Perché Funziona
- La gente cerca "fireplace 10 hours" → miliardi di views
- Zero effort creativo dopo setup pipeline
- Scalabile all'infinito
- Perfetto per AI: ripetitivo, commodity

### 🔍 Generi ad Alto Volume (Ricerca)
**Criteri**: Facili da produrre con AI, alto volume views, bassa competizione

| Genere | Difficoltà | Potenziale | Note |
|--------|------------|------------|------|
| Fireplace/Camino | ⭐ Facile | 🔥🔥🔥 Alto | Loop semplice |
| Rain sounds | ⭐ Facile | 🔥🔥🔥 Alto | Solo audio + immagine |
| Lo-fi/Study beats | ⭐⭐ Medio | 🔥🔥🔥 Alto | Serve buona musica AI |
| Nature ambient | ⭐ Facile | 🔥🔥 Medio | Foresta, mare, etc. |
| Ninna nanne | ⭐⭐ Medio | 🔥🔥🔥 Alto | Multilingua! |
| ASMR visuals | ⭐⭐ Medio | 🔥🔥 Medio | Nicchia specifica |
| Sleep music | ⭐ Facile | 🔥🔥🔥 Alto | Molto richiesto |

### 🎵 Distribuzione Musica (Gratis)
| Distributore | Costo | Royalties | Note |
|--------------|-------|-----------|------|
| **Rebel Music** | GRATIS | 100% | Consigliato |
| **RouteNote** | GRATIS | 85% | Warner-backed |
| **Level Music** | GRATIS | 100% | Buono |

### 📋 Primo Sprint MPF
1. ✅ Sezione creata in ROADMAP
2. [ ] **OGGI**: Creare canale YouTube "Onde Lounge"
3. [ ] **OGGI**: Generare 1 video test (camino 1 ora)
4. [ ] Analizzare top 5 canali competitor
5. [ ] Pipeline automatica entro fine settimana

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

### 🎬 Serie Animata "AIKO & Sofia" - Pillole Tech per Bambini (NUOVO!)

**Concept**: Serie di mini-episodi animati dove AIKO e Sofia spiegano concetti tech ai bambini

**Perché è GOLD**:
- Personaggi già esistenti e amati (dal libro AIKO)
- Formato scalabile: episodi brevi 2-5 minuti
- Contenuto educativo = genitori felici
- Può diventare canale YouTube dedicato
- Cross-promotion con libri e app

**Format Episodi**:
- Durata: 2-5 minuti
- Stile: Animazione leggera su illustrazioni Onde (stile acquarello)
- Voce: ElevenLabs (Sofia = bambina, AIKO = robot amichevole)
- Musica: Jingle riconoscibile Onde

**Episodi Pianificati - Stagione 1**:
| # | Titolo | Tema | Status |
|---|--------|------|--------|
| 01 | Come funziona Internet? | Reti, pacchetti, router | DA FARE |
| 02 | Cos'è un Robot? | Robotica base | DA FARE |
| 03 | Il Robotaxi | Auto autonome (da AIKO 2) | DA FARE |
| 04 | Come impara l'AI? | Machine learning semplice | DA FARE |
| 05 | I Sensori Magici | Sensori, input/output | DA FARE |
| 06 | Il Cloud | Storage, "nuvola" dei dati | DA FARE |
| 07 | Coding per Piccoli | Concetti base programmazione | DA FARE |
| 08 | Sicurezza Online | Privacy, password | DA FARE |

**Pipeline Produzione**:
1. Script (Gianni Parola) - dialogo Sofia + AIKO
2. Illustrazioni scene (Grok, stile Onde)
3. Animazione leggera (parallax, movimento labiale)
4. Voci (ElevenLabs)
5. Musica/SFX
6. Upload YouTube + distribuzione

**Canale**: YouTube "AIKO & Sofia" o sotto-playlist di Onde

**Task Immediati**:
- [ ] Scrivere script Ep.01 "Come funziona Internet?"
- [ ] Definire voci Sofia e AIKO su ElevenLabs
- [ ] Creare template visivo episodi
- [ ] Jingle/sigla serie

---

### 🎵 Ninna Nanne CANTATE - Versioni Musicali (PRIORITÀ!)
**Obiettivo**: Versioni cantate delle poesie/ninne nanne con musica AI

**Perché URGENTE**:
- Le ninna nanne cantate su YouTube fanno MILIONI di views
- Mercato enorme: genitori cercano video per far dormire i bimbi
- Video lunghi (10min-1ora) = alto watch time = algoritmo felice

**Primo video da fare: Stella Stellina CANTATA**
| Step | Tool | Note |
|------|------|------|
| 1. Comporre melodia | Suno/Udio | Stile dolce, italiano, lullaby |
| 2. Generare voce cantata | Suno/ElevenLabs | Voce femminile dolce |
| 3. Visual | Immagini notturne Onde + leggera animazione |
| 4. Loop 10-30 min | Video lungo per YouTube |
| 5. Upload | YouTube + Spotify |

**Task immediato:**
- [ ] Test Suno per melodia Stella Stellina
- [ ] Creare versione cantata 1-2 minuti
- [ ] Se funziona → versione lunga 10-30 min

### 🔍 Ricerca YouTube - Generi ad Alto Volume (DA FARE)
**Obiettivo**: Trovare nicchie/generi dove video AI-generated possono fare milioni di views

**Criteri:**
- Facili da produrre con AI (immagini + musica + voce)
- Alto volume di ricerca/views
- Bassa competizione o competizione battibile con qualità
- Contenuti "commodity" (la gente cerca il genere, non il creator)

**Generi da esplorare:**
- [ ] Ninna nanne / Lullabies (tutte le lingue)
- [ ] Ambient / Lo-fi / Study music
- [ ] Nature sounds + visuals
- [ ] Meditation / Relaxation
- [ ] Kids songs / Nursery rhymes
- [ ] ASMR visuals
- [ ] Sleep music / White noise
- [ ] Fireplace / Rain sounds

**Output ricerca:**
- Top 10 generi per views/facilità ratio
- Esempi canali che fanno milioni di views
- Strategia Onde per ogni genere

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

## 📚 SchoolSync - App Compiti per Famiglie (NUOVA - 8 Gen 2026)

**Concept**: App web-based per aiutare genitori e bambini a gestire il caos dei compiti scolastici

**Il Problema**:
- Le scuole usano mille app diverse (Classroom, Seesaw, Class Dojo, portali vari...)
- I genitori non sanno più dove guardare
- I bambini si perdono tra mille piattaforme
- Nessuno ha una visione chiara di "cosa c'è da fare"

**La Soluzione - SchoolSync**:
- **Aggregatore**: Collega tutti i portali scolastici in un'unica dashboard
- **Parent Portal**: I genitori vedono tutti i compiti di tutti i figli in un posto
- **Child View**: Interfaccia semplice per i bambini - cosa devo fare oggi?
- **Tracker**: Traccia lo stato dei compiti (da fare, in corso, completato)
- **Notifiche**: Avvisi per scadenze imminenti
- **Calendario unificato**: Tutti gli eventi scolastici in un posto

**Approccio**:
1. Prima la facciamo per NOI (i nostri figli)
2. Se funziona, la diffondiamo ad altre famiglie
3. Potenziale SaaS per scuole/distretti

**Stack Proposto**:
- Web app (React/Next.js)
- Mobile-friendly (PWA)
- Integrations con portali comuni (Google Classroom, etc.)
- AI assistant per aiutare con i compiti (Claude API)

**Task Iniziali**:
- [ ] Mappare tutti i portali usati dalla scuola dei bambini
- [ ] Wireframe interfaccia parent + child
- [ ] MVP con aggregazione manuale (prima di API)
- [ ] Test con la famiglia

**Perché può avere successo**:
- Risolve un problema REALE che vivono milioni di famiglie
- Le scuole non lo risolveranno (burocrazia)
- I genitori pagherebbero per avere pace mentale
- Può diventare B2B venduto ai distretti scolastici

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

### 📦 Workflow Pubblicazione Libri (OBBLIGATORIO - 8 Gen 2026)

**PRIMA di pubblicare qualsiasi libro su KDP, seguire questi step:**

1. **Archiviazione in OndePRDB** (OBBLIGATORIO)
   - Creare cartella: `OndePRDB/clients/onde/books/[nome-libro]/`
   - Contenuto cartella:
     - `cover.jpg` - Copertina alta risoluzione
     - `[nome-libro].pdf` - PDF finale per stampa
     - `[nome-libro].epub` - ePub finale
     - `images/` - Tutte le illustrazioni RAW
     - `quotes.md` - Citazioni per social media posts
     - `metadata.json` - Titolo, autore, ISBN, descrizione

2. **Verifica Pre-Pubblicazione**
   - [ ] Cover archiviata
   - [ ] PDF archiviato
   - [ ] ePub archiviato
   - [ ] Immagini RAW archiviate
   - [ ] Citazioni estratte per social

3. **Pubblicazione**
   - Upload su KDP
   - Post annuncio su @Onde_FRH

**PERCHÉ**: Ogni agente che deve creare contenuti (post, citazioni, promozioni) sa dove trovare i materiali. Tutto centralizzato in OndePRDB.

---

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

### 🤖 Social Media Automation (NUOVO - 8 Gen 2026)
**Obiettivo**: Automatizzare posting su tutte le piattaforme

**Piattaforme da automatizzare:**
| Piattaforma | API/Tool | Status |
|-------------|----------|--------|
| **X/Twitter** | X API v2 | ✅ Attivo (via bot Telegram) |
| **Instagram** | Meta Graph API / Later | DA FARE |
| **TikTok** | TikTok API / CapCut | DA FARE |
| **YouTube Shorts** | YouTube Data API v3 | DA FARE |

**Task Automazione Instagram:**
- [ ] Creare account Business Instagram @onde_publishing
- [ ] Collegare a Meta Business Suite
- [ ] Setup Meta Graph API per posting automatico
- [ ] Creare workflow: contenuto approvato → auto-post IG

**Task Automazione TikTok:**
- [ ] Creare account TikTok @onde
- [ ] Esplorare TikTok API per business
- [ ] Workflow video: Grok genera → auto-upload TikTok
- [ ] Cross-post da YouTube Shorts

**Workflow Target:**
1. Creo contenuto (testo + immagine/video)
2. Approvo su Telegram/PR Dashboard
3. Sistema posta automaticamente su TUTTE le piattaforme
4. Analytics centralizzate in dashboard

### 👤 Gianni Parola - Autore su X (NUOVO - 8 Gen 2026)

**Account**: @GianniParola (da creare)
**Piano completo**: `OndePRDB/clients/gianni-parola/SOCIAL-MEDIA-PLAN.md`

**Chi è Gianni Parola:**
- Scrittore per bambini, autore Onde
- ~40 anni, occhiali tondi, giacca tweed
- Voce: riflessiva, gentile, poetica

**Content Pillars:**
| Pillar | % | Contenuto |
|--------|---|-----------|
| Dietro le quinte scrittura | 40% | Processo creativo, ispirazioni |
| Riflessioni lettura/infanzia | 30% | Importanza delle storie |
| Libri Onde | 20% | Novità, soft promo |
| Vita quotidiana | 10% | Momenti autentici |

**Task Setup:**
- [ ] Creare account @GianniParola su X
- [ ] Generare foto profilo (ritratto acquarello)
- [ ] Generare banner (scrivania scrittore)
- [ ] Pubblicare primo post di presentazione
- [ ] Collegare a @Onde_FRH

**Bank Post**: 20 post già scritti in `OndePRDB/clients/gianni-parola/SOCIAL-MEDIA-PLAN.md`

**Obiettivi:**
- Mese 1: 100+ follower
- Mese 3: 500+ follower
- Mese 6: 1000+ follower, voce riconosciuta

---

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
