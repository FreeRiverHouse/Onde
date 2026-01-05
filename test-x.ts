import { TwitterApi } from 'twitter-api-v2';
import * as dotenv from 'dotenv';

dotenv.config();

async function testXConnection() {
  console.log('🔄 Testing X/Twitter connection...\n');

  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY!,
    appSecret: process.env.TWITTER_API_SECRET!,
    accessToken: process.env.TWITTER_ACCESS_TOKEN!,
    accessSecret: process.env.TWITTER_ACCESS_SECRET!,
  });

  try {
    // Verify credentials
    const me = await client.v2.me();
    console.log('✅ Connection successful!');
    console.log(`📱 Account: @${me.data.username}`);
    console.log(`👤 Name: ${me.data.name}`);
    console.log(`🆔 ID: ${me.data.id}`);

    return true;
  } catch (error: any) {
    console.error('❌ Connection failed!');
    console.error('Error:', error.message);

    if (error.code === 401) {
      console.log('\n💡 Check: User Authentication Settings → App permissions: Read and Write');
    }

    return false;
  }
}

testXConnection();
