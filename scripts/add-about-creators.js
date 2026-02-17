#!/usr/bin/env node
/**
 * Script per aggiungere la pagina "About the Creators" a tutti i libri Onde
 *
 * Uso: node scripts/add-about-creators.js
 *
 * Prerequisiti:
 * - Ritratti in /templates/portraits/gianni-parola-portrait.jpg
 * - Ritratti in /templates/portraits/pina-pennello-portrait.jpg
 */

const fs = require('fs');
const path = require('path');

const BOOKS_DIR = path.join(__dirname, '..', 'books');
const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');
const PORTRAITS_DIR = path.join(TEMPLATES_DIR, 'portraits');

// CSS per la pagina About the Creators
const CREATORS_CSS = `
    /* ===== ABOUT THE CREATORS ===== */
    .creators-page {
        background: linear-gradient(180deg, #faf8f5 0%, #f5e6b3 100%);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 15mm 20mm;
    }

    .creators-title {
        font-family: 'Libre Baskerville', serif;
        font-size: 22pt;
        color: #2c3e50;
        margin-bottom: 12mm;
        text-align: center;
    }

    .creators-container {
        display: flex;
        flex-direction: column;
        gap: 15mm;
        width: 100%;
        max-width: 160mm;
    }

    .creator-card {
        display: flex;
        align-items: flex-start;
        gap: 8mm;
        background: rgba(255,255,255,0.7);
        padding: 8mm;
        border-radius: 12px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.08);
    }

    .creator-portrait {
        width: 40mm;
        height: 40mm;
        border-radius: 50%;
        object-fit: cover;
        border: 3px solid #d4af37;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        flex-shrink: 0;
    }

    .creator-info {
        flex: 1;
    }

    .creator-name {
        font-family: 'Libre Baskerville', serif;
        font-size: 16pt;
        color: #2c3e50;
        margin-bottom: 3mm;
    }

    .creator-role {
        font-size: 10pt;
        color: #d4af37;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        margin-bottom: 4mm;
    }

    .creator-bio {
        font-size: 11pt;
        line-height: 1.7;
        color: #5d6d7e;
    }

    .creators-footer {
        margin-top: 12mm;
        text-align: center;
    }

    .publisher-logo {
        font-family: 'Libre Baskerville', serif;
        font-size: 14pt;
        color: #d4af37;
        font-weight: 600;
    }

    .publisher-tagline {
        font-size: 10pt;
        color: #5d6d7e;
        font-style: italic;
        margin-top: 2mm;
    }
`;

