# Free River Flow - Fase 1: Piano Dettagliato

Fase 1 e' il core product: un'app di dettatura che funziona su tutti i Mac, salva tutto in un database centralizzato, e ha una web dashboard per ricerca e project management.

Ogni sub-fase (1A, 1B, ecc.) e' autocontenuta e puo' essere data come task singolo a un AI agent.

---

## Sub-Fase 1A: Skeleton + Audio Pipeline (Settimana 1-2)

### Obiettivo
Electron app che cattura audio dal microfono e lo trascrive con Whisper locale. Nessuna iniezione testo, nessun database. Solo: parli → vedi il testo in una finestra.

### Tasks

**1A.1 - Inizializzare il progetto**
```bash
# Monorepo setup
mkdir free-river-flow && cd free-river-flow
npm init -y
npm install turbo -D

# Electron app
mkdir -p apps/desktop
cd apps/desktop
npm init -y
npm install electron electron-builder --save-dev
npm install react react-dom typescript @types/react --save-dev
npm install vite @vitejs/plugin-react --save-dev
```

File da creare:
- `apps/desktop/electron/main.ts` - Entry point Electron
- `apps/desktop/electron/preload.ts` - Bridge sicuro verso renderer
- `apps/desktop/src/main.tsx` - React entry
- `apps/desktop/src/App.tsx` - Componente root
- `apps/desktop/tsconfig.json` - TypeScript config
- `apps/desktop/vite.config.ts` - Vite config per renderer
- `turbo.json` - Turborepo config
- Root `package.json` con workspaces

**1A.2 - Audio Capture**

Catturare audio dal microfono in formato 16kHz mono PCM (formato richiesto da Whisper).

Opzione A (consigliata): `node-audiorecorder` nel main process
```typescript
// electron/audio/capture.ts
import { Readable } from 'stream';

export class AudioCapture {
  private stream: MediaStream | null = null;

  async start(): Promise<void> {
    // Usa navigator.mediaDevices.getUserMedia nel renderer
    // oppure node-record-lpcm16 nel main process
  }

  stop(): Buffer {
    // Ritorna il buffer audio PCM 16kHz mono
  }
}
```

Opzione B: Web Audio API nel renderer process, poi mandare il buffer al main via IPC.

**Formato output**: Buffer PCM 16-bit, 16000Hz, mono. Whisper vuole esattamente questo.

**1A.3 - Voice Activity Detection (VAD)**

Installare e configurare Silero VAD per rilevare inizio/fine del parlato.

```bash
npm install @ricky0123/vad-node
```

```typescript
// electron/audio/vad.ts
import { NonRealTimeVAD } from '@ricky0123/vad-node';

export class VoiceActivityDetector {
  private vad: NonRealTimeVAD;

  async init(): Promise<void> {
    this.vad = await NonRealTimeVAD.new();
  }

  // Ritorna i segmenti di speech dall'audio
  async detectSpeech(audioBuffer: Float32Array): Promise<SpeechSegment[]> {
    const segments = [];
    for await (const { audio, start, end } of this.vad.run(audioBuffer, 16000)) {
      segments.push({ audio, start, end });
    }
    return segments;
  }
}
```

**1A.4 - Whisper Engine**

Integrare whisper.cpp via binding Node.js.

```bash
npm install whisper-node
# oppure
npm install @nicepkg/whisper-node
```

Il modello va scaricato al primo avvio:
```bash
# Script da includere nel progetto
curl -L https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin \
  -o models/ggml-base.en.bin
```

```typescript
// electron/whisper/engine.ts
import whisper from 'whisper-node';

export class WhisperEngine {
  private model: any;

  async init(modelPath: string): Promise<void> {
    // Carica il modello in memoria
  }

  async transcribe(audioBuffer: Buffer): Promise<TranscriptionResult> {
    const result = await whisper({
      modelPath: this.modelPath,
      audio: audioBuffer,
      language: 'auto',  // auto-detect
    });
    return {
      text: result.map(r => r.speech).join(' '),
      language: result[0]?.language || 'en',
      segments: result,
    };
  }
}
```

**Se whisper-node non funziona**, fallback: chiamare il binary whisper.cpp direttamente:
```typescript
import { execFile } from 'child_process';

async function transcribe(audioPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile('./whisper.cpp/main', [
      '-m', './models/ggml-base.en.bin',
      '-f', audioPath,
      '--no-timestamps',
      '--language', 'auto',
    ], (err, stdout) => {
      if (err) reject(err);
      resolve(stdout.trim());
    });
  });
}
```

**1A.5 - Pipeline base (audio → testo)**

