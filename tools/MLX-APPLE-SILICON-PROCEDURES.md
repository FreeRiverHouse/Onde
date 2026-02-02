# 🍎 MLX - LLM LOCALI SU APPLE SILICON M4

**Hardware:** MacBook Pro M4 Max (24GB RAM)
**Backend:** MLX (Apple Machine Learning Framework)
**Location:** ~/mlx-env (virtual environment)

## ⚠️ REGOLA ASSOLUTA
```
1. SEMPRE attivare l'ambiente: source ~/mlx-env/bin/activate
2. MLX usa Metal GPU automaticamente - nessuna configurazione richiesta
3. Modelli in ~/.cache/huggingface/hub/
```

---

## 📊 MODELLI DISPONIBILI (SCARICATI)

| Modello | Size | Peak RAM | Use Case | Velocità |
|---------|------|----------|----------|----------|
| **MistralSmall-Creative-24B-MLX-4bit** ⭐ | ~12GB | 13.5GB | Scrittura creativa, chat | 18.2 tok/s |
| **Qwen2.5-32B-Instruct-4bit** | ~18GB | 18.6GB | Traduzioni, testo, codice | 12.7 tok/s |
| **Qwen3-32B-MLX-4bit** | ~18GB | ~19GB | Chat, reasoning avanzato | ~12 tok/s |
| **DeepSeek-R1-Distill-Qwen-32B-4bit** | ~18GB | ~19GB | Reasoning, math | ~11 tok/s |
| **Qwen2.5-14B-Instruct-4bit** | ~8GB | ~9GB | Task veloci | ~25 tok/s |

**Totale spazio modelli:** ~60GB

**Location modelli:**
- HuggingFace cache: `~/.cache/huggingface/hub/`
- Modelli locali convertiti: `~/Models/`

---

## 🚀 SETUP INIZIALE (GIÀ FATTO)

### Installazione MLX (una volta)
```bash
# Crea virtual environment
python3 -m venv ~/mlx-env

# Attiva
source ~/mlx-env/bin/activate

# Installa MLX
pip install mlx mlx-lm
```

### Verifica installazione
```bash
source ~/mlx-env/bin/activate
python3 -c "import mlx.core as mx; print(f'MLX version: {mx.__version__}')"
# Output: MLX version: 0.30.4
```

### Verifica GPU Metal attiva
```bash
source ~/mlx-env/bin/activate
python3 -c "
import mlx.core as mx
print(f'Default device: {mx.default_device()}')
print(f'Metal available: {mx.metal.is_available()}')
"
# Output:
# Default device: Device(gpu, 0)
# Metal available: True
```

---

## 🎨 MISTRAL SMALL CREATIVE 24B - SCRITTURA CREATIVA

**IL MIGLIOR MODELLO PER SCRITTURA CREATIVA SU QUESTO MAC**

### Specifiche
| Proprietà | Valore |
|-----------|--------|
| **Nome** | MistralSmall-Creative-24B-MLX-4bit |
| **Path locale** | `~/Models/MistralSmall-Creative-24B-MLX-4bit/` |
| **Origine** | Convertito da `Sorawiz/MistralSmall-Creative-24B` |
| **Quantizzazione** | 4-bit (MLX) |
| **Size su disco** | ~12.3GB (3 file safetensors) |
| **Peak RAM** | 13.5GB |
| **Velocità generazione** | 18.2 tok/s |
| **Velocità prompt** | 66.5 tok/s |
| **Data conversione** | 2026-02-02 |
| **Testato** | ✅ FUNZIONA PERFETTAMENTE |

### Struttura File
```
~/Models/MistralSmall-Creative-24B-MLX-4bit/
├── model-00001-of-00003.safetensors  (4.9GB)
├── model-00002-of-00003.safetensors  (4.9GB)
├── model-00003-of-00003.safetensors  (2.5GB)
├── config.json
├── tokenizer.json
├── tokenizer_config.json
├── special_tokens_map.json
├── chat_template.jinja
├── model.safetensors.index.json
└── README.md
```

### Uso
```bash
source ~/mlx-env/bin/activate
mlx_lm.generate \
  --model ~/Models/MistralSmall-Creative-24B-MLX-4bit \
  --prompt "Scrivi una storia creativa su..." \
  --max-tokens 500 \
  --temp 0.8
```