// Versioni della pagina About the Creators
const CREATORS_PAGE = {
    en: `
<!-- ABOUT THE CREATORS -->
<div class="page creators-page">
    <h2 class="creators-title">About the Creators</h2>

    <div class="creators-container">
        <div class="creator-card">
            <img class="creator-portrait" src="images/gianni-parola-portrait.jpg" alt="Gianni Parola">
            <div class="creator-info">
                <h3 class="creator-name">Gianni Parola</h3>
                <p class="creator-role">Writer</p>
                <p class="creator-bio">
                    Gianni Parola writes stories that help children understand the world around them.
                    He believes every child deserves books that spark curiosity and wonder.
                </p>
            </div>
        </div>

        <div class="creator-card">
            <img class="creator-portrait" src="images/pina-pennello-portrait.jpg" alt="Pina Pennello">
            <div class="creator-info">
                <h3 class="creator-name">Pina Pennello</h3>
                <p class="creator-role">Illustrator</p>
                <p class="creator-bio">
                    Pina Pennello brings stories to life with her warm watercolor illustrations.
                    Her art is inspired by the gentle beauty of Italian countryside
                    and the magic in everyday moments.
                </p>
            </div>
        </div>
    </div>

    <div class="creators-footer">
        <p class="publisher-logo">Onde Publishing</p>
        <p class="publisher-tagline">Free River House</p>
    </div>
</div>
`,
    it: `
<!-- GLI AUTORI -->
<div class="page creators-page">
    <h2 class="creators-title">Gli Autori</h2>

    <div class="creators-container">
        <div class="creator-card">
            <img class="creator-portrait" src="images/gianni-parola-portrait.jpg" alt="Gianni Parola">
            <div class="creator-info">
                <h3 class="creator-name">Gianni Parola</h3>
                <p class="creator-role">Scrittore</p>
                <p class="creator-bio">
                    Gianni Parola scrive storie che aiutano i bambini a capire il mondo che li circonda.
                    Crede che ogni bambino meriti libri che accendano la curiosità e la meraviglia.
                </p>
            </div>
        </div>

        <div class="creator-card">
            <img class="creator-portrait" src="images/pina-pennello-portrait.jpg" alt="Pina Pennello">
            <div class="creator-info">
                <h3 class="creator-name">Pina Pennello</h3>
                <p class="creator-role">Illustratrice</p>
                <p class="creator-bio">
                    Pina Pennello dà vita alle storie con le sue calde illustrazioni ad acquarello.
                    La sua arte è ispirata alla dolce bellezza della campagna italiana
                    e alla magia dei momenti quotidiani.
                </p>
            </div>
        </div>
    </div>

    <div class="creators-footer">
        <p class="publisher-logo">Casa Editrice Onde</p>
        <p class="publisher-tagline">Free River House</p>
    </div>
</div>
`,
    de: `
<!-- ÜBER DIE AUTOREN -->
<div class="page creators-page">
    <h2 class="creators-title">Über die Autoren</h2>

    <div class="creators-container">
        <div class="creator-card">
            <img class="creator-portrait" src="images/gianni-parola-portrait.jpg" alt="Gianni Parola">
            <div class="creator-info">
                <h3 class="creator-name">Gianni Parola</h3>
                <p class="creator-role">Autor</p>
                <p class="creator-bio">
                    Gianni Parola schreibt Geschichten, die Kindern helfen, die Welt um sie herum zu verstehen.
                    Er glaubt, dass jedes Kind Bücher verdient, die Neugier und Staunen wecken.
                </p>
            </div>
        </div>

        <div class="creator-card">
            <img class="creator-portrait" src="images/pina-pennello-portrait.jpg" alt="Pina Pennello">
            <div class="creator-info">
                <h3 class="creator-name">Pina Pennello</h3>
                <p class="creator-role">Illustratorin</p>
                <p class="creator-bio">
                    Pina Pennello erweckt Geschichten mit ihren warmen Aquarellillustrationen zum Leben.
                    Ihre Kunst ist von der sanften Schönheit der italienischen Landschaft
                    und der Magie alltäglicher Momente inspiriert.
                </p>
            </div>
        </div>
    </div>

    <div class="creators-footer">
        <p class="publisher-logo">Onde Publishing</p>
        <p class="publisher-tagline">Free River House</p>
    </div>
</div>
`,
    fr: `
<!-- À PROPOS DES CRÉATEURS -->
<div class="page creators-page">
    <h2 class="creators-title">À propos des créateurs</h2>

    <div class="creators-container">
        <div class="creator-card">
            <img class="creator-portrait" src="images/gianni-parola-portrait.jpg" alt="Gianni Parola">
            <div class="creator-info">
                <h3 class="creator-name">Gianni Parola</h3>
                <p class="creator-role">Auteur</p>
                <p class="creator-bio">
                    Gianni Parola écrit des histoires qui aident les enfants à comprendre le monde qui les entoure.
                    Il croit que chaque enfant mérite des livres qui éveillent la curiosité et l'émerveillement.
                </p>
            </div>
        </div>

        <div class="creator-card">
            <img class="creator-portrait" src="images/pina-pennello-portrait.jpg" alt="Pina Pennello">
            <div class="creator-info">
                <h3 class="creator-name">Pina Pennello</h3>
                <p class="creator-role">Illustratrice</p>
                <p class="creator-bio">
                    Pina Pennello donne vie aux histoires avec ses chaleureuses illustrations à l'aquarelle.
                    Son art s'inspire de la douce beauté de la campagne italienne
                    et de la magie des moments quotidiens.
                </p>
            </div>
        </div>
    </div>

    <div class="creators-footer">
        <p class="publisher-logo">Onde Publishing</p>
        <p class="publisher-tagline">Free River House</p>
    </div>
</div>
`,
    es: `
<!-- SOBRE LOS CREADORES -->
<div class="page creators-page">
    <h2 class="creators-title">Sobre los creadores</h2>

    <div class="creators-container">
        <div class="creator-card">
            <img class="creator-portrait" src="images/gianni-parola-portrait.jpg" alt="Gianni Parola">
            <div class="creator-info">
                <h3 class="creator-name">Gianni Parola</h3>
                <p class="creator-role">Escritor</p>
                <p class="creator-bio">
                    Gianni Parola escribe historias que ayudan a los niños a entender el mundo que los rodea.
                    Cree que todo niño merece libros que despierten la curiosidad y el asombro.
                </p>
            </div>
        </div>

        <div class="creator-card">
            <img class="creator-portrait" src="images/pina-pennello-portrait.jpg" alt="Pina Pennello">
            <div class="creator-info">
                <h3 class="creator-name">Pina Pennello</h3>
                <p class="creator-role">Ilustradora</p>
                <p class="creator-bio">
                    Pina Pennello da vida a las historias con sus cálidas ilustraciones en acuarela.
                    Su arte está inspirado en la suave belleza del campo italiano
                    y en la magia de los momentos cotidianos.
                </p>
            </div>
        </div>
    </div>

    <div class="creators-footer">
        <p class="publisher-logo">Onde Publishing</p>
        <p class="publisher-tagline">Free River House</p>
    </div>
</div>
`
};

