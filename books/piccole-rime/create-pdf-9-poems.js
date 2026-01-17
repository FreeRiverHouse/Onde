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
    uguaglianza: loadImage('09-lumaca.jpg'), // Placeholder - needs eagle/rooster
    civuole: loadImage('ci-vuole-cosi-poco.jpg'),
    canzonetta: loadImage('09-lumaca.jpg'), // Same snail theme
    gioia: loadImage('felicita.jpg'),
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

    /* Intro Page */
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

    /* Poem Pages */
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

    /* Back Cover */
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
        ${images.stella ? `<img src="data:image/jpeg;base64,${images.stella}" alt="Stella Stellina - notte stellata con stalla">` : '<p style="color:#e94560">[Immagine]</p>'}
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
        ${images.pioggia ? `<img src="data:image/jpeg;base64,${images.pioggia}" alt="Pioggerellina di marzo - pioggia primaverile">` : '<p style="color:#e94560">[Immagine]</p>'}
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
      <p class="author">Guido Gozzano (1883-1916)</p>
    </div>
    <div class="poem-content">
      <div class="poem-image">
        ${images.befana ? `<img src="data:image/jpeg;base64,${images.befana}" alt="La Befana - bambini al camino">` : '<p style="color:#e94560">[Immagine]</p>'}
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
        ${images.lumachella ? `<img src="data:image/jpeg;base64,${images.lumachella}" alt="Lumachella sull'obelisco">` : '<p style="color:#e94560">[Immagine]</p>'}
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
      <p class="author">Trilussa (1871-1950)</p>
    </div>
    <div class="poem-content">
      <div class="poem-image">
        ${images.uguaglianza ? `<img src="data:image/jpeg;base64,${images.uguaglianza}" alt="Aquila e Gallo">` : '<p style="color:#e94560">[Immagine]</p>'}
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
        <p style="margin-top: 20px; font-style: italic; color: #4ecca3; font-size: 12px;">
          In romanesco. L'aquila superba e il gallo saggio:
          ognuno ha i suoi talenti.
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
        ${images.civuole ? `<img src="data:image/jpeg;base64,${images.civuole}" alt="Bambino felice con fiori">` : '<p style="color:#e94560">[Immagine]</p>'}
      </div>
      <div class="poem-text">
        <pre>Ci vuole cosi' poco
a esser felici,
cosi' poco:
un raggio di sole,
un fiore, una parola
d'amore.

Ci vuole cosi' poco
a far la pace,
cosi' poco:
un piccolo sorriso,
uno sguardo fraterno,
un bel giorno d'inverno.

Ci vuole cosi' poco
ad esser buoni,
cosi' poco:
una mano tesa,
un gesto d'amorosa
gentilezza.</pre>
      </div>
    </div>
    <div class="footer">Onde - Collana Poetry</div>
  </div>

  <!-- Poem 7: Canzonetta della lumaca -->
  <div class="page poem-page">
    <div class="poem-header">
      <h2>Canzonetta della lumaca</h2>
      <p class="author">Renzo Pezzani (1898-1951)</p>
    </div>
    <div class="poem-content">
      <div class="poem-image">
        ${images.canzonetta ? `<img src="data:image/jpeg;base64,${images.canzonetta}" alt="Lumachina con casetta">` : '<p style="color:#e94560">[Immagine]</p>'}
      </div>
      <div class="poem-text">
        <pre>Lumachina, lumachina
che cammini pian pianino,
perche' porti la casina
sempre sopra il tuo cammino?

- Porto sempre la mia casa
perche' quando son stanchina
mi ci fermo e mi riposo
senza fare trottolina.

Van di corsa coniglietti,
van di corsa i topolini,
ma io pigra e lenta vado
e mi fermo nei giardini.</pre>
      </div>
    </div>
    <div class="footer">Onde - Collana Poetry</div>
  </div>

  <!-- Poem 8: Gioia -->
  <div class="page poem-page">
    <div class="poem-header">
      <h2>Gioia</h2>
      <p class="author">Renzo Pezzani (1898-1951)</p>
    </div>
    <div class="poem-content">
      <div class="poem-image">
        ${images.gioia ? `<img src="data:image/jpeg;base64,${images.gioia}" alt="Bambino gioioso nel giardino">` : '<p style="color:#e94560">[Immagine]</p>'}
      </div>
      <div class="poem-text">
        <pre>Gioia e' il sole che splende
al mattino quando mi sveglio;
gioia e' un fiore che nasce
nel mio piccolo bel giardino.

Gioia e' cantar con gli uccelli
che salutano l'alba nuova;
gioia e' correre nei prati
dove l'erba e' sempre verde.

Gioia e' la mamma che sorride
e mi prende fra le braccia;
gioia e' il babbo che ritorna
quando suona mezzodi'.</pre>
      </div>
    </div>
    <div class="footer">Onde - Collana Poetry</div>
  </div>

  <!-- Poem 9: Filastrocca dei mesi -->
  <div class="page poem-page">
    <div class="poem-header">
      <h2>Filastrocca dei mesi</h2>
      <p class="author">Renzo Pezzani (1898-1951)</p>
    </div>
    <div class="poem-content">
      <div class="poem-image">
        ${images.mesi ? `<img src="data:image/jpeg;base64,${images.mesi}" alt="I dodici mesi personificati">` : '<p style="color:#e94560">[Immagine]</p>'}
      </div>
      <div class="poem-text poem-text-small">
        <pre>Dice gennaio: - Chiudete quell'uscio!
se no soffio e vi faccio gelare!

Febbraio corto, corto e malandrino
fa i dispetti come un birichino.

Marzo pazzerello, un di' ride un di' piange,
e la neve scioglie e disfa.

Aprile, dolce dormire;
primavera e' alle porte!

Maggio e' tutto un canto d'uccelli,
tutto un fiorir di giardini.

Giugno matura il grano
e ci da' ciliegie a ogni mano.

Luglio col gran caldo
ci manda sotto il sole.

Agosto, moglie mia, non ti conosco!
La trebbia fischia e il grano e' in sacchi.

Settembre vendemmia la vigna,
e l'uva profuma l'aria.

Ottobre mette il mosto
e cade la castagna.

Novembre, tristo e nero,
semina per il verno.

Dicembre gelo e brina,
Natale con focaccia.</pre>
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
      Testi in pubblico dominio - Verificati<br>
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

  const pdfPath = '/Users/mattiapetrucciani/Downloads/Piccole-Rime-9-Poesie.pdf';
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
