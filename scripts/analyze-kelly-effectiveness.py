#!/usr/bin/env python3
"""
Analyze Kelly Criterion effectiveness for Kalshi trading.

Tracks:
- Actual bet sizes vs theoretical Kelly optimal
- Win rate by position size bucket
- Bankroll growth under different Kelly fractions
- Recommends Kelly fraction adjustments

Usage: python3 analyze-kelly-effectiveness.py [--trades-file FILE]
"""

import json
import argparse
from pathlib import Path
from datetime import datetime, timedelta
from collections import defaultdict
import math

# Current Kelly parameters from autotrader
CURRENT_KELLY = 0.05  # 5% Kelly fraction


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


def calculate_theoretical_kelly(win_rate: float, win_payout: float, loss_payout: float) -> float:
    """
    Calculate optimal Kelly fraction.
    
    Kelly% = (bp - q) / b
    where:
    - b = odds received on win (decimal)
    - p = probability of win
    - q = probability of loss (1 - p)
    """
    if win_rate <= 0 or win_rate >= 1:
        return 0
    
    p = win_rate
    q = 1 - p
    
    # For binary options: win pays (100-price)/price, loss pays -1
    # b = expected payoff ratio
    b = win_payout / loss_payout if loss_payout > 0 else 1
    
    kelly = (b * p - q) / b
    return max(0, kelly)


def analyze_trades(trades: list) -> dict:
    """Analyze Kelly effectiveness from trade data."""
    results = {
        "total_trades": len(trades),
        "trades_with_settlement": 0,
        "by_size_bucket": defaultdict(lambda: {"trades": 0, "wins": 0, "pnl": 0}),
        "kelly_vs_actual": [],
        "bankroll_simulation": {},
        "recommendations": []
    }
    
    # Filter trades with settlement results
    settled_trades = [t for t in trades if t.get("result_status") in ["won", "lost"]]
    results["trades_with_settlement"] = len(settled_trades)
    
    if not settled_trades:
        results["recommendations"].append("No settled trades yet - need more data")
        return results
    
    # Overall stats
    wins = sum(1 for t in settled_trades if t.get("result_status") == "won")
    actual_win_rate = wins / len(settled_trades) if settled_trades else 0
    results["actual_win_rate"] = actual_win_rate
    
    # Calculate theoretical Kelly for actual win rate
    # Assume average price of 50 cents (1:1 payout)
    avg_price = sum(t.get("price", 50) for t in settled_trades) / len(settled_trades)
    win_payout = (100 - avg_price) / avg_price  # Profit ratio on win
    loss_payout = 1.0  # Lose full stake on loss
    
    theoretical_kelly = calculate_theoretical_kelly(actual_win_rate, win_payout, loss_payout)
    results["theoretical_kelly"] = theoretical_kelly
    results["current_kelly"] = CURRENT_KELLY
    results["avg_price"] = avg_price
    
    # Bucket trades by position size
    size_buckets = [(0, 10), (10, 25), (25, 50), (50, 100), (100, float('inf'))]
    bucket_labels = ["tiny (0-10¢)", "small (10-25¢)", "medium (25-50¢)", "large (50-100¢)", "xlarge (100¢+)"]
    
    for trade in settled_trades:
        cost = trade.get("cost_cents", 0) or trade.get("price", 0) * trade.get("contracts", 1)
        won = trade.get("result_status") == "won"
        price = trade.get("price", 50)
        contracts = trade.get("contracts", 1)
        
        # Calculate PnL
        if won:
            pnl = (100 - price) * contracts
        else:
            pnl = -price * contracts
        
        # Find bucket
        for i, (low, high) in enumerate(size_buckets):
            if low <= cost < high:
                label = bucket_labels[i]
                results["by_size_bucket"][label]["trades"] += 1
                if won:
                    results["by_size_bucket"][label]["wins"] += 1
                results["by_size_bucket"][label]["pnl"] += pnl
                break
    
    # Calculate win rate per bucket
    for label, data in results["by_size_bucket"].items():
        if data["trades"] > 0:
            data["win_rate"] = data["wins"] / data["trades"]
        else:
            data["win_rate"] = 0
    
    # Simulate bankroll growth under different Kelly fractions
    kelly_fractions = [0.01, 0.025, 0.05, 0.10, 0.15, 0.20, 0.25]
    initial_bankroll = 100  # $100 starting
    
    for kf in kelly_fractions:
        bankroll = initial_bankroll
        peak = bankroll
        max_drawdown = 0
        
        for trade in settled_trades:
            price = trade.get("price", 50)
            edge = trade.get("edge", 0.10)  # Assume 10% edge if not recorded
            won = trade.get("result_status") == "won"
            
            # Calculate bet size using this Kelly fraction
            bet = bankroll * kf * edge
            bet = max(0.05, min(bet, bankroll * 0.10))  # Cap at 10% of bankroll
            
            if won:
                bankroll += bet * (100 - price) / price
            else:
                bankroll -= bet
            
            # Track drawdown
            if bankroll > peak:
                peak = bankroll
            drawdown = (peak - bankroll) / peak if peak > 0 else 0
            max_drawdown = max(max_drawdown, drawdown)
        
        results["bankroll_simulation"][f"{kf:.0%}"] = {
            "final_bankroll": round(bankroll, 2),
            "return": round((bankroll - initial_bankroll) / initial_bankroll * 100, 1),
            "max_drawdown": round(max_drawdown * 100, 1)
        }
    
    # Generate recommendations
    if theoretical_kelly <= 0:
        results["recommendations"].append(
            f"⚠️ Negative expected value: win rate ({actual_win_rate:.1%}) too low for profitable Kelly betting"
        )
    elif theoretical_kelly < CURRENT_KELLY:
        results["recommendations"].append(
            f"⬇️ Consider reducing Kelly from {CURRENT_KELLY:.0%} to {theoretical_kelly:.1%} "
            f"(actual win rate {actual_win_rate:.1%} suggests lower edge)"
        )
    elif theoretical_kelly > CURRENT_KELLY * 2:
        results["recommendations"].append(
            f"⬆️ Could increase Kelly from {CURRENT_KELLY:.0%} to {min(theoretical_kelly * 0.5, 0.15):.1%} "
            f"(conservative increase based on {actual_win_rate:.1%} win rate)"
        )
    else:
        results["recommendations"].append(
            f"✅ Current Kelly ({CURRENT_KELLY:.0%}) is appropriate for {actual_win_rate:.1%} win rate"
        )
    
    # Best performing bucket
    best_bucket = max(
        results["by_size_bucket"].items(),
        key=lambda x: x[1]["win_rate"] if x[1]["trades"] >= 5 else 0,
        default=(None, None)
    )
    if best_bucket[0] and best_bucket[1]["trades"] >= 5:
        results["recommendations"].append(
            f"📊 Best performing size: {best_bucket[0]} "
            f"({best_bucket[1]['win_rate']:.0%} WR, {best_bucket[1]['trades']} trades)"
        )
    
    return results


