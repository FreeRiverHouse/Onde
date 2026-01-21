#!/usr/bin/env npx ts-node
/**
 * Direct test with hardcoded NEW Onde credentials
 */
import { TwitterApi } from 'twitter-api-v2';

async function test() {
  console.log('=== Direct Onde Credentials Test ===');
  console.log('Date:', new Date().toISOString());

  // FRESH credentials after REVOKE + regenerate (Jan 20, 2026 21:42)
  const credentials = {
    appKey: 'Mu2Nf2pAaTL3jzN8mlPYw4DjA',
    appSecret: 'EQrZi6lU3c7ITCu2Bd4nAqECWxODGlMJPALs0EhM5FnERHrVxO',
    accessToken: '2008309220731650048-MCdOCBuaKFjjaFXnnsQ9GVXl2hoG0C',
    accessSecret: 'fTthtW4pOmqPnCcMOfdEB2W8kK9qOD4ebNCN2fbx0IY0t',
  };

  console.log('\nCredentials (hardcoded):');
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
