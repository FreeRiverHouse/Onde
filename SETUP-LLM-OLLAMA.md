# Setup LLM Locale con Ollama

**Status:** FUNZIONANTE E STABILE
**Data:** 2026-01-30

---

## Endpoint

| Servizio | URL |
|----------|-----|
| **GUI Chat** | http://192.168.1.111:8080/ |
| **API Ollama** | http://192.168.1.111:11434/ |

---

## Modelli Disponibili

| Modello | Size | Velocità | Uso |
|---------|------|----------|-----|
| `llama3.2:3b` | 2GB | **2-3s** | Chat veloce, domande semplici |
| `llama31-8b:latest` | 4.9GB | 15-30s | Chat qualità, ragionamento |
| `deepseek-coder:6.7b` | 3.8GB | 1-3min | **Coding** (lento ma preciso) |
| `qwen2.5-coder:7b` | 4.7GB | 1-3min | **Coding** alternativo |

---

## API Examples

### Chat semplice (veloce)
```bash
curl http://192.168.1.111:11434/api/generate -d '{
  "model": "llama3.2:3b",
  "prompt": "Ciao, come stai?",
  "stream": false
}'
```

### Coding (DeepSeek)
```bash
curl http://192.168.1.111:11434/api/generate -d '{
  "model": "deepseek-coder:6.7b",
  "prompt": "Write a Python function to merge two sorted lists",
  "stream": false
}'
```

### Chat con contesto (OpenAI-style)
```bash
curl http://192.168.1.111:11434/api/chat -d '{
  "model": "llama31-8b:latest",
  "messages": [
    {"role": "user", "content": "What is Python?"},
    {"role": "assistant", "content": "Python is a programming language."},
    {"role": "user", "content": "Give me a hello world example"}
  ],
  "stream": false
}'
```

---

## Da Python

```python
import requests

def ask_llm(prompt, model="llama3.2:3b"):
    r = requests.post(
        "http://192.168.1.111:11434/api/generate",
        json={"model": model, "prompt": prompt, "stream": False},
        timeout=300
    )
    return r.json()["response"]

# Veloce
print(ask_llm("Hello!"))

# Coding
print(ask_llm("Write is_prime(n) in Python", model="deepseek-coder:6.7b"))
```

---

## Per Clawdinho (PM)

Usa LLM locale per task di coding semplici:

```python
# ~/Projects/Onde/tools/ask-coder.py
import requests
import sys

def ask_coder(prompt):
    r = requests.post(
        "http://192.168.1.111:11434/api/generate",
        json={
            "model": "deepseek-coder:6.7b",
            "prompt": f"Write clean, working code. {prompt}",
            "stream": False
        },
        timeout=300
    )
    return r.json()["response"]

if __name__ == "__main__":
    print(ask_coder(" ".join(sys.argv[1:])))
```

**Workflow:**
1. Clawdinho pianifica task
2. Chiama `ask_coder("Write function X")`
3. Revisiona output
4. Integra nel codebase

---

## Per Ondinho (Minecraft Skin)

```python
# Idee per skin
ask_llm("Suggest 5 Minecraft skin ideas for a space theme", model="llama3.2:3b")

# Palette colori
ask_llm("What hex colors for a fire mage Minecraft skin?", model="llama3.2:3b")

# Codice PIL
ask_llm("Python code to change red pixels to blue in a PNG", model="deepseek-coder:6.7b")
```

---

## Avviare i Servizi

### 1. Ollama (API)
```bash
# Già in esecuzione come servizio
# Se serve riavviare:
OLLAMA_HOST=0.0.0.0:11434 ollama serve
```

### 2. GUI Web
```bash
cd ~/Projects/Onde/llm-chat
python3 -m http.server 8080 --bind 0.0.0.0
```

---

## Troubleshooting

| Problema | Soluzione |
|----------|-----------|
| Connection refused | Ollama non attivo: `OLLAMA_HOST=0.0.0.0:11434 ollama serve` |
| Timeout | Modello grande, usa `llama3.2:3b` per test veloci |
| Model not found | `ollama pull llama3.2:3b` |

---

## Note

- Usa **Metal (M1)** invece della Radeon - più stabile
- LLaMA 3.2 3B è il migliore per velocità
- DeepSeek/Qwen sono lenti ma migliori per coding
- La GUI funziona da qualsiasi device sulla LAN (iPhone, altro Mac, etc.)

---

**Server:** Mac M1 @ 192.168.1.111
**Ollama version:** 0.14.3
