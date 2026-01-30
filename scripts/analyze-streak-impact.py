#!/usr/bin/env python3
"""
Analyze Streak Position vs Outcome Correlation (T775)

Compares performance based on streak context:
- Win rate by streak position (after_N_wins, after_N_losses, fresh_start)
- Tilt risk trades vs normal trades
- Hot hand trades vs normal trades
- Recommendations for adaptive position sizing

Usage: python3 scripts/analyze-streak-impact.py [--v2]
"""

import json
import argparse
from pathlib import Path
from datetime import datetime
from collections import defaultdict

def load_trades(v2=False):
    """Load trade log"""
    log_file = Path("scripts") / ("kalshi-trades-v2.jsonl" if v2 else "kalshi-trades.jsonl")
    trades = []
    
    if not log_file.exists():
        print(f"Trade log not found: {log_file}")
        return trades
    
    with open(log_file) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                trade = json.loads(line)
                # Only include settled trades (won/lost)
                if trade.get("result_status") in ("won", "lost"):
                    trades.append(trade)
            except json.JSONDecodeError:
                continue
    
    return trades

def calculate_pnl(trade):
    """Calculate PnL for a trade"""
    price = trade.get("price_cents", 0)
    contracts = trade.get("contracts", 0)
    result = trade.get("result_status", "pending")
    
    if result == "won":
        return (100 - price) * contracts
    elif result == "lost":
        return -price * contracts
    return 0

def parse_streak_context(context_str):
    """Parse streak context string into components"""
    if not context_str:
        return {"type": "unknown", "count": 0}
    
    if context_str == "fresh_start":
        return {"type": "fresh_start", "count": 0}
    elif context_str.startswith("after_"):
        # Format: after_N_wins or after_N_losses
        parts = context_str.split("_")
        if len(parts) >= 3:
            try:
                count = int(parts[1])
                outcome_type = parts[2]  # "wins" or "losses"
                return {"type": outcome_type.rstrip("s"), "count": count}
            except ValueError:
                pass
    
    return {"type": "unknown", "count": 0}

def analyze_by_streak_context(trades):
    """Analyze performance by streak context"""
    categories = defaultdict(lambda: {
        "trades": 0,
        "wins": 0,
        "losses": 0,
        "pnl_cents": 0,
        "total_cost": 0,
        "avg_edge": [],
        "tickers": defaultdict(int)
    })
    
    # Group by streak context
    for trade in trades:
        streak_ctx = trade.get("streak_context", "unknown")
        parsed = parse_streak_context(streak_ctx)
        
        # Category key: "after_N_win", "after_N_loss", "fresh_start", "unknown"
        if parsed["type"] == "fresh_start":
            cat = "fresh_start"
        elif parsed["type"] in ("win", "loss"):
            cat = f"after_{parsed['count']}_{parsed['type']}"
        else:
            cat = "unknown"
        
        categories[cat]["trades"] += 1
        categories[cat]["total_cost"] += trade.get("cost_cents", 0)
        categories[cat]["pnl_cents"] += calculate_pnl(trade)
        
        if trade.get("edge"):
            categories[cat]["avg_edge"].append(trade["edge"])
        
        if trade.get("result_status") == "won":
            categories[cat]["wins"] += 1
        else:
            categories[cat]["losses"] += 1
        
        # Track tickers
        ticker_base = trade.get("ticker", "unknown").split("-")[0]
        categories[cat]["tickers"][ticker_base] += 1
    
    return categories

def analyze_tilt_vs_normal(trades):
    """Compare tilt_risk trades vs normal trades"""
    tilt_trades = {"trades": 0, "wins": 0, "losses": 0, "pnl_cents": 0}
    normal_trades = {"trades": 0, "wins": 0, "losses": 0, "pnl_cents": 0}
    
    for trade in trades:
        tilt_risk = trade.get("tilt_risk", False)
        target = tilt_trades if tilt_risk else normal_trades
        
        target["trades"] += 1
        target["pnl_cents"] += calculate_pnl(trade)
        
        if trade.get("result_status") == "won":
            target["wins"] += 1
        else:
            target["losses"] += 1
    
    return {
        "tilt_risk": tilt_trades,
        "normal": normal_trades
    }

