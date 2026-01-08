# Chapter 7: Building PDFs and Documents

PDF generation is one of those tasks that sounds simple until you try it. This chapter shows how to build a complete book production pipeline.

## The Problem

You want to generate professional PDFs:
- Books with proper layouts
- Reports with headers and footers
- Documents with embedded images
- Multi-page spreads

Traditional approach: Learn LaTeX, fight with Word, use complex desktop software.

Code surfing approach: HTML → PDF via Puppeteer.

## Why HTML?

HTML is the universal format:
- You already know it (or can learn in an hour)
- CSS handles layout, fonts, colors
- AI understands it perfectly
- Renders consistently across platforms

The trick: **Puppeteer converts HTML to PDF via headless Chrome.** Chrome's print engine is actually excellent.

## The Stack

```
HTML + CSS (your content)
    ↓
Node.js script
    ↓
Puppeteer (headless Chrome)
    ↓
Professional PDF
```

## Step 1: Basic PDF Script

Ask Claude:

```
Create a Node.js script that:
1. Reads an HTML file
2. Converts it to PDF using Puppeteer
3. Supports A4 and US Letter sizes
4. Adds page numbers

Use puppeteer. Keep it simple.
```

You'll get something like:

```javascript
const puppeteer = require('puppeteer');
const fs = require('fs');

async function htmlToPdf(inputPath, outputPath, options = {}) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const html = fs.readFileSync(inputPath, 'utf8');
  await page.setContent(html, { waitUntil: 'networkidle0' });

  await page.pdf({
    path: outputPath,
    format: options.format || 'A4',
    printBackground: true,
    margin: {
      top: '1in',
      bottom: '1in',
      left: '1in',
      right: '1in'
    },
    displayHeaderFooter: true,
    footerTemplate: `
      <div style="font-size:10px; text-align:center; width:100%;">
        <span class="pageNumber"></span> / <span class="totalPages"></span>
      </div>
    `,
    headerTemplate: '<div></div>'
  });

  await browser.close();
  console.log(`PDF created: ${outputPath}`);
}

htmlToPdf('book.html', 'book.pdf');
```

Run it: `node create-pdf.js`

Done. You have PDF generation.

## Step 2: Book Template

Now ask for a proper book layout:

```
Create an HTML template for a children's book:
- 8.5x8.5 inch square format
- Full bleed images
- Large readable fonts
- Print-ready CSS

Include CSS for page breaks, margins, and bleed.
```

The CSS for print is specific:

```css
@page {
  size: 8.5in 8.5in;
  margin: 0;
}

.page {
  width: 8.5in;
  height: 8.5in;
  page-break-after: always;
  position: relative;
  overflow: hidden;
}

.bleed {
  position: absolute;
  top: -0.125in;
  left: -0.125in;
  right: -0.125in;
  bottom: -0.125in;
}

.safe-area {
  position: absolute;
  top: 0.5in;
  left: 0.5in;
  right: 0.5in;
  bottom: 0.5in;
}
```

## Step 3: Handling Images

Images in PDFs can be tricky. The solution: **base64 encoding**.

```javascript
function imageToBase64(imagePath) {
  const image = fs.readFileSync(imagePath);
  const ext = imagePath.split('.').pop();
  return `data:image/${ext};base64,${image.toString('base64')}`;
}

// In your HTML
const html = `
  <img src="${imageToBase64('./images/cover.jpg')}" />
`;
```

Now images are embedded directly in the HTML. No broken links, no missing files.

## Step 4: Multi-Page Books

For a real book with multiple pages:

```javascript
function createBookHtml(pages) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        /* Print CSS here */
      </style>
    </head>
    <body>
      ${pages.map((page, i) => `
        <div class="page">
          <img src="${imageToBase64(page.image)}" class="bleed" />
          <div class="safe-area">
            <p class="text">${page.text}</p>
          </div>
        </div>
      `).join('')}
    </body>
    </html>
  `;
}
```

## Real Example: Children's Book Pipeline

Here's our actual workflow for Onde books:

1. **Content in JSON**
```json
{
  "title": "AIKO",
  "pages": [
    {
      "text": "Sofia received a special gift...",
      "image": "images/chapter1.jpg"
    }
  ]
}
```

2. **Generate images** (Grok or DALL-E)
3. **Run script** → PDF
4. **Send to Telegram** for approval
5. **Upload to KDP** when approved

Total time: 30 minutes for a complete book PDF.

## Tips for Quality

**Fonts**:
```css
@import url('https://fonts.googleapis.com/css2?family=...');
```
Or embed locally for offline use.

**Image quality**:
- Use 300 DPI for print
- JPEG for photos, PNG for illustrations
- Test at actual print size

**Page breaks**:
```css
.page { page-break-after: always; }
.no-break { page-break-inside: avoid; }
```

**Testing**:
- Always open PDF and check EVERY page
- Text overlapping images = bad
- Bleed extends to edges = good

## Common Mistakes

**Images not loading**: Use base64 or absolute paths.

**Text cut off**: Check margins and safe areas.

**Blurry images**: Source images too small. Use 2x resolution.

**Wrong colors**: Set `printBackground: true` in Puppeteer.

**Slow generation**: Reduce image sizes, limit pages per run.

## The Automation Path

Once the script works:
1. Watch folder for new content
2. Auto-generate PDF on change
3. Send preview to Telegram
4. One-click approval → upload to KDP

This is the pipeline we built. Books go from idea to published in hours, not weeks.

## What AI Can't Do (Yet)

- Choose the right image for a page (taste required)
- Judge if text and image work together (human eye)
- Decide final layout (design sense)

AI generates. You curate. That's the partnership.

---

*"The best tool is the one you actually use."*

---

Next: [Chapter 8: Common Pitfalls →](./08-pitfalls.md)
