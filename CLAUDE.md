# Claude Memory - Onde Project

## Owner
Mattia Petrucciani - parla italiano, comunicazione diretta.

---

## 🚨 REGOLE GIT - OBBLIGATORIE

1. **SEMPRE `git pull` PRIMA di iniziare qualsiasi lavoro** - Mai modificare file senza prima sincronizzarsi col remote
2. **Mai pushare senza aver pullato** - Se il push fallisce, pull --rebase e riprova
3. **Non committare build artifacts** (.vercel/, .next/, node_modules/, etc.)
4. **Un commit per task** - Non mischiare cambiamenti non correlati

---

## 🔗 GitHub - Repository FreeRiverHouse

**Organizzazione:** https://github.com/FreeRiverHouse

| Repo | Descrizione | Path locale |
|------|-------------|-------------|
| **Onde** | Monorepo principale (portal, telegram-bot, books) | `/Users/mattia/Projects/Onde` |
| **OndePRDB** | Database PR system | `/Users/mattia/Projects/OndePRDB` |
| **PolyRoborto** | Copy-trading bot Polymarket | `/Users/mattia/Projects/PolyRoborto` |
| **polyroborto-data** | Dashboard data (JSON sync ogni 5 min) | Auto-sync da PolyRoborto |
| **minecraft-server** | Minecraft server config | `/Users/mattia/Projects/minecraft-server` |
| **the-algorithm** | Fork Twitter algorithm (reference) | `/Users/mattia/Projects/the-algorithm` |

**Autenticazione:**
```bash
# Già configurato con gh CLI
gh auth status
```

**Token:** `GH_TOKEN` in `.env` (ghp_xxx)

---

## 🚨 DEPLOY ONDE.LA - PROCEDURA OBBLIGATORIA (2026-01-19)

**NON C'È AUTO-DEPLOY DA GITHUB! Devi fare deploy manuale con wrangler.**

```bash
cd /Users/mattiapetrucciani/CascadeProjects/Onde/apps/onde-portal
npm run build
npx wrangler pages deploy out --project-name=onde-portal
```

**ATTENZIONE:**
- **onde.la** → progetto `onde-portal`
- **onde.surf** → progetto `onde-surf`
- **SEMPRE** usare `onde-portal` per onde.la!

**SEMPRE fare questo dopo ogni modifica a onde-portal!**

---

## 🚨 DEPLOY ONDE.SURF - PROCEDURA AUTOMATICA (2026-01-22)

**METODO 1: GitHub Actions (AUTOMATICO - push to main)**

Ogni push su `apps/surfboard/**` triggera auto-deploy via `.github/workflows/deploy-surfboard.yml`

**METODO 2: Deploy Programmatico (da Conductor/CLI)**

```bash
cd /path/to/Onde/apps/surfboard
npm run build && npm run build:cf
CLOUDFLARE_API_TOKEN=RGNdXWCWyAHpUKqKRMf5vezPEVQSq3uw1TuX62aw \
npx wrangler pages deploy .vercel/output/static --project-name=onde-surf
```

**METODO 3: Trigger manuale workflow**

```bash
gh workflow run deploy-surfboard.yml -R FreeRiverHouse/Onde
```

**Credenziali Cloudflare:**
- Account ID: `91ddd4ffd23fb9da94bb8c2a99225a3f`
- API Token: `RGNdXWCWyAHpUKqKRMf5vezPEVQSq3uw1TuX62aw`
- Progetto: `onde-surf`

**SEMPRE testare dopo deploy:**
```bash
curl -s "https://onde.surf/api/house" | jq '.stats.agents'
curl -s "https://onde.surf/api/pr/posts?status=pending" | jq 'length'
```

### ⚠️ LESSON LEARNED - Worker Routes vs Pages (2026-01-21)

**PROBLEMA RISCONTRATO:**
- `onde-surf.pages.dev` funzionava ma `onde.surf` dava 307 redirect
- Causa: c'era un **Worker separato** chiamato `onde-surf` con routes `onde.surf/*` e `www.onde.surf/*`
- Questo Worker intercettava il traffico PRIMA che arrivasse a Pages

