import { TwitterApi } from 'twitter-api-v2';
import 'dotenv/config';

async function updateFreeRiverHouseBio() {
  const client = new TwitterApi({
    appKey: process.env.X_FREERIVERHOUSE_API_KEY!,
    appSecret: process.env.X_FREERIVERHOUSE_API_SECRET!,
    accessToken: process.env.X_FREERIVERHOUSE_ACCESS_TOKEN!,
    accessSecret: process.env.X_FREERIVERHOUSE_ACCESS_SECRET!,
  });

  const newBio = "Indie software house 🏠 We build @Onde_FRH, VR games & AI experiments ✨ Shipping for fun since 2026 🚀";

  try {
    // API v1.1 - update_profile
    const result = await client.v1.updateAccountProfile({
      description: newBio,
    });

    console.log('✅ Bio aggiornata!');
    console.log(`   Account: @${result.screen_name}`);
    console.log(`   Nuova bio: ${result.description}`);
  } catch (error) {
    console.error('❌ Errore:', error);
  }
}

updateFreeRiverHouseBio();
