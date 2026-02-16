#!/bin/bash
# NIGHT SHIFT WATCHDOG
# Runs every 5 minutes to ensure translation never stops.

LOG="/tmp/capussela_night_shift.log"
DIR="/Users/mattiapetrucciani/Onde"
cd "$DIR" || exit 1

echo "[$(date)] CRON CHECK: Starting..." >> "$LOG"

# 1. WATCHDOG: Restart Repair AI if died
if pgrep -f "repair_v5_json.py" > /dev/null; then
    echo "  -> AI Repair is RUNNING. Good." >> "$LOG"
else
    echo "  -> AI Repair STOPPED. Restarting now..." >> "$LOG"
    nohup /Users/mattiapetrucciani/mlx-env/bin/python3 -u tools/translation-mlx/repair_v5_json.py >> /tmp/v5_final.log 2>&1 &
    echo "  -> Restarted with PID $!" >> "$LOG"
fi

# 2. MERGE & GENERATE DOCX (Snapshot)
# This ensures you have a readable file at any moment
python3 -c '
import os
try:
    base = "tools/translation-mlx/capussela_output"
    p_orig = os.path.join(base, "traduzione_finale.txt")
    p_v5 = os.path.join(base, "traduzione_FINAL_V5.txt")
    p_merged = os.path.join(base, "FINAL_MERGED.txt")

    if os.path.exists(p_v5):
        try:
            v5 = open(p_v5, "r", encoding="utf-8").read().split("\n\n")
        except: v5 = []
        
        try:
            orig = open(p_orig, "r", encoding="utf-8").read().split("\n\n")
        except: orig = []

        # Merge: All V5 + Rest of Original
        final = v5
        if len(orig) > len(v5):
            final += orig[len(v5):]

        with open(p_merged, "w", encoding="utf-8") as f:
            f.write("\n\n".join(final))
        print("Merge OK")
except Exception as e:
    print(e)
' >> "$LOG" 2>&1

TXT_IN="tools/translation-mlx/capussela_output/FINAL_MERGED.txt"
DOCX_OUT="tools/translation-mlx/capussela_output/Capussela_Traduzione_LATEST.docx"

if [ -f "$TXT_IN" ]; then
    textutil -convert docx -output "$DOCX_OUT" "$TXT_IN" >> "$LOG" 2>&1
    echo "  -> DOCX Updated: $DOCX_OUT" >> "$LOG"
fi
