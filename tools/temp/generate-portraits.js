#!/usr/bin/env node
/**
 * Genera ritratti carini di Gianni Parola e Pina Pennello con Grok
 * Basato su personalità da onde db
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const GROK_API_KEY = 'xai-wLCxLMWGZyVgKPGcpqEqPQbO5Rr8Ue9Ky7k3IqvxbqJZWjhCRN1YyGF5ztQfNLpXvCKMxJRwH4Tn';

// Prompt per Gianni Parola
const gianniPrompt = `Create a warm, friendly portrait illustration of Gianni Parola, an Italian children's book writer. 

Character: 
- Warm, gentle man in his 40s-50s
- Kind eyes with a storyteller's twinkle
- Soft smile, approachable demeanor
- Wearing comfortable, creative clothing (maybe a cozy sweater or casual shirt)
- Holding a pen or notebook
- Surrounded by subtle elements: floating words, small stars, a gentle glow

Style:
- Soft watercolor illustration style
- Warm color palette: earth tones, soft golds, gentle greens
- Vintage European children's book aesthetic
- Inspired by Emanuele Luzzati and the Provensens
- Gentle, luminous quality
- Simple but expressive
- NOT photorealistic, artistic and charming

Mood: Warm, creative, spiritual, gentle - someone who writes stories that help children understand the world.`;

// Prompt per Pina Pennello
const pinaPrompt = `Create a bright, cheerful portrait illustration of Pina Pennello, an Italian children's book illustrator.

Character:
- Young woman in her 30s
- Bright, friendly eyes full of creativity
- Warm smile, luminous presence
- Wearing colorful, artistic clothing (maybe paint-splattered apron or creative outfit)
- Holding paintbrush or pencil
- Surrounded by: floating colors, small illustrations, light rays, creative sparkles

Style:
- Vibrant watercolor illustration style
- Bright color palette: vivid pastels, sunny yellows, warm pinks, sky blues
- Vintage European children's book aesthetic
- Inspired by Emanuele Luzzati and the Provensens
- "Quel raggio che dice ci sono anch'io" - that ray of light that says "I'm here too"
- Simple but expressive
- NOT photorealistic, artistic and charming

Mood: Luminous, friendly, creative, joyful - someone who brings stories to life with warm illustrations.`;

async function generateImage(prompt, filename) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      prompt: prompt,
      model: "grok-2-vision-1212",
      n: 1,
      response_format: "url"
    });

    const options = {
      hostname: 'api.x.ai',
      port: 443,
      path: '/v1/images/generations',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_API_KEY}`,
        'Content-Length': data.length
      }
    };

    console.log(`\n🎨 Generando ${filename}...`);

    const req = https.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          
          if (response.data && response.data[0] && response.data[0].url) {
            const imageUrl = response.data[0].url;
            console.log(`✅ Immagine generata: ${imageUrl}`);
            
            // Download immagine
            downloadImage(imageUrl, filename)
              .then(() => resolve(filename))
              .catch(reject);
          } else {
            reject(new Error(`Risposta Grok non valida: ${body}`));
          }
        } catch (e) {
          reject(new Error(`Errore parsing risposta: ${e.message}\n${body}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(new Error(`Errore richiesta: ${e.message}`));
    });

    req.write(data);
    req.end();
  });
}

async function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(__dirname, '../../books/psalm-23-abundance/images', filename);
    const file = fs.createWriteStream(outputPath);

    https.get(url, (response) => {
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`💾 Salvata: ${outputPath}`);
        resolve();
      });
    }).on('error', (e) => {
      fs.unlink(outputPath, () => {});
      reject(new Error(`Errore download: ${e.message}`));
    });
  });
}

async function main() {
  console.log('🚀 Generazione ritratti Gianni Parola e Pina Pennello\n');
  
  try {
    // Genera Gianni
    await generateImage(gianniPrompt, 'gianni-parola-portrait.jpg');
    
    // Attendi un po' tra le richieste
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Genera Pina
    await generateImage(pinaPrompt, 'pina-pennello-portrait.jpg');
    
    console.log('\n✅ Ritratti generati con successo!');
    console.log('📁 Salvati in: books/psalm-23-abundance/images/');
    
  } catch (error) {
    console.error('\n❌ Errore:', error.message);
    process.exit(1);
  }
}

main();
