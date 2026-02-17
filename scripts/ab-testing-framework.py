#!/usr/bin/env python3
"""
A/B Testing Framework for Trading Strategies
=============================================
Compare different model parameters side-by-side using historical trade data
and paper trading simulations.

Features:
- Define strategy variants with different parameters
- Backtest against historical trade data
- Run paper trades in parallel
- Compare metrics: win rate, PnL, Sharpe ratio, max drawdown
- Statistical significance testing

Usage:
  python ab-testing-framework.py --list                    # List available strategies
  python ab-testing-framework.py --backtest A B --days 30  # Backtest strategies
  python ab-testing-framework.py --paper A B --cycles 100  # Paper trade simulation
  python ab-testing-framework.py --report                  # Show comparison report
  python ab-testing-framework.py --create NAME --params '{...}'  # Create new variant

Author: @clawd
Created: 2026-02-01
"""

import os
import sys
import json
import argparse
import math
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, asdict
import random
import hashlib

# Paths
SCRIPT_DIR = Path(__file__).parent
DATA_DIR = SCRIPT_DIR.parent / "data" / "trading"
STRATEGIES_FILE = DATA_DIR / "ab-strategies.json"
RESULTS_FILE = DATA_DIR / "ab-results.json"
TRADES_DIR = SCRIPT_DIR

# Ensure directories exist
DATA_DIR.mkdir(parents=True, exist_ok=True)


@dataclass
class StrategyParams:
    """Parameters that define a trading strategy variant."""
    name: str
    description: str
    min_edge: float = 0.10  # Minimum edge to enter trade
    max_position_pct: float = 0.03  # Max portfolio % per position
    kelly_fraction: float = 0.25  # Kelly criterion multiplier
    min_time_to_expiry: int = 45  # Minutes before expiry cutoff
    momentum_weight: float = 0.3  # Weight for momentum signal
    volatility_bonus_max: float = 0.02  # Max volatility edge bonus
    use_news_sentiment: bool = True  # Include news in decisions
    use_momentum_divergence: bool = True  # Detect momentum divergences
    btc_hourly_vol: float = 0.005  # Assumed BTC hourly volatility
    eth_hourly_vol: float = 0.007  # Assumed ETH hourly volatility
    circuit_breaker_threshold: int = 5  # Consecutive losses to pause
    concentration_limit: float = 0.50  # Max exposure to single asset class
    crypto_correlation_limit: float = 0.30  # Max correlated crypto exposure


@dataclass
class TradeResult:
    """Result of a simulated trade."""
    ticker: str
    side: str  # YES or NO
    entry_price: float
    exit_price: float
    quantity: int
    pnl: float
    won: bool
    edge: float
    strategy: str
    timestamp: str


@dataclass
class BacktestResult:
    """Result of backtesting a strategy."""
    strategy: str
    trades: int
    wins: int
    losses: int
    win_rate: float
    total_pnl: float
    avg_pnl: float
    max_drawdown: float
    sharpe_ratio: float
    avg_edge: float
    roi: float


# Default strategy variants for A/B testing
DEFAULT_STRATEGIES = {
    "baseline": StrategyParams(
        name="baseline",
        description="Current production strategy (v2)",
        min_edge=0.10,
        max_position_pct=0.03,
        kelly_fraction=0.25,
        momentum_weight=0.3,
    ),
    "conservative": StrategyParams(
        name="conservative",
        description="Higher edge requirement, smaller positions",
        min_edge=0.15,
        max_position_pct=0.02,
        kelly_fraction=0.15,
        momentum_weight=0.2,
    ),
    "aggressive": StrategyParams(
        name="aggressive",
        description="Lower edge threshold, larger positions",
        min_edge=0.08,
        max_position_pct=0.05,
        kelly_fraction=0.35,
        momentum_weight=0.4,
    ),
    "momentum_heavy": StrategyParams(
        name="momentum_heavy",
        description="Strong momentum weighting",
        min_edge=0.10,
        max_position_pct=0.03,
        kelly_fraction=0.25,
        momentum_weight=0.5,
        use_momentum_divergence=True,
    ),
    "no_momentum": StrategyParams(
        name="no_momentum",
        description="Pure edge-based, no momentum",
        min_edge=0.12,
        max_position_pct=0.03,
        kelly_fraction=0.25,
        momentum_weight=0.0,
        use_momentum_divergence=False,
    ),
    "high_frequency": StrategyParams(
        name="high_frequency",
        description="Trade closer to expiry, lower edge",
        min_edge=0.08,
        max_position_pct=0.02,
        kelly_fraction=0.20,
        min_time_to_expiry=20,
    ),
    "safe_harbor": StrategyParams(
        name="safe_harbor",
        description="Very conservative, tight stops",
        min_edge=0.20,
        max_position_pct=0.01,
        kelly_fraction=0.10,
        circuit_breaker_threshold=3,
    ),
}


