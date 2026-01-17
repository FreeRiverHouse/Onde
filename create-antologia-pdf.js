const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function createPDF() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Convert images to base64
  const stellaImg = fs.readFileSync('/Users/mattiapetrucciani/Downloads/stella-stellina.jpg').toString('base64');
  const pioggiaImg = fs.readFileSync('/Users/mattiapetrucciani/Downloads/pioggerellina.jpg').toString('base64');
  const befanaImg = fs.readFileSync('/Users/mattiapetrucciani/Downloads/la-befana.jpg').toString('base64');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Playfair+Display:wght@700&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Crimson Text', Georgia, serif;
      background: #faf8f5;
      color: #2c2c2c;
    }

    .page {
      page-break-after: always;
      min-height: 100vh;
      padding: 40px;
      display: flex;
      flex-direction: column;
    }

    .page:last-child {
      page-break-after: avoid;
    }

    /* Cover Page */
    .cover {
      text-align: center;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #f5f0e8 0%, #e8e0d5 100%);
    }

    .cover h1 {
      font-family: 'Playfair Display', serif;
      font-size: 42px;
      color: #3d3d3d;
      margin-bottom: 20px;
      letter-spacing: 2px;
    }

    .cover .subtitle {
      font-size: 22px;
      font-style: italic;
      color: #666;
      margin-bottom: 40px;
    }

    .cover .publisher {
      font-size: 16px;
      color: #888;
      margin-top: 60px;
      letter-spacing: 3px;
      text-transform: uppercase;
    }

    .cover .styles-preview {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin: 40px 0;
    }

    .cover .style-box {
      width: 180px;
      text-align: center;
    }

    .cover .style-box img {
      width: 160px;
      height: 160px;
      object-fit: cover;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.15);
    }

    .cover .style-box p {
      margin-top: 10px;
      font-size: 14px;
      color: #666;
    }

    /* Intro Page */
    .intro {
      justify-content: center;
      padding: 60px;
    }

    .intro h2 {
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      margin-bottom: 30px;
      color: #3d3d3d;
    }

    .intro p {
      font-size: 18px;
      line-height: 1.8;
      margin-bottom: 20px;
      text-align: justify;
    }

    .intro .styles-list {
      margin: 30px 0;
      padding-left: 30px;
    }

    .intro .styles-list li {
      font-size: 16px;
      margin-bottom: 15px;
      line-height: 1.6;
    }

    .intro .styles-list strong {
      color: #4a6741;
    }

    /* Poem Pages */
    .poem-page {
      padding: 30px 50px;
    }

    .poem-header {
      text-align: center;
      margin-bottom: 20px;
    }

    .poem-header .style-label {
      display: inline-block;
      background: #4a6741;
      color: white;
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 15px;
    }

    .poem-header h2 {
      font-family: 'Playfair Display', serif;
      font-size: 32px;
      color: #3d3d3d;
      margin-bottom: 5px;
    }

    .poem-header .author {
      font-style: italic;
      color: #666;
      font-size: 16px;
    }

    .poem-content {
      display: flex;
      gap: 40px;
      align-items: flex-start;
      margin-top: 20px;
    }

    .poem-image {
      flex: 0 0 45%;
    }

    .poem-image img {
      width: 100%;
      border-radius: 10px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.15);
    }

    .poem-text {
      flex: 1;
    }

    .poem-text pre {
      font-family: 'Crimson Text', Georgia, serif;
      font-size: 16px;
      line-height: 1.8;
      white-space: pre-wrap;
      color: #2c2c2c;
    }

    /* Footer */
    .footer {
      margin-top: auto;
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      font-size: 12px;
      color: #999;
    }
  </style>
