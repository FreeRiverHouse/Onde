#!/usr/bin/env python3
"""
Backtesting Framework for Crypto Trading Strategy
T774: Proper backtesting framework for crypto trades

Uses OHLC cache data to simulate historical trading scenarios and
compare against actual settlement prices.

Features:
- Load historical OHLC data from cache
- Replay historical price scenarios
- Apply trading strategy logic (momentum, RSI, edge calculation)
- Track what trades WOULD have been taken and outcomes
- Compare against actual settlements
- Generate performance report

Usage:
    python backtest-crypto-strategy.py                    # Default backtest
    python backtest-crypto-strategy.py --asset btc        # BTC only
    python backtest-crypto-strategy.py --days 30          # Last 30 days
    python backtest-crypto-strategy.py --edge-min 5       # Min edge threshold
    python backtest-crypto-strategy.py --verbose          # Detailed output
"""

import json
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional
import argparse

# Add parent dir to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

# Directories
SCRIPT_DIR = Path(__file__).parent
DATA_DIR = SCRIPT_DIR.parent / "data"
OHLC_DIR = DATA_DIR / "ohlc"
TRADING_DIR = DATA_DIR / "trading"
BACKTEST_DIR = DATA_DIR / "backtests"

# Ensure output dir exists
BACKTEST_DIR.mkdir(parents=True, exist_ok=True)


def load_ohlc_data(asset: str) -> list:
    """Load OHLC candles from cache."""
    filename = f"{asset.lower()}-ohlc.json"
    cache_path = OHLC_DIR / filename
    
    if not cache_path.exists():
        print(f"[WARN] No OHLC cache found for {asset}")
        return []
    
    try:
        with open(cache_path) as f:
            data = json.load(f)
        return data.get("candles", [])
    except Exception as e:
        print(f"[ERROR] Failed to load OHLC for {asset}: {e}")
        return []


def load_historical_trades() -> list:
    """Load all historical trades from JSONL files."""
    trades = []
    trade_files = sorted(TRADING_DIR.glob("kalshi-trades-*.jsonl"))
    
    for file_path in trade_files:
        if "latest" in file_path.name:
            continue
        try:
            with open(file_path) as f:
                for line in f:
                    line = line.strip()
                    if line:
                        trade = json.loads(line)
                        trades.append(trade)
        except Exception as e:
            print(f"[WARN] Failed to load {file_path}: {e}")
    
    return trades


def calculate_rsi(closes: list, period: int = 14) -> list:
    """Calculate RSI from close prices."""
    if len(closes) < period + 1:
        return [None] * len(closes)
    
    deltas = [closes[i] - closes[i-1] for i in range(1, len(closes))]
    
    gains = [d if d > 0 else 0 for d in deltas]
    losses = [-d if d < 0 else 0 for d in deltas]
    
    rsi_values = [None] * (period + 1)
    
    avg_gain = sum(gains[:period]) / period
    avg_loss = sum(losses[:period]) / period
    
    for i in range(period, len(deltas)):
        avg_gain = (avg_gain * (period - 1) + gains[i]) / period
        avg_loss = (avg_loss * (period - 1) + losses[i]) / period
        
        if avg_loss == 0:
            rsi = 100.0
        else:
            rs = avg_gain / avg_loss
            rsi = 100 - (100 / (1 + rs))
        
        rsi_values.append(rsi)
    
    return rsi_values


def calculate_momentum(candles: list, lookback: int = 4) -> str:
    """Calculate momentum direction from candles."""
    if len(candles) < lookback:
        return "unknown"
    
    recent = candles[-lookback:]
    first_close = recent[0].get("close", 0)
    last_close = recent[-1].get("close", 0)
    
    if first_close == 0:
        return "unknown"
    
    change_pct = ((last_close - first_close) / first_close) * 100
    
    if change_pct > 1:
        return "bullish"
    elif change_pct < -1:
        return "bearish"
    else:
        return "neutral"


