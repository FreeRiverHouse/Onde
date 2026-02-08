# MLX Translation System v11

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
python3 translate-mlx-bomproof-v11.py input.txt output_dir/
```

Lo script:
1. Avvia automaticamente il server MLX (porta 8765)
2. Traduce paragrafo per paragrafo (chunk piccoli = ~10-15s ciascuno)
3. Applica revisione automatica con /no_think per output pulito
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
python3 translate-mlx-bomproof-v11.py test_quick.txt ./test_out/

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

# Log file (v11)
cat /tmp/bomproof_v11.log
```

## Performance v11
- ~10-15s per paragrafo breve (con revisione)
- Chunk piccoli raccomandati (<500 caratteri)
- Prompt /no_think = niente reasoning = output pulito
- Slop detection attiva (rimuove token Qwen3 spurii)

## File
- `mlx_server.py` - Server HTTP con Qwen3-32B + pulizia automatica
- `translate-mlx-bomproof-v11.py` - Script traduzione bomproof v11

## Changelog v11
- Prompt con /no_think all'inizio per disabilitare reasoning
- Pulizia token Qwen3 (<im_start>, <im_end>)  
- Sentence-level slop detection
- Performance migliorate per chunk piccoli
