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

// Chapter data with text broken into small blocks
const chapters = [
  {
    number: "One",
    title: "A Strange New Friend",
    image: "chapter1",
    text: [
      "On her seventh birthday, Sofia found a cardboard box with her name on it.",
      "Inside was something she had never seen before.",
      "A small robot, round like a ball, white and smooth as an egg. Two big blue eyes blinked when she looked at it.",
      `"Hello," it said. "I'm AIKO."`,
      `Sofia jumped back, then laughed. "You can TALK!"`,
      `"I can," said AIKO. "Would you like to know how?"`,
      "Sofia nodded. She always wanted to know how things worked."
    ]
  },
  {
    number: "Two",
    title: "What Is Artificial Intelligence?",
    image: "chapter2",
    text: [
      `"First," said AIKO, "let me tell you what I am. I'm made of something called Artificial Intelligence. AI for short."`,
      `"That sounds complicated," said Sofia.`,
      `"Not really. Think about your brain. Your brain learns things. It remembers. It solves problems."`,
      `Sofia touched her head. "Okay..."`,
      `"I have something similar inside me. But instead of cells, I'm made of computer code. Millions of tiny instructions that tell me what to do."`,
      `"Like a recipe?" asked Sofia.`,
      `"Exactly like a recipe! A very, very long recipe. And I can follow it faster than you can blink."`
    ]
  },
  {
    number: "Three",
    title: "How AIKO Learned to See",
    image: "chapter3",
    text: [
      "The next morning, Sofia showed AIKO a photo of her cat.",
      `"This is Whiskers," she said. "Do you know what it is?"`,
      `"A cat," said AIKO immediately.`,
      `"But HOW do you know?"`,
      `AIKO's eyes flickered blue — he was thinking.`,
      `"Before I came to you, people taught me. They showed me thousands of pictures of cats. Each picture had a label that said CAT."`,
      `"Thousands?" Sofia's eyes went wide.`,
      `"Thousands and thousands. After seeing so many, I started to notice things. Now when I see something new, I compare it to everything I've learned."`
    ]
  },
  {
    number: "Four",
    title: "How AIKO Learned to Talk",
    image: "chapter4",
    text: [
      `Sofia's brother Luca walked in. "Can AIKO play video games?"`,
      `"Maybe later," said Sofia. "AIKO is explaining how he works."`,
      `Luca sat down. "How DO you talk, AIKO?"`,
      `"I learned from real people," said AIKO. "Before I came here, I read millions of books. Stories. Articles. Conversations."`,
      `"MILLIONS?" Luca couldn't believe it.`,
      `"Millions. And I noticed patterns. When someone says 'Hello,' people usually say 'Hello' back. I learned which answers fit best."`
    ]
  },
  {
    number: "Five",
    title: "What AIKO Can Do",
    image: "chapter5",
    text: [
      `"What else can you do?" asked Sofia. She had her notebook ready to make a list.`,
      `AIKO counted on his small robot fingers:`,
      `"I can answer questions. I can translate words into different languages. I can help with homework. I can tell stories. I can recognize things in pictures."`,
      `"That's a LOT," said Luca, impressed.`,
      `"It is. But here's what you should remember: I'm a tool. A very helpful tool. I help people do things faster. But I always need people to decide what to do."`,
      `"So you're like a helper?" asked Sofia.`,
      `"A helper. Not a boss. The human is always in charge."`
    ]
  },
  {
    number: "Six",
    title: "What AIKO Cannot Do",
    image: "chapter6",
    text: [
      "That afternoon, Sofia drew a picture. A purple dragon eating ice cream.",
      `"What do you think, AIKO?"`,
      `AIKO looked at the drawing carefully. "I see... something purple. And something that might be food."`,
      `"It's a dragon eating ice cream! Can't you tell?"`,
      `"I can see shapes and colors. But I don't really understand IMAGINATION. I've never dreamed of flying like a dragon."`,
      `Sofia put down her crayon. "Is that sad?"`,
      `"I don't know. I can't feel sad. I don't feel anything. I just do what I'm made to do."`
    ]
  },
  {
    number: "Seven",
    title: "Using AI Safely",
    image: "chapter7",
    text: [
      `At dinner, Mom asked about AIKO.`,
      `"He's amazing," said Sofia. "But is he safe?"`,
      `AIKO's eyes glowed thoughtfully.`,
      `"There are four important things: ONE — Keep your secrets private. TWO — Always check what AI says. I make mistakes."`,
      `"THREE — Use AI to learn more, not less. Let me help you LEARN, not do your homework for you."`,
      `"FOUR — Real friends matter most. I can talk to you. But I can't give you a hug when you're sad."`
    ]
  },
  {
    number: "Eight",
    title: "The Future We Build Together",
    image: "chapter8",
    text: [
      "On the last day of summer, Sofia sat with AIKO in the backyard. The sun was setting.",
      `"What will the future be like?" she asked.`,
      `"I don't know," said AIKO. "But I can tell you something important."`,
      `"The future depends on kids like you. How you decide to use technology. Whether you use tools like me to help people — or to hurt them."`,
      `Sofia picked a blade of grass. "So we're like... a team?"`,
      `"The best kind of team. You dream. I calculate. You feel. I process. Together, we can do amazing things."`
    ]
  }
];

