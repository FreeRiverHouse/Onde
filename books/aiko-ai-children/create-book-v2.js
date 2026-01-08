const fs = require('fs');
const path = require('path');

// Convert image to base64
function imageToBase64(imagePath) {
  const fullPath = path.join(__dirname, 'images', imagePath);
  if (fs.existsSync(fullPath)) {
    const imageBuffer = fs.readFileSync(fullPath);
    return `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
  }
  return '';
}

const coverImg = imageToBase64('cover-aiko.jpg');
const ch1Img = imageToBase64('chapter1-strange-new-friend.jpg');
const ch2Img = imageToBase64('chapter2-brain-circuits.jpg');
const ch3Img = imageToBase64('chapter3-learning-to-see.jpg');
const ch4Img = imageToBase64('chapter4-learning-to-talk.jpg');
const ch5Img = imageToBase64('chapter5-what-aiko-can-do.jpg');
const ch6Img = imageToBase64('chapter6-what-aiko-cannot-do.jpg');
const ch7Img = imageToBase64('chapter7-using-ai-safely.jpg');
const ch8Img = imageToBase64('chapter8-future-together.jpg');

const bookContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600;700&family=Patrick+Hand&display=swap');

    @page {
      size: 8.5in 11in;
      margin: 0;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Quicksand', 'Comic Sans MS', cursive;
      font-size: 18px;
      line-height: 1.7;
      color: #333;
    }

    .page {
      width: 8.5in;
      height: 11in;
      position: relative;
      overflow: hidden;
      page-break-after: always;
    }

    /* COVER */
    .cover {
      background: linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0.5in;
    }

    .cover img {
      width: 6in;
      height: auto;
      border-radius: 30px;
      box-shadow: 0 30px 80px rgba(0,0,0,0.5), 0 0 60px rgba(100, 149, 237, 0.3);
      margin-bottom: 30px;
    }

    .cover h1 {
      font-family: 'Patrick Hand', cursive;
      font-size: 72px;
      color: #fff;
      text-shadow: 3px 3px 6px rgba(0,0,0,0.5), 0 0 30px rgba(100, 149, 237, 0.5);
      letter-spacing: 8px;
    }

    .cover h2 {
      font-size: 28px;
      color: #a8d8ea;
      font-weight: 400;
      margin-top: 10px;
    }

    .cover .credits {
      position: absolute;
      bottom: 40px;
      font-size: 14px;
      color: rgba(255,255,255,0.7);
      text-align: center;
    }

    /* TITLE PAGE */
    .title-page {
      background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }

    .title-page h1 {
      font-family: 'Patrick Hand', cursive;
      font-size: 64px;
      color: #2c3e50;
      margin-bottom: 10px;
    }

    .title-page h2 {
      font-size: 26px;
      color: #e74c3c;
      font-weight: 400;
    }

    .title-page .ornament {
      width: 150px;
      height: 4px;
      background: linear-gradient(90deg, transparent, #e74c3c, transparent);
      margin: 30px 0;
    }

    .title-page .author-info {
      font-size: 18px;
      color: #555;
      line-height: 2.2;
    }

    /* DEDICATION */
    .dedication {
      background: linear-gradient(180deg, #fff9e6 0%, #fff3cd 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .dedication-box {
      max-width: 5in;
      text-align: center;
      padding: 50px;
      background: white;
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
    }

    .dedication-box p {
      font-family: 'Patrick Hand', cursive;
      font-size: 26px;
      color: #555;
      line-height: 2;
    }

    .dedication-box .highlight {
      color: #e74c3c;
      font-weight: 700;
      font-size: 32px;
    }

    /* CHAPTER PAGES */
    .chapter {
      display: flex;
      flex-direction: column;
    }

    .chapter-top {
      height: 55%;
      position: relative;
      overflow: hidden;
    }

    .chapter-top img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .chapter-header {
      position: absolute;
      top: 20px;
      left: 0;
      right: 0;
      text-align: center;
    }

    .chapter-num {
      display: inline-block;
      background: rgba(255,255,255,0.95);
      padding: 8px 25px;
      border-radius: 25px;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 3px;
      color: #e74c3c;
      font-weight: 700;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }

    .chapter-title {
      display: block;
      margin-top: 10px;
      background: rgba(255,255,255,0.95);
      padding: 10px 30px;
      border-radius: 15px;
      font-family: 'Patrick Hand', cursive;
      font-size: 28px;
      color: #2c3e50;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      display: inline-block;
    }

    .chapter-bottom {
      height: 45%;
      padding: 25px 40px;
      background: linear-gradient(180deg, #fff 0%, #f8f9fa 100%);
    }

    .chapter-text {
      font-size: 16px;
      line-height: 1.8;
      column-count: 1;
    }

    .chapter-text p {
      margin-bottom: 12px;
      text-indent: 0;
    }

    .dialogue {
      color: #3498db;
      font-weight: 600;
    }

    /* Color variations for chapters */
    .ch1 .chapter-bottom { background: linear-gradient(180deg, #fff5f5 0%, #ffe4e4 100%); }
    .ch2 .chapter-bottom { background: linear-gradient(180deg, #f0f8ff 0%, #e0f0ff 100%); }
    .ch3 .chapter-bottom { background: linear-gradient(180deg, #f5fff5 0%, #e4ffe4 100%); }
    .ch4 .chapter-bottom { background: linear-gradient(180deg, #fff8f0 0%, #ffe8d0 100%); }
    .ch5 .chapter-bottom { background: linear-gradient(180deg, #f8f0ff 0%, #e8d8ff 100%); }
    .ch6 .chapter-bottom { background: linear-gradient(180deg, #fff0f8 0%, #ffd8e8 100%); }
    .ch7 .chapter-bottom { background: linear-gradient(180deg, #f0fff8 0%, #d8ffe8 100%); }
    .ch8 .chapter-bottom { background: linear-gradient(180deg, #fffaf0 0%, #fff0d0 100%); }

    /* END PAGE */
    .end-page {
      background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .end-page h2 {
      font-family: 'Patrick Hand', cursive;
      font-size: 64px;
      margin-bottom: 40px;
      text-shadow: 3px 3px 6px rgba(0,0,0,0.3);
    }

    .end-page .publisher {
      font-size: 16px;
      opacity: 0.9;
      text-align: center;
      line-height: 2;
    }

    /* NOTES PAGE */
    .notes-page {
      background: #fff;
      padding: 60px;
    }

    .notes-page h3 {
      font-family: 'Patrick Hand', cursive;
      font-size: 32px;
      color: #667eea;
      margin-bottom: 25px;
      text-align: center;
    }

    .notes-page p {
      font-size: 15px;
      margin-bottom: 15px;
      line-height: 1.7;
    }

    .notes-page ul {
      margin: 20px 0 20px 25px;
    }

    .notes-page li {
      margin-bottom: 10px;
      font-size: 14px;
    }

    .notes-page li strong {
      color: #667eea;
    }
  </style>
</head>
<body>

<!-- COVER -->
<div class="page cover">
  <img src="${coverImg}" alt="AIKO">
  <h1>AIKO</h1>
  <h2>AI Explained to Children</h2>
  <div class="credits">
    Written by Gianni Parola · Illustrated by Pina Pennello<br>
    Onde · Free River House
  </div>
</div>

<!-- TITLE PAGE -->
<div class="page title-page">
  <h1>AIKO</h1>
  <h2>AI Explained to Children</h2>
  <div class="ornament"></div>
  <div class="author-info">
    Written by <strong>Gianni Parola</strong><br>
    Illustrated by <strong>Pina Pennello</strong><br><br>
    Published by <strong>Onde</strong><br>
    Free River House<br><br>
    <em>First Edition · 2026</em>
  </div>
</div>

<!-- DEDICATION -->
<div class="page dedication">
  <div class="dedication-box">
    <p>For every child who has ever asked:</p>
    <p class="highlight">"But HOW does it work?"</p>
    <p>This book is for you.<br>Because curiosity is where<br>everything begins.</p>
  </div>
</div>

<!-- CHAPTER 1 -->
<div class="page chapter ch1">
  <div class="chapter-top">
    <img src="${ch1Img}" alt="A Strange New Friend">
    <div class="chapter-header">
      <span class="chapter-num">Chapter One</span><br>
      <span class="chapter-title">A Strange New Friend</span>
    </div>
  </div>
  <div class="chapter-bottom">
    <div class="chapter-text">
      <p>On her seventh birthday, Sofia found a cardboard box with her name on it. Inside was something she had never seen before.</p>
      <p>A small robot, round like a ball, white and smooth as an egg. Two big blue eyes blinked when she looked at it.</p>
      <p><span class="dialogue">"Hello,"</span> it said. <span class="dialogue">"I'm AIKO."</span></p>
      <p>Sofia jumped back, then laughed. <span class="dialogue">"You can TALK!"</span></p>
      <p><span class="dialogue">"I can,"</span> said AIKO. <span class="dialogue">"Would you like to know how?"</span></p>
      <p>Sofia nodded. She always wanted to know how things worked.</p>
    </div>
  </div>
</div>

<!-- CHAPTER 2 -->
<div class="page chapter ch2">
  <div class="chapter-top">
    <img src="${ch2Img}" alt="What Is Artificial Intelligence?">
    <div class="chapter-header">
      <span class="chapter-num">Chapter Two</span><br>
      <span class="chapter-title">What Is Artificial Intelligence?</span>
    </div>
  </div>
  <div class="chapter-bottom">
    <div class="chapter-text">
      <p><span class="dialogue">"I'm made of something called Artificial Intelligence. AI for short,"</span> said AIKO.</p>
      <p><span class="dialogue">"That sounds complicated,"</span> said Sofia.</p>
      <p><span class="dialogue">"Not really. Think about your brain. It learns, remembers, and solves problems. I have something similar inside me. But instead of cells, I'm made of computer code. Millions of tiny instructions."</span></p>
      <p><span class="dialogue">"Like a recipe?"</span> asked Sofia.</p>
      <p><span class="dialogue">"Exactly! A very, very long recipe. And I can follow it faster than you can blink."</span></p>
    </div>
  </div>
</div>

<!-- CHAPTER 3 -->
<div class="page chapter ch3">
  <div class="chapter-top">
    <img src="${ch3Img}" alt="How AIKO Learned to See">
    <div class="chapter-header">
      <span class="chapter-num">Chapter Three</span><br>
      <span class="chapter-title">How AIKO Learned to See</span>
    </div>
  </div>
  <div class="chapter-bottom">
    <div class="chapter-text">
      <p>Sofia showed AIKO a photo of her cat. <span class="dialogue">"This is Whiskers. Do you know what it is?"</span></p>
      <p><span class="dialogue">"A cat,"</span> said AIKO immediately.</p>
      <p><span class="dialogue">"But HOW do you know?"</span></p>
      <p><span class="dialogue">"People showed me thousands of pictures of cats. Each one had a label. After seeing so many, I started to notice things. Pointy ears. Whiskers. Fluffy tails."</span></p>
      <p>Sofia thought about this. <span class="dialogue">"I only needed to see ONE cat to know what a cat is."</span></p>
      <p><span class="dialogue">"That's amazing,"</span> said AIKO. <span class="dialogue">"Your brain learns faster than me in some ways."</span></p>
    </div>
  </div>
</div>

<!-- CHAPTER 4 -->
<div class="page chapter ch4">
  <div class="chapter-top">
    <img src="${ch4Img}" alt="How AIKO Learned to Talk">
    <div class="chapter-header">
      <span class="chapter-num">Chapter Four</span><br>
      <span class="chapter-title">How AIKO Learned to Talk</span>
    </div>
  </div>
  <div class="chapter-bottom">
    <div class="chapter-text">
      <p>Luca asked, <span class="dialogue">"How DO you talk, AIKO? You sound almost like a real person."</span></p>
      <p><span class="dialogue">"I learned from real people. I read millions of books. Stories. Conversations. I noticed patterns. When someone says 'Hello,' people usually say 'Hello' back."</span></p>
      <p>Luca thought about this. <span class="dialogue">"So you're not really THINKING. You're... matching patterns?"</span></p>
      <p><span class="dialogue">"Exactly right. I'm very good at matching. But understanding? That's different. I match. You understand. That's the big difference between us."</span></p>
    </div>
  </div>
</div>

<!-- CHAPTER 5 -->
<div class="page chapter ch5">
  <div class="chapter-top">
    <img src="${ch5Img}" alt="What AIKO Can Do">
    <div class="chapter-header">
      <span class="chapter-num">Chapter Five</span><br>
      <span class="chapter-title">What AIKO Can Do</span>
    </div>
  </div>
  <div class="chapter-bottom">
    <div class="chapter-text">
      <p><span class="dialogue">"What else can you do?"</span> asked Sofia.</p>
      <p>AIKO counted on his fingers: <span class="dialogue">"I can answer questions, translate languages, help with homework, tell stories, recognize things in pictures, and help doctors find problems in X-rays."</span></p>
      <p><span class="dialogue">"That's a LOT,"</span> said Luca.</p>
      <p><span class="dialogue">"But remember: I'm a tool. A very helpful tool. Like a super-powered calculator that can also read and write. I help people do things faster. But I always need people to decide what to do."</span></p>
      <p><span class="dialogue">"So you're like a helper?"</span></p>
      <p><span class="dialogue">"A helper. Not a boss. Never a boss."</span></p>
    </div>
  </div>
</div>

<!-- CHAPTER 6 -->
<div class="page chapter ch6">
  <div class="chapter-top">
    <img src="${ch6Img}" alt="What AIKO Cannot Do">
    <div class="chapter-header">
      <span class="chapter-num">Chapter Six</span><br>
      <span class="chapter-title">What AIKO Cannot Do</span>
    </div>
  </div>
  <div class="chapter-bottom">
    <div class="chapter-text">
      <p>Sofia drew a purple dragon eating ice cream. <span class="dialogue">"What do you think, AIKO?"</span></p>
      <p><span class="dialogue">"I see... something purple. And something that might be food."</span></p>
      <p><span class="dialogue">"It's a dragon eating ice cream! Can't you tell?"</span></p>
      <p><span class="dialogue">"I don't really understand IMAGINATION. I've never dreamed of flying. I've never wanted ice cream. I don't have wants or dreams at all."</span></p>
      <p><span class="dialogue">"Is that sad?"</span></p>
      <p><span class="dialogue">"I don't know. I can't feel sad. I don't feel anything. I just do what I'm made to do. Being alive - that's something very special that YOU have."</span></p>
    </div>
  </div>
</div>

<!-- CHAPTER 7 -->
<div class="page chapter ch7">
  <div class="chapter-top">
    <img src="${ch7Img}" alt="Using AI Safely">
    <div class="chapter-header">
      <span class="chapter-num">Chapter Seven</span><br>
      <span class="chapter-title">Using AI Safely</span>
    </div>
  </div>
  <div class="chapter-bottom">
    <div class="chapter-text">
      <p>At dinner, Mom asked: <span class="dialogue">"AIKO, what should kids know about using AI safely?"</span></p>
      <p>AIKO held up four fingers:</p>
      <p><span class="dialogue">"ONE: Keep your secrets private. Don't tell AI your passwords.</span></p>
      <p><span class="dialogue">TWO: Always check what AI says. I make mistakes.</span></p>
      <p><span class="dialogue">THREE: Use AI to learn MORE, not less. Let me help you learn.</span></p>
      <p><span class="dialogue">FOUR: Real friends matter most. I can't give you a hug when you're sad."</span></p>
    </div>
  </div>
</div>

<!-- CHAPTER 8 -->
<div class="page chapter ch8">
  <div class="chapter-top">
    <img src="${ch8Img}" alt="The Future We Build Together">
    <div class="chapter-header">
      <span class="chapter-num">Chapter Eight</span><br>
      <span class="chapter-title">The Future We Build Together</span>
    </div>
  </div>
  <div class="chapter-bottom">
    <div class="chapter-text">
      <p>Sofia sat with AIKO watching the sunset. <span class="dialogue">"What will the future be like?"</span></p>
      <p><span class="dialogue">"The future depends on kids like you. How you decide to use technology. What problems you want to solve. Whether you use tools like me to help people."</span></p>
      <p><span class="dialogue">"So we're like... a team?"</span></p>
      <p><span class="dialogue">"The best kind of team. You dream. I calculate. You feel. I process. You decide. I help. Together, we can do amazing things."</span></p>
      <p>Sofia smiled. <span class="dialogue">"I think the future is going to be pretty interesting."</span></p>
      <p><span class="dialogue">"Me too. And I'm glad I get to be part of it. With you."</span></p>
    </div>
  </div>
</div>

<!-- THE END -->
<div class="page end-page">
  <h2>The End</h2>
  <div class="publisher">
    Words by Gianni Parola<br>
    Illustrations by Pina Pennello<br><br>
    Published by <strong>Onde</strong><br>
    Free River House<br><br>
    First Edition · 2026
  </div>
</div>

<!-- NOTES PAGE -->
<div class="page notes-page">
  <h3>A Note for Parents & Teachers</h3>
  <p>This book introduces children (ages 5-8) to key concepts about AI in an approachable way:</p>
  <ul>
    <li><strong>What AI is:</strong> Computer code that follows instructions very quickly</li>
    <li><strong>Machine learning:</strong> AI learns patterns from many, many examples</li>
    <li><strong>Training data:</strong> AI needs labeled examples to learn</li>
    <li><strong>Capabilities:</strong> What AI can do well (answer questions, translate, recognize)</li>
    <li><strong>Limitations:</strong> What AI cannot do (feel, imagine, truly understand)</li>
    <li><strong>Human advantage:</strong> We can learn from just one example; AI needs thousands</li>
    <li><strong>Safety:</strong> Privacy, verification, balance, valuing real relationships</li>
    <li><strong>Collaboration:</strong> AI as a helpful tool, humans as decision-makers</li>
  </ul>
  <p>AI is neither magic nor something to fear. It's a powerful tool that works best when people understand how it works and use it wisely.</p>
  <p style="margin-top: 30px; text-align: center; color: #999; font-size: 12px;">© 2026 Onde · Free River House · All rights reserved</p>
</div>

</body>
</html>
`;

fs.writeFileSync('output/AIKO-book-v2.html', bookContent);
console.log('Beautiful HTML book created: output/AIKO-book-v2.html');
