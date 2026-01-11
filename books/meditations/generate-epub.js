const Epub = require('epub-gen');
const fs = require('fs');
const path = require('path');

// Book metadata
const booksEN = [
  { num: 1, title: 'Gratitude', theme: 'Lessons from Teachers and Family' },
  { num: 2, title: 'Acceptance', theme: 'On the River Gran, Among the Quadi' },
  { num: 3, title: 'Self-Mastery', theme: 'In Carnuntum' },
  { num: 4, title: 'The Inner Citadel', theme: 'Retreat Within Yourself' },
  { num: 5, title: 'Duty', theme: 'At Dawn, When You Awake' },
  { num: 6, title: 'Living with Nature', theme: 'The Universe and Change' },
  { num: 7, title: 'Resilience', theme: 'Pain, Pleasure, and Death' },
  { num: 8, title: 'The Present Moment', theme: 'Remember How Long' },
  { num: 9, title: 'Justice', theme: 'Injustice and Impiety' },
  { num: 10, title: 'A Healthy Mind', theme: "The Soul's Aspiration" },
  { num: 11, title: 'Improving the Soul', theme: 'The Rational Soul' },
  { num: 12, title: 'Graceful Acceptance', theme: 'All That You Pray For' }
];

const booksIT = [
  { num: 1, title: 'Gratitudine', theme: 'Lezioni dai Maestri e dalla Famiglia' },
  { num: 2, title: 'Accettazione', theme: 'Sul fiume Gran, tra i Quadi' },
  { num: 3, title: 'Padronanza di Sé', theme: 'A Carnunto' },
  { num: 4, title: 'La Cittadella Interiore', theme: 'Ritirati in Te Stesso' },
  { num: 5, title: 'Dovere', theme: "All'Alba, Quando Ti Svegli" },
  { num: 6, title: 'Vivere Secondo Natura', theme: "L'Universo e il Cambiamento" },
  { num: 7, title: 'Resilienza', theme: 'Dolore, Piacere e Morte' },
  { num: 8, title: 'Il Momento Presente', theme: 'Ricorda Quanto a Lungo' },
  { num: 9, title: 'Giustizia', theme: "Ingiustizia e Empietà" },
  { num: 10, title: 'Una Mente Sana', theme: "L'Aspirazione dell'Anima" },
  { num: 11, title: 'Migliorare lo Spirito', theme: "L'Anima Razionale" },
  { num: 12, title: 'Accettazione Serena', theme: 'Tutto Ciò che Desideri' }
];

const bookNamesEN = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'];
const bookNamesIT = ['Primo', 'Secondo', 'Terzo', 'Quarto', 'Quinto', 'Sesto', 'Settimo', 'Ottavo', 'Nono', 'Decimo', 'Undicesimo', 'Dodicesimo'];

// Extract text from HTML file
function extractTextFromHtml(htmlPath) {
  const html = fs.readFileSync(htmlPath, 'utf-8');
  const chapters = [];

  // Find content between book-opener and next book-opener or end-page
  const bookOpenerRegex = /<div class="page book-opener">([\s\S]*?)<div class="book-number">Book ([^<]+)<\/div>\s*<div class="book-title">([^<]+)<\/div>/g;
  const contentRegex = /<div class="content">([\s\S]*?)<\/div>/g;

  let match;
  const bookStarts = [];

  // First find all book openers
  while ((match = bookOpenerRegex.exec(html)) !== null) {
    bookStarts.push({
      index: match.index,
      bookNum: match[2],
      title: match[3]
    });
  }

  // Now extract content for each book
  for (let i = 0; i < bookStarts.length; i++) {
    const start = bookStarts[i].index;
    const end = bookStarts[i + 1] ? bookStarts[i + 1].index : html.indexOf('end-page');

    const bookHtml = html.substring(start, end);
    let content = '';

    contentRegex.lastIndex = 0;
    while ((match = contentRegex.exec(bookHtml)) !== null) {
      content += match[1];
    }

    // Clean up content
    content = content
      .replace(/<p>/g, '<p style="margin-bottom: 1em; text-indent: 1.5em;">')
      .trim();

    chapters.push({
      title: `Book ${bookStarts[i].bookNum}: ${bookStarts[i].title}`,
      data: content || '<p>Content pending translation.</p>'
    });
  }

  return chapters;
}

