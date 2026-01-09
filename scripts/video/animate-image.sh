#!/bin/bash
# =============================================================================
# animate-image.sh - Anima immagini statiche con effetti Ken Burns
# =============================================================================
# Crea video da immagini statiche usando ffmpeg con effetti di:
# - Ken Burns (zoom lento in/out)
# - Pan orizzontale/verticale
# - Fade in/out
#
# Uso: ./animate-image.sh [opzioni] <immagine_input> <video_output>
#
# Opzioni:
#   -d, --duration <sec>    Durata del video (default: 5)
#   -e, --effect <tipo>     Tipo effetto: zoom-in, zoom-out, pan-left, pan-right,
#                           pan-up, pan-down, zoom-pan (default: zoom-in)
#   -i, --intensity <val>   Intensità effetto 0.1-0.5 (default: 0.2)
#   -f, --fade <sec>        Durata fade in/out (default: 0.5)
#   -r, --resolution <WxH>  Risoluzione output (default: 1920x1080)
#   -fps, --framerate <n>   Frame rate (default: 30)
#   -q, --quality <crf>     Qualità video CRF 0-51, lower=better (default: 18)
#   --no-fade               Disabilita fade in/out
#   -h, --help              Mostra questo help
#
# Esempi:
#   ./animate-image.sh foto.jpg video.mp4
#   ./animate-image.sh -d 10 -e zoom-out -i 0.3 foto.jpg video.mp4
#   ./animate-image.sh -e pan-left -f 1 --resolution 1080x1920 foto.jpg video.mp4
# =============================================================================

set -e

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Valori di default
DURATION=5
EFFECT="zoom-in"
INTENSITY=0.2
FADE_DURATION=0.5
RESOLUTION="1920x1080"
FRAMERATE=30
QUALITY=18
NO_FADE=false

# Funzione per mostrare l'help
show_help() {
    head -35 "$0" | tail -32 | sed 's/^# //' | sed 's/^#//'
    exit 0
}

# Funzione per logging
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERRORE]${NC} $1" >&2
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Parse argomenti
while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--duration)
            DURATION="$2"
            shift 2
            ;;
        -e|--effect)
            EFFECT="$2"
            shift 2
            ;;
        -i|--intensity)
            INTENSITY="$2"
            shift 2
            ;;
        -f|--fade)
            FADE_DURATION="$2"
            shift 2
            ;;
        -r|--resolution)
            RESOLUTION="$2"
            shift 2
            ;;
        -fps|--framerate)
            FRAMERATE="$2"
            shift 2
            ;;
        -q|--quality)
            QUALITY="$2"
            shift 2
            ;;
        --no-fade)
            NO_FADE=true
            shift
            ;;
        -h|--help)
            show_help
            ;;
        -*)
            log_error "Opzione sconosciuta: $1"
            exit 1
            ;;
        *)
            if [ -z "$INPUT_IMAGE" ]; then
                INPUT_IMAGE="$1"
            elif [ -z "$OUTPUT_VIDEO" ]; then
                OUTPUT_VIDEO="$1"
            fi
            shift
            ;;
    esac
done

# Verifica argomenti obbligatori
if [ -z "$INPUT_IMAGE" ] || [ -z "$OUTPUT_VIDEO" ]; then
    log_error "Uso: $0 [opzioni] <immagine_input> <video_output>"
    echo "Usa -h per vedere tutte le opzioni"
    exit 1
fi

# Verifica che il file input esista
if [ ! -f "$INPUT_IMAGE" ]; then
    log_error "File non trovato: $INPUT_IMAGE"
    exit 1
fi

# Verifica ffmpeg
if ! command -v ffmpeg &> /dev/null; then
    log_error "ffmpeg non trovato. Installalo con: brew install ffmpeg"
    exit 1
fi

# Estrai dimensioni output
OUT_WIDTH=$(echo "$RESOLUTION" | cut -d'x' -f1)
OUT_HEIGHT=$(echo "$RESOLUTION" | cut -d'x' -f2)

# Calcola il numero totale di frame
TOTAL_FRAMES=$(echo "$DURATION * $FRAMERATE" | bc)

log_info "Configurazione:"
log_info "  Input: $INPUT_IMAGE"
log_info "  Output: $OUTPUT_VIDEO"
log_info "  Durata: ${DURATION}s"
log_info "  Effetto: $EFFECT (intensità: $INTENSITY)"
log_info "  Risoluzione: ${OUT_WIDTH}x${OUT_HEIGHT}"
log_info "  Frame rate: $FRAMERATE fps"
log_info "  Qualità CRF: $QUALITY"
if [ "$NO_FADE" = false ]; then
    log_info "  Fade: ${FADE_DURATION}s"
fi

# Costruisci il filtro zoompan in base all'effetto
# Formula: zoom inizia da 1 e va a 1+intensity (zoom-in) o viceversa
# Per pan: spostiamo x o y progressivamente

