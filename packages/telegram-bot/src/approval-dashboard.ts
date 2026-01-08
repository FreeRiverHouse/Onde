/**
 * Dashboard Web Locale per Approvazione Post
 *
 * Accedi da iPhone: http://[IP-MAC]:3400
 *
 * Features:
 * - Lista post in attesa
 * - Bottoni Approva/Rifiuta
 * - Auto-refresh ogni 5 sec
 * - Auto-post quando approvato
 */

import express from 'express';
import * as path from 'path';
import * as dotenv from 'dotenv';
import {
  loadPendingPosts,
  approvePost,
  rejectPost,
  getApprovedPosts,
  postToX,
  markAsPosted,
  markAsError,
  PendingPost,
  createAndSendPost,
} from './pending-posts';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

const app = express();
const PORT = 3400;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// === HTML Template ===

function renderDashboard(posts: PendingPost[]): string {
  const pendingPosts = posts.filter(p => p.status === 'pending');
  const approvedPosts = posts.filter(p => p.status === 'approved');
  const postedPosts = posts.filter(p => p.status === 'posted').slice(-5);

  const accountBadge = (account: string) => {
    if (account === 'frh') return '<span style="background:#3b82f6;color:white;padding:2px 8px;border-radius:4px;">@FreeRiverHouse</span>';
    if (account === 'onde') return '<span style="background:#8b5cf6;color:white;padding:2px 8px;border-radius:4px;">@Onde_FRH</span>';
    return '<span style="background:#ec4899;color:white;padding:2px 8px;border-radius:4px;">@magmatic__</span>';
  };

  const renderPost = (post: PendingPost, showButtons = true) => `
    <div style="background:white;border-radius:12px;padding:16px;margin-bottom:12px;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
      <div style="margin-bottom:8px;">${accountBadge(post.account)}</div>
      <p style="font-size:16px;line-height:1.5;margin:12px 0;white-space:pre-wrap;">${post.text}</p>
      ${post.mediaFiles?.length ? `<p style="color:#666;">📎 ${post.mediaFiles.length} media</p>` : ''}
      ${post.postUrl ? `<a href="${post.postUrl}" target="_blank" style="color:#3b82f6;">🔗 Vedi post</a>` : ''}
      ${showButtons && post.status === 'pending' ? `
        <div style="display:flex;gap:8px;margin-top:12px;">
          <form method="POST" action="/approve/${post.id}" style="flex:1;">
            <button type="submit" style="width:100%;padding:12px;background:#22c55e;color:white;border:none;border-radius:8px;font-size:16px;font-weight:bold;cursor:pointer;">
              ✅ APPROVA
            </button>
          </form>
          <form method="POST" action="/reject/${post.id}" style="flex:1;">
            <button type="submit" style="width:100%;padding:12px;background:#ef4444;color:white;border:none;border-radius:8px;font-size:16px;font-weight:bold;cursor:pointer;">
              ❌ RIFIUTA
            </button>
          </form>
        </div>
      ` : ''}
      ${post.status === 'approved' ? '<p style="color:#22c55e;font-weight:bold;">⏳ In pubblicazione...</p>' : ''}
      ${post.error ? `<p style="color:#ef4444;">❌ ${post.error}</p>` : ''}
    </div>
  `;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Onde - Approvazione Post</title>
  <meta http-equiv="refresh" content="5">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f3f4f6;
      padding: 16px;
      padding-bottom: 100px;
    }
    h1 { font-size: 24px; margin-bottom: 16px; }
    h2 { font-size: 18px; margin: 20px 0 12px; color: #374151; }
    .empty { color: #9ca3af; text-align: center; padding: 20px; }
    .stats {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }
    .stat {
      flex: 1;
      background: white;
      padding: 12px;
      border-radius: 8px;
      text-align: center;
    }
    .stat-num { font-size: 24px; font-weight: bold; }
    .stat-label { font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <h1>📱 Onde Post</h1>

  <div class="stats">
    <div class="stat">
      <div class="stat-num" style="color:#f59e0b;">${pendingPosts.length}</div>
      <div class="stat-label">In attesa</div>
    </div>
    <div class="stat">
      <div class="stat-num" style="color:#22c55e;">${postedPosts.length}</div>
      <div class="stat-label">Pubblicati</div>
    </div>
  </div>

  ${pendingPosts.length > 0 ? `
    <h2>🔔 DA APPROVARE</h2>
    ${pendingPosts.map(p => renderPost(p, true)).join('')}
  ` : '<div class="empty">✅ Nessun post in attesa</div>'}

  ${approvedPosts.length > 0 ? `
    <h2>⏳ IN PUBBLICAZIONE</h2>
    ${approvedPosts.map(p => renderPost(p, false)).join('')}
  ` : ''}

  ${postedPosts.length > 0 ? `
    <h2>✅ PUBBLICATI</h2>
    ${postedPosts.reverse().map(p => renderPost(p, false)).join('')}
  ` : ''}

  <div style="position:fixed;bottom:0;left:0;right:0;background:#f3f4f6;padding:16px;border-top:1px solid #e5e7eb;">
    <form method="POST" action="/create" style="display:flex;gap:8px;">
      <select name="account" style="padding:12px;border-radius:8px;border:1px solid #d1d5db;font-size:16px;">
        <option value="onde">@Onde_FRH</option>
        <option value="frh">@FreeRiverHouse</option>
        <option value="magmatic">@magmatic__</option>
      </select>
      <input type="text" name="text" placeholder="Nuovo post..."
        style="flex:1;padding:12px;border-radius:8px;border:1px solid #d1d5db;font-size:16px;">
      <button type="submit" style="padding:12px 20px;background:#3b82f6;color:white;border:none;border-radius:8px;font-size:16px;">
        ➕
      </button>
    </form>
  </div>
</body>
</html>`;
}

// === Routes ===

app.get('/', (req, res) => {
  const posts = loadPendingPosts();
  res.send(renderDashboard(posts));
});

app.post('/approve/:id', (req, res) => {
  const post = approvePost(req.params.id);
  if (post) {
    console.log(`✅ Post approvato: ${post.id}`);
  }
  res.redirect('/');
});

app.post('/reject/:id', (req, res) => {
  const post = rejectPost(req.params.id);
  if (post) {
    console.log(`❌ Post rifiutato: ${post.id}`);
  }
  res.redirect('/');
});

app.post('/create', async (req, res) => {
  const { text, account } = req.body;
  if (text && account) {
    const post = await createAndSendPost(text, account);
    console.log(`📝 Post creato: ${post.id}`);
  }
  res.redirect('/');
});

// === API per Claude/Agenti ===

app.post('/api/post', async (req, res) => {
  const { text, account, mediaFiles } = req.body;
  if (!text || !account) {
    return res.status(400).json({ error: 'text e account richiesti' });
  }
  const post = await createAndSendPost(text, account, mediaFiles);
  res.json({ success: true, postId: post.id });
});

app.get('/api/pending', (req, res) => {
  const posts = loadPendingPosts();
  res.json(posts.filter(p => p.status === 'pending'));
});

// === Watcher: controlla post approvati e posta ===

async function processApprovedPosts() {
  const approved = getApprovedPosts();

  for (const post of approved) {
    console.log(`📤 Pubblico post: ${post.id} su @${post.account}`);

    const result = await postToX(post);

    if (result.success && result.url) {
      markAsPosted(post.id, result.url);
      console.log(`✅ Pubblicato: ${result.url}`);
    } else {
      markAsError(post.id, result.error || 'Errore sconosciuto');
      console.log(`❌ Errore: ${result.error}`);
    }
  }
}

// Controlla ogni 30 secondi
setInterval(processApprovedPosts, 30000);

// === Start Server ===

app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('🚀 ONDE APPROVAL DASHBOARD');
  console.log('══════════════════════════════════════');
  console.log(`📱 iPhone: http://192.168.x.x:${PORT}`);
  console.log(`💻 Mac:    http://localhost:${PORT}`);
  console.log('');
  console.log('⏰ Auto-post ogni 30 secondi');
  console.log('🔄 Dashboard auto-refresh ogni 5 secondi');
  console.log('══════════════════════════════════════');
  console.log('');

  // Processa subito eventuali post approvati
  processApprovedPosts();
});
