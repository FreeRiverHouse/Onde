import { TwitterApi } from 'twitter-api-v2';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import * as fs from 'fs';

dotenv.config({ path: resolve(__dirname, '../.env') });

async function postMagmaticImage() {
  const client = new TwitterApi({
    appKey: process.env.X_MAGMATIC_API_KEY!,
    appSecret: process.env.X_MAGMATIC_API_SECRET!,
    accessToken: process.env.X_MAGMATIC_ACCESS_TOKEN!,
    accessSecret: process.env.X_MAGMATIC_ACCESS_SECRET!,
  });

  const imagePath = resolve(__dirname, '../drafts/magmatic/sogni-volare-2.jpg');

  const caption = `sognare di volare
è come liberare
un animale
allontanare il male

e volteggiare,
amare:
immaginarsi uguale
a un corpo astrale

a un ente
celestiale
immateriale

fatale:
al niente,
al tutto originale

Image by @grok`;

  console.log('Uploading image...');

  const mediaId = await client.v1.uploadMedia(imagePath);
  console.log('Media uploaded:', mediaId);

  console.log('\nPosting tweet with image...');
  console.log('Caption:', caption);

  const result = await client.v2.tweet({
    text: caption,
    media: { media_ids: [mediaId] }
  });

  console.log('\nTweet posted!');
  console.log(`https://x.com/magmatic__/status/${result.data.id}`);
}

postMagmaticImage().catch(console.error);
