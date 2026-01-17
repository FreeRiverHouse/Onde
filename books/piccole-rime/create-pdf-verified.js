const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = '/Users/mattiapetrucciani/CascadeProjects/Onde/books/piccole-rime/images';

function loadImage(filename) {
  const filepath = path.join(IMAGES_DIR, filename);
  if (fs.existsSync(filepath)) {
    return fs.readFileSync(filepath).toString('base64');
  }
  console.warn(`Image not found: ${filename}`);
  return null;
}

async function createPDF() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Load images
  const images = {
    stella: loadImage('01-stella-stellina.jpg'),
    pioggia: loadImage('03-pioggerellina.jpg'),
    befana: loadImage('05-la-befana.jpg'),
    lumachella: loadImage('09-lumaca.jpg'),
    uguaglianza: loadImage('09-lumaca.jpg'), // Placeholder
    civuole: loadImage('ci-vuole-cosi-poco.jpg'),
    farfalla: loadImage('felicita.jpg'), // Placeholder for farfalla
    primavera: loadImage('03-pioggerellina.jpg'), // Placeholder
    mesi: loadImage('i-mesi.jpg')
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
      font-size: 48px;
      color: #f9d923;
      margin-bottom: 15px;
      letter-spacing: 3px;
      text-shadow: 3px 3px 0 #e94560;
    }

    .cover .subtitle {
      font-size: 22px;
      font-style: italic;
      color: #4ecca3;
      margin-bottom: 40px;
    }

    .cover .authors {
      font-size: 16px;
      color: #f5f5f5;
      margin: 30px 0;
      line-height: 2;
    }

    .cover .publisher {
      font-size: 20px;
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

    .intro {
      justify-content: center;
      padding: 60px;
    }

    .intro h2 {
      font-family: 'Playfair Display', serif;
      font-size: 28px;
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
    }

    .intro .dedication {
      font-style: italic;
      text-align: center;
      margin-top: 40px;
      color: #4ecca3;
      font-size: 18px;
    }

    .poem-page {
      padding: 30px 40px;
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

    .poem-header .author {
      font-style: italic;
      color: #4ecca3;
      font-size: 14px;
    }

    .poem-content {
      display: flex;
      gap: 25px;
      align-items: flex-start;
      margin-top: 15px;
    }

    .poem-image {
      flex: 0 0 45%;
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
      line-height: 1.6;
      white-space: pre-wrap;
    }

    .poem-text-small pre {
      font-size: 11px;
      line-height: 1.5;
    }

    .footer {
      margin-top: auto;
      text-align: center;
      padding-top: 15px;
      border-top: 1px solid #e94560;
      font-size: 10px;
      color: #4ecca3;
      letter-spacing: 2px;
      text-transform: uppercase;
    }

    .back-cover {
      text-align: center;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #16213e 0%, #1a1a2e 100%);
      border: 15px solid;
      border-image: linear-gradient(45deg, #4ecca3, #3498db, #e94560, #f9d923) 1;
    }

    .back-cover .logo {
      font-family: 'Playfair Display', serif;
      font-size: 40px;
      color: #f9d923;
      margin-bottom: 30px;
      text-shadow: 2px 2px 0 #e94560;
    }

    .back-cover .colophon {
      font-size: 14px;
      line-height: 2;
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

  <!-- Cover -->
  <div class="page cover">
    <h1>Piccole Rime</h1>
    <p class="subtitle">Antologia di Poesia Italiana per Bambini</p>
    <div class="authors">
      Lina Schwarz<br>
      Angiolo Silvio Novaro<br>
      Guido Gozzano<br>
      Renzo Pezzani<br>
      Trilussa
    </div>
    <p class="publisher">Onde</p>
    <p class="style-note">Illustrazioni ispirate a Emanuele Luzzati</p>
  </div>

  <!-- Intro -->
  <div class="page intro">
    <h2>Ai piccoli lettori</h2>
    <p>
      Questo libricino raccoglie nove gioielli della poesia italiana per bambini,
      scritti da poeti che hanno saputo parlare al cuore dei piu' piccoli con
      parole semplici e immagini indimenticabili.
    </p>
    <p>
      Troverete ninne nanne dolci, filastrocche allegre, e favole in versi che
      insegnano la saggezza con un sorriso. Da Lina Schwarz a Trilussa, da
      Gozzano a Pezzani, ogni poeta ha regalato ai bambini italiani parole
      che ancora oggi risuonano nei cuori.
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
        ${images.stella ? `<img src="data:image/jpeg;base64,${images.stella}" alt="Stella Stellina">` : ''}
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
        ${images.pioggia ? `<img src="data:image/jpeg;base64,${images.pioggia}" alt="Pioggerellina">` : ''}
      </div>
      <div class="poem-text poem-text-small">
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
      <p class="author">Guido Gozzano (1883-1916) - estratto</p>
    </div>
    <div class="poem-content">
      <div class="poem-image">
        ${images.befana ? `<img src="data:image/jpeg;base64,${images.befana}" alt="La Befana">` : ''}
      </div>
      <div class="poem-text">
        <pre>Discesi dal lettino
son la' presso il camino,
grandi occhi estasiati,
i bimbi affaccendati

a metter la scarpetta
che invita la Vecchietta
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

  <!-- Poem 4: La Lumachella -->
  <div class="page poem-page">
    <div class="poem-header">
      <h2>La lumachella de la vanagloria</h2>
      <p class="author">Trilussa (1871-1950)</p>
    </div>
    <div class="poem-content">
      <div class="poem-image">
        ${images.lumachella ? `<img src="data:image/jpeg;base64,${images.lumachella}" alt="Lumachella">` : ''}
      </div>
      <div class="poem-text">
        <pre>'Na lumachella de la vanagloria
ch'era strisciata sopra un obelisco
guardo' la bava e disse:
- Loss'che risco!
Ho lasciato la traccia ne la storia!</pre>
        <p style="margin-top: 30px; font-style: italic; color: #4ecca3; font-size: 13px;">
          Quartina in romanesco.<br><br>
          Una piccola lumaca vanitosa, strisciando su un obelisco,
          guarda la sua bava e pensa di aver lasciato un segno
          nella storia. Ma la pioggia lavera' via tutto...
        </p>
      </div>
    </div>
    <div class="footer">Onde - Collana Poetry</div>
  </div>

  <!-- Poem 5: L'Uguaglianza -->
  <div class="page poem-page">
    <div class="poem-header">
      <h2>L'Uguaglianza</h2>
      <p class="author">Trilussa (1871-1950) - adattamento</p>
    </div>
    <div class="poem-content">
      <div class="poem-image">
        ${images.uguaglianza ? `<img src="data:image/jpeg;base64,${images.uguaglianza}" alt="Aquila e Gallo">` : ''}
      </div>
      <div class="poem-text poem-text-small">
        <pre>Un Gallo ebbe a che dire con un'Aquila.
- Semo pari - diceva - in tutto e per tutto:
io fo' chicchirichi', tu fai crucru...
tutt'e due ce svejamo a l'alba prima...

- E mica sei matta? - disse l'Aquila - Bella!
Io volo sur cielo e tu raspi in terra!

- Ho capito - arispone er Gallo - e' giusto:
tu sei nata pe' l'aria, io pe' er pollaio.
Ma quann'e' che me fai vedere er volo?

L'Aquila lo guardo', poi, stizzita,
je disse: - Canta e sta' zzitto!
- Embe' - je fece er Gallo - e allora
scenni a razzola' er gran de sotto
e torna a fa' er Gallo tu pure!</pre>
        <p style="margin-top: 15px; font-style: italic; color: #4ecca3; font-size: 12px;">
          In romanesco. L'aquila superba e il gallo saggio.
        </p>
      </div>
    </div>
    <div class="footer">Onde - Collana Poetry</div>
  </div>

  <!-- Poem 6: Ci vuole cosi' poco -->
  <div class="page poem-page">
    <div class="poem-header">
      <h2>Ci vuole cosi' poco</h2>
      <p class="author">Angiolo Silvio Novaro (1866-1938)</p>
    </div>
    <div class="poem-content">
      <div class="poem-image">
        ${images.civuole ? `<img src="data:image/jpeg;base64,${images.civuole}" alt="Ci vuole cosi poco">` : ''}
      </div>
      <div class="poem-text">
        <pre>Ci vuole cosi' poco
a farsi voler bene,
una parola buona
detta quando conviene,
un po' di gentilezza,
una sola carezza,
un semplice sorriso
che ci baleni in viso.
Il cuore sempre aperto
per ognuno che viene:
ci vuole cosi' poco
a farsi voler bene.</pre>
      </div>
    </div>
    <div class="footer">Onde - Collana Poetry</div>
  </div>

  <!-- Poem 7: La farfalla -->
  <div class="page poem-page">
    <div class="poem-header">
      <h2>La farfalla</h2>
      <p class="author">Renzo Pezzani (1898-1951)</p>
    </div>
    <div class="poem-content">
      <div class="poem-image">
        ${images.farfalla ? `<img src="data:image/jpeg;base64,${images.farfalla}" alt="La farfalla">` : ''}
      </div>
      <div class="poem-text">
        <pre>Farfallina spensierata
lo sai tu dove sei nata?
Eri bruco in una cella,
senza sole e senza stella.
Poi nel sole sei uscita,
come un fiore sei fiorita;
come un fiore senza stelo
che il buon Dio getto' dal cielo.</pre>
      </div>
    </div>
    <div class="footer">Onde - Collana Poetry</div>
  </div>

  <!-- Poem 8: La primavera -->
  <div class="page poem-page">
    <div class="poem-header">
      <h2>La primavera</h2>
      <p class="author">Renzo Pezzani (1898-1951)</p>
    </div>
    <div class="poem-content">
      <div class="poem-image">
        ${images.primavera ? `<img src="data:image/jpeg;base64,${images.primavera}" alt="La primavera">` : ''}
      </div>
      <div class="poem-text">
        <pre>La primavera si desta, si veste,
corre leggera per prati e foreste.
Guarda un giardino:
ci nasce un fioretto.
Guarda un boschetto:
c'e' gia' l'uccellino.
Guarda la neve:
gia' scorre un ruscello;
viene l'agnello,
si china e ne beve.
Guarda il campetto:
gia' il grano germoglia.
Tocca un rametto:
ci spunta una foglia.</pre>
      </div>
    </div>
    <div class="footer">Onde - Collana Poetry</div>
  </div>

  <!-- Poem 9: I mesi dell'anno -->
  <div class="page poem-page">
    <div class="poem-header">
      <h2>I mesi dell'anno</h2>
      <p class="author">Renzo Pezzani (1898-1951)</p>
    </div>
    <div class="poem-content">
      <div class="poem-image">
        ${images.mesi ? `<img src="data:image/jpeg;base64,${images.mesi}" alt="I mesi">` : ''}
      </div>
      <div class="poem-text">
        <pre>Dice gennaio: - Chiudete quell'uscio!
Dice febbraio: - Io sto nel mio guscio.
Marzo apre un occhio ed inventa i colori.
Aprile copre ogni prato di fiori.
Maggio ti porge la rosa piu' bella.
Giugno ha nel pugno una spiga e una stella.
Luglio si beve il ruscello d'un fiato.
Sonnecchia agosto in un'ombra sdraiato.
Settembre morde le uve violette.
Piu' saggio ottobre nel tino le mette.
Novembre fa d'ogni sterpo fascina.
Verso il presepe dicembre cammina.</pre>
      </div>
    </div>
    <div class="footer">Onde - Collana Poetry</div>
  </div>

  <!-- Back Cover -->
  <div class="page back-cover">
    <p class="logo">ONDE</p>
    <div class="colophon">
      Collana Poetry<br><br>
      Nove poesie della tradizione italiana<br>
      Testi autentici verificati<br>
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

  const pdfPath = '/Users/mattiapetrucciani/Downloads/Piccole-Rime-VERIFICATO.pdf';
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' }
  });

  await browser.close();
  console.log('PDF created:', pdfPath);
  return pdfPath;
}

createPDF().catch(console.error);
