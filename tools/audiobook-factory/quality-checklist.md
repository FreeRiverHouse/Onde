# Quality Checklist - Audiobook Pre-Publishing

Checklist obbligatoria prima di pubblicare qualsiasi audiobook Onde.

---

## Pre-Flight Checks

### 1. File Structure
- [ ] Tutti i capitoli generati
- [ ] File nominati correttamente (chapter-01.mp3, chapter-02.mp3...)
- [ ] Config JSON presente e aggiornato
- [ ] Cover image presente (per M4B)

### 2. Audio Quality
- [ ] Volume normalizzato (target: -16 LUFS)
- [ ] No clipping (peak max: -1dB)
- [ ] No rumori di fondo
- [ ] No artefatti TTS (glitch, parole tagliate)
- [ ] No silenzio eccessivo (gap > 5 secondi)

### 3. Content Accuracy
- [ ] Testo completo (nessun capitolo mancante)
- [ ] Pronuncia corretta nomi propri
- [ ] Pronuncia corretta parole straniere
- [ ] Pause naturali tra frasi
- [ ] Enfasi corretta su parole chiave

### 4. Voice Consistency
- [ ] Stesso narratore per tutto il libro
- [ ] Voci personaggi coerenti
- [ ] Tono appropriato per il contenuto
- [ ] No cambio improvviso di volume/tono

### 5. Background Music (se presente)
- [ ] Volume musica corretto (-18dB o meno)
- [ ] Fade in/out smooth
- [ ] Musica non copre mai la voce
- [ ] Stile musica appropriato al contenuto
- [ ] Loop seamless (se applicabile)

### 6. Metadata
- [ ] Titolo corretto
- [ ] Autore/Narratore corretti
- [ ] Anno pubblicazione
- [ ] ISBN audiobook (se richiesto)
- [ ] Cover art corretta (300x300 min per MP3, 1400x1400 per M4B)

---

## Listening Test

### Full Listen-Through
Prima di pubblicare, ascolta l'intero audiobook verificando:

**Inizio (primi 5 minuti)**
- [ ] Intro smooth
- [ ] Volume corretto da subito
- [ ] Musica entra correttamente

**Mezzo (capitoli centrali)**
- [ ] Transizioni tra capitoli fluide
- [ ] Nessun gap o interruzione
- [ ] Qualita' costante

**Fine (ultimi 5 minuti)**
- [ ] Conclusione naturale
- [ ] Fade out appropriato
- [ ] Credits/outro presenti

### Spot Checks
Verifica random 30 secondi da:
- [ ] Capitolo 1
- [ ] Capitolo centrale
- [ ] Ultimo capitolo
- [ ] Almeno 2 dialoghi
- [ ] Almeno 1 scena emotiva

---

## Technical Specifications

### MP3
| Parametro | Valore Richiesto |
|-----------|-----------------|
| Bitrate | 128-192 kbps CBR |
| Sample Rate | 44.1 kHz |
| Channels | Stereo (2) |
| Bit Depth | 16-bit |
| Format | MPEG Audio Layer 3 |

### M4B (Apple Books/Audible)
| Parametro | Valore Richiesto |
|-----------|-----------------|
| Codec | AAC |
| Bitrate | 128-256 kbps |
| Sample Rate | 44.1 kHz |
| Channels | Stereo (2) |
| Chapters | Embedded |
| Cover | 1400x1400 px min |

### Loudness
| Parametro | Target |
|-----------|--------|
| Integrated LUFS | -16 to -18 |
| True Peak | -1 dB max |
| Dynamic Range | 6-12 dB |

---

## Common Issues

### Problema: Voce troppo veloce/lenta
**Causa**: Settings TTS sbagliati
**Fix**: Rigenera con stability diversa (piu' alta = piu' lento)

### Problema: Pronuncia sbagliata
**Causa**: TTS non conosce il termine
**Fix**: Usa spelling fonetico nel testo o SSML tags

### Problema: Gap di silenzio
**Causa**: Pause troppo lunghe tra segmenti
**Fix**: Riduci pause in post-processing

### Problema: Volume inconsistente
**Causa**: Settings voce diversi tra segmenti
**Fix**: Normalizza con ffmpeg o audacity

### Problema: Musica copre voce
**Causa**: Volume musica troppo alto
**Fix**: Riduci a -20dB o -24dB

### Problema: Artefatti audio
**Causa**: Compressione eccessiva o TTS bug
**Fix**: Rigenera segmento o usa bitrate piu' alto

---

## Tools per QC

### ffmpeg (analisi)
```bash
# Analizza loudness
ffmpeg -i audiobook.mp3 -af loudnorm=print_format=json -f null -

# Verifica peak
ffmpeg -i audiobook.mp3 -af "volumedetect" -f null -

# Check durata
ffprobe -v error -show_entries format=duration -of csv=p=0 audiobook.mp3
```

### Audacity (visual)
- Apri file
- View > Show Clipping
- Analyze > Contrast (verifica loudness)
- Effect > Normalize se necessario

### Online Tools
- **Loudness Penalty**: loudnesspenalty.com
- **Audio Analyzer**: audioanalyzer.lacl.nl

---

## Sign-Off

Prima di pubblicare, conferma:

```
AUDIOBOOK QC SIGN-OFF
=====================
Titolo: _______________
Data QC: ______________
QC By: ________________

[x] Tutti i check passati
[x] Listening test completato
[x] Specifiche tecniche verificate
[x] Metadata corretti
[x] Pronto per pubblicazione

Note: _________________
```

---

## Post-Publish

Dopo la pubblicazione:

1. **Verifica su piattaforma**
   - [ ] File caricato correttamente
   - [ ] Preview funziona
   - [ ] Metadata visibili

2. **Test su device**
   - [ ] Mobile (iOS/Android)
   - [ ] Desktop
   - [ ] Smart speaker (se applicabile)

3. **Archivia**
   - [ ] Backup master files
   - [ ] Documenta in OndePRDB
   - [ ] Aggiorna catalogo

---

## Emergency Fixes

Se trovi problemi dopo la pubblicazione:

### Fix minore (typo, small glitch)
1. Rigenera solo il segmento problematico
2. Sostituisci nel master
3. Re-export e ri-carica

### Fix maggiore (capitolo intero)
1. Rimuovi dalla piattaforma
2. Correggi e rigenera
3. QC completo
4. Ri-pubblica

### Disastro (problema grave)
1. Rimuovi immediatamente
2. Notifica utenti se necessario
3. Fix completo
4. QC extra rigoroso
5. Ri-pubblica con nota

---

*Documento creato: 2026-01-09*
*Onde Audiobook Factory - Quality Assurance*
