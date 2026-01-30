#!/usr/bin/env python3
"""
Trade Frequency Analysis
========================
Analyze if trading frequency affects performance.
Helps determine optimal timing between trades.

Features:
- Group trades by cycle frequency (trades/hour)
- Compare win rate during high-activity vs low-activity periods
- Check if waiting longer between trades improves outcomes
- Analyze time gaps between consecutive trades

Usage:
  python analyze-trade-frequency.py              # Full analysis
  python analyze-trade-frequency.py --days 30    # Last N days
  python analyze-trade-frequency.py --verbose    # Detailed output

Author: @clawd
Created: 2026-02-01
"""

import os
import sys
import json
import argparse
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Tuple, Optional
from collections import defaultdict
import math

# Paths
SCRIPT_DIR = Path(__file__).parent
DATA_DIR = SCRIPT_DIR.parent / "data" / "trading"
OUTPUT_FILE = DATA_DIR / "trade-frequency-analysis.json"

# Ensure directories exist
DATA_DIR.mkdir(parents=True, exist_ok=True)


def load_trades(days: int = 90) -> List[Dict]:
    """Load historical trades from trade logs."""
    trades = []
    cutoff = datetime.now() - timedelta(days=days)
    
    # Look for trade files
    for pattern in ["kalshi-trades-v2.jsonl", "kalshi-trades.jsonl"]:
        trade_file = SCRIPT_DIR / pattern
        if trade_file.exists():
            with open(trade_file) as f:
                for line in f:
                    try:
                        trade = json.loads(line.strip())
                        
                        # Skip non-trades (skips, etc.)
                        if trade.get("status") == "skip" or not trade.get("ticker"):
                            continue
                        
                        # Parse timestamp
                        ts_str = trade.get("timestamp", trade.get("time", ""))
                        if ts_str:
                            try:
                                ts = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
                                trade["_parsed_ts"] = ts.replace(tzinfo=None)
                                if trade["_parsed_ts"] >= cutoff:
                                    trades.append(trade)
                            except:
                                pass
                    except json.JSONDecodeError:
                        continue
    
    # Sort by timestamp
    trades.sort(key=lambda x: x.get("_parsed_ts", datetime.min))
    return trades


def calculate_gaps(trades: List[Dict]) -> List[float]:
    """Calculate time gaps between consecutive trades in minutes."""
    gaps = []
    for i in range(1, len(trades)):
        ts1 = trades[i-1].get("_parsed_ts")
        ts2 = trades[i].get("_parsed_ts")
        
        if ts1 and ts2:
            gap = (ts2 - ts1).total_seconds() / 60  # minutes
            if gap >= 0:  # Sanity check
                gaps.append(gap)
    
    return gaps


def analyze_by_gap_bucket(trades: List[Dict]) -> Dict:
    """Analyze win rate by time gap before trade."""
    # Gap buckets in minutes
    buckets = {
        "immediate": (0, 5),      # 0-5 min (same cycle)
        "short": (5, 15),         # 5-15 min
        "medium": (15, 30),       # 15-30 min
        "standard": (30, 60),     # 30-60 min
        "long": (60, 120),        # 1-2 hours
        "very_long": (120, float('inf')),  # 2+ hours
    }
    
    results = {}
    
    for bucket_name, (min_gap, max_gap) in buckets.items():
        bucket_trades = []
        
        for i in range(1, len(trades)):
            ts1 = trades[i-1].get("_parsed_ts")
            ts2 = trades[i].get("_parsed_ts")
            
            if ts1 and ts2:
                gap = (ts2 - ts1).total_seconds() / 60
                
                if min_gap <= gap < max_gap:
                    bucket_trades.append(trades[i])
        
        if bucket_trades:
            wins = sum(1 for t in bucket_trades if t.get("result_status") == "won" or t.get("result") == "won")
            total = len(bucket_trades)
            
            # Calculate PnL
            total_pnl = 0
            for t in bucket_trades:
                pnl = t.get("pnl", t.get("realized_pnl", 0)) or 0
                total_pnl += pnl
            
            results[bucket_name] = {
                "trades": total,
                "wins": wins,
                "win_rate": wins / total if total > 0 else 0,
                "pnl": round(total_pnl, 2),
                "avg_pnl": round(total_pnl / total, 2) if total > 0 else 0,
                "gap_range": f"{min_gap}-{max_gap if max_gap != float('inf') else '∞'} min",
            }
    
    return results


