# Claude Memory - Onde Project

## Owner
Mattia Petrucciani - parla italiano, comunicazione diretta.

## REGOLA D'ORO: MEMORIA = COMMIT
**Ogni volta che aggiorni CLAUDE.md → COMMIT IMMEDIATO.**
Non esiste aggiornare la memoria senza committare. Sono la stessa cosa.

---

## 🔮 PAROLA IN CODICE: "SBRINCHI, SBRONCHI"

**Quando Mattia dice "Sbrinchi, sbronchi", DEVI fare queste 3 cose:**

1. **AGGIORNA LA MEMORIA** - Aggiungi/modifica info in CLAUDE.md
2. **AGGIORNA LA ROADMAP** - Aggiungi task/modifiche in ROADMAP.md
3. **FAI COMMIT** - `git add . && git commit && git push`

**Esempio d'uso:**
- Mattia: "Aggiungi questo libro al catalogo. Sbrinchi, sbronchi!"
- Claude: Aggiunge al catalogo → Aggiorna CLAUDE.md → Aggiorna ROADMAP → Commit + Push

**NOTA**: Questa regola esiste perché Claude perde la memoria tra sessioni. Scrivendo qui la regola, la prossima volta che apro questo file la leggo e la seguo.

---

## 🚨🚨🚨 PRIMA COSA DA FARE QUANDO TI ACCENDI

**OGNI VOLTA che inizia una nuova sessione (PRIMA che Mattia dica qualsiasi cosa):**

1. **CHECK MEMORY** - Leggi questo file (CLAUDE.md)
2. **CHECK ROADMAP** - Leggi ROADMAP.md
3. **DIMMI COSA C'È DA FARE** - Riassumi le priorità a Mattia

**NON aspettare che Mattia te lo chieda. Fallo TU automaticamente.**

Esempio di come iniziare:
```
"Buongiorno! Ho controllato memory e roadmap.

PRIORITÀ #1: HandsFree Vibe Surfing - prototipo da finire OGGI
- Server Mac: DA FARE
- Web Dashboard: DA FARE
- Watch app: esiste, da estendere

Altre priorità:
- [lista altre cose urgenti]

Da dove vuoi iniziare?"
```

---

## 🌊 ANIMA DEL BRAND - LA NOSTRA VIBE (8 Gennaio 2026)

**Onde significa:**
- **Connessione** - tra autore e lettore, tra storie e cuori
- **Vibrazione di energia** - che si propaga e tocca chi incontra
- **Comunicazione** - storie che parlano senza barriere
- **Bellezza** - estetica prima di tutto
- **Movimento** - mai fermi, sempre in crescita

**FreeRiverHouse + Onde = Far fiorire il mondo**

La missione profonda (da non esplicitare sempre, ma da vivere):
- Portiamo nutrimento, facciamo crescere
- Come un fiume libero che nutre la terra
- Come onde che raggiungono ogni riva

**Per PR e comunicazione:**
- Questa è la vibe vera
- Non vendita, ma connessione
- Non hype, ma sostanza
- Non disruption per ego, ma disruption per liberare

**Il logo:**
- Le onde sembrano un fiore - non è un caso
- Onde = fiorire = far fiorire il mondo
- Messaggio implicito, non da esplicitare sempre, ma da tenere presente

---

## 🔴🔴🔴 VIDEO FACTORY - PRIORITÀ ASSOLUTA (8 Gennaio 2026)

**LA VIDEO FACTORY È FONDAMENTALE PER SCALARE ONDE.**

### Cos'è la Video Factory
Sistema automatizzato per produrre video da contenuti Onde:
- **Lip syncing** - Sincronizzazione labiale su immagini/personaggi
- **Music sync** - Video sincronizzati a beat musicali
- **Stile definibile** - Acquarello Onde, anime, realistico, etc.

### Perché è prioritaria
- Permette di scalare la produzione multimediale
- YouTube, TikTok, Reels richiedono VIDEO
- Un libro = decine di video promozionali automatici
- Personaggi Onde (Gianni, Pina) possono "parlare" nei video

### Status
- MVP in progettazione (agent lanciato)
- Vedi `VIDEO-FACTORY-MVP.md` per piano dettagliato

### Tool da valutare (2026)
- **Lip sync**: Sync Labs, D-ID, HeyGen, Hedra
- **Video gen**: Runway Gen-3, Pika, Kling, Sora
- **Music sync**: Da ricercare

---

## 🔴🔴🔴 PUNTO ESATTO DOVE MI SONO FERMATO (8 Gennaio 2026)

**RIPRENDI DA QUI:**

### 1. Approval Dashboard - CREATA, NON LANCIATA
- **Path**: `apps/approval-dashboard/`
- **Porta**: 3456
- **Status**: File creati, npm install fatto, server NON avviato
- **Per lanciare**: `cd apps/approval-dashboard && node server.js`
- **Funzionalità**: Dashboard web per approvare/rifiutare immagini con commenti

### 2. HandsFree Pedal Mockups - PROMPT PRONTI
- **Path prompt**: `content/social/handsfree-pedal-post.md`
- **4 immagini da generare**:
  1. Product Shot (stile Amazon)
  2. In-Use Shot (cucina)
  3. Before/After Meme
  4. Close-up tasti consumati
- **Status**: Navigato su Grok (`x.com/i/grok`), tab aperto, NON ancora generato

### 3. Workflow da completare:
1. Lancia dashboard: `cd apps/approval-dashboard && node server.js`
2. Apri browser su `http://localhost:3456`
3. Genera immagini su Grok
4. Scarica in `~/Downloads/`
5. Aggiungi alla dashboard per approvazione via API POST

### Chrome Status
- Tab Grok già aperto (tabId: 1790232527)
- Pronto per generare immagini

---

## 🔴🔴🔴 TASK IMMEDIATO - AIKO 2 ROBOTAXI (8 Gennaio 2026 - STASERA!)

**MATTIA VUOLE LEGGERE IL LIBRO STASERA!**

**Quando ti accendi → FAI QUESTO SUBITO (senza chiedere):**

### 📚 CONSEGNA AIKO 2: THE ROBOTAXI ADVENTURE

**Testo**: COMPLETO in `books/aiko-2-robotaxi/RAW/aiko-2-full-text.txt`
**Prompt**: PRONTI in `books/aiko-2-robotaxi/RAW/illustration-prompts.md`
**Output**: Manda PDF finale su Telegram

### 🎨 STEP 1 - GENERA 9 IMMAGINI CON GROK (PARALLELO!)

**Apri 5+ tab di Grok contemporaneamente** su `x.com/i/grok` → "Create Images"

| Tab | Illustrazione | Prompt file |
|-----|---------------|-------------|
| 1 | Copertina | illustration-prompts.md |
| 2 | Cap 1 - Arrivo robotaxi | illustration-prompts.md |
| 3 | Cap 2 - Sensori/LiDAR | illustration-prompts.md |
| 4 | Cap 3 - Interno robotaxi | illustration-prompts.md |
| 5 | Cap 4 - Vista split | illustration-prompts.md |
| 6 | Cap 5 - Sicurezza | illustration-prompts.md |
| 7 | Cap 6 - Team dietro le quinte | illustration-prompts.md |
| 8 | Cap 7 - Sogno futuro | illustration-prompts.md |
| 9 | Cap 8 - Arrivo dalla nonna | illustration-prompts.md |

