#!/bin/bash
#
# SETUP MAC PER AMD RADEON RX 7900 XTX + QWEN3-32B
# ================================================
# Questo script configura un Mac per usare la Radeon eGPU con TinyGrad
#
# PREREQUISITI:
# - macOS con Thunderbolt
# - AMD Radeon RX 7900 XTX/XT in enclosure Thunderbolt (es. Razer Core X)
# - Homebrew installato
#
# TESTATO: 2026-02-02 - Qwen3-32B a 1.5 tok/s!
#

set -e

echo "=========================================="
echo "  RADEON QWEN3 SETUP - Golden Config"
echo "=========================================="
echo ""

# 1. Installa Python 3.11
echo "[1/5] Installando Python 3.11..."
if ! command -v /opt/homebrew/bin/python3.11 &> /dev/null; then
    brew install python@3.11
else
    echo "  Python 3.11 già installato"
fi

# 2. Installa LLVM (per compilare kernel AMD)
echo "[2/5] Installando LLVM..."
if ! brew list llvm &> /dev/null; then
    brew install llvm
else
    echo "  LLVM già installato"
fi

# 3. Installa tiktoken
echo "[3/5] Installando tiktoken..."
/opt/homebrew/bin/python3.11 -m pip install tiktoken --quiet

# 4. Clona/aggiorna TinyGrad
echo "[4/5] Configurando TinyGrad..."
TINYGRAD_DIR="${HOME}/Projects/Onde/vendor/tinygrad"
if [ ! -d "$TINYGRAD_DIR" ]; then
    echo "  Clonando TinyGrad..."
    mkdir -p "${HOME}/Projects/Onde/vendor"
    cd "${HOME}/Projects/Onde/vendor"
    git clone https://github.com/tinygrad/tinygrad.git
fi
cd "$TINYGRAD_DIR"

# 5. Copia file Golden Setup
echo "[5/5] Installando Golden Setup files..."
SETUP_DIR="$(dirname "$0")"
cp "$SETUP_DIR/llm_q4.py" "$TINYGRAD_DIR/tinygrad/apps/"
cp "$SETUP_DIR/llm.py" "$TINYGRAD_DIR/tinygrad/apps/"
cp "$SETUP_DIR/quantized.py" "$TINYGRAD_DIR/tinygrad/nn/"
cp "$SETUP_DIR/state.py" "$TINYGRAD_DIR/tinygrad/nn/"

echo ""
echo "=========================================="
echo "  SETUP COMPLETATO!"
echo "=========================================="
echo ""
echo "Per testare Qwen3-32B:"
echo ""
echo "  cd $TINYGRAD_DIR"
echo "  rm -f /tmp/am_remote:0.lock"
echo "  PYTHONPATH=. AMD=1 AMD_LLVM=1 /opt/homebrew/bin/python3.11 \\"
echo "    tinygrad/apps/llm_q4.py --model qwen3:32b --prompt \"Hello\" --count 20"
echo ""
echo "Per avviare il server API:"
echo ""
echo "  PYTHONPATH=. AMD=1 AMD_LLVM=1 /opt/homebrew/bin/python3.11 \\"
echo "    tinygrad/apps/llm_q4.py --model qwen3:32b --serve 11434"
echo ""
echo "Performance attese:"
echo "  - Warmup: ~350s (primi 2 token - compilazione LLVM)"
echo "  - Post-warmup: ~1.5 tok/s"
echo "  - VRAM: 18.40GB"
echo ""
echo "NOTA: Il modello Qwen3-32B-Q4_K_M.gguf deve essere in:"
echo "  /Volumes/DATI-SSD/llm-models/Qwen3-32B-Q4_K_M.gguf"
echo ""
