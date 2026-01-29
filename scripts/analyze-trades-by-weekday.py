#!/usr/bin/env python3
"""
Analyze trading performance by day of week.
Check if certain days have better/worse win rates (market patterns may differ on weekends).

Usage:
    python3 scripts/analyze-trades-by-weekday.py [--v2]
    
    --v2: Use v2 trade log (default: v1)

Author: Clawd (T358)
"""

import json
import argparse
from datetime import datetime
from pathlib import Path
from collections import defaultdict

# Trade log files
V1_TRADE_LOG = "scripts/kalshi-trades.jsonl"
V2_TRADE_LOG = "scripts/kalshi-trades-v2.jsonl"

WEEKDAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def load_trades(filepath: str) -> list:
    """Load trades from JSONL file."""
    trades = []
    path = Path(filepath)
    if not path.exists():
        print(f"❌ Trade log not found: {filepath}")
        return trades
    
    with open(path) as f:
        for line in f:
            try:
                entry = json.loads(line.strip())
                if entry.get("type") == "trade":
                    trades.append(entry)
            except:
                pass
    
    return trades


def parse_timestamp(ts: str) -> datetime:
    """Parse ISO timestamp."""
    try:
        return datetime.fromisoformat(ts.replace("Z", "+00:00"))
    except:
        return None


def analyze_by_weekday(trades: list) -> dict:
    """
    Analyze trades by day of week.
    
    Returns:
        dict with weekday stats: {0: {"total": N, "wins": N, "losses": N, ...}, ...}
    """
    stats = {i: {
        "name": WEEKDAY_NAMES[i],
        "total": 0,
        "wins": 0,
        "losses": 0,
        "pending": 0,
        "profit_cents": 0,
        "cost_cents": 0
    } for i in range(7)}
    
    for trade in trades:
        ts = trade.get("timestamp")
        if not ts:
            continue
        
        dt = parse_timestamp(ts)
        if not dt:
            continue
        
        weekday = dt.weekday()  # 0 = Monday, 6 = Sunday
        stats[weekday]["total"] += 1
        
        # Normalize result status
        result = trade.get("result_status", "pending")
        if result in ("won", "win"):
            stats[weekday]["wins"] += 1
            stats[weekday]["profit_cents"] += trade.get("profit_cents", 0)
        elif result in ("lost", "loss"):
            stats[weekday]["losses"] += 1
            stats[weekday]["profit_cents"] += trade.get("profit_cents", 0)  # Already negative
        else:
            stats[weekday]["pending"] += 1
        
        stats[weekday]["cost_cents"] += trade.get("cost_cents", 0)
    
    # Calculate win rate for each day
    for day_stats in stats.values():
        settled = day_stats["wins"] + day_stats["losses"]
        day_stats["win_rate"] = (day_stats["wins"] / settled * 100) if settled > 0 else 0
        day_stats["roi"] = (day_stats["profit_cents"] / day_stats["cost_cents"] * 100) if day_stats["cost_cents"] > 0 else 0
    
    return stats


