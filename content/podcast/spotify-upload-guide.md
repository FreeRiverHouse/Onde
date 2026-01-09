# Guida Upload Podcast Spotify - Onde

**Task:** spotify-002
**Data:** 2026-01-09

---

## Stato Attuale

**Spotify NON ha API per upload podcast.**

L'unico modo per pubblicare e':
1. **RSS Feed** (raccomandato) - automatico per futuri episodi
2. **Spotify for Podcasters** (manuale) - via browser

---

## Opzione 1: RSS Feed (Raccomandato)

### Setup Iniziale
1. Creare RSS feed con episodi podcast
2. Hostare RSS su URL pubblico
3. Submittare RSS a Spotify for Podcasters
4. Spotify ingerisce automaticamente nuovi episodi

### Vantaggi
- Automatico per futuri episodi
- Funziona anche con Apple Podcasts, Google Podcasts
- Standard del settore

### Task correlato
- **spotify-003**: Setup RSS feed podcast

---

## Opzione 2: Spotify for Podcasters (Manuale)

### URL
https://podcasters.spotify.com/

### Procedura
1. Login su podcasters.spotify.com
2. Crea nuovo podcast (se primo episodio)
3. Upload audio MP3
4. Compila metadata (titolo, descrizione, cover)
5. Pubblica

### Richiede
- Browser con login account Spotify
- Claude for Chrome connesso

---

## Episodio Pronto per Upload

### Ep.01 Stella Stellina

| Campo | Valore |
|-------|--------|
| **File** | `packages/onde-multimedia/podcast/episodes/ep01-stella-stellina-elevenlabs.mp3` |
| **Titolo** | Piccole Rime Ep.01 - Stella Stellina |
| **Autore** | Onde Publishing |
| **Descrizione** | Gianni Parola legge "Stella Stellina" di Lina Schwarz, una dolce ninna nanna per bambini. Serie Piccole Rime - poesia italiana per i piu' piccoli. |
| **Categoria** | Kids & Family > Stories for Kids |
| **Lingua** | Italiano |
| **Cover** | Da creare (1400x1400 min, 3000x3000 raccomandato) |

---

## Cover Podcast da Creare

**Prompt Grok per cover podcast:**
```
Square podcast cover art, elegant watercolor style,
"Piccole Rime" title at top, Italian children's poetry podcast,
soft nighttime scene with stars and moon,
a gentle silhouette of parent reading to child,
warm amber and deep blue colors,
European illustration style, NOT Pixar NOT cartoon,
professional podcast branding, 4k
```

**Dimensioni:**
- Minimo: 1400x1400 px
- Raccomandato: 3000x3000 px
- Formato: JPEG o PNG
- Max size: 2MB

---

## Status

- [x] Episodio 01 audio pronto
- [x] Script episodio pronto
- [x] Metadata definiti
- [ ] Cover podcast creata
- [ ] RSS feed configurato (task spotify-003)
- [ ] Upload su Spotify

---

## Prossimi Passi

1. **Priorita' 1**: Completare task spotify-003 (RSS feed)
2. **Priorita' 2**: Creare cover podcast
3. **Priorita' 3**: Submit RSS a Spotify (una volta)
4. Automatico per futuri episodi

---

## Fonti

- [Spotify for Podcasters](https://podcasters.spotify.com/)
- [Spotify Web API](https://developer.spotify.com/documentation/web-api)
- [Riverside Guide](https://riverside.com/blog/how-to-upload-a-podcast-to-spotify)

---

*Report generato da Code Worker - 2026-01-09*
