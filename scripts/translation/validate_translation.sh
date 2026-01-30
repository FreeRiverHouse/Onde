#!/bin/bash
# validate_translation.sh - Validazione obbligatoria output traduzione
# USARE SEMPRE prima di dichiarare "completato"!

set -e

if [ $# -lt 2 ]; then
    echo "Usage: $0 <originale.txt> <traduzione.txt>"
    exit 1
fi

ORIG=$1
TRAD=$2

echo "═══════════════════════════════════════════════════════"
echo "🔍 VALIDAZIONE TRADUZIONE"
echo "═══════════════════════════════════════════════════════"
echo ""

# Check file esistono
if [ ! -f "$ORIG" ]; then
    echo "🚨 ERRORE: File originale non trovato: $ORIG"
    exit 1
fi

if [ ! -f "$TRAD" ]; then
    echo "🚨 ERRORE: File traduzione non trovato: $TRAD"
    exit 1
fi

# Metriche
ORIG_BYTES=$(wc -c < "$ORIG" | tr -d ' ')
TRAD_BYTES=$(wc -c < "$TRAD" | tr -d ' ')
RATIO=$(echo "scale=2; $TRAD_BYTES * 100 / $ORIG_BYTES" | bc)

ORIG_LINES=$(wc -l < "$ORIG" | tr -d ' ')
TRAD_LINES=$(wc -l < "$TRAD" | tr -d ' ')

ORIG_CAPS=$(grep -c "^Chapter\|^Capitolo\|^# " "$ORIG" 2>/dev/null || echo "0")
TRAD_CAPS=$(grep -c "^Chapter\|^Capitolo\|^# " "$TRAD" 2>/dev/null || echo "0")

echo "📊 METRICHE"
echo "───────────────────────────────────────────────────────"
printf "%-20s %10s %10s %10s\n" "Metrica" "Originale" "Traduzione" "Ratio"
printf "%-20s %10s %10s %10s\n" "Bytes" "$ORIG_BYTES" "$TRAD_BYTES" "${RATIO}%"
printf "%-20s %10s %10s\n" "Righe" "$ORIG_LINES" "$TRAD_LINES"
printf "%-20s %10s %10s\n" "Capitoli/Sezioni" "$ORIG_CAPS" "$TRAD_CAPS"
echo ""

# Encoding check
echo "🔤 ENCODING CHECK"
echo "───────────────────────────────────────────────────────"
BAD_CHARS=$(grep -c "â€™\|â€œ\|â€\|Ã¨\|Ã \|Ã²\|Ã¹\|Ãì" "$TRAD" 2>/dev/null || echo "0")
if [ "$BAD_CHARS" -gt 0 ]; then
    echo "⚠️  Caratteri encoding rotti trovati: $BAD_CHARS"
else
    echo "✅ Encoding OK (no caratteri rotti)"
fi
echo ""

# Struttura check
echo "📐 STRUTTURA CHECK"
echo "───────────────────────────────────────────────────────"
LAST_LINE=$(tail -1 "$TRAD")
LAST_CHAR="${LAST_LINE: -1}"
if [[ "$LAST_CHAR" =~ [a-z,] ]]; then
    echo "⚠️  File potrebbe terminare a metà frase"
    echo "    Ultima riga: ${LAST_LINE:0:50}..."
else
    echo "✅ File termina correttamente"
fi
echo ""

# VERDETTO
echo "═══════════════════════════════════════════════════════"
echo "📋 VERDETTO"
echo "═══════════════════════════════════════════════════════"

FAIL=0

# Check 1: Ratio minimo 80%
if (( $(echo "$RATIO < 80" | bc -l) )); then
    echo "❌ FAIL: Traduzione solo ${RATIO}% dell'originale (minimo 80%)"
    FAIL=1
else
    echo "✅ PASS: Ratio ${RATIO}% >= 80%"
fi

# Check 2: Capitoli
if [ "$TRAD_CAPS" -lt "$ORIG_CAPS" ]; then
    echo "❌ FAIL: Capitoli mancanti ($TRAD_CAPS vs $ORIG_CAPS)"
    FAIL=1
else
    echo "✅ PASS: Tutti i capitoli presenti"
fi

# Check 3: Encoding
if [ "$BAD_CHARS" -gt 10 ]; then
    echo "❌ FAIL: Troppi caratteri encoding rotti ($BAD_CHARS)"
    FAIL=1
else
    echo "✅ PASS: Encoding accettabile"
fi

echo ""
if [ $FAIL -eq 1 ]; then
    echo "🚨 ═══════════════════════════════════════════════════"
    echo "🚨 VALIDAZIONE FALLITA - NON PROCEDERE!"
    echo "🚨 ═══════════════════════════════════════════════════"
    exit 1
else
    echo "✅ ═══════════════════════════════════════════════════"
    echo "✅ VALIDAZIONE SUPERATA - OK PER PROCEDERE"
    echo "✅ ═══════════════════════════════════════════════════"
    exit 0
fi
