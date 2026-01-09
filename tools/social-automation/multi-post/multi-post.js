#!/usr/bin/env node

/**
 * Multi-Platform Auto-Post System
 *
 * Sistema che legge approvazioni da Telegram e posta automaticamente su:
 * - X (Twitter) - via API v2
 * - Instagram - via Graph API
 * - TikTok - via Content Posting API
 * - YouTube - (futuro)
 *
 * Workflow:
 * 1. Contenuto viene aggiunto alla coda (approval dashboard o script)
 * 2. Notifica Telegram con bottoni approva/rifiuta
 * 3. Mattia approva da iPhone
 * 4. Sistema posta automaticamente su tutte le piattaforme configurate
 * 5. Log del risultato
 *
 * Task: social-auto-001
 * Data: 2026-01-09
 *
 * @author Onde Engineering
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

// Load config
const CONFIG = require('./config.json');

// Paths
const QUEUE_FILE = path.join(__dirname, 'queue.json');
const LOG_DIR = path.join(__dirname, 'logs');
const MEDIA_DIR = path.join(__dirname, 'media');

// Ensure directories exist
[LOG_DIR, MEDIA_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// ============================================================================
// LOGGING
// ============================================================================

function log(level, message, data = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...data
  };

  console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`, data);

  // Append to daily log file
  const logFile = path.join(LOG_DIR, `${timestamp.split('T')[0]}.log`);
  fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
}

// ============================================================================
// QUEUE MANAGEMENT
// ============================================================================

function loadQueue() {
  if (fs.existsSync(QUEUE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
    } catch (e) {
      return { items: [] };
    }
  }
  return { items: [] };
}

function saveQueue(queue) {
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));
}

function addToQueue(item) {
  const queue = loadQueue();
  const newItem = {
    id: Date.now(),
    status: 'pending_approval',
    createdAt: new Date().toISOString(),
    platforms: item.platforms || ['x'],
    xAccount: item.xAccount || 'onde',
    text: item.text || '',
    mediaUrl: item.mediaUrl || null,
    mediaPath: item.mediaPath || null,
    mediaType: item.mediaType || null, // 'image' or 'video'
    caption: item.caption || item.text,
    telegramMessageId: null,
    results: {},
    ...item
  };

  queue.items.push(newItem);
  saveQueue(queue);
  log('info', 'Item added to queue', { id: newItem.id });
  return newItem;
}

function updateQueueItem(id, updates) {
  const queue = loadQueue();
  const index = queue.items.findIndex(i => i.id === id);
  if (index === -1) return null;

  queue.items[index] = {
    ...queue.items[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  saveQueue(queue);
  return queue.items[index];
}

function getPendingApprovals() {
  const queue = loadQueue();
  return queue.items.filter(i => i.status === 'pending_approval');
}

function getApprovedItems() {
  const queue = loadQueue();
  return queue.items.filter(i => i.status === 'approved');
}

// ============================================================================
// TELEGRAM BOT
// ============================================================================

class TelegramBot {
  constructor(token, chatId) {
    this.token = token;
    this.chatId = chatId;
    this.baseUrl = `https://api.telegram.org/bot${token}`;
    this.lastUpdateId = 0;
  }

  async request(method, params = {}) {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify(params);
      const options = {
        hostname: 'api.telegram.org',
        path: `/bot${this.token}/${method}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(body);
            if (json.ok) {
              resolve(json.result);
            } else {
              reject(new Error(json.description || 'Telegram API error'));
            }
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }

  async sendMessage(text, options = {}) {
    return this.request('sendMessage', {
      chat_id: this.chatId,
      text,
      parse_mode: 'HTML',
      ...options
    });
  }

  async sendPhoto(photoUrl, caption, options = {}) {
    return this.request('sendPhoto', {
      chat_id: this.chatId,
      photo: photoUrl,
      caption,
      parse_mode: 'HTML',
      ...options
    });
  }

  async sendDocument(documentPath, caption) {
    // Per file locali, usa multipart/form-data
    // Per ora supportiamo solo URL
    return this.request('sendDocument', {
      chat_id: this.chatId,
      document: documentPath,
      caption,
      parse_mode: 'HTML'
    });
  }

  async editMessageReplyMarkup(messageId, replyMarkup = null) {
    return this.request('editMessageReplyMarkup', {
      chat_id: this.chatId,
      message_id: messageId,
      reply_markup: replyMarkup
    });
  }

  async getUpdates(offset = 0) {
    return this.request('getUpdates', {
      offset,
      timeout: 30,
      allowed_updates: ['message', 'callback_query']
    });
  }

  async answerCallbackQuery(callbackQueryId, text = '') {
    return this.request('answerCallbackQuery', {
      callback_query_id: callbackQueryId,
      text
    });
  }

  /**
   * Invia messaggio con bottoni per approvazione
   */
  async sendApprovalRequest(item) {
    const platforms = item.platforms.join(', ').toUpperCase();
    const preview = item.text.substring(0, 200) + (item.text.length > 200 ? '...' : '');

    const message = `
<b>Nuovo post da approvare</b>

<b>Piattaforme:</b> ${platforms}
<b>Account X:</b> @${CONFIG.platforms.x.accounts[item.xAccount]?.name || item.xAccount}
${item.mediaType ? `<b>Media:</b> ${item.mediaType}` : ''}

<b>Testo:</b>
<code>${preview}</code>
`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: 'Approva', callback_data: `approve_${item.id}` },
          { text: 'Rifiuta', callback_data: `reject_${item.id}` }
        ],
        [
          { text: 'Modifica', callback_data: `edit_${item.id}` },
          { text: 'Anteprima', callback_data: `preview_${item.id}` }
        ]
      ]
    };

    // Se c'e' un'immagine, invia come foto
    if (item.mediaType === 'image' && item.mediaUrl) {
      const result = await this.sendPhoto(item.mediaUrl, message, { reply_markup: keyboard });
      return result;
    }

    const result = await this.sendMessage(message, { reply_markup: keyboard });
    return result;
  }
}

