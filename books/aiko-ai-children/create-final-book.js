const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Image paths with alt text descriptions for accessibility
const imagesDir = '/Users/mattiapetrucciani/CascadeProjects/Onde/books/aiko-ai-children/images';
const images = {
  cover: {
    path: `${imagesDir}/cover-aiko-new.jpg`,
    alt: 'Cover: Sofia (7yo, brown hair, pink dress) and Luca (5yo, teal shirt) read a book together while AIKO, a friendly white spherical robot with blue LED eyes, watches from nearby. Warm sunlit living room, watercolor style.'
  },
  chapter1: {
    path: `${imagesDir}/chapter1-strange-new-friend.jpg`,
    alt: 'Sofia discovers AIKO: A girl with curly brown hair looks amazed at a small white robot with blue eyes in a cardboard box. Cozy bedroom with warm morning light.'
  },
  chapter2: {
    path: `${imagesDir}/chapter2-brain-circuits.jpg`,
    alt: 'Brain vs circuits: Human brain on left, circuit board on right, showing how biological and artificial intelligence compare.'
  },
  chapter3: {
    path: `${imagesDir}/chapter3-learning-to-see.jpg`,
    alt: 'AIKO learning to see: Orange cat Whiskers poses while AIKO studies cat photos on a tablet to learn pattern recognition.'
  },
  chapter4: {
    path: `${imagesDir}/chapter4-learning-to-talk.jpg`,
    alt: 'AIKO learning language: Books, words and text swirl around AIKO showing how AI learns from reading millions of texts.'
  },
  chapter5: {
    path: `${imagesDir}/chapter5-what-aiko-can-do.jpg`,
    alt: 'AIKO helping: The robot assists Sofia with homework and answers questions shown as thought bubbles.'
  },
  chapter6: {
    path: `${imagesDir}/chapter6-what-aiko-cannot-do.jpg`,
    alt: 'AI limitations: Sofia shows AIKO a creative drawing of a purple dragon eating ice cream. AIKO looks puzzled with question marks.'
  },
  chapter7: {
    path: `${imagesDir}/chapter7-using-ai-safely.jpg`,
    alt: 'Four AI safety rules: Panels showing padlock (privacy), checkmark (verify facts), books (learning), heart (kindness).'
  },
  chapter8: {
    path: `${imagesDir}/chapter8-future-together.jpg`,
    alt: 'Future together: Sofia, Luca and AIKO watch a beautiful sunset, holding hands symbolizing human-AI friendship.'
  }
};

function imageToBase64(filePath) {
  const data = fs.readFileSync(filePath);
  const ext = path.extname(filePath).slice(1) || 'jpg';
  return `data:image/${ext};base64,${data.toString('base64')}`;
}

