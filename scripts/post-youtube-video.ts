import { TwitterApi } from 'twitter-api-v2';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const client = new TwitterApi({
    appKey: process.env.X_ONDE_API_KEY!,
    appSecret: process.env.X_ONDE_API_SECRET!,
    accessToken: process.env.X_ONDE_ACCESS_TOKEN!,
    accessSecret: process.env.X_ONDE_ACCESS_SECRET!,
  });

  const caption = `Storie della buonanotte

Il nostro Gianni Parola legge "Stella Stellina" di Lina Schwarz.

Una dolce ninna nanna italiana per accompagnare i vostri piccoli nel mondo dei sogni.

https://youtu.be/bmf6uY6r_YM

Illustrazione @grok`;

  console.log('Posting to @Onde_FRH...');
  console.log('Caption:', caption);
  console.log('---');

  try {
    const result = await client.v2.tweet({ text: caption });
    console.log(`Posted! https://x.com/Onde_FRH/status/${result.data.id}`);
  } catch (error: any) {
    console.error('Failed:', error.message);
    if (error.data) {
      console.error('Details:', JSON.stringify(error.data, null, 2));
    }
  }
}

main().catch(console.error);
