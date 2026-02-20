# Free River Flow - Prompt per AI Coder

Copia tutto questo prompt e dallo a Gemini 2.5, Qwen Code, Claude Sonnet, o qualsiasi AI coder.
L'AI dovrebbe essere in grado di costruire l'intero progetto da zero con questo prompt.

---

## IL PROMPT

```
Devi costruire "Free River Flow" (FRF), un clone open-source di Wispr Flow (app di dettatura vocale).
E' un'app desktop (Electron) che trascrive la voce con Whisper locale, inietta il testo dove hai il cursore in qualsiasi app, salva tutto in un database, e sincronizza tra piu' computer via cloud.

Costruisci TUTTO il progetto da zero. Procedi in ordine, un pezzo alla volta. Non saltare niente.
Dopo ogni pezzo, verifica che funziona prima di passare al successivo.
Se una libreria non funziona, prova un'alternativa. Non bloccarti.

=== COSA DEVE FARE L'APP ===

1. DETTATURA SYSTEM-WIDE: Premi un hotkey (default: Ctrl+Shift+Space), parli, rilasci, il testo appare dove hai il cursore. Funziona con qualsiasi app (Cursor, VS Code, Terminal, Chrome, Slack, qualsiasi cosa).

2. WHISPER LOCALE: La trascrizione avviene in locale con whisper.cpp, nessun cloud, gratis. Modello default: ggml-base.en (~150MB, ~95% accuracy, ~200ms su Apple Silicon).

3. AI POST-PROCESSING: Il testo raw viene pulito automaticamente:
   - Rimozione filler words ("um", "ehm", "tipo", "praticamente", "cioe'")
   - Correzione grammaticale (maiuscole, punteggiatura)
   - Formattazione context-aware (formale in email, casual in chat, tecnico in IDE)
   - Comandi vocali: "scratch that" cancella ultima frase, "nuova riga" = line break

4. DATABASE LOCALE: Ogni dettatura salvata in SQLite con metadati: timestamp, quale Mac, quale app, quale progetto, word count, WPM. Ricerca full-text con FTS5.

5. CLOUD SYNC: Backend self-hosted (Node.js + Hono + PostgreSQL). Account system con JWT. Le dettature si sincronizzano automaticamente ogni 30s tra tutti i Mac.

6. WEB DASHBOARD: Next.js app con storico dettature, ricerca full-text, analytics (grafici), project management, MOPs (procedure operative), gestione device.


=== TECH STACK (non cambiare) ===

- Desktop: Electron + React + TypeScript + Vite
- STT: whisper.cpp via whisper-node (o @nicepkg/whisper-node, o binary diretto)
- VAD: @ricky0123/vad-node (Silero VAD)
- Text injection: clipboard save/restore + robotjs (o nut.js) per simulare Cmd+V
- Active app detection: AppleScript via child_process (macOS)
- DB locale: better-sqlite3 con FTS5
- Settings: electron-store
- Backend: Node.js + Hono + Drizzle ORM + PostgreSQL + Redis
- Dashboard: Next.js + React + Tailwind CSS + Recharts + TanStack Query
- Monorepo: Turborepo con npm workspaces
- Auth: JWT + bcryptjs
- Validation: Zod
- Linguaggio: TypeScript ovunque


=== STRUTTURA PROGETTO ===

free-river-flow/
├── apps/
│   ├── desktop/                     # ELECTRON APP
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   ├── electron/
│   │   │   ├── main.ts              # Entry point Electron (main process)
│   │   │   ├── preload.ts           # Context bridge (IPC sicuro)
│   │   │   ├── audio/
│   │   │   │   ├── capture.ts       # Mic capture (16kHz mono PCM)
│   │   │   │   └── vad.ts           # Voice Activity Detection (Silero)
│   │   │   ├── whisper/
│   │   │   │   ├── engine.ts        # Whisper transcription
│   │   │   │   └── models.ts        # Download + gestione modelli
│   │   │   ├── pipeline/
│   │   │   │   ├── index.ts         # Pipeline completa (chain di trasformazioni)
│   │   │   │   ├── filler.ts        # Rimozione filler words
│   │   │   │   ├── grammar.ts       # Correzione grammaticale
│   │   │   │   ├── formatter.ts     # Formattazione context-aware
│   │   │   │   └── commands.ts      # Voice commands ("scratch that", "nuova riga")
│   │   │   ├── injection/
│   │   │   │   ├── clipboard.ts     # Clipboard save → set → Cmd+V → restore
│   │   │   │   └── platform.ts      # macOS APIs (active app, accessibility check)
│   │   │   ├── db/
│   │   │   │   ├── index.ts         # SQLite init + migrations
│   │   │   │   ├── dictations.ts    # CRUD dettature + search FTS5
│   │   │   │   ├── projects.ts      # CRUD progetti
│   │   │   │   └── stats.ts         # Analytics queries
│   │   │   └── sync/
│   │   │       ├── client.ts        # HTTP sync con backend cloud
│   │   │       └── ws.ts            # WebSocket per real-time awareness
│   │   └── src/                     # React frontend (renderer process)
│   │       ├── main.tsx
│   │       ├── App.tsx
│   │       ├── components/
│   │       │   ├── Overlay.tsx      # Indicatore recording (floating, always-on-top)
│   │       │   ├── Settings.tsx     # Pannello settings (tabs: general, whisper, dictionary, account)
│   │       │   ├── DictationList.tsx
│   │       │   └── Stats.tsx        # Analytics locali
│   │       └── hooks/
│   │           ├── useDictation.ts
│   │           └── useSync.ts
│   │
│   ├── backend/                     # CLOUD BACKEND
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── Dockerfile
│   │   ├── src/
│   │   │   ├── index.ts             # Hono server entry
│   │   │   ├── routes/
│   │   │   │   ├── auth.ts          # POST /auth/register, /auth/login
│   │   │   │   ├── dictations.ts    # GET /dictations, GET /dictations/search
│   │   │   │   ├── projects.ts      # CRUD /projects
│   │   │   │   ├── mops.ts          # CRUD /mops
│   │   │   │   ├── devices.ts       # GET/POST /devices, PATCH heartbeat
│   │   │   │   ├── stats.ts         # GET /stats/daily, /stats/summary
│   │   │   │   └── sync.ts          # POST /sync/upload, GET /sync/pull
│   │   │   ├── db/
│   │   │   │   └── schema.ts        # Drizzle ORM schema
│   │   │   └── middleware/
│   │   │       ├── auth.ts          # JWT verification
│   │   │       └── rateLimit.ts     # Rate limiting
│   │
│   └── dashboard/                   # WEB DASHBOARD
│       ├── package.json
│       ├── next.config.mjs
│       ├── tailwind.config.js
│       └── src/app/
│           ├── layout.tsx
│           ├── page.tsx             # Dashboard home
│           ├── history/page.tsx     # Storico + ricerca full-text
│           ├── analytics/page.tsx   # Grafici (recharts)
│           ├── projects/page.tsx    # Project management
│           ├── mops/page.tsx        # MOPs browser
│           ├── devices/page.tsx     # Device management
│           └── settings/page.tsx    # Account settings
│
├── packages/
│   └── shared-types/                # TypeScript types condivisi
│       ├── package.json
│       └── src/
│           ├── dictation.ts
│           ├── project.ts
│           └── sync.ts
│
├── docker-compose.yml               # PostgreSQL + Redis + backend
├── turbo.json
├── package.json                     # Root workspace
└── .env.example


=== DATABASE SCHEMA ===

Usa questo schema sia per SQLite (locale) che PostgreSQL (cloud).
ID sono UUID v4 TEXT generati localmente. Sync tracking via colonna synced_at (NULL = non sincronizzato).

-- USERS (solo cloud)
CREATE TABLE users (
    id            TEXT PRIMARY KEY,
    email         TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name  TEXT,
    language      TEXT DEFAULT 'en',
    settings_json TEXT DEFAULT '{}',
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- DEVICES (solo cloud)
CREATE TABLE devices (
    id            TEXT PRIMARY KEY,
    user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    machine_name  TEXT NOT NULL,
    hardware_uuid TEXT,
    os_name       TEXT,
    os_version    TEXT,
    app_version   TEXT,
    last_seen_at  DATETIME,
    is_online     INTEGER DEFAULT 0,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- PROJECTS (locale + cloud)
CREATE TABLE projects (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL,
    name        TEXT NOT NULL,
    description TEXT,
    phase       TEXT DEFAULT 'planning',   -- planning|active|paused|completed|archived
    color       TEXT DEFAULT '#06b6d4',
    repo_url    TEXT,
    tags_json   TEXT DEFAULT '[]',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    synced_at   DATETIME
);

-- DICTATIONS (il cuore - locale + cloud)
-- Append-only, immutabili. UUID generato localmente = nessun conflitto tra device.
CREATE TABLE dictations (
    id              TEXT PRIMARY KEY,
    user_id         TEXT NOT NULL,
    device_id       TEXT NOT NULL,
    project_id      TEXT,
    raw_transcript  TEXT NOT NULL,        -- output esatto Whisper
    processed_text  TEXT NOT NULL,        -- dopo AI pipeline
    language        TEXT DEFAULT 'en',
    app_name        TEXT,                 -- es. 'Cursor', 'Terminal', 'Slack'
    app_bundle_id   TEXT,
    window_title    TEXT,
    input_mode      TEXT DEFAULT 'push',  -- 'push' | 'hands_free'
    started_at      DATETIME NOT NULL,
    ended_at        DATETIME NOT NULL,
    duration_ms     INTEGER NOT NULL,
    word_count      INTEGER DEFAULT 0,
    char_count      INTEGER DEFAULT 0,
    wpm             REAL DEFAULT 0,
    whisper_model   TEXT DEFAULT 'base',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    synced_at       DATETIME,
    is_deleted      INTEGER DEFAULT 0
);

-- Full-text search (SQLite FTS5)
CREATE VIRTUAL TABLE dictations_fts USING fts5(
    raw_transcript, processed_text, app_name, window_title,
    content='dictations', content_rowid='rowid'
);

-- VOICE COMMANDS
CREATE TABLE voice_commands (
    id             TEXT PRIMARY KEY,
    user_id        TEXT NOT NULL,
    trigger_phrase TEXT NOT NULL,
    action         TEXT NOT NULL,        -- 'delete_last_sentence'|'delete_last_word'|'new_line'|'new_paragraph'
    is_builtin     INTEGER DEFAULT 0,
    is_active      INTEGER DEFAULT 1,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    synced_at      DATETIME
);

-- PERSONAL DICTIONARY
CREATE TABLE dictionary_entries (
    id        TEXT PRIMARY KEY,
    user_id   TEXT NOT NULL,
    word      TEXT NOT NULL,
    category  TEXT,                      -- 'technical'|'name'|'acronym'
    expansion TEXT,                      -- 'FRH' -> 'FreeRiverHouse'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    synced_at  DATETIME
);

-- MOPs (procedure operative)
CREATE TABLE mops (
    id              TEXT PRIMARY KEY,
    user_id         TEXT NOT NULL,
    project_id      TEXT REFERENCES projects(id) ON DELETE SET NULL,
    title           TEXT NOT NULL,
    content_md      TEXT NOT NULL,
    version         INTEGER DEFAULT 1,
    status          TEXT DEFAULT 'draft',  -- draft|active|archived
    generated_from  TEXT DEFAULT 'manual',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    synced_at       DATETIME
);

-- DAILY STATS (pre-computed)
CREATE TABLE daily_stats (
    id                TEXT PRIMARY KEY,
    user_id           TEXT NOT NULL,
    device_id         TEXT,
    stat_date         TEXT NOT NULL,       -- 'YYYY-MM-DD'
    total_words       INTEGER DEFAULT 0,
    total_dictations  INTEGER DEFAULT 0,
    total_duration_ms INTEGER DEFAULT 0,
    avg_wpm           REAL DEFAULT 0,
    top_app           TEXT,
    apps_json         TEXT DEFAULT '{}',
    created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, device_id, stat_date)
);

-- SYNC LOG
CREATE TABLE sync_log (
    id            TEXT PRIMARY KEY,
    device_id     TEXT NOT NULL,
    direction     TEXT NOT NULL,           -- 'upload'|'download'
    table_name    TEXT NOT NULL,
    records_count INTEGER DEFAULT 0,
    status        TEXT NOT NULL,           -- 'success'|'error'|'partial'
    error_message TEXT,
    started_at    DATETIME NOT NULL,
    completed_at  DATETIME,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);


=== ORDINE DI COSTRUZIONE ===

Costruisci in questo ordine. Ogni step deve funzionare prima di passare al successivo.

STEP 1 - MONOREPO SKELETON
- Inizializza monorepo Turborepo con npm workspaces
- Setup apps/desktop (Electron + Vite + React + TypeScript)
- Setup packages/shared-types
- Verifica: `npm run dev` nella desktop app apre una finestra Electron con React

STEP 2 - AUDIO CAPTURE + WHISPER
- Cattura audio dal microfono (16kHz mono PCM)
- Integra Silero VAD (@ricky0123/vad-node) per speech detection
- Integra whisper.cpp (whisper-node o alternative)
- Script per scaricare il modello ggml-base.en
- Pipeline: premi bottone → parli → rilasci → vedi testo trascritto nella finestra
- Verifica: dici "hello world" e appare "hello world" nella finestra Electron

STEP 3 - GLOBAL HOTKEY + TEXT INJECTION
- Global hotkey (Ctrl+Shift+Space) via electron globalShortcut
- Push-to-talk: tieni premuto = registra, rilascia = trascrivi + incolla
- Text injection via clipboard: save clipboard → set text → Cmd+V → restore clipboard
- Usa robotjs o nut.js per simulare Cmd+V
- Active app detection via AppleScript (nome app + bundle id + titolo finestra)
- Richiesta permesso Accessibility su macOS
- Verifica: apri Cursor, premi hotkey, parli, il testo appare nel file

STEP 4 - OVERLAY + SYSTEM TRAY
- Floating overlay (BrowserWindow frameless, transparent, alwaysOnTop, focusable:false)
  - Pallino rosso quando registra
  - Si nasconde quando non registra
- System tray con menu (Start Recording, Settings, Quit)
- L'app si avvia nel tray, non mostra finestra principale
- Verifica: l'overlay appare quando registri e scompare quando finisci

STEP 5 - AI POST-PROCESSING PIPELINE
- Pipeline a catena di trasformazioni:
  1. removeFillers(text, language) - rimuove "um", "ehm", "tipo", "cioe'", "praticamente" ecc.
  2. correctGrammar(text) - maiuscole dopo punto, "I" maiuscolo, punteggiatura
  3. formatForContext(text, appContext) - formale in email, casual in chat, tecnico in IDE
  4. detectCommands(text) - "scratch that" = cancella ultima frase, "new line" = \n
- Filler words per inglese E italiano
- Comandi vocali builtin: scratch that, cancella, undo, new line, nuova riga, new paragraph
- Verifica: dici "um so basically I want to uh create a function" → diventa "I want to create a function"

STEP 6 - DATABASE LOCALE (SQLite)
- SQLite via better-sqlite3 con WAL mode
- Migrations dal schema sopra (solo tabelle locali: dictations, projects, dictionary, stats, voice_commands)
- FTS5 per ricerca full-text
- Ogni dettatura salvata automaticamente dopo text injection con tutti i metadati
- CRUD per projects, dictionary entries
- Query per analytics: parole oggi, WPM medio, breakdown per app
- Verifica: dopo 10 dettature, cerca una parola e trova le dettature giuste

STEP 7 - SETTINGS UI
- React panel dentro Electron con tabs:
  - General: hotkey config, input mode (push-to-talk vs toggle), audio device
  - Whisper: model selection (tiny/base/small/medium), language (auto/en/it), download button
  - Dictionary: lista parole custom, add/remove
  - Privacy: save audio (on/off)
  - Account: login/register (per sync - implementato in step 9)
- Usa electron-store per persistenza settings
- Verifica: cambia hotkey nelle settings, verifica che funziona con il nuovo hotkey

STEP 8 - BACKEND CLOUD
- Setup apps/backend (Node.js + Hono + TypeScript)
- Docker Compose con PostgreSQL 16 + Redis 7 + backend
- Drizzle ORM schema (converti il SQL schema sopra)
- Routes:
  - POST /auth/register, /auth/login (JWT + bcryptjs)
  - GET/POST /devices (registra Mac)
  - POST /sync/upload (batch upload dettature, ON CONFLICT DO NOTHING)
  - GET /sync/pull?since=<timestamp>&device_id=<id> (pull dettature da altri device)
  - CRUD /projects, /mops, /dictations
  - GET /stats/daily, /stats/summary
  - PATCH /devices/:id/heartbeat
- Middleware: JWT auth, rate limiting (100 req/min), Zod validation
- WebSocket per device online/offline status
- Verifica: curl le API, registra utente, uploada dettature, pullale

STEP 9 - SYNC CLIENT (DESKTOP → CLOUD)
- Login/register dall'app desktop (chiama backend API)
- Device registration al primo login (manda hostname + hardware UUID)
- Sync automatico ogni 30 secondi:
  - Upload: SELECT * FROM dictations WHERE synced_at IS NULL → POST /sync/upload → UPDATE synced_at
  - Pull: GET /sync/pull?since=<last> → INSERT OR IGNORE localmente
- WebSocket connection per heartbeat e device status
- Funziona offline: accumula in locale, synca quando torna online
- Verifica: detta su Mac #1, dopo 30s la dettatura appare su Mac #2

STEP 10 - WEB DASHBOARD
- Setup apps/dashboard (Next.js + Tailwind + TypeScript)
- Pagine:
  - / (dashboard home): stats oggi, ultime 10 dettature, device status
  - /history: lista paginata + filtri (data, macchina, app, progetto) + ricerca full-text
  - /analytics: line chart parole/giorno, bar chart per app, bar chart per macchina, WPM trend
  - /projects: lista progetti con fasi, crea/modifica/elimina, dettature associate
  - /mops: lista MOPs, crea/modifica (editor markdown), associa a progetto
  - /devices: lista device, stato online/offline, dettature per device
  - /settings: profilo, cambio password
- Auth: JWT in HttpOnly cookie
- TanStack Query per data fetching + caching
- Recharts per grafici
- Dark theme (bg-gray-950, text-white)
- Verifica: login, vedi tutte le dettature, cerca, crea progetto


=== REGOLE ===

- TypeScript strict mode ovunque
- Nessun `any` dove evitabile
- Error handling con try/catch, non lasciare promise unhandled
- Tutti gli input utente validati con Zod (backend) o type checks (frontend)
- UUID v4 per tutti gli ID, generati localmente
- Password hashate con bcryptjs (cost 12)
- JWT expiry 7 giorni
- HTTPS per tutte le API in produzione
- Audio NON va mai al cloud, solo testo
- Append-only per le dettature (immutabili dopo creazione)
- Sync idempotente (ON CONFLICT DO NOTHING per dettature, ON CONFLICT DO UPDATE per progetti/MOPs)
- Tutti i timestamp in UTC ISO 8601
- Ogni file deve avere un commento in testa che spiega cosa fa

=== PRIORITA' ===

Se qualcosa non funziona, non bloccarti. Ecco le priorita':

1. MUST HAVE: audio capture → Whisper → testo a schermo (step 1-2)
2. MUST HAVE: hotkey + text injection in qualsiasi app (step 3)
3. MUST HAVE: database locale con ricerca (step 6)
4. NICE TO HAVE: AI pipeline (step 5) - puo' essere basilare all'inizio
5. NICE TO HAVE: overlay + tray (step 4) - puo' essere minimale
6. IMPORTANT: backend + sync (step 8-9)
7. IMPORTANT: dashboard (step 10)
8. NICE TO HAVE: settings UI completa (step 7)

Se whisper-node non compila, usa child_process.spawn per chiamare il binary whisper.cpp.
Se robotjs non compila, usa nut.js o @nut-tree-fork/nut-js.
Se qualsiasi cosa non funziona, trova un'alternativa e vai avanti.
```

---

## Note

- Il prompt sopra e' autocontenuto: contiene tech stack, schema DB, struttura cartelle, ordine di costruzione, e regole.
- Puoi copiarlo e incollarlo direttamente in Gemini 2.5 Pro, Qwen 2.5 Coder, Claude Sonnet, o qualsiasi altro modello.
- Se il modello ha un limite di contesto, il prompt e' ~3500 parole, quindi entra ovunque.
- Se il modello si perde, digli "continua dallo step N" dove N e' l'ultimo step completato.
