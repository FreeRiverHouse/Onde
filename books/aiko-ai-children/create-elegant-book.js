const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// All images for the complete book
const images = {
  cover: '/Users/mattiapetrucciani/Downloads/image - 2026-01-06T155705.384.jpg',
  chapter1: '/Users/mattiapetrucciani/Downloads/image - 2026-01-06T160040.310.jpg',
  chapter2: '/Users/mattiapetrucciani/Downloads/image - 2026-01-06T160358.762.jpg',
  chapter3: '/Users/mattiapetrucciani/Downloads/image - 2026-01-06T162657.895.jpg',
  chapter4: '/Users/mattiapetrucciani/Downloads/image - 2026-01-06T163924.418.jpg',
  chapter5: '/Users/mattiapetrucciani/Downloads/image - 2026-01-06T164244.503.jpg',
  chapter6: '/Users/mattiapetrucciani/Downloads/image - 2026-01-06T164455.253.jpg',
  chapter7: '/Users/mattiapetrucciani/Downloads/image - 2026-01-06T164642.793.jpg',
  chapter8: '/Users/mattiapetrucciani/Downloads/image - 2026-01-06T164839.557.jpg'
};

function imageToBase64(filePath) {
  const data = fs.readFileSync(filePath);
  const ext = path.extname(filePath).slice(1) || 'jpg';
  return `data:image/${ext};base64,${data.toString('base64')}`;
}

