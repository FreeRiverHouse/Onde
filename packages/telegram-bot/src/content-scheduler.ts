/**
 * Content Scheduler - Automated 3x Daily Posting
 *
 * Uses Gianni Parola style for human-feeling posts
 * Posts 3x daily per account at optimal times:
 * - Onde: 9:00, 14:00, 20:00 CET
 * - FRH: 10:00, 15:00, 21:00 CET
 *
 * Implements cross-engagement between accounts
 */

import * as fs from 'fs';
import * as path from 'path';
import { TwitterApi } from 'twitter-api-v2';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

// === Types ===

export interface ContentItem {
  id: string;
  text: string;
  account: 'onde' | 'frh';
  type: 'citazione' | 'dietro_le_quinte' | 'riflessione' | 'progress' | 'lesson' | 'tool';
  status: 'queued' | 'posted' | 'skipped';
  scheduledFor?: string; // ISO date string
  postedAt?: string;
  postUrl?: string;
  metadata?: {
    author?: string; // For quotes
    year?: string;
    source?: string;
  };
}

export interface ContentQueue {
  onde: ContentItem[];
  frh: ContentItem[];
  lastPosted: {
    onde: string | null;
    frh: string | null;
  };
}

export interface PostingSchedule {
  account: 'onde' | 'frh';
  hour: number;
  minute: number;
}

// === Constants ===

const DATA_DIR = path.join(__dirname, '../data');
const CONTENT_QUEUE_FILE = path.join(DATA_DIR, 'content-queue.json');
const LOG_DIR = path.join(__dirname, '../logs');
const LOG_FILE = path.join(LOG_DIR, 'content-scheduler.log');

// Posting schedules (CET)
const POSTING_SCHEDULES: PostingSchedule[] = [
  // Onde - 9:00, 14:00, 20:00
  { account: 'onde', hour: 9, minute: 0 },
  { account: 'onde', hour: 14, minute: 0 },
  { account: 'onde', hour: 20, minute: 0 },
  // FRH - 10:00, 15:00, 21:00
  { account: 'frh', hour: 10, minute: 0 },
  { account: 'frh', hour: 15, minute: 0 },
  { account: 'frh', hour: 21, minute: 0 },
];

// Telegram notifications
const TELEGRAM_TOKEN = process.env.ONDE_PR_TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.ONDE_PR_CHAT_ID;

// === Pre-approved Content (Gianni Parola Style) ===

const ONDE_CITAZIONI: Omit<ContentItem, 'id' | 'status'>[] = [
  {
    text: `170 d.C. Un imperatore scrive nel suo diario, di notte, dopo una battaglia.

"La felicità della tua vita dipende dalla qualità dei tuoi pensieri."

Non sapeva che l'avremmo letto duemila anni dopo.`,
    account: 'onde',
    type: 'citazione',
    metadata: { author: 'Marco Aurelio', year: '170 d.C.', source: 'Meditazioni' }
  },
  {
    text: `Marco Aurelio, nel suo diario privato:

"Non perdere altro tempo a discutere su cosa debba essere un uomo buono. Sii uno."

Un promemoria scritto per sé stesso. Non per noi.
Eppure arriva lo stesso.`,
    account: 'onde',
    type: 'citazione',
    metadata: { author: 'Marco Aurelio', source: 'Meditazioni' }
  },
  {
    text: `Roma, II secolo. Un imperatore si alza prima dell'alba.

"Quando ti alzi al mattino, pensa a che privilegio prezioso sia essere vivo."

Marco Aurelio. Lo scriveva per ricordarselo nei giorni difficili.`,
    account: 'onde',
    type: 'citazione',
    metadata: { author: 'Marco Aurelio', source: 'Meditazioni' }
  },
  {
    text: `Seneca, in una lettera a Lucilio:

"Non è che abbiamo poco tempo, ma che ne sprechiamo molto."

Duemila anni fa. Come se parlasse a noi.`,
    account: 'onde',
    type: 'citazione',
    metadata: { author: 'Seneca', source: 'Lettere a Lucilio' }
  },
  {
    text: `Epitteto non sapeva leggere quando era schiavo.

Poi scrisse:
"Non sono i fatti che ci turbano, ma i giudizi che diamo ai fatti."

Alcuni hanno la fortuna di nascere filosofi. Altri devono diventarlo.`,
    account: 'onde',
    type: 'citazione',
    metadata: { author: 'Epitteto', source: 'Enchiridion' }
  },
  {
    text: `Seneca a Lucilio, lettera 49:

"La vita è lunga se sai usarla."

Nove parole. Duemila anni. Ancora vero.`,
    account: 'onde',
    type: 'citazione',
    metadata: { author: 'Seneca', source: 'Lettere a Lucilio' }
  },
  {
    text: `Marco Aurelio, a sé stesso:

"L'ostacolo è la via."

Tre parole che hanno attraversato millenni.
A volte la saggezza è breve.`,
    account: 'onde',
    type: 'citazione',
    metadata: { author: 'Marco Aurelio', source: 'Meditazioni' }
  },
];

