/**
 * Onde Podcast RSS Feed Generator
 * Genera il feed RSS per distribuzione su Spotify, Apple Podcasts, etc.
 */

const Podcast = require('podcast');
const fs = require('fs');
const path = require('path');

// Carica configurazione episodi
const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'episodes.json'), 'utf8'));
const { podcast, episodes } = data;

// URL base dove saranno hostati i file audio
const BASE_URL = process.env.PODCAST_BASE_URL || 'https://onde.it/podcast';

// Crea il feed
const feed = new Podcast({
  title: podcast.title,
  description: podcast.description,
  author: podcast.author,
  feedUrl: `${BASE_URL}/feed.xml`,
  siteUrl: podcast.website,
  imageUrl: podcast.image,
  language: podcast.language,
  categories: podcast.categories,
  itunesAuthor: podcast.author,
  itunesEmail: podcast.email,
  itunesOwner: {
    name: podcast.author,
    email: podcast.email
  },
  itunesExplicit: false,
  itunesCategory: [
    { text: 'Kids & Family', subcats: [{ text: 'Stories for Kids' }] }
  ],
  itunesImage: podcast.image,
  copyright: `2026 Onde Publishing`,
  ttl: 60, // minuti
});

// Aggiungi ogni episodio
episodes.forEach(ep => {
  // Parse durata in secondi
  const durationParts = ep.duration.split(':');
  const durationSeconds =
    parseInt(durationParts[0]) * 3600 +
    parseInt(durationParts[1]) * 60 +
    (parseInt(durationParts[2]) || 0);

  feed.addItem({
    title: ep.title,
    description: ep.description,
    url: `${BASE_URL}/episodes/${ep.id}`,
    guid: ep.id,
    date: new Date(ep.publishDate),
    enclosure: {
      url: `${BASE_URL}/audio/${ep.audioFile}`,
      type: 'audio/mpeg',
      // Dimensione file stimata (2MB per minuto di audio)
      size: Math.round(durationSeconds / 60 * 2 * 1024 * 1024)
    },
    itunesAuthor: ep.narrator,
    itunesExplicit: ep.explicit,
    itunesDuration: durationSeconds,
    itunesSeason: ep.season,
    itunesEpisode: ep.episode,
    itunesTitle: ep.title,
    itunesKeywords: ep.keywords.join(', '),
  });
});

// Genera XML
const xml = feed.buildXml('  ');

// Salva file
const outputPath = path.join(__dirname, 'public', 'feed.xml');
fs.mkdirSync(path.join(__dirname, 'public'), { recursive: true });
fs.writeFileSync(outputPath, xml);

console.log('Feed RSS generato con successo!');
console.log(`Output: ${outputPath}`);
console.log(`Episodi: ${episodes.length}`);
console.log('');
console.log('Per validare il feed: https://podba.se/validate/');
console.log('Per testare: https://castfeedvalidator.com/');
