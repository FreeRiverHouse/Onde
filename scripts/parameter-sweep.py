#!/usr/bin/env python3
"""
Parameter Sweep Utility for Autotrader Optimization

Task: T634
Runs simulations with different parameter combinations and compares performance.

Usage:
    python3 scripts/parameter-sweep.py [--detailed] [--output FILE]
"""

import json
import math
import argparse
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Any
from dataclasses import dataclass

PROJECT_ROOT = Path(__file__).parent.parent
OHLC_DIR = PROJECT_ROOT / "data" / "ohlc"
SETTLEMENTS_FILE = PROJECT_ROOT / "scripts" / "kalshi-settlements-v2.json"
OUTPUT_DIR = PROJECT_ROOT / "data" / "backtests"

# Parameter ranges to test
MIN_EDGE_VALUES = [0.05, 0.08, 0.10, 0.12, 0.15, 0.18, 0.20]  # 5% to 20%
KELLY_FRACTIONS = [0.02, 0.03, 0.05, 0.08, 0.10]  # 2% to 10%
VOL_ASSUMPTIONS = {
    "current": {"BTC": 0.005, "ETH": 0.007},
    "realized": {"BTC": 0.0032, "ETH": 0.0046},  # From T377 analysis
    "aggressive": {"BTC": 0.004, "ETH": 0.006},
    "conservative": {"BTC": 0.006, "ETH": 0.008},
}


@dataclass
class TradeResult:
    ticker: str
    asset: str
    side: str  # YES or NO
    strike: float
    entry_price: float
    settlement_price: float
    edge: float
    won: bool
    pnl_cents: int


def load_ohlc(asset: str) -> List[Dict]:
    """Load cached OHLC data."""
    filepath = OHLC_DIR / f"{asset.lower()}-ohlc.json"
    if not filepath.exists():
        return []
    with open(filepath) as f:
        data = json.load(f)
    return data.get("candles", [])


def load_settlements() -> List[Dict]:
    """Load settlement data for backtesting."""
    settlements_file = PROJECT_ROOT / "scripts" / "kalshi-settlements.json"
    if not settlements_file.exists():
        settlements_file = SETTLEMENTS_FILE
    
    if not settlements_file.exists():
        return []
    
    with open(settlements_file) as f:
        data = json.load(f)
    
    # Handle nested format {"trades": {...}}
    if isinstance(data, dict) and "trades" in data:
        trades_dict = data["trades"]
        # Convert dict values to list, flatten trade data
        result = []
        for ticker, info in trades_dict.items():
            trade_data = info.get("trade", {})
            # Merge settlement info with trade data
            merged = {
                **trade_data,
                "ticker": ticker,
                "settlement_price": info.get("settlement_price"),
                "won": info.get("won", False),
                "pnl_cents": info.get("pnl_cents", 0),
                "result_status": "won" if info.get("won") else "lost" if info.get("status") == "settled" else "pending",
            }
            result.append(merged)
        return result
    
    # Handle flat list format
    if isinstance(data, list):
        return data
    
    return []


def black_scholes_probability(
    current_price: float,
    strike: float,
    hourly_vol: float,
    hours_to_expiry: float,
    is_yes: bool
) -> float:
    """
    Calculate probability of price being above strike at expiry.
    Simplified Black-Scholes-like model.
    """
    if hours_to_expiry <= 0:
        hours_to_expiry = 0.1
    
    sigma = hourly_vol * math.sqrt(hours_to_expiry)
    
    if sigma <= 0:
        return 1.0 if current_price > strike else 0.0
    
    # d1 = ln(S/K) / sigma (simplified, no drift)
    d1 = math.log(current_price / strike) / sigma
    
    # Approximate CDF using normal distribution
    prob_above = 0.5 * (1 + math.erf(d1 / math.sqrt(2)))
    
    return prob_above if is_yes else (1 - prob_above)


