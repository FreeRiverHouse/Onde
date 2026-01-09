# Batch Generation Workflow - Suno AI

> Istruzioni per generare musica in batch per Onde Lounge
> Workflow ottimizzato per produzione video YouTube

---

## Overview

Questo documento descrive come generare efficientemente multiple tracce
per un singolo video YouTube (tipicamente 3-5 tracce per video di 2-4 ore).

---

## Workflow Completo

### Fase 1: Pianificazione (5 min)

1. **Scegli il tipo di video** da produrre
   - Study/Focus
   - Sleep/Bedtime
   - Nature/Seasons
   - Meditation

2. **Seleziona 4-5 prompts** dalla libreria appropriata
   ```
   suno-prompts/
   ├── ninne-nanne.md  → Sleep
   ├── lofi-beats.md   → Study
   ├── ambient.md      → Nature/Meditation
   └── relaxing.md     → General calm
   ```

3. **Prepara la lista** dei prompts scelti in un file di testo

---

### Fase 2: Generazione su Suno (30-45 min)

#### Step-by-Step

1. **Apri Suno.com** e accedi con account PRO/PREMIER

2. **Per ogni prompt:**
   - Clicca "Create"
   - Incolla il prompt
   - Imposta "Instrumental" se necessario
   - Clicca "Generate"
   - Aspetta 1-2 minuti per la generazione

3. **Genera 4 varianti per prompt**
   - Suno genera 2 tracce per richiesta
   - Fai 2 richieste per prompt = 4 varianti
   - Totale: 5 prompts x 4 varianti = 20 tracce

4. **Naming durante ascolto**
   - Ascolta ogni traccia
   - Segna quelle buone con stella/like
   - Prendi nota del rating (1-5)

---

### Fase 3: Selezione (15 min)

1. **Riascolta le tracce migliori** (rating 4-5)

2. **Criteri di selezione:**
   - [ ] Loop-friendly (inizio/fine compatibili)
   - [ ] No glitch o artefatti audio
   - [ ] Coerenza stilistica tra tracce
   - [ ] Volume simile tra tracce
   - [ ] Mood adatto al video

3. **Seleziona le top 3-5 tracce** per il video

---

### Fase 4: Download e Organizzazione (10 min)

1. **Scarica le tracce selezionate**
   - Click destro → Download
   - Formato: MP3 o WAV (preferire WAV per editing)

2. **Rinomina secondo convenzione:**
   ```
   [CATEGORIA]-[NUMERO]-[DESCRIZIONE]-v[VERSIONE].mp3

   Esempi:
   lofi-001-rainy-study-v1.mp3
   ninna-002-stella-stellina-v2.mp3
   ambient-003-morning-mist-v1.mp3
   ```

3. **Sposta nella cartella corretta:**
   ```
   content/music/
   ├── lofi/
   ├── ninne-nanne/
   ├── ambient/
   └── relaxing/
   ```

---

### Fase 5: QC Audio (10 min)

Esegui il controllo qualita usando `quality-checklist.md`:

- [ ] Nessun glitch o clipping
- [ ] Volume normalizzato (-14 LUFS)
- [ ] Loop seamless testato
- [ ] Durata minima 2 minuti
- [ ] Coerenza con altre tracce

---

## Esempio Pratico: Video "Cozy Italian Study Room"

### Input
- **Tipo video**: Study/Focus 2h
- **Categoria**: lofi-beats + ambient mix
- **Tracce necessarie**: 4

### Prompts Selezionati

1. **Italian Cafe Lo-Fi** (lofi-beats.md #3)
2. **Rainy Window Study** (lofi-beats.md #2)
3. **Italian Countryside Twilight** (ambient.md #3)
4. **Library Whispers** (lofi-beats.md #6)

### Generazione

| Prompt | Varianti | Selezionate |
|--------|----------|-------------|
| Italian Cafe | 4 | 2 |
| Rainy Window | 4 | 1 |
| Italian Twilight | 4 | 1 |
| Library | 4 | 1 |
| **Totale** | **16** | **5** |

### Output Finale

```
content/music/lofi/
├── lofi-italian-cafe-001-v1.wav
├── lofi-italian-cafe-001-v2.wav
├── lofi-rainy-window-002-v1.wav
└── lofi-library-003-v1.wav

content/music/ambient/
└── ambient-italian-twilight-001-v1.wav
```

---

## Tips per Efficienza

### Parallelizzazione

1. **Apri 3-4 tab Suno** in parallelo
2. Mentre una genera, prepara la prossima
3. Rotazione: Tab1 genera → Tab2 genera → Tab3 genera → Tab1 pronta

### Batch Session

- Dedica 1-2 ore per settimana alla generazione
- Genera tracce per 3-4 video insieme
- Evita sessioni troppo lunghe (fatica d'ascolto)

### Template di Sessione

```markdown
## Session: [DATA]

### Video 1: [TITOLO]
- Prompt A: [ ] generato [ ] scaricato
- Prompt B: [ ] generato [ ] scaricato
- Prompt C: [ ] generato [ ] scaricato

### Video 2: [TITOLO]
...
```

---

## Tracking Generazione

Usa questo template per tracciare le sessioni:

```markdown
## Batch Session Log

**Data**: YYYY-MM-DD
**Account Suno**: [email]
**Crediti usati**: XX/YY

| Video Target | Prompt | Varianti | Rating | File |
|--------------|--------|----------|--------|------|
| Study Room | Italian Cafe | 4 | 4.5 | lofi-001-v1 |
| Study Room | Rainy Window | 4 | 3.8 | - |
| ... | ... | ... | ... | ... |

**Note**: ...
```

---

## Estensione Tracce per Video Lunghi

### Loop Seamless in DaVinci Resolve

1. Importa la traccia (2-4 min)
2. Copia e incolla per raggiungere durata (es. 2 ore)
3. Applica crossfade di 5-10 sec tra copie
4. Esporta audio finale

### Mix di Tracce Multiple

1. Importa 3-5 tracce selezionate
2. Alterna in sequenza con crossfade
3. Mantieni volume consistente (-14 LUFS)
4. Evita transizioni brusche

---

## Limiti Suno (Gennaio 2026)

| Piano | Generazioni/mese | Note |
|-------|------------------|------|
| Free | 50 | NO uso commerciale |
| Pro | 500 | Uso commerciale OK |
| Premier | 2000 | Uso commerciale OK |

**Per Onde Lounge**: Piano PRO sufficiente per ~25 video/mese

---

## Checklist Pre-Batch

- [ ] Account Suno PRO/PREMIER attivo
- [ ] Lista prompts preparata
- [ ] Cartelle output create
- [ ] Spazio disco sufficiente (~50MB per traccia WAV)
- [ ] DaVinci/Audacity pronto per editing

---

*Creato: 9 Gennaio 2026*
*Per: Onde Lounge YouTube Channel*