def simulate_trade_decision(
    asset: str,
    candles: list,
    index: int,
    edge_min: float,
    rsi_oversold: float = 30,
    rsi_overbought: float = 70
) -> Optional[dict]:
    """
    Simulate trade decision at a specific point in history.
    
    Returns dict with trade details if a trade would be taken, None otherwise.
    """
    if index < 14:  # Need enough history for RSI
        return None
    
    current = candles[index]
    historical = candles[:index + 1]
    
    closes = [c.get("close", 0) for c in historical]
    rsi_values = calculate_rsi(closes)
    current_rsi = rsi_values[-1] if rsi_values else None
    
    momentum = calculate_momentum(historical)
    
    # Simulated edge calculation
    base_edge = 2.0  # Base edge
    
    # RSI adjustments
    rsi_edge_adj = 0
    if current_rsi:
        if current_rsi < rsi_oversold:
            rsi_edge_adj = 3.0  # Strong buy signal
        elif current_rsi > rsi_overbought:
            rsi_edge_adj = -3.0  # Strong sell signal
        elif current_rsi < 40:
            rsi_edge_adj = 1.5
        elif current_rsi > 60:
            rsi_edge_adj = -1.5
    
    # Momentum adjustment
    momentum_adj = 0
    if momentum == "bullish":
        momentum_adj = 2.0
    elif momentum == "bearish":
        momentum_adj = -2.0
    
    total_edge = base_edge + rsi_edge_adj + momentum_adj
    
    # Decision: trade if edge exceeds threshold
    if abs(total_edge) < edge_min:
        return None
    
    side = "yes" if total_edge > 0 else "no"
    
    return {
        "asset": asset,
        "timestamp": current.get("timestamp"),
        "datetime": current.get("datetime"),
        "price_at_entry": current.get("close"),
        "side": side,
        "edge": total_edge,
        "rsi": current_rsi,
        "momentum": momentum,
        "components": {
            "base": base_edge,
            "rsi_adj": rsi_edge_adj,
            "momentum_adj": momentum_adj
        }
    }


def evaluate_trade_outcome(trade: dict, settlement_price: float, entry_price: float) -> dict:
    """Evaluate if a simulated trade would have won or lost."""
    side = trade.get("side")
    
    # For Kalshi crypto markets:
    # YES wins if price moves up (settlement > strike)
    # NO wins if price moves down (settlement < strike)
    price_change_pct = ((settlement_price - entry_price) / entry_price) * 100
    
    if side == "yes":
        # YES bet wins if price went up
        win = price_change_pct > 0
    else:
        # NO bet wins if price went down
        win = price_change_pct < 0
    
    return {
        **trade,
        "settlement_price": settlement_price,
        "price_change_pct": round(price_change_pct, 2),
        "win": win,
        "pnl_estimate": abs(price_change_pct) if win else -abs(price_change_pct)
    }


