import { TwitterApi } from 'twitter-api-v2';
import * as dotenv from 'dotenv';

dotenv.config();

async function testOndeAccount() {
  const client = new TwitterApi({
    appKey: process.env.X_ONDE_API_KEY!,
    appSecret: process.env.X_ONDE_API_SECRET!,
    accessToken: process.env.X_ONDE_ACCESS_TOKEN!,
    accessSecret: process.env.X_ONDE_ACCESS_SECRET!,
  });

  try {
    // Verify credentials
    const me = await client.v2.me();
    console.log('✅ Onde account connected!');
    console.log(`   Username: @${me.data.username}`);
    console.log(`   Name: ${me.data.name}`);
    console.log(`   ID: ${me.data.id}`);

    return true;
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.data) {
      console.error('   Details:', JSON.stringify(error.data, null, 2));
    }
    return false;
  }
}

testOndeAccount();