Connettere i pezzi:
1. Premere un bottone nella finestra Electron → inizia recording
2. Audio catturato in tempo reale
3. Quando si rilascia il bottone → stop recording
4. Audio passa per VAD → segmenti di speech estratti
5. Ogni segmento passa per Whisper → testo raw
6. Testo mostrato nella finestra Electron

```typescript
// electron/main.ts (semplificato)
ipcMain.handle('start-recording', async () => {
  audioCapture.start();
});

ipcMain.handle('stop-recording', async () => {
  const audio = audioCapture.stop();
  const segments = await vad.detectSpeech(audio);
  const text = await whisper.transcribe(segments[0].audio);
  return text;
});
```

### Output atteso
Un'app Electron con un bottone. Premi, parli, rilasci, vedi il testo trascritto nella finestra. Nient'altro.

### Come testare
1. `npm run dev` nella cartella desktop
2. Clicca "Start Recording"
3. Di' qualcosa in inglese o italiano
4. Clicca "Stop Recording"
5. Il testo trascritto appare nella finestra

---

## Sub-Fase 1B: System Integration + Text Injection (Settimana 3-4)

### Obiettivo
Il testo dettato appare dove hai il cursore, in qualsiasi app. Overlay visuale. System tray.

### Tasks

**1B.1 - Global Hotkey**

```bash
npm install node-global-key-listener
# oppure usare electron globalShortcut API
```

```typescript
// electron/hotkey.ts
import { globalShortcut } from 'electron';

export function registerHotkeys() {
  // Push-to-talk: Ctrl+Shift+Space
  globalShortcut.register('CommandOrControl+Shift+Space', () => {
    // Toggle recording
  });
}
```

**Modalita'**:
- **Push-to-talk**: Tieni premuto = registra, rilascia = trascrivi e incolla
- **Toggle**: Premi una volta = inizia, premi di nuovo = stop e incolla

L'hotkey deve essere configurabile nelle settings.

**1B.2 - Text Injection**

```bash
npm install robotjs
# oppure
npm install @nut-tree-fork/nut-js
```

```typescript
// electron/injection/clipboard.ts
import { clipboard } from 'electron';
import robot from 'robotjs';

export async function injectText(text: string): Promise<void> {
  // 1. Salva clipboard attuale
  const previousClipboard = clipboard.readText();

  // 2. Metti il testo trascritto in clipboard
  clipboard.writeText(text);

  // 3. Simula Cmd+V (macOS) o Ctrl+V (Windows)
  robot.keyTap('v', process.platform === 'darwin' ? 'command' : 'control');

  // 4. Aspetta che il paste sia completato
  await new Promise(resolve => setTimeout(resolve, 50));

  // 5. Ripristina clipboard originale
  clipboard.writeText(previousClipboard);
}
```

**Testare con**: Cursor, VS Code, Terminal, Chrome, Slack, Notes.

**1B.3 - Active App Detection**

Rilevare quale app e' in foreground quando l'utente detta.

macOS:
```typescript
// electron/injection/platform.ts
import { execSync } from 'child_process';

export function getActiveApp(): { name: string; bundleId: string; title: string } {
  // Metodo 1: AppleScript (semplice, funziona sempre)
  const script = `
    tell application "System Events"
      set frontApp to first application process whose frontmost is true
      set appName to name of frontApp
      set appBundle to bundle identifier of frontApp
    end tell
    return appName & "|" & appBundle
  `;
  const result = execSync(`osascript -e '${script}'`).toString().trim();
  const [name, bundleId] = result.split('|');

  // Titolo finestra (richiede Accessibility permission)
  const titleScript = `
    tell application "System Events"
      tell process "${name}"
        set windowTitle to name of front window
      end tell
    end tell
    return windowTitle
  `;
  let title = '';
  try {
    title = execSync(`osascript -e '${titleScript}'`).toString().trim();
  } catch (e) {
    // Accessibility permission non concessa
  }

  return { name, bundleId, title };
}
```

**1B.4 - Overlay (indicatore recording)**

Finestra Electron piccola, sempre in primo piano, senza bordi:

```typescript
// electron/main.ts
const overlay = new BrowserWindow({
  width: 200,
  height: 40,
  frame: false,
  transparent: true,
  alwaysOnTop: true,
  skipTaskbar: true,
  resizable: false,
  focusable: false,  // NON ruba focus all'app attiva
  webPreferences: { preload: path.join(__dirname, 'preload.js') },
});
```

L'overlay mostra:
- Pallino rosso quando sta registrando
- Testo "Listening..." quando in hands-free mode
- Si nasconde quando non registra

