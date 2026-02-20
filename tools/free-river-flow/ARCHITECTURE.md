# Free River Flow - Architettura Tecnica

## Overview

Free River Flow e' composto da 3 componenti principali:

1. **Desktop App** (Electron) - Dettatura, trascrizione, text injection, storage locale
2. **Cloud Backend** (Node.js + Hono) - Sync, auth, API, storage centralizzato
3. **Web Dashboard** (Next.js) - Ricerca, analytics, project management

I 3 componenti sono in un monorepo Turborepo, con tipi TypeScript condivisi.

---

## 1. Desktop App (Electron)

### Diagramma Flusso Dettatura

```
                    ┌──────────────┐
                    │  Global      │
                    │  Hotkey      │──── Ctrl+Shift+Space (configurabile)
                    │  Listener    │
                    └──────┬───────┘
                           │ keydown
                    ┌──────▼───────┐
                    │  Audio       │
                    │  Capture     │──── Web Audio API / node-audiorecorder
                    │  (mic)       │     16kHz mono PCM
                    └──────┬───────┘
                           │ audio stream
                    ┌──────▼───────┐
                    │  Voice       │
                    │  Activity    │──── Silero VAD (@ricky0123/vad-node)
                    │  Detection   │     Rileva inizio/fine parlato
                    └──────┬───────┘
                           │ speech segments
                    ┌──────▼───────┐
                    │  Whisper     │
                    │  Engine      │──── whisper.cpp via whisper-node
                    │  (locale)    │     Modello ggml-base.en (~150MB)
                    └──────┬───────┘
                           │ raw transcript
                    ┌──────▼───────┐
                    │  AI Pipeline │
                    │  ┌─────────┐ │
                    │  │ Filler  │ │──── Rimuove "ehm", "um", "tipo", "cioe'"
                    │  │ Removal │ │
                    │  └────┬────┘ │
                    │  ┌────▼────┐ │
                    │  │Grammar  │ │──── Maiuscole, punteggiatura, errori comuni
                    │  │Correct  │ │
                    │  └────┬────┘ │
                    │  ┌────▼────┐ │
                    │  │Context  │ │──── Formattazione per app (IDE vs email vs chat)
                    │  │Format   │ │
                    │  └────┬────┘ │
                    │  ┌────▼────┐ │
                    │  │Voice    │ │──── "scratch that", "nuova riga", "anzi"
                    │  │Commands │ │
                    │  └─────────┘ │
                    └──────┬───────┘
                           │ processed text
                    ┌──────▼───────┐
                    │  Text        │
                    │  Injector    │──── Clipboard save → set → Cmd+V → restore
                    │              │     Fallback: key-by-key typing
                    └──────┬───────┘
                           │ text injected
                    ┌──────▼───────┐
                    │  Database    │
                    │  (SQLite)    │──── Salva dettatura con tutti i metadati
                    │              │     FTS5 per ricerca full-text
                    └──────┬───────┘
                           │ every 30s
                    ┌──────▼───────┐
                    │  Sync        │
                    │  Client      │──── Upload batch al cloud backend
                    │              │     WebSocket per real-time awareness
                    └──────────────┘
```

### Electron Process Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    MAIN PROCESS                          │
│                                                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────────┐    │
│  │ Audio      │  │ Whisper    │  │ Hotkey          │    │
│  │ Capture    │  │ Engine     │  │ Listener        │    │
│  │ Module     │  │ Module     │  │ Module          │    │
│  └─────┬──────┘  └─────┬──────┘  └────────┬───────┘    │
│        │               │                   │             │
│  ┌─────▼───────────────▼───────────────────▼──────┐     │
│  │              IPC Bridge                         │     │
│  │         (contextBridge + preload.ts)            │     │
│  └─────────────────────┬──────────────────────────┘     │
│                        │                                 │
│  ┌─────────────┐  ┌───▼────────┐  ┌───────────────┐    │
│  │ SQLite DB   │  │ Sync       │  │ System Tray   │    │
│  │ Module      │  │ Module     │  │ Module        │    │
│  └─────────────┘  └────────────┘  └───────────────┘    │
│                                                          │
│  ┌──────────────────────────────────────────────┐       │
│  │ Platform APIs (macOS)                         │       │
│  │ - NSWorkspace (active app detection)          │       │
│  │ - Accessibility (text injection permission)   │       │
│  │ - IOKit (hardware UUID)                       │       │
│  └──────────────────────────────────────────────┘       │
└──────────────────────┬──────────────────────────────────┘
                       │ IPC
