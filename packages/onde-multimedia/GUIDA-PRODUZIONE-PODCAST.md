# Guida Produzione Video Podcast Onde

> Pipeline completa per creare episodi del podcast in 5 minuti

---

## TL;DR - Comandi Rapidi

```bash
# 1. Genera audio (automatico)
cd /Users/mattia/Projects/Onde/packages/onde-multimedia/scripts
python3 generate-ep0X-[nome].py

# 2. Genera immagine su Grok (manuale)
# Vai su x.com/i/grok → "Create Images" → usa prompt dal file

# 3. Lip sync su Hedra (manuale)
# Vai su hedra.com → carica audio + immagine Gianni

# 4. Upload YouTube (manuale)
# Usa YouTube Studio
```

---

## Pipeline Completa

### Step 1: Preparare lo Script

**File**: `scripts/episode-0X-[nome].md`

Struttura standard:
```markdown
# Episodio X: [Titolo]

## Metadata
- Numero: EP-0X
- Durata target: X minuti
- Voce: Gianni Parola
- Fonte: [Autore] - Dominio Pubblico

## Script
### INTRO (10 sec)
### SALUTO (30 sec)
### CONTENUTO PRINCIPALE
### RIFLESSIONE
### OUTRO (30 sec)
```

---

### Step 2: Generare Audio (Edge TTS - GRATUITO)

**Tool**: Edge TTS (Microsoft) - gratuito, illimitato

**Creare script Python**:
```python
#!/usr/bin/env python3
import asyncio
import edge_tts

TEXT = """
[TESTO COMPLETO DELL'EPISODIO]
"""

VOICE = "it-IT-DiegoNeural"  # Voce maschile italiana
OUTPUT_FILE = "/Users/mattia/Downloads/onde-podcast-ep0X-[nome].mp3"

async def main():
    communicate = edge_tts.Communicate(TEXT, VOICE, rate="-10%", pitch="-5Hz")
    await communicate.save(OUTPUT_FILE)
    print(f"✅ Audio generato: {OUTPUT_FILE}")

if __name__ == "__main__":
    asyncio.run(main())
```

**Eseguire**:
```bash
python3 scripts/generate-ep0X-[nome].py
```

**Voci disponibili**:
- `it-IT-DiegoNeural` - Maschile (Gianni Parola)
- `it-IT-ElsaNeural` - Femminile (Pina Pennello)
- `it-IT-IsabellaNeural` - Femminile alternativa

---

### Step 3: Generare Illustrazione (Grok)

**URL**: https://x.com/i/grok → "Create Images"

**Prompt Template (Stile Onde)**:
```
Watercolor children's book illustration, [SCENA SPECIFICA],
Luzzati/Beatrix Potter aesthetic, soft colors, warm light,
NOT Pixar NOT 3D, natural skin tones, 4k
```

**Prompts per episodio** sono salvati in:
- `content/podcast-episodes/EPISODES-BATCH-02.md`
- `scripts/episode-0X-[nome].md`

**Dopo generazione**:
1. Click "Upscale" sull'immagine
2. Scarica in `~/Downloads/`
3. Rinomina: `ep0X-[nome]-illustration.jpg`

---

### Step 4: Lip Sync Video (Hedra)

**URL**: https://hedra.com

**Processo**:
1. Login (account gratuito: 4 min/mese)
2. Click "Create Character"
3. Upload immagine: `~/Downloads/GianniParola.jpg`
4. Upload audio: `~/Downloads/onde-podcast-ep0X-[nome].mp3`
5. Genera video
6. Scarica: `ep0X-[nome]-video.mp4`

**Immagini Gianni disponibili**:
- `~/Downloads/GianniParola.jpg` (principale)
- `~/Downloads/GianniA-Scrittore.jpg`
- `~/Downloads/GianniC-Narratore.jpg`

**Alternativa gratuita (locale)**:
- Wav2Lip o SadTalker (richiede setup Python)

---

### Step 5: Upload YouTube

**URL**: https://studio.youtube.com

**Metadata standard**:
```
Titolo: [Titolo Poesia] | Ninna Nanna Italiana | Onde Podcast

Descrizione:
Gianni Parola legge "[Titolo]" di [Autore].

[TESTO COMPLETO DELLA POESIA]

---
Onde Podcast - Storie e poesie per bambini
Illustrazione: Pina Pennello con @grok

Tags: ninna nanna, poesia italiana, bambini, podcast, [autore]
```

**Impostazioni**:
- Made for Kids: YES
- Visibility: Public
- Playlist: "Onde Podcast - Poesie Italiane"

---

### Step 6: Post su X

**Account**: @Onde_FRH

**Template caption**:
```
[Frase evocativa dalla poesia]

Il nostro Gianni Parola legge "[Titolo]" di [Autore].

[LINK YOUTUBE]

Illustrazione: Pina Pennello con @grok
```

**NO hashtag** (Grok analizza automaticamente)

---

## File di Riferimento

| File | Contenuto |
|------|-----------|
| `scripts/episode-0X-[nome].md` | Script episodio |
| `scripts/generate-ep0X-[nome].py` | Generatore audio |
| `content/podcast-episodes/EPISODES-BATCH-02.md` | Batch episodi pronti |
| `~/Downloads/GianniParola.jpg` | Immagine per lip sync |

---

## Episodi Completati

| # | Titolo | Audio | Video | YouTube |
|---|--------|-------|-------|---------|
| 01 | Stella Stellina | ✅ | ✅ | ✅ LIVE |
| 02 | Pioggerellina di Marzo | ✅ | ⏳ | ⏳ |
| 03 | La Befana | ⏳ | ⏳ | ⏳ |
| 04 | Il Pulcino Bagnato | ⏳ | ⏳ | ⏳ |
| 05 | Il Pesciolino d'Oro | ⏳ | ⏳ | ⏳ |

---

## Troubleshooting

**Edge TTS non funziona?**
```bash
pip install edge-tts
```

**Voce troppo veloce/lenta?**
- Modifica `rate="-10%"` (negativo = più lento)
- Modifica `pitch="-5Hz"` (negativo = più basso)

**Hedra limite raggiunto?**
- Usa account alternativo
- Oppure setup Wav2Lip locale

---

*Ultimo aggiornamento: 2026-01-08*
