#!/bin/bash
# Test X API with curl using OAuth 1.0a

API_KEY="0DmGN318TqYW5r1f4ikZDcxQJ"
API_SECRET="rg2syHwjM1rbZRLlKYsJ1RMtyvJ3YDZE1jpCxhsKtdRqHGlAQC"
ACCESS_TOKEN="2008309220731650048-NxklthpiLARZVjI0Cxw0LUhsRRyzfN"
ACCESS_SECRET="7XIlEMjgbrEfEPIQtx2qZYChqOjGBmbfWzwyUqJXgDyWe"

echo "Testing X API credentials with twurl-style request..."
echo "API Key: ${API_KEY:0:8}..."
echo "Access Token: ${ACCESS_TOKEN:0:20}..."

# Using node for OAuth signature (more reliable)
node -e "
const crypto = require('crypto');
const https = require('https');

const apiKey = '$API_KEY';
const apiSecret = '$API_SECRET';
const accessToken = '$ACCESS_TOKEN';
const accessSecret = '$ACCESS_SECRET';

const method = 'GET';
const baseUrl = 'https://api.twitter.com/1.1/account/verify_credentials.json';

const timestamp = Math.floor(Date.now() / 1000).toString();
const nonce = crypto.randomBytes(16).toString('hex');

const params = {
  oauth_consumer_key: apiKey,
  oauth_nonce: nonce,
  oauth_signature_method: 'HMAC-SHA1',
  oauth_timestamp: timestamp,
  oauth_token: accessToken,
  oauth_version: '1.0'
};

const sortedParams = Object.keys(params).sort().map(k => k + '=' + encodeURIComponent(params[k])).join('&');
const signatureBase = method + '&' + encodeURIComponent(baseUrl) + '&' + encodeURIComponent(sortedParams);
const signingKey = encodeURIComponent(apiSecret) + '&' + encodeURIComponent(accessSecret);
const signature = crypto.createHmac('sha1', signingKey).update(signatureBase).digest('base64');

params.oauth_signature = signature;
const authHeader = 'OAuth ' + Object.keys(params).map(k => k + '=\"' + encodeURIComponent(params[k]) + '\"').join(', ');

console.log('Making request to verify_credentials...');

const url = new URL(baseUrl);
const req = https.request({
  hostname: url.hostname,
  path: url.pathname,
  method: method,
  headers: {
    'Authorization': authHeader,
    'Content-Type': 'application/json'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
  });
});

req.on('error', e => console.error('Error:', e.message));
req.end();
"