def load_strategies() -> Dict[str, StrategyParams]:
    """Load strategies from file or return defaults."""
    if STRATEGIES_FILE.exists():
        try:
            with open(STRATEGIES_FILE) as f:
                data = json.load(f)
            return {k: StrategyParams(**v) for k, v in data.items()}
        except Exception as e:
            print(f"⚠️  Error loading strategies: {e}, using defaults")
    return DEFAULT_STRATEGIES.copy()


def save_strategies(strategies: Dict[str, StrategyParams]) -> None:
    """Save strategies to file."""
    data = {k: asdict(v) for k, v in strategies.items()}
    with open(STRATEGIES_FILE, "w") as f:
        json.dump(data, f, indent=2)
    print(f"✅ Strategies saved to {STRATEGIES_FILE}")


def load_results() -> Dict[str, List[BacktestResult]]:
    """Load historical backtest results."""
    if RESULTS_FILE.exists():
        try:
            with open(RESULTS_FILE) as f:
                data = json.load(f)
            return data
        except Exception:
            pass
    return {}


def save_results(results: Dict[str, Any]) -> None:
    """Save backtest results to file."""
    with open(RESULTS_FILE, "w") as f:
        json.dump(results, f, indent=2, default=str)
    print(f"✅ Results saved to {RESULTS_FILE}")


def load_historical_trades(days: int = 30) -> List[Dict]:
    """Load historical trades from trade logs."""
    trades = []
    cutoff = datetime.now() - timedelta(days=days)
    
    # Look for trade files
    for pattern in ["kalshi-trades-v2.jsonl", "kalshi-trades.jsonl"]:
        trade_file = TRADES_DIR / pattern
        if trade_file.exists():
            with open(trade_file) as f:
                for line in f:
                    try:
                        trade = json.loads(line.strip())
                        # Parse timestamp
                        ts_str = trade.get("timestamp", trade.get("time", ""))
                        if ts_str:
                            try:
                                ts = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
                                if ts.replace(tzinfo=None) >= cutoff:
                                    trades.append(trade)
                            except:
                                trades.append(trade)  # Include if can't parse
                        else:
                            trades.append(trade)
                    except json.JSONDecodeError:
                        continue
    
    return trades


def simulate_trade_decision(
    trade: Dict, 
    strategy: StrategyParams
) -> Tuple[bool, float]:
    """
    Simulate whether a strategy would have taken this trade
    and what edge it would have calculated.
    
    Returns: (would_trade, calculated_edge)
    """
    # Extract trade data
    edge = trade.get("edge", trade.get("calculated_edge", 0)) or 0
    momentum = trade.get("momentum", 0) or 0
    volatility = trade.get("volatility", 0) or 0
    minutes_to_expiry = trade.get("minutes_to_expiry", 60) or 60
    
    # Calculate adjusted edge based on strategy parameters
    adjusted_edge = edge
    
    # Apply momentum weight
    if strategy.use_momentum_divergence and momentum:
        momentum_bonus = abs(momentum) * strategy.momentum_weight * 0.05
        adjusted_edge += momentum_bonus
    
    # Apply volatility adjustment
    if volatility and strategy.volatility_bonus_max > 0:
        vol_bonus = min(volatility * 0.1, strategy.volatility_bonus_max)
        adjusted_edge += vol_bonus
    
    # Check if strategy would take this trade
    would_trade = (
        adjusted_edge >= strategy.min_edge and
        minutes_to_expiry >= strategy.min_time_to_expiry
    )
    
    return would_trade, adjusted_edge


