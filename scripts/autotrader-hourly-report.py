#!/usr/bin/env python3
"""
Autotrader Hourly Health Report to Telegram

Sends a summary of autotrader health every hour:
- Running status (up/down)
- Trades in last hour
- Win rate (24h rolling)
- Current portfolio value
- Any alerts triggered

Usage:
    python autotrader-hourly-report.py [--dry-run] [--verbose]

Cron: 0 * * * * /path/to/autotrader-hourly-report.py
"""

import json
import os
import subprocess
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

# Paths
SCRIPT_DIR = Path(__file__).parent
TRADES_FILE_V2 = SCRIPT_DIR / "kalshi-trades-v2.jsonl"
TRADES_FILE_V1 = SCRIPT_DIR / "kalshi-trades.jsonl"
SETTLEMENTS_FILE_V2 = SCRIPT_DIR / "kalshi-settlements-v2.json"
ALERT_DIR = SCRIPT_DIR
LAST_REPORT_FILE = SCRIPT_DIR / ".last-hourly-report.json"

# Telegram config
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "")


def load_jsonl(filepath: Path, hours_back: int = None) -> list:
    """Load JSONL file, optionally filtering by time."""
    if not filepath.exists():
        return []
    
    trades = []
    cutoff = None
    if hours_back:
        cutoff = datetime.now(timezone.utc) - timedelta(hours=hours_back)
    
    with open(filepath, 'r') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                trade = json.loads(line)
                if cutoff:
                    ts = trade.get("timestamp", "")
                    if ts:
                        trade_time = datetime.fromisoformat(ts.replace("Z", "+00:00"))
                        if trade_time < cutoff:
                            continue
                trades.append(trade)
            except json.JSONDecodeError:
                continue
    return trades


def check_autotrader_status() -> tuple[bool, int]:
    """Check if autotrader is running. Returns (running, pid)."""
    try:
        result = subprocess.run(
            ["pgrep", "-f", "kalshi-autotrader"],
            capture_output=True, text=True
        )
        if result.returncode == 0:
            pid = result.stdout.strip().split('\n')[0]
            return True, int(pid)
    except Exception:
        pass
    return False, 0


def get_24h_stats(trades: list) -> dict:
    """Calculate 24h rolling stats."""
    now = datetime.now(timezone.utc)
    cutoff_24h = now - timedelta(hours=24)
    cutoff_1h = now - timedelta(hours=1)
    
    trades_24h = []
    trades_1h = []
    
    for trade in trades:
        ts = trade.get("timestamp", "")
        if not ts:
            continue
        try:
            trade_time = datetime.fromisoformat(ts.replace("Z", "+00:00"))
            if trade_time >= cutoff_24h:
                trades_24h.append(trade)
            if trade_time >= cutoff_1h:
                trades_1h.append(trade)
        except Exception:
            continue
    
    # Calculate stats
    wins_24h = sum(1 for t in trades_24h if t.get("result") == "win")
    losses_24h = sum(1 for t in trades_24h if t.get("result") == "loss")
    pnl_24h = sum(float(t.get("pnl", 0)) for t in trades_24h if t.get("pnl"))
    
    total_settled_24h = wins_24h + losses_24h
    win_rate_24h = (wins_24h / total_settled_24h * 100) if total_settled_24h > 0 else 0
    
    return {
        "trades_24h": len(trades_24h),
        "trades_1h": len(trades_1h),
        "wins_24h": wins_24h,
        "losses_24h": losses_24h,
        "win_rate_24h": win_rate_24h,
        "pnl_24h": pnl_24h,
    }


def get_portfolio_value() -> float:
    """Get current portfolio value from settlements file."""
    if not SETTLEMENTS_FILE_V2.exists():
        return 0.0
    
    try:
        with open(SETTLEMENTS_FILE_V2, 'r') as f:
            data = json.load(f)
        return float(data.get("total_balance", 0))
    except Exception:
        return 0.0


def get_pending_alerts() -> list:
    """Check for any alert files."""
    alerts = []
    for f in ALERT_DIR.glob("*.alert"):
        alerts.append(f.stem)
    return alerts


