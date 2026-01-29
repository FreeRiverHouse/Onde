#!/bin/bash
# Check if memory files are stale (>7 days since last update)
# Alerts user to review and archive old notes

WORKSPACE="/Users/mattia/Projects/Onde"
ALERT_FILE="$WORKSPACE/scripts/memory-stale.alert"
COOLDOWN_FILE="/tmp/memory-age-alert-cooldown"
COOLDOWN_HOURS=24
MAX_AGE_DAYS=7

# Check cooldown
if [[ -f "$COOLDOWN_FILE" ]]; then
    last_alert=$(stat -f %m "$COOLDOWN_FILE" 2>/dev/null || echo 0)
    now=$(date +%s)
    hours_since=$(( (now - last_alert) / 3600 ))
    if [[ $hours_since -lt $COOLDOWN_HOURS ]]; then
        exit 0
    fi
fi

stale_files=()
current_time=$(date +%s)
threshold=$((MAX_AGE_DAYS * 86400))

# Check MEMORY.md
if [[ -f "$WORKSPACE/MEMORY.md" ]]; then
    mtime=$(stat -f %m "$WORKSPACE/MEMORY.md" 2>/dev/null || echo 0)
    age=$((current_time - mtime))
    if [[ $age -gt $threshold ]]; then
        days_old=$((age / 86400))
        stale_files+=("MEMORY.md (${days_old}d old)")
    fi
fi

# Check memory/*.md files
if [[ -d "$WORKSPACE/memory" ]]; then
    for f in "$WORKSPACE/memory"/*.md; do
        if [[ -f "$f" ]]; then
            mtime=$(stat -f %m "$f" 2>/dev/null || echo 0)
            age=$((current_time - mtime))
            if [[ $age -gt $threshold ]]; then
                days_old=$((age / 86400))
                basename=$(basename "$f")
                stale_files+=("memory/$basename (${days_old}d old)")
            fi
        fi
    done
fi

# Check other workspace files
for file in SOUL.md USER.md TOOLS.md HEARTBEAT.md; do
    if [[ -f "$WORKSPACE/$file" ]]; then
        mtime=$(stat -f %m "$WORKSPACE/$file" 2>/dev/null || echo 0)
        age=$((current_time - mtime))
        if [[ $age -gt $threshold ]]; then
            days_old=$((age / 86400))
            stale_files+=("$file (${days_old}d old)")
        fi
    fi
done

# Write alert if stale files found
if [[ ${#stale_files[@]} -gt 0 ]]; then
    echo "🗂️ Memory files need review!" > "$ALERT_FILE"
    echo "" >> "$ALERT_FILE"
    echo "The following files haven't been updated in >${MAX_AGE_DAYS} days:" >> "$ALERT_FILE"
    for f in "${stale_files[@]}"; do
        echo "  • $f" >> "$ALERT_FILE"
    done
    echo "" >> "$ALERT_FILE"
    echo "Consider reviewing and archiving stale notes." >> "$ALERT_FILE"
    
    touch "$COOLDOWN_FILE"
    echo "Alert written: ${#stale_files[@]} stale files"
else
    echo "All memory files fresh (updated within ${MAX_AGE_DAYS} days)"
fi
