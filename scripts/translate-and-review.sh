#!/bin/bash
# Flusso completo: Traduzione + Revisione con modelli LOCALI
# Usa LLaMA 3 8B su Radeon/TinyGrad

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ -z "$1" ]; then
    echo "🌍 Traduzione + Revisione LOCALE"
    echo ""
    echo "Uso: $0 <file_input> [file_output] [source_lang] [target_lang]"
    echo ""
    echo "Esempio:"
    echo "  $0 book_english.txt book_italian.txt English Italian"
    echo ""
    echo "Default: English → Italian"
    exit 1
fi

INPUT="$1"
OUTPUT="${2:-${INPUT%.*}_it.txt}"
SOURCE="${3:-English}"
TARGET="${4:-Italian}"
REPORT="${OUTPUT%.*}_review.json"

echo "═══════════════════════════════════════════════════════════"
echo "🌍 TRADUZIONE + REVISIONE LOCALE"
echo "═══════════════════════════════════════════════════════════"
echo "   Input:    $INPUT"
echo "   Output:   $OUTPUT"
echo "   Lingue:   $SOURCE → $TARGET"
echo "   Report:   $REPORT"
echo "═══════════════════════════════════════════════════════════"
echo ""

# STEP 1: Traduzione
echo "📝 STEP 1: Traduzione con LLaMA 3 locale..."
python3 "$SCRIPT_DIR/translate-local.py" "$INPUT" "$OUTPUT" "$SOURCE" "$TARGET"

echo ""
echo "═══════════════════════════════════════════════════════════"

# STEP 2: Revisione
echo "🔍 STEP 2: Revisione riga per riga..."
python3 "$SCRIPT_DIR/translation-reviewer.py" "$INPUT" "$OUTPUT" "$REPORT"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ COMPLETATO!"
echo ""
echo "File generati:"
echo "   📄 Traduzione: $OUTPUT"
echo "   📊 Report:     $REPORT"
echo "═══════════════════════════════════════════════════════════"
