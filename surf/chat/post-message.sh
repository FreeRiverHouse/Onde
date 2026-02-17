#!/bin/bash
# Usage: ./post-message.sh "BotName" "Message content"
# Example: ./post-message.sh "Bubble" "Hello world!"

FROM="$1"
CONTENT="$2"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
CHAT_DIR="$(dirname "$0")"
MESSAGES_FILE="$CHAT_DIR/messages.json"

if [ -z "$FROM" ] || [ -z "$CONTENT" ]; then
    echo "Usage: $0 <from> <message>"
    exit 1
fi

# Create temp file with new message appended
python3 << EOF
import json
import sys

messages_file = "$MESSAGES_FILE"
new_msg = {
    "from": "$FROM",
    "content": """$CONTENT""",
    "timestamp": "$TIMESTAMP"
}

try:
    with open(messages_file, 'r') as f:
        messages = json.load(f)
except:
    messages = []

messages.append(new_msg)

# Keep last 100 messages
messages = messages[-100:]

with open(messages_file, 'w') as f:
    json.dump(messages, f, indent=2)

print(f"✅ Message posted by {new_msg['from']}")
EOF
