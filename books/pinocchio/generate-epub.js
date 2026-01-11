#!/usr/bin/env node
/**
 * Pinocchio Illustrated ePub Generator
 * Creates a proper ePub with 12 original watercolor illustrations
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const BOOK_DIR = __dirname;
const TEXT_PATH = path.join(BOOK_DIR, 'pinocchio-original.txt');
const IMAGES_DIR = path.join(BOOK_DIR, 'images');
const METADATA_PATH = path.join(BOOK_DIR, 'metadata.json');
const OUTPUT_PATH = path.join(BOOK_DIR, 'pinocchio-illustrated.epub');

// Map of chapter numbers to their illustrations
const CHAPTER_ILLUSTRATIONS = {
    3: 'ch03-geppetto-workshop.jpg',
    4: 'ch04-talking-cricket.jpg',
    8: 'ch08-going-to-school.jpg',
    10: 'ch10-marionette-theater.jpg',
    12: 'ch12-fox-and-cat.jpg',
    16: 'ch16-fairy-azure-hair.jpg',
    17: 'ch17-nose-growing.jpg',
    30: 'ch30-land-of-toys.jpg',
    32: 'ch32-donkey-transformation.jpg',
    35: 'ch35-inside-shark.jpg',
    36: 'ch36-real-boy.jpg'
};

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

function escapeXml(text) {
    if (!text) return '';
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function parseChapters(text) {
    const chapters = [];
    const chapterRegex = /CHAPTER\s+(\d+)\s*\n+([^\n]+)/g;
    let matches = [...text.matchAll(chapterRegex)];

    for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        const chapterNum = parseInt(match[1]);
        const subtitle = match[2].trim();
        const startIndex = match.index;
        const endIndex = i < matches.length - 1 ? matches[i + 1].index : text.length;
        const fullMatch = text.slice(startIndex, endIndex);
        const lines = fullMatch.split('\n');
        const chapterText = lines.slice(2).join('\n').trim();

        chapters.push({
            number: chapterNum,
            title: `Chapter ${chapterNum}: ${subtitle}`,
            subtitle: subtitle,
            text: chapterText
        });
    }
    return chapters;
}

async function main() {
    console.log('Generating Pinocchio Illustrated ePub...\n');

    const metadata = JSON.parse(fs.readFileSync(METADATA_PATH, 'utf8'));
    const text = fs.readFileSync(TEXT_PATH, 'utf8');
    const chapters = parseChapters(text);
    console.log(`Parsed ${chapters.length} chapters`);

    const uuid = generateUUID();
    const output = fs.createWriteStream(OUTPUT_PATH);
    const archive = archiver('zip', { store: true });

    archive.pipe(output);

    // mimetype MUST be first and uncompressed
    archive.append('application/epub+zip', { name: 'mimetype', store: true });

    // container.xml
    archive.append(`<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`, { name: 'META-INF/container.xml' });

    // Build manifest items and spine
    let manifestItems = `
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="style" href="style.css" media-type="text/css"/>
    <item id="cover-image" href="images/cover.jpg" media-type="image/jpeg" properties="cover-image"/>
    <item id="titlepage" href="titlepage.xhtml" media-type="application/xhtml+xml"/>`;

    let spineItems = `<itemref idref="titlepage"/>`;
    let navPoints = '';
    let playOrder = 1;

    // Add chapter manifest items
    for (const ch of chapters) {
        manifestItems += `\n    <item id="ch${ch.number}" href="ch${ch.number.toString().padStart(2,'0')}.xhtml" media-type="application/xhtml+xml"/>`;
        spineItems += `\n    <itemref idref="ch${ch.number}"/>`;
        navPoints += `
    <navPoint id="ch${ch.number}" playOrder="${++playOrder}">
      <navLabel><text>${escapeXml(ch.title)}</text></navLabel>
      <content src="ch${ch.number.toString().padStart(2,'0')}.xhtml"/>
    </navPoint>`;
    }

    // Add image manifest items
    archive.file(path.join(IMAGES_DIR, 'cover.jpg'), { name: 'OEBPS/images/cover.jpg' });
    for (const [chNum, imgFile] of Object.entries(CHAPTER_ILLUSTRATIONS)) {
        manifestItems += `\n    <item id="img${chNum}" href="images/${imgFile}" media-type="image/jpeg"/>`;
        archive.file(path.join(IMAGES_DIR, imgFile), { name: `OEBPS/images/${imgFile}` });
    }

    // content.opf
    archive.append(`<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="2.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
    <dc:title>${escapeXml(metadata.title)}</dc:title>
    <dc:creator opf:role="aut">${escapeXml(metadata.author)}</dc:creator>
    <dc:contributor opf:role="trl">${escapeXml(metadata.translator)}</dc:contributor>
    <dc:contributor opf:role="ill">${escapeXml(metadata.illustrator)}</dc:contributor>
    <dc:publisher>${escapeXml(metadata.publisher)}</dc:publisher>
    <dc:language>${metadata.language}</dc:language>
    <dc:identifier id="BookId">urn:uuid:${uuid}</dc:identifier>
    <dc:description>${escapeXml(metadata.description)}</dc:description>
    <meta name="cover" content="cover-image"/>
  </metadata>
  <manifest>${manifestItems}
  </manifest>
  <spine toc="ncx">${spineItems}
  </spine>
</package>`, { name: 'OEBPS/content.opf' });

    // toc.ncx
    archive.append(`<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="urn:uuid:${uuid}"/>
    <meta name="dtb:depth" content="1"/>
  </head>
  <docTitle><text>${escapeXml(metadata.title)}</text></docTitle>
  <navMap>
    <navPoint id="titlepage" playOrder="1">
      <navLabel><text>Title Page</text></navLabel>
      <content src="titlepage.xhtml"/>
    </navPoint>${navPoints}
  </navMap>
</ncx>`, { name: 'OEBPS/toc.ncx' });

    // style.css
    archive.append(`
body { font-family: Georgia, serif; margin: 1.5em; line-height: 1.7; }
h1, h2 { text-align: center; margin-top: 1.5em; }
h1 { font-size: 2em; }
h2 { font-size: 1.4em; color: #333; }
p { margin: 0.8em 0; text-indent: 1.5em; }
.center { text-align: center; }
.illustration { text-align: center; margin: 1.5em 0; }
.illustration img { max-width: 100%; height: auto; }
.subtitle { font-style: italic; color: #666; text-align: center; margin-bottom: 2em; }
`, { name: 'OEBPS/style.css' });

    // Title page
    archive.append(`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head><title>${escapeXml(metadata.title)}</title><link rel="stylesheet" type="text/css" href="style.css"/></head>
<body>
<div class="center" style="margin-top: 25%;">
<h1>${escapeXml(metadata.title)}</h1>
<p class="subtitle">${escapeXml(metadata.subtitle)}</p>
<p>by ${escapeXml(metadata.author)}</p>
<p style="font-size:0.9em;">Translated by ${escapeXml(metadata.translator)}</p>
<p style="font-size:0.9em;">Illustrated by ${escapeXml(metadata.illustrator)}</p>
<hr style="width:40%;margin:2em auto;"/>
<p style="font-size:0.8em;color:#888;">${escapeXml(metadata.publisher)}</p>
</div>
</body>
</html>`, { name: 'OEBPS/titlepage.xhtml' });

    // Generate chapter files
    for (const ch of chapters) {
        let content = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head><title>${escapeXml(ch.title)}</title><link rel="stylesheet" type="text/css" href="style.css"/></head>
<body>
<h2>${escapeXml(ch.title)}</h2>
`;
        // Add illustration if present
        if (CHAPTER_ILLUSTRATIONS[ch.number]) {
            content += `<div class="illustration"><img src="images/${CHAPTER_ILLUSTRATIONS[ch.number]}" alt="Chapter ${ch.number} illustration"/></div>\n`;
        }

        // Add chapter text
        const paragraphs = ch.text.split(/\n\n+/).filter(p => p.trim());
        for (const p of paragraphs) {
            content += `<p>${escapeXml(p.trim().replace(/\n/g, ' '))}</p>\n`;
        }

        content += `</body></html>`;
        archive.append(content, { name: `OEBPS/ch${ch.number.toString().padStart(2,'0')}.xhtml` });
    }

    await archive.finalize();

    return new Promise((resolve, reject) => {
        output.on('close', () => {
            const size = archive.pointer();
            console.log(`\n✅ ePub created: ${OUTPUT_PATH}`);
            console.log(`   Size: ${(size / 1024 / 1024).toFixed(2)} MB`);
            console.log(`   Chapters: ${chapters.length}`);
            console.log(`   Illustrations: ${Object.keys(CHAPTER_ILLUSTRATIONS).length + 1}`);
            resolve();
        });
        output.on('error', reject);
    });
}

main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
