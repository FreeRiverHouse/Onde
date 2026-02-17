#!/bin/bash
# Onde Server Control Script
# Usage: ./scripts/server-control.sh [start|stop|restart|status|logs]

ONDE_DIR="/Users/mattia/Projects/Onde"
cd "$ONDE_DIR"

case "$1" in
  start)
    echo "🚀 Starting Onde DEV servers (LAN only)..."
    pm2 start ecosystem.config.js --env dev
    echo ""
    echo "📍 Servers available at:"
    echo "   - Portal:    http://$(ipconfig getifaddr en0):3000"
    echo "   - Dashboard: http://$(ipconfig getifaddr en0):3001"
    echo "   - Factory:   http://$(ipconfig getifaddr en0):3600"
    ;;
  stop)
    echo "⏹️  Stopping all Onde servers..."
    pm2 stop all
    ;;
  restart)
    echo "🔄 Restarting all Onde servers..."
    pm2 restart all
    ;;
  status)
    pm2 status
    ;;
  logs)
    pm2 logs
    ;;
  monit)
    pm2 monit
    ;;
  save)
    echo "💾 Saving PM2 process list..."
    pm2 save
    echo "🔧 Setting up PM2 to start on boot..."
    pm2 startup
    ;;
  *)
    echo "Onde Server Control"
    echo ""
    echo "Usage: $0 {start|stop|restart|status|logs|monit|save}"
    echo ""
    echo "Commands:"
    echo "  start   - Start all DEV servers (LAN accessible)"
    echo "  stop    - Stop all servers"
    echo "  restart - Restart all servers"
    echo "  status  - Show server status"
    echo "  logs    - View live logs"
    echo "  monit   - Real-time monitoring dashboard"
    echo "  save    - Save process list and setup autostart on boot"
    ;;
esac
