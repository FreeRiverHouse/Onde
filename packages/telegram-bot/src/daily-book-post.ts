#!/usr/bin/env npx ts-node
/**
 * Daily Book Post - Automated publishing content for @Onde_FRH
 *
 * Runs at 10:00 every day:
 * 1. Picks a random post type: WIP text, illustration, or inspiration
 * 2. Uses Grok to craft the perfect tweet
 * 3. Posts automatically to @Onde_FRH
 *
 * Post Types:
 * - work_in_progress: Snippets from books being written
 * - illustration: Images from our books with captions
 * - inspiration: Quotes from classic children's literature
 *
 * NO APPROVAL NEEDED - fully autonomous
 */

import { TwitterApi } from 'twitter-api-v2';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load env
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const XAI_API_KEY = process.env.XAI_API_KEY;
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';

// Telegram for notifications
const TELEGRAM_TOKEN = process.env.ONDE_PR_TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.ONDE_PR_CHAT_ID;

// X/Twitter client for @Onde_FRH
const ondeClient = new TwitterApi({
  appKey: process.env.X_ONDE_API_KEY!,
  appSecret: process.env.X_ONDE_API_SECRET!,
  accessToken: process.env.X_ONDE_ACCESS_TOKEN!,
  accessSecret: process.env.X_ONDE_ACCESS_SECRET!,
});

// Books base path
const BOOKS_PATH = '/Users/mattiapetrucciani/CascadeProjects/Onde/books';

// Log file
const LOG_DIR = '/Users/mattiapetrucciani/CascadeProjects/Onde/packages/telegram-bot/logs';
const LOG_FILE = path.join(LOG_DIR, 'daily-book-post.log');

// Content bank
const CONTENT_BANK_FILE = '/Users/mattiapetrucciani/CascadeProjects/Onde/packages/telegram-bot/data/book-content-bank.json';

// Post types
type PostType = 'work_in_progress' | 'illustration' | 'inspiration';

interface BookContentBank {
  lastUsedIndex: { [key in PostType]: number };
  workInProgress: { text: string; book: string; used: boolean }[];
  illustrations: { imagePath: string; book: string; caption: string; used: boolean }[];
  inspirations: { quote: string; author: string; book?: string; used: boolean }[];
}

function loadContentBank(): BookContentBank {
  try {
    return JSON.parse(fs.readFileSync(CONTENT_BANK_FILE, 'utf-8'));
  } catch {
    return {
      lastUsedIndex: { work_in_progress: -1, illustration: -1, inspiration: -1 },
      workInProgress: [],
      illustrations: [],
      inspirations: [],
    };
  }
}

function saveContentBank(bank: BookContentBank) {
  const dir = path.dirname(CONTENT_BANK_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(CONTENT_BANK_FILE, JSON.stringify(bank, null, 2));
}

function log(message: string) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}`;
  console.log(line);

  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
  fs.appendFileSync(LOG_FILE, line + '\n');
}

// Pick a random post type, weighted towards variety
function pickPostType(): PostType {
  const types: PostType[] = ['work_in_progress', 'illustration', 'inspiration'];
  const bank = loadContentBank();

  // Check which types have unused content
  const available: PostType[] = [];
  if (bank.workInProgress.some(p => !p.used)) available.push('work_in_progress');
  if (bank.illustrations.some(p => !p.used)) available.push('illustration');
  if (bank.inspirations.some(p => !p.used)) available.push('inspiration');

  if (available.length === 0) {
    // Reset all content
    bank.workInProgress.forEach(p => p.used = false);
    bank.illustrations.forEach(p => p.used = false);
    bank.inspirations.forEach(p => p.used = false);
    saveContentBank(bank);
    return types[Math.floor(Math.random() * types.length)];
  }

  return available[Math.floor(Math.random() * available.length)];
}

interface PostContent {
  type: PostType;
  text: string;
  imagePath?: string;
  book?: string;
}

function getNextContent(type: PostType): PostContent | null {
  const bank = loadContentBank();

  if (type === 'work_in_progress') {
    const unused = bank.workInProgress.filter(p => !p.used);
    if (unused.length === 0) return null;

    const idx = Math.floor(Math.random() * unused.length);
    const selected = unused[idx];

    // Mark as used
    const originalIdx = bank.workInProgress.findIndex(p => p.text === selected.text);
    if (originalIdx >= 0) bank.workInProgress[originalIdx].used = true;
    saveContentBank(bank);

    return {
      type: 'work_in_progress',
      text: selected.text,
      book: selected.book,
    };
  }

  if (type === 'illustration') {
    const unused = bank.illustrations.filter(p => !p.used);
    if (unused.length === 0) return null;

    const idx = Math.floor(Math.random() * unused.length);
    const selected = unused[idx];

    // Mark as used
    const originalIdx = bank.illustrations.findIndex(p => p.imagePath === selected.imagePath);
    if (originalIdx >= 0) bank.illustrations[originalIdx].used = true;
    saveContentBank(bank);

    return {
      type: 'illustration',
      text: selected.caption,
      imagePath: selected.imagePath,
      book: selected.book,
    };
  }

  if (type === 'inspiration') {
    const unused = bank.inspirations.filter(p => !p.used);
    if (unused.length === 0) return null;

    const idx = Math.floor(Math.random() * unused.length);
    const selected = unused[idx];

    // Mark as used
    const originalIdx = bank.inspirations.findIndex(p => p.quote === selected.quote);
    if (originalIdx >= 0) bank.inspirations[originalIdx].used = true;
    saveContentBank(bank);

    return {
      type: 'inspiration',
      text: `"${selected.quote}"\n— ${selected.author}`,
      book: selected.book,
    };
  }

  return null;
}

async function callGrok(prompt: string): Promise<string> {
  if (!XAI_API_KEY) {
    throw new Error('XAI_API_KEY not configured');
  }

  const response = await fetch(GROK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${XAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'grok-2-latest',
      messages: [
        {
          role: 'system',
          content: `Sei il social media manager di Onde, una piccola casa editrice italiana specializzata in libri illustrati per bambini.

