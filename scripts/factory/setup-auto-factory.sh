#!/bin/bash
# ═══════════════════════════════════════════════════════════
# SETUP ONDE AUTO-FACTORY
#
# Questo script configura l'automazione continua sul Mac.
# Usa launchd (il cron di macOS) per eseguire la factory ogni 6 ore.
#
# Come usare:
#   chmod +x setup-auto-factory.sh
#   ./setup-auto-factory.sh
# ═══════════════════════════════════════════════════════════

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
PLIST_NAME="com.freeriverhouse.onde-factory"
PLIST_PATH="$HOME/Library/LaunchAgents/$PLIST_NAME.plist"

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║         ONDE AUTO-FACTORY - SETUP                        ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "Project directory: $PROJECT_DIR"
echo "Script directory: $SCRIPT_DIR"
echo ""

# Crea directory logs se non esiste
mkdir -p "$PROJECT_DIR/logs"

# Crea il plist per launchd
echo "Creando launchd plist..."

cat > "$PLIST_PATH" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>$PLIST_NAME</string>

    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>$SCRIPT_DIR/auto-content-factory.js</string>
    </array>

    <key>WorkingDirectory</key>
    <string>$PROJECT_DIR</string>

    <key>StartInterval</key>
    <integer>21600</integer>
    <!-- 21600 secondi = 6 ore -->

    <key>RunAtLoad</key>
    <true/>

    <key>StandardOutPath</key>
    <string>$PROJECT_DIR/logs/factory-stdout.log</string>

    <key>StandardErrorPath</key>
    <string>$PROJECT_DIR/logs/factory-stderr.log</string>

    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin</string>
    </dict>
</dict>
</plist>
EOF

echo "✅ Creato: $PLIST_PATH"

# Scarica il vecchio job se esiste
if launchctl list | grep -q "$PLIST_NAME"; then
    echo "Rimuovendo vecchio job..."
    launchctl unload "$PLIST_PATH" 2>/dev/null || true
fi

# Carica il nuovo job
echo "Caricando job in launchd..."
launchctl load "$PLIST_PATH"

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                    SETUP COMPLETATO!                     ║"
echo "╠═══════════════════════════════════════════════════════════╣"
echo "║                                                           ║"
echo "║  ✅ Auto-factory configurata                             ║"
echo "║  ⏰ Esecuzione: ogni 6 ore                               ║"
echo "║  📁 Logs: $PROJECT_DIR/logs/                            ║"
echo "║                                                           ║"
echo "║  Comandi utili:                                          ║"
echo "║  • Esegui ora: node $SCRIPT_DIR/auto-content-factory.js  ║"
echo "║  • Vedi status: launchctl list | grep onde               ║"
echo "║  • Stop: launchctl unload $PLIST_PATH                   ║"
echo "║  • Logs: tail -f $PROJECT_DIR/logs/factory.log          ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"

# Esegui subito per testare
echo ""
echo "Eseguo factory ORA per test..."
node "$SCRIPT_DIR/auto-content-factory.js"
