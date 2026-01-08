# Onde Multimedia - Operation Tsunami

> Espandere Onde su tutti i canali: YouTube, Spotify, TikTok

## Status: IN SVILUPPO

## Canali Target

| Canale | Tipo Contenuto | Status |
|--------|----------------|--------|
| **Spotify** | Podcast, audiobook bambini | Setup in corso |
| **YouTube** | Video educational, animazioni | Pianificato |
| **TikTok** | Contenuti brevi, animazioni | Pianificato |

## Podcast Onde

### Concept
Podcast per bambini e famiglie:
- Storie lette ad alta voce (dai libri Onde)
- Poesie della tradizione italiana
- Mini-lezioni educative (Gianni & Pina)

### Voci
- **Gianni Parola**: Narratore principale, tono caldo e avvolgente
- **Pina Pennello**: Co-host creativa, spunti artistici
- Voice cloning con ElevenLabs (voci custom Onde)

### Struttura Episodio
```
1. Intro musicale Onde (10 sec)
2. Saluto di Gianni/Pina
3. Contenuto principale (3-8 min)
4. Riflessione/domanda per bambini
5. Outro + anticipazione prossimo episodio
```

## Come Contribuire

### Generare Audio (ElevenLabs)
```bash
npm run generate:audio -- --script "scripts/episode-01.md" --voice "gianni"
```

### Creare Nuovo Episodio
1. Crea script in `scripts/episode-XX.md`
2. Genera audio con ElevenLabs
3. Aggiungi metadata in `podcast/feed.json`
4. Push su GitHub

## File Structure
```
onde-multimedia/
├── podcast/
│   ├── feed.json          # RSS feed metadata
│   ├── episodes/          # MP3 generati
│   └── covers/            # Artwork episodi
├── scripts/
│   ├── episode-01.md      # Script episodio 1
│   └── templates/         # Template per nuovi episodi
├── assets/
│   ├── intro.mp3          # Musica intro
│   └── outro.mp3          # Musica outro
└── templates/
    └── episode.md         # Template script
```

## Valori Brand (da rispettare sempre)
- Peaceful, growth oriented, kind
- Artistic, creative, inspiring
- Playful, friendly, relaxing
- Grateful, curious, wise

## Links
- Roadmap completa: `/ROADMAP.md`
- Stile illustrazioni: `/CLAUDE.md`