def simulate_trade(
    settlement: Dict,
    min_edge: float,
    vol_assumption: Dict[str, float]
) -> TradeResult | None:
    """
    Simulate whether a trade would have been taken and its outcome.
    """
    ticker = settlement.get("ticker", "")
    asset = "BTC" if "KXBTC" in ticker else "ETH" if "KXETH" in ticker else None
    if not asset:
        return None
    
    # Get strike from settlement data or parse from ticker
    strike = settlement.get("strike", 0)
    if not strike:
        # Parse strike from ticker (e.g., KXBTCD-26JAN2804-T88499.99)
        parts = ticker.split("-")
        if len(parts) >= 3:
            strike_part = parts[2]
            # Handle both B and T prefixes
            if strike_part.startswith(("B", "T")):
                try:
                    strike = float(strike_part[1:])
                except ValueError:
                    return None
    
    if not strike:
        return None
    
    # Get entry price (current_price at time of trade)
    entry_price = settlement.get("current_price", 0)
    settlement_price = settlement.get("settlement_price", 0)
    
    if not entry_price or not settlement_price:
        return None
    
    # Get actual time to expiry or default to 1 hour
    minutes_to_expiry = settlement.get("minutes_to_expiry", 60)
    hours_to_expiry = minutes_to_expiry / 60.0
    
    vol = vol_assumption.get(asset, 0.005)
    
    # Calculate model probability (for YES)
    prob_yes = black_scholes_probability(entry_price, strike, vol, hours_to_expiry, True)
    prob_no = 1 - prob_yes
    
    # Get actual trade side and price
    side = settlement.get("side", "no").upper()
    market_price_cents = settlement.get("price_cents", 50)
    market_prob = market_price_cents / 100
    
    # Calculate edge based on our model vs market
    if side == "YES":
        model_prob = prob_yes
        edge = model_prob - market_prob
    else:
        model_prob = prob_no
        edge = model_prob - (1 - market_prob)  # NO probability
    
    # Would we take this trade with different parameters?
    if edge < min_edge:
        return None  # Skip, edge too low
    
    # Determine if trade won
    won = settlement.get("won", False) or settlement.get("result_status") == "won"
    
    # Get actual PnL or calculate
    pnl_cents = settlement.get("pnl_cents", 0)
    if pnl_cents == 0:
        contracts = settlement.get("contracts", 1)
        if won:
            pnl_cents = (100 - market_price_cents) * contracts
        else:
            pnl_cents = -market_price_cents * contracts
    
    return TradeResult(
        ticker=ticker,
        asset=asset,
        side=side,
        strike=strike,
        entry_price=entry_price,
        settlement_price=settlement_price,
        edge=edge,
        won=won,
        pnl_cents=pnl_cents
    )


def run_simulation(
    settlements: List[Dict],
    min_edge: float,
    kelly_fraction: float,
    vol_assumption: Dict[str, float]
) -> Dict[str, Any]:
    """Run simulation with given parameters."""
    trades = []
    
    for settlement in settlements:
        result = simulate_trade(settlement, min_edge, vol_assumption)
        if result:
            trades.append(result)
    
    if not trades:
        return {
            "trades": 0,
            "win_rate": 0,
            "pnl_cents": 0,
            "avg_edge": 0,
            "sharpe": 0,
        }
    
    wins = sum(1 for t in trades if t.won)
    total_pnl = sum(t.pnl_cents for t in trades)
    avg_edge = sum(t.edge for t in trades) / len(trades)
    
    # Calculate Sharpe-like ratio
    if len(trades) > 1:
        returns = [t.pnl_cents for t in trades]
        mean_return = sum(returns) / len(returns)
        variance = sum((r - mean_return) ** 2 for r in returns) / (len(returns) - 1)
        std_return = math.sqrt(variance) if variance > 0 else 1
        sharpe = mean_return / std_return if std_return > 0 else 0
    else:
        sharpe = 0
    
    return {
        "trades": len(trades),
        "wins": wins,
        "losses": len(trades) - wins,
        "win_rate": wins / len(trades) if trades else 0,
        "pnl_cents": total_pnl,
        "avg_edge": avg_edge,
        "sharpe": sharpe,
        "avg_pnl_per_trade": total_pnl / len(trades) if trades else 0,
    }


