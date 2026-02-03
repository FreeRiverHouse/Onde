# MLX Translation System v10

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
python3 translate-mlx-bomproof-v10.py input.txt output_dir/
```

Lo script:
1. Avvia automaticamente il server MLX (porta 8765)
2. Traduce paragrafo per paragrafo
3. Applica revisione automatica
4. Stoppa il server alla fine

## Performance
- ~50s per paragrafo
- 24 paragrafi in ~20 minuti
- 0 fallback con testo accademico

## File
- `mlx_server.py` - Server HTTP con Qwen3-32B
- `translate-mlx-bomproof-v10.py` - Script traduzione bomproof
