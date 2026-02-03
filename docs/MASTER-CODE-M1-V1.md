# MASTER-CODE M1-V1.4 - AMD Radeon RX 7900 XTX 20GB

> **GOLDEN SETUP CERTIFICATO** - 4.3 tok/s Qwen2.5-7B | 3 tok/s Qwen3-32B
> **Hardware**: MacBook Pro M1 8GB + eGPU Razer Core X V2 + RX 7900 XTX 20GB
> **Data certificazione**: 2026-02-02 (aggiornato 21:30)
> **Autore**: Mattia Petrucciani

---

## ⚠️ PREREQUISITI OBBLIGATORI

### 1. Avviare TinyGPU
```bash
open /Applications/TinyGPU.app
```
**IMPORTANTE:** TinyGPU DEVE essere in esecuzione prima di usare la GPU AMD.

### 2. Stoppare Ollama (occupa porta 11434)
```bash
launchctl stop com.ollama.server
launchctl unload ~/Library/LaunchAgents/com.ollama.server.plist
```

### 3. Rimuovere lock file
```bash
rm -f /tmp/am_remote:0.lock
```

---

## COMANDI CERTIFICATI

### Server API (RACCOMANDATO)
```bash
cd /Users/mattia/Projects/Onde/vendor/tinygrad

PYTHONPATH=. AMD=1 AMD_LLVM=1 /opt/homebrew/bin/python3.11 \
  tinygrad/apps/llm_q4.py --model qwen3:32b --max_context 512 --serve 11434 --no-warmup
```

**Flags:**
- `--no-warmup` - **OBBLIGATORIO** - evita memory leak durante pre-warmup
- `--max_context 512` - context window (aumentabile a 2048 se serve)
- `--serve 11434` - porta API (OpenAI-compatible)

### Test API
```bash
curl -s http://localhost:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"qwen3:32b","messages":[{"role":"user","content":"Ciao"}],"stream":false,"max_tokens":50}'
```

### CLI Mode (test rapido)
```bash
cd /Users/mattia/Projects/Onde/vendor/tinygrad

PYTHONPATH=. AMD=1 AMD_LLVM=1 /opt/homebrew/bin/python3.11 \
  tinygrad/apps/llm_q4.py --model qwen3:32b --prompt "What is 2+2?" --count 30
```

---

## PERFORMANCE

### Qwen2.5-7B Q4 (BENCHMARK CERTIFICATO 2026-02-02)

| Fase | Tempo | Note |
|------|-------|------|
| Model load | ~5s | Caricamento GGUF da /tmp |
| Prima request (compilazione) | ~156s | Compila kernel LLVM per la shape |
| Prefill (dopo cache) | **~4-5 tok/s** | Processing input tokens |
| Generation (dopo cache) | **~4.3 tok/s** | Generating output tokens |
| VRAM usage | **4.36 GB** | Stabile durante inferenza |

### Qwen2.5-14B Q4

| Fase | Tempo | Note |
|------|-------|------|
| Generation (dopo cache) | **~3-4 tok/s** | Generating output tokens |
| VRAM usage | **~8.4 GB** | - |

### Qwen3-32B Q4

| Fase | Tempo | Note |
|------|-------|------|
| Model load | ~30s | Caricamento GGUF da SSD |
| Prima request (compilazione) | ~3-4 min | Compila kernel LLVM per la shape |
| Prefill (dopo cache) | **~4 tok/s** | Processing input tokens |
| Generation (dopo cache) | **~3 tok/s** | Generating output tokens |
| VRAM usage | **~18 GB** | - |

### Confronto con setup precedente
- **v1.2 (con pre-warmup)**: Memory leak dopo 6-7 warmup lengths
- **M1-V1 (con --no-warmup)**: Stabile, ~1 tok/s
- **M1-V1.2 (fix max_tokens + JIT)**: Stabile, ~3-4 tok/s, risposte coerenti

---

## HARDWARE CERTIFICATO

