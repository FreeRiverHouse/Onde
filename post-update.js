const { TwitterApi } = require('twitter-api-v2');
require('dotenv').config();

console.log('API Key exists:', !!process.env.X_ONDE_API_KEY);

if (!process.env.X_ONDE_API_KEY) {
  console.log('❌ Missing X_ONDE credentials in .env');
  process.exit(1);
}

const client = new TwitterApi({
  appKey: process.env.X_ONDE_API_KEY,
  appSecret: process.env.X_ONDE_API_SECRET,
  accessToken: process.env.X_ONDE_ACCESS_TOKEN,
  accessSecret: process.env.X_ONDE_ACCESS_SECRET,
});

const text = `🌊 Onde Update!

✨ New features shipped tonight:

• 🎯 Quiz Game (48 questions!)
• 🎨 Drawing Pad  
• 👨‍👩‍👧 Parental Controls
• 🏆 Achievements System
• 📊 Activity Feed

🎮 onde.la/games

#buildinpublic #indiedev`;

client.v2.tweet(text)
  .then(r => console.log('✅ Posted:', 'https://x.com/Onde_FRH/status/' + r.data.id))
  .catch(e => console.log('❌ Error:', e.message));