const ONDE_DIETRO_LE_QUINTE: Omit<ContentItem, 'id' | 'status'>[] = [
  {
    text: `Stamattina: cercare il font giusto per un libro di poesie per bambini.

Sembra una cosa da niente. Ma il font dice al bambino: "questo è serio" o "questo è un gioco".

Abbiamo scelto qualcosa nel mezzo.`,
    account: 'onde',
    type: 'dietro_le_quinte'
  },
  {
    text: `Oggi in redazione: rileggere una filastrocca per la terza volta.

Non perché ci siano errori.
Perché il ritmo deve essere perfetto quando un bambino la legge ad alta voce.`,
    account: 'onde',
    type: 'dietro_le_quinte'
  },
  {
    text: `Una traduzione ci ha tenuti impegnati tutto il giorno.

Il problema: in italiano abbiamo parole che in inglese non esistono.
La soluzione: trovare il sentimento, non la parola esatta.`,
    account: 'onde',
    type: 'dietro_le_quinte'
  },
  {
    text: `Stiamo lavorando a un libro sull'AI spiegata ai bambini.

La sfida: parlare di tecnologia senza perdere la magia.
Un robot può essere amico. La scienza può essere poesia.`,
    account: 'onde',
    type: 'dietro_le_quinte'
  },
];

const ONDE_RIFLESSIONI: Omit<ContentItem, 'id' | 'status'>[] = [
  {
    text: `Un libro per bambini non è un libro semplice.
È un libro che deve dire cose complesse con parole semplici.

Ci vuole più lavoro, non meno.`,
    account: 'onde',
    type: 'riflessione'
  },
  {
    text: `La differenza tra un libro e un buon libro?

Il buon libro ti fa pensare anche quando lo chiudi.`,
    account: 'onde',
    type: 'riflessione'
  },
  {
    text: `Ogni illustrazione racconta una storia che le parole non dicono.

È il dialogo silenzioso tra testo e immagine.
Quando funziona, il lettore non se ne accorge nemmeno.`,
    account: 'onde',
    type: 'riflessione'
  },
];

const FRH_PROGRESS: Omit<ContentItem, 'id' | 'status'>[] = [
  {
    text: `Il bot ha perso $45 in paper trading la settimana scorsa.

Oggi ho aggiunto un sistema che analizza i propri errori e si corregge automaticamente.

Vediamo se impara dai suoi sbagli meglio di me.`,
    account: 'frh',
    type: 'progress'
  },
  {
    text: `Stamattina: sistemare un bug nel sistema di notifiche.

Il problema era che funzionava troppo bene.
50 notifiche in 10 minuti. Non è un errore, è un esaurimento nervoso.`,
    account: 'frh',
    type: 'progress'
  },
  {
    text: `Tre giorni per far funzionare una feature che sembrava banale.

La lezione: le cose semplici in teoria sono complesse in pratica.
Il codice non mente.`,
    account: 'frh',
    type: 'progress'
  },
];

