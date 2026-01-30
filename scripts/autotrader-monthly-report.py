#!/usr/bin/env python3
"""
Autotrader Monthly Performance Summary to Telegram

Sends a comprehensive monthly summary on the 1st of each month:
- Total trades and volume
- Monthly win rate vs previous month
- Monthly PnL vs previous month
- Best/worst performing weeks
- Market breakdown (crypto vs weather)
- ROI percentage
- Cumulative stats since inception

Usage:
    python autotrader-monthly-report.py [--dry-run] [--verbose] [--force]

Cron: 0 12 1 * * /path/to/autotrader-monthly-report.py  # 1st of month, 12:00 UTC
"""

import json
import os
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path
from collections import defaultdict
import calendar

# Paths
SCRIPT_DIR = Path(__file__).parent
DATA_DIR = SCRIPT_DIR.parent / "data" / "trading"
TRADES_FILE_V2 = SCRIPT_DIR / "kalshi-trades-v2.jsonl"
TRADES_FILE_V1 = SCRIPT_DIR / "kalshi-trades.jsonl"
SETTLEMENTS_FILE_V2 = SCRIPT_DIR / "kalshi-settlements-v2.json"
LAST_MONTHLY_REPORT_FILE = SCRIPT_DIR / ".last-monthly-report.json"

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
    asset = trade.get("asset", "").lower()
    if asset in ["crypto", "weather", "event"]:
        return asset
    
    ticker = trade.get("ticker", "")
    ticker_upper = ticker.upper() if ticker else ""
    
    crypto_keywords = ["BTC", "BITCOIN", "ETH", "ETHEREUM", "SOL", "SOLANA", 
                       "CRYPTO", "COIN", "XRP", "DOGE", "LTC", "ADA"]
    for kw in crypto_keywords:
        if kw in ticker_upper:
            return "crypto"
    
    weather_keywords = ["TEMP", "HIGH", "LOW", "WEATHER", "RAIN", "SNOW", 
                        "CLIMATE", "HURRICANE", "FORECAST", "HEAT", "COLD",
                        "HIGHNYC", "HIGHCHI", "HIGHLA", "MAXTEMP", "MINTEMP"]
    for kw in weather_keywords:
        if kw in ticker_upper:
            return "weather"
    
    return "other"


def calculate_pnl(trade: dict) -> float:
    """Calculate PnL for a single trade. Returns dollars (not cents)."""
    result = trade.get("result_status", trade.get("result", ""))
    cost_cents = float(trade.get("cost_cents", 0) or 0)
    contracts = int(trade.get("contracts", 1) or 1)
    side = trade.get("side", "yes").lower()
    
    if result in ["won", "win"]:
        if side == "yes":
            return (contracts * 100 - cost_cents) / 100.0
        else:
            return (contracts * 100 - cost_cents) / 100.0
    elif result in ["lost", "loss"]:
        return -cost_cents / 100.0
    else:
        return 0.0


def get_month_boundaries(year: int, month: int) -> tuple:
    """Get start/end of a month in UTC."""
    start = datetime(year, month, 1, 0, 0, 0, tzinfo=timezone.utc)
    
    # Get last day of month
    _, last_day = calendar.monthrange(year, month)
    end = datetime(year, month, last_day, 23, 59, 59, tzinfo=timezone.utc)
    
    return start, end


def get_previous_month(year: int, month: int) -> tuple:
    """Get (year, month) for the previous month."""
    if month == 1:
        return year - 1, 12
    else:
        return year, month - 1


def filter_trades_by_month(trades: list, year: int, month: int) -> list:
    """Filter trades to a specific month."""
    start, end = get_month_boundaries(year, month)
    
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


