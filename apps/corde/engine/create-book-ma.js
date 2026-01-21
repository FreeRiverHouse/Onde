const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Paths to HQ images
const IMAGES_DIR = '/Volumes/DATI-SSD/onde-ai/corde/outputs/marco-aurelio-bambini/20260120_123208_maximum';
const OUTPUT_DIR = '/Volumes/DATI-SSD/onde-ai/corde/outputs/marco-aurelio-bambini/libro-finale';

const images = {
  cover: `${IMAGES_DIR}/15-copertina.png`,
  chapter1: `${IMAGES_DIR}/05-capitolo-1---chi-era-marco-aurelio.png`,
  chapter2: `${IMAGES_DIR}/06-capitolo-2---il-mattino-dellimperatore.png`,
  chapter3: `${IMAGES_DIR}/07-capitolo-3---le-cose-che-possiamo-scegliere.png`,
  chapter4: `${IMAGES_DIR}/08-capitolo-4---essere-gentili-sempre.png`,
  chapter5: `${IMAGES_DIR}/09-capitolo-5---quando-le-cose-finiscono.png`,
  chapter6: `${IMAGES_DIR}/10-capitolo-6---aiutare-senza-chiedere-nulla.png`,
  chapter7: `${IMAGES_DIR}/11-capitolo-7---la-natura-ci-insegna.png`,
  chapter8: `${IMAGES_DIR}/12-capitolo-8---i-veri-amici.png`,
  chapter9: `${IMAGES_DIR}/13-capitolo-9---dire-sempre-la-verità.png`,
  chapter10: `${IMAGES_DIR}/14-capitolo-10---le-parole-che-restano.png`,
};

function imageToBase64(filePath) {
  const data = fs.readFileSync(filePath);
  const ext = path.extname(filePath).slice(1) || 'png';
  return `data:image/${ext};base64,${data.toString('base64')}`;
}