const FRH_LESSONS: Omit<ContentItem, 'id' | 'status'>[] = [
  {
    text: `Lezione di oggi: non fidarti mai dei dati mock.

Il bot funzionava perfettamente con dati finti.
In produzione, ha scoperto che il mondo reale è più strano.

Sempre.`,
    account: 'frh',
    type: 'lesson'
  },
  {
    text: `Una cosa che nessuno ti dice dello sviluppo:

Il 90% del tempo lo passi a capire perché qualcosa non funziona.
Il 10% a scrivere codice.

Oggi era un giorno da 95%.`,
    account: 'frh',
    type: 'lesson'
  },
  {
    text: `Ho passato 4 ore a debuggare un errore.

Il problema: un typo.
La lezione: i problemi complessi hanno spesso soluzioni semplici.

O forse avevo solo bisogno di un caffè.`,
    account: 'frh',
    type: 'lesson'
  },
];

const FRH_TOOLS: Omit<ContentItem, 'id' | 'status'>[] = [
  {
    text: `Stack di oggi: TypeScript, Claude API, Telegram Bot.

Non il più moderno. Ma funziona.
A volte la cosa migliore che puoi dire di un sistema è: funziona.`,
    account: 'frh',
    type: 'tool'
  },
  {
    text: `Automazione della settimana: post su X in automatico alle 21:30.

Il bot scansiona i commit del giorno, sceglie il più interessante, posta.
Io dormo. Lui lavora.

Il futuro è strano.`,
    account: 'frh',
    type: 'tool'
  },
];

// === Utility Functions ===

function log(message: string) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}`;
  console.log(line);

  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
  fs.appendFileSync(LOG_FILE, line + '\n');
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadContentQueue(): ContentQueue {
  ensureDataDir();
  try {
    if (fs.existsSync(CONTENT_QUEUE_FILE)) {
      return JSON.parse(fs.readFileSync(CONTENT_QUEUE_FILE, 'utf-8'));
    }
  } catch {
    // Fall through to default
  }
  return { onde: [], frh: [], lastPosted: { onde: null, frh: null } };
}

function saveContentQueue(queue: ContentQueue) {
  ensureDataDir();
  fs.writeFileSync(CONTENT_QUEUE_FILE, JSON.stringify(queue, null, 2));
}

function generateId(): string {
  return `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// === Twitter Clients ===

function getTwitterClient(account: 'onde' | 'frh'): TwitterApi {
  if (account === 'frh') {
    return new TwitterApi({
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_SECRET!,
      accessToken: process.env.TWITTER_ACCESS_TOKEN!,
      accessSecret: process.env.TWITTER_ACCESS_SECRET!,
    });
  } else {
    return new TwitterApi({
      appKey: process.env.X_ONDE_API_KEY!,
      appSecret: process.env.X_ONDE_API_SECRET!,
      accessToken: process.env.X_ONDE_ACCESS_TOKEN!,
      accessSecret: process.env.X_ONDE_ACCESS_SECRET!,
    });
  }
}

function getAccountHandle(account: 'onde' | 'frh'): string {
  return account === 'frh' ? 'FreeRiverHouse' : 'Onde_FRH';
}

// === Core Functions ===

