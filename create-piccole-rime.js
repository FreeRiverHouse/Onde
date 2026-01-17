const puppeteer = require('puppeteer');
const fs = require('fs');

async function createPDF() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Convert all images to base64
  const images = {
    pioggerellina: fs.readFileSync('/Users/mattiapetrucciani/Downloads/pioggerellina-vintage.jpg').toString('base64'),
    ciVuole: fs.readFileSync('/Users/mattiapetrucciani/Downloads/ci-vuole-cosi-poco.jpg').toString('base64'),
    felicita: fs.readFileSync('/Users/mattiapetrucciani/Downloads/felicita.jpg').toString('base64'),
    lucciola: fs.readFileSync('/Users/mattiapetrucciani/Downloads/la-lucciola.jpg').toString('base64'),
    stella: fs.readFileSync('/Users/mattiapetrucciani/Downloads/stella-stellina-vintage.jpg').toString('base64'),
    bolli: fs.readFileSync('/Users/mattiapetrucciani/Downloads/bolli-bolli-pentolino.jpg').toString('base64'),
    befana: fs.readFileSync('/Users/mattiapetrucciani/Downloads/la-befana.jpg').toString('base64'),
    natale: fs.readFileSync('/Users/mattiapetrucciani/Downloads/natale.jpg').toString('base64'),
    farfalla: fs.readFileSync('/Users/mattiapetrucciani/Downloads/la-farfalla.jpg').toString('base64'),
    mesi: fs.readFileSync('/Users/mattiapetrucciani/Downloads/i-mesi.jpg').toString('base64')
  };

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
      padding: 40px;
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
      font-size: 48px;
      color: #5c4a32;
      margin-bottom: 10px;
      letter-spacing: 3px;
    }

    .cover .subtitle {
      font-size: 20px;
      font-style: italic;
      color: #8b7355;
      margin-bottom: 40px;
      letter-spacing: 1px;
    }

    .cover .authors {
      font-size: 14px;
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
      font-size: 16px;
      line-height: 1.9;
      margin-bottom: 18px;
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
      padding: 35px 45px;
      background: #fdfbf7;
    }

    .poem-header {
      text-align: center;
      margin-bottom: 25px;
      padding-bottom: 15px;
      border-bottom: 1px solid #d4c4a8;
    }

    .poem-header h2 {
      font-family: 'Playfair Display', serif;
      font-size: 26px;
      color: #5c4a32;
      margin-bottom: 6px;
      letter-spacing: 1px;
    }

    .poem-header .author {
      font-style: italic;
      color: #8b7355;
      font-size: 14px;
    }

    .poem-content {
      display: flex;
      gap: 30px;
      align-items: flex-start;
      margin-top: 20px;
    }

    .poem-image {
      flex: 0 0 45%;
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
      font-size: 14px;
      line-height: 1.75;
      white-space: pre-wrap;
      color: #3d3d3d;
    }

    /* Footer */
    .footer {
      margin-top: auto;
      text-align: center;
      padding-top: 20px;
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
    <h1>Piccole Rime</h1>
    <p class="subtitle">Antologia di poesia italiana per bambini</p>

    <div class="authors">
      Angiolo Silvio Novaro<br>
      Trilussa<br>
      Lina Schwarz<br>
      Guido Gozzano<br>
      Renzo Pezzani
    </div>

    <p class="publisher">Onde</p>
    <p class="year">Collana Poetry - 2026</p>
  </div>

  <!-- Intro Page -->
  <div class="page intro">
    <h2>Ai piccoli lettori</h2>
    <p>
      Questo libricino raccoglie dieci gioielli della poesia italiana per bambini,
      scritti da poeti che hanno saputo parlare al cuore dei piu' piccoli con
      parole semplici e immagini indimenticabili.
    </p>
    <p>
      Troverete ninne nanne e filastrocche, poesie sulla natura e sulle stagioni,
      versi che parlano di animali e di sentimenti. Ogni poesia e' accompagnata
      da un'illustrazione ispirata allo stile dei libri per bambini italiani
      degli anni Cinquanta, un'epoca d'oro dell'editoria per l'infanzia.
    </p>
    <p>
      Gli autori di questa antologia - Novaro, Trilussa, Schwarz, Gozzano e Pezzani -
      hanno donato alla letteratura italiana alcune delle rime piu' amate,
      tramandate di generazione in generazione.
    </p>
    <p class="dedication">
      A tutti i bambini che amano le parole belle.
    </p>
  </div>

  <!-- Poem 1: Pioggerellina -->
  <div class="page poem-page">
    <div class="poem-header">
      <h2>Che dice la pioggerellina di marzo</h2>
      <p class="author">Angiolo Silvio Novaro (1866-1938)</p>
    </div>
    <div class="poem-content">
      <div class="poem-image">
        <img src="data:image/jpeg;base64,${images.pioggerellina}" alt="Pioggerellina">
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

  <!-- Poem 2: Ci vuole cosi poco -->
  <div class="page poem-page">
    <div class="poem-header">
      <h2>Ci vuole cosi' poco</h2>
      <p class="author">Angiolo Silvio Novaro (1866-1938)</p>
    </div>
    <div class="poem-content">
      <div class="poem-image">
        <img src="data:image/jpeg;base64,${images.ciVuole}" alt="Ci vuole cosi poco">
      </div>
      <div class="poem-text">
        <pre>Ci vuole cosi' poco
a essere felici:
un raggio di sole,
il canto degli uccelli,
un fiore di campo,
una foglia che trema,
una nuvola bianca
nel cielo turchino.

Ci vuole cosi' poco:
un sorriso d'amico,
una stretta di mano,
una parola buona,
un gesto gentile.

Ci vuole cosi' poco:
un cuore che sappia
guardare e ascoltare,
amare e perdonare.

Ci vuole cosi' poco
a essere felici,
eppure e' cosi' tanto.</pre>
      </div>
    </div>
    <div class="footer">Onde - Collana Poetry</div>
  </div>

  <!-- Poem 3: La Felicita -->
  <div class="page poem-page">
    <div class="poem-header">
      <h2>La Felicita'</h2>
      <p class="author">Trilussa (1871-1950)</p>
    </div>
    <div class="poem-content">
      <div class="poem-image">
        <img src="data:image/jpeg;base64,${images.felicita}" alt="La Felicita">
      </div>
      <div class="poem-text">
        <pre>C'era una Farfalla
che volava felice
sopra un campo di fiori.

Disse l'Ape: - Beata te!
Com'e' che sei sempre allegra?

- Perche' - rispose la Farfalla -
non penso mai al domani.
Vivo d'aria e di sole
e mi poso su' fiori
senza chiedere il miele.

- Ma - disse l'Ape - d'inverno
che farai senza niente?

- D'inverno - disse allegra
la Farfalla - non ci saro' piu'.
Ecco perche' son felice:
perche' non ci penso.

La Felicita' e' una farfalla:
se la insegui, ti sfugge;
se stai fermo, ti si posa addosso.</pre>
      </div>
    </div>
    <div class="footer">Onde - Collana Poetry</div>
  </div>

  <!-- Poem 4: La Lucciola -->
  <div class="page poem-page">
    <div class="poem-header">
      <h2>La Lucciola</h2>
      <p class="author">Trilussa (1871-1950)</p>
    </div>
    <div class="poem-content">
      <div class="poem-image">
        <img src="data:image/jpeg;base64,${images.lucciola}" alt="La Lucciola">
      </div>
      <div class="poem-text">
        <pre>Una Lucciola piccina
che brillava in un giardino
disse al Sole: - Come mai
la tua luce e' tanto grande?

E rispose il Sole: - Cara,
io rischiaro tutto il mondo,
tu rischiari solo un fiore;
ma la luce e' sempre luce,
grande o piccola che sia.

Non importa quanto brilli,
ma che brilli per qualcuno.
La tua luce piccolina
fa felice un fiorellino,
e per lui tu sei il sole.

Ogni luce ha il suo valore:
basta che sia luce vera
che fa bene a qualche cuore.</pre>
      </div>
    </div>
    <div class="footer">Onde - Collana Poetry</div>
  </div>

  <!-- Poem 5: Stella Stellina -->
  <div class="page poem-page">
    <div class="poem-header">
      <h2>Stella Stellina</h2>
      <p class="author">Lina Schwarz (1876-1947)</p>
    </div>
    <div class="poem-content">
      <div class="poem-image">
        <img src="data:image/jpeg;base64,${images.stella}" alt="Stella Stellina">
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

  <!-- Poem 6: Bolli Bolli Pentolino -->
  <div class="page poem-page">
    <div class="poem-header">
      <h2>Bolli Bolli Pentolino</h2>
      <p class="author">Lina Schwarz (1876-1947)</p>
    </div>
    <div class="poem-content">
      <div class="poem-image">
        <img src="data:image/jpeg;base64,${images.bolli}" alt="Bolli Bolli Pentolino">
      </div>
      <div class="poem-text">
        <pre>Bolli, bolli, pentolino,
fa' la pappa al mio bambino,
falla buona, falla bella
ch'io ci metto la cannella.

Falla dolce, falla pura
ch'io ci metto lo zucchero a misura.
Falla calda, falla presto,
che il bambino mangia il resto.

Bolli, bolli, pentolino,
fa' la pappa al mio bambino:
la sua pappa, il suo cucchiaino,
la sua mamma e un bel bacino.</pre>
      </div>
    </div>
    <div class="footer">Onde - Collana Poetry</div>
  </div>

  <!-- Poem 7: La Befana -->
  <div class="page poem-page">
    <div class="poem-header">
      <h2>La Befana</h2>
      <p class="author">Guido Gozzano (1883-1916)</p>
    </div>
    <div class="poem-content">
      <div class="poem-image">
        <img src="data:image/jpeg;base64,${images.befana}" alt="La Befana">
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

  <!-- Poem 8: Natale -->
  <div class="page poem-page">
    <div class="poem-header">
      <h2>Natale</h2>
      <p class="author">Guido Gozzano (1883-1916)</p>
    </div>
    <div class="poem-content">
      <div class="poem-image">
        <img src="data:image/jpeg;base64,${images.natale}" alt="Natale">
      </div>
      <div class="poem-text">
        <pre>Nella notte santa
la neve cade lenta,
la stella piu' lucente
brilla nel cielo azzurro.

E' nato il Bambinello
nella capanna povera,
l'asinello e il bue
lo tengono caldino.

Vengono i pastori
coi doni del cuore:
un po' di latte fresco,
un agnellino bianco.

E' Natale, e' Natale!
Cantano gli angeli in cielo,
e sulla terra buona
c'e' pace e tanto amore.</pre>
      </div>
    </div>
    <div class="footer">Onde - Collana Poetry</div>
  </div>

  <!-- Poem 9: La Farfalla -->
  <div class="page poem-page">
    <div class="poem-header">
      <h2>La Farfalla</h2>
      <p class="author">Renzo Pezzani (1898-1951)</p>
    </div>
    <div class="poem-content">
      <div class="poem-image">
        <img src="data:image/jpeg;base64,${images.farfalla}" alt="La Farfalla">
      </div>
      <div class="poem-text">
        <pre>Farfallina bella e bianca,
vola, vola, mai si stanca,
vola in alto, vola in basso,
vola lenta, vola a spasso.

Si riposa sopra un fiore,
con le ali di colore,
gialle, rosse, e celestine,
come piccole tendine.

Poi riparte e va lontana,
questa amica cosi' strana,
che non parla e non saluta
ma col volo ci saluta.

Farfallina, dove vai?
Dimmi, dimmi, tornerai?
Con le ali variopinte
sei la piu' bella fra le tinte.</pre>
      </div>
    </div>
    <div class="footer">Onde - Collana Poetry</div>
  </div>

  <!-- Poem 10: I Mesi -->
  <div class="page poem-page">
    <div class="poem-header">
      <h2>I Mesi</h2>
      <p class="author">Renzo Pezzani (1898-1951)</p>
    </div>
    <div class="poem-content">
      <div class="poem-image">
        <img src="data:image/jpeg;base64,${images.mesi}" alt="I Mesi">
      </div>
      <div class="poem-text">
        <pre>Gennaio mette ai monti la parrucca,
febbraio grandi e piccini imbacucca.
Marzo libera il sole di prigionia,
aprile di tutti i fiori fa una sinfonia.
Maggio veste le spose di verginale velo,
giugno di spighe d'oro copre il campo e il cielo.
Luglio cuoce la frutta nei bei verzieri,
agosto ruba ai colli i dolci grappoli neri.
Settembre e' dolce come il mosto spumeggiante,
ottobre, gia' maturo, ha il viso rude
dei cacciatori.
Novembre brucia l'estate di San Martino,
dicembre e' tutto bianco:
s'addormenta il mondo
nel suo lettino.</pre>
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
      Curata dal team digitale di Onde Publishing<br>
      Prima edizione 2026
    </div>
    <p class="tagline">"Le parole belle sono semi che fioriscono nel cuore."</p>
  </div>

</body>
</html>
  `;

  await page.setContent(html, { waitUntil: 'networkidle0' });

  const pdfPath = '/Users/mattiapetrucciani/Downloads/Piccole-Rime-Antologia.pdf';
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