def analyze_hot_hand_vs_normal(trades):
    """Compare hot_hand trades vs normal trades"""
    hot_hand_trades = {"trades": 0, "wins": 0, "losses": 0, "pnl_cents": 0}
    normal_trades = {"trades": 0, "wins": 0, "losses": 0, "pnl_cents": 0}
    
    for trade in trades:
        hot_hand = trade.get("hot_hand", False)
        target = hot_hand_trades if hot_hand else normal_trades
        
        target["trades"] += 1
        target["pnl_cents"] += calculate_pnl(trade)
        
        if trade.get("result_status") == "won":
            target["wins"] += 1
        else:
            target["losses"] += 1
    
    return {
        "hot_hand": hot_hand_trades,
        "normal": normal_trades
    }

def win_rate(stats):
    """Calculate win rate from stats dict"""
    total = stats.get("trades", 0)
    if total == 0:
        return 0.0
    return stats.get("wins", 0) / total * 100

def generate_recommendations(streak_analysis, tilt_analysis, hot_hand_analysis):
    """Generate recommendations based on analysis"""
    recommendations = []
    
    # Check tilt risk impact
    tilt_wr = win_rate(tilt_analysis["tilt_risk"])
    normal_wr = win_rate(tilt_analysis["normal"])
    tilt_count = tilt_analysis["tilt_risk"]["trades"]
    
    if tilt_count >= 5:  # Need minimum sample
        if tilt_wr < normal_wr - 10:  # 10%+ worse
            recommendations.append({
                "priority": "HIGH",
                "category": "tilt_risk",
                "action": "Reduce position size when tilt_risk=True",
                "detail": f"Tilt trades win rate ({tilt_wr:.1f}%) is significantly lower than normal ({normal_wr:.1f}%)"
            })
        elif tilt_wr > normal_wr + 5:  # Surprisingly better
            recommendations.append({
                "priority": "INFO",
                "category": "tilt_risk",
                "action": "Tilt risk trading performing well - monitor for sustainability",
                "detail": f"Tilt trades win rate ({tilt_wr:.1f}%) is higher than normal ({normal_wr:.1f}%)"
            })
    
    # Check hot hand impact
    hot_wr = win_rate(hot_hand_analysis["hot_hand"])
    normal_hot_wr = win_rate(hot_hand_analysis["normal"])
    hot_count = hot_hand_analysis["hot_hand"]["trades"]
    
    if hot_count >= 5:
        if hot_wr < normal_hot_wr - 5:  # Hot hand underperforming
            recommendations.append({
                "priority": "MEDIUM",
                "category": "hot_hand",
                "action": "Consider reducing position size during winning streaks",
                "detail": f"Hot hand win rate ({hot_wr:.1f}%) lower than baseline ({normal_hot_wr:.1f}%) - possible regression to mean"
            })
    
    # Check streak patterns
    for ctx, stats in streak_analysis.items():
        if ctx == "unknown" or stats["trades"] < 3:
            continue
        
        ctx_wr = win_rate(stats)
        if ctx.startswith("after_") and "loss" in ctx:
            count = int(ctx.split("_")[1])
            if count >= 3 and ctx_wr < 40:
                recommendations.append({
                    "priority": "HIGH",
                    "category": "loss_streak",
                    "action": f"Consider pausing after {count}+ consecutive losses",
                    "detail": f"Win rate after {count} losses is only {ctx_wr:.1f}%"
                })
    
    if not recommendations:
        recommendations.append({
            "priority": "INFO",
            "category": "general",
            "action": "Insufficient streak data for strong recommendations",
            "detail": "Continue collecting data with streak_context to identify patterns"
        })
    
    return recommendations

