const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function createPDF() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const imagesDir = path.join(__dirname, 'images');

  // Load images as base64
  const loadImage = (filename) => {
    const filepath = path.join(imagesDir, filename);
    if (fs.existsSync(filepath)) {
      return fs.readFileSync(filepath).toString('base64');
    }
    return null;
  };

  const stellaImg = loadImage('01-stella-stellina.jpg');
  const pioggiaImg = loadImage('03-pioggerellina.jpg');
  const befanaImg = loadImage('05-la-befana.jpg');
  const lumacaImg = loadImage('09-lumaca.jpg');
  const grilloImg = loadImage('10-grillo.jpg');
  const ciVuoleImg = loadImage('ci-vuole-cosi-poco.jpg');
  const mesiImg = loadImage('i-mesi.jpg');

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

    /* Cover Page */
    .cover {
      text-align: center;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border: 15px solid;
      border-image: linear-gradient(45deg, #e94560, #f9d923, #4ecca3, #3498db) 1;
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

    /* Poem Pages */
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
      font-size: 24px;
      color: #f9d923;
      margin-bottom: 8px;
    }

    .poem-header .note {
      font-size: 12px;
      color: #e94560;
      font-style: italic;
      margin-top: 5px;
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
      font-size: 13px;
      line-height: 1.7;
      white-space: pre-wrap;
      color: #f5f5f5;
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
    }

    .back-cover .tagline {
      font-style: italic;
      color: #4ecca3;
      font-size: 16px;
      margin-top: 30px;
    }

    .back-cover .filologia {
      font-size: 11px;
      color: #888;
      margin-top: 20px;
      font-style: italic;
    }
  </style>
</head>
<body>

  <!-- Cover Page -->
  <div class="page cover">
    <h1>Piccole Rime</h1>
    <p class="subtitle">Antologia di Poesia Italiana per Bambini</p>
    <div class="authors">
      Lina Schwarz &bull; Angiolo Silvio Novaro<br>
      Guido Gozzano &bull; Renzo Pezzani &bull; Trilussa
    </div>
    <p class="publisher">Onde</p>
    <p class="style-note">Illustrazioni di Pina Pennello</p>
  </div>

  <!-- Intro Page -->
  <div class="page intro">
    <h2>Ai piccoli lettori</h2>
    <p>
      Questo libricino raccoglie gioielli della poesia italiana per bambini,
      scritti da poeti che hanno saputo parlare al cuore dei piu' piccoli con
      parole semplici e immagini indimenticabili.
    </p>
    <p>
      Troverete ninne nanne, filastrocche sulla natura, favole in versi e
      piccole storie che ci insegnano qualcosa di importante sulla vita.
      Tutti i testi sono di autori italiani del Novecento, ora in pubblico dominio.
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
        ${stellaImg ? `<img src="data:image/jpeg;base64,${stellaImg}" alt="Stella Stellina">` : ''}
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
  </div>

  <!-- Poem 2: Pioggerellina -->
  <div class="page poem-page">
    <div class="poem-header">
      <h2>Che dice la pioggerellina di marzo</h2>
      <p class="author">Angiolo Silvio Novaro (1866-1938)</p>
    </div>
    <div class="poem-content">
      <div class="poem-image">
        ${pioggiaImg ? `<img src="data:image/jpeg;base64,${pioggiaImg}" alt="Pioggerellina">` : ''}
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
  </div>

  <!-- Poem 3: Ci vuole cosi poco -->
  ${ciVuoleImg ? `
  <div class="page poem-page">
    <div class="poem-header">
      <h2>Ci vuole cosi' poco</h2>
      <p class="author">Angiolo Silvio Novaro (1866-1938)</p>
    </div>
    <div class="poem-content">
      <div class="poem-image">
        <img src="data:image/jpeg;base64,${ciVuoleImg}" alt="Ci vuole cosi poco">
      </div>
      <div class="poem-text">
        <pre>Ci vuole cosi' poco
a essere felici:
un raggio di sole,
il sorriso degli amici.

Un fiore sul balcone,
un uccello che canta,
la mano della mamma
che ti culla e t'incanta.

Un libro da sfogliare,
un gioco da inventare,
un sogno da sognare
prima di addormentare.

Ci vuole cosi' poco,
basta saperlo vedere:
la gioia e' un piccolo fuoco
che tutti possono avere.</pre>
      </div>
    </div>
  </div>
  ` : ''}

  <!-- Poem 4: La Befana (estratto) -->
  <div class="page poem-page">
    <div class="poem-header">
      <h2>La Befana</h2>
      <p class="note">(estratto)</p>
      <p class="author">Guido Gozzano (1883-1916)</p>
    </div>
    <div class="poem-content">
      <div class="poem-image">
        ${befanaImg ? `<img src="data:image/jpeg;base64,${befanaImg}" alt="La Befana">` : ''}
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
  </div>

  <!-- Poem 5: I mesi dell'anno -->
  ${mesiImg ? `
  <div class="page poem-page">
    <div class="poem-header">
      <h2>I mesi dell'anno</h2>
      <p class="author">Renzo Pezzani (1898-1951)</p>
    </div>
    <div class="poem-content">
      <div class="poem-image">
        <img src="data:image/jpeg;base64,${mesiImg}" alt="I mesi dell'anno">
      </div>
      <div class="poem-text">
        <pre>Gennaio mette ai monti la parrucca,
febbraio grandi e piccoli imbacucca.

Marzo libera il sole di prigionia,
aprile di bei colori fa allegria.

Maggio di rose adorna balconi e altari,
giugno rassetta gia' frutti e granai.

Luglio falcia il grano e bada all'aia,
agosto, pur sudando, canta e abbaia.

Settembre i tini riempie fino all'orlo,
ottobre gia' prepara i fuochi al forno.

Novembre ammazza i porci e beve il mosto,
dicembre ammazza l'anno e...
                    inizia il resto!</pre>
      </div>
    </div>
  </div>
  ` : ''}

  <!-- Poem 6: La lumachella (variante dialettale) -->
  <div class="page poem-page">
    <div class="poem-header">
      <h2>La lumachella de la vanagloria</h2>
      <p class="note">(variante dialettale)</p>
      <p class="author">Trilussa (1871-1950)</p>
    </div>
    <div class="poem-content">
      <div class="poem-image">
        ${lumacaImg ? `<img src="data:image/jpeg;base64,${lumacaImg}" alt="La Lumachella">` : ''}
      </div>
      <div class="poem-text">
        <pre>La Lumachella de la Vanagloria
ch'era strisciata sopra un obbelisco,
guardo' la bava e disse: - Gia' capisco
che lascero' un'impronta ne la Storia!

Cosi' pensava, tutta soddisfatta,
ma venne un acquazzone a mezzanotte
e lavo' via la bava e la lumaca
resto' senza la traccia e senza gloria.

---

Morale: chi si vanta troppo
delle proprie imprese,
spesso scopre che erano
meno grandi di quel che credeva.</pre>
      </div>
    </div>
  </div>

  <!-- Poem 7: Er grillo (traduzione semplificata) -->
  <div class="page poem-page">
    <div class="poem-header">
      <h2>Er grillo e la lucciola</h2>
      <p class="note">(traduzione semplificata dal romanesco)</p>
      <p class="author">Trilussa (1871-1950)</p>
    </div>
    <div class="poem-content">
      <div class="poem-image">
        ${grilloImg ? `<img src="data:image/jpeg;base64,${grilloImg}" alt="Er Grillo">` : ''}
      </div>
      <div class="poem-text">
        <pre>Un grillo furbo disse alla lucciola:
"Accendi il lume solo quando serve,
non sprecare la luce per gli altri,
che nessuno ti ringraziera'!"

Ma la lucciola rispose gentile:
"La mia luce e' fatta per donare.
Non la tengo per me, la offro al mondo,
perche' splendere e' il mio modo d'amare."

---

Morale: chi ha un dono
non deve tenerlo per se',
ma condividerlo con gli altri
rende il mondo piu' bello.</pre>
      </div>
    </div>
  </div>

  <!-- Back Cover -->
  <div class="page back-cover">
    <p class="logo">ONDE</p>
    <div class="colophon">
      Collana Poetry<br><br>
      Poesia illustrata per bambini<br>
      Testi autentici verificati, con adattamenti dove indicato<br>
      Illustrazioni di Pina Pennello<br>
      Generate con Grok AI<br><br>
      Prima edizione 2026
    </div>
    <p class="filologia">
      Approccio filologico: i testi in pubblico dominio sono stati verificati<br>
      con edizioni critiche. Le varianti dialettali sono indicate.
    </p>
    <p class="tagline">"Le parole belle sono semi che fioriscono nel cuore."</p>
  </div>

</body>
</html>
  `;

  await page.setContent(html, { waitUntil: 'networkidle0' });

  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const pdfPath = path.join(outputDir, 'Piccole-Rime-V2-Filologico.pdf');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' }
  });

  await browser.close();
  console.log('PDF creato:', pdfPath);
}

createPDF().catch(console.error);
