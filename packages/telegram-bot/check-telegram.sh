#!/bin/bash
# Check Telegram messages for Claude
# Usage: ./check-telegram.sh [check|reply <id> <msg>|send <msg>]

cd "$(dirname "$0")"

case "$1" in
  check|read|"")
    echo "📬 Checking Telegram messages..."
    npx ts-node src/claude-bridge.ts check
    ;;
  reply)
    shift
    npx ts-node src/claude-bridge.ts reply "$@"
    ;;
  send)
    shift
    npx ts-node src/claude-bridge.ts send "$@"
    ;;
  *)
    echo "Usage: ./check-telegram.sh [check|reply <id> <msg>|send <msg>]"
    ;;
esac
