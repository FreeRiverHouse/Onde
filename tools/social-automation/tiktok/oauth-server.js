/**
 * TikTok OAuth Server
 *
 * Server locale per gestire il flusso OAuth di TikTok.
 *
 * Usage:
 *   node oauth-server.js
 *
 * Poi visita http://localhost:3333 per iniziare l'autorizzazione.
 */

const http = require('http');
const https = require('https');
const url = require('url');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const PORT = 3333;
const config = {
  clientKey: process.env.TIKTOK_CLIENT_KEY,
  clientSecret: process.env.TIKTOK_CLIENT_SECRET,
  redirectUri: `http://localhost:${PORT}/callback`
};

/**
 * Exchange authorization code for access token
 */
async function exchangeCodeForToken(code) {
  const body = new URLSearchParams({
    client_key: config.clientKey,
    client_secret: config.clientSecret,
    code: code,
    grant_type: 'authorization_code',
    redirect_uri: config.redirectUri
  }).toString();

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'open.tiktokapis.com',
      path: '/v2/oauth/token/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body)
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
    req.write(body);
    req.end();
  });
}

/**
 * Build authorization URL
 */
function getAuthUrl() {
  const params = new URLSearchParams({
    client_key: config.clientKey,
    scope: 'video.upload,video.publish',
    response_type: 'code',
    redirect_uri: config.redirectUri
  });

  return `https://www.tiktok.com/v2/auth/authorize?${params.toString()}`;
}

/**
 * Handle HTTP requests
 */
async function handleRequest(req, res) {
  const parsedUrl = url.parse(req.url, true);

  // Home page - show auth link
  if (parsedUrl.pathname === '/') {
    if (!config.clientKey || !config.clientSecret) {
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end(`
        <h1>Errore Configurazione</h1>
        <p>TIKTOK_CLIENT_KEY e TIKTOK_CLIENT_SECRET non configurati in .env</p>
        <p>Vai su <a href="https://developers.tiktok.com/">TikTok for Developers</a> per creare un'app.</p>
      `);
      return;
    }

    const authUrl = getAuthUrl();
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>TikTok OAuth - Onde</title>
        <style>
          body { font-family: system-ui; max-width: 600px; margin: 50px auto; padding: 20px; }
          a.button {
            display: inline-block;
            background: #fe2c55;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-size: 18px;
          }
          a.button:hover { background: #d62647; }
          code { background: #f0f0f0; padding: 2px 6px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <h1>TikTok OAuth per Onde</h1>
        <p>Clicca il bottone per autorizzare l'app Onde a pubblicare su TikTok.</p>
        <p><a href="${authUrl}" class="button">Autorizza TikTok</a></p>
        <hr>
        <p><small>Dopo l'autorizzazione, copia l'access token nel file <code>.env</code></small></p>
      </body>
      </html>
    `);
    return;
  }

  // OAuth callback
  if (parsedUrl.pathname === '/callback') {
    const code = parsedUrl.query.code;
    const error = parsedUrl.query.error;

    if (error) {
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end(`
        <h1>Errore Autorizzazione</h1>
        <p>Errore: ${error}</p>
        <p>Descrizione: ${parsedUrl.query.error_description || 'N/A'}</p>
        <p><a href="/">Riprova</a></p>
      `);
      return;
    }

    if (!code) {
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end('<h1>Errore</h1><p>Codice di autorizzazione mancante.</p>');
      return;
    }

    try {
      console.log('Exchanging code for token...');
      const tokenResponse = await exchangeCodeForToken(code);

      if (tokenResponse.error) {
        throw new Error(tokenResponse.error.message || tokenResponse.error);
      }

      const accessToken = tokenResponse.access_token;
      const refreshToken = tokenResponse.refresh_token;
      const expiresIn = tokenResponse.expires_in;

      // Save to .env suggestion
      const envPath = path.join(__dirname, '../../../.env');

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>TikTok OAuth Success - Onde</title>
          <style>
            body { font-family: system-ui; max-width: 800px; margin: 50px auto; padding: 20px; }
            code { background: #f0f0f0; padding: 2px 6px; border-radius: 4px; word-break: break-all; }
            pre { background: #f0f0f0; padding: 15px; border-radius: 8px; overflow-x: auto; }
            .success { color: #22c55e; }
          </style>
        </head>
        <body>
          <h1 class="success">Autorizzazione Riuscita!</h1>

          <h2>Access Token</h2>
          <pre>${accessToken}</pre>

          <h2>Refresh Token</h2>
          <pre>${refreshToken || 'N/A'}</pre>

          <h2>Scadenza</h2>
          <p>${expiresIn} secondi (${Math.round(expiresIn / 3600)} ore)</p>

          <hr>

          <h2>Aggiungi al file .env</h2>
          <pre>
# TikTok Tokens
TIKTOK_ACCESS_TOKEN=${accessToken}
TIKTOK_REFRESH_TOKEN=${refreshToken || ''}
          </pre>

          <p>Copia queste righe nel file: <code>${envPath}</code></p>

          <hr>

          <p>Ora puoi usare lo script di posting:</p>
          <pre>node tools/social-automation/tiktok/post-tiktok.js --video video.mp4 --title "Titolo"</pre>
        </body>
        </html>
      `);

      console.log('\n✅ OAuth completato!');
      console.log(`Access Token: ${accessToken.substring(0, 20)}...`);
      console.log(`Expires in: ${expiresIn} seconds`);

    } catch (err) {
      console.error('Token exchange error:', err);
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end(`
        <h1>Errore Token</h1>
        <p>${err.message}</p>
        <p><a href="/">Riprova</a></p>
      `);
    }
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
}

// Start server
const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`\n🎵 TikTok OAuth Server`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`\n   Apri questo URL nel browser per autorizzare TikTok.\n`);
});
