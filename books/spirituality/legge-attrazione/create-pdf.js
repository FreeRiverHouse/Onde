const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function createPDF() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Load images as base64
  const imagesDir = path.join(__dirname, 'images');
  const loadImage = (name) => {
    const filePath = path.join(imagesDir, name);
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath).toString('base64');
    }
    return '';
  };

  const copertina = loadImage('copertina.jpg');
  // Cap 1-7: new consistent images with Leo character
  const cap1 = loadImage('cap1-leo-finestra.jpg');
  const cap2 = loadImage('cap2-leo-mamma.jpg');
  const cap3 = loadImage('cap3-leo-sogna.jpg');
  const cap4 = loadImage('cap4-leo-prato.jpg');
  const cap5 = loadImage('cap5-leo-quaderno.jpg');
  const cap6 = loadImage('cap6-papa-scatola.jpg');
  const cap7 = loadImage('cap7-leo-cagnolino.jpg');
  // Cap 8-10: existing images (don't require Leo consistency)
  const cap8 = loadImage('cap8-segreto-condiviso.jpg');
  const cap9 = loadImage('cap9-il-tuo-turno.jpg');
  const cap10 = loadImage('cap10-promessa-stelle.jpg');
  // Logos
  const logoOnde = loadImage('logo-onde.jpg');
  const logoFRH = loadImage('logo-frh.jpg');

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
      background: #fdfbf7;
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

    /* Cover Page */
    .cover {
      text-align: center;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #f8f4eb 0%, #e8ddd0 100%);
      padding: 0;
    }

    .cover img {
      max-width: 100%;
      max-height: 80vh;
      border-radius: 8px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
    }

    .cover h1 {
      font-family: 'Playfair Display', serif;
      font-size: 32px;
      color: #5c4a32;
      margin-top: 20px;
      letter-spacing: 2px;
    }

    .cover .subtitle {
      font-size: 18px;
      font-style: italic;
      color: #8b7355;
      margin-top: 8px;
    }

    .cover .author {
      font-size: 14px;
      color: #6b5b47;
      margin-top: 15px;
    }

    /* Title Page */
    .title-page {
      justify-content: center;
      align-items: center;
      text-align: center;
      background: #fdfbf7;
    }

    .title-page h1 {
      font-family: 'Playfair Display', serif;
      font-size: 36px;
      color: #5c4a32;
      margin-bottom: 15px;
    }

    .title-page .subtitle {
      font-size: 20px;
      font-style: italic;
      color: #8b7355;
      margin-bottom: 40px;
    }

    .title-page .publisher {
      font-size: 14px;
      color: #8b7355;
      margin-top: 60px;
      letter-spacing: 3px;
      text-transform: uppercase;
    }

    /* Chapter Pages */
    .chapter {
      padding: 30px 40px;
    }

    .chapter-title {
      font-family: 'Playfair Display', serif;
      font-size: 24px;
      color: #5c4a32;
      text-align: center;
      margin-bottom: 25px;
      padding-bottom: 15px;
      border-bottom: 2px solid #d4c4a8;
    }

    .chapter-image {
      text-align: center;
      margin-bottom: 25px;
    }

    .chapter-image img {
      max-width: 85%;
      max-height: 45vh;
      border-radius: 6px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    }

    .chapter-text {
      font-size: 16px;
      line-height: 1.8;
      text-align: justify;
      color: #4a4a4a;
    }

    .chapter-text p {
      margin-bottom: 12px;
      text-indent: 20px;
    }

    .chapter-text p:first-child {
      text-indent: 0;
    }

    /* Dedication */
    .dedication {
      justify-content: center;
      align-items: center;
      text-align: center;
    }

    .dedication p {
      font-style: italic;
      font-size: 18px;
      color: #8b7355;
      line-height: 1.8;
    }

    /* End Page */
    .end-page {
      justify-content: center;
      align-items: center;
      text-align: center;
    }

    .end-page .fine {
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      color: #5c4a32;
      font-style: italic;
    }

    /* Credits Page */
    .credits-page {
      justify-content: center;
      align-items: center;
      text-align: center;
      background: #fdfbf7;
    }

    .credits-content {
      max-width: 500px;
    }

    .credits-page .logos {
      display: flex;
      justify-content: center;
      gap: 40px;
      margin-bottom: 30px;
    }

    .credits-page .logo {
      height: 60px;
      width: auto;
    }

    .credits-page h2 {
      font-family: 'Playfair Display', serif;
      font-size: 22px;
      color: #5c4a32;
      margin-bottom: 5px;
    }

    .credits-page .subtitle-credit {
      font-style: italic;
      font-size: 14px;
      color: #8b7355;
      margin-bottom: 30px;
    }

    .credits-section {
      margin-bottom: 20px;
    }

    .credits-section p {
      font-size: 13px;
      color: #5c4a32;
      line-height: 1.6;
      margin-bottom: 4px;
    }

    .credits-page .copyright {
      font-size: 12px;
      color: #8b7355;
    }

    .credits-page .small {
      font-size: 10px;
      color: #999;
      max-width: 400px;
      margin: 0 auto;
    }

    .credits-page .ai-note {
      font-size: 10px;
      font-style: italic;
      color: #aaa;
      margin-top: 20px;
    }
  </style>
