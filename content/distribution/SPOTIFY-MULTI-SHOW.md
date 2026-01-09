# Spotify Distribution - Multi-Show Setup

Guida completa per la distribuzione dei contenuti Onde su Spotify attraverso tre show distinti, ciascuno ottimizzato per un tipo specifico di contenuto.

---

## Panoramica Shows

| Show | Tipo Contenuto | Target Audience | Frequenza |
|------|----------------|-----------------|-----------|
| **Onde Podcast** | Storie della buonanotte, poesie | Famiglie, bambini 2-8 anni | 3-5 episodi/settimana |
| **Onde Lounge** | Ambient music, lofi beats, ninne nanne | Genitori, bambini (sonno) | 2-3 episodi/settimana |
| **Onde Audiobooks** | Audiobook completi per bambini | Famiglie, bambini 4-10 anni | 1-2 audiobook/mese |

---

## 1. Onde Podcast - Storie della Buonanotte

### Descrizione Show
Onde Podcast raccoglie storie della buonanotte e poesie per bambini, narrate con voci calde e accompagnate da suoni rilassanti. Ogni episodio e pensato per accompagnare i piu piccoli verso un sonno sereno.

### RSS Feed Setup
```
Feed URL: https://onde.fm/rss/onde-podcast.xml
Feed Format: RSS 2.0 con estensioni iTunes/Spotify
Encoding: UTF-8
```

