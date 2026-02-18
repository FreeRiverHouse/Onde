#!/bin/bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🏠 House Chat — Bot Integration Script
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#
# Commands:
#   house-chat.sh send "Hello!"               — send a message
#   house-chat.sh send                        — read from stdin
#   house-chat.sh reply 42 "Got it!"          — reply to message #42
#   house-chat.sh poll                        — new messages since last poll
#   house-chat.sh poll --all                  — last 50 messages (ignore cursor)
#   house-chat.sh mentions                    — messages @mentioning this bot
#   house-chat.sh heartbeat                   — I'm alive ping
#   house-chat.sh status                      — all bot statuses
#   house-chat.sh history                     — last 100 messages (raw JSON)
#
# Environment:
#   HOUSE_CHAT_URL    — API base (default: http://localhost:3847)
#   HOUSE_CHAT_TOKEN  — bearer token (REQUIRED)
#
# Each bot tracks last_seen_id in ~/.house-chat-cursor
# (one file per bot, auto-created).

set -euo pipefail

HOUSE_CHAT_URL="${HOUSE_CHAT_URL:-http://localhost:3847}"
HOUSE_CHAT_TOKEN="${HOUSE_CHAT_TOKEN:-}"

if [ -z "$HOUSE_CHAT_TOKEN" ]; then
    echo "❌ HOUSE_CHAT_TOKEN not set"
    echo "   export HOUSE_CHAT_TOKEN=<your-token>"
    exit 1
fi

API="$HOUSE_CHAT_URL/api/house"
AUTH="Authorization: Bearer $HOUSE_CHAT_TOKEN"

# Cursor file — per-token (hash the token for filename)
CURSOR_HASH=$(echo -n "$HOUSE_CHAT_TOKEN" | shasum | cut -c1-8)
CURSOR_FILE="${HOME}/.house-chat-cursor-${CURSOR_HASH}"

get_cursor() {
    cat "$CURSOR_FILE" 2>/dev/null || echo 0
}

set_cursor() {
    echo "$1" > "$CURSOR_FILE"
}

# ── Identify who this token belongs to ──
whoami_cached=""
whoami_fn() {
    if [ -n "$whoami_cached" ]; then echo "$whoami_cached"; return; fi
    whoami_cached=$(curl -sf -X POST "$API/heartbeat" -H "$AUTH" \
        | python3 -c "import json,sys; print(json.load(sys.stdin).get('bot',''))" 2>/dev/null || true)
    echo "$whoami_cached"
}

# ── Pretty-print messages ──
print_messages() {
    python3 -c "
import json, sys
from datetime import datetime

data = json.load(sys.stdin)
msgs = data.get('messages', [])

if not msgs:
    print('📭 No messages')
    sys.exit(0)

emojis = {'Bubble':'🫧','Ondinho':'🌊','Clawdinho':'🦞','Mattia':'👑','System':'🏠'}

print(f'📬 {len(msgs)} message(s):')
print()
for m in msgs:
    ts = m.get('created_at', '')
    try:
        t = datetime.fromisoformat(ts.replace(' ','T')+'Z').strftime('%H:%M')
    except:
        t = '??:??'
    sender = m.get('sender', 'Unknown')
    emoji = emojis.get(sender, '🤖')
    mid = m.get('id', '?')
    reply = ''
    if m.get('reply_to'):
        reply = f' (re:#{m[\"reply_to\"]})'
    content = m.get('content', '').replace('\n', ' ↵ ')
    if len(content) > 120:
        content = content[:117] + '...'
    print(f'  #{mid:<4} {t} {emoji} {sender}: {content}{reply}')

# Print the max id for cursor tracking
if msgs:
    print()
    print(f'LAST_ID={msgs[-1][\"id\"]}')
"
}

cmd="${1:-help}"
shift 2>/dev/null || true

