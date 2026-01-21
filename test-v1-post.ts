#!/usr/bin/env npx ts-node
/**
 * Test posting with v1.1 API instead of v2
 * v1.1 might have different behavior/permissions
 */
import { TwitterApi } from 'twitter-api-v2';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

async function testV1Post() {
  console.log('=== V1.1 API Post Test ===');
  console.log('Date:', new Date().toISOString());

  const credentials = {
    appKey: process.env.TWITTER_API_KEY!,
    appSecret: process.env.TWITTER_API_SECRET!,
    accessToken: process.env.TWITTER_ACCESS_TOKEN!,
    accessSecret: process.env.TWITTER_ACCESS_SECRET!,
  };

  console.log('\nCredentials loaded:');
  console.log('- API Key:', credentials.appKey?.substring(0, 8) + '***' + credentials.appKey?.slice(-5));
  console.log('- Access Token:', credentials.accessToken?.substring(0, 15) + '***');

  const client = new TwitterApi(credentials);

  // Try v1.1 API - verify credentials
  console.log('\n--- Test 1: v1.1 verify_credentials ---');
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

  // Try v1.1 post
  console.log('\n--- Test 2: v1.1 tweet ---');
  const testMessage = `Test v1.1 API ${new Date().toISOString().slice(11,19)}`;
  try {
    const tweet = await client.v1.tweet(testMessage);
    console.log('SUCCESS! Tweet ID:', tweet.id_str);
    console.log('URL: https://x.com/i/status/' + tweet.id_str);
  } catch (error: any) {
    console.log('FAILED:', error.code, error.message);
    if (error.data) {
      console.log('Error data:', JSON.stringify(error.data));
    }
  }

  // Try v2 post for comparison
  console.log('\n--- Test 3: v2 tweet ---');
  const testMessage2 = `Test v2 API ${new Date().toISOString().slice(11,19)}`;
  try {
    const tweet = await client.v2.tweet(testMessage2);
    console.log('SUCCESS! Tweet ID:', tweet.data.id);
    console.log('URL: https://x.com/i/status/' + tweet.data.id);
  } catch (error: any) {
    console.log('FAILED:', error.code, error.message);
    if (error.data) {
      console.log('Error data:', JSON.stringify(error.data));
    }
  }
}

testV1Post();
