import { TwitterApi } from 'twitter-api-v2';
import * as dotenv from 'dotenv';

dotenv.config();

async function postHelloWorld() {
  const client = new TwitterApi({
    appKey: process.env.X_ONDE_API_KEY!,
    appSecret: process.env.X_ONDE_API_SECRET!,
    accessToken: process.env.X_ONDE_ACCESS_TOKEN!,
    accessSecret: process.env.X_ONDE_ACCESS_SECRET!,
  });

  const tweet = `Hello world.

We are Onde — a digital publishing house at the intersection of technology, spirituality, and art.

Our first ebook is coming very soon.

Stay tuned.`;

  try {
    const result = await client.v2.tweet(tweet);
    console.log('✅ Tweet posted!');
    console.log(`   URL: https://x.com/Onde_FRH/status/${result.data.id}`);
    return result;
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.data) {
      console.error('   Details:', JSON.stringify(error.data, null, 2));
    }
    throw error;
  }
}

postHelloWorld();