**1B.5 - System Tray**

```typescript
// electron/main.ts
import { Tray, Menu } from 'electron';

const tray = new Tray(path.join(__dirname, 'icon.png'));
tray.setContextMenu(Menu.buildFromTemplate([
  { label: 'Free River Flow', enabled: false },
  { type: 'separator' },
  { label: 'Start Recording', click: () => startRecording() },
  { label: 'Settings', click: () => openSettings() },
  { type: 'separator' },
  { label: 'Quit', click: () => app.quit() },
]));
```

**1B.6 - Accessibility Permission Request**

Su macOS, l'app deve chiedere il permesso Accessibility per:
- Simulare keyboard (Cmd+V)
- Leggere titolo finestra attiva

```typescript
// electron/injection/platform.ts
import { systemPreferences } from 'electron';

export function checkAccessibility(): boolean {
  if (process.platform === 'darwin') {
    const trusted = systemPreferences.isTrustedAccessibilityClient(true);
    // Se false, macOS mostra automaticamente il dialog per abilitare
    return trusted;
  }
  return true;
}
```

### Output atteso
- Premi Ctrl+Shift+Space, parli, rilasci → testo appare in Cursor (o qualsiasi app)
- Overlay mostra stato recording
- Icona nel system tray con menu
- App rileva automaticamente in quale app stai dettando

### Come testare
1. Avvia l'app
2. Apri Cursor, posiziona il cursore in un file
3. Premi Ctrl+Shift+Space e di' "hello world this is a test"
4. Il testo "hello world this is a test" appare nel file Cursor
5. Ripeti con Terminal, Chrome, Slack, Notes
6. Verifica che l'overlay appare/scompare correttamente

---

## Sub-Fase 1C: AI Post-Processing Pipeline (Settimana 5-6)

### Obiettivo
Il testo raw da Whisper viene pulito: filler rimossi, grammatica corretta, formattazione context-aware.

### Tasks

**1C.1 - Filler Word Removal**

```typescript
// electron/pipeline/filler.ts

const FILLERS = {
  en: ['um', 'uh', 'er', 'ah', 'like', 'you know', 'basically', 'literally', 'actually', 'so basically'],
  it: ['ehm', 'uhm', 'cioe\'', 'tipo', 'praticamente', 'allora', 'insomma', 'diciamo', 'come dire'],
};

export function removeFillers(text: string, language: string = 'en'): string {
  const fillers = FILLERS[language] || FILLERS.en;
  let result = text;

  // Ordina per lunghezza decrescente (rimuove prima i piu' lunghi)
  const sorted = fillers.sort((a, b) => b.length - a.length);

  for (const filler of sorted) {
    // Regex word-boundary per non rimuovere parti di parole
    const regex = new RegExp(`\\b${filler}\\b[,]?\\s*`, 'gi');
    result = result.replace(regex, '');
  }

  // Pulisci spazi doppi
  return result.replace(/\s+/g, ' ').trim();
}
```

**1C.2 - Grammar Correction**

```typescript
// electron/pipeline/grammar.ts

export function correctGrammar(text: string): string {
  let result = text;

  // 1. Capitalizza prima lettera dopo punto/inizio
  result = result.replace(/(^|\.\s+)([a-z])/g, (_, pre, char) => pre + char.toUpperCase());

  // 2. Capitalizza "I" standalone (inglese)
  result = result.replace(/\bi\b/g, 'I');

  // 3. Rimuovi spazi prima della punteggiatura
  result = result.replace(/\s+([.,!?;:])/g, '$1');

  // 4. Aggiungi punto alla fine se manca
  if (result && !/[.!?]$/.test(result)) {
    result += '.';
  }

  return result;
}
```

**1C.3 - Context-Aware Formatting**

