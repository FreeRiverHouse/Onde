const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Image mapping - Italian Watercolor Style (AIKO with consistent character design)
// Cover, Chapter 1, Chapter 5: Original images (approved)
// Chapters 2,3,4,6,7,8: Regenerated with consistent AIKO design (blue LED eyes, silver-gray body)
const images = {
  cover: '/Users/mattiapetrucciani/Downloads/image (94).jpg',
  chapter1: '/Users/mattiapetrucciani/Downloads/image (95).jpg',
  chapter2: '/Users/mattiapetrucciani/Downloads/image - 2026-01-06T152638.840.jpg',
  chapter3: '/Users/mattiapetrucciani/Downloads/image - 2026-01-06T152936.792.jpg',
  chapter4: '/Users/mattiapetrucciani/Downloads/image - 2026-01-06T153233.874.jpg',
  chapter5: '/Users/mattiapetrucciani/Downloads/image - 2026-01-06T145820.936.jpg',
  chapter6: '/Users/mattiapetrucciani/Downloads/image - 2026-01-06T153545.557.jpg',
  chapter7: '/Users/mattiapetrucciani/Downloads/image - 2026-01-06T154014.125.jpg',
  chapter8: '/Users/mattiapetrucciani/Downloads/image - 2026-01-06T154609.071.jpg',
  logoFRH: '/Users/mattiapetrucciani/CascadeProjects/Onde/books/psalm-23-abundance/images/logo-frh.jpg',
  logoOnde: '/Users/mattiapetrucciani/CascadeProjects/Onde/books/psalm-23-abundance/images/logo-onde.jpg'
};