// ============================================================================
// X (TWITTER) API
// ============================================================================

class XPoster {
  constructor(account) {
    const accountConfig = CONFIG.platforms.x.accounts[account];
    if (!accountConfig) {
      throw new Error(`X account "${account}" not found in config`);
    }

    const prefix = accountConfig.envPrefix;
    this.apiKey = process.env[`${prefix}_API_KEY`];
    this.apiSecret = process.env[`${prefix}_API_SECRET`];
    this.accessToken = process.env[`${prefix}_ACCESS_TOKEN`];
    this.accessSecret = process.env[`${prefix}_ACCESS_SECRET`];
    this.accountName = accountConfig.name;
  }

  /**
   * Genera OAuth 1.0a signature per Twitter API v2
   */
  generateOAuthSignature(method, url, params) {
    const crypto = require('crypto');
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = crypto.randomBytes(16).toString('hex');

    const oauthParams = {
      oauth_consumer_key: this.apiKey,
      oauth_token: this.accessToken,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: timestamp,
      oauth_nonce: nonce,
      oauth_version: '1.0'
    };

    // Combine and sort all parameters
    const allParams = { ...oauthParams, ...params };
    const sortedParams = Object.keys(allParams).sort()
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(allParams[key])}`)
      .join('&');

    // Create signature base string
    const baseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`;

    // Create signing key
    const signingKey = `${encodeURIComponent(this.apiSecret)}&${encodeURIComponent(this.accessSecret)}`;

    // Generate signature
    const signature = crypto.createHmac('sha1', signingKey)
      .update(baseString)
      .digest('base64');

    oauthParams.oauth_signature = signature;

    // Build Authorization header
    const authHeader = 'OAuth ' + Object.keys(oauthParams)
      .sort()
      .map(key => `${encodeURIComponent(key)}="${encodeURIComponent(oauthParams[key])}"`)
      .join(', ');

