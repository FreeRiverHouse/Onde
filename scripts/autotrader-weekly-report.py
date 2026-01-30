#!/usr/bin/env python3
"""
Autotrader Weekly Performance Summary to Telegram

Sends a comprehensive weekly summary every Sunday:
- Total trades (open/closed/settled)
- Weekly win rate vs previous week
- Weekly PnL vs previous week
- Best/worst performing markets
- Market breakdown (crypto vs weather)
- Key patterns observed

Usage:
    python autotrader-weekly-report.py [--dry-run] [--verbose] [--force]

Cron: 0 20 * * 0 /path/to/autotrader-weekly-report.py  # Sunday 20:00 UTC (12:00 PST)
"""

import json
import os
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path
from collections import defaultdict

# Paths
SCRIPT_DIR = Path(__file__).parent
DATA_DIR = SCRIPT_DIR.parent / "data" / "trading"
TRADES_FILE_V2 = SCRIPT_DIR / "kalshi-trades-v2.jsonl"
TRADES_FILE_V1 = SCRIPT_DIR / "kalshi-trades.jsonl"
SETTLEMENTS_FILE_V2 = SCRIPT_DIR / "kalshi-settlements-v2.json"
LAST_WEEKLY_REPORT_FILE = SCRIPT_DIR / ".last-weekly-report.json"

# Telegram config
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "")


def load_all_trades() -> list:
    """Load all trades from JSONL files. Only loads actual trades (type=trade)."""
    trades = []
    
    for filepath in [TRADES_FILE_V2, TRADES_FILE_V1]:
        if not filepath.exists():
            continue
        
        with open(filepath, 'r') as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    record = json.loads(line)
                    # Only include actual trades, not skips or other record types
                    if record.get("type") == "trade":
                        trades.append(record)
                except json.JSONDecodeError:
                    continue
    
    return trades


def classify_asset(trade: dict) -> str:
    """Classify trade into asset category. Uses 'asset' field if present, otherwise infers from ticker."""
    # Prefer the asset field if it exists
    asset = trade.get("asset", "").lower()
    if asset in ["crypto", "weather", "event"]:
        return asset
    
    ticker = trade.get("ticker", "")
    ticker_upper = ticker.upper() if ticker else ""
    
    # Crypto markers
    crypto_keywords = ["BTC", "BITCOIN", "ETH", "ETHEREUM", "SOL", "SOLANA", 
                       "CRYPTO", "COIN", "XRP", "DOGE", "LTC", "ADA"]
    for kw in crypto_keywords:
        if kw in ticker_upper:
            return "crypto"
    
    # Weather markers
    weather_keywords = ["TEMP", "HIGH", "LOW", "WEATHER", "RAIN", "SNOW", 
                        "CLIMATE", "HURRICANE", "FORECAST", "HEAT", "COLD",
                        "HIGHNYC", "HIGHCHI", "HIGHLA", "MAXTEMP", "MINTEMP"]
    for kw in weather_keywords:
        if kw in ticker_upper:
            return "weather"
    
    # Event/political markers
    event_keywords = ["TRUMP", "BIDEN", "ELECTION", "VOTE", "POLL", "FED", 
                      "RATE", "CPI", "GDP", "JOBS", "ECON"]
    for kw in event_keywords:
        if kw in ticker_upper:
            return "event"
    
    return "other"


def get_week_boundaries(weeks_ago: int = 0) -> tuple:
    """Get start/end of a week (Monday 00:00 UTC to Sunday 23:59 UTC)."""
    now = datetime.now(timezone.utc)
    
    # Find the most recent Monday
    days_since_monday = now.weekday()
    this_monday = now.replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=days_since_monday)
    
    # Go back additional weeks if needed
    target_monday = this_monday - timedelta(weeks=weeks_ago)
    target_sunday = target_monday + timedelta(days=6, hours=23, minutes=59, seconds=59)
    
    return target_monday, target_sunday