```typescript
// electron/pipeline/formatter.ts

interface AppContext {
  appName: string;
  bundleId: string;
  windowTitle: string;
}

const IDE_APPS = ['Cursor', 'Code', 'Visual Studio Code', 'Terminal', 'iTerm2', 'Warp'];
const CHAT_APPS = ['Slack', 'Discord', 'Telegram', 'WhatsApp', 'Messages'];
const EMAIL_APPS = ['Mail', 'Outlook', 'Gmail'];

export function formatForContext(text: string, context: AppContext): string {
  if (IDE_APPS.some(app => context.appName.includes(app))) {
    return formatForIDE(text, context);
  }
  if (CHAT_APPS.some(app => context.appName.includes(app))) {
    return formatForChat(text);
  }
  if (EMAIL_APPS.some(app => context.appName.includes(app))) {
    return formatForEmail(text);
  }
  return text; // default: no formatting speciale
}

function formatForIDE(text: string, context: AppContext): string {
  // In IDE: preserva termini tecnici, non aggiungere punto alla fine
  // Se il window title suggerisce un file .ts/.js, non capitalizzare
  let result = text;
  if (context.windowTitle.match(/\.(ts|js|py|rs|go|tsx|jsx)/)) {
    // Probabilmente sta scrivendo in un prompt o commento, non capitalizzare aggressivamente
    result = result.replace(/\.$/, ''); // rimuovi punto finale
  }
  return result;
}

function formatForChat(text: string): string {
  // In chat: tono casual, no punto finale, prima lettera minuscola
  let result = text;
  result = result.replace(/\.$/, '');
  result = result.charAt(0).toLowerCase() + result.slice(1);
  return result;
}

function formatForEmail(text: string): string {
  // In email: tono formale, capitalizzazione corretta, punto finale
  return text; // la pipeline grammar gia' fa questo
}
```

**1C.4 - Voice Commands Detection**

```typescript
// electron/pipeline/commands.ts

interface VoiceCommand {
  trigger: RegExp;
  action: 'delete_last_sentence' | 'delete_last_word' | 'new_line' | 'new_paragraph' | 'replace_last';
}

const COMMANDS: VoiceCommand[] = [
  { trigger: /\b(scratch that|cancella|elimina)\b/i, action: 'delete_last_sentence' },
  { trigger: /\b(undo|annulla)\b/i, action: 'delete_last_word' },
  { trigger: /\b(new line|nuova riga|a capo)\b/i, action: 'new_line' },
  { trigger: /\b(new paragraph|nuovo paragrafo)\b/i, action: 'new_paragraph' },
  { trigger: /\b(actually|anzi|in realta)\b/i, action: 'replace_last' },
];

export function detectCommands(text: string): { cleanText: string; commands: VoiceCommand['action'][] } {
  const detectedCommands: VoiceCommand['action'][] = [];
  let cleanText = text;

  for (const cmd of COMMANDS) {
    if (cmd.trigger.test(cleanText)) {
      detectedCommands.push(cmd.action);
      cleanText = cleanText.replace(cmd.trigger, '').trim();
    }
  }

  return { cleanText, commands: detectedCommands };
}
```

**1C.5 - Pipeline Completa**

```typescript
// electron/pipeline/index.ts

import { removeFillers } from './filler';
import { correctGrammar } from './grammar';
import { formatForContext } from './formatter';
import { detectCommands } from './commands';

export interface PipelineResult {
  raw: string;           // output Whisper originale
  processed: string;     // testo finale pulito
  commands: string[];    // comandi vocali rilevati
  language: string;
}

export function processDictation(
  rawText: string,
  language: string,
  appContext: AppContext,
): PipelineResult {
  // 1. Rileva comandi vocali e rimuovili dal testo
  const { cleanText, commands } = detectCommands(rawText);

  // 2. Rimuovi filler words
  const noFillers = removeFillers(cleanText, language);

  // 3. Correggi grammatica
  const corrected = correctGrammar(noFillers);

  // 4. Formatta per il contesto dell'app
  const formatted = formatForContext(corrected, appContext);

  return {
    raw: rawText,
    processed: formatted,
    commands,
    language,
  };
}
```

### Output atteso
- Detti "um so basically I want to create a new function" → diventa "I want to create a new function"
- In Slack, il testo e' casual (minuscolo, senza punto)
- In Mail, il testo e' formale
- "scratch that" cancella l'ultima frase
- "nuova riga" inserisce un line break

### Come testare
1. Dettare con filler words e verificare che vengono rimossi
2. Dettare in diversi contesti (Cursor vs Slack vs Mail) e verificare formattazione
3. Dire "scratch that" e verificare che l'ultima frase viene cancellata
4. Dire "nuova riga" e verificare il line break

---

## Sub-Fase 1D: Database Locale + Storage (Settimana 7-8)

### Obiettivo
Ogni dettatura viene salvata in SQLite con tutti i metadati. Ricerca full-text funziona. Analytics locali disponibili.

### Tasks

**1D.1 - Setup SQLite**

```bash
npm install better-sqlite3 @types/better-sqlite3
```

```typescript
// electron/db/index.ts
import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

const DB_PATH = path.join(app.getPath('userData'), 'free-river-flow.db');

let db: Database.Database;

export function initDatabase(): void {
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');  // Write-Ahead Logging per performance
  db.pragma('foreign_keys = ON');
  runMigrations(db);
}

export function getDb(): Database.Database {
  return db;
}
```

