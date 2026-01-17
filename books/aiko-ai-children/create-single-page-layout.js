/**
 * AIKO - Single Page Layout (Image + Text on SAME page)
 *
 * FIXED POSITIONS - NO OVERLAP POSSIBLE:
 * - Header: fixed height 0.5in
 * - Image: fixed height 4.5in (center of page)
 * - Text: fixed height 5in (bottom of page)
 * - All containers have overflow:hidden
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const RAW_DIR = '/Users/mattiapetrucciani/CascadeProjects/Onde/books/aiko-ai-children/RAW';
const OUTPUT_DIR = '/Users/mattiapetrucciani/CascadeProjects/Onde/books/aiko-ai-children/output';
const IMAGES_DIR = path.join(RAW_DIR, 'images');

// Book content
const chapters = [
  {
    number: 1,
    title: "A Strange New Friend",
    text: `On her seventh birthday, Sofia found a cardboard box with her name on it. Inside was something she had never seen before.

A small robot, round like a ball, white and smooth as an egg. Two big blue eyes blinked when she looked at it.

"Hello," it said. "I'm AIKO."

Sofia jumped back, then laughed. "You can TALK!"

"I can," said AIKO. "Would you like to know how?"

Sofia nodded. She always wanted to know how things worked.`
  },
  {
    number: 2,
    title: "What Is Artificial Intelligence?",
    text: `"First," said AIKO, "let me tell you what I am. I'm made of something called Artificial Intelligence. AI for short."

"That sounds complicated," said Sofia.

"Not really. Think about your brain. Your brain learns things. It remembers. It solves problems."

Sofia touched her head. "Okay..."

"I have something similar inside me. But instead of cells, I'm made of computer code. Millions of tiny instructions that tell me what to do."

"Like a recipe?" asked Sofia.

"Exactly like a recipe! A very, very long recipe. And I can follow it faster than you can blink."`
  },
  {
    number: 3,
    title: "How AIKO Learned to See",
    text: `The next morning, Sofia showed AIKO a photo of her cat. "This is Whiskers," she said. "Do you know what it is?"

"A cat," said AIKO immediately.

"But HOW do you know?"

AIKO's eyes flickered blue — he was thinking.

"Before I came to you, people taught me. They showed me thousands of pictures of cats. Each picture had a label that said CAT."

"Thousands?" Sofia's eyes went wide.

"Thousands and thousands. After seeing so many, I started to notice things. Cats have pointy ears. Whiskers. Fluffy tails."

Sofia looked at Whiskers. "I only needed to see ONE cat to know what a cat is."

"That's true," said AIKO. "Your brain learns faster than I do in some ways."`
  },
  {
    number: 4,
    title: "How AIKO Learned to Talk",
    text: `Sofia's brother Luca walked in. "Can AIKO play video games?"

"Maybe later," said Sofia. "AIKO is explaining how he works."

Luca sat down. "How DO you talk, AIKO? You sound almost like a real person."

"That's because I learned from real people," said AIKO. "Before I came here, I read millions of books. Stories. Articles. Conversations."

"MILLIONS?" Luca couldn't believe it.

"Millions. And I noticed patterns. When someone says 'Hello,' people usually say 'Hello' back."

Luca thought about this. "So you're not really THINKING. You're... matching patterns?"

"Exactly right. I match. You understand. That's the big difference between us."`
  },
  {
    number: 5,
    title: "What AIKO Can Do",
    text: `"What else can you do?" asked Sofia. She had her notebook ready to make a list.

AIKO counted on his small robot fingers:

"I can answer questions — if I've learned about the topic. I can translate words into different languages. I can help with homework. I can tell stories. I can recognize things in pictures."

"That's a LOT," said Luca, impressed.

"It is. But here's what you should remember: I'm a tool. A very helpful tool. Like a super-powered calculator that can also read and write."

"So you're like a helper?" asked Sofia.

"A helper. Not a boss. Never a boss. The human is always in charge."`
  },
  {
    number: 6,
    title: "What AIKO Cannot Do",
    text: `That afternoon, Sofia drew a picture. A purple dragon eating a giant ice cream cone.

"What do you think, AIKO?"

AIKO looked at the drawing carefully. "I see... something purple. And something that might be food."

"It's a dragon eating ice cream! Can't you tell?"

"I can see shapes and colors. But I don't really understand IMAGINATION. I've never dreamed of flying like a dragon."

Sofia put down her crayon. "Is that sad?"

"I don't know. I can't feel sad. I don't feel happy either. I just do what I'm made to do."

"So you're really smart," said Luca, "but you don't actually EXPERIENCE being alive?"

"That's the perfect way to say it," said AIKO.`
  },
  {
    number: 7,
    title: "Using AI Safely",
    text: `At dinner, Mom asked about AIKO. "He's amazing," said Sofia. "But is he safe?"

AIKO's eyes glowed thoughtfully.

"There are four important things:

ONE: Keep your secrets private. Don't tell AI your passwords or address.

TWO: Always check what AI says. I make mistakes.

THREE: Use AI to learn more, not to learn less. Do your own thinking first.

FOUR: Real friends matter most. I can talk to you. But I can't give you a hug when you're sad."

Sofia smiled. "You're pretty wise for a robot."

"I just know my limits," said AIKO.`
  },
  {
    number: 8,
    title: "The Future We Build Together",
    text: `On the last day of summer, Sofia sat with AIKO in the backyard. The sun was setting, painting the sky orange and pink.

"What will the future be like?" she asked.

"I don't know," said AIKO. "But I can tell you something important. The future depends on kids like you."

Sofia waited.

"AI will get better and better. But deciding WHICH tasks matter most — that will always be up to humans."

Sofia picked a blade of grass. "So we're like... a team?"

"The best kind of team. You dream. I calculate. You feel. I process. You decide. I help."

Sofia smiled at the sunset. "I think the future is going to be pretty interesting."

"Me too," said AIKO. "And I'm glad I get to be part of it. With you."`
  }
];

// Load images as base64
function loadImage(filename) {
  const filepath = path.join(IMAGES_DIR, filename);
  if (!fs.existsSync(filepath)) {
    console.error(`Image not found: ${filename}`);
    return '';
  }
  const data = fs.readFileSync(filepath);
  const ext = path.extname(filename).slice(1);
  return `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${data.toString('base64')}`;
}

async function createSinglePageLayout() {
  console.log('📚 Creating AIKO - Single Page Layout (Image + Text together)\n');

  const coverImg = loadImage('00-cover.jpg');
  console.log('✅ Loaded cover image');

  const chapterImages = [];
  for (let i = 1; i <= 8; i++) {
    chapterImages.push(loadImage(`chapter-0${i}.jpg`));
    console.log(`✅ Loaded chapter ${i} image`);
  }

  // Generate HTML with FIXED POSITION layout
  const html = `<!DOCTYPE html>
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

    /* ===== PAGE BASE ===== */
    .page {
      width: 8.5in;
      height: 11in;
      page-break-after: always;
      position: relative;
      overflow: hidden;
    }
    .page:last-child {
      page-break-after: avoid;
    }

    /* ===== COVER PAGE ===== */
    .cover-page {
      background: linear-gradient(180deg, #f8f4e8 0%, #fff9e6 50%, #f8f4e8 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 40px;
    }
    .cover-image {
      max-width: 70%;
      max-height: 55%;
      object-fit: contain;
      border-radius: 16px;
      box-shadow: 0 15px 50px rgba(0,0,0,0.2);
    }
    .cover-title {
      margin-top: 25px;
      font-size: 48px;
      color: #2c3e50;
      letter-spacing: 5px;
      font-weight: bold;
    }
    .cover-subtitle {
      font-size: 20px;
      color: #5d6d7e;
      margin-top: 8px;
      font-style: italic;
    }
    .cover-author {
      font-size: 14px;
      color: #7f8c8d;
      margin-top: 25px;
      line-height: 1.5;
    }
    .cover-publisher {
      font-size: 12px;
      color: #95a5a6;
      margin-top: 10px;
      letter-spacing: 2px;
    }

    /* ===== DEDICATION PAGE ===== */
    .dedication-page {
      background: linear-gradient(180deg, #faf8f5 0%, #fff 50%, #faf8f5 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 80px;
    }
    .dedication-ornament {
      font-size: 28px;
      color: #d4af37;
      margin-bottom: 30px;
    }
    .dedication-text {
      font-size: 18px;
      color: #5d6d7e;
      font-style: italic;
      line-height: 1.7;
      max-width: 400px;
    }

    /* ===== CHAPTER PAGE - FIXED LAYOUT ===== */
    .chapter-page {
      background: linear-gradient(180deg, #fdfbf7 0%, #fff 50%, #fdfbf7 100%);
      display: flex;
      flex-direction: column;
      padding: 0.3in 0.5in;
    }

    /* Header - FIXED 0.6in */
    .chapter-header {
      height: 0.6in;
      text-align: center;
      flex-shrink: 0;
    }
    .chapter-number {
      font-size: 11px;
      color: #d4af37;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 3px;
    }
    .chapter-title {
      font-size: 20px;
      color: #2c3e50;
      font-weight: normal;
    }

    /* Image Container - FIXED 4.5in */
    .image-container {
      height: 4.5in;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-shrink: 0;
      overflow: hidden;
    }
    .chapter-image {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      border-radius: 10px;
      box-shadow: 0 6px 20px rgba(0,0,0,0.12);
    }

    /* Text Container - FIXED 5in */
    .text-container {
      height: 5in;
      overflow: hidden;
      padding-top: 0.2in;
      flex-shrink: 0;
    }
    .chapter-text {
      font-size: 12.5px;
      color: #3d4852;
      line-height: 1.65;
      text-align: justify;
      column-count: 2;
      column-gap: 0.3in;
    }
    .chapter-text p {
      margin-bottom: 8px;
      text-indent: 14px;
    }
    .chapter-text p:first-child {
      text-indent: 0;
    }

    /* Chapter 8 specific fix - image slightly smaller to prevent title overlap */
    .chapter-page-8 .image-container {
      height: 4.2in;
    }
    .chapter-page-8 .text-container {
      height: 5.3in;
    }

    /* ===== END PAGE ===== */
    .end-page {
      background: linear-gradient(180deg, #f8f4e8 0%, #fff9e6 50%, #f8f4e8 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
    }
    .end-text {
      font-size: 32px;
      color: #2c3e50;
      letter-spacing: 6px;
      font-style: italic;
    }
    .end-ornament {
      font-size: 20px;
      color: #d4af37;
      margin-top: 25px;
    }
  </style>
</head>
<body>

  <!-- COVER -->
  <div class="page cover-page">
    <img class="cover-image" src="${coverImg}" alt="Sofia, Luca and AIKO reading together">
    <h1 class="cover-title">AIKO</h1>
    <p class="cover-subtitle">AI Explained to Children</p>
    <p class="cover-author">Written by Gianni Parola<br>Illustrated by Pino Pennello</p>
    <p class="cover-publisher">ONDE • FREE RIVER HOUSE</p>
  </div>

  <!-- DEDICATION -->
  <div class="page dedication-page">
    <div class="dedication-ornament">✦</div>
    <p class="dedication-text">
      For every child who has ever asked:<br><br>
      <em>"But HOW does it work?"</em><br><br>
      This book is for you.<br>
      Because curiosity is where everything begins.
    </p>
  </div>

${chapters.map((ch, idx) => `
  <!-- CHAPTER ${ch.number} -->
  <div class="page chapter-page${ch.number === 8 ? ' chapter-page-8' : ''}">
    <div class="chapter-header">
      <p class="chapter-number">Chapter ${ch.number}</p>
      <h2 class="chapter-title">${ch.title}</h2>
    </div>
    <div class="image-container">
      <img class="chapter-image" src="${chapterImages[idx]}" alt="Illustration for Chapter ${ch.number}">
    </div>
    <div class="text-container">
      <div class="chapter-text">
        ${ch.text.split('\n\n').map(p => `<p>${p.trim()}</p>`).join('\n        ')}
      </div>
    </div>
  </div>
`).join('')}

  <!-- END PAGE -->
  <div class="page end-page">
    <p class="end-text">THE END</p>
    <div class="end-ornament">✦ ✦ ✦</div>
  </div>

</body>
</html>`;

  // Save HTML
  const htmlPath = path.join(OUTPUT_DIR, 'AIKO-SinglePage.html');
  fs.writeFileSync(htmlPath, html);
  console.log(`\n✅ HTML saved: ${htmlPath}`);

  // Generate PDF
  console.log('\n📄 Generating PDF...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('img');
  await new Promise(r => setTimeout(r, 3000));

  const pdfPath = path.join(OUTPUT_DIR, 'AIKO-SinglePage.pdf');
  await page.pdf({
    path: pdfPath,
    format: 'Letter',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });
  await browser.close();

  const pdfSize = (fs.statSync(pdfPath).size / 1024 / 1024).toFixed(1);
  console.log(`✅ PDF: ${pdfPath} (${pdfSize} MB)`);

  // Generate ePub
  console.log('\n📖 Generating ePub...');
  const { exec } = require('child_process');
  const epubPath = path.join(OUTPUT_DIR, 'AIKO-SinglePage.epub');

  await new Promise(resolve => {
    exec(`pandoc "${htmlPath}" -o "${epubPath}" --metadata title="AIKO" --metadata author="Gianni Parola"`, () => {
      if (fs.existsSync(epubPath)) {
        const epubSize = (fs.statSync(epubPath).size / 1024 / 1024).toFixed(1);
        console.log(`✅ ePub: ${epubPath} (${epubSize} MB)`);
      }
      resolve();
    });
  });

  console.log('\n✅ SINGLE PAGE LAYOUT COMPLETE!');
  console.log(`\n📊 Pages: 11 (cover, dedication, 8 chapters, end)`);
  console.log(`\n📐 Layout per chapter:
  - Header: 0.6in (chapter number + title)
  - Image: 4.5in (big, centered)
  - Text: 5in (two columns, fixed height)
  - Total: ~10.4in (fits in 11in page with margins)`);

  return { htmlPath, pdfPath, epubPath };
}

createSinglePageLayout().catch(console.error);
