#!/bin/bash
# CORDE API Server Startup

CORDE_ROOT="/Users/mattiapetrucciani/CascadeProjects/corde"
LOG_FILE="$CORDE_ROOT/api.log"

cd "$CORDE_ROOT/api"

# Check if already running
if pgrep -f "corde/api/server.js" > /dev/null 2>&1; then
    echo "CORDE API already running"
    exit 0
fi

# Activate conda environment if available
if command -v conda &> /dev/null; then
    eval "$(conda shell.bash hook)"
    conda activate corde 2>/dev/null || true
fi

# Start server
echo "$(date): Starting CORDE API..." >> "$LOG_FILE"
exec node server.js >> "$LOG_FILE" 2>&1
