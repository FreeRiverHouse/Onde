#!/bin/bash
# Rollback to a specific snapshot

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
SNAPSHOTS_DIR="$PROJECT_DIR/snapshots"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ -z "$1" ]; then
    echo -e "${YELLOW}Available snapshots:${NC}"
    ls -1 "$SNAPSHOTS_DIR" | grep -v "backup-"
    echo ""
    echo "Usage: ./scripts/rollback.sh <snapshot-name>"
    exit 1
fi

SNAPSHOT_NAME="$1"
SNAPSHOT_PATH="$SNAPSHOTS_DIR/$SNAPSHOT_NAME"

if [ ! -d "$SNAPSHOT_PATH" ]; then
    echo -e "${RED}Snapshot not found: $SNAPSHOT_NAME${NC}"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ROLLBACK TO: $SNAPSHOT_NAME"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Backup current state
BACKUP_NAME="backup-before-rollback-$(date +%Y%m%d-%H%M%S)"
echo -e "${YELLOW}1. Backing up current state to $BACKUP_NAME...${NC}"
cp -r "$PROJECT_DIR/out" "$SNAPSHOTS_DIR/$BACKUP_NAME"
echo -e "${GREEN}   Done${NC}"

# Restore snapshot
echo -e "${YELLOW}2. Restoring snapshot...${NC}"
rm -rf "$PROJECT_DIR/out"
cp -r "$SNAPSHOT_PATH" "$PROJECT_DIR/out"
echo -e "${GREEN}   Done${NC}"

# Deploy
echo -e "${YELLOW}3. Deploying to Cloudflare...${NC}"
cd "$PROJECT_DIR"
npx wrangler pages deploy out --project-name=onde-portal
echo -e "${GREEN}   Done${NC}"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  ROLLBACK COMPLETE!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Backup saved as: $BACKUP_NAME"
echo "Verify at: https://onde.la"
