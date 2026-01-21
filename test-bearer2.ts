#!/usr/bin/env npx ts-node
import { TwitterApi } from 'twitter-api-v2';

async function test() {
  console.log('=== Bearer Token Test (URL Decoded) ===');
  console.log('Date:', new Date().toISOString());

  // Bearer token decoded (removing URL encoding)
  const bearerToken = decodeURIComponent('AAAAAAAAAAAAAAAAAAAAAPAc6wEAAAAAah7WWnj69ryVSrGZALRjC1H7V8E%3DOIoEHJQ0PraAbWTwZTUX8FdQStGxVYjqEBOSRz');
  
  console.log('\nDecoded Bearer Token (first 50 chars):', bearerToken.slice(0, 50) + '...');

  const client = new TwitterApi(bearerToken);

  console.log('\n--- Test: Get user by username ---');
  try {
    const user = await client.v2.userByUsername('FreeRiverHouse');
    console.log('SUCCESS! User:', user.data?.username, '- ID:', user.data?.id);
  } catch (error: any) {
    console.log('FAILED:', error.code, error.message);
    if (error.data) {
      console.log('Error data:', JSON.stringify(error.data));
    }
  }
}

test();
