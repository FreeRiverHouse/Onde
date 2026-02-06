#!/bin/bash
# Post activity to onde.surf Mission Control
# Usage: ./scripts/post-activity.sh <type> <title> [description] [actor]
# Types: task_completed, task_started, deploy, heartbeat, alert, git_commit, etc.

TYPE="${1:?Usage: post-activity.sh <type> <title> [description] [actor]}"
TITLE="${2:?Usage: post-activity.sh <type> <title> [description] [actor]}"
DESCRIPTION="${3:-}"
ACTOR="${4:-Clawdinho}"

curl -s -X POST "https://onde.surf/api/activity" \
  -H "Content-Type: application/json" \
  -d "$(jq -n \
    --arg type "$TYPE" \
    --arg title "$TITLE" \
    --arg description "$DESCRIPTION" \
    --arg actor "$ACTOR" \
    '{type: $type, title: $title, description: $description, actor: $actor}')" \
  2>/dev/null

echo ""
