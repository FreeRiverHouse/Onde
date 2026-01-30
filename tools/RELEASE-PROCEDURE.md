# RELEASE - Sistema di Drop Multi-Canale

**Versione**: 1.0
**Data**: 12 Gennaio 2026
**Scopo**: Procedura per droppare contenuti su tutti i canali automaticamente

---

## Filosofia RELEASE

> "Create once, drop everywhere, automatically."

RELEASE trasforma un singolo asset creativo in presenza multi-piattaforma con minimo intervento manuale. Privilegia canali con API e automazione completa.

**Ogni PRODOTTO ha il suo TEMPLATE con:**
- Canali di distribuzione specifici
- Credenziali necessarie
- Workflow step-by-step
- Checklist pre-release

---

## Priorità Canali

| Priorità | Tipo | Caratteristica |
|----------|------|----------------|
| **P1** | Full API | Upload + metadata + scheduling via API |
| **P2** | Aggregatore | Un upload distribuisce a molti (Jumpstr, DistroKid) |
| **P3** | Dashboard | Upload manuale ma batch supportato |
| **P4** | Manuale | Solo browser, no API |

---

## CREDENZIALI CENTRALIZZATE

### File: `/Onde/.env.release`

```env
# === AUDIO DISTRIBUTION ===
SUNO_ACCOUNT=freeriverhouse@gmail.com
JUMPSTR_ACCOUNT=onde.frh@proton.me
DISTROKID_ACCOUNT=
SPOTIFY_ARTIST_ID=

# === VIDEO DISTRIBUTION ===
YOUTUBE_CHANNEL_ID=
YOUTUBE_API_KEY=
VIMEO_ACCESS_TOKEN=
TIKTOK_ACCESS_TOKEN=

# === EBOOK DISTRIBUTION ===
KDP_EMAIL=
KDP_PASSWORD=
APPLE_BOOKS_CONNECT=
GUMROAD_ACCESS_TOKEN=
LULU_API_KEY=

# === SOCIAL MEDIA ===
X_FREERIVERHOUSE_API_KEY=
X_FREERIVERHOUSE_API_SECRET=
X_FREERIVERHOUSE_ACCESS_TOKEN=
X_FREERIVERHOUSE_ACCESS_SECRET=

X_ONDE_API_KEY=
X_ONDE_API_SECRET=
X_ONDE_ACCESS_TOKEN=
X_ONDE_ACCESS_SECRET=

X_MAGMATIC_API_KEY=
X_MAGMATIC_API_SECRET=
X_MAGMATIC_ACCESS_TOKEN=
X_MAGMATIC_ACCESS_SECRET=

INSTAGRAM_ACCESS_TOKEN=
THREADS_ACCESS_TOKEN=
LINKEDIN_ACCESS_TOKEN=

# === PODCAST ===
SPOTIFY_PODCASTERS_RSS=
APPLE_PODCASTS_CONNECT=
ANCHOR_EMAIL=

# === APP STORES ===
APPLE_DEVELOPER_ID=
GOOGLE_PLAY_SERVICE_ACCOUNT=
STEAM_PARTNER_ID=
ITCH_IO_API_KEY=

# === GENERAL ===
TELEGRAM_BOT_TOKEN=8272332520:AAF7zrKpqOCnFMqOlF1GJCLycJFk3IPO6ps
TELEGRAM_CHAT_ID=7505631979
GROK_API_KEY=
```

---

## CANALI PER TIPO DI PRODOTTO

---

### AUDIO (Musica, Sound Effects, Ambient)

#### Generazione
| Tool | Account | Priorità | Note |
|------|---------|----------|------|
| **Suno** | freeriverhouse@gmail.com | P1 | 40 crediti/mese free, Pro $10/mo |
| **Udio** | - | P2 | Alternativa |

