# Suno AI Music Pipeline - Onde Lounge

> Pipeline per generare musica AI con Suno per il canale YouTube "Onde Lounge"
> Generi: lofi beats, ambient, ninne nanne, relaxation music

---

## Quick Start

1. Vai su [suno.com](https://suno.com)
2. Scegli un prompt dalla libreria (`suno-prompts/`)
3. Genera la traccia (2-4 minuti)
4. Esegui il QC (`quality-checklist.md`)
5. Scarica e organizza secondo le convenzioni

---

## Struttura Cartelle

```
tools/music-ai/
├── README.md                 # Questo file
├── suno-prompts/
│   ├── ninne-nanne.md       # Prompts per ninne nanne italiane
│   ├── lofi-beats.md        # Prompts per lo-fi/study music
│   ├── ambient.md           # Prompts per ambient/nature
│   └── relaxing.md          # Prompts per relaxation/spa
├── scripts/
│   └── batch-generate.md    # Workflow per generazione batch
└── quality-checklist.md     # QC prima di pubblicare
```

---

## Licenza Suno AI (Gennaio 2026)

### IMPORTANTE - Leggi prima di usare!

**Tier PRO/PREMIER (abbonamento attivo):**
- Uso commerciale PERMESSO
- Puoi pubblicare su YouTube, Spotify, etc.
- Tieni 100% dei ricavi
- NON sei "proprietario" - hai una licenza perpetua

**Tier FREE:**
- Solo uso personale/non commerciale
- NON puoi monetizzare
- NON puoi usare per Onde Lounge

**Limitazioni:**
- I brani NON sono protetti da copyright (US Copyright Office)
- Suno non garantisce unicita del brano
- Se qualcuno copia il tuo brano, hai poca tutela legale
- Suno puo usare i tuoi input per training

**Raccomandazione Onde:**
- Usare SEMPRE account PRO/PREMIER
- Modificare i brani (aggiungere elementi, mixare) per maggiore tutela
- Documentare tutto il processo creativo
- Considerare di aggiungere elementi originali (voiceover, effetti)

Fonte: [Suno Terms of Service](https://suno.com/terms-of-service)

---

## Anatomia di un Prompt Suno

Un buon prompt Suno ha 4 componenti:

### 1. Genre & Style
```
Lo-fi, Ambient, Lullaby, Chill, Jazz, Classical, Electronic
```

### 2. Mood & Emotion
```
Peaceful, Dreamy, Nostalgic, Warm, Cozy, Serene, Melancholic
```

### 3. Instrumentation
```
Piano, Guitar, Synth pads, Music box, Strings, Harp, Rhodes
```

### 4. Production Style
```
Tape saturation, Reverb-heavy, Vinyl crackle, Soft, Intimate
```

### Meta Tags Suno
```
[Intro] [Verse] [Chorus] [Bridge] [Outro]
[Instrumental]
[Soft vocals] [Female vocals] [Male vocals]
[BPM: 70] [Key: C Major]
```

---

## Workflow Consigliato

### Per Video YouTube Onde Lounge

1. **Scegli categoria** (Study, Sleep, Nature, Meditation)
2. **Seleziona 3-5 prompts** dalla libreria
3. **Genera varianti** (4 per prompt = 12-20 tracce)
4. **QC ogni traccia** (checklist)
5. **Seleziona le migliori** (3-5 per video)
6. **Estendi a 2-4 ore** (loop seamless in editor)
7. **Mix finale** con transizioni smooth

### Naming Convention

```
[CATEGORIA]-[NUMERO]-[DESCRIZIONE]-v[VERSIONE].mp3

Esempi:
lofi-001-rainy-study-v1.mp3
ninna-002-stella-stellina-v2.mp3
ambient-003-morning-mist-v1.mp3
relax-001-spa-piano-v1.mp3
```

### Cartelle Output

```
content/music/
├── lofi/
├── ninne-nanne/
├── ambient/
└── relaxing/
```

---

## Esempio: Stella Stellina (ninna-001)

Questo prompt ha funzionato per la ninna nanna "Stella Stellina":

```
Italian lullaby, gentle music box melody, soft piano accompaniment,
warm maternal vocals humming, 60 BPM, dreamy atmosphere,
vintage Italian nursery rhyme feel, soft strings in background,
tape warmth, cozy bedtime mood
[Instrumental] [Key: G Major]
```

**Risultato:** Traccia usata per video YouTube "Stella Stellina - Sleep Music"

---

## Tips & Best Practices

### DO (Fai)
- Sii specifico ma conciso (150-250 caratteri)
- Usa riferimenti musicali ("vintage Italian", "Beatrix Potter era")
- Specifica BPM per consistenza (60-80 per sleep, 80-100 per lofi)
- Genera multiple varianti e scegli la migliore
- Testa il loop prima di estendere

### DON'T (Non fare)
- Prompt troppo lunghi o vaghi
- Usare tracce FREE per contenuti commerciali
- Pubblicare senza QC
- Ignorare il volume/loudness (normalizza a -14 LUFS)
- Dimenticare i fade in/out

---

## Risorse

- [Suno.com](https://suno.com) - Piattaforma principale
- [HowToPromptSuno.com](https://howtopromptsuno.com/) - Guida prompts
- [Suno Terms](https://suno.com/terms-of-service) - Termini di servizio
- [YouTube Lounge Plan](/YOUTUBE-LOUNGE-PLAN.md) - Piano canale

---

## Integrazione con Onde Lounge

Ogni traccia generata deve essere:

1. **Coerente con brand Onde** - Atmosfera calda, elegante, italiana
2. **Abbinabile a illustrazioni** - Stile acquarello europeo
3. **Adatta a video lunghi** - Loopable, no elementi disturbanti
4. **Normalizzata** - -14 LUFS per YouTube

---

*Documento creato: 9 Gennaio 2026*
*Task: music-ai-001*
*Autore: Code Worker (Fabbrica Onde)*
