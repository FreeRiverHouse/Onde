#!/usr/bin/env node
/**
 * TELEGRAM BRIDGE - Ponte tra Telegram e Claude Code
 *
 * Questo script:
 * 1. Riceve messaggi da Telegram
 * 2. Li salva in una coda per Claude Code
 * 3. Aspetta la risposta da Claude Code
 * 4. Invia la risposta su Telegram
 */

const https = require('https');
const fs = require('fs');

const TOKEN = '8528268093:AAGNZUcYBm8iMcn9D_oWr565rpxm9riNkBM';
const CHAT_ID = '7505631979';
const QUEUE_DIR = '/tmp/telegram-claude';
const REQUEST_FILE = `${QUEUE_DIR}/request.json`;
const RESPONSE_FILE = `${QUEUE_DIR}/response.json`;

let lastUpdateId = 0;

// Ensure queue directory exists
if (!fs.existsSync(QUEUE_DIR)) {
  fs.mkdirSync(QUEUE_DIR, { recursive: true });
}

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
  await api('sendMessage', { chat_id: CHAT_ID, text: text, parse_mode: 'HTML' });
}

// Write request for Claude Code to process
function writeRequest(message, user) {
  const request = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    user: user,
    message: message,
    status: 'pending'
  };
  fs.writeFileSync(REQUEST_FILE, JSON.stringify(request, null, 2));
  console.log(`📝 Request queued: ${message.substring(0, 50)}...`);
  return request.id;
}

// Check for response from Claude Code
function checkResponse(requestId) {
  if (fs.existsSync(RESPONSE_FILE)) {
    try {
      const response = JSON.parse(fs.readFileSync(RESPONSE_FILE, 'utf8'));
      if (response.requestId === requestId && response.status === 'completed') {
        // Clear the response file
        fs.unlinkSync(RESPONSE_FILE);
        return response.message;
      }
    } catch (e) {
      // Ignore parse errors
    }
  }
  return null;
}

// Wait for response with timeout
async function waitForResponse(requestId, timeoutMs = 120000) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    const response = checkResponse(requestId);
    if (response) {
      return response;
    }
    await new Promise(r => setTimeout(r, 1000)); // Check every second
  }

  return null; // Timeout
}

async function processMessage(text, user) {
  console.log(`📨 ${user}: ${text}`);

  const lower = text.toLowerCase().trim();

  // Quick commands that don't need Claude
  if (lower === 'ping') {
    await sendTelegram('🟢 Pong! Bridge attivo.');
    return;
  }

  if (lower === 'help' || lower === '/start') {
    await sendTelegram(`🌉 <b>TELEGRAM-CLAUDE BRIDGE</b>

Questo bot è collegato direttamente a Claude Code.
Scrivi qualsiasi cosa e Claude la elabora con tutti i suoi strumenti.

Esempi:
• "Leggi il file CLAUDE.md"
• "Quante immagini ci sono in books/milo?"
• "Lancia l'agente editore-capo"
• "Mostra lo stato di tutti i progetti"

⏱ Timeout: 2 minuti per risposta`);
    return;
  }

  // Queue for Claude Code
  const requestId = writeRequest(text, user);
  await sendTelegram('🧠 Elaboro con Claude Code...');

  // Wait for response
  const response = await waitForResponse(requestId);

  if (response) {
    await sendTelegram(response);
  } else {
    await sendTelegram(`⏱ Timeout - Claude Code non ha risposto in tempo.

Possibili cause:
• Nessuna sessione Claude Code attiva
• Richiesta troppo complessa

Riprova o avvia una sessione Claude Code.`);
  }
}

async function poll() {
  console.log('🌉 TELEGRAM-CLAUDE BRIDGE attivo!');
  console.log(`📁 Queue dir: ${QUEUE_DIR}`);
  console.log('⏳ In attesa di messaggi...');

  while (true) {
    try {
      const res = await api('getUpdates', { offset: lastUpdateId + 1, timeout: 30 });

      if (res.ok && res.result.length > 0) {
        for (const update of res.result) {
          lastUpdateId = update.update_id;
          const msg = update.message;
          if (!msg || !msg.text) continue;

          // Only respond to authorized chat
          if (msg.chat.id.toString() !== CHAT_ID) {
            console.log(`⚠️ Unauthorized: ${msg.chat.id}`);
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
