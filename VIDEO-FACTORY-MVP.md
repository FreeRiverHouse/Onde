# VIDEO FACTORY MVP - Piano di Implementazione

**Data**: 8 Gennaio 2026
**Status**: In sviluppo

---

## STACK TECNOLOGICO CONSIGLIATO (2026)

### 1. LIP SYNC - Sincronizzazione Labiale

| Tool | Tipo | Costo | Qualita' | Note |
|------|------|-------|----------|------|
| **Sync Labs** | API Cloud | $19-249/mese | Eccellente | Scalabile, batch processing, API robusta |
| **Hedra AI** | API/Web | Free tier + paid | Eccellente emotivo | Espressioni facciali realistiche |
| **Easy-Wav2Lip** | Locale Mac | GRATIS | Buono | GIA' SETUP! MPS support per Apple Silicon |
| **SadTalker** | Locale Mac | GRATIS | Ottimo | Piu' lento ma qualita' superiore |

**Raccomandazione**:
- **MVP economico**: Easy-Wav2Lip locale (gia' pronto in `/tools/lip-sync/`)
- **Produzione**: Sync Labs API ($19/mo) per batch processing

### 2. VIDEO GENERATION - Generazione Video

| Tool | Costo | Durata Max | Qualita' | API |
|------|-------|------------|----------|-----|
| **Kling AI** | $10-149/mo | 120 sec | Top tier | Si (via WaveSpeedAI) |
| **Hailuo/MiniMax** | $9.99-94.99/mo | 6-10 sec | Alta | Si ($0.28/video) |
| **Runway Gen-4** | $15-35/mo | 10 sec | Alta | Si ($0.05-0.12/sec) |
| **Sora 2** | $200/mo (Pro) | 25 sec | Top tier | Coming soon |

**Raccomandazione**:
- **MVP economico**: Hailuo Standard ($9.99/mo) + Kling Standard ($10/mo) = $20/mo
- **Produzione**: Kling AI Pro ($149/mo) per video lunghi fino a 2 minuti

### 3. MUSIC SYNC - Sincronizzazione Musicale

| Tool | Feature | Note |
|------|---------|------|
| **Neural Frames** | 8-track audio analysis, DAW interface | MIGLIORE per beat sync |
| **Plazmapunk** | Beat matching automatico | Piu' semplice |

**Raccomandazione**: Neural Frames - unico con stem separation e sync perfetto al frame

---

## ARCHITETTURA MVP

```
┌─────────────────────────────────────────────────────────────────┐
│                      VIDEO FACTORY MVP                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   INPUT                 PROCESSING              OUTPUT          │
│   ─────                 ──────────              ──────          │
│                                                                 │
│   📝 Testo      ──┐                                             │
│   🎵 Audio      ──┼──▶  [Pipeline Node.js]  ──▶  📺 YouTube     │
│   🖼️ Immagini   ──┘     • ElevenLabs (TTS)       📱 TikTok     │
│                         • Easy-Wav2Lip (lip)     🎭 Onde Portal │
│                         • Hailuo/Kling (video)   📻 Spotify     │
│                         • Neural Frames (music)                 │
│                         • FFmpeg (assembly)                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## COSTI STIMATI

### Tier 1: MVP ECONOMICO (~$15/mese)
- Easy-Wav2Lip: GRATIS (locale)
- Hailuo Standard: $9.99
- ElevenLabs Starter: $5

### Tier 2: PRODUZIONE BASE (~$80/mese)
- Sync Labs Creator: $19
- Kling AI Standard: $10
- Hailuo Standard: $9.99
- ElevenLabs Creator: $22
- Neural Frames: ~$20

### Tier 3: PRODUZIONE PROFESSIONALE (~$580/mese)
- Sync Labs Scale: $249
- Kling AI Pro: $149
- Runway Gen-4 Pro: $35
- ElevenLabs Pro: $99
- Neural Frames Pro: ~$50

---

## TIMELINE PROTOTIPO (4 settimane)

### Settimana 1: Setup Base
- [ ] Completare setup Easy-Wav2Lip (script gia' pronti)
- [ ] Test lip sync con immagine Gianni + audio ElevenLabs
- [ ] Setup account Hailuo API
- [ ] Primo video di test end-to-end

### Settimana 2: Pipeline Automation
- [ ] Script Node.js per pipeline automatica
- [ ] Integrazione con Telegram per notifiche
- [ ] Test batch processing (3-5 video)

### Settimana 3: Output Multi-formato
- [ ] FFmpeg templates (16:9, 9:16, 1:1)
- [ ] Integrazione upload YouTube
- [ ] Test Neural Frames per music video

### Settimana 4: Polish & Deploy
- [ ] Dashboard web per controllo pipeline
- [ ] Integrazione con Onde Portal
- [ ] Test con contenuti reali (Stella Stellina, AIKO)
- [ ] LANCIO MVP

---

## TIPI DI VIDEO DA PRODURRE

| Tipo | Input | Tool | Output |
|------|-------|------|--------|
| **Lip Sync Gianni/Pina** | Immagine + Audio | Easy-Wav2Lip | YouTube podcast |
| **Video Poesia** | Testo + Musica + Visual | Hailuo + Kling | Social |
| **Music Video** | Canzone completa | Neural Frames | YouTube, Spotify |
| **Ninna Nanna Animata** | Illustrazione + Voce | Kling | YouTube Kids |
| **Ambient Loop** | Immagine + Musica AI | FFmpeg + Suno | Onde Lounge |

---

## FILE ESISTENTI DA USARE

- `/tools/lip-sync/SETUP-GUIDE.md` - Setup Easy-Wav2Lip e SadTalker
- `/scripts/factory/generate-audio.js` - Pattern ElevenLabs
- `/apps/onde-portal/` - Frontend per video player

---

## PROSSIMI PASSI IMMEDIATI

1. **OGGI**: Completare setup Easy-Wav2Lip
2. **DOMANI**: Test lip sync con Gianni + audio sample
3. **QUESTA SETTIMANA**: Account Hailuo + primo video
4. **PROSSIMA SETTIMANA**: Pipeline automatizzata

---

**Sources:**
- [Sync Labs](https://sync.so/)
- [Hedra AI](https://hedra.com/)
- [Hailuo AI](https://hailuoai.video/)
- [Kling AI](https://klingai.com/)
- [Neural Frames](https://www.neuralframes.com/)
- [ElevenLabs](https://elevenlabs.io/)
