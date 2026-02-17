#!/bin/bash
# Moonlight House Auto-Testing con finestra VISIBILE
# Lancia test E2E con browser aperto che puoi vedere

cd /Users/mattia/Projects/Onde/apps/moonlight-house

echo "🌙 Moonlight House Auto-Testing"
echo "================================"
echo "Browser: VISIBILE (headed mode)"
echo ""

# Assicurati che il dev server sia attivo
if ! curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "⏳ Avvio dev server..."
    npm run dev &
    DEV_PID=$!
    sleep 5
fi

echo "🧪 Lancio test con browser visibile..."
echo ""

# Loop continuo per testing 24/7
while true; do
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🕐 $(date '+%H:%M:%S') - Inizio ciclo test"
    
    # Lancia Playwright con headed mode
    npx playwright test --headed --reporter=line 2>&1
    
    RESULT=$?
    if [ $RESULT -eq 0 ]; then
        echo "✅ $(date '+%H:%M:%S') - Tutti i test passati!"
    else
        echo "❌ $(date '+%H:%M:%S') - Alcuni test falliti"
        # Crea alert per fallimento
        echo "Test failed at $(date)" > /Users/mattia/Projects/Onde/scripts/moonlight-test-failure.alert
    fi
    
    echo "⏸️  Pausa 60 secondi prima del prossimo ciclo..."
    sleep 60
done
