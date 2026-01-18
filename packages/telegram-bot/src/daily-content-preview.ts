#!/usr/bin/env npx ts-node
/**
 * Daily Content Preview - 16:20 ogni giorno
 *
 * Manda su Telegram tutti i post schedulati in formato elegante
 * Una "slide" per post, stile rilassato
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

const TELEGRAM_TOKEN = process.env.ONDE_PR_TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.ONDE_PR_CHAT_ID;

const CONTENT_QUEUE_FILE = path.join(__dirname, '../data/content-queue.json');

interface ContentItem {
  id: string;
  text: string;
  account: 'onde' | 'frh';
  type: string;
  status: 'queued' | 'posted' | 'skipped';
  metadata?: {
    author?: string;
    source?: string;
  };
}

interface ContentQueue {
  onde: ContentItem[];
  frh: ContentItem[];
}

function loadContentQueue(): ContentQueue {
  try {
    return JSON.parse(fs.readFileSync(CONTENT_QUEUE_FILE, 'utf-8'));
  } catch {
    return { onde: [], frh: [] };
  }
}

async function sendTelegram(message: string, parseMode: 'Markdown' | 'HTML' = 'Markdown'): Promise<void> {
  if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('Telegram not configured');
    return;
  }

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: parseMode,
      }),
    });
  } catch (e: any) {
    console.error('Telegram error:', e.message);
  }
}

function getTypeEmoji(type: string): string {
  switch (type) {
    case 'citazione': return '📜';
    case 'dietro_le_quinte': return '🎬';
    case 'riflessione': return '💭';
    case 'progress': return '🔧';
    case 'lesson': return '📚';
    case 'tool': return '⚙️';
    default: return '✨';
  }
}

function getTypeLabel(type: string): string {
  switch (type) {
    case 'citazione': return 'Citazione';
    case 'dietro_le_quinte': return 'Dietro le quinte';
    case 'riflessione': return 'Riflessione';
    case 'progress': return 'Progress';
    case 'lesson': return 'Lesson';
    case 'tool': return 'Tool';
    default: return type;
  }
}

function formatSlide(item: ContentItem, index: number, total: number): string {
  const emoji = getTypeEmoji(item.type);
  const typeLabel = getTypeLabel(item.type);
  const account = item.account === 'onde' ? '@Onde\\_FRH' : '@FreeRiverHouse';

  let slide = `━━━━━━━━━━━━━━━━━━━━\n`;
  slide += `${emoji} *${typeLabel}* · ${account}\n`;
  slide += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  slide += `${item.text}\n\n`;

  if (item.metadata?.author) {
    slide += `_— ${item.metadata.author}_`;
    if (item.metadata.source) {
      slide += ` _(${item.metadata.source})_`;
    }
    slide += `\n`;
  }

  slide += `\n▫️ ${index + 1} di ${total}`;

  return slide;
}

export async function sendContentPreview(): Promise<void> {
  console.log('📤 Sending content preview to Telegram...');

  const queue = loadContentQueue();
  const ondeQueued = queue.onde.filter(i => i.status === 'queued');
  const frhQueued = queue.frh.filter(i => i.status === 'queued');

  // Header
  const now = new Date();
  const dateStr = now.toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  const header = `
☀️ *Good evening*

📅 ${dateStr}

Here's what's coming up.
Relax and browse.

━━━━━━━━━━━━━━━━━━━━
📚 *@Onde\\_FRH*: ${ondeQueued.length} posts
🔧 *@FreeRiverHouse*: ${frhQueued.length} posts
━━━━━━━━━━━━━━━━━━━━
`;

  await sendTelegram(header);

  // Small delay between messages
  const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

  // Onde posts
  if (ondeQueued.length > 0) {
    await delay(1000);
    await sendTelegram(`\n\n📚 *ONDE*\n_Casa Editrice_`);

    for (let i = 0; i < ondeQueued.length; i++) {
      await delay(800);
      const slide = formatSlide(ondeQueued[i], i, ondeQueued.length);
      await sendTelegram(slide);
    }
  }

  // FRH posts
  if (frhQueued.length > 0) {
    await delay(1500);
    await sendTelegram(`\n\n🔧 *FREE RIVER HOUSE*\n_Building in Public_`);

    for (let i = 0; i < frhQueued.length; i++) {
      await delay(800);
      const slide = formatSlide(frhQueued[i], i, frhQueued.length);
      await sendTelegram(slide);
    }
  }

  // Footer
  await delay(1000);
  const footer = `
━━━━━━━━━━━━━━━━━━━━

✅ *Fine preview*

_Posts will be published automatically:_
• Onde: 8:08, 11:11, 22:22
• FRH: 9:09, 12:12, 21:21

💡 Usa /autopost per pubblicare subito
💡 Usa /schedule per vedere lo stato

━━━━━━━━━━━━━━━━━━━━
`;

  await sendTelegram(footer);

  console.log(`✅ Sent ${ondeQueued.length + frhQueued.length} content previews`);
}

// Schedule for 16:20 daily
export function scheduleContentPreview(): void {
  const now = new Date();
  const target = new Date();
  target.setHours(16, 20, 0, 0);

  // If it's already past 16:20, schedule for tomorrow
  if (now > target) {
    target.setDate(target.getDate() + 1);
  }

  const msUntilTarget = target.getTime() - now.getTime();

  console.log(`📋 Content preview scheduled for ${target.toLocaleString()}`);

  setTimeout(() => {
    sendContentPreview();
    // Then repeat every 24 hours
    setInterval(sendContentPreview, 24 * 60 * 60 * 1000);
  }, msUntilTarget);
}

// Run if called directly
if (require.main === module) {
  sendContentPreview().catch(console.error);
}
