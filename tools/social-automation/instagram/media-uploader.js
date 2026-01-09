#!/usr/bin/env node

/**
 * Media Uploader per Instagram
 *
 * Carica immagini/video su Cloudflare R2 per ottenere URL pubblici
 * necessari per Meta Graph API
 *
 * Uso:
 *   node media-uploader.js upload /path/to/image.jpg
 *   node media-uploader.js upload /path/to/video.mp4
 *   node media-uploader.js list
 *   node media-uploader.js delete filename.jpg
 *
 * Task: social-ig-002
 * Data: 2026-01-09
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

// ============================================================================
// CONFIGURAZIONE
// ============================================================================

const CONFIG = {
  // Cloudflare R2
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY,
  secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY,
  bucket: process.env.CLOUDFLARE_R2_BUCKET || 'onde-media',

  // URL pubblico (custom domain o R2.dev)
  publicBaseUrl: process.env.CLOUDFLARE_R2_PUBLIC_URL || null,

  // Limiti
  maxImageSizeMB: 8,
  maxVideoSizeMB: 1024,

  // Tipi supportati
  supportedImages: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  supportedVideos: ['.mp4', '.mov'],
};

// ============================================================================
// UTILITY
// ============================================================================

/**
 * Genera hash SHA256
 */
function sha256(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Genera HMAC SHA256
 */
function hmacSha256(key, content) {
  return crypto.createHmac('sha256', key).update(content).digest();
}

/**
 * Genera firma AWS Signature v4
 */
function signRequest(method, path, headers, payload, region = 'auto') {
  const service = 's3';
  const host = `${CONFIG.accountId}.r2.cloudflarestorage.com`;
  const date = new Date();
  const amzDate = date.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);

  // Canonical request
  const canonicalUri = path;
  const canonicalQueryString = '';
  const payloadHash = sha256(payload || '');

  const canonicalHeaders =
    Object.entries(headers)
      .map(([k, v]) => `${k.toLowerCase()}:${v.trim()}`)
      .sort()
      .join('\n') + '\n';

  const signedHeaders = Object.keys(headers)
    .map((k) => k.toLowerCase())
    .sort()
    .join(';');

  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n');

  // String to sign
  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [algorithm, amzDate, credentialScope, sha256(canonicalRequest)].join('\n');

  // Signing key
  const kDate = hmacSha256('AWS4' + CONFIG.secretAccessKey, dateStamp);
  const kRegion = hmacSha256(kDate, region);
  const kService = hmacSha256(kRegion, service);
  const kSigning = hmacSha256(kService, 'aws4_request');

  // Signature
  const signature = hmacSha256(kSigning, stringToSign).toString('hex');

  // Authorization header
  const authorization = `${algorithm} Credential=${CONFIG.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return {
    authorization,
    amzDate,
    payloadHash,
  };
}

/**
 * Determina content type dal file
 */
function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.mp4': 'video/mp4',
    '.mov': 'video/quicktime',
  };
  return types[ext] || 'application/octet-stream';
}

/**
 * Genera nome file univoco
 */
function generateFileName(originalPath) {
  const ext = path.extname(originalPath);
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString('hex');
  return `onde-${timestamp}-${random}${ext}`;
}

// ============================================================================
// R2 OPERATIONS
// ============================================================================

/**
 * Upload file su R2
 */
async function uploadToR2(filePath) {
  // Verifica file
  if (!fs.existsSync(filePath)) {
    throw new Error(`File non trovato: ${filePath}`);
  }

  const stats = fs.statSync(filePath);
  const sizeMB = stats.size / (1024 * 1024);
  const ext = path.extname(filePath).toLowerCase();

  // Verifica tipo
  const isImage = CONFIG.supportedImages.includes(ext);
  const isVideo = CONFIG.supportedVideos.includes(ext);

  if (!isImage && !isVideo) {
    throw new Error(`Tipo file non supportato: ${ext}`);
  }

  // Verifica dimensioni
  if (isImage && sizeMB > CONFIG.maxImageSizeMB) {
    throw new Error(`Immagine troppo grande: ${sizeMB.toFixed(1)}MB (max ${CONFIG.maxImageSizeMB}MB)`);
  }

  if (isVideo && sizeMB > CONFIG.maxVideoSizeMB) {
    throw new Error(`Video troppo grande: ${sizeMB.toFixed(1)}MB (max ${CONFIG.maxVideoSizeMB}MB)`);
  }

  console.log(`\n[Upload] ${path.basename(filePath)}`);
  console.log(`  Tipo: ${isImage ? 'Immagine' : 'Video'}`);
  console.log(`  Dimensione: ${sizeMB.toFixed(2)}MB`);

  // Leggi file
  const fileContent = fs.readFileSync(filePath);
  const fileName = generateFileName(filePath);
  const contentType = getContentType(filePath);

  // Prepara headers
  const host = `${CONFIG.accountId}.r2.cloudflarestorage.com`;
  const objectPath = `/${CONFIG.bucket}/${fileName}`;

  const headers = {
    Host: host,
    'Content-Type': contentType,
    'Content-Length': fileContent.length.toString(),
    'x-amz-content-sha256': sha256(fileContent),
  };

  // Firma richiesta
  const { authorization, amzDate } = signRequest('PUT', objectPath, headers, fileContent);

  headers['x-amz-date'] = amzDate;
  headers['Authorization'] = authorization;

  // Esegui upload
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        method: 'PUT',
        hostname: host,
        path: objectPath,
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            // Costruisci URL pubblico
            let publicUrl;
            if (CONFIG.publicBaseUrl) {
              publicUrl = `${CONFIG.publicBaseUrl}/${fileName}`;
            } else {
              // URL R2.dev (richiede public access abilitato sul bucket)
              publicUrl = `https://${CONFIG.bucket}.${CONFIG.accountId}.r2.dev/${fileName}`;
            }

            console.log(`  Status: ${res.statusCode} OK`);
            console.log(`  File: ${fileName}`);
            console.log(`  URL: ${publicUrl}`);

            resolve({
              fileName,
              publicUrl,
              contentType,
              size: fileContent.length,
            });
          } else {
            reject(new Error(`Upload fallito: ${res.statusCode} - ${data}`));
          }
        });
      }
    );

    req.on('error', reject);
    req.write(fileContent);
    req.end();
  });
}

