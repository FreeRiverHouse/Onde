# BIBBIA - Setup AMD Radeon RX 7900 XTX su macOS

> Istruzioni COMPLETE per usare la GPU AMD Radeon con TinyGrad su Mac M1
> Creato: 2026-02-01

---

## Hardware Richiesto

| Componente | Dettagli |
|------------|----------|
| Mac | MacBook Pro M1 (o successivo) |
| eGPU Enclosure | Razer Core X V2 (o compatibile Thunderbolt 3/4) |
| GPU | AMD Radeon RX 7900 XTX (24GB VRAM) |
| Architettura | GFX1100 = RDNA3 |

---

## IMPORTANTE: Cosa NON Funziona

- **Ollama** - NON supporta AMD su macOS (usa solo Metal/Apple Silicon)
- **ROCm** - NON disponibile su macOS (AMD lo supporta SOLO su Linux)
- **Driver kernel** - NON esistono per RDNA3 su macOS
- **Metal** - Apple non supporta GPU AMD dal 2020

---

## L'HACK GENIALE: AMD=1 AMD_LLVM=1

Questa è la chiave per far funzionare TUTTO. **Memorizzala.**

```bash
AMD=1 AMD_LLVM=1
```

### Perché Serve

| Problema | Soluzione |
|----------|-----------|
| macOS non ha ROCm | TinyGrad ha driver **userspace** che parla direttamente con GPU via PCIe |
| ROCm usa `comgr` per compilare kernel | `AMD_LLVM=1` usa LLVM di Homebrew invece |
| Nessun driver kernel | TinyGrad carica firmware e controlla GPU direttamente |

### Cosa Fanno le Variabili

| Variabile | Cosa Fa | Senza di Essa |
|-----------|---------|---------------|
| `AMD=1` | Forza backend AMD invece di Metal/CPU | TinyGrad usa M1 GPU (Metal) |
| `AMD_LLVM=1` | Compila kernel con `/opt/homebrew/opt/llvm` | Cerca `comgr` (ROCm) e FALLISCE |

### Perché Funziona

1. **TinyGrad driver userspace** - Bypassa totalmente la mancanza di driver kernel
2. **LLVM Homebrew** - Può generare codice AMD GCN/RDNA come `comgr`
3. **PCIe diretto** - La GPU è accessibile via Thunderbolt anche senza driver Apple

### SENZA QUESTO HACK = IMPOSSIBILE
### CON QUESTO HACK = 24GB VRAM DISPONIBILI

---

## Cosa Funziona: TinyGrad

TinyGrad ha un **driver userspace** che bypassa completamente la mancanza di supporto ROCm/driver su macOS.

### Prerequisiti

```bash
# Python 3.11 (OBBLIGATORIO)
brew install python@3.11

# LLVM per compilare kernel AMD
brew install llvm

# tiktoken per tokenizer
/opt/homebrew/bin/python3.11 -m pip install tiktoken
```

### Clonare TinyGrad

```bash
cd ~
git clone https://github.com/tinygrad/tinygrad.git
cd tinygrad
```

---

## Verifica GPU

### Test Base
```bash
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

## Lanciare LLM su Radeon

### Server OpenAI-Compatible

```bash
cd ~/tinygrad
PYTHONPATH=. AMD=1 AMD_LLVM=1 /opt/homebrew/bin/python3.11 \
  tinygrad/apps/llm.py --model llama3.1:8b --serve 11434
```

Questo espone API su `http://localhost:11434/v1/chat/completions`

### Test API

```bash
curl -X POST http://localhost:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3.1:8b",
    "messages": [{"role": "user", "content": "Ciao!"}],
    "stream": true
  }'
```

---

## Modelli Disponibili

| Modello | Comando |
|---------|---------|
| LLaMA 3.2 1B | `--model llama3.2:1b` |
| LLaMA 3.2 3B | `--model llama3.2:3b` |
| LLaMA 3.1 8B | `--model llama3.1:8b` |
| Qwen3 0.6B | `--model qwen3:0.6b` |
| Qwen3 8B | `--model qwen3:8b` |
| Qwen3 30B | `--model qwen3:30b-a3b` |

---

## Variabili Ambiente

| Variabile | Valore | Descrizione |
|-----------|--------|-------------|
| `AMD` | `1` | Abilita backend AMD |
| `AMD_LLVM` | `1` | Usa LLVM homebrew (bypassa ROCm) |
| `PYTHONPATH` | `.` | Include moduli TinyGrad |
| `DEBUG` | `1-7` | Verbosità debug |

---

## Integrazione ClawdBot

Modifica `~/.clawdbot/clawdbot.json`:

```json
{
  "models": {
    "providers": {
      "radeon": {
        "baseUrl": "http://localhost:11434/v1",
        "apiKey": "none",
        "api": "openai-completions"
      }
    }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "radeon/llama3.1:8b"
      }
    }
  }
}
```

---

## Script di Lancio

Usa lo script `/Users/mattia/start-radeon-llm.sh`:

```bash
~/start-radeon-llm.sh
```

---

## Troubleshooting

### GPU non trovata
1. Verifica che eGPU sia collegata via Thunderbolt
2. Controlla System Profiler → Graphics
3. Riavvia terminale

### "lock file in use"
Un altro processo sta usando la GPU. Termina con:
```bash
pkill -f "python.*AMD=1"
```

### Lento al primo avvio
Normale - TinyGrad compila i kernel LLVM la prima volta. Successive run più veloci.

### Out of Memory
- Usa modello più piccolo (`llama3.2:1b`)
- Riduci context: `--max_context 2048`

---

## Performance

| Modello | VRAM | Velocità |
|---------|------|----------|
| LLaMA 3.2 1B | ~2GB | ~15 tok/s |
| LLaMA 3.1 8B | ~8GB | ~5 tok/s |
| Qwen3 30B | ~20GB | ~1 tok/s |

---

## Path Importanti

| Path | Descrizione |
|------|-------------|
| `~/tinygrad` | Clone TinyGrad |
| `~/tinygrad/tinygrad/apps/llm.py` | Server LLM |
| `~/start-radeon-llm.sh` | Script avvio |
| `~/.clawdbot/clawdbot.json` | Config ClawdBot |

---

*Ultimo aggiornamento: 2026-02-01*
