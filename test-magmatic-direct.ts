#!/usr/bin/env npx ts-node
import { TwitterApi } from 'twitter-api-v2';

async function test() {
  console.log('=== Direct Magmatic Credentials Test ===');
  console.log('Date:', new Date().toISOString());

  // Existing magmatic credentials from .env
  const credentials = {
    appKey: '84tqF5uknUnKx2YnWiWyfm86b',
    appSecret: 'zLS6xvmLqZRtNckZgvPU9OZsY4R2yPQlSZtnNm77cRNgFepiYM',
    accessToken: '900791727186993152-h2JlvWCoEGYV8kd7xe5a0Te3eoSTLST',
    accessSecret: 'iYQFzsW116upT7IgldXlutfgt3ZunmLMq2AKhlBKaMW4Q',
  };

  console.log('\nCredentials (from .env):');
  console.log('- API Key:', credentials.appKey.slice(0, 8) + '...');
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
}

test();