def run_backtest(
    asset: str = "btc",
    days: int = 90,
    edge_min: float = 3.0,
    verbose: bool = False
) -> dict:
    """Run backtest for specified asset and parameters."""
    
    candles = load_ohlc_data(asset)
    
    if not candles:
        return {"error": f"No OHLC data for {asset}"}
    
    print(f"\n[BACKTEST] {asset.upper()} | {len(candles)} candles | edge_min={edge_min}")
    print("-" * 50)
    
    results = {
        "asset": asset,
        "parameters": {
            "edge_min": edge_min,
            "days": days,
            "candles_count": len(candles)
        },
        "trades": [],
        "summary": {}
    }
    
    # Simulate trades
    for i in range(14, len(candles) - 1):  # -1 to have settlement price
        trade = simulate_trade_decision(asset, candles, i, edge_min)
        
        if trade:
            # Use next candle's close as simulated settlement
            settlement = candles[i + 1].get("close", candles[i].get("close"))
            entry = candles[i].get("close")
            
            outcome = evaluate_trade_outcome(trade, settlement, entry)
            results["trades"].append(outcome)
            
            if verbose:
                win_str = "✅" if outcome["win"] else "❌"
                print(f"  {outcome['datetime'][:10]} | {outcome['side'].upper():3} | "
                      f"Edge: {outcome['edge']:+.1f} | RSI: {outcome.get('rsi', 0):.0f} | "
                      f"Change: {outcome['price_change_pct']:+.2f}% | {win_str}")
    
    # Calculate summary
    total_trades = len(results["trades"])
    wins = sum(1 for t in results["trades"] if t["win"])
    losses = total_trades - wins
    
    win_rate = (wins / total_trades * 100) if total_trades > 0 else 0
    
    total_pnl = sum(t["pnl_estimate"] for t in results["trades"])
    avg_win = sum(t["pnl_estimate"] for t in results["trades"] if t["win"]) / wins if wins > 0 else 0
    avg_loss = sum(t["pnl_estimate"] for t in results["trades"] if not t["win"]) / losses if losses > 0 else 0
    
    # Analyze by momentum
    momentum_stats = {}
    for m in ["bullish", "bearish", "neutral"]:
        m_trades = [t for t in results["trades"] if t.get("momentum") == m]
        m_wins = sum(1 for t in m_trades if t["win"])
        momentum_stats[m] = {
            "trades": len(m_trades),
            "wins": m_wins,
            "win_rate": (m_wins / len(m_trades) * 100) if m_trades else 0
        }
    
    # Analyze by RSI zone
    rsi_stats = {
        "oversold": {"trades": 0, "wins": 0},  # RSI < 30
        "neutral": {"trades": 0, "wins": 0},    # 30-70
        "overbought": {"trades": 0, "wins": 0}  # > 70
    }
    for t in results["trades"]:
        rsi = t.get("rsi", 50)
        if rsi and rsi < 30:
            zone = "oversold"
        elif rsi and rsi > 70:
            zone = "overbought"
        else:
            zone = "neutral"
        rsi_stats[zone]["trades"] += 1
        if t["win"]:
            rsi_stats[zone]["wins"] += 1
    
    for zone in rsi_stats:
        if rsi_stats[zone]["trades"] > 0:
            rsi_stats[zone]["win_rate"] = round(
                rsi_stats[zone]["wins"] / rsi_stats[zone]["trades"] * 100, 1
            )
        else:
            rsi_stats[zone]["win_rate"] = 0
    
    results["summary"] = {
        "total_trades": total_trades,
        "wins": wins,
        "losses": losses,
        "win_rate": round(win_rate, 1),
        "total_pnl_estimate": round(total_pnl, 2),
        "avg_win_pct": round(avg_win, 2),
        "avg_loss_pct": round(avg_loss, 2),
        "momentum_analysis": momentum_stats,
        "rsi_analysis": rsi_stats
    }
    
    print(f"\n📊 RESULTS:")
    print(f"  Total trades: {total_trades}")
    print(f"  Win rate: {win_rate:.1f}% ({wins}W / {losses}L)")
    print(f"  Estimated PnL: {total_pnl:+.2f}%")
    print(f"  Avg win: +{avg_win:.2f}% | Avg loss: {avg_loss:.2f}%")
    
    print(f"\n📈 By Momentum:")
    for m, stats in momentum_stats.items():
        if stats["trades"] > 0:
            print(f"  {m}: {stats['win_rate']:.1f}% win rate ({stats['trades']} trades)")
    
    print(f"\n📉 By RSI Zone:")
    for zone, stats in rsi_stats.items():
        if stats["trades"] > 0:
            print(f"  {zone}: {stats['win_rate']:.1f}% win rate ({stats['trades']} trades)")
    
    return results


