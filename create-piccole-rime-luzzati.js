const puppeteer = require('puppeteer');
const fs = require('fs');

async function createPDF() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Convert images to base64
  const stellaImg = fs.readFileSync('/Users/mattiapetrucciani/Downloads/stella-stellina-folk-luzzati.jpg').toString('base64');
  const pioggiaImg = fs.readFileSync('/Users/mattiapetrucciani/Downloads/pioggerellina-luzzati.jpg').toString('base64');
  const befanaImg = fs.readFileSync('/Users/mattiapetrucciani/Downloads/la-befana-luzzati.jpg').toString('base64');

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
      background: #1a1a2e;
      color: #f5f5f5;
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

    /* Cover Page - Luzzati Style */
    .cover {
      text-align: center;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border: 15px solid;
      border-image: linear-gradient(45deg, #e94560, #f9d923, #4ecca3, #3498db) 1;
      position: relative;
    }

    .cover h1 {
      font-family: 'Playfair Display', serif;
      font-size: 42px;
      color: #f9d923;
      margin-bottom: 15px;
      letter-spacing: 3px;
      text-transform: uppercase;
      text-shadow: 3px 3px 0 #e94560;
    }

    .cover .subtitle {
      font-size: 20px;
      font-style: italic;
      color: #4ecca3;
      margin-bottom: 40px;
      letter-spacing: 1px;
    }

    .cover .authors {
      font-size: 16px;
      color: #f5f5f5;
      margin: 30px 0;
      line-height: 1.8;
    }

    .cover .publisher {
      font-size: 18px;
      color: #f9d923;
      margin-top: 50px;
      letter-spacing: 4px;
      text-transform: uppercase;
      border: 2px solid #f9d923;
      padding: 15px 40px;
      display: inline-block;
    }

    .cover .style-note {
      font-size: 14px;
      color: #4ecca3;
      margin-top: 20px;
      font-style: italic;
    }

    /* Intro Page */
    .intro {
      justify-content: center;
      padding: 60px;
      background: #1a1a2e;
    }

    .intro h2 {
      font-family: 'Playfair Display', serif;
      font-size: 26px;
      margin-bottom: 30px;
      color: #f9d923;
      text-align: center;
      border-bottom: 2px solid #e94560;
      padding-bottom: 15px;
    }

    .intro p {
      font-size: 17px;
      line-height: 1.9;
      margin-bottom: 20px;
      text-align: justify;
      color: #f5f5f5;
    }

    .intro .dedication {
      font-style: italic;
      text-align: center;
      margin-top: 40px;
      color: #4ecca3;
      font-size: 18px;
    }

    /* Poem Pages - Luzzati Style */
    .poem-page {
      padding: 30px 40px;
      background: #1a1a2e;
    }

    .poem-header {
      text-align: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid #e94560;
    }

    .poem-header h2 {
      font-family: 'Playfair Display', serif;
      font-size: 26px;
      color: #f9d923;
      margin-bottom: 8px;
      letter-spacing: 1px;
    }

    .poem-header .author {
      font-style: italic;
      color: #4ecca3;
      font-size: 14px;
    }

    .poem-content {
      display: flex;
      gap: 30px;
      align-items: flex-start;
      margin-top: 20px;
    }

    .poem-image {
      flex: 0 0 50%;
    }

    .poem-image img {
      width: 100%;
      border-radius: 5px;
      border: 4px solid #e94560;
      box-shadow: 0 8px 30px rgba(233, 69, 96, 0.3);
    }

    .poem-text {
      flex: 1;
    }

    .poem-text pre {
      font-family: 'Crimson Text', Georgia, serif;
      font-size: 14px;
      line-height: 1.75;
      white-space: pre-wrap;
      color: #f5f5f5;
    }

    /* Footer */
    .footer {
      margin-top: auto;
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #e94560;
      font-size: 11px;
      color: #4ecca3;
      letter-spacing: 2px;
      text-transform: uppercase;
    }

    /* Back Cover */
    .back-cover {
      text-align: center;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #16213e 0%, #1a1a2e 100%);
      border: 15px solid;
      border-image: linear-gradient(45deg, #4ecca3, #3498db, #e94560, #f9d923) 1;
    }

    .back-cover .colophon {
      font-size: 14px;
      color: #f5f5f5;
      line-height: 2;
    }

    .back-cover .logo {
      font-family: 'Playfair Display', serif;
      font-size: 36px;
      color: #f9d923;
      margin-bottom: 30px;
      letter-spacing: 5px;
      text-shadow: 2px 2px 0 #e94560;
    }

    .back-cover .tagline {
      font-style: italic;
      color: #4ecca3;
      font-size: 16px;
      margin-top: 30px;
    }
  </style>
</head>
<body>

  <!-- Cover Page -->
  <div class="page cover">
    <h1>Piccole Rime</h1>
    <p class="subtitle">Antologia di Poesia Italiana per Bambini</p>

    <div class="authors">
      Lina Schwarz<br>
      Angiolo Silvio Novaro<br>
      Guido Gozzano
    </div>

    <p class="publisher">Onde</p>
    <p class="style-note">Illustrazioni ispirate a Emanuele Luzzati</p>
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
      Le illustrazioni sono ispirate allo stile di Emanuele Luzzati, maestro
      dell'illustrazione italiana, con i suoi colori vivaci e le forme teatrali.
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
      Illustrazioni generate con Grok AI<br>
      Stile ispirato a Emanuele Luzzati<br><br>
      Prima edizione 2026
    </div>
    <p class="tagline">"Le parole belle sono semi che fioriscono nel cuore."</p>
  </div>

</body>
</html>
  `;

  await page.setContent(html, { waitUntil: 'networkidle0' });

  const pdfPath = '/Users/mattiapetrucciani/Downloads/Piccole-Rime-Luzzati.pdf';
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
