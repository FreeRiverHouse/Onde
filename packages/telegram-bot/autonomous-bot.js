#!/usr/bin/env node
/**
 * AUTONOMOUS TELEGRAM BOT - Fully powered by Claude Code
 * Con MEMORIA PERSISTENTE - ricorda l'ultima settimana di conversazione
 * Supporta MESSAGGI VOCALI con trascrizione Whisper (italiano)
 */

const https = require('https');
const http = require('http');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TOKEN = '8528268093:AAGNZUcYBm8iMcn9D_oWr565rpxm9riNkBM';
const CHAT_ID = '7505631979';
const USER_ID = '7505631979'; // Solo questo utente può usare il bot
const ONDE_ROOT = '/Users/mattia/Projects/Onde';
const CASCADE_ROOT = '/Users/mattia/Projects';
const HISTORY_FILE = '/Users/mattia/Projects/Onde/packages/telegram-bot/data/chat-history.json';
const VOICE_DIR = '/tmp/telegram-voice';
const WHISPER_MODEL = '/Users/mattia/.whisper/ggml-base.bin';
const MEMORY_DAYS = 7;

// Lock file and heartbeat for reliability
const LOCK_FILE = '/tmp/onde-bot.lock';
const HEARTBEAT_FILE = '/tmp/onde-bot.heartbeat';
const HEARTBEAT_INTERVAL = 30000; // 30 seconds

let lastUpdateId = 0;
let heartbeatTimer = null;
let isProcessing = false;

// Ensure voice directory exists
if (!fs.existsSync(VOICE_DIR)) {
  fs.mkdirSync(VOICE_DIR, { recursive: true });
}

// ============================================================================
// LOCK FILE & HEARTBEAT - Prevents multiple instances and detects stuck state
// ============================================================================

function checkLockFile() {
  try {
    if (fs.existsSync(LOCK_FILE)) {
      const lockData = JSON.parse(fs.readFileSync(LOCK_FILE, 'utf8'));
      const pid = lockData.pid;

      // Check if process is still running
      try {
        process.kill(pid, 0); // Signal 0 = check if process exists
        console.error(`❌ Bot già in esecuzione (PID ${pid}). Esco.`);
        process.exit(1);
      } catch (e) {
        // Process not running, we can take over
        console.log(`🔓 Lock file stale (PID ${pid} non esiste). Prendo il controllo.`);
      }
    }
  } catch (e) {
    // Lock file corrupted or doesn't exist, proceed
  }
}

function createLockFile() {
  const lockData = {
    pid: process.pid,
    startedAt: new Date().toISOString()
  };
  fs.writeFileSync(LOCK_FILE, JSON.stringify(lockData));
  console.log(`🔒 Lock file creato (PID ${process.pid})`);
}

function removeLockFile() {
  try {
    if (fs.existsSync(LOCK_FILE)) {
      fs.unlinkSync(LOCK_FILE);
      console.log('🔓 Lock file rimosso');
    }
  } catch (e) {}
}

function updateHeartbeat() {
  const heartbeatData = {
    pid: process.pid,
    timestamp: new Date().toISOString(),
    isProcessing: isProcessing
  };
  fs.writeFileSync(HEARTBEAT_FILE, JSON.stringify(heartbeatData));
}

function startHeartbeat() {
  updateHeartbeat();
  heartbeatTimer = setInterval(updateHeartbeat, HEARTBEAT_INTERVAL);
  console.log(`💓 Heartbeat attivo (ogni ${HEARTBEAT_INTERVAL/1000}s)`);
}

function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
  try {
    if (fs.existsSync(HEARTBEAT_FILE)) {
      fs.unlinkSync(HEARTBEAT_FILE);
    }
  } catch (e) {}
}

// Check lock on startup
checkLockFile();
createLockFile();

// ============================================================================
// CHAT HISTORY MANAGEMENT
// ============================================================================

function loadHistory() {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      const data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
      return data.messages || [];
    }
  } catch (e) {
    console.error('Error loading history:', e.message);
  }
  return [];
}

function saveHistory(messages) {
  try {
    const data = {
      lastUpdated: new Date().toISOString(),
      retentionDays: MEMORY_DAYS,
      messageCount: messages.length,
      messages: messages
    };
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error saving history:', e.message);
  }
}

function addToHistory(role, content) {
  const messages = loadHistory();
  messages.push({
    timestamp: new Date().toISOString(),
    role: role,
    content: content
  });
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - MEMORY_DAYS);
  const filtered = messages.filter(m => new Date(m.timestamp) > cutoff);
  saveHistory(filtered);
  return filtered;
}

function getRecentHistory(maxMessages = 50) {
  const messages = loadHistory();
  const recent = messages.slice(-maxMessages);
  if (recent.length === 0) return '';

  let history = '\n\n=== STORICO CONVERSAZIONE (ultima settimana) ===\n';
  for (const msg of recent) {
    const date = new Date(msg.timestamp);
    const timeStr = date.toLocaleString('it-IT', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    });
    const roleLabel = msg.role === 'user' ? '👤 Mattia' : '🤖 Bot';
    let content = msg.content;
    if (content.length > 500) content = content.substring(0, 500) + '...';
    history += `[${timeStr}] ${roleLabel}: ${content}\n\n`;
  }
  history += '=== FINE STORICO ===\n';
  return history;
}

