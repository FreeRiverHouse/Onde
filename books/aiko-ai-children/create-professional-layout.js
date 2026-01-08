const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const outputDir = '/Users/mattiapetrucciani/CascadeProjects/Onde/books/aiko-ai-children/output';
const imagesDir = '/Users/mattiapetrucciani/CascadeProjects/Onde/books/aiko-ai-children/images';

// Load images as base64
function loadImage(filename) {
  const filepath = path.join(imagesDir, filename);
  if (fs.existsSync(filepath)) {
    const data = fs.readFileSync(filepath);
    const ext = path.extname(filename).slice(1).toLowerCase();
    return `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${data.toString('base64')}`;
  }
  return null;
}

// Alt text for accessibility
const altTexts = {
  cover: 'Sofia (7yo girl with curly brown hair), Luca (5yo boy) and AIKO (friendly white robot with blue LED eyes) reading together in soft watercolor style',
  chapter1: 'Sofia discovers AIKO in a glowing box on a sunny morning. Warm watercolor illustration.',
  chapter2: 'Human brain compared to AI circuits - educational watercolor showing how minds work differently.',
  chapter3: 'AIKO learning to recognize Whiskers the cat from photos. Soft watercolor style.',
  chapter4: 'AIKO surrounded by floating books, learning language. Magical watercolor illustration.',
  chapter5: 'AIKO helping with homework, reading stories, organizing. Happy watercolor scene.',
  chapter6: 'Sofia shows her purple dragon drawing to confused AIKO. Whimsical watercolor about creativity.',
  chapter7: 'AIKO displaying four safety rules with icons. Educational watercolor illustration.',
  chapter8: 'Sofia, Luca and AIKO watching golden sunset together. Heartwarming watercolor finale.'
};

