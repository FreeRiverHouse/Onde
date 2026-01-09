const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const bookDir = __dirname;
const imagesDir = path.join(bookDir, 'images');
const outputPath = path.join(bookDir, 'AIKO-2-Robotaxi.pdf');

const chapters = [
  { num: 1, title: "A Special Trip" },
  { num: 2, title: "A Car with Robot Eyes" },
  { num: 3, title: "The Brain Inside" },
  { num: 4, title: "Seeing the Invisible" },
  { num: 5, title: "Safety First" },
  { num: 6, title: "No Driver, But Many Helpers" },
  { num: 7, title: "Dreaming of Tomorrow" },
  { num: 8, title: "Arriving Safely" }
];

const chapterTexts = {
  1: `It was a sunny Saturday morning.
Mom had a surprise for Sofia.

"Today, we're going to Grandma's house," said Mom.
"But we're not taking our car."

Sofia looked confused. "Then how will we get there?"

Mom smiled and pointed at her phone.
"I called a special taxi. Look!"

A white car pulled up in front of their house.
It was smooth and quiet.
And when Sofia looked through the window...

"Mom! There's no one driving!"

AIKO's blue eyes blinked with excitement.
"Sofia, this is a ROBOTAXI.
A car that drives itself.
Using Artificial Intelligence - just like me!"`,

  2: `Before getting in, Sofia walked around the car.
She noticed strange things on it.

"What are all these bumps and cameras?" she asked.

AIKO floated closer to explain.

"These are the car's EYES.
See these cameras? There are eight of them!
They can see in every direction at once."

Sofia pointed at a small spinning thing on the roof.
"What about that?"

"That's called LiDAR," said AIKO.
"It shoots invisible laser beams in all directions.
It creates a 3D map of everything around the car.
Sixty times every second!"

"Wow," whispered Sofia. "It sees MORE than we do."`,

  3: `They climbed inside.
The car was cozy, with soft seats and big windows.

"Welcome aboard," said a friendly voice.
"I will take you to Grandma's house safely."

Sofia looked around. "Where's the steering wheel?"

"There isn't one," said Mom. "This car doesn't need it."

AIKO explained: "The car has a computer brain.
It takes all the information from the cameras and LiDAR,
and it thinks: What should I do next?"

"But how does it KNOW what to do?" asked Sofia.

"This car learned by practicing driving
millions and millions of times.
It learned what to do in every situation."

The car started moving smoothly.
Sofia didn't even feel it start.`,

  4: `As they drove, a screen showed something magical.
It showed the street - but different.
Every car had a colored box around it.
Every person had a glowing outline.

"What is this?" asked Sofia.

"This is how the car SEES the world," said AIKO.
"It doesn't see colors like you do.
It sees objects and movements.
Every car is a box with a speed and direction.
The car is always predicting: What will happen next?"

Mom pointed at a cyclist on the side of the road.
"See? The car is already planning what to do
if the cyclist moves into the road."

"It thinks ahead!" said Sofia.

"Always," said AIKO. "Many times per second."`,

  5: `Suddenly, the car slowed down and stopped.

"Why did we stop?" asked Sofia.

A group of children was crossing the street.
One of them dropped a ball that rolled toward the road.

The car stayed completely still.
It waited until every child was safely across.
Then it waited three more seconds - just to be sure.

"The car is very careful," said Mom.

AIKO nodded. "The most important rule for a robotaxi is:
NEVER hurt anyone.
Safety always comes first."

"But what if something breaks?" asked Sofia.

"The car has BACKUP systems.
If one camera fails, there are seven more.
And if something really goes wrong,
the car will safely pull over and stop."

Sofia felt safe. Safer than she expected.`,

  6: `"So the car drives itself," said Sofia.
"But who MADE it so smart?"

"Thousands of people," said AIKO.

"Really?"

"Really. Engineers wrote the code that lets the car think.
Artists designed the maps it follows.
Safety experts tested it millions of times.
Mechanics keep every car in perfect condition."

Mom added: "Even though there's no driver in this car,
humans are still in charge."

"So it's like... teamwork?" asked Sofia.

"The biggest teamwork ever," said AIKO.
"Humans and AI, working together.
The AI does the driving.
The humans make sure it drives WELL."`,

  7: `The ride was almost over.
Sofia could see Grandma's neighborhood.

"AIKO," she said, "what will the future be like?
Will ALL cars drive themselves?"

"Maybe," said AIKO. "Someday.
Imagine a world where no one crashes because of mistakes.
Where old people and kids can travel anywhere, safely.
Where cities have more parks because we need fewer parking lots."

"That sounds amazing," said Sofia.

"It could be. But it's up to humans to decide.
Technology can help.
But people must choose to use it wisely."

Sofia thought about this.
"I want to help build that future."

AIKO's eyes glowed warmly.
"I know you will, Sofia."`,

  8: `The car stopped gently in front of Grandma's house.

"You have arrived," said the friendly voice.
"Thank you for riding with us. Have a wonderful day!"

Grandma was already waving from the porch.

Sofia stepped out and looked back at the robotaxi.
"Thank you, car!"

The car's lights blinked once - almost like a wink.
Then it drove away quietly.

"So," said Mom, "what did you think?"

Sofia smiled her biggest smile.
"I think the future is already here.
And it's pretty amazing."

She looked at AIKO.
"We're not just passengers.
We're the ones who will build tomorrow."

AIKO blinked happily. "Together."

"Together," Sofia agreed.

And they went inside to tell Grandma
all about their incredible adventure.

THE END`
};