**DIAGNOSI:**
1. Vai su Cloudflare Dashboard → onde.surf domain
2. Menu laterale → **Workers Routes**
3. Se vedi routes per `onde.surf/*` → quello è il problema!

**SOLUZIONE:**
1. Cloudflare Dashboard → Workers & Pages → onde-surf (Worker)
2. Settings → Domains & Routes
3. Elimina le routes `onde.surf/*` e `www.onde.surf/*`
4. Ora il custom domain va a Pages invece che al Worker

**REGOLA:** Se il custom domain non funziona ma pages.dev sì, controlla SEMPRE se ci sono Worker routes che intercettano il traffico!

### ⚠️ LESSON LEARNED - NextAuth su Cloudflare Pages (2026-01-21)

**PROBLEMA RISCONTRATO:**
- Google OAuth completava correttamente (session valida su `/api/auth/session`)
- Ma middleware redirigeva sempre a `/login` (token non validato)
- Causa: `getToken()` di `next-auth/jwt` non funziona correttamente su Cloudflare Workers edge runtime

**SOLUZIONE:**
Usare il pattern `auth()` wrapper di NextAuth v5 invece di `getToken()`:

```typescript
// middleware.ts - PRIMA (non funziona su Cloudflare)
import { getToken } from "next-auth/jwt"
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET })
  if (!token?.email) { redirect to login }
}

// middleware.ts - DOPO (funziona su Cloudflare)
import { auth } from "./lib/auth"
export default auth((req) => {
  if (!req.auth?.user?.email) { redirect to login }
})
```

**REGOLA:** Su Cloudflare Pages con NextAuth v5, usare SEMPRE `auth()` wrapper nel middleware, MAI `getToken()`.

---

## 🎯 MILO INTERNET - COMPLETATO (2026-01-19)

### 10 SCENE GENERATE CON SUCCESSO!

**IMMAGINI SALVATE:** `/books/milo-internet/images-nanob/`
- 1.png - 10.png (tutte le scene)
- masters/ (reference characters)

---

## 🔧 PROCEDURA GROK "SAME CHARACTERS BUT" (FUNZIONA!)

### Setup
1. Vai su **grok.com/imagine**
2. Carica/genera un'immagine di riferimento con tutti i personaggi
3. Salva questa come "master reference"

### Generare Scene Consistenti
Per ogni nuova scena, usa il campo "Type to edit image..." con:
```
same characters but [descrizione scena]
```

### REGOLE IMPORTANTI - MAI DIMENTICARE!
1. **MAI chiedere testo/scritte** - Grok non sa scriverle bene, genera watermark brutti
2. **MAI usare parole che diventano testo** - evita "message", "trail", "title", ecc.
3. **Premi ENTER** per inviare (non cliccare Edit)
4. **Aspetta ~12 secondi** per generazione
5. **Controlla watermark** - se c'è scritta, rigenera

### Esempio Prompt Puliti
```
same characters but jumping and celebrating next to a giant colorful stopwatch timer, Earth globe floating above, stars and sparkles everywhere
```
```
same characters but sitting on cozy couch at evening, MILO projecting colorful holograms from his hand, warm sunset light
```

### Workflow Veloce
1. Screenshot per verificare
2. form_input ref_68 per settare testo (più affidabile di type)
3. Enter per inviare
4. Wait 12s
5. Download (icona freccia in basso)
6. Copia in cartella output con nome corretto

---

## 🎯 OLD TASK (2026-01-18)

**QUANDO RIAPRI CON --chrome:**

Genera le immagini per il sistema di posting automatico. I prompt sono pronti:

### 1. STOIC QUOTE CARDS (per @Onde_FRH)

**Marcus Aurelius:**
```
Roman emperor writing in private journal by candlelight, tent interior, ancient scrolls, warm amber glow, contemplative atmosphere, space for text overlay, 4k
```

**Seneca:**
```
Seneca writing by oil lamp, night scene, intimate warm lighting, philosophical atmosphere, elegant composition for text, 4k
```

**Epictetus:**
```
Broken chains becoming wings, symbolic transformation, sunrise colors, hope and freedom theme, elegant for text overlay, 4k
```

