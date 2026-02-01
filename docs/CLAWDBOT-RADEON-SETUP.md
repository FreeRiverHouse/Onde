# ClawdBot + Radeon 7900XT Setup Guide

> Istruzioni per configurare ClawdBot con modelli open source su Radeon 7900XT (20GB VRAM)
> Basato su ricerca e consigli di Grok (2026-02-01)

## TL;DR - Stato Attuale

- **Radeon IP**: `192.168.1.111:11434` (Ollama server)
- **Download in corso**: `qwen2.5:32b` (18.5GB) - userà ~18GB dei 20GB VRAM
- **Problema risolto**: Context window 16k (ClawdBot richiede minimo 16k)
- **Problema in corso**: Modelli 7B non fanno tool calling correttamente

## Il Problema Principale

I modelli piccoli (7B-14B) **non supportano tool calling nativo**:
- Outputtano JSON raw nel campo `content` invece di usare `tool_calls` array
- ClawdBot richiede `tool_calls` strutturato per funzionare

**Soluzione**: Usare modelli più grandi (32B+) che gestiscono meglio i tool.

## Configurazione Hardware

```
Mac Radeon: 192.168.1.111
├── GPU: Radeon 7900XT (20GB VRAM)
├── Ollama: porta 11434
└── API: OpenAI-compatible /v1/chat/completions

Mac M4 (client):
└── ClawdBot configurato per connettersi a Radeon
```

## Modelli Raccomandati (da Grok)

Per 20GB VRAM, usare modelli 32B-70B con quantizzazione Q4:

| Modello | VRAM | Note |
|---------|------|------|
| **qwen2.5:32b** | ~18GB | In download, buon compromesso |
| Llama 3.2 70B Q4 | ~18-20GB | Best all-rounder |
| Qwen 2.5 72B Q4 | ~16-19GB | Top per coding |
| DeepSeek R1 70B Q4 | ~17GB | Reasoning profondo |
| Mixtral 8x22B Q4 | ~15GB | Veloce (MoE) |

**NON usare**:
- Grok-2 (proprietario, non open source)
- Grok-1 314B (troppo grande per single GPU)
- Modelli 7B per tool calling (non funzionano bene)

## Comandi Utili

### Monitoraggio (SEMPRE prima di operazioni)

```bash
# Check modelli su Radeon
curl -s http://192.168.1.111:11434/api/tags | python3 -c "
import sys,json
d = json.load(sys.stdin)
for m in d.get('models',[]):
    print(f'{m[\"name\"]}: {m[\"size\"]/(1024**3):.1f}GB')
"

# Check VRAM usage
curl -s http://192.168.1.111:11434/api/ps | python3 -c "
import sys,json
d = json.load(sys.stdin)
for m in d.get('models',[]):
    print(f'{m[\"name\"]}: {m[\"size_vram\"]/(1024**3):.1f}GB VRAM, ctx={m.get(\"context_length\")}')
"

# Check download progress
curl -s -X POST http://192.168.1.111:11434/api/pull \
  -d '{"name": "qwen2.5:32b", "stream": true}' --max-time 5 | tail -1 | \
  python3 -c "import sys,json; d=json.loads(sys.stdin.read()); print(f'{d.get(\"completed\",0)/(1024**3):.1f}GB / {d.get(\"total\",0)/(1024**3):.1f}GB')"
```

### Gestione Modelli

```bash
# Pull nuovo modello
curl -X POST http://192.168.1.111:11434/api/pull -d '{"name": "qwen2.5:32b"}'

# Unload modello dalla VRAM
curl -X POST http://192.168.1.111:11434/api/generate \
  -d '{"model": "MODEL_NAME", "keep_alive": 0}'

# Creare modello con context window custom (es. 16k)
curl -X POST http://192.168.1.111:11434/api/create -d '{
  "name": "qwen7b-16k",
  "from": "qwen2.5:7b-instruct-q4_K_M",
  "parameters": {"num_ctx": 16384}
}'

# Pulire download parziali (SSH sul Mac Radeon)
rm -f ~/.ollama/models/blobs/*-partial
```

