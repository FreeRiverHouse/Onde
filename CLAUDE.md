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

### Libri Prodotti
| Titolo | Data | Status |
|--------|------|--------|
| Il Salmo 23 per Bambini | 2026-01-05 | Bozza V2 pronta |

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

1. **MAI postare senza conferma** - Chiedere sempre prima di pubblicare
2. **Crescita organica** - Solo contenuti consistenti, NO growth hacks
3. **No hype** - Tono umile, autentico

---

## IMPORTANTE - Separazione Clienti

**I brand sono COMPLETAMENTE separati. MAI mischiare stili/hashtag/toni.**

### @FreeRiverHouse
- **Stile**: Building in public, tech, startup
- **Hashtag**: #buildinginpublic, #indiehacker, #startup
- **Tono**: Professionale ma umano, mostra processo

### @Onde_FRH
- **Stile**: Casa editrice, cultura, libri
- **Hashtag**: #poesia, #libri, #editoria
- **Tono**: Colto, riflessivo

### @magmatic__
- **Stile**: Personale, arte, poesia, musica
- **Hashtag**: MINIMI o nessuno - naturale
- **Tono**: Autentico, tranquillo, ZERO vendita
- **NO**: "building in public", call-to-action, "link in bio", push
- **SI**: Condivisione genuina, bellezza, poesia senza spiegazioni
- **Riferimento**: Come Mattia postava su IG - semplice, diretto, poetico
- **Style Guide**: `/clients/magmatic/style_guide.md`

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

*Ultimo aggiornamento: 2026-01-05 - Grok via WEB (Claude for Chrome), non API (costa crediti)*
