#!/bin/bash
# Watchdog per Skin Creator - monitora errori mentre Neri gioca
# Usage: ./watchdog-skin-creator.sh

URL="https://onde.surf/static-games/skin-creator/index.html"
LOG_FILE="/tmp/skin-creator-watchdog.log"
ERROR_LOG="/tmp/skin-creator-errors.log"
CHECK_INTERVAL=30

echo "🎮 Skin Creator Watchdog avviato - $(date)"
echo "   URL: $URL"
echo "   Log: $LOG_FILE"
echo "   Errors: $ERROR_LOG"
echo ""

check_count=0
error_count=0

while true; do
    ((check_count++))
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    # HTTP check
    http_code=$(curl -s -o /dev/null -w "%{http_code}" "$URL" --max-time 10)
    
    if [ "$http_code" = "200" ]; then
        echo "[$timestamp] ✅ HTTP $http_code - Check #$check_count" | tee -a "$LOG_FILE"
        
        # Check JS bundle
        content=$(curl -s "$URL" --max-time 10)
        if echo "$content" | grep -q "_next/static"; then
            echo "[$timestamp] ✅ JS bundle OK" >> "$LOG_FILE"
        else
            echo "[$timestamp] ⚠️ JS bundle missing!" | tee -a "$ERROR_LOG"
            ((error_count++))
        fi
        
        # Check for real errors (not 404 template code)
        if echo "$content" | grep -vi "could not be found" | grep -qi "error occurred\|exception occurred\|runtime error"; then
            echo "[$timestamp] ⚠️ Possible error in page content" | tee -a "$ERROR_LOG"
            ((error_count++))
        fi
        
    else
        echo "[$timestamp] ❌ HTTP $http_code - ERRORE!" | tee -a "$ERROR_LOG"
        ((error_count++))
        
        # Alert if multiple errors
        if [ $error_count -ge 3 ]; then
            echo "🚨 ALERT: $error_count errori consecutivi!" | tee -a "$ERROR_LOG"
        fi
    fi
    
    # Summary every 10 checks
    if [ $((check_count % 10)) -eq 0 ]; then
        echo ""
        echo "📊 Summary after $check_count checks:"
        echo "   Errors: $error_count"
        echo "   Last check: $timestamp"
        echo ""
    fi
    
    sleep $CHECK_INTERVAL
done
