#!/usr/bin/env python3
"""
Dry-run settlement tracker: Simulates settlements for paper trades.

Checks dry-run trades against actual market prices at settlement time.
Calculates simulated PnL for strategy testing.

Created: 2026-01-29
Task: T421
"""

import json
import os
import sys
import time
import requests
from pathlib import Path
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any

# File paths
DRYRUN_TRADES_FILE = Path(__file__).parent / "kalshi-trades-dryrun.jsonl"
DRYRUN_PORTFOLIO_FILE = Path(__file__).parent.parent / "data" / "trading" / "dryrun-portfolio.json"

# Starting capital for simulation
INITIAL_CAPITAL = 10.00  # $10 simulated


def load_dryrun_trades() -> list:
    """Load all dry-run trades."""
    trades = []
    if not DRYRUN_TRADES_FILE.exists():
        return trades
    
    with open(DRYRUN_TRADES_FILE, 'r') as f:
        for line in f:
            if not line.strip():
                continue
            try:
                entry = json.loads(line)
                if entry.get('type') == 'trade':
                    trades.append(entry)
            except json.JSONDecodeError:
                continue
    return trades


def get_asset_from_ticker(ticker: str) -> str:
    """Extract asset type from ticker."""
    if 'KXBTCD' in ticker:
        return 'BTC'
    elif 'KXETHD' in ticker:
        return 'ETH'
    elif 'KXSOLD' in ticker:
        return 'SOL'
    return 'unknown'


def parse_settlement_time(ticker: str) -> Optional[datetime]:
    """
    Parse settlement time from Kalshi ticker.
    Format: KXBTCD-26JAN2810-T89000.00
    Settlement is at the hour specified (e.g., 10:00 UTC on Jan 28, 2026).
    """
    try:
        parts = ticker.split('-')
        if len(parts) < 2:
            return None
        
        date_hour_part = parts[1]  # e.g., "26JAN2810"
        
        # Parse: DDMMMYYHH
        day = int(date_hour_part[:2])
        month_str = date_hour_part[2:5]
        year = int(date_hour_part[5:7]) + 2000
        hour = int(date_hour_part[7:9])
        
        month_map = {
            'JAN': 1, 'FEB': 2, 'MAR': 3, 'APR': 4,
            'MAY': 5, 'JUN': 6, 'JUL': 7, 'AUG': 8,
            'SEP': 9, 'OCT': 10, 'NOV': 11, 'DEC': 12
        }
        month = month_map.get(month_str.upper(), 1)
        
        return datetime(year, month, day, hour, 0, 0, tzinfo=timezone.utc)
    except Exception:
        return None


def parse_strike_price(ticker: str) -> Optional[float]:
    """
    Parse strike price from Kalshi ticker.
    Format: KXBTCD-26JAN2810-T89000.00 → 89000.00
    """
    try:
        parts = ticker.split('-T')
        if len(parts) < 2:
            return None
        return float(parts[1])
    except Exception:
        return None


