#!/bin/bash
# =============================================================================
# ONDE SERVICE MANAGER
# Centralized control for all Onde services
# Usage: ./service-manager.sh [status|start|stop|restart|logs] [service]
# =============================================================================

set -e

# Service definitions
declare -A SERVICES
SERVICES=(
    ["onde-bot"]="com.frh.onde-bot"
    ["telegram-bot"]="com.onde.telegram-bot"
    ["slack-responder"]="com.freeriverhouse.slackresponder"
    ["ralph"]="com.freeriverhouse.ralph"
    ["daily-tech"]="com.freeriverhouse.dailytech"
)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Print colored status
print_status() {
    local service="$1"
    local status="$2"

    case $status in
        running)
            echo -e "${GREEN}[RUNNING]${NC} $service"
            ;;
        stopped)
            echo -e "${RED}[STOPPED]${NC} $service"
            ;;
        loaded)
            echo -e "${YELLOW}[LOADED]${NC} $service (not running)"
            ;;
        *)
            echo -e "${YELLOW}[UNKNOWN]${NC} $service"
            ;;
    esac
}

# Get service status
get_status() {
    local label="$1"

    if launchctl list | grep -q "$label"; then
        local pid=$(launchctl list | grep "$label" | awk '{print $1}')
        if [ "$pid" = "-" ]; then
            echo "loaded"
        else
            echo "running"
        fi
    else
        echo "stopped"
    fi
}

# Show status of all services
status_all() {
    echo "========== ONDE SERVICES STATUS =========="
    echo ""

    for service in "${!SERVICES[@]}"; do
        local label="${SERVICES[$service]}"
        local status=$(get_status "$label")
        print_status "$service" "$status"
    done

    echo ""
    echo "============================================"
}

# Start a service
start_service() {
    local service="$1"

    if [ -z "${SERVICES[$service]}" ]; then
        echo "Unknown service: $service"
        echo "Available: ${!SERVICES[*]}"
        exit 1
    fi

    local label="${SERVICES[$service]}"
    local plist="$HOME/Library/LaunchAgents/${label}.plist"

    if [ -f "$plist" ]; then
        echo "Starting $service..."
        launchctl load -w "$plist" 2>/dev/null || launchctl kickstart -k "gui/$(id -u)/$label" 2>/dev/null || true
        sleep 1
        local status=$(get_status "$label")
        print_status "$service" "$status"
    else
        echo "Plist not found: $plist"
        exit 1
    fi
}

# Stop a service
stop_service() {
    local service="$1"

    if [ -z "${SERVICES[$service]}" ]; then
        echo "Unknown service: $service"
        exit 1
    fi

    local label="${SERVICES[$service]}"
    local plist="$HOME/Library/LaunchAgents/${label}.plist"

    echo "Stopping $service..."
    launchctl unload "$plist" 2>/dev/null || true
    sleep 1
    local status=$(get_status "$label")
    print_status "$service" "$status"
}

# Restart a service
restart_service() {
    local service="$1"
    stop_service "$service"
    sleep 2
    start_service "$service"
}

# Show logs for a service
show_logs() {
    local service="$1"
    local lines="${2:-50}"

    # Map services to their log files
    declare -A LOG_FILES
    LOG_FILES=(
        ["onde-bot"]="/tmp/frh-onde-bot.log"
        ["telegram-bot"]="/tmp/onde-bot.log"
    )

    local logfile="${LOG_FILES[$service]}"

    if [ -n "$logfile" ] && [ -f "$logfile" ]; then
        echo "=== Last $lines lines of $service log ==="
        tail -n "$lines" "$logfile"
    else
        echo "No log file found for $service"
        echo "Available logs: ${!LOG_FILES[*]}"
    fi
}

# Main command router
case "${1:-status}" in
    status)
        if [ -n "$2" ]; then
            service="$2"
            if [ -z "${SERVICES[$service]}" ]; then
                echo "Unknown service: $service"
                exit 1
            fi
            status=$(get_status "${SERVICES[$service]}")
            print_status "$service" "$status"
        else
            status_all
        fi
        ;;
    start)
        if [ -z "$2" ]; then
            echo "Usage: $0 start <service>"
            echo "Available: ${!SERVICES[*]}"
            exit 1
        fi
        start_service "$2"
        ;;
    stop)
        if [ -z "$2" ]; then
            echo "Usage: $0 stop <service>"
            exit 1
        fi
        stop_service "$2"
        ;;
    restart)
        if [ -z "$2" ]; then
            echo "Usage: $0 restart <service>"
            exit 1
        fi
        restart_service "$2"
        ;;
    logs)
        show_logs "${2:-onde-bot}" "${3:-50}"
        ;;
    list)
        echo "Available services:"
        for service in "${!SERVICES[@]}"; do
            echo "  - $service (${SERVICES[$service]})"
        done
        ;;
    *)
        echo "Onde Service Manager"
        echo ""
        echo "Usage: $0 <command> [service] [args]"
        echo ""
        echo "Commands:"
        echo "  status [service]     Show status of all or specific service"
        echo "  start <service>      Start a service"
        echo "  stop <service>       Stop a service"
        echo "  restart <service>    Restart a service"
        echo "  logs <service> [n]   Show last n lines of service log"
        echo "  list                 List available services"
        exit 1
        ;;
esac