// Chapter data from Gianni Parola
const chapters = [
  {
    number: "Capitolo 1",
    title: "Chi era Marco Aurelio",
    image: "chapter1",
    text: [
      "Tanto, tanto tempo fa, nella grande città di Roma, nacque un bambino speciale.",
      "Si chiamava Marco.",
      "Marco non era un bambino come tutti gli altri. Non perché fosse più forte o più ricco. Ma perché aveva una cosa rara: voleva capire.",
      "\"Perché le stelle brillano?\" chiedeva.\n\"Perché le persone sono tristi?\" domandava.\n\"Come posso essere un amico migliore?\"",
      "Quando Marco divenne grande, divenne imperatore di Roma. L'uomo più potente del mondo.",
      "Ma Marco sapeva una cosa importante: essere potente non significa essere buono. E lui voleva essere buono più di ogni altra cosa."
    ]
  },
  {
    number: "Capitolo 2",
    title: "Il Mattino dell'Imperatore",
    image: "chapter2",
    text: [
      "Ogni mattina, prima che il sole sorgesse, Marco si svegliava.",
      "Non per contare i suoi tesori.\nNon per comandare i soldati.",
      "Ma per ringraziare.",
      "\"Grazie per questo nuovo giorno,\" sussurrava.\n\"Grazie per le persone che amo.\nGrazie per le cose che posso imparare.\"",
      "Poi si vestiva con calma, faceva un respiro profondo, e sorrideva.",
      "Era pronto per qualsiasi cosa.",
      "Anche tu puoi farlo. Domani mattina, appena svegli, prova a dire: \"Grazie.\"",
      "Vedrai, cambia tutto."
    ]
  },
  {
    number: "Capitolo 3",
    title: "Le Cose che Possiamo Scegliere",
    image: "chapter3",
    text: [
      "Un giorno pioveva. Una pioggia forte, che non smetteva mai.",
      "Marco guardò dalla finestra e disse: \"Non posso fermare la pioggia. Ma posso scegliere come mi sento.\"",
      "E scelse di essere contento lo stesso.",
      "Vedi, ci sono cose che non possiamo controllare:\n- Se piove o c'è il sole\n- Se qualcuno è gentile o no\n- Se le cose vanno come vogliamo",
      "Ma ci sono cose che possiamo sempre scegliere:\n- Come trattiamo gli altri\n- Se arrabbiarci o restare calmi\n- Se sorridere o piangere",
      "Marco chiamava questo \"il segreto dell'imperatore\". Ma non è un segreto solo per gli imperatori. È un segreto per tutti."
    ]
  },
  {
    number: "Capitolo 4",
    title: "Essere Gentili Sempre",
    image: "chapter4",
    text: [
      "Una mattina, un servitore fece cadere un vaso prezioso.",
      "CRASH!",
      "Il vaso si ruppe in mille pezzi.",
      "Il servitore tremava di paura. Tutti si aspettavano che l'imperatore si arrabbiasse.",
      "Ma Marco si chinò, raccolse un pezzo del vaso, e disse: \"Era solo un vaso. Tu stai bene?\"",
      "Il servitore annuì, stupito.",
      "\"Ecco, questa è l'unica cosa che conta,\" disse Marco con un sorriso.",
      "Perché Marco sapeva: le cose si possono ricomprare. Ma se facciamo paura alle persone, il loro cuore si rompe. E quello non si aggiusta così facilmente."
    ]
  },
  {
    number: "Capitolo 5",
    title: "Quando le Cose Finiscono",
    image: "chapter5",
    text: [
      "Nel giardino di Marco c'era un fiore bellissimo.",
      "Ogni giorno Marco lo guardava e sorrideva.",
      "Un giorno, il fiore appassì.",
      "Marco non si arrabbiò. Non pianse.",
      "Disse semplicemente: \"Grazie, piccolo fiore, per tutta la bellezza che mi hai dato.\"",
      "Perché Marco aveva capito una cosa: tutto finisce. E questo non è triste. È normale.",
      "I fiori appassiscono per fare spazio a nuovi fiori.\nL'autunno viene dopo l'estate.\nLa sera viene dopo il giorno.",
      "Se impariamo ad accettare che le cose finiscono, impariamo anche a goderci di più il momento in cui ci sono."
    ]
  },
  {
    number: "Capitolo 6",
    title: "Aiutare Senza Chiedere Nulla",
    image: "chapter6",
    text: [
      "Una volta alla settimana, Marco usciva dal palazzo.",
      "Non con la sua corona.\nNon con i suoi soldati.",
      "Solo, vestito in modo semplice.",
      "Andava dove vivevano le persone povere e portava loro del pane.",
      "\"Perché lo fai?\" gli chiese un giorno un bambino. \"Non riceverai nulla in cambio.\"",
      "Marco sorrise: \"E chi ha detto che voglio qualcosa in cambio? Aiutare gli altri è già il regalo più bello che posso farmi.\"",
      "Il bambino non capì subito. Ma quando crebbe, capì.",
      "Aiutare gli altri ci fa stare bene dentro. E questo non ha prezzo."
    ]
  },
  {
    number: "Capitolo 7",
    title: "La Natura ci Insegna",
    image: "chapter7",
    text: [
      "Marco amava passeggiare nei boschi.",
      "Un giorno si fermò a guardare delle formiche.",
      "Le guardò per ore.",
      "\"Cosa ti insegnano, le formiche?\" gli chiese un amico.",
      "\"Mi insegnano la pazienza,\" rispose Marco. \"Guardano. Portano un chicco alla volta. Non si lamentano. Non si arrabbiano. Fanno il loro lavoro, giorno dopo giorno.\"",
      "\"E poi mi insegnano a lavorare insieme. Una formica da sola non può fare niente. Ma insieme, costruiscono regni.\"",
      "La natura è una maestra gentile. Basta fermarsi e guardare."
    ]
  },
  {
    number: "Capitolo 8",
    title: "I Veri Amici",
    image: "chapter8",
    text: [
      "Marco aveva tanti servitori, generali e ministri.",
      "Ma il suo migliore amico era un maestro di nome Frontone.",
      "Frontone non era ricco. Non era potente. Era solo saggio e gentile.",
      "Con lui Marco poteva parlare di tutto: delle sue paure, dei suoi sogni, delle cose che non capiva.",
      "\"Un vero amico,\" diceva Marco, \"non ti dice sempre quello che vuoi sentire. Ti dice quello che hai bisogno di sentire. Con amore.\"",
      "E quando Frontone morì, Marco pianse.",
      "Perché i veri amici sono rari e preziosi. Più di qualsiasi tesoro."
    ]
  },
  {
    number: "Capitolo 9",
    title: "Dire Sempre la Verità",
    image: "chapter9",
    text: [
      "Una volta Marco fece un errore.",
      "Un errore grosso.",
      "I suoi consiglieri gli dissero: \"Puoi nasconderlo. Nessuno lo saprà mai.\"",
      "Ma Marco scosse la testa.",
      "Andò davanti al popolo e disse: \"Ho sbagliato. Mi dispiace. Farò meglio.\"",
      "La gente rimase in silenzio. Poi applaudì.",
      "Perché ammettere i propri errori richiede coraggio. Molto più coraggio che nasconderli.",
      "E Marco lo sapeva: le bugie pesano. La verità, invece, ti rende leggero."
    ]
  },
  {
    number: "Capitolo 10",
    title: "Le Parole che Restano",
    image: "chapter10",
    text: [
      "Marco divenne vecchio.",
      "I suoi capelli erano bianchi, la sua barba lunga.",
      "Ma i suoi occhi brillavano ancora di curiosità.",
      "Ogni sera, prima di dormire, scriveva su un quaderno.",
      "Non scriveva per diventare famoso.\nScriveva per ricordarsi le cose importanti.",
      "\"Sii gentile.\"\n\"Non arrabbiarti per le cose piccole.\"\n\"Ogni giorno è un regalo.\"",
      "Questi pensieri, secoli dopo, li leggiamo ancora.",
      "Si chiamano \"Le Meditazioni di Marco Aurelio\".",
      "E ora che hai letto questa storia, anche tu conosci i suoi segreti.",
      "Usali bene."
    ]
  }
];