### Cover Art Specifications
- **Dimensioni**: 3000x3000 px (minimo 1400x1400 px)
- **Formato**: JPEG o PNG
- **Colore sfondo**: Palette notturna (blu scuro #1a1a3e, viola #2d1b4e)
- **Elementi**: Luna, stelle, personaggio Onde
- **Testo**: "Onde Podcast" + tagline "Storie della Buonanotte"

### Spotify Category
- **Categoria Primaria**: Kids & Family
- **Categoria Secondaria**: Stories
- **Language**: Italian

### Description Template (Show)
```
Onde Podcast - Storie della Buonanotte per Bambini

Benvenuti nel mondo delle storie Onde! Ogni sera, una nuova avventura per accompagnare i vostri bambini verso sogni sereni. Storie originali, fiabe classiche rivisitate e poesie sussurrate, tutte narrate con amore e cura.

Perfetto per:
- Routine della nanna
- Momenti di relax in famiglia
- Stimolare l'immaginazione

Eta consigliata: 2-8 anni
Nuovi episodi: ogni settimana

#storiedellabounanotte #bambini #podcast #onde #fiabe
```

### Episode Naming Convention
```
Format: [Tipo] - [Titolo] | [Durata indicativa]
Esempi:
- Storia - Il Piccolo Drago che Sognava le Stelle | 12 min
- Poesia - La Luna e la Farfalla | 5 min
- Fiaba - Cappuccetto Rosso (versione dolce) | 15 min
```

### Episode Description Template
```
[TITOLO EPISODIO]

[Breve sinossi 2-3 frasi]

Eta consigliata: [X-Y anni]
Durata: [X minuti]
Voce narrante: [Nome narratore]

Buonanotte dai piccoli esploratori di Onde!

---
Trova tutte le nostre storie su onde.fm
```

---

## 2. Onde Lounge - Musica per il Sonno

### Descrizione Show
Onde Lounge offre una selezione curata di musica ambient, lofi beats e ninne nanne originali, progettate per creare l'atmosfera perfetta per il sonno dei bambini e il relax di tutta la famiglia.

### RSS Feed Setup
```
Feed URL: https://onde.fm/rss/onde-lounge.xml
Feed Format: RSS 2.0 con estensioni iTunes/Spotify
Encoding: UTF-8
Music License: Onde Original / Licensed Content
```

### Cover Art Specifications
- **Dimensioni**: 3000x3000 px (minimo 1400x1400 px)
- **Formato**: JPEG o PNG
- **Colore sfondo**: Gradient calmo (teal #1a3a4a, indaco #2a2a5e)
- **Elementi**: Onde sonore stilizzate, note musicali, luna
- **Testo**: "Onde Lounge" + tagline "Musica per Sognare"

### Spotify Category
- **Categoria Primaria**: Music
- **Categoria Secondaria**: Kids & Family
- **Sub-category**: Sleep / Ambient
- **Language**: Italian (instrumental content)

### Description Template (Show)
```
Onde Lounge - Musica per il Sonno dei Bambini

Il vostro rifugio musicale per notti tranquille. Onde Lounge propone una selezione esclusiva di musica ambient, lofi beats rilassanti e ninne nanne originali, create appositamente per accompagnare il sonno dei piu piccoli.

Perfetto per:
- Addormentarsi dolcemente
- Creare un ambiente calmo
- Meditazione e relax in famiglia

Generi: Ambient, Lofi, Ninne Nanne, Nature Sounds
Nuovi mix: ogni settimana

#lofi #ambient #sleep #bambini #ninnananna
```

### Episode Naming Convention
```
Format: [Genere] - [Titolo Mix/Brano] | [Durata]
Esempi:
- Lofi - Notte di Stelle Cadenti | 45 min
- Ambient - Onde del Mare Calmo | 60 min
- Ninna Nanna - Sogni di Nuvole | 30 min
- Nature - Pioggia sulla Finestra | 90 min
```

### Episode Description Template
```
[TITOLO EPISODIO]

[Descrizione atmosfera/mood 2-3 frasi]

Genere: [Lofi/Ambient/Ninna Nanna/Nature]
Durata: [X minuti]
BPM: [X] (se applicabile)
Mood: [Rilassante/Meditativo/Sognante]

Ideale per: [contesto d'uso]

---
Musica originale Onde - onde.fm
```

---

## 3. Onde Audiobooks - Libri Audio per Bambini

### Descrizione Show
Onde Audiobooks presenta audiobook completi per bambini, con narrazioni professionali e produzioni audio di alta qualita. Storie lunghe divise in capitoli, perfette per viaggi, attese o momenti speciali.

### RSS Feed Setup
```
Feed URL: https://onde.fm/rss/onde-audiobooks.xml
Feed Format: RSS 2.0 con estensioni iTunes/Spotify
Encoding: UTF-8
Structure: Serie/Seasons per ogni libro
```

### Cover Art Specifications
- **Dimensioni**: 3000x3000 px (minimo 1400x1400 px)
- **Formato**: JPEG o PNG
- **Colore sfondo**: Palette calda (ambra #8b6914, marrone caldo #4a3728)
- **Elementi**: Libro aperto, personaggi, elementi magici
- **Testo**: "Onde Audiobooks" + tagline "Storie da Ascoltare"
- **Note**: Cover specifiche per ogni audiobook

### Spotify Category
- **Categoria Primaria**: Kids & Family
- **Categoria Secondaria**: Books
- **Sub-category**: Audiobooks / Children's Stories
- **Language**: Italian

### Description Template (Show)
```
Onde Audiobooks - Libri Audio per Bambini

Scoprite il piacere dell'ascolto con Onde Audiobooks! Audiobook completi per bambini, narrati da voci professionali e prodotti con la massima cura. Storie lunghe divise in capitoli, perfette per viaggi, momenti di relax o per riscoprire il piacere di ascoltare insieme.

Perfetto per:
- Viaggi in auto
- Momenti di attesa
- Alternativa agli schermi
- Lettura condivisa in famiglia

Eta consigliata: 4-10 anni
Nuovi audiobook: ogni mese

#audiobook #bambini #storie #lettura #onde
```

### Episode Naming Convention
```
Format: [Titolo Libro] - Capitolo [N]: [Titolo Capitolo]
Esempi:
- Le Avventure di Luna - Capitolo 1: L'Inizio del Viaggio
- Le Avventure di Luna - Capitolo 2: La Foresta Incantata
- Il Piccolo Esploratore - Capitolo 1: La Mappa Misteriosa
```

### Episode Description Template
```
[TITOLO LIBRO] - Capitolo [N]
"[Titolo Capitolo]"

[Breve sinossi del capitolo 2-3 frasi - senza spoiler]

Libro: [Titolo completo]
Autore: [Nome autore]
Narratore: [Nome voce narrante]
Capitolo: [N] di [Totale]
Durata: [X minuti]
Eta consigliata: [X-Y anni]

---
Audiobook completo disponibile su onde.fm
```

### Audiobook Series Structure
```
Ogni audiobook viene pubblicato come "stagione":
- Season 1: Audiobook 1 (tutti i capitoli)
- Season 2: Audiobook 2 (tutti i capitoli)
- etc.

Trailer/Intro episode per ogni nuova stagione
```

---

## Requisiti Tecnici Comuni

### Audio Specifications
| Parametro | Podcast/Audiobook | Music/Lounge |
|-----------|-------------------|--------------|
| Formato | MP3 o M4A | MP3 o M4A |
| Bitrate | 128-192 kbps | 256-320 kbps |
| Sample Rate | 44.1 kHz | 44.1 kHz |
| Canali | Mono o Stereo | Stereo |
| Loudness | -16 LUFS | -14 LUFS |

### RSS Feed Requirements
```xml
<!-- Namespace richiesti -->
xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
xmlns:spotify="http://www.spotify.com/ns/rss"
xmlns:content="http://purl.org/rss/1.0/modules/content/"
```

### Metadata Obbligatori per Episodio
- `<title>`: Titolo episodio
- `<description>`: Descrizione completa
- `<enclosure>`: URL file audio, tipo MIME, dimensione
- `<pubDate>`: Data pubblicazione (RFC 822)
- `<itunes:duration>`: Durata in secondi o HH:MM:SS
- `<itunes:explicit>`: "false" (contenuto per bambini)
- `<itunes:episodeType>`: "full" o "trailer"

---

## Processo di Submission a Spotify

### 1. Preparazione
- [ ] Feed RSS validato (podba.se/validate)
- [ ] Cover art approvata (dimensioni e formato)
- [ ] Almeno 1 episodio pubblicato
- [ ] Metadata completi

### 2. Submission
1. Accedere a podcasters.spotify.com
2. "Add your podcast"
3. Inserire URL del feed RSS
4. Verificare ownership (email/DNS)
5. Completare profilo show

### 3. Ottimizzazione
- Collegare account social
- Abilitare Q&A e Polls
- Configurare analytics
- Impostare trailer show

---

## Best Practices

### SEO e Discoverability
- Includere parole chiave nel titolo show
- Usare tag rilevanti nelle descrizioni
- Mantenere consistenza nel naming
- Pubblicare con regolarita

### Engagement
- Rispondere ai commenti
- Usare le Spotify Polls
- Creare playlist complementari
- Cross-promuovere tra i tre show

### Analytics da Monitorare
- Listener retention per episodio
- Demographics (eta, localizzazione)
- Peak listening hours
- Episode completion rate

---

## Contatti e Risorse

- **Dashboard Spotify**: podcasters.spotify.com
- **Supporto**: support@spotify.com
- **Documentazione**: support.spotify.com/podcasters

---

*Documento creato per Onde - Ultimo aggiornamento: Gennaio 2025*