function detectLanguage(html) {
    if (html.includes('lang="it"') || html.includes('Capitolo') || html.includes('libro')) return 'it';
    if (html.includes('lang="de"') || html.includes('Kapitel')) return 'de';
    if (html.includes('lang="fr"') || html.includes('Chapitre')) return 'fr';
    if (html.includes('lang="es"') || html.includes('Capítulo')) return 'es';
    return 'en';
}

function hasCreatorsPage(html) {
    return html.includes('creators-page') || html.includes('About the Creators') || html.includes('Gli Autori');
}

function addCreatorsPage(html, lang) {
    // Se già presente, non fare nulla
    if (hasCreatorsPage(html)) {
        return { html, modified: false };
    }

    // Aggiungi CSS prima di </style>
    const styleEndIndex = html.lastIndexOf('</style>');
    if (styleEndIndex === -1) {
        console.log('  ⚠️  No </style> tag found');
        return { html, modified: false };
    }

    html = html.slice(0, styleEndIndex) + CREATORS_CSS + '\n    ' + html.slice(styleEndIndex);

    // Trova la pagina "Fine" o "end-page"
    const endPageMatch = html.match(/<!--\s*(FINE|END|CREDITS|Fine)\s*-->/i);
    if (endPageMatch) {
        const insertIndex = html.indexOf(endPageMatch[0]);
        html = html.slice(0, insertIndex) + CREATORS_PAGE[lang] + '\n\n' + html.slice(insertIndex);
    } else {
        // Cerca end-page class
        const endPageClassMatch = html.match(/<div class="page end-page">/);
        if (endPageClassMatch) {
            const insertIndex = html.indexOf(endPageClassMatch[0]);
            html = html.slice(0, insertIndex) + CREATORS_PAGE[lang] + '\n\n' + html.slice(insertIndex);
        } else {
            console.log('  ⚠️  No end page found');
            return { html, modified: false };
        }
    }

    return { html, modified: true };
}

function copyPortraits(bookDir) {
    const imagesDir = path.join(bookDir, 'images');
    if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
    }

    const portraits = ['gianni-parola-portrait.jpg', 'pina-pennello-portrait.jpg'];
    for (const portrait of portraits) {
        const src = path.join(PORTRAITS_DIR, portrait);
        const dest = path.join(imagesDir, portrait);

        if (fs.existsSync(src) && !fs.existsSync(dest)) {
            fs.copyFileSync(src, dest);
            console.log(`  📷 Copied ${portrait}`);
        }
    }
}

function processBook(bookPath) {
    const bookDir = path.dirname(bookPath);
    const bookName = path.basename(bookPath);

    console.log(`\n📖 Processing: ${bookName}`);

    let html = fs.readFileSync(bookPath, 'utf8');
    const lang = detectLanguage(html);
    console.log(`  🌐 Language: ${lang}`);

    const result = addCreatorsPage(html, lang);

    if (result.modified) {
        fs.writeFileSync(bookPath, result.html);
        console.log(`  ✅ Added "About the Creators" page`);
        copyPortraits(bookDir);
    } else {
        console.log(`  ⏭️  Skipped (already has creators page or no end page found)`);
    }
}

function findAllBooks() {
    const books = [];

    function walkDir(dir) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory() && file !== 'node_modules') {
                walkDir(filePath);
            } else if (file.endsWith('.html') && (file.startsWith('book') || file.startsWith('libro'))) {
                books.push(filePath);
            }
        }
    }

    walkDir(BOOKS_DIR);
    return books;
}

// Main
console.log('🎨 Onde - Add About the Creators Page\n');
console.log('=' .repeat(50));

// Verifica che esistano i ritratti
if (!fs.existsSync(PORTRAITS_DIR)) {
    fs.mkdirSync(PORTRAITS_DIR, { recursive: true });
    console.log('⚠️  Created portraits directory. Please add portraits:');
    console.log(`   ${path.join(PORTRAITS_DIR, 'gianni-parola-portrait.jpg')}`);
    console.log(`   ${path.join(PORTRAITS_DIR, 'pina-pennello-portrait.jpg')}`);
    console.log('\nThen run this script again.');
} else {
    const books = findAllBooks();
    console.log(`Found ${books.length} book(s) to process`);

    for (const book of books) {
        processBook(book);
    }

    console.log('\n' + '=' .repeat(50));
    console.log('✅ Done!');
    console.log('\n💡 Next steps:');
    console.log('   1. Generate portraits with Grok (see AUTHOR-PORTRAITS.md)');
    console.log('   2. Save to templates/portraits/');
    console.log('   3. Run this script again to copy portraits to all books');
    console.log('   4. Regenerate PDFs');
}