/**
 * Lista file nel bucket
 */
async function listFiles(prefix = 'onde-') {
  const host = `${CONFIG.accountId}.r2.cloudflarestorage.com`;
  const objectPath = `/${CONFIG.bucket}?prefix=${prefix}`;

  const headers = {
    Host: host,
  };

  const { authorization, amzDate } = signRequest('GET', objectPath, headers, '');

  headers['x-amz-date'] = amzDate;
  headers['Authorization'] = authorization;
  headers['x-amz-content-sha256'] = sha256('');

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        method: 'GET',
        hostname: host,
        path: objectPath,
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            // Parse XML response
            const files = [];
            const regex = /<Key>([^<]+)<\/Key>.*?<Size>(\d+)<\/Size>/gs;
            let match;
            while ((match = regex.exec(data)) !== null) {
              files.push({
                name: match[1],
                size: parseInt(match[2]),
              });
            }
            resolve(files);
          } else {
            reject(new Error(`List fallita: ${res.statusCode} - ${data}`));
          }
        });
      }
    );

    req.on('error', reject);
    req.end();
  });
}

/**
 * Elimina file dal bucket
 */
async function deleteFile(fileName) {
  const host = `${CONFIG.accountId}.r2.cloudflarestorage.com`;
  const objectPath = `/${CONFIG.bucket}/${fileName}`;

  const headers = {
    Host: host,
  };

  const { authorization, amzDate } = signRequest('DELETE', objectPath, headers, '');

  headers['x-amz-date'] = amzDate;
  headers['Authorization'] = authorization;
  headers['x-amz-content-sha256'] = sha256('');

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        method: 'DELETE',
        hostname: host,
        path: objectPath,
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`[Eliminato] ${fileName}`);
            resolve(true);
          } else {
            reject(new Error(`Delete fallita: ${res.statusCode} - ${data}`));
          }
        });
      }
    );

    req.on('error', reject);
    req.end();
  });
}

// ============================================================================
// CLI
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  // Verifica configurazione
  if (!CONFIG.accountId || !CONFIG.accessKeyId || !CONFIG.secretAccessKey) {
    console.error('[ERRORE] Mancano variabili ambiente Cloudflare R2:');
    console.error('  CLOUDFLARE_ACCOUNT_ID');
    console.error('  CLOUDFLARE_R2_ACCESS_KEY');
    console.error('  CLOUDFLARE_R2_SECRET_KEY');
    console.error('\nConfigura in .env file');
    process.exit(1);
  }

  try {
    switch (command) {
      case 'upload': {
        const filePath = args[1];
        if (!filePath) {
          console.error('Uso: node media-uploader.js upload /path/to/file');
          process.exit(1);
        }

        const result = await uploadToR2(filePath);
        console.log('\n[SUCCESSO] File caricato!');
        console.log('\nUsa questo URL per Instagram:');
        console.log(result.publicUrl);
        break;
      }

      case 'list': {
        console.log('\n[Lista File]');
        const files = await listFiles();

        if (files.length === 0) {
          console.log('Nessun file trovato.');
        } else {
          console.log(`Trovati ${files.length} file:\n`);
          for (const file of files) {
            const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
            console.log(`  ${file.name} (${sizeMB}MB)`);
          }
        }
        break;
      }

      case 'delete': {
        const fileName = args[1];
        if (!fileName) {
          console.error('Uso: node media-uploader.js delete filename.jpg');
          process.exit(1);
        }

        await deleteFile(fileName);
        console.log('\n[SUCCESSO] File eliminato!');
        break;
      }

      default:
        console.log(`
Media Uploader per Instagram - Onde Publishing
==============================================

Carica media su Cloudflare R2 per ottenere URL pubblici
necessari per Meta Graph API.

Comandi disponibili:

  upload /path/file   Carica file su R2
  list                Lista file nel bucket
  delete filename     Elimina file dal bucket

Esempi:
  node media-uploader.js upload ~/Downloads/copertina.jpg
  node media-uploader.js upload ~/Downloads/reel.mp4
  node media-uploader.js list
  node media-uploader.js delete onde-1234567890-abcd1234.jpg

Tipi supportati:
  Immagini: ${CONFIG.supportedImages.join(', ')} (max ${CONFIG.maxImageSizeMB}MB)
  Video: ${CONFIG.supportedVideos.join(', ')} (max ${CONFIG.maxVideoSizeMB}MB)

Configurazione richiesta in .env:
  CLOUDFLARE_ACCOUNT_ID
  CLOUDFLARE_R2_ACCESS_KEY
  CLOUDFLARE_R2_SECRET_KEY
  CLOUDFLARE_R2_BUCKET (default: onde-media)
  CLOUDFLARE_R2_PUBLIC_URL (opzionale, per custom domain)
        `);
    }
  } catch (error) {
    console.error('\n[ERRORE]', error.message);
    process.exit(1);
  }
}

// Export per uso come modulo
module.exports = {
  uploadToR2,
  listFiles,
  deleteFile,
  getContentType,
  generateFileName,
};

// Esegui se chiamato direttamente
if (require.main === module) {
  main();
}
