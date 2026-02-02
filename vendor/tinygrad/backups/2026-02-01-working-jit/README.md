# Backup: True Q4 Inference + JIT (2026-02-01)

## Stato: FUNZIONANTE

Questo backup contiene la versione funzionante di True Q4 Inference con JIT optimization.

## Performance Testate

### Qwen3-32B (32 miliardi parametri)
- **VRAM**: 18.40GB (entra in 20GB)
- **Warmup**: ~350s (primi 2 token)
- **Post-warmup**: ~1.5 tok/s
- **Thinking mode**: ✅ Funziona

### Qwen2.5-32B (32 miliardi parametri)
- **VRAM**: 18.49GB
- **Post-warmup**: ~2-3 tok/s

### Qwen2.5-14B (14 miliardi parametri)
- **VRAM**: 8.37GB
- **Post-warmup**: ~3 tok/s

## File Inclusi

| File | Descrizione |
|------|-------------|
| `llm_q4.py` | True Q4 inference con JIT + QK norm support |
| `llm.py` | LLM standard con modelli aggiunti |
| `quantized.py` | QuantizedLinear class per Q4_K |
| `state.py` | GGUF loader con gguf_load_quantized |

## Comandi per Testare

```bash
cd /Users/mattia/Projects/Onde/vendor/tinygrad

# Qwen2.5-14B (veloce)
rm -f /tmp/am_remote:0.lock && \
PYTHONPATH=. AMD=1 AMD_LLVM=1 /opt/homebrew/bin/python3.11 \
  tinygrad/apps/llm_q4.py --model qwen2.5:14b --prompt "What is 2+2?" --count 20

# Qwen3-32B (con thinking mode)
rm -f /tmp/am_remote:0.lock && \
PYTHONPATH=. AMD=1 AMD_LLVM=1 /opt/homebrew/bin/python3.11 \
  tinygrad/apps/llm_q4.py --model qwen3:32b --prompt "What is 2+2?" --count 30
```

## Variabili Ambiente

| Variabile | Valore | Descrizione |
|-----------|--------|-------------|
| `AMD` | 1 | Usa backend AMD |
| `AMD_LLVM` | 1 | Compila con LLVM Homebrew |
| `JIT` | 1 (default) | Abilita JIT compilation |
| `SYM` | 1 (default) | Abilita symbolic execution |
| `CACHELEVEL` | 2 (default) | Cache kernel su disco |

## Ottimizzazioni Implementate

1. **TinyJit**: JIT compilation per generazione token singoli
2. **UOp.variable().bind()**: Symbolic start_pos per JIT caching
3. **QK Normalization**: Supporto per Qwen3 (qk_norm=128)
4. **contiguous()**: Ottimizzazione FFN per evitare ricompilazione

## Come Ripristinare

```bash
# Se qualcosa si rompe, copia i file dal backup:
cp /Users/mattia/Projects/Onde/vendor/tinygrad/backups/2026-02-01-working-jit/*.py \
   /Users/mattia/Projects/Onde/vendor/tinygrad/tinygrad/apps/

cp /Users/mattia/Projects/Onde/vendor/tinygrad/backups/2026-02-01-working-jit/quantized.py \
   /Users/mattia/Projects/Onde/vendor/tinygrad/tinygrad/nn/

cp /Users/mattia/Projects/Onde/vendor/tinygrad/backups/2026-02-01-working-jit/state.py \
   /Users/mattia/Projects/Onde/vendor/tinygrad/tinygrad/nn/
```

## Modelli su SSD

```
/Volumes/DATI-SSD/llm-models/
├── Qwen2.5-14B-Instruct-Q4_K_M.gguf  (8.4GB)
├── Qwen2.5-32B-Instruct-Q4_K_M.gguf  (18.5GB)
├── Qwen2.5-7B-Instruct-Q4_K_M.gguf   (4.4GB)
└── Qwen3-32B-Q4_K_M.gguf             (18GB)
```

---
*Backup creato: 2026-02-01 23:06*
