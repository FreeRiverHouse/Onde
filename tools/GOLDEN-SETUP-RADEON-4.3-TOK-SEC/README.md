# GOLDEN SETUP - Radeon RX 7900 XTX 20GB - 4.3 tok/s

> **Performance certificata**: 4.3 tok/s con Qwen2.5-7B Q4 (post-warmup)
> **Data**: 2026-02-02 21:30
> **Versione**: M1-V1.4

---

## 🎯 Performance Certificate

### Qwen2.5-7B Q4 (BENCHMARK UFFICIALE)

| Metrica | Valore |
|---------|--------|
| **Generation speed** | **4.3 tok/s** (post-cache) |
| **Prima request** | 156s (compilazione kernel) |
| **Seconda request** | 7s per 30 tokens |
| **VRAM usage** | 4.36 GB |
| **Model size** | 6.03 GB (Q4K=3.19GB + FP16=2.83GB) |

### Altri modelli testati

| Modello | Tok/s | VRAM |
|---------|-------|------|
| Qwen2.5-14B Q4 | 3-4 tok/s | ~8.4 GB |
| Qwen3-32B Q4 | ~3 tok/s | ~18 GB |

---

## 📊 Confronto M1 vs Radeon

**Test: Qwen2.5-7B-Instruct 4-bit**

| Hardware | Framework | VRAM | Tok/s | Winner |
|----------|-----------|------|-------|--------|
| **M1 8GB** | MLX Metal | 4.37 GB | **6.5 tok/s** | ✅ **+51% faster** |
| **Radeon 20GB** | TinyGrad AMD | 4.36 GB | 4.3 tok/s | - |

**Conclusione:**
- **M1 domina fino a 8B parametri** (più veloce, zero setup, efficiente)
- **Radeon vince su 14B+** (20GB VRAM, può gestire modelli fino a 32B)

---

## 🚀 Setup Certificato

### Hardware

| Componente | Dettagli |
|------------|----------|
| **Mac** | MacBook Pro M1 8GB RAM |
| **eGPU** | Razer Core X V2 (Thunderbolt 3) |
| **GPU** | AMD Radeon RX 7900 XTX 20GB VRAM |
| **Arch** | GFX1100 = RDNA3 |

### Path TinyGrad

```
/Users/mattia/Projects/Onde/vendor/tinygrad
```

### Comando Server (RACCOMANDATO)

```bash
cd /Users/mattia/Projects/Onde/vendor/tinygrad

PYTHONPATH=. AMD=1 AMD_LLVM=1 LLVM_O3=1 LLVM_NOVERIFY=1 \
  /opt/homebrew/bin/python3.11 \
  tinygrad/apps/llm_q4.py \
  --model qwen2.5:7b \
  --max_context 512 \
  --serve 11434 \
  --no-warmup
```

### Test API

```bash
# Prima request (compila kernel, ~156s)
curl -s http://localhost:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"qwen2.5:7b","messages":[{"role":"user","content":"Hello"}],"max_tokens":50}'

# Seconda request (usa cache, ~7s per 30 tokens = 4.3 tok/s)
curl -s http://localhost:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"qwen2.5:7b","messages":[{"role":"user","content":"Hello"}],"max_tokens":30}'
```

---

## ⚙️ Prerequisiti

### 1. TinyGPU App
```bash
open /Applications/TinyGPU.app
```

### 2. Stop Ollama (libera porta 11434)
```bash
launchctl stop com.ollama.server
launchctl unload ~/Library/LaunchAgents/com.ollama.server.plist
```

### 3. Rimuovi lock
```bash
rm -f /tmp/am_remote:0.lock
```

---

## 🔧 Variabili Ambiente

| Variabile | Valore | Descrizione |
|-----------|--------|-------------|
| `AMD` | `1` | **OBBLIGATORIO** - Abilita backend AMD |
| `AMD_LLVM` | `1` | **OBBLIGATORIO** - Usa LLVM Homebrew |
| `LLVM_O3` | `1` | **RACCOMANDATO** - Optimization level O3 (+25% prefill) |
| `LLVM_NOVERIFY` | `1` | **RACCOMANDATO** - Skip verification (compile più veloce) |
| `PYTHONPATH` | `.` | Include moduli TinyGrad |

---

## 📈 Ottimizzazioni Applicate

✅ **LLVM O3** - Optimization level aggressivo (+25% prefill speed)
✅ **LLVM_NOVERIFY** - Compilazione kernel più veloce
✅ **Server API mode** - Modello resta in memoria (evita reload)
✅ **Kernel cache** - Persiste in `~/Library/Caches/tinygrad/cache.db`

---

## 📝 Note

- **Prima request** compila kernel LLVM per la shape specifica (~2-3 min)
- **Richieste successive** con stessa shape usano cache compilata (~4.3 tok/s)
- Shape diversa = ricompilazione (es. diverso numero token nel prompt)
- **Server mode** RACCOMANDATO per evitare reload modello

---

*Certificato il: 2026-02-02 21:30*
*Versione: M1-V1.4*
