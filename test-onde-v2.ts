#!/usr/bin/env npx ts-node
import { TwitterApi } from 'twitter-api-v2';

async function test() {
  console.log('=== Onde v2 API Test ===');
  console.log('Date:', new Date().toISOString());

  const credentials = {
    appKey: 'bZPmbk7XWTlobrfXREXuC7CuY',
    appSecret: 'bngqRdvKffN8X34ZRIfOluxN9znGu83GLDeVpzPhDSKvaCdjZ8',
    accessToken: '2008309220731650048-WeSs1lIXfRTRlyQ7WSzs19VMAgwVxy',
    accessSecret: 'Q6ozNVEPsVPvkvP3BpgylKlCOxw5ZO5WHcjDnWKwA4mtC',
  };

  console.log('\nTesting with v2 API...');

  const client = new TwitterApi(credentials);

  // Test v2 user lookup (my own account)
  console.log('\n--- Test: v2 me() ---');
  try {
    const me = await client.v2.me();
    console.log('SUCCESS! User:', me.data.username);
    console.log('User ID:', me.data.id);
    console.log('Name:', me.data.name);
    return true;
  } catch (error: any) {
    console.log('FAILED:', error.code, error.message);
    if (error.data) {
      console.log('Error data:', JSON.stringify(error.data));
    }
    return false;
  }
}

test();
