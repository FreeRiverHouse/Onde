# Jingles Onde Podcast - Specifiche

> Jingle audio per intro/outro del podcast "Piccole Rime"

---

## Jingle Intro

### Specifiche Tecniche

| Parametro | Valore |
|-----------|--------|
| **Durata** | 3 secondi |
| **Formato** | MP3 320kbps |
| **Sample Rate** | 44.1 kHz |
| **Canali** | Stereo |
| **Loudness** | -14 LUFS |
| **Fade In** | 0.2s |
| **Fade Out** | 0.5s |

### Descrizione Sonora

```
Suono di onde marine delicate che si infrangono dolcemente,
seguito da una nota di carillon/music box (LA o DO) che risuona.
Atmosfera magica ma non invadente.
Fade out dolce verso il parlato.
```

### Prompt per Generazione (Suno)

```
3 second podcast intro jingle,
gentle ocean waves transitioning into music box note,
magical sparkle sound, warm cozy atmosphere,
European children's podcast feel,
clean and elegant, no vocals
[Instrumental] [BPM: 60]
```

### Elementi Audio

1. **0.0s - 1.5s**: Onde marine soft (volume crescente)
2. **1.5s - 2.5s**: Nota music box + sparkle
3. **2.5s - 3.0s**: Fade out verso silenzio

---

## Jingle Outro

### Specifiche Tecniche

| Parametro | Valore |
|-----------|--------|
| **Durata** | 3 secondi |
| **Formato** | MP3 320kbps |
| **Sample Rate** | 44.1 kHz |
| **Canali** | Stereo |
| **Loudness** | -14 LUFS |
| **Fade In** | 0.3s |
| **Fade Out** | 0.5s |

### Descrizione Sonora

```
Nota di carillon/music box (stessa del jingle intro per coerenza),
seguita da onde marine che si allontanano dolcemente.
Sensazione di chiusura serena, "arrivederci".
```

### Prompt per Generazione (Suno)

```
3 second podcast outro jingle,
music box melody resolving peacefully,
gentle ocean waves fading away,
warm goodbye feeling, European lullaby aesthetic,
clean and elegant, no vocals
[Instrumental] [BPM: 60]
```

### Elementi Audio

1. **0.0s - 0.5s**: Fade in da parlato
2. **0.5s - 2.0s**: Melodia music box (2-3 note risolutive)
3. **2.0s - 3.0s**: Onde che si allontanano + fade out

---

## Jingle Onde (Logo Sonoro)

### Per Identificazione Brand

```
Versione estesa (5 secondi) per:
- Inizio video YouTube
- Trailer podcast
- Spot pubblicitari
```

### Prompt per Generazione

```
5 second audio logo, Onde Publishing brand,
ocean waves melody, warm piano chord progression C-Am-F-G,
magical children's publishing house feel,
elegant European style, cozy and inviting,
memorable and distinctive
[Instrumental] [BPM: 70]
```

---

## Note sulla Coerenza

### Elementi Sonori Ricorrenti

1. **Onde marine**: Sempre presenti (brand "Onde")
2. **Music box/carillon**: Elemento infantile elegante
3. **Tonalita'**: DO maggiore o LA minore (calde)
4. **Atmosfera**: Magica ma non fantasy, accogliente

### Cosa EVITARE

- Suoni troppo elettronici/sintetici
- Beat o percussioni prominenti
- Voci o vocalizzi
- Suoni acuti o stridenti
- Atmosfera horror/misteriosa
- Stile americano/pop

### Cosa CERCARE

- Calore europeo
- Eleganza senza tempo
- Semplicita'
- Riconoscibilita' immediata
- Coerenza con stile Beatrix Potter/Luzzati

---

## File da Generare

### Lista File Jingle

| File | Durata | Uso |
|------|--------|-----|
| `jingle-intro.mp3` | 3s | Inizio ogni episodio |
| `jingle-outro.mp3` | 3s | Fine ogni episodio |
| `onde-logo-5s.mp3` | 5s | Video, trailer |
| `onde-logo-10s.mp3` | 10s | Intro canale YouTube |
| `transition-soft.mp3` | 2s | Transizioni interne |

### Path Output

```
assets/audio/
├── jingle-intro.mp3
├── jingle-outro.mp3
├── onde-logo-5s.mp3
├── onde-logo-10s.mp3
└── transition-soft.mp3
```

---

## Workflow Creazione

### Step 1: Generazione Bozze

1. Vai su https://suno.com
2. Usa i prompt sopra
3. Genera 4 varianti per tipo
4. Scarica le migliori

### Step 2: Editing

```bash
# Taglia a durata esatta
ffmpeg -i raw-jingle.mp3 -ss 0 -t 3 -c copy trimmed.mp3

# Normalizza volume
ffmpeg -i trimmed.mp3 -af loudnorm=I=-14:TP=-1:LRA=11 normalized.mp3

# Aggiungi fade
ffmpeg -i normalized.mp3 -af "afade=t=in:st=0:d=0.2,afade=t=out:st=2.5:d=0.5" final.mp3
```

### Step 3: QC

- [ ] Durata esatta
- [ ] Volume corretto (-14 LUFS)
- [ ] Fade in/out smooth
- [ ] Nessun clipping
- [ ] Coerenza con brand Onde

### Step 4: Integrazione

Copia i file in:
- `tools/podcast-factory/assets/`
- `apps/podcast-rss/audio/jingles/`

---

## Status

| Jingle | Status | Note |
|--------|--------|------|
| Intro 3s | DA FARE | Priorita' alta |
| Outro 3s | DA FARE | Priorita' alta |
| Logo 5s | DA FARE | Priorita' media |
| Logo 10s | DA FARE | Priorita' bassa |
| Transition | DA FARE | Priorita' bassa |

---

*Documento creato: 9 Gennaio 2026*
*Task: podcast-pipeline-001*
