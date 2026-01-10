# Claude Memory - Onde Project

## Owner
Mattia Petrucciani - parla italiano, comunicazione diretta.
**Location**: Los Angeles, California
(onde.la = letteralmente dove vive Mattia!)

---

## ROADMAP E VISIONE

**Tutto il contenuto strategico, roadmap, task e visione e' in `ROADMAP.md`.**

Prima di lavorare su qualsiasi cosa:
1. Leggi questo file (CLAUDE.md) per le regole operative
2. Leggi ROADMAP.md per sapere cosa fare
3. Aggiorna entrambi quando completi qualcosa

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

## REGOLA #2 - BACKUP CHAT INCREMENTALE

**DATA: 2026-01-10**

**Ogni sessione deve salvare le idee importanti in `chat-history/`**

### Come funziona:
1. File giornaliero: `chat-history/YYYY-MM-DD-ideas.md`
2. Aggiungere in modo INCREMENTALE (append, non sovrascrivere)
3. Salvare: decisioni, idee, frasi chiave di Mattia
4. Committare e pushare periodicamente

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

### Hedra (Image Factory)
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

## STILE VISIVO ONDE

### Approvato:
- Acquarello europeo (Beatrix Potter, Luzzati, Munari)
- Colori naturali, luce dorata
- Proporzioni realistiche

### Vietato:
- NO PIXAR/3D/Cartoon americano
- NO Guance rosse esagerate
- NO Colori saturi plasticosi

### Nei prompt per AI:
- SEMPRE aggiungere: "natural skin tone, NO rosy cheeks"
- SEMPRE aggiungere: "European watercolor style, NOT Pixar, NOT 3D"

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
