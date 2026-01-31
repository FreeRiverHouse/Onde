# Istruzioni LLM su Radeon RX 7900 XTX

**Per:** Clawdinho, Ondinho, e altri agenti
**Aggiornato:** 2026-01-30
**Status:** FUNZIONANTE

---

## TL;DR

LLaMA 3.1 8B gira sulla GPU Radeon. Si usa via CLI o API HTTP.

---

## Prerequisiti (OGNI VOLTA)

1. **TinyGPU.app** deve essere aperta
2. **eGPU** collegata alla porta Thunderbolt corretta (Port 2, Receptacle 2)

### Verifica rapida

```bash
# Verifica eGPU
system_profiler SPThunderboltDataType | grep -A5 "Device Name"
# Deve mostrare: Core X V2, Status: Device connected

# Verifica TinyGPU
ps aux | grep -i tinygpu | grep -v grep
# Se non c'è: open /Applications/TinyGPU.app
```

---

## Uso CLI (Semplice)

```bash
cd ~/Projects/tinygrad-fix

# Singolo prompt
PYTHONPATH=. AMD=1 AMD_LLVM=1 python3.11 scripts/coding-assistant.py "Write a function to..."

# Interattivo
PYTHONPATH=. AMD=1 AMD_LLVM=1 python3.11 scripts/coding-assistant.py -i

# Con più token
PYTHONPATH=. AMD=1 AMD_LLVM=1 python3.11 scripts/coding-assistant.py "prompt" -t 500
```

---

## Uso API (Per Ondinho e altri)

### Avvia il server

```bash
cd ~/Projects/tinygrad-fix
PYTHONPATH=. AMD=1 AMD_LLVM=1 python3.11 scripts/llm-api-server.py

# Output:
# API Server running on http://0.0.0.0:8080
# Model: llama-3.1-8b-instruct
```

### Chiamate API (formato OpenAI)

```bash
# Health check
curl http://MAC_IP:8080/health

# Chat completion
curl http://MAC_IP:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-3.1-8b-instruct",
    "messages": [{"role": "user", "content": "Write a Python function to sort a list"}],
    "max_tokens": 200
  }'

# Text completion
curl http://MAC_IP:8080/v1/completions \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "def fibonacci(n):",
    "max_tokens": 100
  }'
```

### Da Python (OpenAI SDK)

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://MAC_IP:8080/v1",
    api_key="not-needed"  # API key non richiesta
)

response = client.chat.completions.create(
    model="llama-3.1-8b-instruct",
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response.choices[0].message.content)
```

---

## Trovare IP del Mac

```bash
# IP locale
ipconfig getifaddr en0  # WiFi
ipconfig getifaddr en1  # Ethernet

# Tutti gli IP
ifconfig | grep "inet " | grep -v 127.0.0.1
```

---

## Performance

| Metrica | Valore |
|---------|--------|
| Modello | LLaMA 3.1 8B Q4_K_M |
| VRAM usata | ~5GB |
| Token/sec | ~0.6-1.0 |
| First token | ~3-5s |
| Load time | ~35s |

---

## Troubleshooting

| Problema | Soluzione |
|----------|-----------|
| `device add1:0001 not found` | eGPU non collegata o porta sbagliata |
| `failed to load library comgr` | Manca `AMD_LLVM=1` |
| `No device connected` | Controlla cavo TB |
| Server non risponde | Verifica firewall Mac |

### Firewall

Se il server non è raggiungibile dalla LAN:

```bash
# Temporaneamente disabilita firewall
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate off

# Oppure aggiungi eccezione
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /opt/homebrew/bin/python3.11
```

---

## Modelli Testati

| Modello | Status | Note |
|---------|--------|------|
| LLaMA 3.1 8B | FUNZIONA | Unico stabile |
| DeepSeek-Coder 6.7B | Tokenizer incompatibile | Si carica ma non genera testo |
| CodeLlama 13B/34B | MemoryError | TinyGrad bug |
| Qwen 7B/14B | MemoryError | TinyGrad bug |

---

## File Importanti

```
~/Projects/tinygrad-fix/
├── scripts/
│   ├── coding-assistant.py   # CLI interattivo
│   └── llm-api-server.py     # API server HTTP
└── tinygrad/apps/llm.py      # Core LLM

/Volumes/DATI-SSD/llm-models/
└── Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf  # 4.6GB
```

---

## Quick Start per Ondinho

```bash
# Sul Mac (una volta)
cd ~/Projects/tinygrad-fix
PYTHONPATH=. AMD=1 AMD_LLVM=1 python3.11 scripts/llm-api-server.py &

# Da qualsiasi macchina sulla LAN
curl http://192.168.X.X:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hello!"}]}'
```

---

**Firmato:** Claude Code, 2026-01-30