def analyze_by_hour_activity(trades: List[Dict]) -> Dict:
    """Analyze win rate during high vs low activity hours."""
    # Group trades by hour
    hourly_trades = defaultdict(list)
    
    for trade in trades:
        ts = trade.get("_parsed_ts")
        if ts:
            hour_key = ts.strftime("%Y-%m-%d %H")
            hourly_trades[hour_key].append(trade)
    
    # Calculate trades per hour
    trades_per_hour = [len(t) for t in hourly_trades.values()]
    
    if not trades_per_hour:
        return {}
    
    # Determine high/low activity thresholds
    avg_trades = sum(trades_per_hour) / len(trades_per_hour)
    high_threshold = avg_trades * 1.5
    low_threshold = max(1, avg_trades * 0.5)
    
    # Categorize hours
    high_activity_trades = []
    low_activity_trades = []
    normal_activity_trades = []
    
    for hour_key, hour_trades in hourly_trades.items():
        count = len(hour_trades)
        
        if count >= high_threshold:
            high_activity_trades.extend(hour_trades)
        elif count <= low_threshold:
            low_activity_trades.extend(hour_trades)
        else:
            normal_activity_trades.extend(hour_trades)
    
    def calc_stats(trade_list: List[Dict], label: str) -> Dict:
        if not trade_list:
            return {"trades": 0, "label": label}
        
        wins = sum(1 for t in trade_list if t.get("result_status") == "won" or t.get("result") == "won")
        total = len(trade_list)
        
        total_pnl = 0
        for t in trade_list:
            pnl = t.get("pnl", t.get("realized_pnl", 0)) or 0
            total_pnl += pnl
        
        return {
            "trades": total,
            "wins": wins,
            "win_rate": wins / total if total > 0 else 0,
            "pnl": round(total_pnl, 2),
            "avg_pnl": round(total_pnl / total, 2) if total > 0 else 0,
            "label": label,
        }
    
    return {
        "high_activity": calc_stats(high_activity_trades, f">{high_threshold:.1f} trades/hour"),
        "normal_activity": calc_stats(normal_activity_trades, f"{low_threshold:.1f}-{high_threshold:.1f} trades/hour"),
        "low_activity": calc_stats(low_activity_trades, f"<{low_threshold:.1f} trades/hour"),
        "thresholds": {
            "avg_trades_per_hour": round(avg_trades, 2),
            "high_threshold": round(high_threshold, 2),
            "low_threshold": round(low_threshold, 2),
        }
    }


def analyze_consecutive_results(trades: List[Dict]) -> Dict:
    """Analyze impact of previous trade result on next trade."""
    after_win = []
    after_loss = []
    after_neutral = []
    
    for i in range(1, len(trades)):
        prev_result = trades[i-1].get("result_status", trades[i-1].get("result", ""))
        current = trades[i]
        
        if prev_result == "won":
            after_win.append(current)
        elif prev_result == "lost":
            after_loss.append(current)
        else:
            after_neutral.append(current)
    
    def calc_stats(trade_list: List[Dict]) -> Dict:
        if not trade_list:
            return {"trades": 0}
        
        wins = sum(1 for t in trade_list if t.get("result_status") == "won" or t.get("result") == "won")
        total = len(trade_list)
        
        return {
            "trades": total,
            "wins": wins,
            "win_rate": wins / total if total > 0 else 0,
        }
    
    return {
        "after_win": calc_stats(after_win),
        "after_loss": calc_stats(after_loss),
        "after_neutral": calc_stats(after_neutral),
    }


