#!/bin/bash
# Test automatici per Moonlight Tamagotchi - Onde Factory Mode
# Usage: ./scripts/test-app.sh [port]

PORT=${1:-1112}
BASE_URL="http://localhost:$PORT"
APP_NAME="moonlight-tamagotchi"

echo "🧪 Testing $APP_NAME on $BASE_URL"
echo "=================================="

# 1. Test connettività
echo ""
echo "1. Testing connectivity..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL)
if [ "$HTTP_CODE" != "200" ]; then
    echo "❌ FAIL: Server not responding (HTTP $HTTP_CODE)"
    exit 1
fi
echo "✅ Server responding (HTTP $HTTP_CODE)"

# 2. Test HTML response
echo ""
echo "2. Testing HTML structure..."
HTML=$(curl -s $BASE_URL)
if echo "$HTML" | grep -q '<div id="root"'; then
    echo "✅ React root element found"
else
    echo "❌ FAIL: React root element not found"
    exit 1
fi

# 3. Test titolo pagina
echo ""
echo "3. Testing page title..."
if echo "$HTML" | grep -q 'Moonlight'; then
    echo "✅ Page title contains 'Moonlight'"
else
    echo "⚠️ WARNING: Page title doesn't contain 'Moonlight'"
fi

# 4. Test Vite module script
echo ""
echo "4. Testing Vite module..."
if echo "$HTML" | grep -q 'type="module"'; then
    echo "✅ Vite module script found"
else
    echo "⚠️ WARNING: No Vite module script found"
fi

# 5. Test main.tsx loads
echo ""
echo "5. Testing main entry point..."
MAIN_URL="${BASE_URL}/src/main.tsx"
MAIN_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$MAIN_URL")
if [ "$MAIN_CODE" = "200" ]; then
    echo "✅ main.tsx loads (HTTP $MAIN_CODE)"
else
    echo "⚠️ WARNING: main.tsx returned HTTP $MAIN_CODE"
fi

# 6. Test App.tsx loads
echo ""
echo "6. Testing App component..."
APP_URL="${BASE_URL}/src/App.tsx"
APP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL")
if [ "$APP_CODE" = "200" ]; then
    echo "✅ App.tsx loads (HTTP $APP_CODE)"
else
    echo "⚠️ WARNING: App.tsx returned HTTP $APP_CODE"
fi

# 7. Test CSS loads
echo ""
echo "7. Testing styles..."
CSS_URL="${BASE_URL}/src/App.css"
CSS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$CSS_URL")
if [ "$CSS_CODE" = "200" ]; then
    echo "✅ App.css loads (HTTP $CSS_CODE)"
else
    echo "⚠️ WARNING: App.css returned HTTP $CSS_CODE"
fi

# Summary
echo ""
echo "=================================="
echo "🎉 All critical tests passed for $APP_NAME"
echo ""
echo "📝 Next steps:"
echo "   - Run Chrome visual tests for UI verification"
echo "   - node scripts/factory-test.js $APP_NAME $PORT"
echo ""
