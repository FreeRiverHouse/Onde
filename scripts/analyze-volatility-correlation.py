#!/usr/bin/env python3
"""
Analyze trade win rate correlation with BTC/ETH volatility.

Buckets trades by hourly volatility at trade time and compares win rates.
Uses cached OHLC data or fetches from CoinGecko if needed.
"""

import json
import os
from datetime import datetime, timezone, timedelta
from collections import defaultdict
import statistics

TRADES_FILE = os.path.expanduser("~/Projects/Onde/scripts/kalshi-trades.jsonl")
TRADES_V2_FILE = os.path.expanduser("~/Projects/Onde/scripts/kalshi-trades-v2.jsonl")
OHLC_DIR = os.path.expanduser("~/Projects/Onde/data/ohlc")

# Volatility buckets (% hourly move)
VOL_BUCKETS = {
    "very_low": (0, 0.3),      # <0.3% hourly move
    "low": (0.3, 0.5),          # 0.3-0.5%
    "medium": (0.5, 1.0),       # 0.5-1.0%
    "high": (1.0, 2.0),         # 1.0-2.0%
    "very_high": (2.0, float('inf'))  # >2%
}

def load_ohlc_data(asset="btc"):
    """Load cached OHLC data."""
    filepath = os.path.join(OHLC_DIR, f"{asset}-ohlc.json")
    if not os.path.exists(filepath):
        print(f"⚠️  No cached OHLC for {asset}. Run cache-ohlc-data.py first.")
        return []
    
    with open(filepath, 'r') as f:
        data = json.load(f)
        return data.get('candles', [])

def calculate_hourly_volatility(ohlc_data, timestamp):
    """
    Calculate realized volatility around a specific timestamp.
    Uses the high-low range of nearby candles.
    """
    if not ohlc_data:
        return None
    
    # Find candles within ±8 hours of trade time (4h candles, so wider window)
    trade_time = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
    nearby_candles = []
    
    for candle in ohlc_data:
        # Handle both ms timestamp and ISO datetime formats
        if 'datetime' in candle:
            candle_time = datetime.fromisoformat(candle['datetime'].replace('Z', '+00:00'))
        elif isinstance(candle.get('timestamp'), int):
            candle_time = datetime.fromtimestamp(candle['timestamp'] / 1000, tz=timezone.utc)
        else:
            continue
            
        if abs((candle_time - trade_time).total_seconds()) <= 28800:  # 8 hours for 4h candles
            nearby_candles.append(candle)
    
    if not nearby_candles:
        return None
    
    # Calculate average high-low range as % of price
    ranges = []
    for candle in nearby_candles:
        if candle['high'] and candle['low'] and candle['close']:
            range_pct = (candle['high'] - candle['low']) / candle['close'] * 100
            ranges.append(range_pct)
    
    return statistics.mean(ranges) if ranges else None

def load_trades():
    """Load trades from both v1 and v2 trade logs."""
    trades = []
    
    # Try v2 first (has more data fields)
    for filepath in [TRADES_V2_FILE, TRADES_FILE]:
        if os.path.exists(filepath):
            with open(filepath, 'r') as f:
                for line in f:
                    try:
                        record = json.loads(line.strip())
                        if record.get('type') == 'trade':
                            trades.append(record)
                    except json.JSONDecodeError:
                        continue
    
    return trades

def determine_outcome(trade):
    """Determine if trade won or lost."""
    status = trade.get('result_status', '')
    if status in ['won', 'win']:
        return 'win'
    elif status in ['lost', 'loss']:
        return 'loss'
    return 'pending'

def get_vol_bucket(vol_pct):
    """Determine which volatility bucket a trade falls into."""
    if vol_pct is None:
        return 'unknown'
    
    for bucket, (low, high) in VOL_BUCKETS.items():
        if low <= vol_pct < high:
            return bucket
    return 'very_high'

