#!/usr/bin/env python3
"""
Position Sizing Comparison: Fixed vs Kelly

Analyzes historical trades to compare:
1. Actual Kelly-based position sizing
2. Fixed position sizing ($1, $2, $5)
3. Half-Kelly sizing
4. Risk-adjusted returns for each approach

Usage: python3 scripts/analyze-position-sizing.py [--v2] [--fixed-size N]
"""

import json
import argparse
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any
import math

# Trade log files
TRADE_LOG_V1 = Path("scripts/kalshi-trades.jsonl")
TRADE_LOG_V2 = Path("scripts/kalshi-trades-v2.jsonl")

def load_trades(use_v2: bool = False) -> List[Dict]:
    """Load trades from log file"""
    log_file = TRADE_LOG_V2 if use_v2 else TRADE_LOG_V1
    
    if not log_file.exists():
        print(f"⚠️  Trade log not found: {log_file}")
        return []
    
    trades = []
    with open(log_file) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                trade = json.loads(line)
                # Only include actual trades (not opportunities/skips)
                if trade.get("type") == "trade" or "result_status" in trade or "contracts" in trade:
                    trades.append(trade)
            except json.JSONDecodeError:
                continue
    
    return trades


def calculate_kelly_fraction(edge: float, win_prob: float) -> float:
    """
    Calculate optimal Kelly fraction
    
    Kelly formula: f = (bp - q) / b
    where:
      b = net odds received on winning bet (payout / risk)
      p = probability of winning
      q = probability of losing (1 - p)
    
    For binary options with 100¢ payout:
      f = (edge / potential_profit) where edge = p - implied_prob
    """
    if edge <= 0 or win_prob <= 0 or win_prob >= 1:
        return 0
    
    # Simplified Kelly for binary options
    # f = edge / (1 - win_prob) with caps
    kelly = edge / (1 - win_prob) if win_prob < 1 else 0
    return min(max(kelly, 0), 0.25)  # Cap at 25%


def simulate_strategies(trades: List[Dict], bankroll: float = 100.0, fixed_sizes: List[float] = [1, 2, 5]) -> Dict[str, Any]:
    """
    Simulate different position sizing strategies on historical trades
    
    Returns performance metrics for each strategy
    """
    if not trades:
        return {}
    
    # Initialize strategy trackers
    strategies = {
        "kelly": {"bankroll": bankroll, "trades": [], "name": "Full Kelly"},
        "half_kelly": {"bankroll": bankroll, "trades": [], "name": "Half Kelly"},
        "quarter_kelly": {"bankroll": bankroll, "trades": [], "name": "Quarter Kelly"},
    }
    
    for size in fixed_sizes:
        strategies[f"fixed_{size}"] = {
            "bankroll": bankroll,
            "trades": [],
            "name": f"Fixed ${size}"
        }
    
    # Process each trade
    for trade in trades:
        edge = trade.get("edge", 0)
        win_prob = trade.get("our_prob", 0.5)
        price = trade.get("price", 50) / 100  # Convert to decimal
        contracts = trade.get("contracts", 1)
        
        # Determine if trade won
        won = trade.get("result_status") == "won"
        side = trade.get("side", "no").lower()
        
        # Calculate actual trade cost and profit/loss
        actual_cost = price * contracts
        if won:
            actual_pnl = (1 - price) * contracts if side == "yes" else price * contracts
        else:
            actual_pnl = -actual_cost
        
        # Calculate Kelly fraction
        kelly_frac = calculate_kelly_fraction(edge, win_prob)
        
        for strat_key, strat in strategies.items():
            current_bankroll = strat["bankroll"]
            
            # Determine position size based on strategy
            if strat_key == "kelly":
                position_frac = kelly_frac
            elif strat_key == "half_kelly":
                position_frac = kelly_frac * 0.5
            elif strat_key == "quarter_kelly":
                position_frac = kelly_frac * 0.25
            else:
                # Fixed sizing
                fixed_amount = float(strat_key.split("_")[1])
                position_frac = min(fixed_amount / current_bankroll, 0.25) if current_bankroll > 0 else 0
            
            # Calculate position size
            position_size = current_bankroll * position_frac
            position_size = min(position_size, current_bankroll)  # Can't bet more than bankroll
            
            # Calculate contracts based on position size
            if position_size > 0 and price > 0:
                sim_contracts = position_size / price
                sim_cost = price * sim_contracts
                
                if won:
                    sim_pnl = (1 - price) * sim_contracts if side == "yes" else price * sim_contracts
                else:
                    sim_pnl = -sim_cost
            else:
                sim_contracts = 0
                sim_pnl = 0
            
            # Update strategy bankroll
            strat["bankroll"] += sim_pnl
            strat["trades"].append({
                "pnl": sim_pnl,
                "position_size": position_size,
                "contracts": sim_contracts,
                "bankroll_after": strat["bankroll"],
                "won": won
            })
    
    return strategies


