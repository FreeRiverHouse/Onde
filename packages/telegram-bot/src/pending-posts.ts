/**
 * Sistema di Post in Attesa con Approvazione Telegram
 *
 * Workflow:
 * 1. Claude/Agent crea un post e lo salva in pending
 * 2. Bot manda su Telegram con bottone "Approva"
 * 3. Watcher controlla ogni 30 sec
 * 4. Se approvato, posta automaticamente su X via API
 */

import * as fs from 'fs';
import * as path from 'path';
import { TwitterApi } from 'twitter-api-v2';
import { Telegraf } from 'telegraf';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

// Tipi
export interface PendingPost {
  id: string;
  text: string;
  account: 'frh' | 'onde' | 'magmatic';
  status: 'pending' | 'approved' | 'posted' | 'rejected';
  mediaFiles?: string[];
  createdAt: string;
  approvedAt?: string;
  postedAt?: string;
  postUrl?: string;
  error?: string;
}

// Path del file JSON per la coda
const PENDING_FILE = path.join(__dirname, '../data/pending-posts.json');
const DATA_DIR = path.join(__dirname, '../data');

// Assicura che la directory esista
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Inizializza file se non esiste
if (!fs.existsSync(PENDING_FILE)) {
  fs.writeFileSync(PENDING_FILE, JSON.stringify({ posts: [] }, null, 2));
}

// === Funzioni di gestione coda ===

export function loadPendingPosts(): PendingPost[] {
  try {
    const data = fs.readFileSync(PENDING_FILE, 'utf-8');
    return JSON.parse(data).posts || [];
  } catch {
    return [];
  }
}

export function savePendingPosts(posts: PendingPost[]): void {
  fs.writeFileSync(PENDING_FILE, JSON.stringify({ posts }, null, 2));
}

export function addPendingPost(post: Omit<PendingPost, 'id' | 'status' | 'createdAt'>): PendingPost {
  const posts = loadPendingPosts();
  const newPost: PendingPost = {
    ...post,
    id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  posts.push(newPost);
  savePendingPosts(posts);
  return newPost;
}

export function approvePost(postId: string): PendingPost | null {
  const posts = loadPendingPosts();
  const post = posts.find(p => p.id === postId);
  if (post && post.status === 'pending') {
    post.status = 'approved';
    post.approvedAt = new Date().toISOString();
    savePendingPosts(posts);
    return post;
  }
  return null;
}

export function rejectPost(postId: string): PendingPost | null {
  const posts = loadPendingPosts();
  const post = posts.find(p => p.id === postId);
  if (post && post.status === 'pending') {
    post.status = 'rejected';
    savePendingPosts(posts);
    return post;
  }
  return null;
}

export function markAsPosted(postId: string, url: string): void {
  const posts = loadPendingPosts();
  const post = posts.find(p => p.id === postId);
  if (post) {
    post.status = 'posted';
    post.postedAt = new Date().toISOString();
    post.postUrl = url;
    savePendingPosts(posts);
  }
}

export function markAsError(postId: string, error: string): void {
  const posts = loadPendingPosts();
  const post = posts.find(p => p.id === postId);
  if (post) {
    post.error = error;
    savePendingPosts(posts);
  }
}

export function getApprovedPosts(): PendingPost[] {
  return loadPendingPosts().filter(p => p.status === 'approved');
}

export function getPendingPosts(): PendingPost[] {
  return loadPendingPosts().filter(p => p.status === 'pending');
}

// === X/Twitter Clients ===

export function getTwitterClient(account: 'frh' | 'onde' | 'magmatic'): TwitterApi {
  if (account === 'frh') {
    return new TwitterApi({
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_SECRET!,
      accessToken: process.env.TWITTER_ACCESS_TOKEN!,
      accessSecret: process.env.TWITTER_ACCESS_SECRET!,
    });
  } else if (account === 'onde') {
    return new TwitterApi({
      appKey: process.env.X_ONDE_API_KEY!,
      appSecret: process.env.X_ONDE_API_SECRET!,
      accessToken: process.env.X_ONDE_ACCESS_TOKEN!,
      accessSecret: process.env.X_ONDE_ACCESS_SECRET!,
    });
  } else {
    return new TwitterApi({
      appKey: process.env.X_MAGMATIC_API_KEY!,
      appSecret: process.env.X_MAGMATIC_API_SECRET!,
      accessToken: process.env.X_MAGMATIC_ACCESS_TOKEN!,
      accessSecret: process.env.X_MAGMATIC_ACCESS_SECRET!,
    });
  }
}

export function getAccountName(account: 'frh' | 'onde' | 'magmatic'): string {
  if (account === 'frh') return 'FreeRiverHouse';
  if (account === 'onde') return 'Onde_FRH';
  return 'magmatic__';
}

// === Post to X ===

export async function postToX(post: PendingPost): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const client = getTwitterClient(post.account);
    const accountName = getAccountName(post.account);

    const options: any = {};

    // Upload media if present
    if (post.mediaFiles && post.mediaFiles.length > 0) {
      const mediaIds: string[] = [];
      for (const filePath of post.mediaFiles) {
        if (fs.existsSync(filePath)) {
          const mediaId = await client.v1.uploadMedia(filePath);
          mediaIds.push(mediaId);
        }
      }
      if (mediaIds.length > 0) {
        options.media = { media_ids: mediaIds };
      }
    }

    const result = await client.v2.tweet(post.text, options);
    const url = `https://x.com/${accountName}/status/${result.data.id}`;

    return { success: true, url };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// === Telegram Integration ===

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID!;

let bot: Telegraf | null = null;

export function getTelegramBot(): Telegraf {
  if (!bot) {
    bot = new Telegraf(TELEGRAM_TOKEN);
  }
  return bot;
}

export async function sendApprovalRequest(post: PendingPost): Promise<void> {
  const tg = getTelegramBot();

  const accountLabel = post.account === 'frh' ? '@FreeRiverHouse' :
                       post.account === 'onde' ? '@Onde_FRH' : '@magmatic__';

  const message = `📝 *NUOVO POST DA APPROVARE*

*Account:* ${accountLabel}

"${post.text}"

${post.mediaFiles?.length ? `📎 ${post.mediaFiles.length} media allegati` : ''}

_Clicca per approvare o rifiutare_`;

  await tg.telegram.sendMessage(CHAT_ID, message, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [
          { text: '✅ Approva', callback_data: `approve_post_${post.id}` },
          { text: '❌ Rifiuta', callback_data: `reject_post_${post.id}` },
        ],
      ],
    },
  });
}

export async function sendPostResult(post: PendingPost, success: boolean, url?: string, error?: string): Promise<void> {
  const tg = getTelegramBot();

  const accountLabel = post.account === 'frh' ? '@FreeRiverHouse' :
                       post.account === 'onde' ? '@Onde_FRH' : '@magmatic__';

  if (success) {
    await tg.telegram.sendMessage(CHAT_ID,
      `✅ *POSTATO!*\n\n${accountLabel}\n${url}`,
      { parse_mode: 'Markdown' }
    );
  } else {
    await tg.telegram.sendMessage(CHAT_ID,
      `❌ *ERRORE*\n\n${accountLabel}\n${error}`,
      { parse_mode: 'Markdown' }
    );
  }
}

// === Main Export for CLI ===

export async function createAndSendPost(
  text: string,
  account: 'frh' | 'onde' | 'magmatic',
  mediaFiles?: string[]
): Promise<PendingPost> {
  const post = addPendingPost({ text, account, mediaFiles });
  await sendApprovalRequest(post);
  console.log(`📤 Post inviato per approvazione: ${post.id}`);
  return post;
}