### 2. BEHIND THE SCENES (per @Onde_FRH)

```
Cozy Italian publishing house office, warm afternoon light through tall windows, books everywhere, wooden desk with manuscripts, watercolor illustrations scattered, creative warm atmosphere, 4k
```

```
Artist studio with watercolor palette, children's book illustrations in progress, natural light, creative mess, brushes in jars, 4k
```

### 3. TECH/BUILDING IN PUBLIC (per @FreeRiverHouse)

```
Code on screen with coffee cup, morning light through window, developer's workspace, clean modern desk, productive calm atmosphere, 4k
```

```
Robot learning from books, friendly AI concept, warm soft lighting, education and technology harmony, approachable tech, 4k
```

### 4. VIDEOS (opzionale)

```
Roman emperor writing in private journal by candlelight, tent interior, night atmosphere, subtle flame flicker, pensive contemplative mood, cinematic slow movement, warm amber tones, 8 seconds
```

```
Morning light slowly filling Italian publishing house, dust particles in sunbeams, books on shelves coming alive with light, peaceful creative awakening, 10 seconds
```

**WORKFLOW:**
1. Vai su x.com/i/grok
2. Clicca "Create Images" (o "Create Video")
3. Incolla ogni prompt
4. Scegli il migliore, clicca UPSCALE
5. Scarica in ~/Downloads/
6. Sposta in /Onde/content/social/images/

**FILE CREATI:**
- `/packages/telegram-bot/src/content-scheduler.ts` - 41 post in inglese, schedule angel numbers
- `/packages/telegram-bot/data/visual-content-system.json` - mappatura immagini e prompt
- `/packages/telegram-bot/output/content-preview.pdf` - PDF elegante inviato su TG

**SCHEDULE ATTIVO:**
- Onde: 8:08, 11:11, 22:22
- FRH: 9:09, 12:12, 21:21
- Preview: 16:20

---

## OLD TASK (2026-01-07) - Style Options

### I 4 STILI DA GENERARE:

**OPZIONE A - Acquarello Morbido Italiano:**
```
Soft Italian watercolor children's book illustration, 7-year-old girl with warm brown hair and curious eyes sitting with a small friendly robot with glowing LED heart, gentle morning light through window, pastel colors, dreamy atmosphere, tender and warm, award-winning illustration, 4k
```

**OPZIONE B - Scarry-Seuss Vivace:**
```
Whimsical Richard Scarry meets Dr Seuss style, playful 7yo girl with bouncy pigtails and a round adorable robot friend with expressive LED eyes, vibrant colors, fun details everywhere, cheerful and energetic, busy but readable composition, children's book illustration, 4k
```

**OPZIONE C - Vintage Italiano Anni '50:**
```
Vintage 1950s Italian children's book illustration, nostalgic style, little girl in classic dress with a retro-futuristic friendly robot toy, limited color palette with warm sepia tones and pops of teal, hand-painted texture, classic storybook feel, 4k
```

**OPZIONE D - Moderno Flat Contemporaneo:**
```
Modern flat illustration style, cute girl character with simple geometric shapes and a friendly round robot with minimal features, bold vibrant colors, clean lines, contemporary children's app aesthetic, warm and inviting, vector-like quality, 4k
```

**DOPO**: Mostra a Mattia le 4 opzioni, lui sceglie lo stile, poi si procede con lo "tsunami".

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

## 🌍 ONDE UNIVERSE - VISIONE COMPLETA (2026-01-07)

**Onde non è solo una casa editrice. È un UNIVERSO completo.**

### L'Obiettivo Finale
Creare un mondo coerente che vive su:
- 📚 **Libri** (ePub, PDF, print)
- 🎮 **Videogiochi** (app educative)
- 🎙️ **Podcast** (personaggi che parlano, animati)
- 📺 **YouTube** (video con personaggi animati)
- 📱 **App** (MILO Interactive, KidsChefStudio, etc.)

**TUTTO con lo stesso stile visivo unificato.**

### Il Differentiatore AI Publisher
**Autori e personaggi hanno LO STESSO stile illustrativo.**