Il tuo lavoro: creare tweet autentici e poetici sui nostri libri.

Stile:
- Tono colto ma accessibile
- Poetico, riflessivo
- MAI commerciale o "salesy"
- Mai usare "Acquista ora", "Link in bio", o call-to-action
- Poche emoji (1-2 max), mai eccessivo
- Max 280 caratteri
- Italiano

Temi dei nostri libri:
- Spiritualità per bambini (mindfulness, preghiere, valori)
- Poesia classica italiana e inglese
- Storie sulla tecnologia e creatività
- Acquarelli eleganti stile europeo vintage

Esempi di buoni tweet:
- "Un pastore guida le sue pecore verso acque tranquille. Certe storie non invecchiano mai."
- "Oggi in redazione, fra testi e acquarelli. Il Salmo 23 prende forma, pagina dopo pagina."
- "La poesia non si spiega. Si legge, si ascolta, si respira."
- "Ogni illustrazione nasce da ore di silenzio. Il tempo giusto per trovare la luce."

Output SOLO il testo del tweet, nient'altro. Niente virgolette, niente spiegazioni.`
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 150,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Grok API error: ${error}`);
  }

  const data = await response.json() as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content?.trim() || '';
}

async function postToX(
  text: string,
  imagePath?: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const options: any = {};

    // Upload image if present
    if (imagePath && fs.existsSync(imagePath)) {
      const mediaId = await ondeClient.v1.uploadMedia(imagePath);
      options.media = { media_ids: [mediaId] };
      log(`Uploaded image: ${imagePath}`);
    }

    const result = await ondeClient.v2.tweet(text, options);
    const url = `https://x.com/Onde_FRH/status/${result.data.id}`;

    return { success: true, url };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function sendTelegramLog(message: string) {
  if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) return;

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    });
  } catch (e) {
    // Silent fail - this is just logging
  }
}

async function main() {
  log('=== Daily Book Post Starting ===');

  // 1. Pick post type
  const postType = pickPostType();
  log(`Selected post type: ${postType}`);

  // 2. Get content
  const content = getNextContent(postType);

  if (!content) {
    log('No content available in bank - skipping');
    return;
  }

  log(`Content: ${content.text.substring(0, 50)}...`);

  // 3. Generate tweet with Grok
  let tweet: string;
  let prompt: string;

  switch (content.type) {
    case 'work_in_progress':
      prompt = `Scrivi un tweet per condividere questo frammento dal libro "${content.book}" che stiamo scrivendo. Non citare il testo direttamente, ma fai capire che stiamo lavorando a qualcosa di speciale. Ecco il frammento: "${content.text}"`;
      break;

    case 'illustration':
      prompt = `Scrivi un tweet poetico per accompagnare un'illustrazione del libro "${content.book}". L'immagine mostra: ${content.text}. Il tweet deve evocare l'atmosfera, non descrivere.`;
      break;

    case 'inspiration':
      prompt = `Trasforma questa citazione in un tweet che la introduca brevemente, senza aggiungere troppo. La citazione è già inclusa: ${content.text}`;
      // For inspiration, we often want the quote itself
      tweet = content.text;
      if (tweet.length <= 280) {
        log(`Using quote directly: "${tweet}"`);
      } else {
        prompt = `Questa citazione è troppo lunga per un tweet. Accorciala mantenendo l'essenza: ${content.text}`;
      }
      break;
  }

  if (!tweet) {
    try {
      log('Asking Grok to create tweet...');
      tweet = await callGrok(prompt!);
      log(`Generated tweet: "${tweet}"`);
    } catch (error: any) {
      log(`Error generating tweet: ${error.message}`);
      // Fallback: use content directly if short enough
      if (content.text.length <= 280) {
        tweet = content.text;
        log(`Using content directly as fallback`);
      } else {
        await sendTelegramLog(`❌ Daily Book Post failed: ${error.message}`);
        return;
      }
    }
  }

  // Validate tweet
  if (!tweet || tweet.length < 10 || tweet.length > 280) {
    log(`Invalid tweet length: ${tweet?.length || 0}`);
    // Truncate if too long
    if (tweet && tweet.length > 280) {
      tweet = tweet.substring(0, 277) + '...';
      log(`Truncated to: "${tweet}"`);
    } else {
      return;
    }
  }

  // 4. Post to X
  log('Posting to @Onde_FRH...');
  const result = await postToX(tweet, content.imagePath);

  if (result.success) {
    log(`Posted successfully: ${result.url}`);

    const typeLabel = {
      work_in_progress: 'Work in Progress',
      illustration: 'Illustrazione',
      inspiration: 'Ispirazione'
    }[content.type];

    await sendTelegramLog(
      `📚 *Daily Book Post* (${typeLabel})\n\n"${tweet}"\n\n${result.url}`
    );
  } else {
    log(`Failed to post: ${result.error}`);
    await sendTelegramLog(`❌ Daily Book Post failed: ${result.error}`);
  }

  log('=== Daily Book Post Complete ===');
}

// Run
main().catch(console.error);