def calculate_metrics(strategies: Dict[str, Any], initial_bankroll: float = 100.0) -> Dict[str, Dict]:
    """Calculate performance metrics for each strategy"""
    results = {}
    
    for strat_key, strat in strategies.items():
        trades = strat["trades"]
        if not trades:
            continue
        
        final_bankroll = strat["bankroll"]
        total_return = (final_bankroll - initial_bankroll) / initial_bankroll * 100
        
        # Win rate
        wins = sum(1 for t in trades if t["won"])
        win_rate = wins / len(trades) * 100 if trades else 0
        
        # PnL stats
        pnls = [t["pnl"] for t in trades]
        total_pnl = sum(pnls)
        avg_pnl = total_pnl / len(pnls) if pnls else 0
        
        # Risk metrics
        bankroll_history = [initial_bankroll] + [t["bankroll_after"] for t in trades]
        peak = initial_bankroll
        max_drawdown = 0
        for b in bankroll_history:
            peak = max(peak, b)
            drawdown = (peak - b) / peak if peak > 0 else 0
            max_drawdown = max(max_drawdown, drawdown)
        
        # Sharpe-like ratio (returns / volatility)
        if len(pnls) > 1:
            import statistics
            pnl_std = statistics.stdev(pnls)
            sharpe = avg_pnl / pnl_std if pnl_std > 0 else 0
        else:
            sharpe = 0
        
        # Average position size
        avg_position = sum(t["position_size"] for t in trades) / len(trades) if trades else 0
        
        results[strat_key] = {
            "name": strat["name"],
            "final_bankroll": round(final_bankroll, 2),
            "total_return_pct": round(total_return, 2),
            "total_pnl": round(total_pnl, 2),
            "avg_pnl_per_trade": round(avg_pnl, 4),
            "win_rate_pct": round(win_rate, 1),
            "max_drawdown_pct": round(max_drawdown * 100, 1),
            "sharpe_ratio": round(sharpe, 3),
            "avg_position_size": round(avg_position, 2),
            "total_trades": len(trades)
        }
    
    return results