def calculate_position_size(
    strategy: StrategyParams,
    portfolio_value: float,
    edge: float,
    price: float
) -> int:
    """Calculate position size based on Kelly criterion."""
    # Kelly formula: f = (bp - q) / b
    # where b = odds, p = win prob, q = lose prob
    win_prob = 0.5 + edge  # Assume edge translates to win probability above 50%
    lose_prob = 1 - win_prob
    odds = (1 / price) - 1  # Convert price to odds
    
    if odds <= 0:
        return 0
    
    kelly_fraction = (odds * win_prob - lose_prob) / odds
    kelly_fraction = max(0, min(kelly_fraction, 1))  # Clamp to [0, 1]
    
    # Apply fractional Kelly
    bet_fraction = kelly_fraction * strategy.kelly_fraction
    
    # Apply max position constraint
    bet_fraction = min(bet_fraction, strategy.max_position_pct)
    
    # Calculate dollar amount and convert to contracts
    dollar_amount = portfolio_value * bet_fraction
    contracts = int(dollar_amount / price) if price > 0 else 0
    
    return max(1, contracts)  # At least 1 contract


def backtest_strategy(
    strategy: StrategyParams,
    trades: List[Dict],
    initial_capital: float = 100.0
) -> BacktestResult:
    """Backtest a strategy against historical trades."""
    portfolio_value = initial_capital
    peak_value = initial_capital
    max_drawdown = 0
    
    wins = 0
    losses = 0
    total_pnl = 0
    edges = []
    daily_returns = []
    
    simulated_trades = []
    
    for trade in trades:
        would_trade, edge = simulate_trade_decision(trade, strategy)
        
        if not would_trade:
            continue
        
        # Simulate the trade
        result_status = trade.get("result_status", trade.get("result", ""))
        won = result_status == "won"
        
        entry_price = trade.get("price", trade.get("avg_price", 0.5)) or 0.5
        exit_price = 1.0 if won else 0.0  # Binary outcome
        
        # Calculate P&L
        side = trade.get("side", "YES")
        quantity = calculate_position_size(strategy, portfolio_value, edge, entry_price)
        
        if side == "YES":
            pnl = quantity * (exit_price - entry_price)
        else:
            pnl = quantity * (entry_price - exit_price)
        
        # Update tracking
        portfolio_value += pnl
        total_pnl += pnl
        edges.append(edge)
        daily_returns.append(pnl / initial_capital)
        
        if won:
            wins += 1
        else:
            losses += 1
        
        # Track drawdown
        if portfolio_value > peak_value:
            peak_value = portfolio_value
        current_drawdown = (peak_value - portfolio_value) / peak_value
        max_drawdown = max(max_drawdown, current_drawdown)
        
        simulated_trades.append({
            "ticker": trade.get("ticker", ""),
            "won": won,
            "pnl": pnl,
            "edge": edge,
        })
    
    # Calculate metrics
    total_trades = wins + losses
    win_rate = wins / total_trades if total_trades > 0 else 0
    avg_pnl = total_pnl / total_trades if total_trades > 0 else 0
    avg_edge = sum(edges) / len(edges) if edges else 0
    roi = (portfolio_value - initial_capital) / initial_capital if initial_capital > 0 else 0
    
    # Sharpe ratio (simplified)
    if daily_returns:
        mean_return = sum(daily_returns) / len(daily_returns)
        variance = sum((r - mean_return) ** 2 for r in daily_returns) / len(daily_returns)
        std_return = math.sqrt(variance) if variance > 0 else 0.001
        sharpe_ratio = (mean_return / std_return) * math.sqrt(252) if std_return > 0 else 0
    else:
        sharpe_ratio = 0
    
    return BacktestResult(
        strategy=strategy.name,
        trades=total_trades,
        wins=wins,
        losses=losses,
        win_rate=win_rate,
        total_pnl=total_pnl,
        avg_pnl=avg_pnl,
        max_drawdown=max_drawdown,
        sharpe_ratio=sharpe_ratio,
        avg_edge=avg_edge,
        roi=roi,
    )


