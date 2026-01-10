# Podcast Factory Pipeline Template

**Onde Publishing - Podcast Production**
**Host**: Gianni Parola
**Versione**: 1.0 (2026-01-10)

---

## 1. STRUTTURA EPISODIO STANDARD

### Durata Totale: 10-15 minuti (target ottimale per bambini e famiglie)

| Sezione | Durata | Descrizione |
|---------|--------|-------------|
| **Intro Jingle** | 0:10-0:15 | Jingle Onde + saluto Gianni |
| **Apertura** | 0:30-1:00 | Presentazione tema episodio |
| **Contenuto Principale** | 8-12 min | Storia/lettura/contenuto |
| **Momento Riflessione** | 1:00-2:00 | Domande per i piccoli ascoltatori |
| **Outro** | 0:20-0:30 | Saluto + anticipazione prossimo episodio |
| **Outro Jingle** | 0:10 | Jingle Onde closing |

### Breakdown Dettagliato

```
[00:00] INTRO JINGLE
        - Musica: Jingle Onde (onde-jingle-intro.mp3)
        - Durata: 10-15 secondi
        - Fade out sotto voce Gianni

[00:15] APERTURA GIANNI
        - "Ciao piccoli amici! Sono Gianni Parola..."
        - Presentazione tema
        - Musica ambient sotto (volume -18dB)

[01:00] CONTENUTO PRINCIPALE
        - Lettura/narrazione storia
        - Pause naturali per respiro
        - Musica ambient continua (volume -24dB)

[09:00] MOMENTO RIFLESSIONE
        - "E voi, piccoli amici, cosa ne pensate?"
        - 2-3 domande aperte
        - Pausa per far pensare

[11:00] OUTRO
        - "Alla prossima storia..."
        - Anticipazione prossimo episodio
        - Ringraziamenti

[11:30] OUTRO JINGLE
        - Fade in jingle Onde
        - Dissolvenza finale
```

---

## 2. TEMPLATE SCRIPT - GIANNI PAROLA

### Header Script

```markdown
# [TITOLO EPISODIO]
**Serie**: [Nome Serie - es. "Storie della Buonanotte"]
**Episodio**: [Numero] di [Totale Stagione]
**Durata Target**: [X] minuti
**Data Registrazione**: [YYYY-MM-DD]
**Autore Originale**: [Se applicabile]

---

## NOTE TECNICHE
- Tono: Caldo, sornione, rassicurante
- Ritmo: Lento, pause naturali
- Enfasi: Parole chiave sottolineate
- Respiri: Indicati con [respiro]

---
```

### Corpo Script

```markdown
## INTRO (0:15)

[JINGLE ONDE - 10 sec, fade out]

[voce calda, sorriso nella voce]
Ciao piccoli amici! Sono Gianni Parola, e questa sera vi porto
in un viaggio... [respiro] un viaggio fatto di parole e meraviglia.

[pausa 2 sec]

Oggi vi racconto: "[TITOLO STORIA]"

[musica ambient entra, volume basso]

---

## CONTENUTO (8-12 min)

[ritmo narrativo, varia tono in base al contenuto]

[TESTO STORIA/CONTENUTO]

[Indicazioni per enfasi]:
- **grassetto** = enfatizzare
- _corsivo_ = tono sognante
- [pausa X sec] = silenzio
- [respiro] = respiro udibile
- [sorride] = sorriso nella voce
- [sussurra] = abbassa volume
- [entusiasmo] = energia nella voce

---

## RIFLESSIONE (1-2 min)

[tono intimo, come se parlasse a ciascun bambino]

E voi, piccoli amici... [pausa 2 sec]

Cosa vi e' piaciuto di piu' di questa storia?
[pausa 3 sec]

Se foste voi [PERSONAGGIO], cosa avreste fatto?
[pausa 3 sec]

[respiro profondo]

---

## OUTRO (0:30)

[tono caldo, rassicurante]

E con questo, piccoli sognatori, vi saluto.
Alla prossima storia... [pausa]
che sara' ancora piu' bella.

[sorride]
Buonanotte, e sogni d'oro.

[JINGLE ONDE CLOSING - fade in, 10 sec]

---
```

### Esempio Script Completo

