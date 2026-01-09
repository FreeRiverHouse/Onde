#!/usr/bin/env node
/**
 * Factory Script: Prepare Assets
 * Prepara asset per video (organizza file, crea strutture)
 */

const fs = require('fs');
const path = require('path');

const BOOKS_PATH = path.join(__dirname, '../../books');
const OUTPUT_PATH = path.join(__dirname, '../../output/video-assets');

async function main() {
    console.log('Asset Preparation Factory starting...');

    if (!fs.existsSync(OUTPUT_PATH)) {
        fs.mkdirSync(OUTPUT_PATH, { recursive: true });
    }

    // Scan books for ready content
    const books = fs.readdirSync(BOOKS_PATH).filter(f => 
        fs.statSync(path.join(BOOKS_PATH, f)).isDirectory()
    );

    for (const book of books) {
        const bookPath = path.join(BOOKS_PATH, book);
        const metadataPath = path.join(bookPath, 'metadata.json');

        if (fs.existsSync(metadataPath)) {
            const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

            if (metadata.video_ready) {
                console.log(`Preparing assets for: ${book}`);

                const assetDir = path.join(OUTPUT_PATH, book);
                if (!fs.existsSync(assetDir)) {
                    fs.mkdirSync(assetDir, { recursive: true });
                }

                // Copy images
                const imagesPath = path.join(bookPath, 'images');
                if (fs.existsSync(imagesPath)) {
                    const images = fs.readdirSync(imagesPath);
                    for (const img of images) {
                        fs.copyFileSync(
                            path.join(imagesPath, img),
                            path.join(assetDir, img)
                        );
                    }
                    console.log(`  Copied ${images.length} images`);
                }

                // Create video manifest
                const manifest = {
                    book: book,
                    title: metadata.title,
                    images: fs.readdirSync(assetDir).filter(f => f.match(/\.(jpg|png)$/i)),
                    audio: null, // To be filled by audio factory
                    ready: false
                };

                fs.writeFileSync(
                    path.join(assetDir, 'manifest.json'),
                    JSON.stringify(manifest, null, 2)
                );

                console.log(`  Created manifest`);
            }
        }
    }

    console.log('Asset Preparation Factory complete');
}

main().catch(console.error);
