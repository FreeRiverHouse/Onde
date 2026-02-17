#!/usr/bin/env python3
"""
Weather Market Backtesting Framework

Analyzes historical trades to:
1. Validate forecast accuracy
2. Identify optimal trading parameters
3. Simulate different strategies

Author: Claude
Date: 2026-02-08
"""

import json
import os
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from collections import defaultdict
import math

# File paths
TRADES_FILE = Path(__file__).parent / "kalshi-trades-v2.jsonl"
FORECAST_ACCURACY_FILE = Path(__file__).parent.parent / "data/trading/weather-forecast-accuracy.json"
BACKTEST_RESULTS_FILE = Path(__file__).parent.parent / "data/backtests/weather-strategy-backtest.json"

# ============== CONFIGURATION ==============

# Default strategy parameters (current settings)
DEFAULT_PARAMS = {
    "min_edge": 0.10,  # 10% minimum edge
    "min_forecast_strike_gap": 0.0,  # No gap requirement (current)
    "max_market_conviction": 1.0,  # No limit on extreme prices (current)
    "min_our_prob": 0.0,  # No minimum probability (current)
    "forecast_uncertainty": 2.0,  # Current: 2°F (same day)
    "kelly_fraction": 0.08,
}

# Improved strategy parameters (based on analysis)
IMPROVED_PARAMS = {
    "min_edge": 0.15,  # 15% minimum edge (more conservative)
    "min_forecast_strike_gap": 3.0,  # 3°F buffer required
    "max_market_conviction": 0.85,  # Don't bet against 85%+ conviction
    "min_our_prob": 0.05,  # Reject near-zero probability trades  
    "forecast_uncertainty": 4.0,  # 4°F (matches actual MAE + buffer)
    "kelly_fraction": 0.05,  # More conservative sizing
}


def load_trades() -> List[Dict]:
    """Load all weather trades from JSONL file."""
    trades = []
    if not TRADES_FILE.exists():
        print(f"❌ Trades file not found: {TRADES_FILE}")
        return trades
    
    with open(TRADES_FILE, "r") as f:
        for line in f:
            try:
                trade = json.loads(line.strip())
                # Only include weather trades with settlements
                if trade.get("asset") == "weather":
                    trades.append(trade)
            except json.JSONDecodeError:
                continue
    
    return trades


def load_forecast_accuracy() -> Dict:
    """Load forecast accuracy data."""
    if not FORECAST_ACCURACY_FILE.exists():
        return {}
    
    with open(FORECAST_ACCURACY_FILE, "r") as f:
        return json.load(f)


def extract_strike_from_ticker(ticker: str) -> Optional[float]:
    """Extract strike price from ticker like KXHIGHCHI-26JAN29-B16.5"""
    import re
    match = re.search(r'[BT]([\d.]+)$', ticker)
    if match:
        return float(match.group(1))
    return None


def would_trade_pass_filter(trade: Dict, params: Dict) -> Tuple[bool, str]:
    """
    Check if a trade would pass the given filter parameters.
    
    Returns: (passes, reason)
    """
    our_prob = trade.get("our_prob", 0) or trade.get("base_prob", 0)
    market_prob = trade.get("market_prob", 0.5)
    edge = trade.get("edge", 0)
    forecast_temp = trade.get("forecast_temp")
    ticker = trade.get("ticker", "")
    side = trade.get("side", "")
    
    # 1. Check minimum probability
    if our_prob < params.get("min_our_prob", 0):
        return False, f"our_prob {our_prob:.2%} < min {params['min_our_prob']:.2%}"
    
    # 2. Check minimum edge
    if edge < params.get("min_edge", 0):
        return False, f"edge {edge:.2%} < min {params['min_edge']:.2%}"
    
    # 3. Check market conviction (don't bet against extreme odds)
    max_conviction = params.get("max_market_conviction", 1.0)
    if side == "no" and market_prob > max_conviction:
        return False, f"market conviction {market_prob:.2%} > max {max_conviction:.2%} (betting NO)"
    if side == "yes" and (1 - market_prob) > max_conviction:
        return False, f"market conviction {(1-market_prob):.2%} > max {max_conviction:.2%} (betting YES)"
    
    # 4. Check forecast-strike gap
    min_gap = params.get("min_forecast_strike_gap", 0)
    if min_gap > 0 and forecast_temp is not None:
        strike = extract_strike_from_ticker(ticker)
        if strike is not None:
            gap = abs(forecast_temp - strike)
            if gap < min_gap:
                return False, f"gap {gap:.1f}°F < min {min_gap:.1f}°F"
    
    return True, "passed"