**1D.2 - Migrations**

Copiare lo schema da `SCHEMA.sql` e adattarlo per SQLite.
Le migrations sono file SQL numerati eseguiti in ordine.

```typescript
// electron/db/migrations.ts
const MIGRATIONS = [
  {
    version: 1,
    sql: `
      CREATE TABLE IF NOT EXISTS dictations ( ... );
      CREATE TABLE IF NOT EXISTS projects ( ... );
      CREATE TABLE IF NOT EXISTS dictionary_entries ( ... );
      CREATE TABLE IF NOT EXISTS daily_stats ( ... );
      -- etc. (vedi SCHEMA.sql)
    `,
  },
  {
    version: 2,
    sql: `
      CREATE VIRTUAL TABLE IF NOT EXISTS dictations_fts USING fts5( ... );
    `,
  },
];
```

**1D.3 - CRUD Dictations**

```typescript
// electron/db/dictations.ts
import { getDb } from './index';
import { v4 as uuid } from 'uuid';

export interface DictationRecord {
  id: string;
  raw_transcript: string;
  processed_text: string;
  language: string;
  app_name: string;
  app_bundle_id: string;
  window_title: string;
  input_mode: string;
  started_at: string;
  ended_at: string;
  duration_ms: number;
  word_count: number;
  char_count: number;
  wpm: number;
  whisper_model: string;
  project_id?: string;
}

export function saveDictation(data: Omit<DictationRecord, 'id'>): string {
  const db = getDb();
  const id = uuid();
  const stmt = db.prepare(`
    INSERT INTO dictations (id, user_id, device_id, raw_transcript, processed_text,
      language, app_name, app_bundle_id, window_title, input_mode,
      started_at, ended_at, duration_ms, word_count, char_count, wpm, whisper_model, project_id)
    VALUES (?, 'local', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(id, getDeviceId(), data.raw_transcript, data.processed_text,
    data.language, data.app_name, data.app_bundle_id, data.window_title,
    data.input_mode, data.started_at, data.ended_at, data.duration_ms,
    data.word_count, data.char_count, data.wpm, data.whisper_model, data.project_id);
  return id;
}

export function searchDictations(query: string, limit = 50): DictationRecord[] {
  const db = getDb();
  return db.prepare(`
    SELECT d.* FROM dictations d
    JOIN dictations_fts fts ON d.rowid = fts.rowid
    WHERE dictations_fts MATCH ?
    ORDER BY d.started_at DESC
    LIMIT ?
  `).all(query, limit) as DictationRecord[];
}

export function getDictations(filters: {
  appName?: string;
  projectId?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}): DictationRecord[] {
  const db = getDb();
  let sql = 'SELECT * FROM dictations WHERE 1=1';
  const params: any[] = [];

  if (filters.appName) { sql += ' AND app_name = ?'; params.push(filters.appName); }
  if (filters.projectId) { sql += ' AND project_id = ?'; params.push(filters.projectId); }
  if (filters.dateFrom) { sql += ' AND started_at >= ?'; params.push(filters.dateFrom); }
  if (filters.dateTo) { sql += ' AND started_at <= ?'; params.push(filters.dateTo); }

  sql += ' ORDER BY started_at DESC LIMIT ? OFFSET ?';
  params.push(filters.limit || 50, filters.offset || 0);

  return db.prepare(sql).all(...params) as DictationRecord[];
}
```

**1D.4 - Settings UI**

React components dentro l'Electron renderer:

```
Settings panel con tabs:
├── General
│   ├── Hotkey configuration
│   ├── Input mode (push-to-talk vs toggle)
│   └── Audio input device selector
├── Whisper
│   ├── Model selection (tiny/base/small/medium)
│   ├── Language preference (auto/en/it/...)
│   └── Download model button
├── Dictionary
│   ├── Lista parole custom
│   ├── Add/remove words
│   └── Import/export
├── Privacy
│   ├── Save audio recordings (on/off)
│   └── Analytics tracking (on/off)
└── Account
    ├── Login/Register (per sync cloud)
    └── Device info
```

**1D.5 - Analytics Locali**

```typescript
// electron/db/stats.ts

export function getTodayStats(): DayStats {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];
  return db.prepare(`
    SELECT
      COUNT(*) as total_dictations,
      COALESCE(SUM(word_count), 0) as total_words,
      COALESCE(SUM(duration_ms), 0) as total_duration_ms,
      COALESCE(AVG(wpm), 0) as avg_wpm
    FROM dictations
    WHERE DATE(started_at) = ?
  `).get(today) as DayStats;
}

