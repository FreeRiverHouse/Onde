#!/bin/bash
# =============================================================================
# create-short.sh - Crea YouTube Shorts da immagini e audio
# =============================================================================
# Combina un'immagine (con effetto Ken Burns) e audio per creare un Short
#
# Uso: ./create-short.sh [opzioni] <immagine> <audio> <output>
#
# Opzioni:
#   -t, --title <text>      Titolo da sovrapporre (opzionale)
#   -s, --subtitle <text>   Sottotitolo/descrizione (opzionale)
#   -e, --effect <tipo>     Effetto video: zoom-in, zoom-out, pan-up, pan-down (default: zoom-in)
#   -d, --duration <sec>    Durata forzata (default: durata audio)
#   -f, --fade <sec>        Durata fade in/out (default: 0.3)
#   --font <path>           Font personalizzato
#   --font-size <n>         Dimensione font titolo (default: 48)
#   --no-text               Non aggiungere testo
#   -h, --help              Mostra questo help
#
# Formato output: 1080x1920 (9:16) - YouTube Shorts / TikTok / Reels
# =============================================================================

set -e

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Valori di default
EFFECT="zoom-in"
FADE_DURATION=0.3
FONT_SIZE=48
NO_TEXT=false
TITLE=""
SUBTITLE=""
FORCED_DURATION=""

# Dimensioni YouTube Shorts
WIDTH=1080
HEIGHT=1920
FPS=30

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_error() { echo -e "${RED}[ERRORE]${NC} $1" >&2; }

show_help() {
    head -25 "$0" | tail -22 | sed 's/^# //' | sed 's/^#//'
    exit 0
}

# Parse argomenti
while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--title) TITLE="$2"; shift 2 ;;
        -s|--subtitle) SUBTITLE="$2"; shift 2 ;;
        -e|--effect) EFFECT="$2"; shift 2 ;;
        -d|--duration) FORCED_DURATION="$2"; shift 2 ;;
        -f|--fade) FADE_DURATION="$2"; shift 2 ;;
        --font) FONT_PATH="$2"; shift 2 ;;
        --font-size) FONT_SIZE="$2"; shift 2 ;;
        --no-text) NO_TEXT=true; shift ;;
        -h|--help) show_help ;;
        -*) log_error "Opzione sconosciuta: $1"; exit 1 ;;
        *)
            if [ -z "$INPUT_IMAGE" ]; then INPUT_IMAGE="$1"
            elif [ -z "$INPUT_AUDIO" ]; then INPUT_AUDIO="$1"
            elif [ -z "$OUTPUT_VIDEO" ]; then OUTPUT_VIDEO="$1"
            fi
            shift
            ;;
    esac
done

# Verifica argomenti
if [ -z "$INPUT_IMAGE" ] || [ -z "$INPUT_AUDIO" ] || [ -z "$OUTPUT_VIDEO" ]; then
    log_error "Uso: $0 [opzioni] <immagine> <audio> <output>"
    exit 1
fi

[ ! -f "$INPUT_IMAGE" ] && { log_error "Immagine non trovata: $INPUT_IMAGE"; exit 1; }
[ ! -f "$INPUT_AUDIO" ] && { log_error "Audio non trovato: $INPUT_AUDIO"; exit 1; }

# Determina durata
if [ -n "$FORCED_DURATION" ]; then
    DURATION=$FORCED_DURATION
else
    DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$INPUT_AUDIO" 2>/dev/null)
    DURATION=$(printf "%.0f" "$DURATION") # Arrotonda
fi

TOTAL_FRAMES=$((DURATION * FPS))
INTENSITY=0.15 # Effetto sottile per Shorts

log_info "Creazione YouTube Short..."
log_info "  Immagine: $INPUT_IMAGE"
log_info "  Audio: $INPUT_AUDIO"
log_info "  Output: $OUTPUT_VIDEO"
log_info "  Durata: ${DURATION}s"
log_info "  Effetto: $EFFECT"

# Costruisci filtro zoompan
case $EFFECT in
    zoom-in)
        ZOOM_FILTER="zoompan=z='1+${INTENSITY}*in/${TOTAL_FRAMES}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${TOTAL_FRAMES}:s=${WIDTH}x${HEIGHT}:fps=${FPS}"
        ;;
    zoom-out)
        ZOOM_FILTER="zoompan=z='1+${INTENSITY}-${INTENSITY}*in/${TOTAL_FRAMES}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${TOTAL_FRAMES}:s=${WIDTH}x${HEIGHT}:fps=${FPS}"
        ;;
    pan-up)
        ZOOM_FILTER="zoompan=z='1.1':x='iw/2-(iw/zoom/2)':y='ih*0.1-(ih*0.2*in/${TOTAL_FRAMES})':d=${TOTAL_FRAMES}:s=${WIDTH}x${HEIGHT}:fps=${FPS}"
        ;;
    pan-down)
        ZOOM_FILTER="zoompan=z='1.1':x='iw/2-(iw/zoom/2)':y='-ih*0.1+(ih*0.2*in/${TOTAL_FRAMES})':d=${TOTAL_FRAMES}:s=${WIDTH}x${HEIGHT}:fps=${FPS}"
        ;;
    *)
        log_error "Effetto non valido: $EFFECT"
        exit 1
        ;;
esac

# Aggiungi fade
FADE_OUT_START=$(echo "$DURATION - $FADE_DURATION" | bc)
FADE_FILTER=",fade=t=in:st=0:d=${FADE_DURATION},fade=t=out:st=${FADE_OUT_START}:d=${FADE_DURATION}"

# Costruisci filtro testo se richiesto
TEXT_FILTER=""
if [ "$NO_TEXT" = false ] && [ -n "$TITLE" ]; then
    # Escape caratteri speciali per ffmpeg
    TITLE_ESCAPED=$(echo "$TITLE" | sed "s/'/\\\\'/g" | sed 's/:/\\:/g')
    TEXT_FILTER=",drawtext=text='${TITLE_ESCAPED}':fontsize=${FONT_SIZE}:fontcolor=white:borderw=3:bordercolor=black:x=(w-text_w)/2:y=h*0.1"

    if [ -n "$SUBTITLE" ]; then
        SUBTITLE_ESCAPED=$(echo "$SUBTITLE" | sed "s/'/\\\\'/g" | sed 's/:/\\:/g')
        SUBTITLE_SIZE=$((FONT_SIZE * 2 / 3))
        TEXT_FILTER="${TEXT_FILTER},drawtext=text='${SUBTITLE_ESCAPED}':fontsize=${SUBTITLE_SIZE}:fontcolor=white:borderw=2:bordercolor=black:x=(w-text_w)/2:y=h*0.1+${FONT_SIZE}+20"
    fi
fi

# Costruisci filtro completo
FILTER_COMPLEX="${ZOOM_FILTER}${FADE_FILTER}${TEXT_FILTER}"

# Esegui ffmpeg
ffmpeg -y -loop 1 -i "$INPUT_IMAGE" -i "$INPUT_AUDIO" \
    -vf "$FILTER_COMPLEX" \
    -c:v libx264 \
    -c:a aac \
    -b:a 192k \
    -crf 18 \
    -preset medium \
    -pix_fmt yuv420p \
    -shortest \
    -movflags +faststart \
    "$OUTPUT_VIDEO" \
    2>/dev/null

if [ -f "$OUTPUT_VIDEO" ]; then
    FILE_SIZE=$(du -h "$OUTPUT_VIDEO" | cut -f1)
    log_success "Short creato: $OUTPUT_VIDEO ($FILE_SIZE)"
else
    log_error "Errore nella creazione del video"
    exit 1
fi