def calculate_monthly_stats(trades: list) -> dict:
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
            "total_invested": 0.0,
            "roi": 0.0,
            "by_asset": {},
            "by_week": {},
        }
    
    wins = 0
    losses = 0
    pending = 0
    total_pnl = 0.0
    total_invested = 0.0
    by_asset = defaultdict(lambda: {"wins": 0, "losses": 0, "pnl": 0.0, "total": 0, "invested": 0.0})
    by_week = defaultdict(lambda: {"wins": 0, "losses": 0, "pnl": 0.0, "total": 0})
    
    for trade in trades:
        asset_type = classify_asset(trade)
        result = trade.get("result_status", trade.get("result", ""))
        pnl = calculate_pnl(trade)
        cost = float(trade.get("cost_cents", 0) or 0) / 100.0
        
        # Week number for grouping
        ts = trade.get("timestamp", "")
        week_num = 0
        if ts:
            try:
                trade_time = datetime.fromisoformat(ts.replace("Z", "+00:00"))
                week_num = trade_time.isocalendar()[1]
            except:
                pass
        
        by_asset[asset_type]["total"] += 1
        by_asset[asset_type]["invested"] += cost
        by_week[week_num]["total"] += 1
        total_invested += cost
        
        if result in ["win", "won"]:
            wins += 1
            by_asset[asset_type]["wins"] += 1
            by_week[week_num]["wins"] += 1
        elif result in ["loss", "lost"]:
            losses += 1
            by_asset[asset_type]["losses"] += 1
            by_week[week_num]["losses"] += 1
        else:
            pending += 1
        
        total_pnl += pnl
        by_asset[asset_type]["pnl"] += pnl
        by_week[week_num]["pnl"] += pnl
    
    settled = wins + losses
    win_rate = (wins / settled * 100) if settled > 0 else 0.0
    roi = (total_pnl / total_invested * 100) if total_invested > 0 else 0.0
    
    # Calculate win rates per asset class
    for asset_type in by_asset:
        settled_asset = by_asset[asset_type]["wins"] + by_asset[asset_type]["losses"]
        by_asset[asset_type]["win_rate"] = (by_asset[asset_type]["wins"] / settled_asset * 100) if settled_asset > 0 else 0.0
        invested = by_asset[asset_type]["invested"]
        by_asset[asset_type]["roi"] = (by_asset[asset_type]["pnl"] / invested * 100) if invested > 0 else 0.0
    
    # Calculate win rates per week
    for week in by_week:
        settled_week = by_week[week]["wins"] + by_week[week]["losses"]
        by_week[week]["win_rate"] = (by_week[week]["wins"] / settled_week * 100) if settled_week > 0 else 0.0
    
    return {
        "total": len(trades),
        "settled": settled,
        "wins": wins,
        "losses": losses,
        "pending": pending,
        "win_rate": win_rate,
        "pnl": total_pnl,
        "total_invested": total_invested,
        "roi": roi,
        "by_asset": dict(by_asset),
        "by_week": dict(by_week),
    }


def calculate_all_time_stats(trades: list) -> dict:
    """Calculate all-time cumulative stats."""
    if not trades:
        return {"total": 0, "win_rate": 0.0, "pnl": 0.0, "roi": 0.0}
    
    wins = 0
    losses = 0
    total_pnl = 0.0
    total_invested = 0.0
    
    for trade in trades:
        result = trade.get("result_status", trade.get("result", ""))
        pnl = calculate_pnl(trade)
        cost = float(trade.get("cost_cents", 0) or 0) / 100.0
        
        total_invested += cost
        total_pnl += pnl
        
        if result in ["win", "won"]:
            wins += 1
        elif result in ["loss", "lost"]:
            losses += 1
    
    settled = wins + losses
    win_rate = (wins / settled * 100) if settled > 0 else 0.0
    roi = (total_pnl / total_invested * 100) if total_invested > 0 else 0.0
    
    return {
        "total": len(trades),
        "settled": settled,
        "wins": wins,
        "losses": losses,
        "win_rate": win_rate,
        "pnl": total_pnl,
        "total_invested": total_invested,
        "roi": roi,
    }


def get_best_worst_weeks(by_week: dict) -> tuple:
    """Find best and worst performing weeks."""
    if not by_week:
        return None, None
    
    sorted_weeks = sorted(by_week.items(), key=lambda x: x[1]["pnl"], reverse=True)
    
    best = sorted_weeks[0] if sorted_weeks else None
    worst = sorted_weeks[-1] if len(sorted_weeks) > 1 else None
    
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


