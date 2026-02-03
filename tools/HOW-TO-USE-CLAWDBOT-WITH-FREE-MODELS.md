# How to Use ClawdBot with Free Local Models

**Last Updated:** 2026-02-03
**Status:** Work in Progress

## Overview

ClawdBot (ora chiamato OpenClaw/Moltbot) supporta modelli locali tramite provider OpenAI-compatibili come Ollama, TinyGrad, llama.cpp, ecc.

---

## Requisiti Hardware

| Requisito | Minimo | Raccomandato |
|-----------|--------|--------------|
| VRAM GPU | 24GB | 48GB |
| Context Window | 16K | 64K+ |
| Modello | 14B Q4 | 72B Q3 |

**Nota importante:** La documentazione ufficiale di OpenClaw afferma che servono **almeno 64,000 token di context** per task multi-step affidabili.

---

## Configurazione Provider

### Struttura Base clawdbot.json

```json
{
  "models": {
    "mode": "merge",
    "providers": {
      "PROVIDER_NAME": {
        "baseUrl": "http://127.0.0.1:11434/v1",
        "apiKey": "local",
        "api": "openai-completions",
        "authHeader": false,
        "models": [
          {
            "id": "model-id",
            "name": "Display Name",
            "reasoning": false,
            "input": ["text"],
            "cost": { "input": 0, "output": 0, "cacheRead": 0, "cacheWrite": 0 },
            "contextWindow": 32768,
            "maxTokens": 8192
          }
        ]
      }
    }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "PROVIDER_NAME/model-id",
        "fallbacks": ["anthropic/claude-opus-4-5"]
      }
    }
  }
}
```

### Parametri Critici (Da Documentazione Ufficiale ClawdBot)

**Fonte:** `/opt/homebrew/lib/node_modules/clawdbot/docs/concepts/model-providers.md`

| Parametro | Default | Note |
|-----------|---------|------|
| `api` | - | Usa `"openai-completions"` per server OpenAI-compatibili |
| `baseUrl` | - | DEVE includere `/v1` (es. `http://host:port/v1`) |
| `contextWindow` | `200000` | Default alto! Imposta al valore effettivo del server |
| `maxTokens` | `8192` | Limite output |
| `reasoning` | `false` | Modello supporta chain-of-thought |
| `input` | `["text"]` | Tipi input supportati |
| `cost` | `{all: 0}` | Costi (0 per locale) |

**NOTA:** `authHeader: false` NON è documentato ufficialmente - probabilmente non valido.

---

## Setup TinyGrad + AMD GPU

### Hardware Testato
- MacBook Pro M1
- eGPU Razer Core X V2 (Thunderbolt)
- AMD Radeon RX 7900 XTX (24GB VRAM)

### Prerequisiti
1. **TinyGPU.app** - DEVE essere in esecuzione per accesso GPU
2. **LLVM Homebrew** - `brew install llvm`
3. **Python 3.11** - `/opt/homebrew/bin/python3.11`

### Server TinyGrad

```bash
cd /Users/mattia/Projects/Onde/vendor/tinygrad

# Avvia server con Qwen2.5-14B
PYTHONPATH=. AMD=1 AMD_LLVM=1 /opt/homebrew/bin/python3.11 \
  tinygrad/apps/llm_q4.py \
  --model qwen2.5:14b \
  --max_context 4096 \
  --serve 11434

# NOTA: max_context DEVE corrispondere a contextWindow in clawdbot.json
```

### Tool-Stripping Wrapper

ClawdBot manda 23 tools con ogni richiesta. I modelli locali non supportano tool calling.
Il wrapper rimuove i tools prima di inoltrarli al server.

**File:** `/Users/mattia/Projects/Onde/tools/clawdbot-local-llm/wrappers/m1-qwen-wrapper.js`

**Avvio:**
```bash
launchctl start com.clawdbot.m1-wrapper
```

**Porte:**
- `11434` - TinyGrad server diretto
- `11435` - Wrapper (ClawdBot deve puntare qui)

---

## Configurazione Corrente (TinyGrad + Qwen2.5-14B)