def filter_trades_by_week(trades: list, weeks_ago: int = 0) -> list:
    """Filter trades to a specific week."""
    start, end = get_week_boundaries(weeks_ago)
    
    filtered = []
    for trade in trades:
        ts = trade.get("timestamp", "")
        if not ts:
            continue
        try:
            trade_time = datetime.fromisoformat(ts.replace("Z", "+00:00"))
            if start <= trade_time <= end:
                filtered.append(trade)
        except Exception:
            continue
    
    return filtered


def calculate_pnl(trade: dict) -> float:
    """Calculate PnL for a single trade. Returns dollars (not cents)."""
    result = trade.get("result_status", trade.get("result", ""))
    cost_cents = float(trade.get("cost_cents", 0) or 0)
    contracts = int(trade.get("contracts", 1) or 1)
    side = trade.get("side", "yes").lower()
    
    if result in ["won", "win"]:
        # Won: profit = (100 - price_paid) * contracts for YES, price_paid * contracts for NO
        if side == "yes":
            return (contracts * 100 - cost_cents) / 100.0
        else:  # NO side wins
            return (contracts * 100 - cost_cents) / 100.0
    elif result in ["lost", "loss"]:
        # Lost: lose the cost
        return -cost_cents / 100.0
    else:
        return 0.0  # Pending


def calculate_weekly_stats(trades: list) -> dict:
    """Calculate stats for a list of trades."""
    if not trades:
        return {
            "total": 0,
            "settled": 0,
            "wins": 0,
            "losses": 0,
            "pending": 0,
            "win_rate": 0.0,
            "pnl": 0.0,
            "by_asset": {},
            "by_market": {},
        }
    
    wins = 0
    losses = 0
    pending = 0
    total_pnl = 0.0
    by_asset = defaultdict(lambda: {"wins": 0, "losses": 0, "pnl": 0.0, "total": 0})
    by_market = defaultdict(lambda: {"wins": 0, "losses": 0, "pnl": 0.0, "total": 0})
    
    for trade in trades:
        ticker = trade.get("ticker", "unknown")
        asset_type = classify_asset(trade)
        result = trade.get("result_status", trade.get("result", ""))
        pnl = calculate_pnl(trade)
        
        by_asset[asset_type]["total"] += 1
        by_market[ticker]["total"] += 1
        
        if result in ["win", "won"]:
            wins += 1
            by_asset[asset_type]["wins"] += 1
            by_market[ticker]["wins"] += 1
        elif result in ["loss", "lost"]:
            losses += 1
            by_asset[asset_type]["losses"] += 1
            by_market[ticker]["losses"] += 1
        else:
            pending += 1
        
        total_pnl += pnl
        by_asset[asset_type]["pnl"] += pnl
        by_market[ticker]["pnl"] += pnl
    
    settled = wins + losses
    win_rate = (wins / settled * 100) if settled > 0 else 0.0
    
    # Calculate win rates per asset class
    for asset_type in by_asset:
        settled_asset = by_asset[asset_type]["wins"] + by_asset[asset_type]["losses"]
        by_asset[asset_type]["win_rate"] = (by_asset[asset_type]["wins"] / settled_asset * 100) if settled_asset > 0 else 0.0
    
    # Calculate win rates per market
    for market in by_market:
        settled_market = by_market[market]["wins"] + by_market[market]["losses"]
        by_market[market]["win_rate"] = (by_market[market]["wins"] / settled_market * 100) if settled_market > 0 else 0.0
    
    return {
        "total": len(trades),
        "settled": settled,
        "wins": wins,
        "losses": losses,
        "pending": pending,
        "win_rate": win_rate,
        "pnl": total_pnl,
        "by_asset": dict(by_asset),
        "by_market": dict(by_market),
    }


def get_best_worst_markets(by_market: dict, min_trades: int = 2) -> tuple:
    """Find best and worst performing markets (min 2 trades to count)."""
    # Filter to markets with enough trades
    qualified = {k: v for k, v in by_market.items() 
                 if v["total"] >= min_trades and (v["wins"] + v["losses"]) > 0}
    
    if not qualified:
        return None, None
    
    # Sort by PnL
    sorted_by_pnl = sorted(qualified.items(), key=lambda x: x[1]["pnl"], reverse=True)
    
    best = sorted_by_pnl[0] if sorted_by_pnl else None
    worst = sorted_by_pnl[-1] if len(sorted_by_pnl) > 1 else None
    
    # Don't show worst if it's positive
    if worst and worst[1]["pnl"] >= 0:
        worst = None
    
    return best, worst


