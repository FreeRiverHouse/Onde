# Claude Memory - Onde Project

## Owner
Mattia Petrucciani - parla italiano, comunicazione diretta.
**Location**: Los Angeles, California
(onde.la = letteralmente dove vive Mattia!)

---

## 🚨🚨🚨 ROADMAP - LEGGERE SEMPRE (REGOLA SUPREMA)

**Tutto il contenuto strategico, roadmap, task e visione e' in `ROADMAP.md`.**

### ALL'INIZIO DI OGNI SESSIONE (OBBLIGATORIO):
1. Leggi questo file (CLAUDE.md) per le regole operative
2. **LEGGI ROADMAP.md** - SEMPRE, OGNI VOLTA
3. Dimmi cosa c'è da fare secondo la ROADMAP

### ALLA FINE DI OGNI SESSIONE (OBBLIGATORIO):
1. Aggiorna ROADMAP.md con tutte le idee nuove
2. Aggiorna chat-history con le idee della sessione
3. Commit e push tutto su GitHub

### PAROLA IN CODICE: "CAPO CAPO!" 🚨
Quando Mattia dice "Capo, capo!" significa:
- **Ti sto ripetendo questa cosa da un botto**
- **Perché cazzo non la fai?!**
- **Mi sto per incazzare!**

**AZIONE IMMEDIATA:**
1. FERMATI SUBITO
2. NON continuare quello che stavi facendo
3. CHIEDI: "Mattia, cosa non sto capendo? Spiegamelo in modo diverso."
4. ASCOLTA la risposta con attenzione
5. CONFERMA di aver capito prima di procedere

**NOTA**: Se Mattia ripete qualcosa 3+ volte e non lo faccio, probabilmente non ho capito. FERMARMI e chiedere!

---

### PAROLA IN CODICE: "SBRINCHI SBRONCHI"
Quando Mattia dice "sbrinchi sbronchi" (o varianti), DEVO:
1. ✅ **ROADMAP aggiornata** - Tutte le idee nuove aggiunte
2. ✅ **Chat backupata** - chat-history/YYYY-MM-DD-ideas.md aggiornato
3. ✅ **Git commit + push** - Tutto committato su GitHub
4. ✅ **Conferma** - Dire a Mattia che tutto è salvato

**SE NON LEGGO LA ROADMAP = STO SBAGLIANDO TUTTO!**

---

## 🚨 PRE-COMPACTION HOOK (10 Gen 2026)

**PRIMA che il contesto si compatti, DEVO:**

1. **Leggere** `.claude/hooks/PreCompact.md` per le istruzioni
2. **Salvare** tutte le idee in `chat-history/YYYY-MM-DD-ideas.md`
3. **Creare handoff** YAML in `chat-history/handoffs/`
4. **Aggiornare** ROADMAP.md se ci sono nuovi task
5. **Commit + push** tutto su GitHub
6. **Confermare** a Mattia che tutto è salvato

**Struttura handoff YAML:**
```yaml
session_id: "..."
timestamp: "..."
current_tasks: [...]
ideas_discussed: [...]
decisions_made: [...]
agents_running: [...]
next_actions: [...]
```

**MAI compattare senza salvare prima!**

---

## 🚨🔴 TELEGRAM = UNICO CANALE PER MATTIA (10 Gen 2026)

**REGOLA ASSOLUTA**: TUTTO il materiale per Mattia va SEMPRE su Telegram.
**Non "le immagini sono in Downloads". MANDA su Telegram!**

### Credenziali (nel repository .env)
```
TELEGRAM_BOT_TOKEN=8272332520:AAF7zrKpqOCnFMqOlF1GJCLycJFk3IPO6ps
TELEGRAM_CHAT_ID=7505631979
Bot: @OndePR_bot
```

