# 🔥 RADEON 7900 XT - PROCEDURE TINYGRAD

**Hardware:** Radeon 7900 XT (16GB VRAM)
**Backend:** TinyGrad AMD
**Location:** ~/tinygrad

## ⚠️ REGOLA ASSOLUTA
```
1. PRIMA DI TUTTO: Apri TinyGPU.app! → open /Applications/TinyGPU.app
2. MAI usare CPU/M1 quando la Radeon è connessa!
3. SEMPRE: AMD=1 prima di ogni comando TinyGrad
```

### 🚀 STEP 0: APRIRE TINYGPU APP
```bash
# OBBLIGATORIO prima di qualsiasi operazione GPU!
open /Applications/TinyGPU.app
# Aspetta che sia attiva, poi procedi
```

---

## 📊 MODELLI DISPONIBILI (per VRAM)

| Modello | VRAM | Use Case | Script |
|---------|------|----------|--------|
| **LLaMA 3 8B** | ~16GB | Codice, Testo, Traduzioni | `llama3.py` |
| **LLaMA 3 1B** | ~2GB | Task veloci | `llama3.py --gguf` |
| **Stable Diffusion 1.5** | ~4GB | Immagini | `stable_diffusion.py` |
| **SDXL** | ~12GB | Immagini HQ | `sdxl.py` |
| **Whisper** | ~1.5GB | Audio→Testo | `whisper.py` |
| **YOLOv8** | ~500MB | Object Detection | `yolov8.py` |
| **GPT-2** | ~500MB | Testo semplice | `gpt2.py` |
| **Mamba** | Vari | Architettura alternativa | `mamba.py` |

---

## 🖥️ 1. CODICE (LLaMA 3 8B)

### Setup iniziale (una volta)
```bash
cd ~/tinygrad
AMD=1 python3 examples/llama3.py --model TriAiExperiments/SFR-Iterative-DPO-LLaMA-3-8B-R --prompt "test" --count 10
# Download: ~10 min (~16GB)
```

### Uso per coding
```bash
cd ~/tinygrad
AMD=1 python3 examples/llama3.py \
  --model TriAiExperiments/SFR-Iterative-DPO-LLaMA-3-8B-R \
  --prompt "Write a Python function that..." \
  --count 500 \
  --temperature 0.7
```

### Script wrapper: ~/tinygrad/code-gen.sh
```bash
#!/bin/bash
cd ~/tinygrad
AMD=1 python3 examples/llama3.py \
  --model TriAiExperiments/SFR-Iterative-DPO-LLaMA-3-8B-R \
  --prompt "$1" \
  --count ${2:-500} \
  --temperature ${3:-0.7}
```

---

## 🖼️ 2. IMMAGINI (Stable Diffusion)

### Stable Diffusion 1.5 (~4GB)
```bash
cd ~/tinygrad
AMD=1 python3 examples/stable_diffusion.py \
  --prompt "a photo of an astronaut riding a horse on mars" \
  --out output.png \
  --steps 20
```

### SDXL (~12GB, qualità migliore)
```bash
cd ~/tinygrad
AMD=1 python3 examples/sdxl.py \
  --prompt "photorealistic landscape, 8k, detailed" \
  --out output_xl.png \
  --steps 30
```

### Script wrapper: ~/tinygrad/img-gen.sh
```bash
#!/bin/bash
cd ~/tinygrad
AMD=1 python3 examples/stable_diffusion.py \
  --prompt "$1" \
  --out "${2:-/tmp/generated.png}" \
  --steps ${3:-20}
echo "Saved to ${2:-/tmp/generated.png}"
```

---

## 🎬 3. VIDEO (Frame extraction + processing)

### Object Detection su frame (YOLOv8)
```bash
cd ~/tinygrad
# Estrai frame
ffmpeg -i video.mp4 -vf "fps=1" frames/frame_%04d.jpg

# Processa ogni frame
AMD=1 python3 examples/yolov8.py frames/frame_0001.jpg
```