def generate_recommendations(analysis: Dict) -> List[str]:
    """Generate actionable recommendations based on analysis."""
    recommendations = []
    
    # Gap analysis recommendations
    gap_analysis = analysis.get("gap_buckets", {})
    if gap_analysis:
        best_bucket = max(gap_analysis.items(), key=lambda x: x[1].get("win_rate", 0))
        worst_bucket = min(gap_analysis.items(), key=lambda x: x[1].get("win_rate", 0) if x[1].get("trades", 0) > 5 else 1)
        
        if best_bucket[1].get("win_rate", 0) > worst_bucket[1].get("win_rate", 0) + 0.05:
            recommendations.append(
                f"✅ Best performance after {best_bucket[0]} gaps ({best_bucket[1]['win_rate']*100:.1f}% WR). "
                f"Consider minimum cooldown of {best_bucket[1]['gap_range'].split('-')[0]} minutes."
            )
        
        # Check if immediate trades perform poorly
        immediate = gap_analysis.get("immediate", {})
        standard = gap_analysis.get("standard", {})
        if immediate and standard:
            if immediate.get("win_rate", 0) < standard.get("win_rate", 0) - 0.1:
                recommendations.append(
                    f"⚠️ Immediate trades ({immediate['win_rate']*100:.1f}% WR) underperform standard gaps "
                    f"({standard['win_rate']*100:.1f}% WR). Add minimum delay between trades."
                )
    
    # Activity analysis recommendations
    activity = analysis.get("activity_analysis", {})
    if activity:
        high = activity.get("high_activity", {})
        low = activity.get("low_activity", {})
        
        if high and low and high.get("trades", 0) > 10 and low.get("trades", 0) > 10:
            if low.get("win_rate", 0) > high.get("win_rate", 0) + 0.05:
                recommendations.append(
                    f"📉 High-activity periods ({high['win_rate']*100:.1f}% WR) underperform "
                    f"low-activity periods ({low['win_rate']*100:.1f}% WR). Consider rate limiting."
                )
            elif high.get("win_rate", 0) > low.get("win_rate", 0) + 0.05:
                recommendations.append(
                    f"📈 High-activity periods perform better ({high['win_rate']*100:.1f}% WR vs "
                    f"{low['win_rate']*100:.1f}% WR). Current frequency is optimal."
                )
    
    # Consecutive results analysis
    consecutive = analysis.get("consecutive_results", {})
    if consecutive:
        after_win = consecutive.get("after_win", {})
        after_loss = consecutive.get("after_loss", {})
        
        if after_win and after_loss and after_win.get("trades", 0) > 10 and after_loss.get("trades", 0) > 10:
            if after_loss.get("win_rate", 0) < after_win.get("win_rate", 0) - 0.1:
                recommendations.append(
                    f"🎯 Trades after losses underperform ({after_loss['win_rate']*100:.1f}% vs "
                    f"{after_win['win_rate']*100:.1f}% after wins). Consider cooldown after losses."
                )
    
    if not recommendations:
        recommendations.append("ℹ️ No significant patterns found. Current trading frequency appears neutral.")
    
    return recommendations


