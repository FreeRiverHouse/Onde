const puppeteer = require('puppeteer');
const fs = require('fs');

async function createPDF() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Convert images to base64
  const stellaImg = fs.readFileSync('/Users/mattiapetrucciani/Downloads/stella-stellina-vintage.jpg').toString('base64');
  const pioggiaImg = fs.readFileSync('/Users/mattiapetrucciani/Downloads/pioggerellina-vintage.jpg').toString('base64');
  const befanaImg = fs.readFileSync('/Users/mattiapetrucciani/Downloads/la-befana.jpg').toString('base64');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Playfair+Display:wght@400;700&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Crimson Text', Georgia, serif;
      background: #faf8f5;
      color: #3d3d3d;
    }

    .page {
      page-break-after: always;
      min-height: 100vh;
      padding: 50px;
      display: flex;
      flex-direction: column;
    }

    .page:last-child {
      page-break-after: avoid;
    }

    /* Cover Page - Vintage Style */
    .cover {
      text-align: center;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #f5ebe0 0%, #e8ddd0 100%);
      border: 12px double #8b7355;
      position: relative;
    }

    .cover::before {
      content: '';
      position: absolute;
      top: 20px;
      left: 20px;
      right: 20px;
      bottom: 20px;
      border: 2px solid #c4a77d;
      pointer-events: none;
    }

    .cover h1 {
      font-family: 'Playfair Display', serif;
      font-size: 38px;
      color: #5c4a32;
      margin-bottom: 15px;
      letter-spacing: 3px;
      text-transform: uppercase;
    }

    .cover .subtitle {
      font-size: 20px;
      font-style: italic;
      color: #8b7355;
      margin-bottom: 40px;
      letter-spacing: 1px;
    }

    .cover .authors {
      font-size: 16px;
      color: #6b5b47;
      margin: 30px 0;
      line-height: 1.8;
    }

    .cover .publisher {
      font-size: 14px;
      color: #8b7355;
      margin-top: 50px;
      letter-spacing: 4px;
      text-transform: uppercase;
      border-top: 1px solid #c4a77d;
      border-bottom: 1px solid #c4a77d;
      padding: 15px 30px;
      display: inline-block;
    }

    .cover .year {
      font-size: 18px;
      color: #5c4a32;
      margin-top: 20px;
      font-family: 'Playfair Display', serif;
    }

    /* Intro Page */
    .intro {
      justify-content: center;
      padding: 60px;
      background: #faf8f5;
    }

    .intro h2 {
      font-family: 'Playfair Display', serif;
      font-size: 26px;
      margin-bottom: 30px;
      color: #5c4a32;
      text-align: center;
      border-bottom: 2px solid #c4a77d;
      padding-bottom: 15px;
    }

    .intro p {
      font-size: 17px;
      line-height: 1.9;
      margin-bottom: 20px;
      text-align: justify;
      color: #4a4a4a;
    }

    .intro .dedication {
      font-style: italic;
      text-align: center;
      margin-top: 40px;
      color: #8b7355;
      font-size: 18px;
    }

    /* Poem Pages - Vintage Italian Style */
    .poem-page {
      padding: 40px 50px;
      background: #fdfbf7;
    }

    .poem-header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #d4c4a8;
    }

    .poem-header h2 {
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      color: #5c4a32;
      margin-bottom: 8px;
      letter-spacing: 1px;
    }

    .poem-header .author {
      font-style: italic;
      color: #8b7355;
      font-size: 15px;
    }

    .poem-content {
      display: flex;
      gap: 35px;
      align-items: flex-start;
      margin-top: 25px;
    }

    .poem-image {
      flex: 0 0 48%;
    }

    .poem-image img {
      width: 100%;
      border-radius: 8px;
      box-shadow: 0 6px 25px rgba(92, 74, 50, 0.2);
      border: 3px solid #e8ddd0;
    }

    .poem-text {
      flex: 1;
    }

    .poem-text pre {
      font-family: 'Crimson Text', Georgia, serif;
      font-size: 15px;
      line-height: 1.85;
      white-space: pre-wrap;
      color: #3d3d3d;
    }

    /* Footer */
    .footer {
      margin-top: auto;
      text-align: center;
      padding-top: 25px;
      border-top: 1px solid #d4c4a8;
      font-size: 11px;
      color: #8b7355;
      letter-spacing: 2px;
      text-transform: uppercase;
    }

    /* Back Cover */
    .back-cover {
      text-align: center;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #e8ddd0 0%, #f5ebe0 100%);
      border: 12px double #8b7355;
      position: relative;
    }

    .back-cover::before {
      content: '';
      position: absolute;
      top: 20px;
      left: 20px;
      right: 20px;
      bottom: 20px;
      border: 2px solid #c4a77d;
      pointer-events: none;
    }

    .back-cover .colophon {
      font-size: 14px;
      color: #6b5b47;
      line-height: 2;
    }

    .back-cover .logo {
      font-family: 'Playfair Display', serif;
      font-size: 32px;
      color: #5c4a32;
      margin-bottom: 30px;
      letter-spacing: 5px;
    }

    .back-cover .tagline {
      font-style: italic;
      color: #8b7355;
      font-size: 16px;
      margin-top: 30px;
    }
  </style>
