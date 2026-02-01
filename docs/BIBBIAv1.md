# BIBBIAv1 - AMD Radeon + ClawdBot + Modelli Open Source

> **Guida COMPLETA per far funzionare ClawdBot con GPU AMD Radeon su macOS**
> Versione 1.1 - 2026-02-01

---

## 🚨 HANDOVER - LEGGI PRIMA DI TUTTO 🚨

### Obiettivo del Progetto
**Far funzionare ClawdBot con modelli open source locali usando TUTTA la VRAM della AMD Radeon 7900 XT (20GB)** invece di dipendere da API cloud (Claude, GPT, etc.).

### Il Problema Che Abbiamo Avuto
Abbiamo passato ore cercando di usare **Ollama** con la GPU AMD su macOS. Vedevamo solo 4.6GB di "VRAM" e i modelli andavano lentissimi o in timeout.

### La Scoperta Fondamentale
**Quei 4.6GB NON erano VRAM - erano RAM!**

Ollama su macOS con AMD Radeon **GIRA SU CPU**, non su GPU. Ollama supporta SOLO Metal (Apple Silicon). Non c'è modo di farlo funzionare su AMD su macOS.

### La Soluzione (Già Documentata!)
La soluzione era già scritta nel documento BIBBIA-RADEON originale: **TinyGrad con le variabili magiche `AMD=1 AMD_LLVM=1`**.

TinyGrad ha un driver userspace che bypassa completamente la mancanza di driver kernel AMD su macOS.

### Cosa Devi Fare (Step-by-Step)

**PASSO 1 - Verifica che la GPU sia collegata:**
```bash
system_profiler SPDisplaysDataType | grep -A10 "External GPU"
```
Deve mostrare "AMD Radeon RX 7900" o simile.

**PASSO 2 - Verifica prerequisiti:**
```bash
# Python 3.11 OBBLIGATORIO
/opt/homebrew/bin/python3.11 --version

# LLVM installato
brew list llvm

# tiktoken installato
/opt/homebrew/bin/python3.11 -c "import tiktoken; print('OK')"
```

**PASSO 3 - Verifica TinyGrad e GPU AMD:**
```bash
cd ~/tinygrad
DEBUG=2 AMD=1 /opt/homebrew/bin/python3.11 -c "from tinygrad import Device; print('GPU AMD OK')"
```
Deve mostrare `gfx1100` e `GPU AMD OK`.

**PASSO 4 - Lancia il server LLM:**
```bash
cd ~/tinygrad
PYTHONPATH=. AMD=1 AMD_LLVM=1 /opt/homebrew/bin/python3.11 \
  tinygrad/apps/llm.py --model qwen3:30b-a3b --serve 11434
```
Il primo avvio è LENTO (compila kernel LLVM). Aspetta.

**PASSO 5 - Test che funziona:**
```bash
curl -X POST http://localhost:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "qwen3:30b-a3b", "messages": [{"role": "user", "content": "Ciao!"}]}'
```

**PASSO 6 - Configura ClawdBot:**
Modifica `~/.clawdbot/clawdbot.json` (vedi sezione "Integrazione ClawdBot" sotto).

### Task Ancora da Completare

| Task | Priorità | Note |
|------|----------|------|
| ✅ Capire perché solo 4.6GB VRAM | FATTO | Era RAM, non VRAM - Ollama usa CPU |
| ✅ Documentare soluzione | FATTO | TinyGrad + AMD=1 AMD_LLVM=1 |
| ⏳ Testare qwen3:30b-a3b su TinyGrad | ALTA | Modello da 20GB per sfruttare VRAM |
| ⏳ Verificare tool calling | ALTA | ClawdBot richiede `tool_calls` array nativo |
| ⏳ Se tool calling non funziona | MEDIA | Implementare workaround parsing JSON |

### Errori Commessi (Per Non Ripeterli)

1. **Passato ore su Ollama** - Non funzionerà MAI su AMD macOS. Usa TinyGrad.
2. **Non letto la documentazione esistente** - La soluzione era già in BIBBIA-RADEON.md
3. **Confuso VRAM con RAM** - Se vedi ~4-5GB con AMD su macOS, probabilmente è CPU/RAM.
4. **Creato documenti multipli** - Ora tutto è in questo singolo file BIBBIAv1.md.

### Contesto: Perché Questo Progetto È Importante
L'obiettivo è **indipendenza AI** - poter usare modelli potenti localmente senza dipendere da provider cloud. Con 20GB di VRAM della Radeon, possiamo far girare modelli 30B che sono competitivi con molte API commerciali.

