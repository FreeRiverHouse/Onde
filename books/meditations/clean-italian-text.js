const fs = require('fs');
const path = require('path');

// Read the raw Grok output
const rawText = fs.readFileSync(path.join(__dirname, 'italian-translation-grok.txt'), 'utf-8');

// Clean up the text
let cleanText = rawText
  // Fix corrupted book markers
  .replace(/LIBRO PRIMOD/g, '\n\nLIBRO PRIMO\n\n')
  .replace(/LIBRO SECONDO/g, '\n\nLIBRO SECONDO\n\n')
  .replace(/LIBRO TERZO/g, '\n\nLIBRO TERZO\n\n')
  .replace(/LIBRO QUARTOC/g, '\n\nLIBRO QUARTO\n\n')
  .replace(/LIBRO QUARTOD/g, '\n\nLIBRO QUARTO\n\n')
  .replace(/LIBRO QUINTOA/g, '\n\nLIBRO QUINTO\n\n')
  .replace(/LIBRO SESTOL/g, '\n\nLIBRO SESTO\n\n')
  .replace(/LIBRO VIIC/g, '\n\nLIBRO VII\n\n')
  .replace(/LIBRO VIIIN/g, '\n\nLIBRO VIII\n\n')
  .replace(/LIBRO IXC/g, '\n\nLIBRO IX\n\n')
  .replace(/LIBRO XA/g, '\n\nLIBRO X\n\n')
  .replace(/LIBRO XIL/g, '\n\nLIBRO XI\n\n')
  .replace(/LIBRO XIIT/g, '\n\nLIBRO XII\n\n')
  // Remove Grok UI artifacts
  .replace(/AutoSee new posts/gi, '')
  .replace(/Searching the web\d* results?/gi, '')
  .replace(/Browsing web page\d* results?/gi, '')
  .replace(/Quick Answer/gi, '')
  .replace(/Think Harder/gi, '')
  .replace(/Send a message/gi, '')
  // Remove prompt leakage
  .replace(/Traduci in italiano moderno e scorrevole i 12 libri delle Meditazioni di Marco Aurelio.*?Long\)\./gs, '')
  .replace(/Fornisci la traduzione completa, non riassunti\./gi, '')
  .replace(/Se vuoi, posso continuare subito con il Libro [IVX]+.*/gi, '')
  .replace(/Ecco il testo del Libro \d+:/gi, '')
  .replace(/Inizia dal LIBRO \d+\./gi, '')
  // Remove meta-notes
  .replace(/\(delle Meditazioni di Marco Aurelio[^)]*\)/gi, '')
  .replace(/\([Ff]ine del Libro [IVX]+[^)]*\)/gi, '')
  // Remove Telegram/technical debris
  .replace(/tabId \d+:[^\n]*/gi, '')
  .replace(/api\.telegram\.org[^\n]*/gi, '')
  .replace(/https?:\/\/[^\s]+/gi, '')
  // Fix typos identified by Grok review
  .replace(/ti abbia porta\b/g, 'ti abbia portato')
  // Clean up extra whitespace
  .replace(/\n{3,}/g, '\n\n')
  .replace(/^\s+|\s+$/g, '')
  .trim();

// Write the cleaned text
fs.writeFileSync(path.join(__dirname, 'italian-translation-clean.txt'), cleanText);
console.log('Cleaned Italian text saved!');

// Verify book markers
const markers = ['LIBRO PRIMO', 'LIBRO SECONDO', 'LIBRO TERZO', 'LIBRO QUARTO',
                 'LIBRO QUINTO', 'LIBRO SESTO', 'LIBRO VII', 'LIBRO VIII',
                 'LIBRO IX', 'LIBRO X', 'LIBRO XI', 'LIBRO XII'];
console.log('\nBook markers found:');
markers.forEach(m => {
  const found = cleanText.includes(m);
  console.log(`  ${m}: ${found ? '✓' : '✗'}`);
});