async function createPDF() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: A4; margin: 0; }
    body { font-family: 'Georgia', serif; margin: 0; padding: 0; }
    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 20mm;
      box-sizing: border-box;
      page-break-after: always;
    }
    .cover {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      min-height: 297mm;
    }
    .cover img {
      max-width: 150mm;
      max-height: 180mm;
      margin-bottom: 15mm;
    }
    .cover h1 {
      font-size: 32pt;
      margin: 5mm 0;
      color: #2c3e50;
    }
    .cover h2 {
      font-size: 18pt;
      color: #7f8c8d;
      margin: 3mm 0;
    }
    .cover .credits {
      font-size: 11pt;
      color: #95a5a6;
      margin-top: 10mm;
    }
    .chapter { padding: 15mm 20mm; }
    .chapter-title {
      font-size: 22pt;
      color: #2980b9;
      margin-bottom: 8mm;
      text-align: center;
    }
    .chapter-img {
      width: 100%;
      max-height: 120mm;
      object-fit: contain;
      margin: 8mm 0;
      border-radius: 3mm;
    }
    .chapter-text {
      font-size: 13pt;
      line-height: 1.6;
      text-align: justify;
      white-space: pre-line;
    }
  </style>
</head>
<body>`;

  // Cover page
  const coverImg = fs.readFileSync(path.join(imagesDir, 'cover.jpg')).toString('base64');
  html += `
  <div class="page cover">
    <img src="data:image/jpeg;base64,${coverImg}" alt="Cover">
    <h1>AIKO 2</h1>
    <h2>The Robotaxi Adventure</h2>
    <div class="credits">
      Written by Gianni Parola<br>
      Illustrated by Pina Pennello<br><br>
      Published by Onde
    </div>
  </div>`;

  // Chapter pages
  for (const ch of chapters) {
    const imgPath = path.join(imagesDir, `chapter-0${ch.num}.jpg`);
    const imgData = fs.readFileSync(imgPath).toString('base64');

    html += `
  <div class="page chapter">
    <div class="chapter-title">Chapter ${ch.num}: ${ch.title}</div>
    <img class="chapter-img" src="data:image/jpeg;base64,${imgData}" alt="Chapter ${ch.num}">
    <div class="chapter-text">${chapterTexts[ch.num]}</div>
  </div>`;
  }

  html += `</body></html>`;

  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  await browser.close();
  console.log('PDF created:', outputPath);
}

createPDF().catch(console.error);
