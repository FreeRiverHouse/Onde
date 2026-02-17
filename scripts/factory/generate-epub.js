#!/usr/bin/env node
/**
 * Generatore ePub Automatico
 * Prende testi in pubblico dominio e genera ePub pronti per la vendita
 *
 * Input: catalog.json con testi
 * Output: file .epub pronti
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '../../output/ebooks');
const CATALOG_PATH = path.join(__dirname, '../../content/public-domain/catalog-expanded.json');

// Template ePub minimo (OPF, NCX, HTML)
function generateEpubStructure(book) {
    const bookDir = path.join(OUTPUT_DIR, book.id);

    // Crea struttura
    fs.mkdirSync(path.join(bookDir, 'META-INF'), { recursive: true });
    fs.mkdirSync(path.join(bookDir, 'OEBPS'), { recursive: true });

    // mimetype (DEVE essere primo file, non compresso)
    fs.writeFileSync(path.join(bookDir, 'mimetype'), 'application/epub+zip');

    // container.xml
    fs.writeFileSync(path.join(bookDir, 'META-INF', 'container.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
    <rootfiles>
        <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
    </rootfiles>
</container>`);

    // content.opf
    fs.writeFileSync(path.join(bookDir, 'OEBPS', 'content.opf'), `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="2.0">
    <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
        <dc:title>${escapeXml(book.title)}</dc:title>
        <dc:creator>${escapeXml(book.author || 'Onde Publishing')}</dc:creator>
        <dc:publisher>Onde Publishing</dc:publisher>
        <dc:language>it</dc:language>
        <dc:identifier id="BookId">urn:uuid:${generateUUID()}</dc:identifier>
        <dc:description>${escapeXml(book.description || '')}</dc:description>
    </metadata>
    <manifest>
        <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
        <item id="content" href="content.xhtml" media-type="application/xhtml+xml"/>
        <item id="style" href="style.css" media-type="text/css"/>
    </manifest>
    <spine toc="ncx">
        <itemref idref="content"/>
    </spine>
</package>`);

    // toc.ncx
    fs.writeFileSync(path.join(bookDir, 'OEBPS', 'toc.ncx'), `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
    <head>
        <meta name="dtb:uid" content="${book.id}"/>
    </head>
    <docTitle><text>${escapeXml(book.title)}</text></docTitle>
    <navMap>
        <navPoint id="content" playOrder="1">
            <navLabel><text>${escapeXml(book.title)}</text></navLabel>
            <content src="content.xhtml"/>
        </navPoint>
    </navMap>
</ncx>`);

    // style.css
    fs.writeFileSync(path.join(bookDir, 'OEBPS', 'style.css'), `
body {
    font-family: Georgia, serif;
    margin: 2em;
    line-height: 1.6;
}
h1 {
    text-align: center;
    margin-bottom: 2em;
    color: #333;
}
h2 {
    margin-top: 2em;
    color: #555;
}
p {
    margin: 1em 0;
    text-indent: 1.5em;
}
.poem {
    font-style: italic;
    margin: 2em;
    padding-left: 2em;
    border-left: 2px solid #ccc;
}
.author {
    text-align: center;
    font-style: italic;
    margin-bottom: 2em;
    color: #666;
}
.publisher {
    text-align: center;
    margin-top: 3em;
    font-size: 0.9em;
    color: #888;
}
`);

    // content.xhtml (placeholder - da riempire con contenuto reale)
    const contentHtml = generateContentHtml(book);
    fs.writeFileSync(path.join(bookDir, 'OEBPS', 'content.xhtml'), contentHtml);

    return bookDir;
}

function generateContentHtml(book) {
    const contents = book.contents || [];
    const contentList = Array.isArray(contents)
        ? contents.map(c => `<li>${escapeXml(c)}</li>`).join('\n')
        : `<p>${escapeXml(contents)}</p>`;

    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title>${escapeXml(book.title)}</title>
    <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
    <h1>${escapeXml(book.title)}</h1>
    ${book.author ? `<p class="author">di ${escapeXml(book.author)}</p>` : ''}

    <h2>Contenuti</h2>
    <ul>
        ${contentList}
    </ul>

    <hr/>

    <p>
        [INSERIRE TESTO COMPLETO QUI]
    </p>
    <p>
        I testi in questo ebook sono in pubblico dominio.
    </p>

    <p class="publisher">
        Pubblicato da Onde Publishing<br/>
        ondebooks.com
    </p>
</body>
</html>`;
}

function escapeXml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

async function main() {
    console.log('ePub Generator starting...\n');

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Carica catalogo
    if (!fs.existsSync(CATALOG_PATH)) {
        console.log('Catalog not found at:', CATALOG_PATH);
        return;
    }

    const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));

    let generated = 0;

    // Processa ogni categoria
    for (const [category, data] of Object.entries(catalog.collections)) {
        console.log(`\n📚 Categoria: ${category.toUpperCase()}`);

        for (const book of data.books) {
            console.log(`  - ${book.title} (€${book.price})`);

            try {
                const bookDir = generateEpubStructure(book);
                console.log(`    ✓ Struttura creata: ${bookDir}`);
                generated++;
            } catch (e) {
                console.log(`    ✗ Errore: ${e.message}`);
            }
        }
    }

    console.log(`\n✅ Generati ${generated} ebook structure`);
    console.log(`\n📝 PROSSIMI STEP:`);
    console.log(`   1. Aggiungere i testi reali ai file content.xhtml`);
    console.log(`   2. Generare copertine con Grok (quando Chrome disponibile)`);
    console.log(`   3. Zippare le cartelle in .epub`);
    console.log(`   4. Uploadare su Onde Books Store`);
}

main().catch(console.error);
