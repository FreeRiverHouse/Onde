#!/usr/bin/env npx ts-node
/**
 * Test with Magmatic credentials (may have Premium)
 */
import { TwitterApi } from 'twitter-api-v2';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

async function testMagmatic() {
  console.log('=== Magmatic Credentials Test ===');
  console.log('Date:', new Date().toISOString());

  const credentials = {
    appKey: process.env.X_MAGMATIC_API_KEY!,
    appSecret: process.env.X_MAGMATIC_API_SECRET!,
    accessToken: process.env.X_MAGMATIC_ACCESS_TOKEN!,
    accessSecret: process.env.X_MAGMATIC_ACCESS_SECRET!,
  };

  console.log('\nCredentials (Magmatic):');
  console.log('- API Key:', credentials.appKey?.substring(0, 8) + '***');
  console.log('- Access Token:', credentials.accessToken?.substring(0, 15) + '***');

  const client = new TwitterApi(credentials);

  console.log('\n--- Test: v1.1 verify_credentials ---');
  try {
    const user = await client.v1.verifyCredentials();
    console.log('SUCCESS! User:', user.screen_name);
    console.log('User ID:', user.id_str);
  } catch (error: any) {
    console.log('FAILED:', error.code, error.message);
    if (error.data) {
      console.log('Error data:', JSON.stringify(error.data));
    }
  }

  console.log('\n--- Test: v2 tweet ---');
  const testMessage = `Test from Magmatic ${new Date().toISOString().slice(11,19)}`;
  try {
    const tweet = await client.v2.tweet(testMessage);
    console.log('SUCCESS! Tweet ID:', tweet.data.id);
    console.log('URL: https://x.com/magmatic__/status/' + tweet.data.id);
  } catch (error: any) {
    console.log('FAILED:', error.code, error.message);
    if (error.data) {
      console.log('Error data:', JSON.stringify(error.data));
    }
  }
}

testMagmatic();
