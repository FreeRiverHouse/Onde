# Chill Music Video Plan - Onde YouTube Channel

## Video Test: Lofi Chill Music per Studio/Concentrazione

**Task ID**: video-002
**Data**: 2026-01-10
**Durata target**: 5-10 minuti

---

## 1. Audio - Fonti Royalty-Free Identificate

### Pixabay (Richiede registrazione gratuita)
| Titolo | Artista | Durata | URL |
|--------|---------|--------|-----|
| Lofi Chill Background Music | HitsLab | 9:54 | https://pixabay.com/music/beats-lofi-chill-background-music-313055/ |
| Chill Lofi Background Music | INPLUSMUSIC | 8:45 | https://pixabay.com/music/search/lofi%20chill/?duration=480- |
| Lofi Piano "Memories" | Akiko_Shina | 9:25 | https://pixabay.com/music/search/lofi%20chill/?duration=480- |
| LoFi Chillzone | xethrocc | 8:00 | https://pixabay.com/music/search/lofi%20chill/?duration=480- |

**Licenza**: Pixabay Content License - Royalty-free, no attribution required
**Nota**: Registrazione gratuita richiesta per download

### Freesound (Richiede registrazione gratuita)
- Cerca: "ambient relaxing music" con filtro durata 300-600 secondi
- Licenze disponibili: Creative Commons 0, Attribution, Attribution NonCommercial

### Altre fonti consigliate:
- **YouTube Audio Library** (gratuito per creatori YouTube)
- **Incompetech** (Kevin MacLeod, CC BY)
- **Free Music Archive** (varie licenze CC)

---

## 2. Visual - Immagine Statica per Video

### Prompt per Grok (stile Onde):
```
Wide panoramic scene 1920x1080, cozy study room at night, warm desk lamp light,
open notebook and coffee cup, rain on window, European watercolor style,
soft brushstrokes, peaceful atmosphere for studying, lofi aesthetic,
NOT Pixar NOT 3D NOT cartoon, muted colors with warm amber highlights, 4k
```

### Alternativa - Prompt minimal:
```
Minimalist lofi study scene, desk with books and warm lamp, night window
with city lights bokeh, watercolor illustration style, soft pastel colors,
calm peaceful atmosphere, 16:9 aspect ratio, 4k
```

### Placeholder temporaneo:
- Usa immagine esistente da `books/` o genera con Grok
- Dimensioni: 1920x1080 (16:9 per YouTube)

---

## 3. Produzione Video con FFmpeg

### Comando per creare video da immagine statica + audio:
```bash
# Crea video dalla durata dell'audio
ffmpeg -loop 1 -i image.jpg -i audio.mp3 \
  -c:v libx264 -tune stillimage -c:a aac -b:a 192k \
  -pix_fmt yuv420p -shortest \
  -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" \
  /Volumes/DATI-SSD/onde-youtube/chill-music/lofi-study-test.mp4
```

### Variante con fade in/out:
```bash
ffmpeg -loop 1 -i image.jpg -i audio.mp3 \
  -c:v libx264 -tune stillimage -c:a aac -b:a 192k \
  -pix_fmt yuv420p -shortest \
  -vf "scale=1920:1080,fade=t=in:st=0:d=2,fade=t=out:st=578:d=2" \
  -af "afade=t=in:st=0:d=2,afade=t=out:st=578:d=2" \
  /Volumes/DATI-SSD/onde-youtube/chill-music/lofi-study-test.mp4
```

---

## 4. Metadata YouTube

### Titolo:
`Lofi Chill Beats for Studying & Concentration | 10 Minutes Relaxing Music`

### Descrizione:
```
Lofi chill music for studying, working, and concentration.
Perfect background music for focus and relaxation.

Music: [Credit artista da Pixabay]
Visual: Onde Studio

---
Onde - Casa Editrice Multimedia
https://onde.la
```

### Tags:
- lofi
- chill music
- study music
- concentration
- relaxing music
- background music
- lo-fi beats
- focus music

---

## 5. Output Directory

**Path**: `/Volumes/DATI-SSD/onde-youtube/chill-music/`

### Struttura:
```
/Volumes/DATI-SSD/onde-youtube/chill-music/
├── audio/              # Audio scaricati
├── images/             # Immagini per video
├── output/             # Video finali
└── thumbnails/         # Thumbnail YouTube
```

---

## 6. Prossimi Passi

1. [ ] Mattia registra account Pixabay (gratuito)
2. [ ] Scaricare audio "Lofi Chill Background Music" (9:54)
3. [ ] Generare immagine con Grok usando prompt sopra
4. [ ] Creare video con FFmpeg
5. [ ] Caricare su YouTube come "unlisted" per test
6. [ ] Se OK, pubblicare pubblicamente

---

## Note

- **Regola CLAUDE.md**: Non posso creare account o fare registrazioni
- I siti royalty-free (Pixabay, Freesound) richiedono registrazione gratuita
- YouTube Audio Library e' alternativa senza registrazione per chi ha canale YouTube
- Il video test serve per validare il workflow prima di produrre serie completa

---

*Creato da worker claude-69596-mk87f06l - Task video-002*
