const https = require('https');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const BOT_TOKEN = '8272332520:AAF7zrKpqOCnFMqOlF1GJCLycJFk3IPO6ps';
const CHAT_ID = '7505631979';

const BOOK_PATH = '/Users/mattia/Projects/OndePRDB/clients/onde/books/meditations';

async function sendMessage(text) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      chat_id: CHAT_ID,
      text: text,
      parse_mode: 'HTML'
    });

    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${BOT_TOKEN}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        console.log('Message sent:', res.statusCode);
        resolve(JSON.parse(body));
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function sendDocument(filePath, caption) {
  return new Promise((resolve, reject) => {
    const boundary = '----FormBoundary' + Math.random().toString(36).substring(2);
    const fileName = path.basename(filePath);
    const fileContent = fs.readFileSync(filePath);

    let body = '';
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="chat_id"\r\n\r\n`;
    body += `${CHAT_ID}\r\n`;

    if (caption) {
      body += `--${boundary}\r\n`;
      body += `Content-Disposition: form-data; name="caption"\r\n\r\n`;
      body += `${caption}\r\n`;
    }

    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="document"; filename="${fileName}"\r\n`;
    body += `Content-Type: application/octet-stream\r\n\r\n`;

    const bodyStart = Buffer.from(body, 'utf8');
    const bodyEnd = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8');
    const fullBody = Buffer.concat([bodyStart, fileContent, bodyEnd]);

    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${BOT_TOKEN}/sendDocument`,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': fullBody.length
      }
    };

    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => responseBody += chunk);
      res.on('end', () => {
        console.log(`File ${fileName} sent:`, res.statusCode);
        resolve(JSON.parse(responseBody));
      });
    });

    req.on('error', reject);
    req.write(fullBody);
    req.end();
  });
}

async function sendPhoto(filePath, caption) {
  return new Promise((resolve, reject) => {
    const boundary = '----FormBoundary' + Math.random().toString(36).substring(2);
    const fileName = path.basename(filePath);
    const fileContent = fs.readFileSync(filePath);

    let body = '';
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="chat_id"\r\n\r\n`;
    body += `${CHAT_ID}\r\n`;

    if (caption) {
      body += `--${boundary}\r\n`;
      body += `Content-Disposition: form-data; name="caption"\r\n\r\n`;
      body += `${caption}\r\n`;
    }

    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="photo"; filename="${fileName}"\r\n`;
    body += `Content-Type: image/jpeg\r\n\r\n`;

    const bodyStart = Buffer.from(body, 'utf8');
    const bodyEnd = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8');
    const fullBody = Buffer.concat([bodyStart, fileContent, bodyEnd]);

    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${BOT_TOKEN}/sendPhoto`,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': fullBody.length
      }
    };

    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => responseBody += chunk);
      res.on('end', () => {
        console.log(`Photo ${fileName} sent:`, res.statusCode);
        resolve(JSON.parse(responseBody));
      });
    });

    req.on('error', reject);
    req.write(fullBody);
    req.end();
  });
}

async function main() {
  console.log('Sending Meditations book to Telegram...\n');

  // 1. Send notification message
  const message = `📚 <b>NUOVO LIBRO PRONTO PER REVIEW</b>

📖 <b>Meditations</b> - Marcus Aurelius
🏷️ Chain: ONDE CLASSICS
🌍 Lingua: EN (traduzioni in preparazione)

✅ QC Tecnico: PASSED
✅ Review Grok: APPROVED

<i>"This foreword is excellent and ready to go... exceptionally warm, human, specific. Perfect alignment with Onde Classics brand."</i> - Grok

📁 File in arrivo:
• cover-branded.jpg
• book.epub
• book.pdf`;

  await sendMessage(message);
  console.log('');

  // 2. Send cover
  await sendPhoto(
    path.join(BOOK_PATH, 'cover-branded.jpg'),
    '🎨 Copertina branded - MEDITATIONS'
  );

  // 3. Send ePub
  await sendDocument(
    path.join(BOOK_PATH, 'en/book.epub'),
    '📱 ePub - Meditations (EN)'
  );

  // 4. Send PDF
  await sendDocument(
    path.join(BOOK_PATH, 'en/book.pdf'),
    '📄 PDF - Meditations (EN)'
  );

  console.log('\n✅ All files sent to Telegram!');
}

main().catch(console.error);