</head>
<body>

  <!-- Cover Page -->
  <div class="page cover">
    <h1>Antologia Poesia Italiana<br>per Bambini</h1>
    <p class="subtitle">Tre stili illustrativi a confronto</p>

    <div class="styles-preview">
      <div class="style-box">
        <img src="data:image/jpeg;base64,${stellaImg}" alt="Stile A">
        <p>A. Acquarello Classico</p>
      </div>
      <div class="style-box">
        <img src="data:image/jpeg;base64,${pioggiaImg}" alt="Stile B">
        <p>B. Scarry-Seuss</p>
      </div>
      <div class="style-box">
        <img src="data:image/jpeg;base64,${befanaImg}" alt="Stile C">
        <p>C. Vintage '50</p>
      </div>
    </div>

    <p class="publisher">Onde</p>
  </div>

  <!-- Intro Page -->
  <div class="page intro">
    <h2>Scegli il tuo stile preferito</h2>
    <p>
      Questa antologia raccoglie tre classici della poesia italiana per bambini,
      ciascuno illustrato con uno stile diverso. L'obiettivo e trovare lo stile
      visivo che meglio rappresenti la collana Poetry di Onde.
    </p>
    <p>
      Le tre opzioni stilistiche sono:
    </p>
    <ul class="styles-list">
      <li><strong>Stile A - Acquarello Onde Classico:</strong> Morbido, sognante, con luce calda e atmosfera intima. Ideale per ninne nanne e poesie della sera.</li>
      <li><strong>Stile B - Vivace Scarry-Seuss:</strong> Colorato, giocoso, con personaggi espressivi. Perfetto per filastrocche allegre e poesie sulla natura.</li>
      <li><strong>Stile C - Vintage Italiano Anni '50:</strong> Nostalgico, elegante, con un tocco di Italia classica. Adatto per poesie tradizionali e festive.</li>
    </ul>
    <p>
      Sfoglia le pagine seguenti e indica quale stile preferisci per l'antologia completa.
    </p>
  </div>

  <!-- Poem 1: Stella Stellina -->
  <div class="page poem-page">
    <div class="poem-header">
      <span class="style-label">Stile A - Acquarello Classico</span>
      <h2>Stella Stellina</h2>
      <p class="author">Lina Schwarz (1876-1947)</p>
    </div>
    <div class="poem-content">
      <div class="poem-image">
        <img src="data:image/jpeg;base64,${stellaImg}" alt="Stella Stellina">
      </div>
      <div class="poem-text">
        <pre>Stella stellina
la notte s'avvicina:
la fiamma traballa,
la mucca e nella stalla.

La mucca e il vitello,
la pecora e l'agnello,
la chioccia e il pulcino,
la mamma e il suo bambino.

Ognuno ha il suo piccino,
ognuno ha la sua mamma
e tutti fan la nanna.</pre>
      </div>
    </div>
    <div class="footer">Onde - Collana Poetry</div>
  </div>

  <!-- Poem 2: Pioggerellina -->
  <div class="page poem-page">
    <div class="poem-header">
      <span class="style-label">Stile B - Scarry-Seuss</span>
      <h2>Che dice la pioggerellina di marzo</h2>
      <p class="author">Angiolo Silvio Novaro (1866-1938)</p>
    </div>
    <div class="poem-content">
      <div class="poem-image">
        <img src="data:image/jpeg;base64,${pioggiaImg}" alt="Pioggerellina">
      </div>
      <div class="poem-text">
        <pre>Che dice la pioggerellina
di marzo, che picchia argentina
sui tegoli vecchi
del tetto, sui bruscoli secchi
dell'orto, sul fico e sul moro
ornati di gemmule d'oro?

Passata e l'uggiosa invernata,
passata, passata!
Di fuor dalla nuvola nera
di fuor dalla nuvola bigia
che in cielo si pigia,
domani uscira Primavera
con pieno il grembiale
di tiepido sole,
di fresche viole,
di primule rosse, di battiti d'ale,
di nidi, di gridi
di rondini, ed anche
di stelle di mandorlo, bianche...

Cio dice la pioggerellina
sui tegoli vecchi del tetto,
sui bruscoli secchi dell'orto,
sul fico e sul moro
ornati di gemmule d'oro.

Cio canta, cio dice;
e il cuor che l'ascolta e felice.</pre>
      </div>
    </div>
    <div class="footer">Onde - Collana Poetry</div>
  </div>

  <!-- Poem 3: La Befana -->
  <div class="page poem-page">
    <div class="poem-header">
      <span class="style-label">Stile C - Vintage '50</span>
      <h2>La Befana</h2>
      <p class="author">Guido Gozzano (1883-1916)</p>
    </div>
    <div class="poem-content">
      <div class="poem-image">
        <img src="data:image/jpeg;base64,${befanaImg}" alt="La Befana">
      </div>
      <div class="poem-text">
        <pre>Discesi dal lettino
son la presso il camino,
grandi occhi estasiati,
i bimbi affaccendati

a metter la calzetta
che invita la vecchietta
a portar chicche e doni
per tutti i bimbi buoni.

Ognun chiudendo gli occhi,
sogna dolci e balocchi;
e Dori, il piu piccino,
accosta il suo visino

alla grande vetrata
per veder la sfilata
dei Magi, su nel cielo,
nella notte di gelo.</pre>
      </div>
    </div>
    <div class="footer">Onde - Collana Poetry</div>
  </div>

</body>
</html>
  `;

  await page.setContent(html, { waitUntil: 'networkidle0' });

  const pdfPath = '/Users/mattiapetrucciani/Downloads/Antologia-Poesia-Italiana-3-Stili.pdf';
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' }
  });

  await browser.close();
  console.log('PDF created:', pdfPath);
}

createPDF().catch(console.error);
