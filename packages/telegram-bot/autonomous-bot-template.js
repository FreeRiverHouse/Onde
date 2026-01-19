#!/usr/bin/env node
/**
 * AUTONOMOUS TELEGRAM BOT - Template
 * Powered by Claude Code CLI
 * Features: Memory (7 days), Voice messages (Whisper Italian)
 *
 * SETUP:
 * 1. brew install node ffmpeg whisper-cpp
 * 2. mkdir -p ~/.whisper && curl -L "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin" -o ~/.whisper/ggml-base.bin
 * 3. npm install -g @anthropic-ai/claude-code
 * 4. Edit CONFIG below
 * 5. node autonomous-bot-template.js
 */

const https = require('https');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIG - EDIT THESE VALUES
// ============================================================================
const TOKEN = 'YOUR_BOT_TOKEN';              // From @BotFather
const CHAT_ID = 'YOUR_CHAT_ID';              // Your Telegram user ID
const USER_ID = 'YOUR_CHAT_ID';              // Same as CHAT_ID (security)
const WORKING_DIR = '/path/to/your/project'; // Working directory for Claude
const HISTORY_FILE = '/path/to/chat-history.json';
const WHISPER_MODEL = '/Users/YOURUSERNAME/.whisper/ggml-base.bin';
const MEMORY_DAYS = 7;
const VOICE_DIR = '/tmp/telegram-voice';
const CLAUDE_TIMEOUT = 300000;  // 5 minutes
// ============================================================================

let lastUpdateId = 0;

if (!fs.existsSync(VOICE_DIR)) {
  fs.mkdirSync(VOICE_DIR, { recursive: true });
}

// Chat History
function loadHistory() {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8')).messages || [];
    }
  } catch (e) { console.error('Error loading history:', e.message); }
  return [];
}

function saveHistory(messages) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify({
    lastUpdated: new Date().toISOString(),
    retentionDays: MEMORY_DAYS,
    messageCount: messages.length,
    messages
  }, null, 2));
}

function addToHistory(role, content) {
  const messages = loadHistory();
  messages.push({ timestamp: new Date().toISOString(), role, content });
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - MEMORY_DAYS);
  saveHistory(messages.filter(m => new Date(m.timestamp) > cutoff));
}

function getRecentHistory(max = 30) {
  const msgs = loadHistory().slice(-max);
  if (!msgs.length) return '';
  let h = '\n\n=== CHAT HISTORY ===\n';
  for (const m of msgs) {
    const t = new Date(m.timestamp).toLocaleString('it-IT', {day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
    h += `[${t}] ${m.role === 'user' ? '👤' : '🤖'}: ${m.content.substring(0,500)}${m.content.length>500?'...':''}\n\n`;
  }
  return h + '=== END ===\n';
}

// Voice
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, r => { r.pipe(file); file.on('finish', () => { file.close(); resolve(dest); }); })
      .on('error', e => { fs.unlink(dest, () => {}); reject(e); });
  });
}

async function getFileUrl(fileId) {
  const r = await api('getFile', { file_id: fileId });
  if (r.ok && r.result.file_path) return `https://api.telegram.org/file/bot${TOKEN}/${r.result.file_path}`;
  throw new Error('Could not get file URL');
}

async function transcribeVoice(voicePath) {
  const wavPath = path.join(VOICE_DIR, `voice_${Date.now()}.wav`);
  try {
    execSync(`ffmpeg -y -i "${voicePath}" -ar 16000 -ac 1 "${wavPath}" 2>/dev/null`);
    const result = execSync(`/opt/homebrew/bin/whisper-cli -m "${WHISPER_MODEL}" -l it --no-timestamps "${wavPath}"`,
      { encoding: 'utf8', timeout: 60000 });
    fs.unlinkSync(wavPath);
    if (fs.existsSync(voicePath)) fs.unlinkSync(voicePath);
    return result.replace(/\[BLANK_AUDIO\]/g, '').trim() || '[Audio non riconosciuto]';
  } catch (e) {
    if (fs.existsSync(wavPath)) fs.unlinkSync(wavPath);
    if (fs.existsSync(voicePath)) fs.unlinkSync(voicePath);
    return '[Errore trascrizione]';
  }
}