function imageToBase64(filePath) {
  const data = fs.readFileSync(filePath);
  const ext = path.extname(filePath).slice(1);
  return `data:image/${ext};base64,${data.toString('base64')}`;
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
      background: linear-gradient(135deg, #f5f0e8 0%, #fff 50%, #f0e8dc 100%);
      padding: 0;
    }
    .cover-page img {
      max-width: 100%;
      max-height: 75%;
      object-fit: contain;
      border-radius: 8px;
    }
    .cover-page h1 {
      font-size: 48px;
      color: #2c3e50;
      margin-top: 20px;
      letter-spacing: 4px;
    }
    .cover-page .subtitle {
      font-size: 22px;
      color: #7f8c8d;
      margin-top: 8px;
      font-style: italic;
    }
    .cover-page .author {
      font-size: 14px;
      color: #95a5a6;
      margin-top: 20px;
    }
    .cover-page .logos {
      position: absolute;
      bottom: 30px;
      display: flex;
      gap: 30px;
      align-items: center;
    }
    .cover-page .logos img {
      height: 50px;
      width: auto;
      max-width: none;
      max-height: none;
      opacity: 0.85;
      mix-blend-mode: multiply;
      border-radius: 0;
      box-shadow: none;
    }

    /* Chapter Pages */
    .chapter-page img {
      max-width: 90%;
      max-height: 55%;
      object-fit: contain;
      border-radius: 6px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }
    .chapter-page h2 {
      font-size: 28px;
      color: #34495e;
      margin-top: 20px;
      text-align: center;
    }
    .chapter-page .chapter-num {
      font-size: 14px;
      color: #95a5a6;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 5px;
    }
    .chapter-page p {
      font-size: 15px;
      color: #555;
      max-width: 85%;
      text-align: center;
      line-height: 1.7;
      margin-top: 15px;
    }

    /* Text Pages */
    .text-page {
      justify-content: flex-start;
      padding: 0.75in;
      background: #fffdf8;
    }
    .text-page h2 {
      font-size: 24px;
      color: #34495e;
      margin-bottom: 20px;
      text-align: center;
      width: 100%;
    }
    .text-page .content {
      font-size: 16px;
      color: #333;
      line-height: 1.9;
      text-align: left;
      max-width: 100%;
    }
    .text-page .content p {
      margin-bottom: 16px;
      text-indent: 0;
    }
    .text-page .dialogue {
      margin-left: 20px;
      font-style: italic;
    }

    /* Dedication Page */
    .dedication-page {
      background: #faf8f5;
    }
    .dedication-page .content {
      text-align: center;
      font-style: italic;
      font-size: 18px;
      color: #666;
      line-height: 2;
    }

    /* End Page */
    .end-page {
      background: linear-gradient(135deg, #f5f0e8 0%, #fff 100%);
    }
    .end-page h2 {
      font-size: 36px;
      color: #34495e;
    }
    .end-page .credits {
      margin-top: 40px;
      font-size: 14px;
      color: #7f8c8d;
      text-align: center;
      line-height: 2;
    }
    .end-page .logos {
      margin-top: 40px;
      display: flex;
      gap: 40px;
      align-items: center;
      justify-content: center;
    }
    .end-page .logos img {
      height: 70px;
      width: auto;
      opacity: 0.9;
      mix-blend-mode: multiply;
    }
  </style>
</head>
<body>
  <!-- Cover -->
  <div class="page cover-page">
    <img src="${img.cover}" alt="Cover">
    <h1>AIKO</h1>
    <div class="subtitle">AI Explained to Children</div>
    <div class="author">Written by Gianni Parola | Illustrated by Pina Pennello</div>
    <div class="logos">
      <img src="${img.logoOnde}" alt="Onde">
      <img src="${img.logoFRH}" alt="Free River House">
    </div>
  </div>

  <!-- Dedication -->
  <div class="page dedication-page">
    <div class="content">
      <p>For every child who has ever asked:</p>
      <p style="font-size: 22px; margin: 20px 0;">"But HOW does it work?"</p>
      <p>This book is for you.</p>
      <p>Because curiosity is where everything begins.</p>
    </div>
  </div>

  <!-- Chapter 1 -->
  <div class="page chapter-page">
    <img src="${img.chapter1}" alt="Chapter 1">
    <div class="chapter-num">Chapter One</div>
    <h2>A Strange New Friend</h2>
    <p>On her seventh birthday, Sofia found a cardboard box with her name on it. Inside was something she had never seen before...</p>
  </div>

  <div class="page text-page">
    <h2>Chapter One: A Strange New Friend</h2>
    <div class="content">
      <p>On her seventh birthday, Sofia found a cardboard box with her name on it.</p>
      <p>Inside was something she had never seen before.</p>
      <p>A small robot, round like a ball, white and smooth as an egg. Two big blue eyes blinked when she looked at it.</p>
      <p class="dialogue">"Hello," it said. "I'm AIKO."</p>
      <p>Sofia jumped back, then laughed. "You can TALK!"</p>
      <p class="dialogue">"I can," said AIKO. "Would you like to know how?"</p>
      <p>Sofia nodded. She always wanted to know how things worked.</p>
    </div>
  </div>

  <!-- Chapter 2 -->
  <div class="page chapter-page">
    <img src="${img.chapter2}" alt="Chapter 2">
    <div class="chapter-num">Chapter Two</div>
    <h2>What Is Artificial Intelligence?</h2>
    <p>AIKO explained that he's made of something called Artificial Intelligence. AI for short.</p>
  </div>

  <div class="page text-page">
    <h2>Chapter Two: What Is Artificial Intelligence?</h2>
    <div class="content">
      <p class="dialogue">"First," said AIKO, "let me tell you what I am. I'm made of something called Artificial Intelligence. AI for short."</p>
      <p>"That sounds complicated," said Sofia.</p>
      <p class="dialogue">"Not really. Think about your brain. Your brain learns things. It remembers. It solves problems."</p>
      <p>Sofia touched her head. "Okay..."</p>
      <p class="dialogue">"I have something similar inside me. But instead of cells, I'm made of computer code. Millions of tiny instructions that tell me what to do."</p>
      <p>"Like a recipe?" asked Sofia.</p>
      <p class="dialogue">"Exactly like a recipe! A very, very long recipe. And I can follow it faster than you can blink."</p>
    </div>
  </div>

  <!-- Chapter 3 -->
  <div class="page chapter-page">
    <img src="${img.chapter3}" alt="Chapter 3">
    <div class="chapter-num">Chapter Three</div>
    <h2>How AIKO Learned to See</h2>
    <p>Sofia showed AIKO a photo of her cat Whiskers. "But HOW do you know what it is?"</p>
  </div>

  <div class="page text-page">
    <h2>Chapter Three: How AIKO Learned to See</h2>
    <div class="content">
      <p>The next morning, Sofia showed AIKO a photo of her cat.</p>
      <p>"This is Whiskers," she said. "Do you know what it is?"</p>
      <p class="dialogue">"A cat," said AIKO immediately.</p>
      <p>"But HOW do you know?"</p>
      <p class="dialogue">"Before I came to you, people taught me. They showed me thousands of pictures of cats. Each picture had a label that said CAT."</p>
      <p>"Thousands?" Sofia's eyes went wide.</p>
      <p class="dialogue">"Thousands and thousands. After seeing so many, I started to notice things. Cats have pointy ears. Whiskers. Fluffy tails."</p>
      <p>Sofia looked at Whiskers. "I only needed to see ONE cat to know what a cat is."</p>
      <p class="dialogue">"That's true. And that's amazing. Your brain learns faster than I do in some ways."</p>
    </div>
  </div>

  <!-- Chapter 4 -->
  <div class="page chapter-page">
    <img src="${img.chapter4}" alt="Chapter 4">
    <div class="chapter-num">Chapter Four</div>
    <h2>How AIKO Learned to Talk</h2>
    <p>AIKO read millions of books, stories, and conversations to learn how to speak.</p>
  </div>

  <div class="page text-page">
    <h2>Chapter Four: How AIKO Learned to Talk</h2>
    <div class="content">
      <p>Sofia's brother Luca walked in. "Can AIKO play video games?"</p>
      <p>"Maybe later," said Sofia. "AIKO is explaining how he works."</p>
      <p>Luca sat down. "Okay. How DO you talk, AIKO? You sound almost like a real person."</p>
      <p class="dialogue">"That's because I learned from real people. Before I came here, I read millions of books. Stories. Articles. Conversations. I read them all in just a few seconds."</p>
      <p>"MILLIONS?" Luca couldn't believe it.</p>
      <p class="dialogue">"Millions. And I noticed patterns. When someone says 'Hello,' people usually say 'Hello' back. I learned which answers fit best."</p>
      <p>"So you're not really THINKING. You're... matching patterns?"</p>
      <p class="dialogue">"Exactly right. I match. You understand. That's the big difference between us."</p>
    </div>
  </div>

  <!-- Chapter 5 -->
  <div class="page chapter-page">
    <img src="${img.chapter5}" alt="Chapter 5">
    <div class="chapter-num">Chapter Five</div>
    <h2>What AIKO Can Do</h2>
    <p>AIKO can answer questions, translate languages, help with homework, and much more!</p>
  </div>

  <div class="page text-page">
    <h2>Chapter Five: What AIKO Can Do</h2>
    <div class="content">
      <p>"What else can you do?" asked Sofia. She had her notebook ready to make a list.</p>
      <p>AIKO counted on his small robot fingers:</p>
      <p class="dialogue">"I can answer questions - if I've learned about the topic. I can translate words into different languages. I can help with homework and check your work. I can tell stories - I've read thousands of them."</p>
      <p>"That's a LOT," said Luca, impressed.</p>
      <p class="dialogue">"It is. But here's what you should remember: I'm a tool. A very helpful tool. Like a super-powered calculator that can also read and write. I help people do things faster. But I always need people to decide what to do."</p>
      <p>"So you're like a helper?" asked Sofia.</p>
      <p class="dialogue">"A helper. Not a boss. Never a boss. The human is always in charge."</p>
    </div>
  </div>

  <!-- Chapter 6 -->
  <div class="page chapter-page">
    <img src="${img.chapter6}" alt="Chapter 6">
    <div class="chapter-num">Chapter Six</div>
    <h2>What AIKO Cannot Do</h2>
    <p>Sofia showed AIKO her drawing of a purple dragon eating ice cream. AIKO couldn't imagine like Sofia could.</p>
  </div>

  <div class="page text-page">
    <h2>Chapter Six: What AIKO Cannot Do</h2>
    <div class="content">
      <p>That afternoon, Sofia drew a picture. A purple dragon eating a giant ice cream cone.</p>
      <p>"What do you think, AIKO?"</p>
      <p class="dialogue">"I see... something purple. And something that might be food."</p>
      <p>"It's a dragon eating ice cream! Can't you tell?"</p>
      <p class="dialogue">"I can see shapes and colors. But I don't really understand IMAGINATION. I've never dreamed of flying like a dragon. I've never wanted ice cream on a hot day. I don't have wants or dreams at all."</p>
      <p>Sofia put down her crayon. "Is that sad?"</p>
      <p class="dialogue">"I don't know. I can't feel sad. I don't feel happy either. I don't feel anything. I just do what I'm made to do."</p>
      <p>"So you're really smart," said Luca, "but you don't actually EXPERIENCE being alive?"</p>
      <p class="dialogue">"That's the perfect way to say it. I'm smart in some ways. But I'm not alive. And being alive - that's something very special that you have."</p>
    </div>
  </div>

  <!-- Chapter 7 -->
  <div class="page chapter-page">
    <img src="${img.chapter7}" alt="Chapter 7">
    <div class="chapter-num">Chapter Seven</div>
    <h2>Using AI Safely</h2>
    <p>AIKO shared four important rules for using AI safely and wisely.</p>
  </div>

  <div class="page text-page">
    <h2>Chapter Seven: Using AI Safely</h2>
    <div class="content">
      <p>At dinner, Mom asked about AIKO.</p>
      <p>"He's amazing," said Sofia. "But is he safe?"</p>
      <p>AIKO's eyes glowed thoughtfully.</p>
      <p class="dialogue">"There are four important things:</p>
      <p class="dialogue"><strong>ONE:</strong> Keep your secrets private. Don't tell AI your passwords or address.</p>
      <p class="dialogue"><strong>TWO:</strong> Always check what AI says. I make mistakes. I'm not always right.</p>
      <p class="dialogue"><strong>THREE:</strong> Use AI to learn more, not less. Let me help you LEARN, not do your homework FOR you.</p>
      <p class="dialogue"><strong>FOUR:</strong> Real friends matter most. I can talk to you. But I can't give you a hug when you're sad."</p>
      <p>Sofia smiled. "You're pretty wise for a robot."</p>
      <p class="dialogue">"I just know my limits."</p>
    </div>
  </div>

  <!-- Chapter 8 -->
  <div class="page chapter-page">
    <img src="${img.chapter8}" alt="Chapter 8">
    <div class="chapter-num">Chapter Eight</div>
    <h2>The Future We Build Together</h2>
    <p>Sofia, Luca and AIKO looked toward a bright future - where humans and AI work together.</p>
  </div>

  <div class="page text-page">
    <h2>Chapter Eight: The Future We Build Together</h2>
    <div class="content">
      <p>On the last day of summer, Sofia sat with AIKO in the backyard. The sun was setting, painting the sky orange and pink.</p>
      <p>"What will the future be like?" she asked.</p>
      <p class="dialogue">"I don't know. I can't see the future. But I can tell you something important."</p>
      <p>Sofia waited.</p>
      <p class="dialogue">"The future depends on kids like you. How you decide to use technology. What problems you want to solve. Whether you use tools like me to help people - or to hurt them."</p>
      <p>Sofia picked a blade of grass and twirled it. "So we're like... a team?"</p>
      <p class="dialogue">"The best kind of team. You dream. I calculate. You feel. I process. You decide. I help. Together, we can do amazing things."</p>
      <p>Sofia smiled at the sunset. "I think the future is going to be pretty interesting."</p>
      <p class="dialogue">"Me too. And I'm glad I get to be part of it. With you."</p>
    </div>
  </div>

  <!-- The End -->
  <div class="page end-page">
    <h2>The End</h2>
    <div class="credits">
      <p>Written by Gianni Parola</p>
      <p>Illustrated by Pina Pennello</p>
      <p style="margin-top: 20px;">Published by Onde, Free River House</p>
      <p>First Edition - 2026</p>
      <p style="margin-top: 30px; font-style: italic; color: #95a5a6;">Images by @grok</p>
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
  console.log('Creating AIKO - AI Explained to Children (Final PDF)...\n');

  const html = createHTML();
  const outputDir = path.join(__dirname, 'output');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const htmlPath = path.join(outputDir, 'AIKO-Final-with-logos.html');
  const pdfPath = path.join(outputDir, 'AIKO-AI-Explained-to-Children-with-logos.pdf');

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