async function generateEnglishEpub() {
  console.log('Generating English EPUB...');

  const htmlPath = path.join(__dirname, 'meditations-george-long.html');
  if (!fs.existsSync(htmlPath)) {
    console.log('English HTML not found, using book data directly...');
  }

  // Read book texts from /tmp files
  const chapters = [];

  // Add forward as first chapter
  chapters.push({
    title: 'Forward',
    data: `<p style="font-style: italic; margin-bottom: 1.5em;">You found this. Or maybe it found you.</p>
<p style="margin-bottom: 1.5em;">A Roman emperor wrote these words two thousand years ago, alone in his tent, after long days of war. They were never meant to be read by anyone else. Just a man trying to stay sane, stay kind, stay human—while the weight of an empire pressed down on him.</p>
<p style="margin-bottom: 1.5em;">And somehow, here they are. In your hands.</p>
<p style="margin-bottom: 1.5em;">We're Onde, a small publishing house in Los Angeles. The rest is between you and Marcus.</p>`
  });

  for (let i = 1; i <= 12; i++) {
    const tmpPath = `/tmp/book${i}.html`;
    if (fs.existsSync(tmpPath)) {
      let html = fs.readFileSync(tmpPath, 'utf-8');
      // Extract text
      let text = html.split(/<A NAME="start">/i)[1] || html;
      text = text.split(/<DIV ALIGN="CENTER"><TABLE/i)[0] || text;
      text = text
        .replace(/<A NAME="[^"]*">/gi, '')
        .replace(/<\/A>/gi, '')
        .replace(/<BR><BR>/gi, '</p><p>')
        .replace(/<BR>/gi, '<br/>')
        .replace(/<[^>]+>/g, (match) => {
          if (match.match(/<\/?p>/i) || match.match(/<br\/?>/i)) return match;
          return '';
        })
        .replace(/&nbsp;/g, ' ')
        .trim();

      chapters.push({
        title: `Book ${bookNamesEN[i-1]}: ${booksEN[i-1].title}`,
        data: `<h2>${booksEN[i-1].theme}</h2>${text}`
      });
    }
  }

  const coverPath = path.join(__dirname, 'images/cover.jpg');

  const options = {
    title: 'Meditations',
    author: 'Marcus Aurelius',
    publisher: 'Onde Classics',
    cover: fs.existsSync(coverPath) ? coverPath : undefined,
    content: chapters,
    appendChapterTitles: false,
    lang: 'en',
    tocTitle: 'Contents',
    customHtmlTocTemplatePath: undefined,
    customNcxTocTemplatePath: undefined,
    version: 3
  };

  const outputPath = path.join(__dirname, 'Meditations-Marcus-Aurelius-George-Long.epub');

  try {
    await new Epub(options, outputPath).promise;
    console.log(`English EPUB saved: ${outputPath}`);
  } catch (err) {
    console.error('Error generating English EPUB:', err);
  }
}

async function generateItalianEpub() {
  console.log('Generating Italian EPUB...');

  const htmlPath = path.join(__dirname, 'meditazioni-italiano.html');
  let chapters = [];

  if (fs.existsSync(htmlPath)) {
    const html = fs.readFileSync(htmlPath, 'utf-8');

    // Extract content pages for each book
    for (let i = 0; i < 12; i++) {
      const bookNum = i + 1;
      const bookTitle = booksIT[i].title;
      const bookTheme = booksIT[i].theme;

      // Find content between this book opener and next
      const openerRegex = new RegExp(`<div class="book-number">Libro ${bookNamesIT[i]}</div>[\\s\\S]*?<div class="book-theme">${bookTheme.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</div>`, 'i');
      const match = html.match(openerRegex);

      if (match) {
        const startIdx = match.index + match[0].length;
        const nextOpenerRegex = new RegExp(`<div class="book-number">Libro ${bookNamesIT[i + 1] || 'FINE'}</div>`, 'i');
        const nextMatch = html.substring(startIdx).match(nextOpenerRegex);
        const endIdx = nextMatch ? startIdx + nextMatch.index : html.indexOf('class="end-page"', startIdx);

        const bookSection = html.substring(startIdx, endIdx > startIdx ? endIdx : undefined);

        // Extract content
        let content = '';
        const contentRegex = /<div class="content">([\s\S]*?)<\/div>/g;
        let contentMatch;
        while ((contentMatch = contentRegex.exec(bookSection)) !== null) {
          content += contentMatch[1];
        }

        chapters.push({
          title: `Libro ${bookNamesIT[i]}: ${bookTitle}`,
          data: `<h2>${bookTheme}</h2>${content || '<p>Contenuto in traduzione.</p>'}`
        });
      } else {
        chapters.push({
          title: `Libro ${bookNamesIT[i]}: ${bookTitle}`,
          data: `<h2>${bookTheme}</h2><p>Contenuto in traduzione.</p>`
        });
      }
    }
  }

  const coverPath = path.join(__dirname, 'images/cover.jpg');

  const options = {
    title: 'Meditazioni',
    author: 'Marco Aurelio',
    publisher: 'Onde Classics',
    cover: fs.existsSync(coverPath) ? coverPath : undefined,
    content: chapters,
    appendChapterTitles: false,
    lang: 'it',
    tocTitle: 'Indice',
    version: 3
  };

  const outputPath = path.join(__dirname, 'Meditazioni-Marco-Aurelio-Italiano.epub');

  try {
    await new Epub(options, outputPath).promise;
    console.log(`Italian EPUB saved: ${outputPath}`);
  } catch (err) {
    console.error('Error generating Italian EPUB:', err);
  }
}

async function main() {
  await generateEnglishEpub();
  await generateItalianEpub();
  console.log('Done!');
}

main().catch(console.error);
