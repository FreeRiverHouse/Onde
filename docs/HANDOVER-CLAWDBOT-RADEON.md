# Handover: ClawdBot + Radeon Open Source Models

> **Data**: 2026-02-01
> **Da**: Claude Opus 4.5 (Mac M4)
> **A**: Claude su Mac M1
> **Task**: Far funzionare ClawdBot con modelli open source locali su Radeon 7900XT

---

## TL;DR - Stato Attuale

| Item | Status |
|------|--------|
| Radeon Ollama | ✅ Attivo su 192.168.1.111:11434 |
| Download qwen2.5:32b | ⏳ ~23% (4.2GB/18.5GB) - LENTO |
| qwen7b-16k (16k ctx) | ✅ Creato ma timeout quando 32b download attivo |
| ClawdBot config | ✅ Aggiornato per usare radeon/qwen7b-16k |
| Tool calling 7B | ❌ Non funziona (output JSON in content invece di tool_calls) |
| VRAM utilization | ❌ Solo 4.6GB/20GB usati (23%) |

---

## Il Problema Principale

**ClawdBot richiede modelli che supportano tool calling nativo.**

I modelli 7B (come qwen2.5:7b-instruct) outputtano tool calls come JSON testuale nel campo `content`:
```json
{"content": "{\"name\": \"calculator\", \"arguments\": {\"expression\": \"2+2\"}}"}
```

Invece di usare il campo `tool_calls` strutturato:
```json
{"tool_calls": [{"function": {"name": "calculator", "arguments": {"expression": "2+2"}}}]}
```

**Soluzione**: Usare modelli più grandi (32B+) che gestiscono tool calling correttamente.

---

## Download in Corso

```bash
# Check progress
curl -s -X POST http://192.168.1.111:11434/api/pull \
  -d '{"name": "qwen2.5:32b", "stream": true}' --max-time 5 | tail -1 | \
  python3 -c "import sys,json; d=json.loads(sys.stdin.read()); print(f'{d.get(\"completed\",0)/(1024**3):.1f}GB / {d.get(\"total\",0)/(1024**3):.1f}GB')"
```

**Problema attuale**: Il download sta bloccando/rallentando le altre richieste a Ollama.

---

## Quando Download Completo - TODO

### 1. Verificare download completato
```bash
curl -s http://192.168.1.111:11434/api/tags | grep qwen2.5:32b
```

### 2. Unload altri modelli e caricare 32b
```bash
# Unload qwen7b-16k
curl -X POST http://192.168.1.111:11434/api/generate \
  -d '{"model": "qwen7b-16k", "keep_alive": 0}'

# Load qwen2.5:32b
curl -X POST http://192.168.1.111:11434/api/generate \
  -d '{"model": "qwen2.5:32b", "prompt": "hello", "stream": false}'
```

### 3. Verificare VRAM usage
```bash
curl -s http://192.168.1.111:11434/api/ps | python3 -c "
import sys,json
d = json.load(sys.stdin)
for m in d.get('models',[]):
    print(f'{m[\"name\"]}: {m[\"size_vram\"]/(1024**3):.1f}GB VRAM')
"
```

**Aspettativa**: ~18GB VRAM (90% dei 20GB disponibili)

### 4. Testare tool calling
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
print('Has tool_calls:', bool(msg.get('tool_calls')))
if msg.get('tool_calls'):
    print('SUCCESS - Tool calling works!')
else:
    print('FAIL - Tool calls in content:', msg.get('content','')[:200])
"
```

### 5. Se tool calling funziona, aggiornare ClawdBot config
```bash
# Edit ~/.clawdbot/clawdbot.json
# Change primary model to: "radeon/qwen2.5:32b"
```

### 6. Creare modello 32b con 16k context (se necessario)
```bash
curl -X POST http://192.168.1.111:11434/api/create -d '{
  "name": "qwen32b-16k",
  "from": "qwen2.5:32b",
  "parameters": {"num_ctx": 16384}
}'
```

---

## Configurazione ClawdBot Attuale

**File**: `~/.clawdbot/clawdbot.json`

```json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "radeon/qwen7b-16k",
        "fallbacks": ["radeon/qwen2.5:7b-instruct-q4_K_M"]
      }
    }
  },
  "models": {
    "providers": {
      "radeon": {
        "baseUrl": "http://192.168.1.111:11434/v1",
        "apiKey": "ollama",
        "api": "openai-completions"
      }
    }
  }
}
```

---

## Consigli da Grok (Implementare se 32B non basta)

### Modelli Alternativi per 20GB VRAM
| Modello | VRAM | Note |
|---------|------|------|
| Llama 3.2 70B Q4 | ~18-20GB | Best all-rounder |
| Qwen 2.5 72B Q3 | ~16-19GB | Richiede quantizzazione aggressiva |
| DeepSeek R1 70B Q4 | ~17GB | Reasoning |
| Mixtral 8x22B Q4 | ~15GB | MoE, veloce |

### Framework Alternativi (se Ollama non funziona bene)
- **vLLM AMD fork**: `github.com/ROCm/vllm` - più veloce
- **MLC-LLM**: `mlc.ai` - ottimizzato per AMD
- **llama.cpp con ROCm**: Max velocità

---

## Problemi Noti

### 1. Download blocca Ollama
Quando c'è un download attivo, le altre richieste vanno in timeout.
**Workaround**: Aspettare che il download finisca.

### 2. VRAM non utilizzata
Ollama usa solo ~5GB anche con modelli piccoli.
**Soluzione**: Usare modelli più grandi che forzano più VRAM.

### 3. Context window
ClawdBot richiede minimo 16k context.
**Soluzione**: Creare Modelfile con `PARAMETER num_ctx 16384`

---

## Comandi Utili

```bash
# Status modelli
curl -s http://192.168.1.111:11434/api/tags | python3 -c "import sys,json; [print(f'{m[\"name\"]}: {m[\"size\"]/(1024**3):.1f}GB') for m in json.load(sys.stdin).get('models',[])]"

# VRAM usage
curl -s http://192.168.1.111:11434/api/ps | python3 -c "import sys,json; [print(f'{m[\"name\"]}: {m[\"size_vram\"]/(1024**3):.1f}GB') for m in json.load(sys.stdin).get('models',[])]"

# Unload model
curl -X POST http://192.168.1.111:11434/api/generate -d '{"model": "MODEL_NAME", "keep_alive": 0}'

# Clean partial downloads (SSH to Radeon Mac)
ssh user@192.168.1.111 "rm -f ~/.ollama/models/blobs/*-partial"
```

---

## File Correlati

- `docs/CLAWDBOT-RADEON-SETUP.md` - Guida setup completa
- `~/clawd/memory/CLAWDBOT-OLLAMA-SETUP.md` - Note di ricerca
- `~/.clawdbot/clawdbot.json` - Configurazione ClawdBot

---

## Next Steps per M1

1. **Aspettare download qwen2.5:32b** (controlla progress)
2. **Testare tool calling su 32b**
3. **Se funziona**: Aggiornare ClawdBot config
4. **Se non funziona**: Provare modello più grande (70B Q4) o framework alternativo
5. **Documentare risultati** in questo file

---

*Ultimo aggiornamento: 2026-02-01 20:30 PST*
