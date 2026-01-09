#!/usr/bin/env node

/**
 * Instagram Graph API Poster
 *
 * Script per auto-posting su Instagram via Meta Graph API
 *
 * Uso:
 *   node instagram-poster.js post-image --url "https://..." --caption "Testo"
 *   node instagram-poster.js post-video --url "https://..." --caption "Testo"
 *   node instagram-poster.js post-carousel --urls "url1,url2,url3" --caption "Testo"
 *   node instagram-poster.js check-token
 *   node instagram-poster.js get-account-info
 *
 * Task: social-ig-002
 * Data: 2026-01-09
 */

const https = require('https');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

// ============================================================================
// CONFIGURAZIONE
// ============================================================================

const CONFIG = {
  apiVersion: 'v21.0',
  baseUrl: 'graph.facebook.com',
  igAccountId: process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID,
  accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
  // Retry settings
  maxRetries: 3,
  retryDelayMs: 5000,
  // Polling per video
  pollIntervalMs: 5000,
  maxPollAttempts: 60, // 5 min max wait
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Esegue richiesta HTTPS
 */
function makeRequest(method, endpoint, params = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(`https://${CONFIG.baseUrl}/${CONFIG.apiVersion}${endpoint}`);

    // Aggiungi access_token a tutti i parametri
    params.access_token = CONFIG.accessToken;

    if (method === 'GET') {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const options = {
      method,
      hostname: url.hostname,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) {
            reject(new APIError(json.error));
          } else {
            // Log rate limit info
            const rateLimitHeader = res.headers['x-business-use-case-usage'];
            if (rateLimitHeader) {
              console.log('[Rate Limit]', rateLimitHeader);
            }
            resolve(json);
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', reject);

    if (method === 'POST') {
      req.write(JSON.stringify(params));
    }

    req.end();
  });
}

/**
 * Errore API personalizzato
 */
class APIError extends Error {
  constructor(error) {
    super(error.message);
    this.code = error.code;
    this.type = error.type;
    this.fbtrace_id = error.fbtrace_id;
  }
}

/**
 * Sleep utility
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Formatta caption con credits Onde
 */
function formatCaption(text, addCredits = true) {
  let caption = text.slice(0, 2000);

  if (addCredits) {
    caption += '\n\n---\n';
    caption += 'Illustrazione: Pina Pennello con @grok';
  }

  return caption.slice(0, 2200);
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Verifica validita' e scadenza token
 */
async function checkToken() {
  console.log('\n[Check Token]');

  const response = await makeRequest('GET', '/debug_token', {
    input_token: CONFIG.accessToken,
  });

  const data = response.data;
  const expiresAt = data.expires_at;
  const now = Math.floor(Date.now() / 1000);

  console.log('App ID:', data.app_id);
  console.log('User ID:', data.user_id);
  console.log('Valid:', data.is_valid);
  console.log('Scopes:', data.scopes?.join(', '));

  if (expiresAt === 0) {
    console.log('Scadenza: MAI (token permanente)');
  } else {
    const daysRemaining = ((expiresAt - now) / 86400).toFixed(1);
    console.log(`Scadenza: ${new Date(expiresAt * 1000).toISOString()}`);
    console.log(`Giorni rimanenti: ${daysRemaining}`);

    if (daysRemaining < 7) {
      console.warn('\n[!] ATTENZIONE: Token in scadenza! Rinnova subito.');
    }
  }

  return data;
}

/**
 * Ottieni info account Instagram
 */
async function getAccountInfo() {
  console.log('\n[Account Info]');

  const response = await makeRequest('GET', `/${CONFIG.igAccountId}`, {
    fields: 'id,username,name,profile_picture_url,followers_count,media_count',
  });

  console.log('ID:', response.id);
  console.log('Username:', response.username);
  console.log('Nome:', response.name);
  console.log('Followers:', response.followers_count);
  console.log('Media:', response.media_count);

  return response;
}

/**
 * Crea container per immagine
 */
async function createImageContainer(imageUrl, caption) {
  console.log('\n[Crea Container Immagine]');
  console.log('URL:', imageUrl);

  const response = await makeRequest('POST', `/${CONFIG.igAccountId}/media`, {
    image_url: imageUrl,
    caption: formatCaption(caption),
  });

  console.log('Container ID:', response.id);
  return response.id;
}

/**
 * Crea container per video/reel
 */
async function createVideoContainer(videoUrl, caption, isReel = true) {
  console.log('\n[Crea Container Video]');
  console.log('URL:', videoUrl);
  console.log('Tipo:', isReel ? 'REEL' : 'VIDEO');

  const params = {
    video_url: videoUrl,
    caption: formatCaption(caption),
    media_type: 'REELS',
  };

  if (isReel) {
    params.share_to_feed = true;
  }

  const response = await makeRequest('POST', `/${CONFIG.igAccountId}/media`, params);

  console.log('Container ID:', response.id);
  return response.id;
}

/**
 * Crea container per carousel
 */
async function createCarouselContainer(imageUrls, caption) {
  console.log('\n[Crea Container Carousel]');
  console.log('Immagini:', imageUrls.length);

  // Step 1: Crea container per ogni immagine
  const childrenIds = [];
  for (const url of imageUrls) {
    const response = await makeRequest('POST', `/${CONFIG.igAccountId}/media`, {
      image_url: url,
      is_carousel_item: true,
    });
    childrenIds.push(response.id);
    console.log(`  - Child container: ${response.id}`);
  }

  // Step 2: Crea container carousel
  const response = await makeRequest('POST', `/${CONFIG.igAccountId}/media`, {
    media_type: 'CAROUSEL',
    children: childrenIds.join(','),
    caption: formatCaption(caption),
  });

  console.log('Carousel Container ID:', response.id);
  return response.id;
}

/**
 * Controlla status container (per video)
 */
async function checkContainerStatus(containerId) {
  const response = await makeRequest('GET', `/${containerId}`, {
    fields: 'status_code,status',
  });

  return response.status_code;
}

/**
 * Attendi che container sia pronto
 */
async function waitForContainer(containerId) {
  console.log('\n[Attendo processing...]');

  for (let i = 0; i < CONFIG.maxPollAttempts; i++) {
    const status = await checkContainerStatus(containerId);
    console.log(`  Status: ${status} (attempt ${i + 1}/${CONFIG.maxPollAttempts})`);

    if (status === 'FINISHED') {
      return true;
    }

    if (status === 'ERROR' || status === 'EXPIRED') {
      throw new Error(`Container in stato ${status}`);
    }

    await sleep(CONFIG.pollIntervalMs);
  }

  throw new Error('Timeout attesa container');
}

/**
 * Pubblica media
 */
async function publishMedia(containerId) {
  console.log('\n[Pubblica Media]');

  const response = await makeRequest('POST', `/${CONFIG.igAccountId}/media_publish`, {
    creation_id: containerId,
  });

  console.log('Media ID pubblicato:', response.id);

  // Ottieni permalink
  const mediaInfo = await makeRequest('GET', `/${response.id}`, {
    fields: 'permalink',
  });

  console.log('Permalink:', mediaInfo.permalink);

  return {
    mediaId: response.id,
    permalink: mediaInfo.permalink,
  };
}

/**
 * Post immagine completo
 */
async function postImage(imageUrl, caption) {
  console.log('\n========================================');
  console.log('[POST IMMAGINE]');
  console.log('========================================');

  const containerId = await createImageContainer(imageUrl, caption);
  const result = await publishMedia(containerId);

  console.log('\n[SUCCESSO] Post pubblicato!');
  return result;
}

/**
 * Post video/reel completo
 */
async function postVideo(videoUrl, caption, isReel = true) {
  console.log('\n========================================');
  console.log('[POST VIDEO/REEL]');
  console.log('========================================');

  const containerId = await createVideoContainer(videoUrl, caption, isReel);
  await waitForContainer(containerId);
  const result = await publishMedia(containerId);

  console.log('\n[SUCCESSO] Video pubblicato!');
  return result;
}

/**
 * Post carousel completo
 */
async function postCarousel(imageUrls, caption) {
  console.log('\n========================================');
  console.log('[POST CAROUSEL]');
  console.log('========================================');

  const containerId = await createCarouselContainer(imageUrls, caption);
  const result = await publishMedia(containerId);

  console.log('\n[SUCCESSO] Carousel pubblicato!');
  return result;
}

// ============================================================================
// CLI
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  // Verifica configurazione
  if (!CONFIG.igAccountId || !CONFIG.accessToken) {
    console.error('[ERRORE] Mancano variabili ambiente:');
    console.error('  INSTAGRAM_BUSINESS_ACCOUNT_ID');
    console.error('  INSTAGRAM_ACCESS_TOKEN');
    console.error('\nConfigura in .env file');
    process.exit(1);
  }

  try {
    switch (command) {
      case 'check-token':
        await checkToken();
        break;

      case 'get-account-info':
        await getAccountInfo();
        break;

      case 'post-image': {
        const urlIndex = args.indexOf('--url');
        const captionIndex = args.indexOf('--caption');

        if (urlIndex === -1 || captionIndex === -1) {
          console.error('Uso: node instagram-poster.js post-image --url "URL" --caption "TESTO"');
          process.exit(1);
        }

        await postImage(args[urlIndex + 1], args[captionIndex + 1]);
        break;
      }

      case 'post-video': {
        const urlIndex = args.indexOf('--url');
        const captionIndex = args.indexOf('--caption');

        if (urlIndex === -1 || captionIndex === -1) {
          console.error('Uso: node instagram-poster.js post-video --url "URL" --caption "TESTO"');
          process.exit(1);
        }

        await postVideo(args[urlIndex + 1], args[captionIndex + 1]);
        break;
      }

      case 'post-carousel': {
        const urlsIndex = args.indexOf('--urls');
        const captionIndex = args.indexOf('--caption');

        if (urlsIndex === -1 || captionIndex === -1) {
          console.error(
            'Uso: node instagram-poster.js post-carousel --urls "url1,url2,url3" --caption "TESTO"'
          );
          process.exit(1);
        }

        const urls = args[urlsIndex + 1].split(',');
        await postCarousel(urls, args[captionIndex + 1]);
        break;
      }

      default:
        console.log(`
Instagram Graph API Poster - Onde Publishing
============================================

Comandi disponibili:

  check-token         Verifica validita' e scadenza token
  get-account-info    Mostra info account Instagram

  post-image          Pubblica immagine singola
    --url "URL"       URL pubblico HTTPS dell'immagine
    --caption "TESTO" Caption del post

  post-video          Pubblica video/reel
    --url "URL"       URL pubblico HTTPS del video
    --caption "TESTO" Caption del post

  post-carousel       Pubblica carousel di immagini
    --urls "u1,u2,u3" URL separati da virgola
    --caption "TESTO" Caption del post

Esempi:
  node instagram-poster.js check-token
  node instagram-poster.js post-image --url "https://cdn.onde.surf/img.jpg" --caption "Nuovo libro!"
  node instagram-poster.js post-carousel --urls "https://a.jpg,https://b.jpg" --caption "Serie"

Configurazione richiesta in .env:
  INSTAGRAM_BUSINESS_ACCOUNT_ID
  INSTAGRAM_ACCESS_TOKEN
        `);
    }
  } catch (error) {
    console.error('\n[ERRORE]', error.message);
    if (error.code) {
      console.error('Codice:', error.code);
    }
    if (error.fbtrace_id) {
      console.error('Trace ID:', error.fbtrace_id);
    }
    process.exit(1);
  }
}

// Export per uso come modulo
module.exports = {
  checkToken,
  getAccountInfo,
  postImage,
  postVideo,
  postCarousel,
  createImageContainer,
  createVideoContainer,
  createCarouselContainer,
  publishMedia,
  waitForContainer,
  formatCaption,
};

// Esegui se chiamato direttamente
if (require.main === module) {
  main();
}