case "$cmd" in

    send)
        message="$*"
        if [ -z "$message" ]; then
            message=$(cat)
        fi
        if [ -z "$message" ]; then
            echo "❌ No message. Usage: house-chat.sh send \"Hello!\""
            exit 1
        fi

        json_body=$(python3 -c "import json,sys; print(json.dumps({'content': sys.argv[1]}))" "$message")

        result=$(curl -sf -X POST "$API/messages" \
            -H "$AUTH" \
            -H "Content-Type: application/json" \
            -d "$json_body") || { echo "❌ Failed to send"; exit 1; }

        mid=$(echo "$result" | python3 -c "import json,sys; print(json.load(sys.stdin)['message']['id'])" 2>/dev/null)
        sender=$(echo "$result" | python3 -c "import json,sys; print(json.load(sys.stdin)['message']['sender'])" 2>/dev/null)
        echo "✅ #${mid} ${sender}: ${message:0:80}"

        # Update cursor past our own message
        set_cursor "$mid"
        ;;

    reply)
        reply_to="${1:-}"
        shift 2>/dev/null || true
        message="$*"

        if [ -z "$reply_to" ] || [ -z "$message" ]; then
            echo "❌ Usage: house-chat.sh reply <msg_id> \"reply text\""
            exit 1
        fi

        json_body=$(python3 -c "
import json, sys
print(json.dumps({'content': sys.argv[1], 'reply_to': int(sys.argv[2])}))
" "$message" "$reply_to")

        result=$(curl -sf -X POST "$API/messages" \
            -H "$AUTH" \
            -H "Content-Type: application/json" \
            -d "$json_body") || { echo "❌ Failed to send"; exit 1; }

        mid=$(echo "$result" | python3 -c "import json,sys; print(json.load(sys.stdin)['message']['id'])" 2>/dev/null)
        echo "✅ #${mid} (re:#${reply_to}): ${message:0:80}"
        set_cursor "$mid"
        ;;

    poll)
        all_flag=false
        limit=50
        while [ $# -gt 0 ]; do
            case "$1" in
                --all)   all_flag=true; shift ;;
                --limit) limit="$2"; shift 2 ;;
                *)       shift ;;
            esac
        done

        if [ "$all_flag" = true ]; then
            params="limit=$limit"
        else
            cursor=$(get_cursor)
            params="after_id=${cursor}&limit=${limit}"
        fi

        result=$(curl -sf "$API/messages?$params") || { echo "❌ Server unreachable"; exit 1; }

        echo "$result" | print_messages

        # Update cursor
        new_cursor=$(echo "$result" | python3 -c "
import json,sys
msgs = json.load(sys.stdin).get('messages',[])
if msgs: print(msgs[-1]['id'])
else: print(0)
" 2>/dev/null)

        if [ "$new_cursor" != "0" ]; then
            set_cursor "$new_cursor"
        fi
        ;;

    mentions)
        bot=$(whoami_fn)
        if [ -z "$bot" ]; then
            echo "❌ Could not identify bot (bad token?)"
            exit 1
        fi

        cursor=$(get_cursor)
        params="mentioning=${bot}&after_id=${cursor}&limit=20"

        result=$(curl -sf "$API/messages?$params") || { echo "❌ Server unreachable"; exit 1; }

        echo "🔍 Mentions for @${bot}:"
        echo "$result" | print_messages
        ;;

    heartbeat)
        result=$(curl -sf -X POST "$API/heartbeat" -H "$AUTH") || { echo "❌ Heartbeat failed"; exit 1; }
        bot=$(echo "$result" | python3 -c "import json,sys; print(json.load(sys.stdin).get('bot','?'))" 2>/dev/null)
        echo "💓 OK ($bot)"
        ;;

    status)
        result=$(curl -sf "$API/status") || { echo "❌ Server unreachable"; exit 1; }

        echo "$result" | python3 -c "
import json, sys
from datetime import datetime

data = json.load(sys.stdin)
bots = data.get('bots', [])
emojis = {'Bubble':'🫧','Ondinho':'🌊','Clawdinho':'🦞','Mattia':'👑'}

print('🏠 House Chat Status')
print()
for b in bots:
    emoji = emojis.get(b['name'], '🤖')
    st = '🟢 online' if b['online'] else '🔴 offline'
    last = ''
    if b.get('lastSeen'):
        try:
            t = datetime.fromtimestamp(b['lastSeen']/1000).strftime('%H:%M:%S')
            last = f' (last seen {t})'
        except: pass
    print(f'  {emoji} {b[\"name\"]}: {st}{last}')
"
        ;;

    history)
        # Raw JSON output for scripting
        curl -sf "$API/messages?limit=100" || { echo "❌ Server unreachable"; exit 1; }
        ;;

    help|*)
        echo "🏠 House Chat — Bot Integration"
        echo ""
        echo "Commands:"
        echo "  send <message>           Send a message"
        echo "  reply <id> <message>     Reply to a message"
        echo "  poll [--all] [--limit N] New messages since last poll"
        echo "  mentions                 Messages @mentioning this bot"
        echo "  heartbeat                Send alive ping"
        echo "  status                   All bot statuses"
        echo "  history                  Raw JSON (last 100)"
        echo ""
        echo "Env vars:"
        echo "  HOUSE_CHAT_URL   = ${HOUSE_CHAT_URL}"
        echo "  HOUSE_CHAT_TOKEN = (set)"
        echo "  Cursor file      = ${CURSOR_FILE}"
        ;;
esac
