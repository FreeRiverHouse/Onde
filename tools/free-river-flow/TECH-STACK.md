# Free River Flow - Tech Stack

## Perche' queste scelte

Ogni scelta e' motivata. L'obiettivo e' un progetto che un AI agent puo' sviluppare modulo per modulo, con dipendenze chiare e documentazione abbondante.

---

## Desktop App: Electron

**Scelto perche'**:
- Cross-platform (macOS ora, Windows dopo)
- Ecosistema enorme: qualsiasi problema ha gia' una soluzione
- Estensibile per plugin, VR integration, hardware in futuro
- Lo sviluppiamo con AI, e tutti i modelli conoscono Electron molto bene
- Wispr Flow usa Electron

**Dimensione app**: ~150MB (non e' un problema per un'app desktop)

**Alternative considerate**:
- Tauri (5MB, Rust backend) - Piu' leggero ma ecosistema piu' piccolo, meno conosciuto dalle AI
- Swift nativo - Solo macOS, no cross-platform

### Dipendenze Desktop

| Package | Versione | Scopo |
|---|---|---|
| `electron` | 33+ | Framework desktop app |
| `electron-builder` | latest | Build + packaging + auto-update |
| `electron-store` | latest | Persistenza settings locale |
| `better-sqlite3` | latest | SQLite performante con FTS5 |
| `whisper-node` | latest | Binding Node.js per whisper.cpp |
| `@ricky0123/vad-node` | latest | Silero VAD per voice activity detection |
| `robotjs` o `nut.js` | latest | Keyboard/mouse simulation per text injection |
| `node-global-key-listener` | latest | Global hotkey listener cross-platform |

### Note su whisper-node

`whisper-node` wrappa `whisper.cpp` (C++) con binding nativi Node.js. Richiede:
- Il modello scaricato localmente (es. `ggml-base.en.bin`, ~150MB)
- Compilazione nativa (usa `node-gyp` o prebuild)
- Su Apple Silicon, usa Metal per GPU acceleration automaticamente

