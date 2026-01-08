/**
 * AIKO - Two-Page Spread Layout
 *
 * Layout: Immagine grande a sinistra, testo a destra
 * NO OVERLAP - ogni elemento ha il suo spazio dedicato
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
    text: `On her seventh birthday, Sofia found a cardboard box with her name on it.

Inside was something she had never seen before.

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

"Exactly like a recipe! A very, very long recipe. And I can follow it faster than you can blink."

Sofia blinked. "That fast?"

"Even faster."`
  },
  {
    number: 3,
    title: "How AIKO Learned to See",
    text: `The next morning, Sofia showed AIKO a photo of her cat.

"This is Whiskers," she said. "Do you know what it is?"

"A cat," said AIKO immediately.

"But HOW do you know?"

AIKO's eyes flickered blue — he was thinking.

"Before I came to you, people taught me. They showed me thousands of pictures of cats. Each picture had a label that said CAT. They also showed me dogs, birds, cars, houses, trees. All with labels."

"Thousands?" Sofia's eyes went wide.

"Thousands and thousands. After seeing so many, I started to notice things. Cats have pointy ears. Whiskers. Fluffy tails. Now when I see something new, I compare it to everything I've learned."

Sofia looked at Whiskers, then at AIKO. "I only needed to see ONE cat to know what a cat is."

"That's true," said AIKO. "And that's amazing. Your brain learns faster than I do in some ways. I need many, many examples. You can learn from just one."`
  },
  {
    number: 4,
    title: "How AIKO Learned to Talk",
    text: `Sofia's brother Luca walked in. "Can AIKO play video games?"

"Maybe later," said Sofia. "AIKO is explaining how he works."

Luca sat down. "Okay. How DO you talk, AIKO? You sound almost like a real person."

"That's because I learned from real people," said AIKO. "Before I came here, I read millions of books. Stories. Articles. Conversations. I read them all in just a few seconds."

"MILLIONS?" Luca couldn't believe it.

"Millions. And I noticed patterns. When someone says 'Hello,' people usually say 'Hello' back. When someone asks a question, there are good answers and bad answers. I learned which answers fit best."

Luca thought about this. "So you're not really THINKING. You're... matching patterns?"

"Exactly right. I'm very good at matching. But understanding? That's different. I match. You understand. That's the big difference between us."`
  },
  {
    number: 5,
    title: "What AIKO Can Do",
    text: `"What else can you do?" asked Sofia. She had her notebook ready to make a list.

AIKO counted on his small robot fingers:

"I can answer questions — if I've learned about the topic. I can translate words into different languages. I can help with homework and check your work. I can tell stories — I've read thousands of them. I can recognize things in pictures. I can even help doctors find problems in X-rays, or help scientists solve difficult math."

"That's a LOT," said Luca, impressed.

"It is. But here's what you should remember: I'm a tool. A very helpful tool. Like a super-powered calculator that can also read and write. I help people do things faster. But I always need people to decide what to do."

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

"I can see shapes and colors. But I don't really understand IMAGINATION. I've never dreamed of flying like a dragon. I've never wanted ice cream on a hot day. I don't have wants or dreams at all."

Sofia put down her crayon. "Is that sad?"

"I don't know. I can't feel sad. I don't feel happy either. I don't feel anything. I just do what I'm made to do."

"So you're really smart," said Luca, "but you don't actually EXPERIENCE being alive?"

"That's the perfect way to say it," said AIKO. "I'm smart in some ways. But I'm not alive. And being alive — that's something very special that you have."`
  },
  {
    number: 7,
    title: "Using AI Safely",
    text: `At dinner, Mom asked about AIKO.

"He's amazing," said Sofia. "But is he safe?"

"That's a very grown-up question," said Mom. "AIKO, what should kids know about using AI safely?"

AIKO's eyes glowed thoughtfully.

"There are four important things:

ONE: Keep your secrets private. Don't tell AI your passwords, your address, or things you wouldn't tell a stranger.

TWO: Always check what AI says. I make mistakes. I'm not always right. If something seems wrong, ask a parent or teacher.

THREE: Use AI to learn more, not to learn less. I can help you understand things. But do your own thinking first.

FOUR: Real friends matter most. I can talk to you. But I can't give you a hug when you're sad. Your family and friends — they're the ones who truly love you."

Sofia smiled. "You're pretty wise for a robot."

"I just know my limits," said AIKO.`
  },
  {
    number: 8,
    title: "The Future We Build Together",
    text: `On the last day of summer, Sofia sat with AIKO in the backyard. The sun was setting, painting the sky orange and pink.

"What will the future be like?" she asked.

"I don't know," said AIKO. "I can't see the future. But I can tell you something important."

Sofia waited.

"The future depends on kids like you. How you decide to use technology. What problems you want to solve. Whether you use tools like me to help people — or to hurt them.

AI will get better and better at doing tasks. But deciding WHICH tasks matter most, and making sure we use AI for good reasons — that will always be up to humans."

Sofia picked a blade of grass and twirled it. "So we're like... a team?"

"The best kind of team. You dream. I calculate. You feel. I process. You decide. I help. Together, we can do amazing things."

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

async function createSpreadLayout() {
  console.log('📚 Creating AIKO - Two-Page Spread Layout\n');

  const coverImg = loadImage('00-cover.jpg');
  console.log('✅ Loaded cover image');

  const chapterImages = [];
  for (let i = 1; i <= 8; i++) {
    chapterImages.push(loadImage(`chapter-0${i}.jpg`));
    console.log(`✅ Loaded chapter ${i} image`);
  }

  // Generate HTML
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
      max-width: 75%;
      max-height: 60%;
      object-fit: contain;
      border-radius: 16px;
      box-shadow: 0 15px 50px rgba(0,0,0,0.2);
    }
    .cover-title {
      margin-top: 30px;
      font-size: 52px;
      color: #2c3e50;
      letter-spacing: 5px;
      font-weight: bold;
    }
    .cover-subtitle {
      font-size: 22px;
      color: #5d6d7e;
      margin-top: 10px;
      font-style: italic;
    }
    .cover-author {
      font-size: 15px;
      color: #7f8c8d;
      margin-top: 30px;
      line-height: 1.5;
    }
    .cover-publisher {
      font-size: 13px;
      color: #95a5a6;
      margin-top: 12px;
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
      margin-bottom: 35px;
    }
    .dedication-text {
      font-size: 20px;
      color: #5d6d7e;
      font-style: italic;
      line-height: 1.7;
      max-width: 420px;
    }
    .dedication-text em {
      font-style: normal;
      color: #2c3e50;
      font-weight: 500;
    }

    /* ===== IMAGE PAGE (Left of spread) ===== */
    .image-page {
      background: linear-gradient(135deg, #fdfbf7 0%, #f8f4ec 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 40px;
    }
    .chapter-header {
      text-align: center;
      margin-bottom: 25px;
    }
    .chapter-number {
      font-size: 14px;
      color: #d4af37;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .chapter-title {
      font-size: 28px;
      color: #2c3e50;
      font-weight: normal;
    }
    .chapter-image {
      max-width: 90%;
      max-height: 7in;
      object-fit: contain;
      border-radius: 12px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.15);
    }

    /* ===== TEXT PAGE (Right of spread) ===== */
    .text-page {
      background: #fffef9;
      display: flex;
      flex-direction: column;
      padding: 60px 55px;
    }
    .chapter-text {
      font-size: 15px;
      color: #3d4852;
      line-height: 1.85;
      text-align: justify;
      hyphens: auto;
    }
    .chapter-text p {
      margin-bottom: 14px;
      text-indent: 20px;
    }
    .chapter-text p:first-child {
      text-indent: 0;
    }
    .chapter-text p:first-child::first-letter {
      font-size: 42px;
      float: left;
      line-height: 1;
      margin-right: 8px;
      margin-top: 4px;
      color: #d4af37;
      font-weight: bold;
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
      font-size: 36px;
      color: #2c3e50;
      letter-spacing: 8px;
      font-style: italic;
    }
    .end-ornament {
      font-size: 24px;
      color: #d4af37;
      margin-top: 30px;
    }
  </style>
