#!/usr/bin/env npx ts-node
import { TwitterApi } from 'twitter-api-v2';

async function test() {
  console.log('=== Bearer Token (App-Only) Test ===');
  console.log('Date:', new Date().toISOString());

  // Bearer token from .env (FRH)
  const bearerToken = 'AAAAAAAAAAAAAAAAAAAAAPAc6wEAAAAAah7WWnj69ryVSrGZALRjC1H7V8E%3DOIoEHJQ0PraAbWTwZTUX8FdQStGxVYjqEBOSRz';
  
  console.log('\nBearer Token (first 50 chars):', bearerToken.slice(0, 50) + '...');

  const client = new TwitterApi(bearerToken);

  console.log('\n--- Test: Search recent tweets ---');
  try {
    const result = await client.v2.search('claude code', { max_results: 10 });
    console.log('SUCCESS! Found', result.data.data?.length || 0, 'tweets');
    if (result.data.data?.[0]) {
      console.log('First tweet:', result.data.data[0].text.slice(0, 100) + '...');
    }
  } catch (error: any) {
    console.log('FAILED:', error.code, error.message);
    if (error.data) {
      console.log('Error data:', JSON.stringify(error.data));
    }
  }

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