case $EFFECT in
    zoom-in)
        # Zoom in: da 1 a 1+intensity, centrato
        ZOOM_FILTER="zoompan=z='1+${INTENSITY}*in/${TOTAL_FRAMES}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${TOTAL_FRAMES}:s=${OUT_WIDTH}x${OUT_HEIGHT}:fps=${FRAMERATE}"
        ;;
    zoom-out)
        # Zoom out: da 1+intensity a 1, centrato
        ZOOM_FILTER="zoompan=z='1+${INTENSITY}-${INTENSITY}*in/${TOTAL_FRAMES}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${TOTAL_FRAMES}:s=${OUT_WIDTH}x${OUT_HEIGHT}:fps=${FRAMERATE}"
        ;;
    pan-left)
        # Pan da destra a sinistra con leggero zoom
        ZOOM_FILTER="zoompan=z='1.1':x='iw*${INTENSITY}-(iw*${INTENSITY}*2*in/${TOTAL_FRAMES})':y='ih/2-(ih/zoom/2)':d=${TOTAL_FRAMES}:s=${OUT_WIDTH}x${OUT_HEIGHT}:fps=${FRAMERATE}"
        ;;
    pan-right)
        # Pan da sinistra a destra con leggero zoom
        ZOOM_FILTER="zoompan=z='1.1':x='-iw*${INTENSITY}+(iw*${INTENSITY}*2*in/${TOTAL_FRAMES})':y='ih/2-(ih/zoom/2)':d=${TOTAL_FRAMES}:s=${OUT_WIDTH}x${OUT_HEIGHT}:fps=${FRAMERATE}"
        ;;
    pan-up)
        # Pan dal basso verso l'alto con leggero zoom
        ZOOM_FILTER="zoompan=z='1.1':x='iw/2-(iw/zoom/2)':y='ih*${INTENSITY}-(ih*${INTENSITY}*2*in/${TOTAL_FRAMES})':d=${TOTAL_FRAMES}:s=${OUT_WIDTH}x${OUT_HEIGHT}:fps=${FRAMERATE}"
        ;;
    pan-down)
        # Pan dall'alto verso il basso con leggero zoom
        ZOOM_FILTER="zoompan=z='1.1':x='iw/2-(iw/zoom/2)':y='-ih*${INTENSITY}+(ih*${INTENSITY}*2*in/${TOTAL_FRAMES})':d=${TOTAL_FRAMES}:s=${OUT_WIDTH}x${OUT_HEIGHT}:fps=${FRAMERATE}"
        ;;
    zoom-pan)
        # Combinazione: zoom-in con pan diagonale
        ZOOM_FILTER="zoompan=z='1+${INTENSITY}*in/${TOTAL_FRAMES}':x='iw*0.1-(iw*0.2*in/${TOTAL_FRAMES})':y='ih*0.1-(ih*0.2*in/${TOTAL_FRAMES})':d=${TOTAL_FRAMES}:s=${OUT_WIDTH}x${OUT_HEIGHT}:fps=${FRAMERATE}"
        ;;
    *)
        log_error "Effetto sconosciuto: $EFFECT"
        log_error "Effetti disponibili: zoom-in, zoom-out, pan-left, pan-right, pan-up, pan-down, zoom-pan"
        exit 1
        ;;
esac

# Aggiungi fade se richiesto
if [ "$NO_FADE" = false ] && [ "$(echo "$FADE_DURATION > 0" | bc)" -eq 1 ]; then
    FADE_IN_FRAMES=$(echo "$FADE_DURATION * $FRAMERATE" | bc)
    FADE_OUT_START=$(echo "$DURATION - $FADE_DURATION" | bc)
    FADE_FILTER=",fade=t=in:st=0:d=${FADE_DURATION},fade=t=out:st=${FADE_OUT_START}:d=${FADE_DURATION}"
else
    FADE_FILTER=""
fi

# Costruisci il comando ffmpeg completo
FILTER_COMPLEX="${ZOOM_FILTER}${FADE_FILTER}"

log_info "Avvio elaborazione..."

# Esegui ffmpeg
ffmpeg -y -loop 1 -i "$INPUT_IMAGE" \
    -vf "$FILTER_COMPLEX" \
    -c:v libx264 \
    -crf "$QUALITY" \
    -preset medium \
    -pix_fmt yuv420p \
    -t "$DURATION" \
    -movflags +faststart \
    "$OUTPUT_VIDEO" \
    2>&1 | while read line; do
        if [[ "$line" == *"frame="* ]]; then
            # Estrai il numero del frame per progress
            CURRENT_FRAME=$(echo "$line" | grep -o 'frame= *[0-9]*' | grep -o '[0-9]*')
            if [ -n "$CURRENT_FRAME" ]; then
                PERCENT=$((CURRENT_FRAME * 100 / TOTAL_FRAMES))
                printf "\r${BLUE}[PROGRESS]${NC} Frame: %d/%d (%d%%)" "$CURRENT_FRAME" "$TOTAL_FRAMES" "$PERCENT"
            fi
        fi
    done

echo "" # Nuova riga dopo progress

if [ -f "$OUTPUT_VIDEO" ]; then
    FILE_SIZE=$(du -h "$OUTPUT_VIDEO" | cut -f1)
    log_success "Video creato: $OUTPUT_VIDEO ($FILE_SIZE)"
else
    log_error "Errore nella creazione del video"
    exit 1
fi
