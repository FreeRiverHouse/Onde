#!/usr/bin/env node
/**
 * ONDE BOT - Telegram Bot Bidirezionale
 *
 * Ascolta messaggi da Telegram, risponde, gestisce libri e immagini.
 * Funziona 24/7 in background.
 */

import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// ============================================================================
// CONFIGURATION
// ============================================================================

const TOKEN = '8272332520:AAF7zrKpqOCnFMqOlF1GJCLycJFk3IPO6ps';
const AUTHORIZED_CHAT_ID = '7505631979';
const POLL_TIMEOUT = 30; // seconds for long polling
const ONDE_ROOT = '/Users/mattia/Projects/Onde';
const BOOKS_DIR = path.join(ONDE_ROOT, 'books');

let lastUpdateId = 0;

// ============================================================================
// TELEGRAM API HELPERS
// ============================================================================

function telegramRequest(method: string, params: Record<string, any> = {}): Promise<any> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(params);
    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${TOKEN}/${method}`,
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
          const result = JSON.parse(body);
          if (result.ok) {
            resolve(result.result);
          } else {
            reject(new Error(result.description || 'Telegram API error'));
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

async function sendMessage(chatId: string, text: string): Promise<void> {
  await telegramRequest('sendMessage', {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML'
  });
}

async function sendPhoto(chatId: string, photoPath: string, caption?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const boundary = '----FormBoundary' + Math.random().toString(36);
    const photoBuffer = fs.readFileSync(photoPath);
    const filename = path.basename(photoPath);

    let body = '';
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="chat_id"\r\n\r\n${chatId}\r\n`;

    if (caption) {
      body += `--${boundary}\r\n`;
      body += `Content-Disposition: form-data; name="caption"\r\n\r\n${caption}\r\n`;
    }

    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="photo"; filename="${filename}"\r\n`;
    body += `Content-Type: image/jpeg\r\n\r\n`;

    const bodyStart = Buffer.from(body, 'utf8');
    const bodyEnd = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8');
    const fullBody = Buffer.concat([bodyStart, photoBuffer, bodyEnd]);

    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${TOKEN}/sendPhoto`,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': fullBody.length
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve());
    });

    req.on('error', reject);
    req.write(fullBody);
    req.end();
  });
}

// ============================================================================
// BOOK MANAGEMENT
// ============================================================================

interface BookInfo {
  key: string;
  folder: string;
  title: string;
  chapters: number;
}

const books: BookInfo[] = [
  { key: 'milo-ai', folder: 'milo', title: 'MILO: AI Explained to Children', chapters: 8 },
  { key: 'milo-internet', folder: 'milo', title: 'MILO: Come Funziona Internet', chapters: 10 },
  { key: 'salmo', folder: 'salmo-23-bambini', title: 'Il Salmo 23 per Bambini', chapters: 6 },
  { key: 'piccole-rime', folder: 'piccole-rime', title: 'Piccole Rime', chapters: 10 }
];

function getBookStatus(book: BookInfo, prefix: string = ''): { cover: boolean; chapters: number[]; total: number } {
  const imagesDir = path.join(BOOKS_DIR, book.folder, 'images');
  if (!fs.existsSync(imagesDir)) {
    return { cover: false, chapters: [], total: book.chapters };
  }

  const files = fs.readdirSync(imagesDir);
  const pattern = prefix || book.key;

  const hasCover = files.some(f => f.toLowerCase().includes(`${pattern}-cover`) || f.includes('cover'));
  const chapters: number[] = [];

  for (let i = 1; i <= book.chapters; i++) {
    const padded = i.toString().padStart(2, '0');
    if (files.some(f => f.includes(`${pattern}-ch${padded}`) || f.includes(`ch${i}`))) {
      chapters.push(i);
    }
  }

  return { cover: hasCover, chapters, total: book.chapters };
}

// ============================================================================
// COMMAND HANDLERS
// ============================================================================

