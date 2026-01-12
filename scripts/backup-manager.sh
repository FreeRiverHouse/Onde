#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# BACKUP-MANAGER.SH - Gestione backup automatica BLINDATA
# ═══════════════════════════════════════════════════════════════

ACTION="${1:-create}"
TYPE="${2:-book}"
SOURCE="${3:-}"

BACKUP_ROOT="/Users/mattia/Projects/Onde/backups"
TIMESTAMP=$(date +"%Y-%m-%d-%H-%M")

# Colori
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

show_help() {
    echo "═══════════════════════════════════════════════════════════════"
    echo "BACKUP MANAGER - Gestione backup automatica"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
    echo "USAGE:"
    echo "  $0 create book [book_dir]     - Backup libro"
    echo "  $0 create social [file]       - Backup contenuti social"
    echo "  $0 list [type]                - Lista backup"
    echo "  $0 restore [backup_file]      - Ripristina backup"
    echo "  $0 clean [days]               - Pulisci backup vecchi di N giorni"
    echo ""
}

create_backup() {
    local type=$1
    local source=$2
    local backup_dir="$BACKUP_ROOT/$type"
    
    mkdir -p "$backup_dir"
    
    case $type in
        book)
            if [ -d "$source" ]; then
                local book_name=$(basename "$source")
                local backup_file="$backup_dir/${book_name}-BACKUP-$TIMESTAMP.tar.gz"
                
                echo "📦 Creando backup libro: $book_name"
                tar -czf "$backup_file" -C "$(dirname "$source")" "$book_name" 2>/dev/null
                
                if [ $? -eq 0 ]; then
                    echo -e "${GREEN}✅ Backup creato: $backup_file${NC}"
                    echo "$backup_file"
                else
                    echo -e "${RED}⛔ Errore creazione backup${NC}"
                    exit 1
                fi
            else
                echo -e "${RED}⛔ Directory non trovata: $source${NC}"
                exit 1
            fi
            ;;
            
        social)
            if [ -f "$source" ]; then
                local file_name=$(basename "$source" .html)
                local backup_file="$backup_dir/${file_name}-BACKUP-$TIMESTAMP.html"
                
                echo "📦 Creando backup social: $file_name"
                cp "$source" "$backup_file"
                
                if [ $? -eq 0 ]; then
                    echo -e "${GREEN}✅ Backup creato: $backup_file${NC}"
                    echo "$backup_file"
                else
                    echo -e "${RED}⛔ Errore creazione backup${NC}"
                    exit 1
                fi
            else
                echo -e "${RED}⛔ File non trovato: $source${NC}"
                exit 1
            fi
            ;;
            
        *)
            echo -e "${RED}⛔ Tipo backup non supportato: $type${NC}"
            exit 1
            ;;
    esac
}

list_backups() {
    local type=$1
    local backup_dir="$BACKUP_ROOT/$type"
    
    echo "═══════════════════════════════════════════════════════════════"
    echo "📋 LISTA BACKUP - $type"
    echo "═══════════════════════════════════════════════════════════════"
    
    if [ -d "$backup_dir" ]; then
        ls -lht "$backup_dir" | head -20
        echo ""
        local count=$(ls -1 "$backup_dir" 2>/dev/null | wc -l)
        echo "Totale backup: $count"
    else
        echo "Nessun backup trovato per tipo: $type"
    fi
}

restore_backup() {
    local backup_file=$1
    
    if [ ! -f "$backup_file" ]; then
        echo -e "${RED}⛔ Backup non trovato: $backup_file${NC}"
        exit 1
    fi
    
    echo "═══════════════════════════════════════════════════════════════"
    echo "🔄 RIPRISTINO BACKUP"
    echo "═══════════════════════════════════════════════════════════════"
    echo "File: $backup_file"
    echo ""
    
    # Determina tipo dal nome/estensione
    if [[ "$backup_file" == *.tar.gz ]]; then
        echo "Tipo: Archivio libro"
        echo "Destinazione: verrà estratto nella directory corrente"
        read -p "Procedere? (y/n): " confirm
        if [ "$confirm" = "y" ]; then
            tar -xzf "$backup_file"
            echo -e "${GREEN}✅ Ripristino completato${NC}"
        fi
    elif [[ "$backup_file" == *.html ]]; then
        echo "Tipo: File HTML"
        local dest=$(basename "$backup_file" | sed 's/-BACKUP-[0-9-]*//g')
        echo "Destinazione suggerita: $dest"
        read -p "Procedere? (y/n): " confirm
        if [ "$confirm" = "y" ]; then
            cp "$backup_file" "./$dest"
            echo -e "${GREEN}✅ Ripristino completato: ./$dest${NC}"
        fi
    fi
}

clean_old_backups() {
    local days=${1:-30}
    
    echo "═══════════════════════════════════════════════════════════════"
    echo "🧹 PULIZIA BACKUP VECCHI DI $days GIORNI"
    echo "═══════════════════════════════════════════════════════════════"
    
    local count=$(find "$BACKUP_ROOT" -type f -mtime +$days 2>/dev/null | wc -l)
    echo "File da eliminare: $count"
    
    if [ "$count" -gt 0 ]; then
        find "$BACKUP_ROOT" -type f -mtime +$days -print
        echo ""
        read -p "Eliminare questi file? (y/n): " confirm
        if [ "$confirm" = "y" ]; then
            find "$BACKUP_ROOT" -type f -mtime +$days -delete
            echo -e "${GREEN}✅ Pulizia completata${NC}"
        fi
    else
        echo "Nessun backup da eliminare"
    fi
}

# Main
case $ACTION in
    create)
        create_backup "$TYPE" "$SOURCE"
        ;;
    list)
        list_backups "$TYPE"
        ;;
    restore)
        restore_backup "$TYPE"
        ;;
    clean)
        clean_old_backups "$TYPE"
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        show_help
        exit 1
        ;;
esac
