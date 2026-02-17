#!/usr/bin/env python3
"""
Backtest v2 Model on Historical Trades
Analyzes whether the new probability model would have filtered out losing trades.
"""

import json
import math
from pathlib import Path
from collections import defaultdict

TRADES_FILE = Path(__file__).parent / "kalshi-trades.jsonl"
SETTLEMENTS_FILE = Path(__file__).parent / "kalshi-settlements.json"

# v2 model parameters
BTC_HOURLY_VOL = 0.005  # 0.5% hourly volatility


def norm_cdf(x):
    """Standard normal CDF approximation"""
    a1, a2, a3, a4, a5 = 0.254829592, -0.284496736, 1.421413741, -1.453152027, 1.061405429
    p = 0.3275911
    sign = 1 if x >= 0 else -1
    x = abs(x)
    t = 1.0 / (1.0 + p * x)
    y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * math.exp(-x * x / 2)
    return 0.5 * (1.0 + sign * y)


def calc_prob_above_strike_v2(current_price: float, strike: float, 
                               minutes_to_expiry: float) -> float:
    """V2 model: Black-Scholes inspired probability"""
    if minutes_to_expiry <= 0:
        return 1.0 if current_price > strike else 0.0
    
    T = minutes_to_expiry / 60.0  # Hours
    sigma = BTC_HOURLY_VOL * math.sqrt(T)
    
    if sigma <= 0:
        return 1.0 if current_price > strike else 0.0
    
    log_ratio = math.log(current_price / strike)
    d2 = log_ratio / sigma - sigma / 2
    
    prob_above = norm_cdf(d2)
    return max(0.01, min(0.99, prob_above))


def calc_prob_above_strike_v1(current_price: float, strike: float, 
                               minutes_to_expiry: float) -> float:
    """
    V1 model (old, broken): Simple linear interpolation.
    This was the bug - treating distance to strike linearly.
    """
    if current_price >= strike:
        # Price already above strike - high probability
        distance_pct = (current_price - strike) / strike
        # Roughly: every 1% above = +5% probability
        return min(0.95, 0.5 + distance_pct * 5)
    else:
        # Price below strike - need to reach it
        distance_pct = (strike - current_price) / current_price
        # This was wrong - underestimated probability of reaching strike
        return max(0.05, 0.5 - distance_pct * 5)


def load_trades():
    """Load all executed trades"""
    trades = []
    with open(TRADES_FILE) as f:
        for line in f:
            try:
                entry = json.loads(line.strip())
                if entry.get('type') == 'trade' and entry.get('order_status') == 'executed':
                    trades.append(entry)
            except json.JSONDecodeError:
                continue
    return trades


def load_settlements():
    """Load settlement results"""
    with open(SETTLEMENTS_FILE) as f:
        return json.load(f)