Questo è intenzionale - mostra immediatamente che siamo un editore AI:
- Gianni Parola (scrittore) → illustrazione stile Onde
- Pina Pennello (illustratrice) → illustrazione stile Onde
- Sofia, Luca, MILO → illustrazione stile Onde

Un paradosso visivo che diventa il nostro marchio di fabbrica.

### Requisiti Stile
Lo stile DEVE funzionare per:
1. **Illustrazioni statiche** - Libri, copertine, post social
2. **Animazione** - Personaggi che parlano, si muovono in video
3. **Videogiochi** - Sprite, UI, ambienti
4. **Merchandise** - Stampe, gadget

### Stile Scelto - Acquarello Europeo Caldo
- **Soft European watercolor** - NO Pixar, NO cartoon
- **Luce dorata calda** - Sempre presente, atmosfera accogliente
- **Occhi espressivi** - Grandi, comunicativi
- **4K qualità** - Sempre upscale prima di scaricare

---

## 🎭 CHARACTER DESIGN SYSTEM

### Personaggi Storie (Story Characters)

**SOFIA** - Protagonista principale
- Età: 7 anni
- Capelli: Castani/marroni, con fiocco rosa
- Occhi: Grandi, curiosi, espressivi
- Personalità: Curiosa, coraggiosa, gentile

**LUCA** - Fratellino di Sofia
- Età: 5 anni
- Capelli: Biondi, disordinati/messy
- Personalità: Giocoso, un po' timido, affettuoso

**MILO** - Il Robot AI Amico
- Forma: Argento e azzurro, base rotonda SENZA gambe
- Occhi: LED espressivi a forma di lacrima
- Proporzioni: Carino, può stare in braccio a un bambino
- Stile: Acquarello morbido per libri bambini

### Personaggi Redazione (Editorial Characters)

**GIANNI PAROLA** - Lo Scrittore
- Ruolo: Scrive tutti i testi Onde
- Avrà: Profilo X (@GianniParola_Onde o simile)
- Stile: STESSO stile illustrativo dei personaggi storie
- Personalità: Poeta, sognatore, ama le parole

**PINA PENNELLO** - L'Illustratrice
- Ruolo: Crea tutte le illustrazioni (via Grok)
- Avrà: Profilo X
- Stile: STESSO stile illustrativo
- Personalità: Artista, colorata, attenta ai dettagli

### Reference Images
Le immagini di riferimento stile sono in:
`~/Downloads/` - file con timestamp 2026-01-07 15:01-15:05

---

## 🚨🎨 BLOCCO TOTALE GENERAZIONE IMMAGINI - PRIORITÀ ASSOLUTA

**DATA: 2026-01-07**

**NON GENERARE PIÙ NESSUNA IMMAGINE** finché lo stile unitario Onde non è definito.

### La Regola
Prima di generare QUALSIASI illustrazione, dobbiamo:
1. Definire lo stile della casa editrice con Pina Pennello
2. Creare prompt templates, skill Grok/Claude
3. Avere un branding completo e riconoscibile

### Cosa Fare
- **STOP**: Niente più immagini per nessun libro
- **PRIMA**: Definire lo stile "versione beta"
- **POI**: Rifare TUTTE le immagini con lo stile nuovo

### Eccezioni Possibili
- **Poesia italiana**: può avere stile diverso (es. Luzzati folk art)
- **Libri bambini (MILO, Salmo)**: STILE UNITARIO OBBLIGATORIO

### Output Atteso
- Prompt templates salvati come skill
- Style guide documentata
- Esempi approvati da Mattia

### Nota
Questa è la nostra "versione beta" dello stile. Poi si potrà evolvere, ma almeno avremo un punto di partenza stabile e riconoscibile.

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
2. MILO Interactive
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
6. **Pubblicazione** - SOLO dopo OK esplicito di Mattia

**Auto-upload KDP**: Si applica SOLO a traduzioni di libri già approvati, NON a libri nuovi.

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
| **Pino Pennello** | `pino-pennello.md` + `.memory.json` | Illustrazioni (via Grok) |

### Processo Produzione
Documentato in: `/content/processes/book-production.md`

