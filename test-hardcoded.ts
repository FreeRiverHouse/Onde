#!/usr/bin/env npx ts-node
/**
 * Test with hardcoded credentials to rule out .env parsing issues
 */
import { TwitterApi } from 'twitter-api-v2';

async function testHardcoded() {
  console.log('=== Hardcoded Credentials Test ===');
  console.log('Date:', new Date().toISOString());

  // ORIGINAL credentials that were working at 05:38 (from transcript)
  const credentials = {
    appKey: 'TSW4g8vY775SFi6FB8rmE5Ilp',
    appSecret: '3S0jM1AalTzu1a5GXLJvhNdtJO2k2FyRM6cbdCQX70l1foIEDK',
    accessToken: '2008256558309011456-Cv3gm6Bgr1fvg7NaKEHOCxAKvDeBIU',
    accessSecret: '1LMFLKdNYBpm5IfPWVGKJzWhKzazKSa3kwIUIbxXpZyXk',
  };

  console.log('\nCredentials (hardcoded):');
  console.log('- API Key length:', credentials.appKey.length);
  console.log('- API Secret length:', credentials.appSecret.length);
  console.log('- Access Token length:', credentials.accessToken.length);
  console.log('- Access Secret length:', credentials.accessSecret.length);

  const client = new TwitterApi(credentials);

  console.log('\n--- Test: v1.1 verify_credentials ---');
  try {
    const user = await client.v1.verifyCredentials();
    console.log('SUCCESS! User:', user.screen_name);
  } catch (error: any) {
    console.log('FAILED:', error.code, error.message);
    if (error.data) {
      console.log('Error data:', JSON.stringify(error.data));
    }
  }

  console.log('\n--- Test: v2 tweet ---');
  try {
    const tweet = await client.v2.tweet(`Test ${Date.now()}`);
    console.log('SUCCESS! Tweet ID:', tweet.data.id);
  } catch (error: any) {
    console.log('FAILED:', error.code, error.message);
  }
}

testHardcoded();
