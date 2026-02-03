#!/bin/bash
# Cervelletto - Context Generator for Coder Agent
# Genera contesto del repo per dare memoria ai modelli

STATE_DIR="/tmp/coder-agent-state"
CONTEXT_FILE="$STATE_DIR/cervelletto.md"
REPO_ROOT="${1:-$(pwd)}"

mkdir -p "$STATE_DIR"

generate_context() {
    echo "# Cervelletto - Repo Context"
    echo "Generated: $(date)"
    echo ""

    # Basic info
    echo "## Repo Info"
    if [ -d "$REPO_ROOT/.git" ]; then
        echo "- Git repo: $(git -C "$REPO_ROOT" remote get-url origin 2>/dev/null || echo 'local')"
        echo "- Branch: $(git -C "$REPO_ROOT" branch --show-current 2>/dev/null)"
        echo "- Last commit: $(git -C "$REPO_ROOT" log -1 --oneline 2>/dev/null)"
    fi
    echo ""

    # Structure
    echo "## Directory Structure"
    if command -v tree &> /dev/null; then
        tree -L 2 -d "$REPO_ROOT" 2>/dev/null | head -30
    else
        find "$REPO_ROOT" -maxdepth 2 -type d | head -30
    fi
    echo ""

    # Key files
    echo "## Key Files"
    for f in README.md CLAUDE.md package.json requirements.txt pyproject.toml Cargo.toml go.mod; do
        if [ -f "$REPO_ROOT/$f" ]; then
            echo "- $f exists"
        fi
    done
    echo ""

    # Recent changes
    echo "## Recent Changes (last 5 commits)"
    git -C "$REPO_ROOT" log --oneline -5 2>/dev/null || echo "No git history"
    echo ""

    # Tech stack detection
    echo "## Tech Stack"
    [ -f "$REPO_ROOT/package.json" ] && echo "- Node.js/TypeScript"
    [ -f "$REPO_ROOT/requirements.txt" ] && echo "- Python"
    [ -f "$REPO_ROOT/pyproject.toml" ] && echo "- Python (modern)"
    [ -f "$REPO_ROOT/Cargo.toml" ] && echo "- Rust"
    [ -f "$REPO_ROOT/go.mod" ] && echo "- Go"
    [ -f "$REPO_ROOT/Gemfile" ] && echo "- Ruby"
    [ -d "$REPO_ROOT/Assets" ] && echo "- Unity/C#"
    echo ""

    # CLAUDE.md summary (if exists)
    if [ -f "$REPO_ROOT/CLAUDE.md" ]; then
        echo "## Project Guidelines (from CLAUDE.md)"
        head -50 "$REPO_ROOT/CLAUDE.md" | grep -v "^#" | head -20
    fi
}

# Generate and save
generate_context > "$CONTEXT_FILE"

echo "✅ Cervelletto generated: $CONTEXT_FILE"
echo "Size: $(wc -l < "$CONTEXT_FILE") lines"
