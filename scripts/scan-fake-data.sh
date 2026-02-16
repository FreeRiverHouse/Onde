#!/bin/bash
# GROK-DASH-001: Pre-deploy scan for hardcoded fake/mock data patterns
# Run this before deploying onde.surf to production
# Exit code: 0 = clean, 1 = fake data found

set -e

SURFBOARD_DIR="$(dirname "$0")/../apps/surfboard/src"
ERRORS=0

echo "🔍 Scanning onde.surf for fake/mock data patterns..."
echo "=================================================="

# Patterns that should NEVER appear in production API routes
BANNED_PATTERNS=(
  "generateMock"
  "mockData"
  "mock_data"
  "FAKE_"
  "fake_"
  "demoAgent"
  "demo-agent"
  "placeholder.*data"
  "TODO.*fake"
  "TODO.*mock"
  "Math\.random.*\(.*data\|value\|count\|amount\|price\|pnl\|rate\)"
)

# Scan API routes (strict - no fake data allowed)
echo ""
echo "📡 Checking API routes..."
for pattern in "${BANNED_PATTERNS[@]}"; do
  matches=$(grep -rn "$pattern" "$SURFBOARD_DIR/app/api/" --include="*.ts" 2>/dev/null | grep -v "// removed\|// cleaned\|// no mock\|// DASH-" || true)
  if [ -n "$matches" ]; then
    echo "❌ BANNED PATTERN '$pattern' found in API routes:"
    echo "$matches" | sed 's/^/   /'
    ERRORS=$((ERRORS + 1))
  fi
done

# Scan components for generateMock* functions (should use real data)
echo ""
echo "🧩 Checking components for mock generators..."
mock_generators=$(grep -rn "function generateMock\|const generateMock\|export.*generateMock" "$SURFBOARD_DIR/components/" --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "// removed\|// deprecated" || true)
if [ -n "$mock_generators" ]; then
  echo "⚠️  Mock generator functions found in components:"
  echo "$mock_generators" | sed 's/^/   /'
  ERRORS=$((ERRORS + 1))
fi

# Scan for hardcoded fake agent names
echo ""
echo "🤖 Checking for hardcoded fake agent names..."
fake_agents=$(grep -rn "demo-agent-[0-9]\|test-agent-[0-9]\|fake-agent" "$SURFBOARD_DIR/" --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "node_modules\|\.test\.\|// removed\|// cleaned" || true)
if [ -n "$fake_agents" ]; then
  echo "❌ Fake agent names found:"
  echo "$fake_agents" | sed 's/^/   /'
  ERRORS=$((ERRORS + 1))
fi

# Scan for hardcoded dummy metrics
echo ""
echo "📊 Checking for hardcoded dummy metrics..."
dummy_metrics=$(grep -rn "winRate.*=.*0\.\(7[5-9]\|8\|85\|9\)\b\|totalTrades.*=.*1[0-9][0-9][0-9]\b\|pnl.*=.*[0-9][0-9][0-9]\." "$SURFBOARD_DIR/app/api/" --include="*.ts" 2>/dev/null | grep -v "// real\|// from\|// gist\|threshold\|limit\|cap\|max\|min\|filter" || true)
if [ -n "$dummy_metrics" ]; then
  echo "⚠️  Possibly hardcoded metrics in API routes:"
  echo "$dummy_metrics" | sed 's/^/   /'
  # Warning only, not error
fi

echo ""
echo "=================================================="
if [ $ERRORS -eq 0 ]; then
  echo "✅ CLEAN — No fake data patterns found!"
  exit 0
else
  echo "❌ FAILED — Found $ERRORS fake data issues!"
  echo "Fix these before deploying to production."
  exit 1
fi
