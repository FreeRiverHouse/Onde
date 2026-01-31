#!/bin/bash
# setup-crontab.sh - Unified crontab setup for all Onde watchdogs and crons
#
# Usage: ./scripts/setup-crontab.sh [--install|--show|--remove]
#
# Options:
#   --install  Install/update all cron jobs (default)
#   --show     Show current crontab and our jobs
#   --remove   Remove all Onde cron jobs
#
# This script is idempotent - safe to run multiple times

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
MARKER="# ONDE-CRON"

# Define all cron jobs
# Format: "schedule|script|description"
CRON_JOBS=(
    # Core watchdogs (high frequency)
    "*/5 * * * *|watchdog-autotrader.sh|Autotrader health check"
    "*/15 * * * *|watchdog-ondinho.sh|Ondinho activity monitor"
    
    # Service health checks (medium frequency)
    "*/10 * * * *|watchdog-services.sh|Core services health"
    "*/30 * * * *|watchdog-all-services.sh|All services comprehensive check"
    "*/20 * * * *|watchdog-onde-surf-auth.sh|onde.surf auth verification"
    "*/30 * * * *|watchdog-moonlight.sh|Moonlight app health"
    
    # Data and metrics (hourly)
    "0 * * * *|watchdog-alerts-upload.sh|Alert files upload to gist"
    "15 * * * *|autotrader-health-cron.sh|Autotrader metrics collection"
    "30 * * * *|watchdog-agents-memory.sh|Agent memory freshness check"
    
    # Trading analysis (daily)
    "0 12 * * *|btc-eth-correlation.py|BTC-ETH correlation update"
    "0 13 * * *|cron-trading-recommendations.sh|Trading recommendations"
    
    # Cleanup (weekly)
    "0 3 * * 0|cleanup-old-logs.sh|Clean old log files"
)

show_crontab() {
    echo "=== Current crontab ==="
    crontab -l 2>/dev/null || echo "(empty crontab)"
    echo ""
    echo "=== Onde cron jobs (marked with $MARKER) ==="
    crontab -l 2>/dev/null | grep "$MARKER" || echo "(none installed)"
    echo ""
}

remove_onde_crons() {
    echo "Removing Onde cron jobs..."
    local current
    current=$(crontab -l 2>/dev/null || true)
    if [ -n "$current" ]; then
        echo "$current" | grep -v "$MARKER" | crontab - 2>/dev/null || crontab -r 2>/dev/null || true
    fi
    echo "✓ Removed all Onde cron jobs"
}

install_crons() {
    echo "Installing Onde cron jobs..."
    echo ""
    
    # First remove existing Onde crons to avoid duplicates
    remove_onde_crons 2>/dev/null || true
    
    # Get current crontab (without our jobs)
    local current
    current=$(crontab -l 2>/dev/null | grep -v "$MARKER" || true)
    
    # Build new crontab
    local new_crontab="$current"
    [ -n "$new_crontab" ] && new_crontab="$new_crontab"$'\n'
    
    new_crontab+="# ========== ONDE AUTOMATED CRONS ========== $MARKER"$'\n'
    new_crontab+="# Installed by setup-crontab.sh on $(date '+%Y-%m-%d %H:%M') $MARKER"$'\n'
    new_crontab+="# Project: $PROJECT_DIR $MARKER"$'\n'
    new_crontab+="$MARKER"$'\n'
    
    local installed=0
    local skipped=0
    
    for job in "${CRON_JOBS[@]}"; do
        IFS='|' read -r schedule script desc <<< "$job"
        local script_path="$SCRIPT_DIR/$script"
        
        if [ -x "$script_path" ]; then
            new_crontab+="$schedule $script_path >> $PROJECT_DIR/logs/cron-\$(date +\%Y-\%m-\%d).log 2>&1 $MARKER # $desc"$'\n'
            echo "✓ $desc ($schedule)"
            ((installed++))
        else
            echo "⚠ Skipping $script (not found or not executable)"
            ((skipped++))
        fi
    done
    
    new_crontab+="# ========== END ONDE CRONS ========== $MARKER"$'\n'
    
    # Install new crontab
    echo "$new_crontab" | crontab -
    
    echo ""
    echo "=== Installation Summary ==="
    echo "✓ Installed: $installed cron jobs"
    [ $skipped -gt 0 ] && echo "⚠ Skipped: $skipped (missing scripts)"
    echo ""
    echo "Logs will be written to: $PROJECT_DIR/logs/cron-YYYY-MM-DD.log"
    
    # Create logs directory if it doesn't exist
    mkdir -p "$PROJECT_DIR/logs"
}

# Main
case "${1:-}" in
    --show|-s)
        show_crontab
        ;;
    --remove|-r)
        remove_onde_crons
        ;;
    --install|-i|"")
        install_crons
        show_crontab
        ;;
    --help|-h)
        echo "Usage: $0 [--install|--show|--remove]"
        echo ""
        echo "Options:"
        echo "  --install, -i  Install/update all cron jobs (default)"
        echo "  --show, -s     Show current crontab and our jobs"
        echo "  --remove, -r   Remove all Onde cron jobs"
        echo "  --help, -h     Show this help"
        ;;
    *)
        echo "Unknown option: $1"
        echo "Use --help for usage"
        exit 1
        ;;
esac
