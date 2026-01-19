const https = require('https');

const TOKEN = '8528268093:AAGNZUcYBm8iMcn9D_oWr565rpxm9riNkBM';
let lastUpdateId = 0;

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

async function poll() {
  console.log('🤖 FRH-ONDE Bot attivo!');

  while (true) {
    try {
      const res = await api('getUpdates', { offset: lastUpdateId + 1, timeout: 30 });

      if (res.ok && res.result.length > 0) {
        for (const update of res.result) {
          lastUpdateId = update.update_id;
          const msg = update.message;
          if (!msg) continue;

          const chatId = msg.chat.id;
          const text = msg.text || '';
          const user = msg.from?.first_name || 'Unknown';

          console.log(`📨 ${user}: ${text}`);

          // Respond based on command
          let reply = '';
          const lower = text.toLowerCase();

          if (lower === '/start') {
            reply = '🟢 FRH-ONDE Bot attivo!\n\nComandi:\n• ping - test connessione\n• stato - dashboard libri\n• help - lista comandi';
          } else if (lower === 'ping') {
            reply = '🟢 Pong! Bot funzionante.';
          } else if (lower === 'help' || lower === '/help') {
            reply = '📚 COMANDI:\n\n• ping - test\n• stato - dashboard libri\n• help - questo messaggio\n\nScrivi qualsiasi cosa e rispondo!';
          } else if (lower.includes('stato')) {
            reply = '📊 DASHBOARD LIBRI:\n\n✅ milo-ai: 100% (8 cap)\n✅ milo-internet: 100% (10 cap)\n✅ salmo-23: 100%\n✅ piccole-rime: 100%';
          } else if (lower.includes('roadmap') || lower.includes('onde')) {
            reply = '🗺️ ROADMAP ONDE:\n\n1. MILO AI Book - immagini pronte\n2. PDF generation\n3. KDP upload\n4. Social automation\n\nVuoi dettagli su qualcosa?';
          } else {
            reply = `📝 Ricevuto: "${text}"\n\nNon ho un comando specifico per questo. Scrivi "help" per vedere cosa posso fare.`;
          }

          await api('sendMessage', { chat_id: chatId, text: reply });
          console.log(`✅ Risposto`);
        }
      }
    } catch (e) {
      console.error('Errore:', e.message);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

poll();