### Test Tool Calling

```bash
curl -s http://192.168.1.111:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen2.5:32b",
    "messages": [{"role": "user", "content": "Calculate 5+3 using the calculator tool"}],
    "tools": [{
      "type": "function",
      "function": {
        "name": "calculator",
        "description": "Performs math calculations",
        "parameters": {
          "type": "object",
          "properties": {"expression": {"type": "string"}},
          "required": ["expression"]
        }
      }
    }]
  }' | python3 -c "
import sys,json
d = json.load(sys.stdin)
msg = d['choices'][0]['message']
print('Content:', msg.get('content'))
print('Tool calls:', 'YES' if msg.get('tool_calls') else 'NO')
if msg.get('tool_calls'):
    print(json.dumps(msg['tool_calls'], indent=2))
"
```

## Configurazione ClawdBot

File: `~/.clawdbot/clawdbot.json`

```json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "radeon/qwen2.5:32b",
        "fallbacks": ["radeon/qwen7b-16k"]
      }
    }
  },
  "models": {
    "mode": "merge",
    "providers": {
      "radeon": {
        "baseUrl": "http://192.168.1.111:11434/v1",
        "apiKey": "ollama",
        "api": "openai-completions",
        "models": [
          {
            "id": "qwen2.5:32b",
            "name": "Qwen 2.5 32B (Radeon)",
            "reasoning": false,
            "input": ["text"],
            "cost": {"input": 0, "output": 0, "cacheRead": 0, "cacheWrite": 0},
            "contextWindow": 32768,
            "maxTokens": 8192
          },
          {
            "id": "qwen7b-16k",
            "name": "Qwen 2.5 7B 16K (Radeon)",
            "reasoning": false,
            "input": ["text"],
            "cost": {"input": 0, "output": 0, "cacheRead": 0, "cacheWrite": 0},
            "contextWindow": 16384,
            "maxTokens": 8192
          }
        ]
      }
    }
  }
}
```

## Prossimi Passi (TODO per M1)

1. **Verificare download completato**:
   ```bash
   curl -s http://192.168.1.111:11434/api/tags | grep qwen2.5:32b
   ```

2. **Caricare e testare qwen2.5:32b**:
   ```bash
   # Load model
   curl -X POST http://192.168.1.111:11434/api/generate \
     -d '{"model": "qwen2.5:32b", "prompt": "hello", "stream": false}'

   # Verificare VRAM usage (~18GB expected)
   curl -s http://192.168.1.111:11434/api/ps
   ```

3. **Testare tool calling** (vedi sezione sopra)

4. **Se tool calling non funziona con 32B**, provare:
   - `qwen2.5:72b` con Q3 quantization
   - Framework alternativi: vLLM (github.com/ROCm/vllm) o MLC-LLM

5. **Aggiornare ClawdBot config** con il modello funzionante

## Framework Alternativi (se Ollama non basta)

Da Grok:
- **vLLM AMD fork**: `github.com/ROCm/vllm` - più veloce di Ollama
- **MLC-LLM**: `mlc.ai` - ottimizzato per AMD
- **llama.cpp con ROCm**: Max velocità, custom quantization

## Problemi Noti

1. **Context window troppo piccolo**: ClawdBot richiede 16k minimo
   - Soluzione: Creare Modelfile con `PARAMETER num_ctx 16384`

2. **VRAM non utilizzata al 100%**: Ollama su AMD usa solo ~5GB con modelli piccoli
   - Soluzione: Usare modelli più grandi (32B+)

3. **Tool calls come testo**: Modelli 7B outputtano JSON in content
   - Soluzione: Usare modelli 32B+ che supportano tool_calls nativo

## Fonti

- [Ollama Tool Calling Docs](https://docs.ollama.com/capabilities/tool-calling)
- [ROCm vLLM](https://github.com/ROCm/vllm)
- [Working ClawdBot Gist](https://gist.github.com/Hegghammer/86d2070c0be8b3c62083d6653ad27c23)
