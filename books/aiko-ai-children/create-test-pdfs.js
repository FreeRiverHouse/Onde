const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const styles = [
  {
    name: 'Scandinavo',
    cover: '/Users/mattiapetrucciani/Downloads/image (92).jpg',
    chapter1: '/Users/mattiapetrucciani/Downloads/image (93).jpg',
    outputName: 'AIKO-Test-Scandinavo.pdf'
  },
  {
    name: 'Acquerello Italiano',
    cover: '/Users/mattiapetrucciani/Downloads/image (94).jpg',
    chapter1: '/Users/mattiapetrucciani/Downloads/image (95).jpg',
    outputName: 'AIKO-Test-Acquerello-Italiano.pdf'
  },
  {
    name: 'Paper Cut Moderno',
    cover: '/Users/mattiapetrucciani/Downloads/image (96).jpg',
    chapter1: '/Users/mattiapetrucciani/Downloads/image (97).jpg',
    outputName: 'AIKO-Test-Paper-Cut.pdf'
  }
];

function imageToBase64(filePath) {
  const data = fs.readFileSync(filePath);
  const ext = path.extname(filePath).slice(1);
  return `data:image/${ext};base64,${data.toString('base64')}`;
}

function createHTML(style) {
  const coverBase64 = imageToBase64(style.cover);
  const chapter1Base64 = imageToBase64(style.chapter1);

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
      font-family: 'Georgia', serif;
    }
    .page {
      width: 8.5in;
      height: 11in;
      page-break-after: always;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #fafafa;
      position: relative;
    }
    .page:last-child {
      page-break-after: avoid;
    }
    .cover-page {
      background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
    }
    .cover-page img {
      max-width: 90%;
      max-height: 70%;
      object-fit: contain;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.15);
    }
    .cover-page h1 {
      margin-top: 30px;
      font-size: 36px;
      color: #2c3e50;
      text-align: center;
    }
    .cover-page .subtitle {
      font-size: 18px;
      color: #7f8c8d;
      margin-top: 10px;
    }
    .cover-page .style-badge {
      position: absolute;
      top: 20px;
      right: 20px;
      background: #3498db;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: bold;
    }
    .chapter-page img {
      max-width: 85%;
      max-height: 65%;
      object-fit: contain;
      border-radius: 8px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
    }
    .chapter-page h2 {
      margin-top: 25px;
      font-size: 28px;
      color: #34495e;
    }
    .chapter-page p {
      margin-top: 15px;
      font-size: 16px;
      color: #666;
      max-width: 70%;
      text-align: center;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="page cover-page">
    <div class="style-badge">Stile: ${style.name}</div>
    <img src="${coverBase64}" alt="Cover">
    <h1>AIKO</h1>
    <div class="subtitle">AI Explained to Children</div>
  </div>

  <div class="page chapter-page">
    <img src="${chapter1Base64}" alt="Chapter 1">
    <h2>Chapter 1: A Strange New Friend</h2>
    <p>Sofia couldn't believe her eyes when she opened the box. Inside was a small, round robot with big, friendly blue eyes...</p>
  </div>
</body>
</html>
`;
}

async function createPDF(style) {
  console.log(`Creating PDF for style: ${style.name}...`);

  // Check if images exist
  if (!fs.existsSync(style.cover)) {
    console.error(`Cover image not found: ${style.cover}`);
    return false;
  }
  if (!fs.existsSync(style.chapter1)) {
    console.error(`Chapter 1 image not found: ${style.chapter1}`);
    return false;
  }

  const html = createHTML(style);
  const htmlPath = path.join(__dirname, `output/test-${style.name.toLowerCase().replace(/ /g, '-')}.html`);
  const pdfPath = path.join(__dirname, `output/${style.outputName}`);

  // Write HTML
  fs.writeFileSync(htmlPath, html);
  console.log(`HTML created: ${htmlPath}`);

  // Create PDF
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('img');
  await new Promise(resolve => setTimeout(resolve, 1000));

  await page.pdf({
    path: pdfPath,
    format: 'Letter',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  await browser.close();
  console.log(`PDF created: ${pdfPath}`);
  return true;
}

async function main() {
  console.log('Creating 3 test PDFs for style comparison...\n');

  // Ensure output directory exists
  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const style of styles) {
    await createPDF(style);
    console.log('');
  }

  console.log('Done! 3 test PDFs created in output folder.');
  console.log('\nFiles:');
  styles.forEach(s => {
    console.log(`  - output/${s.outputName}`);
  });
}

main().catch(console.error);