def paper_trade_simulation(
    strategy: StrategyParams,
    cycles: int = 100,
    initial_capital: float = 100.0
) -> BacktestResult:
    """
    Run Monte Carlo simulation of paper trades.
    Uses random market conditions to stress test strategy.
    """
    random.seed(hashlib.md5(strategy.name.encode()).hexdigest())
    
    portfolio_value = initial_capital
    peak_value = initial_capital
    max_drawdown = 0
    
    wins = 0
    losses = 0
    total_pnl = 0
    edges = []
    daily_returns = []
    
    for _ in range(cycles):
        # Generate random market conditions
        base_edge = random.uniform(0.05, 0.25)
        momentum = random.uniform(-1, 1)
        volatility = random.uniform(0.3, 1.5)
        minutes_to_expiry = random.randint(15, 180)
        entry_price = random.uniform(0.3, 0.7)
        
        # Simulate trade
        mock_trade = {
            "edge": base_edge,
            "momentum": momentum,
            "volatility": volatility,
            "minutes_to_expiry": minutes_to_expiry,
            "price": entry_price,
        }
        
        would_trade, edge = simulate_trade_decision(mock_trade, strategy)
        
        if not would_trade:
            continue
        
        # Simulate outcome based on edge (better edge = higher win prob)
        win_probability = 0.5 + edge * 0.5  # Edge contributes to win chance
        won = random.random() < win_probability
        
        # Calculate P&L
        quantity = calculate_position_size(strategy, portfolio_value, edge, entry_price)
        
        if won:
            pnl = quantity * (1.0 - entry_price)
            wins += 1
        else:
            pnl = -quantity * entry_price
            losses += 1
        
        # Update tracking
        portfolio_value += pnl
        total_pnl += pnl
        edges.append(edge)
        daily_returns.append(pnl / initial_capital)
        
        # Track drawdown
        if portfolio_value > peak_value:
            peak_value = portfolio_value
        current_drawdown = (peak_value - portfolio_value) / peak_value if peak_value > 0 else 0
        max_drawdown = max(max_drawdown, current_drawdown)
        
        # Circuit breaker check
        if losses > wins and (losses - wins) >= strategy.circuit_breaker_threshold:
            break  # Strategy would have paused
    
    # Calculate metrics
    total_trades = wins + losses
    win_rate = wins / total_trades if total_trades > 0 else 0
    avg_pnl = total_pnl / total_trades if total_trades > 0 else 0
    avg_edge = sum(edges) / len(edges) if edges else 0
    roi = (portfolio_value - initial_capital) / initial_capital if initial_capital > 0 else 0
    
    # Sharpe ratio
    if daily_returns:
        mean_return = sum(daily_returns) / len(daily_returns)
        variance = sum((r - mean_return) ** 2 for r in daily_returns) / len(daily_returns)
        std_return = math.sqrt(variance) if variance > 0 else 0.001
        sharpe_ratio = (mean_return / std_return) * math.sqrt(252) if std_return > 0 else 0
    else:
        sharpe_ratio = 0
    
    return BacktestResult(
        strategy=strategy.name,
        trades=total_trades,
        wins=wins,
        losses=losses,
        win_rate=win_rate,
        total_pnl=total_pnl,
        avg_pnl=avg_pnl,
        max_drawdown=max_drawdown,
        sharpe_ratio=sharpe_ratio,
        avg_edge=avg_edge,
        roi=roi,
    )


def statistical_significance(
    result_a: BacktestResult,
    result_b: BacktestResult
) -> Dict[str, Any]:
    """
    Test statistical significance between two strategies.
    Uses simplified z-test for win rate comparison.
    """
    # Win rate comparison
    n1, p1 = result_a.trades, result_a.win_rate
    n2, p2 = result_b.trades, result_b.win_rate
    
    if n1 == 0 or n2 == 0:
        return {"significant": False, "reason": "Insufficient data"}
    
    # Pooled proportion
    p_pool = (p1 * n1 + p2 * n2) / (n1 + n2)
    
    # Standard error
    se = math.sqrt(p_pool * (1 - p_pool) * (1/n1 + 1/n2)) if p_pool > 0 and p_pool < 1 else 0.001
    
    # Z-score
    z = abs(p1 - p2) / se if se > 0 else 0
    
    # P-value approximation (two-tailed)
    # Using simplified lookup for common z-values
    if z >= 2.576:
        p_value = 0.01
        significance = "99%"
    elif z >= 1.96:
        p_value = 0.05
        significance = "95%"
    elif z >= 1.645:
        p_value = 0.10
        significance = "90%"
    else:
        p_value = 0.5
        significance = "Not significant"
    
    return {
        "z_score": round(z, 3),
        "p_value": p_value,
        "significance": significance,
        "significant": z >= 1.96,
        "winner": result_a.strategy if p1 > p2 else result_b.strategy,
        "win_rate_diff": round(abs(p1 - p2) * 100, 2),
    }