```markdown
# La Notte delle Lucciole
**Serie**: Storie della Buonanotte
**Episodio**: 1 di 10
**Durata Target**: 12 minuti
**Data Registrazione**: 2026-01-15

---

## INTRO

[JINGLE ONDE - fade out]

[voce calda]
Ciao piccoli amici! Sono Gianni Parola.

[pausa 1 sec]

Stasera, mentre le stelle si accendono una a una nel cielo...
vi porto in un prato dove [sussurra] le lucciole danzano.

[musica ambient: "night-meadow-gentle.mp3"]

---

## CONTENUTO

C'era una volta un prato, ai piedi di una collina...
[pausa 2 sec]

Un prato dove, quando il sole andava a dormire,
accadeva qualcosa di **magico**.

[...]
```

---

## 3. MUSICA DI BACKGROUND

### Libreria Audio Consigliata

| Categoria | Uso | File/Fonte | Durata |
|-----------|-----|------------|--------|
| **Jingle Intro** | Apertura episodio | onde-jingle-intro.mp3 | 10-15 sec |
| **Jingle Outro** | Chiusura episodio | onde-jingle-outro.mp3 | 10 sec |
| **Ambient Notte** | Storie buonanotte | night-ambient-soft.mp3 | Loop 5 min |
| **Ambient Giorno** | Storie avventura | day-ambient-nature.mp3 | Loop 5 min |
| **Ambient Magia** | Momenti fantastici | magic-sparkle-ambient.mp3 | Loop 3 min |
| **Transizione** | Cambio scena | transition-gentle.mp3 | 3 sec |

### Specifiche Tecniche Musica

| Parametro | Valore |
|-----------|--------|
| **Format** | MP3 320kbps o WAV |
| **Sample Rate** | 44.1 kHz |
| **Canali** | Stereo |
| **Loudness Musica** | -24 LUFS (sotto voce) |
| **Fade In/Out** | 2-3 secondi |

### Stile Musicale Onde

**APPROVATO:**
- Strumenti acustici (pianoforte, archi, chitarra classica)
- Melodie semplici, rassicuranti
- Toni caldi (no sintetizzatori freddi)
- Natura: suoni di ruscello, vento leggero, grilli (opzionale)

**VIETATO:**
- Musica elettronica/EDM
- Percussioni forti
- Suoni stridenti o improvvisi
- Musica con copyright (usa solo royalty-free o creata ad hoc)

### Fonti Musica Royalty-Free

1. **Pixabay Music** (gratuito) - pixabay.com/music
2. **Free Music Archive** (gratuito) - freemusicarchive.org
3. **Epidemic Sound** (abbonamento) - epidemicsound.com
4. **Artlist** (abbonamento) - artlist.io

---

## 4. FORMATO AUDIO OUTPUT

### Specifiche Master Finale

| Parametro | Spotify | Apple Podcasts | YouTube |
|-----------|---------|----------------|---------|
| **Formato** | MP3 | MP3 | MP3/M4A |
| **Bitrate** | 128-320 kbps | 128-320 kbps | 256+ kbps |
| **Sample Rate** | 44.1 kHz | 44.1 kHz | 48 kHz |
| **Canali** | Mono (voce) / Stereo | Mono/Stereo | Stereo |
| **Loudness** | -14 LUFS | -16 LUFS | -14 LUFS |
| **True Peak** | -1 dB | -1 dB | -1 dB |

### Export Multi-Piattaforma

```bash
# Script FFmpeg per export multi-formato
# Input: master.wav (48kHz, stereo)

# Spotify (-14 LUFS)
ffmpeg -i master.wav -af "loudnorm=I=-14:TP=-1:LRA=11" \
  -ar 44100 -b:a 192k spotify-episode.mp3

# Apple Podcasts (-16 LUFS)
ffmpeg -i master.wav -af "loudnorm=I=-16:TP=-1:LRA=11" \
  -ar 44100 -b:a 160k apple-episode.mp3

# YouTube (-14 LUFS, 48kHz)
ffmpeg -i master.wav -af "loudnorm=I=-14:TP=-1:LRA=11" \
  -ar 48000 -b:a 256k youtube-episode.mp3
```

### Naming Convention

