#!/bin/bash
# Start ClawdBot with KIMI K2.5 (FREE via NVIDIA)
#
# Get your free API key at: https://build.nvidia.com/moonshotai/kimi-k2.5
# 1. Login with NVIDIA account
# 2. Click "View Code"
# 3. Copy your API key
#
# Usage:
#   NVIDIA_API_KEY=your-key ./start-kimi.sh
#   OR set it in .env file

cd "$(dirname "$0")"

# Load .env if exists
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Check API key
if [ -z "$NVIDIA_API_KEY" ]; then
  echo "❌ Missing NVIDIA_API_KEY"
  echo ""
  echo "Get your FREE key at:"
  echo "  https://build.nvidia.com/moonshotai/kimi-k2.5"
  echo ""
  echo "Then run:"
  echo "  NVIDIA_API_KEY=nvapi-xxx ./start-kimi.sh"
  exit 1
fi

echo "🚀 Starting ClawdBot with KIMI K2.5 (FREE)"
echo "   Rate limit: 40 requests/minute"
echo ""

export LLM_PROVIDER=kimi
node claude-bot.js
