const { TwitterApi } = require('twitter-api-v2');
require('dotenv').config();

async function testPost() {
  console.log('Testing X API posting...\n');
  
  // Test @Onde_FRH
  console.log('=== Testing @Onde_FRH ===');
  try {
    const ondeClient = new TwitterApi({
      appKey: process.env.X_ONDE_API_KEY,
      appSecret: process.env.X_ONDE_API_SECRET,
      accessToken: process.env.X_ONDE_ACCESS_TOKEN,
      accessSecret: process.env.X_ONDE_ACCESS_SECRET,
    });
    
    const ondeUser = await ondeClient.v2.me();
    console.log('✅ @Onde_FRH credentials valid! User:', ondeUser.data.username);
  } catch (err) {
    console.log('❌ @Onde_FRH error:', err.message);
    if (err.code) console.log('   Code:', err.code);
  }
  
  // Test @magmatic__
  console.log('\n=== Testing @magmatic__ ===');
  try {
    const magmaticClient = new TwitterApi({
      appKey: process.env.X_MAGMATIC_API_KEY,
      appSecret: process.env.X_MAGMATIC_API_SECRET,
      accessToken: process.env.X_MAGMATIC_ACCESS_TOKEN,
      accessSecret: process.env.X_MAGMATIC_ACCESS_SECRET,
    });
    
    const magmaticUser = await magmaticClient.v2.me();
    console.log('✅ @magmatic__ credentials valid! User:', magmaticUser.data.username);
  } catch (err) {
    console.log('❌ @magmatic__ error:', err.message);
    if (err.code) console.log('   Code:', err.code);
  }
}

testPost();