```
[SERIE]-S[STAGIONE]E[EPISODIO]-[TITOLO-BREVE]-[PIATTAFORMA].mp3

Esempi:
buonanotte-S01E01-lucciole-spotify.mp3
buonanotte-S01E01-lucciole-apple.mp3
piccole-rime-S01E03-stella-stellina-youtube.mp3
```

---

## 5. WORKFLOW BATCH - GENERAZIONE MULTIPLA

### Pipeline Automatizzata

```
┌─────────────────────────────────────────────────────────────┐
│                    PODCAST FACTORY PIPELINE                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. PREPARAZIONE                                             │
│     ├── Carica testi in /content/podcast/scripts/           │
│     ├── Verifica formato script (template Gianni)           │
│     └── Prepara musica in /content/podcast/audio/           │
│                                                              │
│  2. GENERAZIONE AUDIO                                        │
│     ├── ElevenLabs API (voce Gianni)                        │
│     ├── Parametri: stability=0.5, similarity=0.75           │
│     └── Output: /output/podcast/raw/                        │
│                                                              │
│  3. POST-PRODUZIONE                                          │
│     ├── Aggiunta jingle intro/outro                         │
│     ├── Mix musica background                               │
│     ├── Normalizzazione loudness                            │
│     └── Output: /output/podcast/master/                     │
│                                                              │
│  4. EXPORT MULTI-PIATTAFORMA                                 │
│     ├── Spotify version (-14 LUFS)                          │
│     ├── Apple Podcasts (-16 LUFS)                           │
│     └── Output: /output/podcast/distribution/               │
│                                                              │
│  5. METADATA & UPLOAD                                        │
│     ├── Genera metadata (titolo, descrizione, artwork)      │
│     ├── Upload su hosting (Spotify for Podcasters)          │
│     └── Notifica Telegram per review                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Script Node.js per Batch

```javascript
// scripts/factory/generate-podcast-batch.js

const config = {
  inputDir: 'content/podcast/scripts/',
  outputDir: '/Volumes/DATI-SSD/onde-output/podcast/',
  elevenLabsVoice: 'gianni-parola-voice-id',
  jingleIntro: 'content/podcast/audio/onde-jingle-intro.mp3',
  jingleOutro: 'content/podcast/audio/onde-jingle-outro.mp3',
  ambientDefault: 'content/podcast/audio/night-ambient-soft.mp3'
};

