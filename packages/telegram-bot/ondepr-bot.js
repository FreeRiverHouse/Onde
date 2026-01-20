#!/usr/bin/env node
/**
 * ONDEPR BOT - Gestione Social Media Bidirezionale
 *
 * Comandi:
 * /onde [testo]     - Posta su @Onde_FRH
 * /frh [testo]      - Posta su @FreeRiverHouse
 * /magmatic [testo] - Posta su @magmatic__
 * /coda             - Mostra post in coda
 * /prossimo         - Mostra prossimo post da approvare
 * /approva          - Approva e posta
 * /salta            - Salta al prossimo
 * /stats            - Statistiche account
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Config
const TOKEN = '8272332520:AAF7zrKpqOCnFMqOlF1GJCLycJFk3IPO6ps';
const CHAT_ID = '7505631979';
const USER_ID = '7505631979';
const ONDE_ROOT = '/Users/mattia/Projects/Onde';
const QUEUE_FILE = path.join(ONDE_ROOT, 'packages/telegram-bot/data/post-queue.json');
const HISTORY_FILE = path.join(ONDE_ROOT, 'packages/telegram-bot/data/ondepr-history.json');
const CHAT_HISTORY_FILE = path.join(ONDE_ROOT, 'packages/telegram-bot/chat-history.json');
const CONTEXT_FILE = path.join(ONDE_ROOT, 'packages/telegram-bot/context.json');

// Memory config
const MAX_HISTORY_MESSAGES = 50;  // Quanti messaggi passare a Claude
const RETENTION_DAYS = 7;

// Lock & heartbeat
const LOCK_FILE = '/tmp/ondepr-bot.lock';
const HEARTBEAT_FILE = '/tmp/ondepr-bot.heartbeat';
const HEARTBEAT_INTERVAL = 30000;

let lastUpdateId = 0;
let heartbeatTimer = null;

// Ensure data directory exists
const dataDir = path.dirname(QUEUE_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// ============================================================================
// LOCK FILE & HEARTBEAT
// ============================================================================

function checkLockFile() {
  try {
    if (fs.existsSync(LOCK_FILE)) {
      const lockData = JSON.parse(fs.readFileSync(LOCK_FILE, 'utf8'));
      try {
        process.kill(lockData.pid, 0);
        console.error(`❌ Bot già in esecuzione (PID ${lockData.pid}). Esco.`);
        process.exit(1);
      } catch (e) {
        console.log(`🔓 Lock stale. Prendo il controllo.`);
      }
    }
  } catch (e) {}
}

function createLockFile() {
  fs.writeFileSync(LOCK_FILE, JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() }));
}

function removeLockFile() {
  try { fs.existsSync(LOCK_FILE) && fs.unlinkSync(LOCK_FILE); } catch (e) {}
}

function updateHeartbeat() {
  fs.writeFileSync(HEARTBEAT_FILE, JSON.stringify({ pid: process.pid, timestamp: new Date().toISOString() }));
}

function startHeartbeat() {
  updateHeartbeat();
  heartbeatTimer = setInterval(updateHeartbeat, HEARTBEAT_INTERVAL);
}

// Cleanup on exit
process.on('SIGINT', () => { removeLockFile(); process.exit(0); });
process.on('SIGTERM', () => { removeLockFile(); process.exit(0); });
process.on('exit', removeLockFile);

checkLockFile();
createLockFile();

// ============================================================================
// MEMORY MANAGEMENT (chat-history.json + context.json)
// ============================================================================

function loadChatHistory() {
  try {
    if (fs.existsSync(CHAT_HISTORY_FILE)) {
      const data = JSON.parse(fs.readFileSync(CHAT_HISTORY_FILE, 'utf8'));
      // Cleanup old messages
      const cutoff = Date.now() - (RETENTION_DAYS * 24 * 60 * 60 * 1000);
      data.messages = (data.messages || []).filter(m => {
        const ts = new Date(m.timestamp).getTime();
        return ts > cutoff;
      });
      return data;
    }
  } catch (e) {
    console.error('Error loading chat history:', e.message);
  }
  return { lastUpdated: new Date().toISOString(), retentionDays: RETENTION_DAYS, messageCount: 0, messages: [] };
}

function saveChatHistory(history) {
  history.lastUpdated = new Date().toISOString();
  history.messageCount = history.messages.length;
  fs.writeFileSync(CHAT_HISTORY_FILE, JSON.stringify(history, null, 2));
}

function appendToHistory(role, content) {
  const history = loadChatHistory();
  history.messages.push({
    timestamp: new Date().toISOString(),
    role,
    content: content.substring(0, 10000)  // Limita lunghezza singolo messaggio
  });
  // Keep only last 500 messages in file
  if (history.messages.length > 500) {
    history.messages = history.messages.slice(-500);
  }
  saveChatHistory(history);
}

function getRecentHistory(limit = MAX_HISTORY_MESSAGES) {
  const history = loadChatHistory();
  return history.messages.slice(-limit);
}

function loadContext() {
  try {
    if (fs.existsSync(CONTEXT_FILE)) {
      return JSON.parse(fs.readFileSync(CONTEXT_FILE, 'utf8'));
    }
  } catch (e) {}
  return { currentBook: null, currentApp: null, lastActivity: null, pendingPhotos: [] };
}

function saveContext(ctx) {
  ctx.lastActivity = new Date().toISOString();
  fs.writeFileSync(CONTEXT_FILE, JSON.stringify(ctx, null, 2));
}

function updateContext(updates) {
  const ctx = loadContext();
  Object.assign(ctx, updates);
  saveContext(ctx);
  return ctx;
}

// ============================================================================
// QUEUE MANAGEMENT
// ============================================================================

function loadQueue() {
  try {
    if (fs.existsSync(QUEUE_FILE)) {
      return JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
    }
  } catch (e) {}
  return { posts: [], currentIndex: 0 };
}

function saveQueue(queue) {
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));
}

function getNextPost() {
  const queue = loadQueue();
  const pending = queue.posts.filter(p => p.status === 'pending');
  return pending[0] || null;
}

function approvePost(postId) {
  const queue = loadQueue();
  const post = queue.posts.find(p => p.id === postId);
  if (post) {
    post.status = 'approved';
    post.approvedAt = new Date().toISOString();
    saveQueue(queue);
    return post;
  }
  return null;
}

function skipPost(postId) {
  const queue = loadQueue();
  const post = queue.posts.find(p => p.id === postId);
  if (post) {
    post.status = 'skipped';
    saveQueue(queue);
  }
}

function addToQueue(account, content, mediaUrl = null) {
  const queue = loadQueue();
  const post = {
    id: `${account}-${Date.now()}`,
    account,
    content,
    mediaUrl,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  queue.posts.push(post);
  saveQueue(queue);
  return post;
}

// ============================================================================
// TELEGRAM API
// ============================================================================

function api(method, params = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(params);
    const req = https.request({
      hostname: 'api.telegram.org',
      path: `/bot${TOKEN}/${method}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch(e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function send(text, options = {}) {
  if (text.length > 4000) {
    text = text.substring(0, 3900) + '\n\n... (troncato)';
  }

  const params = {
    chat_id: CHAT_ID,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    ...options
  };

  try {
    return await api('sendMessage', params);
  } catch (e) {
    return await api('sendMessage', { ...params, text: text.replace(/<[^>]+>/g, ''), parse_mode: undefined });
  }
}

async function sendWithButtons(text, buttons) {
  return await api('sendMessage', {
    chat_id: CHAT_ID,
    text,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: buttons
    }
  });
}

// ============================================================================
// X/TWITTER API
// ============================================================================

function loadEnv() {
  const envPath = path.join(ONDE_ROOT, '.env');
  const env = {};
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) env[match[1].trim()] = match[2].trim();
    }
  }
  return env;
}

async function postToX(account, content) {
  const env = loadEnv();

  const keyMap = {
    'onde': 'X_ONDE',
    'frh': 'X_FRH',
    'magmatic': 'X_MAGMATIC'
  };

  const prefix = keyMap[account];
  if (!prefix) return { error: `Account sconosciuto: ${account}` };

  const apiKey = env[`${prefix}_API_KEY`];
  const apiSecret = env[`${prefix}_API_SECRET`];
  const accessToken = env[`${prefix}_ACCESS_TOKEN`];
  const accessSecret = env[`${prefix}_ACCESS_SECRET`];

  if (!apiKey || !accessToken) {
    return { error: `Credenziali mancanti per ${account}. Aggiungi ${prefix}_* nel .env` };
  }

  // Use tweepy via Python for OAuth 1.0a
  const script = `
import tweepy
import json

auth = tweepy.OAuthHandler('${apiKey}', '${apiSecret}')
auth.set_access_token('${accessToken}', '${accessSecret}')
api = tweepy.API(auth)

try:
    tweet = api.update_status('''${content.replace(/'/g, "\\'")}''')
    print(json.dumps({"success": True, "id": str(tweet.id), "url": f"https://x.com/{tweet.user.screen_name}/status/{tweet.id}"}))
except Exception as e:
    print(json.dumps({"success": False, "error": str(e)}))
`;

  try {
    const result = execSync(`python3 -c '${script}'`, { encoding: 'utf8', timeout: 30000 });
    return JSON.parse(result.trim());
  } catch (e) {
    return { error: e.message };
  }
}

// ============================================================================
// COMMAND HANDLERS
// ============================================================================

const ACCOUNT_NAMES = {
  'onde': '@Onde_FRH',
  'frh': '@FreeRiverHouse',
  'magmatic': '@magmatic__'
};

const ACCOUNT_EMOJI = {
  'onde': '📚',
  'frh': '🏠',
  'magmatic': '✨'
};

async function handleStart() {
  await send(`🤖 <b>ONDEPR BOT</b> - Gestione Social (con memoria)

<b>Comandi rapidi:</b>
/coda - Mostra post in coda
/prossimo - Prossimo post da approvare
/stats - Statistiche

<b>Postare direttamente:</b>
/onde [testo] - Posta su @Onde_FRH
/frh [testo] - Posta su @FreeRiverHouse
/magmatic [testo] - Posta su @magmatic__

<b>Approvazione:</b>
✅ = Approva e posta
✏️ + testo = Modifica
❌ = Scarta

<b>Memoria:</b>
/memoria - Stato memoria
/setbook [nome] - Imposta libro corrente
/setapp [nome] - Imposta app corrente
/clearmemory - Pulisci cronologia

<i>Claude ricorda gli ultimi 30 messaggi.</i>`);
}

async function handleQueue() {
  const queue = loadQueue();
  const pending = queue.posts.filter(p => p.status === 'pending');

  if (pending.length === 0) {
    await send('📭 Nessun post in coda.');
    return;
  }

  let msg = `📋 <b>CODA POST</b> (${pending.length} in attesa)\n\n`;

  for (let i = 0; i < Math.min(5, pending.length); i++) {
    const p = pending[i];
    const emoji = ACCOUNT_EMOJI[p.account] || '📝';
    const name = ACCOUNT_NAMES[p.account] || p.account;
    const preview = p.content.substring(0, 60) + (p.content.length > 60 ? '...' : '');
    msg += `${i + 1}. ${emoji} ${name}\n<i>${preview}</i>\n\n`;
  }

  if (pending.length > 5) {
    msg += `<i>... e altri ${pending.length - 5}</i>`;
  }

  await send(msg);
}

async function handleNext() {
  const post = getNextPost();

  if (!post) {
    await send('📭 Nessun post da approvare.');
    return;
  }

  const emoji = ACCOUNT_EMOJI[post.account] || '📝';
  const name = ACCOUNT_NAMES[post.account] || post.account;

  const msg = `${emoji} <b>POST PER ${name.toUpperCase()}</b>

${post.content}

---
ID: <code>${post.id}</code>

✅ = Approva e posta
✏️ = Modifica (rispondi con nuovo testo)
❌ = Scarta
⏭ = Salta al prossimo`;

  await sendWithButtons(msg, [
    [
      { text: '✅ Approva', callback_data: `approve:${post.id}` },
      { text: '❌ Scarta', callback_data: `reject:${post.id}` },
      { text: '⏭ Salta', callback_data: `skip:${post.id}` }
    ]
  ]);
}

async function handleDirectPost(account, content) {
  if (!content || content.trim().length === 0) {
    await send(`❌ Scrivi il testo del post dopo /${account}`);
    return;
  }

  const name = ACCOUNT_NAMES[account];
  const emoji = ACCOUNT_EMOJI[account];

  await send(`${emoji} Posto su ${name}...\n\n<i>${content.substring(0, 100)}...</i>`);

  const result = await postToX(account, content);

  if (result.success) {
    await send(`✅ <b>POSTATO!</b>\n\n${result.url}`);
  } else if (result.error) {
    await send(`❌ Errore: ${result.error}`);
  }
}

async function handleStats() {
  const queue = loadQueue();
  const pending = queue.posts.filter(p => p.status === 'pending').length;
  const approved = queue.posts.filter(p => p.status === 'approved').length;
  const skipped = queue.posts.filter(p => p.status === 'skipped').length;

  await send(`📊 <b>STATISTICHE</b>

<b>Coda:</b>
• In attesa: ${pending}
• Approvati: ${approved}
• Saltati: ${skipped}

<b>Account:</b>
• @Onde_FRH - ${queue.posts.filter(p => p.account === 'onde').length} post
• @FreeRiverHouse - ${queue.posts.filter(p => p.account === 'frh').length} post
• @magmatic__ - ${queue.posts.filter(p => p.account === 'magmatic').length} post`);
}

async function handleApprove(text) {
  const post = getNextPost();
  if (!post) {
    await send('📭 Nessun post da approvare.');
    return;
  }

  await send(`📤 Posto su ${ACCOUNT_NAMES[post.account]}...`);

  const result = await postToX(post.account, post.content);

  if (result.success) {
    approvePost(post.id);
    await send(`✅ <b>POSTATO!</b>\n\n${result.url}`);

    // Show next automatically
    const next = getNextPost();
    if (next) {
      await send('---');
      await handleNext();
    }
  } else {
    await send(`❌ Errore: ${result.error}`);
  }
}

async function handleSkip() {
  const post = getNextPost();
  if (!post) {
    await send('📭 Nessun post da saltare.');
    return;
  }

  skipPost(post.id);
  await send(`⏭ Saltato: ${post.id.substring(0, 20)}...`);

  // Show next
  await handleNext();
}

// ============================================================================
// CALLBACK QUERY HANDLER (button presses)
// ============================================================================

async function handleCallback(callbackQuery) {
  const data = callbackQuery.data;
  const [action, postId] = data.split(':');

  // Acknowledge the callback
  await api('answerCallbackQuery', { callback_query_id: callbackQuery.id });

  if (action === 'approve') {
    const queue = loadQueue();
    const post = queue.posts.find(p => p.id === postId);
    if (!post) {
      await send('❌ Post non trovato');
      return;
    }

    await send(`📤 Posto su ${ACCOUNT_NAMES[post.account]}...`);
    const result = await postToX(post.account, post.content);

    if (result.success) {
      approvePost(postId);
      await send(`✅ <b>POSTATO!</b>\n\n${result.url}`);

      const next = getNextPost();
      if (next) {
        setTimeout(() => handleNext(), 1000);
      }
    } else {
      await send(`❌ Errore: ${result.error}`);
    }
  }

  else if (action === 'reject') {
    const queue = loadQueue();
    const post = queue.posts.find(p => p.id === postId);
    if (post) {
      post.status = 'rejected';
      saveQueue(queue);
      await send('❌ Post scartato.');

      const next = getNextPost();
      if (next) {
        setTimeout(() => handleNext(), 1000);
      }
    }
  }

  else if (action === 'skip') {
    skipPost(postId);
    await send('⏭ Saltato.');

    const next = getNextPost();
    if (next) {
      setTimeout(() => handleNext(), 1000);
    }
  }
}

// ============================================================================
// CLAUDE CLI INTEGRATION (con memoria)
// ============================================================================

function buildContextPrompt() {
  const ctx = loadContext();
  const recentHistory = getRecentHistory(30);  // Ultimi 30 messaggi per contesto

  let contextStr = '';

  // Add current context
  if (ctx.currentBook || ctx.currentApp) {
    contextStr += `\n<current-context>`;
    if (ctx.currentBook) contextStr += `\nLibro corrente: ${ctx.currentBook}`;
    if (ctx.currentApp) contextStr += `\nApp corrente: ${ctx.currentApp}`;
    if (ctx.lastChapter) contextStr += `\nUltimo capitolo: ${ctx.lastChapter}`;
    contextStr += `\n</current-context>\n`;
  }

  // Add recent conversation
  if (recentHistory.length > 0) {
    contextStr += `\n<recent-conversation>
Gli ultimi ${recentHistory.length} messaggi della conversazione:
`;
    for (const msg of recentHistory) {
      const time = new Date(msg.timestamp).toLocaleString('it-IT', { hour: '2-digit', minute: '2-digit' });
      const prefix = msg.role === 'user' ? 'Mattia' : 'Bot';
      // Tronca messaggi lunghi
      const content = msg.content.length > 500 ? msg.content.substring(0, 500) + '...' : msg.content;
      contextStr += `[${time}] ${prefix}: ${content}\n`;
    }
    contextStr += `</recent-conversation>\n`;
  }

  return contextStr;
}

async function askClaude(message) {
  const contextPrompt = buildContextPrompt();

  const systemPrompt = `Sei OndePR Bot - assistente per gestione social media di Onde (casa editrice) e FreeRiverHouse.

Working directory: ${ONDE_ROOT}

ACCOUNT GESTITI:
- @Onde_FRH (onde) - Casa editrice, libri per bambini, cultura
- @FreeRiverHouse (frh) - Indie software house, building in public, tech
- @magmatic__ (magmatic) - Account personale Mattia, poesia, arte

CODA POST: ${QUEUE_FILE}
La coda contiene post pronti da approvare/postare.

COMANDI RAPIDI (rispondi direttamente):
- "coda" o "queue" → mostra post in attesa
- "prossimo" o "next" → mostra prossimo post da approvare
- "ok" o "✅" → approva e posta
- "no" o "❌" → scarta post
- "skip" o "⏭" → salta al prossimo
- "/onde [testo]" → posta direttamente su @Onde_FRH
- "/frh [testo]" → posta su @FreeRiverHouse

REGOLE:
- Rispondi SEMPRE in italiano
- Sii conciso ma utile
- Se ti chiedono di fare qualcosa sui social, FALLO
- Puoi leggere file, eseguire comandi, cercare nel codebase
- Hai accesso completo al progetto Onde
- HAI MEMORIA: puoi vedere la conversazione recente sotto
- Se Mattia fa riferimento a qualcosa detto prima, CERCA NEL CONTESTO
${contextPrompt}`;

  const escapedMessage = message.replace(/'/g, "'\\''");
  const escapedSystem = systemPrompt.replace(/'/g, "'\\''");

  const cmd = `cd "${ONDE_ROOT}" && claude -p --dangerously-skip-permissions --output-format text '${escapedMessage}' --system-prompt '${escapedSystem}'`;

  try {
    const result = execSync(cmd, {
      encoding: 'utf8',
      timeout: 120000,
      maxBuffer: 2 * 1024 * 1024,
      env: {
        ...process.env,
        PATH: '/Users/mattia/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin'
      }
    });
    return result.trim();
  } catch (e) {
    if (e.stdout) {
      return e.stdout.trim();
    }
    return `❌ Errore: ${e.message}`;
  }
}

// ============================================================================
// MESSAGE PROCESSING
// ============================================================================

async function processMessage(text, user) {
  console.log(`📨 ${user}: ${text}`);

  const lower = text.toLowerCase().trim();

  // Save ALL user messages to history (for context)
  appendToHistory('user', text);

  // Quick commands that don't need Claude
  if (lower === 'ping') {
    const response = '🟢 Pong! OndePR Bot + Claude attivo (con memoria).';
    appendToHistory('assistant', response);
    return send(response);
  }

  if (lower === '/start') {
    return handleStart();
  }

  // Memory commands
  if (lower === '/memoria' || lower === 'memoria' || lower === '/memory') {
    const history = loadChatHistory();
    const ctx = loadContext();
    const response = `🧠 <b>MEMORIA BOT</b>

<b>Messaggi salvati:</b> ${history.messageCount}
<b>Ultimo aggiornamento:</b> ${new Date(history.lastUpdated).toLocaleString('it-IT')}

<b>Contesto corrente:</b>
• Libro: ${ctx.currentBook || 'nessuno'}
• App: ${ctx.currentApp || 'nessuna'}
• Ultimo capitolo: ${ctx.lastChapter || 'n/a'}

<i>Ultimi 30 messaggi passati a Claude come contesto.</i>`;
    return send(response);
  }

  if (lower.startsWith('/setbook ') || lower.startsWith('libro: ')) {
    const book = text.replace(/^(\/setbook |libro: )/i, '').trim();
    updateContext({ currentBook: book });
    return send(`📚 Libro corrente: <b>${book}</b>`);
  }

  if (lower.startsWith('/setapp ') || lower.startsWith('app: ')) {
    const app = text.replace(/^(\/setapp |app: )/i, '').trim();
    updateContext({ currentApp: app });
    return send(`📱 App corrente: <b>${app}</b>`);
  }

  if (lower === '/clearmemory' || lower === '/resetmemory') {
    saveChatHistory({ lastUpdated: new Date().toISOString(), retentionDays: RETENTION_DAYS, messageCount: 0, messages: [] });
    return send('🧹 Memoria conversazione cancellata.');
  }

  // Fast-track common commands
  if (lower === '/coda' || lower === 'coda' || lower === 'queue') {
    return handleQueue();
  }

  if (lower === '/prossimo' || lower === 'prossimo' || lower === 'next' || lower === '/next') {
    return handleNext();
  }

  if (lower === '/stats' || lower === 'stats') {
    return handleStats();
  }

  if (lower === '✅' || lower === '/approva' || lower === 'approva' || lower === 'ok') {
    return handleApprove();
  }

  if (lower === '❌' || lower === '/scarta' || lower === 'scarta' || lower === 'no') {
    const post = getNextPost();
    if (post) {
      const queue = loadQueue();
      const p = queue.posts.find(x => x.id === post.id);
      if (p) {
        p.status = 'rejected';
        saveQueue(queue);
        await send('❌ Scartato.');
        return handleNext();
      }
    }
    return;
  }

  if (lower === '⏭' || lower === '/salta' || lower === 'salta' || lower === 'skip') {
    return handleSkip();
  }

  // Direct post commands
  if (text.startsWith('/onde ')) {
    return handleDirectPost('onde', text.substring(6).trim());
  }
  if (text.startsWith('/frh ')) {
    return handleDirectPost('frh', text.substring(5).trim());
  }
  if (text.startsWith('/magmatic ')) {
    return handleDirectPost('magmatic', text.substring(10).trim());
  }

  // Edit command
  if (text.startsWith('✏️') || lower.startsWith('edit ') || lower.startsWith('modifica ')) {
    const newContent = text.replace(/^(✏️|edit|modifica)\s*/i, '').trim();
    if (newContent) {
      const post = getNextPost();
      if (post) {
        const queue = loadQueue();
        const p = queue.posts.find(x => x.id === post.id);
        if (p) {
          p.content = newContent;
          saveQueue(queue);
          await send('✏️ Modificato!');
          return handleNext();
        }
      }
    }
    return;
  }

  // Everything else → Claude (con memoria)
  // (user message already saved at start of function)
  await send('🧠 Elaboro...');

  try {
    const response = await askClaude(text);
    appendToHistory('assistant', response);  // Salva risposta
    await send(response);
    console.log(`✅ Claude risposto (${response.length} chars)`);
  } catch (e) {
    const errorMsg = `❌ Errore Claude: ${e.message}`;
    appendToHistory('assistant', errorMsg);
    await send(errorMsg);
    console.error('Claude error:', e);
  }
}

