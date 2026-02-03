#!/bin/bash
#
# MASTER-CODE-M1-v1.sh
# Setup completo ClawdBot + TinyGrad + Qwen2.5-14B su AMD GPU
#
# Ultima modifica: 2026-02-03
# Autore: Claude + Mattia
#
# PREREQUISITI:
# - TinyGPU.app DEVE essere in esecuzione
# - eGPU connessa (AMD RX 7900 XTX)
# - LLVM installato (brew install llvm)
#

set -e

# === CONFIGURAZIONE ===
TINYGRAD_DIR="/Users/mattia/Projects/Onde/vendor/tinygrad"
MODEL="qwen2.5:14b"
MAX_CONTEXT=4096
SERVER_PORT=11434
WRAPPER_PORT=11435
LOG_DIR="/tmp"

# === COLORI ===
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== MASTER-CODE-M1-v1 ===${NC}"
echo "Setup ClawdBot + TinyGrad + $MODEL"
echo ""

# === CONTROLLI PREREQUISITI ===
echo -e "${YELLOW}[1/6] Controllo prerequisiti...${NC}"

# TinyGPU.app
if ! pgrep -q "TinyGPU"; then
    echo -e "${RED}ERRORE: TinyGPU.app non in esecuzione!${NC}"
    echo "Avviala prima di eseguire questo script."
    exit 1
fi
echo "  ✓ TinyGPU.app attiva"

# Python 3.11
if ! [ -x "/opt/homebrew/bin/python3.11" ]; then
    echo -e "${RED}ERRORE: Python 3.11 non trovato!${NC}"
    exit 1
fi
echo "  ✓ Python 3.11 presente"

# LLVM
if ! [ -d "/opt/homebrew/opt/llvm" ]; then
    echo -e "${YELLOW}ATTENZIONE: LLVM non trovato. Installalo con: brew install llvm${NC}"
fi
echo "  ✓ Prerequisiti OK"
echo ""

# === KILL PROCESSI ESISTENTI ===
echo -e "${YELLOW}[2/6] Pulizia processi esistenti...${NC}"
pkill -9 -f "llm_q4.py" 2>/dev/null && echo "  ✓ Vecchio TinyGrad terminato" || echo "  - Nessun TinyGrad da terminare"
sleep 2
echo ""

# === AVVIA SERVER TINYGRAD ===
echo -e "${YELLOW}[3/6] Avvio TinyGrad server (con warmup JIT)...${NC}"
echo "  Model: $MODEL"
echo "  Max Context: $MAX_CONTEXT"
echo "  Port: $SERVER_PORT"
echo "  Log: $LOG_DIR/llm_tinygrad.log"
echo ""

cd "$TINYGRAD_DIR"
PYTHONPATH=. AMD=1 AMD_LLVM=1 nohup /opt/homebrew/bin/python3.11 \
    tinygrad/apps/llm_q4.py \
    --model "$MODEL" \
    --max_context "$MAX_CONTEXT" \
    --serve "$SERVER_PORT" \
    > "$LOG_DIR/llm_tinygrad.log" 2>&1 &

TINYGRAD_PID=$!
echo "  PID: $TINYGRAD_PID"
echo ""

# === ASPETTA WARMUP ===
echo -e "${YELLOW}[4/6] Attesa warmup JIT (può richiedere 2-5 minuti)...${NC}"
echo "  Monitora con: tail -f $LOG_DIR/llm_tinygrad.log"
echo ""

# Aspetta che il server sia pronto
MAX_WAIT=300  # 5 minuti max
WAITED=0
while [ $WAITED -lt $MAX_WAIT ]; do
    if curl -s -m 2 "http://127.0.0.1:$SERVER_PORT/" >/dev/null 2>&1; then
        # Controlla se warmup completato (cerca "Warmup complete" nel log)
        if grep -q "Warmup complete\|Server on http" "$LOG_DIR/llm_tinygrad.log" 2>/dev/null; then
            echo -e "  ${GREEN}✓ Server pronto!${NC}"
            break
        fi
    fi
    echo -n "."
    sleep 5
    WAITED=$((WAITED + 5))
done

if [ $WAITED -ge $MAX_WAIT ]; then
    echo -e "  ${YELLOW}Timeout warmup. Il server potrebbe non essere ottimizzato.${NC}"
fi
echo ""

# === VERIFICA WRAPPER ===
echo -e "${YELLOW}[5/6] Verifica wrapper...${NC}"
if pgrep -q "m1-qwen-wrapper"; then
    echo "  ✓ Wrapper già attivo"
else
    echo "  Avvio wrapper..."
    launchctl start com.clawdbot.m1-wrapper 2>/dev/null || echo "  (wrapper non configurato come LaunchAgent)"
fi

# Test wrapper
sleep 2
if curl -s -m 2 "http://127.0.0.1:$WRAPPER_PORT/health" >/dev/null 2>&1; then
    echo "  ✓ Wrapper risponde su porta $WRAPPER_PORT"
else
    echo -e "  ${RED}ERRORE: Wrapper non risponde!${NC}"
fi
echo ""

# === RIAVVIA CLAWDBOT ===
echo -e "${YELLOW}[6/6] Riavvio ClawdBot...${NC}"
launchctl stop com.clawdbot.gateway 2>/dev/null || true
sleep 2
launchctl start com.clawdbot.gateway 2>/dev/null || echo "  (ClawdBot non configurato come LaunchAgent)"

sleep 3
if pgrep -q "clawdbot"; then
    echo "  ✓ ClawdBot attivo"
else
    echo -e "  ${YELLOW}ClawdBot non avviato automaticamente${NC}"
fi
echo ""

# === SUMMARY ===
echo -e "${GREEN}=== SETUP COMPLETATO ===${NC}"
echo ""
echo "Servizi attivi:"
echo "  - TinyGrad: http://127.0.0.1:$SERVER_PORT (PID: $TINYGRAD_PID)"
echo "  - Wrapper:  http://127.0.0.1:$WRAPPER_PORT"
echo "  - ClawdBot: ws://127.0.0.1:18789"
echo ""
echo "Test rapido:"
echo "  curl -sN -X POST 'http://127.0.0.1:$WRAPPER_PORT/v1/chat/completions' \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"model\":\"$MODEL\",\"messages\":[{\"role\":\"user\",\"content\":\"Ciao\"}],\"stream\":true}'"
echo ""
echo "Log:"
echo "  tail -f $LOG_DIR/llm_tinygrad.log"
echo "  tail -f ~/.clawdbot/logs/gateway.log"
echo "  tail -f ~/.clawdbot/logs/m1-wrapper.log"
echo ""
