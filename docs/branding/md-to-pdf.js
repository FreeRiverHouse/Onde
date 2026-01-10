const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Simple markdown to HTML converter
function mdToHtml(md) {
  let html = md
    // Headers
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Code blocks
    .replace(/```[\s\S]*?```/g, (match) => {
      return '<pre>' + match.slice(3, -3) + '</pre>';
    })
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Lists
    .replace(/^\- (.*$)/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.*$)/gm, '<li>$2</li>')
    // Tables (basic)
    .replace(/\|(.+)\|/g, (match, content) => {
      const cells = content.split('|').map(c => c.trim());
      return '<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>';
    })
    // Horizontal rules
    .replace(/^---$/gm, '<hr>')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Georgia', serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      line-height: 1.6;
      color: #333;
    }
    h1 { color: #2c5282; border-bottom: 2px solid #2c5282; padding-bottom: 10px; }
    h2 { color: #2d3748; margin-top: 30px; }
    h3 { color: #4a5568; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    td, th { border: 1px solid #ddd; padding: 8px; text-align: left; }
    tr:nth-child(even) { background-color: #f9f9f9; }
    tr:first-child { background-color: #2c5282; color: white; font-weight: bold; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
    pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
    li { margin: 5px 0; }
    hr { border: none; border-top: 1px solid #ddd; margin: 30px 0; }
    strong { color: #2c5282; }
  </style>
</head>
<body>
  <p>${html}</p>
</body>
</html>`;
}

async function convertToPdf() {
  const mdPath = path.join(__dirname, 'ONDE-VS-ONDEXR-STUDY.md');
  const pdfPath = path.join(__dirname, 'ONDE-VS-ONDEXR-STUDY.pdf');

  const md = fs.readFileSync(mdPath, 'utf8');
  const html = mdToHtml(md);

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    margin: { top: '40px', right: '40px', bottom: '40px', left: '40px' },
    printBackground: true
  });
  await browser.close();

  console.log('PDF created:', pdfPath);
  return pdfPath;
}

convertToPdf().catch(console.error);