</head>
<body>

  <!-- Cover Page -->
  <div class="page cover">
    <h1>Antologia di Poesia<br>Italiana per Bambini</h1>
    <p class="subtitle">Tre classici della tradizione</p>

    <div class="authors">
      Lina Schwarz<br>
      Angiolo Silvio Novaro<br>
      Guido Gozzano
    </div>

    <p class="publisher">Onde</p>
    <p class="year">Collana Poetry</p>
  </div>

  <!-- Intro Page -->
  <div class="page intro">
    <h2>Ai piccoli lettori</h2>
    <p>
      Questo libricino raccoglie tre gioielli della poesia italiana per bambini,
      scritti da poeti che hanno saputo parlare al cuore dei piu' piccoli con
      parole semplici e immagini indimenticabili.
    </p>
    <p>
      <strong>Stella Stellina</strong> di Lina Schwarz e' una delle ninne nanne
      piu' amate d'Italia, un canto dolce che accompagna i bambini verso il sonno.
      <strong>Che dice la pioggerellina di marzo</strong> di Angiolo Silvio Novaro
      celebra l'arrivo della primavera con versi che danzano come gocce di pioggia.
      <strong>La Befana</strong> di Guido Gozzano cattura la magia della notte dell'Epifania,
      quando i bambini attendono i doni della vecchietta.
    </p>
    <p>
      Le illustrazioni sono ispirate allo stile dei libri per bambini italiani
      degli anni Cinquanta, un'epoca d'oro dell'editoria per l'infanzia.
    </p>
    <p class="dedication">
      A tutti i bambini che amano le parole belle.
    </p>
  </div>

  <!-- Poem 1: Stella Stellina -->
  <div class="page poem-page">
    <div class="poem-header">
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
la mucca e' nella stalla.

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

Passata e' l'uggiosa invernata,
passata, passata!
Di fuor dalla nuvola nera
di fuor dalla nuvola bigia
che in cielo si pigia,
domani uscira' Primavera
con pieno il grembiale
di tiepido sole,
di fresche viole,
di primule rosse, di battiti d'ale,
di nidi, di gridi
di rondini, ed anche
di stelle di mandorlo, bianche...

Cio' dice la pioggerellina
sui tegoli vecchi del tetto,
sui bruscoli secchi dell'orto,
sul fico e sul moro
ornati di gemmule d'oro.

Cio' canta, cio' dice;
e il cuor che l'ascolta e' felice.</pre>
      </div>
    </div>
    <div class="footer">Onde - Collana Poetry</div>
  </div>

  <!-- Poem 3: La Befana -->
  <div class="page poem-page">
    <div class="poem-header">
      <h2>La Befana</h2>
      <p class="author">Guido Gozzano (1883-1916)</p>
    </div>
    <div class="poem-content">
      <div class="poem-image">
        <img src="data:image/jpeg;base64,${befanaImg}" alt="La Befana">
      </div>
      <div class="poem-text">
        <pre>Discesi dal lettino
son la' presso il camino,
grandi occhi estasiati,
i bimbi affaccendati

a metter la calzetta
che invita la vecchietta
a portar chicche e doni
per tutti i bimbi buoni.

Ognun chiudendo gli occhi,
sogna dolci e balocchi;
e Dori, il piu' piccino,
accosta il suo visino

alla grande vetrata
per veder la sfilata
dei Magi, su nel cielo,
nella notte di gelo.</pre>
      </div>
    </div>
    <div class="footer">Onde - Collana Poetry</div>
  </div>

  <!-- Back Cover -->
  <div class="page back-cover">
    <p class="logo">ONDE</p>
    <div class="colophon">
      Collana Poetry<br><br>
      Poesia illustrata per bambini<br>
      Testi in pubblico dominio<br>
      Illustrazioni generate con Grok AI<br><br>
      Prima edizione 2026
    </div>
    <p class="tagline">"Le parole belle sono semi che fioriscono nel cuore."</p>
  </div>

</body>
</html>
  `;

  await page.setContent(html, { waitUntil: 'networkidle0' });

  const pdfPath = '/Users/mattiapetrucciani/Downloads/Antologia-Poesia-Italiana-Vintage50.pdf';
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
