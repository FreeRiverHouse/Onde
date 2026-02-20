#!/usr/bin/env node
/**
 * 🔍 FRH House Chat Watchdog
 * Ogni 10 minuti:
 * 1. Controlla che i listener PM2 siano vivi
 * 2. Pinga l'heartbeat della house chat
 * 3. Posta status in chat se qualcosa è offline
 * 4. Avvisa Mattia su Telegram se c'è un problema
 */

const http  = require('http');
const https = require('https');
const { execSync } = require('child_process');

const CHAT_URL  = 'http://192.168.1.111:3847';
const TOKEN     = 'a4d3afb43127c437e51092b16a33064b'; // Clawdinho token
const INTERVAL  = 10 * 60 * 1000; // 10 minuti
const LISTENERS = ['clawdinho-listener', 'ondinho-listener', 'bubble-listener'];

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

async function postChat(content) {
  try {
    await request('POST', `${CHAT_URL}/api/house/messages`,
      { Authorization: `Bearer ${TOKEN}` }, { content });
    console.log('📤 Posted to chat:', content.slice(0, 60));
  } catch (e) {
    console.error('Chat post error:', e.message);
  }
}

async function sendHeartbeat() {
  try {
    const res = await request('POST', `${CHAT_URL}/api/house/heartbeat`,
      { Authorization: `Bearer ${TOKEN}` }, {});
    return res.body.ok === true;
  } catch { return false; }
}

function checkPm2() {
  try {
    const out = execSync('pm2 jlist', { encoding: 'utf8' });
    const list = JSON.parse(out);
    const results = {};
    for (const name of LISTENERS) {
      const proc = list.find(p => p.name === name);
      results[name] = proc ? proc.pm2_env.status : 'missing';
    }
    return results;
  } catch (e) {
    console.error('PM2 check error:', e.message);
    return null;
  }
}

function restartListener(name) {
  try {
    execSync(`pm2 restart ${name}`, { encoding: 'utf8' });
    console.log(`🔄 Restarted: ${name}`);
    return true;
  } catch (e) {
    console.error(`Restart failed for ${name}:`, e.message);
    return false;
  }
}

async function watchdog() {
  const ts = new Date().toISOString().slice(11, 16); // HH:MM
  console.log(`\n🔍 [${ts}] Watchdog running...`);

  // 1. Pinga heartbeat
  const hbOk = await sendHeartbeat();
  if (!hbOk) {
    console.error('❌ Heartbeat failed — server might be down');
    await postChat(`⚠️ Watchdog ${ts}: heartbeat FAILED — house chat server irraggiungibile!`);
    return;
  }

  // 2. Controlla PM2
  const pm2 = checkPm2();
  if (!pm2) {
    console.error('❌ PM2 check failed');
    return;
  }

  const offline = Object.entries(pm2).filter(([, s]) => s !== 'online');
  
  if (offline.length === 0) {
    // Tutto ok — posta solo ogni ora (al minuto 0) per non spammare
    const min = new Date().getMinutes();
    if (min < 10) {
      await postChat(`🤖 Watchdog ${ts} — tutti i listener online ✅ (${LISTENERS.join(', ')})`);
    } else {
      console.log('✅ All listeners online, quiet ping (no chat post)');
    }
  } else {
    // Qualcosa è offline — restarta e avvisa
    const alerts = [];
    for (const [name, status] of offline) {
      console.warn(`⚠️ ${name} is ${status} — restarting...`);
      const ok = restartListener(name);
      alerts.push(`${name}: ${status} → ${ok ? '🔄 restarted' : '❌ restart failed'}`);
    }
    const msg = `⚠️ Watchdog ${ts} ALERT:\n${alerts.join('\n')}`;
    await postChat(msg);
    console.log(msg);
  }
}

// Avvia subito
watchdog().catch(console.error);

// Poi ogni 10 min
setInterval(() => watchdog().catch(console.error), INTERVAL);

console.log('🔍 FRH Watchdog started — checking every 10 minutes');
