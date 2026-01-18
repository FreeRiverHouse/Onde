/**
 * Claude Bridge - Bidirectional Telegram ↔ Claude Code Communication
 *
 * Allows Claude to:
 * 1. Read pending messages from Telegram
 * 2. Process images with context
 * 3. Execute actions (update site, add to book, etc.)
 * 4. Respond back via Telegram
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { v4 as uuidv4 } from 'uuid';

const TELEGRAM_TOKEN = process.env.ONDE_PR_TELEGRAM_TOKEN || '8272332520:AAF7zrKpqOCnFMqOlF1GJCLycJFk3IPO6ps';
const CHAT_ID = process.env.ONDE_PR_CHAT_ID || '7505631979';

const chatQueueDir = path.join(__dirname, '../chat_queue');
const mediaDir = path.join(__dirname, '../media');
const actionsDir = path.join(__dirname, '../actions');

// Ensure directories exist
[chatQueueDir, mediaDir, actionsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

export interface IncomingMessage {
  id: string;
  from: 'user';
  type: 'text' | 'photo' | 'document' | 'voice';
  message: string;
  timestamp: string;
  status: 'pending' | 'read' | 'processed';
  // Media fields
  mediaPath?: string;
  mediaType?: string;
  caption?: string;
  // Context parsed from message
  context?: {
    action?: string;  // 'add_to_chapter', 'update_site', 'fix_app', etc.
    target?: string;  // 'chapter 2', 'onde.surf', 'KidsChefStudio'
    details?: string;
  };
}

/**
 * Get all pending messages from the queue
 */
export function getPendingMessages(): IncomingMessage[] {
  const files = fs.readdirSync(chatQueueDir).filter(f => f.endsWith('.json'));
  const messages: IncomingMessage[] = [];

  for (const file of files) {
    try {
      const msg = JSON.parse(fs.readFileSync(path.join(chatQueueDir, file), 'utf-8'));
      if (msg.status === 'pending') {
        messages.push(msg);
      }
    } catch (e) {
      // Skip invalid files
    }
  }

  return messages.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

/**
 * Mark a message as read
 */
export function markAsRead(id: string): void {
  const filePath = path.join(chatQueueDir, `${id}.json`);
  if (fs.existsSync(filePath)) {
    const msg = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    msg.status = 'read';
    fs.writeFileSync(filePath, JSON.stringify(msg, null, 2));
  }
}

/**
 * Mark a message as processed
 */
export function markAsProcessed(id: string): void {
  const filePath = path.join(chatQueueDir, `${id}.json`);
  if (fs.existsSync(filePath)) {
    const msg = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    msg.status = 'processed';
    fs.writeFileSync(filePath, JSON.stringify(msg, null, 2));
  }
}

/**
 * Parse context from message text
 * Examples:
 * - "per capitolo 2" → { action: 'add_to_chapter', target: 'chapter 2' }
 * - "mettila sul sito" → { action: 'update_site', target: 'onde.surf' }
 * - "fix KidsChefStudio" → { action: 'fix_app', target: 'KidsChefStudio' }
 */
export function parseContext(text: string): IncomingMessage['context'] {
  const lower = text.toLowerCase();

  // Chapter patterns
  const chapterMatch = lower.match(/(?:per |aggiungi a |capitolo |chapter )(\d+)/);
  if (chapterMatch) {
    return { action: 'add_to_chapter', target: `chapter ${chapterMatch[1]}`, details: text };
  }

  // Site patterns
  if (lower.includes('sito') || lower.includes('website') || lower.includes('onde.surf')) {
    return { action: 'update_site', target: 'onde.surf', details: text };
  }

  // App patterns
  const appPatterns = ['kidschefstudio', 'kidsmusicstudio', 'pizzagelatorush', 'aiko'];
  for (const app of appPatterns) {
    if (lower.includes(app)) {
      const action = lower.includes('fix') ? 'fix_app' :
                     lower.includes('build') ? 'build_app' :
                     lower.includes('test') ? 'test_app' : 'update_app';
      return { action, target: app, details: text };
    }
  }

  // Book patterns
  const bookPatterns = ['aiko', 'salmo', 'piccole rime', 'milo'];
  for (const book of bookPatterns) {
    if (lower.includes(book)) {
      return { action: 'update_book', target: book, details: text };
    }
  }

  // Default - just a message
  return { action: 'message', details: text };
}

/**
 * Send a message back to Telegram
 */
export async function sendResponse(text: string, replyToMessageId?: number): Promise<boolean> {
  return new Promise((resolve) => {
    const data = JSON.stringify({
      chat_id: CHAT_ID,
      text: text,
      parse_mode: 'Markdown',
      reply_to_message_id: replyToMessageId
    });

    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${TELEGRAM_TOKEN}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      resolve(res.statusCode === 200);
    });

    req.on('error', () => resolve(false));
    req.write(data);
    req.end();
  });
}

/**
 * Send a photo back to Telegram
 */