def run_parameter_sweep(asset: str, verbose: bool = False) -> dict:
    """Run backtest with multiple parameter combinations to find optimal settings."""
    
    print(f"\n🔍 PARAMETER SWEEP for {asset.upper()}")
    print("=" * 60)
    
    edge_values = [2.0, 3.0, 4.0, 5.0, 6.0]
    
    best_result = None
    best_win_rate = 0
    all_results = []
    
    for edge in edge_values:
        result = run_backtest(asset, edge_min=edge, verbose=False)
        
        summary = result.get("summary", {})
        win_rate = summary.get("win_rate", 0)
        trades = summary.get("total_trades", 0)
        
        all_results.append({
            "edge_min": edge,
            "win_rate": win_rate,
            "trades": trades,
            "pnl": summary.get("total_pnl_estimate", 0)
        })
        
        if win_rate > best_win_rate and trades >= 3:  # Minimum sample size
            best_win_rate = win_rate
            best_result = result
    
    print("\n🏆 PARAMETER COMPARISON:")
    print("-" * 50)
    for r in all_results:
        marker = " ⭐" if r["win_rate"] == best_win_rate else ""
        print(f"  edge_min={r['edge_min']}: {r['win_rate']:.1f}% win rate "
              f"({r['trades']} trades, PnL: {r['pnl']:+.1f}%){marker}")
    
    return {
        "asset": asset,
        "sweep_results": all_results,
        "best_params": {
            "edge_min": best_result["parameters"]["edge_min"] if best_result else None,
            "win_rate": best_win_rate
        },
        "best_result": best_result
    }


def save_results(results: dict, asset: str):
    """Save backtest results to file."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"crypto-backtest-{asset}-{timestamp}.json"
    filepath = BACKTEST_DIR / filename
    
    with open(filepath, 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    print(f"\n💾 Results saved to: {filepath}")
    return filepath


def main():
    parser = argparse.ArgumentParser(description="Backtest crypto trading strategy")
    parser.add_argument("--asset", default="btc", help="Asset to backtest (btc, eth)")
    parser.add_argument("--days", type=int, default=90, help="Days of history to use")
    parser.add_argument("--edge-min", type=float, default=3.0, help="Minimum edge threshold")
    parser.add_argument("--sweep", action="store_true", help="Run parameter sweep")
    parser.add_argument("--all-assets", action="store_true", help="Run for BTC and ETH")
    parser.add_argument("--verbose", "-v", action="store_true", help="Detailed output")
    parser.add_argument("--save", action="store_true", help="Save results to file")
    
    args = parser.parse_args()
    
    assets = ["btc", "eth"] if args.all_assets else [args.asset]
    
    all_results = {}
    
    for asset in assets:
        if args.sweep:
            results = run_parameter_sweep(asset, verbose=args.verbose)
        else:
            results = run_backtest(
                asset=asset,
                days=args.days,
                edge_min=args.edge_min,
                verbose=args.verbose
            )
        
        all_results[asset] = results
        
        if args.save:
            save_results(results, asset)
    
    # Summary recommendations
    print("\n" + "=" * 60)
    print("📋 RECOMMENDATIONS")
    print("=" * 60)
    
    for asset, results in all_results.items():
        summary = results.get("summary", {}) if not args.sweep else results.get("best_result", {}).get("summary", {})
        win_rate = summary.get("win_rate", 0)
        
        if win_rate >= 60:
            recommendation = "✅ Strategy looks profitable"
        elif win_rate >= 50:
            recommendation = "⚠️ Edge is marginal, consider tightening criteria"
        else:
            recommendation = "❌ Strategy underperforming, needs adjustment"
        
        print(f"  {asset.upper()}: {win_rate:.1f}% win rate - {recommendation}")
        
        # RSI-based recommendation
        rsi_stats = summary.get("rsi_analysis", {})
        best_zone = max(rsi_stats.keys(), key=lambda z: rsi_stats[z].get("win_rate", 0)) if rsi_stats else None
        if best_zone and rsi_stats[best_zone].get("trades", 0) > 0:
            print(f"         Best RSI zone: {best_zone} ({rsi_stats[best_zone]['win_rate']:.1f}% win rate)")
    
    print()
    return all_results


if __name__ == "__main__":
    main()
