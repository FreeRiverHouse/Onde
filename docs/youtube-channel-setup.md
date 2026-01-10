# YouTube Channel Setup Guide - Onde Ambient Videos

**Data:** 10 Gennaio 2026
**Obiettivo:** Lanciare oggi un canale YouTube per video ambient (fireplace, ocean waves, rain, cyber fireplace AI)

---

## 1. Channel Name Options

| Nome | Pro | Contro | Raccomandazione |
|------|-----|--------|-----------------|
| **Onde Lounge** | Brand recognition, evoca relax, elegante | Potrebbe sembrare nightclub | **CONSIGLIATO** |
| **Onde Ambient** | Chiaro per SEO, diretto | Generico, molti competitor simili | Buono |
| **Onde Relax** | Ottimo per SEO sleep/relax | Troppo simile ad altri canali | OK |
| **Onde Sounds** | Focalizzato su audio | Limita ai suoni, no visual | No |

**Decisione suggerita:** **Onde Lounge**
- Coerente con il research esistente in `YOUTUBE-MONETIZATION-RESEARCH.md`
- Naming convention gia definita: `[Durata] [Tipo] | [Elemento distintivo] | Onde Lounge`
- Evoca un ambiente premium, non una content farm

---

## 2. Channel Art Requirements

### Profile Picture (Avatar)
| Specifica | Requisito |
|-----------|-----------|
| Dimensione | **800 x 800 pixels** |
| Aspect Ratio | 1:1 (quadrato) |
| Formati | JPG, PNG, GIF, BMP |
| Max File Size | 4 MB |
| Display | Circolare (elementi centrati!) |

**Suggerimento:** Usa il logo Onde stilizzato in cerchio, colori blu/turchese, stile acquarello.

### Banner (Channel Art)
| Specifica | Requisito |
|-----------|-----------|
| Dimensione raccomandata | **2560 x 1440 pixels** |
| Dimensione minima | 2048 x 1152 pixels |
| Safe Area (critica) | **1546 x 423 pixels** (centro) |
| Max File Size | 6 MB |
| Formati | JPG, PNG |

**IMPORTANTE:** Il banner viene croppato diversamente su TV, desktop, mobile. Metti TUTTO cio che conta (logo, testo) nella safe area centrale.

**Prompt per banner Onde Lounge:**
```
Wide panoramic banner 2560x1440, cozy ambient lounge scene, European watercolor style,
warm fireplace glow mixed with soft blue moonlight, peaceful night atmosphere,
floating musical notes, gentle waves pattern, text space in center,
NOT Pixar NOT 3D, natural warm colors, 4k quality
```

---

## 3. Video Upload Requirements

### Formato e Codec
| Specifica | Raccomandato |
|-----------|--------------|
| **Formato** | MP4 |
| **Video Codec** | H.264 |
| **Audio Codec** | AAC-LC |
| **Risoluzione** | 1920x1080 (1080p) o 3840x2160 (4K) |
| **Frame Rate** | 24, 30, o 60 fps |
| **Bitrate Video (1080p)** | 15-20 Mbps |
| **Bitrate Video (4K)** | 35-45 Mbps |
| **Audio Bitrate** | 128 kbps o superiore |
| **Audio Sample Rate** | 48 kHz o 96 kHz |

### Limiti YouTube
- **Max file size:** 256 GB
- **Max durata:** 12 ore
- **Processing time:** 1080p = 30 min - 2 ore, 4K = 4-8+ ore

### Raccomandazioni per Ambient Videos
- **Risoluzione:** 1080p e sufficiente (la gente non guarda, ascolta)
- **Frame Rate:** 24 fps (piu cinematografico, file piu piccoli)
- **Per video lunghi (8-10h):** 1080p @ 24fps, bitrate 10-15 Mbps per bilanciare qualita/dimensione

---

## 4. Come Creare Video Lunghi (1-4+ ore) da Clip Brevi

### Metodo 1: FFmpeg Stream Loop (RACCOMANDATO)

Crea un video di 10 ore da una clip:
```bash
ffmpeg -stream_loop -1 -i input.mp4 -t 36000 -c copy output_10h.mp4
```

**Parametri:**
- `-stream_loop -1` = loop infinito
- `-t 36000` = 36000 secondi = 10 ore
- `-c copy` = NO re-encoding (velocissimo, no perdita qualita)

