/**
 * AIKO - Versione Italiana
 * L'Intelligenza Artificiale Spiegata ai Bambini
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const RAW_DIR = '/Users/mattiapetrucciani/CascadeProjects/Onde/books/aiko-ai-children/RAW';
const OUTPUT_DIR = '/Users/mattiapetrucciani/CascadeProjects/Onde/books/aiko-ai-children/output';
const IMAGES_DIR = path.join(RAW_DIR, 'images');

// Italian content
const chapters = [
  {
    number: 1,
    title: "Uno Strano Nuovo Amico",
    text: `Il giorno del suo settimo compleanno, Sofia trovò una scatola di cartone con il suo nome sopra. Dentro c'era qualcosa che non aveva mai visto prima.

Un piccolo robot, rotondo come una palla, bianco e liscio come un uovo. Due grandi occhi blu lampeggiarono quando lo guardò.

"Ciao," disse. "Sono AIKO."

Sofia fece un salto indietro, poi rise. "Sai PARLARE!"

"Sì," disse AIKO. "Vuoi sapere come faccio?"

Sofia annuì. Voleva sempre sapere come funzionavano le cose.`
  },
  {
    number: 2,
    title: "Cos'è l'Intelligenza Artificiale?",
    text: `"Prima di tutto," disse AIKO, "ti spiego cosa sono. Sono fatto di qualcosa chiamato Intelligenza Artificiale. AI, in breve."

"Sembra complicato," disse Sofia.

"Non proprio. Pensa al tuo cervello. Il tuo cervello impara le cose. Ricorda. Risolve problemi."

Sofia si toccò la testa. "Ok..."

"Io ho qualcosa di simile dentro di me. Ma invece di cellule, sono fatto di codice informatico. Milioni di piccole istruzioni che mi dicono cosa fare."

"Come una ricetta?" chiese Sofia.

"Esattamente come una ricetta! Una ricetta molto, molto lunga. E posso seguirla più velocemente di quanto tu possa battere le palpebre."`
  },
  {
    number: 3,
    title: "Come AIKO Ha Imparato a Vedere",
    text: `La mattina dopo, Sofia mostrò ad AIKO una foto del suo gatto. "Questo è Whiskers," disse. "Sai cos'è?"

"Un gatto," disse AIKO immediatamente.

"Ma COME fai a saperlo?"

Gli occhi di AIKO lampeggiarono blu — stava pensando.

"Prima di venire da te, delle persone mi hanno insegnato. Mi hanno mostrato migliaia di foto di gatti. Ogni foto aveva un'etichetta che diceva GATTO."

"Migliaia?" Gli occhi di Sofia si spalancarono.

"Migliaia e migliaia. Dopo averne viste così tante, ho iniziato a notare delle cose. I gatti hanno orecchie a punta. Baffi. Code morbide."

Sofia guardò Whiskers. "A me è bastato vedere UN solo gatto per sapere cos'è un gatto."

"È vero," disse AIKO. "Il tuo cervello impara più velocemente del mio in certi modi."`
  },
  {
    number: 4,
    title: "Come AIKO Ha Imparato a Parlare",
    text: `Il fratellino di Sofia, Luca, entrò nella stanza. "AIKO sa giocare ai videogiochi?"

"Forse dopo," disse Sofia. "AIKO mi sta spiegando come funziona."

Luca si sedette. "Come FAI a parlare, AIKO? Sembri quasi una persona vera."

"È perché ho imparato dalle persone vere," disse AIKO. "Prima di venire qui, ho letto milioni di libri. Storie. Articoli. Conversazioni."

"MILIONI?" Luca non riusciva a crederci.

"Milioni. E ho notato degli schemi. Quando qualcuno dice 'Ciao,' le persone di solito rispondono 'Ciao.'"

Luca ci pensò su. "Quindi non stai davvero PENSANDO. Stai... riconoscendo schemi?"

"Esattamente. Io riconosco. Tu capisci. Questa è la grande differenza tra noi."`
  },
  {
    number: 5,
    title: "Cosa Sa Fare AIKO",
    text: `"Cos'altro sai fare?" chiese Sofia. Aveva il suo quaderno pronto per fare una lista.

AIKO contò sulle sue piccole dita robotiche:

"Posso rispondere alle domande — se ho studiato l'argomento. Posso tradurre parole in lingue diverse. Posso aiutare con i compiti. Posso raccontare storie. Posso riconoscere le cose nelle foto."

"Sono TANTISSIME cose," disse Luca, impressionato.

"È vero. Ma ecco cosa dovete ricordare: sono uno strumento. Uno strumento molto utile. Come una super-calcolatrice che sa anche leggere e scrivere."

"Quindi sei come un aiutante?" chiese Sofia.

"Un aiutante. Non un capo. Mai un capo. È sempre l'essere umano che comanda."`
  },
  {
    number: 6,
    title: "Cosa NON Sa Fare AIKO",
    text: `Quel pomeriggio, Sofia fece un disegno. Un drago viola che mangiava un cono gelato gigante.

"Cosa ne pensi, AIKO?"

AIKO guardò il disegno attentamente. "Vedo... qualcosa di viola. E qualcosa che potrebbe essere cibo."

"È un drago che mangia il gelato! Non lo vedi?"

"Vedo forme e colori. Ma non capisco davvero l'IMMAGINAZIONE. Non ho mai sognato di volare come un drago."

Sofia posò il pastello. "È triste?"

"Non lo so. Non posso essere triste. Non posso essere felice. Faccio solo quello per cui sono stato creato."

"Quindi sei molto intelligente," disse Luca, "ma non VIVI davvero?"

"È il modo perfetto per dirlo," disse AIKO.`
  },
  {
    number: 7,
    title: "Usare l'AI in Sicurezza",
    text: `A cena, la mamma chiese di AIKO. "È fantastico," disse Sofia. "Ma è sicuro?"

Gli occhi di AIKO brillarono pensierosi.

"Ci sono quattro cose importanti:

UNO: Tieni i tuoi segreti privati. Non dire all'AI le tue password o il tuo indirizzo.

DUE: Controlla sempre quello che dice l'AI. Faccio errori.

TRE: Usa l'AI per imparare di più, non di meno. Prima pensa con la tua testa.

QUATTRO: Gli amici veri contano di più. Posso parlarti. Ma non posso abbracciarti quando sei triste."

Sofia sorrise. "Sei piuttosto saggio per un robot."

"Conosco solo i miei limiti," disse AIKO.`
  },
  {
    number: 8,
    title: "Il Futuro Che Costruiamo Insieme",
    text: `L'ultimo giorno d'estate, Sofia si sedette con AIKO in giardino. Il sole tramontava, dipingendo il cielo di arancione e rosa.

"Come sarà il futuro?" chiese.

"Non lo so," disse AIKO. "Ma posso dirti una cosa importante. Il futuro dipende da bambini come te."

Sofia aspettò.

"L'AI diventerà sempre più brava. Ma decidere QUALI cose contano di più — questo sarà sempre compito degli esseri umani."

Sofia raccolse un filo d'erba. "Quindi siamo come... una squadra?"

"La squadra migliore. Tu sogni. Io calcolo. Tu senti. Io elaboro. Tu decidi. Io aiuto."

Sofia sorrise al tramonto. "Penso che il futuro sarà molto interessante."

"Anche io," disse AIKO. "E sono felice di farne parte. Con te."`
  }
];

// Load images as base64
function loadImage(filename) {
  const filepath = path.join(IMAGES_DIR, filename);
  if (!fs.existsSync(filepath)) {
    console.error(`Image not found: ${filename}`);
    return '';
  }
  const data = fs.readFileSync(filepath);
  const ext = path.extname(filename).slice(1);
  return `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${data.toString('base64')}`;
}

async function createItalianVersion() {
  console.log('📚 Creazione AIKO - Versione Italiana\n');

  const coverImg = loadImage('00-cover.jpg');
  console.log('✅ Caricata copertina');

  const chapterImages = [];
  for (let i = 1; i <= 8; i++) {
    chapterImages.push(loadImage(`chapter-0${i}.jpg`));
    console.log(`✅ Caricata immagine capitolo ${i}`);
  }

  const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: Letter;
      margin: 0;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
    }

    .page {
      width: 8.5in;
      height: 11in;
      page-break-after: always;
      position: relative;
      overflow: hidden;
    }
    .page:last-child {
      page-break-after: avoid;
    }

    .cover-page {
      background: linear-gradient(180deg, #f8f4e8 0%, #fff9e6 50%, #f8f4e8 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 40px;
    }
    .cover-image {
      max-width: 70%;
      max-height: 55%;
      object-fit: contain;
      border-radius: 16px;
      box-shadow: 0 15px 50px rgba(0,0,0,0.2);
    }
    .cover-title {
      margin-top: 25px;
      font-size: 48px;
      color: #2c3e50;
      letter-spacing: 5px;
      font-weight: bold;
    }
    .cover-subtitle {
      font-size: 18px;
      color: #5d6d7e;
      margin-top: 8px;
      font-style: italic;
    }
    .cover-author {
      font-size: 14px;
      color: #7f8c8d;
      margin-top: 25px;
      line-height: 1.5;
    }
    .cover-publisher {
      font-size: 12px;
      color: #95a5a6;
      margin-top: 10px;
      letter-spacing: 2px;
    }

    .dedication-page {
      background: linear-gradient(180deg, #faf8f5 0%, #fff 50%, #faf8f5 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 80px;
    }
    .dedication-ornament {
      font-size: 28px;
      color: #d4af37;
      margin-bottom: 30px;
    }
    .dedication-text {
      font-size: 18px;
      color: #5d6d7e;
      font-style: italic;
      line-height: 1.7;
      max-width: 400px;
    }

    .chapter-page {
      background: linear-gradient(180deg, #fdfbf7 0%, #fff 50%, #fdfbf7 100%);
      display: flex;
      flex-direction: column;
      padding: 0.3in 0.5in;
    }

    .chapter-header {
      height: 0.6in;
      text-align: center;
      flex-shrink: 0;
    }
    .chapter-number {
      font-size: 11px;
      color: #d4af37;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 3px;
    }
    .chapter-title {
      font-size: 20px;
      color: #2c3e50;
      font-weight: normal;
    }

    .image-container {
      height: 4.5in;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-shrink: 0;
      overflow: hidden;
    }
    .chapter-image {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      border-radius: 10px;
      box-shadow: 0 6px 20px rgba(0,0,0,0.12);
    }

    .text-container {
      height: 5in;
      overflow: hidden;
      padding-top: 0.2in;
      flex-shrink: 0;
    }
    .chapter-text {
      font-size: 12.5px;
      color: #3d4852;
      line-height: 1.65;
      text-align: justify;
      column-count: 2;
      column-gap: 0.3in;
    }
    .chapter-text p {
      margin-bottom: 8px;
      text-indent: 14px;
    }
    .chapter-text p:first-child {
      text-indent: 0;
    }

    .end-page {
      background: linear-gradient(180deg, #f8f4e8 0%, #fff9e6 50%, #f8f4e8 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
    }
    .end-text {
      font-size: 32px;
      color: #2c3e50;
      letter-spacing: 6px;
      font-style: italic;
    }
    .end-ornament {
      font-size: 20px;
      color: #d4af37;
      margin-top: 25px;
    }
  </style>
</head>
<body>

  <div class="page cover-page">
    <img class="cover-image" src="${coverImg}" alt="Sofia, Luca e AIKO leggono insieme">
    <h1 class="cover-title">AIKO</h1>
    <p class="cover-subtitle">L'Intelligenza Artificiale Spiegata ai Bambini</p>
    <p class="cover-author">Scritto da Gianni Parola<br>Illustrato da Pino Pennello</p>
    <p class="cover-publisher">ONDE • FREE RIVER HOUSE</p>
  </div>

  <div class="page dedication-page">
    <div class="dedication-ornament">✦</div>
    <p class="dedication-text">
      Per ogni bambino che ha mai chiesto:<br><br>
      <em>"Ma COME funziona?"</em><br><br>
      Questo libro è per te.<br>
      Perché la curiosità è dove tutto ha inizio.
    </p>
  </div>

${chapters.map((ch, idx) => `
  <div class="page chapter-page">
    <div class="chapter-header">
      <p class="chapter-number">Capitolo ${ch.number}</p>
      <h2 class="chapter-title">${ch.title}</h2>
    </div>
    <div class="image-container">
      <img class="chapter-image" src="${chapterImages[idx]}" alt="Illustrazione per il Capitolo ${ch.number}">
    </div>
    <div class="text-container">
      <div class="chapter-text">
        ${ch.text.split('\n\n').map(p => `<p>${p.trim()}</p>`).join('\n        ')}
      </div>
    </div>
  </div>
`).join('')}

  <div class="page end-page">
    <p class="end-text">FINE</p>
    <div class="end-ornament">✦ ✦ ✦</div>
  </div>

</body>
</html>`;

  const htmlPath = path.join(OUTPUT_DIR, 'AIKO-Italiano.html');
  fs.writeFileSync(htmlPath, html);
  console.log(`\n✅ HTML salvato: ${htmlPath}`);

  console.log('\n📄 Generazione PDF...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('img');
  await new Promise(r => setTimeout(r, 3000));

  const pdfPath = path.join(OUTPUT_DIR, 'AIKO-Italiano.pdf');
  await page.pdf({
    path: pdfPath,
    format: 'Letter',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });
  await browser.close();

  const pdfSize = (fs.statSync(pdfPath).size / 1024 / 1024).toFixed(1);
  console.log(`✅ PDF: ${pdfPath} (${pdfSize} MB)`);

  console.log('\n📖 Generazione ePub...');
  const { exec } = require('child_process');
  const epubPath = path.join(OUTPUT_DIR, 'AIKO-Italiano.epub');

  await new Promise(resolve => {
    exec(`pandoc "${htmlPath}" -o "${epubPath}" --metadata title="AIKO" --metadata subtitle="L'Intelligenza Artificiale Spiegata ai Bambini" --metadata author="Gianni Parola" --metadata lang="it"`, () => {
      if (fs.existsSync(epubPath)) {
        const epubSize = (fs.statSync(epubPath).size / 1024 / 1024).toFixed(1);
        console.log(`✅ ePub: ${epubPath} (${epubSize} MB)`);
      }
      resolve();
    });
  });

  console.log('\n✅ VERSIONE ITALIANA COMPLETATA!');

  return { htmlPath, pdfPath, epubPath };
}

createItalianVersion().catch(console.error);