def format_change(current: float, previous: float, is_percent: bool = False) -> str:
    """Format a change between two values."""
    if previous == 0:
        return "🆕" if current > 0 else "—"
    
    diff = current - previous
    if is_percent:
        if diff > 5:
            return f"📈 +{diff:.1f}pp"
        elif diff < -5:
            return f"📉 {diff:.1f}pp"
        elif diff > 0:
            return f"↗️ +{diff:.1f}pp"
        elif diff < 0:
            return f"↘️ {diff:.1f}pp"
        else:
            return "➡️ same"
    else:
        if diff > 0:
            return f"📈 +${diff:.2f}"
        elif diff < 0:
            return f"📉 ${diff:.2f}"
        else:
            return "➡️ $0.00"


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


def generate_insights(this_week: dict, last_week: dict) -> list:
    """Generate key insights from the weekly data."""
    insights = []
    
    # Win rate trend
    if this_week["win_rate"] >= 60:
        insights.append("🔥 Strong week! Win rate above 60%")
    elif this_week["win_rate"] <= 30 and this_week["settled"] >= 3:
        insights.append("⚠️ Below average week, review entry criteria")
    
    # Volume change
    if this_week["total"] > last_week["total"] * 1.5 and last_week["total"] > 0:
        insights.append("📊 Higher trading volume this week")
    elif this_week["total"] < last_week["total"] * 0.5 and last_week["total"] > 0:
        insights.append("📉 Lower trading volume (conservative?)")
    
    # Asset concentration
    total_trades = this_week["total"]
    if total_trades > 0:
        crypto_pct = (this_week["by_asset"].get("crypto", {}).get("total", 0) / total_trades) * 100
        weather_pct = (this_week["by_asset"].get("weather", {}).get("total", 0) / total_trades) * 100
        
        if crypto_pct > 80:
            insights.append("🪙 Heavy crypto concentration, consider diversifying")
        if weather_pct > 80:
            insights.append("🌤️ Heavy weather concentration, consider diversifying")
    
    # PnL trend
    if this_week["pnl"] > 0 and last_week["pnl"] < 0:
        insights.append("✅ Recovered from last week's losses!")
    elif this_week["pnl"] < 0 and last_week["pnl"] < 0:
        insights.append("🔴 Two losing weeks in a row - review strategy")
    
    # No insights? Say so
    if not insights:
        insights.append("📊 Standard week, no major patterns detected")
    
    return insights[:3]  # Max 3 insights