```json
{
  "models": {
    "mode": "merge",
    "providers": {
      "tinygrad": {
        "baseUrl": "http://127.0.0.1:11435/v1",
        "apiKey": "tinygrad",
        "api": "openai-completions",
        "models": [
          {
            "id": "qwen2.5:14b",
            "name": "Qwen2.5-14B (TinyGrad Q4)",
            "reasoning": false,
            "input": ["text"],
            "cost": { "input": 0, "output": 0, "cacheRead": 0, "cacheWrite": 0 },
            "contextWindow": 4096,
            "maxTokens": 2048
          }
        ]
      }
    }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "tinygrad/qwen2.5:14b",
        "fallbacks": ["anthropic/claude-opus-4-5"]
      }
    }
  }
}
```

---

## Problemi Noti

### 1. "No reply from agent"

**Cause possibili:**
- Server non risponde (controllare con `curl http://127.0.0.1:11434/`)
- Timeout troppo breve (prima risposta può richiedere 30+ secondi senza warmup)
- context mismatch tra config e server

**Soluzione:**
- Assicurarsi che `max_context` del server = `contextWindow` della config
- Aggiungere `"authHeader": false` alla config del provider

### 2. JIT Compilation Lenta

Il primo token può richiedere 30+ secondi perché TinyGrad deve compilare i kernel LLVM.

**Soluzione:**
- NON usare `--no-warmup` in produzione
- Fare warmup con diverse lunghezze: `[16, 32, 64, 128, 256]`

### 3. Server Bloccato

TinyGrad può bloccarsi su richieste lunghe.

**Soluzione:**
- Limitare `max_context` a 4096 per risposte più rapide
- Riavviare il server se bloccato: `pkill -f llm_q4.py`

### 4. VRAM Insufficiente

Qwen3-32B richiede ~24GB solo per i pesi, niente rimane per KV cache.

**Soluzione:**
- Usare Qwen2.5-14B (~8.4GB) lascia ~15GB per KV cache
- Ridurre max_context per ridurre uso KV cache

---

## Modelli Testati

| Modello | VRAM | Context | Funziona? | Note |
|---------|------|---------|-----------|------|
| Qwen2.5-14B Q4 | ~8.4GB | 4096 | Si | Lento ma funziona |
| Qwen3-32B Q4 | ~24GB | 512 max | Parziale | VRAM esaurita con context > 512 |
| LLaMA 3.1 8B Q4 | ~4.9GB | OK | Si | Buon rapporto velocità/qualità |

---

## Variabili Ambiente Utili

```bash
# TinyGrad
export PYTHONPATH=/path/to/tinygrad
export AMD=1
export AMD_LLVM=1

# Ollama
export OLLAMA_CONTEXT_LENGTH=16384
export OLLAMA_FLASH_ATTENTION=1
export OLLAMA_KEEP_ALIVE=24h  # Tieni modello caricato
```

---

## Comandi Diagnostici

```bash
# Status servizi
pgrep -lf llm_q4.py
pgrep -lf m1-qwen-wrapper
pgrep -lf clawdbot

# Test connettività
curl -s http://127.0.0.1:11434/  # TinyGrad
curl -s http://127.0.0.1:11435/health  # Wrapper

# Test chat
curl -sN -X POST "http://127.0.0.1:11435/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -d '{"model":"qwen2.5:14b","messages":[{"role":"user","content":"Hi"}],"stream":true}'

# Log ClawdBot
tail -f ~/.clawdbot/logs/gateway.log
tail -f ~/.clawdbot/logs/m1-wrapper.log
```

---

## Riferimenti

- [OpenClaw Docs - Ollama](https://docs.openclaw.ai/providers/ollama)
- [GitHub Gist - Working Setup](https://gist.github.com/Hegghammer/86d2070c0be8b3c62083d6653ad27c23)
- [Medium - ClawdBot + Ollama](https://medium.com/@jacklandrin/clawdbot-moltbot-ollama-as-your-personal-assistant-32f2bdb4a6bc)
- [AnswerOverflow - Config Discussion](https://www.answeroverflow.com/m/1467110610947805407)

---

---

## Script Master

**Per avviare tutto automaticamente:**

```bash
/Users/mattia/Projects/Onde/tools/clawdbot-local-llm/MASTER-CODE-M1-v1.sh
```

Questo script:
1. Verifica TinyGPU.app attiva
2. Killa processi TinyGrad esistenti
3. Avvia server TinyGrad con warmup JIT
4. Aspetta che warmup completi
5. Verifica wrapper attivo
6. Riavvia ClawdBot

---

## TODO

- [ ] Aumentare timeout ClawdBot se possibile
- [ ] Provare modelli più grandi quando disponibile più VRAM
- [ ] Ottimizzare warmup lengths