def print_report(results: Dict[str, Dict], use_v2: bool):
    """Print comparison report"""
    print("\n" + "=" * 70)
    print("📊 Position Sizing Strategy Comparison")
    print(f"   Data source: {'V2 (improved model)' if use_v2 else 'V1 (legacy model)'}")
    print("=" * 70)
    
    if not results:
        print("\n⚠️  No trade data available for analysis")
        return
    
    # Sort by total return
    sorted_results = sorted(results.items(), key=lambda x: x[1]["total_return_pct"], reverse=True)
    
    print(f"\n{'Strategy':<15} {'Final $':<10} {'Return %':<10} {'Win %':<8} {'Max DD':<8} {'Sharpe':<8} {'Avg Bet':<8}")
    print("-" * 70)
    
    for strat_key, metrics in sorted_results:
        name = metrics["name"][:14]
        final = f"${metrics['final_bankroll']:.2f}"
        ret = f"{metrics['total_return_pct']:+.1f}%"
        win = f"{metrics['win_rate_pct']:.0f}%"
        dd = f"{metrics['max_drawdown_pct']:.1f}%"
        sharpe = f"{metrics['sharpe_ratio']:.2f}"
        avg_bet = f"${metrics['avg_position_size']:.2f}"
        
        print(f"{name:<15} {final:<10} {ret:<10} {win:<8} {dd:<8} {sharpe:<8} {avg_bet:<8}")
    
    # Best strategy analysis
    print("\n" + "-" * 70)
    best = sorted_results[0]
    worst = sorted_results[-1]
    
    print(f"\n🏆 Best: {best[1]['name']} ({best[1]['total_return_pct']:+.1f}% return)")
    print(f"💀 Worst: {worst[1]['name']} ({worst[1]['total_return_pct']:+.1f}% return)")
    
    # Kelly vs Fixed comparison
    kelly_result = results.get("kelly", {})
    fixed_2_result = results.get("fixed_2", {})
    
    if kelly_result and fixed_2_result:
        kelly_better = kelly_result["total_return_pct"] > fixed_2_result["total_return_pct"]
        diff = abs(kelly_result["total_return_pct"] - fixed_2_result["total_return_pct"])
        
        print(f"\n📈 Kelly vs Fixed $2: {'Kelly wins' if kelly_better else 'Fixed wins'} by {diff:.1f}%")
        
        if kelly_result["max_drawdown_pct"] < fixed_2_result["max_drawdown_pct"]:
            print("   Kelly also has lower max drawdown (better risk management)")
        else:
            print("   But Fixed has lower max drawdown (more stable)")
    
    # Recommendation
    print("\n💡 Recommendation:")
    if results.get("half_kelly", {}).get("sharpe_ratio", 0) > results.get("kelly", {}).get("sharpe_ratio", 0):
        print("   Half-Kelly provides best risk-adjusted returns (higher Sharpe)")
    elif results.get("quarter_kelly", {}).get("sharpe_ratio", 0) > results.get("kelly", {}).get("sharpe_ratio", 0):
        print("   Quarter-Kelly provides best risk-adjusted returns")
    else:
        print("   Full Kelly maximizes growth but consider half-Kelly for lower variance")
    
    print("\n" + "=" * 70)


def save_results(results: Dict, use_v2: bool):
    """Save results to JSON"""
    output_dir = Path("data/trading")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    output_file = output_dir / f"position-sizing-comparison{'_v2' if use_v2 else ''}.json"
    
    with open(output_file, "w") as f:
        json.dump({
            "generated_at": datetime.now().isoformat(),
            "model_version": "v2" if use_v2 else "v1",
            "strategies": results
        }, f, indent=2)
    
    print(f"\n💾 Results saved to: {output_file}")


def main():
    parser = argparse.ArgumentParser(description="Compare position sizing strategies")
    parser.add_argument("--v2", action="store_true", help="Use V2 trade log")
    parser.add_argument("--fixed-sizes", type=str, default="1,2,5", 
                        help="Comma-separated fixed bet sizes to compare")
    parser.add_argument("--bankroll", type=float, default=100.0,
                        help="Starting bankroll for simulation")
    args = parser.parse_args()
    
    fixed_sizes = [float(x) for x in args.fixed_sizes.split(",")]
    
    # Load trades
    trades = load_trades(args.v2)
    
    if not trades:
        print(f"⚠️  No trades found in {'V2' if args.v2 else 'V1'} log")
        print("   Run autotrader to generate trade data first")
        return
    
    print(f"📂 Loaded {len(trades)} trades from {'V2' if args.v2 else 'V1'} log")
    
    # Simulate strategies
    strategies = simulate_strategies(trades, args.bankroll, fixed_sizes)
    
    # Calculate metrics
    results = calculate_metrics(strategies, args.bankroll)
    
    # Print report
    print_report(results, args.v2)
    
    # Save results
    save_results(results, args.v2)


if __name__ == "__main__":
    main()