def format_telegram_message(
    this_week: dict,
    last_week: dict,
    best_market: tuple,
    worst_market: tuple,
    portfolio: float,
    insights: list
) -> str:
    """Format the weekly summary as Telegram message."""
    now = datetime.now(timezone.utc)
    week_start, week_end = get_week_boundaries(0)
    week_str = f"{week_start.strftime('%b %d')} - {week_end.strftime('%b %d, %Y')}"
    
    # Win rate emoji
    wr = this_week["win_rate"]
    if wr >= 60:
        wr_emoji = "🔥"
    elif wr >= 50:
        wr_emoji = "✅"
    elif wr >= 40:
        wr_emoji = "⚠️"
    else:
        wr_emoji = "❌"
    
    # PnL emoji
    pnl = this_week["pnl"]
    pnl_emoji = "📈" if pnl >= 0 else "📉"
    
    # Asset breakdown
    asset_lines = []
    for asset_type in ["crypto", "weather", "event", "other"]:
        if asset_type in this_week["by_asset"]:
            data = this_week["by_asset"][asset_type]
            if data["total"] > 0:
                emoji = {"crypto": "🪙", "weather": "🌤️", "event": "📊", "other": "📦"}.get(asset_type, "📦")
                asset_lines.append(f"  {emoji} {asset_type.capitalize()}: {data['total']} trades ({data['win_rate']:.0f}% WR, ${data['pnl']:+.2f})")
    
    asset_str = "\n".join(asset_lines) if asset_lines else "  No trades"
    
    # Best/worst markets
    market_str = ""
    if best_market:
        ticker, data = best_market
        market_str += f"\n🏆 Best: <code>{ticker[:30]}</code>\n   {data['wins']}W/{data['losses']}L, ${data['pnl']:+.2f}"
    if worst_market:
        ticker, data = worst_market
        market_str += f"\n💀 Worst: <code>{ticker[:30]}</code>\n   {data['wins']}W/{data['losses']}L, ${data['pnl']:+.2f}"
    if not market_str:
        market_str = "\n  Not enough data"
    
    # Comparison to last week
    wr_change = format_change(this_week["win_rate"], last_week["win_rate"], is_percent=True)
    pnl_change = format_change(this_week["pnl"], last_week["pnl"])
    
    # Insights
    insights_str = "\n".join(f"• {i}" for i in insights)
    
    msg = f"""📅 <b>Weekly Trading Summary</b>
{week_str}

<b>📊 This Week:</b>
• Total Trades: {this_week['total']} ({this_week['pending']} pending)
• Settled: {this_week['settled']} ({this_week['wins']}W / {this_week['losses']}L)
• Win Rate: {wr_emoji} {wr:.1f}% {wr_change}
• PnL: {pnl_emoji} ${pnl:+.2f} {pnl_change}

<b>📈 By Asset Class:</b>
{asset_str}

<b>🎯 Market Performance:</b>{market_str}

<b>💡 Insights:</b>
{insights_str}

<b>💰 Portfolio:</b> ${portfolio:.2f}

<i>vs Last Week: {last_week['total']} trades, {last_week['win_rate']:.0f}% WR, ${last_week['pnl']:+.2f}</i>"""
    
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


def save_last_report(this_week: dict, last_week: dict):
    """Save last report data for comparison."""
    data = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "this_week": this_week,
        "last_week": last_week,
    }
    
    try:
        with open(LAST_WEEKLY_REPORT_FILE, 'w') as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"Warning: Could not save last report: {e}")


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Weekly autotrader performance summary")
    parser.add_argument("--dry-run", action="store_true", help="Print report without sending")
    parser.add_argument("--verbose", action="store_true", help="Show detailed output")
    parser.add_argument("--force", action="store_true", help="Send even if not Sunday")
    args = parser.parse_args()
    
    # Check if it's Sunday (unless --force)
    now = datetime.now(timezone.utc)
    if now.weekday() != 6 and not args.force and not args.dry_run:
        print(f"Today is {now.strftime('%A')}, not Sunday. Use --force to run anyway.")
        return
    
    if args.verbose:
        print("Loading all trades...")
    
    all_trades = load_all_trades()
    
    if args.verbose:
        print(f"Loaded {len(all_trades)} total trades")
    
    # Get this week and last week's trades
    this_week_trades = filter_trades_by_week(all_trades, weeks_ago=0)
    last_week_trades = filter_trades_by_week(all_trades, weeks_ago=1)
    
    if args.verbose:
        print(f"This week: {len(this_week_trades)} trades")
        print(f"Last week: {len(last_week_trades)} trades")
    
    # Calculate stats
    this_week_stats = calculate_weekly_stats(this_week_trades)
    last_week_stats = calculate_weekly_stats(last_week_trades)
    
    # Get best/worst markets
    best_market, worst_market = get_best_worst_markets(this_week_stats["by_market"])
    
    # Get portfolio value
    portfolio = get_portfolio_value()
    
    # Generate insights
    insights = generate_insights(this_week_stats, last_week_stats)
    
    # Format message
    message = format_telegram_message(
        this_week_stats,
        last_week_stats,
        best_market,
        worst_market,
        portfolio,
        insights
    )
    
    # Send or print
    if args.dry_run:
        print("\n" + "="*50)
        send_telegram(message, dry_run=True)
        print("="*50 + "\n")
    else:
        success = send_telegram(message)
        if success:
            print("✅ Weekly report sent to Telegram")
            save_last_report(this_week_stats, last_week_stats)
        else:
            print("❌ Failed to send weekly report")
            sys.exit(1)


if __name__ == "__main__":
    main()
