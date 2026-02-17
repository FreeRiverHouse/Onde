import { TwitterApi } from 'twitter-api-v2';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env') });

// Initialize clients for all 3 accounts
const frhClient = new TwitterApi({
  appKey: process.env.X_FREERIVERHOUSE_API_KEY!,
  appSecret: process.env.X_FREERIVERHOUSE_API_SECRET!,
  accessToken: process.env.X_FREERIVERHOUSE_ACCESS_TOKEN!,
  accessSecret: process.env.X_FREERIVERHOUSE_ACCESS_SECRET!,
});

const ondeClient = new TwitterApi({
  appKey: process.env.X_ONDE_API_KEY!,
  appSecret: process.env.X_ONDE_API_SECRET!,
  accessToken: process.env.X_ONDE_ACCESS_TOKEN!,
  accessSecret: process.env.X_ONDE_ACCESS_SECRET!,
});

const magmaticClient = new TwitterApi({
  appKey: process.env.X_MAGMATIC_API_KEY!,
  appSecret: process.env.X_MAGMATIC_API_SECRET!,
  accessToken: process.env.X_MAGMATIC_ACCESS_TOKEN!,
  accessSecret: process.env.X_MAGMATIC_ACCESS_SECRET!,
});

// Account IDs (will be fetched)
interface AccountInfo {
  name: string;
  client: TwitterApi;
  userId?: string;
}

const accounts: Record<string, AccountInfo> = {
  frh: { name: 'FreeRiverHouse', client: frhClient },
  onde: { name: 'Onde_FRH', client: ondeClient },
  magmatic: { name: 'magmatic__', client: magmaticClient },
};

async function getAccountIds() {
  for (const [key, account] of Object.entries(accounts)) {
    try {
      const me = await account.client.v2.me();
      account.userId = me.data.id;
      console.log(`✓ ${account.name}: ${account.userId}`);
    } catch (e: any) {
      console.error(`✗ ${account.name}: ${e.message}`);
    }
  }
}

async function getRecentTweets(account: AccountInfo, count: number = 5) {
  if (!account.userId) return [];

  try {
    const tweets = await account.client.v2.userTimeline(account.userId, {
      max_results: count,
      'tweet.fields': ['created_at', 'text'],
    });
    return tweets.data.data || [];
  } catch (e: any) {
    console.error(`Error fetching tweets for ${account.name}: ${e.message}`);
    return [];
  }
}

async function likeTweet(likerAccount: AccountInfo, tweetId: string) {
  if (!likerAccount.userId) return false;

  try {
    await likerAccount.client.v2.like(likerAccount.userId, tweetId);
    return true;
  } catch (e: any) {
    if (e.message?.includes('already liked')) return true; // Already liked
    console.error(`Like error: ${e.message}`);
    return false;
  }
}

async function retweet(retweeterAccount: AccountInfo, tweetId: string) {
  if (!retweeterAccount.userId) return false;

  try {
    await retweeterAccount.client.v2.retweet(retweeterAccount.userId, tweetId);
    return true;
  } catch (e: any) {
    if (e.message?.includes('already retweeted')) return true;
    console.error(`Retweet error: ${e.message}`);
    return false;
  }
}

async function crossEngage() {
  console.log('\n🔄 Cross-Engagement Script\n');
  console.log('Fetching account IDs...');
  await getAccountIds();

  console.log('\n--- Recent Tweets ---\n');

  // Get recent tweets from each account
  const allTweets: { account: string; tweets: any[] }[] = [];

  for (const [key, account] of Object.entries(accounts)) {
    const tweets = await getRecentTweets(account);
    allTweets.push({ account: key, tweets });

    console.log(`\n@${account.name}:`);
    tweets.slice(0, 3).forEach((t, i) => {
      console.log(`  ${i + 1}. ${t.text.slice(0, 80)}...`);
      console.log(`     ID: ${t.id}`);
    });
  }

  console.log('\n--- Cross-Engagement ---\n');

  // Cross-like: each account likes the others' most recent tweet
  for (const [posterKey, posterAccount] of Object.entries(accounts)) {
    const posterTweets = allTweets.find(t => t.account === posterKey)?.tweets || [];
    if (posterTweets.length === 0) continue;

    const latestTweet = posterTweets[0];

    for (const [likerKey, likerAccount] of Object.entries(accounts)) {
      if (likerKey === posterKey) continue; // Don't like own tweets

      const liked = await likeTweet(likerAccount, latestTweet.id);
      if (liked) {
        console.log(`♥ @${likerAccount.name} liked @${posterAccount.name}'s tweet`);
      }
    }
  }

  // Check for repost opportunities
  console.log('\n--- Repost Check ---\n');

  const frhTweets = allTweets.find(t => t.account === 'frh')?.tweets || [];
  for (const tweet of frhTweets) {
    // If FRH mentions Onde, Onde should repost
    if (tweet.text.toLowerCase().includes('onde') || tweet.text.includes('@Onde_FRH')) {
      console.log(`📢 FRH mentioned Onde - Onde should repost`);
      const retweeted = await retweet(accounts.onde, tweet.id);
      if (retweeted) {
        console.log(`🔁 @Onde_FRH retweeted FRH's post about Onde`);
      }
    }
  }

  console.log('\n✅ Cross-engagement complete!\n');
}

// Run
crossEngage().catch(console.error);
