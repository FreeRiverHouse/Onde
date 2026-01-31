#!/bin/bash
# Start ClawdBot with Claude (PAID - uses claude CLI)

cd "$(dirname "$0")"

echo "🚀 Starting ClawdBot with Claude (paid)"
echo ""

export LLM_PROVIDER=claude
node claude-bot.js
