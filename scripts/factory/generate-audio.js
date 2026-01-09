#!/usr/bin/env node
/**
 * Factory Script: Generate Audio
 * Genera audio con ElevenLabs API per contenuti pronti
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = 'pNInz6obpgDQGcFmaJgB'; // Default voice (Adam)

if (!ELEVENLABS_API_KEY) {
    console.log('ELEVENLABS_API_KEY not set - skipping audio generation');
    process.exit(0);
}

const QUEUE_PATH = path.join(__dirname, '../../queue/audio-queue.json');
const OUTPUT_PATH = path.join(__dirname, '../../output/audio');

async function generateAudio(text, outputFile) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            text: text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75
            }
        });

        const options = {
            hostname: 'api.elevenlabs.io',
            path: `/v1/text-to-speech/${VOICE_ID}`,
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': ELEVENLABS_API_KEY
            }
        };

        const req = https.request(options, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`API returned ${res.statusCode}`));
                return;
            }

            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => {
                fs.writeFileSync(outputFile, Buffer.concat(chunks));
                resolve(outputFile);
            });
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function main() {
    console.log('Audio Factory starting...');

    // Create output directory
    if (!fs.existsSync(OUTPUT_PATH)) {
        fs.mkdirSync(OUTPUT_PATH, { recursive: true });
    }

    // Check queue
    if (!fs.existsSync(QUEUE_PATH)) {
        console.log('No audio queue found');
        return;
    }

    const queue = JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'));

    for (const item of queue) {
        if (item.status === 'pending') {
            console.log(`Generating: ${item.name}`);
            try {
                const outputFile = path.join(OUTPUT_PATH, `${item.name}.mp3`);
                await generateAudio(item.text, outputFile);
                item.status = 'completed';
                item.outputFile = outputFile;
                console.log(`Done: ${outputFile}`);
            } catch (e) {
                console.error(`Failed: ${item.name}`, e.message);
                item.status = 'failed';
                item.error = e.message;
            }
        }
    }

    fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2));
    console.log('Audio Factory complete');
}

main().catch(console.error);
