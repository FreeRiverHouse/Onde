#!/bin/bash
# Local Code Review via LLM
# Uses deepseek-coder or qwen2.5-coder via Ollama
# Usage: ./local-code-review.sh FILE
#    or: git diff HEAD~1 | ./local-code-review.sh
#    or: ./local-code-review.sh --diff  (reviews staged changes)

set -e

# Config
MODEL="${CODE_REVIEW_MODEL:-deepseek-coder:6.7b}"
OLLAMA_HOST="${OLLAMA_HOST:-http://localhost:11434}"
MAX_CHARS=15000  # Truncate very large inputs

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Ollama is running
check_ollama() {
    if ! curl -s "${OLLAMA_HOST}/api/tags" >/dev/null 2>&1; then
        echo -e "${RED}Error: Ollama is not running${NC}"
        echo "Start it with: ollama serve"
        exit 1
    fi
}

# Get code to review
get_code() {
    local code=""
    
    if [ "$1" = "--diff" ] || [ "$1" = "-d" ]; then
        # Review staged changes
        code=$(git diff --cached 2>/dev/null || git diff HEAD 2>/dev/null)
        if [ -z "$code" ]; then
            echo -e "${YELLOW}No staged changes. Reviewing last commit...${NC}"
            code=$(git diff HEAD~1 2>/dev/null || echo "")
        fi
    elif [ -n "$1" ] && [ -f "$1" ]; then
        # Review specific file
        code=$(cat "$1")
    elif [ ! -t 0 ]; then
        # Read from stdin (piped input)
        code=$(cat)
    else
        echo "Usage: $0 FILE"
        echo "   or: $0 --diff"
        echo "   or: git diff | $0"
        exit 1
    fi
    
    # Truncate if too long
    if [ ${#code} -gt $MAX_CHARS ]; then
        echo -e "${YELLOW}⚠️  Input truncated to ${MAX_CHARS} chars${NC}" >&2
        code="${code:0:$MAX_CHARS}..."
    fi
    
    echo "$code"
}

# Build the review prompt
build_prompt() {
    local code="$1"
    cat <<EOF
You are an expert code reviewer. Analyze the following code/diff and provide a concise review.

Focus on:
1. 🐛 **Bugs**: Logic errors, edge cases, potential crashes
2. 🔒 **Security**: Injection, auth issues, data exposure
3. ⚡ **Performance**: Inefficiencies, memory leaks, O(n²) loops
4. 📝 **Style**: Naming, structure, readability issues
5. ✅ **Good**: What's done well (brief)

Format your response as markdown with clear sections. Be concise - only mention significant issues.

If the code looks good, say so briefly.

\`\`\`
$code
\`\`\`
EOF
}

# Call Ollama
call_ollama() {
    local prompt="$1"
    
    curl -s "${OLLAMA_HOST}/api/generate" \
        -H "Content-Type: application/json" \
        -d "$(jq -n --arg model "$MODEL" --arg prompt "$prompt" '{
            model: $model,
            prompt: $prompt,
            stream: false,
            options: {
                temperature: 0.3,
                num_predict: 1024
            }
        }')" | jq -r '.response // "Error: No response from model"'
}

# Main
main() {
    echo -e "${BLUE}🔍 Local Code Review${NC}"
    echo -e "${BLUE}Model: ${MODEL}${NC}"
    echo ""
    
    check_ollama
    
    local code=$(get_code "$1")
    
    if [ -z "$code" ]; then
        echo -e "${RED}No code to review${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}Analyzing...${NC}"
    echo ""
    
    local prompt=$(build_prompt "$code")
    local start_time=$(date +%s)
    
    local review=$(call_ollama "$prompt")
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    echo "---"
    echo ""
    echo "$review"
    echo ""
    echo "---"
    echo -e "${GREEN}✅ Review completed in ${duration}s${NC}"
}

main "$@"
