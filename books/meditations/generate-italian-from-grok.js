const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// Italian book titles and themes
const books = [
  { num: 1, title: 'Gratitudine', theme: 'Lezioni dai Maestri e dalla Famiglia', marker: 'LIBRO PRIMO' },
  { num: 2, title: 'Accettazione', theme: 'Sul fiume Gran, tra i Quadi', marker: 'LIBRO SECONDO' },
  { num: 3, title: 'Padronanza di Sé', theme: 'A Carnunto', marker: 'LIBRO TERZO' },
  { num: 4, title: 'La Cittadella Interiore', theme: 'Ritirati in Te Stesso', marker: 'LIBRO QUARTO' },
  { num: 5, title: 'Dovere', theme: "All'Alba, Quando Ti Svegli", marker: 'LIBRO QUINTO' },
  { num: 6, title: 'Vivere Secondo Natura', theme: "L'Universo e il Cambiamento", marker: 'LIBRO SESTO' },
  { num: 7, title: 'Resilienza', theme: 'Dolore, Piacere e Morte', marker: 'LIBRO VII' },
  { num: 8, title: 'Il Momento Presente', theme: 'Ricorda Quanto a Lungo', marker: 'LIBRO VIII' },
  { num: 9, title: 'Giustizia', theme: "Ingiustizia e Empietà", marker: 'LIBRO IX' },
  { num: 10, title: 'Una Mente Sana', theme: "L'Aspirazione dell'Anima", marker: 'LIBRO X' },
  { num: 11, title: 'Migliorare lo Spirito', theme: "L'Anima Razionale", marker: 'LIBRO XI' },
  { num: 12, title: 'Accettazione Serena', theme: 'Tutto Ciò che Desideri', marker: 'LIBRO XII' }
];

const bookNames = ['Primo', 'Secondo', 'Terzo', 'Quarto', 'Quinto', 'Sesto', 'Settimo', 'Ottavo', 'Nono', 'Decimo', 'Undicesimo', 'Dodicesimo'];

function parseItalianText(rawText) {
  const bookTexts = {};

  // Split by book markers
  const bookMarkers = [
    'LIBRO PRIMO', 'LIBRO SECONDO', 'LIBRO TERZO', 'LIBRO QUARTO',
    'LIBRO QUINTO', 'LIBRO SESTO', 'LIBRO VII', 'LIBRO VIII',
    'LIBRO IX', 'LIBRO X', 'LIBRO XI', 'LIBRO XII'
  ];

  for (let i = 0; i < bookMarkers.length; i++) {
    const marker = bookMarkers[i];
    const nextMarker = bookMarkers[i + 1];

    let startIdx = rawText.indexOf(marker);
    if (startIdx === -1) {
      console.log(`Warning: ${marker} not found`);
      bookTexts[i + 1] = [];
      continue;
    }

    let endIdx = nextMarker ? rawText.indexOf(nextMarker, startIdx + marker.length) : rawText.length;
    if (endIdx === -1) endIdx = rawText.length;

    let bookContent = rawText.substring(startIdx + marker.length, endIdx).trim();

    // Clean up the content
    bookContent = bookContent
      .replace(/\(delle Meditazioni di Marco Aurelio[^)]*\)/gi, '')
      .replace(/\([Ff]ine del Libro [IVX]+[^)]*\)/gi, '')
      .trim();

    const sections = [];

    // For Book 1, split by "Dal/Da " pattern (lessons from mentors)
    if (i === 0) {
      const parts = bookContent.split(/(?=Dal? (?:mio |)[a-z]*(?:nonno|padre|madre|bisnonno|precettore|fratello|Diogneto|Rustico|Apollonio|Sesto|Alessandro|Frontone|Catulo|Severo|Massimo|Claudio|gli dèi))/i);
      for (const part of parts) {
        let cleanPart = part.trim().replace(/\s+/g, ' ');
        if (cleanPart.length > 30) {
          sections.push(cleanPart);
        }
      }
    } else {
      // For other books: split on sentence boundaries that look like new meditations
      // A new meditation typically starts after a period, with a capital letter
      // and often starts with phrases like "Ricorda", "Non", "Se", "Tutto", "L'", "La", "Il", "Quando", etc.

      // Split on patterns that look like meditation starts
      const parts = bookContent.split(/(?<=[.!?])\s*(?=[A-ZÈÀÒÙÌ][a-zàèéìòù])/);

      let currentSection = '';
      for (const part of parts) {
        const trimmedPart = part.trim();
        if (!trimmedPart) continue;

        // If this looks like a new meditation (starts with common patterns)
        const isNewMeditation = /^(Ricorda|Non |Se |Tutto|L'|La |Il |I |Gli |Le |Quando|Chi |Che |Come |Cosa |Ogni|Nulla|Pensa|Considera|Guarda|Osserva|Cerca|Fa'|Sii |È |Ciò|Questo|Quello|Sempre|Mai |Spesso|Ora |Oggi|Domani|Ieri|Prima|Dopo|Dentro|Fuori|Sopra|Sotto|Presso|Verso|Contro|Tra |Fra |Con |Per |Da |A |In |Su |Anche|Ancora|Quindi|Perché|Poiché|Affinché|Sebbene|Mentre|Finché|Benché|Tuttavia|Però|Eppure|Dunque|Infatti|Inoltre|Infine|Anzitutto|Pertanto|Nondimeno|Ciononostante|Piuttosto|Altrimenti)/.test(trimmedPart);

        if (isNewMeditation && currentSection.length > 100) {
          sections.push(currentSection.trim().replace(/\s+/g, ' '));
          currentSection = trimmedPart;
        } else {
          currentSection += (currentSection ? ' ' : '') + trimmedPart;
        }

        // Force a break if section gets too long (over 800 chars)
        if (currentSection.length > 800) {
          sections.push(currentSection.trim().replace(/\s+/g, ' '));
          currentSection = '';
        }
      }

      if (currentSection.trim().length > 30) {
        sections.push(currentSection.trim().replace(/\s+/g, ' '));
      }
    }

    bookTexts[i + 1] = sections;
    console.log(`Libro ${i + 1}: ${sections.length} sections found`);
  }

  return bookTexts;
}