export function getAppBreakdown(days: number = 7): AppStat[] {
  const db = getDb();
  return db.prepare(`
    SELECT app_name, COUNT(*) as count, SUM(word_count) as words
    FROM dictations
    WHERE started_at >= datetime('now', '-' || ? || ' days')
    GROUP BY app_name
    ORDER BY words DESC
  `).all(days) as AppStat[];
}
```

### Output atteso
- Ogni dettatura salvata automaticamente dopo text injection
- Ricerca full-text funziona: cerchi "react component" e trovi tutte le dettature che ne parlano
- Settings UI completa e funzionante
- Stats locali: parole oggi, WPM medio, app piu' usata

### Come testare
1. Dettare 10 frasi in app diverse
2. Aprire settings, andare su "History" locale
3. Cercare una parola detta → deve trovare le dettature corrette
4. Verificare che stats sono corrette (conteggio parole, WPM)
5. Cambiare modello Whisper nelle settings e verificare che funziona

---

## Sub-Fase 1E: Backend Cloud + Sync (Settimana 9-11)

### Obiettivo
Le dettature si sincronizzano tra tutti i Mac. Account system funziona. Ogni Mac ha il suo device_id.

### Tasks

**1E.1 - Setup Backend**

```bash
mkdir -p apps/backend
cd apps/backend
npm init -y
npm install hono @hono/node-server
npm install drizzle-orm pg
npm install drizzle-kit -D
npm install jsonwebtoken bcryptjs zod ws ioredis pino
npm install @types/jsonwebtoken @types/bcryptjs @types/ws -D
npm install typescript tsx -D
```

```typescript
// apps/backend/src/index.ts
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { authRoutes } from './routes/auth';
import { dictationRoutes } from './routes/dictations';
import { projectRoutes } from './routes/projects';
import { syncRoutes } from './routes/sync';
import { deviceRoutes } from './routes/devices';
import { statsRoutes } from './routes/stats';
import { mopRoutes } from './routes/mops';

const app = new Hono();

app.route('/auth', authRoutes);
app.route('/dictations', dictationRoutes);
app.route('/projects', projectRoutes);
app.route('/sync', syncRoutes);
app.route('/devices', deviceRoutes);
app.route('/stats', statsRoutes);
app.route('/mops', mopRoutes);

