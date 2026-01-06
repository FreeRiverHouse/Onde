import { TwitterApi } from 'twitter-api-v2';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

interface ThreadTweet {
  text: string;
  media?: string[]; // Array of file paths to images
}

async function postThreadWithMedia(tweets: ThreadTweet[]) {
  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY!,
    appSecret: process.env.TWITTER_API_SECRET!,
    accessToken: process.env.TWITTER_ACCESS_TOKEN!,
    accessSecret: process.env.TWITTER_ACCESS_SECRET!,
  });

  try {
    let lastTweetId: string | null = null;

    for (let i = 0; i < tweets.length; i++) {
      const tweet = tweets[i];
      const options: any = {};

      // If this is a reply in the thread
      if (lastTweetId) {
        options.reply = { in_reply_to_tweet_id: lastTweetId };
      }

      // Upload media if present
      if (tweet.media && tweet.media.length > 0) {
        const mediaIds: string[] = [];

        for (const mediaPath of tweet.media) {
          if (fs.existsSync(mediaPath)) {
            console.log(`   📤 Uploading: ${path.basename(mediaPath)}...`);
            const mediaId = await client.v1.uploadMedia(mediaPath);
            mediaIds.push(mediaId);
            console.log(`   ✅ Uploaded: ${mediaId}`);
          } else {
            console.warn(`   ⚠️ File not found: ${mediaPath}`);
          }
        }

        if (mediaIds.length > 0) {
          options.media = { media_ids: mediaIds };
        }
      }

      const result = await client.v2.tweet(tweet.text, options);
      lastTweetId = result.data.id;

      console.log(`✅ Tweet ${i + 1}/${tweets.length} posted!`);
      console.log(`   URL: https://x.com/FreeRiverHouse/status/${result.data.id}`);

      // Small delay between tweets to avoid rate limits
      if (i < tweets.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log('\n🎉 Thread posted successfully!');
    return lastTweetId;

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.data) {
      console.error('   Details:', JSON.stringify(error.data, null, 2));
    }
    throw error;
  }
}

// Base path for PR materials
const PR_PATH = '/Users/mattiapetrucciani/Documents/Free River/House/OndePR';

// Thread content with media
const thread: ThreadTweet[] = [
  {
    text: `Day 1 of building in public.

A few things we worked on today! 🧵`
  },
  {
    text: `PolyRoborto — a Polymarket copy trading bot.

Today we added stop-loss, take-profit, and position limits.

Win rate: started at 45.7%, now at 50%. Still learning!

Paper trading for now.`,
    media: [
      `${PR_PATH}/Screenshot 2026-01-05 at 3.31.01 PM.png`,
      `${PR_PATH}/Screenshot 2026-01-05 at 15.35.20.jpeg`
    ]
  },
  {
    text: `Launched @Onde_FRH — a small publishing project.

Tech, spirituality, art.

First ebook coming soon!`
  },
  {
    text: `Some games in progress:

• A VR thing for Quest
• KidsChefStudio for iPad
• KidsMusicStudio for kids

All Unity. All early stage.`
  },
  {
    text: `Stack: Claude Code, TypeScript, Python, Unity.

Mostly experimenting. Seeing what sticks.

More tomorrow!`
  }
];

postThreadWithMedia(thread);
