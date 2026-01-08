import { TwitterApi } from 'twitter-api-v2';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const VIDEOS_PATH = '/Users/mattia/Projects/Onde/tools/pr-dashboard/public/videos';

interface VideoPost {
  filename: string;
  caption: string;
}

const APPROVED_VIDEOS: VideoPost[] = [
  {
    filename: '01-stella-stellina-stars.mp4',
    caption: `Dalla collana "Piccole Rime" di Onde.

"Stella stellina, la notte s'avvicina..."

Una ninna nanna della tradizione italiana.

Animazione video by @grok`
  },
  {
    filename: '02-pulcino-bagnato-rain.mp4',
    caption: `Dalla collana "Piccole Rime" di Onde.

Un pulcino cerca riparo dalla pioggia sotto le ali della mamma chioccia.

Animazione by @grok`
  }
];

async function postVideo(client: TwitterApi, video: VideoPost) {
  const videoPath = path.join(VIDEOS_PATH, video.filename);

  if (!fs.existsSync(videoPath)) {
    console.error(`Video not found: ${videoPath}`);
    return null;
  }

  console.log(`\n📹 Uploading ${video.filename}...`);

  try {
    // Upload the video
    const mediaId = await client.v1.uploadMedia(videoPath, {
      mimeType: 'video/mp4',
      additionalOwners: [],
    });

    console.log(`✅ Video uploaded, mediaId: ${mediaId}`);

    // Post the tweet with video
    console.log(`📝 Posting tweet...`);
    const result = await client.v2.tweet({
      text: video.caption,
      media: { media_ids: [mediaId] }
    });

    console.log(`✅ Posted! https://x.com/Onde_FRH/status/${result.data.id}`);
    return result.data.id;
  } catch (error: any) {
    console.error(`❌ Failed: ${error.message}`);
    if (error.data) {
      console.error('Details:', JSON.stringify(error.data, null, 2));
    }
    return null;
  }
}

async function main() {
  // Use @Onde_FRH credentials
  const client = new TwitterApi({
    appKey: process.env.X_ONDE_API_KEY!,
    appSecret: process.env.X_ONDE_API_SECRET!,
    accessToken: process.env.X_ONDE_ACCESS_TOKEN!,
    accessSecret: process.env.X_ONDE_ACCESS_SECRET!,
  });

  console.log('🎬 Posting approved videos to @Onde_FRH\n');

  // Get video index from command line (default: 0 = first video)
  const videoIndex = parseInt(process.argv[2] || '0', 10);

  if (videoIndex < 0 || videoIndex >= APPROVED_VIDEOS.length) {
    console.error(`Invalid video index. Available: 0-${APPROVED_VIDEOS.length - 1}`);
    process.exit(1);
  }

  const video = APPROVED_VIDEOS[videoIndex];
  console.log(`Selected: ${video.filename}`);

  await postVideo(client, video);
}

main().catch(console.error);