</head>
<body>

  <!-- COVER -->
  <div class="page cover-page">
    <img class="cover-image" src="${coverImg}" alt="Sofia, Luca and AIKO reading together">
    <h1 class="cover-title">AIKO</h1>
    <p class="cover-subtitle">AI Explained to Children</p>
    <p class="cover-author">Written by Gianni Parola<br>Illustrated by Pina Pennello</p>
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
  <!-- CHAPTER ${ch.number} - IMAGE PAGE -->
  <div class="page image-page">
    <div class="chapter-header">
      <p class="chapter-number">Chapter ${ch.number}</p>
      <h2 class="chapter-title">${ch.title}</h2>
    </div>
    <img class="chapter-image" src="${chapterImages[idx]}" alt="Illustration for Chapter ${ch.number}">
  </div>

  <!-- CHAPTER ${ch.number} - TEXT PAGE -->
  <div class="page text-page">
    <div class="chapter-text">
      ${ch.text.split('\n\n').map(p => `<p>${p.trim()}</p>`).join('\n      ')}
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
  const htmlPath = path.join(OUTPUT_DIR, 'AIKO-Spread-Layout.html');
  fs.writeFileSync(htmlPath, html);
  console.log(`\n✅ HTML saved: ${htmlPath}`);

  // Generate PDF
  console.log('\n📄 Generating PDF...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('img');
  await new Promise(r => setTimeout(r, 3000));

  const pdfPath = path.join(OUTPUT_DIR, 'AIKO-Spread-Layout.pdf');
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
  const epubPath = path.join(OUTPUT_DIR, 'AIKO-Spread-Layout.epub');

  await new Promise(resolve => {
    exec(`pandoc "${htmlPath}" -o "${epubPath}" --metadata title="AIKO" --metadata author="Gianni Parola"`, () => {
      if (fs.existsSync(epubPath)) {
        const epubSize = (fs.statSync(epubPath).size / 1024 / 1024).toFixed(1);
        console.log(`✅ ePub: ${epubPath} (${epubSize} MB)`);
      }
      resolve();
    });
  });

  console.log('\n✅ SPREAD LAYOUT COMPLETE!');
  console.log(`\n📊 Pages: ${2 + chapters.length * 2 + 1} (cover, dedication, ${chapters.length} chapters x 2 pages, end)`);

  return { htmlPath, pdfPath, epubPath };
}

createSpreadLayout().catch(console.error);
