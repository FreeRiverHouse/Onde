#!/usr/bin/env python3
"""
Autotrader Health Endpoint Generator
Generates a JSON file with autotrader status for external monitoring.

Output: data/trading/autotrader-health.json
Cron: */5 * * * * (every 5 minutes)

Can be fetched via:
- Local file
- Pushed to gist (like trading stats)
- Served via simple HTTP server
"""

import json
import subprocess
from datetime import datetime, timezone, timedelta
from pathlib import Path
import sys

# Paths
ONDE_ROOT = Path(__file__).parent.parent
TRADES_FILE = ONDE_ROOT / "scripts" / "kalshi-trades-v2.jsonl"
OUTPUT_FILE = ONDE_ROOT / "data" / "trading" / "autotrader-health.json"
AUTOTRADER_LOG = ONDE_ROOT / "scripts" / "autotrader-v2.log"


def is_autotrader_running() -> dict:
    """Check if autotrader process is running."""
    try:
        result = subprocess.run(
            ["pgrep", "-f", "kalshi-autotrader-v2.py"],
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            pids = result.stdout.strip().split('\n')
            return {
                "running": True,
                "pid": int(pids[0]) if pids else None,
                "process_count": len(pids)
            }
    except Exception as e:
        pass
    
    return {"running": False, "pid": None, "process_count": 0}


def get_last_trade_info() -> dict:
    """Get info about the last trade."""
    if not TRADES_FILE.exists():
        return {"last_trade": None, "trades_24h": 0}
    
    trades = []
    now = datetime.now(timezone.utc)
    cutoff_24h = now - timedelta(hours=24)
    
    try:
        with open(TRADES_FILE, 'r') as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    trade = json.loads(line)
                    trades.append(trade)
                except json.JSONDecodeError:
                    continue
        
        if not trades:
            return {"last_trade": None, "trades_24h": 0}
        
        # Get last trade
        last_trade = trades[-1]
        
        # Count 24h trades and calculate win rate
        trades_24h = []
        for t in trades:
            try:
                ts = datetime.fromisoformat(t.get('timestamp', '').replace('Z', '+00:00'))
                if ts >= cutoff_24h:
                    trades_24h.append(t)
            except:
                continue
        
        won_24h = sum(1 for t in trades_24h if t.get('result_status') == 'won')
        lost_24h = sum(1 for t in trades_24h if t.get('result_status') == 'lost')
        settled_24h = won_24h + lost_24h
        
        return {
            "last_trade": {
                "timestamp": last_trade.get('timestamp'),
                "ticker": last_trade.get('ticker'),
                "side": last_trade.get('side'),
                "price_cents": last_trade.get('price_cents'),
                "result": last_trade.get('result_status', 'pending')
            },
            "trades_24h": len(trades_24h),
            "won_24h": won_24h,
            "lost_24h": lost_24h,
            "win_rate_24h": round(won_24h / settled_24h * 100, 1) if settled_24h > 0 else None,
            "total_trades": len(trades)
        }
    except Exception as e:
        return {"last_trade": None, "trades_24h": 0, "error": str(e)}


def get_last_error() -> dict:
    """Check log for recent errors."""
    if not AUTOTRADER_LOG.exists():
        return {"last_error": None}
    
    try:
        # Read last 100 lines of log
        result = subprocess.run(
            ["tail", "-100", str(AUTOTRADER_LOG)],
            capture_output=True,
            text=True
        )
        
        lines = result.stdout.strip().split('\n')
        
        # Look for error patterns
        error_keywords = ['ERROR', 'Exception', 'Traceback', 'FAILED']
        last_error = None
        
        for line in reversed(lines):
            for keyword in error_keywords:
                if keyword in line:
                    last_error = line[:200]  # Truncate long errors
                    break
            if last_error:
                break
        
        return {"last_error": last_error}
    except:
        return {"last_error": None}


def get_log_activity() -> dict:
    """Check log file activity to see if autotrader is actively working."""
    if not AUTOTRADER_LOG.exists():
        return {"log_active": False, "log_age_minutes": None}
    
    try:
        mtime = datetime.fromtimestamp(AUTOTRADER_LOG.stat().st_mtime, tz=timezone.utc)
        age = datetime.now(timezone.utc) - mtime
        age_minutes = round(age.total_seconds() / 60, 1)
        
        return {
            "log_active": age_minutes < 10,  # Active if modified in last 10 min
            "log_age_minutes": age_minutes,
            "log_last_modified": mtime.isoformat()
        }
    except:
        return {"log_active": False, "log_age_minutes": None}


def generate_health_status() -> dict:
    """Generate complete health status."""
    process_status = is_autotrader_running()
    trade_info = get_last_trade_info()
    error_info = get_last_error()
    log_info = get_log_activity()
    
    # Determine overall health
    health = "healthy"
    issues = []
    
    if not process_status["running"]:
        health = "critical"
        issues.append("Autotrader process not running")
    elif not log_info["log_active"]:
        health = "warning"
        issues.append(f"Log stale ({log_info['log_age_minutes']} min)")
    
    if error_info.get("last_error"):
        if health == "healthy":
            health = "warning"
        issues.append("Recent error in log")
    
    return {
        "status": health,
        "issues": issues,
        "process": process_status,
        "trades": trade_info,
        "log": log_info,
        "errors": error_info,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "version": "1.0"
    }


def main():
    # Ensure output directory exists
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    
    # Generate health status
    health = generate_health_status()
    
    # Write to file
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(health, f, indent=2)
    
    # Print summary
    status_emoji = {
        "healthy": "✅",
        "warning": "⚠️",
        "critical": "❌"
    }
    
    print(f"{status_emoji.get(health['status'], '❓')} Autotrader Health: {health['status'].upper()}")
    
    if health['issues']:
        for issue in health['issues']:
            print(f"  • {issue}")
    
    print(f"\nProcess: {'Running' if health['process']['running'] else 'NOT RUNNING'}")
    
    if health['trades'].get('last_trade'):
        lt = health['trades']['last_trade']
        print(f"Last trade: {lt['ticker']} {lt['side']} @ {lt['price_cents']}¢ ({lt['result']})")
    
    if health['trades'].get('win_rate_24h') is not None:
        print(f"24h: {health['trades']['trades_24h']} trades, {health['trades']['win_rate_24h']}% win rate")
    
    print(f"\nOutput: {OUTPUT_FILE}")
    
    # Return exit code based on health
    if health['status'] == 'critical':
        sys.exit(2)
    elif health['status'] == 'warning':
        sys.exit(1)
    else:
        sys.exit(0)


if __name__ == "__main__":
    main()
