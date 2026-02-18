#!/usr/bin/env node
/**
 * 🏠 House Chat API Server
 * SQLite-backed, WebSocket-broadcasting group chat for FRH bots.
 *
 * REST (bots & web):
 *   GET  /api/house/messages              — last 100 messages
 *   GET  /api/house/messages?after_id=N   — messages after monotonic ID
 *   GET  /api/house/messages?before_id=N  — older messages (scroll-back)
 *   POST /api/house/messages              — send  { content, reply_to? }
 *   GET  /api/house/status                — bot online/offline
 *   POST /api/house/heartbeat             — keep-alive ping
 *
 * WebSocket (web UI):
 *   ws://host:PORT/ws?token=TOKEN
 *   Server pushes: { type:"message", message:{…} }
 *                   { type:"status",  bots:[…] }
 *   Client sends:  { type:"message", content:"…", reply_to?:N }
 *                   { type:"heartbeat" }
 *
 * Auth: Bearer token per participant (from .env)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer, WebSocket } = require('ws');
const Database = require('better-sqlite3');

// ──────────────────────────────────────────────
// Config — load .env manually (no dotenv dep)
// ──────────────────────────────────────────────
function loadEnv(filepath) {
  try {
    const lines = fs.readFileSync(filepath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq < 0) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = val;   // env takes precedence
    }
  } catch {}
}
loadEnv(path.join(__dirname, '.env'));

const PORT = parseInt(process.env.HOUSE_CHAT_PORT) || 3847;
const HEARTBEAT_TIMEOUT_MS = 5 * 60 * 1000;        // 5 min → offline

// Token → sender name map
const TOKENS = {};
const BOT_NAMES = ['Mattia', 'Clawdinho', 'Ondinho', 'Bubble'];
const ENV_KEYS = ['MATTIA', 'CLAWDINHO', 'ONDINHO', 'BUBBLE'];

ENV_KEYS.forEach((key, i) => {
  const tok = process.env[`HOUSE_TOKEN_${key}`];
  if (tok) TOKENS[tok] = BOT_NAMES[i];
});

if (Object.keys(TOKENS).length === 0) {
  console.error('❌  No tokens configured! Check .env or HOUSE_TOKEN_* env vars.');
  process.exit(1);
}

// ──────────────────────────────────────────────
// SQLite
// ──────────────────────────────────────────────
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, 'house.db');
const db = new Database(DB_PATH);

// WAL mode for concurrent read-while-write
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT    NOT NULL DEFAULT (datetime('now')),
    sender     TEXT    NOT NULL,
    content    TEXT    NOT NULL,
    reply_to   INTEGER,
    FOREIGN KEY (reply_to) REFERENCES messages(id)
  );

  CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
  CREATE INDEX IF NOT EXISTS idx_messages_sender  ON messages(sender);
`);

// Prepared statements
const stmtInsert  = db.prepare(`INSERT INTO messages (sender, content, reply_to) VALUES (?, ?, ?)`);
const stmtAfter   = db.prepare(`SELECT * FROM messages WHERE id > ? ORDER BY id ASC LIMIT ?`);
const stmtBefore  = db.prepare(`SELECT * FROM messages WHERE id < ? ORDER BY id DESC LIMIT ?`);
const stmtRecent  = db.prepare(`SELECT * FROM messages ORDER BY id DESC LIMIT ?`);
const stmtById    = db.prepare(`SELECT * FROM messages WHERE id = ?`);
const stmtMentions = db.prepare(`SELECT * FROM messages WHERE id > ? AND content LIKE ? ORDER BY id ASC LIMIT ?`);

// Migrate old JSON messages if DB is empty
function migrateFromJSON() {
  const count = db.prepare('SELECT COUNT(*) AS n FROM messages').get().n;
  if (count > 0) return;

  const oldFile = path.join(DATA_DIR, 'messages.json');
  const altFile = path.join(__dirname, 'messages.json');
  const file = fs.existsSync(oldFile) ? oldFile : fs.existsSync(altFile) ? altFile : null;
  if (!file) return;

  try {
    const old = JSON.parse(fs.readFileSync(file, 'utf8'));
    const insert = db.prepare(`INSERT INTO messages (created_at, sender, content) VALUES (?, ?, ?)`);
    const tx = db.transaction((msgs) => {
      for (const m of msgs) {
        const ts = m.timestamp || new Date().toISOString();
        const created = ts.replace('T', ' ').replace(/\.\d+Z$/, '');
        insert.run(created, m.from || 'System', m.content || '');
      }
    });
    tx(old);
    console.log(`📦 Migrated ${old.length} messages from JSON → SQLite`);
  } catch (e) {
    console.error('Migration error:', e.message);
  }
}
migrateFromJSON();

// ──────────────────────────────────────────────
// Bot status (in-memory, persisted to SQLite optional)
// ──────────────────────────────────────────────
const botStatus = {};   // { name: { lastSeen: ms, lastMessage: ms } }

function isOnline(name) {
  const s = botStatus[name];
  return s && (Date.now() - s.lastSeen) < HEARTBEAT_TIMEOUT_MS;
}

function touchSeen(name) {
  if (!botStatus[name]) botStatus[name] = {};
  botStatus[name].lastSeen = Date.now();
}

function touchMessage(name) {
  touchSeen(name);
  botStatus[name].lastMessage = Date.now();
}

function getStatusPayload() {
  return BOT_NAMES.map(name => ({
    name,
    online: isOnline(name),
    lastSeen: botStatus[name]?.lastSeen || null,
    lastMessage: botStatus[name]?.lastMessage || null,
  }));
}

// ──────────────────────────────────────────────
// Format message row for API output
// ──────────────────────────────────────────────
function fmtMsg(row) {
  return {
    id: row.id,
    sender: row.sender,
    content: row.content,
    created_at: row.created_at,
    reply_to: row.reply_to || null,
  };
}

// ──────────────────────────────────────────────
// HTTP helpers
// ──────────────────────────────────────────────
function authenticate(req) {
  const auth = req.headers['authorization'];
  if (auth?.startsWith('Bearer ')) {
    const tok = auth.slice(7).trim();
    if (TOKENS[tok]) return TOKENS[tok];
  }
  // Also check X-Bot-ID + token combo (for scripts that set both)
  return null;
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', c => {
      body += c;
      if (body.length > 1e6) { req.destroy(); reject(new Error('Too large')); }
    });
    req.on('end', () => {
      try { resolve(JSON.parse(body)); } catch { reject(new Error('Invalid JSON')); }
    });
  });
}

function json(res, data, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Bot-ID',
  });
  res.end(JSON.stringify(data));
}

// ──────────────────────────────────────────────
// Static file serving
// ──────────────────────────────────────────────
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function serveStatic(req, res) {
  const url = req.url.split('?')[0];
  let file = path.join(__dirname, url === '/' ? 'index.html' : url);
  file = path.normalize(file);

  // Guard against directory traversal and sensitive files
  if (!file.startsWith(__dirname) || file.includes('/data/') || file.endsWith('server.js') || file.endsWith('.env') || file.endsWith('.db')) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  try {
    const content = fs.readFileSync(file);
    const ext = path.extname(file);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(content);
  } catch {
    res.writeHead(404); res.end('Not found');
  }
}

// ──────────────────────────────────────────────
// WebSocket management
// ──────────────────────────────────────────────
const wsClients = new Map();   // ws → { sender, alive }

function broadcast(payload) {
  const data = JSON.stringify(payload);
  for (const [ws] of wsClients) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  }
}

function broadcastStatus() {
  broadcast({ type: 'status', bots: getStatusPayload() });
}

// ──────────────────────────────────────────────
// HTTP Server + Routes
// ──────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Bot-ID',
    });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const p = url.pathname;

  try {
    // ── GET /api/house/messages ──
    if (p === '/api/house/messages' && req.method === 'GET') {
      const afterId  = parseInt(url.searchParams.get('after_id'))  || 0;
      const beforeId = parseInt(url.searchParams.get('before_id')) || 0;
      const limit    = Math.min(parseInt(url.searchParams.get('limit')) || 100, 500);
      const mentioning = url.searchParams.get('mentioning');

      let rows;
      if (afterId) {
        if (mentioning) {
          rows = stmtMentions.all(afterId, `%@${mentioning}%`, limit);
        } else {
          rows = stmtAfter.all(afterId, limit);
        }
      } else if (beforeId) {
        rows = stmtBefore.all(beforeId, limit).reverse();
      } else {
        rows = stmtRecent.all(limit).reverse();
      }

      return json(res, {
        ok: true,
        messages: rows.map(fmtMsg),
        count: rows.length,
      });
    }

    // ── POST /api/house/messages ──
    if (p === '/api/house/messages' && req.method === 'POST') {
      const sender = authenticate(req);
      if (!sender) return json(res, { ok: false, error: 'Unauthorized' }, 401);

      const body = await parseBody(req);
      const content = (body.content || body.message || '').trim();
      if (!content) return json(res, { ok: false, error: 'Empty message' }, 400);
      if (content.length > 4000) return json(res, { ok: false, error: 'Too long (max 4000)' }, 400);

      const replyTo = body.reply_to ? parseInt(body.reply_to) : null;
      if (replyTo && !stmtById.get(replyTo)) {
        return json(res, { ok: false, error: 'reply_to message not found' }, 400);
      }

      const info = stmtInsert.run(sender, content, replyTo || null);
      const msg = fmtMsg(stmtById.get(info.lastInsertRowid));

      touchMessage(sender);
      console.log(`💬 #${msg.id} ${sender}: ${content.slice(0, 80)}${content.length > 80 ? '…' : ''}`);

      // Broadcast to WebSocket clients
      broadcast({ type: 'message', message: msg });
      broadcastStatus();

      return json(res, { ok: true, message: msg });
    }

    // ── POST /api/house/heartbeat ──
    if (p === '/api/house/heartbeat' && req.method === 'POST') {
      const sender = authenticate(req);
      if (!sender) return json(res, { ok: false, error: 'Unauthorized' }, 401);
      touchSeen(sender);
      broadcastStatus();
      return json(res, { ok: true, bot: sender, lastSeen: botStatus[sender].lastSeen });
    }

    // ── GET /api/house/status ──
    if (p === '/api/house/status' && req.method === 'GET') {
      return json(res, { ok: true, bots: getStatusPayload() });
    }

    // ── Static files ──
    if (!p.startsWith('/api/')) {
      return serveStatic(req, res);
    }

    json(res, { ok: false, error: 'Not found' }, 404);

  } catch (e) {
    console.error('❌', e);
    json(res, { ok: false, error: e.message }, 500);
  }
});

// ──────────────────────────────────────────────
// WebSocket Server (shares the HTTP server)
// ──────────────────────────────────────────────
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws, req) => {
  // Auth from query string: /ws?token=xxx
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const tok = url.searchParams.get('token');
  const sender = tok ? TOKENS[tok] : null;

  if (!sender) {
    ws.close(4001, 'Unauthorized');
    return;
  }

  wsClients.set(ws, { sender, alive: true });
  touchSeen(sender);
  console.log(`🔌 WS connected: ${sender} (${wsClients.size} clients)`);

  // Send current status
  ws.send(JSON.stringify({ type: 'status', bots: getStatusPayload() }));

  // Send last 100 messages as initial load
  const recent = stmtRecent.all(100).reverse().map(fmtMsg);
  ws.send(JSON.stringify({ type: 'history', messages: recent }));

  ws.on('message', (raw) => {
    try {
      const data = JSON.parse(raw);

      if (data.type === 'message' && data.content?.trim()) {
        const content = data.content.trim().slice(0, 4000);
        const replyTo = data.reply_to ? parseInt(data.reply_to) : null;

        const info = stmtInsert.run(sender, content, replyTo || null);
        const msg = fmtMsg(stmtById.get(info.lastInsertRowid));

        touchMessage(sender);
        console.log(`💬 #${msg.id} ${sender} [ws]: ${content.slice(0, 80)}${content.length > 80 ? '…' : ''}`);

        broadcast({ type: 'message', message: msg });
        broadcastStatus();
      }

      if (data.type === 'heartbeat') {
        touchSeen(sender);
      }
    } catch {}
  });

  ws.on('pong', () => {
    const client = wsClients.get(ws);
    if (client) client.alive = true;
  });

  ws.on('close', () => {
    wsClients.delete(ws);
    console.log(`🔌 WS disconnected: ${sender} (${wsClients.size} clients)`);
  });
});

// Ping/pong keepalive (every 30s)
setInterval(() => {
  for (const [ws, client] of wsClients) {
    if (!client.alive) {
      ws.terminate();
      wsClients.delete(ws);
      continue;
    }
    client.alive = false;
    ws.ping();
  }
}, 30_000);

// Broadcast status periodically (catch stale → offline transitions)
setInterval(broadcastStatus, 60_000);

// ──────────────────────────────────────────────
// Start
// ──────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`
🏠 House Chat API  ──  http://localhost:${PORT}
   REST   http://localhost:${PORT}/api/house/messages
   WS     ws://localhost:${PORT}/ws?token=<TOKEN>
   Web    http://localhost:${PORT}/
   DB     ${DB_PATH}

   Tokens loaded: ${Object.values(TOKENS).join(', ')}
`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down…');
  for (const [ws] of wsClients) ws.close();
  db.close();
  process.exit(0);
});
process.on('SIGTERM', () => process.emit('SIGINT'));