def get_historical_price(asset: str, timestamp: datetime) -> Optional[float]:
    """Get crypto price at or near a specific timestamp using CryptoCompare."""
    symbol = asset.upper()
    
    # CryptoCompare historical hourly
    ts = int(timestamp.timestamp())
    url = f"https://min-api.cryptocompare.com/data/v2/histohour"
    params = {
        'fsym': symbol,
        'tsym': 'USD',
        'limit': 1,
        'toTs': ts
    }
    
    try:
        resp = requests.get(url, params=params, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if data.get('Response') == 'Success' and data.get('Data', {}).get('Data'):
                candles = data['Data']['Data']
                if candles:
                    # Return close price of the candle covering settlement time
                    return candles[-1].get('close')
    except Exception as e:
        print(f"   ⚠️ CryptoCompare error: {e}")
    
    # Fallback to CoinGecko range
    try:
        from_ts = ts - 3600
        to_ts = ts + 3600
        url = f"https://api.coingecko.com/api/v3/coins/{symbol.lower()}/market_chart/range"
        params = {'vs_currency': 'usd', 'from': from_ts, 'to': to_ts}
        resp = requests.get(url, params=params, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            prices = data.get('prices', [])
            if prices:
                # Find closest price to settlement time
                closest = min(prices, key=lambda p: abs(p[0]/1000 - ts))
                return closest[1]
    except Exception as e:
        print(f"   ⚠️ CoinGecko error: {e}")
    
    return None


def determine_settlement(strike: float, settlement_price: float, side: str) -> str:
    """
    Determine if trade won or lost based on settlement.
    YES wins if price >= strike at settlement.
    NO wins if price < strike at settlement.
    """
    price_at_or_above_strike = settlement_price >= strike
    
    if side.lower() == 'yes':
        return 'won' if price_at_or_above_strike else 'lost'
    else:  # NO
        return 'won' if not price_at_or_above_strike else 'lost'


def calculate_pnl(trade: Dict[str, Any], result: str) -> float:
    """Calculate PnL in dollars for a trade."""
    contracts = trade.get('contracts', 1)
    price_cents = trade.get('price_cents', 50)
    
    if result == 'won':
        # Win pays $1 per contract, minus cost
        return (100 - price_cents) * contracts / 100
    else:
        # Loss is the cost
        return -price_cents * contracts / 100


def load_portfolio() -> Dict[str, Any]:
    """Load or initialize portfolio state."""
    if DRYRUN_PORTFOLIO_FILE.exists():
        with open(DRYRUN_PORTFOLIO_FILE, 'r') as f:
            return json.load(f)
    
    return {
        'initial_capital': INITIAL_CAPITAL,
        'current_balance': INITIAL_CAPITAL,
        'total_trades': 0,
        'wins': 0,
        'losses': 0,
        'pending': 0,
        'total_pnl': 0.0,
        'settled_trades': {},  # ticker -> result
        'created_at': datetime.now(timezone.utc).isoformat(),
        'last_updated': None
    }


def save_portfolio(portfolio: Dict[str, Any]):
    """Save portfolio state."""
    DRYRUN_PORTFOLIO_FILE.parent.mkdir(parents=True, exist_ok=True)
    portfolio['last_updated'] = datetime.now(timezone.utc).isoformat()
    with open(DRYRUN_PORTFOLIO_FILE, 'w') as f:
        json.dump(portfolio, f, indent=2)


def update_dryrun_trade_result(ticker: str, result: str, settlement_price: float, pnl: float):
    """Update dry-run trade log with settlement result."""
    if not DRYRUN_TRADES_FILE.exists():
        return
    
    lines = []
    with open(DRYRUN_TRADES_FILE, 'r') as f:
        lines = f.readlines()
    
    updated = False
    with open(DRYRUN_TRADES_FILE, 'w') as f:
        for line in lines:
            if not line.strip():
                f.write(line)
                continue
            try:
                entry = json.loads(line)
                if entry.get('ticker') == ticker and entry.get('type') == 'trade':
                    if entry.get('result_status') is None:
                        entry['result_status'] = result
                        entry['settlement_price'] = settlement_price
                        entry['realized_pnl'] = pnl
                        entry['settled_at'] = datetime.now(timezone.utc).isoformat()
                        updated = True
                f.write(json.dumps(entry) + '\n')
            except json.JSONDecodeError:
                f.write(line)
    
    return updated


def process_settlements():
    """Process all pending dry-run trade settlements."""
    trades = load_dryrun_trades()
    portfolio = load_portfolio()
    now = datetime.now(timezone.utc)
    
    print("\n" + "="*60)
    print("🧪 DRY-RUN SETTLEMENT TRACKER")
    print("="*60)
    print(f"\nTime: {now.strftime('%Y-%m-%d %H:%M:%S')} UTC")
    print(f"Loaded {len(trades)} dry-run trades")
    
    pending = []
    newly_settled = 0
    
    for trade in trades:
        ticker = trade.get('ticker', '')
        
        # Skip if already settled
        if trade.get('result_status') in ('won', 'lost'):
            continue
        
        # Skip if already processed in portfolio
        if ticker in portfolio.get('settled_trades', {}):
            continue
        
        settlement_time = parse_settlement_time(ticker)
        if not settlement_time:
            continue
        
        # Check if settlement time has passed
        if settlement_time > now:
            pending.append(trade)
            continue
        
        # Process settlement
        strike = parse_strike_price(ticker)
        if not strike:
            continue
        
        asset = get_asset_from_ticker(ticker)
        side = trade.get('side', 'no')
        
        print(f"\n📊 Processing: {ticker}")
        print(f"   Asset: {asset}, Side: {side.upper()}, Strike: ${strike:,.2f}")
        print(f"   Settlement: {settlement_time.strftime('%Y-%m-%d %H:%M')} UTC")
        
        # Get historical price at settlement
        settlement_price = get_historical_price(asset, settlement_time)
        
        if settlement_price is None:
            print(f"   ⚠️ Could not get price at settlement time")
            pending.append(trade)
            continue
        
        print(f"   Settlement Price: ${settlement_price:,.2f}")
        
        # Determine result
        result = determine_settlement(strike, settlement_price, side)
        pnl = calculate_pnl(trade, result)
        
        emoji = "✅" if result == 'won' else "❌"
        print(f"   {emoji} Result: {result.upper()}, PnL: ${pnl:+.2f}")
        
        # Update portfolio
        portfolio['total_trades'] = portfolio.get('total_trades', 0) + 1
        if result == 'won':
            portfolio['wins'] = portfolio.get('wins', 0) + 1
        else:
            portfolio['losses'] = portfolio.get('losses', 0) + 1
        
        portfolio['total_pnl'] = portfolio.get('total_pnl', 0) + pnl
        portfolio['current_balance'] = portfolio.get('current_balance', INITIAL_CAPITAL) + pnl
        portfolio['settled_trades'][ticker] = {
            'result': result,
            'pnl': pnl,
            'settlement_price': settlement_price,
            'settled_at': now.isoformat()
        }
        
        # Update trade log
        update_dryrun_trade_result(ticker, result, settlement_price, pnl)
        newly_settled += 1
    
    portfolio['pending'] = len(pending)
    save_portfolio(portfolio)
    
    # Summary
    print("\n" + "-"*60)
    print("📈 DRY-RUN PORTFOLIO SUMMARY")
    print("-"*60)
    print(f"Initial Capital:  ${portfolio['initial_capital']:.2f}")
    print(f"Current Balance:  ${portfolio['current_balance']:.2f}")
    print(f"Total PnL:        ${portfolio['total_pnl']:+.2f}")
    print(f"ROI:              {(portfolio['total_pnl']/portfolio['initial_capital']*100):+.1f}%")
    print()
    print(f"Total Trades:     {portfolio['total_trades']}")
    print(f"Wins:             {portfolio['wins']}")
    print(f"Losses:           {portfolio['losses']}")
    if portfolio['total_trades'] > 0:
        print(f"Win Rate:         {portfolio['wins']/portfolio['total_trades']*100:.1f}%")
    print(f"Pending:          {len(pending)}")
    print(f"Newly Settled:    {newly_settled}")
    print("="*60 + "\n")
    
    print(f"📄 Portfolio saved to: {DRYRUN_PORTFOLIO_FILE}")


def compare_real_vs_dryrun():
    """Compare dry-run performance vs real trading (if data exists)."""
    # Load real trades
    real_trades_file = Path(__file__).parent / "kalshi-trades.jsonl"
    if not real_trades_file.exists():
        return
    
    real_trades = []
    with open(real_trades_file, 'r') as f:
        for line in f:
            try:
                entry = json.loads(line)
                if entry.get('type') == 'trade' and entry.get('result_status') in ('won', 'lost'):
                    real_trades.append(entry)
            except:
                continue
    
    if not real_trades:
        return
    
    portfolio = load_portfolio()
    if portfolio['total_trades'] == 0:
        return
    
    # Calculate real stats
    real_wins = sum(1 for t in real_trades if t.get('result_status') == 'won')
    real_total = len(real_trades)
    real_pnl = sum(
        (100 - t.get('price_cents', 50)) * t.get('contracts', 1) / 100
        if t.get('result_status') == 'won'
        else -t.get('price_cents', 50) * t.get('contracts', 1) / 100
        for t in real_trades
    )
    
    print("\n" + "="*60)
    print("📊 REAL vs DRY-RUN COMPARISON")
    print("="*60)
    print(f"\n{'Metric':<20} {'Real':>15} {'Dry-Run':>15} {'Delta':>15}")
    print("-"*60)
    
    dr_wr = portfolio['wins']/portfolio['total_trades']*100 if portfolio['total_trades'] > 0 else 0
    real_wr = real_wins/real_total*100 if real_total > 0 else 0
    
    print(f"{'Total Trades':<20} {real_total:>15} {portfolio['total_trades']:>15} {portfolio['total_trades']-real_total:>+15}")
    print(f"{'Win Rate':<20} {real_wr:>14.1f}% {dr_wr:>14.1f}% {dr_wr-real_wr:>+14.1f}%")
    print(f"{'Total PnL':<20} ${real_pnl:>13.2f} ${portfolio['total_pnl']:>13.2f} ${portfolio['total_pnl']-real_pnl:>+13.2f}")
    print("="*60 + "\n")


def main():
    if '--compare' in sys.argv:
        compare_real_vs_dryrun()
    else:
        process_settlements()
        compare_real_vs_dryrun()


if __name__ == "__main__":
    main()
