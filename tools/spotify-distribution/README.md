# Spotify Distribution Tools

Strumenti e configurazioni per la distribuzione dei contenuti Onde su Spotify attraverso tre show distinti.

## Struttura Directory

```
tools/spotify-distribution/
├── README.md                    # Questo file
├── shows/                       # Configurazioni show
│   ├── onde-podcast.json       # Storie della buonanotte, poesie
│   ├── onde-lounge.json        # Ambient music, lofi, ninne nanne
│   └── onde-audiobooks.json    # Audiobook completi per bambini
└── rss-templates/              # Template RSS
    ├── base-feed.xml           # Template base RSS
    ├── podcast-feed.xml        # Template specifico podcast
    ├── lounge-feed.xml         # Template specifico lounge
    └── audiobooks-feed.xml     # Template specifico audiobooks
```

## Shows Overview

| Show | Contenuto | Feed URL |
|------|-----------|----------|
| **Onde Podcast** | Storie, fiabe, poesie | `https://onde.fm/rss/onde-podcast.xml` |
| **Onde Lounge** | Ambient, lofi, ninne nanne | `https://onde.fm/rss/onde-lounge.xml` |
| **Onde Audiobooks** | Audiobook completi | `https://onde.fm/rss/onde-audiobooks.xml` |

## Utilizzo

### Configurazione Show

Ogni file JSON in `shows/` contiene la configurazione completa per uno show:

```javascript
const showConfig = require('./shows/onde-podcast.json');

// Accesso ai dati
console.log(showConfig.title);        // Nome show
console.log(showConfig.rss.feedUrl);  // URL feed RSS
console.log(showConfig.artwork);      // Specifiche cover art
```

### Generazione Feed RSS

I template RSS in `rss-templates/` possono essere utilizzati per generare feed validi:

```bash
# Esempio con script di generazione (da implementare)
node generate-feed.js --show onde-podcast --output ./feeds/
```

## Configurazioni Show

### onde-podcast.json
- **Tipo**: Contenuti parlati (storie, poesie)
- **Target**: Bambini 2-8 anni
- **Frequenza**: 3-5 episodi/settimana
- **Durata media**: 10-20 minuti

### onde-lounge.json
- **Tipo**: Contenuti musicali (ambient, lofi)
- **Target**: Famiglie, sonno bambini
- **Frequenza**: 2-3 episodi/settimana
- **Durata media**: 30-90 minuti

### onde-audiobooks.json
- **Tipo**: Audiobook a capitoli
- **Target**: Bambini 4-10 anni
- **Frequenza**: 1-2 audiobook/mese
- **Durata media**: 15-30 min/capitolo

## Requisiti Tecnici

### Audio
- **Formato**: MP3 o M4A
- **Bitrate**: 128-320 kbps (varia per tipo)
- **Sample Rate**: 44.1 kHz
- **Loudness**: -14 a -16 LUFS

### Cover Art
- **Dimensioni**: 3000x3000 px (min 1400x1400)
- **Formato**: JPEG o PNG
- **Spazio colore**: RGB

### RSS Feed
- **Formato**: RSS 2.0
- **Namespace**: iTunes, Spotify, Content
- **Encoding**: UTF-8

## Spotify Submission

1. Validare il feed RSS su podba.se/validate
2. Accedere a podcasters.spotify.com
3. Aggiungere il podcast con URL del feed
4. Verificare ownership
5. Completare profilo e metadata

## Documentazione Completa

Per la guida dettagliata, consulta:
`/content/distribution/SPOTIFY-MULTI-SHOW.md`

## Risorse Esterne

- [Spotify for Podcasters](https://podcasters.spotify.com)
- [Spotify RSS Specs](https://support.spotify.com/podcasters)
- [iTunes Podcast Guide](https://podcasters.apple.com/support)

---

*Onde - Storie della Buonanotte per Bambini*