export async function sendPhoto(photoPath: string, caption?: string): Promise<boolean> {
  // Use curl for simplicity with multipart form
  const { execSync } = require('child_process');
  try {
    const cmd = caption
      ? `curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto" -F "chat_id=${CHAT_ID}" -F "photo=@${photoPath}" -F "caption=${caption}" -F "parse_mode=Markdown"`
      : `curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto" -F "chat_id=${CHAT_ID}" -F "photo=@${photoPath}"`;
    execSync(cmd);
    return true;
  } catch {
    return false;
  }
}

/**
 * Send a document back to Telegram
 */
export async function sendDocument(docPath: string, caption?: string): Promise<boolean> {
  const { execSync } = require('child_process');
  try {
    const cmd = caption
      ? `curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendDocument" -F "chat_id=${CHAT_ID}" -F "document=@${docPath}" -F "caption=${caption}" -F "parse_mode=Markdown"`
      : `curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendDocument" -F "chat_id=${CHAT_ID}" -F "document=@${docPath}"`;
    execSync(cmd);
    return true;
  } catch {
    return false;
  }
}

/**
 * Create an action request that Claude will process
 */
export function createAction(
  type: string,
  target: string,
  details: Record<string, any>
): string {
  const id = uuidv4().slice(0, 8);
  const action = {
    id,
    type,
    target,
    details,
    status: 'pending',
    created: new Date().toISOString()
  };

  fs.writeFileSync(
    path.join(actionsDir, `${id}.json`),
    JSON.stringify(action, null, 2)
  );

  return id;
}

/**
 * Get pending actions
 */
export function getPendingActions(): any[] {
  const files = fs.readdirSync(actionsDir).filter(f => f.endsWith('.json'));
  const actions: any[] = [];

  for (const file of files) {
    try {
      const action = JSON.parse(fs.readFileSync(path.join(actionsDir, file), 'utf-8'));
      if (action.status === 'pending') {
        actions.push(action);
      }
    } catch (e) {
      // Skip invalid files
    }
  }

  return actions;
}

/**
 * Mark action as completed
 */
export function completeAction(id: string, result?: string): void {
  const filePath = path.join(actionsDir, `${id}.json`);
  if (fs.existsSync(filePath)) {
    const action = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    action.status = 'completed';
    action.completed = new Date().toISOString();
    action.result = result;
    fs.writeFileSync(filePath, JSON.stringify(action, null, 2));
  }
}

// CLI interface for Claude to use
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'check':
    case 'read':
      const messages = getPendingMessages();
      if (messages.length === 0) {
        console.log('📭 Nessun messaggio in attesa');
      } else {
        console.log(`📬 ${messages.length} messaggi in attesa:\n`);
        messages.forEach(m => {
          const time = new Date(m.timestamp).toLocaleString('it-IT');
          const typeIcon = m.type === 'photo' ? '📷' : m.type === 'document' ? '📄' : '💬';
          console.log(`${typeIcon} [${m.id}] ${time}`);
          console.log(`   ${m.message || m.caption || '(media)'}`);
          if (m.mediaPath) console.log(`   📎 ${m.mediaPath}`);
          if (m.context?.action) console.log(`   🎯 Azione: ${m.context.action} → ${m.context.target}`);
          console.log('');
        });
      }
      break;

    case 'reply':
      const msgId = args[1];
      const replyText = args.slice(2).join(' ');
      if (!replyText) {
        console.log('Uso: npx ts-node claude-bridge.ts reply <id> <messaggio>');
        process.exit(1);
      }
      sendResponse(`✅ *Risposta da Claude*\n\n${replyText}`).then(ok => {
        if (ok) {
          markAsProcessed(msgId);
          console.log('✅ Risposta inviata');
        } else {
          console.log('❌ Errore invio risposta');
        }
      });
      break;

    case 'send':
      const text = args.slice(1).join(' ');
      if (!text) {
        console.log('Uso: npx ts-node claude-bridge.ts send <messaggio>');
        process.exit(1);
      }
      sendResponse(text).then(ok => {
        console.log(ok ? '✅ Messaggio inviato' : '❌ Errore');
      });
      break;

    case 'actions':
      const actions = getPendingActions();
      if (actions.length === 0) {
        console.log('✅ Nessuna azione in sospeso');
      } else {
        console.log(`⚡ ${actions.length} azioni da eseguire:\n`);
        actions.forEach(a => {
          console.log(`[${a.id}] ${a.type} → ${a.target}`);
          console.log(`   ${JSON.stringify(a.details)}`);
          console.log('');
        });
      }
      break;

    default:
      console.log(`
🤖 Claude Bridge - Comunicazione Telegram ↔ Claude

Comandi:
  check/read     Mostra messaggi in attesa
  reply <id> <msg>  Rispondi a un messaggio
  send <msg>     Invia messaggio a Telegram
  actions        Mostra azioni in sospeso

Esempi:
  npx ts-node claude-bridge.ts check
  npx ts-node claude-bridge.ts reply abc123 "Fatto! Ho aggiornato il capitolo 2"
  npx ts-node claude-bridge.ts send "🚀 Deploy completato!"
`);
  }
}
