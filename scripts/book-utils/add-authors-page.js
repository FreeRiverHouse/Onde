/**
 * add-authors-page.js
 *
 * Utility script per generare HTML delle pagine "About the Creators" e "About Onde"
 * Da includere nei PDF dei libri Onde.
 *
 * Usage:
 *   node add-authors-page.js
 *
 * Output: Stampa HTML pronto per essere incluso nei script create-pdf.js
 */

const fs = require('fs');
const path = require('path');

const ONDE_ROOT = '/Users/mattia/Projects/Onde';

// Paths degli asset
const ASSETS = {
  gianniPortrait: path.join(ONDE_ROOT, 'content/authors/gianni-parola-portrait.jpg'),
  pinaPortrait: path.join(ONDE_ROOT, 'content/authors/pina-pennello-portrait.jpg'),
  ondeLogo: path.join(ONDE_ROOT, 'assets/branding/onde-logo-color.png'),
};

// Testi bio
const BIOS = {
  gianni: {
    name: 'Gianni Parola',
    role: 'Writer',
    bio: 'Gianni Parola writes stories that help children understand the world around them. He believes every child deserves books that spark curiosity and wonder.'
  },
  pina: {
    name: 'Pina Pennello',
    role: 'Illustrator',
    bio: 'Pina Pennello brings stories to life with her warm watercolor illustrations. Her art is inspired by the gentle beauty of Italian countryside and the magic in everyday moments.'
  }
};

const ONDE_INFO = {
  name: 'ONDE PUBLISHING',
  tagline: 'Stories that connect hearts.',
  description: 'Onde is a children\'s book publisher dedicated to creating beautiful, meaningful stories. We believe in the power of words and art to inspire the next generation.',
  website: 'www.ondebooks.com',
  social: '@Onde_FRH'
};

// CSS per le pagine
const CSS = `
/* About the Creators */
.about-creators {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 25mm;
  min-height: 297mm;
  box-sizing: border-box;
  page-break-after: always;
}

.about-creators h2 {
  font-size: 24pt;
  color: #2c3e50;
  margin-bottom: 15mm;
  text-align: center;
}

.creator {
  display: flex;
  align-items: center;
  margin: 8mm 0;
  max-width: 150mm;
}

.creator-portrait {
  width: 35mm;
  height: 35mm;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 8mm;
  border: 2px solid #f39c12;
}

.creator-info h3 {
  font-size: 16pt;
  color: #2980b9;
  margin: 0 0 2mm 0;
}

.creator-info .role {
  font-size: 10pt;
  color: #7f8c8d;
  font-style: italic;
  margin: 0 0 3mm 0;
}

.creator-info .bio {
  font-size: 11pt;
  line-height: 1.5;
  color: #2c3e50;
  margin: 0;
}

/* About Onde */
.about-onde {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 30mm;
  min-height: 297mm;
  box-sizing: border-box;
}

.onde-logo {
  width: 50mm;
  height: auto;
  margin-bottom: 10mm;
}

.about-onde h2 {
  font-size: 22pt;
  color: #2980b9;
  margin: 0 0 3mm 0;
  letter-spacing: 2px;
}

.about-onde .tagline {
  font-size: 14pt;
  color: #f39c12;
  font-style: italic;
  margin: 0 0 10mm 0;
}

.about-onde .description {
  font-size: 12pt;
  line-height: 1.6;
  color: #2c3e50;
  max-width: 120mm;
  margin: 0 0 10mm 0;
}

.about-onde .social {
  font-size: 10pt;
  color: #7f8c8d;
}

.about-onde .social p {
  margin: 2mm 0;
}
`;

function loadImageAsBase64(filepath) {
  try {
    const data = fs.readFileSync(filepath);
    const ext = path.extname(filepath).toLowerCase();
    const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
    return `data:${mime};base64,${data.toString('base64')}`;
  } catch (err) {
    console.warn(`Warning: Could not load ${filepath}`);
    return '';
  }
}

function generateCreatorsPageHTML() {
  const gianniImg = loadImageAsBase64(ASSETS.gianniPortrait);
  const pinaImg = loadImageAsBase64(ASSETS.pinaPortrait);

  return `
  <div class="page about-creators">
    <h2>About the Creators</h2>

    <div class="creator">
      ${gianniImg ? `<img class="creator-portrait" src="${gianniImg}" alt="${BIOS.gianni.name}">` : ''}
      <div class="creator-info">
        <h3>${BIOS.gianni.name}</h3>
        <p class="role">${BIOS.gianni.role}</p>
        <p class="bio">${BIOS.gianni.bio}</p>
      </div>
    </div>

    <div class="creator">
      ${pinaImg ? `<img class="creator-portrait" src="${pinaImg}" alt="${BIOS.pina.name}">` : ''}
      <div class="creator-info">
        <h3>${BIOS.pina.name}</h3>
        <p class="role">${BIOS.pina.role}</p>
        <p class="bio">${BIOS.pina.bio}</p>
      </div>
    </div>
  </div>`;
}

function generateOndePageHTML() {
  const logoImg = loadImageAsBase64(ASSETS.ondeLogo);

  return `
  <div class="page about-onde">
    ${logoImg ? `<img class="onde-logo" src="${logoImg}" alt="Onde Publishing">` : '<div style="height:50mm"></div>'}

    <h2>${ONDE_INFO.name}</h2>
    <p class="tagline">${ONDE_INFO.tagline}</p>

    <p class="description">${ONDE_INFO.description}</p>

    <div class="social">
      <p>${ONDE_INFO.website}</p>
      <p>${ONDE_INFO.social}</p>
    </div>
  </div>`;
}

function main() {
  console.log('='.repeat(60));
  console.log('ONDE BOOK BRANDING - HTML Templates');
  console.log('='.repeat(60));
  console.log('\n');

  console.log('--- CSS (add to <style> section) ---\n');
  console.log(CSS);
  console.log('\n');

  console.log('--- About the Creators HTML ---\n');
  console.log(generateCreatorsPageHTML());
  console.log('\n');

  console.log('--- About Onde HTML ---\n');
  console.log(generateOndePageHTML());
  console.log('\n');

  console.log('='.repeat(60));
  console.log('STATUS ASSETS:');
  console.log('='.repeat(60));

  for (const [name, filepath] of Object.entries(ASSETS)) {
    const exists = fs.existsSync(filepath);
    const status = exists ? '✅ FOUND' : '❌ MISSING';
    console.log(`${status} - ${name}: ${filepath}`);
  }
}

// Export per uso come modulo
module.exports = {
  CSS,
  BIOS,
  ONDE_INFO,
  generateCreatorsPageHTML,
  generateOndePageHTML,
  loadImageAsBase64
};

// Esegui se chiamato direttamente
if (require.main === module) {
  main();
}