### Test Output (2026-02-02)
```
Prompt: "Ciao, presentati brevemente in italiano:"
Output: "Ciao! Sono Mistral Small 3, un modello linguistico di grandi
        dimensioni sviluppato da Mistral AI, un'azienda francese..."

Performance:
- Prompt: 186 tokens @ 66.5 tok/s
- Generation: 100 tokens @ 18.2 tok/s
- Peak memory: 13.527 GB
```

### Come è stato Convertito
```bash
# 1. Download manuale safetensors da HuggingFace (browser)
#    https://huggingface.co/Sorawiz/MistralSmall-Creative-24B/tree/main
#    File: model-00001-of-00010.safetensors ... model-00010-of-00010.safetensors

# 2. Download config files
cd ~/Downloads
curl -LO "https://huggingface.co/Sorawiz/MistralSmall-Creative-24B/resolve/main/config.json"
curl -LO "https://huggingface.co/Sorawiz/MistralSmall-Creative-24B/resolve/main/tokenizer.json"
curl -LO "https://huggingface.co/Sorawiz/MistralSmall-Creative-24B/resolve/main/tokenizer_config.json"
curl -LO "https://huggingface.co/Sorawiz/MistralSmall-Creative-24B/resolve/main/model.safetensors.index.json"
curl -LO "https://huggingface.co/Sorawiz/MistralSmall-Creative-24B/resolve/main/special_tokens_map.json"

# 3. Organizza file
mkdir -p ~/Models/MistralSmall-Creative-24B
mv ~/Downloads/model-*.safetensors ~/Models/MistralSmall-Creative-24B/
mv ~/Downloads/*.json ~/Models/MistralSmall-Creative-24B/

# 4. Converti per MLX (4-bit quantization)
source ~/mlx-env/bin/activate
mlx_lm.convert \
  --hf-path ~/Models/MistralSmall-Creative-24B \
  --mlx-path ~/Models/MistralSmall-Creative-24B-MLX-4bit \
  --quantize \
  --q-bits 4

# Risultato: 44GB → 12.3GB
```

### Warning Tokenizer (ignorabile)
```
The tokenizer you are loading... with an incorrect regex pattern...
This will lead to incorrect tokenization. You should set fix_mistral_regex=True
```
**Questo warning è ignorabile** - il modello funziona correttamente.

---

## 🌍 1. TRADUZIONI (Qwen 2.5 32B - CONSIGLIATO)

### Traduzione Inglese → Italiano
```bash
source ~/mlx-env/bin/activate
mlx_lm.generate \
  --model mlx-community/Qwen2.5-32B-Instruct-4bit \
  --prompt "Translate this text from English to Italian:

The quick brown fox jumps over the lazy dog. Machine learning is revolutionizing how we process language.

Translation:" \
  --max-tokens 500 \
  --temp 0.3
```

### Traduzione Italiano → Inglese
```bash
source ~/mlx-env/bin/activate
mlx_lm.generate \
  --model mlx-community/Qwen2.5-32B-Instruct-4bit \
  --prompt "Traduci questo testo dall'italiano all'inglese:

La volpe marrone veloce salta sopra il cane pigro. L'apprendimento automatico sta rivoluzionando il modo in cui elaboriamo il linguaggio.

Translation:" \
  --max-tokens 500 \
  --temp 0.3
```

### Script wrapper: ~/translate-mlx.sh
```bash
#!/bin/bash
# Usage: ~/translate-mlx.sh "testo da tradurre" [en|it]

TEXT="$1"
TARGET="${2:-it}"  # default italiano

source ~/mlx-env/bin/activate

if [ "$TARGET" = "en" ]; then
  PROMPT="Translate this Italian text to English:\n\n$TEXT\n\nTranslation:"
else
  PROMPT="Translate this English text to Italian:\n\n$TEXT\n\nTranslation:"
fi

python3 -m mlx_lm.generate \
  --model mlx-community/Qwen2.5-32B-Instruct-4bit \
  --prompt "$PROMPT" \
  --max-tokens 1000 \
  --temp 0.3
```

---

## 📝 2. GENERAZIONE TESTO

### Testo creativo
```bash
source ~/mlx-env/bin/activate
mlx_lm.generate \
  --model mlx-community/Qwen2.5-32B-Instruct-4bit \
  --prompt "Scrivi una breve storia per bambini su un robot amico:" \
  --max-tokens 500 \
  --temp 0.8
```