export function initializeContentQueue(): void {
  log('Initializing content queue...');
  const queue = loadContentQueue();

  // Add Onde content if queue is low
  if (queue.onde.filter(c => c.status === 'queued').length < 10) {
    const allOndeContent = [
      ...ONDE_CITAZIONI,
      ...ONDE_DIETRO_LE_QUINTE,
      ...ONDE_RIFLESSIONI,
    ];

    // Shuffle and add
    const shuffled = allOndeContent.sort(() => Math.random() - 0.5);
    for (const item of shuffled) {
      if (!queue.onde.some(q => q.text === item.text)) {
        queue.onde.push({
          ...item,
          id: generateId(),
          status: 'queued',
        });
      }
    }
    log(`Added ${shuffled.length} items to Onde queue`);
  }

  // Add FRH content if queue is low
  if (queue.frh.filter(c => c.status === 'queued').length < 10) {
    const allFrhContent = [
      ...FRH_PROGRESS,
      ...FRH_LESSONS,
      ...FRH_TOOLS,
    ];

    const shuffled = allFrhContent.sort(() => Math.random() - 0.5);
    for (const item of shuffled) {
      if (!queue.frh.some(q => q.text === item.text)) {
        queue.frh.push({
          ...item,
          id: generateId(),
          status: 'queued',
        });
      }
    }
    log(`Added ${shuffled.length} items to FRH queue`);
  }

  saveContentQueue(queue);
  log(`Queue initialized: ${queue.onde.length} Onde, ${queue.frh.length} FRH items`);
}

export function getNextContent(account: 'onde' | 'frh'): ContentItem | null {
  const queue = loadContentQueue();
  const items = account === 'onde' ? queue.onde : queue.frh;

  // Find first queued item
  const next = items.find(item => item.status === 'queued');

  if (!next) {
    // Recycle: mark all as queued again
    log(`${account} queue empty, recycling content...`);
    items.forEach(item => {
      if (item.status === 'posted') {
        item.status = 'queued';
      }
    });
    saveContentQueue(queue);
    return items.find(item => item.status === 'queued') || null;
  }

  return next;
}

