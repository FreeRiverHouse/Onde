# Workflow: Batch Generation - Multipli Episodi

> Generare 5-10 episodi podcast in serie per efficienza massima

---

## Panoramica

La batch generation permette di:
- Processare multipli episodi in parallelo
- Riutilizzare asset comuni (jingle, background)
- Ottimizzare tempi di rendering
- Mantenere coerenza tra episodi

---

## Prerequisiti

```bash
# Ambiente Python con dipendenze
source ~/venvs/podcast/bin/activate

# Verifica FFmpeg
ffmpeg -version

# Crea directory output
mkdir -p output/podcast/batch-{date}
```

---

## Step 1: Preparazione Batch

### 1.1 Crea File di Configurazione Batch

```json
// batch-config.json
{
  "batch_id": "batch-2026-01-09",
  "series": "Piccole Rime",
  "episodes": [
    {
      "id": "ep006",
      "title": "La Lumachella de la Vanagloria",
      "author": "Trilussa",
      "script": "content/podcast-episodes/ep06-lumachella.md"
    },
    {
      "id": "ep007",
      "title": "Il Salmo 23 per Bambini",
      "author": "Gianni Parola",
      "script": "content/podcast-episodes/ep07-salmo23.md"
    },
    {
      "id": "ep008",
      "title": "La Formica e la Cicala",
      "author": "Esopo",
      "script": "content/podcast-episodes/ep08-formica.md"
    },
    {
      "id": "ep009",
      "title": "Il Bruco e la Farfalla",
      "author": "Onde Original",
      "script": "content/podcast-episodes/ep09-bruco.md"
    },
    {
      "id": "ep010",
      "title": "Buonanotte Bambini",
      "author": "Onde Original",
      "script": "content/podcast-episodes/ep10-buonanotte.md"
    }
  ],
  "settings": {
    "voice": "it-IT-DiegoNeural",
    "rate": "-15%",
    "pitch": "-5Hz",
    "background_volume": 0.15,
    "output_format": "mp3",
    "bitrate": "192k",
    "loudness": -14
  }
}
```

### 1.2 Valida Script

```bash
#!/bin/bash
# validate-scripts.sh

for script in content/podcast-episodes/ep*.md; do
    echo "Validando: $script"

    # Verifica struttura
    if ! grep -q "## SCRIPT COMPLETO" "$script"; then
        echo "  ERRORE: Manca sezione SCRIPT COMPLETO"
    fi

    if ! grep -q "### INTRO" "$script"; then
        echo "  ERRORE: Manca sezione INTRO"
    fi

    if ! grep -q "### OUTRO" "$script"; then
        echo "  ERRORE: Manca sezione OUTRO"
    fi

    echo "  OK"
done
```

---

## Step 2: Estrazione Testo in Parallelo

### 2.1 Script Estrazione

```python
#!/usr/bin/env python3
"""extract_all_scripts.py - Estrae testo pulito da tutti gli script"""

import json
import re
from pathlib import Path

def clean_script(content: str) -> str:
    """Rimuove markup e indicazioni di regia"""
    # Rimuovi indicazioni musicali [MUSICA: ...]
    content = re.sub(r'\*\*\[.*?\]\*\*', '', content)
    # Rimuovi header markdown
    content = re.sub(r'^#+.*$', '', content, flags=re.MULTILINE)
    # Rimuovi separatori
    content = re.sub(r'^---+$', '', content, flags=re.MULTILINE)
    # Rimuovi indicazioni speaker **GIANNI PAROLA:**
    content = re.sub(r'\*\*GIANNI PAROLA:\*\*', '', content)
    # Rimuovi parentesi con indicazioni
    content = re.sub(r'\*\(.*?\)\*', '', content)
    # Pulisci whitespace
    content = re.sub(r'\n{3,}', '\n\n', content)
    return content.strip()

def main():
    with open('batch-config.json', 'r') as f:
        config = json.load(f)

    output_dir = Path(f"output/podcast/{config['batch_id']}")
    output_dir.mkdir(parents=True, exist_ok=True)

    for ep in config['episodes']:
        script_path = Path(ep['script'])
        if not script_path.exists():
            print(f"ERRORE: Script non trovato: {script_path}")
            continue

        with open(script_path, 'r') as f:
            content = f.read()

        clean = clean_script(content)

        output_path = output_dir / f"{ep['id']}-clean.txt"
        with open(output_path, 'w') as f:
            f.write(clean)

        print(f"Estratto: {ep['id']} -> {output_path}")

if __name__ == "__main__":
    main()
```

