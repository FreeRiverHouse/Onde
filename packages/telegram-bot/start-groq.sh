#!/bin/bash
# Start ClawdBot with Groq (FREE - 14,400 req/day, fastest inference)
# Get API key at: https://console.groq.com/keys

cd "$(dirname "$0")"

if [ -z "$GROQ_API_KEY" ]; then
  echo "⚠️  GROQ_API_KEY not set!"
  echo ""
  echo "Get your FREE key at: https://console.groq.com/keys"
  echo "Then run: GROQ_API_KEY=gsk_xxx ./start-groq.sh"
  exit 1
fi

echo "🚀 Starting ClawdBot with Groq (FREE)"
echo "   Model: Llama 3.3 70B"
echo "   Speed: ~300 tokens/sec"
echo ""

export LLM_PROVIDER=groq
node claude-bot.js