### Durate comuni:
| Ore | Secondi | Comando |
|-----|---------|---------|
| 1 ora | 3600 | `-t 3600` |
| 3 ore | 10800 | `-t 10800` |
| 4 ore | 14400 | `-t 14400` |
| 8 ore | 28800 | `-t 28800` |
| 10 ore | 36000 | `-t 36000` |

### Metodo 2: Loop con numero specifico
```bash
ffmpeg -stream_loop 5 -i input.mp4 -c copy output_looped.mp4
```
Loopa la clip 5 volte (6 totali incluso l'originale).

### Metodo 3: Seamless Loop (per clip non perfettamente loopabili)
```bash
# Inverti il video
ffmpeg -i original.mp4 -vf reverse -an reversed.mp4

# Concatena originale + invertito per un loop seamless
ffmpeg -i original.mp4 -i reversed.mp4 -filter_complex "[0:v:0][1:v:0]concat=n=2:v=1[v]" -map "[v]" -an seamless_loop.mp4
```

### Aggiungere Audio Separato
```bash
ffmpeg -stream_loop -1 -i video.mp4 -stream_loop -1 -i audio.mp3 -t 36000 -c:v copy -c:a aac -shortest output.mp4
```

### Script Automazione (salvare come `create-ambient-video.sh`):
```bash
#!/bin/bash
# Usage: ./create-ambient-video.sh input.mp4 audio.mp3 hours output.mp4

VIDEO=$1
AUDIO=$2
HOURS=$3
OUTPUT=$4
SECONDS=$((HOURS * 3600))

ffmpeg -stream_loop -1 -i "$VIDEO" -stream_loop -1 -i "$AUDIO" -t $SECONDS -c:v copy -c:a aac -b:a 192k -shortest "$OUTPUT"
```

---

## 5. Opzioni Audio (Royalty-Free e AI)

### A. Librerie Royalty-Free (GRATIS)

| Sito | Tipo | Note |
|------|------|------|
| [Chosic](https://www.chosic.com/free-music/sleep/) | Sleep music | MP3 download gratuiti |
| [Calmsound](https://www.calmsound.com/) | Nature sounds | Gratuito, alta qualita |
| [Freesound](https://freesound.org/) | Effetti sonori | Verifica licenza individuale |
| [Pixabay Audio](https://pixabay.com/music/) | Musica/Suoni | Royalty-free |

### B. Librerie Royalty-Free (PAID - per monetizzazione sicura)

| Sito | Costo | Note |
|------|-------|------|
| [TunePocket](https://www.tunepocket.com/sleep-music/) | $15-50/mese | 1h relaxing sounds inclusi |
| [Fesliyan Studios](https://www.fesliyanstudios.com/) | Gratuito/Paid | Sleep, peaceful music |
| [Storyblocks](https://www.storyblocks.com/) | ~$15/mese | Unlimited downloads |
| [ZenMix](https://zenmix.io/) | Paid | Specifico per sleep/meditation |

### C. AI-Generated Music

| Tool | Piano | Diritti Commerciali | Note |
|------|-------|---------------------|------|
| **Suno** | Pro ($10/mo) | SI con Pro/Premier | Ottimo per ambient, jazz |
| **Mubert** | Pro ($12/mo) | SI | Generativo infinito, no repeat |
| **SOUNDRAW** | $17/mo | SI | In-house catalog, safe |
| **Udio** | Pro tier | SI con Pro | Alternativa Suno |

**IMPORTANTE per YouTube:**
- YouTube (dal 15 Luglio 2025) richiede "real authorship" per monetizzazione
- Musica 100% AI senza modifica potrebbe non essere monetizzabile
- **Soluzione:** Usa AI per base + aggiungi elementi (mixing, layering)

### D. White Noise / Nature Sounds (genera tu stesso)

Per white noise puro:
```bash
# Genera 1 ora di white noise
ffmpeg -f lavfi -i "anoisesrc=color=white:duration=3600" white_noise_1h.wav
```

Per pink noise (piu piacevole):
```bash
ffmpeg -f lavfi -i "anoisesrc=color=pink:duration=3600" pink_noise_1h.wav
```

---

## 6. SEO per Video Ambient/White Noise

### Keywords ad Alta Performance

**Principali:**
- white noise, pink noise, brown noise
- sleep sounds, deep sleep, sleep music
- rain sounds, thunderstorm, ocean waves
- fireplace, crackling fire
- ambient sounds, relaxation, meditation
- study music, focus, concentration
- ASMR, calming sounds

**Long-tail (meno competizione):**
- "white noise for babies"
- "rain on window for sleep"
- "fireplace no music"
- "10 hours black screen sleep"
- "cozy cafe ambience for studying"

### Struttura Titolo Ottimale
```
[DURATA] [TIPO CONTENUTO] | [BENEFICIO/USO] | [BRAND]

Esempi:
- 10 Hours Fireplace Crackling | Sleep & Relaxation | Onde Lounge
- 8 Hours Rain on Window | Deep Sleep Black Screen | Onde Lounge
- 3 Hours Jazz Cafe Ambience | Study & Focus Music | Onde Lounge
```

### Descrizione Template
```
[Emoji] [Titolo completo del video]

Immerse yourself in [descrizione scena]. Perfect for:
- Deep sleep and insomnia relief
- Studying and concentration
- Meditation and relaxation
- Working from home
- Baby sleep

[2-3 paragrafi descrittivi - 200-300 parole totali]

Timestamps:
00:00 - Start
[timestamps ogni 1-2 ore per video lunghi]

---
Subscribe to Onde Lounge for more ambient content.
New videos every week.

#sleep #relaxation #whitenoise #ambient
```

**NOTA:** Hashtag nella descrizione sono ancora utili (diverso dai post).

### Tags da Usare
```
white noise, sleep sounds, relaxation, meditation, ambient sounds,
fireplace, rain sounds, ocean waves, deep sleep, study music,
focus music, ASMR, calming, peaceful, 10 hours, black screen,
no ads, sleep music, baby sleep, insomnia, concentration
```

### Thumbnail Best Practices
- **Colori caldi** (ambra, arancione) per fireplace/cozy
- **Colori blu scuro** per sleep/night
- **Testo minimo** ("10 HOURS" e basta)
- **Alta saturazione** per distinguersi
- **Coerenza** tra tutti i video del canale

---

## 7. Monetizzazione Requirements

### YouTube Partner Program (YPP) - Due Tier

#### Tier 1: Fan Funding (Soglia Bassa)
| Requisito | Valore |
|-----------|--------|
| Subscribers | 500+ |
| Watch hours | 3,000 ore negli ultimi 12 mesi |
| Video pubblici | Almeno 3 negli ultimi 90 giorni |

**Cosa ottieni:** Super Chat, Super Stickers, Channel Memberships
**NO:** Revenue da ads

#### Tier 2: Full Monetization (Ads)
| Requisito | Valore |
|-----------|--------|
| Subscribers | 1,000+ |
| Watch hours | 4,000 ore negli ultimi 12 mesi |
| OPPURE Shorts views | 10M views Shorts in 90 giorni |

**Cosa ottieni:** Revenue da pubblicita (55% creator, 45% YouTube)

### Requisiti Aggiuntivi
- [ ] Canale in paese dove YPP e disponibile (USA, Italia = OK)
- [ ] 2FA attivo su Google Account
- [ ] Zero Community Guidelines strikes attivi
- [ ] AdSense account collegato
- [ ] Upload regolari (inattivita 30-90 giorni = restrizioni)

### CPM Stimati per Ambient Content
| Categoria | CPM Range | Note |
|-----------|-----------|------|
| White Noise generico | $2-5 | Volume alto, CPM medio |
| Sleep/Wellness | **$7-15** | CPM alto, advertisers premium |
| Meditation | $7-15 | Brand wellness pagano bene |
| Music/Lo-fi | $1-3 | CPM basso ma volume enorme |

### Timeline Realistica
- **Mese 1-3:** Upload consistente, 0 revenue
- **Mese 3-6:** Raggiungere 1000 sub + 4000 ore
- **Mese 6+:** Monetizzazione attiva

---

## 8. Content Plan - Primi 10 Video

### Priorita Alta (Facile + Alto Potenziale)

| # | Titolo | Durata | Tipo | Tempo Prod |
|---|--------|--------|------|------------|
| 1 | White Noise Deep Sleep - Black Screen 10 Hours | 10h | Schermo nero + audio | 20 min |
| 2 | Fireplace Crackling - Cozy Fire Sounds 8 Hours | 8h | Video loop fuoco | 30 min |
| 3 | Rain on Window - Sleep & Study 10 Hours | 10h | Video pioggia + audio | 45 min |
| 4 | Ocean Waves - Beach Sounds for Relaxation 8 Hours | 8h | Video onde + audio | 45 min |
| 5 | Cyber Fireplace - Futuristic Ambient 4 Hours | 4h | AI-generated | 2h |

### Priorita Media (Distintivi Onde)

| # | Titolo | Durata | Tipo | Tempo Prod |
|---|--------|--------|------|------------|
| 6 | Jazz Cafe Rainy Day - Study Music 3 Hours | 3h | AI music + visual | 3h |
| 7 | Meditation Watercolors - Peaceful Music 2 Hours | 2h | Stile Onde + Suno | 2h |
| 8 | Thunderstorm Night - Heavy Rain for Sleep 10 Hours | 10h | Video + audio | 1h |
| 9 | Pink Noise - Baby Sleep Black Screen 8 Hours | 8h | Schermo nero + audio | 20 min |
| 10 | Cozy Library Ambience - Study Focus 4 Hours | 4h | AI visual + music | 3h |

---

## 9. Checklist Lancio Oggi

### Setup Canale (30 minuti)
- [ ] Vai su [studio.youtube.com](https://studio.youtube.com)
- [ ] Crea canale "Onde Lounge"
- [ ] Carica profile picture (800x800)
- [ ] Carica banner (2560x1440)
- [ ] Scrivi descrizione canale (bio)
- [ ] Aggiungi link (onde.la, social)
- [ ] Imposta watermark (opzionale)

### Primo Video (1-2 ore)
- [ ] Scegli: White Noise Black Screen (piu facile)
- [ ] Genera 10h white noise: `ffmpeg -f lavfi -i "anoisesrc=color=white:duration=36000" -c:a aac -b:a 192k white_noise_10h.m4a`
- [ ] Crea video nero: `ffmpeg -f lavfi -i color=black:size=1920x1080:rate=1 -t 36000 -c:v libx264 -tune stillimage black_10h.mp4`
- [ ] Combina: `ffmpeg -i black_10h.mp4 -i white_noise_10h.m4a -c copy "White Noise Deep Sleep 10 Hours.mp4"`
- [ ] Upload su YouTube (richiede ore per processing)
- [ ] Scrivi titolo, descrizione, tags
- [ ] Crea thumbnail
- [ ] Pubblica!

### Post-Lancio
- [ ] Condividi su @Onde_FRH
- [ ] Schedula prossimi 2-3 video
- [ ] Monitora analytics dopo 24-48h

---

## 10. Risorse e Link Utili

### Documentazione YouTube
- [YouTube Creator Academy](https://creatoracademy.youtube.com/)
- [YouTube Help - Video Specs](https://support.google.com/youtube/answer/4603579)
- [YPP Eligibility](https://support.google.com/youtube/answer/72851)

### Tools
- [TubeBuddy](https://www.tubebuddy.com/) - SEO e analytics
- [VidIQ](https://vidiq.com/) - Keyword research
- [Canva](https://www.canva.com/) - Thumbnail e banner

### Reference Channels (Competitor Analysis)
- Relaxing White Noise (3.4M subs, 332M views top video)
- Fireplace 10 hours (111K subs, 157M views)
- Lofi Girl (13M subs, live 24/7)
- Yellow Brick Cinema (sleep music)

---

## Note Finali

**Strategia Onde Lounge:**
1. NON essere un altro canale generico
2. Visual style distintivo (acquarelli, stile Onde)
3. Musica AI originale (Suno) dove possibile
4. Branding coerente su tutti i video
5. Qualita > Quantita

**Revenue Projection (Anno 1):**
- Scenario conservativo: $8,000
- Scenario moderato: $125,000
- Scenario ottimistico: $300,000+

**Il segreto:** Contenuto evergreen che accumula views per anni. Un video virale da 100M views puo generare $100K+ nel tempo.

---

*Documento creato: 10 Gennaio 2026*
*Basato su research in: `docs/YOUTUBE-MONETIZATION-RESEARCH.md`*
