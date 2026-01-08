# Onde Multimedia - Operation Tsunami

> Espandere Onde su tutti i canali: YouTube, Spotify, TikTok - IN TUTTE LE LINGUE

## Status: PRIMO EPISODIO COMPLETATO

**Ep.01 Stella Stellina** - 1:22 - Voce Marco (ElevenLabs) - PRONTO PER DISTRIBUZIONE

---

## ROADMAP DISTRIBUZIONE

### Fase 1: Audio Podcast (Spotify + Apple Podcasts)
| Piattaforma | Status | Note |
|-------------|--------|------|
| **Spotify for Podcasters** | DA FARE | podcasters.spotify.com |
| **Apple Podcasts Connect** | DA FARE | podcastsconnect.apple.com |
| **Amazon Music** | DA FARE | Via Spotify for Podcasters |
| **Google Podcasts** | DA FARE | Via RSS feed |

### Fase 2: Video Podcast (YouTube)
| Formato | Tool | Status |
|---------|------|--------|
| **Gianni Parola che legge** | Hedra/HeyGen (lip sync) | DA PROVARE |
| **Illustrazioni animate** | Runway/Pika | DA PROVARE |
| **Slideshow + audio** | CapCut/Canva | Backup semplice |

### Fase 3: Traduzioni Multi-Lingua
| Lingua | Voce ElevenLabs | Status |
|--------|-----------------|--------|
| **Italiano** | Marco | FATTO (Ep.01) |
| **Inglese** | Da scegliere | DA FARE |
| **Francese** | Da scegliere | DA FARE |
| **Spagnolo** | Da scegliere | DA FARE |
| **Tedesco** | Da scegliere | DA FARE |
| **Portoghese** | Da scegliere | DA FARE |

**STRATEGIA**: Ogni episodio viene tradotto in 6+ lingue = 6x reach, 6x revenue

---

## Canali Target

| Canale | Tipo Contenuto | Status |
|--------|----------------|--------|
| **Spotify** | Podcast, audiobook bambini | PRONTO (Ep.01) |
| **Apple Podcasts** | Podcast bambini | DA CONFIGURARE |
| **YouTube** | Video podcast con Gianni | DA CREARE VIDEO |
| **TikTok** | Clip brevi, animazioni | Pianificato |

---

## Podcast Onde

### Concept
Podcast per bambini e famiglie - MULTILINGUA:
- Storie lette ad alta voce (dai libri Onde)
- Poesie della tradizione (italiana e internazionale)
- Mini-lezioni educative (Gianni & Pina)
- **TUTTO tradotto in 6+ lingue per distribuzione globale**

### Voci
- **Gianni Parola (IT)**: Marco - ElevenLabs (GRATUITO, 73K users)
- **Gianni Parola (EN)**: Da scegliere dalla libreria ElevenLabs
- **Gianni Parola (FR/ES/DE)**: Da scegliere
- **Pina Pennello**: Co-host creativa (voce femminile da scegliere)

### IMPORTANTE: Contenuti Universali
Per massimizzare le traduzioni, preferire contenuti che funzionano in tutte le culture:
- Ninne nanne e poesie classiche (dominio pubblico)
- Storie originali Onde (già nostre)
- Temi universali: natura, famiglia, amicizia, sogni

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