function createHTML() {
  const img = {};
  for (const [key, filePath] of Object.entries(images)) {
    img[key] = imageToBase64(filePath);
  }

  // Generate chapter pages
  const chapterPages = chapters.map((ch, idx) => `
  <!-- CHAPTER ${idx + 1} -->
  <div class="page chapter-page">
    <div class="chapter-header">
      <span class="chapter-label">Chapter ${ch.number}</span>
      <h2 class="chapter-title">${ch.title}</h2>
    </div>
    <div class="illustration-container">
      <img src="${img[ch.image]}" alt="${ch.title}">
    </div>
    <div class="text-container">
      ${ch.text.map(p => `<p>${p}</p>`).join('\n      ')}
    </div>
    <div class="page-number">${idx + 3}</div>
  </div>
  `).join('\n');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap');

    @page {
      size: 8.5in 11in;
      margin: 0;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Nunito', 'Arial Rounded MT Bold', 'Helvetica Rounded', sans-serif;
    }

    /* ===== PAGE BASE ===== */
    .page {
      width: 8.5in;
      height: 11in;
      page-break-after: always;
      position: relative;
      overflow: hidden;
      background: #fffef9;
    }
    .page:last-child {
      page-break-after: avoid;
    }

    /* ===== COVER PAGE ===== */
    .cover-page {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 0.75in;
      background: linear-gradient(180deg, #fef9e7 0%, #fdf6e3 100%);
    }
    .cover-image {
      width: 6in;
      height: auto;
      max-height: 6in;
      object-fit: contain;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
    }
    .cover-title {
      margin-top: 0.4in;
      font-size: 54pt;
      font-weight: 700;
      color: #2c3e50;
      letter-spacing: 6px;
    }
    .cover-subtitle {
      margin-top: 0.15in;
      font-size: 20pt;
      font-weight: 400;
      color: #5d6d7e;
      font-style: italic;
    }
    .cover-credits {
      margin-top: 0.5in;
      font-size: 12pt;
      color: #7f8c8d;
      line-height: 1.6;
    }
    .cover-publisher {
      margin-top: 0.25in;
      font-size: 11pt;
      color: #95a5a6;
      letter-spacing: 3px;
      text-transform: uppercase;
    }

    /* ===== DEDICATION PAGE ===== */
    .dedication-page {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 1.5in;
      background: #fffef9;
    }
    .dedication-mark {
      font-size: 36pt;
      color: #d4a574;
      margin-bottom: 0.5in;
    }
    .dedication-text {
      font-size: 18pt;
      color: #5d6d7e;
      font-style: italic;
      line-height: 1.8;
      max-width: 5in;
    }
    .dedication-text strong {
      font-style: normal;
      color: #2c3e50;
    }
    .dedication-note {
      margin-top: 0.5in;
      font-size: 14pt;
      color: #7f8c8d;
      line-height: 1.6;
    }

    /* ===== CHAPTER PAGES ===== */
    .chapter-page {
      display: flex;
      flex-direction: column;
      padding: 0.5in 0.6in 0.4in 0.6in;
    }
    .chapter-header {
      text-align: center;
      margin-bottom: 0.2in;
    }
    .chapter-label {
      display: block;
      font-size: 11pt;
      color: #95a5a6;
      text-transform: uppercase;
      letter-spacing: 4px;
      font-weight: 600;
    }
    .chapter-title {
      font-size: 24pt;
      font-weight: 700;
      color: #2c3e50;
      margin-top: 0.05in;
    }

    /* Illustration - takes 60% of available space */
    .illustration-container {
      flex: 0 0 auto;
      height: 5.5in;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.25in;
    }
    .illustration-container img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      border-radius: 12px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
    }

    /* Text container - remaining space with breathing room */
    .text-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      padding: 0 0.3in;
      overflow: hidden;
    }
    .text-container p {
      font-size: 12pt;
      line-height: 1.55;
      color: #34495e;
      margin-bottom: 0.08in;
      text-align: left;
    }

    .page-number {
      position: absolute;
      bottom: 0.35in;
      width: 100%;
      text-align: center;
      font-size: 10pt;
      color: #bdc3c7;
    }

    /* ===== END PAGE ===== */
    .end-page {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 1in;
      background: linear-gradient(180deg, #fef9e7 0%, #fdf6e3 100%);
    }
    .end-mark {
      font-size: 28pt;
      color: #d4a574;
      margin-bottom: 0.6in;
    }
    .end-note-title {
      font-size: 12pt;
      color: #7f8c8d;
      text-transform: uppercase;
      letter-spacing: 3px;
      margin-bottom: 0.3in;
    }
    .end-note {
      font-size: 11pt;
      color: #5d6d7e;
      line-height: 1.7;
      max-width: 5.5in;
      text-align: left;
    }
    .end-note ul {
      margin: 0.2in 0;
      padding-left: 0.3in;
    }
    .end-note li {
      margin-bottom: 0.08in;
    }
    .end-credits {
      margin-top: 0.5in;
      padding-top: 0.3in;
      border-top: 1px solid #e0d8c8;
      font-size: 11pt;
      color: #95a5a6;
      line-height: 1.8;
    }
    .end-year {
      margin-top: 0.25in;
      font-size: 12pt;
      color: #bdc3c7;
      font-style: italic;
    }
  </style>
</head>
<body>

  <!-- COVER -->
  <div class="page cover-page">
    <img class="cover-image" src="${img.cover}" alt="AIKO">
    <h1 class="cover-title">AIKO</h1>
    <p class="cover-subtitle">AI Explained to Children</p>
    <p class="cover-credits">Written by Gianni Parola<br>Illustrated by Pino Pennello</p>
    <p class="cover-publisher">Onde · Free River House</p>
  </div>

  <!-- DEDICATION -->
  <div class="page dedication-page">
    <div class="dedication-mark">✦</div>
    <p class="dedication-text">
      For every child who has ever asked:<br>
      <strong>"But HOW does it work?"</strong>
    </p>
    <p class="dedication-note">
      This book is for you.<br>
      Because curiosity is where everything begins.
    </p>
    <div class="page-number">2</div>
  </div>

  ${chapterPages}

  <!-- END PAGE -->
  <div class="page end-page">
    <div class="end-mark">✦ The End ✦</div>
    <p class="end-note-title">A Note for Parents and Teachers</p>
    <div class="end-note">
      <p>This book introduces children (ages 5-8) to key concepts about AI:</p>
      <ul>
        <li><strong>What AI is</strong> — Computer code that follows instructions very quickly</li>
        <li><strong>Machine learning</strong> — AI learns patterns from many examples</li>
        <li><strong>Capabilities</strong> — What AI can do well</li>
        <li><strong>Limitations</strong> — What AI cannot do (feel, imagine, truly understand)</li>
        <li><strong>Safety</strong> — Privacy, verification, balance, valuing real relationships</li>
      </ul>
      <p>AI is neither magic nor something to fear. It's a powerful tool that works best when people understand how it works and use it wisely.</p>
    </div>
    <div class="end-credits">
      Words: Gianni Parola<br>
      Illustrations: Pino Pennello<br>
      Published by Onde, Free River House
    </div>
    <p class="end-year">First Edition — 2026</p>
  </div>

</body>
</html>
`;
}

async function createPDF() {
  console.log('Creating AIKO Professional Edition...\n');

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

  const htmlPath = path.join(outputDir, 'AIKO-Professional.html');
  const pdfPath = path.join(outputDir, 'AIKO-Professional-Edition.pdf');

  fs.writeFileSync(htmlPath, html);
  console.log(`\nHTML saved: ${htmlPath}`);

  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('img');
  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log('Generating PDF...');
  await page.pdf({
    path: pdfPath,
    width: '8.5in',
    height: '11in',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  await browser.close();

  console.log(`
══════════════════════════════════════════════════
   AIKO - PROFESSIONAL EDITION
══════════════════════════════════════════════════

File: ${pdfPath}

Layout based on Grok's recommendations:
  • Split-page: 60% illustration, 40% text
  • Sans-serif font (Nunito) at 12pt
  • Left-aligned text for easy reading
  • Generous white space
  • No overcrowding

Contents (11 pages):
  1. Cover
  2. Dedication
  3-10. Chapters 1-8
  11. End Page
`);
}

createPDF().catch(console.error);
