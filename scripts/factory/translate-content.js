#!/usr/bin/env node
/**
 * Factory Script: Translate Content
 * Traduce contenuti in multiple lingue usando Claude API
 */

const fs = require('fs');
const path = require('path');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!ANTHROPIC_API_KEY) {
    console.log('ANTHROPIC_API_KEY not set - skipping translation');
    process.exit(0);
}

const LANGUAGES = ['it', 'en', 'es', 'fr', 'de', 'pt'];
const QUEUE_PATH = path.join(__dirname, '../../queue/translation-queue.json');
const OUTPUT_PATH = path.join(__dirname, '../../output/translations');

async function translateText(text, targetLang) {
    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic();

    const langNames = {
        'it': 'Italian', 'en': 'English', 'es': 'Spanish',
        'fr': 'French', 'de': 'German', 'pt': 'Portuguese'
    };

    const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{
            role: 'user',
            content: `Translate the following text to ${langNames[targetLang]}. Keep the same tone and style. Only output the translation, nothing else.\n\n${text}`
        }]
    });

    return response.content[0].text;
}

async function main() {
    console.log('Translation Factory starting...');

    if (!fs.existsSync(OUTPUT_PATH)) {
        fs.mkdirSync(OUTPUT_PATH, { recursive: true });
    }

    if (!fs.existsSync(QUEUE_PATH)) {
        console.log('No translation queue found');
        return;
    }

    const queue = JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'));

    for (const item of queue) {
        if (item.status === 'pending') {
            console.log(`Translating: ${item.name}`);

            item.translations = {};

            for (const lang of item.languages || LANGUAGES) {
                try {
                    const translated = await translateText(item.text, lang);
                    const outputFile = path.join(OUTPUT_PATH, `${item.name}_${lang}.txt`);
                    fs.writeFileSync(outputFile, translated);
                    item.translations[lang] = outputFile;
                    console.log(`  ${lang}: done`);
                } catch (e) {
                    console.error(`  ${lang}: failed - ${e.message}`);
                }
            }

            item.status = 'completed';
        }
    }

    fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2));
    console.log('Translation Factory complete');
}

main().catch(console.error);
