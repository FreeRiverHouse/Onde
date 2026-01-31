#!/bin/bash
# Fix _routes.json to serve static-games as static files
# This is needed because @cloudflare/next-on-pages doesn't know about our static games

ROUTES_FILE=".vercel/output/static/_routes.json"

if [ -f "$ROUTES_FILE" ]; then
  # Add /static-games/* to exclude list
  cat "$ROUTES_FILE" | \
    sed 's|"exclude":\["/_next/static/\*"\]|"exclude":["/_next/static/*","/static-games/*"]|' \
    > "${ROUTES_FILE}.tmp" && mv "${ROUTES_FILE}.tmp" "$ROUTES_FILE"
  echo "✅ Fixed _routes.json to serve static-games"
else
  echo "⚠️ _routes.json not found, skipping fix"
fi
