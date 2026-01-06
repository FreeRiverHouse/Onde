import { TwitterApi } from 'twitter-api-v2';
import * as fs from 'fs';
import * as path from 'path';

export interface AccountMetrics {
  timestamp: Date;
  account: string;
  followers: number;
  following: number;
  tweets: number;
  listed: number;
}

export interface TweetMetrics {
  id: string;
  text: string;
  createdAt: Date;
  likes: number;
  retweets: number;
  replies: number;
  impressions?: number;
  engagementRate?: number;
}

export interface DailyReport {
  date: string;
  account: string;
  metrics: AccountMetrics;
  previousMetrics?: AccountMetrics;
  changes: {
    followers: number;
    following: number;
    tweets: number;
  };
  topTweets: TweetMetrics[];
  engagementSummary: {
    totalLikes: number;
    totalRetweets: number;
    totalReplies: number;
    avgEngagement: number;
  };
}

const DATA_DIR = path.join(__dirname, '../data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getMetricsFilePath(account: string): string {
  return path.join(DATA_DIR, `${account}_metrics.json`);
}

function loadMetricsHistory(account: string): AccountMetrics[] {
  const filePath = getMetricsFilePath(account);
  if (fs.existsSync(filePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      return data.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
    } catch {
      return [];
    }
  }
  return [];
}

function saveMetricsHistory(account: string, metrics: AccountMetrics[]): void {
  const filePath = getMetricsFilePath(account);
  fs.writeFileSync(filePath, JSON.stringify(metrics, null, 2));
}

export async function fetchAccountMetrics(
  client: TwitterApi,
  username: string
): Promise<AccountMetrics> {
  const user = await client.v2.userByUsername(username, {
    'user.fields': ['public_metrics', 'created_at'],
  });

  if (!user.data) {
    throw new Error(`User ${username} not found`);
  }

  const metrics = user.data.public_metrics;

  return {
    timestamp: new Date(),
    account: username,
    followers: metrics?.followers_count || 0,
    following: metrics?.following_count || 0,
    tweets: metrics?.tweet_count || 0,
    listed: metrics?.listed_count || 0,
  };
}

export async function fetchRecentTweets(
  client: TwitterApi,
  username: string,
  limit: number = 10
): Promise<TweetMetrics[]> {
  const user = await client.v2.userByUsername(username);
  if (!user.data) {
    throw new Error(`User ${username} not found`);
  }

  const tweets = await client.v2.userTimeline(user.data.id, {
    max_results: limit,
    'tweet.fields': ['public_metrics', 'created_at'],
  });

  return tweets.data.data?.map((tweet) => ({
    id: tweet.id,
    text: tweet.text.substring(0, 100) + (tweet.text.length > 100 ? '...' : ''),
    createdAt: new Date(tweet.created_at!),
    likes: tweet.public_metrics?.like_count || 0,
    retweets: tweet.public_metrics?.retweet_count || 0,
    replies: tweet.public_metrics?.reply_count || 0,
  })) || [];
}

export async function generateDailyReport(
  client: TwitterApi,
  username: string
): Promise<DailyReport> {
  // Fetch current metrics
  const currentMetrics = await fetchAccountMetrics(client, username);

  // Load history and get previous day's metrics
  const history = loadMetricsHistory(username);
  const yesterday = history.length > 0 ? history[history.length - 1] : undefined;

  // Save current metrics to history
  history.push(currentMetrics);
  // Keep only last 90 days
  const trimmedHistory = history.slice(-90);
  saveMetricsHistory(username, trimmedHistory);

  // Fetch recent tweets for engagement analysis
  const recentTweets = await fetchRecentTweets(client, username, 20);

  // Calculate changes
  const changes = {
    followers: yesterday ? currentMetrics.followers - yesterday.followers : 0,
    following: yesterday ? currentMetrics.following - yesterday.following : 0,
    tweets: yesterday ? currentMetrics.tweets - yesterday.tweets : 0,
  };

  // Calculate engagement summary
  const totalLikes = recentTweets.reduce((sum, t) => sum + t.likes, 0);
  const totalRetweets = recentTweets.reduce((sum, t) => sum + t.retweets, 0);
  const totalReplies = recentTweets.reduce((sum, t) => sum + t.replies, 0);
  const avgEngagement = recentTweets.length > 0
    ? (totalLikes + totalRetweets + totalReplies) / recentTweets.length
    : 0;

  // Top tweets by engagement
  const topTweets = [...recentTweets]
    .sort((a, b) => (b.likes + b.retweets + b.replies) - (a.likes + a.retweets + a.replies))
    .slice(0, 5);

  return {
    date: new Date().toISOString().split('T')[0],
    account: username,
    metrics: currentMetrics,
    previousMetrics: yesterday,
    changes,
    topTweets,
    engagementSummary: {
      totalLikes,
      totalRetweets,
      totalReplies,
      avgEngagement,
    },
  };
}

export function formatReportMessage(report: DailyReport): string {
  const sign = (n: number) => (n >= 0 ? '+' : '') + n;

  let msg = `📊 *REPORT @${report.account}*\n`;
  msg += `📅 ${report.date}\n\n`;

  msg += `👥 *Followers:* ${report.metrics.followers}`;
  if (report.changes.followers !== 0) {
    msg += ` (${sign(report.changes.followers)})`;
  }
  msg += '\n';

  msg += `📝 *Tweet:* ${report.metrics.tweets}`;
  if (report.changes.tweets !== 0) {
    msg += ` (${sign(report.changes.tweets)} nuovi)`;
  }
  msg += '\n\n';

  msg += `📈 *Engagement (ultimi 20 tweet):*\n`;
  msg += `   ❤️ ${report.engagementSummary.totalLikes} like\n`;
  msg += `   🔄 ${report.engagementSummary.totalRetweets} retweet\n`;
  msg += `   💬 ${report.engagementSummary.totalReplies} reply\n`;
  msg += `   📊 Media: ${report.engagementSummary.avgEngagement.toFixed(1)}/tweet\n\n`;

  if (report.topTweets.length > 0) {
    msg += `🏆 *Top Tweet:*\n`;
    const top = report.topTweets[0];
    msg += `"${top.text}"\n`;
    msg += `❤️${top.likes} 🔄${top.retweets} 💬${top.replies}\n`;
  }

  return msg;
}

export function getWeeklyTrend(account: string): {
  trend: 'up' | 'down' | 'stable';
  weeklyGrowth: number;
  dailyAvg: number;
} {
  const history = loadMetricsHistory(account);

  if (history.length < 7) {
    return { trend: 'stable', weeklyGrowth: 0, dailyAvg: 0 };
  }

  const lastWeek = history.slice(-7);
  const weekStart = lastWeek[0].followers;
  const weekEnd = lastWeek[lastWeek.length - 1].followers;
  const weeklyGrowth = weekEnd - weekStart;
  const dailyAvg = weeklyGrowth / 7;

  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (weeklyGrowth > 5) trend = 'up';
  else if (weeklyGrowth < -5) trend = 'down';

  return { trend, weeklyGrowth, dailyAvg };
}