function createHTML() {
  const imgData = {};
  for (const [key, data] of Object.entries(images)) {
    imgData[key] = {
      base64: imageToBase64(data.path),
      alt: data.alt
    };
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: Letter; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Georgia', 'Times New Roman', serif; }
    .page {
      width: 8.5in; height: 11in;
      page-break-after: always;
      display: flex; flex-direction: column;
      background: #fefefe; position: relative; overflow: hidden;
    }
    .page:last-child { page-break-after: avoid; }

    /* Cover Page */
    .cover-page {
      background: linear-gradient(180deg, #f8f4e8 0%, #fff9e6 50%, #f8f4e8 100%);
      justify-content: center; align-items: center; text-align: center; padding: 40px;
    }
    .cover-page img { max-width: 75%; max-height: 55%; object-fit: contain; border-radius: 16px; box-shadow: 0 15px 50px rgba(0,0,0,0.2); }
    .cover-page h1 { margin-top: 25px; font-size: 52px; color: #2c3e50; letter-spacing: 4px; font-weight: bold; }
    .cover-page .subtitle { font-size: 22px; color: #5d6d7e; margin-top: 8px; font-style: italic; }
    .cover-page .author { font-size: 16px; color: #7f8c8d; margin-top: 25px; }
    .cover-page .publisher { font-size: 14px; color: #95a5a6; margin-top: 8px; }

    /* Dedication Page */
    .dedication-page {
      justify-content: center; align-items: center; text-align: center; padding: 80px;
      background: linear-gradient(180deg, #faf9f7 0%, #f5f4f2 100%);
    }
    .dedication-page .dedication { font-size: 20px; color: #5d6d7e; font-style: italic; line-height: 1.8; max-width: 400px; }

    /* Chapter Pages */
    .chapter-page { padding: 45px 55px; }
    .chapter-header { text-align: center; margin-bottom: 20px; }
    .chapter-number { font-size: 13px; color: #7f8c8d; text-transform: uppercase; letter-spacing: 3px; }
    .chapter-title { font-size: 28px; color: #2c3e50; margin-top: 4px; font-weight: bold; }
    .chapter-image { width: 100%; display: flex; justify-content: center; margin: 15px 0; }
    .chapter-image img { max-width: 100%; max-height: 4in; object-fit: contain; border-radius: 10px; box-shadow: 0 6px 20px rgba(0,0,0,0.12); }
    .chapter-text { font-size: 14px; line-height: 1.75; color: #34495e; text-align: justify; }
    .chapter-text p { margin-bottom: 10px; text-indent: 18px; }
    .chapter-text p:first-child { text-indent: 0; }
    .chapter-text .dialogue { text-indent: 0; margin-left: 18px; }
    .chapter-text .dialogue-speaker { font-weight: 600; }

    /* Note Page */
    .note-page { padding: 50px 60px; background: #f9f9f9; }
    .note-page h2 { font-size: 22px; color: #2c3e50; margin-bottom: 20px; text-align: center; }
    .note-page .content { font-size: 13px; line-height: 1.7; color: #555; }
    .note-page ul { margin-left: 20px; margin-bottom: 15px; }
    .note-page li { margin-bottom: 6px; }

    /* End Page */
    .end-page {
      justify-content: center; align-items: center; text-align: center;
      background: linear-gradient(180deg, #f8f4e8 0%, #fff9e6 100%);
    }
    .end-page h2 { font-size: 36px; color: #2c3e50; margin-bottom: 40px; }
    .end-page .credits { font-size: 14px; color: #7f8c8d; line-height: 2; }
  </style>
</head>
<body>
  <!-- COVER -->
  <div class="page cover-page">
    <img src="${imgData.cover.base64}" alt="${imgData.cover.alt}">
    <h1>AIKO</h1>
    <div class="subtitle">AI Explained to Children</div>
    <div class="author">Written by Gianni Parola<br>Illustrated by Pino Pennello</div>
    <div class="publisher">Onde, Free River House</div>
  </div>

  <!-- DEDICATION -->
  <div class="page dedication-page">
    <div class="dedication">
      For every child who has ever asked:<br><br>
      <em>"But HOW does it work?"</em><br><br>
      This book is for you.<br>
      Because curiosity is where everything begins.
    </div>
  </div>

  <!-- CHAPTER 1 -->
  <div class="page chapter-page">
    <div class="chapter-header">
      <div class="chapter-number">Chapter One</div>
      <div class="chapter-title">A Strange New Friend</div>
    </div>
    <div class="chapter-image"><img src="${imgData.chapter1.base64}" alt="${imgData.chapter1.alt}"></div>
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
    <div class="chapter-image"><img src="${imgData.chapter2.base64}" alt="${imgData.chapter2.alt}"></div>
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

  <!-- CHAPTER 3 -->
  <div class="page chapter-page">
    <div class="chapter-header">
      <div class="chapter-number">Chapter Three</div>
      <div class="chapter-title">How AIKO Learned to See</div>
    </div>
    <div class="chapter-image"><img src="${imgData.chapter3.base64}" alt="${imgData.chapter3.alt}"></div>
    <div class="chapter-text">
      <p>The next morning, Sofia showed AIKO a photo of her cat.</p>
      <p class="dialogue">"This is Whiskers," she said. "Do you know what it is?"</p>
      <p class="dialogue">"A cat," said AIKO immediately.</p>
      <p class="dialogue">"But HOW do you know?"</p>
      <p>AIKO's eyes flickered blue - he was thinking.</p>
      <p class="dialogue">"Before I came to you, people taught me. They showed me thousands of pictures of cats. Each picture had a label that said CAT. They also showed me dogs, birds, cars, houses, trees. All with labels."</p>
      <p class="dialogue">"Thousands?" Sofia's eyes went wide.</p>
      <p class="dialogue">"Thousands and thousands. After seeing so many, I started to notice things. Cats have pointy ears. Whiskers. Fluffy tails."</p>
    </div>
  </div>

  <!-- CHAPTER 4 -->
  <div class="page chapter-page">
    <div class="chapter-header">
      <div class="chapter-number">Chapter Four</div>
      <div class="chapter-title">How AIKO Learned to Talk</div>
    </div>
    <div class="chapter-image"><img src="${imgData.chapter4.base64}" alt="${imgData.chapter4.alt}"></div>
    <div class="chapter-text">
      <p>Sofia's brother Luca walked in. "Can AIKO play video games?"</p>
      <p class="dialogue">"Maybe later," said Sofia. "AIKO is explaining how he works."</p>
      <p>Luca sat down. "Okay. How DO you talk, AIKO? You sound almost like a real person."</p>
      <p class="dialogue">"That's because I learned from real people," said AIKO. "Before I came here, I read millions of books. Stories. Articles. Conversations. I read them all in just a few seconds."</p>
      <p class="dialogue">"MILLIONS?" Luca couldn't believe it.</p>
      <p class="dialogue">"Millions. And I noticed patterns. When someone says 'Hello,' people usually say 'Hello' back. When someone asks a question, there are good answers and bad answers. I learned which answers fit best."</p>
    </div>
  </div>

  <!-- CHAPTER 5 -->
  <div class="page chapter-page">
    <div class="chapter-header">
      <div class="chapter-number">Chapter Five</div>
      <div class="chapter-title">What AIKO Can Do</div>
    </div>
    <div class="chapter-image"><img src="${imgData.chapter5.base64}" alt="${imgData.chapter5.alt}"></div>
    <div class="chapter-text">
      <p class="dialogue">"What else can you do?" asked Sofia. She had her notebook ready to make a list.</p>
      <p>AIKO counted on his small robot fingers:</p>
      <p class="dialogue">"I can answer questions - if I've learned about the topic. I can translate words into different languages. I can help with homework and check your work. I can tell stories - I've read thousands of them. I can recognize things in pictures. I can even help doctors find problems in X-rays."</p>
      <p class="dialogue">"That's a LOT," said Luca, impressed.</p>
      <p class="dialogue">"It is. But here's what you should remember: I'm a tool. A very helpful tool. Like a super-powered calculator that can also read and write. I help people do things faster. But I always need people to decide what to do."</p>
    </div>
  </div>

  <!-- CHAPTER 6 -->
  <div class="page chapter-page">
    <div class="chapter-header">
      <div class="chapter-number">Chapter Six</div>
      <div class="chapter-title">What AIKO Cannot Do</div>
    </div>
    <div class="chapter-image"><img src="${imgData.chapter6.base64}" alt="${imgData.chapter6.alt}"></div>
    <div class="chapter-text">
      <p>That afternoon, Sofia drew a picture. A purple dragon eating a giant ice cream cone.</p>
      <p class="dialogue">"What do you think, AIKO?"</p>
      <p>AIKO looked at the drawing carefully. "I see... something purple. And something that might be food."</p>
      <p class="dialogue">"It's a dragon eating ice cream! Can't you tell?"</p>
      <p class="dialogue">"I can see shapes and colors. But I don't really understand IMAGINATION. I've never dreamed of flying like a dragon. I've never wanted ice cream on a hot day. I don't have wants or dreams at all."</p>
      <p>Sofia put down her crayon. "Is that sad?"</p>
      <p class="dialogue">"I don't know. I can't feel sad. I don't feel happy either. I don't feel anything. I just do what I'm made to do."</p>
    </div>
  </div>

  <!-- CHAPTER 7 -->
  <div class="page chapter-page">
    <div class="chapter-header">
      <div class="chapter-number">Chapter Seven</div>
      <div class="chapter-title">Using AI Safely</div>
    </div>
    <div class="chapter-image"><img src="${imgData.chapter7.base64}" alt="${imgData.chapter7.alt}"></div>
    <div class="chapter-text">
      <p>At dinner, Mom asked about AIKO. "He's amazing," said Sofia. "But is he safe?"</p>
      <p>AIKO's eyes glowed thoughtfully. "There are four important things:</p>
      <p class="dialogue"><strong>ONE:</strong> Keep your secrets private. Don't tell AI your passwords, your address, or things you wouldn't tell a stranger.</p>
      <p class="dialogue"><strong>TWO:</strong> Always check what AI says. I make mistakes. I'm not always right.</p>
      <p class="dialogue"><strong>THREE:</strong> Use AI to learn more, not to learn less. Don't let me do your homework FOR you. Let me help you LEARN how to do it.</p>
      <p class="dialogue"><strong>FOUR:</strong> Real friends matter most. I can talk to you. But I can't give you a hug when you're sad."</p>
    </div>
  </div>

  <!-- CHAPTER 8 -->
  <div class="page chapter-page">
    <div class="chapter-header">
      <div class="chapter-number">Chapter Eight</div>
      <div class="chapter-title">The Future We Build Together</div>
    </div>
    <div class="chapter-image"><img src="${imgData.chapter8.base64}" alt="${imgData.chapter8.alt}"></div>
    <div class="chapter-text">
      <p>On the last day of summer, Sofia sat with AIKO in the backyard. The sun was setting, painting the sky orange and pink.</p>
      <p class="dialogue">"What will the future be like?" she asked.</p>
      <p class="dialogue">"I don't know," said AIKO. "I can't see the future. But I can tell you something important."</p>
      <p>Sofia waited.</p>
      <p class="dialogue">"The future depends on kids like you. How you decide to use technology. What problems you want to solve. AI will get better and better at doing tasks. But deciding WHICH tasks matter most - that will always be up to humans."</p>
      <p>Sofia smiled at the sunset. "I think the future is going to be pretty interesting."</p>
      <p class="dialogue">"Me too," said AIKO. "And I'm glad I get to be part of it. With you."</p>
    </div>
  </div>

  <!-- END PAGE -->
  <div class="page end-page">
    <h2>THE END</h2>
    <div class="credits">
      Words: Gianni Parola<br>
      Illustrations: Pino Pennello<br><br>
      Published by Onde, Free River House<br>
      First Edition - 2026
    </div>
  </div>

</body>
</html>
`;
}

async function createPDF() {
  console.log('Creating AIKO Complete Book PDF...\\n');

  // Check images exist
  for (const [name, data] of Object.entries(images)) {
    if (!fs.existsSync(data.path)) {
      console.error(`ERROR: ${name} image not found: ${data.path}`);
      return;
    }
    console.log(`✓ Found ${name}: ${path.basename(data.path)}`);
  }

  const html = createHTML();
  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const htmlPath = path.join(outputDir, 'AIKO-Complete-Book.html');
  const pdfPath = path.join(outputDir, 'AIKO-AI-Explained-to-Children-COMPLETE.pdf');

  fs.writeFileSync(htmlPath, html);
  console.log(`\\nHTML saved: ${htmlPath}`);

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
  console.log(`\\n${'='.repeat(50)}`);
  console.log('PDF CREATED SUCCESSFULLY!');
  console.log(`${'='.repeat(50)}`);
  console.log(`\\nFile: ${pdfPath}`);
  console.log('\\nBook contents:');
  console.log('  - Cover');
  console.log('  - Dedication');
  console.log('  - Chapter 1: A Strange New Friend');
  console.log('  - Chapter 2: What Is Artificial Intelligence?');
  console.log('  - Chapter 3: How AIKO Learned to See');
  console.log('  - Chapter 4: How AIKO Learned to Talk');
  console.log('  - Chapter 5: What AIKO Can Do');
  console.log('  - Chapter 6: What AIKO Cannot Do');
  console.log('  - Chapter 7: Using AI Safely');
  console.log('  - Chapter 8: The Future We Build Together');
  console.log('  - End Page');
  console.log('\\nTotal: 11 pages');
}

createPDF().catch(console.error);
