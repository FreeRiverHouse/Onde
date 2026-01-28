# 🎮 Traduzione con GPU Locale (AMD Radeon RX 7900 XTX)

Guida completa per usare GPT-2 su Radeon via TinyGrad per traduzioni locali.

## Hardware Setup

| Component | Spec |
|-----------|------|
| GPU | AMD Radeon RX 7900 XTX (24GB VRAM) |
| Enclosure | Razer Core X V2 (Thunderbolt) |
| Architecture | GFX1100 (RDNA3) |
| Driver | TinyGrad userspace (NO ROCm!) |

## ⚠️ Prerequisiti

1. **Python 3.11** installato via Homebrew
2. **TinyGrad** già configurato in `~/conductor/workspaces/Onde/moscow/tinygrad-fix`
3. **eGPU collegata** via Thunderbolt

### Verifica Setup
```bash
cd ~/conductor/workspaces/Onde/moscow/tinygrad-fix
DEBUG=2 AMD=1 /opt/homebrew/bin/python3.11 -c "from tinygrad import Device; print('GPU AMD OK')"
```

Output atteso:
```
am remote:0: model reset
am remote:0: AM_SOC initialized
...firmware loading...
am remote:0: boot done
AMDDevice: opening 0 with target (11, 0, 0) arch gfx1100
GPU AMD OK
```

---

## 🔧 Quick Start

### Comando Base
```bash
cd ~/conductor/workspaces/Onde/moscow/tinygrad-fix && \
PYTHONPATH=. AMD=1 AMD_LLVM=1 /opt/homebrew/bin/python3.11 examples/gpt2.py \
--model_size gpt2-xl --prompt "YOUR_PROMPT" --count 100 --temperature 0.3
```

### Script Wrapper (Consigliato)
```bash
~/conductor/workspaces/Onde/moscow/scripts/gpt2-translate.sh "Your text here"
```

---

## 📊 Modelli Disponibili

| Model | Params | VRAM | Speed | Quality |
|-------|--------|------|-------|---------|
| `gpt2` | 124M | ~0.5GB | ⚡⚡⚡ | ⭐⭐ |
| `gpt2-medium` | 355M | ~1.5GB | ⚡⚡ | ⭐⭐⭐ |
| `gpt2-large` | 774M | ~3GB | ⚡ | ⭐⭐⭐⭐ |
| `gpt2-xl` | 1.5B | ~6GB | 🐢 | ⭐⭐⭐⭐⭐ |

**Raccomandato:** `gpt2-xl` per traduzioni di qualità (hai 24GB VRAM, usali!)

---

## 🎯 Parametri Ottimali per Traduzioni

### Temperature
- `0.1-0.3` → Traduzioni fedeli, conservative
- `0.5-0.7` → Più creative, parafrasate
- `0.8+` → Troppo random per traduzioni

### Count (max tokens)
- `50-100` → Frasi singole
- `200-300` → Paragrafi
- `500+` → Testi lunghi (attenzione al context limit!)

### Context Length
**MAX_CONTEXT** (default 128) può essere aumentato:
```bash
MAX_CONTEXT=512 PYTHONPATH=. AMD=1 AMD_LLVM=1 /opt/homebrew/bin/python3.11 examples/gpt2.py ...
```

---

## 💡 Prompt Templates per Traduzioni

### Italiano → Inglese
```
Translate the following Italian text to English:

Italian: "Il gatto sedeva sul tappeto."
English:
```

### Inglese → Italiano
```
Translate to Italian:
"The cat sat on the mat."
Translation:
```

### Multi-shot (più accurato)
```
Translate English to Italian:

English: "Hello, how are you?"
Italian: "Ciao, come stai?"

English: "The book is on the table."
Italian: "Il libro è sul tavolo."

English: "I love programming."
Italian:
```

---

## 🚀 Ottimizzazioni Avanzate

### Half Precision (più veloce, meno VRAM)
```bash
HALF=1 PYTHONPATH=. AMD=1 AMD_LLVM=1 /opt/homebrew/bin/python3.11 examples/gpt2.py ...
```

### Debug Output
```bash
DEBUG=2 PYTHONPATH=. AMD=1 AMD_LLVM=1 /opt/homebrew/bin/python3.11 examples/gpt2.py ...
```

### Benchmark
```bash
PYTHONPATH=. AMD=1 AMD_LLVM=1 /opt/homebrew/bin/python3.11 examples/gpt2.py \
--benchmark 100 --model_size gpt2-xl
```

---

## ⚠️ Troubleshooting

### "lock file in use"
Un'altra sessione sta usando la GPU. Aspetta o termina l'altro processo.