### Testo tecnico
```bash
source ~/mlx-env/bin/activate
mlx_lm.generate \
  --model mlx-community/Qwen2.5-32B-Instruct-4bit \
  --prompt "Spiega come funziona il machine learning in termini semplici:" \
  --max-tokens 300 \
  --temp 0.3
```

---

## 💻 3. GENERAZIONE CODICE

### Python
```bash
source ~/mlx-env/bin/activate
mlx_lm.generate \
  --model mlx-community/Qwen2.5-32B-Instruct-4bit \
  --prompt "Write a Python function that checks if a number is prime. Include docstring and type hints:

\`\`\`python" \
  --max-tokens 300 \
  --temp 0.2
```

### TypeScript
```bash
source ~/mlx-env/bin/activate
mlx_lm.generate \
  --model mlx-community/Qwen2.5-32B-Instruct-4bit \
  --prompt "Write a TypeScript function that fetches data from an API with error handling:

\`\`\`typescript" \
  --max-tokens 400 \
  --temp 0.2
```

---

## 🧠 4. REASONING AVANZATO (DeepSeek R1)

Per task che richiedono ragionamento step-by-step:

```bash
source ~/mlx-env/bin/activate
mlx_lm.generate \
  --model mlx-community/DeepSeek-R1-Distill-Qwen-32B-4bit \
  --prompt "Risolvi questo problema matematico passo per passo:

Un treno parte da Roma alle 8:00 viaggiando a 120 km/h verso Milano (distanza 600 km).
Un altro treno parte da Milano alle 9:00 viaggiando a 100 km/h verso Roma.
A che ora si incontrano e a quale distanza da Roma?

Soluzione:" \
  --max-tokens 800 \
  --temp 0.1
```

---

## ⚡ 5. TASK VELOCI (Qwen 2.5 14B)

Per task semplici dove serve velocità:

```bash
source ~/mlx-env/bin/activate
mlx_lm.generate \
  --model mlx-community/Qwen2.5-14B-Instruct-4bit \
  --prompt "Riassumi in 2 frasi: L'intelligenza artificiale sta trasformando ogni settore dell'economia mondiale." \
  --max-tokens 100 \
  --temp 0.3
```

---

## 🔧 PARAMETRI IMPORTANTI

| Parametro | Valori | Uso |
|-----------|--------|-----|
| `--temp` | 0.0-1.0 | 0.1-0.3 per precisione, 0.7-0.9 per creatività |
| `--max-tokens` | 1-4096 | Lunghezza massima output |
| `--top-p` | 0.0-1.0 | Nucleus sampling (default 1.0) |
| `--repetition-penalty` | 1.0-2.0 | Penalizza ripetizioni (default 1.0) |

### Combinazioni consigliate

**Traduzione accurata:**
```
--temp 0.3 --max-tokens 1000
```

**Scrittura creativa:**
```
--temp 0.8 --max-tokens 500 --repetition-penalty 1.1
```

**Codice:**
```
--temp 0.2 --max-tokens 400
```

**Reasoning:**
```
--temp 0.1 --max-tokens 800
```

---

## 📊 PERFORMANCE (M4 Max 24GB)

| Modello | Prompt (tok/s) | Generation (tok/s) | Peak RAM |
|---------|----------------|-------------------|----------|
| **MistralSmall-Creative-24B-4bit** ⭐ | 66.5 | **18.2** | **13.5 GB** |
| Qwen2.5-32B-4bit | 5.5 | 12.7 | 18.6 GB |
| Qwen2.5-14B-4bit | 12 | 25 | 9 GB |
| DeepSeek-R1-32B | 5 | 11 | 19 GB |

---

## 🐍 USO PROGRAMMATICO (Python)

### Script base
```python
#!/usr/bin/env python3
"""MLX LLM client per uso programmatico."""

from mlx_lm import load, generate

def translate(text: str, to_lang: str = "italian") -> str:
    """Traduce testo usando Qwen 2.5."""
    model, tokenizer = load("mlx-community/Qwen2.5-32B-Instruct-4bit")

    prompt = f"Translate to {to_lang}:\n\n{text}\n\nTranslation:"

    response = generate(
        model,
        tokenizer,
        prompt=prompt,
        max_tokens=1000,
        temp=0.3
    )
    return response

def generate_text(prompt: str, creative: bool = False) -> str:
    """Genera testo."""
    model, tokenizer = load("mlx-community/Qwen2.5-32B-Instruct-4bit")

    return generate(
        model,
        tokenizer,
        prompt=prompt,
        max_tokens=500,
        temp=0.8 if creative else 0.3
    )

if __name__ == "__main__":
    # Test traduzione
    result = translate("Hello, how are you today?")
    print(result)
```

