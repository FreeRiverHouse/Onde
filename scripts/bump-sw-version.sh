#!/bin/bash
# Bump service worker cache version for surfboard
# Usage: ./scripts/bump-sw-version.sh [version]
# If no version given, auto-increments v1 -> v2

set -e

SW_FILE="apps/surfboard/public/sw.js"
TIMESTAMP=$(date +%s)

if [ ! -f "$SW_FILE" ]; then
  echo "❌ Service worker not found: $SW_FILE"
  exit 1
fi

# Get current version
CURRENT=$(grep "const CACHE_NAME = 'surfboard-v" "$SW_FILE" | sed "s/.*surfboard-v\([0-9]*\).*/\1/")

if [ -z "$CURRENT" ]; then
  echo "❌ Could not find CACHE_NAME version in $SW_FILE"
  exit 1
fi

# Calculate new version
if [ -n "$1" ]; then
  NEW_VERSION="$1"
else
  NEW_VERSION=$((CURRENT + 1))
fi

echo "📦 Bumping service worker cache version: v$CURRENT -> v$NEW_VERSION"

# Replace all versioned cache names
sed -i '' "s/surfboard-v$CURRENT/surfboard-v$NEW_VERSION/g" "$SW_FILE"

# Update version comment if present
sed -i '' "s/Version: [0-9]*\.[0-9]*\.[0-9]*/Version: $NEW_VERSION.0.0/" "$SW_FILE"

# Verify change
NEW_CHECK=$(grep "const CACHE_NAME = 'surfboard-v" "$SW_FILE" | sed "s/.*surfboard-v\([0-9]*\).*/\1/")

if [ "$NEW_CHECK" = "$NEW_VERSION" ]; then
  echo "✅ Service worker updated to v$NEW_VERSION"
  echo "   CACHE_NAME: surfboard-v$NEW_VERSION"
  echo "   STATIC_CACHE: surfboard-static-v$NEW_VERSION"
  echo "   API_CACHE: surfboard-api-v$NEW_VERSION"
else
  echo "❌ Version bump failed - please check $SW_FILE manually"
  exit 1
fi