    return authHeader;
  }

  async post(text) {
    if (!this.apiKey || !this.accessToken) {
      throw new Error(`X credentials not configured for ${this.accountName}`);
    }

    const url = 'https://api.twitter.com/2/tweets';
    const body = JSON.stringify({ text });
    const authHeader = this.generateOAuthSignature('POST', url, {});

    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.twitter.com',
        path: '/2/tweets',
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            if (json.data) {
              resolve({
                success: true,
                tweetId: json.data.id,
                url: `https://x.com/${this.accountName}/status/${json.data.id}`
              });
            } else if (json.errors) {
              reject(new Error(json.errors[0]?.message || 'X API error'));
            } else {
              reject(new Error(`Unexpected response: ${data}`));
            }
          } catch (e) {
            reject(new Error(`Failed to parse X response: ${data}`));
          }
        });
      });

      req.on('error', reject);
      req.write(body);
      req.end();
    });
  }

  async postWithMedia(text, mediaPath) {
    // TODO: Implementare upload media su X
    // Per ora, posta solo testo
    log('warn', 'X media upload not yet implemented, posting text only');
    return this.post(text);
  }
}

// ============================================================================
// INSTAGRAM API (wrapper per instagram-poster.js esistente)
// ============================================================================

class InstagramPoster {
  constructor() {
    this.accountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
    this.accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  }

  async post(caption, imageUrl) {
    if (!this.accountId || !this.accessToken) {
      throw new Error('Instagram credentials not configured');
    }

    // Usa il modulo instagram-poster esistente
    const instagramPoster = require('../instagram/instagram-poster.js');
    return instagramPoster.postImage(imageUrl, caption);
  }

  async postVideo(caption, videoUrl) {
    if (!this.accountId || !this.accessToken) {
      throw new Error('Instagram credentials not configured');
    }

    const instagramPoster = require('../instagram/instagram-poster.js');
    return instagramPoster.postVideo(videoUrl, caption);
  }
}

// ============================================================================
// TIKTOK API (wrapper per post-tiktok.js esistente)
// ============================================================================

class TikTokPoster {
  constructor() {
    this.accessToken = process.env.TIKTOK_ACCESS_TOKEN;
  }

  async postVideo(videoPath, title, privacy = 'SELF_ONLY') {
    if (!this.accessToken) {
      throw new Error('TikTok access token not configured');
    }

    const tiktokPoster = require('../tiktok/post-tiktok.js');
    return tiktokPoster.postVideo(videoPath, { title, privacy });
  }
}

// ============================================================================
// MULTI-PLATFORM POSTER
// ============================================================================

class MultiPoster {
  constructor() {
    this.telegram = new TelegramBot(CONFIG.telegram.botToken, CONFIG.telegram.chatId);
    this.instagram = new InstagramPoster();
    this.tiktok = new TikTokPoster();
  }

  /**
   * Posta su tutte le piattaforme configurate
   */
  async postToAllPlatforms(item) {
    const results = {};

    for (const platform of item.platforms) {
      try {
        switch (platform.toLowerCase()) {
          case 'x':
          case 'twitter':
            const xPoster = new XPoster(item.xAccount || 'onde');
            if (item.mediaPath && item.mediaType === 'image') {
              results.x = await xPoster.postWithMedia(item.text, item.mediaPath);
            } else {
              results.x = await xPoster.post(item.text);
            }
            log('info', 'Posted to X', { account: item.xAccount, result: results.x });
            break;

          case 'instagram':
          case 'ig':
            if (item.mediaUrl) {
              if (item.mediaType === 'video') {
                results.instagram = await this.instagram.postVideo(item.caption || item.text, item.mediaUrl);
              } else {
                results.instagram = await this.instagram.post(item.caption || item.text, item.mediaUrl);
              }
              log('info', 'Posted to Instagram', { result: results.instagram });
            } else {
              results.instagram = { success: false, error: 'Instagram requires media URL' };
            }
            break;

          case 'tiktok':
            if (item.mediaPath && item.mediaType === 'video') {
              results.tiktok = await this.tiktok.postVideo(
                item.mediaPath,
                item.caption || item.text,
                item.tiktokPrivacy || 'PUBLIC_TO_EVERYONE'
              );
              log('info', 'Posted to TikTok', { result: results.tiktok });
            } else {
              results.tiktok = { success: false, error: 'TikTok requires video file path' };
            }
            break;

          case 'youtube':
            results.youtube = { success: false, error: 'YouTube not yet implemented' };
            break;

          default:
            results[platform] = { success: false, error: `Unknown platform: ${platform}` };
        }
      } catch (error) {
        results[platform] = { success: false, error: error.message };
        log('error', `Failed to post to ${platform}`, { error: error.message });
      }
    }

    return results;
  }

