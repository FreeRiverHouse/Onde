const fs = require('fs');
const path = require('path');

// Read posts
const posts = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/posts.json'), 'utf8')).posts;

// Group by account
const accounts = {
  'onde': { name: '@Onde_FRH', posts: [] },
  'magmatic': { name: '@magmatic__', posts: [] },
  'frh': { name: '@FreeRiverHouse', posts: [] }
};

posts.forEach(p => {
  if (accounts[p.account]) {
    accounts[p.account].posts.push(p);
  }
});

// Generate sections HTML
let sectionsHtml = '';
for (const [key, data] of Object.entries(accounts)) {
  if (data.posts.length === 0) continue;

  let postsHtml = '';
  data.posts.forEach(post => {
    postsHtml += `
      <div class="post">
        <div class="post-header">
          <span class="post-title">${post.title}</span>
          <span class="post-account">${post.mediaType === 'video' ? 'VIDEO' : 'TESTO'}</span>
        </div>
        <div class="post-collection">${post.collection}</div>
        <div class="post-caption">${post.caption}</div>
        <div class="approval-row">
          <span class="approval-option"><span class="checkbox"></span> Approva</span>
          <span class="approval-option"><span class="checkbox"></span> Rifiuta</span>
          <span class="approval-option"><span class="checkbox"></span> Da modificare</span>
        </div>
        <div class="note-line"></div>
      </div>
    `;
  });

  sectionsHtml += `
    <div class="section">
      <h2 class="section-title">${data.name} (${data.posts.length} post)</h2>
      ${postsHtml}
    </div>
  `;
}

// Generate HTML
const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Onde PR - Post da Approvare</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=Inter:wght@400;500&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', sans-serif;
      background: #f5f5f5;
      padding: 40px;
      color: #1a1a1a;
    }

    h1 {
      font-family: 'Playfair Display', serif;
      font-size: 32px;
      margin-bottom: 10px;
      color: #1a1a1a;
    }

    .subtitle {
      color: #666;
      margin-bottom: 40px;
      font-size: 14px;
    }

    .section {
      margin-bottom: 50px;
    }

    .section-title {
      font-family: 'Playfair Display', serif;
      font-size: 22px;
      color: #d4a853;
      border-bottom: 2px solid #d4a853;
      padding-bottom: 10px;
      margin-bottom: 25px;
    }

    .post {
      background: white;
      border-radius: 12px;
      padding: 25px;
      margin-bottom: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      page-break-inside: avoid;
    }

    .post-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .post-title {
      font-family: 'Playfair Display', serif;
      font-size: 18px;
      font-weight: 600;
    }

    .post-account {
      background: #d4a853;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
    }

    .post-collection {
      color: #888;
      font-size: 12px;
      margin-bottom: 15px;
    }

    .post-caption {
      font-size: 14px;
      line-height: 1.7;
      white-space: pre-line;
      background: #f9f9f9;
      padding: 15px;
      border-radius: 8px;
      border-left: 3px solid #d4a853;
    }

    .post-meta {
      margin-top: 15px;
      font-size: 11px;
      color: #999;
    }

    .checkbox {
      display: inline-block;
      width: 18px;
      height: 18px;
      border: 2px solid #ccc;
      border-radius: 4px;
      margin-right: 8px;
      vertical-align: middle;
    }

    .approval-row {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #eee;
      display: flex;
      gap: 30px;
    }

    .approval-option {
      font-size: 13px;
      color: #666;
    }

    .note-line {
      margin-top: 10px;
      border-bottom: 1px solid #ddd;
      height: 25px;
    }

    @media print {
      body { padding: 20px; background: white; }
      .post { box-shadow: none; border: 1px solid #ddd; }
    }
  </style>
</head>
<body>
  <h1>Onde PR Portal</h1>
  <p class="subtitle">Post da Approvare - ${new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

  ${sectionsHtml}

</body>
</html>`;

// Write HTML file
const outputPath = path.join(__dirname, 'posts-preview.html');
fs.writeFileSync(outputPath, html);
console.log('HTML generated:', outputPath);
