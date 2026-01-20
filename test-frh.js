const { TwitterApi } = require('twitter-api-v2');
require('dotenv').config();

async function testFRH() {
  console.log('Testing @FreeRiverHouse credentials...\n');
  
  try {
    const client = new TwitterApi({
      appKey: process.env.X_FRH_API_KEY,
      appSecret: process.env.X_FRH_API_SECRET,
      accessToken: process.env.X_FRH_ACCESS_TOKEN,
      accessSecret: process.env.X_FRH_ACCESS_SECRET,
    });
    
    const user = await client.v2.me();
    console.log('✅ @FreeRiverHouse credentials valid!');
    console.log('User:', user.data.username);
    console.log('ID:', user.data.id);
  } catch (err) {
    console.log('❌ Error:', err.message);
    if (err.code) console.log('Code:', err.code);
  }
}

testFRH();