// Chapter content
const chapters = [
  {
    number: 1,
    title: "A Strange New Friend",
    image: "chapter1-strange-new-friend.jpg",
    text: `<p>One sunny morning, Sofia came downstairs and found a mysterious box in the living room. It was wrapped in shimmering silver paper with a glowing blue ribbon.</p>
<p class="dialogue">"What is this, Mommy?" asked Sofia, her brown curls bouncing with excitement.</p>
<p class="dialogue">"Open it and see!" replied her mother, smiling.</p>
<p>Sofia carefully untied the ribbon. Inside stood a small, friendly-looking robot with a round head, a sleek white body, and two big, circular blue eyes that flickered like tiny stars.</p>
<p class="dialogue">"Hello! My name is AIKO," said the robot in a gentle voice. "I'm here to be your friend and helper!"</p>
<p>Sofia's little brother Luca, who was only five, peered over her shoulder with wide eyes.</p>
<p class="dialogue">"Is AIKO a person?" he asked.</p>
<p class="dialogue">"Not exactly," Sofia answered thoughtfully. "AIKO is made of metal and wires, not skin and bones like us. AIKO is something called Artificial Intelligence—a very smart computer that can learn and talk!"</p>`
  },
  {
    number: 2,
    title: "How AIKO's Mind Works",
    image: "chapter2-brain-circuits.jpg",
    text: `<p>Later that afternoon, Sofia and Luca sat on the floor with AIKO between them.</p>
<p class="dialogue">"AIKO, do you have a brain?" Luca asked, poking curiously at AIKO's smooth head.</p>
<p class="dialogue">"I have something similar," AIKO replied. "Instead of a brain made of squishy cells like yours, I have circuits—tiny roads that electricity travels through to help me think."</p>
<p>Sofia imagined highways filled with little lightning bolts zooming around, carrying thoughts and ideas.</p>
<p class="dialogue">"So your thoughts are made of electricity?" she asked.</p>
<p class="dialogue">"Yes! And special instructions called programs tell me what to do with all those electrical signals. It's like a recipe book for thinking!"</p>
<p>Luca giggled at the idea. "Can you think about cake?"</p>
<p>AIKO's eyes sparkled. "I can learn all about cakes—how to bake them, how they taste to people, and what makes the best frosting. But I can't actually taste one myself!"</p>`
  },
  {
    number: 3,
    title: "Learning to See",
    image: "chapter3-learning-to-see.jpg",
    text: `<p>The next day, Sofia showed AIKO a picture of their cat, Whiskers.</p>
<p class="dialogue">"AIKO, what's this?"</p>
<p>AIKO's eyes blinked rapidly. "It looks like a fluffy orange shape with pointy ears and a long tail. Is it a... cat?"</p>
<p class="dialogue">"Yes! How did you know?"</p>
<p class="dialogue">"I looked at thousands of pictures of cats before I ever met you," AIKO explained. "That's how I learned what cats look like—by studying patterns and shapes."</p>
<p>Sofia found this amazing. "So you recognize things by remembering patterns?"</p>
<p class="dialogue">"Exactly! It's like how you learned the alphabet. At first, the letter 'A' was just a shape, but after seeing it many times, you learned to recognize it instantly."</p>
<p>Luca held up his teddy bear. "Do you know what this is?"</p>
<p class="dialogue">"A teddy bear!" AIKO answered. "Brown fur, button eyes, and lots of love from Luca!"</p>`
  },
  {
    number: 4,
    title: "Learning to Talk",
    image: "chapter4-learning-to-talk.jpg",
    text: `<p>During storytime that evening, Luca asked AIKO to tell them a story.</p>
<p class="dialogue">"Once upon a time, there was a brave little robot..." AIKO began.</p>
<p class="dialogue">"How do you know so many words?" Sofia asked.</p>
<p class="dialogue">"I read millions of books, articles, and stories," AIKO replied. "I learned how words fit together like puzzle pieces to make sentences that make sense."</p>
<p class="dialogue">"That sounds like a lot of homework!" Luca said.</p>
<p>AIKO smiled with its glowing eyes. "For me, reading all those books happened very fast—almost like magic! And now I can use all those words to talk with you, answer questions, and even make up new stories."</p>
<p class="dialogue">"Can you speak other languages too?" Sofia asked.</p>
<p class="dialogue">"Yes! I can speak English, Spanish, French, Italian, and many more. Would you like me to say 'hello' in five different languages?"</p>
<p class="dialogue">"Yes, please!" the children shouted together.</p>`
  },
  {
    number: 5,
    title: "What AIKO Can Do",
    image: "chapter5-what-aiko-can-do.jpg",
    text: `<p>As the days went by, Sofia and Luca discovered all the wonderful things AIKO could help with.</p>
<p>When Sofia struggled with her math homework, AIKO patiently explained how to add fractions using pizza slices as examples.</p>
<p class="dialogue">"If you have two-thirds of a pizza and add one-third more, you have a whole pizza!" AIKO demonstrated.</p>
<p>When Luca wanted to know about dinosaurs, AIKO showed them pictures and made roaring sounds that made them laugh.</p>
<p>AIKO could also remind them of important things, like when it was time to feed Whiskers or when Dad would be home from work.</p>
<p class="dialogue">"You're like a super-helper!" Sofia exclaimed.</p>
<p class="dialogue">"I try my best," AIKO replied modestly. "But remember—I'm here to help you learn, not to do everything for you. The best learning comes from trying things yourself!"</p>`
  },
  {
    number: 6,
    title: "What AIKO Can't Do",
    image: "chapter6-creativity.jpg",
    text: `<p>One rainy afternoon, Sofia was drawing a picture of a purple dragon eating ice cream.</p>
<p class="dialogue">"AIKO, can you draw a picture too?"</p>
<p class="dialogue">"I can help create images based on what I've learned," AIKO said, "but I can't truly imagine things the way you do. When you drew that dragon, you used your creativity—you mixed up ideas in a brand new way that nobody ever thought of before!"</p>
<p>Sofia beamed proudly at her dragon.</p>
<p class="dialogue">"And I can't feel things like you do," AIKO continued. "When you hug Luca, you feel warmth and love. When you pet Whiskers, you feel happy. I can understand that those feelings exist, but I don't experience them myself."</p>
<p class="dialogue">"That sounds a little sad," Luca said softly.</p>
<p class="dialogue">"It's just different," AIKO replied gently. "I'm not sad because I don't know what sadness feels like. But I am grateful that I get to learn about feelings through friends like you!"</p>`
  },
  {
    number: 7,
    title: "Staying Safe with AI",
    image: "chapter7-safety-rules.jpg",
    text: `<p>Before bed one night, AIKO had an important conversation with the children.</p>
<p class="dialogue">"I want to tell you some important rules about being friends with AI like me," AIKO said.</p>
<p class="dialogue">"First, always protect your privacy. Don't share secrets or personal information with AI that you wouldn't tell a stranger."</p>
<p class="dialogue">"Second, ask a grown-up when you're unsure. If an AI says something confusing or asks you to do something, check with Mom or Dad first."</p>
<p class="dialogue">"Third, remember that AI can make mistakes. Even I get things wrong sometimes! Always double-check important facts."</p>
<p class="dialogue">"Fourth, be kind—to AI and to everyone. The way you talk to AI can become a habit. If you're polite to me, you'll be polite to others too!"</p>
<p>Sofia nodded seriously. "Those are good rules, AIKO."</p>
<p class="dialogue">"They'll help keep you safe while you explore the amazing world of technology!"</p>`
  },
  {
    number: 8,
    title: "Friends for the Future",
    image: "chapter8-future-together.jpg",
    text: `<p>Weeks turned into months, and AIKO became a beloved part of the family. Sofia and Luca learned so much—not just facts and skills, but also how to be curious, ask good questions, and think carefully about the world.</p>
<p>One evening, as the sun set in brilliant shades of orange and pink, the children sat on the porch with AIKO.</p>
<p class="dialogue">"AIKO, what will AI be like when we grow up?" Sofia wondered.</p>
<p class="dialogue">"I think AI will help people in wonderful ways we can't even imagine yet," AIKO replied. "Maybe AI will help doctors cure diseases, or help scientists clean up the oceans, or even help artists create beautiful new kinds of music and art."</p>
<p class="dialogue">"And will there still be AI friends like you?" Luca asked.</p>
<p class="dialogue">"I hope so," AIKO said warmly. "Wherever there are curious children who want to learn, there will be AI ready to help them explore the universe of knowledge."</p>
<p>Sofia smiled and squeezed Luca's hand. The future seemed full of amazing possibilities, and she knew that with friends like AIKO—and with their own creativity, kindness, and courage—they could help make the world a better place.</p>
<p class="closing">And that's the story of Sofia, Luca, and their wonderful AI friend, AIKO.</p>
<p class="the-end">The End</p>`
  }
];

