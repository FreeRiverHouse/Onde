/**
 * TikTok Video Posting Script
 *
 * Pubblica video su TikTok usando la Content Posting API.
 *
 * Usage:
 *   node post-tiktok.js --video /path/to/video.mp4 --title "Titolo" --privacy PUBLIC_TO_EVERYONE
 *
 * Requires:
 *   - TIKTOK_CLIENT_KEY in .env
 *   - TIKTOK_CLIENT_SECRET in .env
 *   - TIKTOK_ACCESS_TOKEN in .env (after OAuth)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const TIKTOK_API_BASE = 'https://open.tiktokapis.com/v2';

// Configuration
const config = {
  clientKey: process.env.TIKTOK_CLIENT_KEY,
  clientSecret: process.env.TIKTOK_CLIENT_SECRET,
  accessToken: process.env.TIKTOK_ACCESS_TOKEN,
  redirectUri: process.env.TIKTOK_REDIRECT_URI || 'https://onde.surf/callback/tiktok'
};

/**
 * Initialize video upload
 */
async function initVideoUpload(accessToken, videoSize, options = {}) {
  const { title = '', privacy = 'SELF_ONLY' } = options;

  const body = JSON.stringify({
    post_info: {
      title: title.substring(0, 150), // Max 150 chars
      privacy_level: privacy,
      disable_duet: false,
      disable_stitch: false,
      disable_comment: false
    },
    source_info: {
      source: 'FILE_UPLOAD',
      video_size: videoSize
    }
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'open.tiktokapis.com',
      path: '/v2/post/publish/video/init/',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) {
            reject(new Error(json.error.message));
          } else {
            resolve(json.data);
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/**
 * Upload video chunks
 */
async function uploadVideoChunks(uploadUrl, videoPath, totalSize) {
  const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB chunks
  const fileStream = fs.createReadStream(videoPath, { highWaterMark: CHUNK_SIZE });

  let bytesSent = 0;

  for await (const chunk of fileStream) {
    const start = bytesSent;
    const end = bytesSent + chunk.length - 1;

    await uploadChunk(uploadUrl, chunk, start, end, totalSize);

    bytesSent += chunk.length;
    console.log(`Uploaded ${bytesSent}/${totalSize} bytes (${Math.round(bytesSent/totalSize*100)}%)`);
  }

  return true;
}

/**
 * Upload single chunk
 */
function uploadChunk(uploadUrl, chunk, start, end, total) {
  return new Promise((resolve, reject) => {
    const url = new URL(uploadUrl);

    const req = https.request({
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'PUT',
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Range': `bytes ${start}-${end}/${total}`,
        'Content-Length': chunk.length
      }
    }, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`Upload failed: ${res.statusCode} ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(chunk);
    req.end();
  });
}

/**
 * Publish video (after upload)
 */
async function publishVideo(accessToken, publishId) {
  const body = JSON.stringify({
    publish_id: publishId
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'open.tiktokapis.com',
      path: '/v2/post/publish/video/publish/',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) {
            reject(new Error(json.error.message));
          } else {
            resolve(json.data);
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/**
 * Check publish status
 */
async function checkPublishStatus(accessToken, publishId) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'open.tiktokapis.com',
      path: `/v2/post/publish/status/fetch/?publish_id=${publishId}`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

/**
 * Main function to post video
 */
async function postVideo(videoPath, options = {}) {
  const { title, privacy = 'SELF_ONLY' } = options;

  // Validate
  if (!config.accessToken) {
    throw new Error('TIKTOK_ACCESS_TOKEN not set. Run OAuth flow first.');
  }

  if (!fs.existsSync(videoPath)) {
    throw new Error(`Video file not found: ${videoPath}`);
  }

  const stats = fs.statSync(videoPath);
  const videoSize = stats.size;

  console.log(`Posting video: ${videoPath}`);
  console.log(`Size: ${(videoSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Title: ${title || '(no title)'}`);
  console.log(`Privacy: ${privacy}`);

  // Step 1: Initialize upload
  console.log('\n1. Initializing upload...');
  const initResult = await initVideoUpload(config.accessToken, videoSize, { title, privacy });
  console.log(`   Publish ID: ${initResult.publish_id}`);

  // Step 2: Upload chunks
  console.log('\n2. Uploading video...');
  await uploadVideoChunks(initResult.upload_url, videoPath, videoSize);
  console.log('   Upload complete!');

  // Step 3: Publish
  console.log('\n3. Publishing...');
  const publishResult = await publishVideo(config.accessToken, initResult.publish_id);
  console.log('   Published!');

  // Step 4: Check status (optional)
  console.log('\n4. Checking status...');
  await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
  const status = await checkPublishStatus(config.accessToken, initResult.publish_id);
  console.log(`   Status: ${status.data?.status || 'pending'}`);

  return {
    publishId: initResult.publish_id,
    status: status.data?.status
  };
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--video' && args[i + 1]) {
      options.video = args[++i];
    } else if (args[i] === '--title' && args[i + 1]) {
      options.title = args[++i];
    } else if (args[i] === '--privacy' && args[i + 1]) {
      options.privacy = args[++i];
    } else if (args[i] === '--help') {
      console.log(`
TikTok Video Poster

Usage:
  node post-tiktok.js --video <path> [--title <text>] [--privacy <level>]

Options:
  --video     Path to video file (required)
  --title     Video title (max 150 chars)
  --privacy   Privacy level: SELF_ONLY, PUBLIC_TO_EVERYONE, MUTUAL_FOLLOW_FRIENDS
  --help      Show this help

Example:
  node post-tiktok.js --video ./video.mp4 --title "Ninna nanna" --privacy PUBLIC_TO_EVERYONE
`);
      process.exit(0);
    }
  }

  return options;
}

// Main execution
if (require.main === module) {
  const options = parseArgs();

  if (!options.video) {
    console.error('Error: --video is required');
    process.exit(1);
  }

  postVideo(options.video, options)
    .then(result => {
      console.log('\n✅ Video posted successfully!');
      console.log(JSON.stringify(result, null, 2));
    })
    .catch(err => {
      console.error('\n❌ Error:', err.message);
      process.exit(1);
    });
}

module.exports = { postVideo, initVideoUpload, publishVideo };