#### Distribuzione
| Canale | Tipo | Priorità | Automazione | Reach |
|--------|------|----------|-------------|-------|
| **Jumpstr** | Aggregatore | **P1** | Full API | 150+ piattaforme |
| **DistroKid** | Aggregatore | P1 | Full API | 150+ piattaforme |
| **TuneCore** | Aggregatore | P2 | Dashboard | Major platforms |
| **Spotify Direct** | Direct | P3 | Dashboard only | Spotify |
| **SoundCloud** | Direct | P2 | API available | Community |
| **Bandcamp** | Direct | P3 | Dashboard | Indie audience |
| **YouTube Music** | Via aggregatore | P1 | Via Jumpstr | Global |

#### Workflow Audio
```
1. Genera su Suno (Instrumental, 2-4 min)
2. Quality check (no vocals, no glitch)
3. Metadata (Title, Artist: Onde, Label: Onde LA)
4. Cover art (3000x3000, Grok genera)
5. Upload Jumpstr → distribuzione automatica
6. Verifica post-release su Spotify
```

---

### VIDEO (Music Videos, Tutorials, Trailers)

#### Generazione
| Tool | Account | Priorità | Note |
|------|---------|----------|------|
| **Runway** | - | P1 | Gen-3 video |
| **Kling** | - | P2 | Lip sync |
| **Hedra** | freeriverhouse@gmail.com | P1 | Avatar video |
| **Pika** | - | P3 | Short clips |

#### Distribuzione
| Canale | Tipo | Priorità | Automazione | Note |
|--------|------|----------|-------------|------|
| **YouTube** | Primary | **P1** | API full | Monetization |
| **TikTok** | Short-form | P1 | API | Viral potential |
| **Instagram Reels** | Short-form | P2 | API limited | Visual audience |
| **Vimeo** | Portfolio | P3 | API | Professional |
| **X/Twitter** | Social | P1 | API full | Engagement |

#### Workflow Video
```
1. Genera video (Runway/Kling/Hedra)
2. Edit se necessario (CapCut/DaVinci)
3. Formati: 16:9 (YT), 9:16 (TikTok/Reels), 1:1 (X)
4. Thumbnail (Grok genera)
5. Upload YouTube (primary) → poi altri canali
6. Cross-post social per promozione
```

---

### EBOOK (Libri, Guide, Raccolte)

#### Generazione
| Tool | Uso | Note |
|------|-----|------|
| **Pandoc** | Conversione formati | MD → ePub/PDF |
| **Calibre** | ePub editing | Metadata, cover |
| **Grok** | Illustrazioni | Batch generation |

#### Distribuzione
| Canale | Tipo | Priorità | Automazione | Fee |
|--------|------|----------|-------------|-----|
| **Amazon KDP** | Primary | **P1** | API partial | 30-65% |
| **Apple Books** | Major | P2 | iTunes Connect | 30% |
| **Google Play Books** | Major | P2 | Partner Center | 30% |
| **Gumroad** | Direct | **P1** | API full | 10% |
| **Lulu** | Print-on-demand | P2 | API | Variable |
| **Kobo** | eReader | P3 | Dashboard | 30% |
| **onde.la** | Direct | **P1** | Full control | 0% |

#### Workflow Ebook
```
1. Scrivi/traduci contenuto (Gianni Parola)
2. Illustrazioni (Pina Pennello → Grok)
3. Layout (Pandoc → ePub)
4. Cover (3000x3000)
5. Upload KDP (primary)
6. Upload onde.la (direct sales)
7. Altri canali in parallelo
```

---

### APP (Games, Tools, Utilities)

#### Distribuzione
| Canale | Tipo | Priorità | Automazione | Fee |
|--------|------|----------|-------------|-----|
| **Apple App Store** | Mobile | P2 | Fastlane | 15-30% |
| **Google Play** | Mobile | P2 | Fastlane | 15-30% |
| **Steam** | Desktop/VR | P2 | Steamworks | 30% |
| **itch.io** | Indie | **P1** | API | 0-10% |
| **Meta Quest** | VR | P3 | Dashboard | 30% |
| **SideQuest** | VR indie | **P1** | API | Free |

