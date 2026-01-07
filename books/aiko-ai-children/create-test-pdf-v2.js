const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Image paths for consistent AIKO design
const images = {
  cover: '/Users/mattiapetrucciani/Downloads/image - 2026-01-06T155705.384.jpg',
  chapter1: '/Users/mattiapetrucciani/Downloads/image - 2026-01-06T160040.310.jpg',
  chapter2: '/Users/mattiapetrucciani/Downloads/image - 2026-01-06T160358.762.jpg'
};

function imageToBase64(filePath) {
  const data = fs.readFileSync(filePath);
  const ext = path.extname(filePath).slice(1) || 'jpg';
  return `data:image/${ext};base64,${data.toString('base64')}`;
}

function createHTML() {
  const coverBase64 = imageToBase64(images.cover);
  const ch1Base64 = imageToBase64(images.chapter1);
  const ch2Base64 = imageToBase64(images.chapter2);

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
    }
    .page {
      width: 8.5in;
      height: 11in;
      page-break-after: always;
      display: flex;
      flex-direction: column;
      background: #fefefe;
      position: relative;
      overflow: hidden;
    }
    .page:last-child {
      page-break-after: avoid;
    }

    /* Cover Page */
    .cover-page {
      background: linear-gradient(180deg, #f8f4e8 0%, #fff9e6 50%, #f8f4e8 100%);
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 40px;
    }
    .cover-page img {
      max-width: 75%;
      max-height: 60%;
      object-fit: contain;
      border-radius: 16px;
      box-shadow: 0 15px 50px rgba(0,0,0,0.2);
    }
    .cover-page h1 {
      margin-top: 30px;
      font-size: 52px;
      color: #2c3e50;
      letter-spacing: 4px;
      font-weight: bold;
    }
    .cover-page .subtitle {
      font-size: 22px;
      color: #5d6d7e;
      margin-top: 10px;
      font-style: italic;
    }
    .cover-page .author {
      font-size: 16px;
      color: #7f8c8d;
      margin-top: 30px;
    }
    .cover-page .publisher {
      font-size: 14px;
      color: #95a5a6;
      margin-top: 10px;
    }

    /* Chapter Pages */
    .chapter-page {
      padding: 50px 60px;
    }
    .chapter-header {
      text-align: center;
      margin-bottom: 25px;
    }
    .chapter-number {
      font-size: 14px;
      color: #7f8c8d;
      text-transform: uppercase;
      letter-spacing: 3px;
    }
    .chapter-title {
      font-size: 32px;
      color: #2c3e50;
      margin-top: 5px;
      font-weight: bold;
    }
    .chapter-image {
      width: 100%;
      display: flex;
      justify-content: center;
      margin: 20px 0;
    }
    .chapter-image img {
      max-width: 100%;
      max-height: 4.5in;
      object-fit: contain;
      border-radius: 12px;
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }
    .chapter-text {
      font-size: 15px;
      line-height: 1.8;
      color: #34495e;
      text-align: justify;
    }
    .chapter-text p {
      margin-bottom: 12px;
      text-indent: 20px;
    }
    .chapter-text p:first-child {
      text-indent: 0;
    }
    .chapter-text .dialogue {
      text-indent: 0;
      margin-left: 20px;
    }
  </style>
</head>
<body>
  <!-- COVER PAGE -->
  <div class="page cover-page">
    <img src="${coverBase64}" alt="AIKO Cover">
    <h1>AIKO</h1>
    <div class="subtitle">AI Explained to Children</div>
    <div class="author">Written by Gianni Parola<br>Illustrated by Pino Pennello</div>
    <div class="publisher">Onde, Free River House</div>
  </div>

  <!-- CHAPTER 1 -->
  <div class="page chapter-page">
    <div class="chapter-header">
      <div class="chapter-number">Chapter One</div>
      <div class="chapter-title">A Strange New Friend</div>
    </div>
    <div class="chapter-image">
      <img src="${ch1Base64}" alt="Sofia discovers AIKO">
    </div>
    <div class="chapter-text">
      <p>On her seventh birthday, Sofia found a cardboard box with her name on it.</p>
      <p>Inside was something she had never seen before.</p>
      <p>A small robot, round like a ball, white and smooth as an egg. Two big blue eyes blinked when she looked at it.</p>
      <p class="dialogue">"Hello," it said. "I'm AIKO."</p>
      <p>Sofia jumped back, then laughed. "You can TALK!"</p>
      <p class="dialogue">"I can," said AIKO. "Would you like to know how?"</p>
      <p>Sofia nodded. She always wanted to know how things worked.</p>
    </div>
  </div>

  <!-- CHAPTER 2 -->
  <div class="page chapter-page">
    <div class="chapter-header">
      <div class="chapter-number">Chapter Two</div>
      <div class="chapter-title">What Is Artificial Intelligence?</div>
    </div>
    <div class="chapter-image">
      <img src="${ch2Base64}" alt="Brain vs Circuits">
    </div>
    <div class="chapter-text">
      <p class="dialogue">"First," said AIKO, "let me tell you what I am. I'm made of something called Artificial Intelligence. AI for short."</p>
      <p class="dialogue">"That sounds complicated," said Sofia.</p>
      <p class="dialogue">"Not really. Think about your brain. Your brain learns things. It remembers. It solves problems."</p>
      <p>Sofia touched her head. "Okay..."</p>
      <p class="dialogue">"I have something similar inside me. But instead of cells, I'm made of computer code. Millions of tiny instructions that tell me what to do."</p>
      <p class="dialogue">"Like a recipe?" asked Sofia.</p>
      <p class="dialogue">"Exactly like a recipe! A very, very long recipe. And I can follow it faster than you can blink."</p>
    </div>
  </div>

</body>
</html>
`;
}

async function createPDF() {
  console.log('Creating AIKO Test PDF (Cover + Ch1 + Ch2)...\n');

  // Check images exist
  for (const [name, filePath] of Object.entries(images)) {
    if (!fs.existsSync(filePath)) {
      console.error(`ERROR: ${name} image not found: ${filePath}`);
      return;
    }
    console.log(`Found ${name}: ${path.basename(filePath)}`);
  }

  const html = createHTML();
  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const htmlPath = path.join(outputDir, 'AIKO-test-v2.html');
  const pdfPath = path.join(outputDir, 'AIKO-Test-Preview.pdf');

  fs.writeFileSync(htmlPath, html);
  console.log(`\nHTML saved: ${htmlPath}`);

  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('img');
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('Generating PDF...');
  await page.pdf({
    path: pdfPath,
    format: 'Letter',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  await browser.close();
  console.log(`\nPDF created: ${pdfPath}`);
  console.log('\nThis is a TEST with 3 pages:');
  console.log('  - Cover');
  console.log('  - Chapter 1: A Strange New Friend');
  console.log('  - Chapter 2: What Is Artificial Intelligence?');
  console.log('\nIf approved, will continue with remaining chapters.');
}

createPDF().catch(console.error);