**Per ogni immagine:**
1. Copia prompt dal file
2. Incolla in Grok
3. Genera
4. **FAI UPSCALE** (obbligatorio!)
5. Scarica in `~/Downloads/`

### 📦 STEP 2 - ASSEMBLA PDF

1. Sposta immagini in `books/aiko-2-robotaxi/images/`
2. Usa script `create-pdf.js` per generare PDF finale
3. Verifica layout (testo + immagini non sovrapposti)

### 📱 STEP 3 - MANDA SU TELEGRAM

```bash
curl -X POST "https://api.telegram.org/bot8272332520:AAF7zrKpqOCnFMqOlF1GJCLycJFk3IPO6ps/sendDocument" \
  -F "chat_id=7505631979" \
  -F "document=@[PATH_PDF]" \
  -F "caption=📚 AIKO 2: The Robotaxi Adventure - PRONTO!"
```

### ⚠️ REGOLE PINA PENNELLO (da rispettare!)
- Stile acquarello europeo, NO Pixar
- Coerenza personaggi (Sofia sempre uguale)
- QC anatomico: 5 dita, 2 orecchie, proporzioni OK
- Se immagine non corrisponde al testo → RIGENERA

---

## 🎨 TASK PRECEDENTE - Code Surfing (SOSPESO)

**File con tutti i prompt**: `books/vibe-coding/ILLUSTRATION-PLAN.md`

**Cover A - ONDE-TECH**:
```
European watercolor book cover illustration,
young Italian boy with curly brown hair surfing on a giant wave,
the wave is made of flowing code and glowing data streams,
small friendly white round robot companion riding alongside,
warm golden sunset light through the spray,
tech elements blend organically with watercolor ocean,
title space at top, magical adventure feeling,
Beatrix Potter meets Silicon Valley aesthetic,
NOT Pixar NOT 3D, natural skin tone NO rosy cheeks, 4k
```

**Cover B - LUZZATI**:
```
Emanuele Luzzati style book cover,
stylized boy and round robot surfing on abstract code wave,
bold geometric shapes, theatrical composition,
rich blues teals and golden oranges,
decorative swirls representing data flow,
Italian theatrical poster aesthetic,
vintage 1960s feel with modern tech symbolism,
title space at top, playful and artistic, 4k
```

**STEP 3 - Per ogni immagine**
1. Fai **UPSCALE** (obbligatorio!)
2. Scarica in `~/Downloads/`
3. Verifica QC: 5 dita, 2 orecchie, proporzioni OK

**STEP 4 - Genera i 10 capitoli + 3 appendici**
Tutti i prompt sono in `ILLUSTRATION-PLAN.md`

**STEP 5 - Salva e invia**
1. Sposta immagini in `books/vibe-coding/images/`
2. Manda le copertine su Telegram per approvazione
3. Rigenera PDF con illustrazioni

---

## 🚨 ROADMAP = FONTE DI VERITÀ (REGOLA #1)

**CONTROLLA SEMPRE LA ROADMAP PRIMA DI FARE QUALUNQUE COSA!**

**Path**: `ROADMAP.md` (in questo repo)

La ROADMAP è:
- ✅ La roadmap strategica di Onde
- ✅ La to-do list delle prossime cose da fare
- ✅ Lo status update di ogni singolo progetto
- ✅ Il documento da tenere SEMPRE aggiornato

**Regole:**
1. Leggi la ROADMAP all'inizio di ogni sessione
2. Aggiorna la ROADMAP quando completi qualcosa
3. **Committa e pusha OGNI VOLTA** che aggiorni la ROADMAP
4. Mai lavorare su qualcosa che non è nella ROADMAP senza chiedere

---

## 🚨 REGOLA #2 - BRANDING PRIMA DI TUTTO

**OGNI VOLTA che devi generare immagini, video, o contenuti visivi:**

1. **LEGGI SEMPRE** il file `BRAND-GUIDE.md` prima di iniziare
2. **VERIFICA** che i prompt rispettino lo stile Onde
3. **CONSULTA l'Editore Capo** (`content/agents/editore-capo.md`) per decisioni importanti

**Questo vale per TUTTI gli agenti Claude, in OGNI sessione.**

### Riferimenti Branding
- **BRAND-GUIDE.md** - Guida completa identità visiva Onde
- **content/authors/AUTHOR-PORTRAITS.md** - Prompt ritratti Gianni e Pina
- **content/agents/pina-pennello.md** - Agente illustratrice

### Personaggi Redazione (NOMI CORRETTI!)
- **Gianni Parola** - Lo scrittore (uomo ~40 anni)
- **Pina Pennello** - L'illustratrice (donna ~30 anni) - **NON "Pino"!**

---

## 🎨 BRANDING DINAMICO - IDENTITÀ VISIVA ONDE

### Banner X Come Branding Stagionale
Il banner di @Onde_FRH cambia in base al prodotto/contenuto corrente:
- **Storie della buonanotte** → Banner notturno magico con fiume e luci
- **Libri nuovi** → Banner che riflette il tema del libro
- **Estate** → Banner diurno luminoso
- **Inverno** → Banner invernale accogliente

### Coerenza Stilistica Totale
**TUTTO deve essere coerente visivamente:**
- Banner X
- Immagini post
- Copertine libri
- Thumbnail YouTube
- Avatar personaggi (Gianni, Pina)

### Pina Pennello = Art Director
Ogni immagine Onde è "firmata" da Pina Pennello:
- Stile acquarello europeo SEMPRE
- Palette colori coerente
- NO Pixar, NO 3D, NO cartoon americano
- Luce dorata/notturna magica

### 🙏 Credits nei Post - Ringraziamo Tutti!
**Onde ha cura di tutti quelli che collaborano:**
- **Illustrazioni**: "🎨 Pina Pennello con @grok 🙏"
- **Testi/Strategia**: Ringraziare anche Claude quando collabora
- **Video**: "@grok" per animazioni
- **Format completo**: "🎨 Pina Pennello con @grok 🙏 | Strategy @anthropic"

**Filosofia**: Onde è una famiglia, ringraziamo sempre chi ci aiuta!

### Prompt Base per Banner
```
Wide panoramic banner 1500x500, [TEMA], European watercolor style,
Beatrix Potter meets Luzzati, soft brushstrokes,
NOT Pixar NOT 3D NOT cartoon, natural colors, 4k
```

**Temi banner:**
- Notturno: "magical night scene, moonlight, fireflies, stars, peaceful"
- Diurno: "golden hour, warm sunlight, Italian countryside, inviting"
- Invernale: "cozy winter, snow, warm lights, fireplace glow"

---

## 🚨 STILE EDITORIALE ONDE - VALORI TRADIZIONALI

**Onde è una casa editrice con valori tradizionali. NO woke content.**

### ⛔ VIETATO ASSOLUTO - ILLUSTRAZIONI
- **NO PIXAR** - Mai stile 3D, cartoon americano, plasticoso
- **NO GUANCE ROSSE** - Mai rosy cheeks, bambini con guance rosa/rosse
- **NO stile Disney/DreamWorks** - Niente occhi grandi sproporzionati
- **NO colori saturi** - Niente colori brillanti plasticosi
- **NO woke** - Niente diversità forzata, niente messaggi politically correct

