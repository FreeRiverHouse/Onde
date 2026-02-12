#!/bin/bash
# Fix Claude Code CLI - "Your account does not have access" bug
# Usage: ./tools/tech-support/fix-claude-code-cli.sh

set -e

echo "=== Fix Claude Code CLI ==="
echo ""

# Step 1: Check current version
echo "[1/4] Checking current installation..."
if command -v claude &> /dev/null; then
    CURRENT_VERSION=$(claude --version 2>/dev/null || echo "unknown")
    echo "  Current version: $CURRENT_VERSION"
else
    echo "  Claude Code not found, will install fresh"
fi

# Step 2: Clean stale auth and config
echo "[2/4] Clearing stale auth cache..."
rm -f ~/.claude/auth.json 2>/dev/null
rm -f ~/.claude/.credentials 2>/dev/null
rm -rf ~/.claude/statsig/ 2>/dev/null
rm -rf ~/Library/Application\ Support/ClaudeCode/ 2>/dev/null
echo "  Done"

# Step 3: Reinstall with native installer
echo "[3/4] Installing/updating Claude Code (native installer)..."
curl -fsSL https://claude.ai/install.sh | bash
echo "  Done"

# Step 4: Login
echo "[4/4] Opening login..."
echo ""
echo "Run this now:"
echo ""
echo "  claude /login"
echo ""
echo "If it STILL says 'no access' after login, try full nuclear reset:"
echo ""
echo "  rm -rf ~/.claude"
echo "  curl -fsSL https://claude.ai/install.sh | bash"
echo "  claude /login"
echo ""
echo "=== Done ==="