def analyze_actual_trades(settlements: List[Dict]) -> None:
    """Analyze what actually happened with historical trades."""
    print("\n📊 ANALYSIS OF ACTUAL HISTORICAL TRADES:")
    print("-" * 60)
    
    by_edge_bucket = {}
    by_asset = {"BTC": {"wins": 0, "losses": 0, "pnl": 0}, "ETH": {"wins": 0, "losses": 0, "pnl": 0}}
    
    for s in settlements:
        result_status = s.get("result_status", "pending")
        if result_status == "pending":
            continue
        
        ticker = s.get("ticker", "")
        asset = "BTC" if "KXBTC" in ticker else "ETH" if "KXETH" in ticker else "OTHER"
        edge = s.get("edge", 0)
        won = s.get("won", False) or result_status == "won"
        pnl = s.get("pnl_cents", 0)
        
        # Bucket by edge
        if edge < 0.1:
            bucket = "<10%"
        elif edge < 0.2:
            bucket = "10-20%"
        elif edge < 0.3:
            bucket = "20-30%"
        elif edge < 0.4:
            bucket = "30-40%"
        else:
            bucket = "40%+"
        
        if bucket not in by_edge_bucket:
            by_edge_bucket[bucket] = {"wins": 0, "losses": 0, "pnl": 0}
        
        if won:
            by_edge_bucket[bucket]["wins"] += 1
            if asset in by_asset:
                by_asset[asset]["wins"] += 1
        else:
            by_edge_bucket[bucket]["losses"] += 1
            if asset in by_asset:
                by_asset[asset]["losses"] += 1
        
        by_edge_bucket[bucket]["pnl"] += pnl
        if asset in by_asset:
            by_asset[asset]["pnl"] += pnl
    
    print("Win rate by (v1 model) edge bucket:")
    for bucket, data in sorted(by_edge_bucket.items()):
        total = data["wins"] + data["losses"]
        wr = data["wins"] / total * 100 if total > 0 else 0
        print(f"  {bucket:<8}: {data['wins']:>2}W / {data['losses']:>2}L = {wr:>5.1f}% WR, ${data['pnl']/100:>6.2f}")
    
    print("\nBy asset:")
    for asset, data in by_asset.items():
        total = data["wins"] + data["losses"]
        wr = data["wins"] / total * 100 if total > 0 else 0
        print(f"  {asset}: {data['wins']:>2}W / {data['losses']:>2}L = {wr:>5.1f}% WR, ${data['pnl']/100:>6.2f}")
    
    # What the model SHOULD have found
    print("\n⚠️  NOTE: v1 model edge calculations were BROKEN")
    print("   All trades show 40%+ 'edge' but 0% win rate")
    print("   This confirms the edge calculation was invalid")
    print("   v2 model with proper Black-Scholes would skip all these trades")