def print_report(results: dict):
    """Print formatted analysis report."""
    print("\n" + "="*60)
    print("📊 KELLY CRITERION EFFECTIVENESS ANALYSIS")
    print("="*60)
    
    print(f"\n📈 OVERVIEW")
    print(f"   Total trades: {results['total_trades']}")
    print(f"   Settled trades: {results['trades_with_settlement']}")
    
    if "actual_win_rate" in results:
        print(f"   Actual win rate: {results['actual_win_rate']:.1%}")
        print(f"   Average price: {results['avg_price']:.0f}¢")
        print(f"\n⚡ KELLY COMPARISON")
        print(f"   Current Kelly fraction: {results['current_kelly']:.0%}")
        print(f"   Theoretical optimal Kelly: {results['theoretical_kelly']:.1%}")
        
        if results['theoretical_kelly'] > 0:
            ratio = results['current_kelly'] / results['theoretical_kelly']
            print(f"   Current vs optimal ratio: {ratio:.2f}x")
    
    if results["by_size_bucket"]:
        print(f"\n📊 PERFORMANCE BY POSITION SIZE")
        print("-"*50)
        for label, data in sorted(results["by_size_bucket"].items(), key=lambda x: x[1]["trades"], reverse=True):
            if data["trades"] > 0:
                print(f"   {label}:")
                print(f"      Trades: {data['trades']}, Win rate: {data['win_rate']:.0%}, PnL: {data['pnl']:+.0f}¢")
    
    if results["bankroll_simulation"]:
        print(f"\n💰 BANKROLL SIMULATION ($100 initial)")
        print("-"*50)
        for kf, sim in sorted(results["bankroll_simulation"].items()):
            arrow = "📈" if sim['return'] > 0 else "📉"
            print(f"   {kf} Kelly: ${sim['final_bankroll']:.2f} ({sim['return']:+.1f}%) | Max DD: {sim['max_drawdown']:.1f}%  {arrow}")
    
    if results["recommendations"]:
        print(f"\n💡 RECOMMENDATIONS")
        print("-"*50)
        for rec in results["recommendations"]:
            print(f"   {rec}")
    
    print("\n" + "="*60)


def main():
    parser = argparse.ArgumentParser(description="Analyze Kelly criterion effectiveness")
    parser.add_argument("--trades-file", type=Path, 
                       default=Path(__file__).parent / "kalshi-trades.jsonl",
                       help="Path to trades JSONL file")
    parser.add_argument("--output", type=Path,
                       help="Output JSON file path")
    args = parser.parse_args()
    
    # Also check v2 trades file
    v2_file = args.trades_file.parent / "kalshi-trades-v2.jsonl"
    
    trades = load_trades(args.trades_file)
    if v2_file.exists():
        v2_trades = load_trades(v2_file)
        if v2_trades:
            print(f"📥 Loaded {len(trades)} v1 trades + {len(v2_trades)} v2 trades")
            trades.extend(v2_trades)
    else:
        print(f"📥 Loaded {len(trades)} trades")
    
    results = analyze_trades(trades)
    print_report(results)
    
    # Save output
    if args.output:
        output_path = args.output
    else:
        output_path = Path(__file__).parent.parent / "data" / "trading" / "kelly-analysis.json"
    
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Convert defaultdict for JSON serialization
    results["by_size_bucket"] = dict(results["by_size_bucket"])
    
    with open(output_path, "w") as f:
        json.dump(results, f, indent=2, default=str)
    
    print(f"\n💾 Analysis saved to: {output_path}")


if __name__ == "__main__":
    main()