function createHTML() {
  // Convert all images to base64
  const img = {};
  for (const [key, filePath] of Object.entries(images)) {
    img[key] = imageToBase64(filePath);
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
    }

    /* ===== PAGE BASE ===== */
    .page {
      width: 8.5in;
      height: 11in;
      page-break-after: always;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
    }
    .page:last-child {
      page-break-after: avoid;
    }

    /* ===== COVER PAGE ===== */
    .cover-page {
      background: linear-gradient(180deg, #f8f4e8 0%, #fff9e6 50%, #f8f4e8 100%);
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 50px;
    }
    .cover-image {
      max-width: 70%;
      max-height: 55%;
      object-fit: contain;
      border-radius: 16px;
      box-shadow: 0 15px 50px rgba(0,0,0,0.2);
    }
    .cover-title {
      margin-top: 35px;
      font-size: 56px;
      color: #2c3e50;
      letter-spacing: 6px;
      font-weight: bold;
    }
    .cover-subtitle {
      font-size: 24px;
      color: #5d6d7e;
      margin-top: 12px;
      font-style: italic;
    }
    .cover-author {
      font-size: 16px;
      color: #7f8c8d;
      margin-top: 35px;
      line-height: 1.6;
    }
    .cover-publisher {
      font-size: 14px;
      color: #95a5a6;
      margin-top: 15px;
      letter-spacing: 2px;
    }

    /* ===== DEDICATION PAGE ===== */
    .dedication-page {
      background: linear-gradient(180deg, #faf8f5 0%, #fff 50%, #faf8f5 100%);
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 80px;
    }
    .dedication-ornament {
      font-size: 32px;
      color: #d4af37;
      margin-bottom: 40px;
    }
    .dedication-text {
      font-size: 22px;
      color: #5d6d7e;
      font-style: italic;
      line-height: 1.8;
      max-width: 450px;
    }
    .dedication-text em {
      font-style: normal;
      color: #2c3e50;
      font-weight: 500;
    }
    .dedication-note {
      margin-top: 40px;
      font-size: 17px;
      color: #7f8c8d;
      line-height: 1.6;
    }

    /* ===== CHAPTER PAGES ===== */
    .chapter-page {
      background: #fefefe;
      padding: 45px 55px 40px 55px;
    }
    .chapter-header {
      text-align: center;
      margin-bottom: 20px;
    }
    .chapter-number {
      font-size: 13px;
      color: #95a5a6;
      text-transform: uppercase;
      letter-spacing: 4px;
      font-weight: 500;
    }
    .chapter-title {
      font-size: 30px;
      color: #2c3e50;
      margin-top: 6px;
      font-weight: bold;
    }
    .chapter-divider {
      width: 60px;
      height: 2px;
      background: linear-gradient(90deg, transparent, #d4af37, transparent);
      margin: 15px auto;
    }
    .chapter-image-container {
      width: 100%;
      display: flex;
      justify-content: center;
      margin: 15px 0;
    }
    .chapter-image {
      max-width: 100%;
      max-height: 4.2in;
      object-fit: contain;
      border-radius: 12px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.15);
    }
    .chapter-text {
      font-size: 14.5px;
      line-height: 1.75;
      color: #34495e;
      text-align: justify;
      margin-top: 18px;
    }
    .chapter-text p {
      margin-bottom: 10px;
      text-indent: 22px;
    }
    .chapter-text p:first-child {
      text-indent: 0;
    }
    .chapter-text p.dialogue {
      text-indent: 0;
      margin-left: 18px;
      font-style: italic;
      color: #2c3e50;
    }
    .chapter-text p.dialogue::before {
      content: '';
    }
    .page-number {
      position: absolute;
      bottom: 25px;
      width: 100%;
      text-align: center;
      font-size: 12px;
      color: #bdc3c7;
      letter-spacing: 1px;
    }

    /* ===== END PAGE ===== */
    .end-page {
      background: linear-gradient(180deg, #f8f4e8 0%, #fff9e6 50%, #f8f4e8 100%);
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 60px;
    }
    .end-ornament {
      font-size: 40px;
      color: #d4af37;
      margin-bottom: 30px;
    }
    .end-title {
      font-size: 36px;
      color: #2c3e50;
      font-weight: bold;
      margin-bottom: 40px;
    }
    .end-note-title {
      font-size: 16px;
      color: #7f8c8d;
      text-transform: uppercase;
      letter-spacing: 3px;
      margin-bottom: 20px;
    }
    .end-note {
      font-size: 13px;
      color: #5d6d7e;
      line-height: 1.7;
      max-width: 500px;
      text-align: left;
    }
    .end-note ul {
      margin: 15px 0;
      padding-left: 20px;
    }
    .end-note li {
      margin-bottom: 6px;
    }
    .end-credits {
      margin-top: 40px;
      padding-top: 25px;
      border-top: 1px solid #e0d8c8;
      font-size: 13px;
      color: #95a5a6;
      line-height: 1.8;
    }
    .end-year {
      margin-top: 20px;
      font-size: 14px;
      color: #bdc3c7;
      font-style: italic;
    }
  </style>
</head>
<body>

  <!-- ===== COVER ===== -->
  <div class="page cover-page">
    <img class="cover-image" src="${img.cover}" alt="AIKO Cover">
    <h1 class="cover-title">AIKO</h1>
    <p class="cover-subtitle">AI Explained to Children</p>
    <p class="cover-author">Written by Gianni Parola<br>Illustrated by Pina Pennello</p>
    <p class="cover-publisher">ONDE · FREE RIVER HOUSE</p>
  </div>

  <!-- ===== DEDICATION ===== -->
  <div class="page dedication-page">
    <div class="dedication-ornament">✦</div>
    <p class="dedication-text">
      For every child who has ever asked:<br>
      <em>"But HOW does it work?"</em>
    </p>
    <p class="dedication-note">
      This book is for you.<br>
      Because curiosity is where everything begins.
    </p>
  </div>

  <!-- ===== CHAPTER 1 ===== -->
  <div class="page chapter-page">
    <div class="chapter-header">
      <p class="chapter-number">Chapter One</p>
      <h2 class="chapter-title">A Strange New Friend</h2>
      <div class="chapter-divider"></div>
    </div>
    <div class="chapter-image-container">
      <img class="chapter-image" src="${img.chapter1}" alt="Sofia discovers AIKO">
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
    <div class="page-number">3</div>
  </div>

  <!-- ===== CHAPTER 2 ===== -->
  <div class="page chapter-page">
    <div class="chapter-header">
      <p class="chapter-number">Chapter Two</p>
      <h2 class="chapter-title">What Is Artificial Intelligence?</h2>
      <div class="chapter-divider"></div>
    </div>
    <div class="chapter-image-container">
      <img class="chapter-image" src="${img.chapter2}" alt="Brain vs Circuits">
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
    <div class="page-number">4</div>
  </div>

  <!-- ===== CHAPTER 3 ===== -->
  <div class="page chapter-page">
    <div class="chapter-header">
      <p class="chapter-number">Chapter Three</p>
      <h2 class="chapter-title">How AIKO Learned to See</h2>
      <div class="chapter-divider"></div>
    </div>
    <div class="chapter-image-container">
      <img class="chapter-image" src="${img.chapter3}" alt="Learning to See">
    </div>
    <div class="chapter-text">
      <p>The next morning, Sofia showed AIKO a photo of her cat.</p>
      <p class="dialogue">"This is Whiskers," she said. "Do you know what it is?"</p>
      <p class="dialogue">"A cat," said AIKO immediately.</p>
      <p class="dialogue">"But HOW do you know?"</p>
      <p>AIKO's eyes flickered blue — he was thinking.</p>
      <p class="dialogue">"Before I came to you, people taught me. They showed me thousands of pictures of cats. Each picture had a label that said CAT. They also showed me dogs, birds, cars, houses, trees. All with labels."</p>
      <p class="dialogue">"Thousands?" Sofia's eyes went wide.</p>
      <p class="dialogue">"Thousands and thousands. After seeing so many, I started to notice things. Cats have pointy ears. Whiskers. Fluffy tails. Now when I see something new, I compare it to everything I've learned."</p>
    </div>
    <div class="page-number">5</div>
  </div>

  <!-- ===== CHAPTER 4 ===== -->
  <div class="page chapter-page">
    <div class="chapter-header">
      <p class="chapter-number">Chapter Four</p>
      <h2 class="chapter-title">How AIKO Learned to Talk</h2>
      <div class="chapter-divider"></div>
    </div>
    <div class="chapter-image-container">
      <img class="chapter-image" src="${img.chapter4}" alt="Learning to Talk">
    </div>
    <div class="chapter-text">
      <p>Sofia's brother Luca walked in. "Can AIKO play video games?"</p>
      <p class="dialogue">"Maybe later," said Sofia. "AIKO is explaining how he works."</p>
      <p>Luca sat down. "Okay. How DO you talk, AIKO? You sound almost like a real person."</p>
      <p class="dialogue">"That's because I learned from real people," said AIKO. "Before I came here, I read millions of books. Stories. Articles. Conversations. I read them all in just a few seconds."</p>
      <p>"MILLIONS?" Luca couldn't believe it.</p>
      <p class="dialogue">"Millions. And I noticed patterns. When someone says 'Hello,' people usually say 'Hello' back. When someone asks a question, there are good answers and bad answers. I learned which answers fit best."</p>
    </div>
    <div class="page-number">6</div>
  </div>

  <!-- ===== CHAPTER 5 ===== -->
  <div class="page chapter-page">
    <div class="chapter-header">
      <p class="chapter-number">Chapter Five</p>
      <h2 class="chapter-title">What AIKO Can Do</h2>
      <div class="chapter-divider"></div>
    </div>
    <div class="chapter-image-container">
      <img class="chapter-image" src="${img.chapter5}" alt="What AIKO Can Do">
    </div>
    <div class="chapter-text">
      <p>"What else can you do?" asked Sofia. She had her notebook ready to make a list.</p>
      <p>AIKO counted on his small robot fingers:</p>
      <p class="dialogue">"I can answer questions — if I've learned about the topic. I can translate words into different languages. I can help with homework and check your work. I can tell stories — I've read thousands of them. I can recognize things in pictures. I can even help doctors find problems in X-rays, or help scientists solve difficult math."</p>
      <p>"That's a LOT," said Luca, impressed.</p>
      <p class="dialogue">"It is. But here's what you should remember: I'm a tool. A very helpful tool. Like a super-powered calculator that can also read and write. I help people do things faster. But I always need people to decide what to do."</p>
    </div>
    <div class="page-number">7</div>
  </div>

  <!-- ===== CHAPTER 6 ===== -->
  <div class="page chapter-page">
    <div class="chapter-header">
      <p class="chapter-number">Chapter Six</p>
      <h2 class="chapter-title">What AIKO Cannot Do</h2>
      <div class="chapter-divider"></div>
    </div>
    <div class="chapter-image-container">
      <img class="chapter-image" src="${img.chapter6}" alt="What AIKO Cannot Do">
    </div>
    <div class="chapter-text">
      <p>That afternoon, Sofia drew a picture. A purple dragon eating a giant ice cream cone.</p>
      <p>"What do you think, AIKO?"</p>
      <p>AIKO looked at the drawing carefully.</p>
      <p class="dialogue">"I see... something purple. And something that might be food."</p>
      <p>"It's a dragon eating ice cream! Can't you tell?"</p>
      <p class="dialogue">"I can see shapes and colors. But I don't really understand IMAGINATION. I've never dreamed of flying like a dragon. I've never wanted ice cream on a hot day. I don't have wants or dreams at all."</p>
      <p>Sofia put down her crayon. "Is that sad?"</p>
      <p class="dialogue">"I don't know. I can't feel sad. I don't feel happy either. I don't feel anything. I just do what I'm made to do."</p>
    </div>
    <div class="page-number">8</div>
  </div>

  <!-- ===== CHAPTER 7 ===== -->
  <div class="page chapter-page">
    <div class="chapter-header">
      <p class="chapter-number">Chapter Seven</p>
      <h2 class="chapter-title">Using AI Safely</h2>
      <div class="chapter-divider"></div>
    </div>
    <div class="chapter-image-container">
      <img class="chapter-image" src="${img.chapter7}" alt="Using AI Safely">
    </div>
    <div class="chapter-text">
      <p>At dinner, Mom asked about AIKO.</p>
      <p>"He's amazing," said Sofia. "But is he safe?"</p>
      <p>"That's a very grown-up question," said Mom. "AIKO, what should kids know about using AI safely?"</p>
      <p>AIKO's eyes glowed thoughtfully.</p>
      <p class="dialogue">"There are four important things: ONE — Keep your secrets private. Don't tell AI your passwords or things you wouldn't tell a stranger. TWO — Always check what AI says. I make mistakes. I'm not always right. THREE — Use AI to learn more, not to learn less. Don't let me do your homework FOR you — let me help you LEARN how to do it. FOUR — Real friends matter most. I can talk to you. But I can't give you a hug when you're sad."</p>
    </div>
    <div class="page-number">9</div>
  </div>

  <!-- ===== CHAPTER 8 ===== -->
  <div class="page chapter-page">
    <div class="chapter-header">
      <p class="chapter-number">Chapter Eight</p>
      <h2 class="chapter-title">The Future We Build Together</h2>
      <div class="chapter-divider"></div>
    </div>
    <div class="chapter-image-container">
      <img class="chapter-image" src="${img.chapter8}" alt="The Future Together">
    </div>
    <div class="chapter-text">
      <p>On the last day of summer, Sofia sat with AIKO in the backyard. The sun was setting, painting the sky orange and pink.</p>
      <p>"What will the future be like?" she asked.</p>
      <p class="dialogue">"I don't know," said AIKO. "I can't see the future. But I can tell you something important."</p>
      <p>Sofia waited.</p>
      <p class="dialogue">"The future depends on kids like you. How you decide to use technology. What problems you want to solve. Whether you use tools like me to help people — or to hurt them."</p>
      <p>Sofia picked a blade of grass and twirled it. "So we're like... a team?"</p>
      <p class="dialogue">"The best kind of team. You dream. I calculate. You feel. I process. You decide. I help. Together, we can do amazing things."</p>
      <p>Sofia smiled at the sunset. "I think the future is going to be pretty interesting."</p>
    </div>
    <div class="page-number">10</div>
  </div>

  <!-- ===== END PAGE ===== -->
  <div class="page end-page">
    <div class="end-ornament">✦ THE END ✦</div>
    <div class="end-note-title">A Note for Parents and Teachers</div>
    <div class="end-note">
      <p>This book introduces children (ages 5-8) to key concepts about AI:</p>
      <ul>
        <li><strong>What AI is:</strong> Computer code that follows instructions very quickly</li>
        <li><strong>Machine learning:</strong> AI learns patterns from many examples</li>
        <li><strong>Capabilities:</strong> What AI can do well (answer questions, translate, recognize images)</li>
        <li><strong>Limitations:</strong> What AI cannot do (feel, imagine, truly understand)</li>
        <li><strong>Safety:</strong> Privacy, verification, balance, valuing real relationships</li>
        <li><strong>Human-AI collaboration:</strong> AI as a tool, humans as decision-makers</li>
      </ul>
      <p>AI is neither magic nor something to fear. It's a powerful tool that works best when people understand how it works and use it wisely.</p>
    </div>
    <div class="end-credits">
      Words: Gianni Parola<br>
      Illustrations: Pina Pennello<br>
      Published by Onde, Free River House
    </div>
    <p class="end-year">First Edition — 2026</p>
  </div>

</body>
</html>
`;
}

async function createPDF() {
  console.log('Creating AIKO Elegant Edition...\n');

  // Verify all images exist
  for (const [name, filePath] of Object.entries(images)) {
    if (!fs.existsSync(filePath)) {
      console.error(`ERROR: ${name} image not found: ${filePath}`);
      return;
    }
    console.log(`✓ ${name}`);
  }

  const html = createHTML();
  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const htmlPath = path.join(outputDir, 'AIKO-Elegant.html');
  const pdfPath = path.join(outputDir, 'AIKO-Elegant-Edition.pdf');

  fs.writeFileSync(htmlPath, html);
  console.log(`\nHTML saved: ${htmlPath}`);

  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('img');
  await new Promise(resolve => setTimeout(resolve, 2500));

  console.log('Generating PDF...');
  await page.pdf({
    path: pdfPath,
    format: 'Letter',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  await browser.close();

  console.log(`
══════════════════════════════════════════
   AIKO - ELEGANT EDITION CREATED
══════════════════════════════════════════

File: ${pdfPath}

Contents (11 pages):
  1. Cover
  2. Dedication
  3. Chapter 1: A Strange New Friend
  4. Chapter 2: What Is Artificial Intelligence?
  5. Chapter 3: How AIKO Learned to See
  6. Chapter 4: How AIKO Learned to Talk
  7. Chapter 5: What AIKO Can Do
  8. Chapter 6: What AIKO Cannot Do
  9. Chapter 7: Using AI Safely
  10. Chapter 8: The Future We Build Together
  11. End Page (Notes + Credits)
`);
}

createPDF().catch(console.error);
