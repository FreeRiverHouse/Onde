# Istruzioni per Cursor - Progetto Onde

## Setup Iniziale

```bash
git clone https://github.com/FreeRiverHouse/Onde.git
cd Onde
```

## File da Leggere SUBITO (in ordine)

1. **`CLAUDE.md`** - Regole operative, credenziali, come lavoriamo
2. **`ROADMAP.md`** - Tutti i task, priorità, visione completa
3. **`content/agents/editore-capo.md`** - Se lavori sui libri

## Credenziali

Crea il file `.env` nella root con:

```
TELEGRAM_BOT_TOKEN=8272332520:AAF7zrKpqOCnFMqOlF1GJCLycJFk3IPO6ps
TELEGRAM_CHAT_ID=7505631979
```

(Altre credenziali chiedi a Mattia se servono)

## Task Prioritari sui Portali

### onde.surf (DEV) - DA SISTEMARE
1. Deploy su Cloudflare Pages (serve CLOUDFLARE_API_TOKEN)
2. Collegare onde.surf come custom domain
3. Attualmente DNS punta a IP sbagliato

### onde.la (PROD) - FUNZIONANTE
1. Aggiungere Google Analytics

## Struttura Repository

```
Onde/
├── CLAUDE.md          # Regole operative
├── ROADMAP.md         # Task e visione
├── apps/
│   └── onde-portal/   # Sito Next.js (onde.la)
├── books/             # Libri in produzione
├── content/
│   └── agents/        # Agenti (editore-capo, autori/)
└── scripts/           # Automazione
```

## Regole Fondamentali

1. **LEGGI SEMPRE** CLAUDE.md e ROADMAP.md prima di fare qualsiasi cosa
2. **TELEGRAM** = unico canale per mandare cose a Mattia (non "guarda in Downloads")
3. **COMMIT SPESSO** - Ogni modifica importante va pushata
4. **API FIRST** - Se esiste un'API, usala invece del browser

## Come Comunicare con Mattia

- Manda su Telegram (bot token sopra)
- Italiano preferito
- Comunicazione diretta, zero fuffa

## Inizia!

Leggi ROADMAP.md e dimmi cosa c'è da fare.
