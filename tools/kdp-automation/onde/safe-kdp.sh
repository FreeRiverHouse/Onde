#!/bin/bash
#
# ONDE SAFE KDP AUTOMATION WRAPPER
#
# Questo script è un wrapper sicuro per auto-kdp.
# Implementa regole rigide su cosa può e non può essere automatizzato.
#
# REGOLE DI SICUREZZA:
# ✅ PERMESSO: book-metadata, content-metadata, pricing, scrape
# ⚠️ RICHIEDE CONFERMA: content (upload files), publish
# ❌ VIETATO: nulla che modifichi ISBN già assegnati, delete, archivio
#

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
KDP_ROOT="$(dirname "$SCRIPT_DIR")"
BOOKS_CSV="$SCRIPT_DIR/books.csv"
BOOKS_CONF="$SCRIPT_DIR/books.conf"
LOG_FILE="$SCRIPT_DIR/kdp-automation.log"

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
    echo -e "$1"
}

error() {
    log "${RED}ERRORE: $1${NC}"
    exit 1
}

warning() {
    log "${YELLOW}ATTENZIONE: $1${NC}"
}

success() {
    log "${GREEN}$1${NC}"
}

# Verifica che auto-kdp sia installato
check_dependencies() {
    if [ ! -f "$KDP_ROOT/src/main.ts" ]; then
        error "auto-kdp non trovato in $KDP_ROOT"
    fi

    if [ ! -f "$BOOKS_CSV" ]; then
        error "books.csv non trovato in $BOOKS_CSV"
    fi

    if [ ! -f "$BOOKS_CONF" ]; then
        error "books.conf non trovato in $BOOKS_CONF"
    fi
}

# Azioni PERMESSE senza conferma
SAFE_ACTIONS="book-metadata content-metadata pricing scrape"

# Azioni che RICHIEDONO conferma
CONFIRM_ACTIONS="content publish"

# Azioni VIETATE
FORBIDDEN_ACTIONS=""

is_safe_action() {
    [[ " $SAFE_ACTIONS " =~ " $1 " ]]
}

is_confirm_action() {
    [[ " $CONFIRM_ACTIONS " =~ " $1 " ]]
}

confirm() {
    read -p "$1 [y/N]: " response
    case "$response" in
        [yY][eE][sS]|[yY])
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

show_help() {
    cat << EOF
ONDE Safe KDP Automation

USO:
    $0 <azione> [opzioni]

AZIONI SICURE (eseguibili senza conferma):
    book-metadata     - Aggiorna metadati libro (titolo, autore, descrizione)
    content-metadata  - Aggiorna metadati contenuto (formato, trim, colore)
    pricing           - Aggiorna prezzi
    scrape            - Scarica info libri esistenti da KDP

AZIONI CON CONFERMA:
    content           - Upload manuscript e cover (richiede conferma)
    publish           - Pubblica libro (richiede conferma)

OPZIONI:
    --name=NAME       - Processa solo il libro con questo nome
    --dry-run         - Mostra cosa farebbe senza eseguire
    --help            - Mostra questo messaggio

ESEMPI:
    $0 book-metadata --name=psalm23-es    # Aggiorna metadati spagnolo
    $0 pricing                            # Aggiorna tutti i prezzi
    $0 content --name=psalm23-fr          # Upload contenuto (con conferma)
    $0 publish --name=psalm23-de          # Pubblica (con conferma)

CONFIG:
    CSV:  $BOOKS_CSV
    CONF: $BOOKS_CONF
    LOG:  $LOG_FILE

EOF
}

run_kdp() {
    local action=$1
    shift

    log "Eseguendo: auto-kdp $action $@"

    cd "$KDP_ROOT"
    npx ts-node src/main.ts \
        --csv "$BOOKS_CSV" \
        --config "$BOOKS_CONF" \
        --action "$action" \
        "$@"
}

main() {
    if [ $# -eq 0 ] || [ "$1" == "--help" ]; then
        show_help
        exit 0
    fi

    check_dependencies

    local action=$1
    shift

    local name_filter=""
    local dry_run=false
    local extra_args=""

    # Parse opzioni
    while [ $# -gt 0 ]; do
        case "$1" in
            --name=*)
                name_filter="${1#*=}"
                extra_args="$extra_args --name $name_filter"
                ;;
            --dry-run)
                dry_run=true
                warning "DRY-RUN: nessuna azione verrà eseguita"
                ;;
            *)
                extra_args="$extra_args $1"
                ;;
        esac
        shift
    done

    log "=== ONDE KDP Automation ==="
    log "Azione: $action"
    [ -n "$name_filter" ] && log "Filtro: $name_filter"

    # Controlla tipo di azione
    if is_safe_action "$action"; then
        success "Azione sicura: $action"
        if [ "$dry_run" = false ]; then
            run_kdp "$action" $extra_args
        fi

    elif is_confirm_action "$action"; then
        warning "Azione che richiede conferma: $action"

        case "$action" in
            content)
                echo ""
                echo "Stai per caricare manuscript e cover su KDP."
                echo "Questa azione modifica il contenuto del libro."
                ;;
            publish)
                echo ""
                echo "⚠️  ATTENZIONE: Stai per PUBBLICARE il libro su KDP!"
                echo "Una volta pubblicato:"
                echo "  - L'ISBN verrà assegnato permanentemente"
                echo "  - Il libro sarà visibile su Amazon"
                echo "  - Non potrai eliminare il record"
                ;;
        esac

        if confirm "Vuoi procedere?"; then
            if [ "$dry_run" = false ]; then
                run_kdp "$action" $extra_args
            fi
            success "Completato: $action"
        else
            warning "Operazione annullata dall'utente"
            exit 0
        fi

    else
        error "Azione non riconosciuta o vietata: $action"
    fi
}

main "$@"
