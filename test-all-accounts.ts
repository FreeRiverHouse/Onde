#!/usr/bin/env npx ts-node
import { TwitterApi } from 'twitter-api-v2';
import * as dotenv from 'dotenv';
dotenv.config();

async function testAccount(name: string, apiKey: string | undefined, apiSecret: string | undefined, accessToken: string | undefined, accessSecret: string | undefined) {
  console.log(`\nTesting ${name}...`);
  console.log(`  API Key: ${apiKey?.slice(-5) || 'MISSING'}`);
  console.log(`  Access Token: ${accessToken?.slice(0,15) || 'MISSING'}`);

  if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    console.log('  SKIPPED - missing credentials');
    return;
  }

  const client = new TwitterApi({ appKey: apiKey, appSecret: apiSecret, accessToken, accessSecret });

  try {
    const user = await client.v1.verifyCredentials();
    console.log(`  SUCCESS! User: @${user.screen_name}`);
    return user.screen_name;
  } catch (e: any) {
    console.log(`  FAILED: ${e.code} - ${e.message?.slice(0,60)}`);
    if (e.data?.errors) {
      console.log(`  Error: ${JSON.stringify(e.data.errors)}`);
    }
    return null;
  }
}

async function main() {
  console.log('=== Testing All X Account Credentials ===');
  console.log('Date:', new Date().toISOString());

  // FRH (primary)
  await testAccount('FRH (TWITTER_*)',
    process.env.TWITTER_API_KEY,
    process.env.TWITTER_API_SECRET,
    process.env.TWITTER_ACCESS_TOKEN,
    process.env.TWITTER_ACCESS_SECRET
  );

  // FRH duplicate check
  await testAccount('FRH (X_FREERIVERHOUSE_*)',
    process.env.X_FREERIVERHOUSE_API_KEY,
    process.env.X_FREERIVERHOUSE_API_SECRET,
    process.env.X_FREERIVERHOUSE_ACCESS_TOKEN,
    process.env.X_FREERIVERHOUSE_ACCESS_SECRET
  );

  // Onde
  await testAccount('ONDE',
    process.env.X_ONDE_API_KEY,
    process.env.X_ONDE_API_SECRET,
    process.env.X_ONDE_ACCESS_TOKEN,
    process.env.X_ONDE_ACCESS_SECRET
  );

  // Magmatic
  await testAccount('MAGMATIC',
    process.env.X_MAGMATIC_API_KEY,
    process.env.X_MAGMATIC_API_SECRET,
    process.env.X_MAGMATIC_ACCESS_TOKEN,
    process.env.X_MAGMATIC_ACCESS_SECRET
  );
}

main();