def generate_insights(this_month: dict, last_month: dict, all_time: dict) -> list:
    """Generate key insights from the monthly data."""
    insights = []
    
    # ROI analysis
    if this_month["roi"] >= 10:
        insights.append("🚀 Excellent ROI this month (>10%)")
    elif this_month["roi"] <= -10:
        insights.append("⚠️ Significant losses this month, review strategy")
    
    # Win rate trend
    if this_month["win_rate"] >= 60:
        insights.append("🔥 Strong win rate above 60%")
    elif this_month["win_rate"] <= 30 and this_month["settled"] >= 10:
        insights.append("❌ Below average performance, consider pausing")
    
    # Volume change
    if last_month["total"] > 0:
        volume_change = (this_month["total"] - last_month["total"]) / last_month["total"] * 100
        if volume_change > 50:
            insights.append(f"📈 Trading volume up {volume_change:.0f}% vs last month")
        elif volume_change < -50:
            insights.append(f"📉 Trading volume down {abs(volume_change):.0f}% vs last month")
    
    # All-time performance
    if all_time["roi"] > 0:
        insights.append(f"✅ Cumulative ROI still positive: {all_time['roi']:.1f}%")
    elif all_time["roi"] < -20:
        insights.append(f"🔴 Cumulative ROI negative: {all_time['roi']:.1f}% - review overall strategy")
    
    if not insights:
        insights.append("📊 Standard month, no major patterns detected")
    
    return insights[:4]


def format_telegram_message(
    this_month: dict,
    last_month: dict,
    all_time: dict,
    best_week: tuple,
    worst_week: tuple,
    portfolio: float,
    insights: list,
    year: int,
    month: int
) -> str:
    """Format the monthly summary as Telegram message."""
    month_name = calendar.month_name[month]
    
    # Win rate emoji
    wr = this_month["win_rate"]
    if wr >= 60:
        wr_emoji = "🔥"
    elif wr >= 50:
        wr_emoji = "✅"
    elif wr >= 40:
        wr_emoji = "⚠️"
    else:
        wr_emoji = "❌"
    
    # ROI emoji
    roi = this_month["roi"]
    if roi >= 10:
        roi_emoji = "🚀"
    elif roi >= 0:
        roi_emoji = "📈"
    else:
        roi_emoji = "📉"
    
    # Asset breakdown
    asset_lines = []
    for asset_type in ["crypto", "weather", "event", "other"]:
        if asset_type in this_month["by_asset"]:
            data = this_month["by_asset"][asset_type]
            if data["total"] > 0:
                emoji = {"crypto": "🪙", "weather": "🌤️", "event": "📊", "other": "📦"}.get(asset_type, "📦")
                asset_lines.append(f"  {emoji} {asset_type.capitalize()}: {data['total']} trades, {data['win_rate']:.0f}% WR, {data['roi']:+.1f}% ROI")
    
    asset_str = "\n".join(asset_lines) if asset_lines else "  No trades"
    
    # Best/worst weeks
    week_str = ""
    if best_week:
        week_num, data = best_week
        week_str += f"\n🏆 Best Week #{week_num}: ${data['pnl']:+.2f} ({data['win_rate']:.0f}% WR)"
    if worst_week:
        week_num, data = worst_week
        week_str += f"\n💀 Worst Week #{week_num}: ${data['pnl']:+.2f} ({data['win_rate']:.0f}% WR)"
    if not week_str:
        week_str = "\n  Not enough weekly data"
    
    # Month-over-month comparison
    wr_change = format_change(this_month["win_rate"], last_month["win_rate"], is_percent=True)
    pnl_change = format_change(this_month["pnl"], last_month["pnl"])
    roi_change = format_change(this_month["roi"], last_month["roi"], is_percent=True)
    
    # Insights
    insights_str = "\n".join(f"• {i}" for i in insights)
    
    msg = f"""📅 <b>Monthly Trading Summary</b>
{month_name} {year}

<b>📊 This Month:</b>
• Total Trades: {this_month['total']} ({this_month['pending']} pending)
• Settled: {this_month['settled']} ({this_month['wins']}W / {this_month['losses']}L)
• Win Rate: {wr_emoji} {wr:.1f}% {wr_change}
• PnL: ${this_month['pnl']:+.2f} {pnl_change}
• Total Invested: ${this_month['total_invested']:.2f}
• ROI: {roi_emoji} {roi:+.1f}% {roi_change}

<b>📈 By Asset Class:</b>
{asset_str}

<b>📆 Weekly Performance:</b>{week_str}

<b>🏛️ All-Time Stats:</b>
• Total Trades: {all_time['total']} ({all_time['wins']}W / {all_time['losses']}L)
• Win Rate: {all_time['win_rate']:.1f}%
• Cumulative PnL: ${all_time['pnl']:+.2f}
• Cumulative ROI: {all_time['roi']:+.1f}%

<b>💡 Insights:</b>
{insights_str}

<b>💰 Portfolio:</b> ${portfolio:.2f}

<i>vs {calendar.month_abbr[last_month['month'] if 'month' in last_month else month]}: {last_month['total']} trades, {last_month['win_rate']:.0f}% WR, ${last_month['pnl']:+.2f}</i>"""
    
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


