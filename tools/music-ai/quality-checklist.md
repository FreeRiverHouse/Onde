# Quality Checklist - Suno AI Music

> Checklist di controllo qualita prima di pubblicare musica su Onde Lounge
> Da eseguire per OGNI traccia prima dell'uso in video

---

## Quick Check (30 sec per traccia)

- [ ] **No glitch audio** - Nessun click, pop, o artefatto
- [ ] **No clipping** - Nessuna distorsione da volume troppo alto
- [ ] **Durata OK** - Minimo 2 minuti
- [ ] **Loop-friendly** - Fine compatibile con inizio

---

## Checklist Completa

### 1. Qualita Audio

| Check | Criterio | Pass/Fail |
|-------|----------|-----------|
| [ ] | Nessun glitch o artefatto AI | |
| [ ] | Nessun clipping (picchi > 0 dB) | |
| [ ] | Nessun rumore di fondo indesiderato | |
| [ ] | Bass non fangoso o troppo boomy | |
| [ ] | Alti non troppo harsh o sibilanti | |
| [ ] | Mix bilanciato tra strumenti | |

### 2. Volume e Loudness

| Check | Criterio | Valore Target |
|-------|----------|---------------|
| [ ] | Loudness integrata | -14 LUFS |
| [ ] | True Peak | Max -1 dB |
| [ ] | Loudness Range | 4-8 LU |
| [ ] | Volume consistente per tutta la traccia | |

**Come verificare in Audacity:**
1. Analyze → Contrast → Measure Selection
2. O usa plugin LUFSMeter

**Come normalizzare:**
```
Effect → Loudness Normalization → -14 LUFS
```

### 3. Loop Test

| Check | Criterio | Pass/Fail |
|-------|----------|-----------|
| [ ] | Crossfade 5 sec funziona | |
| [ ] | Nessun cambio brusco al loop | |
| [ ] | Tonalita compatibile inizio/fine | |
| [ ] | Tempo consistente | |

**Test pratico:**
1. Apri in editor (Audacity/DaVinci)
2. Copia traccia e attacca alla fine
3. Applica crossfade 5-10 sec
4. Ascolta la transizione

### 4. Coerenza Stilistica

| Check | Criterio | Pass/Fail |
|-------|----------|-----------|
| [ ] | Adatta al tipo di video (study/sleep/etc) | |
| [ ] | Coerente con altre tracce del video | |
| [ ] | Mood adatto al brand Onde | |
| [ ] | Non troppo energetica per relax | |
| [ ] | Non troppo lenta per studio | |

### 5. Metadata

| Check | Criterio | Valore |
|-------|----------|--------|
| [ ] | Nome file corretto | `[cat]-[num]-[desc]-v[ver].mp3` |
| [ ] | Cartella corretta | `content/music/[categoria]/` |
| [ ] | BPM annotato | |
| [ ] | Key annotata | |
| [ ] | Prompt originale salvato | |

---

## Red Flags - NON USARE SE:

### Audio

- Glitch robotici o "bubbly" sounds (artefatto AI comune)
- Transizioni brusche nel mezzo della traccia
- Strumenti che suonano "sintetici" in modo evidente
- Voci che emergono quando non richieste
- Distorsione o clipping udibile

### Contenuto

- Melodia troppo riconoscibile (possibile copyright issue)
- Elementi che potrebbero essere sample di altri artisti
- Lyrics accidentali quando richiesto instrumental
- Suoni inappropriati per il contesto

### Tecnico

- Durata troppo breve (< 1.5 min)
- Volume troppo basso o alto rispetto alle altre tracce
- Frequenze mancanti (bass o alti tagliati)

---

## Rating System

| Rating | Descrizione | Azione |
|--------|-------------|--------|
| 5 | Eccellente, pronta per uso | Usa direttamente |
| 4 | Buona, minor fix opzionali | Usa con piccoli edit |
| 3 | Media, richiede editing | Valuta se vale la pena |
| 2 | Sotto standard | Rigenera |
| 1 | Inutilizzabile | Elimina |

---

## Workflow QC

```
1. Ascolto rapido (skip ogni 30 sec)
   → Check glitch evidenti
   → Check mood generale

2. Ascolto completo
   → Check qualita audio dettagliata
   → Check coerenza stilistica

3. Test tecnico
   → Loudness meter
   → Loop test

4. Rating finale
   → Assegna 1-5
   → Annota note se necessario

5. Decisione
   → Rating >= 4: Salva e usa
   → Rating 3: Considera editing
   → Rating <= 2: Elimina e rigenera
```

---

## Tools Consigliati

### Gratuiti

| Tool | Uso | Link |
|------|-----|------|
| Audacity | Editing base, loudness | audacityteam.org |
| DaVinci Resolve | Video editing, audio | blackmagicdesign.com |
| YOULEAN Loudness Meter | Misurazione LUFS | youlean.co |

### Pro (se necessario)

| Tool | Uso |
|------|-----|
| iZotope RX | Rimozione glitch, repair |
| FabFilter Pro-L2 | Limiting preciso |
| Ozone | Mastering completo |

---

## Template Log QC

```markdown
## QC Log - [DATA]

### Traccia: [NOME FILE]
- **Prompt originale**: [PROMPT]
- **Durata**: X:XX
- **BPM**: XX
- **Key**: X Major/Minor

### Checks
- [ ] No glitch
- [ ] No clipping
- [ ] Loudness -14 LUFS
- [ ] Loop OK
- [ ] Stile coerente

### Rating: X/5

### Note:
[Eventuali problemi o osservazioni]

### Decisione: [ ] USA / [ ] EDIT / [ ] ELIMINA
```

---

## Checklist Finale Pre-Pubblicazione

Prima di usare una traccia in un video YouTube:

- [ ] QC passato con rating >= 4
- [ ] Loudness normalizzato a -14 LUFS
- [ ] Loop testato e funzionante
- [ ] File nominato correttamente
- [ ] Salvato nella cartella corretta
- [ ] Prompt originale documentato
- [ ] Account Suno PRO/PREMIER verificato (uso commerciale)

---

## Note Legali

Ricorda che per uso commerciale (YouTube monetizzato):

1. **DEVI** avere account Suno PRO o PREMIER
2. **NON** hai copyright sulla traccia (solo licenza d'uso)
3. **DOCUMENTA** tutto il processo creativo
4. **CONSIDERA** di aggiungere elementi originali per maggiore tutela

---

*Creato: 9 Gennaio 2026*
*Per: Onde Lounge YouTube Channel*
