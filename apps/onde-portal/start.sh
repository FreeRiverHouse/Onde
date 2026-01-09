#!/bin/bash
# Start Onde Books Store

PORT=${1:-3000}

echo "========================================="
echo "   Onde Books Store"
echo "========================================="
echo ""
echo "   Server: http://localhost:$PORT"
echo "   Per accesso esterno: http://<IP_MAC>:$PORT"
echo ""
echo "   Porta $PORT - configura port forwarding nel router"
echo ""
echo "========================================="

npm run dev -- -p $PORT