serve({ fetch: app.fetch, port: 3000 });
```

**1E.2 - Database PostgreSQL (Drizzle)**

Convertire `SCHEMA.sql` in Drizzle schema:

```typescript
// apps/backend/src/db/schema.ts
import { pgTable, text, integer, real, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  displayName: text('display_name'),
  settingsJson: text('settings_json').default('{}'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const devices = pgTable('devices', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  machineName: text('machine_name').notNull(),
  hardwareUuid: text('hardware_uuid'),
  osVersion: text('os_version'),
  appVersion: text('app_version'),
  lastSeenAt: timestamp('last_seen_at'),
  isOnline: integer('is_online').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const dictations = pgTable('dictations', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  deviceId: text('device_id').notNull(),
  projectId: text('project_id'),
  rawTranscript: text('raw_transcript').notNull(),
  processedText: text('processed_text').notNull(),
  language: text('language').default('en'),
  appName: text('app_name'),
  appBundleId: text('app_bundle_id'),
  windowTitle: text('window_title'),
  inputMode: text('input_mode').default('push'),
  startedAt: timestamp('started_at').notNull(),
  endedAt: timestamp('ended_at').notNull(),
  durationMs: integer('duration_ms').notNull(),
  wordCount: integer('word_count').default(0),
  charCount: integer('char_count').default(0),
  wpm: real('wpm').default(0),
  whisperModel: text('whisper_model').default('base'),
  createdAt: timestamp('created_at').defaultNow(),
  syncedAt: timestamp('synced_at'),
});

// ... projects, mops, dictionary_entries, daily_stats (stessa struttura)
```

**1E.3 - Auth Routes**

```typescript
// apps/backend/src/routes/auth.ts
import { Hono } from 'hono';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const authRoutes = new Hono()
  .post('/register', async (c) => {
    const body = registerSchema.parse(await c.req.json());
    const hash = await bcrypt.hash(body.password, 12);
    // INSERT INTO users...
    // return JWT
  })
  .post('/login', async (c) => {
    const body = loginSchema.parse(await c.req.json());
    // SELECT user by email
    // Verify password with bcrypt
    // return JWT
  });
```

**1E.4 - Sync Protocol**

```typescript
// apps/backend/src/routes/sync.ts

// Upload: il desktop manda le dettature nuove
app.post('/upload', authMiddleware, async (c) => {
  const { dictations, projects, mops, dictionary } = await c.req.json();

  // Dettature: append-only, ON CONFLICT DO NOTHING
  for (const d of dictations) {
    await db.insert(dictationsTable).values(d).onConflictDoNothing();
  }

  // Progetti/MOPs: last-write-wins
  for (const p of projects) {
    await db.insert(projectsTable).values(p)
      .onConflictDoUpdate({ target: projectsTable.id, set: p });
  }

  return c.json({ synced: true, count: dictations.length });
});

// Pull: il desktop scarica le dettature dagli altri device
app.get('/pull', authMiddleware, async (c) => {
  const since = c.req.query('since'); // ISO timestamp
  const deviceId = c.req.query('device_id');

  const newDictations = await db.select().from(dictationsTable)
    .where(and(
      eq(dictationsTable.userId, userId),
      ne(dictationsTable.deviceId, deviceId),  // non le proprie
      gt(dictationsTable.createdAt, since),
    ))
    .limit(500);

  return c.json({ dictations: newDictations });
});
```

**1E.5 - Sync Client (Desktop)**

```typescript
// electron/sync/client.ts

const API_URL = 'https://your-server.com'; // configurabile

export class SyncClient {
  private token: string;
  private deviceId: string;
  private syncInterval: NodeJS.Timer;

  async startSync(): void {
    // Sync ogni 30 secondi
    this.syncInterval = setInterval(() => this.syncNow(), 30_000);
  }

  async syncNow(): Promise<void> {
    const db = getDb();

    // 1. Upload: prendi tutti i record con synced_at IS NULL
    const unsyncedDictations = db.prepare(
      'SELECT * FROM dictations WHERE synced_at IS NULL'
    ).all();

    if (unsyncedDictations.length > 0) {
      const response = await fetch(`${API_URL}/sync/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dictations: unsyncedDictations }),
      });

      if (response.ok) {
        // Marca come sincronizzati
        const ids = unsyncedDictations.map(d => d.id);
        db.prepare(
          `UPDATE dictations SET synced_at = datetime('now') WHERE id IN (${ids.map(() => '?').join(',')})`
        ).run(...ids);
      }
    }

    // 2. Pull: scarica dettature nuove dagli altri device
    const lastSync = db.prepare(
      'SELECT MAX(synced_at) as last FROM dictations WHERE device_id != ?'
    ).get(this.deviceId);

    const response = await fetch(
      `${API_URL}/sync/pull?since=${lastSync?.last || '1970-01-01'}&device_id=${this.deviceId}`,
      { headers: { 'Authorization': `Bearer ${this.token}` } }
    );

    if (response.ok) {
      const { dictations } = await response.json();
      for (const d of dictations) {
        db.prepare('INSERT OR IGNORE INTO dictations VALUES (...)').run(...Object.values(d));
      }
    }
  }
}
```

**1E.6 - Docker Compose**

```yaml
# docker-compose.yml (root del progetto)
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: free_river_flow
      POSTGRES_USER: frf
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./apps/backend
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://frf:${POSTGRES_PASSWORD}@postgres:5432/free_river_flow
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - postgres
      - redis

volumes:
  pgdata:
```

### Output atteso
- `docker-compose up` avvia tutto il backend
- Dall'app desktop, puoi registrarti e loggarti
- Le dettature si sincronizzano automaticamente ogni 30s
- Se detti su Mac #1, dopo 30s la dettatura appare anche su Mac #2

### Come testare
1. `docker-compose up` - avvia backend
2. Su Mac #1: registra account, detta 5 frasi
3. Su Mac #2: logga con lo stesso account
4. Dopo 30s, le 5 frasi appaiono anche su Mac #2
5. Verificare che il device_id e' diverso per ogni Mac

---

## Sub-Fase 1F: Web Dashboard (Settimana 12-14)

### Obiettivo
Dashboard web con: storico dettature, ricerca, analytics, project management, MOPs, gestione device.

### Tasks

**1F.1 - Setup Dashboard**

```bash
mkdir -p apps/dashboard
cd apps/dashboard
npx create-next-app@latest . --typescript --tailwind --app --src-dir
npm install @tanstack/react-query recharts react-markdown date-fns lucide-react
```

**1F.2 - Pagine da implementare**

Ogni pagina chiama il backend API e renderizza i dati.

**Dashboard Home** (`/`):
- Stats di oggi: parole dettate, numero dettature, WPM medio
- Ultime 10 dettature (con app, timestamp, preview testo)
- Device online/offline status
- Progetto piu' attivo oggi

**History** (`/history`):
- Lista paginata di tutte le dettature
- Filtri: data range, macchina, app, progetto, lingua
- Ricerca full-text (chiama `/dictations/search`)
- Click su una dettatura → mostra dettaglio (raw vs processed, metadati)

**Analytics** (`/analytics`):
- Line chart: parole al giorno (ultimi 30 giorni)
- Bar chart: parole per app (Cursor vs VS Code vs Terminal vs ...)
- Bar chart: parole per macchina
- Line chart: WPM medio nel tempo
- Pie chart: distribuzione lingue

**Projects** (`/projects`):
- Lista progetti con:
  - Nome, descrizione, fase (badge colorato)
  - Numero dettature associate
  - Ultima attivita'
- Crea nuovo progetto
- Click → dettaglio progetto:
  - Tutte le dettature associate
  - MOPs del progetto
  - Stats specifiche del progetto

**MOPs** (`/mops`):
- Lista MOPs con status (draft/active/archived)
- Crea nuova MOP (editor markdown)
- Associa MOP a progetto
- (Futuro) Genera MOP da dettature con AI

**Devices** (`/devices`):
- Lista device registrati
- Per ogni device: nome, OS, ultimo heartbeat, stato online/offline
- Numero dettature per device
- Versione app installata

**Settings** (`/settings`):
- Profilo utente (email, nome)
- Cambio password
- API key per integrazioni

**1F.3 - Componenti UI chiave**

```typescript
// Esempio: DictationCard
interface DictationCardProps {
  dictation: {
    processed_text: string;
    app_name: string;
    started_at: string;
    word_count: number;
    wpm: number;
    device_name: string;  // join con devices table
  };
}

function DictationCard({ dictation }: DictationCardProps) {
  return (
    <div className="p-4 border rounded-lg bg-gray-900">
      <div className="flex justify-between text-sm text-gray-400">
        <span>{dictation.app_name}</span>
        <span>{formatDistanceToNow(dictation.started_at)} ago</span>
      </div>
      <p className="mt-2 text-white">{dictation.processed_text}</p>
      <div className="mt-2 flex gap-4 text-xs text-gray-500">
        <span>{dictation.word_count} words</span>
        <span>{dictation.wpm.toFixed(0)} WPM</span>
        <span>{dictation.device_name}</span>
      </div>
    </div>
  );
}
```

**1F.4 - Auth Integration**

```typescript
// apps/dashboard/src/lib/api.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function fetchApi(path: string, options?: RequestInit) {
  const token = getCookie('frf_token');
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...options?.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 401) {
    // Redirect to login
    window.location.href = '/login';
  }
  return res.json();
}
```

### Output atteso
- Dashboard web accessibile da qualsiasi browser
- Tutte le dettature visibili e ricercabili
- Analytics con grafici interattivi
- Progetti creabili e gestibili
- Si vede su quale Mac hai fatto ogni dettatura
- Device status in real-time

### Come testare
1. Aprire `http://localhost:3001` nel browser
2. Login con account creato dall'app desktop
3. Verificare che tutte le dettature appaiono nella History
4. Cercare una parola → risultati corretti
5. Creare un progetto, associare dettature
6. Verificare analytics (grafici coerenti con i dati)
7. Controllare la pagina Devices: i Mac registrati devono apparire

---

## Checklist Fine Fase 1

Alla fine della Fase 1, tutto questo deve funzionare:

- [ ] App Electron installabile su macOS
- [ ] Premi hotkey → parli → testo appare dove hai il cursore
- [ ] Funziona con: Cursor, Claude Code, VS Code, Terminal, Chrome, Slack
- [ ] Filler words rimossi automaticamente
- [ ] Grammatica corretta, punteggiatura aggiunta
- [ ] Formattazione adattata all'app (IDE vs chat vs email)
- [ ] Comandi vocali: "scratch that", "nuova riga", "anzi"
- [ ] Multi-lingua (almeno inglese + italiano)
- [ ] Ogni dettatura salvata in SQLite con metadati completi
- [ ] Ricerca full-text locale funzionante
- [ ] Settings UI: modello Whisper, hotkey, lingua, dizionario personale
- [ ] Account cloud: registrazione + login
- [ ] Sync automatico ogni 30 secondi
- [ ] Dettature sincronizzate tra tutti i Mac
- [ ] Web dashboard con: storico, ricerca, analytics, progetti, MOPs, device
- [ ] Si puo' vedere su quale Mac si e' fatta ogni dettatura
- [ ] Docker Compose per deploy backend
