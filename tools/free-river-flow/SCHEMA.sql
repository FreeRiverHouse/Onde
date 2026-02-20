-- ============================================================
-- FREE RIVER FLOW - Database Schema
-- ============================================================
-- Questo schema si applica sia a SQLite (locale) che PostgreSQL (cloud).
-- Le differenze sono annotate inline dove necessario.
--
-- Convenzioni:
--   - ID: TEXT (UUID v4 generati localmente)
--   - Timestamps: DATETIME DEFAULT CURRENT_TIMESTAMP
--   - Sync tracking: colonna synced_at (NULL = non ancora sincronizzato)
--   - Soft delete: is_deleted flag dove serve
-- ============================================================


-- ============================================================
-- USERS (solo cloud PostgreSQL - locale ha utente implicito)
-- ============================================================
CREATE TABLE users (
    id            TEXT PRIMARY KEY,           -- UUID v4
    email         TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,              -- bcrypt hash
    display_name  TEXT,
    language      TEXT DEFAULT 'en',          -- lingua principale
    timezone      TEXT DEFAULT 'UTC',
    settings_json TEXT DEFAULT '{}',          -- preferenze utente (JSON blob)
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- DEVICES (solo cloud - traccia i Mac registrati)
-- ============================================================
CREATE TABLE devices (
    id            TEXT PRIMARY KEY,           -- UUID v4
    user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    machine_name  TEXT NOT NULL,              -- hostname del Mac
    hardware_uuid TEXT,                       -- macOS IOPlatformUUID (unico per hardware)
    os_name       TEXT,                       -- 'macOS', 'Windows', 'Linux'
    os_version    TEXT,                       -- es. '15.2'
    app_version   TEXT,                       -- versione Free River Flow installata
    last_seen_at  DATETIME,                  -- ultimo heartbeat
    is_online     INTEGER DEFAULT 0,         -- 1 = online adesso
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_devices_user ON devices(user_id);
CREATE INDEX idx_devices_hardware ON devices(hardware_uuid);


-- ============================================================
-- PROJECTS (sia locale che cloud)
-- ============================================================
CREATE TABLE projects (
    id          TEXT PRIMARY KEY,             -- UUID v4
    user_id     TEXT NOT NULL,               -- FK users (cloud) o 'local' (desktop)
    name        TEXT NOT NULL,               -- nome progetto
    description TEXT,                        -- descrizione breve
    phase       TEXT DEFAULT 'planning',     -- planning | active | paused | completed | archived
    color       TEXT DEFAULT '#06b6d4',      -- colore hex per UI
    icon        TEXT,                        -- emoji o nome icona
    mop_path    TEXT,                        -- path o URL al documento MOP
    repo_url    TEXT,                        -- URL repository git
    tags_json   TEXT DEFAULT '[]',           -- JSON array di tags ["web", "ai", "electron"]
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    synced_at   DATETIME                    -- NULL = non sincronizzato
);

CREATE INDEX idx_projects_user ON projects(user_id);
CREATE INDEX idx_projects_phase ON projects(phase);


-- ============================================================
-- DICTATIONS (il cuore del sistema - sia locale che cloud)
-- ============================================================
-- Ogni dettatura ha un UUID generato localmente al momento della creazione.
-- Questo garantisce che non ci siano conflitti di ID tra diversi Mac.
-- Il sync e' append-only: una dettatura creata non viene mai modificata.
CREATE TABLE dictations (
    id              TEXT PRIMARY KEY,         -- UUID v4 (generato localmente)
    user_id         TEXT NOT NULL,           -- FK users
    device_id       TEXT NOT NULL,           -- FK devices (quale Mac)
    project_id      TEXT,                    -- FK projects (opzionale)

    -- Contenuto
    raw_transcript  TEXT NOT NULL,           -- output esatto di Whisper
    processed_text  TEXT NOT NULL,           -- dopo AI pipeline (filler rimossi, grammar, formatting)
    language        TEXT DEFAULT 'en',       -- codice lingua rilevato (ISO 639-1)

    -- Contesto applicazione
    app_name        TEXT,                    -- es. 'Cursor', 'Terminal', 'Slack', 'Chrome'
    app_bundle_id   TEXT,                    -- es. 'com.todesktop.230313mzl4w4u92'
    window_title    TEXT,                    -- titolo finestra attiva al momento della dettatura

    -- Modalita' input
    input_mode      TEXT DEFAULT 'push',     -- 'push' (push-to-talk) | 'hands_free' (toggle)

    -- Timing
    started_at      DATETIME NOT NULL,       -- quando ha iniziato a parlare
    ended_at        DATETIME NOT NULL,       -- quando ha finito
    duration_ms     INTEGER NOT NULL,        -- durata audio in millisecondi

    -- Statistiche
    word_count      INTEGER DEFAULT 0,       -- numero parole nel processed_text
    char_count      INTEGER DEFAULT 0,       -- numero caratteri
    wpm             REAL DEFAULT 0,          -- words per minute per questa dettatura

    -- Whisper metadata
    whisper_model   TEXT DEFAULT 'base',     -- tiny | base | small | medium | large
    whisper_confidence REAL,                 -- score di confidenza medio (0.0-1.0)

    -- Audio (opzionale - per riascolto)
    audio_path      TEXT,                    -- path locale al file audio
    audio_size_bytes INTEGER,               -- dimensione file audio

    -- Sync
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    synced_at       DATETIME,               -- NULL = non ancora sincronizzato al cloud
    is_deleted      INTEGER DEFAULT 0        -- soft delete per sync
);

CREATE INDEX idx_dictations_user ON dictations(user_id);
CREATE INDEX idx_dictations_device ON dictations(device_id);
CREATE INDEX idx_dictations_project ON dictations(project_id);
CREATE INDEX idx_dictations_app ON dictations(app_name);
CREATE INDEX idx_dictations_started ON dictations(started_at);
CREATE INDEX idx_dictations_synced ON dictations(synced_at);
CREATE INDEX idx_dictations_language ON dictations(language);


-- ============================================================
-- FULL-TEXT SEARCH (SQLite versione - usa FTS5)
-- ============================================================
-- SQLite FTS5:
CREATE VIRTUAL TABLE dictations_fts USING fts5(
    raw_transcript,
    processed_text,
    app_name,
    window_title,
    content='dictations',
    content_rowid='rowid'
);

-- PostgreSQL equivalente (da usare al posto di FTS5 sul cloud):
-- ALTER TABLE dictations ADD COLUMN search_vector tsvector;
-- CREATE INDEX idx_dictations_search ON dictations USING GIN(search_vector);
-- CREATE TRIGGER dictations_search_update BEFORE INSERT OR UPDATE ON dictations
--   FOR EACH ROW EXECUTE FUNCTION
--   tsvector_update_trigger(search_vector, 'pg_catalog.simple', raw_transcript, processed_text);


-- ============================================================
-- VOICE COMMANDS (comandi vocali personalizzabili)
-- ============================================================
CREATE TABLE voice_commands (
    id             TEXT PRIMARY KEY,          -- UUID v4
    user_id        TEXT NOT NULL,
    trigger_phrase TEXT NOT NULL,             -- "scratch that", "cancella", "nuova riga"
    action         TEXT NOT NULL,             -- 'delete_last_sentence' | 'delete_last_word' | 'new_line' | 'undo'
    is_builtin     INTEGER DEFAULT 0,        -- 1 = comando di sistema, non cancellabile
    is_active      INTEGER DEFAULT 1,        -- 0 = disabilitato
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    synced_at      DATETIME
);

CREATE INDEX idx_voice_commands_user ON voice_commands(user_id);

-- Comandi builtin di default (inseriti al primo avvio)
-- INSERT INTO voice_commands (id, user_id, trigger_phrase, action, is_builtin) VALUES
--   (uuid(), 'local', 'scratch that',  'delete_last_sentence', 1),
--   (uuid(), 'local', 'cancella',      'delete_last_sentence', 1),
--   (uuid(), 'local', 'undo',          'delete_last_word',     1),
--   (uuid(), 'local', 'actually',      'replace_last_clause',  1),
--   (uuid(), 'local', 'anzi',          'replace_last_clause',  1),
--   (uuid(), 'local', 'new line',      'new_line',             1),
--   (uuid(), 'local', 'nuova riga',    'new_line',             1),
--   (uuid(), 'local', 'new paragraph', 'new_paragraph',        1);


-- ============================================================
-- PERSONAL DICTIONARY (parole custom per migliorare Whisper)
-- ============================================================
CREATE TABLE dictionary_entries (
    id        TEXT PRIMARY KEY,              -- UUID v4
    user_id   TEXT NOT NULL,
    word      TEXT NOT NULL,                 -- la parola/frase
    phonetic_hint TEXT,                      -- hint di pronuncia per Whisper
    category  TEXT,                          -- 'technical' | 'name' | 'acronym' | 'brand'
    expansion TEXT,                          -- espansione: 'FRH' -> 'FreeRiverHouse'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    synced_at  DATETIME
);

CREATE INDEX idx_dictionary_user ON dictionary_entries(user_id);
CREATE UNIQUE INDEX idx_dictionary_word ON dictionary_entries(user_id, word);


-- ============================================================
-- MOPs (Standard Operating Procedures / Procedure Operative)
-- ============================================================
CREATE TABLE mops (
    id              TEXT PRIMARY KEY,         -- UUID v4
    user_id         TEXT NOT NULL,
    project_id      TEXT REFERENCES projects(id) ON DELETE SET NULL,
    title           TEXT NOT NULL,            -- titolo della MOP
    content_md      TEXT NOT NULL,            -- contenuto in Markdown
    version         INTEGER DEFAULT 1,       -- versione incrementale
    status          TEXT DEFAULT 'draft',     -- draft | active | archived
    generated_from  TEXT DEFAULT 'manual',   -- 'manual' | 'ai_generated'
    source_dictation_ids TEXT,               -- JSON array di dictation ID usati per generare
    tags_json       TEXT DEFAULT '[]',       -- JSON array di tags
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    synced_at       DATETIME
);

CREATE INDEX idx_mops_project ON mops(project_id);
CREATE INDEX idx_mops_user ON mops(user_id);
CREATE INDEX idx_mops_status ON mops(status);


-- ============================================================
-- DAILY STATS (analytics pre-computate, calcolate a fine giornata)
-- ============================================================
CREATE TABLE daily_stats (
    id                  TEXT PRIMARY KEY,     -- UUID v4
    user_id             TEXT NOT NULL,
    device_id           TEXT,                 -- NULL = tutte le macchine aggregate
    stat_date           TEXT NOT NULL,        -- 'YYYY-MM-DD'
    total_words         INTEGER DEFAULT 0,   -- parole totali nel giorno
    total_dictations    INTEGER DEFAULT 0,   -- numero dettature
    total_duration_ms   INTEGER DEFAULT 0,   -- durata totale audio
    avg_wpm             REAL DEFAULT 0,      -- WPM medio
    top_app             TEXT,                -- app piu' usata
    top_project         TEXT,                -- progetto piu' attivo
    languages_json      TEXT DEFAULT '{}',   -- {"en": 450, "it": 120}
    apps_json           TEXT DEFAULT '{}',   -- {"Cursor": 300, "Slack": 150, "Terminal": 80}
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, device_id, stat_date)
);

CREATE INDEX idx_stats_user_date ON daily_stats(user_id, stat_date);


-- ============================================================
-- SYNC LOG (traccia le operazioni di sync per debugging)
-- ============================================================
CREATE TABLE sync_log (
    id              TEXT PRIMARY KEY,         -- UUID v4
    device_id       TEXT NOT NULL,
    direction       TEXT NOT NULL,            -- 'upload' | 'download'
    table_name      TEXT NOT NULL,            -- 'dictations' | 'projects' | 'mops' etc.
    records_count   INTEGER DEFAULT 0,       -- quanti record sincronizzati
    status          TEXT NOT NULL,            -- 'success' | 'error' | 'partial'
    error_message   TEXT,                    -- dettagli errore se fallito
    started_at      DATETIME NOT NULL,
    completed_at    DATETIME,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sync_log_device ON sync_log(device_id);
CREATE INDEX idx_sync_log_status ON sync_log(status);
