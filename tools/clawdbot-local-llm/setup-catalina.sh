#!/bin/bash
#
# setup-catalina.sh
# Setup OpenClaw (ClawdBot) su macOS Catalina (10.15)
#
# Usa Node 20 LTS (compatibile con Catalina) + npm
# NON usa Homebrew (broken su Catalina per dipendenze pesanti)
#
# Autore: Claude + Mattia
# Data: 2026-02-16
#

set -e

# === COLORI ===
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== OpenClaw Setup per macOS Catalina ===${NC}"
echo ""

# === CHECK macOS VERSION ===
echo -e "${YELLOW}[1/6] Controllo sistema...${NC}"
MACOS_VERSION=$(sw_vers -productVersion 2>/dev/null || echo "unknown")
echo "  macOS: $MACOS_VERSION"

if [[ "$MACOS_VERSION" == "10.15"* ]]; then
    echo -e "  ${GREEN}✓ Catalina rilevata - usando Node 20 LTS${NC}"
    NODE_TARGET="20"
elif [[ "$MACOS_VERSION" == "10."* ]]; then
    echo -e "  ${YELLOW}⚠ macOS < Catalina - potrebbe non funzionare${NC}"
    NODE_TARGET="20"
else
    echo -e "  ${GREEN}✓ macOS >= Big Sur - usando Node 22${NC}"
    NODE_TARGET="22"
fi
echo ""

# === CHECK/INSTALL NVM ===
echo -e "${YELLOW}[2/6] Controllo nvm...${NC}"

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

if command -v nvm &>/dev/null; then
    echo -e "  ${GREEN}✓ nvm già installato ($(nvm --version))${NC}"
else
    echo "  nvm non trovato, installazione..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash

    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

    if command -v nvm &>/dev/null; then
        echo -e "  ${GREEN}✓ nvm installato${NC}"
    else
        echo -e "  ${RED}✗ Installazione nvm fallita${NC}"
        echo "  Chiudi e riapri il terminale, poi riesegui questo script."
        exit 1
    fi
fi
echo ""

# === INSTALL NODE ===
echo -e "${YELLOW}[3/6] Installazione Node $NODE_TARGET...${NC}"

CURRENT_NODE=$(node --version 2>/dev/null || echo "none")
echo "  Node attuale: $CURRENT_NODE"

if [[ "$CURRENT_NODE" == v${NODE_TARGET}.* ]]; then
    echo -e "  ${GREEN}✓ Node $NODE_TARGET già installato${NC}"
else
    echo "  Installazione Node $NODE_TARGET LTS..."
    nvm install "$NODE_TARGET"
    nvm use "$NODE_TARGET"
    nvm alias default "$NODE_TARGET"
    echo -e "  ${GREEN}✓ Node $(node --version) installato${NC}"
fi

echo "  npm: $(npm --version)"
echo ""

# === INSTALL OPENCLAW ===
echo -e "${YELLOW}[4/6] Installazione OpenClaw...${NC}"

if command -v openclaw &>/dev/null; then
    CURRENT_VERSION=$(openclaw --version 2>/dev/null || echo "unknown")
    echo -e "  ${GREEN}✓ OpenClaw già installato ($CURRENT_VERSION)${NC}"
    echo ""
    read -p "  Vuoi aggiornare all'ultima versione? (y/N) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "  Aggiornamento..."
        SHARP_IGNORE_GLOBAL_LIBVIPS=1 npm install -g openclaw@latest
        echo -e "  ${GREEN}✓ Aggiornato${NC}"
    fi
else
    echo "  Installazione openclaw@latest..."
    SHARP_IGNORE_GLOBAL_LIBVIPS=1 npm install -g openclaw@latest

    if command -v openclaw &>/dev/null; then
        echo -e "  ${GREEN}✓ OpenClaw installato ($(openclaw --version 2>/dev/null))${NC}"
    else
        # Prova ad aggiungere npm bin al PATH
        NPM_BIN="$(npm prefix -g)/bin"
        export PATH="$NPM_BIN:$PATH"

        if command -v openclaw &>/dev/null; then
            echo -e "  ${GREEN}✓ OpenClaw installato (trovato in $NPM_BIN)${NC}"
            echo ""
            echo -e "  ${YELLOW}⚠ Aggiungi al tuo ~/.zshrc:${NC}"
            echo "  export PATH=\"\$(npm prefix -g)/bin:\$PATH\""

            # Aggiungi automaticamente
            if ! grep -q 'npm prefix -g' ~/.zshrc 2>/dev/null; then
                echo '' >> ~/.zshrc
                echo '# OpenClaw (npm global bin)' >> ~/.zshrc
                echo 'export PATH="$(npm prefix -g)/bin:$PATH"' >> ~/.zshrc
                echo -e "  ${GREEN}✓ PATH aggiunto automaticamente a ~/.zshrc${NC}"
            fi
        else
            echo -e "  ${RED}✗ Installazione fallita${NC}"
            echo "  Prova manualmente: npm install -g openclaw@latest --verbose"
            exit 1
        fi
    fi
fi
echo ""

# === OPENCLAW DOCTOR ===
echo -e "${YELLOW}[5/6] Diagnostica OpenClaw...${NC}"
openclaw doctor 2>/dev/null || echo -e "  ${YELLOW}(doctor non disponibile in questa versione)${NC}"
echo ""

# === ONBOARDING ===
echo -e "${YELLOW}[6/6] Onboarding...${NC}"
echo ""
echo -e "${GREEN}=== SETUP COMPLETATO ===${NC}"
echo ""
echo "Prossimi passi:"
echo ""
echo "  1. Esegui onboarding:"
echo "     openclaw onboard --install-daemon"
echo ""
echo "  2. Testa:"
echo "     openclaw status"
echo "     openclaw dashboard"
echo ""
echo "  3. (Opzionale) Per modelli locali con Ollama:"
echo "     - Scarica Ollama: https://ollama.com/download/mac"
echo "     - ollama pull qwen2.5:7b-instruct-q4_K_M"
echo "     - Leggi SETUP-CATALINA.md per la configurazione"
echo ""
echo "Documentazione: tools/clawdbot-local-llm/SETUP-CATALINA.md"
echo ""