def print_comparison_table(results: List[BacktestResult]) -> None:
    """Print a formatted comparison table."""
    print("\n" + "=" * 100)
    print("A/B TESTING RESULTS COMPARISON")
    print("=" * 100)
    
    headers = ["Strategy", "Trades", "Win Rate", "PnL", "ROI", "Sharpe", "Max DD", "Avg Edge"]
    col_widths = [18, 8, 10, 12, 10, 8, 10, 10]
    
    # Print header
    header_row = " | ".join(h.ljust(w) for h, w in zip(headers, col_widths))
    print(header_row)
    print("-" * 100)
    
    # Sort by ROI
    sorted_results = sorted(results, key=lambda x: x.roi, reverse=True)
    
    for i, r in enumerate(sorted_results):
        rank = "🥇" if i == 0 else "🥈" if i == 1 else "🥉" if i == 2 else "  "
        
        row = [
            f"{rank} {r.strategy[:15]}",
            str(r.trades),
            f"{r.win_rate*100:.1f}%",
            f"${r.total_pnl:+.2f}",
            f"{r.roi*100:+.1f}%",
            f"{r.sharpe_ratio:.2f}",
            f"{r.max_drawdown*100:.1f}%",
            f"{r.avg_edge*100:.1f}%",
        ]
        print(" | ".join(val.ljust(w) for val, w in zip(row, col_widths)))
    
    print("=" * 100)


def list_strategies(strategies: Dict[str, StrategyParams]) -> None:
    """List all available strategies."""
    print("\n📋 Available Strategies")
    print("=" * 60)
    
    for name, params in sorted(strategies.items()):
        print(f"\n🔹 {name}")
        print(f"   {params.description}")
        print(f"   Min Edge: {params.min_edge*100:.0f}% | Kelly: {params.kelly_fraction*100:.0f}% | Momentum: {params.momentum_weight:.1f}")