async function handleCommand(chatId: string, text: string, fromUser: string): Promise<void> {
  const lower = text.toLowerCase().trim();

  // /help
  if (lower === '/help' || lower === 'help' || lower === '?') {
    await sendMessage(chatId, `📚 <b>ONDE BOT - Comandi</b>

<b>Stato:</b>
• <code>stato</code> - Dashboard tutti i libri
• <code>stato milo</code> - Dettaglio libro specifico

<b>Libri:</b>
• <code>genera pdf milo-ai</code> - Crea PDF
• <code>mostra milo-ai</code> - Invia immagini

<b>PR:</b>
• <code>/frh [testo]</code> - Posta su FreeRiverHouse
• <code>/onde [testo]</code> - Posta su Onde_FRH
• <code>/magmatic [testo]</code> - Posta su magmatic__

<b>Sistema:</b>
• <code>ping</code> - Test connessione
• <code>help</code> - Questo messaggio`);
    return;
  }

  // ping
  if (lower === 'ping') {
    await sendMessage(chatId, '🟢 Bot attivo e funzionante!');
    return;
  }

  // stato / status
  if (lower.startsWith('stato') || lower.startsWith('status')) {
    const bookName = lower.replace('stato', '').replace('status', '').trim();

    if (bookName) {
      // Stato libro specifico
      const book = books.find(b =>
        b.key.includes(bookName) ||
        b.title.toLowerCase().includes(bookName)
      );

      if (book) {
        const status = getBookStatus(book, book.key);
        const progress = ((status.cover ? 1 : 0) + status.chapters.length) / (status.total + 1) * 100;

        await sendMessage(chatId, `📊 <b>${book.title}</b>

Cover: ${status.cover ? '✅' : '❌'}
Capitoli: ${status.chapters.length}/${status.total}
${status.chapters.length > 0 ? `Presenti: ${status.chapters.join(', ')}` : ''}

Progresso: ${Math.round(progress)}%`);
      } else {
        await sendMessage(chatId, `❌ Libro non trovato: ${bookName}`);
      }
    } else {
      // Dashboard tutti i libri
      let msg = '📚 <b>DASHBOARD LIBRI</b>\n\n';

      for (const book of books) {
        const status = getBookStatus(book, book.key);
        const progress = ((status.cover ? 1 : 0) + status.chapters.length) / (status.total + 1) * 100;
        const emoji = progress === 100 ? '✅' : progress > 50 ? '🟡' : '🔴';
        msg += `${emoji} <b>${book.key}</b>: ${Math.round(progress)}%\n`;
      }

      msg += '\nScrivi <code>stato [libro]</code> per dettagli';
      await sendMessage(chatId, msg);
    }
    return;
  }

  // mostra immagini
  if (lower.startsWith('mostra')) {
    const bookKey = lower.replace('mostra', '').trim();
    const book = books.find(b => b.key.includes(bookKey));

    if (book) {
      const imagesDir = path.join(BOOKS_DIR, book.folder, 'images');
      const files = fs.readdirSync(imagesDir)
        .filter(f => f.startsWith(book.key) && f.endsWith('.jpg'))
        .sort();

      await sendMessage(chatId, `📸 Invio ${files.length} immagini per ${book.title}...`);

      for (const file of files) {
        try {
          await sendPhoto(chatId, path.join(imagesDir, file), file);
          await new Promise(r => setTimeout(r, 500)); // Rate limit
        } catch (e) {
          console.error(`Error sending ${file}:`, e);
        }
      }

      await sendMessage(chatId, `✅ Inviate ${files.length} immagini`);
    } else {
      await sendMessage(chatId, `❌ Libro non trovato. Usa: mostra milo-ai`);
    }
    return;
  }

  // OK / approve
  if (lower === 'ok' || lower === '👍' || lower === 'approva') {
    await sendMessage(chatId, `✅ Approvato! Genero il PDF...

(Funzione PDF in sviluppo - per ora le immagini sono pronte)`);
    return;
  }

  // Default response
  await sendMessage(chatId, `🤖 Non ho capito. Scrivi <code>help</code> per i comandi.`);
}

// ============================================================================
// MAIN POLLING LOOP
// ============================================================================

async function pollUpdates(): Promise<void> {
  while (true) {
    try {
      const updates = await telegramRequest('getUpdates', {
        offset: lastUpdateId + 1,
        timeout: POLL_TIMEOUT,
        allowed_updates: ['message']
      });

      for (const update of updates) {
        lastUpdateId = update.update_id;

        const message = update.message;
        if (!message) continue;

        const chatId = message.chat.id.toString();
        const text = message.text || '';
        const fromUser = message.from?.first_name || 'Unknown';

        // Security: only respond to authorized chat
        if (chatId !== AUTHORIZED_CHAT_ID) {
          console.log(`Unauthorized access attempt from chat ${chatId}`);
          continue;
        }

        console.log(`[${new Date().toISOString()}] ${fromUser}: ${text}`);

        try {
          await handleCommand(chatId, text, fromUser);
        } catch (e) {
          console.error('Error handling command:', e);
          await sendMessage(chatId, `❌ Errore: ${e}`);
        }
      }
    } catch (e) {
      console.error('Polling error:', e);
      await new Promise(r => setTimeout(r, 5000)); // Wait before retry
    }
  }
}

// ============================================================================
// STARTUP
// ============================================================================

async function main(): Promise<void> {
  console.log('🤖 ONDE BOT starting...');
  console.log(`📡 Polling Telegram for updates...`);

  // Send startup notification
  try {
    await sendMessage(AUTHORIZED_CHAT_ID, `🟢 <b>ONDE BOT attivo!</b>

Bot bidirezionale avviato.
Scrivi <code>help</code> per i comandi.`);
  } catch (e) {
    console.error('Could not send startup message:', e);
  }

  await pollUpdates();
}

main().catch(console.error);
