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
  scheduledFor?: string;
  postedAt?: string;
  postUrl?: string;
  metadata?: {
    author?: string;
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

// Posting schedules (CET) - Angel Numbers
const POSTING_SCHEDULES: PostingSchedule[] = [
  // Onde - 8:08, 11:11, 22:22
  { account: 'onde', hour: 8, minute: 8 },
  { account: 'onde', hour: 11, minute: 11 },
  { account: 'onde', hour: 22, minute: 22 },
  // FRH - 9:09, 12:12, 21:21
  { account: 'frh', hour: 9, minute: 9 },
  { account: 'frh', hour: 12, minute: 12 },
  { account: 'frh', hour: 21, minute: 21 },
];

const TELEGRAM_TOKEN = process.env.ONDE_PR_TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.ONDE_PR_CHAT_ID;

// === Pre-approved Content (Warm, Inspiring, English) ===

const ONDE_CITAZIONI: Omit<ContentItem, 'id' | 'status'>[] = [
  {
    text: `Around 170 AD, a Roman emperor sat alone in his tent after a long day of battle. By candlelight, he wrote in his private journal:

"The happiness of your life depends upon the quality of your thoughts."

Marcus Aurelius never intended for anyone to read these words. They were reminders to himself, on the hardest days.

Two thousand years later, they still find the people who need them.`,
    account: 'onde',
    type: 'citazione',
    metadata: { author: 'Marcus Aurelius', year: '170 AD', source: 'Meditations' }
  },
  {
    text: `Marcus Aurelius ruled the most powerful empire in history. He could have anything he wanted.

What he wanted was to be a better person.

"Waste no more time arguing about what a good man should be. Be one."

He wrote this for himself, not for us. But sometimes the most private words become the most universal.`,
    account: 'onde',
    type: 'citazione',
    metadata: { author: 'Marcus Aurelius', source: 'Meditations' }
  },
  {
    text: `Every morning, before dawn, Marcus Aurelius would remind himself:

"When you arise in the morning, think of what a precious privilege it is to be alive — to breathe, to think, to enjoy, to love."

He was preparing himself for difficult days. War. Politics. Betrayal.

Maybe that's when gratitude matters most — not when things are easy, but when they're hard.`,
    account: 'onde',
    type: 'citazione',
    metadata: { author: 'Marcus Aurelius', source: 'Meditations' }
  },
  {
    text: `Seneca was one of the richest men in Rome. He had everything.

And yet he wrote:

"It is not that we have a short time to live, but that we waste a lot of it."

Wealth didn't blind him to the truth. Time is the only thing we can never get back.

Two thousand years later, we're still learning this lesson.`,
    account: 'onde',
    type: 'citazione',
    metadata: { author: 'Seneca', source: 'On the Shortness of Life' }
  },
  {
    text: `Epictetus was born a slave. He couldn't read. He had nothing.

And yet he became one of the greatest philosophers in history.

"It's not what happens to you, but how you react to it that matters."

Some people are born with advantages. Others build themselves from nothing.

The second kind often understands life better.`,
    account: 'onde',
    type: 'citazione',
    metadata: { author: 'Epictetus', source: 'Enchiridion' }
  },
  {
    text: `In a letter to his friend Lucilius, Seneca wrote something that still stops me:

"Life is long, if you know how to use it."

Nine words. Two thousand years old.

Most people complain about not having enough time. Seneca suggests maybe we just don't know how to spend the time we have.

What would change if we really believed this?`,
    account: 'onde',
    type: 'citazione',
    metadata: { author: 'Seneca', source: 'Letters to Lucilius' }
  },
  {
    text: `Marcus Aurelius, to himself:

"The impediment to action advances action. What stands in the way becomes the way."

Three words that have traveled through millennia: The obstacle is the way.

Every problem contains its own solution. Every difficulty teaches something essential.

The Stoics understood this. We're still learning.`,
    account: 'onde',
    type: 'citazione',
    metadata: { author: 'Marcus Aurelius', source: 'Meditations' }
  },
  {
    text: `Seneca once wrote:

"Luck is what happens when preparation meets opportunity."

We call it luck when someone succeeds. But watch closely — behind every "overnight success" there are years of invisible work.

The lucky ones aren't lucky. They were just ready when the moment came.`,
    account: 'onde',
    type: 'citazione',
    metadata: { author: 'Seneca' }
  },
  {
    text: `Here's something Seneca noticed two thousand years ago:

"We suffer more often in imagination than in reality."

How much of your worry is about things that never happen? How many sleepless nights for problems that solve themselves?

The Stoics didn't have anxiety medication. They had philosophy. And sometimes, that's enough.`,
    account: 'onde',
    type: 'citazione',
    metadata: { author: 'Seneca', source: 'Letters to Lucilius' }
  },
  {
    text: `Epictetus taught that we should focus only on what we can control.

"Some things are within our power, while others are not."

Simple idea. Revolutionary practice.

You can't control the weather. You can control how you dress.
You can't control others' opinions. You can control your actions.
You can't control the past. You can control what you do next.

Freedom begins with this distinction.`,
    account: 'onde',
    type: 'citazione',
    metadata: { author: 'Epictetus', source: 'Enchiridion' }
  },
];

const ONDE_DIETRO_LE_QUINTE: Omit<ContentItem, 'id' | 'status'>[] = [
  {
    text: `This morning I spent two hours choosing a font for a children's poetry book.

It might seem like a small thing. But fonts speak before words do.

A rounded font says "this is playful." A serif font says "this is serious."

For a children's book, you need something in between — something that says "this matters, but it's also fun."

The invisible choices are often the most important ones.`,
    account: 'onde',
    type: 'dietro_le_quinte'
  },
  {
    text: `Today at the publishing house: reading a nursery rhyme out loud for the fifth time.

Not because there are mistakes. But because rhythm matters.

When a child reads aloud, every syllable counts. Every pause. Every breath.

A good children's poem isn't just read — it's felt. It becomes a song in the mouth.

That's what we're looking for. That moment when words become music.`,
    account: 'onde',
    type: 'dietro_le_quinte'
  },
  {
    text: `We spent all day on one translation today.

The challenge: some Italian words have no English equivalent. Some feelings exist in one language but not another.

The solution isn't to find the perfect word. It's to find the perfect feeling.

You can't always translate words. But you can always translate meaning.`,
    account: 'onde',
    type: 'dietro_le_quinte'
  },
  {
    text: `We're working on a book that explains AI to children.

The challenge: how do you talk about technology without losing the magic?

A robot can be a friend. Science can be poetry. The future can be exciting instead of scary.

The best explanations don't just inform — they inspire wonder.

That's what we're trying to create.`,
    account: 'onde',
    type: 'dietro_le_quinte'
  },
  {
    text: `Today: choosing a book cover.

We rejected twelve versions. The thirteenth felt close. We remade it anyway.

The fourteenth was the one.

A cover has three seconds to tell a story. Three seconds to make a promise.

That's why it takes so long to get right.`,
    account: 'onde',
    type: 'dietro_le_quinte'
  },
  {
    text: `7 AM. First draft of a new book.

The beginning of any book is the hardest part. Not because it's difficult to write — but because it makes a promise.

Every first sentence says: "Here's what this book will give you."

And then you have to deliver on that promise for every page that follows.

No pressure.`,
    account: 'onde',
    type: 'dietro_le_quinte'
  },
  {
    text: `We tested our illustrations with actual children today.

They noticed things we didn't see. They missed things we thought were obvious.

There's no substitute for the real audience. The people you're creating for will always surprise you.

Best feedback session we've ever had.`,
    account: 'onde',
    type: 'dietro_le_quinte'
  },
];

const ONDE_RIFLESSIONI: Omit<ContentItem, 'id' | 'status'>[] = [
  {
    text: `A children's book is not a simple book.

It's a book that has to say complex things with simple words.

It takes more work, not less. More thought, not less. More craft, not less.

The hardest writing looks the easiest.`,
    account: 'onde',
    type: 'riflessione'
  },
  {
    text: `What's the difference between a book and a good book?

A good book makes you think even after you close it.

The story ends. The questions don't.`,
    account: 'onde',
    type: 'riflessione'
  },
  {
    text: `Every illustration tells a story that words don't say.

There's a silent conversation between text and image. When it works, the reader doesn't even notice.

That's the goal — to create something so natural it becomes invisible.`,
    account: 'onde',
    type: 'riflessione'
  },
  {
    text: `Publishing a book is like sending a message in a bottle.

You don't know who will find it. You don't know when.

But you hope it reaches someone who needed exactly those words, at exactly that moment.

Sometimes it does. And that makes everything worth it.`,
    account: 'onde',
    type: 'riflessione'
  },
  {
    text: `Children's poetry is the hardest form.

It has to be simple without being shallow.
Musical without being artificial.
Deep without being heavy.

Anyone can write complicated poetry for adults.

But writing something a child will remember forever? That's art.`,
    account: 'onde',
    type: 'riflessione'
  },
  {
    text: `Children's books are also for adults.

Sometimes, especially for adults.

Children already know many of the things we've forgotten. The books remind us.`,
    account: 'onde',
    type: 'riflessione'
  },
  {
    text: `Reading to a child before bed isn't just a habit.

It's a ritual. And rituals build people.

The stories we hear as children become the foundation of who we become.

Choose them carefully.`,
    account: 'onde',
    type: 'riflessione'
  },
];

const FRH_PROGRESS: Omit<ContentItem, 'id' | 'status'>[] = [
  {
    text: `The trading bot lost $45 in paper trading last week.

Today I added a system that analyzes its own mistakes and adjusts automatically.

It's basically teaching itself. Learning from failure. Getting better with each error.

Let's see if it learns from its mistakes better than I do.

(The answer is probably yes.)`,
    account: 'frh',
    type: 'progress'
  },
  {
    text: `This morning: fixing a bug in the notification system.

The problem? It worked too well.

50 notifications in 10 minutes. Technically correct. Practically unbearable.

Sometimes the bug isn't that something doesn't work. It's that it works exactly as you designed it — and your design was wrong.`,
    account: 'frh',
    type: 'progress'
  },
  {
    text: `Three days to make one feature work.

It seemed simple when I started. "Should take an hour," I thought.

Narrator: It did not take an hour.

The lesson: simple in theory is often complex in practice.

The code doesn't care about your estimates.`,
    account: 'frh',
    type: 'progress'
  },
  {
    text: `The auto-posting system finally works.

Every day at 21:30, the bot scans what we built, picks the most interesting thing, and tells the world.

While I sleep, it works.

We live in strange times. And I kind of love it.`,
    account: 'frh',
    type: 'progress'
  },
  {
    text: `Today: refactoring code I wrote yesterday.

When you write code at 2 AM, it always seems brilliant.

In the light of day? Less so.

The best programmers aren't the ones who never write bad code. They're the ones willing to admit it and fix it.`,
    account: 'frh',
    type: 'progress'
  },
  {
    text: `Milestone: 50 paper trades without a critical error.

It's not glamorous. It's not exciting. No one throws a party for "didn't break for a while."

But that's what progress looks like most of the time. Small wins. Quiet improvements. One step at a time.`,
    account: 'frh',
    type: 'progress'
  },
];

const FRH_LESSONS: Omit<ContentItem, 'id' | 'status'>[] = [
  {
    text: `Lesson learned today: never trust mock data.

The bot worked perfectly with fake data. Beautiful. Flawless.

In production? It discovered that real-world data is weird. Messy. Unpredictable.

The simulation is never the real thing. The map is never the territory.

Always test with reality.`,
    account: 'frh',
    type: 'lesson'
  },
  {
    text: `Something nobody tells you about software development:

90% of the time is spent figuring out why something doesn't work.
10% of the time is spent actually writing code.

Today was a 95% day.

And that's okay. That's the job.`,
    account: 'frh',
    type: 'lesson'
  },
  {
    text: `Spent 4 hours debugging an error.

The problem: a typo. One letter. That's it.

The lesson: complex problems often have simple solutions.

Also: maybe I just needed coffee. Hard to say.`,
    account: 'frh',
    type: 'lesson'
  },
  {
    text: `This week's lesson: automate first, optimize later.

An imperfect system that runs is better than a perfect system on paper.

Ship it. Learn from it. Improve it.

Perfection is the enemy of progress.`,
    account: 'frh',
    type: 'lesson'
  },
  {
    text: `Today I deleted more code than I wrote.

And it felt great.

Sometimes the best solution is subtraction, not addition. Removing complexity instead of adding it.

Simplicity is hard. But it's worth it.`,
    account: 'frh',
    type: 'lesson'
  },
  {
    text: `Interesting bug: the system only worked on Tuesdays.

The reason: a test I wrote 6 months ago, incorrectly.

The code has a long memory. Every shortcut comes back eventually.

Write tests like someone else will read them. (Because future you is someone else.)`,
    account: 'frh',
    type: 'lesson'
  },
];

const FRH_TOOLS: Omit<ContentItem, 'id' | 'status'>[] = [
  {
    text: `Today's stack: TypeScript, Claude API, Telegram Bot.

Not the newest. Not the trendiest.

But you know what? It works. It's reliable. It does the job.

Sometimes the best thing you can say about a technology is: it gets out of the way.`,
    account: 'frh',
    type: 'tool'
  },
  {
    text: `Automation of the week: automatic posting at 21:30.

The bot scans the day's commits, picks the most interesting one, writes a post about it.

I sleep. It works.

The future is strange. Machines talking about what machines built.

And somehow, it's kind of beautiful.`,
    account: 'frh',
    type: 'tool'
  },
  {
    text: `Tool discovery: paper trading for testing strategies.

Fake money. Real lessons.

It's the best way to learn without paying full price for your mistakes.

Every trader should start here. Every developer too, in their own way.`,
    account: 'frh',
    type: 'tool'
  },
  {
    text: `I built a bot that writes commit messages.

Then I built a bot that reads those commit messages and posts about them on Twitter.

Bots talking about bots. Meta-automation.

We live in interesting times.`,
    account: 'frh',
    type: 'tool'
  },
  {
    text: `Today: connecting 3 different APIs into one flow.

Every API has its own rules. Its own quirks. Its own way of failing.

Integration is like being a translator between languages that don't quite match.

When it works, it feels like magic. When it doesn't... well, there's always tomorrow.`,
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

export function loadContentQueue(): ContentQueue {
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

  // Clear and rebuild the queue with new content
  const queue: ContentQueue = { onde: [], frh: [], lastPosted: { onde: null, frh: null } };

  // Add Onde content
  const allOndeContent = [
    ...ONDE_CITAZIONI,
    ...ONDE_DIETRO_LE_QUINTE,
    ...ONDE_RIFLESSIONI,
  ];

  const shuffledOnde = allOndeContent.sort(() => Math.random() - 0.5);
  for (const item of shuffledOnde) {
    queue.onde.push({
      ...item,
      id: generateId(),
      status: 'queued',
    });
  }
  log(`Added ${shuffledOnde.length} items to Onde queue`);

  // Add FRH content
  const allFrhContent = [
    ...FRH_PROGRESS,
    ...FRH_LESSONS,
    ...FRH_TOOLS,
  ];

  const shuffledFrh = allFrhContent.sort(() => Math.random() - 0.5);
  for (const item of shuffledFrh) {
    queue.frh.push({
      ...item,
      id: generateId(),
      status: 'queued',
    });
  }
  log(`Added ${shuffledFrh.length} items to FRH queue`);

  saveContentQueue(queue);
  log(`Queue initialized: ${queue.onde.length} Onde, ${queue.frh.length} FRH items`);
}

export function getNextContent(account: 'onde' | 'frh'): ContentItem | null {
  const queue = loadContentQueue();
  const items = account === 'onde' ? queue.onde : queue.frh;

  const next = items.find(item => item.status === 'queued');

  if (!next) {
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
  const targetAccount = fromAccount === 'onde' ? 'frh' : 'onde';

  try {
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
    const accountLabel = account === 'onde' ? '@Onde_FRH' : '@FreeRiverHouse';
    await sendTelegramNotification(
      `📤 *Post Automatico - ${accountLabel}*\n\n"${content.text.substring(0, 100)}..."\n\n${result.url}`
    );

    await crossEngage(result.url, account);
  } else {
    await sendTelegramNotification(
      `❌ *Errore Post ${account}*\n\n${result.error}`
    );
  }
}

export function checkSchedule(): { account: 'onde' | 'frh'; shouldPost: boolean }[] {
  const now = new Date();
  const cetHour = (now.getUTCHours() + 1) % 24;
  const cetMinute = now.getUTCMinutes();

  const results: { account: 'onde' | 'frh'; shouldPost: boolean }[] = [];

  for (const schedule of POSTING_SCHEDULES) {
    const targetMinutes = schedule.hour * 60 + schedule.minute;
    const currentMinutes = cetHour * 60 + cetMinute;
    const diff = Math.abs(targetMinutes - currentMinutes);

    if (diff <= 5) {
      const queue = loadContentQueue();
      const lastPosted = queue.lastPosted[schedule.account];

      if (lastPosted) {
        const lastPostTime = new Date(lastPosted);
        const hoursSinceLastPost = (now.getTime() - lastPostTime.getTime()) / (1000 * 60 * 60);

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

  schedulerInterval = setInterval(async () => {
    const toPost = checkSchedule();

    for (const { account, shouldPost } of toPost) {
      if (shouldPost) {
        await runScheduledPost(account);
      }
    }
  }, 60 * 1000);

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
    process.on('SIGINT', () => {
      stopScheduler();
      process.exit(0);
    });
  } else {
    console.log(`
Content Scheduler - Warm & Inspiring English Content

Commands:
  init    - Initialize content queue with fresh content
  post    - Post immediately (npx ts-node content-scheduler.ts post <onde|frh>)
  status  - Show queue status
  start   - Start the scheduler (runs continuously)

Schedule:
  Onde: 9:00, 14:00, 20:00 CET
  FRH:  10:00, 15:00, 21:00 CET
`);
  }
}