export async function postContent(item: ContentItem): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const client = getTwitterClient(item.account);
    const handle = getAccountHandle(item.account);

    const result = await client.v2.tweet(item.text);
    const url = `https://x.com/${handle}/status/${result.data.id}`;

    // Update queue
    const queue = loadContentQueue();
    const items = item.account === 'onde' ? queue.onde : queue.frh;
    const idx = items.findIndex(i => i.id === item.id);
    if (idx >= 0) {
      items[idx].status = 'posted';
      items[idx].postedAt = new Date().toISOString();
      items[idx].postUrl = url;
    }
    queue.lastPosted[item.account] = new Date().toISOString();
    saveContentQueue(queue);

    log(`Posted to @${handle}: ${url}`);
    return { success: true, url };
  } catch (error: any) {
    log(`Error posting to ${item.account}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

export async function crossEngage(postUrl: string, fromAccount: 'onde' | 'frh'): Promise<void> {
  // Like from the OTHER account
  const targetAccount = fromAccount === 'onde' ? 'frh' : 'onde';

  try {
    // Extract tweet ID from URL
    const tweetId = postUrl.split('/status/')[1]?.split('?')[0];
    if (!tweetId) return;

    const client = getTwitterClient(targetAccount);
    await client.v2.like((await client.v2.me()).data.id, tweetId);
    log(`Cross-engaged: @${getAccountHandle(targetAccount)} liked ${postUrl}`);
  } catch (error: any) {
    log(`Cross-engage error: ${error.message}`);
  }
}

async function sendTelegramNotification(message: string) {
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
  } catch {
    // Silent fail
  }
}

// === Scheduler ===

export async function runScheduledPost(account: 'onde' | 'frh'): Promise<void> {
  log(`Running scheduled post for @${getAccountHandle(account)}...`);

  const content = getNextContent(account);
  if (!content) {
    log(`No content available for ${account}`);
    return;
  }

  const result = await postContent(content);

  if (result.success && result.url) {
    // Send Telegram notification
    const accountLabel = account === 'onde' ? '@Onde_FRH' : '@FreeRiverHouse';
    await sendTelegramNotification(
      `📤 *Post Automatico - ${accountLabel}*\n\n"${content.text.substring(0, 100)}..."\n\n${result.url}`
    );

    // Cross-engagement
    await crossEngage(result.url, account);
  } else {
    await sendTelegramNotification(
      `❌ *Errore Post ${account}*\n\n${result.error}`
    );
  }
}

export function checkSchedule(): { account: 'onde' | 'frh'; shouldPost: boolean }[] {
  const now = new Date();
  // Adjust for CET (UTC+1)
  const cetHour = (now.getUTCHours() + 1) % 24;
  const cetMinute = now.getUTCMinutes();

  const results: { account: 'onde' | 'frh'; shouldPost: boolean }[] = [];

  for (const schedule of POSTING_SCHEDULES) {
    // Check if we're within the posting window (±5 minutes)
    const targetMinutes = schedule.hour * 60 + schedule.minute;
    const currentMinutes = cetHour * 60 + cetMinute;
    const diff = Math.abs(targetMinutes - currentMinutes);

    if (diff <= 5) {
      // Check if we already posted recently
      const queue = loadContentQueue();
      const lastPosted = queue.lastPosted[schedule.account];

      if (lastPosted) {
        const lastPostTime = new Date(lastPosted);
        const hoursSinceLastPost = (now.getTime() - lastPostTime.getTime()) / (1000 * 60 * 60);

        // Don't post if we posted in the last 3 hours
        if (hoursSinceLastPost < 3) {
          continue;
        }
      }

      results.push({ account: schedule.account, shouldPost: true });
    }
  }

  return results;
}

// === Interval Runner ===

let schedulerInterval: NodeJS.Timeout | null = null;

export function startScheduler(): void {
  log('Starting content scheduler...');
  initializeContentQueue();

  // Check every minute
  schedulerInterval = setInterval(async () => {
    const toPost = checkSchedule();

    for (const { account, shouldPost } of toPost) {
      if (shouldPost) {
        await runScheduledPost(account);
      }
    }
  }, 60 * 1000); // Every minute

  log('Content scheduler started. Checking every minute.');
}

export function stopScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    log('Content scheduler stopped.');
  }
}

// === CLI ===

if (require.main === module) {
  const args = process.argv.slice(2);

  if (args[0] === 'init') {
    initializeContentQueue();
    console.log('Content queue initialized!');
  } else if (args[0] === 'post') {
    const account = args[1] as 'onde' | 'frh';
    if (account !== 'onde' && account !== 'frh') {
      console.log('Usage: npx ts-node content-scheduler.ts post <onde|frh>');
      process.exit(1);
    }
    runScheduledPost(account).then(() => process.exit(0));
  } else if (args[0] === 'status') {
    const queue = loadContentQueue();
    console.log('\n=== Content Queue Status ===\n');
    console.log(`Onde: ${queue.onde.filter(i => i.status === 'queued').length} queued, ${queue.onde.filter(i => i.status === 'posted').length} posted`);
    console.log(`FRH: ${queue.frh.filter(i => i.status === 'queued').length} queued, ${queue.frh.filter(i => i.status === 'posted').length} posted`);
    console.log(`\nLast posted:`);
    console.log(`  Onde: ${queue.lastPosted.onde || 'never'}`);
    console.log(`  FRH: ${queue.lastPosted.frh || 'never'}`);
  } else if (args[0] === 'start') {
    startScheduler();
    // Keep running
    process.on('SIGINT', () => {
      stopScheduler();
      process.exit(0);
    });
  } else {
    console.log(`
Content Scheduler - Gianni Parola Style

Commands:
  init    - Initialize content queue with pre-approved content
  post    - Post immediately (npx ts-node content-scheduler.ts post <onde|frh>)
  status  - Show queue status
  start   - Start the scheduler (runs continuously)

Schedule:
  Onde: 9:00, 14:00, 20:00 CET
  FRH:  10:00, 15:00, 21:00 CET
`);
  }
}