---

## Step 3: Generazione Audio Batch

### 3.1 Edge TTS Batch

```python
#!/usr/bin/env python3
"""batch_tts.py - Genera audio per tutti gli episodi"""

import asyncio
import json
import edge_tts
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor

async def generate_one(episode: dict, settings: dict, output_dir: Path):
    """Genera audio per un singolo episodio"""
    text_file = output_dir / f"{episode['id']}-clean.txt"
    output_file = output_dir / f"{episode['id']}-narration.mp3"

    with open(text_file, 'r') as f:
        text = f.read()

    communicate = edge_tts.Communicate(
        text,
        settings['voice'],
        rate=settings['rate'],
        pitch=settings['pitch']
    )

    await communicate.save(str(output_file))
    print(f"Generato: {output_file}")

async def main():
    with open('batch-config.json', 'r') as f:
        config = json.load(f)

    output_dir = Path(f"output/podcast/{config['batch_id']}")

    # Genera in parallelo (max 3 concurrent)
    tasks = []
    for ep in config['episodes']:
        task = generate_one(ep, config['settings'], output_dir)
        tasks.append(task)

    # Batch di 3 alla volta per evitare rate limiting
    batch_size = 3
    for i in range(0, len(tasks), batch_size):
        batch = tasks[i:i+batch_size]
        await asyncio.gather(*batch)
        print(f"Batch {i//batch_size + 1} completato")

if __name__ == "__main__":
    asyncio.run(main())
```

### 3.2 Con Progress Bar

```python
#!/usr/bin/env python3
"""batch_tts_progress.py - Con progress bar"""

import asyncio
import json
from pathlib import Path
from tqdm import tqdm
import edge_tts

async def main():
    with open('batch-config.json', 'r') as f:
        config = json.load(f)

    output_dir = Path(f"output/podcast/{config['batch_id']}")
    settings = config['settings']

    for ep in tqdm(config['episodes'], desc="Generando audio"):
        text_file = output_dir / f"{ep['id']}-clean.txt"
        output_file = output_dir / f"{ep['id']}-narration.mp3"

        with open(text_file, 'r') as f:
            text = f.read()

        communicate = edge_tts.Communicate(
            text,
            settings['voice'],
            rate=settings['rate'],
            pitch=settings['pitch']
        )

        await communicate.save(str(output_file))

if __name__ == "__main__":
    asyncio.run(main())
```

---

## Step 4: Mix Batch con FFmpeg

### 4.1 Script Bash per Mix

```bash
#!/bin/bash
# batch-mix.sh - Mixa tutti gli episodi

BATCH_DIR=$1
BACKGROUND="assets/background-default.mp3"
JINGLE_INTRO="assets/jingle-intro.mp3"
JINGLE_OUTRO="assets/jingle-outro.mp3"

if [ -z "$BATCH_DIR" ]; then
    echo "Uso: ./batch-mix.sh output/podcast/batch-2026-01-09"
    exit 1
fi

for narration in $BATCH_DIR/*-narration.mp3; do
    EPISODE_ID=$(basename $narration -narration.mp3)
    echo "Processando: $EPISODE_ID"

    # Step 1: Mix con background
    ffmpeg -i "$narration" -i "$BACKGROUND" \
        -filter_complex "[1:a]volume=0.15[bg];[0:a][bg]amix=inputs=2:duration=first" \
        "$BATCH_DIR/$EPISODE_ID-mix.mp3" -y -hide_banner -loglevel error

    # Step 2: Aggiungi jingle
    ffmpeg -i "$JINGLE_INTRO" -i "$BATCH_DIR/$EPISODE_ID-mix.mp3" -i "$JINGLE_OUTRO" \
        -filter_complex "[0:a][1:a][2:a]concat=n=3:v=0:a=1" \
        "$BATCH_DIR/$EPISODE_ID-assembled.mp3" -y -hide_banner -loglevel error

    # Step 3: Normalizza
    ffmpeg -i "$BATCH_DIR/$EPISODE_ID-assembled.mp3" \
        -af "loudnorm=I=-14:TP=-1:LRA=11" \
        -ar 44100 -ab 192k \
        "$BATCH_DIR/$EPISODE_ID-final.mp3" -y -hide_banner -loglevel error

    # Cleanup
    rm "$BATCH_DIR/$EPISODE_ID-mix.mp3" "$BATCH_DIR/$EPISODE_ID-assembled.mp3"

    echo "  -> $BATCH_DIR/$EPISODE_ID-final.mp3"
done

echo "=== BATCH COMPLETATO ==="
ls -la $BATCH_DIR/*-final.mp3
```

