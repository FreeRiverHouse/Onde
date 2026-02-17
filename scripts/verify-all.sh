#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# VERIFY-ALL.SH - Master script verifica TUTTO
# Esegui prima di qualsiasi deploy/invio importante
# ═══════════════════════════════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colori
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

TOTAL_ERRORS=0
TOTAL_WARNINGS=0

echo "═══════════════════════════════════════════════════════════════"
echo -e "${BLUE}🔍 VERIFICA COMPLETA PROGETTO ONDE${NC}"
echo "═══════════════════════════════════════════════════════════════"
echo "Data: $(date)"
echo "Directory: $PROJECT_ROOT"
echo ""

# ═══════════════════════════════════════════════════════════════
# 1. VERIFICA LIBRI
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}📚 VERIFICA LIBRI${NC}"
echo "───────────────────────────────────────────────────────────────"

for book_dir in "$PROJECT_ROOT"/books/*/; do
    if [ -d "$book_dir" ]; then
        book_name=$(basename "$book_dir")
        
        # Skip non-book directories
        [[ "$book_name" == "classici" || "$book_name" == "classics" || "$book_name" == "poetry" || "$book_name" == "spirituality" || "$book_name" == "tech" ]] && continue
        
        echo ""
        echo -e "${YELLOW}📖 $book_name${NC}"
        
        # Check for HTML
        html_count=$(ls "$book_dir"*.html 2>/dev/null | wc -l)
        pdf_count=$(ls "$book_dir"*.pdf 2>/dev/null | wc -l)
        
        if [ "$html_count" -gt 0 ]; then
            echo "   HTML: ✅ ($html_count file)"
        else
            echo "   HTML: ⚠️  nessuno"
            TOTAL_WARNINGS=$((TOTAL_WARNINGS + 1))
        fi
        
        if [ "$pdf_count" -gt 0 ]; then
            echo "   PDF: ✅ ($pdf_count file)"
        else
            echo "   PDF: ⚠️  nessuno"
            TOTAL_WARNINGS=$((TOTAL_WARNINGS + 1))
        fi
        
        # Check CHANGELOG
        if [ -f "$book_dir/CHANGELOG.md" ]; then
            version=$(grep -oE 'v[0-9]+\.[0-9]+' "$book_dir/CHANGELOG.md" | head -1)
            echo "   CHANGELOG: ✅ ($version)"
        else
            echo "   CHANGELOG: ⚠️  mancante"
            TOTAL_WARNINGS=$((TOTAL_WARNINGS + 1))
        fi
        
        # Check images directory
        if [ -d "$book_dir/images" ]; then
            img_count=$(ls "$book_dir/images/"*.{jpg,png,webp} 2>/dev/null | wc -l)
            echo "   Immagini: ✅ ($img_count file)"
        else
            echo "   Immagini: ⚠️  directory mancante"
        fi
    fi
done

# ═══════════════════════════════════════════════════════════════
# 2. VERIFICA CONTENUTI SOCIAL
# ═══════════════════════════════════════════════════════════════
echo ""
echo -e "${BLUE}📱 VERIFICA CONTENUTI SOCIAL${NC}"
echo "───────────────────────────────────────────────────────────────"

social_files=$(ls "$PROJECT_ROOT"/CONTENUTI-SOCIAL*.html 2>/dev/null)
if [ -n "$social_files" ]; then
    for social_file in $social_files; do
        filename=$(basename "$social_file")
        echo ""
        echo -e "${YELLOW}📄 $filename${NC}"
        
        # Check hashtags
        hashtags=$(grep -oE '#[A-Za-z][A-Za-z0-9]*' "$social_file" 2>/dev/null | wc -l)
        if [ "$hashtags" -gt 0 ]; then
            echo "   Hashtag: ⛔ TROVATI $hashtags (devono essere 0!)"
            TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
        else
            echo "   Hashtag: ✅ nessuno"
        fi
        
        # Check posts count
        posts=$(grep -c 'class="post"' "$social_file" 2>/dev/null || echo 0)
        echo "   Post: $posts"
        
        # Check images
        images=$(grep -c '<img' "$social_file" 2>/dev/null || echo 0)
        echo "   Immagini: $images"
    done
else
    echo "   Nessun file contenuti social trovato"
fi

# ═══════════════════════════════════════════════════════════════
# 3. VERIFICA PROCEDURE
# ═══════════════════════════════════════════════════════════════
echo ""
echo -e "${BLUE}📋 VERIFICA PROCEDURE${NC}"
echo "───────────────────────────────────────────────────────────────"

procedures=$(ls "$PROJECT_ROOT"/PROCEDURA*.md 2>/dev/null | wc -l)
echo "   File PROCEDURA-*.md: $procedures"

if [ -f "$PROJECT_ROOT/PROCEDURE-MASTER-REGISTRY.md" ]; then
    echo "   Master Registry: ✅"
else
    echo "   Master Registry: ⛔ MANCANTE!"
    TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
fi

# ═══════════════════════════════════════════════════════════════
# 4. VERIFICA BACKUP
# ═══════════════════════════════════════════════════════════════
echo ""
echo -e "${BLUE}💾 VERIFICA BACKUP${NC}"
echo "───────────────────────────────────────────────────────────────"

if [ -d "$PROJECT_ROOT/backups" ]; then
    backup_count=$(find "$PROJECT_ROOT/backups" -type f 2>/dev/null | wc -l)
    echo "   Directory backup: ✅"
    echo "   File backup totali: $backup_count"
    
    # Check recent backups
    recent=$(find "$PROJECT_ROOT/backups" -type f -mtime -1 2>/dev/null | wc -l)
    echo "   Backup ultime 24h: $recent"
else
    echo "   Directory backup: ⚠️  mancante"
    mkdir -p "$PROJECT_ROOT/backups"
    echo "   → Creata directory backup"
fi

# ═══════════════════════════════════════════════════════════════
# 5. VERIFICA GIT
# ═══════════════════════════════════════════════════════════════
echo ""
echo -e "${BLUE}📦 VERIFICA GIT${NC}"
echo "───────────────────────────────────────────────────────────────"

cd "$PROJECT_ROOT"
if git rev-parse --git-dir > /dev/null 2>&1; then
    uncommitted=$(git status --porcelain 2>/dev/null | wc -l)
    if [ "$uncommitted" -gt 0 ]; then
        echo "   File non committati: ⚠️  $uncommitted"
        TOTAL_WARNINGS=$((TOTAL_WARNINGS + 1))
    else
        echo "   Working directory: ✅ pulita"
    fi
    
    branch=$(git branch --show-current 2>/dev/null)
    echo "   Branch: $branch"
else
    echo "   Git: ⚠️  non inizializzato"
fi

# ═══════════════════════════════════════════════════════════════
# RIEPILOGO FINALE
# ═══════════════════════════════════════════════════════════════
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo -e "${BLUE}📊 RIEPILOGO FINALE${NC}"
echo "═══════════════════════════════════════════════════════════════"
echo "   Errori critici: $TOTAL_ERRORS"
echo "   Warning: $TOTAL_WARNINGS"
echo ""

if [ "$TOTAL_ERRORS" -gt 0 ]; then
    echo -e "${RED}⛔⛔⛔ $TOTAL_ERRORS ERRORI CRITICI! CORREGGI PRIMA DI PROCEDERE! ⛔⛔⛔${NC}"
    exit 1
elif [ "$TOTAL_WARNINGS" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  $TOTAL_WARNINGS warning - verifica manualmente${NC}"
    exit 0
else
    echo -e "${GREEN}✅✅✅ TUTTO OK! PROGETTO IN BUONO STATO ✅✅✅${NC}"
    exit 0
fi