---

## INDICE

1. [TL;DR - La Soluzione](#tldr---la-soluzione)
2. [Perché Ollama NON Funziona](#perché-ollama-non-funziona)
3. [L'Hack Geniale: TinyGrad](#lhack-geniale-tinygrad)
4. [Setup Completo](#setup-completo)
5. [Modelli Disponibili](#modelli-disponibili)
6. [Raccomandazioni Grok per 20-24GB VRAM](#raccomandazioni-grok-per-20-24gb-vram)
7. [Integrazione ClawdBot](#integrazione-clawdbot)
8. [Tool Calling](#tool-calling)
9. [Troubleshooting](#troubleshooting)
10. [Comandi Utili](#comandi-utili)

---

## TL;DR - La Soluzione

```bash
# L'UNICO modo per usare AMD Radeon su macOS:
cd ~/tinygrad
PYTHONPATH=. AMD=1 AMD_LLVM=1 /opt/homebrew/bin/python3.11 \
  tinygrad/apps/llm.py --model qwen3:30b-a3b --serve 11434
```

**Questo espone un server OpenAI-compatible su `http://localhost:11434/v1`**

---

## Perché Ollama NON Funziona

### Il Problema

| Cosa | Funziona? | Perché |
|------|-----------|--------|
| Ollama su macOS + AMD | ❌ NO | Ollama supporta SOLO Metal (Apple Silicon) |
| ROCm su macOS | ❌ NO | AMD supporta ROCm SOLO su Linux |
| Driver kernel AMD | ❌ NO | Apple non supporta GPU AMD dal 2020 |
| Metal con AMD | ❌ NO | Metal è solo per Apple Silicon |

### Cosa Succedeva

Quando provavamo Ollama su macOS con AMD Radeon:
- **VRAM mostrata: 4.6GB** → Era RAM, non VRAM!
- **Timeout continui** → Girava su CPU
- **Performance scarse** → CPU invece di GPU
- **Modelli grandi impossibili** → OOM su CPU

**Ollama su macOS con AMD = gira su CPU, NON su GPU!**

---

## L'Hack Geniale: TinyGrad

### Le Variabili Magiche

```bash
AMD=1 AMD_LLVM=1
```

**MEMORIZZA QUESTO. È la chiave per tutto.**

### Cosa Fanno

| Variabile | Cosa Fa | Senza |
|-----------|---------|-------|
| `AMD=1` | Forza backend AMD invece di Metal/CPU | Usa M1 GPU (Metal) |
| `AMD_LLVM=1` | Compila kernel con LLVM Homebrew | Cerca ROCm e FALLISCE |

### Perché Funziona

1. **TinyGrad ha un driver USERSPACE** - Bypassa totalmente la mancanza di driver kernel
2. **LLVM Homebrew** - Può generare codice AMD GCN/RDNA come ROCm
3. **PCIe diretto** - La GPU è accessibile via Thunderbolt anche senza driver Apple

### Il Risultato

- **SENZA hack**: GPU AMD inutilizzabile su macOS
- **CON hack**: 20-24GB VRAM completamente disponibili!

---

## Setup Completo

### Hardware Supportato

| Componente | Dettagli |
|------------|----------|
| Mac | MacBook Pro M1/M4 (o successivo) |
| eGPU Enclosure | Razer Core X V2 (o Thunderbolt 3/4 compatibile) |
| GPU | AMD Radeon RX 7900 XTX (24GB) o 7900 XT (20GB) |
| Architettura | GFX1100 = RDNA3 |

### Prerequisiti

```bash
# 1. Python 3.11 (OBBLIGATORIO - non altre versioni!)
brew install python@3.11

# 2. LLVM per compilare kernel AMD
brew install llvm

# 3. tiktoken per tokenizer
/opt/homebrew/bin/python3.11 -m pip install tiktoken
```

### Installazione TinyGrad

```bash
cd ~
git clone https://github.com/tinygrad/tinygrad.git
cd tinygrad
```

### Verifica GPU

```bash
# Test che la GPU AMD sia riconosciuta
cd ~/tinygrad
DEBUG=2 AMD=1 /opt/homebrew/bin/python3.11 -c "from tinygrad import Device; print('GPU AMD OK')"
```

**Output atteso:**
```
am remote:0: mode1 reset
am remote:0: AM_SOC initialized
...firmware loading...
am remote:0: boot done
AMDDevice: opening 0 with target (11, 0, 0) arch gfx1100
GPU AMD OK
```

### Verifica Hardware

```bash
system_profiler SPDisplaysDataType | grep -A5 "External GPU"
```

---

## Modelli Disponibili

### Modelli Supportati da TinyGrad

| Modello | Size | VRAM | Velocità | Comando |
|---------|------|------|----------|---------|
| `qwen3:0.6b` | 0.6B | ~1GB | ~30 tok/s | `--model qwen3:0.6b` |
| `llama3.2:1b` | 1B | ~2GB | ~15 tok/s | `--model llama3.2:1b` |
| `llama3.2:1b-q4` | 1B | ~1GB | ~20 tok/s | `--model llama3.2:1b-q4` |
| `qwen3:1.7b` | 1.7B | ~3GB | ~12 tok/s | `--model qwen3:1.7b` |
| `llama3.2:3b` | 3B | ~4GB | ~10 tok/s | `--model llama3.2:3b` |
| `llama3.2:3b-f16` | 3B | ~6GB | ~8 tok/s | `--model llama3.2:3b-f16` |
| `qwen3:8b` | 8B | ~8GB | ~5 tok/s | `--model qwen3:8b` |
| `llama3.1:8b` | 8B | ~8GB | ~5 tok/s | `--model llama3.1:8b` |
| **`qwen3:30b-a3b`** | **30B** | **~20GB** | **~1 tok/s** | `--model qwen3:30b-a3b` |
| `olmoe` | MoE | ~7GB | ~3 tok/s | `--model olmoe` |

### Raccomandazione per VRAM

| VRAM Disponibile | Modello Consigliato |
|------------------|---------------------|
| 8GB | `llama3.1:8b` o `qwen3:8b` |
| 16GB | `llama3.1:8b` con context lungo |
| 20GB (7900 XT) | **`qwen3:30b-a3b`** |
| 24GB (7900 XTX) | **`qwen3:30b-a3b`** con max context |

---

## Raccomandazioni Grok per 20-24GB VRAM

### Modelli Consigliati (da ricerca Grok 2026-02-01)

Per sfruttare al massimo 20-24GB VRAM, Grok consiglia modelli 30B-70B con quantizzazione:

| Modello | VRAM Stimato | Note |
|---------|--------------|------|
| **Qwen3 30B** | ~20GB | **Disponibile in TinyGrad** |
| Llama 3.2 70B Q4 | ~18-20GB | Best all-rounder (richiede llama.cpp) |
| Qwen 2.5 72B Q4 | ~16-19GB | Top per coding |
| DeepSeek R1 70B Q4 | ~17GB | Reasoning profondo |
| Mixtral 8x22B Q4 | ~15GB | MoE, veloce |

### NON Usare

- **Grok-2**: Proprietario (non open source)
- **Grok-1 314B**: Troppo grande per single GPU
- **Modelli 7B per tool calling**: Non funzionano bene

### Framework Alternativi (se serve più scelta modelli)

| Framework | Pro | Contro |
|-----------|-----|--------|
| **TinyGrad** | Funziona su macOS AMD! | Pochi modelli |
| vLLM AMD | Più modelli, veloce | Solo Linux |
| MLC-LLM | Ottimizzato AMD | Solo Linux |
| llama.cpp ROCm | Max velocità | Solo Linux |

---

## Integrazione ClawdBot

### Lanciare Server TinyGrad

```bash
cd ~/tinygrad
PYTHONPATH=. AMD=1 AMD_LLVM=1 /opt/homebrew/bin/python3.11 \
  tinygrad/apps/llm.py --model qwen3:30b-a3b --serve 11434
```

Questo espone API su `http://localhost:11434/v1/chat/completions`

### Configurazione ClawdBot

Modifica `~/.clawdbot/clawdbot.json`:

```json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "radeon/qwen3:30b-a3b",
        "fallbacks": ["radeon/llama3.1:8b"]
      }
    }
  },
  "models": {
    "mode": "merge",
    "providers": {
      "radeon": {
        "baseUrl": "http://localhost:11434/v1",
        "apiKey": "none",
        "api": "openai-completions",
        "models": [
          {
            "id": "qwen3:30b-a3b",
            "name": "Qwen3 30B (Radeon TinyGrad)",
            "reasoning": false,
            "input": ["text"],
            "cost": {"input": 0, "output": 0, "cacheRead": 0, "cacheWrite": 0},
            "contextWindow": 32768,
            "maxTokens": 8192
          },
          {
            "id": "llama3.1:8b",
            "name": "LLaMA 3.1 8B (Radeon TinyGrad)",
            "reasoning": false,
            "input": ["text"],
            "cost": {"input": 0, "output": 0, "cacheRead": 0, "cacheWrite": 0},
            "contextWindow": 32768,
            "maxTokens": 8192
          }
        ]
      }
    }
  }
}
```

### Test API

```bash
curl -X POST http://localhost:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen3:30b-a3b",
    "messages": [{"role": "user", "content": "Ciao!"}],
    "stream": false
  }'
```

---

## Tool Calling

### Il Problema

ClawdBot richiede **tool calling nativo** - il modello deve rispondere con:

```json
{"tool_calls": [{"function": {"name": "calculator", "arguments": {"x": "5+3"}}}]}
```

NON con JSON nel content:
```json
{"content": "{\"name\": \"calculator\", \"arguments\": ...}"}
```

### Stato Attuale

| Framework | Tool Calling |
|-----------|--------------|
| TinyGrad | ⚠️ DA VERIFICARE |
| Ollama | ✅ Supportato (ma non funziona su AMD macOS) |

### TODO

1. Testare se TinyGrad server supporta tool calling
2. Se non supporta, valutare workaround (parsing JSON dal content)

### Test Tool Calling

```bash
curl -s http://localhost:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen3:30b-a3b",
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
print('Tool calls:', 'YES' if msg.get('tool_calls') else 'NO')
"
```

---

## Troubleshooting

### GPU Non Trovata

1. Verifica eGPU collegata via Thunderbolt
2. `system_profiler SPDisplaysDataType | grep -A5 "External GPU"`
3. Riavvia terminale

### "lock file in use"

Un altro processo sta usando la GPU:
```bash
pkill -f "python.*AMD=1"
```

### Lento al Primo Avvio

Normale - TinyGrad compila i kernel LLVM la prima volta. Successive run più veloci.

### Out of Memory

- Usa modello più piccolo (`llama3.2:1b`)
- Riduci context: `--max_context 2048`

### ClawdBot "context window too small"

ClawdBot richiede minimo 16k context. TinyGrad dovrebbe supportarlo di default con modelli grandi.

---

## Comandi Utili

### Variabili Ambiente

| Variabile | Valore | Descrizione |
|-----------|--------|-------------|
| `AMD` | `1` | Abilita backend AMD |
| `AMD_LLVM` | `1` | Usa LLVM homebrew |
| `PYTHONPATH` | `.` | Include moduli TinyGrad |
| `DEBUG` | `1-7` | Verbosità debug |

### Script di Lancio

Crea `~/start-radeon-llm.sh`:

```bash
#!/bin/bash
cd ~/tinygrad
PYTHONPATH=. AMD=1 AMD_LLVM=1 /opt/homebrew/bin/python3.11 \
  tinygrad/apps/llm.py --model qwen3:30b-a3b --serve 11434
```

```bash
chmod +x ~/start-radeon-llm.sh
```

### Path Importanti

| Path | Descrizione |
|------|-------------|
| `~/tinygrad` | Clone TinyGrad |
| `~/tinygrad/tinygrad/apps/llm.py` | Server LLM |
| `~/start-radeon-llm.sh` | Script avvio |
| `~/.clawdbot/clawdbot.json` | Config ClawdBot |

---

## Fonti

- [TinyGrad GitHub](https://github.com/tinygrad/tinygrad)
- [TinyGrad LLM App](https://github.com/tinygrad/tinygrad/blob/master/tinygrad/apps/llm.py)
- [AMD GPU Performance for LLM](https://valohai.com/blog/amd-gpu-performance-for-llm-inference/)
- [Ollama Tool Calling Docs](https://docs.ollama.com/capabilities/tool-calling)

---

## Changelog

- **v1.1 (2026-02-01)**: Aggiunta sezione HANDOVER dettagliata con step-by-step, errori commessi, task pendenti
- **v1.0 (2026-02-01)**: Consolidamento BIBBIA-RADEON + HANDOVER + CLAWDBOT-SETUP + raccomandazioni Grok

---

*Documento consolidato da: BIBBIA-RADEON.md, HANDOVER-CLAWDBOT-RADEON.md, CLAWDBOT-RADEON-SETUP.md*
*Questo è l'UNICO documento di riferimento. Non creare altri file.*