  /**
   * Invia richiesta approvazione su Telegram
   */
  async requestApproval(item) {
    const result = await this.telegram.sendApprovalRequest(item);
    updateQueueItem(item.id, { telegramMessageId: result.message_id });
    return result;
  }

  /**
   * Processa approvazione da Telegram
   */
  async processApproval(itemId) {
    const queue = loadQueue();
    const item = queue.items.find(i => i.id === itemId);

    if (!item) {
      log('error', 'Item not found in queue', { itemId });
      return null;
    }

    // Aggiorna stato
    updateQueueItem(itemId, { status: 'posting' });

    // Posta su tutte le piattaforme
    const results = await this.postToAllPlatforms(item);

    // Aggiorna con risultati
    const allSuccessful = Object.values(results).every(r => r.success);
    updateQueueItem(itemId, {
      status: allSuccessful ? 'posted' : 'partial_failure',
      results,
      postedAt: new Date().toISOString()
    });

    // Notifica risultato su Telegram
    const successPlatforms = Object.entries(results)
      .filter(([_, r]) => r.success)
      .map(([p]) => p.toUpperCase());

    const failedPlatforms = Object.entries(results)
      .filter(([_, r]) => !r.success)
      .map(([p, r]) => `${p.toUpperCase()}: ${r.error}`);

    let message = '';
    if (successPlatforms.length > 0) {
      message += `Pubblicato su: ${successPlatforms.join(', ')}\n`;
    }
    if (failedPlatforms.length > 0) {
      message += `\nErrori:\n${failedPlatforms.join('\n')}`;
    }

    await this.telegram.sendMessage(message);

    // Rimuovi bottoni dal messaggio originale
    if (item.telegramMessageId) {
      try {
        await this.telegram.editMessageReplyMarkup(item.telegramMessageId, null);
      } catch (e) {
        // Ignora errori se messaggio troppo vecchio
      }
    }

    return results;
  }