// CSS styles
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Nunito:wght@400;600&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  @page {
    size: 8.5in 11in;
    margin: 0;
  }

  body {
    font-family: 'Nunito', sans-serif;
    background: #faf8f5;
    color: #3d3425;
    line-height: 1.7;
  }

  .page {
    width: 8.5in;
    min-height: 11in;
    padding: 0.75in;
    page-break-after: always;
    position: relative;
    background: #faf8f5;
  }

  .cover-page {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    background: linear-gradient(180deg, #f5e6d3 0%, #e8d4b8 100%);
  }

  .cover-page img {
    width: 85%;
    max-height: 65%;
    object-fit: contain;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(139, 90, 43, 0.25);
    margin-bottom: 1.5rem;
  }

  .cover-page h1 {
    font-family: 'Cormorant Garamond', serif;
    font-size: 2.5rem;
    color: #5c4033;
    margin-bottom: 0.5rem;
    font-weight: 600;
  }

  .cover-page h2 {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.5rem;
    color: #8b5a2b;
    font-weight: 400;
    font-style: italic;
    margin-bottom: 1rem;
  }

  .cover-page .author {
    font-size: 1rem;
    color: #6b5344;
    margin-top: 0.5rem;
  }

  .cover-page .publisher {
    font-size: 0.85rem;
    color: #8b7355;
    margin-top: 0.5rem;
    font-style: italic;
  }

  .chapter-page {
    display: flex;
    flex-direction: column;
  }

  .chapter-header {
    text-align: center;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #d4a574;
  }

  .chapter-number {
    font-family: 'Cormorant Garamond', serif;
    font-size: 0.9rem;
    color: #8b7355;
    text-transform: uppercase;
    letter-spacing: 3px;
    margin-bottom: 0.25rem;
  }

  .chapter-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.8rem;
    color: #5c4033;
    font-weight: 600;
  }

  .chapter-image {
    width: 100%;
    height: auto;
    max-height: 45%;
    object-fit: contain;
    border-radius: 8px;
    margin-bottom: 1rem;
    box-shadow: 0 4px 16px rgba(139, 90, 43, 0.15);
  }

  .chapter-text {
    flex: 1;
    columns: 1;
    column-gap: 1.5rem;
    font-size: 1rem;
    text-align: justify;
  }

  .chapter-text p {
    margin-bottom: 0.75rem;
    text-indent: 1.5em;
    white-space: pre-line;
  }

  .chapter-text p:first-child {
    text-indent: 0;
  }

  .chapter-text p:first-child::first-letter {
    font-family: 'Cormorant Garamond', serif;
    font-size: 3rem;
    float: left;
    line-height: 1;
    padding-right: 0.5rem;
    color: #8b5a2b;
  }

  .page-number {
    position: absolute;
    bottom: 0.5in;
    width: calc(100% - 1.5in);
    text-align: center;
    font-size: 0.85rem;
    color: #8b7355;
    font-style: italic;
  }

  .credits-page {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
  }

  .credits-page h2 {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.5rem;
    color: #5c4033;
    margin-bottom: 2rem;
  }

  .credits-page p {
    font-size: 0.95rem;
    color: #6b5344;
    margin-bottom: 0.5rem;
  }

  .credits-page .fine {
    font-family: 'Cormorant Garamond', serif;
    font-size: 2rem;
    color: #8b5a2b;
    margin-top: 3rem;
    font-style: italic;
  }
