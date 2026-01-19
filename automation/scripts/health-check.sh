#!/bin/bash
# =============================================================================
# ONDE HEALTH CHECK SYSTEM
# Verifies all services and processes are running correctly
# =============================================================================

set -e

# Configuration
TELEGRAM_BOT_TOKEN="8528268093:AAGNZUcYBm8iMcn9D_oWr565rpxm9riNkBM"
TELEGRAM_CHAT_ID="7505631979"
LOG_FILE="/Users/mattiapetrucciani/CascadeProjects/Onde/automation/logs/health-check.log"
ALERT_COOLDOWN_FILE="/tmp/onde-health-alert-cooldown"
ALERT_COOLDOWN_SECONDS=3600  # 1 hour between same alerts

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Send Telegram alert (with cooldown)
send_alert() {
    local message="$1"
    local alert_key="$2"
    local cooldown_key="$ALERT_COOLDOWN_FILE-$alert_key"

    # Check cooldown
    if [ -f "$cooldown_key" ]; then
        local last_alert=$(cat "$cooldown_key")
        local now=$(date +%s)
        local diff=$((now - last_alert))
        if [ $diff -lt $ALERT_COOLDOWN_SECONDS ]; then
            log "Alert suppressed (cooldown): $alert_key"
            return 0
        fi
    fi

    # Send alert
    curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
        -d "chat_id=${TELEGRAM_CHAT_ID}" \
        -d "text=$message" \
        -d "parse_mode=HTML" > /dev/null

    # Update cooldown
    date +%s > "$cooldown_key"
    log "Alert sent: $alert_key"
}

# Check if a LaunchAgent is running
check_launchagent() {
    local label="$1"
    local name="$2"

    if launchctl list | grep -q "$label"; then
        local status=$(launchctl list | grep "$label" | awk '{print $1}')
        if [ "$status" = "-" ]; then
            log "WARNING: $name ($label) is loaded but not running"
            return 1
        else
            log "OK: $name ($label) running with PID $status"
            return 0
        fi
    else
        log "ERROR: $name ($label) not loaded"
        return 2
    fi
}

# Check disk space
check_disk_space() {
    local threshold=90  # Alert if usage > 90%
    local usage=$(df -h / | tail -1 | awk '{print $5}' | tr -d '%')

    if [ "$usage" -gt "$threshold" ]; then
        log "CRITICAL: Disk usage at ${usage}%"
        return 1
    else
        log "OK: Disk usage at ${usage}%"
        return 0
    fi
}

# Check if Telegram bot is responsive
check_telegram_bot() {
    local response=$(curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe")

    if echo "$response" | grep -q '"ok":true'; then
        log "OK: Telegram bot API responsive"
        return 0
    else
        log "ERROR: Telegram bot API not responding"
        return 1
    fi
}

# Check bot log for errors
check_bot_logs() {
    local log_file="/tmp/frh-onde-bot.log"
    local error_threshold=10  # Alert if > 10 errors in last hour

    if [ -f "$log_file" ]; then
        local recent_errors=$(grep -c "error\|ERROR\|Error" "$log_file" 2>/dev/null || echo "0")
        if [ "$recent_errors" -gt "$error_threshold" ]; then
            log "WARNING: $recent_errors errors found in bot log"
            return 1
        else
            log "OK: Bot log has $recent_errors errors (under threshold)"
            return 0
        fi
    else
        log "WARNING: Bot log file not found"
        return 1
    fi
}

# Check node processes
check_node_processes() {
    local bot_count=$(pgrep -f "autonomous-bot.js" | wc -l | tr -d ' ')

    if [ "$bot_count" -eq 0 ]; then
        log "ERROR: No autonomous-bot.js process running"
        return 1
    elif [ "$bot_count" -gt 1 ]; then
        log "WARNING: Multiple bot processes running ($bot_count)"
        return 1
    else
        log "OK: Bot process running normally"
        return 0
    fi
}

# Main health check
main() {
    log "========== HEALTH CHECK STARTED =========="

    local issues=()
    local critical=false

    # Check LaunchAgents
    if ! check_launchagent "com.frh.onde-bot" "Onde Telegram Bot"; then
        issues+=("Onde Bot not running")
        critical=true
    fi

    # Check disk space
    if ! check_disk_space; then
        issues+=("Disk space critical")
        critical=true
    fi

    # Check Telegram API
    if ! check_telegram_bot; then
        issues+=("Telegram API not responding")
        critical=true
    fi

    # Check node processes
    if ! check_node_processes; then
        issues+=("Bot process issues")
    fi

    # Check bot logs
    if ! check_bot_logs; then
        issues+=("Excessive errors in logs")
    fi

    log "========== HEALTH CHECK COMPLETED =========="

    # Send alert if issues found
    if [ ${#issues[@]} -gt 0 ]; then
        local alert_message="<b>ONDE HEALTH ALERT</b>

Issues detected:
$(printf '- %s\n' "${issues[@]}")

Time: $(date '+%Y-%m-%d %H:%M:%S')
Run: <code>cat $LOG_FILE</code> for details"

        if $critical; then
            send_alert "$alert_message" "health-critical"
        fi

        return 1
    else
        log "All systems healthy"
        return 0
    fi
}

# Run with optional argument
case "${1:-check}" in
    check)
        main
        ;;
    test)
        send_alert "Test alert from health-check.sh" "test"
        ;;
    *)
        echo "Usage: $0 [check|test]"
        exit 1
        ;;
esac