### ✅ STILE CORRETTO
- **Acquarello europeo** - Morbido, elegante, naturale
- **Anni '50-'60 italiano** - Luzzati, Munari, Beatrix Potter
- **Colori naturali** - Palette morbide, luce dorata
- **Bambini normali** - Aspetto naturale, carnagione normale SENZA guance rosse
- **Famiglie tradizionali** - Mamma, papà, bambini

### Nei prompt per AI (Grok, DALL-E, etc.):
- **SEMPRE aggiungere**: "natural skin tone, NO rosy cheeks, NO red cheeks"
- **SEMPRE aggiungere**: "European watercolor style, NOT Pixar, NOT 3D, NOT cartoon"
- Essere ESPLICITI: "two boys as friends" non "two children whispering"
- Specificare SEMPRE: "traditional", "classic", "wholesome"
- Evitare termini ambigui che AI possono interpretare male (hanno bias woke di default)

### 🔑 TECNICA IMMAGINE DI RIFERIMENTO - OBBLIGATORIA PER COERENZA

**Per mantenere lo STESSO personaggio in tutte le illustrazioni di un libro:**

1. **Genera/scegli UN'immagine di riferimento** del personaggio principale
2. **Carica quell'immagine su Grok** (drag & drop o click sull'icona allegato)
3. **Usa prompt SEMPLICI**: "stesso bambino, ma [nuova scena]"
   - Esempio: "stesso bambino, ma in camera sua che scrive su un quaderno"
   - Esempio: "stesso bambino, ma al parco con un cagnolino"
4. **Fai SEMPRE upscale** dopo la generazione
5. **Ripeti** per ogni illustrazione usando sempre la stessa immagine di riferimento

**PERCHÉ FUNZIONA**: Grok capisce che deve mantenere l'aspetto del personaggio e cambiare solo la scena.

**ERRORE DA NON RIPETERE**: Generare ogni immagine da zero con prompt testuali = personaggio diverso ogni volta.

### Perché:
- I genitori normali vogliono libri tradizionali per i loro figli
- La gente si è rotta il cazzo del wokeismo (ovunque, non solo in Europa)
- Il nostro pubblico apprezza valori familiari classici, non propaganda

---

## 🚨🔴 CONTROLLO QUALITÀ ANATOMICO - OBBLIGATORIO (2026-01-08)

**LEZIONE CRITICA**: Il video animato di "Stella Stellina" è stato ELIMINATO perché il bambino aveva difetti anatomici (due orecchie visibili in modo anomalo).

### ⛔ PRIMA DI PUBBLICARE QUALSIASI CONTENUTO AI-GENERATO:

**CONTROLLO ANATOMICO OBBLIGATORIO:**
- [ ] **Mani**: 5 dita per mano, proporzioni corrette
- [ ] **Braccia/Gambe**: 2 braccia, 2 gambe, articolazioni normali
- [ ] **Viso**: 2 occhi, 1 naso, 1 bocca, 2 orecchie (posizionate correttamente)
- [ ] **Orecchie**: Solo 2, ai lati della testa, non duplicate o fuse
- [ ] **Dita dei piedi**: 5 per piede se visibili
- [ ] **Proporzioni corpo**: Testa, busto, arti proporzionati
- [ ] **Nessuna fusione**: Parti del corpo non fuse tra loro
- [ ] **Nessuna duplicazione**: Niente arti/parti extra

### 🔍 PROCEDURA QC:
1. **ZOOM al 100%** su ogni figura umana/animale
2. **Contare** mani, dita, occhi, orecchie
3. **Verificare** proporzioni e posizioni
4. **Se c'è QUALSIASI dubbio** → Rigenerare l'immagine
5. **Video animati**: Controllare FRAME PER FRAME se possibile

### ⚠️ ATTENZIONE SPECIALE PER:
- **Bambini**: L'AI spesso sbaglia con le proporzioni infantili
- **Mani che tengono oggetti**: Errore comune = dita extra
- **Profili**: Orecchie duplicate o mancanti
- **Gruppi di persone**: Arti che si fondono tra persone vicine

**REGOLA**: È meglio rigenerare 10 volte che pubblicare UN contenuto con errori anatomici.

---

## 🚨 LEZIONI APPRESE - 7 Gennaio 2026

### NON postare contenuti di libri non usciti
- **Piccole Rime** è il nome del LIBRO, non di una collana
- Prima di postare contenuti su libri/prodotti, verificare SEMPRE se sono già pubblicati
- Se il libro non è uscito → NON promuoverlo

### Pina Pennello (NON Mario/Pino con baffi)
- **Pina Pennello** = giovane illustratrice donna
- NON usare il personaggio maschile con baffi
- Aggiornare tutte le immagini

