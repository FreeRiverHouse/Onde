#!/bin/bash
# =============================================================================
# BOOK PRODUCTION PIPELINE
# Orchestrates the full book production workflow
# Usage: ./book-production-pipeline.sh <book-slug> <category>
# Example: ./book-production-pipeline.sh meditations classics
# =============================================================================

set -e

ONDE_DIR="/Users/mattiapetrucciani/CascadeProjects/Onde"
TELEGRAM_BOT_TOKEN="8528268093:AAGNZUcYBm8iMcn9D_oWr565rpxm9riNkBM"
TELEGRAM_CHAT_ID="7505631979"
LOG_FILE="$ONDE_DIR/automation/logs/book-pipeline.log"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Send Telegram notification
notify() {
    local message="$1"
    curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
        -d "chat_id=${TELEGRAM_CHAT_ID}" \
        -d "text=$message" \
        -d "parse_mode=HTML" > /dev/null
}

# Arguments
BOOK_SLUG="${1:-}"
CATEGORY="${2:-classics}"

if [ -z "$BOOK_SLUG" ]; then
    echo "Usage: $0 <book-slug> [category]"
    echo "Categories: classics, tech, spirituality, poetry"
    exit 1
fi

BOOK_DIR="$ONDE_DIR/books/$CATEGORY/$BOOK_SLUG"

# Phase 1: Setup
phase_setup() {
    log "PHASE 1: Setting up book directory for $BOOK_SLUG"

    mkdir -p "$BOOK_DIR"/{text,images/{print,web},audio,podcast}

    # Create metadata template
    if [ ! -f "$BOOK_DIR/metadata.json" ]; then
        cat > "$BOOK_DIR/metadata.json" << EOF
{
    "title": "",
    "author": "",
    "translator": null,
    "language": "en",
    "category": "$CATEGORY",
    "chain": "ONDE_$(echo $CATEGORY | tr '[:lower:]' '[:upper:]')",
    "keywords": [],
    "description": "",
    "price": 0.99,
    "isbn": null,
    "status": "draft",
    "created": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "phases": {
        "text": "pending",
        "cover": "pending",
        "illustrations": "pending",
        "epub": "pending",
        "pdf": "pending",
        "audiobook": "pending",
        "published": false
    }
}
EOF
    fi

    # Create README
    if [ ! -f "$BOOK_DIR/README.md" ]; then
        cat > "$BOOK_DIR/README.md" << EOF
# $BOOK_SLUG

**Category:** $CATEGORY
**Status:** Draft
**Created:** $(date '+%Y-%m-%d')

## Checklist

### Text
- [ ] Source text downloaded/written
- [ ] Text cleaned and formatted
- [ ] Forward written (Gianni Parola)
- [ ] Text reviewed

### Visuals
- [ ] Cover generated (Pina Pennello)
- [ ] Cover upscaled
- [ ] Internal illustrations (if applicable)
- [ ] All images in print/ and web/ folders

### Formats
- [ ] EPUB generated
- [ ] PDF generated
- [ ] Sent for review on Telegram

### Publication
- [ ] Approved by Mattia
- [ ] Uploaded to Onde Portal
- [ ] Archived in OndePRDB

## Notes

---
EOF
    fi

    log "Book directory structure created at $BOOK_DIR"
    notify "<b>Book Pipeline Started</b>

Book: <code>$BOOK_SLUG</code>
Category: $CATEGORY
Path: <code>$BOOK_DIR</code>

Ready for content."
}