def main():
    parser = argparse.ArgumentParser(
        description="A/B Testing Framework for Trading Strategies",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s --list                           List available strategies
  %(prog)s --backtest baseline conservative --days 30
  %(prog)s --paper baseline aggressive --cycles 500
  %(prog)s --compare baseline conservative
  %(prog)s --create mytest --params '{"min_edge": 0.12, "kelly_fraction": 0.20}'
        """
    )
    
    parser.add_argument("--list", action="store_true", help="List available strategies")
    parser.add_argument("--backtest", nargs="+", metavar="STRATEGY", help="Backtest strategies against historical data")
    parser.add_argument("--paper", nargs="+", metavar="STRATEGY", help="Run paper trade simulation")
    parser.add_argument("--compare", nargs=2, metavar="STRATEGY", help="Compare two strategies statistically")
    parser.add_argument("--report", action="store_true", help="Show full comparison report")
    parser.add_argument("--create", metavar="NAME", help="Create new strategy variant")
    parser.add_argument("--params", type=str, help="JSON parameters for new strategy")
    parser.add_argument("--days", type=int, default=30, help="Days of historical data (default: 30)")
    parser.add_argument("--cycles", type=int, default=100, help="Paper trade simulation cycles (default: 100)")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")
    
    args = parser.parse_args()
    
    # Load strategies
    strategies = load_strategies()
    
    # Handle commands
    if args.list:
        list_strategies(strategies)
        return
    
    if args.create:
        if not args.params:
            print("❌ --params required when creating strategy")
            return
        
        try:
            custom_params = json.loads(args.params)
            new_strategy = StrategyParams(
                name=args.create,
                description=custom_params.get("description", f"Custom strategy: {args.create}"),
                **{k: v for k, v in custom_params.items() if k != "description"}
            )
            strategies[args.create] = new_strategy
            save_strategies(strategies)
            print(f"✅ Created strategy: {args.create}")
        except json.JSONDecodeError as e:
            print(f"❌ Invalid JSON: {e}")
        return
    
    if args.backtest:
        print(f"\n📊 Backtesting {len(args.backtest)} strategies against {args.days} days of data...")
        
        trades = load_historical_trades(args.days)
        print(f"   Loaded {len(trades)} historical trades")
        
        if not trades:
            print("⚠️  No historical trades found. Try running the autotrader first.")
            return
        
        results = []
        for strategy_name in args.backtest:
            if strategy_name not in strategies:
                print(f"⚠️  Unknown strategy: {strategy_name}")
                continue
            
            strategy = strategies[strategy_name]
            result = backtest_strategy(strategy, trades)
            results.append(result)
            
            if args.verbose:
                print(f"   {strategy_name}: {result.trades} trades, {result.win_rate*100:.1f}% WR, ${result.total_pnl:+.2f}")
        
        if results:
            print_comparison_table(results)
            
            # Save results
            saved_results = load_results()
            saved_results[datetime.now().isoformat()] = {
                "type": "backtest",
                "days": args.days,
                "results": [asdict(r) for r in results],
            }
            save_results(saved_results)
        return
    
    if args.paper:
        print(f"\n🎲 Paper trade simulation ({args.cycles} cycles)...")
        
        results = []
        for strategy_name in args.paper:
            if strategy_name not in strategies:
                print(f"⚠️  Unknown strategy: {strategy_name}")
                continue
            
            strategy = strategies[strategy_name]
            result = paper_trade_simulation(strategy, args.cycles)
            results.append(result)
            
            if args.verbose:
                print(f"   {strategy_name}: {result.trades} trades, {result.win_rate*100:.1f}% WR, ${result.total_pnl:+.2f}")
        
        if results:
            print_comparison_table(results)
            
            # Save results
            saved_results = load_results()
            saved_results[datetime.now().isoformat()] = {
                "type": "paper",
                "cycles": args.cycles,
                "results": [asdict(r) for r in results],
            }
            save_results(saved_results)
        return
    
    if args.compare:
        strategy_a, strategy_b = args.compare
        
        if strategy_a not in strategies or strategy_b not in strategies:
            print("❌ Unknown strategy specified")
            return
        
        print(f"\n📈 Comparing {strategy_a} vs {strategy_b}...")
        
        trades = load_historical_trades(args.days)
        
        result_a = backtest_strategy(strategies[strategy_a], trades)
        result_b = backtest_strategy(strategies[strategy_b], trades)
        
        print_comparison_table([result_a, result_b])
        
        # Statistical significance
        sig = statistical_significance(result_a, result_b)
        print("\n📊 Statistical Analysis")
        print("-" * 40)
        print(f"   Z-Score: {sig['z_score']}")
        print(f"   P-Value: {sig['p_value']}")
        print(f"   Significance: {sig['significance']}")
        print(f"   Win Rate Difference: {sig['win_rate_diff']}%")
        
        if sig['significant']:
            print(f"\n   ✅ {sig['winner']} is statistically better!")
        else:
            print(f"\n   ⚠️  No statistically significant difference")
        return
    
    if args.report:
        saved_results = load_results()
        
        if not saved_results:
            print("📭 No saved results. Run --backtest or --paper first.")
            return
        
        print("\n📋 A/B Testing History")
        print("=" * 60)
        
        for timestamp, data in sorted(saved_results.items(), reverse=True)[:5]:
            test_type = data.get("type", "unknown")
            results = data.get("results", [])
            
            ts = datetime.fromisoformat(timestamp)
            print(f"\n📅 {ts.strftime('%Y-%m-%d %H:%M')}")
            print(f"   Type: {test_type}")
            
            if test_type == "backtest":
                print(f"   Days: {data.get('days', 'N/A')}")
            elif test_type == "paper":
                print(f"   Cycles: {data.get('cycles', 'N/A')}")
            
            for r in results:
                print(f"   - {r['strategy']}: {r['win_rate']*100:.1f}% WR, ${r['total_pnl']:+.2f} PnL")
        return
    
    # Default: show help
    parser.print_help()


if __name__ == "__main__":
    main()