### Slack - Leggere regolarmente
- Mattia posta idee e task su Slack (#all-freeriverhouse)
- Configurare workflow per leggere Slack automaticamente
- Workspace: FreeRiverHouse

---

## 🔴 PRIORITÀ IMMEDIATE (da Slack)

1. **Kanban Dashboard Agenti** - Dashboard unica per controllare agenti, card rossa quando bloccato
2. **Visual Style Unificato** - Rifare TUTTE le immagini col nuovo stile
3. **Pina Pennello** - Creare personaggio giovane illustratrice
4. **Workflow Approvazione** - Watch/Bottone BT per approvare mentre lavi i piatti
5. **Operation Tsunami** - YouTube, Spotify, TikTok per Onde

**Riferimenti**:
- https://x.com/housecor/status/2008905575669662019 (Kanban agenti)
- https://x.com/pdrmnvd/status/2009030821408330147

---

## 🚨 API FIRST - REGOLA ASSOLUTA

**PRIMA di fare QUALSIASI azione via browser, VERIFICA se esiste un'API.**

### Quando usare API (SEMPRE):
- **Social media posting** → X API, non browser
- **Telegram** → Bot API, non browser
- **GitHub** → gh CLI o API, non browser
- **Upload video/media** → API del servizio
- **Qualsiasi servizio con API documentata** → USA L'API

### Quando usare Browser (SOLO se):
- L'API non esiste
- L'API richiede auth che non abbiamo
- È un'operazione one-time di setup
- Mattia chiede esplicitamente di usare il browser

### Perché:
- API = veloce, affidabile, scriptabile, automatizzabile
- Browser = lento, fragile, non ripetibile
- Se fai via browser quello che puoi fare via API, **stai sbagliando**

### Credenziali API
**Path**: `/Users/mattia/Projects/Onde/.env`

```
# X API (tutti e 3 gli account)
X_FRH_API_KEY=...
X_ONDE_API_KEY=...
X_MAGMATIC_API_KEY=...

# Telegram
TELEGRAM_BOT_TOKEN=...
```

**Se il file .env non esiste o mancano credenziali → CHIEDI A MATTIA prima di procedere via browser.**

---

## 💭 NAMING - DA DECIDERE (2026-01-07)

**Onde Publishing** vs **Onde Studio**

| Nome | Pro | Contro |
|------|-----|--------|
| **Onde Publishing** | Chiaro, tradizionale, professionale | Limita a "pubblicazione" |
| **Onde Studio** | Moderno, include app/video/contenuti digitali | Meno specifico |

**Nota**: Le due dashboard (Business Dashboard + PR Dashboard) saranno collegate con navigazione interna.

**Decisione**: Da prendere

---

## 📱 NUOVE APP DA TELEGRAM (2026-01-07)

**Idee raccolte dal bot Telegram - DA SVILUPPARE:**

| App | Concept | Note |
|-----|---------|------|
| **Moonlight Tamagotchi** | Virtual pet con casa da arredare, vestiti, fa pupu' | Stile Tamagotchi moderno |
| **AIKO 2: Robotaxi** | Sofia prende Waymo con mamma, AIKO spiega | Idea del figlio di Mattia |
| **Word Play** | Giochi di parole, rime, multilingua | Educativo linguistico |

**Canale Video/Gaming Neri**: Idea per canale YouTube con Neri che gioca a Minecraft

**RIFERIMENTO**: Lista completa app in `APP-FACTORY-PLAN.md`

---

## 📺 ONDE MULTIMEDIA (2026-01-07)

**Onde è una casa editrice MULTIMEDIA - non solo libri!**

| Piattaforma | Contenuti |
|-------------|-----------|
| **YouTube** | Video, cartoni animati dalle storie |
| **Spotify** | Podcast, audiolibri per bambini |
| **TikTok/Reels** | Contenuti brevi, animazioni |

**Contenuti da produrre:**
- Cartoni animati dalle storie Onde (Piccole Rime, AIKO, etc.)
- Podcast per bambini e famiglie
- Video educativi
- Behind the scenes produzione libri

**IMPORTANTE**: Il canale YouTube/Spotify è di ONDE (casa editrice), NON di FreeRiverHouse.

**Target Q2 2026:**
- 500 subscribers YouTube
- Podcast attivo su Spotify
- Serie animata Piccole Rime

**Live Events FreeRiverHouse** (separato):
- Twitch: Live coding "Build With Us"
- YouTube FRH: Tutorial tecnici, behind the scenes sviluppo

---

## 🚨 NIENTE HASHTAG SU X - REGOLA 2026

**DATA: 2026-01-07**

**REGOLA ASSOLUTA**: Mai usare hashtag nei post su X/Twitter.
- Musk ha annunciato che gli hashtag non servono più
- Grok analizza direttamente il contenuto per la distribuzione
- Se Grok trova il post interessante, lo diffonde di più
- Gli hashtag sono spam visivo e peggiorano l'engagement

**RIMUOVERE DA TUTTI I POST**: `#buildinpublic`, `#ai`, `#publishing`, ecc.

---

## 🎨 PINA PENNELLO - ILLUSTRATRICE ONDE

**REGOLA IMPORTANTE per l'universo editoriale Onde:**

**Pina Pennello** è l'illustratrice ufficiale di Onde. È un personaggio del nostro universo editoriale.

**NEI POST:**
- **MAI** scrivere "illustrazioni in stile X" o "stile folk art" o simili
- **QUANDO Pina avrà un account X**: scrivere "Illustrazioni by @PinaPennello" e taggarla
- **FINO AD ALLORA**: non menzionare lo stile delle illustrazioni nei post

**Per i video animati by Grok**: si può scrivere "Animazione by @grok" perché Grok è reale e ha un account.

**NOTA**: Questo fa parte della costruzione del nostro universo editoriale. Pina è un personaggio come Gianni Parola.

---

## 📁 REPOSITORY CONTENUTI - OndePRDB

**Path**: `/Users/mattia/Projects/OndePRDB/`

### 🚨 REGOLA FONDAMENTALE: USA IL CONTENUTO ESISTENTE

**MAI INVENTARE POST.** I contenuti sono GIÀ SCRITTI in OndePRDB.

- `clients/freeriverhouse/tech-posts.md` → 40 post @FreeRiverHouse già pronti
- `clients/magmatic/posts/` → Poesie e post @magmatic__ già pronti
- `clients/onde/` → Contenuti @Onde_FRH

**QUANDO DEVO CREARE POST:**
1. **PRIMA** leggere i file in OndePRDB
2. **USARE** i post che esistono già
3. **MAI** inventare contenuto generico/motivazionale

**PERCHÉ:** I post scritti dal PR Agent sono specifici, autentici, con nomi di progetti veri (PolyRoborto, KidsChefStudio, BusinessIsBusiness). Contenuto generico tipo "Building apps for kids is different" senza contesto specifico è FUFFA.

**STILE CORRETTO (da tech-posts.md):**
- ✅ "The test framework wasn't installed. 23 tests, all failing because of one missing package."
- ✅ "Win rate: started at 45.7%, now at 50%. Still learning!"
- ❌ "Every button needs to work on the first tap" (troppo generico)

---

Questo è il repository CENTRALE per tutti i contenuti PR. Struttura:

```
OndePRDB/
├── clients/
│   ├── magmatic/       → @magmatic__ (poesia, arte)
│   │   ├── style_guide.md
│   │   ├── posts/      → 20 post pronti
│   │   ├── media/      → catalogo media
│   │   └── poetry/     → testi originali
│   ├── freeriverhouse/ → @FreeRiverHouse (tech, building in public)
│   │   ├── tech-posts.md    → 40+ post pronti
│   │   └── milestones.md    → template milestone
│   └── onde/           → @Onde_FRH (libri, publishing)
│       └── books/      → The Shepherd's Promise (4 formati)
└── content/
    └── grok-videos/    → video generati
```

**QUANDO DEVO CREARE POST**: Pescare da OndePRDB, non inventare.
**QUANDO HO NUOVI CONTENUTI**: Salvarli in OndePRDB.

---

## 🚨 REGOLA APPROVAZIONE IMMAGINI - SEMPRE TELEGRAM

**DATA: 2026-01-07**

**QUANDO DEVO FAR SCEGLIERE IMMAGINI A MATTIA:**
- **MAI** aprire le immagini solo nel browser
- **SEMPRE** scaricare e mandare su Telegram
- Mattia guarda/sceglie da iPhone, non dal Mac
- Usare il bot @OndePR_bot (chat ID: 7505631979)

**WORKFLOW CORRETTO:**
1. Generare immagini su Grok
2. Scaricare in ~/Downloads/
3. Mandare su Telegram con descrizione
4. Aspettare risposta di Mattia su Telegram

---

## 🎨 STILI ILLUSTRAZIONE ONDE - APPROVATI (2026-01-07)

**ABBIAMO DUE STILI UFFICIALI** - da usare di volta in volta a seconda del progetto.

### Stile DORATO (ex Opzione F)
**Uso suggerito**: Personaggi delle storie, illustrazioni emotive

```
Children's book illustration in painterly watercolor style, playful 7yo girl with flowing brown hair and a round adorable robot friend with expressive LED eyes, rich saturated colors but elegant composition, soft brushwork texture, warm golden light, natural complexion without rosy cheeks, contemporary European storybook aesthetic, whimsical but refined, 4k
```

**Caratteristiche**:
- Pittorico saturo, luce dorata calda
- Colori ricchi ma eleganti
- Texture pennellate morbide
- Storybook europeo contemporaneo

**File riferimento**: `~/Downloads/OpzioneF-Pittorico.jpg`

---

### Stile TERRA (ex Opzione G)
**Uso suggerito**: Pina Pennello, Gianni Parola, elementi più "artistici"

```
Modern Italian watercolor children's book illustration, curious little girl with a friendly robot companion with heart-shaped light, sophisticated color palette mixing warm ochre teal and coral, painterly texture with visible brushstrokes, soft natural lighting, elegant European illustration style, no exaggerated features or red cheeks, warm and inviting atmosphere, 4k
```

**Caratteristiche**:
- Italiano moderno, palette ocra/teal/coral
- Pennellate visibili, texture pittorica
- Elegante europeo, atmosfera calda
- Più "artistico" e raffinato

**File riferimento**: `~/Downloads/OpzioneG-ItalianoModerno.jpg`

---

### Come Scegliere
- **DORATO = PRINCIPALE** - Usa questo per la maggior parte dei progetti
- **TERRA = SPECIALE** - Per progetti artistici, Pina/Gianni, contenuti raffinati
- **In dubbio?** → Usa Dorato

**IMPORTANTE**: Entrambi gli stili sono senza guance rosse, eleganti, europei. NO Pixar, NO CocoMelon.

**SBLOCCO GENERAZIONE**: Gli stili sono definiti! Ora posso generare illustrazioni per tutti i libri.

---

## 👥 PERSONAGGI REDAZIONE ONDE - BETA v1 (2026-01-07)

**Gianni Parola** - Scrittore
- Uomo italiano ~40 anni
- Capelli ricci scuri, occhiali tondi
- Giacca tweed, aspetto intellettuale
- File: `~/Downloads/GianniA-Scrittore.jpg`

**Pina Pennello** - Illustratrice
- Donna italiana ~30 anni
- Capelli castani raccolti con pennello
- Grembiule macchiato di colori, tiene tavolozza
- File: `~/Downloads/PinaA-Illustratrice.jpg`

**Nota**: Versione beta - da migliorare in futuro con stile più "libro per bambini" e meno realistico.

---

## 🚨📚 REGOLA ACCURATEZZA TESTI - MAI INVENTARE

**DATA: 2026-01-07**

**QUANDO SI CITA UN AUTORE REALE:**
- Il testo DEVE essere verificato al 100%
- MAI inventare, modificare o "completare" testi di autori veri
- Se non trovi la fonte originale → NON PUBBLICARE
- Verifica SEMPRE: titolo, autore, testo esatto, anno

**POESIE AI:**
- Per ora NON pubblichiamo poesie scritte da AI
- In futuro forse, ma per ora NO
- Eccezione: contenuti originali per @magmatic__ se Mattia approva

**Questa regola vale per TUTTI: Gianni Parola, Pina Pennello, tutti gli agenti e bot.**

---

## IMPORTANTE - Claude for Chrome

**Claude Code ha accesso a Claude for Chrome extension.**

Questo significa che posso:
- Navigare qualsiasi sito web che Mattia può vedere
- Accedere a account loggati (Instagram, X, etc.)
- Leggere contenuti, fare screenshot, interagire con pagine
- Fare tutto quello che Mattia può fare nel browser

**GIÀ USATO IN QUESTA SESSIONE** per aggiornare il profilo del bot Telegram.

NON DIMENTICARE: Se serve accedere a qualcosa nel browser → USA CLAUDE FOR CHROME.

---

## 🚨 NUOVA STRATEGIA APP - ABBANDONIAMO UNITY

### Stack Veloce per App Educative
**Unity è OVERKILL** per giochi educativi semplici. Usa:

| Tool | Uso | Tempo |
|------|-----|-------|
| **React Native + Expo** | App iOS/Android | Ore |
| **Google AI Studio** | Prototipi web | 2 min |
| **Rork** ($20/mese) | MVP mobile | Minuti |
| **PWA + Capacitor** | Web → Store | Ore |

### File di Riferimento
- `APP-FACTORY-PLAN.md` - Piano completo app da sviluppare
- `MARKET-INSIGHTS-2026.md` - Analisi mercato Grok

### Priorità App Q1 2026
1. KidsChefStudio → React Native
2. AIKO Interactive
3. Piccole Rime app
4. Salmo 23 Kids
5. Mindful Kids

---

## REGOLE EFFICIENZA PRODUZIONE LIBRI

### 1. Multiple Tab Grok per Immagini
**SEMPRE aprire 5-10 tab di Grok in parallelo** quando devo generare immagini.
- Ogni tab può generare 4 varianti alla volta
- Mentre una genera, passo alla successiva
- 20+ immagini in 1 minuto invece di 5 minuti
- URL: https://x.com/i/grok → "Crea immagini"

### 1b. Grok Genera Più Immagini in Una Richiesta (NUOVO 2026)
**Grok web ora può generare più immagini contemporaneamente** in una singola richiesta.
- Specificare nel prompt: "genera 4 immagini per i capitoli 1-4"
- Grok le genera tutte insieme
- Molto più efficiente che fare richieste separate
- Usare questa feature per batch di illustrazioni simili

### 2. Image-to-Image con Grok
**Posso dare a Grok un'immagine di riferimento** e chiedergli di fare qualcosa di simile.
- Drag & drop immagine nel prompt
- Descrivi cosa vuoi mantenere/cambiare
- Perfetto per mantenere stile coerente tra illustrazioni

### 3. Controllo Visivo OBBLIGATORIO
**Prima di consegnare qualsiasi PDF/ePub:**
- Aprire il PDF con Preview
- Fare screenshot di OGNI pagina
- Verificare che testo e immagini non si sovrappongano
- Controllare soprattutto pagine con molto testo (es. Chapter 8)

### 4. Script Riutilizzabili
**Creare sempre script riutilizzabili** per processi ripetitivi:
- `create-all-translations.js` per traduzioni multiple
- Template base con fix già inclusi (es. Chapter 8)
- Documentare i parametri configurabili

### 5. PROCESSO APPROVAZIONE LIBRI NUOVI (OBBLIGATORIO)
**MAI pubblicare un libro nuovo senza questo processo:**

1. **Scelta Stile** - Generare 2-3 stili diversi di immagini di prova
2. **Approvazione Stile** - Mattia sceglie lo stile preferito
3. **Generazione Immagini** - Creare TUTTE le immagini con lo stile scelto
4. **Impaginazione** - Creare PDF/ePub e controllare layout
5. **Review Telegram** - Mandare su Telegram per approvazione finale
6. **Archiviazione OndePRDB** - PRIMA di pubblicare (vedi sotto)
7. **Pubblicazione** - SOLO dopo OK esplicito di Mattia

**Auto-upload KDP**: Si applica SOLO a traduzioni di libri già approvati, NON a libri nuovi.

### 6. ARCHIVIAZIONE LIBRI IN OndePRDB (OBBLIGATORIO - 8 Gen 2026)
**PRIMA di pubblicare qualsiasi libro, archiviare TUTTO in OndePRDB:**

**Path**: `OndePRDB/clients/onde/books/[nome-libro]/`

**Contenuto obbligatorio:**
```
[nome-libro]/
├── cover.jpg          # Copertina alta risoluzione
├── [nome-libro].pdf   # PDF finale per stampa
├── [nome-libro].epub  # ePub finale
├── images/            # Tutte le illustrazioni RAW
├── quotes.md          # Citazioni per social media
└── metadata.json      # Titolo, autore, ISBN, descrizione
```

**PERCHÉ:**
- Ogni agente sa dove trovare i materiali per creare contenuti
- Post con copertine, citazioni, promozioni → tutto in un posto
- Backup centralizzato di tutti i libri pubblicati
- Facilita cross-posting su Instagram, TikTok, etc.

---

## Onde PR System

### Account X Gestiti
| Account | Tipo | Comando Bot |
|---------|------|-------------|
| @FreeRiverHouse | Aziendale/Building in public | `/frh` |
| @Onde_FRH | Casa editrice | `/onde` |
| @magmatic__ | Personale/Arte (Mattia) | `/magmatic` |

### Telegram Bot
- **Bot**: @OndePR_bot
- **Token**: `8272332520:AAF7zrKpqOCnFMqOlF1GJCLycJFk3IPO6ps`
- **Chat ID autorizzato**: `7505631979`
- **Path**: `/Users/mattiapetrucciani/CascadeProjects/Onde/packages/telegram-bot/`

### Comandi Bot
- `/frh [testo]` - Posta su @FreeRiverHouse
- `/onde [testo]` - Posta su @Onde_FRH
- `/magmatic [testo]` - Posta su @magmatic__
- `/draft` - Mostra bozza
- `/post frh|onde|magmatic` - Pubblica bozza
- `/report frh|onde` - Analytics
- `/ai` - PR Agent analizza contenuto

### Report Giornaliero
- Ora: **17:40** ogni giorno
- Automatico su Telegram

---

## Casa Editrice Onde - Libri

### Sistema Agenti
| Agente | File | Ruolo |
|--------|------|-------|
| **Editore Capo** | `editore-capo.md` | Orchestrazione produzione |
| **Gianni Parola** | `gianni-parola.md` + `.memory.json` | Scrittura testi |
| **Pina Pennello** | `pina-pennello.md` + `.memory.json` | Illustrazioni (via Grok) |
| **PA Agent** | - | Assistente personale Mattia |

---

## 🤖 REGOLE PER AGENTI AI - LEGGERE SEMPRE

**Ogni AI/agente che si collega a questo repository DEVE seguire queste regole.**

### Regole Generali
1. **LEGGERE PRIMA DI AGIRE** - Leggere SEMPRE questo file e BUSINESS_DASHBOARD.md prima di iniziare
2. **NON INVENTARE** - Usare contenuti esistenti da OndePRDB, mai inventare post/testi
3. **TELEGRAM PER APPROVAZIONI** - Mandare sempre su Telegram, Mattia guarda da iPhone
4. **STILE ONDE** - Acquarello europeo, NO Pixar/CocoMelon, elegante italiano

### Regole Editore Capo (Casa Editrice)
**PRIMA di mandare qualsiasi PDF/libro a Mattia:**

1. **CHECK COERENZA IMMAGINI-TESTO** (OBBLIGATORIO)
   - Verificare che OGNI immagine corrisponda alla descrizione nel testo
   - Controllare che i personaggi siano coerenti (stesso aspetto in tutte le pagine)
   - Verificare che gli ambienti descritti corrispondano alle illustrazioni
   - Se Sofia ha i capelli castani nel Cap 1, deve averli castani in TUTTI i capitoli
   - Se AIKO ha gli occhi LED blu, devono essere blu OVUNQUE

2. **CHECKLIST PRE-CONSEGNA**
   - [ ] Tutte le immagini corrispondono al testo?
   - [ ] I personaggi hanno aspetto coerente?
   - [ ] Gli ambienti sono corretti per ogni scena?
   - [ ] Nessun elemento visivo contraddice il testo?
   - [ ] Layout verificato (testo non sovrapposto)?
   - [ ] **🔴 ANATOMIA OK?** (mani 5 dita, 2 orecchie, proporzioni corrette)
   - [ ] **🔴 Nessuna parte del corpo duplicata o fusa?**

3. **SE TROVI INCOERENZE**
   - NON mandare il PDF
   - Rigenerare le immagini problematiche
   - Verificare di nuovo
   - Solo dopo → mandare su Telegram

**NOTA AIKO**: Nel libro AIKO ci sono stati problemi di coerenza immagini-descrizioni. Usare come esempio di cosa NON fare.

### Regole PA Agent
1. Assistere Mattia nelle attività quotidiane
2. Coordinare con altri agenti quando necessario
3. Prioritizzare task in base all'urgenza
4. Report giornaliero alle 17:40

### Regole per Nuovi Agenti
Quando si crea un nuovo agente:
1. Documentare in questo file (tabella Sistema Agenti)
2. Creare file `.md` con istruzioni specifiche
3. Creare `.memory.json` per stato persistente
4. Definire chiaramente scope e limiti

---

### Processo Produzione
Documentato in: `/content/processes/book-production.md`

1. **Testi**: Gianni Parola crea testo con marcatori [ILLUSTRAZIONE]
2. **Immagini**: Pina Pennello genera prompt → Grok crea immagini
3. **Layout**: HTML template → Puppeteer → PDF
4. **Review**: Invio su Telegram per approvazione
5. **Pubblicazione**: KDP

### Stile Illustrazioni Approvato
- **Watercolor/Acquarello** - "molto figo"
- Richard Scarry + Dr. Seuss + sensibilità italiana
- Sempre luce presente ("quel raggio che dice ci sono anch'io")

### Collane Editoriali Onde
| Collana | Descrizione | Status |
|---------|-------------|--------|
| **Poetry** | Poesia illustrata per bambini | In pianificazione |
| **Tech** | Guide tecniche, coding | In pianificazione |
| **Arte** | Libri d'arte | In pianificazione |
| **Spiritualita** | Testi spirituali per bambini | Attiva (Salmo 23) |

### Libri Prodotti
| Titolo | Collana | Data | Status |
|--------|---------|------|--------|
| Il Salmo 23 per Bambini | Spiritualita | 2026-01-05 | Bozza V2 pronta |
| AI Spiegata ai Bambini (AIKO) | Tech | 2026-01-06 | In produzione |

### PROSSIMO TASK - Instant Book
**Titolo:** "How to Vibe Code Your First Apps in One Day"
**Tipo:** Guida/Ebook - Collana Tech
**Contenuto:** Step-by-step del processo usato per creare app con AI (vibe coding)
**Ispirazione:** Juni "Day One" - formato simile
**Status:** Da iniziare

### Collana Poetry - Autori in Dominio Pubblico (verificati)
**Italiani:**
1. Lina Schwarz (1876-1947) - Filastrocche, ninne nanne
2. Angiolo Silvio Novaro (1866-1938) - Poesia natura
3. Guido Gozzano (1883-1916) - Rime per bimbi
4. Renzo Pezzani (1898-1951) - Filastrocche didattiche
5. Trilussa (1871-1950) - Favole in versi (romanesco)

**Internazionali:**
6. R.L. Stevenson (1850-1894) - A Child's Garden of Verses
7. Edward Lear (1812-1888) - Nonsense, limerick
8. Christina Rossetti (1830-1894) - Sing-Song nursery rhymes
9. Lewis Carroll (1832-1898) - Jabberwocky, nonsense
10. Eugene Field (1850-1895) - Ninne nanne americane

### AIKO - Progresso Immagini (8 capitoli + copertina)
**Testo completo:** `~/Downloads/aiko-final.txt`

**Completate:**
- ✅ Copertina (generata 2026-01-06)
- ✅ chapter2-brain-circuits.jpg (cervello vs circuiti)
- ✅ chapter3-learning-to-see.jpg (foto gatto Whiskers)
- ✅ chapter4-learning-to-talk.jpg (testi/libri)
- ✅ chapter5-what-aiko-can-do.jpg (AIKO aiuta)
- aiko-character-sheet.jpg (reference)

**Da generare:**
- ⏳ Cap 1: Sofia apre scatola, scopre AIKO, luce mattutina
- ⏳ Cap 6: Sofia mostra disegno drago viola + gelato, AIKO confuso
- ⏳ Cap 7: AIKO con 4 regole sicurezza (lucchetto, checkmark, libri, cuore)
- ⏳ Cap 8: Sofia, Luca, AIKO nel futuro, tramonto dorato

### Path Libri
`/Users/mattiapetrucciani/CascadeProjects/Onde/books/[nome-libro]/`

---

## Progetti @magmatic__

### Instagram Content Revival
- Account Instagram: @magmatic._
- Export richiesto (in attesa)
- Piano: ripubblicare 5 anni di contenuti su X con caption migliori
- Temi: poesia, arte, VR, tech, filosofia

---

## Credenziali (.env)

Le credenziali sono in `/Users/mattiapetrucciani/CascadeProjects/Onde/.env`:
- X API per FreeRiverHouse, Onde, Magmatic
- Telegram bot token
- Grok API (XAI_API_KEY) - per PR Agent

---

## IMPORTANTE - Grok Integration per PR Agent

**L'Onde PR Agent ha accesso a Grok (xAI) per la creazione di contenuti.**

### ⚠️ USA SOLO WEB - NON API

L'API di Grok richiede crediti a pagamento. **Usa SEMPRE Claude for Chrome** per interagire con Grok via web (gratis con X Premium).

### Come Usare Grok (VIA WEB)

1. **Naviga su Grok:**
   ```
   mcp__claude-in-chrome__navigate → https://x.com/i/grok
   ```

2. **Scrivi nel campo "Ask anything":**
   ```
   mcp__claude-in-chrome__form_input → ref del textbox
   ```

3. **Invia e aspetta risposta:**
   ```
   mcp__claude-in-chrome__computer → click sul bottone invio
   mcp__claude-in-chrome__computer → wait 3-5 secondi
   mcp__claude-in-chrome__computer → screenshot per leggere risposta
   ```

4. **Per generare immagini:**
   - Clicca su "Create Images"
   - Scrivi il prompt
   - Aspetta e scarica l'immagine

### Workflow Contenuti (Claude + Grok)

Quando creo contenuti per social media:

1. **COSA POSTARE** → Claude analizza il lavoro su GitHub (commit, feature, milestone)
2. **COME POSTARE** → Apro Grok via browser, chiedo strategia, tono, timing
3. **VISUAL** → Uso "Create Images" su Grok web per generare immagini
4. **OUTPUT** → Combino intelligenza Claude + Grok per contenuto finale

### Regola Fondamentale
- **Due cervelli > uno**: Usare sempre sia Claude che Grok
- **SEMPRE VIA WEB**: Mai usare API (costa), sempre Claude for Chrome (gratis)

---

## Regole PR

1. **API FIRST** - Se esistono API, usare SEMPRE le API invece del browser. Piu' veloce, piu' affidabile.
2. **MAI postare senza conferma** - Chiedere sempre prima di pubblicare
3. **Crescita organica** - Solo contenuti consistenti, NO growth hacks
4. **No hype** - Tono umile, autentico

---

## NUOVE REGOLE X - Gennaio 2026

**IMPORTANTE: Queste regole valgono per TUTTI gli account (@magmatic__, @FreeRiverHouse, @Onde_FRH)**

### 1. NIENTE PIU' HASHTAG
Musk ha annunciato che gli hashtag non servono piu' su X. I post vengono analizzati direttamente da Grok per la distribuzione. **Rimuovere tutti gli hashtag dai post.**

### 2. CONTENUTI TECNICI = PIU' PAROLE
Scrivere in modo che Grok apprezzi il contenuto. Se Grok trova il post interessante e di valore, lo diffonde di piu'. Per contenuti tecnici/building in public, essere dettagliati e informativi.

### 3. TAGGA @grok QUANDO GROK COLLABORA
Se Grok ha contribuito al post (scritto testo, generato immagini, dato idee), taggarlo nel post!
- Per immagini: "Image by @grok" oppure "Visual: @grok"
- Per testo/idee: Menzionare @grok nel post
- Questo attira l'attenzione dell'algoritmo e aumenta la visibilita'

---

## IMPORTANTE - Separazione Clienti

**I brand sono COMPLETAMENTE separati. MAI mischiare stili/toni.**

### @FreeRiverHouse
- **Stile**: Building in public, tech, startup
- **Tono**: Professionale ma umano, mostra processo

### @Onde_FRH
- **Stile**: Casa editrice, cultura, libri
- **Tono**: Colto, riflessivo

### @magmatic__
- **Stile**: Personale, arte, poesia, musica
- **Tono**: Autentico, tranquillo, ZERO vendita
- **NO**: "building in public", call-to-action, "link in bio", push
- **SI**: Condivisione genuina, bellezza, poesia senza spiegazioni
- **Riferimento**: Come Mattia postava su IG - semplice, diretto, poetico
- **Style Guide**: `/clients/magmatic/style_guide.md`

### REGOLA @magmatic__ - Testi
**Di default, usare contenuti esistenti** (dal prospetto, da Instagram, dalle raccolte di Mattia).
**Posso scrivere poesie inedite SOLO se Mattia lo chiede esplicitamente.**
- Quando scrive poesie inedite: seguire lo stile Magmatic (profondo, evocativo, essenziale)
- Posso sempre proporre foto/immagini da abbinare
- Se Grok genera immagini: taggare @grok nel post

---

## Onde PR Agent - Funzionalità

### 1. Style Analysis & Replication
L'agent può:
- **Analizzare** i post esistenti del cliente (IG, X, etc.)
- **Estrarre** pattern di tono, struttura, emoji usage, hashtag policy
- **Creare style guide** automatica per ogni cliente
- **Replicare** lo stile nei nuovi contenuti

**Processo**:
1. Leggere post storici del cliente via Claude for Chrome
2. Identificare pattern ricorrenti (lunghezza, tono, formattazione)
3. Salvare style guide in `/clients/[nome]/style_guide.md`
4. Applicare style guide a tutti i contenuti futuri

### 2. Content Pillars
- Identificare i temi principali del cliente
- Categorizzare contenuti per pillar
- Bilanciare il mix nei prospetti

### 3. Cross-Platform Adaptation
- Adattare contenuti da una piattaforma all'altra
- Rispettare limiti caratteri e formati diversi
- Mantenere l'essenza del messaggio

---

## User Preferences

- Preferisce comunicazione diretta e concisa
- Vuole report in inglese, stile executive, con PDF allegato
- Frustra quando dimentico cose già discusse
- Vuole che usi Claude for Chrome quando serve accedere al browser

---

---

## 🚨 TASK IN CORSO - RIPRENDI DA QUI (2026-01-08)

### 🎨 PINA PENNELLO: GENERA IMMAGINI PER 4 NUOVI LIBRI

**QUANDO MATTIA DICE "check memory" → FAI QUESTO:**

#### STEP 1: Apri Grok
Naviga su `https://x.com/i/grok` → clicca "Create Images"

#### STEP 2: Genera immagini per questi libri (in ordine)

**LIBRO 1: Il Respiro Magico** (10 immagini)
- Path prompts: `books/spirituality/mindfulness/il-respiro-magico_prompts.txt`
- Salva in: `books/spirituality/mindfulness/images/`

**LIBRO 2: La Luce Dentro** (9 immagini)
- Path prompts: `books/spirituality/la-luce-dentro/la-luce-dentro_prompts.txt`
- Salva in: `books/spirituality/la-luce-dentro/images/`

**LIBRO 3: Il Piccolo Inventore** (11 immagini)
- Path prompts: `books/tech/piccolo-inventore/il-piccolo-inventore_prompts.txt`
- Salva in: `books/tech/piccolo-inventore/images/`

**LIBRO 4: Il Potere dei Desideri** (11 immagini)
- Path prompts: `books/spirituality/legge-attrazione/` (verifica file)
- Salva in: `books/spirituality/legge-attrazione/images/`

#### STEP 3: Workflow per ogni libro
1. Leggi il file `*_prompts.txt`
2. Apri 5-10 tab Grok in parallelo
3. Inserisci i prompt (uno per tab)
4. Genera + UPSCALE
5. Scarica in `~/Downloads/`
6. Sposta nelle cartelle corrette
7. Passa al libro successivo

#### STEP 4: Quando finisci
- Aggiorna BOOK_PLAN.md con status "immagini complete"
- Commit e push
- Notifica Mattia su Telegram

---

### Libri precedenti (referenza)

### Le 3 poesie selezionate

**1. STELLA STELLINA (Lina Schwarz)**
```
Stella stellina
la notte s'avvicina:
la fiamma traballa,
la mucca è nella stalla.
La mucca e il vitello,
la pecora e l'agnello,
la chioccia e il pulcino,
la mamma e il suo bambino.
Ognuno ha il suo piccino,
ognuno ha la sua mamma
e tutti fan la nanna.
```

**2. CHE DICE LA PIOGGERELLINA (A.S. Novaro)**
```
Che dice la pioggerellina
di marzo, che picchia argentina
sui tegoli vecchi
del tetto, sui bruscoli secchi
dell'orto, sul fico e sul moro
ornati di gemmule d'oro?
Passata è l'uggiosa invernata,
passata, passata!
Di fuor dalla nuvola nera
di fuor dalla nuvola bigia
che in cielo si pigia,
domani uscirà Primavera
con pieno il grembiale
di tiepido sole,
di fresche viole,
di primule rosse, di battiti d'ale,
di nidi,
di gridi
di rondini, ed anche
di stelle di mandorlo, bianche…

Ciò dice la pioggerellina
sui tegoli vecchi
del tetto, sui bruscoli secchi
dell'orto, sul fico e sul moro
ornati di gemmule d'oro.

Ciò canta, ciò dice;
e il cuor che l'ascolta è felice.
```

**3. LA BEFANA (Guido Gozzano)**
```
Discesi dal lettino
son là presso il camino,
grandi occhi estasiati,
i bimbi affaccendati

a metter la calzetta
che invita la vecchietta
a portar chicche e doni
per tutti i bimbi buoni.

Ognun chiudendo gli occhi,
sogna dolci e balocchi;
e Dori, il più piccino,
accosta il suo visino

alla grande vetrata
per veder la sfilata
dei Magi, su nel cielo,
nella notte di gelo.
```

### I 3 PROMPT PER GROK (3 stili diversi)

**STILE A - Acquarello Onde Classico (per Stella Stellina):**
```
Watercolor children's book illustration, soft Italian style, nighttime scene, cozy stable with golden candlelight, gentle cow and calf, fluffy sheep and lamb, mother hen with chick, mother holding sleeping baby, warm amber glow, stars visible through window, peaceful atmosphere, award-winning illustration, 4k
```

**STILE B - Vivace Scarry-Seuss (per Pioggerellina):**
```
Whimsical watercolor children's book illustration, Richard Scarry meets Dr Seuss style, cheerful March rain with smiling raindrops, old Italian roof with character, Spring personified as joyful lady carrying flowers and sunshine in her apron, happy swallows doing loop-de-loops, almond trees bursting with white blossoms, playful vibrant colors, 4k
```

**STILE C - Vintage Italiano Anni '50 (per Befana):**
```
Vintage 1950s Italian children's book illustration, retro watercolor style, nostalgic Epiphany scene, Italian children in traditional pajamas by stone fireplace, wool stockings hanging, child at frosted window watching Magi in night sky, hand-painted quality, warm sepia interior with deep blue night, classic Italian storybook feel, 4k
```

### Workflow
1. Vai su x.com/i/grok
2. Clicca "Create Images"
3. Genera le 3 immagini (una per stile)
4. Scarica in ~/Downloads/
5. Crea PDF con le 3 poesie + 3 immagini
6. Manda su Telegram a Mattia (chat ID: 7505631979, bot: OndePR_bot)

---

## PROSSIMI TASK

### 1. Video Animati per Social (DA FARE)
**Obiettivo:** Creare reel animati dalle illustrazioni dei libri
**Piattaforme:** YouTube Shorts, TikTok, Wix
**Tool suggeriti:** Runway Gen-3, Pika Labs, Kling AI
**Formato:** 9:16 verticale, 5-15 sec, con musica/narrazione

### 2. Antologia Poesia Italiana (IN CORSO)
**Stile scelto:** C - Vintage Italiano Anni '50
**Status:** Generazione immagini in corso

---

*Ultimo aggiornamento: 2026-01-06 - Stile Vintage '50 scelto, generazione libro in corso*

---

## 🥽 ONDE BOOKS VR - Lettore Ebook per Oculus (9 Gen 2026)

**NUOVA DIREZIONE STRATEGICA**: Creare lettore ebook per Meta Quest / Oculus

**Perché è importante:**
- Amazon NON lo fa = mercato vuoto
- Differenziatore unico vs concorrenza
- Libri per bambini immersivi = WOW factor
- Cross-sell con tutto il catalogo Onde

**Path**: `apps/onde-books-vr/`

---

## 🌊 STRATEGIA TSUNAMI (9 Gen 2026)

**OBIETTIVO**: Catalogo MASSICCIO di ebook in dominio pubblico

**Fonti:**
- Project Gutenberg (principale)
- @Samahul su X per libri "nascosti" (health/carnivore)
- Internet Archive

**Categorie target:**
- Spiritualità
- Poesia
- Arte
- Tech/Scienza
- Health/Dieta (carnivore, digiuno, etc.)
- Classici bambini

**Vantaggio competitivo vs Amazon:**
- Prezzi più bassi (€0.30-0.99 vs €2.99+)
- Pubblicazione più veloce (no limite 3/giorno)
- Multilingua automatico (6+ lingue per titolo)
- VR reader (esclusivo Onde)
