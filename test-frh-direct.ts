#!/usr/bin/env npx ts-node
/**
 * Direct test with hardcoded NEW credentials
 */
import { TwitterApi } from 'twitter-api-v2';

async function test() {
  console.log('=== Direct FRH Credentials Test ===');
  console.log('Date:', new Date().toISOString());

  // NEW credentials just regenerated
  const credentials = {
    appKey: '11mhdu5QO7icLUbcwHKCSlbqh',
    appSecret: 'sKhF2yreLWRh1OCKd6bgSQ9nmFjRWmoGY6AkKIzgND40l1f37X',
    accessToken: '2008256558309011456-NuclkO3kw3W9V9G5StmqXASMjNOQhg',
    accessSecret: 'Xmq8lPMK2HiYHT29jZoAOoD3kYnKdv7ln7TDBfblH0SRV',
  };

  console.log('\nCredentials (hardcoded):');
  console.log('- API Key:', credentials.appKey.slice(0, 8) + '...' + credentials.appKey.slice(-5));
  console.log('- Access Token:', credentials.accessToken.slice(0, 20) + '...');

  const client = new TwitterApi(credentials);

  console.log('\n--- Test: v1.1 verifyCredentials ---');
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

  console.log('\n--- Test: v2 tweet (dry run) ---');
  const testMessage = `Test from FRH ${new Date().toISOString().slice(11, 19)}`;
  console.log('Would post:', testMessage);

  try {
    const tweet = await client.v2.tweet(testMessage);
    console.log('SUCCESS! Tweet ID:', tweet.data.id);
    console.log('URL: https://x.com/FreeRiverHouse/status/' + tweet.data.id);
  } catch (error: any) {
    console.log('FAILED:', error.code, error.message);
    if (error.data) {
      console.log('Error data:', JSON.stringify(error.data));
    }
  }
}

test();