// ============================================================================
// VOICE MESSAGE HANDLING
// ============================================================================

function downloadFile(fileUrl, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(fileUrl, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(destPath);
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

async function getFileUrl(fileId) {
  const result = await api('getFile', { file_id: fileId });
  if (result.ok && result.result.file_path) {
    return `https://api.telegram.org/file/bot${TOKEN}/${result.result.file_path}`;
  }
  throw new Error('Could not get file URL');
}

async function transcribeVoice(voicePath) {
  const timestamp = Date.now();
  const wavPath = path.join(VOICE_DIR, `voice_${timestamp}.wav`);

  try {
    // Convert OGG to WAV (16kHz mono for Whisper)
    execSync(`ffmpeg -y -i "${voicePath}" -ar 16000 -ac 1 "${wavPath}" 2>/dev/null`);

    // Transcribe with Whisper (Italian)
    const result = execSync(
      `/opt/homebrew/bin/whisper-cli -m "${WHISPER_MODEL}" -l it --no-timestamps "${wavPath}"`,
      { encoding: 'utf8', timeout: 60000 }
    );

    // Clean up
    fs.unlinkSync(wavPath);
    if (fs.existsSync(voicePath)) fs.unlinkSync(voicePath);

    // Extract text (remove [BLANK_AUDIO] and trim)
    const text = result
      .replace(/\[BLANK_AUDIO\]/g, '')
      .replace(/^\s*\n/gm, '')
      .trim();

    return text || '[Audio non riconosciuto]';
  } catch (e) {
    console.error('Transcription error:', e.message);
    // Cleanup on error
    if (fs.existsSync(wavPath)) fs.unlinkSync(wavPath);
    if (fs.existsSync(voicePath)) fs.unlinkSync(voicePath);
    return '[Errore trascrizione audio]';
  }
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

async function sendTelegram(text) {
  if (text.length > 4000) {
    text = text.substring(0, 3900) + '\n\n... (troncato)';
  }
  text = text.replace(/<(?!\/?(?:b|i|u|s|code|pre|a)(?:\s|>))[^>]+>/g, '');

  try {
    await api('sendMessage', {
      chat_id: CHAT_ID,
      text: text,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });
  } catch (e) {
    await api('sendMessage', {
      chat_id: CHAT_ID,
      text: text.replace(/<[^>]+>/g, '')
    });
  }
}

// ============================================================================
// CLAUDE CLI
// ============================================================================

async function askClaude(message) {
  const history = getRecentHistory(30);

  const systemPrompt = `Sei un assistente Telegram per Onde (casa editrice) e FreeRiverHouse.
Working directory: ${ONDE_ROOT}

HAI MEMORIA PERSISTENTE - Ricordi l'ultima settimana di conversazione.
Se l'utente fa riferimento a qualcosa discusso prima, controlla lo storico.

Hai accesso COMPLETO a tutti i tools: puoi leggere file, eseguire comandi, cercare nel codebase.
Rispondi in italiano, conciso ma completo.
Se ti chiedono di fare qualcosa, FALLO e riporta i risultati.
${history}`;

  const escapedMessage = message.replace(/'/g, "'\\''");
  const escapedSystem = systemPrompt.replace(/'/g, "'\\''");

  const cmd = `cd "${ONDE_ROOT}" && claude -p --dangerously-skip-permissions --system-prompt '${escapedSystem}' '${escapedMessage}'`;

  try {
    const result = execSync(cmd, {
      encoding: 'utf8',
      timeout: 300000,  // 5 minuti per richieste complesse
      maxBuffer: 5 * 1024 * 1024,
      env: {
        ...process.env,
        PATH: '/Users/mattia/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin'
      }
    });
    return result.trim();
  } catch (e) {
    if (e.stdout) {
      return e.stdout.trim() + '\n\n⚠️ Comando terminato con errore';
    }
    return `❌ Errore Claude: ${e.message}`;
  }
}

// ============================================================================
// MESSAGE PROCESSING
// ============================================================================

async function processMessage(text, user, isVoice = false) {
  isProcessing = true;
  updateHeartbeat();

  const prefix = isVoice ? '🎤 ' : '';
  console.log(`📨 ${prefix}${user}: ${text}`);

  addToHistory('user', text);

  const lower = text.toLowerCase().trim();

  // Quick commands
  if (lower === 'ping') {
    const response = '🟢 Pong! Bot autonomo con memoria + voce attivo.';
    addToHistory('assistant', response);
    await sendTelegram(response);
    return;
  }

  if (lower === 'help' || lower === '/start') {
    const response = `🤖 <b>ONDE AUTONOMOUS BOT</b>
<i>Memoria 7 giorni + Messaggi Vocali</i>

<b>Cosa posso fare:</b>
• 🎤 Capisco messaggi vocali (italiano)
• 📝 Ricordo le conversazioni
• 📁 Leggo/scrivo file
• ⚡ Eseguo comandi
• 🔍 Cerco nel codebase

<b>Comandi:</b>
• <code>memoria</code> - Statistiche
• <code>pulisci memoria</code> - Reset

⏱ Timeout: 2 minuti`;
    addToHistory('assistant', response);
    await sendTelegram(response);
    return;
  }

  if (lower === 'memoria' || lower === 'memory') {
    const messages = loadHistory();
    const stats = `📊 <b>Statistiche Memoria</b>

• Messaggi: ${messages.length}
• Ritenzione: ${MEMORY_DAYS} giorni
• Voce: ✅ Attivo (Whisper italiano)

Primo: ${messages.length > 0 ? new Date(messages[0].timestamp).toLocaleString('it-IT') : 'N/A'}
Ultimo: ${messages.length > 0 ? new Date(messages[messages.length-1].timestamp).toLocaleString('it-IT') : 'N/A'}`;
    addToHistory('assistant', stats);
    await sendTelegram(stats);
    return;
  }

  if (lower === 'pulisci memoria' || lower === 'clear memory') {
    saveHistory([]);
    const response = '🧹 Memoria pulita.';
    addToHistory('assistant', response);
    await sendTelegram(response);
    return;
  }

  // Show voice indicator
  if (isVoice) {
    await sendTelegram(`🎤 <i>"${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"</i>\n\n🧠 Elaboro...`);
  } else {
    await sendTelegram('🧠 Elaboro...');
  }

  try {
    const response = await askClaude(text);
    addToHistory('assistant', response);
    await sendTelegram(response);
    console.log(`✅ Risposto (${response.length} chars)`);
  } catch (e) {
    const errorMsg = `❌ Errore: ${e.message}`;
    addToHistory('assistant', errorMsg);
    await sendTelegram(errorMsg);
    console.error('Error:', e);
  } finally {
    isProcessing = false;
    updateHeartbeat();
  }
}

// ============================================================================
// MAIN POLLING LOOP
// ============================================================================

async function poll() {
  console.log('🤖 ONDE AUTONOMOUS BOT attivo!');
  console.log(`📁 Working dir: ${ONDE_ROOT}`);
  console.log(`🧠 Memoria: ${MEMORY_DAYS} giorni`);
  console.log(`🎤 Voce: Whisper italiano`);
  console.log(`🔒 Utente autorizzato: ${USER_ID}`);
  console.log('🔧 Claude CLI con tools ABILITATI');

  // Start heartbeat
  startHeartbeat();

  console.log('⏳ In attesa di messaggi...\n');

  const existingHistory = loadHistory();
  if (existingHistory.length > 0) {
    console.log(`📚 Caricati ${existingHistory.length} messaggi\n`);
  }

  while (true) {
    try {
      const res = await api('getUpdates', {
        offset: lastUpdateId + 1,
        timeout: 30,
        allowed_updates: ['message']
      });

      if (res.ok && res.result.length > 0) {
        for (const update of res.result) {
          lastUpdateId = update.update_id;
          const msg = update.message;
          if (!msg) continue;

          // Security: only respond to authorized user
          const fromId = msg.from?.id?.toString();
          if (fromId !== USER_ID) {
            console.log(`⛔ Unauthorized user: ${fromId} (${msg.from?.first_name})`);
            continue;
          }

          const user = msg.from?.first_name || 'User';

          // Handle voice message
          if (msg.voice) {
            console.log(`🎤 Voice message from ${user} (${msg.voice.duration}s)`);
            try {
              const fileUrl = await getFileUrl(msg.voice.file_id);
              const voicePath = path.join(VOICE_DIR, `voice_${Date.now()}.ogg`);
              await downloadFile(fileUrl, voicePath);

              await sendTelegram('🎤 Trascrivo audio...');
              const transcription = await transcribeVoice(voicePath);

              if (transcription && transcription !== '[Audio non riconosciuto]' && transcription !== '[Errore trascrizione audio]') {
                await processMessage(transcription, user, true);
              } else {
                await sendTelegram('❌ Non sono riuscito a trascrivere l\'audio. Riprova parlando più chiaramente.');
              }
            } catch (e) {
              console.error('Voice processing error:', e);
              await sendTelegram(`❌ Errore elaborazione audio: ${e.message}`);
            }
            continue;
          }

          // Handle text message
          if (msg.text) {
            await processMessage(msg.text, user, false);
          }
        }
      }
    } catch (e) {
      console.error('Poll error:', e.message);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

// Graceful shutdown
function cleanup() {
  console.log('🛑 Pulizia in corso...');
  stopHeartbeat();
  removeLockFile();
}

process.on('SIGTERM', () => {
  console.log('Bot shutting down (SIGTERM)...');
  cleanup();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Bot interrupted (SIGINT)...');
  cleanup();
  process.exit(0);
});

process.on('exit', () => {
  cleanup();
});

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  cleanup();
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
});

poll();