// ============================================================================
// MAIN POLLING LOOP
// ============================================================================

async function poll() {
  console.log('🤖 ONDEPR BOT attivo!');
  console.log(`📁 Working dir: ${ONDE_ROOT}`);
  console.log(`🔒 Utente autorizzato: ${USER_ID}`);
  console.log('⏳ In attesa di messaggi...\n');

  startHeartbeat();

  while (true) {
    try {
      const res = await api('getUpdates', {
        offset: lastUpdateId + 1,
        timeout: 30,
        allowed_updates: ['message', 'callback_query']
      });

      if (res.ok && res.result.length > 0) {
        for (const update of res.result) {
          lastUpdateId = update.update_id;

          // Handle callback queries (button presses)
          if (update.callback_query) {
            const fromId = update.callback_query.from?.id?.toString();
            if (fromId === USER_ID) {
              await handleCallback(update.callback_query);
            }
            continue;
          }

          // Handle messages
          const msg = update.message;
          if (!msg || !msg.text) continue;

          const fromId = msg.from?.id?.toString();
          if (fromId !== USER_ID) {
            console.log(`⛔ Unauthorized: ${fromId}`);
            continue;
          }

          await processMessage(msg.text, msg.from?.first_name || 'User');
        }
      }
    } catch (e) {
      console.error('Poll error:', e.message);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

poll();
