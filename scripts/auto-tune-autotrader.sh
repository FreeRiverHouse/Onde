#!/bin/bash
# AUTO-TUNE AUTOTRADER - Feedback loop automatico
# Analizza risultati paper trades, calibra parametri, restart autotrader
# Designed to run via cron every 30 min

set -e
cd "$(dirname "$0")/.."

LOG="/tmp/auto-tune.log"
TRADES_FILE="scripts/kalshi-trades-dryrun.jsonl"
AUTOTRADER="scripts/kalshi-autotrader-v2.py"
TUNE_REPORT="data/trading/tune-report.json"

echo "$(date): Auto-tune cycle starting" >> "$LOG"

# Run analysis and auto-tune
python3 -u scripts/auto-tune-engine.py >> "$LOG" 2>&1

echo "$(date): Auto-tune cycle complete" >> "$LOG"
