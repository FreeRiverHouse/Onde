# Lip Sync Tool - Onde Video Factory

Sistema di lip sync locale per Mac Apple Silicon (M1/M2/M3).
**Zero costi cloud** - tutto gira localmente sul tuo Mac.

## Architettura

Il sistema usa Easy-Wav2Lip installato su un **SSD esterno** per risparmiare spazio sul disco interno.

```
/Volumes/DATI-SSD/onde-ai/lip-sync/Easy-Wav2Lip/  <-- Installazione completa
    ├── venv/                                       <-- Python environment
    ├── checkpoints/                                <-- Model weights
    └── inference.py                                <-- Main script

/Users/mattia/Projects/Onde/tools/lip-sync/        <-- Wrapper scripts
    ├── lip_sync.py                                 <-- Comando principale
    └── output/                                     <-- Video generati
```

## Quick Start

```bash
# 1. Assicurati che l'SSD DATI-SSD sia collegato!

# 2. Scarica il modello (una volta sola - vedi sotto)

# 3. Usa!
python lip_sync.py --face gianni.jpg --audio storia.mp3 --output video.mp4
```

## Prerequisiti

1. **SSD Esterno collegato** (`DATI-SSD`)
2. **Modello wav2lip scaricato** (vedi sotto)
3. **FFmpeg** installato (`brew install ffmpeg`)

## Download Modelli (OBBLIGATORIO)

Il modello `wav2lip.pth` nel repository ha solo 9 bytes (placeholder).
Devi scaricare il modello vero da Google Drive:

| Modello | Size | Caratteristiche | Link |
|---------|------|-----------------|------|
| **wav2lip_gan.pth** | ~400MB | Labbra chiare, consigliato | [Download](https://drive.google.com/file/d/13Ktexq-nZOsAxqrTdMh3Q0ntPB3yiBtv/view) |
| wav2lip.pth | ~400MB | Piu' preciso, labbra sfocate | [Download](https://drive.google.com/file/d/1qKU8HG8dR4nW4LvCqpEYmSy6LLpVkZ21/view) |

**Dopo il download**, posiziona il file in:
```
/Volumes/DATI-SSD/onde-ai/lip-sync/Easy-Wav2Lip/checkpoints/
```

## Utilizzo

### Comando principale

```bash
# Da immagine + audio -> video parlante
python lip_sync.py --face gianni.jpg --audio storia.mp3 --output video.mp4

# Con qualita' migliore (piu' lento)
python lip_sync.py --face gianni.jpg --audio storia.mp3 --output video.mp4 --quality enhanced

# Verifica setup
python lip_sync.py --check
```

### Opzioni

| Parametro | Descrizione |
|-----------|-------------|
| `--face, -f` | Immagine o video con il viso |
| `--audio, -a` | File audio (mp3, wav, etc.) |
| `--output, -o` | File video output (mp4) |
| `--quality` | fast, improved (default), enhanced |
| `--check` | Solo verifica setup |

### Qualita'

| Livello | Tempo | Qualita' |
|---------|-------|----------|
| fast | ~1 min | Base |
| improved | ~2-3 min | Buona (default) |
| enhanced | ~5-10 min | Alta |

## Esempi Onde

### Gianni Parola racconta una storia

```bash
python lip_sync.py \
    --face /Users/mattia/Projects/Onde/assets/gianni-parola.jpg \
    --audio /Users/mattia/Projects/Onde/content/audio/stella-stellina.mp3 \
    --output gianni-stella-stellina.mp4
```

### Pina Pennello presenta un libro

```bash
python lip_sync.py \
    --face /Users/mattia/Projects/Onde/assets/pina-pennello.jpg \
    --audio /Users/mattia/Projects/Onde/content/audio/pina-presenta-aiko.mp3 \
    --output pina-presenta-aiko.mp4
```

## Uso Diretto Easy-Wav2Lip

Se preferisci usare Easy-Wav2Lip direttamente:

```bash
# Attiva environment
cd /Volumes/DATI-SSD/onde-ai/lip-sync/Easy-Wav2Lip
source venv/bin/activate

# Esegui inference
python inference.py --face input.jpg --audio input.wav --outfile output.mp4
```

## Troubleshooting

### "External SSD not found"

1. Collega il drive DATI-SSD
2. Attendi che si monti
3. Verifica: `ls /Volumes/DATI-SSD/`

### "Model weights not found"

Scarica il modello da Google Drive (link sopra) e posizionalo in:
```
/Volumes/DATI-SSD/onde-ai/lip-sync/Easy-Wav2Lip/checkpoints/
```

### Video output nero

1. Assicurati che l'immagine abbia un viso ben visibile
2. Prova un'immagine a risoluzione piu' alta (min 256x256)
3. Il viso deve essere frontale o quasi frontale

### Errore Python

Se ci sono errori di dipendenze:
```bash
cd /Volumes/DATI-SSD/onde-ai/lip-sync/Easy-Wav2Lip
source venv/bin/activate
pip install -r requirements.txt
```

## Workflow Video Factory

Per uso batch notturno (mentre dormi):

1. Aggiungi jobs alla queue:
   ```bash
   echo "gianni.jpg|storia.mp3|gianni-storia.mp4" >> queue/jobs.txt
   ```

2. Il cron job notturno processera' la coda

3. Al mattino trovi i video in `output/`

## Performance

| Mac | Video 30s | Video 1min |
|-----|-----------|------------|
| M1 8GB | ~3-4 min | ~6-8 min |
| M2 16GB | ~2-3 min | ~4-5 min |
| M3 | ~1-2 min | ~3-4 min |

**Nota**: Enhanced quality richiede ~2x tempo.

## Risorse

- [Easy-Wav2Lip](https://github.com/anothermartz/Easy-Wav2Lip)
- [Wav2Lip Paper](https://arxiv.org/abs/2008.10010)
- [Lip Sync Setup Guide](./SETUP-GUIDE.md)

---

*Parte di Onde Video Factory - Far fiorire il mondo attraverso storie che parlano.*
