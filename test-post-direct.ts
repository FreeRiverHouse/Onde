#!/usr/bin/env npx ts-node
/**
 * Direct POST test with detailed error logging
 */
import { TwitterApi } from 'twitter-api-v2';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

async function testPost() {
  console.log('=== Direct POST Test ===');
  console.log('Date:', new Date().toISOString());

  const credentials = {
    appKey: process.env.TWITTER_API_KEY!,
    appSecret: process.env.TWITTER_API_SECRET!,
    accessToken: process.env.TWITTER_ACCESS_TOKEN!,
    accessSecret: process.env.TWITTER_ACCESS_SECRET!,
  };

  console.log('\nCredentials:');
  console.log('- API Key:', credentials.appKey?.substring(0, 10) + '...' + credentials.appKey?.slice(-5));
  console.log('- API Secret:', credentials.appSecret?.substring(0, 10) + '...' + credentials.appSecret?.slice(-5));
  console.log('- Access Token:', credentials.accessToken?.substring(0, 10) + '...' + credentials.accessToken?.slice(-5));
  console.log('- Access Secret:', credentials.accessSecret?.substring(0, 10) + '...' + credentials.accessSecret?.slice(-5));

  const client = new TwitterApi(credentials);

  // Test 1: Try to get authenticated user info
  console.log('\n--- Test 1: Get user info ---');
  try {
    const me = await client.v2.me();
    console.log('SUCCESS! User:', me.data.username);
  } catch (error: any) {
    console.log('FAILED:', error.code, error.message);
    if (error.data) {
      console.log('Error data:', JSON.stringify(error.data));
    }
    if (error.headers) {
      console.log('Response headers:', JSON.stringify(Object.fromEntries(error.headers.entries())));
    }
  }

  // Test 2: Try to post (will only execute if test 1 succeeded or for debugging)
  console.log('\n--- Test 2: Try posting ---');
  const testMessage = `API Test ${new Date().toISOString().slice(0,19)}`;
  try {
    const tweet = await client.v2.tweet(testMessage);
    console.log('SUCCESS! Tweet ID:', tweet.data.id);
    console.log('URL: https://x.com/i/status/' + tweet.data.id);
  } catch (error: any) {
    console.log('FAILED:', error.code, error.message);
    if (error.data) {
      console.log('Error data:', JSON.stringify(error.data));
    }
  }
}

testPost();
