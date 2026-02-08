# MLX Translation Pipeline (v12.0 - Resume Capable)

Sistema di traduzione EN→IT usando Qwen3-32B su Apple Silicon.

## Requisiti
- Mac M1/M2/M3/M4 con 24GB+ RAM
- Python 3.11+ con mlx_lm

## Setup
```bash
source ~/mlx-env/bin/activate
```

## Uso
```bash
python3 translate-mlx-bomproof-v12.py input.txt output_dir/
```

Lo script:
1. Avvia automaticamente il server MLX (porta 8765)
2. Traduce paragrafo per paragrafo (chunk <500 chars = ~15s ciascuno)
3. Usa prompt /no_think per output pulito (Revisione disattivata per default per stabilità su 24GB RAM)
4. Stoppa il server alla fine

## Testing

### Quick Test (consigliato per validazione)
```bash
# 1. Attiva environment
source ~/mlx-env/bin/activate
cd tools/translation-mlx

# 2. Crea file test piccolo (1-3 paragrafi)
echo "The coffee is hot." > test_quick.txt

# 3. Esegui traduzione
python3 translate-mlx-bomproof-v12.py test_quick.txt ./test_out/

# 4. Verifica output
cat ./test_out/traduzione_finale.txt
```

### Server Management
```bash
# Avvio manuale server (utile per test ripetuti)
python3 mlx_server.py &
sleep 15
curl http://localhost:8765/health

# Test singola traduzione
curl -X POST http://localhost:8765/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world", "revise": true}'

# Stop server
pkill -f mlx_server
```

### Troubleshooting
```bash
# Se la traduzione stalla, restart:
pkill -9 -f mlx_server
rm -f server.lock server.pid

# Log file (v12)
cat /tmp/bomproof_v12.log
```

## Performance v12 (Stable & Resumable)
- **Resume Capability:** Se lo script si interrompe, riavvialo e riprenderà dall'ultimo paragrafo salvato!
- **Incremental Save:** Ogni paragrafo tradotto viene salvato immediatamente in `checkpoint_translated.txt`.
- **Smart Chunking:** Il testo viene diviso automaticamente in chunk <500 caratteri per massima stabilità (1154 chunk per il libro completo).
- ~15s per paragrafo (chunk 500 chars)
- Revisione disattivata (`revise=False`) per evitare OOM su 24GB RAM

## Configurazione Avanzata
Se hai >32GB RAM, puoi riattivare la revisione modificando:
`translate-mlx-bomproof-v12.py`:
```python
MAX_PARA_CHARS = 1000  # Aumenta chunk
...
json={"text": text_en, "revise": True},  # Riattiva revisione
```

## File Principali
- `translate-mlx-bomproof-v12.py` - Script Principale (v12 con Resume)
- `mlx_server.py` - Server HTTP con Qwen3-32B
- `checkpoint_translated.txt` - File di salvataggio incrementale (nella cartella output)