</head>
<body>

  <!-- Cover -->
  <div class="page cover">
    <img src="data:image/jpeg;base64,${copertina}" alt="Copertina">
    <h1>Il Potere dei Desideri</h1>
    <div class="subtitle">Un libro per piccoli sognatori</div>
    <div class="author">Onde Edizioni</div>
  </div>

  <!-- Title Page -->
  <div class="page title-page">
    <h1>Il Potere dei Desideri</h1>
    <div class="subtitle">Un libro per piccoli sognatori</div>
    <div class="publisher">Onde Edizioni</div>
  </div>

  <!-- Chapter 1 -->
  <div class="page chapter">
    <h2 class="chapter-title">Capitolo 1: Il Bambino che Sognava</h2>
    <div class="chapter-image">
      <img src="data:image/jpeg;base64,${cap1}" alt="Leo alla finestra">
    </div>
    <div class="chapter-text">
      <p>Leo aveva sei anni, capelli castani e un cuore pieno di sogni.</p>
      <p>Ogni sera, quando il cielo diventava blu scuro e le stelle iniziavano a brillare, si sedeva alla finestra e pensava.</p>
      <p>"Mamma," disse una sera, mentre la luna faceva capolino dietro le nuvole, "come si fa a far avverare i desideri?"</p>
      <p>La mamma entrò con passo leggero, si sedette accanto a lui e gli accarezzò i capelli.</p>
      <p>"Vuoi che ti racconti un segreto?"</p>
    </div>
  </div>

  <!-- Chapter 2 -->
  <div class="page chapter">
    <h2 class="chapter-title">Capitolo 2: Il Segreto dei Pensieri</h2>
    <div class="chapter-image">
      <img src="data:image/jpeg;base64,${cap2}" alt="Mamma e Leo">
    </div>
    <div class="chapter-text">
      <p>"I tuoi pensieri," disse la mamma piano, "sono come piccoli semi."</p>
      <p>"Semi?" Leo inclinò la testa.</p>
      <p>"Sì. Ogni pensiero è un semino. Se pensi cose belle, cresceranno fiori colorati. Se pensi cose tristi, cresceranno erbacce."</p>
      <p>Leo guardò le sue mani, girandole piano.</p>
      <p>"Allora devo pensare cose belle?"</p>
      <p>"Esatto. Ma non basta pensarle." La mamma gli prese le mani e le portò al petto. "Devi sentirle qui. Il cuore è il giardino dove i semi crescono davvero."</p>
    </div>
  </div>

  <!-- Chapter 3 -->
  <div class="page chapter">
    <h2 class="chapter-title">Capitolo 3: Il Gioco dei Desideri</h2>
    <div class="chapter-image">
      <img src="data:image/jpeg;base64,${cap3}" alt="Leo che sogna">
    </div>
    <div class="chapter-text">
      <p>La mamma gli insegnò un gioco speciale.</p>
      <p>"Chiudi gli occhi. Respira piano. Pensa a qualcosa che desideri tanto."</p>
      <p>Leo chiuse gli occhi.</p>
      <p>"Ci sei?" sussurrò la mamma.</p>
      <p>"Sì! Vedo un cagnolino!"</p>
      <p>"Ora toccalo. Com'è il suo pelo?"</p>
      <p>"Morbidissimo!"</p>
      <p>"Senti il suo cuoricino che batte? Ti lecca la mano?"</p>
      <p>"Sì!" Leo rise. "Mi fa il solletico!"</p>
      <p>"E come ti senti?"</p>
      <p>"Felice! Tanto felice!"</p>
      <p>Quando aprì gli occhi, il suo sorriso illuminava la stanza.</p>
    </div>
  </div>

  <!-- Chapter 4 -->
  <div class="page chapter">
    <h2 class="chapter-title">Capitolo 4: La Parola Magica</h2>
    <div class="chapter-image">
      <img src="data:image/jpeg;base64,${cap4}" alt="Leo nel prato">
    </div>
    <div class="chapter-text">
      <p>"C'è una parola magica," disse la mamma il giorno dopo. "Una parola che funziona come una chiave."</p>
      <p>"Per favore?"</p>
      <p>"Quella è gentile. Ma ce n'è una più potente."</p>
      <p>La mamma si chinò verso di lui.</p>
      <p>"Grazie."</p>
      <p>"Grazie?"</p>
      <p>"Quando dici grazie per le cose belle che hai già, il cuore si apre. E quando è aperto, possono entrare altre cose belle."</p>
      <p>Da quel giorno, Leo iniziò a dire grazie per tutto.</p>
      <p>Grazie per il sole. Grazie per la colazione. Grazie per i baci della mamma. Grazie per essere Leo.</p>
    </div>
  </div>

  <!-- Chapter 5 -->
  <div class="page chapter">
    <h2 class="chapter-title">Capitolo 5: Il Quaderno dei Sogni</h2>
    <div class="chapter-image">
      <img src="data:image/jpeg;base64,${cap5}" alt="Leo con il quaderno">
    </div>
    <div class="chapter-text">
      <p>Per il suo compleanno, la mamma gli regalò un quaderno speciale: copertina blu notte, piena di stelline dorate.</p>
      <p>"Questo è il tuo Quaderno dei Sogni. Ogni giorno, disegna qualcosa di bello che desideri."</p>
      <p>Leo lo strinse al petto.</p>
      <p>Nei giorni seguenti lo riempì di disegni: un cagnolino con orecchie flosce, una casa sull'albero, un viaggio al mare.</p>
      <p>Ogni sera lo sfogliava sorridendo.</p>
      <p>Non sapeva ancora che quei disegni erano mappe. Mappe per luoghi che avrebbe visitato davvero.</p>
    </div>
  </div>

  <!-- Chapter 6 -->
  <div class="page chapter">
    <h2 class="chapter-title">Capitolo 6: Il Giorno Speciale</h2>
    <div class="chapter-image">
      <img src="data:image/jpeg;base64,${cap6}" alt="Papà con la scatola">
    </div>
    <div class="chapter-text">
      <p>Passarono settimane. Poi mesi.</p>
      <p>Leo continuava a pensare al cagnolino, a sentire il suo pelo morbido, a dire grazie.</p>
      <p>Un pomeriggio d'autunno, il papà tornò con una scatola.</p>
      <p>Una scatola che si muoveva.</p>
      <p>"Leo, vieni qui."</p>
      <p>Il cuore gli batteva forte. Si avvicinò piano.</p>
      <p>Il papà aprì.</p>
      <p>Due occhietti marroni, lucidi come castagne, lo guardarono. Una codina iniziò a scodinzolare.</p>
      <p>"Il mio desiderio!" Leo prese il cucciolo tra le braccia. "Si è avverato!"</p>
    </div>
  </div>

  <!-- Chapter 7 -->
  <div class="page chapter">
    <h2 class="chapter-title">Capitolo 7: Come Funziona</h2>
    <div class="chapter-image">
      <img src="data:image/jpeg;base64,${cap7}" alt="Leo e Stella al parco">
    </div>
    <div class="chapter-text">
      <p>Leo chiamò il cucciolo Stella.</p>
      <p>Una domenica al parco chiese: "Mamma, come ha fatto il desiderio a diventare vero?"</p>
      <p>La mamma guardò le nuvole.</p>
      <p>"Quando desideri con tutto il cuore, il cuore manda un segnale. Come una luce. Il mondo ascolta, a modo suo."</p>
      <p>"Posso desiderare tutto?"</p>
      <p>"Tutto quello che ti fa sentire felice e buono. Sai quali sono i desideri più belli?"</p>
      <p>"Quali?"</p>
      <p>"Quelli che rendono felici anche gli altri."</p>
    </div>
  </div>

  <!-- Chapter 8 -->
  <div class="page chapter">
    <h2 class="chapter-title">Capitolo 8: Il Segreto Condiviso</h2>
    <div class="chapter-image">
      <img src="data:image/jpeg;base64,${cap8}" alt="Leo con un amico">
    </div>
    <div class="chapter-text">
      <p>Leo cresceva, e il segreto funzionava sempre.</p>
      <p>Non tutti i desideri arrivavano subito. Alcuni ci mettevano tempo. Altri arrivavano in modi inaspettati, sempre perfetti.</p>
      <p>E capì una cosa importante: la magia più grande era condividerla.</p>
      <p>Così iniziò a raccontare il segreto. Al suo amico Tommaso. A sua cugina Sofia. A bambini che sembravano tristi.</p>
      <p>"Chiudi gli occhi. Pensa a qualcosa di bello. Sentilo nel cuore. Di' grazie."</p>
    </div>
  </div>

  <!-- Chapter 9 -->
  <div class="page chapter">
    <h2 class="chapter-title">Capitolo 9: Il Tuo Turno</h2>
    <div class="chapter-image">
      <img src="data:image/jpeg;base64,${cap9}" alt="Un bambino alla finestra">
    </div>
    <div class="chapter-text">
      <p>E adesso tocca a te.</p>
      <p>Chiudi gli occhi.</p>
      <p>Respira piano.</p>
      <p>Pensa a qualcosa di bello. Non solo guardarlo: toccalo, sentilo.</p>
      <p>Come ti fa sentire?</p>
      <p>Di' grazie. Grazie perché il tuo cuore sa sognare.</p>
      <p>Poi aspetta. Con pazienza. Con fiducia.</p>
      <p>I desideri più belli nascono dal cuore.</p>
      <p>E il cuore conosce sempre la strada.</p>
    </div>
  </div>

  <!-- Chapter 10 -->
  <div class="page chapter">
    <h2 class="chapter-title">Capitolo 10: La Promessa delle Stelle</h2>
    <div class="chapter-image">
      <img src="data:image/jpeg;base64,${cap10}" alt="Cielo stellato">
    </div>
    <div class="chapter-text">
      <p>Leo adesso ha dieci anni.</p>
      <p>Stella dorme ai piedi del suo letto.</p>
      <p>Ma ogni sera, prima di chiudere gli occhi, guarda ancora le stelle.</p>
      <p>Non sono più solo luci lontane.</p>
      <p>Sono promesse.</p>
      <p>Promesse che i sogni, quelli veri, quelli sentiti col cuore...</p>
      <p>...possono diventare realtà.</p>
      <p>Basta crederci.</p>
      <p>Con tutto il cuore.</p>
    </div>
  </div>

  <!-- Dedication -->
  <div class="page dedication">
    <p>A tutti i bambini che non smettono mai di sognare.</p>
    <p>E agli adulti che hanno dimenticato come si fa.</p>
  </div>

  <!-- End -->
  <div class="page end-page">
    <div class="fine">Fine</div>
  </div>

  <!-- Credits -->
  <div class="page credits-page">
    <div class="credits-content">
      <div class="logos">
        <img src="data:image/jpeg;base64,\${logoOnde}" alt="Onde Edizioni" class="logo">
        <img src="data:image/jpeg;base64,\${logoFRH}" alt="Free River House" class="logo">
      </div>
      <h2>Il Potere dei Desideri</h2>
      <p class="subtitle-credit">Un libro per piccoli sognatori</p>

      <div class="credits-section">
        <p><strong>Testo:</strong> Gianni Parola per Onde Edizioni</p>
        <p><strong>Illustrazioni:</strong> Generate con Grok AI</p>
        <p><strong>Design:</strong> Claude AI</p>
      </div>

      <div class="credits-section">
        <p class="copyright">© 2026 Onde Edizioni</p>
        <p class="copyright">Una divisione di Free River House</p>
      </div>

      <div class="credits-section">
        <p class="small">Tutti i diritti riservati. Nessuna parte di questo libro può essere riprodotta senza il permesso scritto dell'editore.</p>
      </div>

      <div class="credits-section">
        <p class="ai-note">Questo libro è stato creato con l'assistenza di intelligenza artificiale per testo e illustrazioni, con supervisione umana.</p>
      </div>
    </div>
  </div>

</body>
</html>
`;

  await page.setContent(html, { waitUntil: 'networkidle0' });

  // Create output directory
  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  // Generate PDF
  const outputPath = path.join(outputDir, 'Il-Potere-dei-Desideri.pdf');
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: { top: 0, bottom: 0, left: 0, right: 0 }
  });

  console.log(`PDF created: ${outputPath}`);
  await browser.close();
}

createPDF().catch(console.error);