`;

async function createBook() {
  console.log('Creating Il Saggio Imperatore book...');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Convert images to base64
  const imagesBase64 = {};
  for (const [key, filePath] of Object.entries(images)) {
    if (fs.existsSync(filePath)) {
      imagesBase64[key] = imageToBase64(filePath);
      console.log(`Loaded: ${key}`);
    } else {
      console.error(`Missing image: ${filePath}`);
    }
  }

  // Generate HTML
  let html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <title>Il Saggio Imperatore - Marco Aurelio per Bambini</title>
  <style>${styles}</style>
</head>
<body>`;

  // Cover page
  html += `
  <div class="page cover-page">
    <img src="${imagesBase64.cover}" alt="Il Saggio Imperatore - Copertina">
    <h1>Il Saggio Imperatore</h1>
    <h2>Le Avventure di Marco Aurelio</h2>
    <p class="author">Testo di Gianni Parola</p>
    <p class="author">Illustrazioni di Pina Pennello</p>
    <p class="publisher">Onde Classics</p>
  </div>`;

  // Chapter pages
  let pageNum = 2;
  for (const chapter of chapters) {
    const imgSrc = imagesBase64[chapter.image];
    const textHtml = chapter.text.map(p => `<p>${p}</p>`).join('\n');

    html += `
  <div class="page chapter-page">
    <div class="chapter-header">
      <div class="chapter-number">${chapter.number}</div>
      <h2 class="chapter-title">${chapter.title}</h2>
    </div>
    <img class="chapter-image" src="${imgSrc}" alt="${chapter.title}">
    <div class="chapter-text">
      ${textHtml}
    </div>
    <div class="page-number">${pageNum}</div>
  </div>`;
    pageNum++;
  }

  // Credits page
  html += `
  <div class="page credits-page">
    <h2>Crediti</h2>
    <p><strong>Testo:</strong> Gianni Parola</p>
    <p><strong>Illustrazioni:</strong> Pina Pennello</p>
    <p><strong>Editore:</strong> Onde Publishing</p>
    <p><strong>Collana:</strong> Onde Classics</p>
    <p><strong>Anno:</strong> 2026</p>
    <p class="fine">Fine</p>
  </div>`;

  html += `
</body>
</html>`;

  // Save HTML
  const htmlPath = path.join(OUTPUT_DIR, 'il-saggio-imperatore.html');
  fs.writeFileSync(htmlPath, html);
  console.log(`HTML saved: ${htmlPath}`);

  // Generate PDF with Puppeteer
  console.log('Generating PDF...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'load', timeout: 120000 });

  const pdfPath = path.join(OUTPUT_DIR, 'il-saggio-imperatore.pdf');
  await page.pdf({
    path: pdfPath,
    format: 'Letter',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  await browser.close();
  console.log(`PDF saved: ${pdfPath}`);
  console.log('Book creation complete!');

  return pdfPath;
}

createBook().catch(console.error);