def save_last_report(this_month: dict, last_month: dict, year: int, month: int):
    """Save last report data for comparison."""
    data = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "year": year,
        "month": month,
        "this_month": this_month,
        "last_month": last_month,
    }
    
    try:
        with open(LAST_MONTHLY_REPORT_FILE, 'w') as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"Warning: Could not save last report: {e}")


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Monthly autotrader performance summary")
    parser.add_argument("--dry-run", action="store_true", help="Print report without sending")
    parser.add_argument("--verbose", action="store_true", help="Show detailed output")
    parser.add_argument("--force", action="store_true", help="Send even if not 1st of month")
    parser.add_argument("--month", type=int, help="Specific month (1-12)")
    parser.add_argument("--year", type=int, help="Specific year")
    args = parser.parse_args()
    
    now = datetime.now(timezone.utc)
    
    # Determine which month to report on
    if args.month and args.year:
        report_year = args.year
        report_month = args.month
    else:
        # Default: report on previous month (if 1st of month) or current month (if forced)
        if now.day == 1 or args.force or args.dry_run:
            # Report on previous month
            report_year, report_month = get_previous_month(now.year, now.month)
        else:
            print(f"Today is {now.strftime('%B %d')}, not 1st of month. Use --force to run anyway.")
            return
    
    if args.verbose:
        print(f"Generating report for {calendar.month_name[report_month]} {report_year}")
        print("Loading all trades...")
    
    all_trades = load_all_trades()
    
    if args.verbose:
        print(f"Loaded {len(all_trades)} total trades")
    
    # Get this month and last month's trades
    this_month_trades = filter_trades_by_month(all_trades, report_year, report_month)
    prev_year, prev_month = get_previous_month(report_year, report_month)
    last_month_trades = filter_trades_by_month(all_trades, prev_year, prev_month)
    
    if args.verbose:
        print(f"This month: {len(this_month_trades)} trades")
        print(f"Last month: {len(last_month_trades)} trades")
    
    # Calculate stats
    this_month_stats = calculate_monthly_stats(this_month_trades)
    last_month_stats = calculate_monthly_stats(last_month_trades)
    last_month_stats["month"] = prev_month  # For display
    all_time_stats = calculate_all_time_stats(all_trades)
    
    # Get best/worst weeks
    best_week, worst_week = get_best_worst_weeks(this_month_stats["by_week"])
    
    # Get portfolio value
    portfolio = get_portfolio_value()
    
    # Generate insights
    insights = generate_insights(this_month_stats, last_month_stats, all_time_stats)
    
    # Format message
    message = format_telegram_message(
        this_month_stats,
        last_month_stats,
        all_time_stats,
        best_week,
        worst_week,
        portfolio,
        insights,
        report_year,
        report_month
    )
    
    # Send or print
    if args.dry_run:
        print("\n" + "="*50)
        send_telegram(message, dry_run=True)
        print("="*50 + "\n")
    else:
        success = send_telegram(message)
        if success:
            print("✅ Monthly report sent to Telegram")
            save_last_report(this_month_stats, last_month_stats, report_year, report_month)
        else:
            print("❌ Failed to send monthly report")
            sys.exit(1)


if __name__ == "__main__":
    main()
