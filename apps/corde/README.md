# CORDE - Content ORchestration & Digital Experience

App node-based per generazione contenuti Onde (tipo synth modulare / ComfyUI).

## Requisiti

- **macOS** con Apple Silicon (M1/M2/M3)
- **Python 3.10+**
- **Node.js 18+**
- **15-20GB** spazio disco (SSD consigliato)
- **16GB+ RAM unificata** (32GB consigliato per SDXL 1024x1024)

## Installazione Rapida

### 1. Clone repository
```bash
git clone https://github.com/FreeRiverHouse/Onde.git
cd Onde/apps/corde
```

### 2. Setup Python Environment (Miniforge consigliato)
```bash
# Installa Miniforge se non presente
# https://github.com/conda-forge/miniforge

# Crea environment
conda create -n corde python=3.10 -y
conda activate corde

# Installa dipendenze
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
pip install diffusers transformers accelerate safetensors pillow

# Oppure usa requirements.txt
pip install -r engine/requirements.txt
```

### 3. Configura paths

**IMPORTANTE**: I modelli SDXL sono già scaricati su SSD Mattia:
```
/Volumes/DATI-SSD/onde-ai/corde/cache/   # ~6GB - MODELLI GIÀ SCARICATI
/Volumes/DATI-SSD/onde-ai/corde/outputs/ # Output immagini
```

Se usi un altro Mac, collega lo stesso SSD o copia la cartella `cache/`.

Per usare paths diversi, modifica in `engine/generate_book.py`:
```python
os.environ['HF_HOME'] = '/Volumes/DATI-SSD/onde-ai/corde/cache'
OUTPUT_DIR = Path('/Volumes/DATI-SSD/onde-ai/corde/outputs')
```

### 4. Setup Frontend (opzionale, per UI)
```bash
cd frontend
npm install
npm run dev  # http://localhost:3000
```

### 5. Setup API (opzionale)
```bash
cd api
npm install
npm start  # http://localhost:3700
```

## Uso - Generazione Libri

### Test singola immagine
```bash
conda activate corde
cd engine
python generate_book.py --book marco-aurelio-bambini --test --steps 15
```

### Genera tutte le illustrazioni
```bash
python generate_book.py --book marco-aurelio-bambini --steps 20
```

### Solo copertina
```bash
python generate_book.py --book marco-aurelio-bambini --cover
```

### Capitolo specifico
```bash
python generate_book.py --book marco-aurelio-bambini --chapter 1
```

## Struttura Progetto

```
corde/
├── frontend/           # React + React Flow (UI node editor)
│   ├── src/
│   │   ├── components/
│   │   │   └── nodes/  # PromptNode, SDXLNode, VideoNode, etc.
│   │   └── store/      # Zustand state management
│   └── package.json
├── api/                # Express.js server (port 3700)
│   └── server.js       # Templates, authors, job queue
├── engine/             # Python ML engine
│   ├── engine.py       # Main executor
│   ├── generate_book.py # CLI per generare libri
│   ├── nodes/          # Modular nodes
│   │   ├── base.py
│   │   ├── image_nodes.py
│   │   ├── video_nodes.py
│   │   ├── text_nodes.py
│   │   ├── quality_nodes.py
│   │   └── utility_nodes.py
│   └── requirements.txt
├── config/
│   ├── authors.json    # Autori/illustratori con prompts
│   └── templates.json  # Pipeline preconfigurate
└── workflows/          # Saved workflows JSON
```

## Modelli Usati

| Modello | Dimensione | Uso |
|---------|------------|-----|
| SDXL Base 1.0 | ~6GB | Generazione immagini |
| IP-Adapter | ~1GB | Character consistency (TODO) |
| LTX-Video 2 | ~5GB | Video generation (TODO) |

I modelli vengono scaricati automaticamente al primo uso in `HF_HOME`.

## Memory Tips per Apple Silicon

Se hai problemi di memoria:

1. **Riduci risoluzione**: 768x768 invece di 1024x1024
2. **Meno steps**: 15-20 invece di 25-30
3. **Usa SD 1.5**: Richiede meno memoria di SDXL
4. **Chiudi altre app**: Libera RAM unificata

```python
# In generate_book.py, già configurato:
os.environ['PYTORCH_MPS_HIGH_WATERMARK_RATIO'] = '0.0'
pipe.enable_attention_slicing(1)
pipe.enable_vae_slicing()
pipe.enable_vae_tiling()
```

## Templates Disponibili

| Template | Descrizione |
|----------|-------------|
| `video-poesia` | Video animato da poesia |
| `libro-illustrato` | Libro bambini illustrato |
| `milo-adventure` | Avventure del robot Milo |
| `ambient-video` | Video loop relax |
| `social-content` | Contenuti social |
| `character-sheet` | Reference personaggio |

## Authors/Stili

| Author | Stile |
|--------|-------|
| `pina-pennello` | Acquarello europeo, bambini |
| `magmatic` | Arte contemporanea, poetico |
| `onde-futures` | Tech, futuristico, caldo |
| `onde-classics` | Poesia, spiritualità |
| `luzzati` | Folk art, teatro italiano |
| `kids` | Colorato, educativo |

## Quality Checks (Anti-Slop)

CORDE include controlli qualità automatici:
- **anti_slop**: Verifica testo non generico
- **anatomy_check**: 5 dita, proporzioni corrette
- **style_consistency**: Stile Onde (no Pixar/3D)
- **character_consistency**: Personaggio coerente

## Troubleshooting

### "MPS backend out of memory"
- Riduci risoluzione a 512x512 o 768x768
- Chiudi altre applicazioni
- Usa `--steps 15` invece di 25

### Immagine corrotta (molto piccola)
- Memory issue - prova risoluzione più bassa
- Verifica che MPS sia disponibile: `python -c "import torch; print(torch.backends.mps.is_available())"`

### Download lento modelli
- Prima esecuzione scarica ~6GB
- Usa SSD esterno se disco interno pieno
- Modelli cached in `HF_HOME` per esecuzioni successive

## License

Parte del progetto Onde - FreeRiverHouse
