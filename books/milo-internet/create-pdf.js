const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Image mapping - MILO e il Viaggio dei Messaggi
const basePath = '/Users/mattiapetrucciani/CascadeProjects/Onde/books/milo-internet/images/new';
const images = {
  cover: `${basePath}/milo-cover.jpg`,
  chapter1: `${basePath}/milo-ch01-nonna-call.jpg`,
  chapter2: `${basePath}/milo-ch02-enter-tablet.jpg`,
  chapter3: `${basePath}/milo-ch03-cable-tunnel.jpg`,
  chapter4: `${basePath}/milo-ch04-router.jpg`,
  chapter5: `${basePath}/milo-ch05-datacenter.jpg`,
  chapter6: `${basePath}/milo-ch06-underwater.jpg`,
  chapter7: `${basePath}/milo-ch07-smartphone.jpg`,
  chapter8: `${basePath}/milo-ch08-nonna-receives.jpg`,
  chapter9: `${basePath}/milo-ch09-return-home.jpg`,
  chapter10: `${basePath}/milo-ch10-journey-memory.jpg`,
  chapter11: `${basePath}/milo-ch11-next-day.jpg`,
  chapter12: `${basePath}/milo-ch12-goodnight.jpg`,
  chapter13: `${basePath}/milo-ch13-new-adventure.jpg`,
  logoFRH: '/Users/mattiapetrucciani/CascadeProjects/Onde/books/psalm-23-abundance/images/logo-frh.jpg',
  logoOnde: '/Users/mattiapetrucciani/CascadeProjects/Onde/books/psalm-23-abundance/images/logo-onde.jpg'
};

function imageToBase64(filePath) {
  const data = fs.readFileSync(filePath);
  const ext = path.extname(filePath).slice(1).toLowerCase();
  const mimeType = ext === 'jpg' ? 'jpeg' : ext;
  return `data:image/${mimeType};base64,${data.toString('base64')}`;
}