def format_telegram_message(
    running: bool,
    pid: int,
    stats: dict,
    portfolio: float,
    alerts: list
) -> str:
    """Format the hourly report as Telegram message."""
    now = datetime.now(timezone.utc)
    now_str = now.strftime("%Y-%m-%d %H:%M UTC")
    
    # Status emoji
    status = "🟢 RUNNING" if running else "🔴 DOWN"
    pid_str = f" (PID: {pid})" if running else ""
    
    # Win rate emoji
    wr = stats["win_rate_24h"]
    if wr >= 60:
        wr_emoji = "🔥"
    elif wr >= 50:
        wr_emoji = "✅"
    elif wr >= 40:
        wr_emoji = "⚠️"
    else:
        wr_emoji = "❌"
    
    # PnL emoji
    pnl = stats["pnl_24h"]
    pnl_emoji = "📈" if pnl >= 0 else "📉"
    
    # Alert status
    if alerts:
        alert_str = f"⚠️ Alerts: {', '.join(alerts[:5])}"
        if len(alerts) > 5:
            alert_str += f" (+{len(alerts)-5} more)"
    else:
        alert_str = "✨ No alerts"
    
    msg = f"""📊 <b>Autotrader Hourly Report</b>
{now_str}

<b>Status:</b> {status}{pid_str}

<b>Last Hour:</b>
• Trades: {stats['trades_1h']}

<b>24h Rolling:</b>
• Trades: {stats['trades_24h']}
• Win Rate: {wr_emoji} {wr:.1f}% ({stats['wins_24h']}W / {stats['losses_24h']}L)
• PnL: {pnl_emoji} ${pnl:+.2f}

<b>Portfolio:</b> ${portfolio:.2f}

{alert_str}"""
    
    return msg


def send_telegram(message: str, dry_run: bool = False) -> bool:
    """Send message to Telegram."""
    if dry_run:
        print("[DRY RUN] Would send to Telegram:")
        print(message)
        return True
    
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print("Warning: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set")
        return False
    
    import urllib.request
    import urllib.parse
    
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    data = urllib.parse.urlencode({
        "chat_id": TELEGRAM_CHAT_ID,
        "text": message,
        "parse_mode": "HTML"
    }).encode()
    
    try:
        req = urllib.request.Request(url, data=data)
        with urllib.request.urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read())
            return result.get("ok", False)
    except Exception as e:
        print(f"Telegram send error: {e}")
        return False


def should_skip_report(stats: dict, running: bool, alerts: list) -> bool:
    """Check if we should skip this report (nothing interesting)."""
    # Load last report data
    if not LAST_REPORT_FILE.exists():
        return False
    
    try:
        with open(LAST_REPORT_FILE, 'r') as f:
            last = json.load(f)
        
        # Always report if status changed
        if last.get("running") != running:
            return False
        
        # Always report if new alerts
        if alerts and alerts != last.get("alerts", []):
            return False
        
        # Always report if there were trades in last hour
        if stats["trades_1h"] > 0:
            return False
        
        # Skip if nothing changed and no activity
        last_wr = last.get("win_rate_24h", 0)
        if abs(stats["win_rate_24h"] - last_wr) < 0.1 and stats["trades_1h"] == 0:
            return True
            
    except Exception:
        pass
    
    return False


def save_last_report(stats: dict, running: bool, alerts: list):
    """Save last report data for comparison."""
    try:
        data = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "running": running,
            "alerts": alerts,
            "win_rate_24h": stats["win_rate_24h"],
            "trades_1h": stats["trades_1h"],
        }
        with open(LAST_REPORT_FILE, 'w') as f:
            json.dump(data, f)
    except Exception as e:
        print(f"Warning: Could not save last report: {e}")


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Autotrader Hourly Health Report")
    parser.add_argument("--dry-run", action="store_true", help="Print message, don't send")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")
    parser.add_argument("--force", "-f", action="store_true", help="Force send even if no changes")
    args = parser.parse_args()
    
    # Gather data
    running, pid = check_autotrader_status()
    
    # Load all trades (v2 preferred, fallback to v1)
    trades_file = TRADES_FILE_V2 if TRADES_FILE_V2.exists() else TRADES_FILE_V1
    trades = load_jsonl(trades_file)
    
    stats = get_24h_stats(trades)
    portfolio = get_portfolio_value()
    alerts = get_pending_alerts()
    
    if args.verbose:
        print(f"Autotrader running: {running} (PID: {pid})")
        print(f"Trades 24h: {stats['trades_24h']}, 1h: {stats['trades_1h']}")
        print(f"Win rate: {stats['win_rate_24h']:.1f}%")
        print(f"Portfolio: ${portfolio:.2f}")
        print(f"Alerts: {alerts}")
    
    # Check if we should skip
    if not args.force and should_skip_report(stats, running, alerts):
        if args.verbose:
            print("Skipping report - no significant changes")
        return
    
    # Format and send
    message = format_telegram_message(running, pid, stats, portfolio, alerts)
    
    success = send_telegram(message, dry_run=args.dry_run)
    
    if success:
        save_last_report(stats, running, alerts)
        if args.verbose:
            print("Report sent successfully")
    else:
        print("Failed to send report")
        sys.exit(1)


if __name__ == "__main__":
    main()