// Telegram API
function api(method, params = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(params);
    const req = https.request({
      hostname: 'api.telegram.org', path: `/bot${TOKEN}/${method}`,
      method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => { try { resolve(JSON.parse(body)); } catch(e) { reject(e); } });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function send(text) {
  if (text.length > 4000) text = text.substring(0, 3900) + '\n\n... (truncated)';
  await api('sendMessage', { chat_id: CHAT_ID, text, parse_mode: 'HTML', disable_web_page_preview: true })
    .catch(() => api('sendMessage', { chat_id: CHAT_ID, text: text.replace(/<[^>]+>/g, '') }));
}

// Claude CLI
async function askClaude(message) {
  const history = getRecentHistory();
  const systemPrompt = `You are a Telegram assistant.
Working directory: ${WORKING_DIR}
You have PERSISTENT MEMORY - check history for context.
You have FULL tool access: read/write files, run commands, search code.
Be concise but complete.
${history}`;

  const escaped = s => s.replace(/'/g, "'\\''");
  const cmd = `cd "${WORKING_DIR}" && claude -p --dangerously-skip-permissions --system-prompt '${escaped(systemPrompt)}' '${escaped(message)}'`;

  try {
    return execSync(cmd, {
      encoding: 'utf8',
      timeout: CLAUDE_TIMEOUT,
      maxBuffer: 5 * 1024 * 1024,
      env: { ...process.env, PATH: `${process.env.HOME}/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin` }
    }).trim();
  } catch (e) {
    return e.stdout?.trim() || `❌ Error: ${e.message}`;
  }
}

// Message Processing
async function processMessage(text, user, isVoice = false) {
  console.log(`📨 ${isVoice ? '🎤 ' : ''}${user}: ${text}`);
  addToHistory('user', text);

  const lower = text.toLowerCase().trim();
  if (lower === 'ping') { const r = '🟢 Pong!'; addToHistory('assistant', r); return send(r); }
  if (lower === 'memoria') { return send(`📊 ${loadHistory().length} messaggi in memoria`); }

  await send(isVoice ? `🎤 "${text.substring(0,100)}..."\n\n🧠 Processing...` : '🧠 Processing...');
  const response = await askClaude(text);
  addToHistory('assistant', response);
  await send(response);
  console.log(`✅ Responded (${response.length} chars)`);
}

// Main Loop
async function poll() {
  console.log('🤖 BOT ACTIVE');
  console.log(`📁 ${WORKING_DIR}`);
  console.log(`🔒 Authorized: ${USER_ID}`);
  console.log('⏳ Waiting for messages...\n');

  while (true) {
    try {
      const res = await api('getUpdates', { offset: lastUpdateId + 1, timeout: 30, allowed_updates: ['message'] });
      if (res.ok && res.result.length > 0) {
        for (const update of res.result) {
          lastUpdateId = update.update_id;
          const msg = update.message;
          if (!msg || msg.from?.id?.toString() !== USER_ID) continue;

          if (msg.voice) {
            console.log(`🎤 Voice (${msg.voice.duration}s)`);
            const fileUrl = await getFileUrl(msg.voice.file_id);
            const voicePath = path.join(VOICE_DIR, `voice_${Date.now()}.ogg`);
            await downloadFile(fileUrl, voicePath);
            await send('🎤 Transcribing...');
            const transcription = await transcribeVoice(voicePath);
            if (transcription && !transcription.includes('Errore')) await processMessage(transcription, msg.from.first_name, true);
            else await send('❌ Could not transcribe audio');
          } else if (msg.text) {
            await processMessage(msg.text, msg.from.first_name);
          }
        }
      }
    } catch (e) {
      console.error('Poll error:', e.message);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));
poll();