  /**
   * Avvia polling Telegram per ricevere approvazioni
   */
  async startPolling() {
    log('info', 'Starting Telegram polling...');
    let lastUpdateId = 0;

    while (true) {
      try {
        const updates = await this.telegram.getUpdates(lastUpdateId + 1);

        for (const update of updates) {
          lastUpdateId = update.update_id;

          // Handle callback queries (bottoni inline)
          if (update.callback_query) {
            const data = update.callback_query.data;
            const [action, itemId] = data.split('_');

            await this.telegram.answerCallbackQuery(update.callback_query.id);

            if (action === 'approve') {
              log('info', 'Approval received', { itemId });
              await this.processApproval(parseInt(itemId));
            } else if (action === 'reject') {
              updateQueueItem(parseInt(itemId), { status: 'rejected' });
              await this.telegram.sendMessage('Post rifiutato');
              // Rimuovi bottoni
              const item = loadQueue().items.find(i => i.id === parseInt(itemId));
              if (item?.telegramMessageId) {
                await this.telegram.editMessageReplyMarkup(item.telegramMessageId, null);
              }
            } else if (action === 'preview') {
              const item = loadQueue().items.find(i => i.id === parseInt(itemId));
              if (item) {
                await this.telegram.sendMessage(`<b>Anteprima completa:</b>\n\n${item.text}`);
              }
            } else if (action === 'edit') {
              await this.telegram.sendMessage(
                'Per modificare, rispondi a questo messaggio con il nuovo testo.\n' +
                `ID: ${itemId}`
              );
            }
          }

          // Handle text messages (for editing)
          if (update.message?.reply_to_message && update.message.text) {
            // TODO: Handle edit replies
          }
        }
      } catch (error) {
        log('error', 'Polling error', { error: error.message });
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  /**
   * Processa tutti gli item approvati nella coda
   */
  async processApprovedQueue() {
    const approved = getApprovedItems();

    for (const item of approved) {
      log('info', 'Processing approved item', { id: item.id });
      await this.processApproval(item.id);
    }
  }
}

// ============================================================================
// CLI
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const poster = new MultiPoster();

  switch (command) {
    case 'add': {
      // Aggiungi item alla coda
      const text = args[1];
      const platforms = args.includes('--platforms')
        ? args[args.indexOf('--platforms') + 1].split(',')
        : ['x'];
      const xAccount = args.includes('--account')
        ? args[args.indexOf('--account') + 1]
        : 'onde';
      const mediaUrl = args.includes('--media')
        ? args[args.indexOf('--media') + 1]
        : null;

      if (!text) {
        console.error('Usage: node multi-post.js add "Testo" [--platforms x,ig,tiktok] [--account onde] [--media URL]');
        process.exit(1);
      }

      const item = addToQueue({
        text,
        platforms,
        xAccount,
        mediaUrl,
        mediaType: mediaUrl ? (mediaUrl.match(/\.(mp4|mov|webm)$/i) ? 'video' : 'image') : null
      });

      await poster.requestApproval(item);
      console.log(`Item ${item.id} aggiunto alla coda e inviato per approvazione`);
      break;
    }

    case 'poll':
      // Avvia polling Telegram
      await poster.startPolling();
      break;

    case 'process':
      // Processa coda approvati
      await poster.processApprovedQueue();
      break;

    case 'status': {
      // Mostra stato coda
      const queue = loadQueue();
      const pending = queue.items.filter(i => i.status === 'pending_approval');
      const approved = queue.items.filter(i => i.status === 'approved');
      const posted = queue.items.filter(i => i.status === 'posted');

      console.log(`
Multi-Post Queue Status
=======================

Pending approval: ${pending.length}
Approved:         ${approved.length}
Posted:           ${posted.length}
Total:            ${queue.items.length}
`);

      if (pending.length > 0) {
        console.log('Pending items:');
        pending.forEach(i => console.log(`  - [${i.id}] ${i.text.substring(0, 50)}...`));
      }
      break;
    }

    case 'test': {
      // Test connessione Telegram
      console.log('Testing Telegram connection...');
      try {
        await poster.telegram.sendMessage('Test Multi-Post System');
        console.log('Telegram test successful!');
      } catch (e) {
        console.error('Telegram test failed:', e.message);
      }
      break;
    }

    default:
      console.log(`
Multi-Platform Auto-Post System - Onde Publishing
==================================================

Comandi:

  add "testo"         Aggiungi post alla coda
    --platforms       Piattaforme (x,ig,tiktok) [default: x]
    --account         Account X (onde,frh,magmatic) [default: onde]
    --media           URL media (immagine o video)

  poll                Avvia polling Telegram per approvazioni
  process             Processa coda approvati
  status              Mostra stato coda
  test                Test connessione Telegram

Esempi:

  node multi-post.js add "Nuovo libro!" --platforms x,ig --account onde
  node multi-post.js add "Video ninna nanna" --platforms x,tiktok --media /path/video.mp4
  node multi-post.js poll
  node multi-post.js status

Configurazione:
  - config.json per piattaforme e account
  - .env per credenziali API
      `);
  }
}

// Export for use as module
module.exports = {
  MultiPoster,
  TelegramBot,
  XPoster,
  InstagramPoster,
  TikTokPoster,
  addToQueue,
  loadQueue,
  updateQueueItem,
  getPendingApprovals,
  getApprovedItems
};

// Run CLI if executed directly
if (require.main === module) {
  main().catch(console.error);
}
