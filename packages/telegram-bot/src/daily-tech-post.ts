#!/usr/bin/env npx ts-node
/**
 * Daily Tech Post - Automated building in public
 *
 * Runs at 21:30 every day:
 * 1. Scans all repos for recent commits
 * 2. Uses Grok to pick the most interesting achievement
 * 3. Posts automatically to @FreeRiverHouse
 *
 * NO APPROVAL NEEDED - fully autonomous
 */

import { TwitterApi } from 'twitter-api-v2';
import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load env
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const XAI_API_KEY = process.env.XAI_API_KEY;
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';

// Telegram for notifications (optional - just logs)
const TELEGRAM_TOKEN = process.env.ONDE_PR_TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.ONDE_PR_CHAT_ID;

// X/Twitter client for @FreeRiverHouse
const frhClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY!,
  appSecret: process.env.TWITTER_API_SECRET!,
  accessToken: process.env.TWITTER_ACCESS_TOKEN!,
  accessSecret: process.env.TWITTER_ACCESS_SECRET!,
});

// Repos to scan
const REPOS = [
  { name: 'KidsChefStudio', path: '/Users/mattiapetrucciani/CascadeProjects/KidsChefStudio', desc: 'Cooking game for kids' },
  { name: 'KidsMusicStudio', path: '/Users/mattiapetrucciani/CascadeProjects/KidsMusicStudio', desc: 'Music creation app for kids' },
  { name: 'KidsGameStudio', path: '/Users/mattiapetrucciani/CascadeProjects/KidsGameStudio', desc: 'Game dev tool for kids' },
  { name: 'PizzaGelatoRush', path: '/Users/mattiapetrucciani/CascadeProjects/PizzaGelatoRush_GitHub', desc: 'Racing game with pizza delivery' },
  { name: 'BusinessIsBusiness', path: '/Users/mattiapetrucciani/CascadeProjects/BusinessIsBusiness', desc: 'VR business sim for Meta Quest' },
  { name: 'Onde', path: '/Users/mattiapetrucciani/CascadeProjects/Onde', desc: 'Digital publishing & PR tools' },
];

// Log file
const LOG_DIR = '/Users/mattiapetrucciani/CascadeProjects/Onde/packages/telegram-bot/logs';
const LOG_FILE = path.join(LOG_DIR, 'daily-tech-post.log');

// Content bank for fallback
const CONTENT_BANK_FILE = '/Users/mattiapetrucciani/CascadeProjects/Onde/packages/telegram-bot/data/tech-content-bank.json';

interface ContentBank {
  lastUsedIndex: number;
  posts: { text: string; topic: string; used: boolean }[];
}

function loadContentBank(): ContentBank {
  try {
    return JSON.parse(fs.readFileSync(CONTENT_BANK_FILE, 'utf-8'));
  } catch {
    return { lastUsedIndex: -1, posts: [] };
  }
}

function saveContentBank(bank: ContentBank) {
  fs.writeFileSync(CONTENT_BANK_FILE, JSON.stringify(bank, null, 2));
}