async function main() {
  console.log('Reading Italian translation from Grok...');

  const rawText = fs.readFileSync(path.join(__dirname, 'italian-translation-clean.txt'), 'utf-8');
  const bookTexts = parseItalianText(rawText);

  const css = `
    @page { size: A4; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Libre Baskerville', Georgia, serif; background: #faf8f3; color: #2c2c2c; line-height: 1.75; font-size: 11pt; }
    .page { width: 210mm; min-height: 297mm; background: #faf8f3; page-break-after: always; position: relative; padding: 20mm 25mm; }

    .cover { padding: 0; }
    .cover-image { width: 100%; height: 100%; object-fit: cover; }

    .title-page { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
    .title-page h1 { font-family: 'Cinzel', serif; font-size: 36pt; color: #2c1810; letter-spacing: 4px; margin-bottom: 10mm; }
    .title-page .subtitle { font-size: 14pt; font-style: italic; color: #5a4a3a; margin-bottom: 15mm; }
    .title-page .author { font-family: 'Cinzel', serif; font-size: 18pt; color: #3d2d1d; letter-spacing: 3px; margin-bottom: 5mm; }
    .title-page .dates { font-size: 11pt; color: #8b7355; margin-bottom: 30mm; }
    .title-page .edition { font-size: 11pt; color: #5a4a3a; margin-top: 20mm; }
    .title-page .publisher-info { margin-top: auto; font-family: 'Cinzel', serif; font-size: 11pt; color: #8b7355; letter-spacing: 2px; }
    .ornament { font-size: 24pt; color: #d4af37; margin: 10mm 0; }

    .book-opener { display: flex; flex-direction: column; align-items: center; padding-top: 15mm; }
    .book-opener img { width: 100%; max-height: 150mm; object-fit: contain; margin-bottom: 12mm; border-radius: 2mm; }
    .book-number { font-family: 'Cinzel', serif; font-size: 12pt; color: #8b7355; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 3mm; }
    .book-title { font-family: 'Cinzel', serif; font-size: 24pt; color: #2c1810; letter-spacing: 2px; margin-bottom: 3mm; text-align: center; }
    .book-theme { font-style: italic; font-size: 12pt; color: #8b7355; text-align: center; }

    .content { text-align: justify; }
    .content p { margin-bottom: 4mm; text-indent: 6mm; }
    .content p:first-child { text-indent: 0; }

    .page-num { position: absolute; bottom: 12mm; left: 0; right: 0; text-align: center; font-family: 'Cinzel', serif; font-size: 10pt; color: #8b7355; }

    .end-page { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
    .finis { font-family: 'Cinzel', serif; font-size: 18pt; color: #2c1810; letter-spacing: 4px; margin-bottom: 20mm; }
    .credits { font-size: 10pt; color: #8b7355; line-height: 2.2; }
    .credits strong { color: #5a4a3a; }
  `;

  let html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <title>Meditazioni - Marco Aurelio - Edizione Italiana</title>
  <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Cinzel:wght@400;600;700&display=swap" rel="stylesheet">
  <style>${css}</style>
</head>
<body>

<div class="page cover">
  <img src="images/cover.jpg" alt="Copertina Meditazioni" class="cover-image">
</div>

<div class="page title-page">
  <div class="ornament">✦</div>
  <h1>MEDITAZIONI</h1>
  <div class="subtitle">Colloqui con Sé Stesso</div>
  <div class="author">MARCO AURELIO ANTONINO</div>
  <div class="dates">Imperatore di Roma, 161–180 d.C.</div>
  <div class="ornament">✦ ✦ ✦</div>
  <div class="edition">Edizione Integrale Illustrata<br>Traduzione Italiana Moderna</div>
  <div class="publisher-info">ONDE CLASSICS<br>Los Angeles, 2026</div>
</div>

<div class="page title-page">
  <div class="ornament">✦</div>
  <p style="font-style: italic; font-size: 14pt; color: #5a4a3a; max-width: 120mm; line-height: 2;">
    A tutti coloro che cercano la saggezza<br>nei momenti di difficoltà,<br>e la pace<br>nel mezzo del caos.
  </p>
  <div class="ornament">✦</div>
</div>

`;

  let pageNum = 1;
  const CHARS_PER_PAGE = 2600;

  for (let b = 0; b < 12; b++) {
    const book = books[b];
    const sections = bookTexts[book.num] || [];

    html += `
<div class="page book-opener">
  <img src="images/book${book.num}.jpg" alt="Illustrazione Libro ${book.num}">
  <div class="book-number">Libro ${bookNames[b]}</div>
  <div class="book-title">${book.title}</div>
  <div class="book-theme">${book.theme}</div>
  <div class="page-num">${pageNum++}</div>
</div>
`;

    let currentContent = '';
    for (const section of sections) {
      const escaped = section
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      const sectionHTML = `<p>${escaped}</p>\n`;

      if ((currentContent + sectionHTML).length > CHARS_PER_PAGE && currentContent.length > 0) {
        html += `
<div class="page">
  <div class="content">${currentContent}</div>
  <div class="page-num">${pageNum++}</div>
</div>
`;
        currentContent = sectionHTML;
      } else {
        currentContent += sectionHTML;
      }
    }

    if (currentContent.length > 0) {
      html += `
<div class="page">
  <div class="content">${currentContent}</div>
  <div class="page-num">${pageNum++}</div>
</div>
`;
    }
  }

  html += `
<div class="page end-page">
  <div class="ornament">✦</div>
  <div class="finis">FINE</div>
  <div class="ornament">✦ ✦ ✦</div>
  <div class="credits">
    <strong>Meditazioni</strong><br>
    Marco Aurelio Antonino<br><br>
    Traduzione Italiana Moderna<br>
    con Grok AI<br><br>
    <strong>Illustrazioni</strong><br>
    Generate con Grok AI<br>
    Direzione Artistica di Pina Pennello<br><br>
    <strong>Pubblicato da</strong><br>
    Onde Classics<br>
    Los Angeles, 2026<br><br>
    <em>onde.la</em>
  </div>
</div>

</body>
</html>`;

  const htmlPath = path.join(__dirname, 'meditazioni-italiano.html');
  fs.writeFileSync(htmlPath, html);
  console.log(`HTML saved: ${htmlPath}`);

  console.log('Generating PDF...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

  const pdfPath = path.join(__dirname, 'Meditazioni-Marco-Aurelio-Italiano.pdf');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  await browser.close();
  console.log(`PDF saved: ${pdfPath}`);
}

main().catch(console.error);
