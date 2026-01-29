#!/usr/bin/env python3
"""
Autotrader Health JSON Endpoint
Outputs: running, pid, uptime, last_trade_time, trade_count_today, win_rate_today, current_balance

Usage: python3 scripts/autotrader-health.py [--json | --pretty]
"""

import subprocess
import json
import os
import sys
from datetime import datetime, timezone

SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPTS_DIR)
V2_TRADES_FILE = os.path.join(SCRIPTS_DIR, "kalshi-trades-v2.jsonl")
BALANCE_FILE = os.path.join(SCRIPTS_DIR, "kalshi-balance.json")
UPTIME_FILE = os.path.join(PROJECT_DIR, "data/trading/autotrader-uptime.json")

def get_autotrader_status():
    """Check if autotrader is running and get PID"""
    try:
        result = subprocess.run(
            ["pgrep", "-f", "kalshi-autotrader"],
            capture_output=True, text=True
        )
        if result.returncode == 0:
            pids = result.stdout.strip().split('\n')
            return True, int(pids[0]) if pids else None
        return False, None
    except Exception:
        return False, None

def get_uptime_info():
    """Get uptime from tracking file"""
    try:
        if os.path.exists(UPTIME_FILE):
            with open(UPTIME_FILE) as f:
                data = json.load(f)
                return {
                    "uptime_24h_pct": data.get("uptime_24h_percent", 0),
                    "uptime_7d_pct": data.get("uptime_7d_percent", 0),
                    "last_checked": data.get("last_updated", None)
                }
    except Exception:
        pass
    return {"uptime_24h_pct": None, "uptime_7d_pct": None, "last_checked": None}

def get_today_trades():
    """Get today's trades from v2 log"""
    trades = []
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    try:
        if os.path.exists(V2_TRADES_FILE):
            with open(V2_TRADES_FILE) as f:
                for line in f:
                    try:
                        trade = json.loads(line.strip())
                        ts = trade.get("timestamp", "")
                        if ts.startswith(today):
                            trades.append(trade)
                    except json.JSONDecodeError:
                        continue
    except Exception:
        pass
    
    return trades

def calculate_win_rate(trades):
    """Calculate win rate from trades"""
    if not trades:
        return 0.0, 0, 0
    
    won = sum(1 for t in trades if t.get("result_status") == "won")
    lost = sum(1 for t in trades if t.get("result_status") == "lost")
    settled = won + lost
    
    if settled == 0:
        return 0.0, won, lost
    
    return round((won / settled) * 100, 1), won, lost

def get_last_trade_time():
    """Get timestamp of most recent trade"""
    try:
        if os.path.exists(V2_TRADES_FILE):
            with open(V2_TRADES_FILE) as f:
                lines = f.readlines()
                for line in reversed(lines):
                    try:
                        trade = json.loads(line.strip())
                        return trade.get("timestamp")
                    except json.JSONDecodeError:
                        continue
    except Exception:
        pass
    return None

def get_balance():
    """Get current Kalshi balance"""
    try:
        if os.path.exists(BALANCE_FILE):
            with open(BALANCE_FILE) as f:
                data = json.load(f)
                return data.get("balance", None)
    except Exception:
        pass
    return None

def get_health():
    """Generate complete health status"""
    running, pid = get_autotrader_status()
    today_trades = get_today_trades()
    win_rate, won, lost = calculate_win_rate(today_trades)
    uptime = get_uptime_info()
    
    health = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "running": running,
        "pid": pid,
        "uptime_24h_pct": uptime["uptime_24h_pct"],
        "uptime_7d_pct": uptime["uptime_7d_pct"],
        "last_trade_time": get_last_trade_time(),
        "trade_count_today": len(today_trades),
        "trades_won_today": won,
        "trades_lost_today": lost,
        "trades_pending_today": len(today_trades) - won - lost,
        "win_rate_today": win_rate,
        "current_balance": get_balance()
    }
    
    # Status summary
    if not running:
        health["status"] = "stopped"
        health["status_emoji"] = "🔴"
    elif len(today_trades) == 0:
        health["status"] = "running_idle"
        health["status_emoji"] = "🟡"
    else:
        health["status"] = "running_active"
        health["status_emoji"] = "🟢"
    
    return health

def main():
    pretty = "--pretty" in sys.argv
    
    health = get_health()
    
    if pretty:
        print(f"\n{health['status_emoji']} Autotrader Health Status")
        print("=" * 40)
        print(f"Status:       {health['status']}")
        print(f"Running:      {'Yes' if health['running'] else 'No'}")
        if health['pid']:
            print(f"PID:          {health['pid']}")
        print(f"Uptime (24h): {health['uptime_24h_pct']}%" if health['uptime_24h_pct'] else "Uptime (24h): N/A")
        print(f"Uptime (7d):  {health['uptime_7d_pct']}%" if health['uptime_7d_pct'] else "Uptime (7d):  N/A")
        print()
        print("📊 Today's Stats")
        print("-" * 40)
        print(f"Trades:       {health['trade_count_today']}")
        print(f"Won/Lost:     {health['trades_won_today']}/{health['trades_lost_today']}")
        print(f"Pending:      {health['trades_pending_today']}")
        print(f"Win Rate:     {health['win_rate_today']}%")
        print(f"Last Trade:   {health['last_trade_time'] or 'N/A'}")
        print(f"Balance:      ${health['current_balance']:.2f}" if health['current_balance'] else "Balance:      N/A")
        print()
    else:
        print(json.dumps(health, indent=2))

if __name__ == "__main__":
    main()