function getNextFallbackPost(): string | null {
  const bank = loadContentBank();
  const unusedPosts = bank.posts.filter(p => !p.used);

  if (unusedPosts.length === 0) {
    // Reset all posts
    bank.posts.forEach(p => p.used = false);
    saveContentBank(bank);
    return bank.posts[0]?.text || null;
  }

  // Pick random unused post
  const randomIndex = Math.floor(Math.random() * unusedPosts.length);
  const selectedPost = unusedPosts[randomIndex];

  // Mark as used
  const originalIndex = bank.posts.findIndex(p => p.text === selectedPost.text);
  if (originalIndex >= 0) {
    bank.posts[originalIndex].used = true;
  }
  bank.lastUsedIndex = originalIndex;
  saveContentBank(bank);

  return selectedPost.text;
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

interface RepoActivity {
  name: string;
  description: string;
  commits: string[];
  filesChanged: string[];
  lastCommitMessage: string;
  lastCommitTime: string;
  hasActivity: boolean;
}

function getRepoActivity(repo: typeof REPOS[0]): RepoActivity {
  try {
    // Get commits from last 24 hours
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const commits = execSync(
      `cd "${repo.path}" && git log --since="${since}" --oneline 2>/dev/null || echo ""`,
      { encoding: 'utf-8' }
    ).trim().split('\n').filter(Boolean);

    const lastCommitMessage = commits[0] || '';

    // Get last commit time
    let lastCommitTime = '';
    try {
      lastCommitTime = execSync(
        `cd "${repo.path}" && git log -1 --format="%ar" 2>/dev/null || echo "unknown"`,
        { encoding: 'utf-8' }
      ).trim();
    } catch { }

    // Get files changed in last 24h
    let filesChanged: string[] = [];
    try {
      const diff = execSync(
        `cd "${repo.path}" && git diff --name-only HEAD~5 2>/dev/null | head -20 || echo ""`,
        { encoding: 'utf-8' }
      ).trim();
      filesChanged = diff.split('\n').filter(Boolean);
    } catch { }

    return {
      name: repo.name,
      description: repo.desc,
      commits,
      filesChanged,
      lastCommitMessage,
      lastCommitTime,
      hasActivity: commits.length > 0,
    };
  } catch (error) {
    return {
      name: repo.name,
      description: repo.desc,
      commits: [],
      filesChanged: [],
      lastCommitMessage: '',
      lastCommitTime: '',
      hasActivity: false,
    };
  }
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
          content: `You are the PR agent for Free River House, a small indie studio building apps and games.

Your job: Create authentic, humble "building in public" tweets about today's dev work.

Style:
- Casual, real, no corporate speak
- Show the process, not just results
- No excessive emojis (1-2 max)
- Never use "🚀" or startup hype
- Be humble - we're learning as we go
- Max 280 characters
- English language

Examples of good tweets:
- "Fixed a tricky XP calculation bug today. Turns out cumulative thresholds > incremental ones. The little things."
- "Finally got the factory automation working. Code builds, tests run, no human needed. Small wins."
- "Spent the day on test infrastructure. Not glamorous, but the overnight builds will thank me."
- "VR controller mapping took 4 attempts. Sometimes you just gotta try stuff until it works."

Output ONLY the tweet text, nothing else. No quotes, no explanations.`
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

async function postToX(text: string): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const result = await frhClient.v2.tweet(text);
    const url = `https://x.com/FreeRiverHouse/status/${result.data.id}`;
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
  log('=== Daily Tech Post Starting ===');

  // 1. Scan all repos
  log('Scanning repos for activity...');
  const activities = REPOS.map(getRepoActivity);
  const activeRepos = activities.filter(a => a.hasActivity);

  log(`Found activity in ${activeRepos.length}/${REPOS.length} repos`);

  let tweet: string;

  if (activeRepos.length === 0) {
    // No activity today - use content bank fallback
    log('No activity today - using content bank fallback');
    const fallback = getNextFallbackPost();
    if (!fallback) {
      log('Content bank empty - skipping post');
      return;
    }
    tweet = fallback;
    log(`Using fallback: "${tweet}"`);
  } else {
    // 2. Build summary for Grok
    let summary = 'Today\'s development activity:\n\n';

    for (const repo of activities) {
      if (repo.hasActivity) {
        summary += `${repo.name} (${repo.description}):\n`;
        summary += `- ${repo.commits.length} commits\n`;
        summary += `- Last: "${repo.lastCommitMessage.substring(0, 80)}"\n`;
        if (repo.filesChanged.length > 0) {
          summary += `- Files: ${repo.filesChanged.slice(0, 5).join(', ')}\n`;
        }
        summary += '\n';
      }
    }

    summary += '\nPick the most interesting/impressive achievement and write a tweet about it.';

    log('Asking Grok to create tweet...');
    log(`Summary: ${summary.substring(0, 200)}...`);

    // 3. Generate tweet with Grok
    try {
      tweet = await callGrok(summary);
      log(`Generated tweet: "${tweet}"`);
    } catch (error: any) {
      log(`Error generating tweet: ${error.message}`);
      // Fallback to content bank if Grok fails
      const fallback = getNextFallbackPost();
      if (fallback) {
        tweet = fallback;
        log(`Using fallback due to error: "${tweet}"`);
      } else {
        await sendTelegramLog(`❌ Daily Tech Post failed: ${error.message}`);
        return;
      }
    }
  }

  // Validate tweet
  if (!tweet || tweet.length < 10 || tweet.length > 280) {
    log(`Invalid tweet length: ${tweet?.length || 0}`);
    return;
  }

  // 4. Post to X
  log('Posting to @FreeRiverHouse...');
  const result = await postToX(tweet);

  if (result.success) {
    log(`✅ Posted successfully: ${result.url}`);
    await sendTelegramLog(`📤 *Daily Tech Post*\n\n"${tweet}"\n\n${result.url}`);
  } else {
    log(`❌ Failed to post: ${result.error}`);
    await sendTelegramLog(`❌ Daily Tech Post failed: ${result.error}`);
  }

  log('=== Daily Tech Post Complete ===');
}

// Run
main().catch(console.error);
