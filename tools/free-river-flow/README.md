# Free River Flow

Clone open-source di [Wispr Flow](https://wisprflow.ai/) con database centralizzato e project management integrato.

## Il Problema

Chi vibecoda su diversi Mac con diversi IDE (Cursor, Claude Code, VS Code, ecc.) perde traccia di:
- Cosa ha dettato e quando
- Su quale macchina ha lavorato a cosa
- In che fase sono i vari progetti
- Dove sono le MOPs (procedure operative)

Wispr Flow fa la dettatura bene, ma non salva uno storico ricercabile, non fa project management, e costa $9-15/mese.

## La Soluzione

Free River Flow (FRF) e':
1. **Dettatura system-wide** - Parli, il testo appare dove hai il cursore (qualsiasi app)
2. **Database centralizzato** - Ogni dettatura salvata con metadati (Mac, app, progetto, timestamp)
3. **Sync multi-Mac** - Account cloud, tutto sincronizzato tra i tuoi computer
4. **Project management** - Lista progetti, fasi, MOPs, tutto accessibile da web dashboard
5. **Ricerca** - Full-text search su tutto lo storico dettature

## Come Funziona

```
Tu parli ──> Whisper (locale) ──> AI pipeline ──> Testo pulito ──> Incollato al cursore
                                                        │
                                                        ▼
                                                  SQLite locale
                                                        │
                                                        ▼
                                                  Sync cloud ──> Web Dashboard
```

1. **Premi hotkey** (Ctrl+Shift+Space) e parli
2. **Whisper** trascrive in locale (gratis, no cloud)
3. **AI pipeline** pulisce il testo (rimuove filler, corregge grammatica, formatta)
4. **Testo iniettato** dove hai il cursore (qualsiasi app)
5. **Salvato** nel database locale (SQLite) con tutti i metadati
6. **Sincronizzato** al cloud ogni 30 secondi
7. **Ricercabile** dalla web dashboard

## Architettura

Vedi [ARCHITECTURE.md](./ARCHITECTURE.md) per i dettagli tecnici.

```
┌─────────────────────────────────┐
│    Backend Self-Hosted          │
│    (VPS ~$5/mese)              │
│    Node.js + Hono              │
│    PostgreSQL + Redis          │
└──────────┬──────────────────────┘
           │ HTTPS/WSS
     ┌─────┼─────┐
     │     │     │
  Mac #1  Mac #2  Mac #N
  Electron Electron Electron
  Whisper  Whisper  Whisper
  SQLite   SQLite   SQLite

┌─────────────────────────────────┐
│    Web Dashboard (Next.js)     │
│    Storico, ricerca, progetti  │
│    Analytics, MOPs, devices    │
└─────────────────────────────────┘
```

## Tech Stack

Vedi [TECH-STACK.md](./TECH-STACK.md) per le motivazioni.

| Componente | Tecnologia |
|---|---|
| Desktop App | Electron + React + TypeScript |
| Speech-to-Text | whisper.cpp (locale, via whisper-node) |
| DB Locale | SQLite (better-sqlite3) con FTS5 |
| Backend | Node.js + Hono + Drizzle ORM |
| DB Cloud | PostgreSQL |
| Cache | Redis |
| Dashboard | Next.js + React + Tailwind CSS |
| Monorepo | Turborepo |

## Struttura Progetto

```
free-river-flow/
├── apps/
│   ├── desktop/                  # Electron app
│   │   ├── electron/             # Main process (Rust-like modules in TS)
│   │   │   ├── main.ts
│   │   │   ├── audio/            # Mic capture + VAD
│   │   │   ├── whisper/          # Whisper engine + model mgmt
│   │   │   ├── pipeline/         # AI post-processing
│   │   │   ├── injection/        # Text injection (clipboard + paste)
│   │   │   ├── db/               # SQLite CRUD + search
│   │   │   └── sync/             # Cloud sync + WebSocket
│   │   └── src/                  # Renderer (React UI)
│   │       ├── components/       # Overlay, Settings, Stats
│   │       └── hooks/
│   │
│   ├── backend/                  # Cloud API
│   │   ├── src/
│   │   │   ├── routes/           # auth, dictations, projects, mops, sync
│   │   │   ├── db/               # Drizzle schema
│   │   │   └── middleware/       # auth, rate limit
│   │   └── Dockerfile
│   │
│   └── dashboard/                # Web dashboard
│       └── src/app/
│           ├── history/          # Storico dettature + ricerca
│           ├── analytics/        # Grafici e stats
│           ├── projects/         # Project management
│           ├── mops/             # MOPs browser
│           └── devices/          # Device management
│
├── packages/
│   └── shared-types/             # TypeScript types condivisi
│
├── docker-compose.yml            # PostgreSQL + Redis per dev
└── turbo.json                    # Build pipeline
```

---

## Roadmap

### Fase 1: Core Product (14 settimane)

Il focus. Tutto il resto viene dopo.

| Sub-fase | Settimane | Obiettivo |
|---|---|---|
| **1A** | 1-2 | Audio pipeline + Whisper locale (app che trascrive) |
| **1B** | 3-4 | Text injection system-wide + hotkey + overlay |
| **1C** | 5-6 | AI post-processing (filler, grammar, formatting, comandi vocali) |
| **1D** | 7-8 | Database locale SQLite + ricerca FTS5 + analytics |
| **1E** | 9-11 | Backend cloud + sync multi-Mac + auth |
| **1F** | 12-14 | Web dashboard (storico, ricerca, progetti, MOPs, analytics) |

Vedi [PHASE-1.md](./PHASE-1.md) per il piano dettagliato di ogni sub-fase.

### Fase 2: Polish + Release (Mesi 4-7)

- Onboarding e first-run experience
- Release open-source su GitHub
- Command mode ("Hey Flow" = riscrivi testo selezionato con AI)
- Voice snippets (frasi salvate attivate a voce)
- Performance optimization (Metal GPU su Apple Silicon)
- Supporto Windows
- Meta Quest / Ray-Ban Meta glasses integration (VR)

### Fase 3: AI Workflow Intelligence (Mesi 8-12)

- Pattern detection dallo storico dettature
- Generazione automatica MOPs dalle dettature
- Agent invocation: "Hey Flow, lancia Claude Code sul progetto X"
- Plugin IDE (Cursor, VS Code) per contesto piu' ricco
- AI impara i tuoi pattern e li replica
- Workflow templates: "Inizia una nuova app come faccio sempre io"
- **Milestone**: L'AI ti clona. Gli dici "fai questa app" e sa come lavori.

### Fase 4: Platform + Hardware (Anno 2+)

- Open Home devkit integration (voice assistant hardware)
- API pubblica per integrazioni third-party
- Plugin system per estensioni community
- Team features (progetti condivisi, MOPs condivise)
- Whisper fine-tuned sulla tua voce
- Marketplace workflow vocali

---

## Feature Comparison: FRF vs Wispr Flow

| Feature | Wispr Flow | Free River Flow |
|---|---|---|
| Dettatura system-wide | Si | Si |
| AI post-processing | Si | Si |
| Whisper locale (no cloud) | No (cloud) | Si |
| Storico dettature ricercabile | No | **Si** |
| Sync multi-device | Parziale | **Si (tutto)** |
| Project management | No | **Si** |
| MOPs integrati | No | **Si** |
| Identifica su quale Mac hai lavorato | No | **Si** |
| AI workflow cloning | No | **Si (Fase 3)** |
| VR integration | No | **Si (Fase 2)** |
| Open source | No | **Si** |
| Self-hostable | No | **Si** |
| Prezzo | $9-15/mese | Gratis (self-hosted) |

---

## Database Schema

Vedi [SCHEMA.sql](./SCHEMA.sql) per lo schema completo.

Core tables:
- `users` - Account utente
- `devices` - Mac registrati
- `dictations` - Tutte le dettature con metadati completi
- `projects` - Progetti con fasi e stato
- `mops` - Procedure operative
- `dictionary_entries` - Dizionario personale
- `daily_stats` - Analytics pre-computate

---

## Per AI Coding Assistants

Questo progetto viene sviluppato da AI (Gemini, Qwen, Claude Sonnet). Ogni modulo e' indipendente e puo' essere dato come task singolo:

| Modulo | Path | Buildabile da solo? |
|---|---|---|
| Audio capture | `electron/audio/` | Si |
| VAD | `electron/audio/vad.ts` | Si |
| Whisper engine | `electron/whisper/` | Si (serve audio) |
| Pipeline | `electron/pipeline/` | Si (serve testo raw) |
| Text injection | `electron/injection/` | Si |
| DB locale | `electron/db/` | Si |
| Sync client | `electron/sync/` | Si (serve backend running) |
| Backend API | `apps/backend/` | Si |
| Dashboard | `apps/dashboard/` | Si (serve backend running) |

Ogni sub-fase del PHASE-1.md puo' essere data come task singolo a un AI agent.
Il piano e' scritto in modo che ogni pezzo sia autocontenuto e non richieda contesto aggiuntivo.
