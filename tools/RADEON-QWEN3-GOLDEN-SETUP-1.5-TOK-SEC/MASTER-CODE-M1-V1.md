# MASTER-CODE M1-V1 - AMD Radeon RX 7900 XTX + Qwen3-32B

> **GOLDEN SETUP CERTIFICATO** - ~1 tok/s con Qwen3-32B Thinking Mode
> **Hardware**: MacBook Pro M1 + eGPU Razer Core X V2 + RX 7900 XTX
> **Data certificazione**: 2026-02-02
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

| Fase | Tempo | Note |
|------|-------|------|
| Model load | ~30s | Caricamento GGUF da SSD |
| Prima request (compilazione) | ~5-6 min | Compila kernel LLVM per la shape |
| Request successive | **~1 tok/s** | Kernel cachato |

### Confronto con setup precedente
- **v1.2 (con pre-warmup)**: Memory leak dopo 6-7 warmup lengths
- **M1-V1 (con --no-warmup)**: Stabile, ~1 tok/s

---

## HARDWARE CERTIFICATO

| Componente | Dettagli |
|------------|----------|
| **Mac** | MacBook Pro M1 |
| **eGPU Enclosure** | Razer Core X V2 (Thunderbolt 3) |
| **GPU** | AMD Radeon RX 7900 XTX (24GB VRAM) |
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

## VARIABILI AMBIENTE

| Variabile | Valore | Descrizione |
|-----------|--------|-------------|
| `AMD` | `1` | **OBBLIGATORIO** - Abilita backend AMD |
| `AMD_LLVM` | `1` | **OBBLIGATORIO** - Usa LLVM Homebrew |
| `PYTHONPATH` | `.` | Include moduli TinyGrad |
| `SHOW_THINKING` | `0/1` | Mostra blocchi `<think>` |
| `DEBUG` | `0-7` | Verbosità (0=off, 7=max) |

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

## CHANGELOG

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
