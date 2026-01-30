#!/bin/bash
#
# deploy-all.sh - Deploy all Onde sites
# 
# Usage: ./scripts/deploy-all.sh [site]
#   ./scripts/deploy-all.sh          # Deploy both
#   ./scripts/deploy-all.sh surf     # Deploy only onde.surf
#   ./scripts/deploy-all.sh la       # Deploy only onde.la
#
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🚀 ONDE DEPLOY SYSTEM"
echo "====================="
echo ""

case "${1:-all}" in
    surf)
        "$SCRIPT_DIR/deploy-onde-surf.sh"
        ;;
    la)
        "$SCRIPT_DIR/deploy-onde-la.sh"
        ;;
    all|*)
        echo "Deploying ALL sites..."
        echo ""
        "$SCRIPT_DIR/deploy-onde-surf.sh"
        echo ""
        echo "---"
        echo ""
        "$SCRIPT_DIR/deploy-onde-la.sh"
        ;;
esac

echo ""
echo "🎉 ALL DEPLOYS COMPLETE!"
echo ""
echo "Sites:"
echo "  🏄 https://onde.surf"
echo "  🌊 https://onde.la"
