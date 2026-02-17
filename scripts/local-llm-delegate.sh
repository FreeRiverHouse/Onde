#!/bin/bash
# local-llm-delegate.sh - Quick wrapper for delegating tasks to local LLMs
#
# Usage:
#   ./local-llm-delegate.sh "Write a Python function to parse JSON"
#   ./local-llm-delegate.sh --task coding "Fix this bug..."
#   ./local-llm-delegate.sh --json "Generate API response" 
#
# Environment:
#   LOCAL_LLM_DEFAULT_TASK: Default task type (default: coding)
#   LOCAL_LLM_TIMEOUT: Timeout in seconds (default: 120)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COORDINATOR="$SCRIPT_DIR/local-agent-coordinator.py"

# Defaults
TASK="${LOCAL_LLM_DEFAULT_TASK:-coding}"
JSON_MODE=""
QUERY=""
TIMEOUT="${LOCAL_LLM_TIMEOUT:-120}"

# Parse args
while [[ $# -gt 0 ]]; do
    case $1 in
        --task|-t)
            TASK="$2"
            shift 2
            ;;
        --json|-j)
            JSON_MODE="--json"
            shift
            ;;
        --timeout)
            TIMEOUT="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 [--task TYPE] [--json] [--timeout SEC] QUERY"
            echo ""
            echo "Task types: coding, quick, translation, analysis, creative, heavy"
            echo ""
            echo "Examples:"
            echo "  $0 'Write a sorting function in Python'"
            echo "  $0 --task quick 'What is 2+2?'"
            echo "  $0 --json 'Generate a JSON schema for a user'"
            exit 0
            ;;
        *)
            QUERY="$1"
            shift
            ;;
    esac
done

if [ -z "$QUERY" ]; then
    echo "Error: No query provided" >&2
    echo "Usage: $0 [--task TYPE] [--json] QUERY" >&2
    exit 1
fi

# Check if Ollama is running
if ! curl -s --max-time 2 "http://localhost:11434/api/tags" > /dev/null 2>&1; then
    echo "Warning: Ollama not responding, starting..." >&2
    ollama serve &> /dev/null &
    sleep 3
fi

# Run coordinator with timeout
timeout "$TIMEOUT" python3 "$COORDINATOR" --task "$TASK" $JSON_MODE --query "$QUERY"