| Componente | Dettagli |
|------------|----------|
| **Mac** | MacBook Pro M1 8GB RAM |
| **eGPU Enclosure** | Razer Core X V2 (Thunderbolt 3) |
| **GPU** | AMD Radeon RX 7900 XTX (**20GB VRAM**) |
| **Device ID** | 0x744c |
| **Vendor** | 0x1002 (AMD) |
| **Architettura** | GFX1100 = RDNA3 |

### Verifica Hardware
```bash
system_profiler SPDisplaysDataType | grep -A10 "Radeon"
```

---

## THINKING MODE

Qwen3 genera `<think>...</think>` blocks con ragionamento interno.

- **Default:** filtrato automaticamente (output pulito)
- **Per vedere il thinking:**
  ```bash
  # Via env var
  SHOW_THINKING=1 python llm_q4.py --model qwen3:32b --serve 11434 --no-warmup

  # Via API request
  curl -X POST http://localhost:11434/v1/chat/completions \
    -H "Content-Type: application/json" \
    -d '{"model":"qwen3:32b","messages":[{"role":"user","content":"Ciao"}],"show_thinking":true}'
  ```

---

## TROUBLESHOOTING

### "Address already in use" (porta 11434)
```bash
# Verifica cosa occupa la porta
lsof -i:11434

# Se è Ollama, stoppalo
launchctl stop com.ollama.server
launchctl unload ~/Library/LaunchAgents/com.ollama.server.plist
```

### "lock file in use"
```bash
rm -f /tmp/am_remote:0.lock
```

### GPU non trovata
1. Verifica TinyGPU in esecuzione: `ps aux | grep TinyGPU`
2. Verifica eGPU collegata: `system_profiler SPDisplaysDataType`
3. Riavvia TinyGPU: `pkill TinyGPU && open /Applications/TinyGPU.app`

### MemoryError durante warmup
**NON usare pre-warmup!** Usare sempre `--no-warmup`.

---

## OTTIMIZZAZIONI FUTURE (DA ESPLORARE)

### Testate e funzionanti
- ✅ LLVM O3 optimization (+25% prefill)
- ✅ LLVM verification skip (compilazione più veloce)
- ✅ JIT per generation (single token, T=1)
- ✅ Disable prefill_jit (evita shape mismatch)

### Testate, nessun miglioramento per Q4
- ❌ USE_TC/TC_OPT (tensor cores) - Q4 dequant→float non matcha bene
- ❌ BEAM search - troppo lento per uso pratico

### Da esplorare in futuro
- Fused dequantization kernel (dequant + matmul in un unico kernel)
- Kernel custom per Q4 matmul
- Memory prefetching ottimizzato
- Batch processing per context più lunghi
- **llama.cpp con HIP backend** (richiede Linux nativo, 30-78 tok/s!)
- **Modelli Mamba/RWKV** - architettura SSM, 4-5x più veloce dei Transformer