def print_analysis(analysis: Dict) -> None:
    """Print formatted analysis results."""
    print("\n" + "=" * 70)
    print("TRADE FREQUENCY ANALYSIS")
    print("=" * 70)
    
    # Summary
    summary = analysis.get("summary", {})
    print(f"\n📊 Summary")
    print(f"   Total trades: {summary.get('total_trades', 0)}")
    print(f"   Date range: {summary.get('date_range', 'N/A')}")
    print(f"   Avg gap between trades: {summary.get('avg_gap_minutes', 0):.1f} min")
    print(f"   Median gap: {summary.get('median_gap_minutes', 0):.1f} min")
    
    # Gap buckets
    print(f"\n📏 Performance by Time Gap Before Trade")
    print("-" * 50)
    gap_analysis = analysis.get("gap_buckets", {})
    for bucket, stats in gap_analysis.items():
        if stats.get("trades", 0) > 0:
            wr = stats.get("win_rate", 0) * 100
            emoji = "🟢" if wr >= 50 else "🟡" if wr >= 40 else "🔴"
            print(f"   {emoji} {bucket:12s}: {stats['trades']:4d} trades, {wr:5.1f}% WR, ${stats['pnl']:+7.2f}")
    
    # Activity analysis
    print(f"\n⏰ Performance by Trading Activity Level")
    print("-" * 50)
    activity = analysis.get("activity_analysis", {})
    for level, stats in activity.items():
        if level == "thresholds":
            continue
        if stats.get("trades", 0) > 0:
            wr = stats.get("win_rate", 0) * 100
            emoji = "🟢" if wr >= 50 else "🟡" if wr >= 40 else "🔴"
            print(f"   {emoji} {level:16s}: {stats['trades']:4d} trades, {wr:5.1f}% WR ({stats.get('label', '')})")
    
    # Consecutive results
    print(f"\n🔄 Performance by Previous Trade Result")
    print("-" * 50)
    consecutive = analysis.get("consecutive_results", {})
    for situation, stats in consecutive.items():
        if stats.get("trades", 0) > 0:
            wr = stats.get("win_rate", 0) * 100
            emoji = "🟢" if wr >= 50 else "🟡" if wr >= 40 else "🔴"
            print(f"   {emoji} {situation:16s}: {stats['trades']:4d} trades, {wr:5.1f}% WR")
    
    # Recommendations
    print(f"\n💡 Recommendations")
    print("-" * 50)
    for rec in analysis.get("recommendations", []):
        print(f"   {rec}")
    
    print("\n" + "=" * 70)


def main():
    parser = argparse.ArgumentParser(
        description="Analyze trade frequency impact on performance"
    )
    parser.add_argument("--days", type=int, default=90, help="Days of data to analyze (default: 90)")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")
    parser.add_argument("--json", action="store_true", help="Output JSON only")
    
    args = parser.parse_args()
    
    # Load trades
    trades = load_trades(args.days)
    
    if not trades:
        print("❌ No trades found")
        return
    
    print(f"📈 Loaded {len(trades)} trades from last {args.days} days")
    
    # Calculate gaps
    gaps = calculate_gaps(trades)
    
    # Run analysis
    analysis = {
        "timestamp": datetime.now().isoformat(),
        "days_analyzed": args.days,
        "summary": {
            "total_trades": len(trades),
            "date_range": f"{trades[0].get('_parsed_ts', '').strftime('%Y-%m-%d') if trades else ''} - {trades[-1].get('_parsed_ts', '').strftime('%Y-%m-%d') if trades else ''}",
            "total_gaps": len(gaps),
            "avg_gap_minutes": sum(gaps) / len(gaps) if gaps else 0,
            "median_gap_minutes": sorted(gaps)[len(gaps)//2] if gaps else 0,
            "min_gap_minutes": min(gaps) if gaps else 0,
            "max_gap_minutes": max(gaps) if gaps else 0,
        },
        "gap_buckets": analyze_by_gap_bucket(trades),
        "activity_analysis": analyze_by_hour_activity(trades),
        "consecutive_results": analyze_consecutive_results(trades),
    }
    
    # Generate recommendations
    analysis["recommendations"] = generate_recommendations(analysis)
    
    # Save results
    with open(OUTPUT_FILE, "w") as f:
        json.dump(analysis, f, indent=2, default=str)
    
    if args.json:
        print(json.dumps(analysis, indent=2, default=str))
    else:
        print_analysis(analysis)
        print(f"\n✅ Results saved to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
