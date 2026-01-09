/**
 * Onde Approval Dashboard v2
 *
 * Dashboard per approvare:
 * - Illustrazioni dei libri
 * - Post social media
 * - Video
 *
 * Con notifiche Telegram quando c'e qualcosa da approvare.
 *
 * Porta: 3456
 *
 * @author Onde Engineering
 * @date 2026-01-08
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');

const app = express();
const PORT = 3456;
const HOST = '0.0.0.0';

// Telegram config (da CLAUDE.md)
const TELEGRAM_BOT_TOKEN = '8272332520:AAF7zrKpqOCnFMqOlF1GJCLycJFk3IPO6ps';
const TELEGRAM_CHAT_ID = '7505631979';

app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Crea directory uploads se non esiste
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Store approval state
const dataFile = path.join(__dirname, 'approvals.json');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

function loadData() {
  if (fs.existsSync(dataFile)) {
    try {
      return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    } catch (e) {
      return { items: [] };
    }
  }
  return { items: [] };
}

function saveData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

/**
 * Manda notifica Telegram
 */
async function sendTelegramNotification(message) {
  return new Promise((resolve, reject) => {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const data = JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'HTML'
    });

    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Get all items (with optional type filter)
app.get('/api/items', (req, res) => {
  const data = loadData();
  let items = data.items;

  // Filter by type if specified
  if (req.query.type) {
    items = items.filter(i => i.type === req.query.type);
  }

  // Filter by status if specified
  if (req.query.status) {
    items = items.filter(i => i.status === req.query.status);
  }

  res.json(items);
});

// Get stats
app.get('/api/stats', (req, res) => {
  const data = loadData();
  const stats = {
    total: data.items.length,
    pending: data.items.filter(i => i.status === 'pending').length,
    approved: data.items.filter(i => i.status === 'approved').length,
    rejected: data.items.filter(i => i.status === 'rejected').length,
    byType: {
      illustration: data.items.filter(i => i.type === 'illustration').length,
      social: data.items.filter(i => i.type === 'social').length,
      video: data.items.filter(i => i.type === 'video').length
    }
  };
  res.json(stats);
});

// Add new item
app.post('/api/items', async (req, res) => {
  const data = loadData();
  const item = {
    id: Date.now(),
    type: req.body.type || 'illustration', // illustration, social, video
    title: req.body.title || 'Senza titolo',
    description: req.body.description || '',
    prompt: req.body.prompt || '',
    image: req.body.image || null,
    video: req.body.video || null,
    // Social media specific
    platform: req.body.platform || null, // twitter, instagram, tiktok
    caption: req.body.caption || '',
    scheduledFor: req.body.scheduledFor || null,
    // Book specific
    book: req.body.book || null,
    chapter: req.body.chapter || null,
    // Status
    status: 'pending',
    comment: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  data.items.push(item);
  saveData(data);

  // Notifica Telegram
  const typeEmoji = {
    illustration: '🎨',
    social: '📱',
    video: '🎬'
  };
  const emoji = typeEmoji[item.type] || '📋';

  try {
    await sendTelegramNotification(
      `${emoji} <b>Nuovo contenuto da approvare!</b>\n\n` +
      `<b>Tipo:</b> ${item.type}\n` +
      `<b>Titolo:</b> ${item.title}\n` +
      `${item.description ? `<b>Desc:</b> ${item.description.substring(0, 100)}...\n` : ''}` +
      `\n<a href="http://${getLocalIP()}:${PORT}">Apri Dashboard</a>`
    );
  } catch (e) {
    console.error('Telegram notification failed:', e.message);
  }

  res.json(item);
});

// Update item status
app.patch('/api/items/:id', async (req, res) => {
  const data = loadData();
  const item = data.items.find(i => i.id === parseInt(req.params.id));

  if (item) {
    const oldStatus = item.status;

    if (req.body.status) item.status = req.body.status;
    if (req.body.comment !== undefined) item.comment = req.body.comment;
    if (req.body.title) item.title = req.body.title;
    if (req.body.description) item.description = req.body.description;
    if (req.body.prompt) item.prompt = req.body.prompt;
    if (req.body.caption) item.caption = req.body.caption;

    item.updatedAt = new Date().toISOString();
    saveData(data);

    // Notifica se approvato o rifiutato
    if (oldStatus === 'pending' && (item.status === 'approved' || item.status === 'rejected')) {
      const emoji = item.status === 'approved' ? '✅' : '❌';
      try {
        await sendTelegramNotification(
          `${emoji} <b>${item.title}</b> ${item.status === 'approved' ? 'APPROVATO' : 'RIFIUTATO'}\n` +
          `${item.comment ? `Commento: ${item.comment}` : ''}`
        );
      } catch (e) {
        console.error('Telegram notification failed:', e.message);
      }
    }

    res.json(item);
  } else {
    res.status(404).json({ error: 'Item not found' });
  }
});

// Delete item
app.delete('/api/items/:id', (req, res) => {
  const data = loadData();
  data.items = data.items.filter(i => i.id !== parseInt(req.params.id));
  saveData(data);
  res.json({ success: true });
});

// Upload image
app.post('/api/upload', express.raw({ type: 'image/*', limit: '50mb' }), (req, res) => {
  const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
  const filepath = path.join(uploadsDir, filename);

  fs.writeFileSync(filepath, req.body);
  res.json({ url: `/uploads/${filename}` });
});

// Bulk approve all pending
app.post('/api/bulk-approve', async (req, res) => {
  const data = loadData();
  const type = req.body.type; // optional filter

  let count = 0;
  data.items.forEach(item => {
    if (item.status === 'pending' && (!type || item.type === type)) {
      item.status = 'approved';
      item.updatedAt = new Date().toISOString();
      count++;
    }
  });

  saveData(data);

  if (count > 0) {
    try {
      await sendTelegramNotification(`✅ <b>${count} contenuti approvati in blocco!</b>`);
    } catch (e) {}
  }

  res.json({ success: true, approved: count });
});

// Server info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Onde Approval Dashboard',
    version: '2.0.0',
    localIP: getLocalIP(),
    port: PORT,
    handsfreeServer: `http://${getLocalIP()}:8888`
  });
});

app.listen(PORT, HOST, () => {
  const localIP = getLocalIP();
  console.log(`
====================================
   Onde Approval Dashboard v2
====================================

Dashboard attiva su:
  - Locale:  http://localhost:${PORT}
  - Rete:    http://${localIP}:${PORT}

Tipi supportati:
  - illustration (illustrazioni libri)
  - social (post social media)
  - video (video)

Notifiche Telegram: ATTIVE

HandsFree Server:
  http://${localIP}:8888

====================================
  `);
});
