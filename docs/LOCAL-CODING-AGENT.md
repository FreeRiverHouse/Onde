# Local Coding Agent - Radeon 7900 XT

## Obiettivo
Creare sub-agenti locali che usano modelli open-source sulla Radeon 7900 XT per:
- Ridurre consumo token Claude
- Permettere a Clawdinho di restare attivo più a lungo
- Delegare coding tasks a modelli locali

## Hardware
- **GPU:** AMD Radeon RX 7900 XT (16-20GB VRAM)
- **Backend:** TinyGrad (già configurato)
- **Alternative:** Ollama (per gestione modelli)

## Modelli Candidati per Coding

### Tier 1 - Migliori per Code (7B, ~4-5GB)
1. **Qwen2.5-Coder-7B-Instruct** ⭐
   - Alibaba, eccellente per code
   - Supporta 128k context
   - Ottimo per completamento, refactoring, debugging
   - `ollama pull qwen2.5-coder:7b`

2. **DeepSeek-Coder-6.7B-Instruct**
   - Molto forte su coding tasks
   - Buon reasoning
   - `ollama pull deepseek-coder:6.7b-instruct`

3. **CodeLlama-7B-Instruct**
   - Meta, derivato da LLaMA 2
   - Buono per code completion
   - `ollama pull codellama:7b-instruct`

### Tier 2 - Più Grandi (13B+, ~8-10GB)
4. **Qwen2.5-Coder-14B-Instruct**
   - Versione più potente
   - Richiede ~10GB VRAM
   - `ollama pull qwen2.5-coder:14b`

5. **DeepSeek-Coder-33B** (quantized)
   - Molto potente ma richiede quantizzazione
   - `ollama pull deepseek-coder:33b-instruct-q4_0`

### Tier 3 - Reasoning Heavy (Nuovi 2025)
6. **DeepSeek-R1** (quando disponibile)
   - Il nuovo hype, reasoning molto forte
   - Da monitorare per versioni quantized

## Architettura Sub-Agent

```
┌─────────────────────────────────────────────────────────┐
│                    Clawdinho (Claude)                   │
│                   - Coordinamento                       │
│                   - Decisioni complesse                 │
│                   - Interfaccia utente                  │
└─────────────────────┬───────────────────────────────────┘
                      │
                      │ Delega task via API locale
                      │
┌─────────────────────▼───────────────────────────────────┐
│              Local Coding Agent (Ollama)                │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ Qwen2.5    │  │ DeepSeek   │  │ CodeLlama  │     │
│  │ Coder 7B   │  │ Coder 6.7B │  │ 7B         │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                         │
│                  Radeon 7900 XT (16GB VRAM)            │
└─────────────────────────────────────────────────────────┘
```

## API Locale

Ollama espone API REST su `http://localhost:11434`:

```bash
# Generate completion
curl http://localhost:11434/api/generate -d '{
  "model": "qwen2.5-coder:7b",
  "prompt": "Write a Python function to...",
  "stream": false
}'

# Chat completion
curl http://localhost:11434/api/chat -d '{
  "model": "qwen2.5-coder:7b",
  "messages": [
    {"role": "user", "content": "Fix this bug..."}
  ]
}'
```

## Wrapper Script

```python
#!/usr/bin/env python3
"""Local coding agent wrapper for Clawdinho."""

import requests
import json

OLLAMA_URL = "http://localhost:11434"
DEFAULT_MODEL = "qwen2.5-coder:7b"

def query_local_coder(prompt: str, model: str = DEFAULT_MODEL) -> str:
    """Query local coding model via Ollama."""
    response = requests.post(
        f"{OLLAMA_URL}/api/generate",
        json={
            "model": model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.1,  # Low temp for code
                "num_ctx": 8192,     # Context window
            }
        }
    )
    return response.json()["response"]

def code_review(code: str, model: str = DEFAULT_MODEL) -> str:
    """Review code for bugs and improvements."""
    prompt = f"""Review this code for bugs, improvements, and best practices:

```
{code}
```

Provide specific suggestions with code examples."""
    return query_local_coder(prompt, model)

def implement_feature(description: str, model: str = DEFAULT_MODEL) -> str:
    """Implement a feature from description."""
    prompt = f"""Implement this feature:

{description}

Provide clean, well-documented code."""
    return query_local_coder(prompt, model)
```

## Task Delegation Strategy

### Tasks da delegare al modello locale:
- ✅ Code completion / boilerplate
- ✅ Bug fixing semplice
- ✅ Refactoring meccanico
- ✅ Generazione test
- ✅ Documentazione
- ✅ Traduzioni codice (Python → TypeScript)

### Tasks che richiedono Claude:
- ❌ Architettura complessa
- ❌ Decisioni di design
- ❌ Debugging non banale
- ❌ Interazione con l'utente
- ❌ Coordinamento multi-step

## Prossimi Passi

1. [x] Scaricare Qwen2.5-Coder-7B via Ollama
2. [ ] Testare su task di coding semplice
3. [ ] Creare wrapper Python per API Ollama
4. [ ] Integrare con Clawdbot come sub-agent
5. [ ] Benchmark: confronto velocità/qualità vs Claude
6. [ ] Setup TinyGrad per GPU acceleration (se Ollama non usa Radeon)

## ⚠️ IMPORTANTE: Ollama NON supporta AMD su macOS!

**Scoperta (30 Gen 2026):**
- Ollama su macOS usa SOLO Metal (Apple Silicon GPU)
- Ollama NON può usare la Radeon 7900 XT
- Anche modelli piccoli (3B) crashano su M1 per memoria insufficiente

**Soluzione: TinyGrad!**
- TinyGrad supporta la Radeon 7900 XT
- Già testato con LLaMA 3 8B → funziona!
- Path: `~/tinygrad/examples/llama3.py`

## Prossimo step: Sub-agent via TinyGrad

```bash
# Run LLaMA 3 8B on Radeon
cd ~/tinygrad
python3 examples/llama3.py --model TriAiExperiments/SFR-Iterative-DPO-LLaMA-3-8B-R \
  --prompt "Write a Python function..."
```

## Alternative per coding models su Radeon

1. **LLaMA 3 8B** (già testato, funziona)
   - Buono per code ma non specializzato

2. **Qwen2.5-Coder** via TinyGrad (da testare)
   - Richiede conversione modello
   - Potenzialmente migliore per code

3. **CodeLlama** via TinyGrad (da testare)
   - Meta, specializzato code

## Note

- Ollama = inutile per Radeon su Mac
- TinyGrad = la strada giusta
- Onde-bot (M4 Pro) può usare Ollama senza problemi (più RAM)
