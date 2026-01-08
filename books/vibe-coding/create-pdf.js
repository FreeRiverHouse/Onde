const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const chapters = [
  '00-introduction.md',
  '01-setup.md',
  '02-prompting.md',
  '03-costs.md',
  '04-tools-landscape.md',
  '05-prerequisites.md',
  '06-real-project.md',
  '07-pdf-generation.md',
  '08-pitfalls.md',
  '09-shipping.md',
  'appendix-a-tools.md',
  'appendix-b-prompts.md',
  'appendix-c-ideas.md'
];

function markdownToHtml(md) {
  return md
    // Headers
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    // Bold and italic
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Lists
    .replace(/^\- (.*$)/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.*$)/gm, '<li>$2</li>')
    // Tables (simple)
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(c => c.trim());
      if (cells.some(c => /^[-:]+$/.test(c.trim()))) return '';
      return '<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>';
    })
    // Blockquotes
    .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
    // Horizontal rules
    .replace(/^---$/gm, '<hr>')
    // Paragraphs
    .replace(/\n\n/g, '</p><p>')
    // Clean up lists
    .replace(/(<li>.*<\/li>)\n(<li>)/g, '$1$2')
    .replace(/(<li>.*<\/li>)(?!\n*<li>)/g, '<ul>$1</ul>');
}

async function createPdf() {
  let allContent = '';

  for (const chapter of chapters) {
    const filePath = path.join(__dirname, 'chapters', chapter);
    const content = fs.readFileSync(filePath, 'utf8');
    allContent += markdownToHtml(content) + '\n<div class="page-break"></div>\n';
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', -apple-system, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1a1a1a;
      padding: 0;
    }

    .cover {
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      page-break-after: always;
    }

    .cover h1 {
      font-size: 48pt;
      font-weight: 700;
      margin-bottom: 0.5em;
    }

    .cover .subtitle {
      font-size: 18pt;
      opacity: 0.9;
      margin-bottom: 2em;
    }

    .cover .collana {
      font-size: 12pt;
      opacity: 0.7;
      margin-top: 3em;
    }

    .page-break {
      page-break-after: always;
    }

    h1 {
      font-size: 24pt;
      font-weight: 700;
      margin: 1.5em 0 0.5em;
      color: #1a1a1a;
      page-break-after: avoid;
    }

    h2 {
      font-size: 16pt;
      font-weight: 600;
      margin: 1.5em 0 0.5em;
      color: #333;
      page-break-after: avoid;
    }

    h3 {
      font-size: 12pt;
      font-weight: 600;
      margin: 1em 0 0.5em;
      color: #444;
    }

    p {
      margin: 0.8em 0;
      text-align: justify;
    }

    pre {
      background: #f5f5f5;
      border-radius: 6px;
      padding: 1em;
      margin: 1em 0;
      overflow-x: auto;
      font-size: 9pt;
    }

    code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9pt;
    }

    p code, li code {
      background: #f0f0f0;
      padding: 0.2em 0.4em;
      border-radius: 3px;
    }

    ul, ol {
      margin: 0.8em 0;
      padding-left: 2em;
    }

    li {
      margin: 0.3em 0;
    }

    blockquote {
      border-left: 3px solid #667eea;
      padding-left: 1em;
      margin: 1em 0;
      font-style: italic;
      color: #555;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1em 0;
      font-size: 10pt;
    }

    td, th {
      border: 1px solid #ddd;
      padding: 0.5em;
      text-align: left;
    }

    hr {
      border: none;
      border-top: 1px solid #ddd;
      margin: 2em 0;
    }

    a {
      color: #667eea;
      text-decoration: none;
    }

    strong {
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="cover">
    <h1>Code Surfing</h1>
    <div class="subtitle">Build Apps in a Day with AI</div>
    <div class="collana">Onde on the Tech</div>
  </div>

  <p>${allContent}</p>
</body>
</html>
  `;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  await page.pdf({
    path: path.join(__dirname, 'code-surfing.pdf'),
    format: 'A5',
    printBackground: true,
    margin: {
      top: '0.75in',
      bottom: '0.75in',
      left: '0.6in',
      right: '0.6in'
    }
  });

  await browser.close();
  console.log('PDF created: code-surfing.pdf');
}

createPdf().catch(console.error);
