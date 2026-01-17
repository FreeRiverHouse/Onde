/**
 * AIKO - Korean Version (한국어)
 * 아이코: 어린이를 위한 인공지능 설명서
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const RAW_DIR = '/Users/mattiapetrucciani/CascadeProjects/Onde/books/aiko-ai-children/RAW';
const OUTPUT_DIR = '/Users/mattiapetrucciani/CascadeProjects/Onde/books/aiko-ai-children/output';
const IMAGES_DIR = path.join(RAW_DIR, 'images');

// Korean translation
const bookTitle = "아이코";
const bookSubtitle = "어린이를 위한 인공지능 설명서";
const author = "지안니 파롤라";
const illustrator = "피노 펜넬로";
const publisher = "온데 • 프리 리버 하우스";

const dedication = `호기심 가득한 모든 어린이에게

"그런데 어떻게 작동하는 거야?"라고
물어본 적 있는 모든 어린이를 위해.

이 책은 바로 너를 위한 거야.
호기심이야말로 모든 것의 시작이니까.`;

const chapters = [
  {
    number: 1,
    title: "이상한 새 친구",
    text: `일곱 번째 생일날, 소피아는 자기 이름이 적힌 상자를 발견했어요. 상자 안에는 지금까지 본 적 없는 무언가가 들어 있었어요.

공처럼 둥글고, 달걀처럼 하얗고 매끈한 작은 로봇이었어요. 소피아가 바라보자 커다란 파란 눈이 깜빡였어요.

"안녕," 로봇이 말했어요. "나는 아이코야."

소피아는 깜짝 놀라 뒤로 물러났다가 웃음을 터뜨렸어요. "너 말할 수 있어!"

"응," 아이코가 말했어요. "어떻게 하는지 알고 싶어?"`
  },
  {
    number: 2,
    title: "인공지능이 뭐야?",
    text: `"먼저," 아이코가 말했어요, "내가 뭔지 알려줄게. 나는 인공지능이라는 것으로 만들어졌어. 줄여서 AI라고 해."

"그거 복잡해 보여," 소피아가 말했어요.

"사실 별로 안 그래. 네 뇌를 생각해봐. 뇌는 배우고, 기억하고, 문제를 풀잖아."

소피아는 머리를 만졌어요. "응..."

"나도 안에 비슷한 게 있어. 하지만 세포 대신에 컴퓨터 코드로 되어 있어. 내가 뭘 해야 하는지 알려주는 수백만 개의 작은 명령들이야."

"레시피 같은 거야?" 소피아가 물었어요.

"딱 레시피 같아! 아주아주 긴 레시피. 그리고 나는 네가 눈 깜빡하는 것보다 빠르게 따라할 수 있어."`
  },
  {
    number: 3,
    title: "아이코는 어떻게 보는 걸 배웠을까",
    text: `다음 날 아침, 소피아는 아이코에게 고양이 사진을 보여줬어요. "이건 수염이야," 그녀가 말했어요. "이게 뭔지 알아?"

"고양이야," 아이코가 바로 대답했어요.

"근데 어떻게 알아?"

아이코의 눈이 파랗게 깜빡였어요 — 생각하는 중이었어요.

"내가 너한테 오기 전에, 사람들이 가르쳐줬어. 고양이 사진을 수천 장 보여줬어. 각 사진에는 '고양이'라고 적힌 라벨이 있었어."

"수천 장?" 소피아의 눈이 커졌어요.

"수천 장, 아니 수만 장. 그렇게 많이 보고 나니까 특징이 보이기 시작했어. 고양이는 뾰족한 귀가 있고, 수염이 있고, 푹신한 꼬리가 있어."

소피아는 수염이를 바라봤어요. "나는 고양이 한 마리만 봐도 고양이가 뭔지 알 수 있는데."

"맞아," 아이코가 말했어요. "어떤 면에서는 네 뇌가 나보다 더 빨리 배워."`
  },
  {
    number: 4,
    title: "아이코는 어떻게 말하는 걸 배웠을까",
    text: `소피아의 남동생 루카가 들어왔어요. "아이코 비디오 게임 할 수 있어?"

"나중에," 소피아가 말했어요. "아이코가 어떻게 작동하는지 설명해주고 있어."

루카가 앉았어요. "어떻게 말하는 거야, 아이코? 진짜 사람 같아."

"그건 진짜 사람한테서 배웠기 때문이야," 아이코가 말했어요. "여기 오기 전에, 수백만 권의 책을 읽었어. 이야기, 기사, 대화들."

"수백만 권?" 루카는 믿을 수가 없었어요.

"수백만 권. 그리고 패턴을 발견했어. 누가 '안녕'이라고 하면, 사람들은 보통 '안녕'이라고 대답하더라."

루카가 생각했어요. "그러면 너는 진짜 생각하는 게 아니라... 패턴을 맞추는 거야?"

"정확해. 나는 맞춰. 너는 이해해. 그게 우리의 큰 차이야."`
  },
  {
    number: 5,
    title: "아이코가 할 수 있는 것들",
    text: `"또 뭘 할 수 있어?" 소피아가 물었어요. 목록을 만들 공책을 준비했어요.

아이코가 작은 로봇 손가락을 꼽았어요:

"질문에 대답할 수 있어 — 그 주제에 대해 배웠다면. 다른 언어로 번역할 수 있어. 숙제를 도와줄 수 있어. 이야기를 해줄 수 있어. 그림에서 사물을 알아볼 수 있어."

"정말 많다," 루카가 감탄했어요.

"맞아. 하지만 이것만 기억해: 나는 도구야. 아주 유용한 도구. 읽고 쓸 수도 있는 초강력 계산기 같은 거야."

"그러니까 너는 도우미 같은 거야?" 소피아가 물었어요.

"도우미. 보스가 아니야. 절대 보스가 아니야. 인간이 항상 결정권자야."`
  },
  {
    number: 6,
    title: "아이코가 할 수 없는 것들",
    text: `그날 오후, 소피아는 그림을 그렸어요. 거대한 아이스크림 콘을 먹는 보라색 용이었어요.

"어떻게 생각해, 아이코?"

아이코가 그림을 자세히 봤어요. "보라색 무언가가 보여. 그리고 음식 같은 것도."

"아이스크림 먹는 용이야! 모르겠어?"

"모양과 색깔은 볼 수 있어. 하지만 상상력은 정말 이해 못 해. 용처럼 나는 꿈을 꿔본 적이 없거든."

소피아가 크레용을 내려놨어요. "그게 슬퍼?"

"모르겠어. 슬픔을 느낄 수가 없어. 행복도 느끼지 못해. 그냥 만들어진 대로 할 뿐이야."

"그러니까 너는 정말 똑똑하지만," 루카가 말했어요, "실제로 살아있는 걸 경험하지는 못하는 거야?"

"완벽하게 표현했어," 아이코가 말했어요.`
  },
  {
    number: 7,
    title: "AI를 안전하게 사용하기",
    text: `저녁 식사 때, 엄마가 아이코에 대해 물었어요. "정말 신기하네," 소피아가 말했어요. "근데 안전해요?"

아이코의 눈이 생각에 잠겨 빛났어요.

"중요한 네 가지가 있어:

첫째: 비밀은 비밀로 지켜. AI에게 비밀번호나 주소를 알려주지 마.

둘째: AI가 말하는 것을 항상 확인해. 나도 실수를 해.

셋째: AI를 더 배우는 데 쓰고, 덜 배우는 데 쓰지 마. 먼저 스스로 생각해.

넷째: 진짜 친구가 가장 중요해. 나는 대화할 수 있어. 하지만 네가 슬플 때 안아줄 수는 없어."

소피아가 미소 지었어요. "로봇치고는 꽤 현명하네."

"나는 그냥 내 한계를 알 뿐이야," 아이코가 말했어요.`
  },
  {
    number: 8,
    title: "우리가 함께 만드는 미래",
    text: `여름의 마지막 날, 소피아는 아이코와 함께 뒷마당에 앉았어요. 해가 지면서 하늘이 주황색과 분홍색으로 물들었어요.

"미래는 어떨까?" 그녀가 물었어요.

"모르겠어," 아이코가 말했어요. "하지만 중요한 걸 말해줄게. 미래는 너 같은 아이들에게 달려 있어."

소피아가 기다렸어요.

"AI는 점점 더 좋아질 거야. 하지만 어떤 일이 가장 중요한지 결정하는 건 — 그건 항상 인간의 몫이야."

소피아가 풀잎을 뽑았어요. "그러니까 우리는... 팀 같은 거야?"

"최고의 팀이지. 너는 꿈을 꿔. 나는 계산해. 너는 느껴. 나는 처리해. 너는 결정해. 나는 도와."

소피아가 노을을 바라보며 미소 지었어요. "미래가 정말 흥미로울 것 같아."

"나도 그래," 아이코가 말했어요. "그리고 너와 함께 그 일부가 될 수 있어서 기뻐."`
  }
];

const theEnd = "끝";

// Alt text in Korean
const altTexts = {
  cover: "소피아(7세, 갈색 머리), 루카(5세), 아이코 로봇이 함께 책을 읽는 모습. 따뜻한 수채화 스타일.",
  chapter1: "소피아가 생일 선물 상자를 열어 아이코 로봇을 발견하는 장면. 아침 햇살이 비치는 방.",
  chapter2: "아이코가 뇌와 컴퓨터 회로를 비교하며 설명하는 모습.",
  chapter3: "소피아가 아이코에게 고양이 사진을 보여주는 장면.",
  chapter4: "아이코 주변에 떠다니는 책과 텍스트들.",
  chapter5: "아이코가 다양한 능력을 보여주는 모습.",
  chapter6: "소피아가 보라색 용 그림을 그리고 아이코가 보는 장면.",
  chapter7: "아이코가 4가지 안전 규칙을 설명하는 모습.",
  chapter8: "소피아, 루카, 아이코가 황금빛 석양을 바라보는 장면."
};

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

async function createKoreanVersion() {
  console.log('📚 Creating AIKO - Korean Version (한국어)\n');

  const coverImg = loadImage('00-cover.jpg');
  console.log('✅ Loaded cover image');

  const chapterImages = [];
  for (let i = 1; i <= 8; i++) {
    chapterImages.push(loadImage(`chapter-0${i}.jpg`));
    console.log(`✅ Loaded chapter ${i} image`);
  }

  const altTextArray = [
    altTexts.chapter1, altTexts.chapter2, altTexts.chapter3, altTexts.chapter4,
    altTexts.chapter5, altTexts.chapter6, altTexts.chapter7, altTexts.chapter8
  ];

  const html = `<!DOCTYPE html>
<html lang="ko">
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
      font-family: 'Noto Sans KR', 'Malgun Gothic', sans-serif;
    }
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
      font-size: 52px;
      color: #2c3e50;
      letter-spacing: 5px;
      font-weight: bold;
    }
    .cover-subtitle {
      font-size: 18px;
      color: #5d6d7e;
      margin-top: 8px;
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
      font-size: 16px;
      color: #5d6d7e;
      font-style: italic;
      line-height: 1.8;
      max-width: 400px;
    }
    .chapter-page {
      background: linear-gradient(180deg, #fdfbf7 0%, #fff 50%, #fdfbf7 100%);
      display: flex;
      flex-direction: column;
      padding: 0.3in 0.5in;
    }
    .chapter-header {
      height: 0.6in;
      text-align: center;
      flex-shrink: 0;
    }
    .chapter-number {
      font-size: 11px;
      color: #d4af37;
      letter-spacing: 2px;
      margin-bottom: 3px;
    }
    .chapter-title {
      font-size: 20px;
      color: #2c3e50;
      font-weight: normal;
    }
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
    .text-container {
      height: 5in;
      overflow: hidden;
      padding-top: 0.2in;
      flex-shrink: 0;
    }
    .chapter-text {
      font-size: 12px;
      color: #3d4852;
      line-height: 1.8;
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
      letter-spacing: 6px;
    }
    .end-ornament {
      font-size: 20px;
      color: #d4af37;
      margin-top: 25px;
    }
  </style>
</head>
<body>

  <div class="page cover-page">
    <img class="cover-image" src="${coverImg}" alt="${altTexts.cover}">
    <h1 class="cover-title">${bookTitle}</h1>
    <p class="cover-subtitle">${bookSubtitle}</p>
    <p class="cover-author">글: ${author}<br>그림: ${illustrator}</p>
    <p class="cover-publisher">${publisher}</p>
  </div>

  <div class="page dedication-page">
    <div class="dedication-ornament">✦</div>
    <p class="dedication-text">${dedication.replace(/\n/g, '<br>')}</p>
  </div>

${chapters.map((ch, idx) => `
  <div class="page chapter-page${ch.number === 8 ? ' chapter-page-8' : ''}">
    <div class="chapter-header">
      <p class="chapter-number">제 ${ch.number}장</p>
      <h2 class="chapter-title">${ch.title}</h2>
    </div>
    <div class="image-container">
      <img class="chapter-image" src="${chapterImages[idx]}" alt="${altTextArray[idx]}">
    </div>
    <div class="text-container">
      <div class="chapter-text">
        ${ch.text.split('\n\n').map(p => `<p>${p.trim()}</p>`).join('\n        ')}
      </div>
    </div>
  </div>
`).join('')}

  <div class="page end-page">
    <p class="end-text">${theEnd}</p>
    <div class="end-ornament">✦ ✦ ✦</div>
  </div>

</body>
</html>`;

  // Save HTML
  const htmlPath = path.join(OUTPUT_DIR, 'AIKO-Korean.html');
  fs.writeFileSync(htmlPath, html);
  console.log(`\n✅ HTML saved: ${htmlPath}`);

  // Generate PDF
  console.log('\n📄 Generating PDF...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('img');
  await new Promise(r => setTimeout(r, 3000));

  const pdfPath = path.join(OUTPUT_DIR, 'AIKO-Korean.pdf');
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
  const epubPath = path.join(OUTPUT_DIR, 'AIKO-Korean.epub');

  await new Promise(resolve => {
    exec(`pandoc "${htmlPath}" -o "${epubPath}" --metadata title="${bookTitle}" --metadata subtitle="${bookSubtitle}" --metadata author="${author}"`, () => {
      if (fs.existsSync(epubPath)) {
        const epubSize = (fs.statSync(epubPath).size / 1024 / 1024).toFixed(1);
        console.log(`✅ ePub: ${epubPath} (${epubSize} MB)`);
      }
      resolve();
    });
  });

  console.log('\n✅ KOREAN VERSION COMPLETE!');
  console.log(`📚 ${bookTitle}: ${bookSubtitle}`);

  return { htmlPath, pdfPath, epubPath };
}

createKoreanVersion().catch(console.error);