1. **Testi**: Gianni Parola crea testo con marcatori [ILLUSTRAZIONE]
2. **Immagini**: Pino Pennello genera prompt → Grok crea immagini
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
| AI Spiegata ai Bambini (MILO) | Tech | 2026-01-06 | In produzione |

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

### MILO - Progresso Immagini (8 capitoli + copertina)
**Testo completo:** `~/Downloads/milo-final.txt`

**Completate:**
- ✅ Copertina (generata 2026-01-06)
- ✅ chapter2-brain-circuits.jpg (cervello vs circuiti)
- ✅ chapter3-learning-to-see.jpg (foto gatto Whiskers)
- ✅ chapter4-learning-to-talk.jpg (testi/libri)
- ✅ chapter5-what-milo-can-do.jpg (MILO aiuta)
- milo-character-sheet.jpg (reference)

**Da generare:**
- ⏳ Cap 1: Sofia apre scatola, scopre MILO, luce mattutina
- ⏳ Cap 6: Sofia mostra disegno drago viola + gelato, MILO confuso
- ⏳ Cap 7: MILO con 4 regole sicurezza (lucchetto, checkmark, libri, cuore)
- ⏳ Cap 8: Sofia, Luca, MILO nel futuro, tramonto dorato

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
- Grok API (XAI_API_KEY) - per PR Agent (backup)
- **Z.ai API (ZAI_API_KEY) - GRATIS, primario per testi** (aggiunto 2026-01-20)

---

## Z.ai Integration (2026-01-20)

### Cos'è
Z.ai offre GLM-4.7-Flash GRATIS (1 concurrency). Ottimo per creative writing e traduzioni.

### Come usarlo

**In TypeScript:**
```typescript
import { ZaiClient } from '@onde/core';

const zai = new ZaiClient(process.env.ZAI_API_KEY);

// Chat semplice
const response = await zai.chat("Scrivi una poesia sul mare");

// Per social post
const post = await zai.generatePost("Promuovi Meditations", "onde");

// Per scrittura creativa
const text = await zai.writeCreative("Storia per bambini", "bambini");

// Traduzione
const translated = await zai.translate("Hello world", "italiano");
```

**IMPORTANTE:** Usare `thinking: { type: 'disabled' }` per risposte dirette (no chain-of-thought).

### File
- Client: `/packages/core/src/llm/zai-client.ts`
- PR Agent aggiornato: `/packages/telegram-bot/src/pr-agent.ts`
- API Key in `.env`: `ZAI_API_KEY`

### Priorità LLM
1. **Z.ai** (gratis, primario)
2. **Grok** (fallback se Z.ai fallisce)

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

## 🚨 TASK IN CORSO - RIPRENDI DA QUI (2026-01-06)

### PR Dashboard Portal - NUOVO PRODOTTO
**Path:** `tools/pr-dashboard/`
**URL:** http://localhost:3333
**Come lanciare:**
```bash
cd /Users/mattiapetrucciani/CascadeProjects/Onde/tools/pr-dashboard
npm start
```

**Features:**
- Customer portal per approvazione contenuti social
- Interfaccia museo/galleria con post come quadri appesi
- Sezioni: Galleria Post, Upload, Stile & Prompt, Account da Seguire, Ricerca
- Pronto per multi-tenant (future auth per clienti esterni)
- Puo' diventare primo prodotto SaaS da vendere

### Video Piccole Rime - COMPLETATI
**Path:** `books/piccole-rime/videos/`
- 01-stella-stellina-stars.mp4 (2.1MB)
- 02-pulcino-bagnato-rain.mp4 (4.2MB)
- 03-pioggerellina-rain.mp4 (2.8MB)
Stile Luzzati folk art animato, generati con @grok

### Prossimi step
1. Aggiornare bio @Onde_FRH: "AI Publishing House + PR Agency"
2. Approvare i 3 video nella dashboard
3. Postare i video su @Onde_FRH (taggare @grok)
4. Generare altri video per poesie 4-10

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

*Ultimo aggiornamento: 2026-01-07 - Aggiunta ONDE UNIVERSE vision, CHARACTER DESIGN SYSTEM, AI Publisher differentiator*