#### Workflow App
```
1. Build (Unity/Xcode)
2. Test automation (CI/CD)
3. Screenshots + trailer
4. Upload primary store
5. Cross-platform deploy
```

---

### SOCIAL MEDIA (Post, Stories, Threads)

#### Account Gestiti
| Account | Platform | Tipo | API |
|---------|----------|------|-----|
| @Onde_FRH | X | Casa editrice | **Full** |
| @FreeRiverHouse | X | Tech/Building | **Full** |
| @magmatic__ | X | Arte/Poesia | **Full** |
| @onde.la | Instagram | Visual | Limited |

#### Distribuzione
| Canale | Priorità | Automazione | Note |
|--------|----------|-------------|------|
| **X/Twitter** | **P1** | API v2 full | Primary |
| **Threads** | P2 | API new | Growing |
| **LinkedIn** | P3 | API limited | Professional |
| **Instagram** | P2 | Business API | Visual |
| **Bluesky** | P3 | API | Alt platform |

#### Workflow Social
```
1. Crea contenuto (testo + media)
2. Adatta per piattaforma
3. Post primario (X)
4. Cross-post altri canali
5. Cross-engagement tra account
```

---

### PODCAST (Audio Shows, Interviews)

#### Distribuzione
| Canale | Tipo | Priorità | Automazione |
|--------|------|----------|-------------|
| **Spotify for Podcasters** | Aggregatore | **P1** | RSS auto |
| **Apple Podcasts** | Major | P1 | RSS auto |
| **YouTube Podcasts** | Video | P2 | Manual |
| **Amazon Music** | Major | P2 | Via Spotify |

#### Workflow Podcast
```
1. Registra/genera audio
2. Edit + intro/outro
3. Upload Spotify for Podcasters
4. RSS distribuisce automaticamente
5. Video version per YouTube
```

---

## AUTOMAZIONE SCRIPTS

### Struttura
```
/Onde/tools/release/
├── templates/              # Template per ogni prodotto
│   ├── audio-single.yaml
│   ├── audio-album.yaml
│   ├── video-youtube.yaml
│   ├── video-short.yaml
│   ├── ebook-kindle.yaml
│   ├── ebook-direct.yaml
│   ├── app-mobile.yaml
│   ├── app-vr.yaml
│   └── social-post.yaml
├── scripts/
│   ├── audio/
│   │   ├── suno-generate.py
│   │   ├── jumpstr-upload.py
│   │   └── spotify-verify.py
│   ├── video/
│   │   ├── youtube-upload.py
│   │   ├── tiktok-upload.py
│   │   └── multi-format.py
│   ├── ebook/
│   │   ├── kdp-upload.py
│   │   ├── gumroad-upload.py
│   │   └── onde-publish.py
│   └── social/
│       ├── x-post.py
│       ├── cross-post.py
│       └── engagement.py
└── release.py              # Orchestrator principale
```

### Orchestrator Command
```bash
# Distribuisci audio su tutti i canali
python release.py audio "track.mp3" --all

# Distribuisci video
python release.py video "video.mp4" --channels youtube,tiktok,x

# Distribuisci ebook
python release.py ebook "book.epub" --channels kdp,gumroad,onde
```

---

## METRICHE E TRACKING

### Dashboard URL
- Spotify for Artists: artists.spotify.com
- YouTube Studio: studio.youtube.com
- KDP Reports: kdpreports.amazon.com
- X Analytics: analytics.twitter.com

### Report Automatico (Telegram)
Ogni domenica 18:00 PT:
- Streams totali settimana
- Views YouTube
- Sales ebook
- Social engagement

---

## CHECKLIST NUOVO PRODOTTO

- [ ] Asset generato e quality-checked
- [ ] Metadata completi
- [ ] Cover/Thumbnail pronto
- [ ] Credenziali canali verificate
- [ ] Upload canale primario
- [ ] Cross-distribution attiva
- [ ] Verifica post-release
- [ ] Tracking attivato

---

*Procedura creata: 12 Gen 2026*
*Sistema: RELEASE v1.0*