def main():
    parser = argparse.ArgumentParser(description="Analyze streak position vs outcome correlation")
    parser.add_argument("--v2", action="store_true", help="Use v2 trade log")
    args = parser.parse_args()
    
    print("=" * 60)
    print("Streak Position vs Outcome Analysis (T775)")
    print("=" * 60)
    
    trades = load_trades(args.v2)
    
    if not trades:
        print("\n⚠️ No settled trades found.")
        print("Trades need result_status = 'won' or 'lost'")
        return
    
    print(f"\nTotal settled trades: {len(trades)}")
    
    # Count trades with streak data
    trades_with_streak = [t for t in trades if t.get("streak_context")]
    print(f"Trades with streak_context: {len(trades_with_streak)}")
    
    if not trades_with_streak:
        print("\n⚠️ No trades have streak_context data yet.")
        print("This data is added by the v2 autotrader (T770).")
        print("Continue trading to collect streak data.")
        
        # Still save empty report
        report = {
            "generated": datetime.now().isoformat(),
            "total_trades": len(trades),
            "trades_with_streak_data": 0,
            "status": "awaiting_data",
            "recommendations": [{
                "priority": "INFO",
                "category": "general",
                "action": "Continue collecting data with streak_context",
                "detail": "Streak analysis requires trades with streak_context field from v2 autotrader"
            }]
        }
        
        output_path = Path("data/trading/streak-impact-analysis.json")
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "w") as f:
            json.dump(report, f, indent=2)
        print(f"\nEmpty report saved to: {output_path}")
        return
    
    # Analyze by streak context
    print("\n" + "-" * 40)
    print("Analysis by Streak Context")
    print("-" * 40)
    
    streak_analysis = analyze_by_streak_context(trades_with_streak)
    
    for ctx, stats in sorted(streak_analysis.items(), key=lambda x: x[1]["trades"], reverse=True):
        if stats["trades"] == 0:
            continue
        wr = win_rate(stats)
        roi = stats["pnl_cents"] / max(stats["total_cost"], 1) * 100
        avg_edge = sum(stats["avg_edge"]) / len(stats["avg_edge"]) if stats["avg_edge"] else 0
        
        print(f"\n{ctx}:")
        print(f"  Trades: {stats['trades']} ({stats['wins']}W / {stats['losses']}L)")
        print(f"  Win Rate: {wr:.1f}%")
        print(f"  PnL: ${stats['pnl_cents']/100:.2f} (ROI: {roi:.1f}%)")
        print(f"  Avg Edge: {avg_edge:.1%}")
    
    # Analyze tilt risk
    print("\n" + "-" * 40)
    print("Tilt Risk Analysis")
    print("-" * 40)
    
    tilt_analysis = analyze_tilt_vs_normal(trades_with_streak)
    
    for category, stats in tilt_analysis.items():
        if stats["trades"] == 0:
            print(f"\n{category}: No trades")
            continue
        wr = win_rate(stats)
        print(f"\n{category}:")
        print(f"  Trades: {stats['trades']} ({stats['wins']}W / {stats['losses']}L)")
        print(f"  Win Rate: {wr:.1f}%")
        print(f"  PnL: ${stats['pnl_cents']/100:.2f}")
    
    # Analyze hot hand
    print("\n" + "-" * 40)
    print("Hot Hand Analysis")
    print("-" * 40)
    
    hot_hand_analysis = analyze_hot_hand_vs_normal(trades_with_streak)
    
    for category, stats in hot_hand_analysis.items():
        if stats["trades"] == 0:
            print(f"\n{category}: No trades")
            continue
        wr = win_rate(stats)
        print(f"\n{category}:")
        print(f"  Trades: {stats['trades']} ({stats['wins']}W / {stats['losses']}L)")
        print(f"  Win Rate: {wr:.1f}%")
        print(f"  PnL: ${stats['pnl_cents']/100:.2f}")
    
    # Generate recommendations
    print("\n" + "-" * 40)
    print("Recommendations")
    print("-" * 40)
    
    recommendations = generate_recommendations(streak_analysis, tilt_analysis, hot_hand_analysis)
    
    for rec in recommendations:
        emoji = {"HIGH": "🚨", "MEDIUM": "⚠️", "INFO": "ℹ️"}.get(rec["priority"], "•")
        print(f"\n{emoji} [{rec['priority']}] {rec['category']}")
        print(f"   Action: {rec['action']}")
        print(f"   Detail: {rec['detail']}")
    
    # Save report
    report = {
        "generated": datetime.now().isoformat(),
        "total_trades": len(trades),
        "trades_with_streak_data": len(trades_with_streak),
        "streak_analysis": {
            ctx: {
                "trades": s["trades"],
                "wins": s["wins"],
                "losses": s["losses"],
                "win_rate": win_rate(s),
                "pnl_cents": s["pnl_cents"],
                "roi": s["pnl_cents"] / max(s["total_cost"], 1) * 100
            }
            for ctx, s in streak_analysis.items() if s["trades"] > 0
        },
        "tilt_analysis": {
            cat: {
                "trades": s["trades"],
                "wins": s["wins"],
                "losses": s["losses"],
                "win_rate": win_rate(s),
                "pnl_cents": s["pnl_cents"]
            }
            for cat, s in tilt_analysis.items()
        },
        "hot_hand_analysis": {
            cat: {
                "trades": s["trades"],
                "wins": s["wins"],
                "losses": s["losses"],
                "win_rate": win_rate(s),
                "pnl_cents": s["pnl_cents"]
            }
            for cat, s in hot_hand_analysis.items()
        },
        "recommendations": recommendations
    }
    
    output_path = Path("data/trading/streak-impact-analysis.json")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(report, f, indent=2)
    
    print(f"\n✅ Report saved to: {output_path}")

if __name__ == "__main__":
    main()