### 4.2 Parallelizza con GNU Parallel

```bash
#!/bin/bash
# batch-mix-parallel.sh

BATCH_DIR=$1

process_episode() {
    narration=$1
    EPISODE_ID=$(basename $narration -narration.mp3)

    # ... stesso codice di sopra ...
}

export -f process_episode
export BATCH_DIR

ls $BATCH_DIR/*-narration.mp3 | parallel -j 4 process_episode {}
```

---

## Step 5: Aggiungi Metadati Batch

```python
#!/usr/bin/env python3
"""batch_metadata.py - Aggiunge metadati ID3 a tutti i file"""

import json
import subprocess
from pathlib import Path

def add_metadata(episode: dict, file_path: Path):
    """Aggiunge metadati con FFmpeg"""
    temp_path = file_path.with_suffix('.temp.mp3')

    cmd = [
        'ffmpeg', '-i', str(file_path),
        '-metadata', f"title=Ep. {episode['id'][-2:]} - {episode['title']}",
        '-metadata', 'artist=Onde - Gianni Parola',
        '-metadata', 'album=Piccole Rime - Storie della Buonanotte',
        '-metadata', 'year=2026',
        '-metadata', 'genre=Podcast',
        '-metadata', f"comment=Testo: {episode['author']}",
        '-codec', 'copy',
        str(temp_path),
        '-y', '-hide_banner', '-loglevel', 'error'
    ]

    subprocess.run(cmd, check=True)
    temp_path.rename(file_path)
    print(f"Metadati aggiunti: {file_path}")

def main():
    with open('batch-config.json', 'r') as f:
        config = json.load(f)

    output_dir = Path(f"output/podcast/{config['batch_id']}")

    for ep in config['episodes']:
        file_path = output_dir / f"{ep['id']}-final.mp3"
        if file_path.exists():
            add_metadata(ep, file_path)
        else:
            print(f"File non trovato: {file_path}")

if __name__ == "__main__":
    main()
```

---

## Step 6: QC Batch

```bash
#!/bin/bash
# batch-qc.sh - Quality check su tutti i file

BATCH_DIR=$1

echo "=== QUALITY CHECK BATCH ==="
echo ""

for final in $BATCH_DIR/*-final.mp3; do
    EPISODE_ID=$(basename $final -final.mp3)
    echo "--- $EPISODE_ID ---"

    # Durata
    DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$final" | cut -d. -f1)
    echo "  Durata: ${DURATION}s"
    if [ $DURATION -lt 180 ]; then
        echo "  WARN: Troppo corto (< 3 min)"
    fi
    if [ $DURATION -gt 600 ]; then
        echo "  WARN: Troppo lungo (> 10 min)"
    fi

    # Bitrate
    BITRATE=$(ffprobe -v error -show_entries format=bit_rate -of default=noprint_wrappers=1:nokey=1 "$final")
    BITRATE_KB=$((BITRATE / 1000))
    echo "  Bitrate: ${BITRATE_KB}kbps"

    # File size
    SIZE=$(ls -lh "$final" | awk '{print $5}')
    echo "  Size: $SIZE"

    echo ""
done

echo "=== BATCH QC COMPLETATO ==="
```

---

## Step 7: Upload Batch

### 7.1 Prepara per Upload