def print_weekday_stats(stats: dict):
    """Print formatted weekday statistics."""
    print("\n" + "=" * 70)
    print("📅 TRADING PERFORMANCE BY DAY OF WEEK")
    print("=" * 70)
    
    # Sort by total trades (to show busiest days first)
    sorted_days = sorted(stats.items(), key=lambda x: x[1]["total"], reverse=True)
    
    print(f"\n{'Day':<12} {'Trades':>8} {'W/L':>10} {'Win %':>8} {'PnL':>12} {'ROI':>8}")
    print("-" * 70)
    
    for _, day_stats in sorted_days:
        name = day_stats["name"]
        total = day_stats["total"]
        wins = day_stats["wins"]
        losses = day_stats["losses"]
        win_rate = day_stats["win_rate"]
        pnl = day_stats["profit_cents"] / 100
        roi = day_stats["roi"]
        
        if total == 0:
            print(f"{name:<12} {'N/A':>8} {'-':>10} {'-':>8} {'-':>12} {'-':>8}")
        else:
            # Color indicators
            wr_indicator = "🟢" if win_rate >= 50 else "🔴" if win_rate < 40 else "🟡"
            pnl_indicator = "+" if pnl > 0 else ""
            
            print(f"{name:<12} {total:>8} {wins:>4}W/{losses:<4}L {win_rate:>6.1f}%{wr_indicator} ${pnl_indicator}{pnl:>9.2f} {roi:>+7.1f}%")
    
    print("-" * 70)
    
    # Summary
    total_trades = sum(d["total"] for d in stats.values())
    total_wins = sum(d["wins"] for d in stats.values())
    total_losses = sum(d["losses"] for d in stats.values())
    total_pnl = sum(d["profit_cents"] for d in stats.values()) / 100
    
    settled = total_wins + total_losses
    overall_wr = (total_wins / settled * 100) if settled > 0 else 0
    
    print(f"\n📊 Overall: {total_trades} trades | {total_wins}W/{total_losses}L | {overall_wr:.1f}% WR | ${total_pnl:+.2f} PnL")
    
    # Insights
    print("\n💡 INSIGHTS:")
    
    if total_trades == 0:
        print("   No trades to analyze.")
        return
    
    # Best day by win rate (min 3 settled trades)
    valid_days = [(k, v) for k, v in stats.items() if v["wins"] + v["losses"] >= 3]
    if valid_days:
        best_wr_day = max(valid_days, key=lambda x: x[1]["win_rate"])
        worst_wr_day = min(valid_days, key=lambda x: x[1]["win_rate"])
        
        print(f"   📈 Best win rate: {best_wr_day[1]['name']} ({best_wr_day[1]['win_rate']:.1f}%)")
        print(f"   📉 Worst win rate: {worst_wr_day[1]['name']} ({worst_wr_day[1]['win_rate']:.1f}%)")
    
    # Most profitable day
    best_pnl_day = max(stats.items(), key=lambda x: x[1]["profit_cents"])
    worst_pnl_day = min(stats.items(), key=lambda x: x[1]["profit_cents"])
    
    if best_pnl_day[1]["profit_cents"] > 0:
        print(f"   💰 Most profitable: {best_pnl_day[1]['name']} (${best_pnl_day[1]['profit_cents']/100:+.2f})")
    if worst_pnl_day[1]["profit_cents"] < 0:
        print(f"   💸 Biggest loss day: {worst_pnl_day[1]['name']} (${worst_pnl_day[1]['profit_cents']/100:+.2f})")
    
    # Weekend vs Weekday
    weekday_wins = sum(stats[i]["wins"] for i in range(5))
    weekday_losses = sum(stats[i]["losses"] for i in range(5))
    weekend_wins = sum(stats[i]["wins"] for i in range(5, 7))
    weekend_losses = sum(stats[i]["losses"] for i in range(5, 7))
    
    weekday_settled = weekday_wins + weekday_losses
    weekend_settled = weekend_wins + weekend_losses
    
    weekday_wr = (weekday_wins / weekday_settled * 100) if weekday_settled > 0 else 0
    weekend_wr = (weekend_wins / weekend_settled * 100) if weekend_settled > 0 else 0
    
    print(f"\n   🏢 Weekday (Mon-Fri): {weekday_wr:.1f}% WR ({weekday_settled} trades)")
    print(f"   🏖️  Weekend (Sat-Sun): {weekend_wr:.1f}% WR ({weekend_settled} trades)")
    
    if weekday_settled >= 5 and weekend_settled >= 3:
        diff = weekend_wr - weekday_wr
        if abs(diff) > 10:
            better = "Weekend" if diff > 0 else "Weekday"
            print(f"   ⚡ {better} performs {abs(diff):.1f}% better!")


def main():
    parser = argparse.ArgumentParser(description="Analyze trading by day of week")
    parser.add_argument("--v2", action="store_true", help="Use v2 trade log")
    args = parser.parse_args()
    
    log_file = V2_TRADE_LOG if args.v2 else V1_TRADE_LOG
    print(f"📂 Loading trades from: {log_file}")
    
    trades = load_trades(log_file)
    print(f"📈 Loaded {len(trades)} trades")
    
    if not trades:
        print("❌ No trades found to analyze")
        return
    
    stats = analyze_by_weekday(trades)
    print_weekday_stats(stats)


if __name__ == "__main__":
    main()
