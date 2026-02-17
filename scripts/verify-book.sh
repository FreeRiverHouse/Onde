#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# VERIFY-BOOK.SH - Verifica libro BLINDATA (generico per tutti i libri)
# ═══════════════════════════════════════════════════════════════

BOOK_DIR="${1:-.}"
HTML_FILE="${2:-}"
PDF_FILE="${3:-}"

# Auto-detect files if not specified
if [ -z "$HTML_FILE" ]; then
    HTML_FILE=$(ls "$BOOK_DIR"/*.html 2>/dev/null | head -1)
fi
if [ -z "$PDF_FILE" ]; then
    PDF_FILE=$(ls "$BOOK_DIR"/*.pdf 2>/dev/null | head -1)
fi

SNAPSHOT_FILE="$BOOK_DIR/.book-snapshot.txt"

echo "═══════════════════════════════════════════════════════════════"
echo "📖 VERIFICA LIBRO - $BOOK_DIR"
echo "═══════════════════════════════════════════════════════════════"
echo "HTML: $HTML_FILE"
echo "PDF:  $PDF_FILE"
echo ""

ERRORS=0
WARNINGS=0

# 1. Check PDF exists and count pages
echo "📄 CHECK PDF:"
if [ -f "$PDF_FILE" ]; then
    PAGES=$(mdls -name kMDItemNumberOfPages "$PDF_FILE" 2>/dev/null | awk '{print $3}')
    if [ -z "$PAGES" ] || [ "$PAGES" = "(null)" ]; then
        PAGES=0
    fi
    echo "   Pagine: $PAGES"
    SIZE=$(ls -lh "$PDF_FILE" | awk '{print $5}')
    echo "   Dimensione: $SIZE"
else
    echo "⛔ PDF non trovato!"
    PAGES=0
    ERRORS=$((ERRORS + 1))
fi

# 2. Check HTML exists
echo ""
echo "📝 CHECK HTML:"
if [ -f "$HTML_FILE" ]; then
    echo "   File trovato: ✅"
else
    echo "⛔ HTML non trovato!"
    ERRORS=$((ERRORS + 1))
fi

# 3. Check Forward
echo ""
echo "📜 CHECK FORWARD:"
FORWARD=$(grep -c "forward\|You found this\|Onde" "$HTML_FILE" 2>/dev/null || echo 0)
if [ "$FORWARD" -gt 0 ]; then
    echo "   Forward presente: ✅ ($FORWARD occorrenze)"
else
    echo "⚠️  Forward non trovata - potrebbe essere OK per alcuni libri"
    WARNINGS=$((WARNINGS + 1))
fi

# 4. Check Bio Notes
echo ""
echo "👤 CHECK NOTE BIOGRAFICHE:"
BIO=$(grep -c "bio-page\|ABOUT MARCUS\|biographical\|About the Author" "$HTML_FILE" 2>/dev/null | tr -d ' ' || echo 0)
BIO=${BIO:-0}
if [ "$BIO" -gt 0 ]; then
    echo "   Note biografiche presenti: ✅ ($BIO occorrenze)"
else
    echo "⚠️  Note biografiche non trovate"
    WARNINGS=$((WARNINGS + 1))
fi

# 5. Check Images
echo ""
echo "🖼️  CHECK IMMAGINI:"
IMAGES=$(grep -c '<img' "$HTML_FILE" 2>/dev/null || echo 0)
echo "   Immagini nel HTML: $IMAGES"

# Check if image files exist
IMG_MISSING=0
for img in $(grep -oE 'src="[^"]*\.(jpg|png|webp)"' "$HTML_FILE" 2>/dev/null | sed 's/src="//;s/"//'); do
    if [ ! -f "$BOOK_DIR/$img" ] && [ ! -f "$img" ]; then
        echo "   ⛔ Immagine mancante: $img"
        IMG_MISSING=$((IMG_MISSING + 1))
    fi
done
if [ "$IMG_MISSING" -gt 0 ]; then
    ERRORS=$((ERRORS + 1))
else
    echo "   Tutte le immagini esistono: ✅"
fi

# 6. Check Cover
echo ""
echo "📕 CHECK COVER:"
COVER=$(grep -c 'cover' "$HTML_FILE" 2>/dev/null || echo 0)
if [ "$COVER" -gt 0 ]; then
    echo "   Cover presente: ✅"
else
    echo "⛔ Cover non trovata!"
    ERRORS=$((ERRORS + 1))
fi

# 7. Check FINIS/End page
echo ""
echo "🏁 CHECK PAGINA FINALE:"
FINIS=$(grep -c "FINIS\|finis\|end-page" "$HTML_FILE" 2>/dev/null || echo 0)
if [ "$FINIS" -gt 0 ]; then
    echo "   Pagina finale presente: ✅"
else
    echo "⚠️  Pagina FINIS non trovata"
    WARNINGS=$((WARNINGS + 1))
fi

# 8. Check CHANGELOG
echo ""
echo "📋 CHECK CHANGELOG:"
if [ -f "$BOOK_DIR/CHANGELOG.md" ]; then
    VERSION=$(grep -oE 'v[0-9]+\.[0-9]+' "$BOOK_DIR/CHANGELOG.md" | head -1)
    echo "   CHANGELOG presente: ✅ (versione $VERSION)"
else
    echo "⚠️  CHANGELOG.md non trovato - creane uno!"
    WARNINGS=$((WARNINGS + 1))
fi

# Confronta con snapshot se esiste
if [ -f "$SNAPSHOT_FILE" ]; then
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo "📊 CONFRONTO CON SNAPSHOT PRECEDENTE"
    echo "═══════════════════════════════════════════════════════════════"
    source "$SNAPSHOT_FILE"
    
    if [ "$PAGES" -lt "$((PREV_PAGES - 5))" ]; then
        echo "⛔ ERRORE: Pagine diminuite drasticamente! $PREV_PAGES → $PAGES"
        ERRORS=$((ERRORS + 1))
    elif [ "$PAGES" -lt "$PREV_PAGES" ]; then
        echo "⚠️  Pagine diminuite: $PREV_PAGES → $PAGES"
        WARNINGS=$((WARNINGS + 1))
    else
        echo "✅ Pagine: $PREV_PAGES → $PAGES"
    fi
    
    if [ "$FORWARD" -lt "$PREV_FORWARD" ]; then
        echo "⛔ ERRORE: Forward persa! $PREV_FORWARD → $FORWARD"
        ERRORS=$((ERRORS + 1))
    else
        echo "✅ Forward: $PREV_FORWARD → $FORWARD"
    fi
    
    if [ "$BIO" -lt "$PREV_BIO" ]; then
        echo "⛔ ERRORE: Bio notes perse! $PREV_BIO → $BIO"
        ERRORS=$((ERRORS + 1))
    else
        echo "✅ Bio: $PREV_BIO → $BIO"
    fi
    
    if [ "$IMAGES" -lt "$PREV_IMAGES" ]; then
        echo "⛔ ERRORE: Immagini perse! $PREV_IMAGES → $IMAGES"
        ERRORS=$((ERRORS + 1))
    else
        echo "✅ Immagini: $PREV_IMAGES → $IMAGES"
    fi
fi

# Salva snapshot
cat > "$SNAPSHOT_FILE" << EOF
PREV_PAGES=$PAGES
PREV_FORWARD=$FORWARD
PREV_BIO=$BIO
PREV_IMAGES=$IMAGES
PREV_FINIS=$FINIS
PREV_COVER=$COVER
EOF

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "📊 RIEPILOGO"
echo "═══════════════════════════════════════════════════════════════"
echo "   Errori: $ERRORS"
echo "   Warning: $WARNINGS"
echo ""

if [ "$ERRORS" -gt 0 ]; then
    echo "⛔⛔⛔ $ERRORS ERRORI! NON PROCEDERE! ⛔⛔⛔"
    exit 1
elif [ "$WARNINGS" -gt 0 ]; then
    echo "⚠️  $WARNINGS warning - verifica manualmente prima di procedere"
    exit 0
else
    echo "✅✅✅ TUTTI I CHECK PASSATI ✅✅✅"
    exit 0
fi