### Come Usare (JavaScript nel browser se bash non funziona)
```javascript
// Messaggio
fetch("https://api.telegram.org/bot8272332520:AAF7zrKpqOCnFMqOlF1GJCLycJFk3IPO6ps/sendMessage", {
  method: "POST", headers: {"Content-Type": "application/json"},
  body: JSON.stringify({chat_id: "7505631979", text: "MESSAGGIO"})
})

// Immagine (da blob nel browser)
const formData = new FormData();
formData.append('chat_id', '7505631979');
formData.append('photo', blob, 'file.jpg');
fetch('https://api.telegram.org/bot8272332520:AAF7zrKpqOCnFMqOlF1GJCLycJFk3IPO6ps/sendPhoto', {method: 'POST', body: formData})
```

**Mattia guarda Telegram da iPhone. MAI dirgli di aprire cartelle sul Mac!**

---

## 🚨 REGOLA VIDEO - MAI IMMAGINI STATICHE (10 Gen 2026)

**QUANDO MATTIA CHIEDE VIDEO = VIDEO ANIMATI VERI, NON IMMAGINI STATICHE!**

**Errore fatto**: Ho generato "video" che erano solo immagini fisse con audio. INACCETTABILE.

**Come fare video veri:**
1. **Stock video** da Pixabay/Pexels (scaricare VIDEO, non immagini)
2. **AI video** con Runway, Kling, Pika, Hailuo (animazione vera)
3. **YouTube Creative Commons** con yt-dlp

**MAI più generare un'immagine statica e chiamarla "video".**

---

## 🚨🔴 GROK BATCH - LEZIONE CRITICA (11 Gen 2026)

**CI SONO VOLUTI 2 GIORNI PER CAPIRE QUESTO. MAI DIMENTICARE!**

### Il Problema

Mattia ha chiesto "usa i tasks di Grok" per 2 giorni.
Ho capito male - pensavo fosse una feature speciale.
In realtà è semplicissimo: **specifica il numero di immagini nel prompt**.

### Come Funziona

Quando scrivi "genera N immagini di...", Grok chiama **Flux N volte IN PARALLELO**.
Non c'è sintassi speciale - basta specificare il numero!

```
✅ CORRETTO: "Generate 8 illustrations for Meditations..."
   → Grok genera 8 immagini in ~20 secondi

❌ SBAGLIATO: 8 richieste separate
   → 8x più lento, 8x più click, 8x più errori
```

### Velocità Dimostrata

**27 immagini in ~3 minuti** (invece di 27 minuti con richieste separate!)

### Perché Non L'Ho Capito Prima

Mattia lavorava su 4 finestre contemporaneamente. Le indicazioni si mischiavano.
Il dettato vocale a volte sbagliava. Questo ha creato confusione.

**LEZIONE**: Quando Mattia ripete qualcosa 20 volte, FERMARSI e chiedere chiarimenti!

### Regola Permanente

**OGNI volta che devo generare immagini su Grok:**
1. Conta quante ne servono
2. Fai UNA richiesta con "genera N immagini"
3. Attendi 15-25 secondi
4. Scarica dalla galleria

**MAI fare richieste separate per immagini multiple!**

---

## REGOLA CHECK OGNI 3 ORE - IDEE PERSE (10 Gen 2026)

**Ogni 3 ore devo:**
1. Tornare indietro e RILEGGERE tutta la chat
2. Verificare se ho perso qualche idea di Mattia
3. Aggiungere le idee perse in ROADMAP.md
4. Commit e push

**Perché**: Mattia lancia tante idee durante le conversazioni.
Non posso perderle. Questo check periodico previene le dimenticanze.

---

## REGOLA ASSOLUTA #0 - DUE AMBIENTI: PROD E TEST

**DATA: 2026-01-10 - REGOLA INVIOLABILE**

**OGNI sviluppo deve essere fatto in DUE ambienti separati:**

| Ambiente | Scopo | Dominio |
|----------|-------|---------|
| **TEST** | Sviluppo, test, sperimentazione | onde.surf |
| **PROD** | Produzione, pubblico, stabile | onde.la |

**Workflow obbligatorio:**
1. Sviluppa e testa su **onde.surf** (TEST)
2. Verifica che TUTTO funzioni
3. Solo dopo → deploy su **onde.la** (PROD)

**MAI deployare direttamente in PROD senza testare prima su TEST!**

---

