#!/usr/bin/env python3
"""
Compute rolling 30-day win rate trend from trade logs.
Outputs JSON that can be served by the API.

Usage: python3 compute-winrate-trend.py [--days 30] [--source v2]
"""

import json
import argparse
from pathlib import Path
from datetime import datetime, timedelta
from collections import defaultdict


def load_trades(trades_file: Path) -> list:
    """Load trades from JSONL file."""
    trades = []
    if not trades_file.exists():
        return trades
    
    with open(trades_file) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                trade = json.loads(line)
                trades.append(trade)
            except json.JSONDecodeError:
                continue
    return trades


def compute_daily_stats(trades: list, days: int = 30) -> list:
    """Compute daily win rate stats."""
    # Group trades by date
    daily_trades = defaultdict(lambda: {"won": 0, "lost": 0, "pending": 0, "pnl_cents": 0})
    
    for trade in trades:
        # Get trade date
        ts = trade.get("timestamp") or trade.get("time")
        if not ts:
            continue
        
        try:
            if isinstance(ts, (int, float)):
                trade_date = datetime.fromtimestamp(ts).strftime("%Y-%m-%d")
            else:
                trade_date = ts[:10]  # YYYY-MM-DD
        except:
            continue
        
        # Get result
        result = trade.get("result_status", "pending")
        price = trade.get("price", 50)
        contracts = trade.get("contracts", 1)
        
        if result == "won":
            daily_trades[trade_date]["won"] += 1
            daily_trades[trade_date]["pnl_cents"] += (100 - price) * contracts
        elif result == "lost":
            daily_trades[trade_date]["lost"] += 1
            daily_trades[trade_date]["pnl_cents"] -= price * contracts
        else:
            daily_trades[trade_date]["pending"] += 1
    
    # Build output for last N days
    result = []
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    current = start_date
    cumulative_wins = 0
    cumulative_settled = 0
    
    while current <= end_date:
        date_str = current.strftime("%Y-%m-%d")
        day_stats = daily_trades.get(date_str, {"won": 0, "lost": 0, "pending": 0, "pnl_cents": 0})
        
        won = day_stats["won"]
        lost = day_stats["lost"]
        settled = won + lost
        
        cumulative_wins += won
        cumulative_settled += settled
        
        # Daily win rate (or cumulative if no trades)
        if settled > 0:
            win_rate = (won / settled) * 100
        elif cumulative_settled > 0:
            win_rate = (cumulative_wins / cumulative_settled) * 100
        else:
            win_rate = 0
        
        result.append({
            "date": date_str,
            "winRate": round(win_rate, 1),
            "trades": settled,
            "won": won,
            "lost": lost,
            "pending": day_stats["pending"],
            "pnlCents": day_stats["pnl_cents"]
        })
        
        current += timedelta(days=1)
    
    return result


def main():
    parser = argparse.ArgumentParser(description="Compute win rate trend from trades")
    parser.add_argument("--days", type=int, default=30, help="Number of days to compute")
    parser.add_argument("--source", choices=["v1", "v2", "both"], default="v2", help="Trade source")
    parser.add_argument("--output", type=Path, help="Output JSON file")
    args = parser.parse_args()
    
    scripts_dir = Path(__file__).parent
    
    # Load trades based on source
    trades = []
    if args.source in ["v1", "both"]:
        v1_trades = load_trades(scripts_dir / "kalshi-trades.jsonl")
        trades.extend(v1_trades)
        print(f"📥 Loaded {len(v1_trades)} v1 trades")
    
    if args.source in ["v2", "both"]:
        v2_trades = load_trades(scripts_dir / "kalshi-trades-v2.jsonl")
        trades.extend(v2_trades)
        print(f"📥 Loaded {len(v2_trades)} v2 trades")
    
    # Compute stats
    daily_stats = compute_daily_stats(trades, args.days)
    
    # Summary
    total_trades = sum(d["trades"] for d in daily_stats)
    total_won = sum(d["won"] for d in daily_stats)
    total_pnl = sum(d["pnlCents"] for d in daily_stats)
    overall_wr = (total_won / total_trades * 100) if total_trades > 0 else 0
    
    # Recent vs previous comparison
    recent = daily_stats[-7:] if len(daily_stats) >= 7 else daily_stats
    previous = daily_stats[-14:-7] if len(daily_stats) >= 14 else []
    
    recent_wr = sum(d["winRate"] for d in recent) / len(recent) if recent else 0
    previous_wr = sum(d["winRate"] for d in previous) / len(previous) if previous else recent_wr
    
    trend = "improving" if recent_wr > previous_wr + 2 else "declining" if recent_wr < previous_wr - 2 else "stable"
    
    output = {
        "data": daily_stats,
        "summary": {
            "days": args.days,
            "source": args.source,
            "totalTrades": total_trades,
            "totalWon": total_won,
            "totalLost": total_trades - total_won,
            "overallWinRate": round(overall_wr, 1),
            "totalPnlCents": total_pnl,
            "trend": trend,
            "recentAvgWinRate": round(recent_wr, 1),
            "previousAvgWinRate": round(previous_wr, 1)
        },
        "lastUpdated": datetime.now().isoformat()
    }
    
    # Output
    if args.output:
        output_path = args.output
    else:
        output_path = scripts_dir.parent / "data" / "trading" / "winrate-trend.json"
    
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(output, f, indent=2)
    
    print(f"\n📊 WIN RATE TREND ({args.days} days)")
    print(f"   Source: {args.source}")
    print(f"   Total trades: {total_trades}")
    print(f"   Win rate: {overall_wr:.1f}%")
    print(f"   PnL: {total_pnl/100:+.2f}$")
    print(f"   Trend: {trend} ({previous_wr:.1f}% → {recent_wr:.1f}%)")
    print(f"\n💾 Saved to: {output_path}")


if __name__ == "__main__":
    main()
