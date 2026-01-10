#!/bin/bash
# Start server with mock Claude for testing
export USE_MOCK_CLAUDE=true
cd /Users/mattia/Projects/Onde/apps/freeriver-flow/server
node index.js