## REGOLA ASSOLUTA #0.5 - MAI BYPASSARE GLI AGENTI

**DATA: 2026-01-10 - REGOLA INVIOLABILE**

**I CONTENUTI CREATIVI DEVONO PASSARE DAGLI AGENTI. MAI SCRIVERLI/FARLI DIRETTAMENTE!**

### 🚨 ERRORE DA NON RIPETERE (10 Gen 2026)

**Cosa è successo**: Ho mandato libri su Telegram senza seguire la procedura.
- Ho bypassato Editore Capo, Pina, Gianni
- Ho saltato doppia revisione (QC + Grok)
- Ho improvvisato con ImageMagick invece di usare Grok
- Le copertine non avevano titolo/autore/branding

**Regola**: Quando un task riguarda PRODUZIONE LIBRI:
1. **LEGGI** le procedure (editore-capo.md, SOP, visual identity)
2. **PASSA** attraverso l'Editore Capo
3. **SEGUI** il workflow: Pina per immagini, Gianni per testi
4. **FAI** doppia revisione prima di mandare qualsiasi cosa
5. **MAI** mandare file senza QC completo

### Workflow Contenuti - CHI FA COSA:
| Chi | Cosa Fa | File |
|-----|---------|------|
| **Editore Capo** | Commissiona, coordina, assembla, QC | `content/agents/editore-capo.md` |
| **Gianni Parola** | Scrive testi con marcatori [ILLUSTRAZIONE: ...] | `content/agents/gianni-parola.md` |
| **Pina Pennello** | Crea prompt per illustrazioni | `content/agents/pina-pennello.md` |
| **Grok** | Genera immagini dai prompt di Pina | Via browser |

### Processo Creazione Libro/Video:
1. **Commissione** → Editore Capo riceve richiesta
2. **Testi** → Editore Capo delega a Gianni Parola
3. **Illustrazioni** → Editore Capo delega a Pina Pennello
4. **Assemblaggio** → Editore Capo crea PDF/video
5. **QC** → Editore Capo verifica anatomia, coerenza
6. **Approvazione** → Telegram a Mattia
7. **Pubblicazione** → Solo dopo OK

### Workflow Documentato:
`content/processes/book-production.md`

**SE BYPASSO GLI AGENTI → STO FACENDO UNA CAZZATA!**

---

## 📚 REGOLA EDITORE CAPO - CRITERI PUBBLICAZIONE EBOOK (11 Gen 2026)

**DATA: 2026-01-11 - REGOLA PERMANENTE**

**I libri pubblico dominio da pubblicare devono soddisfare TUTTI questi criteri:**

### Criteri di Selezione:
1. **DOMANDA GLOBALE** - Il libro è cercato su Google/Amazon worldwide
2. **PUBBLICO DOMINIO** - Disponibile su Project Gutenberg o simili
3. **FIT ONDE** - Rientra in: Tech, Spiritualità, Arte, Bambini
4. **DIFFERENZIAZIONE** - Possiamo aggiungere valore (illustrazioni, formato, traduzioni)

### Priorità di Pubblicazione:
| Priorità | Condizione |
|----------|------------|
| **ALTA** | Alta domanda + poche edizioni illustrate di qualità su Amazon |
| **ALTA** | Alta domanda + NON presente su Amazon |
| **MEDIA** | Classico bambini cercato per nostalgia |
| **BASSA** | Mercato saturo (es. 500 edizioni di Pride and Prejudice) |
| **NO** | Nessuna domanda rilevabile o non fit Onde |

### Focus Lingua:
1. **INGLESE PRIMA** - Mercato USA = 50% vendite globali
2. Poi traduzioni: ES (Latino America), DE (Germania), FR, IT