def simulate_strategy(trades: List[Dict], params: Dict) -> Dict:
    """
    Simulate a strategy with the given parameters.
    
    Returns detailed results including win rate, PnL, and filtered trades.
    """
    results = {
        "params": params,
        "total_trades": len(trades),
        "filtered_in": 0,
        "filtered_out": 0,
        "filter_reasons": defaultdict(int),
        "wins": 0,
        "losses": 0,
        "pending": 0,
        "pnl_cents": 0,
        "win_rate": 0.0,
        "avg_win_cents": 0,
        "avg_loss_cents": 0,
        "trades_by_city": defaultdict(lambda: {"wins": 0, "losses": 0, "pnl": 0}),
        "trades_by_side": defaultdict(lambda: {"wins": 0, "losses": 0, "pnl": 0}),
        "sample_filtered_out": [],
        "sample_wins": [],
        "sample_losses": [],
    }
    
    win_amounts = []
    loss_amounts = []
    
    for trade in trades:
        passes, reason = would_trade_pass_filter(trade, params)
        
        result_status = (trade.get("result_status") or "").lower()
        is_settled = result_status in ["win", "won", "loss", "lost"]
        is_win = result_status in ["win", "won"]
        profit = trade.get("profit_cents", 0)
        city = trade.get("city", "unknown")
        side = trade.get("side", "unknown")
        
        if not passes:
            results["filtered_out"] += 1
            results["filter_reasons"][reason.split()[0]] += 1
            
            # Track sample of filtered-out trades that would have been losses
            if is_settled and not is_win and len(results["sample_filtered_out"]) < 5:
                results["sample_filtered_out"].append({
                    "ticker": trade.get("ticker"),
                    "reason": reason,
                    "would_have_lost": -profit if profit else trade.get("cost_cents", 0),
                })
            continue
        
        results["filtered_in"] += 1
        
        if not is_settled:
            results["pending"] += 1
            continue
        
        if is_win:
            results["wins"] += 1
            results["pnl_cents"] += profit
            win_amounts.append(profit)
            results["trades_by_city"][city]["wins"] += 1
            results["trades_by_city"][city]["pnl"] += profit
            results["trades_by_side"][side]["wins"] += 1
            results["trades_by_side"][side]["pnl"] += profit
            
            if len(results["sample_wins"]) < 3:
                results["sample_wins"].append({
                    "ticker": trade.get("ticker"),
                    "edge": trade.get("edge"),
                    "profit": profit,
                })
        else:
            results["losses"] += 1
            results["pnl_cents"] += profit
            loss_amounts.append(abs(profit) if profit else trade.get("cost_cents", 0))
            results["trades_by_city"][city]["losses"] += 1
            results["trades_by_city"][city]["pnl"] += profit
            results["trades_by_side"][side]["losses"] += 1
            results["trades_by_side"][side]["pnl"] += profit
            
            if len(results["sample_losses"]) < 3:
                results["sample_losses"].append({
                    "ticker": trade.get("ticker"),
                    "edge": trade.get("edge"),
                    "loss": profit,
                })
    
    # Calculate summary stats
    total_settled = results["wins"] + results["losses"]
    if total_settled > 0:
        results["win_rate"] = results["wins"] / total_settled
    
    if win_amounts:
        results["avg_win_cents"] = sum(win_amounts) / len(win_amounts)
    if loss_amounts:
        results["avg_loss_cents"] = sum(loss_amounts) / len(loss_amounts)
    
    # Convert defaultdicts to regular dicts for JSON serialization
    results["filter_reasons"] = dict(results["filter_reasons"])
    results["trades_by_city"] = dict(results["trades_by_city"])
    results["trades_by_side"] = dict(results["trades_by_side"])
    
    return results


