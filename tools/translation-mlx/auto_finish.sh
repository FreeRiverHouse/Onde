#!/bin/bash
# AUTOMATED REPAIR & MERGE SCRIPT
# This script will be run by CRON every minute to ensure the translation is finalized.

LOGfile="/tmp/capussela_monitor.log"
DIR="/Users/mattiapetrucciani/Onde/tools/translation-mlx/capussela_output"
cd "$DIR" || exit 1

echo "[$(date)] CRON ACTIVE: Checking files..." >> "$LOGfile"

# 1. MERGE LOGIC (Robust Python)
python3 -c '
import os
try:
    base = "'"$DIR"'"
    p_orig = os.path.join(base, "traduzione_finale.txt")
    p_v5 = os.path.join(base, "traduzione_FINAL_V5.txt")
    p_merged = os.path.join(base, "FINAL_MERGED.txt")

    if os.path.exists(p_v5) and os.path.exists(p_orig):
        v5 = open(p_v5, "r", encoding="utf-8").read().split("\n\n")
        orig = open(p_orig, "r", encoding="utf-8").read().split("\n\n")
        
        # Merge: Take all V5, append remaining form Original
        final = v5
        if len(orig) > len(v5):
            final += orig[len(v5):]
            
        with open(p_merged, "w", encoding="utf-8") as f:
            f.write("\n\n".join(final))
        print(f"MERGE SUCCESS: {len(final)} paragraphs.")
    else:
        print("Files missing.")
except Exception as e:
    print(f"Error: {e}")
' >> "$LOGfile" 2>&1

# 2. CONVERT TO DOCX (Native Mac Tool - No Python Lib Dependencies)
TXT_FILE="FINAL_MERGED.txt"
DOCX_FILE="Capussela_Traduzione_V5_FINAL.docx"

if [ -f "$TXT_FILE" ]; then
    textutil -convert docx -output "$DOCX_FILE" "$TXT_FILE" >> "$LOGfile" 2>&1
    echo "[$(date)] DOCX GENERATED: $DOCX_FILE" >> "$LOGfile"
else
    echo "[$(date)] Txt file not found, skipping conversion." >> "$LOGfile"
fi