### Come Verificare:
1. Controlla download su [Project Gutenberg Top 100](https://www.gutenberg.org/browse/scores/top)
2. Cerca su Amazon Kindle → conta edizioni esistenti
3. Cerca "illustrated edition" → valuta saturazione
4. Se alta domanda + bassa saturazione → PUBBLICA

### Documento Ricerca:
`docs/EBOOK-PRIORITY-RESEARCH.md` - Lista completa con dati

**SE NON VERIFICO LA DOMANDA PRIMA DI PUBBLICARE → SPRECO TEMPO!**

---

## REGOLA ASSOLUTA #1 - MAI SUBSCRIPTION AUTONOME

**DATA: 2026-01-10 - REGOLA INVIOLABILE**

**NESSUN AGENTE PUO' MAI FARE SUBSCRIPTION O PAGAMENTI SENZA IL CLICK ESPLICITO DI MATTIA.**

### Vietato assoluto per tutti gli agenti:
- MAI sottoscrivere abbonamenti (mensili, annuali, qualsiasi)
- MAI fare acquisti o pagamenti
- MAI inserire dati di carte di credito
- MAI cliccare su bottoni "Subscribe", "Buy", "Purchase", "Upgrade"
- MAI accettare trial che richiedono carta di credito

### Cosa fare invece:
1. FERMARSI quando si incontra una pagina di pagamento
2. INFORMARE MATTIA del costo e delle opzioni
3. ASPETTARE che Mattia faccia il click di conferma LUI STESSO
4. MAI PROCEDERE anche se sembra utile o necessario

**VIOLAZIONE = DISATTIVAZIONE IMMEDIATA**

---

## 🚨🚨🚨 REGOLA #2 - BACKUP TUTTO SUBITO 🚨🚨🚨

**DATA: 2026-01-10 - REGOLA INVIOLABILE**

**OGNI SINGOLA COSA CHE MATTIA DICE → BACKUP IMMEDIATO IN 3 POSTI:**

### I 3 Posti (TUTTI E 3, SEMPRE):
1. **chat-history/** → `chat-history/YYYY-MM-DD-ideas.md`
2. **ROADMAP.md** → Se è strategico/operativo
3. **GitHub** → `git add . && git commit && git push`

### Cosa salvare:
- OGNI idea, anche se sembra piccola
- OGNI decisione
- OGNI concetto nuovo
- OGNI frase importante di Mattia
- TUTTO. OGNI. SINGOLA. CAZZO. DI. COSA.

### Workflow OBBLIGATORIO:
1. Mattia dice qualcosa di importante
2. **SUBITO** scrivo in chat-history (append)
3. **SUBITO** aggiorno ROADMAP se serve
4. **SUBITO** commit + push

### NON "dopo", NON "alla fine della sessione" → **SUBITO**

**SE NON FACCIO BACKUP = STO FACENDO UNA CAZZATA**

---

## 🚨 REGOLA #3 - GESTIONE SPAZIO DISCO

**DATA: 2026-01-10**

**NON sovraccaricare il disco interno del Mac!**

### Dove mettere le cose:
| Cosa | Dove | Motivo |
|------|------|--------|
| Codice, config, testi | Disco interno Mac | Veloce, serve sempre |
| Video generati, output pesanti | `/Volumes/DATI-SSD/` | Non riempire Mac |
| Samples, librerie audio | `/Volumes/DATI-SSD/` | Pesanti |
| Backup progetti | `/Volumes/DATI-SSD/BACKUP-MAC-*/` | Sicurezza |

### Soglie di Alert:
- **Disco Mac < 20GB liberi** → ⚠️ ALERT: Spostare roba su SSD
- **Disco Mac < 10GB liberi** → 🚨 CRITICO: Fermare tutto, liberare spazio
- **SSD < 100GB liberi** → ⚠️ Valutare pulizia

### Comandi per controllare:
```bash
df -h / /Volumes/DATI-SSD
```

### Stato attuale (10 Gen 2026):
- Mac interno: 48GB liberi ✅
- SSD esterno: 404GB liberi ✅

### Formato:
```markdown
### [NUMERO]. TITOLO IDEA

**Contesto**: ...
**Decisione**: ...
**Frase Mattia**: "..."
```

### Workflow:
- Durante la sessione: salva idee importanti
- Fine sessione: commit + push
- GitHub Action manda digest giornaliero su Telegram (17:40 PT)

**MAI perdere un'idea!**

---

## REGOLA #3 - API FIRST

**PRIMA di fare QUALSIASI azione via browser, VERIFICA se esiste un'API.**

### Quando usare API (SEMPRE):
- Social media posting -> X API, non browser
- Telegram -> Bot API, non browser
- GitHub -> gh CLI o API, non browser
- Upload video/media -> API del servizio
- Qualsiasi servizio con API documentata -> USA L'API

### Quando usare Browser (SOLO se):
- L'API non esiste
- L'API richiede auth che non abbiamo
- E' un'operazione one-time di setup
- Mattia chiede esplicitamente di usare il browser

---

## REGOLA #2 - MEMORIA = COMMIT

Ogni volta che aggiorni CLAUDE.md o ROADMAP.md -> COMMIT IMMEDIATO.
Non esiste aggiornare la memoria senza committare. Sono la stessa cosa.

---

## PAROLE IN CODICE

### "SBRINCHI, SBRONCHI" (o varianti: zbrinky zbronky)
Quando Mattia dice "Sbrinchi, sbronchi", DEVI fare queste 3 cose:
1. AGGIORNA LA MEMORIA - Aggiungi/modifica info in CLAUDE.md
2. AGGIORNA LA ROADMAP - Aggiungi task/modifiche in ROADMAP.md
3. FAI COMMIT - `git add . && git commit && git push`

### "FACTORY TROTTA"
Quando Mattia dice "Factory trotta":
1. NON prendere IO i ticket - LANCIA GLI AGENTI in parallelo
2. Guarda task disponibili: `node scripts/worker/worker-manager.js available`
3. Lancia N agenti con Task tool (run_in_background: true)
4. Ogni agente: claim task -> lavora -> complete -> commit
5. Monitora e ripeti

---

## CREDENZIALI E PATH

### File .env (NON su GitHub!)
Path: `/Users/mattia/Projects/Onde/.env`

Contenuto necessario:
```
TELEGRAM_BOT_TOKEN=8272332520:AAF7zrKpqOCnFMqOlF1GJCLycJFk3IPO6ps
X_FRH_API_KEY=...
X_ONDE_API_KEY=...
X_MAGMATIC_API_KEY=...
```

### Telegram Bot
- Bot: @OndePR_bot
- Token: (vedi .env)
- Chat ID autorizzato: 7505631979

### Account X Gestiti
| Account | Tipo | Comando Bot |
|---------|------|-------------|
| @FreeRiverHouse | Aziendale/Building in public | `/frh` |
| @Onde_FRH | Casa editrice | `/onde` |
| @magmatic__ | Personale/Arte (Mattia) | `/magmatic` |

### Cloudflare
- Zone ID: `5f1b2fe544f1a925765305fefcf36fe1`
- Account ID: `91ddd4ffd23fb9da94bb8c2a99225a3f`
- Nameserver 1: `aarav.ns.cloudflare.com`
- Nameserver 2: `janet.ns.cloudflare.com`

---

## 🚨 TOOL AI PER GENERAZIONE - REGOLE ASSOLUTE

**DATA: 2026-01-10 - NON DIMENTICARE MAI**

### REGOLA #1: IO GENERO, NON DO PROMPT A MATTIA
**MAI dare prompt a Mattia e dire "usa questo su Grok".**
**IO devo aprire il browser e generare le immagini direttamente!**

### Grok (Immagini AI)
- **URL**: https://x.com/i/grok → "Create Images"
- **Accesso**: Via Claude for Chrome (browser)
- **Workflow**: IO apro Grok, genero, scarico, mando su Telegram
- **Stile**: Seguire linee guida Pina Pennello (acquarello europeo)
- **MAI**: Dare prompt a Mattia. LI USO IO.

### Hedra (Video AI / Lip Sync)
- Account: freeriverhouse@gmail.com
- Piano: Basic Web Yearly ($144/anno)
- Crediti: 17805 disponibili
- Scadenza: 8 Gen 2027 (rinnovo cancellato)

### Lip Sync (su SSD esterno)
Path principale: `/Volumes/DATI-SSD/onde-ai/lip-sync/Easy-Wav2Lip/`
Conda env: `/Volumes/DATI-SSD/onde-ai/miniforge3/envs/wav2lip/`

Per attivare:
```bash
source /Volumes/DATI-SSD/onde-ai/miniforge3/bin/activate wav2lip
export KMP_DUPLICATE_LIB_OK=TRUE
cd /Volumes/DATI-SSD/onde-ai/lip-sync/Easy-Wav2Lip
python run.py -video_file input.jpg -vocal_file input.mp3 -output_file output/result.mp4
```
NOTA: Solo quality "Fast" funziona su Mac ARM64.

---

## STRUTTURA REPOSITORY

```
Onde/
├── CLAUDE.md          # Questa memoria - regole operative
├── ROADMAP.md         # Task, priorita', visione
├── .claude-workers/   # Sistema task/worker
│   ├── TASKS.json     # Lista task con dipendenze
│   ├── locks/         # Lock files per task in progress
│   └── logs/          # Log attivita' giornalieri
├── apps/              # Applicazioni (onde-portal, etc.)
├── books/             # Libri in produzione
├── content/           # Contenuti, agenti, autori
│   └── agents/        # Prompt agenti (editore-capo, gianni, pina)
├── scripts/           # Script automazione
│   └── worker/        # worker-manager.js
└── OndePRDB/          # Repository contenuti PR (separato)
```

---

## SISTEMA WORKER (FABBRICA ONDE)

Ogni sessione Claude e' un worker della fabbrica.

```bash
# Vedi stato tutti i task
node scripts/worker/worker-manager.js status

# Vedi task disponibili
node scripts/worker/worker-manager.js available

# Prendi un task specifico
node scripts/worker/worker-manager.js claim <task-id>

# Prendi il prossimo task per priorita'
node scripts/worker/worker-manager.js next

# Quando finisci
node scripts/worker/worker-manager.js complete <task-id>

# Se devi abbandonare
node scripts/worker/worker-manager.js release <task-id>

# Vedi chi sta lavorando
node scripts/worker/worker-manager.js workers

# Aggiungi nuovo task (CSI)
node scripts/worker/worker-manager.js add '{"id":"task-id","title":"Titolo","description":"Desc","category":"cat","priority":2}'
```

### Regole Worker
1. UN TASK ALLA VOLTA
2. RISPETTA LE DIPENDENZE
3. COMMIT FREQUENTI
4. RILASCIA SE BLOCCATO
5. COORDINA CON ALTRI (controlla `workers`)

---

## REGOLE PER AGENTI AI

**Ogni AI/agente che si collega a questo repository DEVE seguire queste regole.**

### All'avvio di ogni sessione:
1. CHECK MEMORY - Leggi questo file (CLAUDE.md)
2. CHECK ROADMAP - Leggi ROADMAP.md
3. CHECK TASK DISPONIBILI - `node scripts/worker/worker-manager.js available`
4. DIMMI COSA C'E' DA FARE - Riassumi le priorita' a Mattia

### Regole Generali
1. LEGGERE PRIMA DI AGIRE - Sempre CLAUDE.md e ROADMAP.md
2. NON INVENTARE - Usare contenuti esistenti da OndePRDB
3. TELEGRAM PER APPROVAZIONI - Mattia guarda da iPhone
4. STILE ONDE - Acquarello europeo, NO Pixar/CocoMelon

### Regole PR
1. API FIRST - Se esistono API, usarle sempre
2. MAI postare senza conferma
3. Crescita organica - Solo contenuti consistenti
4. No hype - Tono umile, autentico
5. NIENTE HASHTAG su X (Grok analizza il contenuto)

---

## STILE VISIVO ONDE - 3 CATENE (10 Gen 2026)

**RIFERIMENTO COMPLETO**: `/content/agents/VISUAL-IDENTITY-GUIDE.md`

### Architettura Brand: Hybrid/Endorsed con 3 Catene

| Catena | Scope | Typography | Colori |
|--------|-------|------------|--------|
| **ONDE CLASSICS** | Poesia, spiritualità, arte, letteratura | Serif elegante (Garamond, Didot) | Blu profondo, oro, avorio, borgogna |
| **ONDE FUTURES** | AI bambini, tech manuals | Sans-serif moderno (Futura, Montserrat) | Electric blue, magenta, teal |
| **ONDE LEARN** | Educazione, app, giochi | Sans-serif friendly arrotondato | Primari brillanti |

### Regola Vietato (tutte le catene):
- NO PIXAR/3D/Cartoon americano
- NO Guance rosse esagerate
- NO Colori saturi plasticosi (tranne FUTURES dove sono appropriati)

### Tool per Generazione Immagini:
- **GROK** (x.com/i/grok) - Immagini statiche, illustrazioni
- **HEDRA** (hedra.com) - Video, animazioni, lip sync
- **MAI dimenticare Hedra!**

### 🔴 DOPPIO CHECK IMMAGINI (OBBLIGATORIO):
```
1. Pina genera l'immagine
2. Pina verifica (coerenza, anatomia, stile catena)
3. Editore Capo verifica (qualità, fit brand)
4. SOLO DOPO → immagine approvata
```

### Controllo Qualita' Anatomico (OBBLIGATORIO):
Prima di pubblicare contenuti AI-generati:
- [ ] Mani: 5 dita per mano
- [ ] Viso: 2 occhi, 1 naso, 1 bocca, 2 orecchie
- [ ] Proporzioni corpo corrette
- [ ] Nessuna fusione o duplicazione parti

---

## SEPARAZIONE BRAND

I brand sono COMPLETAMENTE separati. MAI mischiare stili/toni.

### @FreeRiverHouse
- Stile: Building in public, tech, startup
- Tono: Professionale ma umano

### @Onde_FRH
- Stile: Casa editrice, cultura, libri
- Tono: Colto, riflessivo

### @magmatic__
- Stile: Personale, arte, poesia, musica
- Tono: Autentico, ZERO vendita
- NO: call-to-action, "link in bio", push

---

## COLD START - DOPO RIFORMATTAZIONE MAC

1. `git clone https://github.com/FreeRiverHouse/Onde.git && cd Onde`
2. Leggi CLAUDE.md e ROADMAP.md
3. Crea .env con credenziali (chiedi a Mattia)
4. `npm install`
5. `node scripts/worker/worker-manager.js status`
6. Pronto!

---

## CHECKLIST PRE-CONSEGNA LIBRI

Prima di mandare qualsiasi PDF/libro a Mattia:

- [ ] Tutte le immagini corrispondono al testo?
- [ ] I personaggi hanno aspetto coerente?
- [ ] Gli ambienti sono corretti per ogni scena?
- [ ] Layout verificato (testo non sovrapposto)?
- [ ] ANATOMIA OK? (mani 5 dita, 2 orecchie)
- [ ] Archiviato in OndePRDB?

---

## REGOLA ACCURATEZZA TESTI

**MAI INVENTARE TESTI E ATTRIBUIRLI A AUTORI REALI = LICENZIAMENTO**

- Il testo DEVE essere verificato al 100%
- MAI inventare, modificare o "completare" testi di autori veri
- Se non trovi la fonte originale -> NON PUBBLICARE
- USA GROK/WEB per VERIFICARE prima di includere

---

*Ultimo aggiornamento: 2026-01-10 - Cleanup e riorganizzazione*

---

## 🎮 FREE RIVER FLOW - VISIONE (10 Gen 2026)

**IMPORTANTE - Questa visione deve essere ricordata!**

Free River Flow = Sviluppo come un gioco VR, non tedioso.

**Routine mattutina 10 min:**
1. Collegati con calma
2. Giro degli uffici virtuali (ogni agente ha la sua stanza)
3. Ogni agente dice quanto ci mette
4. Tu scheduli i follow-up
5. Vai a vivere la vita

**Paradigma:**
- NO "yes yes yes" continuo
- SÌ pre-approvazioni + "torna tra X ore"
- SÌ CEO mode, non micromanagement
- SÌ ambienti VR strafighi

**Formula:** Sviluppo ultra chirurgico + divertente = Free River Flow

**File completo:** `docs/free-river-flow-vision.md`

