#!/usr/bin/env npx ts-node
/**
 * X API Debug Test - Verifica dettagliata errori 401
 */

import { TwitterApi } from 'twitter-api-v2';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

interface AccountConfig {
  name: string;
  appKey: string;
  appSecret: string;
  accessToken: string;
  accessSecret: string;
}

const accounts: AccountConfig[] = [
  {
    name: 'FreeRiverHouse (TWITTER_*)',
    appKey: process.env.TWITTER_API_KEY || '',
    appSecret: process.env.TWITTER_API_SECRET || '',
    accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
    accessSecret: process.env.TWITTER_ACCESS_SECRET || '',
  },
  {
    name: 'FreeRiverHouse (X_FREERIVERHOUSE_*)',
    appKey: process.env.X_FREERIVERHOUSE_API_KEY || '',
    appSecret: process.env.X_FREERIVERHOUSE_API_SECRET || '',
    accessToken: process.env.X_FREERIVERHOUSE_ACCESS_TOKEN || '',
    accessSecret: process.env.X_FREERIVERHOUSE_ACCESS_SECRET || '',
  },
  {
    name: 'Onde',
    appKey: process.env.X_ONDE_API_KEY || '',
    appSecret: process.env.X_ONDE_API_SECRET || '',
    accessToken: process.env.X_ONDE_ACCESS_TOKEN || '',
    accessSecret: process.env.X_ONDE_ACCESS_SECRET || '',
  },
  {
    name: 'Magmatic',
    appKey: process.env.X_MAGMATIC_API_KEY || '',
    appSecret: process.env.X_MAGMATIC_API_SECRET || '',
    accessToken: process.env.X_MAGMATIC_ACCESS_TOKEN || '',
    accessSecret: process.env.X_MAGMATIC_ACCESS_SECRET || '',
  },
];

async function testAccount(config: AccountConfig): Promise<void> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing: ${config.name}`);
  console.log(`${'='.repeat(60)}`);

  // Show credential lengths (not values for security)
  console.log(`API Key length: ${config.appKey.length}`);
  console.log(`API Secret length: ${config.appSecret.length}`);
  console.log(`Access Token length: ${config.accessToken.length}`);
  console.log(`Access Secret length: ${config.accessSecret.length}`);

  if (!config.appKey || !config.appSecret || !config.accessToken || !config.accessSecret) {
    console.log('❌ Missing credentials!');
    return;
  }

  const client = new TwitterApi({
    appKey: config.appKey,
    appSecret: config.appSecret,
    accessToken: config.accessToken,
    accessSecret: config.accessSecret,
  });

  // Test 1: Verify credentials (GET endpoint)
  console.log('\n📋 Test 1: Verifying credentials (GET /2/users/me)...');
  try {
    const me = await client.v2.me();
    console.log(`✅ Authenticated as: @${me.data.username} (ID: ${me.data.id})`);
  } catch (error: any) {
    console.log(`❌ GET failed: ${error.code || error.message}`);
    if (error.data) {
      console.log(`   Error details: ${JSON.stringify(error.data)}`);
    }
    // If GET fails, POST will definitely fail
    return;
  }

  // Test 2: Check app permissions
  console.log('\n📋 Test 2: Checking rate limits...');
  try {
    const rateLimit = await client.v2.me({ 'user.fields': ['public_metrics'] });
    console.log(`✅ Rate limit check passed`);
  } catch (error: any) {
    console.log(`❌ Rate limit check failed: ${error.message}`);
  }

  // Test 3: Try posting (only if GET succeeded)
  console.log('\n📋 Test 3: Attempting to post...');
  const testMessage = `🔧 API Test ${new Date().toISOString().slice(0,19)}`;
  try {
    const tweet = await client.v2.tweet(testMessage);
    console.log(`✅ Posted successfully!`);
    console.log(`   Tweet ID: ${tweet.data.id}`);
    console.log(`   URL: https://x.com/i/status/${tweet.data.id}`);
  } catch (error: any) {
    console.log(`❌ POST failed: ${error.code || error.message}`);
    if (error.data) {
      console.log(`   Error details: ${JSON.stringify(error.data)}`);
    }
    if (error.code === 401) {
      console.log(`   💡 401 on POST but GET worked = App doesn't have Write permissions!`);
      console.log(`   💡 Go to Developer Portal > Project > App > Settings > App permissions`);
      console.log(`   💡 Change from "Read" to "Read and Write"`);
      console.log(`   💡 Then regenerate Access Token (required after permission change)`);
    }
    if (error.code === 403) {
      console.log(`   💡 403 = App permissions or account issue`);
    }
  }
}

async function main() {
  console.log('🔍 X API Debug Test');
  console.log(`📅 ${new Date().toISOString()}`);

  for (const account of accounts) {
    await testAccount(account);
  }

  console.log('\n\n📊 Summary complete');
}

main().catch(console.error);