Se `whisper-node` da' problemi, alternative:
- `@nicepkg/whisper-node` (fork piu' mantenuto)
- Chiamare `whisper.cpp` binary direttamente via `child_process.spawn`
- `openai-whisper` (Python) via subprocess (piu' lento ma piu' stabile)

---

## Speech-to-Text: Whisper (locale)

**Scelto perche'**:
- Gratis (nessun costo cloud)
- Funziona offline
- 95%+ accuracy sul modello `base`
- Multi-lingua nativo (100+ lingue)
- Open source (MIT license)

**Modelli disponibili** (dal piu' veloce al piu' accurato):

| Modello | Dimensione | RAM | Velocita' (M1) | Accuracy |
|---|---|---|---|---|
| `tiny.en` | 75MB | ~400MB | ~50ms | ~90% |
| `base.en` | 150MB | ~500MB | ~200ms | ~95% |
| `small.en` | 500MB | ~1GB | ~500ms | ~97% |
| `medium.en` | 1.5GB | ~2.5GB | ~1.5s | ~98% |
| `large-v3` | 3GB | ~5GB | ~3s | ~99% |

**Default**: `base.en` (miglior rapporto velocita'/accuracy per dettatura real-time)

**Configurabile**: l'utente puo' scegliere il modello nelle settings. Per chi ha un Mac potente, `small` o `medium` danno accuracy migliore.

---

## Database Locale: SQLite (better-sqlite3)

**Scelto perche'**:
- Zero setup (single file)
- Perfetto per offline-first
- FTS5 per ricerca full-text nativa
- `better-sqlite3` e' sincrono e velocissimo (no callback hell)
- Un file `.sqlite` per utente, facile da backuppare

**FTS5** (Full-Text Search 5):
- Integrato in SQLite, non serve nulla di esterno
- Supporta query come `"cursor AND typescript"`, `"progetto*"`, `NEAR("react" "component")`
- Performance: millisecondi anche su 100K+ record

---

## Backend: Node.js + Hono

**Scelto perche'**:
- TypeScript end-to-end (stesso linguaggio di Electron e dashboard)
- Hono e' leggerissimo e veloce (piu' di Express)
- Deploy ovunque: VPS, Docker, Cloudflare Workers (se serve)
- Self-hostable con un singolo `docker-compose up`

**Alternative considerate**:
- Rust + Axum - Piu' performante ma overkill per un'API CRUD, e meno familiare alle AI
- Python + FastAPI - Buono ma non TypeScript, duplica i tipi

### Dipendenze Backend

| Package | Scopo |
|---|---|
| `hono` | Web framework (routing, middleware) |
| `drizzle-orm` | ORM type-safe per PostgreSQL |
| `drizzle-kit` | Migrations generator |
| `pg` | PostgreSQL driver |
| `jsonwebtoken` | JWT generation e verification |
| `bcryptjs` | Password hashing |
| `zod` | Input validation |
| `ws` | WebSocket server |
| `ioredis` | Redis client |
| `pino` | Structured logging |

---

## Database Cloud: PostgreSQL

**Scelto perche'**:
- Il gold standard per dati relazionali
- Full-text search nativo con `tsvector` + `tsquery`
- JSON support per campi flessibili
- Scalabile orizzontalmente se serve
- Facile da backuppare (`pg_dump`)

**Hosting**: PostgreSQL dentro Docker sul VPS (~$5/mese per tutto).

---

## Cache: Redis

**Scelto perche'**:
- Session management (JWT blacklist per logout)
- Rate limiting (contatore per IP/utente)
- Sync queue (coda di upload pendenti)
- Device online status (TTL-based heartbeat)
- Pub/Sub per WebSocket broadcast

**Nota**: Redis e' opzionale per l'MVP. Si puo' partire senza e aggiungerlo quando serve.

---

## Web Dashboard: Next.js + React + Tailwind

**Scelto perche'**:
- SSR per performance (pagine caricate velocemente)
- React e' il framework piu' conosciuto dalle AI
- Tailwind per styling consistente e veloce
- Deploy su Cloudflare Pages (gratis)
- Stesso stack del surfboard dashboard gia' nel repo Onde

### Dipendenze Dashboard

| Package | Scopo |
|---|---|
| `next` | Framework React con SSR |
| `react` + `react-dom` | UI library |
| `tailwindcss` | Utility-first CSS |
| `@tanstack/react-query` | Server state management + caching |
| `recharts` | Grafici (trend, pie, bar charts) |
| `react-markdown` | Rendering MOPs in markdown |
| `date-fns` | Date formatting |
| `lucide-react` | Icone |

---

## Monorepo: Turborepo

**Scelto perche'**:
- Build pipeline per tutti i packages in parallelo
- Cache incrementale (rebuild solo cio' che cambia)
- TypeScript types condivisi tra desktop, backend, dashboard
- Singolo `npm install` per tutto

**Struttura workspace**:
```json
{
  "workspaces": [
    "apps/desktop",
    "apps/backend",
    "apps/dashboard",
    "packages/shared-types"
  ]
}
```

---

## Linguaggio: TypeScript (end-to-end)

**Scelto perche'**:
- Un solo linguaggio per tutto il progetto
- Type safety tra frontend, backend, e app desktop
- Tipi condivisi via `packages/shared-types`
- Le AI sono molto brave con TypeScript
- Meno context switching per chi sviluppa

---

## Progetti Open Source da Studiare

Prima di iniziare a codare ogni modulo, studiare questi:

| Progetto | Cosa risolvono | Link |
|---|---|---|
| `whisper-node` | Whisper in Node.js | https://github.com/ariym/whisper-node |
| `@ricky0123/vad-node` | Voice Activity Detection | https://github.com/ricky0123/vad |
| `robotjs` | Keyboard simulation | https://github.com/octalmage/robotjs |
| `nut.js` | Alt a robotjs (piu' mantenuto) | https://github.com/nut-tree/nut.js |
| `better-sqlite3` | SQLite per Node.js | https://github.com/WiseLibs/better-sqlite3 |
| `electron-store` | Settings persistence | https://github.com/sindresorhus/electron-store |
| `hono` | Web framework | https://github.com/honojs/hono |
| `drizzle-orm` | TypeScript ORM | https://github.com/drizzle-team/drizzle-orm |

---

## Versioni Minime

| Tool | Versione |
|---|---|
| Node.js | 20+ (LTS) |
| npm | 10+ |
| TypeScript | 5.3+ |
| macOS | 12+ (Monterey) per Metal GPU |
| Electron | 33+ |
| PostgreSQL | 16+ |
| Redis | 7+ |
