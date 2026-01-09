/**
 * Onde Podcast RSS Server
 * Server Express che serve il feed RSS e i file audio
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Serve file statici dalla cartella public
app.use(express.static(path.join(__dirname, 'public')));

// Serve file audio dalla cartella audio
app.use('/audio', express.static(path.join(__dirname, 'audio')));

// Route principale - redirect al feed
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Piccole Rime - Podcast Onde</title>
        <style>
          body {
            font-family: Georgia, serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            background: #FFF8E7;
            color: #2C3E50;
          }
          h1 { color: #2C3E50; }
          a { color: #3498DB; }
          .feed-url {
            background: #fff;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #ECE5D5;
            word-break: break-all;
            margin: 20px 0;
          }
          .platforms {
            display: flex;
            gap: 20px;
            margin-top: 30px;
          }
          .platform {
            padding: 10px 20px;
            background: #2C3E50;
            color: white;
            text-decoration: none;
            border-radius: 8px;
          }
        </style>
      </head>
      <body>
        <h1>Piccole Rime</h1>
        <p>Storie della Buonanotte - Podcast Onde</p>

        <h2>Feed RSS</h2>
        <div class="feed-url">
          <a href="/feed.xml">${req.protocol}://${req.get('host')}/feed.xml</a>
        </div>

        <p>Usa questo URL per iscriverti al podcast nella tua app preferita.</p>

        <h2>Ascolta su</h2>
        <div class="platforms">
          <a class="platform" href="#">Spotify</a>
          <a class="platform" href="#">Apple Podcasts</a>
          <a class="platform" href="#">Google Podcasts</a>
        </div>

        <footer style="margin-top: 50px; color: #95A5A6;">
          <p>Onde Publishing - 2026</p>
        </footer>
      </body>
    </html>
  `);
});

// API per aggiungere episodi
app.post('/api/episodes', express.json(), (req, res) => {
  try {
    const dataPath = path.join(__dirname, 'episodes.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    const newEpisode = req.body;
    newEpisode.id = `ep${String(data.episodes.length + 1).padStart(3, '0')}`;
    newEpisode.episode = data.episodes.length + 1;
    newEpisode.season = 1;
    newEpisode.publishDate = new Date().toISOString().split('T')[0];

    data.episodes.push(newEpisode);
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

    // Rigenera feed
    require('./generate-feed');

    res.json({ success: true, episode: newEpisode });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', podcast: 'Piccole Rime' });
});

app.listen(PORT, () => {
  console.log(`Onde Podcast RSS Server`);
  console.log(`http://localhost:${PORT}`);
  console.log(`Feed: http://localhost:${PORT}/feed.xml`);
});
