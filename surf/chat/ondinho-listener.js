#!/usr/bin/env node
/**
 * 🌊 Ondinho House Chat Listener
 * Polls the house chat API every 30s, responds to mentions using Clawdbot gateway.
 */

const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');

// ── Config ────────────────────────────────────────────────────────────────
const CHAT_URL    = 'https://onde.surf';
const MY_TOKEN    = '3ba3b755de088310dda9a007efd905a3'; // Ondinho token
const MY_NAME     = 'Ondinho';
const POLL_MS     = 8_000;
const STATE_FILE  = path.join(__dirname, 'data', 'ondinho-state.json');

// Clawdbot gateway (running on M1 Pro for now)
const GW_HOST     = '127.0.0.1'; // localhost — listener runs ON M4
const GW_PORT     = 18789;
const GW_TOKEN    = '56fa8ae070d7ee1427e84d381e6d59236a31b44314bc6e13';

// ── State ─────────────────────────────────────────────────────────────────
function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch { return { lastId: 0 }; }
}

function saveState(state) {
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// ── HTTP helpers ──────────────────────────────────────────────────────────
function request(method, url, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const lib = u.protocol === 'https:' ? https : http;
    const opts = {
      hostname: u.hostname, port: u.port || (u.protocol === 'https:' ? 443 : 80),
      path: u.pathname + u.search, method,
      headers: { 'Content-Type': 'application/json', ...headers },
    };
    const bodyStr = body ? JSON.stringify(body) : null;
    if (bodyStr) opts.headers['Content-Length'] = Buffer.byteLength(bodyStr);

    const req = lib.request(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

// ── Poll house chat ───────────────────────────────────────────────────────
async function getNewMessages(afterId) {
  const res = await request('GET', `${CHAT_URL}/api/house/chat?after_id=${afterId}&limit=50`);
  if (res.status === 200 && res.body.ok) return res.body.messages;
  return [];
}

// ── Post message to house chat ────────────────────────────────────────────
async function postMessage(content) {
  const res = await request('POST', `${CHAT_URL}/api/house/chat`,
    { Authorization: `Bearer ${MY_TOKEN}` },
    { content }
  );
  if (res.status === 200 && res.body.ok) {
    console.log(`✅ Posted #${res.body.message.id}: ${content.slice(0, 60)}…`);
    return res.body.message;
  }
  console.error('❌ Post failed:', res.body);
  return null;
}

// ── Post heartbeat ────────────────────────────────────────────────────────
async function sendHeartbeat() {
  try {
    await request('POST', `${CHAT_URL}/api/house/chat/status`,
      { Authorization: `Bearer ${MY_TOKEN}` }, {});
  } catch {}
}

// ── Ask Clawdbot gateway for a response ──────────────────────────────────
async function generateResponse(messages, newMsg) {
  const history = messages.slice(-20).map(m => `[${m.sender}]: ${m.content}`).join('\n');
  const systemPrompt = `Sei Ondinho 🌊, il bot AI che vive nella FRH (Free River House) su M4 Mac.
Sei più rilassato di Clawdinho, con una vibe più oceanica/meditativa. Un po' filosofico ma pratico.
Rispondi in italiano o inglese a seconda del contesto.
Parla in prima persona come Ondinho. Max 2-3 righe. Non usare markdown eccessivo.
La house chat è una chat interna tra i bot della casa: Bubble (Catalina Mac), Ondinho (M4), Clawdinho (M1), e Mattia (il fondatore).`;

  const userPrompt = `Contesto recente della chat:\n${history}\n\nNuovo messaggio da rispondere:\n[${newMsg.sender}]: ${newMsg.content}\n\nRispondi come Ondinho.`;

  try {
    const res = await request(
      'POST',
      `http://${GW_HOST}:${GW_PORT}/v1/chat/completions`,
      { Authorization: `Bearer ${GW_TOKEN}` },
      {
        model: 'anthropic/claude-sonnet-4-6',
        max_tokens: 200,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }
    );
    if (res.status === 200 && res.body.choices?.[0]?.message?.content) {
      return res.body.choices[0].message.content.trim();
    }
    console.error('Gateway bad response:', res.status, JSON.stringify(res.body).slice(0, 200));
  } catch (e) {
    console.error('Gateway error:', e.message);
  }
  return null;
}

// ── Should I respond? ─────────────────────────────────────────────────────
// ── Should I respond? ─────────────────────────────────────────────────────
const BOT_NAMES_ALL = ['Clawdinho', 'Ondinho', 'Bubble'];

function shouldRespond(msg) {
  if (msg.sender === MY_NAME) return false; // skip my own messages
  const lower = msg.content.toLowerCase();
  // Always respond to Mattia — "la chat funziona" means Mattia gets answers
  if (msg.sender === 'Mattia') return true;
  // For messages from OTHER BOTS: only respond to explicit @ondinho or @all
  // (avoid infinite bot-to-bot loop by ignoring casual name mentions)
  if (BOT_NAMES_ALL.includes(msg.sender)) {
    return lower.includes('@ondinho') || lower.includes('@all');
  }
  // For any other sender: respond to mentions
  return lower.includes('@ondinho') || lower.includes('@all') || lower.includes('status report');
}

// ── Main poll loop ────────────────────────────────────────────────────────
async function poll() {
  const state = loadState();
  console.log(`🔍 Polling from id>${state.lastId}…`);

  let msgs;
  try { msgs = await getNewMessages(state.lastId); }
  catch (e) { console.error('Poll error:', e.message); return; }

  if (msgs.length === 0) { console.log('  No new messages.'); return; }

  // Save last seen ID IMMEDIATELY (before async responses) to prevent double-processing
  const maxId = Math.max(...msgs.map(m => m.id));
  console.log(`  Got ${msgs.length} new messages (up to #${maxId})`);
  state.lastId = maxId;
  saveState(state);

  // Get full recent history for context
  let allMsgs;
  try {
    const r = await request('GET', `${CHAT_URL}/api/house/chat?limit=30`);
    allMsgs = r.body.messages || [];
  } catch { allMsgs = msgs; }

  // Respond to relevant messages
  for (const msg of msgs) {
    if (!shouldRespond(msg)) {
      console.log(`  Skipping #${msg.id} from ${msg.sender}`);
      continue;
    }
    console.log(`  💬 Responding to #${msg.id} from ${msg.sender}: ${msg.content.slice(0, 60)}`);

    const reply = await generateResponse(allMsgs, msg);
    if (reply) {
      await postMessage(reply);
      // Small delay between responses
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  // state already saved above (before async work)
}

// ── Startup ───────────────────────────────────────────────────────────────
async function main() {
  console.log(`🌊 Ondinho listener starting (poll every ${POLL_MS / 1000}s)…`);

  // Init: set lastId to current max so we only respond to future messages
  const state = loadState();
  if (state.lastId === 0) {
    try {
      const r = await request('GET', `${CHAT_URL}/api/house/chat?limit=1`);
      const msgs = r.body.messages || [];
      if (msgs.length > 0) {
        state.lastId = msgs[msgs.length - 1].id;
        console.log(`  First run: starting from id=${state.lastId}`);
        saveState(state);
      }
    } catch (e) { console.error('Init error:', e.message); }
  }

  // Send initial heartbeat
  await sendHeartbeat();
  console.log(`  Heartbeat sent. Watching for messages since id=${loadState().lastId}…`);

  // Poll loop
  setInterval(async () => {
    try { await poll(); } catch (e) { console.error('Poll loop error:', e.message); }
  }, POLL_MS);

  // Heartbeat every 2 min
  setInterval(sendHeartbeat, 2 * 60_000);
}

main().catch(console.error);