def analyze():
    """Main analysis."""
    print("=" * 60)
    print("📊 TRADE WIN RATE vs VOLATILITY CORRELATION")
    print("=" * 60)
    
    # Load data
    trades = load_trades()
    btc_ohlc = load_ohlc_data('btc')
    eth_ohlc = load_ohlc_data('eth')
    
    if not trades:
        print("❌ No trades found!")
        return
    
    print(f"\n📈 Loaded {len(trades)} trades")
    print(f"📊 BTC OHLC: {len(btc_ohlc)} candles")
    print(f"📊 ETH OHLC: {len(eth_ohlc)} candles")
    
    # Bucket trades by volatility
    bucket_stats = defaultdict(lambda: {'wins': 0, 'losses': 0, 'pending': 0, 'pnl': 0, 'vols': []})
    
    settled_trades = 0
    vol_computed = 0
    
    for trade in trades:
        # Determine asset
        ticker = trade.get('ticker', '')
        asset = 'eth' if 'KXETHD' in ticker else 'btc'
        ohlc_data = eth_ohlc if asset == 'eth' else btc_ohlc
        
        # Calculate volatility at trade time
        timestamp = trade.get('timestamp', '')
        vol = calculate_hourly_volatility(ohlc_data, timestamp) if timestamp else None
        
        if vol is not None:
            vol_computed += 1
        
        bucket = get_vol_bucket(vol)
        outcome = determine_outcome(trade)
        
        if outcome != 'pending':
            settled_trades += 1
        
        if outcome == 'win':
            bucket_stats[bucket]['wins'] += 1
        elif outcome == 'loss':
            bucket_stats[bucket]['losses'] += 1
        else:
            bucket_stats[bucket]['pending'] += 1
        
        # Calculate PnL
        price = trade.get('price_cents', 0)
        contracts = trade.get('contracts', 1)
        side = trade.get('side', 'no')
        
        if outcome == 'win':
            pnl = (100 - price) * contracts if side == 'yes' else (100 - price) * contracts
        elif outcome == 'loss':
            pnl = -price * contracts
        else:
            pnl = 0
        
        bucket_stats[bucket]['pnl'] += pnl
        if vol is not None:
            bucket_stats[bucket]['vols'].append(vol)
    
    print(f"\n✅ Volatility computed for {vol_computed}/{len(trades)} trades")
    print(f"✅ Settled trades: {settled_trades}")
    
    # Print results by bucket
    print("\n" + "=" * 60)
    print("📊 PERFORMANCE BY VOLATILITY BUCKET")
    print("=" * 60)
    print(f"\n{'Bucket':<12} {'Range':<12} {'Trades':<8} {'Win Rate':<10} {'PnL':<10} {'Avg Vol':<10}")
    print("-" * 62)
    
    bucket_order = ['very_low', 'low', 'medium', 'high', 'very_high', 'unknown']
    
    for bucket in bucket_order:
        if bucket not in bucket_stats:
            continue
        
        stats = bucket_stats[bucket]
        wins = stats['wins']
        losses = stats['losses']
        pending = stats['pending']
        total = wins + losses + pending
        settled = wins + losses
        
        win_rate = (wins / settled * 100) if settled > 0 else 0
        pnl = stats['pnl']
        avg_vol = statistics.mean(stats['vols']) if stats['vols'] else 0
        
        range_str = f"{VOL_BUCKETS.get(bucket, (0,0))[0]}-{VOL_BUCKETS.get(bucket, (0,0))[1]}%" if bucket != 'unknown' else "N/A"
        
        # Color coding
        if win_rate >= 55:
            wr_indicator = "🟢"
        elif win_rate >= 45:
            wr_indicator = "🟡"
        else:
            wr_indicator = "🔴"
        
        pnl_str = f"${pnl/100:.2f}" if pnl >= 0 else f"-${abs(pnl)/100:.2f}"
        
        print(f"{bucket:<12} {range_str:<12} {total:<8} {wr_indicator}{win_rate:>5.1f}%    {pnl_str:<10} {avg_vol:.2f}%")
    
    # Statistical insights
    print("\n" + "=" * 60)
    print("🔍 INSIGHTS")
    print("=" * 60)
    
    # Compare low vol vs high vol performance
    low_vol = {**bucket_stats.get('very_low', {}), **bucket_stats.get('low', {})}
    high_vol = {**bucket_stats.get('high', {}), **bucket_stats.get('very_high', {})}
    
    low_wins = bucket_stats.get('very_low', {}).get('wins', 0) + bucket_stats.get('low', {}).get('wins', 0)
    low_losses = bucket_stats.get('very_low', {}).get('losses', 0) + bucket_stats.get('low', {}).get('losses', 0)
    high_wins = bucket_stats.get('high', {}).get('wins', 0) + bucket_stats.get('very_high', {}).get('wins', 0)
    high_losses = bucket_stats.get('high', {}).get('losses', 0) + bucket_stats.get('very_high', {}).get('losses', 0)
    
    low_wr = (low_wins / (low_wins + low_losses) * 100) if (low_wins + low_losses) > 0 else 0
    high_wr = (high_wins / (high_wins + high_losses) * 100) if (high_wins + high_losses) > 0 else 0
    
    print(f"\n📉 Low volatility (<0.5%) win rate: {low_wr:.1f}% ({low_wins}W/{low_losses}L)")
    print(f"📈 High volatility (>1.0%) win rate: {high_wr:.1f}% ({high_wins}W/{high_losses}L)")
    
    if high_wr > low_wr + 5:
        print("\n💡 Strategy performs BETTER in high volatility - consider increasing")
        print("   position size during volatile periods.")
    elif low_wr > high_wr + 5:
        print("\n💡 Strategy performs BETTER in low volatility - consider reducing")
        print("   position size during volatile periods.")
    else:
        print("\n💡 No significant volatility edge detected. Strategy appears")
        print("   robust across different volatility regimes.")
    
    # Save results
    results = {
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'total_trades': len(trades),
        'settled_trades': settled_trades,
        'vol_computed': vol_computed,
        'bucket_stats': {k: {kk: vv for kk, vv in v.items() if kk != 'vols'} for k, v in bucket_stats.items()},
        'low_vol_win_rate': low_wr,
        'high_vol_win_rate': high_wr,
        'volatility_edge': 'high_vol' if high_wr > low_wr + 5 else 'low_vol' if low_wr > high_wr + 5 else 'none'
    }
    
    output_path = os.path.expanduser("~/Projects/Onde/data/trading/volatility-correlation.json")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n📁 Results saved to: {output_path}")

if __name__ == '__main__':
    analyze()