function createHTML() {
  // Convert all images to base64
  const img = {};
  for (const [key, filePath] of Object.entries(images)) {
    if (fs.existsSync(filePath)) {
      img[key] = imageToBase64(filePath);
      console.log(`Loaded: ${key}`);
    } else {
      console.error(`Missing image: ${filePath}`);
      process.exit(1);
    }
  }

  return `
<!DOCTYPE html>
<html>
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
      background: #fff;
    }
    .page {
      width: 8.5in;
      height: 11in;
      page-break-after: always;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0.5in;
      background: linear-gradient(135deg, #fefefe 0%, #f8f5f0 100%);
      position: relative;
    }
    .page:last-child {
      page-break-after: avoid;
    }

    /* Cover Page */
    .cover-page {
      background: linear-gradient(135deg, #e8f4f8 0%, #fff 50%, #f0e8dc 100%);
      padding: 0;
    }
    .cover-page img {
      max-width: 85%;
      max-height: 65%;
      object-fit: contain;
      border-radius: 12px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.15);
    }
    .cover-page h1 {
      font-size: 42px;
      color: #2c3e50;
      margin-top: 25px;
      letter-spacing: 3px;
    }
    .cover-page .subtitle {
      font-size: 20px;
      color: #e67e22;
      margin-top: 8px;
      font-style: italic;
    }
    .cover-page .author {
      font-size: 13px;
      color: #95a5a6;
      margin-top: 15px;
    }
    .cover-page .logos {
      position: absolute;
      bottom: 25px;
      display: flex;
      gap: 25px;
      align-items: center;
    }
    .cover-page .logos img {
      height: 45px;
      width: auto;
      max-width: none;
      max-height: none;
      opacity: 0.85;
      mix-blend-mode: multiply;
      border-radius: 0;
      box-shadow: none;
    }

    /* Image Pages */
    .image-page {
      padding: 0;
      background: #fff;
    }
    .image-page img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    /* Text Pages */
    .text-page {
      justify-content: flex-start;
      padding: 0.6in 0.75in;
      background: linear-gradient(180deg, #fffdf8 0%, #fff9f0 100%);
    }
    .text-page .chapter-num {
      font-size: 12px;
      color: #e67e22;
      text-transform: uppercase;
      letter-spacing: 3px;
      margin-bottom: 8px;
    }
    .text-page h2 {
      font-size: 26px;
      color: #2c3e50;
      margin-bottom: 25px;
      text-align: center;
      width: 100%;
    }
    .text-page .content {
      font-size: 15px;
      color: #333;
      line-height: 1.85;
      text-align: left;
      max-width: 100%;
    }
    .text-page .content p {
      margin-bottom: 14px;
    }
    .text-page .dialogue {
      margin-left: 15px;
      font-style: italic;
      color: #e67e22;
    }

    /* Dedication Page */
    .dedication-page {
      background: linear-gradient(135deg, #faf8f5 0%, #fff 100%);
    }
    .dedication-page .content {
      text-align: center;
      font-style: italic;
      font-size: 18px;
      color: #666;
      line-height: 2.2;
    }

    /* End Page */
    .end-page {
      background: linear-gradient(135deg, #e8f4f8 0%, #fff 100%);
    }
    .end-page h2 {
      font-size: 42px;
      color: #2c3e50;
    }
    .end-page .message {
      font-size: 16px;
      color: #666;
      font-style: italic;
      margin-top: 20px;
      text-align: center;
      max-width: 80%;
    }
    .end-page .credits {
      margin-top: 35px;
      font-size: 13px;
      color: #7f8c8d;
      text-align: center;
      line-height: 1.9;
    }
    .end-page .logos {
      margin-top: 35px;
      display: flex;
      gap: 35px;
      align-items: center;
      justify-content: center;
    }
    .end-page .logos img {
      height: 60px;
      width: auto;
      opacity: 0.9;
      mix-blend-mode: multiply;
    }
  </style>
</head>
<body>
  <!-- Cover -->
  <div class="page cover-page">
    <img src="${img.cover}" alt="MILO e il Viaggio dei Messaggi">
    <h1>MILO e il Viaggio dei Messaggi</h1>
    <div class="subtitle">Come Funziona Internet</div>
    <div class="author">Scritto da Gianni Parola | Illustrato da Pina Pennello</div>
    <div class="logos">
      <img src="${img.logoOnde}" alt="Onde">
      <img src="${img.logoFRH}" alt="Free River House">
    </div>
  </div>

  <!-- Dedication -->
  <div class="page dedication-page">
    <div class="content">
      <p>A tutti i bambini curiosi</p>
      <p>che si chiedono:</p>
      <p style="font-size: 24px; margin: 20px 0; color: #e67e22;">"Ma come fa ad arrivare?"</p>
      <p>Questo libro e' per voi.</p>
      <p>Perche' la curiosita' e' l'inizio di ogni avventura.</p>
    </div>
  </div>

  <!-- Chapter 1 -->
  <div class="page image-page">
    <img src="${img.chapter1}" alt="Capitolo 1 - Un Messaggio per la Nonna">
  </div>
  <div class="page text-page">
    <div class="chapter-num">Capitolo Uno</div>
    <h2>Un Messaggio per la Nonna</h2>
    <div class="content">
      <p>Moonlight e il suo fratellino Luca erano seduti sul divano del salotto. Il tablet brillava tra le mani di Moonlight.</p>
      <p class="dialogue">"Guardate chi c'e'!" esclamo' MILO, il loro amico robot, indicando lo schermo.</p>
      <p>Sul tablet apparve il viso sorridente della nonna, con i suoi capelli bianchi come la neve.</p>
      <p class="dialogue">"Ciao tesori miei!" disse la nonna dalla videochiamata.</p>
      <p>"Nonna!" gridarono insieme Moonlight e Luca, saltando dalla gioia.</p>
      <p>"Ma nonna," chiese Luca con gli occhi pieni di curiosita', "come fai a vederci? Sei cosi' lontana!"</p>
      <p>MILO fece brillare i suoi occhi LED.</p>
      <p class="dialogue">"Questa e' una domanda fantastica! Volete scoprire come viaggia il vostro messaggio fino alla nonna?"</p>
      <p>"Siii!" risposero i bambini all'unisono.</p>
      <p>E cosi' comincio' la piu' incredibile avventura della loro vita.</p>
    </div>
  </div>

  <!-- Chapter 2 -->
  <div class="page image-page">
    <img src="${img.chapter2}" alt="Capitolo 2 - Entrare nel Tablet">
  </div>
  <div class="page text-page">
    <div class="chapter-num">Capitolo Due</div>
    <h2>Entrare nel Tablet</h2>
    <div class="content">
      <p>MILO si avvicino' al tablet e fece qualcosa di magico.</p>
      <p>Con un lampo di luce, tutti e tre cominciarono a rimpicciolirsi, sempre piu' piccoli, finche' non furono piccoli come formichine.</p>
      <p class="dialogue">"Tenetevi forte!" disse MILO.</p>
      <p>Davanti a loro si apri' un portale fatto di mille colori. Sembrava un arcobaleno che girava su se stesso, pieno di stelline scintillanti.</p>
      <p>"Wow!" esclamo' Moonlight.</p>
      <p>"E' bellissimo!" aggiunse Luca.</p>
      <p>Insieme saltarono dentro al portale colorato e si ritrovarono DENTRO al tablet!</p>
      <p>Era l'inizio del loro viaggio nel mondo di Internet.</p>
    </div>
  </div>

  <!-- Chapter 3 -->
  <div class="page image-page">
    <img src="${img.chapter3}" alt="Capitolo 3 - Il Tunnel dei Cavi">
  </div>
  <div class="page text-page">
    <div class="chapter-num">Capitolo Tre</div>
    <h2>Il Tunnel dei Cavi</h2>
    <div class="content">
      <p>Si ritrovarono in un tunnel enorme, grande come una galleria della metropolitana.</p>
      <p>Ma invece dei treni, c'erano raggi di luce colorata che sfrecciavano velocissimi tutto intorno a loro!</p>
      <p class="dialogue">"Questi sono i dati!" spiego' MILO. "Ogni raggio di luce e' un messaggio, una foto, un video che viaggia verso qualcuno."</p>
      <p>Pacchetti colorati volavano come macchinine in autostrada, ognuno con una direzione precisa.</p>
      <p>"Guarda quello rosa!" disse Luca indicando un pacchetto. "E' un messaggio d'amore che qualcuno sta mandando!"</p>
      <p>"E quello blu e' un video di gattini," aggiunse Moonlight ridendo.</p>
      <p class="dialogue">"Il nostro messaggio per la nonna e' quello dorato laggiù!" disse MILO. "Seguiamolo!"</p>
    </div>
  </div>

  <!-- Chapter 4 -->
  <div class="page image-page">
    <img src="${img.chapter4}" alt="Capitolo 4 - Il Router">
  </div>
  <div class="page text-page">
    <div class="chapter-num">Capitolo Quattro</div>
    <h2>Il Router</h2>
    <div class="content">
      <p>Il tunnel li porto' in un edificio enorme pieno di lucine colorate che lampeggiavano.</p>
      <p class="dialogue">"Benvenuti al Router!" annuncio' MILO.</p>
      <p>Era come una stazione dei treni, ma per i messaggi! Pacchetti di dati arrivavano da tutte le direzioni e il Router li smistava, uno per uno.</p>
      <p class="dialogue">"Il Router e' come un vigile molto intelligente," spiego' MILO. "Guarda ogni messaggio e decide: 'Tu vai a destra! Tu vai a sinistra! Tu vai dritto dritto!'"</p>
      <p>Segnali Wi-Fi ondeggiavano nell'aria come onde del mare.</p>
      <p class="dialogue">"Senza il Router, i messaggi si perderebbero! Ma lui sa sempre dove mandare ogni cosa."</p>
      <p>"Che bravo!" disse Luca battendo le mani.</p>
    </div>
  </div>

  <!-- Chapter 5 -->
  <div class="page image-page">
    <img src="${img.chapter5}" alt="Capitolo 5 - Il Data Center">
  </div>
  <div class="page text-page">
    <div class="chapter-num">Capitolo Cinque</div>
    <h2>Il Data Center</h2>
    <div class="content">
      <p>Il loro viaggio continuo' e arrivarono in un posto ancora piu' grande.</p>
      <p>Torri altissime di computer si alzavano fino al soffitto, con migliaia di lucine blu che brillavano come stelle.</p>
      <p class="dialogue">"Questo e' un Data Center," disse MILO con voce piena di meraviglia. "E' come una biblioteca gigante, ma invece di libri, conserva tutti i messaggi, le foto e i video del mondo!"</p>
      <p>"Tutti tutti?" chiese Moonlight.</p>
      <p class="dialogue">"Tutti tutti! I tuoi disegni salvati, le foto delle vacanze, i messaggi per la nonna... tutto viene custodito qui, al sicuro."</p>
      <p>I server ronzavano piano, come se stessero dormendo ma sognando miliardi di ricordi.</p>
      <p>"E' come un guardiano dei ricordi," disse Luca.</p>
      <p class="dialogue">"Esatto! E il nostro messaggio sta passando proprio di qui."</p>
    </div>
  </div>

  <!-- Chapter 6 -->
  <div class="page image-page">
    <img src="${img.chapter6}" alt="Capitolo 6 - I Cavi Sottomarini">
  </div>
  <div class="page text-page">
    <div class="chapter-num">Capitolo Sei</div>
    <h2>I Cavi Sottomarini</h2>
    <div class="content">
      <p class="dialogue">"Ora viene la parte piu' emozionante!" disse MILO.</p>
      <p>All'improvviso si ritrovarono sott'acqua, nell'oceano profondo!</p>
      <p>Ma non erano bagnati - erano dentro a un cavo speciale che correva sul fondo del mare.</p>
      <p>Pesci colorati nuotavano accanto a loro, curiosi di vedere quei visitatori strani. Meduse luminose brillavano nel blu.</p>
      <p class="dialogue">"I cavi sottomarini collegano tutti i continenti!" spiego' MILO. "Il tuo messaggio per la nonna sta attraversando l'oceano in questo momento!"</p>
      <p>"Stiamo volando sotto il mare!" rise Moonlight.</p>
      <p>Fili di luce danzavano intorno a loro come nastri magici, portando messaggi da una parte all'altra del mondo.</p>
      <p class="dialogue">"Internet e' come un grande abbraccio che avvolge tutta la Terra," disse MILO.</p>
    </div>
  </div>

  <!-- Chapter 7 -->
  <div class="page image-page">
    <img src="${img.chapter7}" alt="Capitolo 7 - Arrivo allo Smartphone">
  </div>
  <div class="page text-page">
    <div class="chapter-num">Capitolo Sette</div>
    <h2>Arrivo allo Smartphone</h2>
    <div class="content">
      <p>Finalmente emersero dall'oceano e videro qualcosa di incredibile.</p>
      <p>Un edificio enorme a forma di smartphone si alzava davanti a loro! Aveva antenne colorate sul tetto e un grande simbolo Wi-Fi che brillava come un sole.</p>
      <p class="dialogue">"Siamo arrivati!" annuncio' MILO. "Questo e' lo smartphone della nonna!"</p>
      <p>Segnali wireless ondeggiavano nell'aria, chiamando i messaggi verso di se'.</p>
      <p>"Il nostro messaggio sta per entrare!" disse Moonlight emozionata.</p>
      <p class="dialogue">"Venite, entriamo anche noi!"</p>
      <p>Le porte dell'edificio-smartphone si aprirono e una luce calda li accolse. Il viaggio stava per finire, ma l'emozione piu' grande doveva ancora arrivare.</p>
    </div>
  </div>

  <!-- Chapter 8 -->
  <div class="page image-page">
    <img src="${img.chapter8}" alt="Capitolo 8 - La Nonna Riceve">
  </div>
  <div class="page text-page">
    <div class="chapter-num">Capitolo Otto</div>
    <h2>La Nonna Riceve</h2>
    <div class="content">
      <p>Dentro lo smartphone della nonna, videro qualcosa di meraviglioso.</p>
      <p>Dall'altra parte dello schermo c'era il viso della nonna, grande e sorridente!</p>
      <p>"Eccola!" grido' Luca.</p>
      <p>La nonna sembrava felicissima. Sul suo schermo era appena arrivato il loro messaggio video, con i volti sorridenti di Moonlight e Luca che la salutavano.</p>
      <p>Cuoricini e stelline volavano tutto intorno, come se l'amore potesse diventare visibile.</p>
      <p>"Il nostro messaggio ce l'ha fatta!" disse Moonlight con le lacrime agli occhi dalla gioia.</p>
      <p class="dialogue">"Tutto quel viaggio incredibile," disse MILO, "e' successo in meno di un secondo nel mondo reale!"</p>
      <p>"Un secondo?!" esclamarono i bambini.</p>
      <p class="dialogue">"Si'! Internet e' cosi' veloce che sembra magia. Ma ora sapete che non e' magia... e' tecnologia fatta con amore!"</p>
    </div>
  </div>

  <!-- Chapter 9 -->
  <div class="page image-page">
    <img src="${img.chapter9}" alt="Capitolo 9 - Ritorno a Casa">
  </div>
  <div class="page text-page">
    <div class="chapter-num">Capitolo Nove</div>
    <h2>Ritorno a Casa</h2>
    <div class="content">
      <p>Era ora di tornare.</p>
      <p>MILO li guido' attraverso il portale colorato, in senso inverso.</p>
      <p>In un lampo di luce, si ritrovarono di nuovo nel salotto, a grandezza normale, seduti davanti al tablet.</p>
      <p>Sullo schermo, la nonna stava ancora sorridendo e salutando.</p>
      <p class="dialogue">"Vi voglio bene, tesori miei!" disse la nonna.</p>
      <p>"Anche noi nonna!" risposero Moonlight e Luca.</p>
      <p>Quando la videochiamata fini', i bambini si guardarono.</p>
      <p>"E' successo davvero?" chiese Luca.</p>
      <p>MILO fece l'occhiolino con i suoi LED.</p>
      <p class="dialogue">"Ogni volta che mandate un messaggio, ricordate il viaggio che fa per arrivare a destinazione!"</p>
    </div>
  </div>

  <!-- Chapter 10 -->
  <div class="page image-page">
    <img src="${img.chapter10}" alt="Capitolo 10 - Il Ricordo del Viaggio">
  </div>
  <div class="page text-page">
    <div class="chapter-num">Capitolo Dieci</div>
    <h2>Il Ricordo del Viaggio</h2>
    <div class="content">
      <p>Quella sera, MILO mostro' ai bambini una mappa olografica del loro viaggio.</p>
      <p>La luce blu proiettava sul muro tutto il percorso: il tablet, i tunnel dei cavi, il router, il data center, l'oceano, e infine lo smartphone della nonna.</p>
      <p>Moonlight e Luca disegnavano su dei fogli, cercando di ricordare ogni dettaglio dell'avventura.</p>
      <p>"Questo e' il Router!" disse Luca mostrando il suo disegno.</p>
      <p>"E questo e' l'oceano con i pesci!" aggiunse Moonlight.</p>
      <p>Sulla parete dietro di loro c'erano gia' altri disegni appesi: server, cavi, antenne. Un vero museo del loro viaggio!</p>
      <p>"Non dimenticheremo mai questa avventura," disse Moonlight.</p>
      <p class="dialogue">"E ora sapete un segreto che pochi conoscono," disse MILO. "Sapete come i messaggi viaggiano intorno al mondo!"</p>
    </div>
  </div>

  <!-- Chapter 11 -->
  <div class="page image-page">
    <img src="${img.chapter11}" alt="Capitolo 11 - Il Giorno Dopo">
  </div>
  <div class="page text-page">
    <div class="chapter-num">Capitolo Undici</div>
    <h2>Il Giorno Dopo</h2>
    <div class="content">
      <p>La mattina dopo, i primi raggi di sole entrarono dalla finestra della cameretta.</p>
      <p>Moonlight e Luca si svegliarono pieni di energia.</p>
      <p>"MILO! MILO!" chiamarono.</p>
      <p>Il robot entro' nella stanza, con qualcosa di speciale nella mano.</p>
      <p class="dialogue">"Guardate cosa ho trovato nel mio sistema," disse MILO.</p>
      <p>Era un piccolo pacchetto di luce dorata, un ricordo del loro viaggio!</p>
      <p>"E' un pezzo del nostro messaggio!" esclamo' Moonlight.</p>
      <p class="dialogue">"Lo conservero' per sempre," disse MILO. "Come ricordo del giorno in cui avete scoperto i segreti di Internet."</p>
      <p>I bambini lo abbracciarono forte.</p>
      <p>Era stato il viaggio piu' bello della loro vita.</p>
    </div>
  </div>

  <!-- Chapter 12 -->
  <div class="page image-page">
    <img src="${img.chapter12}" alt="Capitolo 12 - Buonanotte">
  </div>
  <div class="page text-page">
    <div class="chapter-num">Capitolo Dodici</div>
    <h2>Buonanotte</h2>
    <div class="content">
      <p>Quella sera, MILO entro' nella cameretta per dare la buonanotte.</p>
      <p>Moonlight e Luca erano gia' sotto le coperte, ma i loro occhi brillavano ancora.</p>
      <p>Dalla finestra si vedeva il cielo stellato.</p>
      <p>"MILO," chiese Luca, "i messaggi viaggiano anche di notte?"</p>
      <p class="dialogue">"Sempre," rispose MILO dolcemente. "Anche adesso, mentre voi dormite, miliardi di messaggi stanno volando intorno al mondo. Auguri di compleanno, foto di gattini, videochiamate con le nonne..."</p>
      <p>"E' bello pensarci," sussurro' Moonlight.</p>
      <p>MILO abasso' le luci e i suoi occhi LED divennero una morbida luce notturna.</p>
      <p class="dialogue">"Buonanotte, piccoli esploratori," disse. "Sognate tunnel di luce e oceani di dati."</p>
      <p>"Buonanotte MILO," dissero i bambini.</p>
      <p>E si addormentarono con un sorriso, sognando il loro prossimo viaggio.</p>
    </div>
  </div>

  <!-- Chapter 13 -->
  <div class="page image-page">
    <img src="${img.chapter13}" alt="Capitolo 13 - Una Nuova Avventura?">
  </div>
  <div class="page text-page">
    <div class="chapter-num">Capitolo Tredici</div>
    <h2>Una Nuova Avventura?</h2>
    <div class="content">
      <p>Il sole del nuovo giorno illuminava il salotto.</p>
      <p>Moonlight e Luca corsero da MILO con gli occhi pieni di entusiasmo.</p>
      <p>"MILO! MILO! Dove andiamo oggi?"</p>
      <p>Il robot li guardo' e i suoi occhi LED formarono prima un punto interrogativo... poi una lampadina!</p>
      <p class="dialogue">"Hmm..." disse MILO. "Vi piacerebbe scoprire come funzionano i videogiochi? O come fanno i robot a pensare?"</p>
      <p>"Siii!" gridarono i bambini.</p>
      <p>MILO sorrise.</p>
      <p class="dialogue">"Allora preparatevi. Il mondo della tecnologia e' pieno di avventure incredibili, e noi le scopriremo tutte insieme!"</p>
      <p>Moonlight e Luca si guardarono felici.</p>
      <p>Con MILO al loro fianco, ogni giorno poteva diventare un'avventura straordinaria.</p>
      <p style="margin-top: 20px; text-align: center; font-style: italic; color: #e67e22;">E voi? Siete pronti per la prossima?</p>
    </div>
  </div>

  <!-- The End -->
  <div class="page end-page">
    <h2>Fine</h2>
    <div class="message">
      <p>Internet e' un posto magico dove i messaggi</p>
      <p>viaggiano alla velocita' della luce.</p>
      <p style="margin-top: 15px;">Ora lo sai anche tu!</p>
    </div>
    <div class="credits">
      <p>Scritto da Gianni Parola</p>
      <p>Illustrato da Pina Pennello</p>
      <p style="margin-top: 15px;">Pubblicato da Onde, Free River House</p>
      <p>Prima Edizione - 2026</p>
      <p style="margin-top: 20px; font-style: italic; color: #95a5a6;">Immagini generate con @grok</p>
    </div>
    <div class="logos">
      <img src="${img.logoOnde}" alt="Onde">
      <img src="${img.logoFRH}" alt="Free River House">
    </div>
  </div>

</body>
</html>
`;
}

async function createPDF() {
  console.log('Creating MILO e il Viaggio dei Messaggi...\n');

  const html = createHTML();
  const outputDir = path.join(__dirname, 'output');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const htmlPath = path.join(outputDir, 'MILO-Viaggio-Messaggi.html');
  const pdfPath = path.join(outputDir, 'MILO-Viaggio-Messaggi.pdf');

  fs.writeFileSync(htmlPath, html);
  console.log('HTML created:', htmlPath);

  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('img');
  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log('Generating PDF...');
  await page.pdf({
    path: pdfPath,
    format: 'Letter',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  await browser.close();

  console.log('\n========================================');
  console.log('PDF created successfully!');
  console.log('File:', pdfPath);
  console.log('========================================\n');

  return pdfPath;
}

createPDF().catch(console.error);
