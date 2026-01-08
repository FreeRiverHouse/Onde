const fs = require('fs');
const path = require('path');

// Read posts
const posts = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/posts.json'), 'utf8')).posts;

// Separate regular posts from ideas and events
const regularPosts = posts.filter(p => p.mediaType !== 'idea' && p.mediaType !== 'event');
const ideaPosts = posts.filter(p => p.mediaType === 'idea');
const eventPosts = posts.filter(p => p.mediaType === 'event');

// Group regular posts by account
const accounts = {
  'onde': { name: '@Onde_FRH', posts: [] },
  'magmatic': { name: '@magmatic__', posts: [] },
  'frh': { name: '@FreeRiverHouse', posts: [] }
};

regularPosts.forEach(p => {
  if (accounts[p.account]) {
    accounts[p.account].posts.push(p);
  }
});

// Group ideas by collection
const ideaCollections = {};
ideaPosts.forEach(p => {
  if (!ideaCollections[p.collection]) {
    ideaCollections[p.collection] = [];
  }
  ideaCollections[p.collection].push(p);
});

// Group events by collection
const eventCollections = {};
eventPosts.forEach(p => {
  if (!eventCollections[p.collection]) {
    eventCollections[p.collection] = [];
  }
  eventCollections[p.collection].push(p);
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

// Generate Ideas sections
for (const [collection, items] of Object.entries(ideaCollections)) {
  let itemsHtml = '';
  items.forEach(item => {
    itemsHtml += `
      <div class="post idea-card">
        <div class="post-header">
          <span class="post-title">${item.title}</span>
          <span class="post-account idea-badge">IDEA</span>
        </div>
        <div class="post-collection">${item.source}</div>
        <div class="post-caption">${item.caption}</div>
        <div class="approval-row">
          <span class="approval-option"><span class="checkbox"></span> Da Sviluppare</span>
          <span class="approval-option"><span class="checkbox"></span> Backlog</span>
          <span class="approval-option"><span class="checkbox"></span> Scartata</span>
        </div>
        <div class="note-line"></div>
      </div>
    `;
  });

  sectionsHtml += `
    <div class="section">
      <h2 class="section-title" style="color: #4a90d9; border-color: #4a90d9;">${collection} (${items.length})</h2>
      ${itemsHtml}
    </div>
  `;
}

// Generate Events sections
for (const [collection, items] of Object.entries(eventCollections)) {
  let itemsHtml = '';
  items.forEach(item => {
    itemsHtml += `
      <div class="post event-card">
        <div class="post-header">
          <span class="post-title">${item.title}</span>
          <span class="post-account event-badge">EVENTO</span>
        </div>
        <div class="post-collection">${item.source}</div>
        <div class="post-caption">${item.caption}</div>
        <div class="approval-row">
          <span class="approval-option"><span class="checkbox"></span> Pianificare</span>
          <span class="approval-option"><span class="checkbox"></span> Backlog</span>
          <span class="approval-option"><span class="checkbox"></span> Non ora</span>
        </div>
        <div class="note-line"></div>
      </div>
    `;
  });

  sectionsHtml += `
    <div class="section">
      <h2 class="section-title" style="color: #e74c3c; border-color: #e74c3c;">${collection} (${items.length})</h2>
      ${itemsHtml}
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

    .idea-badge {
      background: #4a90d9 !important;
    }

    .event-badge {
      background: #e74c3c !important;
    }

    .idea-card {
      border-left: 4px solid #4a90d9;
    }

    .event-card {
      border-left: 4px solid #e74c3c;
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

// Add schedule section
const scheduleHtml = `
  <div class="section" style="page-break-before: always;">
    <h2 class="section-title">📅 CALENDARIO PROPOSTO - Settimana 8-14 Gennaio 2026</h2>

    <table style="width:100%; border-collapse: collapse; margin-top: 20px;">
      <tr style="background: #d4a853; color: white;">
        <th style="padding: 12px; text-align: left;">Giorno</th>
        <th style="padding: 12px; text-align: left;">@FreeRiverHouse (21:30)</th>
        <th style="padding: 12px; text-align: left;">@magmatic__ (23:00)</th>
        <th style="padding: 12px; text-align: left;">@Onde_FRH (9:00)</th>
      </tr>
      <tr style="background: #f9f9f9;">
        <td style="padding: 12px; border-bottom: 1px solid #ddd;"><strong>Mer 8</strong></td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd;">PR Agent</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd;">Loto</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd;">Stella Stellina</td>
      </tr>
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #ddd;"><strong>Gio 9</strong></td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd;">Kids QA</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd;">—</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd;">—</td>
      </tr>
      <tr style="background: #f9f9f9;">
        <td style="padding: 12px; border-bottom: 1px solid #ddd;"><strong>Ven 10</strong></td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd;">Factory System</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd;">Il Cosmo Dissommerso</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd;">Il Pulcino Bagnato</td>
      </tr>
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #ddd;"><strong>Sab 11</strong></td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd;">VR Dizzy Test</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd;">—</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd;">—</td>
      </tr>
      <tr style="background: #f9f9f9;">
        <td style="padding: 12px; border-bottom: 1px solid #ddd;"><strong>Dom 12</strong></td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd;">KidsChefStudio</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd;">Y Lan</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd;">—</td>
      </tr>
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #ddd;"><strong>Lun 13</strong></td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd;">Unity 6</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd;">—</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd;">Pioggerellina</td>
      </tr>
      <tr style="background: #f9f9f9;">
        <td style="padding: 12px; border-bottom: 1px solid #ddd;"><strong>Mar 14</strong></td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd;">Six Apps</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd;">Volare</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd;">—</td>
      </tr>
    </table>

    <div style="margin-top: 30px; padding: 20px; background: #f9f9f9; border-radius: 8px;">
      <h3 style="margin-bottom: 15px; color: #1a1a1a;">Riepilogo Frequenze</h3>
      <ul style="line-height: 2;">
        <li><strong>@FreeRiverHouse</strong>: 1 post/giorno alle 21:30 (building in public)</li>
        <li><strong>@magmatic__</strong>: 3 post/settimana alle 23:00 (poesia, momenti riflessivi)</li>
        <li><strong>@Onde_FRH</strong>: 3 post/settimana alle 9:00 (video Piccole Rime)</li>
      </ul>
    </div>

    <div style="margin-top: 20px; padding: 15px; border-left: 3px solid #d4a853; background: #fffbf0;">
      <strong>Nota:</strong> Questo è un calendario proposto. Seleziona i post che preferisci nella dashboard e modifica lo schedule come vuoi.
    </div>
  </div>
`;

// Combine HTML with schedule
const finalHtml = html.replace('</body>', scheduleHtml + '</body>');

// Write HTML file
const outputPath = path.join(__dirname, 'posts-preview.html');
fs.writeFileSync(outputPath, finalHtml);
console.log('HTML generated:', outputPath);
