# Claude Memory - Onde Project

## Owner
Mattia Petrucciani - parla italiano, comunicazione diretta.

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

*Ultimo aggiornamento: 2026-01-06 - Stile Vintage '50 scelto, generazione libro in corso*
