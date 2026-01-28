#!/bin/bash
# Test Automatici Website - PROCEDURA CENTRALIZZATA
# Questa procedura viene chiamata da TUTTI gli script di deploy
# per testare il sito PRIMA di fare il deploy
#
# CARATTERISTICHE:
# - Test automatici con Playwright
# - Server TEST su localhost (porta configurabile)
# - Screenshot automatici
# - Report dettagliato
# - Exit code 0 se OK, 1 se FAIL
#
# Usage:
#   ./test-website-before-deploy.sh <port> <environment-name>
#
# Example:
#   ./test-website-before-deploy.sh 8888 onde-la
#   ./test-website-before-deploy.sh 7777 onde-surf

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Parameters
TEST_PORT=${1:-8888}
ENVIRONMENT=${2:-onde-la}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ONDE_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
PORTAL_DIR="$ONDE_ROOT/apps/onde-portal"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  🧪 TEST AUTOMATICI WEBSITE - PROCEDURA CENTRALIZZATA${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Environment: $ENVIRONMENT${NC}"
echo -e "${BLUE}  Test Port: $TEST_PORT${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Step 1: Kill any existing server on test port
echo -e "${YELLOW}🔧 Preparing test environment...${NC}"
pkill -f "next dev -p $TEST_PORT" 2>/dev/null || true
sleep 2
echo -e "${GREEN}✅ Test environment ready${NC}"
echo ""

# Step 2: Start test server in background
echo -e "${YELLOW}🚀 Starting test server on localhost:$TEST_PORT...${NC}"
cd "$PORTAL_DIR"

if [ "$ENVIRONMENT" = "onde-la" ]; then
    npm run test:onde-la > /tmp/onde-test-server-$TEST_PORT.log 2>&1 &
elif [ "$ENVIRONMENT" = "onde-surf" ]; then
    npm run test:onde-surf > /tmp/onde-test-server-$TEST_PORT.log 2>&1 &
else
    echo -e "${RED}❌ Unknown environment: $ENVIRONMENT${NC}"
    exit 1
fi

TEST_SERVER_PID=$!
echo -e "${YELLOW}   Test server PID: $TEST_SERVER_PID${NC}"

# Step 3: Wait for server to be ready
echo -e "${YELLOW}   Waiting for server to be ready...${NC}"
sleep 8

# Check if server is actually running
if ! ps -p $TEST_SERVER_PID > /dev/null; then
    echo -e "${RED}❌ Test server failed to start${NC}"
    echo -e "${RED}   Check logs: /tmp/onde-test-server-$TEST_PORT.log${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Test server running${NC}"
echo ""

# Step 4: Run automated tests
echo -e "${YELLOW}🧪 Executing tests...${NC}"
cd "$ONDE_ROOT"

# Check if playwright is available
if python3 -c "import playwright" 2>/dev/null; then
    echo -e "${YELLOW}   Using Playwright tests...${NC}"
    python3 tools/tech-support/test-modifiche-website.py http://localhost:$TEST_PORT $ENVIRONMENT
    TEST_EXIT_CODE=$?
else
    echo -e "${YELLOW}   ⚠️  Playwright not installed - using basic curl tests${NC}"
    # Basic curl tests as fallback
    TEST_EXIT_CODE=0

    # Test homepage
    if curl -sf "http://localhost:$TEST_PORT" > /dev/null 2>&1; then
        echo -e "${GREEN}   ✅ Homepage loads OK${NC}"
    else
        echo -e "${RED}   ❌ Homepage failed to load${NC}"
        TEST_EXIT_CODE=1
    fi

    # Test a subpage
    if curl -sf "http://localhost:$TEST_PORT/catalogo" > /dev/null 2>&1; then
        echo -e "${GREEN}   ✅ Catalogo page loads OK${NC}"
    else
        echo -e "${YELLOW}   ⚠️  Catalogo page not reachable${NC}"
    fi
fi

# Step 5: Cleanup - Kill test server
echo ""
echo -e "${YELLOW}🧹 Cleaning up test environment...${NC}"
kill $TEST_SERVER_PID 2>/dev/null || true
pkill -f "next dev -p $TEST_PORT" 2>/dev/null || true
sleep 1
echo -e "${GREEN}✅ Cleanup complete${NC}"
echo ""

# Step 6: Report results
if [ $TEST_EXIT_CODE -ne 0 ]; then
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}  ❌ TEST AUTOMATICI FALLITI!${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}  Deploy DEVE essere ABORTITO${NC}"
    echo -e "${RED}  Fix errors before deploying${NC}"
    echo ""
    exit 1
fi

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  ✅ TEST AUTOMATICI SUPERATI!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Sito pronto per il deploy${NC}"
echo ""

exit 0