### GPU non trovata
1. Verifica che l'eGPU sia collegata
2. Controlla System Profiler → Graphics
3. Riavvia la sessione del terminale

### Out of Memory
- Usa un modello più piccolo
- Abilita `HALF=1`
- Riduci `MAX_CONTEXT`

### Risultati lenti
- Prima run compila i kernel (normale che sia lenta)
- Run successive molto più veloci grazie al JIT

---

## 📝 Limitazioni di GPT-2

⚠️ **GPT-2 NON è un traduttore professionale!**

- Training data vecchio (pre-2019)
- Nessun fine-tuning specifico per traduzioni
- Può "allucinare" o continuare invece di tradurre
- Per traduzioni professionali considera modelli specializzati

### Quando usare GPT-2 locale:
✅ Traduzioni approssimative rapide
✅ Quando la privacy è importante
✅ Sperimentazione/testing
✅ Offline access

### Quando usare altro:
❌ Traduzioni ufficiali/legali
❌ Documenti tecnici critici
❌ Quando serve precisione 100%

---

## 🔗 Riferimenti

- **TinyGrad Path:** `~/conductor/workspaces/Onde/moscow/tinygrad-fix`
- **Script Wrapper:** `~/conductor/workspaces/Onde/moscow/scripts/gpt2-translate.sh`
- **AMD Setup Info:** `~/conductor/workspaces/Onde/moscow/AMD_SETUP_INFO.md`

---

## 📊 Performance Reali (Testato)

### GPT-2 XL su AMD RX 7900 XTX

| Fase | Tempo |
|------|-------|
| Caricamento modello | ~52 secondi |
| VRAM utilizzata | 6.23 GB |
| Generazione (primo token) | ~9 sec (compila kernel) |
| Generazione (successivi) | ~0.5 sec/token |
| 50 tokens totali | ~18 secondi |

**Note:**
- La prima run compila i kernel LLVM per AMD → lenta
- Run successive molto più veloci grazie al JIT
- Con 24GB VRAM hai ampio margine per MAX_CONTEXT più alto

### Benchmark Command
```bash
cd ~/conductor/workspaces/Onde/moscow/tinygrad-fix && \
PYTHONPATH=. AMD=1 AMD_LLVM=1 /opt/homebrew/bin/python3.11 examples/gpt2.py \
--benchmark 100 --model_size gpt2-xl --timing
```

---

## 🎯 Reality Check: GPT-2 per Traduzioni

⚠️ **Test reale del 28 Gen 2026:**

Prompt: `"Translate to Italian: The cat sat on the mat."`

Output GPT-2:
```
Translate to Italian: The cat sat on the mat.
Translate to Spanish: The cat sat on the mat.
Translate to Portuguese: The cat sat on the mat.
Translate to French: The cat sat on the mat.
```

**GPT-2 continua il pattern invece di tradurre!**

### Soluzioni:
1. **Few-shot prompting** - Usa lo script `gpt2-generate.py --translate`
2. **Temperatura bassa** - `--temperature 0.1` per meno creatività
3. **Stop sequence** - Interrompi alla prima newline
4. **Modello dedicato** - Per traduzioni serie, considera modelli specializzati

### Quando GPT-2 locale VA BENE:
- ✅ Generazione di testo creativo
- ✅ Completamento frasi
- ✅ Sperimentazione/learning
- ✅ Privacy (tutto offline)

### Quando EVITARE GPT-2 per traduzioni:
- ❌ Traduzioni accurate richieste
- ❌ Documenti ufficiali
- ❌ Quando conta la precisione

---

## 📁 Script Disponibili

| Script | Descrizione |
|--------|-------------|
| `gpt2-translate.sh` | Wrapper bash per traduzioni quick |
| `gpt2-batch-translate.sh` | Batch translation da file |
| `gpt2-generate.py` | Python wrapper avanzato con few-shot |

### Quick Reference

```bash
# Traduzione singola
~/conductor/workspaces/Onde/moscow/scripts/gpt2-translate.sh "Hello world" italian

# Generazione creativa
python3 ~/conductor/workspaces/Onde/moscow/scripts/gpt2-generate.py "Once upon a time"

# Traduzione con few-shot (migliore)
python3 ~/conductor/workspaces/Onde/moscow/scripts/gpt2-generate.py \
    --translate "Hello, how are you?" --to italian --temperature 0.3
```

---

*Documentazione creata il 28 Gen 2026 - Clawdinho per Onde Project*
*Testato su AMD Radeon RX 7900 XTX via Thunderbolt eGPU*
