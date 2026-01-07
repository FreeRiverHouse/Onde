#!/bin/bash
#
# ONDE BOOK FACTORY - Workflow Agentico
# Scrive libri con revisioni multiple e notifiche real-time
#

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ONDE_DIR="$(dirname "$SCRIPT_DIR")"
BOOKS_DIR="${ONDE_DIR}/books"

# Telegram
TELEGRAM_BOT="8272332520:AAF7zrKpqOCnFMqOlF1GJCLycJFk3IPO6ps"
TELEGRAM_CHAT="7505631979"

# Claude
CLAUDE_CLI="/Users/mattiapetrucciani/.local/bin/claude"

# === FUNZIONI TELEGRAM ===

notify() {
    local message="$1"
    curl -s "https://api.telegram.org/bot${TELEGRAM_BOT}/sendMessage" \
        -d "chat_id=${TELEGRAM_CHAT}" \
        -d "text=${message}" \
        -d "parse_mode=Markdown" > /dev/null 2>&1
    echo "[NOTIFY] $message"
}

send_file() {
    local file="$1"
    local caption="$2"
    if [ -f "$file" ]; then
        curl -s "https://api.telegram.org/bot${TELEGRAM_BOT}/sendDocument" \
            -F "chat_id=${TELEGRAM_CHAT}" \
            -F "document=@${file}" \
            -F "caption=${caption}" > /dev/null 2>&1
        echo "[FILE SENT] $file"
    fi
}

# === FUNZIONI LIBRO ===

write_book() {
    local title="$1"
    local collana="$2"
    local description="$3"
    local age="$4"

    local book_dir="${BOOKS_DIR}/${collana}/${title}"
    mkdir -p "$book_dir/images"

    notify "🔄 *Inizio scrittura*: ${title}
Collana: ${collana}
Età: ${age}"

    # === DRAFT 1 ===
    notify "✍️ Scrivo bozza 1..."

    "$CLAUDE_CLI" -p "Sei Gianni Parola, scrittore Onde.
Scrivi un libro per bambini.

TITOLO: ${title}
COLLANA: ${collana}
DESCRIZIONE: ${description}
ETÀ TARGET: ${age}

ISTRUZIONI:
- 10-12 capitoli brevi (200-300 parole ciascuno)
- Inserisci [ILLUSTRAZIONE: descrizione] dove serve un'immagine
- Stile semplice, caldo, musicale
- Ogni capitolo ha un insegnamento implicito

Output SOLO il testo del libro, nient'altro." --dangerously-skip-permissions > "${book_dir}/${title}_draft1.md"

    notify "📝 Bozza 1 completata"

    # === DRAFT 2 (Revisione) ===
    notify "✍️ Revisione bozza 2..."

    "$CLAUDE_CLI" -p "Sei un editor per libri bambini.
Rivedi questo testo migliorando:
1. Ritmo delle frasi (devono suonare bene lette ad alta voce)
2. Vocabolario adatto all'età ${age}
3. Coerenza narrativa
4. Aggiungi dettagli sensoriali dove mancano

TESTO DA RIVEDERE:
$(cat "${book_dir}/${title}_draft1.md")

Output SOLO il testo rivisto." --dangerously-skip-permissions > "${book_dir}/${title}_draft2.md"

    notify "📝 Bozza 2 completata"

    # === FINAL (Rifinitura) ===
    notify "✍️ Rifinitura finale..."

    "$CLAUDE_CLI" -p "Sei un editor senior.
Rifinitura finale del testo:
1. Elimina parole superflue
2. Verifica che ogni [ILLUSTRAZIONE] abbia descrizione chiara
3. Controlla che la morale sia implicita, mai predicatoria
4. Assicurati che il finale sia rassicurante

TESTO:
$(cat "${book_dir}/${title}_draft2.md")

Output SOLO il testo finale perfetto." --dangerously-skip-permissions > "${book_dir}/${title}_FINAL.md"

    # Conta capitoli
    local chapters=$(grep -c "^## Capitolo\|^# Capitolo" "${book_dir}/${title}_FINAL.md" 2>/dev/null || echo "?")

    notify "📖 *TESTO FINALE PRONTO*
Titolo: ${title}
Capitoli: ${chapters}
File: ${title}_FINAL.md"

    # === PROMPT ILLUSTRAZIONI ===
    notify "🎨 Genero prompt illustrazioni..."

    "$CLAUDE_CLI" -p "Sei Pino Pennello, illustratore Onde.
Estrai tutti i marcatori [ILLUSTRAZIONE: ...] dal testo e genera prompt per Grok.

STILE OBBLIGATORIO:
- Elegant watercolor, European vintage style
- Soft muted colors, delicate brushstrokes
- Warm golden light
- NOT Pixar, NOT cartoon, NOT plastic
- Riferimenti: Beatrix Potter, Luzzati, vintage italiano '50

TESTO:
$(cat "${book_dir}/${title}_FINAL.md")

Per ogni illustrazione, output:
ILLUSTRAZIONE [numero]:
Descrizione originale: [dal testo]
PROMPT GROK: [prompt completo per Grok]

---" --dangerously-skip-permissions > "${book_dir}/${title}_prompts.txt"

    local num_illustrations=$(grep -c "^ILLUSTRAZIONE" "${book_dir}/${title}_prompts.txt" 2>/dev/null || echo "?")

    notify "🎨 *PROMPT PRONTI*
${num_illustrations} illustrazioni da generare
File: ${title}_prompts.txt

⚠️ Genera le immagini su x.com/i/grok
Poi notificami quando pronte."

    # Invia file
    send_file "${book_dir}/${title}_FINAL.md" "Testo finale: ${title}"
    send_file "${book_dir}/${title}_prompts.txt" "Prompt illustrazioni: ${title}"

    # Git commit
    cd "$ONDE_DIR"
    git add "${book_dir}/"
    git commit -m "[${collana}] draft: ${title} - testo e prompt pronti"

    notify "✅ *FASE 1 COMPLETATA*
Libro: ${title}

Prossimi step:
1. Genera immagini su Grok
2. Salva in ${book_dir}/images/
3. Notificami per assemblare manoscritto"
}

# === MAIN ===

case "$1" in
    "write")
        # Uso: ./book_workflow.sh write "titolo" "collana" "descrizione" "età"
        write_book "$2" "$3" "$4" "$5"
        ;;
    "status")
        echo "Libri in lavorazione:"
        find "$BOOKS_DIR" -name "*_FINAL.md" -exec basename {} \; 2>/dev/null
        ;;
    *)
        echo "Onde Book Factory"
        echo ""
        echo "Uso:"
        echo "  $0 write <titolo> <collana> <descrizione> <età>"
        echo "  $0 status"
        echo ""
        echo "Esempio:"
        echo "  $0 write 'legge-attrazione' 'spirituality' 'Libro sulla legge attrazione' '5-8 anni'"
        ;;
esac