┌──────────────────────▼──────────────────────────────────┐
│                  RENDERER PROCESS                        │
│                                                          │
│  ┌──────────────────────────────────────────────┐       │
│  │              React App                        │       │
│  │                                               │       │
│  │  ┌───────────┐ ┌──────────┐ ┌──────────────┐ │       │
│  │  │ Settings  │ │ Overlay  │ │ Local Stats  │ │       │
│  │  │ Panel     │ │ (mic     │ │ Dashboard    │ │       │
│  │  │           │ │  status) │ │              │ │       │
│  │  └───────────┘ └──────────┘ └──────────────┘ │       │
│  └──────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────┘
```

### Active App Detection (macOS)

Per sapere in quale app l'utente sta dettando, si usa `NSWorkspace`:

```
NSWorkspace.shared.frontmostApplication
  → bundleIdentifier: "com.todesktop.230313mzl4w4u92" (Cursor)
  → localizedName: "Cursor"

AXUIElement (Accessibility API)
  → kAXTitleAttribute: "main.ts - free-river-flow"  (titolo finestra)
```

Implementazione: script Swift compilato che viene chiamato da Node.js via `child_process.execFile`, oppure `node-ffi-napi` per chiamare direttamente le API Objective-C.

### Text Injection Strategy

**Metodo primario** (funziona nel 95% delle app):
1. Leggi clipboard attuale (`clipboard.readText()`)
2. Scrivi testo processato in clipboard (`clipboard.writeText(processed)`)
3. Simula Cmd+V via `robotjs` o `nut.js`
4. Aspetta 50ms
5. Ripristina clipboard originale

**Fallback** (per app che intercettano Cmd+V):
- Typing key-by-key via `robotjs.typeString()`
- Piu' lento ma compatibile con tutto

**App-specific overrides** (tabella di configurazione):
```json
{
  "com.googlecode.iterm2": { "pasteShortcut": "Cmd+Shift+V" },
  "com.microsoft.VSCode": { "method": "clipboard" },
  "com.apple.Terminal": { "method": "clipboard", "delay": 100 }
}
```

### Offline-First Architecture

```
┌─────────────────────────────────────────┐
│              Desktop App                │
│                                         │
│  ┌─────────────┐    ┌──────────────┐   │
│  │  Write      │    │  Read        │   │
│  │  Queue      │    │  Cache       │   │
│  │             │    │              │   │
│  │ dictations  │    │ projects     │   │
│  │ projects    │    │ dictionary   │   │
│  │ mops        │    │ mops         │   │
│  │ dictionary  │    │              │   │
│  └──────┬──────┘    └──────────────┘   │
│         │                               │
│  ┌──────▼──────────────────────────┐   │
│  │         SQLite (locale)          │   │
│  │    Source of truth per il device  │   │
│  └──────────────┬──────────────────┘   │
│                 │ sync ogni 30s         │
└─────────────────┼──────────────────────┘
                  │
                  │ HTTPS POST /sync/upload
                  │ (batch di record con synced_at IS NULL)
                  │
┌─────────────────▼──────────────────────┐
│         Cloud Backend                   │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │       PostgreSQL (cloud)         │   │
│  │   Source of truth globale        │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

**Regole di sync**:
- Le dettature sono **append-only** e **immutabili**. UUID generato localmente, nessun conflitto.
- Progetti, MOPs, dizionario: **last-write-wins** basato su `updated_at`.
- Upload: `POST /sync/upload` con array di record dove `synced_at IS NULL`.
- Download: `GET /sync/pull?since=<last_sync_timestamp>` per ricevere record nuovi da altri device.
- Idempotente: `ON CONFLICT (id) DO NOTHING` per le dettature, `ON CONFLICT (id) DO UPDATE` per progetti/MOPs.

---

## 2. Cloud Backend (Node.js + Hono)

### API Routes

```
POST   /auth/register          # Crea account
POST   /auth/login             # Login → JWT
POST   /auth/refresh           # Refresh token

GET    /devices                 # Lista device registrati
POST   /devices                 # Registra nuovo device
PATCH  /devices/:id/heartbeat  # Aggiorna last_seen_at

GET    /dictations              # Lista con paginazione + filtri
GET    /dictations/search       # Ricerca full-text
GET    /dictations/:id          # Singola dettatura

GET    /projects                # Lista progetti
POST   /projects                # Crea progetto
PATCH  /projects/:id           # Aggiorna progetto
DELETE /projects/:id           # Cancella progetto

GET    /mops                    # Lista MOPs
POST   /mops                    # Crea MOP
PATCH  /mops/:id               # Aggiorna MOP
POST   /mops/generate          # Genera MOP da dettature (AI)

GET    /stats/daily             # Stats giornaliere
GET    /stats/summary           # Stats aggregate

POST   /sync/upload             # Batch upload da desktop
GET    /sync/pull               # Pull nuovi record

WS     /ws                      # WebSocket per real-time
```