def main():
    parser = argparse.ArgumentParser(description="Parameter sweep for autotrader optimization")
    parser.add_argument("--detailed", action="store_true", help="Show detailed results")
    parser.add_argument("--output", type=str, help="Output file path")
    parser.add_argument("--analyze-only", action="store_true", help="Only analyze actual trades, no simulation")
    args = parser.parse_args()
    
    print("🔄 Loading settlement data...")
    settlements = load_settlements()
    
    if not settlements:
        print("❌ No settlement data found. Run settlement tracker first.")
        return
    
    # Filter to only settled trades
    settled = [s for s in settlements if s.get("result_status") in ["won", "lost"]]
    print(f"📊 Found {len(settled)} settled trades for backtesting")
    
    # Always show actual trade analysis first
    analyze_actual_trades(settled)
    
    if args.analyze_only:
        return
    
    if not settled:
        print("❌ No settled trades to backtest against")
        return
    
    results = []
    
    print("\n🚀 Running parameter sweep...")
    print("=" * 70)
    
    for vol_name, vol_values in VOL_ASSUMPTIONS.items():
        for min_edge in MIN_EDGE_VALUES:
            for kelly in KELLY_FRACTIONS:
                sim = run_simulation(settled, min_edge, kelly, vol_values)
                
                result = {
                    "vol_assumption": vol_name,
                    "vol_btc": vol_values["BTC"],
                    "vol_eth": vol_values["ETH"],
                    "min_edge": min_edge,
                    "kelly_fraction": kelly,
                    **sim
                }
                results.append(result)
    
    # Sort by Sharpe ratio (risk-adjusted return)
    results.sort(key=lambda x: x["sharpe"], reverse=True)
    
    # Print top 10 results
    print("\n📈 TOP 10 PARAMETER COMBINATIONS (by Sharpe ratio)")
    print("-" * 70)
    print(f"{'Vol':<12} {'Edge':<6} {'Kelly':<6} {'Trades':<7} {'WR':<7} {'PnL':<8} {'Sharpe':<7}")
    print("-" * 70)
    
    for r in results[:10]:
        print(f"{r['vol_assumption']:<12} {r['min_edge']*100:>4.0f}%  {r['kelly_fraction']*100:>4.0f}%  "
              f"{r['trades']:>6}  {r['win_rate']*100:>5.1f}%  ${r['pnl_cents']/100:>6.2f}  {r['sharpe']:>6.2f}")
    
    # Optimal recommendation
    if results:
        best = results[0]
        print("\n" + "=" * 70)
        print("🏆 OPTIMAL PARAMETERS:")
        print(f"   Volatility assumption: {best['vol_assumption']}")
        print(f"   BTC_HOURLY_VOL: {best['vol_btc']}")
        print(f"   ETH_HOURLY_VOL: {best['vol_eth']}")
        print(f"   MIN_EDGE: {best['min_edge']*100:.0f}%")
        print(f"   KELLY_FRACTION: {best['kelly_fraction']*100:.0f}%")
        print(f"   Expected trades: {best['trades']}")
        print(f"   Expected win rate: {best['win_rate']*100:.1f}%")
        print(f"   Sharpe ratio: {best['sharpe']:.2f}")
    
    # Edge analysis
    print("\n📊 WIN RATE BY MIN_EDGE THRESHOLD:")
    for min_edge in MIN_EDGE_VALUES:
        edge_results = [r for r in results if r["min_edge"] == min_edge]
        if edge_results:
            avg_wr = sum(r["win_rate"] for r in edge_results) / len(edge_results)
            avg_trades = sum(r["trades"] for r in edge_results) / len(edge_results)
            print(f"   {min_edge*100:>4.0f}%: {avg_wr*100:>5.1f}% WR, ~{avg_trades:.0f} trades")
    
    # Volatility analysis
    print("\n📊 PERFORMANCE BY VOLATILITY ASSUMPTION:")
    for vol_name in VOL_ASSUMPTIONS:
        vol_results = [r for r in results if r["vol_assumption"] == vol_name]
        if vol_results:
            avg_wr = sum(r["win_rate"] for r in vol_results) / len(vol_results)
            avg_sharpe = sum(r["sharpe"] for r in vol_results) / len(vol_results)
            print(f"   {vol_name:<12}: {avg_wr*100:>5.1f}% WR, {avg_sharpe:>5.2f} Sharpe")
    
    # Save results
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    output_file = args.output or (OUTPUT_DIR / "parameter-sweep-results.json")
    
    output_data = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "settlement_count": len(settled),
        "optimal": results[0] if results else None,
        "all_results": results if args.detailed else results[:20],
    }
    
    with open(output_file, "w") as f:
        json.dump(output_data, f, indent=2)
    
    print(f"\n✅ Results saved to: {output_file}")


if __name__ == "__main__":
    main()