async function processBatch(episodeList) {
  for (const episode of episodeList) {
    console.log(`Processing: ${episode.title}`);

    // 1. Genera voce
    const voiceAudio = await generateVoice(episode.script);

    // 2. Mix con musica
    const mixedAudio = await mixAudio(voiceAudio, episode.ambient);

    // 3. Aggiungi jingles
    const finalAudio = await addJingles(mixedAudio);

    // 4. Normalizza ed esporta
    await exportMultiPlatform(finalAudio, episode.id);

    // 5. Notifica
    await notifyTelegram(`Episodio ${episode.title} pronto per review`);
  }
}
```

### Batch File di Esempio

```json
// content/podcast/batch/stagione-01.json
{
  "serie": "Storie della Buonanotte",
  "stagione": 1,
  "episodi": [
    {
      "id": "S01E01",
      "titolo": "La Notte delle Lucciole",
      "script": "scripts/buonanotte/s01e01-lucciole.md",
      "ambient": "audio/night-meadow.mp3",
      "durata_target": 12
    },
    {
      "id": "S01E02",
      "titolo": "Il Pesciolino Rosso",
      "script": "scripts/buonanotte/s01e02-pesciolino.md",
      "ambient": "audio/ocean-gentle.mp3",
      "durata_target": 10
    }
  ]
}
```

---

## 6. CHECKLIST PRE-PUBBLICAZIONE SPOTIFY

### Prima di Caricare

#### Contenuto
- [ ] Script revisionato (no errori grammaticali)
- [ ] Testo verificato se da autore reale (regola anti-plagio)
- [ ] Durata episodio conforme (10-15 min)
- [ ] Intro e outro presenti

#### Audio Tecnico
- [ ] Loudness: -14 LUFS (verificato con loudness meter)
- [ ] True Peak: max -1 dB (no clipping)
- [ ] Silenzio iniziale: max 0.5 sec
- [ ] Silenzio finale: 1-2 sec dopo jingle
- [ ] No rumori di fondo, pop, click
- [ ] Musica mixata correttamente (voce sempre in primo piano)

#### Metadata
- [ ] Titolo episodio (max 100 caratteri)
- [ ] Descrizione episodio (500-4000 caratteri)
- [ ] Numero episodio e stagione
- [ ] Artwork episodio (3000x3000px, JPEG/PNG)
- [ ] Tag/Categoria corretti
- [ ] Explicit content: NO (contenuti per bambini)

#### Spotify-Specific
- [ ] ID3 tags compilati (titolo, artista, album, anno)
- [ ] Capitoli/timestamps se episodio > 20 min
- [ ] Link correlati (sito, social)
- [ ] Trascrizione (opzionale ma consigliata)

#### Approvazione
- [ ] Notifica Telegram a Mattia con link preview
- [ ] Attesa OK esplicito prima di pubblicare
- [ ] Screenshot episodio salvato in archivio

### Post-Pubblicazione
- [ ] Verifica episodio live su Spotify
- [ ] Condivisione su @Onde_FRH (senza hashtag)
- [ ] Aggiornamento catalogo episodi
- [ ] Backup file master su SSD esterno

---

## 7. VOCE GIANNI PAROLA - CONFIGURAZIONE ELEVENLABS

### Parametri Voce Consigliati

| Parametro | Valore | Note |
|-----------|--------|------|
| **Stability** | 0.50 | Bilanciato (non troppo robotico, non troppo variabile) |
| **Similarity Boost** | 0.75 | Alta fedelta' alla voce originale |
| **Style** | 0.30 | Leggera espressivita' |
| **Speaker Boost** | ON | Per chiarezza in ambienti rumorosi |

### Tono Vocale Gianni

- **Registro**: Medio-basso, caldo
- **Velocita'**: Lenta (0.9x rispetto a parlato normale)
- **Enfasi**: Pause drammatiche, variazioni di tono
- **Respiri**: Udibili ma non invadenti
- **Sorriso**: Percepibile nella voce

### Script per API ElevenLabs

```javascript
const voiceSettings = {
  voice_id: 'GIANNI_VOICE_ID',
  model_id: 'eleven_multilingual_v2',
  voice_settings: {
    stability: 0.50,
    similarity_boost: 0.75,
    style: 0.30,
    use_speaker_boost: true
  }
};
```

---

## 8. SERIE PODCAST ONDE (PIANIFICATE)

| Serie | Target | Frequenza | Durata Ep. |
|-------|--------|-----------|------------|
| **Storie della Buonanotte** | 3-8 anni | 2x settimana | 10-12 min |
| **Piccole Rime** | 2-6 anni | 1x settimana | 5-8 min |
| **Gianni Racconta** | 5-10 anni | 1x settimana | 15-20 min |
| **Onde Mindful** | Famiglie | 1x settimana | 10 min |

---

## 9. PATH E STRUTTURA FILE

```
/Users/mattia/Projects/Onde/
├── content/
│   └── podcast/
│       ├── scripts/           # Script episodi (.md)
│       │   ├── buonanotte/
│       │   ├── piccole-rime/
│       │   └── gianni-racconta/
│       ├── audio/             # Musica, jingles, ambient
│       │   ├── jingles/
│       │   ├── ambient/
│       │   └── sfx/
│       └── batch/             # File batch per generazione multipla
│
├── scripts/
│   └── factory/
│       └── generate-podcast-batch.js
│
└── /Volumes/DATI-SSD/onde-output/
    └── podcast/
        ├── raw/               # Audio voce grezza
        ├── master/            # Audio finale mixato
        └── distribution/      # File per piattaforme
            ├── spotify/
            ├── apple/
            └── youtube/
```

---

## 10. CONTATTI E RISORSE

- **Spotify for Podcasters**: podcasters.spotify.com
- **ElevenLabs**: elevenlabs.io
- **Bot Telegram Onde**: @OndePR_bot
- **Notifiche a Mattia**: Chat ID 7505631979

---

*Template creato: 2026-01-10*
*Autore: Fabbrica Onde*
*Versione: 1.0*