### Auth Flow

```
Desktop App                    Backend
     │                            │
     │  POST /auth/login          │
     │  { email, password }       │
     │ ──────────────────────────>│
     │                            │ Verifica password (bcrypt)
     │                            │ Genera JWT (exp: 7 giorni)
     │  { token, user }           │
     │ <──────────────────────────│
     │                            │
     │  POST /devices             │
     │  { machine_name,           │
     │    hardware_uuid,          │
     │    os_version }            │
     │  Authorization: Bearer JWT │
     │ ──────────────────────────>│
     │                            │ Registra device
     │  { device_id }             │
     │ <──────────────────────────│
     │                            │
     │  [da qui in poi ogni       │
     │   richiesta include        │
     │   Authorization: Bearer]   │
```

### WebSocket Protocol

```
Client → Server:
  { type: "heartbeat", device_id: "..." }
  { type: "new_dictation", dictation: {...} }

Server → Client:
  { type: "device_online", device_id: "...", machine_name: "..." }
  { type: "device_offline", device_id: "..." }
  { type: "new_dictation", dictation: {...} }  // broadcast ad altri device
```

### Deployment

```
┌─────────────────────────────────┐
│  VPS (Hetzner / Railway / Fly)  │
│  ~$5/mese                       │
│                                  │
│  ┌───────────┐ ┌──────────┐    │
│  │ Node.js   │ │ Nginx    │    │
│  │ (Hono)    │ │ reverse  │    │
│  │ :3000     │ │ proxy    │    │
│  └─────┬─────┘ └──────────┘    │
│        │                        │
│  ┌─────▼─────┐ ┌──────────┐    │
│  │ PostgreSQL│ │ Redis    │    │
│  │ :5432     │ │ :6379    │    │
│  └───────────┘ └──────────┘    │
└─────────────────────────────────┘
```

Docker Compose per dev e produzione (vedi `docker-compose.yml` nel repo root).

---

## 3. Web Dashboard (Next.js)

### Page Structure

```
/                        # Dashboard home (stats oggi, dettature recenti)
/history                 # Storico dettature con ricerca e filtri
/analytics               # Grafici (trend, per-app, per-machine, WPM)
/projects                # Lista progetti con fasi
/projects/[id]           # Dettaglio progetto (dettature associate, MOPs)
/mops                    # Browser MOPs
/mops/[id]               # Dettaglio MOP (editor markdown)
/devices                 # Lista device, stato online/offline
/settings                # Account, preferenze, API keys
```

### Data Flow

```
Dashboard ──HTTP──> Backend API ──SQL──> PostgreSQL
                        │
Dashboard ──WS────> Backend WS ────────> Real-time updates
```

Il dashboard non ha database proprio. Tutto passa dal backend API.
Auth via JWT in HttpOnly cookie.

---

## 4. Sfide Tecniche e Soluzioni

### Latenza < 500ms (target)

| Step | Tempo target | Come |
|---|---|---|
| Audio capture stop | 0ms | Immediato al release hotkey |
| Whisper inference | ~300ms | `base.en` model + Metal GPU su Apple Silicon |
| AI pipeline | ~50ms | Regole regex + lookup table (no LLM in Fase 1) |
| Text injection | ~100ms | Clipboard + Cmd+V |
| **Totale** | **~450ms** | |

Se il modello `base` e' troppo lento su Mac senza GPU, fallback su `tiny` (~100ms ma meno accurato).

### Memoria

| Componente | RAM |
|---|---|
| Electron shell | ~80MB |
| Whisper model (base) | ~150MB |
| Silero VAD | ~2MB |
| SQLite | ~5MB |
| React renderer | ~30MB |
| **Totale** | **~270MB** |

Opzione: lazy-load del modello Whisper (carica solo quando serve, scarica dopo 60s di inattivita').

### Sicurezza

- JWT con expiry di 7 giorni + refresh token
- Password hash con bcrypt (cost factor 12)
- HTTPS obbligatorio per tutte le API
- Rate limiting: 100 req/min per utente
- Input validation con Zod su tutte le route
- Audio NON viene mai mandato al cloud (solo testo)
- Opzione per non salvare audio nemmeno localmente