### Con chat template (conversazione)
```python
#!/usr/bin/env python3
"""Chat con MLX."""

from mlx_lm import load, generate

model, tokenizer = load("mlx-community/Qwen2.5-32B-Instruct-4bit")

messages = [
    {"role": "system", "content": "Sei un assistente utile che risponde in italiano."},
    {"role": "user", "content": "Come funziona l'intelligenza artificiale?"}
]

prompt = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)

response = generate(model, tokenizer, prompt=prompt, max_tokens=500, temp=0.7)
print(response)
```

---

## 🚨 TROUBLESHOOTING

### "Model not found"
```bash
# I modelli si scaricano automaticamente al primo uso
# Verifica connessione internet e spazio disco
df -h ~/.cache/huggingface/
```

### "Out of memory"
```bash
# Usa modelli più piccoli
# Qwen2.5-14B invece di 32B
# Oppure chiudi altre app che usano GPU
```

### Velocità lenta
```bash
# Verifica che Metal sia attivo
python3 -c "import mlx.core as mx; print(mx.metal.is_available())"

# Chiudi altre app GPU-intensive (Chrome, Unity, etc.)
```

### Versione deprecata warning
```bash
# Usa il nuovo formato comando:
mlx_lm.generate ...
# invece di:
python3 -m mlx_lm.generate ...
```

---

## 📁 STRUTTURA FILE

```
~/mlx-env/                          # Virtual environment MLX

~/.cache/huggingface/hub/           # Modelli HuggingFace (auto-download)
    models--mlx-community--Qwen2.5-32B-Instruct-4bit/
    models--mlx-community--Qwen2.5-14B-Instruct-4bit/
    models--mlx-community--DeepSeek-R1-Distill-Qwen-32B-4bit/
    models--Qwen--Qwen3-32B-MLX-4bit/

~/Models/                           # Modelli convertiti manualmente
    MistralSmall-Creative-24B-MLX-4bit/  ⭐ MIGLIOR MODELLO CREATIVO

~/translate-mlx.sh                  # Script wrapper traduzioni
~/run-qwen3.sh                      # Script per Qwen 3
~/chat-qwen3.sh                     # Script chat interattiva
```

---

## 🆚 CONFRONTO: MLX vs TinyGrad (Radeon)

| Aspetto | MLX (M4) | TinyGrad (Radeon 7900 XT) |
|---------|----------|---------------------------|
| **Setup** | Semplice (pip install) | Complesso (TinyGPU.app) |
| **Modelli** | HuggingFace MLX | HuggingFace GGUF |
| **Velocità 32B** | 12.7 tok/s | 8-10 tok/s |
| **RAM/VRAM** | 24GB shared | 16GB dedicata |
| **Pro** | Integrato, stabile | Più VRAM dedicata |
| **Contro** | Solo Apple | Setup fragile |

**Consiglio:** Usa MLX su M4 per tutto. TinyGrad solo se serve VRAM dedicata per task specifici.

---

## ✅ QUICK REFERENCE

```bash
# Attiva ambiente
source ~/mlx-env/bin/activate

# Traduci EN→IT
mlx_lm.generate --model mlx-community/Qwen2.5-32B-Instruct-4bit \
  --prompt "Translate to Italian: Hello world" --max-tokens 100 --temp 0.3

# Traduci IT→EN
mlx_lm.generate --model mlx-community/Qwen2.5-32B-Instruct-4bit \
  --prompt "Translate to English: Ciao mondo" --max-tokens 100 --temp 0.3

# Genera testo
mlx_lm.generate --model mlx-community/Qwen2.5-32B-Instruct-4bit \
  --prompt "Scrivi una poesia sul mare" --max-tokens 200 --temp 0.8

# Task veloce (14B)
mlx_lm.generate --model mlx-community/Qwen2.5-14B-Instruct-4bit \
  --prompt "Riassumi: ..." --max-tokens 100 --temp 0.3
```

---

*Creato: 2026-02-01*
*Ultimo aggiornamento: 2026-02-02 - Aggiunto MistralSmall-Creative-24B*
*Hardware: MacBook Pro M4 Max 24GB RAM*
*MLX version: 0.30.4*
*mlx-lm version: 0.30.5*