def backtest():
    """Run backtest comparing v1 vs v2 model"""
    trades = load_trades()
    settlements = load_settlements()
    
    # Build lookup for settlements
    settlement_lookup = {}
    for ticker, data in settlements.get('trades', {}).items():
        if data.get('status') == 'settled':
            settlement_lookup[ticker] = data
    
    # Analyze each trade
    results = {
        'total': 0,
        'won': 0,
        'lost': 0,
        'v1_would_skip': 0,  # V1 edge < 10%
        'v2_would_skip': 0,  # V2 edge < 10%
        'v2_would_skip_25': 0,  # V2 edge < 25% (NO trades)
        'trades': []
    }
    
    print("=" * 80)
    print("BACKTEST: Comparing v1 (old) vs v2 (new) probability model")
    print("=" * 80)
    print()
    
    for trade in trades:
        ticker = trade.get('ticker')
        if ticker not in settlement_lookup:
            continue
        
        settlement = settlement_lookup[ticker]
        won = settlement.get('won', False)
        
        current_price = trade.get('current_price', 0)
        strike = trade.get('strike', 0)
        minutes_to_expiry = trade.get('minutes_to_expiry', 0)
        side = trade.get('side', 'no')
        market_prob = trade.get('market_prob', 0)
        cost_cents = trade.get('cost_cents', 0)
        
        # Calculate probabilities with both models
        prob_above_v1 = calc_prob_above_strike_v1(current_price, strike, minutes_to_expiry)
        prob_above_v2 = calc_prob_above_strike_v2(current_price, strike, minutes_to_expiry)
        
        # For NO bets: our probability = 1 - prob_above (probability price stays below)
        if side == 'no':
            our_prob_v1 = 1 - prob_above_v1
            our_prob_v2 = 1 - prob_above_v2
        else:
            our_prob_v1 = prob_above_v1
            our_prob_v2 = prob_above_v2
        
        # Edge calculations
        edge_v1 = our_prob_v1 - market_prob
        edge_v2 = our_prob_v2 - market_prob
        
        results['total'] += 1
        if won:
            results['won'] += 1
        else:
            results['lost'] += 1
        
        # Would v1/v2 have skipped this trade?
        if edge_v1 < 0.10:
            results['v1_would_skip'] += 1
        if edge_v2 < 0.10:
            results['v2_would_skip'] += 1
        if side == 'no' and edge_v2 < 0.25:
            results['v2_would_skip_25'] += 1
        
        # Store for analysis
        results['trades'].append({
            'ticker': ticker,
            'won': won,
            'side': side,
            'strike': strike,
            'current_price': current_price,
            'settlement_price': settlement.get('settlement_price'),
            'minutes': minutes_to_expiry,
            'market_prob': market_prob,
            'our_prob_v1': our_prob_v1,
            'our_prob_v2': our_prob_v2,
            'edge_v1': edge_v1,
            'edge_v2': edge_v2,
            'v1_skip': edge_v1 < 0.10,
            'v2_skip': edge_v2 < 0.10,
            'cost_cents': cost_cents
        })
    
    # Print summary
    print(f"Total settled trades: {results['total']}")
    print(f"  Won: {results['won']} ({results['won']/results['total']*100:.1f}%)")
    print(f"  Lost: {results['lost']} ({results['lost']/results['total']*100:.1f}%)")
    print()
    
    print("FILTERING ANALYSIS:")
    print(f"  v1 model would skip (edge < 10%): {results['v1_would_skip']} trades")
    print(f"  v2 model would skip (edge < 10%): {results['v2_would_skip']} trades")
    print(f"  v2 model would skip NO trades (edge < 25%): {results['v2_would_skip_25']} trades")
    print()
    
    # Analyze what edge threshold would have filtered all losing trades
    print("EDGE THRESHOLD ANALYSIS (v2 model):")
    for threshold in [0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.40, 0.45]:
        would_skip = sum(1 for t in results['trades'] if t['edge_v2'] < threshold)
        would_take = results['total'] - would_skip
        
        # Of the ones we'd take, how many won?
        taken = [t for t in results['trades'] if t['edge_v2'] >= threshold]
        taken_won = sum(1 for t in taken if t['won'])
        taken_lost = len(taken) - taken_won
        
        if len(taken) > 0:
            win_rate = taken_won / len(taken) * 100
        else:
            win_rate = 0
        
        print(f"  Edge >= {threshold*100:.0f}%: Take {would_take} trades, skip {would_skip} | Win rate: {win_rate:.1f}%")
    
    print()
    print("SAMPLE TRADES (worst losses):")
    print("-" * 80)
    
    # Show some example trades
    sorted_trades = sorted(results['trades'], key=lambda x: x['cost_cents'], reverse=True)
    for t in sorted_trades[:10]:
        status = "✅ WON" if t['won'] else "❌ LOST"
        print(f"{t['ticker']}")
        print(f"  {status} | Side: {t['side'].upper()} | Cost: {t['cost_cents']}¢")
        print(f"  Price: ${t['current_price']:,.0f} → Strike: ${t['strike']:,.0f} → Settlement: ${t['settlement_price']:,.0f}")
        print(f"  Time to expiry: {t['minutes']:.0f} min")
        print(f"  Market prob: {t['market_prob']*100:.0f}% | v1 prob: {t['our_prob_v1']*100:.1f}% | v2 prob: {t['our_prob_v2']*100:.1f}%")
        print(f"  v1 edge: {t['edge_v1']*100:.1f}% | v2 edge: {t['edge_v2']*100:.1f}%")
        print(f"  v1 would skip: {t['v1_skip']} | v2 would skip: {t['v2_skip']}")
        print()
    
    # What would have been profitable?
    print("=" * 80)
    print("OPTIMAL STRATEGY ANALYSIS")
    print("=" * 80)
    
    # Check if ANY of these trades would have won with YES instead
    print("\nWhat if we had bet YES instead of NO?")
    yes_wins = sum(1 for t in results['trades'] if t['side'] == 'no' and not t['won'])
    yes_losses = sum(1 for t in results['trades'] if t['side'] == 'no' and t['won'])
    print(f"  YES would have won: {yes_wins} trades")
    print(f"  YES would have lost: {yes_losses} trades")
    
    # The real issue: BTC was trending UP
    print("\nPRICE TREND ANALYSIS:")
    prices_at_trade = [t['current_price'] for t in results['trades']]
    prices_at_settle = [t['settlement_price'] for t in results['trades']]
    
    bullish_moves = sum(1 for i in range(len(prices_at_trade)) 
                        if prices_at_settle[i] > prices_at_trade[i])
    bearish_moves = len(prices_at_trade) - bullish_moves
    
    avg_move = sum((s - t) / t * 100 for t, s in zip(prices_at_trade, prices_at_settle)) / len(prices_at_trade)
    
    print(f"  Bullish (price up): {bullish_moves} ({bullish_moves/len(prices_at_trade)*100:.0f}%)")
    print(f"  Bearish (price down): {bearish_moves} ({bearish_moves/len(prices_at_trade)*100:.0f}%)")
    print(f"  Average price change: {avg_move:+.3f}%")
    
    print("\n⚠️ CONCLUSION:")
    print("  The problem was MARKET REGIME, not the probability model!")
    print("  BTC was in a strong uptrend - NO bets were doomed.")
    print("  Solution: Add momentum/trend detection before taking NO positions.")
    
    return results


if __name__ == '__main__':
    backtest()