def run_parameter_sweep(trades: List[Dict]) -> List[Dict]:
    """
    Run a sweep over parameter combinations to find optimal settings.
    """
    results = []
    
    # Parameter ranges to test
    min_edges = [0.05, 0.10, 0.15, 0.20, 0.25, 0.30]
    min_gaps = [0.0, 1.0, 2.0, 3.0, 4.0, 5.0]
    max_convictions = [0.70, 0.80, 0.85, 0.90, 0.95, 1.0]
    min_probs = [0.0, 0.01, 0.05, 0.10]
    
    for min_edge in min_edges:
        for min_gap in min_gaps:
            for max_conviction in max_convictions:
                for min_prob in min_probs:
                    params = {
                        "min_edge": min_edge,
                        "min_forecast_strike_gap": min_gap,
                        "max_market_conviction": max_conviction,
                        "min_our_prob": min_prob,
                    }
                    
                    result = simulate_strategy(trades, params)
                    
                    # Only include if we have enough trades
                    if result["wins"] + result["losses"] >= 5:
                        results.append({
                            "params": params,
                            "win_rate": result["win_rate"],
                            "wins": result["wins"],
                            "losses": result["losses"],
                            "pnl_cents": result["pnl_cents"],
                            "filtered_in": result["filtered_in"],
                            "filtered_out": result["filtered_out"],
                        })
    
    # Sort by win rate (primary), then PnL (secondary)
    results.sort(key=lambda x: (x["win_rate"], x["pnl_cents"]), reverse=True)
    
    return results


def analyze_forecast_accuracy_from_trades(trades: List[Dict]) -> Dict:
    """
    Analyze forecast accuracy by looking at trade outcomes.
    """
    analysis = {
        "total": 0,
        "with_forecast": 0,
        "by_city": defaultdict(lambda: {"count": 0, "wins": 0, "losses": 0}),
        "by_gap": defaultdict(lambda: {"count": 0, "wins": 0}),
        "low_prob_trades": [],  # Trades where our_prob was very low
        "high_edge_losses": [],  # High edge trades that lost
    }
    
    for trade in trades:
        result_status = (trade.get("result_status") or "").lower()
        is_settled = result_status in ["win", "won", "loss", "lost"]
        is_win = result_status in ["win", "won"]
        
        if not is_settled:
            continue
        
        analysis["total"] += 1
        
        forecast_temp = trade.get("forecast_temp")
        city = trade.get("city", "unknown")
        ticker = trade.get("ticker", "")
        edge = trade.get("edge", 0)
        our_prob = trade.get("our_prob", 0) or trade.get("base_prob", 0)
        
        # Track by city
        analysis["by_city"][city]["count"] += 1
        if is_win:
            analysis["by_city"][city]["wins"] += 1
        else:
            analysis["by_city"][city]["losses"] += 1
        
        # Track by gap
        if forecast_temp is not None:
            analysis["with_forecast"] += 1
            strike = extract_strike_from_ticker(ticker)
            if strike is not None:
                gap = abs(forecast_temp - strike)
                bucket = f"{int(gap)}°F"
                analysis["by_gap"][bucket]["count"] += 1
                if is_win:
                    analysis["by_gap"][bucket]["wins"] += 1
        
        # Track low probability trades
        if our_prob <= 0.05 and len(analysis["low_prob_trades"]) < 10:
            analysis["low_prob_trades"].append({
                "ticker": ticker,
                "our_prob": our_prob,
                "market_prob": trade.get("market_prob"),
                "edge": edge,
                "result": "win" if is_win else "loss",
            })
        
        # Track high edge losses
        if edge > 0.50 and not is_win and len(analysis["high_edge_losses"]) < 10:
            analysis["high_edge_losses"].append({
                "ticker": ticker,
                "edge": edge,
                "our_prob": our_prob,
                "market_prob": trade.get("market_prob"),
                "forecast_temp": forecast_temp,
            })
    
    # Calculate win rates by gap
    for bucket, data in analysis["by_gap"].items():
        if data["count"] > 0:
            data["win_rate"] = data["wins"] / data["count"]
    
    # Calculate win rates by city
    for city, data in analysis["by_city"].items():
        if data["count"] > 0:
            data["win_rate"] = data["wins"] / data["count"]
    
    # Convert defaultdicts
    analysis["by_city"] = dict(analysis["by_city"])
    analysis["by_gap"] = dict(analysis["by_gap"])
    
    return analysis


