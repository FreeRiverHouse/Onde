#!/bin/bash
#
# Lighthouse CI Audit Script
# Runs Lighthouse audits against production URLs and checks thresholds
#
# Usage:
#   ./scripts/lighthouse-audit.sh           # Run full audit
#   ./scripts/lighthouse-audit.sh --quick   # Quick single-run audit
#
# Requirements: npx @lhci/cli (installed automatically)
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
REPORT_DIR="$PROJECT_ROOT/.lighthouseci"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔦 Lighthouse CI Audit${NC}"
echo "========================="

# Check if lighthouse CI is available
if ! command -v npx &> /dev/null; then
    echo -e "${RED}Error: npx not found. Install Node.js first.${NC}"
    exit 1
fi

# Parse arguments
QUICK_MODE=false
if [[ "$1" == "--quick" ]]; then
    QUICK_MODE=true
    echo -e "${YELLOW}Quick mode: Single run per URL${NC}"
fi

# Create report directory
mkdir -p "$REPORT_DIR"

cd "$PROJECT_ROOT"

# URLs to test
URLS=(
    "https://onde.la/"
    "https://onde.la/libri/"
    "https://onde.la/catalogo/"
)

# Thresholds
PERF_THRESHOLD=80
A11Y_THRESHOLD=90
PRACTICES_THRESHOLD=80
SEO_THRESHOLD=90

echo ""
echo "Testing URLs: ${URLS[*]}"
echo "Thresholds: Performance≥$PERF_THRESHOLD, Accessibility≥$A11Y_THRESHOLD"
echo ""

# Run Lighthouse with config file
if [ "$QUICK_MODE" = true ]; then
    # Quick mode: use curl-based check
    echo -e "${YELLOW}Running quick performance checks...${NC}"
    
    FAIL=false
    for url in "${URLS[@]}"; do
        echo -n "Checking $url... "
        
        # Basic connectivity and response time
        START=$(date +%s%N)
        HTTP_CODE=$(curl -sL -o /dev/null -w "%{http_code}" --max-time 10 "$url")
        END=$(date +%s%N)
        DURATION_MS=$(( (END - START) / 1000000 ))
        
        if [ "$HTTP_CODE" -eq 200 ]; then
            if [ $DURATION_MS -lt 2000 ]; then
                echo -e "${GREEN}✓ HTTP $HTTP_CODE (${DURATION_MS}ms)${NC}"
            else
                echo -e "${YELLOW}⚠ HTTP $HTTP_CODE (${DURATION_MS}ms - slow)${NC}"
            fi
        else
            echo -e "${RED}✗ HTTP $HTTP_CODE${NC}"
            FAIL=true
        fi
    done
    
    if [ "$FAIL" = true ]; then
        echo -e "\n${RED}Quick check failed!${NC}"
        exit 1
    else
        echo -e "\n${GREEN}Quick check passed!${NC}"
        exit 0
    fi
fi

# Full Lighthouse audit
echo -e "${BLUE}Running full Lighthouse audit...${NC}"
echo "(This may take 2-3 minutes)"
echo ""

# Check if @lhci/cli is available, install if needed
if ! npx --no-install @lhci/cli --version &> /dev/null; then
    echo "Installing Lighthouse CI..."
    npm install -g @lhci/cli
fi

# Run LHCI
if npx @lhci/cli autorun 2>&1; then
    echo ""
    echo -e "${GREEN}✓ All Lighthouse thresholds passed!${NC}"
    
    # Print summary
    echo ""
    echo "Reports saved to: $REPORT_DIR"
    echo ""
    exit 0
else
    LHCI_EXIT=$?
    echo ""
    echo -e "${RED}✗ Lighthouse audit found issues!${NC}"
    
    # Check if there are reports
    if ls "$REPORT_DIR"/*.html &> /dev/null; then
        echo "Review HTML reports in: $REPORT_DIR"
        echo ""
        echo "To view reports:"
        echo "  open $REPORT_DIR/lhr-*.html"
    fi
    
    exit $LHCI_EXIT
fi
