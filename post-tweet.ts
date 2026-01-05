import { TwitterApi } from 'twitter-api-v2';
import * as dotenv from 'dotenv';

dotenv.config();

async function postTweet() {
  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY!,
    appSecret: process.env.TWITTER_API_SECRET!,
    accessToken: process.env.TWITTER_ACCESS_TOKEN!,
    accessSecret: process.env.TWITTER_ACCESS_SECRET!,
  });

  const tweet = `Hello World! 👋

We're Free River House, a digital software house building apps with the help of AI.

Currently crafting cool stuff with @AnthropicAI's Claude.

Stay tuned for what's coming! 🚀

#buildinpublic #ai #indiedev`;

  console.log('📝 Posting tweet:\n');
  console.log(tweet);
  console.log('\n---');

  try {
    const result = await client.v2.tweet(tweet);
    console.log('\n✅ Tweet posted successfully!');
    console.log(`🔗 https://x.com/FreeRiverHouse/status/${result.data.id}`);
  } catch (error: any) {
    console.error('\n❌ Failed to post tweet');
    console.error('Error:', error.message);
  }
}

postTweet();