# Phase 2: Validation
phase_validate() {
    log "PHASE 2: Validating book structure"

    local errors=()

    # Check required files
    [ ! -f "$BOOK_DIR/metadata.json" ] && errors+=("metadata.json missing")
    [ ! -d "$BOOK_DIR/text" ] && errors+=("text/ directory missing")
    [ ! -d "$BOOK_DIR/images" ] && errors+=("images/ directory missing")

    # Check for text content
    if [ "$(ls -A $BOOK_DIR/text/ 2>/dev/null | wc -l)" -eq 0 ]; then
        errors+=("No text files found in text/")
    fi

    if [ ${#errors[@]} -gt 0 ]; then
        log "Validation FAILED:"
        for error in "${errors[@]}"; do
            log "  - $error"
        done
        return 1
    fi

    log "Validation PASSED"
    return 0
}

# Phase 3: Generate EPUB
phase_epub() {
    log "PHASE 3: Generating EPUB"

    local text_file=$(find "$BOOK_DIR/text" -name "*.txt" -o -name "*.md" | head -1)
    local cover_file=$(find "$BOOK_DIR/images" -name "cover*" | head -1)

    if [ -z "$text_file" ]; then
        log "ERROR: No text file found"
        return 1
    fi

    # Check if pandoc is available
    if command -v pandoc &> /dev/null; then
        local epub_file="$BOOK_DIR/${BOOK_SLUG}.epub"

        # Build pandoc command
        local pandoc_args="-o $epub_file"
        [ -n "$cover_file" ] && pandoc_args="$pandoc_args --epub-cover-image=$cover_file"

        pandoc "$text_file" $pandoc_args
        log "EPUB generated: $epub_file"
    else
        log "WARNING: pandoc not installed, skipping EPUB generation"
        return 1
    fi
}

# Phase 4: Generate PDF
phase_pdf() {
    log "PHASE 4: Generating PDF"

    # Check for HTML file first
    local html_file=$(find "$BOOK_DIR" -maxdepth 1 -name "*.html" | head -1)
    local text_file=$(find "$BOOK_DIR/text" -name "*.txt" -o -name "*.md" | head -1)

    if [ -n "$html_file" ]; then
        # Convert HTML to PDF if wkhtmltopdf is available
        if command -v wkhtmltopdf &> /dev/null; then
            wkhtmltopdf "$html_file" "$BOOK_DIR/${BOOK_SLUG}.pdf"
            log "PDF generated from HTML"
        else
            log "WARNING: wkhtmltopdf not installed"
        fi
    elif [ -n "$text_file" ]; then
        # Fallback to pandoc
        if command -v pandoc &> /dev/null; then
            pandoc "$text_file" -o "$BOOK_DIR/${BOOK_SLUG}.pdf" 2>/dev/null || log "PDF generation via pandoc failed"
        fi
    fi
}

# Phase 5: Send for review
phase_review() {
    log "PHASE 5: Sending for review"

    local epub_file="$BOOK_DIR/${BOOK_SLUG}.epub"
    local pdf_file="$BOOK_DIR/${BOOK_SLUG}.pdf"
    local cover_file=$(find "$BOOK_DIR/images" -name "cover*" | head -1)

    notify "<b>BOOK READY FOR REVIEW</b>

<code>$BOOK_SLUG</code>

Files generated:
$([ -f "$epub_file" ] && echo "- EPUB" || echo "- EPUB (missing)")
$([ -f "$pdf_file" ] && echo "- PDF" || echo "- PDF (missing)")
$([ -n "$cover_file" ] && echo "- Cover" || echo "- Cover (missing)")

Path: <code>$BOOK_DIR</code>

Reply with approval or feedback."

    # Send files if they exist
    if [ -f "$cover_file" ]; then
        curl -s -F "chat_id=$TELEGRAM_CHAT_ID" \
             -F "photo=@$cover_file" \
             "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto" > /dev/null
    fi

    if [ -f "$pdf_file" ]; then
        curl -s -F "chat_id=$TELEGRAM_CHAT_ID" \
             -F "document=@$pdf_file" \
             "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument" > /dev/null
    fi

    log "Review materials sent to Telegram"
}

# Main execution
main() {
    log "========== BOOK PIPELINE: $BOOK_SLUG =========="

    case "${3:-full}" in
        setup)
            phase_setup
            ;;
        validate)
            phase_validate
            ;;
        epub)
            phase_epub
            ;;
        pdf)
            phase_pdf
            ;;
        review)
            phase_review
            ;;
        full)
            phase_setup
            log "Setup complete. Add content, then run: $0 $BOOK_SLUG $CATEGORY validate"
            ;;
        *)
            echo "Unknown phase: $3"
            echo "Phases: setup, validate, epub, pdf, review, full"
            exit 1
            ;;
    esac

    log "========== PIPELINE COMPLETE =========="
}

main "$@"