### Script: ~/tinygrad/video-detect.sh
```bash
#!/bin/bash
VIDEO=$1
OUTDIR=${2:-/tmp/video_frames}
mkdir -p $OUTDIR

# Extract frames
ffmpeg -i "$VIDEO" -vf "fps=1" "$OUTDIR/frame_%04d.jpg"

# Process each frame
cd ~/tinygrad
for f in $OUTDIR/frame_*.jpg; do
  AMD=1 python3 examples/yolov8.py "$f" 2>/dev/null
done
```

---

## 📝 4. TESTO (LLaMA 3 / GPT-2)

### Generazione testo (LLaMA 3)
```bash
cd ~/tinygrad
AMD=1 python3 examples/llama3.py \
  --model TriAiExperiments/SFR-Iterative-DPO-LLaMA-3-8B-R \
  --prompt "Write a blog post about..." \
  --count 1000 \
  --temperature 0.8
```

### Testo veloce (GPT-2, ~500MB)
```bash
cd ~/tinygrad
AMD=1 python3 examples/gpt2.py \
  --prompt "Once upon a time" \
  --count 200
```

---

## 🌍 5. TRADUZIONI (LLaMA 3)

### Italiano → Inglese
```bash
cd ~/tinygrad
AMD=1 python3 examples/llama3.py \
  --model TriAiExperiments/SFR-Iterative-DPO-LLaMA-3-8B-R \
  --prompt "Translate to English: Ciao, come stai oggi?" \
  --count 100 \
  --temperature 0.3
```

### Inglese → Italiano
```bash
cd ~/tinygrad
AMD=1 python3 examples/llama3.py \
  --model TriAiExperiments/SFR-Iterative-DPO-LLaMA-3-8B-R \
  --prompt "Traduci in italiano: Hello, how are you today?" \
  --count 100 \
  --temperature 0.3
```

### Script: ~/tinygrad/translate.sh
```bash
#!/bin/bash
TEXT="$1"
TARGET_LANG="${2:-English}"
cd ~/tinygrad
AMD=1 python3 examples/llama3.py \
  --model TriAiExperiments/SFR-Iterative-DPO-LLaMA-3-8B-R \
  --prompt "Translate to $TARGET_LANG: $TEXT" \
  --count 200 \
  --temperature 0.3
```

---

## 🎤 6. AUDIO → TESTO (Whisper)

```bash
cd ~/tinygrad
AMD=1 python3 examples/whisper.py audio.wav
```

### Con lingua specifica
```bash
AMD=1 python3 examples/whisper.py audio.wav --language it
```

---

## ✅ VERIFICA GPU ATTIVA

```bash
cd ~/tinygrad
AMD=1 python3 -c "
from tinygrad import Device, Tensor
print(f'Device: {Device.DEFAULT}')
t = Tensor.rand(1000,1000)
r = (t @ t.T).sum().item()
print(f'GPU test: OK (sum={r:.2f})')
"
```

**Output atteso:**
```
Device: AMD
GPU test: OK (sum=...)
```

---

## 🚨 TROUBLESHOOTING

### "Device: CLANG" invece di "AMD"
```bash
# Forza AMD
export AMD=1
# Oppure
AMD=1 python3 ...
```

### Out of Memory
- LLaMA 3 8B usa ~16GB = tutto il VRAM
- Se OOM, usa modelli più piccoli o quantizzati

### Modello non trovato
```bash
# I modelli si scaricano automaticamente al primo uso
# Verifica connessione internet
```

---

## 📁 STRUTTURA FILE

```
~/tinygrad/
├── examples/
│   ├── llama3.py      # LLaMA 3 (codice, testo, traduzioni)
│   ├── stable_diffusion.py  # Immagini
│   ├── sdxl.py        # Immagini HQ
│   ├── whisper.py     # Audio→Testo
│   ├── yolov8.py      # Object detection
│   ├── gpt2.py        # Testo veloce
│   └── mamba.py       # Alternativa
├── code-gen.sh        # Wrapper codice
├── img-gen.sh         # Wrapper immagini
├── translate.sh       # Wrapper traduzioni
└── video-detect.sh    # Wrapper video
```

---

*Creato: 2026-01-30*
*Hardware: Radeon 7900 XT 16GB via TinyGrad*