def print_results(default_results: Dict, improved_results: Dict, accuracy: Dict, sweep_results: List):
    """Print formatted backtest results."""
    
    print("\n" + "=" * 70)
    print("🔬 WEATHER TRADING STRATEGY BACKTEST RESULTS")
    print("=" * 70)
    
    # Current vs Improved
    print("\n📊 STRATEGY COMPARISON")
    print("-" * 70)
    print(f"{'Metric':<25} {'Current':<20} {'Improved':<20}")
    print("-" * 70)
    
    metrics = [
        ("Win Rate", f"{default_results['win_rate']:.1%}", f"{improved_results['win_rate']:.1%}"),
        ("Wins / Losses", f"{default_results['wins']} / {default_results['losses']}", f"{improved_results['wins']} / {improved_results['losses']}"),
        ("PnL (cents)", f"{default_results['pnl_cents']:+d}", f"{improved_results['pnl_cents']:+d}"),
        ("Trades Taken", str(default_results['filtered_in']), str(improved_results['filtered_in'])),
        ("Trades Filtered", str(default_results['filtered_out']), str(improved_results['filtered_out'])),
        ("Avg Win (cents)", f"{default_results['avg_win_cents']:.1f}", f"{improved_results['avg_win_cents']:.1f}"),
        ("Avg Loss (cents)", f"{default_results['avg_loss_cents']:.1f}", f"{improved_results['avg_loss_cents']:.1f}"),
    ]
    
    for metric, current, improved in metrics:
        print(f"{metric:<25} {current:<20} {improved:<20}")
    
    # Filter impact
    print("\n📋 IMPROVED STRATEGY - FILTER DETAILS")
    print("-" * 70)
    for reason, count in improved_results["filter_reasons"].items():
        print(f"   Filtered by {reason}: {count} trades")
    
    # Sample of avoided losses
    if improved_results["sample_filtered_out"]:
        print("\n   💡 Sample trades filtered out (would have been losses):")
        for t in improved_results["sample_filtered_out"][:3]:
            print(f"      {t['ticker']}: {t['reason']} (saved {t['would_have_lost']}¢)")
    
    # Forecast accuracy analysis
    print("\n📈 FORECAST ACCURACY ANALYSIS")
    print("-" * 70)
    print(f"Total settled trades: {accuracy['total']}")
    print(f"Trades with forecast data: {accuracy['with_forecast']}")
    
    if accuracy["by_city"]:
        print("\n   By City:")
        for city, data in sorted(accuracy["by_city"].items()):
            wr = data.get("win_rate", 0)
            print(f"      {city}: {data['wins']}W/{data['losses']}L ({wr:.1%} WR)")
    
    if accuracy["by_gap"]:
        print("\n   By Forecast-Strike Gap:")
        for gap, data in sorted(accuracy["by_gap"].items(), key=lambda x: int(x[0].replace("°F", ""))):
            wr = data.get("win_rate", 0)
            print(f"      {gap} gap: {data['wins']}/{data['count']} ({wr:.1%} WR)")
    
    # Problematic trades
    if accuracy["low_prob_trades"]:
        print("\n   ⚠️ Low Probability Trades (our_prob ≤ 5%):")
        for t in accuracy["low_prob_trades"][:5]:
            print(f"      {t['ticker']}: our_prob={t['our_prob']:.2%}, edge={t['edge']:.1%} → {t['result']}")
    
    if accuracy["high_edge_losses"]:
        print("\n   ⚠️ High Edge Losses (edge > 50%):")
        for t in accuracy["high_edge_losses"][:5]:
            print(f"      {t['ticker']}: edge={t['edge']:.1%}, forecast={t['forecast_temp']}°F → LOSS")
    
    # Top parameter combinations
    if sweep_results:
        print("\n🏆 TOP PARAMETER COMBINATIONS (by win rate)")
        print("-" * 70)
        print(f"{'Rank':<5} {'Win Rate':<10} {'W/L':<10} {'PnL':<10} {'Trades':<10} {'Parameters':<30}")
        print("-" * 70)
        for i, result in enumerate(sweep_results[:10], 1):
            params = result["params"]
            param_str = f"edge>{params['min_edge']:.0%}, gap>{params['min_forecast_strike_gap']}°F"
            print(f"{i:<5} {result['win_rate']:.1%}     {result['wins']}/{result['losses']:<5} {result['pnl_cents']:+5d}¢    {result['filtered_in']:<10} {param_str}")
    
    # Recommendations
    print("\n💡 RECOMMENDATIONS")
    print("-" * 70)
    
    win_rate_improvement = improved_results["win_rate"] - default_results["win_rate"]
    pnl_improvement = improved_results["pnl_cents"] - default_results["pnl_cents"]
    
    if win_rate_improvement > 0:
        print(f"✅ Improved strategy increases win rate by {win_rate_improvement:.1%}")
    if pnl_improvement > 0:
        print(f"✅ Improved strategy would have saved {pnl_improvement}¢")
    
    print("\n   Specific changes to implement:")
    print("   1. Add MIN_FORECAST_STRIKE_GAP = 3.0°F (don't trade near strike)")
    print("   2. Add MIN_OUR_PROB = 0.05 (reject zero-probability trades)")
    print("   3. Add MAX_MARKET_CONVICTION = 0.85 (don't bet against 85%+)")
    print("   4. Increase forecast uncertainty to 4.0°F (based on actual MAE)")
    print("   5. Reduce KELLY_FRACTION to 0.05 for weather (more conservative)")