### Modelli alternativi da testare
| Modello | Tipo | Perché potrebbe essere migliore |
|---------|------|--------------------------------|
| [mamba-2.8b-hf-GGUF](https://huggingface.co/bartowski/mamba-2.8b-hf-GGUF) | SSM | No KV cache, memoria costante |
| [rwkv-6-world-7b-GGUF](https://huggingface.co/bartowski/rwkv-6-world-7b-GGUF) | SSM | Linear attention, velocità non degrada |
| [mamba-gpt-7b-GGUF](https://huggingface.co/gultar/mamba-gpt-7b-GGUF) | Hybrid | Mamba + GPT merge |

### Limiti teorici
- RX 7900 XTX: 960 GB/s memory bandwidth
- Per 14B Q4 (~8GB pesi): 8.3ms/token minimo teorico (~120 tok/s)
- **Realtà**: Transformer decode = memory-bound → 3 tok/s
- **Perché 40x gap**: ogni token richiede leggere TUTTI i pesi + KV cache
- **llama.cpp HIP**: 30-78 tok/s (kernel ottimizzati nativi AMD)

### VM ROCm su Mac? NO
- macOS **non supporta** PCIe/GPU passthrough (limitazione Apple)
- M1 non può virtualizzare x86 ROCm efficentemente
- **Soluzione**: Linux nativo su PC separato o dual boot (non M1)

---

## VARIABILI AMBIENTE

| Variabile | Valore | Descrizione |
|-----------|--------|-------------|
| `AMD` | `1` | **OBBLIGATORIO** - Abilita backend AMD |
| `AMD_LLVM` | `1` | **OBBLIGATORIO** - Usa LLVM Homebrew |
| `PYTHONPATH` | `.` | Include moduli TinyGrad |
| `SHOW_THINKING` | `0/1` | Mostra blocchi `<think>` |
| `DEBUG` | `0-7` | Verbosità (0=off, 7=max) |
| `LLVM_O3` | `1` | **RACCOMANDATO** - Usa O3 invece di O2 (+25% prefill) |
| `LLVM_NOVERIFY` | `1` | **RACCOMANDATO** - Disabilita verification (compilazione più veloce) |

### Variabili Testate (non migliorano Q4 inference)
| Variabile | Valore | Note |
|-----------|--------|------|
| `USE_TC` | `1` | Tensor cores - non aiuta per Q4 (pesi int4, non float16) |
| `TC_OPT` | `2` | Padding per TC - stesso motivo sopra |
| `BEAM` | `1-4` | Beam search - troppo lento per uso pratico |

### Comando Ottimizzato (RACCOMANDATO)
```bash
PYTHONPATH=. AMD=1 AMD_LLVM=1 LLVM_O3=1 LLVM_NOVERIFY=1 /opt/homebrew/bin/python3.11 \
  tinygrad/apps/llm_q4.py --model qwen2.5:14b --max_context 4096 --serve 11434 --no-warmup
```

---

## MODELLI SU SSD

```
/Volumes/DATI-SSD/llm-models/
├── Qwen3-32B-Q4_K_M.gguf         (18.0 GB) ✅ CERTIFICATO
├── Qwen2.5-32B-Instruct-Q4_K_M.gguf (18.5 GB)
├── Qwen2.5-14B-Instruct-Q4_K_M.gguf (8.4 GB)
└── Qwen2.5-7B-Instruct-Q4_K_M.gguf  (4.4 GB)
```

---

## CACHE KERNEL

I kernel LLVM compilati sono salvati in:
```
~/Library/Caches/tinygrad/cache.db  (~6-7GB)
```

La cache persiste tra sessioni, ma le shape diverse richiedono ricompilazione.

---

## SCRIPT AVVIO COMPLETO

```bash
#!/bin/bash
# start-qwen3-server.sh

# 1. Avvia TinyGPU
open /Applications/TinyGPU.app
sleep 5

# 2. Stoppa Ollama
launchctl stop com.ollama.server 2>/dev/null
launchctl unload ~/Library/LaunchAgents/com.ollama.server.plist 2>/dev/null

# 3. Rimuovi lock
rm -f /tmp/am_remote:0.lock

# 4. Avvia server
cd /Users/mattia/Projects/Onde/vendor/tinygrad
PYTHONPATH=. AMD=1 AMD_LLVM=1 /opt/homebrew/bin/python3.11 \
  tinygrad/apps/llm_q4.py --model qwen3:32b --max_context 512 --serve 11434 --no-warmup
```

---

---

## CLAWDBOT INTEGRATION (Qwen2.5-14B)

> Per uso con ClawdBot, usare Qwen2.5-14B (più veloce, meno VRAM)

### Config ClawdBot (~/.clawdbot/clawdbot.json)

```json
{
  "models": {
    "mode": "merge",
    "providers": {
      "tinygrad": {
        "baseUrl": "http://127.0.0.1:11435/v1",
        "apiKey": "tinygrad",
        "api": "openai-completions",
        "models": [{
          "id": "qwen2.5:14b",
          "name": "Qwen2.5-14B (TinyGrad Q4)",
          "reasoning": false,
          "input": ["text"],
          "cost": { "input": 0, "output": 0, "cacheRead": 0, "cacheWrite": 0 },
          "contextWindow": 4096,
          "maxTokens": 4096
        }]
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

### Wrapper Tool-Stripping

ClawdBot manda 23 tools - i modelli locali non li supportano.
Il wrapper li rimuove:

**Path:** `/Users/mattia/Projects/Onde/tools/clawdbot-local-llm/wrappers/m1-qwen-wrapper.js`

**Porte:**
- `11434` - Server TinyGrad diretto
- `11435` - Wrapper (ClawdBot punta qui)

### Script Avvio ClawdBot

```bash
/Users/mattia/Projects/Onde/tools/clawdbot-local-llm/start-clawdbot-qwen.sh
```

### Differenze Qwen2.5-14B vs Qwen3-32B

| | Qwen2.5-14B | Qwen3-32B |
|---|---|---|
| VRAM | ~8.4 GB | ~18 GB |
| Speed | **~3-4 tok/s** | ~1 tok/s |
| max_context consigliato | 4096 | 512 |
| Thinking mode | No | Si |

---

## 📊 BENCHMARK vs M1 MLX (2026-02-02)

**Test: Qwen2.5-7B-Instruct 4-bit**

| Hardware | Framework | VRAM | Tok/s | Winner |
|----------|-----------|------|-------|--------|
| **M1 8GB** | MLX Metal | 4.37 GB | **6.5 tok/s** | ✅ **+51% faster** |
| **Radeon 20GB** | TinyGrad AMD | 4.36 GB | 4.3 tok/s | - |

**Verdetto:**
- **M1 MLX vince su modelli ≤8B** (più veloce, zero setup, Metal nativo)
- **Radeon TinyGrad vince su modelli >12B** (20GB VRAM vs 8GB, gestisce 32B models)

---

## CHANGELOG

- **M1-V1.4 (2026-02-02 21:30)**: Benchmark certificato Qwen2.5-7B + confronto M1 MLX
  - Testato Qwen2.5-7B Q4: **4.3 tok/s** post-cache (CERTIFICATO)
  - Confronto diretto M1 vs Radeon: M1 vince +51% su 7B
  - Confermato limite M1: 8GB VRAM = max 8B parametri 4-bit
  - Aggiornato VRAM Radeon: 20GB (non 24GB)
  - Documentato setup MLX workspace su SSD
- **M1-V1.3 (2026-02-02 20:30)**: Ottimizzazioni LLVM e test Tensor Cores
  - Aggiunto `LLVM_O3=1` per optimization level aggressivo (+25% prefill)
  - Aggiunto `LLVM_NOVERIFY=1` per compilazione più veloce
  - Testato `USE_TC=1 TC_OPT=2` (tensor cores) - nessun miglioramento per Q4 inference
  - Performance stabile: **~5-6 tok/s prefill, ~3 tok/s generation**
  - Documentate variabili ambiente per tuning avanzato
- **M1-V1.2 (2026-02-02 18:45)**: Performance e stabilità migliorati
  - Fix bug `max_tokens` - ora rispetta il parametro API OpenAI
  - Disabilitato `prefill_jit` (causava errori shape mismatch)
  - Performance: **~4 tok/s prefill, ~3 tok/s generation** (da ~1 tok/s)
  - Risposte ora coerenti (non più garbage output)
- **M1-V1.1 (2026-02-03)**: Aggiunta sezione ClawdBot + Qwen2.5-14B
- **M1-V1 (2026-02-02 12:00)**: Setup stabile con --no-warmup
  - Rimosso pre-warmup (causa memory leak)
  - Aggiunto flag `--no-warmup`
  - Documentate procedure prerequisiti (TinyGPU, Ollama stop)
  - Confermata velocità ~1 tok/s post-compilazione
- **v1.4 (2026-02-02 10:30)**: Fix thinking mode output
- **v1.3 (2026-02-02 10:00)**: Tentativo warmup granulare (memory leak)
- **v1.2 (2026-02-02 02:30)**: Documentazione warmup
- **v1.1 (2026-02-02 01:30)**: Bug fix `pt` unbound
- **v1 (2026-02-02 00:15)**: Setup iniziale certificato

---

*NOTA: Questo file documenta il setup per MacBook Pro M1 con eGPU AMD.*
