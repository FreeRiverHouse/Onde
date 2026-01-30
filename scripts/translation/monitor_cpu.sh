#!/bin/bash
# monitor_cpu.sh - Monitora CPU e attende se troppo alta
# Uso: source monitor_cpu.sh && wait_for_cpu_below 70

CPU_LOG="/tmp/translation_cpu.log"

get_cpu_usage() {
    # macOS specific
    top -l 1 -n 0 | grep "CPU usage" | awk '{print $3}' | tr -d '%' | cut -d'.' -f1
}

wait_for_cpu_below() {
    local threshold=${1:-70}
    local max_wait=${2:-600}  # Max 10 minuti di attesa
    local waited=0
    
    while true; do
        local cpu=$(get_cpu_usage)
        local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
        
        echo "[$timestamp] CPU: ${cpu}%" >> "$CPU_LOG"
        
        if [ "$cpu" -lt "$threshold" ]; then
            echo "✅ CPU ${cpu}% < ${threshold}% - OK per procedere"
            return 0
        fi
        
        echo "⏳ CPU ${cpu}% >= ${threshold}% - Attendo... ($waited s)"
        sleep 30
        waited=$((waited + 30))
        
        if [ $waited -ge $max_wait ]; then
            echo "⚠️ Atteso $max_wait secondi, procedo comunque (CPU: ${cpu}%)"
            return 1
        fi
    done
}

check_cpu_safe() {
    local threshold=${1:-80}
    local cpu=$(get_cpu_usage)
    
    if [ "$cpu" -ge "$threshold" ]; then
        echo "🚨 CPU ALTA: ${cpu}% >= ${threshold}%"
        return 1
    else
        echo "✅ CPU OK: ${cpu}% < ${threshold}%"
        return 0
    fi
}

# Se eseguito direttamente, mostra stato
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    echo "═══════════════════════════════════════"
    echo "📊 CPU Monitor"
    echo "═══════════════════════════════════════"
    echo "CPU attuale: $(get_cpu_usage)%"
    echo ""
    echo "Funzioni disponibili (dopo source):"
    echo "  wait_for_cpu_below 70    # Attende CPU < 70%"
    echo "  check_cpu_safe 80        # Check se CPU < 80%"
fi