```bash
#!/bin/bash
# prepare-upload.sh

BATCH_DIR=$1
UPLOAD_DIR="$BATCH_DIR/ready-for-upload"

mkdir -p $UPLOAD_DIR

for final in $BATCH_DIR/*-final.mp3; do
    EPISODE_ID=$(basename $final -final.mp3)
    # Copia con nome pulito
    cp "$final" "$UPLOAD_DIR/Onde-PiccoleRime-$EPISODE_ID.mp3"
done

echo "File pronti in: $UPLOAD_DIR"
ls -la $UPLOAD_DIR
```

### 7.2 Genera Report Batch

```python
#!/usr/bin/env python3
"""batch_report.py - Genera report del batch"""

import json
from pathlib import Path
from datetime import datetime
import subprocess

def get_duration(file_path: Path) -> float:
    result = subprocess.run([
        'ffprobe', '-v', 'error',
        '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1',
        str(file_path)
    ], capture_output=True, text=True)
    return float(result.stdout.strip())

def main():
    with open('batch-config.json', 'r') as f:
        config = json.load(f)

    output_dir = Path(f"output/podcast/{config['batch_id']}")
    report = []

    total_duration = 0

    for ep in config['episodes']:
        file_path = output_dir / f"{ep['id']}-final.mp3"
        if file_path.exists():
            duration = get_duration(file_path)
            size = file_path.stat().st_size / (1024 * 1024)  # MB

            report.append({
                'id': ep['id'],
                'title': ep['title'],
                'author': ep['author'],
                'duration_sec': round(duration, 1),
                'duration_min': round(duration / 60, 1),
                'size_mb': round(size, 2),
                'status': 'ready'
            })
            total_duration += duration

    # Stampa report
    print(f"\n{'='*60}")
    print(f"BATCH REPORT: {config['batch_id']}")
    print(f"Data: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print(f"{'='*60}\n")

    for r in report:
        print(f"{r['id']}: {r['title']}")
        print(f"       Autore: {r['author']}")
        print(f"       Durata: {r['duration_min']} min | Size: {r['size_mb']} MB")
        print()

    print(f"{'='*60}")
    print(f"TOTALE: {len(report)} episodi | {round(total_duration/60, 1)} minuti")
    print(f"{'='*60}")

    # Salva JSON
    with open(output_dir / 'batch-report.json', 'w') as f:
        json.dump({
            'batch_id': config['batch_id'],
            'generated': datetime.now().isoformat(),
            'total_episodes': len(report),
            'total_duration_min': round(total_duration/60, 1),
            'episodes': report
        }, f, indent=2)

if __name__ == "__main__":
    main()
```

---

## Script Master: batch-all.sh

```bash
#!/bin/bash
# batch-all.sh - Pipeline completa batch

set -e

BATCH_CONFIG=${1:-"batch-config.json"}

echo "=== PODCAST BATCH GENERATION ==="
echo "Config: $BATCH_CONFIG"
echo ""

# Step 1: Estrazione
echo ">>> Step 1: Estrazione testi..."
python scripts/extract_all_scripts.py

# Step 2: Generazione TTS
echo ">>> Step 2: Generazione audio..."
python scripts/batch_tts.py

# Step 3: Mix
echo ">>> Step 3: Mix con background e jingle..."
BATCH_ID=$(jq -r '.batch_id' $BATCH_CONFIG)
./scripts/batch-mix.sh output/podcast/$BATCH_ID

# Step 4: Metadati
echo ">>> Step 4: Aggiunta metadati..."
python scripts/batch_metadata.py

# Step 5: QC
echo ">>> Step 5: Quality Check..."
./scripts/batch-qc.sh output/podcast/$BATCH_ID

# Step 6: Report
echo ">>> Step 6: Generazione report..."
python scripts/batch_report.py

echo ""
echo "=== BATCH COMPLETATO ==="
echo "Output: output/podcast/$BATCH_ID/"
```

---

## Esempio Timeline

| Step | Tempo (5 episodi) | Note |
|------|-------------------|------|
| Preparazione | 5 min | Validazione script |
| Estrazione | 1 min | Automatico |
| TTS | 10-15 min | Edge TTS, parallelo |
| Mix | 5 min | FFmpeg, parallelo |
| Metadati | 1 min | Automatico |
| QC | 5 min | Manuale review |
| **TOTALE** | **~30 min** | Per 5 episodi |

---

*Documento creato: 9 Gennaio 2026*
*Task: podcast-pipeline-001*
