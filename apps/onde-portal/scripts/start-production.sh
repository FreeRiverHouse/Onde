#!/bin/bash

# Onde Portal - Production Start Script
# Usage: ./scripts/start-production.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "=========================================="
echo "  Onde Portal - Production Deploy"
echo "=========================================="

cd "$PROJECT_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "[1/4] Installing dependencies..."
    npm install
else
    echo "[1/4] Dependencies already installed"
fi

# Build the project
echo "[2/4] Building project..."
npm run build

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "[3/4] Installing PM2..."
    npm install -g pm2
else
    echo "[3/4] PM2 already installed"
fi

# Stop existing instance if running
pm2 delete onde-portal 2>/dev/null || true

# Start with PM2
echo "[4/4] Starting server..."
pm2 start npm --name "onde-portal" -- start

echo ""
echo "=========================================="
echo "  Deploy completato!"
echo "=========================================="
echo ""
echo "  URL: http://localhost:3000"
echo ""
echo "  Comandi utili:"
echo "    pm2 status          - Stato server"
echo "    pm2 logs onde-portal - Log in tempo reale"
echo "    pm2 restart onde-portal - Riavvia"
echo "    pm2 stop onde-portal    - Ferma"
echo ""