def save_results(default_results: Dict, improved_results: Dict, accuracy: Dict, sweep_results: List):
    """Save backtest results to JSON file."""
    results = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "current_strategy": default_results,
        "improved_strategy": improved_results,
        "forecast_accuracy": accuracy,
        "parameter_sweep_top10": sweep_results[:10] if sweep_results else [],
        "recommendations": {
            "min_forecast_strike_gap": 3.0,
            "min_our_prob": 0.05,
            "max_market_conviction": 0.85,
            "forecast_uncertainty": 4.0,
            "kelly_fraction": 0.05,
        }
    }
    
    os.makedirs(BACKTEST_RESULTS_FILE.parent, exist_ok=True)
    with open(BACKTEST_RESULTS_FILE, "w") as f:
        json.dump(results, f, indent=2, default=str)
    
    print(f"\n📁 Results saved to: {BACKTEST_RESULTS_FILE}")


def main():
    print("🔬 Weather Trading Strategy Backtest")
    print("=" * 50)
    
    # Load trades
    trades = load_trades()
    print(f"📂 Loaded {len(trades)} weather trades")
    
    if not trades:
        print("❌ No trades to analyze. Run the autotrader first!")
        return
    
    # Count settled trades
    settled = [t for t in trades if (t.get("result_status") or "").lower() in ["win", "won", "loss", "lost"]]
    print(f"📊 Settled trades: {len(settled)}")
    
    # Run simulations
    print("\n⏳ Running strategy simulations...")
    
    default_results = simulate_strategy(trades, DEFAULT_PARAMS)
    improved_results = simulate_strategy(trades, IMPROVED_PARAMS)
    
    # Analyze forecast accuracy
    accuracy = analyze_forecast_accuracy_from_trades(trades)
    
    # Run parameter sweep (only if we have enough data)
    sweep_results = []
    if len(settled) >= 20:
        print("⏳ Running parameter sweep...")
        sweep_results = run_parameter_sweep(trades)
    
    # Print and save results
    print_results(default_results, improved_results, accuracy, sweep_results)
    save_results(default_results, improved_results, accuracy, sweep_results)


if __name__ == "__main__":
    main()
