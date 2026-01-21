#!/bin/bash
# ============================================
# ONDE - Setup Post-Formattazione Mac
# ============================================
# Esegui questo script dopo aver reinstallato macOS
#
# Usage: curl -sL https://raw.githubusercontent.com/FreeRiverHouse/Onde/main/SETUP-POST-FORMAT.sh | bash
# ============================================

set -e  # Exit on error

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║         ONDE - Setup Post-Formattazione                   ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# ============================================
# 1. HOMEBREW
# ============================================
echo "📦 [1/6] Installing Homebrew..."
if ! command -v brew &> /dev/null; then
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
    eval "$(/opt/homebrew/bin/brew shellenv)"
else
    echo "  ✅ Homebrew already installed"
fi

# ============================================
# 2. ESSENTIAL TOOLS
# ============================================
echo ""
echo "🔧 [2/6] Installing essential tools..."
brew install git node jq gh 2>/dev/null || true
echo "  ✅ Git, Node.js, jq, gh installed"

# ============================================
# 3. JAVA (for Minecraft)
# ============================================
echo ""
echo "☕ [3/6] Installing Java 21 (for Minecraft)..."
brew install openjdk@21 2>/dev/null || true
sudo ln -sfn /opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-21.jdk 2>/dev/null || true
echo "  ✅ Java 21 installed"

# ============================================
# 4. MINIFORGE (for Python ML)
# ============================================
echo ""
echo "🐍 [4/6] Installing Miniforge (Python ML)..."
if ! command -v conda &> /dev/null; then
    curl -L -O "https://github.com/conda-forge/miniforge/releases/latest/download/Miniforge3-MacOSX-arm64.sh"
    bash Miniforge3-MacOSX-arm64.sh -b -p $HOME/miniforge3
    rm Miniforge3-MacOSX-arm64.sh
    echo 'export PATH="$HOME/miniforge3/bin:$PATH"' >> ~/.zshrc
    export PATH="$HOME/miniforge3/bin:$PATH"
    echo "  ✅ Miniforge installed"
else
    echo "  ✅ Conda already installed"
fi

# ============================================
# 5. CLONE REPOSITORIES
# ============================================
echo ""
echo "📁 [5/6] Cloning repositories..."
mkdir -p ~/Projects
cd ~/Projects

# Main repos
REPOS=(
    "Onde"
    "minecraft-server"
    "OndePRDB"
    "KidsChefStudio"
    "PolyRoborto"
    "OndeApps"
)

for repo in "${REPOS[@]}"; do
    if [ ! -d "$repo" ]; then
        echo "  Cloning $repo..."
        git clone "https://github.com/FreeRiverHouse/$repo.git" 2>/dev/null || echo "  ⚠️ Failed to clone $repo (may need auth)"
    else
        echo "  ✅ $repo already exists"
    fi
done

# ============================================
# 6. SETUP CORDE (if SSD mounted)
# ============================================
echo ""
echo "🎨 [6/6] Setting up CORDE..."
if [ -d "/Volumes/DATI-SSD/onde-ai" ]; then
    echo "  SSD detected! Setting up CORDE environment..."
    cd ~/Projects/Onde/apps/corde

    # Create conda environment
    conda create -n corde python=3.10 -y 2>/dev/null || true
    source ~/miniforge3/bin/activate corde
    pip install -r engine/requirements.txt 2>/dev/null || true

    echo "  ✅ CORDE environment ready"
else
    echo "  ⚠️ SSD not mounted - CORDE setup skipped"
    echo "     Mount SSD and run: cd ~/Projects/Onde/apps/corde && conda create -n corde python=3.10 && conda activate corde && pip install -r engine/requirements.txt"
fi

# ============================================
# DONE!
# ============================================
echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                    ✅ SETUP COMPLETE!                     ║"
echo "╠═══════════════════════════════════════════════════════════╣"
echo "║                                                           ║"
echo "║  Next steps:                                              ║"
echo "║                                                           ║"
echo "║  1. Restart terminal (or run: source ~/.zshrc)           ║"
echo "║                                                           ║"
echo "║  2. Start Minecraft:                                      ║"
echo "║     cd ~/Projects/minecraft-server                        ║"
echo "║     java -Xmx4G -jar server.jar --nogui                  ║"
echo "║                                                           ║"
echo "║  3. Mount SSD for CORDE image generation                 ║"
echo "║                                                           ║"
echo "║  4. Create .env file in ~/Projects/Onde/ with:           ║"
echo "║     - TELEGRAM_BOT_TOKEN                                  ║"
echo "║     - X API keys                                          ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
