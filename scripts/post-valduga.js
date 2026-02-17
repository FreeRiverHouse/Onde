const { TwitterApi } = require('twitter-api-v2');
const fs = require('fs');
const path = require('path');

// Magmatic account credentials
const client = new TwitterApi({
  appKey: 'lotfTfSXAxcFfbnfsLns4MaNd',
  appSecret: '4TjaL2LfmAKECLkuEriVmHKaAN55I1VNiM2VivFzYYO3lfsKGs',
  accessToken: '900791727186993152-r1g199r8VXtRojZxZsJ5OpLhRO25oeE',
  accessSecret: 'P76ZGWcw1yablCQMPwE0Z4vLTyhX9ISCFG2iCyflTzOwI',
});

const tweet = `"Ogni mio senso è in ogni senso immerso
e dice addio ogni cellula a ogni cellula:
risensata attraverso l'universo,
io sono un'alga, un'ala di libellula."

— Patrizia Valduga

Image by @grok`;

const imagePath = '/Users/mattiapetrucciani/Downloads/image - 2026-01-06T223301.015.jpg';

async function postWithImage() {
  try {
    console.log('Uploading image...');
    const mediaId = await client.v1.uploadMedia(imagePath);
    console.log('Image uploaded, media_id:', mediaId);

    console.log('Posting tweet...');
    const result = await client.v2.tweet({
      text: tweet,
      media: { media_ids: [mediaId] }
    });

    console.log('Tweet posted successfully!');
    console.log('Tweet ID:', result.data.id);
    console.log('URL: https://x.com/magmatic__/status/' + result.data.id);

    return result;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

postWithImage();
