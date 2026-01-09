# Guida Completa: TTS Locale su Mac Apple Silicon

> Generazione audio text-to-speech gratuita e locale per audiolibri e podcast

## Indice

1. [Panoramica e Confronto](#panoramica-e-confronto)
2. [Piper TTS](#piper-tts---raccomandato-per-velocita)
3. [Coqui TTS / XTTS-v2](#coqui-tts--xtts-v2---raccomandato-per-qualita)
4. [Bark (Suno)](#bark-suno---naturale-ed-emotivo)
5. [StyleTTS2](#styletts2---alta-qualita)
6. [WhisperSpeech](#whisperspeech)
7. [MLX-Audio](#mlx-audio---nativo-apple-silicon)
8. [Server API Locale](#server-api-locale)
9. [Raccomandazioni Finali](#raccomandazioni-finali)

---

## Panoramica e Confronto

| Tool | Italiano | Qualita Voce | Velocita | API | Facilita Install Mac |
|------|----------|--------------|----------|-----|---------------------|
| **Piper** | Si (limitato) | Media-Buona | Molto veloce | Si | Facile |
| **XTTS-v2** | Si (ottimo) | Eccellente | Media | Si | Media |
| **Bark** | Si | Buona-Ottima | Lenta | Si | Media |
| **StyleTTS2** | No nativo | Eccellente | Media | Limitata | Difficile |
| **WhisperSpeech** | No (in sviluppo) | Ottima | Media | Si | Media |
| **MLX-Audio** | No (limitato) | Buona | Molto veloce | Si | Facile |

### Raccomandazione Rapida

- **Per audiolibri lunghi**: Piper (veloce) o XTTS-v2 (qualita migliore)
- **Per podcast con emozioni**: Bark o XTTS-v2
- **Per massima qualita inglese**: StyleTTS2
- **Per integrazione nativa Apple Silicon**: MLX-Audio

---

## Piper TTS - Raccomandato per Velocita

**Repository**: https://github.com/rhasspy/piper
**Licenza**: MIT

### Caratteristiche

- TTS neurale veloce e leggero
- Funziona completamente offline
- Ottimizzato per basso consumo risorse
- Supporto nativo macOS ARM64 dalla v1.3.0 (Luglio 2025)

### Supporto Italiano

- 2 voci italiane ufficiali (qualita media)
- Voci aggiuntive dalla community: https://huggingface.co/kirys79/piper_italiano
- Il progetto kirys ha creato checkpoint italiani di qualita superiore

### Installazione su Mac Apple Silicon

```bash
# Metodo 1: Via pip (raccomandato)
pip install piper-tts

# Metodo 2: Homebrew + pip
brew install python@3.11
pip3 install piper-tts

# Download modelli italiani
# Visita: https://huggingface.co/rhasspy/piper-voices/tree/main/it/it_IT
# Oppure: https://huggingface.co/kirys79/piper_italiano

# Esempio download voce italiana
mkdir -p ~/.local/share/piper-voices
cd ~/.local/share/piper-voices
wget https://huggingface.co/rhasspy/piper-voices/resolve/main/it/it_IT/riccardo/medium/it_IT-riccardo-medium.onnx
wget https://huggingface.co/rhasspy/piper-voices/resolve/main/it/it_IT/riccardo/medium/it_IT-riccardo-medium.onnx.json
```

### Utilizzo Base

```bash
# Generazione audio da testo
echo "Ciao, questo e un test di sintesi vocale italiana." | \
  piper --model ~/.local/share/piper-voices/it_IT-riccardo-medium.onnx \
  --output_file output.wav

# Conversione file di testo
piper --model ~/.local/share/piper-voices/it_IT-riccardo-medium.onnx \
  --output_file audiobook.wav < libro.txt
```

### Utilizzo Python

```python
import subprocess
import wave

def piper_tts(text: str, output_path: str, model_path: str):
    """Genera audio con Piper TTS"""
    cmd = [
        "piper",
        "--model", model_path,
        "--output_file", output_path
    ]
    process = subprocess.Popen(
        cmd,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    stdout, stderr = process.communicate(input=text.encode('utf-8'))
    return output_path

# Esempio
piper_tts(
    "Benvenuto nel nostro audiolibro.",
    "output.wav",
    "~/.local/share/piper-voices/it_IT-riccardo-medium.onnx"
)
```

### Qualita e Velocita

- **Qualita**: 7/10 per italiano (voci ufficiali), 8/10 (voci kirys)
- **Velocita**: ~10-50x tempo reale su Apple Silicon
- **RAM**: ~500MB - 1GB

---

## Coqui TTS / XTTS-v2 - Raccomandato per Qualita

**Repository**: https://github.com/coqui-ai/TTS
**Modello**: https://huggingface.co/coqui/XTTS-v2
**Licenza**: CPML (non commerciale) / Apache 2.0 (alcune parti)

### Caratteristiche

- Supporto 17 lingue incluso italiano
- Voice cloning da sample audio di 6-30 secondi
- Prosodia naturale ed espressiva
- Streaming audio supportato

### Supporto Italiano

- Italiano pienamente supportato in XTTS-v2
- Voice cloning cross-language funziona bene
- Qualita eccellente per narrazione

### Installazione su Mac Apple Silicon

```bash
# Crea ambiente virtuale
python3 -m venv ~/venvs/coqui-tts
source ~/venvs/coqui-tts/bin/activate

# Installa coqui-tts (fork attivo del progetto originale)
pip install coqui-tts

# Oppure installa con supporto server
pip install coqui-tts[server]

# Verifica installazione
tts --list_models
```

### Risoluzione Problemi Mac

Se incontri errori con `pycrfsuite`:

```bash
# Usa conda come alternativa
conda create -n coqui python=3.10
conda activate coqui
pip install coqui-tts
```

### Utilizzo Base

```bash
# Lista modelli disponibili
tts --list_models

# Genera audio in italiano con XTTS-v2
tts --model_name tts_models/multilingual/multi-dataset/xtts_v2 \
    --language_idx it \
    --text "Questo e un esempio di sintesi vocale in italiano di alta qualita." \
    --out_path output.wav

# Voice cloning (richiede sample audio)
tts --model_name tts_models/multilingual/multi-dataset/xtts_v2 \
    --language_idx it \
    --speaker_wav voce_riferimento.wav \
    --text "Testo da sintetizzare con la voce clonata." \
    --out_path cloned_voice.wav
```

### Utilizzo Python

```python
import torch
from TTS.api import TTS

# Rileva dispositivo (MPS per Apple Silicon)
device = "mps" if torch.backends.mps.is_available() else "cpu"

# Carica modello XTTS-v2
tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to(device)

# Genera audio in italiano
tts.tts_to_file(
    text="Benvenuti a questo audiolibro generato localmente.",
    language="it",
    file_path="output.wav"
)

# Con voice cloning
tts.tts_to_file(
    text="Questo testo sara letto con la voce del sample fornito.",
    language="it",
    speaker_wav="voce_riferimento.wav",
    file_path="cloned_output.wav"
)
```

### Server API Locale

```bash
# Avvia server demo Coqui
tts-server --model_name tts_models/multilingual/multi-dataset/xtts_v2 \
           --language_idx it

# Accedi a: http://localhost:5002
# API docs: http://localhost:5002/docs
```

### Qualita e Velocita

- **Qualita**: 9/10 per italiano
- **Velocita**: ~1-3x tempo reale su Apple Silicon (CPU), piu veloce con MPS
- **RAM**: ~4-6GB
- **VRAM/Unified Memory**: ~4-8GB per accelerazione GPU

---

## Bark (Suno) - Naturale ed Emotivo

**Repository**: https://github.com/suno-ai/bark
**Repository MLX**: https://github.com/j-csc/mlx_bark
**Licenza**: MIT

### Caratteristiche

- Genera parlato molto naturale con emozioni
- Supporta risate, pause, respiri
- Puo generare anche musica e effetti sonori
- 100+ preset vocali

### Supporto Italiano

- Italiano supportato ufficialmente
- Qualita leggermente inferiore all'inglese
- Miglioramenti previsti con scaling futuro

### Installazione su Mac Apple Silicon

#### Metodo 1: Bark Standard

```bash
# Crea ambiente
python3 -m venv ~/venvs/bark
source ~/venvs/bark/bin/activate

# Installa Bark
pip install git+https://github.com/suno-ai/bark.git

# Oppure via transformers
pip install transformers scipy
```

#### Metodo 2: MLX Bark (Nativo Apple Silicon - Raccomandato)

```bash
git clone https://github.com/j-csc/mlx_bark.git
cd mlx_bark
pip install -r requirements.txt

# Scarica e converti modelli
huggingface-cli download suno/bark coarse.pt fine.pt text.pt
python convert.py --torch_weights_dir weights/ --model small
```

### Utilizzo Python

```python
from bark import SAMPLE_RATE, generate_audio, preload_models
from scipy.io.wavfile import write as write_wav

# Precarica modelli (prima esecuzione scarica ~5GB)
preload_models()

# Genera audio in italiano
text_prompt = """
[it] Ciao! Questo e un esempio di sintesi vocale con Bark.
*ride* Puo anche esprimere emozioni naturalmente!
"""

audio_array = generate_audio(text_prompt)

# Salva audio
write_wav("bark_output.wav", SAMPLE_RATE, audio_array)
```

### Utilizzo con Transformers

```python
from transformers import AutoProcessor, BarkModel
import scipy

processor = AutoProcessor.from_pretrained("suno/bark")
model = BarkModel.from_pretrained("suno/bark")

# Per Apple Silicon
model = model.to("mps")  # o "cpu" se MPS da problemi

# Genera con preset italiano
inputs = processor(
    "Ciao, questo e un test in italiano.",
    voice_preset="v2/it_speaker_0"  # Preset italiano
)

audio_array = model.generate(**inputs)
audio_array = audio_array.cpu().numpy().squeeze()

scipy.io.wavfile.write(
    "bark_italian.wav",
    rate=model.generation_config.sample_rate,
    data=audio_array
)
```

### Preset Vocali Italiani

```
v2/it_speaker_0 - v2/it_speaker_9
```

### Qualita e Velocita

- **Qualita**: 8/10 per italiano (9/10 per inglese)
- **Velocita**: Lenta (~10-100x tempo reale su CPU, ~1x su GPU)
- **RAM**: ~8-12GB
- **Lunghezza**: Ottimizzato per ~13 secondi per chunk

---

## StyleTTS2 - Alta Qualita

**Repository**: https://github.com/yl4579/StyleTTS2
**Licenza**: MIT

### Caratteristiche

- Qualita quasi umana per inglese
- Style transfer e controllo prosodia
- Ottimo per audiobook in inglese

### Supporto Italiano

- **Non supportato nativamente**
- Richiede training custom per italiano
- Modelli pre-trainati solo per inglese (LJSpeech, LibriTTS)

### Installazione su Mac Apple Silicon

```bash
# Nota: Esegue su CPU, nessun supporto Metal/MPS ufficiale
git clone https://github.com/yl4579/StyleTTS2.git
cd StyleTTS2

# Crea ambiente
python3 -m venv venv
source venv/bin/activate

# Installa dipendenze
pip install SoundFile torchaudio munch torch pydub pyyaml librosa
pip install nltk matplotlib accelerate transformers phonemizer
pip install einops einops-exts tqdm typing-extensions
pip install git+https://github.com/resemble-ai/monotonic_align.git

# Installa espeak-ng (necessario per phonemizer)
brew install espeak-ng

# Scarica modello pre-trainato
# Da: https://huggingface.co/yl4579/StyleTTS2-LJSpeech
```

### Utilizzo

```python
# Vedi demo notebook nel repository
# Solo inglese supportato con modelli pre-trainati
```

### Qualita e Velocita

- **Qualita**: 10/10 per inglese, N/A per italiano
- **Velocita**: Media su CPU
- **Raccomandato**: Solo se lavori principalmente in inglese

---

## WhisperSpeech

**Repository**: https://github.com/WhisperSpeech/WhisperSpeech
**Licenza**: Apache 2.0 / MIT

### Caratteristiche

- Basato su inversione di Whisper
- Completamente open source con dati leciti
- Voice cloning supportato

### Supporto Italiano

- **NON ANCORA DISPONIBILE**
- Attualmente solo inglese stabile
- Multilingue in sviluppo (francese, polacco in test)

### Installazione

```bash
pip install whisperspeech

# Oppure per sviluppo
git clone https://github.com/WhisperSpeech/WhisperSpeech.git
cd WhisperSpeech
pip install -e .
```

### Utilizzo (Solo Inglese)

```python
from whisperspeech.pipeline import Pipeline

pipe = Pipeline(s2a_ref='collabora/whisperspeech:s2a-q4-tiny-en+pl.model')

# Genera audio (solo inglese per ora)
pipe.generate_to_file("output.wav", "Hello, this is a test.")
```

### Stato Attuale

- Da monitorare per supporto italiano futuro
- Promettente ma non ancora utilizzabile per italiano

---

## MLX-Audio - Nativo Apple Silicon

**Repository**: https://github.com/Blaizzy/mlx-audio
**Licenza**: MIT

### Caratteristiche

- Costruito su framework MLX di Apple
- Ottimizzato per chip M1/M2/M3/M4
- Fino a 40% piu veloce di altri framework
- Include TTS, STT e speech-to-speech

### Supporto Italiano

- **Limitato** - principalmente inglese
- Usa modello Kokoro con 54 preset vocali
- Giapponese e Mandarino richiedono pacchetti extra

### Installazione

```bash
pip install mlx-audio

# Per interfaccia web
pip install mlx-audio[ui]
```

### Utilizzo

```python
from mlx_audio.tts import TTS

# Inizializza
tts = TTS()

# Genera audio
audio = tts.generate("Hello, this is a test.", voice="af_heart")

# Salva
tts.save(audio, "output.wav")
```

### Interfaccia Web

```bash
mlx-audio-ui
# Accedi a http://localhost:7860
```

### Qualita e Velocita

- **Qualita**: 8/10 per inglese
- **Velocita**: Molto veloce (ottimizzato MLX)
- **RAM**: Efficiente
- **Italiano**: Non raccomandato al momento

---

## Server API Locale

### XTTS API Server (Raccomandato per Italiano)

```bash
# Installa
git clone https://github.com/daswer123/xtts-api-server
cd xtts-api-server
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Avvia server
python -m xtts_api_server

# API disponibile su http://localhost:8020
# Docs su http://localhost:8020/docs
```

### Endpoint API Principali

```bash
# Genera audio
curl -X POST "http://localhost:8020/tts_to_audio" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Testo da sintetizzare in italiano",
    "language": "it",
    "speaker_wav": "path/to/reference.wav"
  }' \
  --output output.wav

# Lista voci disponibili
curl "http://localhost:8020/speakers"
```

### OpenAI-Compatible Server

Per compatibilita con API OpenAI TTS:

```bash
git clone https://github.com/matatonic/openedai-speech
cd openedai-speech
docker compose up -d

# Usa come drop-in replacement per OpenAI TTS API
```

### Server Piper HTTP Custom

```python
from flask import Flask, request, send_file
import subprocess
import tempfile
import os

app = Flask(__name__)

MODEL_PATH = os.path.expanduser(
    "~/.local/share/piper-voices/it_IT-riccardo-medium.onnx"
)

@app.route('/synthesize', methods=['POST'])
def synthesize():
    data = request.json
    text = data.get('text', '')

    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as f:
        output_path = f.name

    process = subprocess.Popen(
        ['piper', '--model', MODEL_PATH, '--output_file', output_path],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    process.communicate(input=text.encode('utf-8'))

    return send_file(output_path, mimetype='audio/wav')

@app.route('/health')
def health():
    return {'status': 'ok'}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

---

## Raccomandazioni Finali

### Per Audiolibri in Italiano

1. **Prima scelta: XTTS-v2 (Coqui TTS)**
   - Migliore qualita per italiano
   - Voice cloning per voci personalizzate
   - API server pronta all'uso

2. **Seconda scelta: Piper TTS**
   - Piu veloce per contenuti lunghi
   - Usa voci kirys per qualita migliore
   - Ideale per batch processing

### Per Podcast con Emozioni

1. **Bark**
   - Voce piu naturale e emotiva
   - Supporta risate, pause naturali
   - Piu lento ma risultato superiore

### Setup Consigliato per Produzione

```bash
# Crea ambiente dedicato
python3 -m venv ~/venvs/tts-production
source ~/venvs/tts-production/bin/activate

# Installa XTTS per qualita + Piper per velocita
pip install coqui-tts[server]
pip install piper-tts

# Scarica modelli
tts --model_name tts_models/multilingual/multi-dataset/xtts_v2 --list_models
# (scarica automaticamente al primo uso)

# Avvia server
tts-server --model_name tts_models/multilingual/multi-dataset/xtts_v2 \
           --language_idx it \
           --port 5002
```

### Requisiti Hardware Minimi

| Tool | RAM | Storage | Note |
|------|-----|---------|------|
| Piper | 1GB | ~100MB/voce | Molto leggero |
| XTTS-v2 | 6GB | ~3GB | Richiede piu risorse |
| Bark | 12GB | ~5GB | Il piu pesante |
| MLX-Audio | 4GB | ~1GB | Ottimizzato per Mac |

### Links Utili

- Piper Voices: https://rhasspy.github.io/piper-samples/
- XTTS-v2 Model: https://huggingface.co/coqui/XTTS-v2
- Bark Presets: https://suno-ai.notion.site/8b8e8749ed514b0cbf3f699013548683
- Italian Piper Voices: https://huggingface.co/kirys79/piper_italiano

---

*Documento aggiornato: Gennaio 2025*
*Per uso con audiolibri e podcast - Onde Project*
