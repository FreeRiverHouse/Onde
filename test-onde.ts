#!/usr/bin/env npx ts-node
/**
 * Test Onde credentials
 */
import { TwitterApi } from 'twitter-api-v2';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

async function testOnde() {
  console.log('=== Onde Credentials Test ===');

  const credentials = {
    appKey: process.env.X_ONDE_API_KEY!,
    appSecret: process.env.X_ONDE_API_SECRET!,
    accessToken: process.env.X_ONDE_ACCESS_TOKEN!,
    accessSecret: process.env.X_ONDE_ACCESS_SECRET!,
  };

  console.log('API Key:', credentials.appKey?.substring(0, 8) + '***');
  console.log('Access Token:', credentials.accessToken?.substring(0, 15) + '***');

  const client = new TwitterApi(credentials);

  console.log('\n--- Test: v1.1 verify_credentials ---');
  try {
    const user = await client.v1.verifyCredentials();
    console.log('SUCCESS! User:', user.screen_name);
  } catch (error: any) {
    console.log('FAILED:', error.code, error.message);
    if (error.data) console.log('Error:', JSON.stringify(error.data));
  }
}

testOnde();