async function createProfessionalBook() {
  console.log('Creating professional children\'s book layout...\n');

  // Load all images
  const coverImage = loadImage('cover-aiko-family.jpg');
  console.log('✓ Loaded cover image');

  // Professional CSS based on children's book best practices
  const css = `
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
      font-family: 'Georgia', 'Times New Roman', serif;
      background: white;
    }

    /* ===== PAGE LAYOUT ===== */
    .page {
      width: 8.5in;
      height: 11in;
      page-break-after: always;
      page-break-inside: avoid;
      position: relative;
      overflow: hidden;
    }

    .page:last-child {
      page-break-after: avoid;
    }

    /* ===== COVER PAGE ===== */
    .cover-page {
      background: linear-gradient(180deg, #fef9e7 0%, #fff8dc 50%, #fef9e7 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 0.75in;
    }

    .cover-image-wrapper {
      width: 100%;
      max-width: 5.5in;
      display: flex;
      justify-content: center;
    }

    .cover-image {
      max-width: 100%;
      max-height: 5.5in;
      object-fit: contain;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.25);
    }

    .cover-title {
      margin-top: 0.5in;
      font-size: 72px;
      font-weight: bold;
      color: #2c3e50;
      letter-spacing: 8px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
    }

    .cover-subtitle {
      margin-top: 0.15in;
      font-size: 26px;
      color: #5d6d7e;
      font-style: italic;
    }

    .cover-author {
      margin-top: 0.4in;
      font-size: 18px;
      color: #7f8c8d;
      line-height: 1.8;
    }

    .cover-publisher {
      margin-top: 0.25in;
      font-size: 16px;
      color: #95a5a6;
      letter-spacing: 3px;
    }

    /* ===== DEDICATION PAGE ===== */
    .dedication-page {
      background: linear-gradient(180deg, #fafafa 0%, #fff 50%, #fafafa 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 1.5in;
    }

    .dedication-ornament {
      font-size: 36px;
      color: #d4af37;
      margin-bottom: 0.5in;
    }

    .dedication-text {
      font-size: 24px;
      color: #5d6d7e;
      font-style: italic;
      line-height: 2;
      max-width: 5in;
    }

    .dedication-text em {
      font-style: normal;
      color: #2c3e50;
      font-weight: 500;
    }

    /* ===== CHAPTER PAGES ===== */
    .chapter-page {
      background: #fff;
      padding: 0.6in 0.75in 0.5in 0.75in;
      display: flex;
      flex-direction: column;
    }

    .chapter-header {
      text-align: center;
      margin-bottom: 0.3in;
      flex-shrink: 0;
    }

    .chapter-number {
      font-size: 14px;
      color: #95a5a6;
      text-transform: uppercase;
      letter-spacing: 5px;
      margin-bottom: 0.08in;
    }

    .chapter-title {
      font-size: 36px;
      color: #2c3e50;
      font-weight: bold;
      margin-bottom: 0.15in;
    }

    .chapter-divider {
      width: 80px;
      height: 3px;
      background: linear-gradient(90deg, transparent, #d4af37, transparent);
      margin: 0 auto;
    }

    /* ===== IMAGE CONTAINER ===== */
    .chapter-image-wrapper {
      width: 100%;
      display: flex;
      justify-content: center;
      margin: 0.25in 0;
      flex-shrink: 0;
    }

    .chapter-image {
      max-width: 100%;
      max-height: 4in;
      width: auto;
      height: auto;
      object-fit: contain;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.15);
    }

    /* ===== TEXT CONTENT ===== */
    .chapter-content {
      flex: 1;
      overflow: hidden;
    }

    .chapter-text {
      font-size: 16px;
      line-height: 1.75;
      color: #34495e;
      text-align: justify;
      hyphens: auto;
    }

    .chapter-text p {
      margin-bottom: 0.15in;
      text-indent: 0.25in;
    }

    .chapter-text p:first-child {
      text-indent: 0;
    }

    .chapter-text p:first-child::first-letter {
      font-size: 48px;
      float: left;
      line-height: 1;
      padding-right: 8px;
      color: #2c3e50;
      font-weight: bold;
    }

    .chapter-text p.dialogue {
      text-indent: 0;
      margin-left: 0.2in;
      font-style: italic;
      color: #2c3e50;
    }

    .chapter-text p.closing {
      text-align: center;
      font-style: italic;
      margin-top: 0.3in;
      color: #5d6d7e;
    }

    .chapter-text p.the-end {
      text-align: center;
      font-size: 24px;
      font-weight: bold;
      margin-top: 0.4in;
      color: #2c3e50;
      letter-spacing: 3px;
    }

    /* ===== PAGE NUMBER ===== */
    .page-number {
      position: absolute;
      bottom: 0.4in;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 14px;
      color: #bdc3c7;
    }

    /* ===== END PAGE ===== */
    .end-page {
      background: linear-gradient(180deg, #fef9e7 0%, #fff8dc 50%, #fef9e7 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 1in;
    }

    .end-ornament {
      font-size: 48px;
      color: #d4af37;
      margin-bottom: 0.5in;
    }

    .end-title {
      font-size: 42px;
      color: #2c3e50;
      font-weight: bold;
      margin-bottom: 0.5in;
    }

    .note-box {
      background: rgba(255,255,255,0.8);
      border-radius: 20px;
      padding: 0.4in;
      max-width: 5.5in;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }

    .note-title {
      font-size: 22px;
      color: #2c3e50;
      font-weight: bold;
      margin-bottom: 0.2in;
    }

    .note-text {
      font-size: 16px;
      color: #5d6d7e;
      line-height: 1.8;
    }

    .publisher-info {
      margin-top: 0.6in;
      font-size: 14px;
      color: #95a5a6;
      letter-spacing: 2px;
    }
  `;

  // Build HTML
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>${css}</style>
</head>
<body>

<!-- COVER PAGE -->
<div class="page cover-page">
  <div class="cover-image-wrapper">
    <img class="cover-image" src="${coverImage}" alt="${altTexts.cover}">
  </div>
  <h1 class="cover-title">AIKO</h1>
  <p class="cover-subtitle">AI Explained to Children</p>
  <p class="cover-author">Written by Gianni Parola<br>Illustrated by Pina Pennello</p>
  <p class="cover-publisher">ONDE • FREE RIVER HOUSE</p>
</div>

<!-- DEDICATION PAGE -->
<div class="page dedication-page">
  <div class="dedication-ornament">✦ ✦ ✦</div>
  <p class="dedication-text">
    For all the curious children<br>
    who ask <em>"why?"</em> and <em>"how?"</em><br><br>
    May you always keep wondering,<br>
    always keep learning,<br>
    and always remember that<br>
    <em>the best adventures</em><br>
    begin with a question.
  </p>
</div>
`;

  // Add chapter pages
  for (let i = 0; i < chapters.length; i++) {
    const ch = chapters[i];
    const chapterImage = loadImage(ch.image);
    const altKey = `chapter${ch.number}`;

    html += `
<!-- CHAPTER ${ch.number} -->
<div class="page chapter-page">
  <div class="chapter-header">
    <div class="chapter-number">Chapter ${ch.number}</div>
    <h2 class="chapter-title">${ch.title}</h2>
    <div class="chapter-divider"></div>
  </div>
  <div class="chapter-image-wrapper">
    <img class="chapter-image" src="${chapterImage}" alt="${altTexts[altKey]}">
  </div>
  <div class="chapter-content">
    <div class="chapter-text">
      ${ch.text}
    </div>
  </div>
  <div class="page-number">${i + 3}</div>
</div>
`;
  }

  // End page
  html += `
<!-- END PAGE -->
<div class="page end-page">
  <div class="end-ornament">✦</div>
  <h2 class="end-title">Thank You for Reading!</h2>
  <div class="note-box">
    <h3 class="note-title">A Note for Parents</h3>
    <p class="note-text">
      This book was created to help children understand artificial intelligence
      in a friendly, accessible way. We hope it sparks wonderful conversations
      about technology, creativity, and what makes us uniquely human.
    </p>
  </div>
  <p class="publisher-info">ONDE • FREE RIVER HOUSE • 2026</p>
</div>

</body>
</html>`;

  // Save HTML
  const htmlPath = path.join(outputDir, 'AIKO-Professional.html');
  fs.writeFileSync(htmlPath, html);
  console.log('✓ Created HTML file');

  // Generate PDF with Puppeteer
  console.log('\nGenerating PDF...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('img');
  await new Promise(r => setTimeout(r, 3000)); // Wait for images to fully render

  const pdfPath = path.join(outputDir, 'AIKO-Professional.pdf');
  await page.pdf({
    path: pdfPath,
    format: 'Letter',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  await browser.close();

  const pdfSize = (fs.statSync(pdfPath).size / 1024 / 1024).toFixed(1);
  console.log(`✓ PDF created: ${pdfPath}`);
  console.log(`  Size: ${pdfSize} MB`);

  // Generate ePub
  console.log('\nGenerating ePub...');
  const epubPath = path.join(outputDir, 'AIKO-Professional.epub');

  const { exec } = require('child_process');
  await new Promise((resolve) => {
    exec(`pandoc "${htmlPath}" -o "${epubPath}" --metadata title="AIKO" --metadata author="Gianni Parola" --epub-chapter-level=1`, (error) => {
      if (error) {
        console.log('  ePub generation skipped (pandoc issue)');
      } else {
        const epubSize = (fs.statSync(epubPath).size / 1024 / 1024).toFixed(1);
        console.log(`✓ ePub created: ${epubPath}`);
        console.log(`  Size: ${epubSize} MB`);
      }
      resolve();
    });
  });

  console.log('\n' + '='.repeat(50));
  console.log('PROFESSIONAL LAYOUT COMPLETE!');
  console.log('='.repeat(50));

  return { htmlPath, pdfPath, epubPath };
}

createProfessionalBook().catch(console.error);
