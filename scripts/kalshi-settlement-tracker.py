#!/usr/bin/env python3
"""
Kalshi Settlement Tracker
Tracks BTC price at contract expiry times to calculate actual win/loss.

Contract ticker format: KXBTCD-[DATE][HOUR]-T[STRIKE]
Example: KXBTCD-26JAN2804-T88499.99 = Jan 28 2026, 4:00 UTC, strike $88,500
"""

import json
import sys
import re
import time
from datetime import datetime, timezone, timedelta
from pathlib import Path
import urllib.request
import urllib.error

TRADES_FILE = Path(__file__).parent / "kalshi-trades.jsonl"
SETTLEMENTS_FILE = Path(__file__).parent / "kalshi-settlements.json"

def parse_ticker(ticker: str) -> dict:
    """
    Parse Kalshi BTC ticker to extract expiry time and strike.
    Example: KXBTCD-26JAN2804-T88499.99
    
    Format: KXBTCD-[YY][MMM][DD][HH]-T[STRIKE]
    where YY=year (20YY), MMM=month, DD=day, HH=hour (ET timezone)
    """
    match = re.match(r'KXBTCD-(\d{2})([A-Z]{3})(\d{2})(\d{2})-T(\d+\.?\d*)', ticker)
    if not match:
        return None
    
    year_short, month_str, day, hour_et, strike = match.groups()
    
    month_map = {
        'JAN': 1, 'FEB': 2, 'MAR': 3, 'APR': 4, 'MAY': 5, 'JUN': 6,
        'JUL': 7, 'AUG': 8, 'SEP': 9, 'OCT': 10, 'NOV': 11, 'DEC': 12
    }
    
    year = 2000 + int(year_short)
    month = month_map.get(month_str, 1)
    day = int(day)
    hour_et = int(hour_et)
    
    # Kalshi uses ET (Eastern Time) for contract expiry
    # January = EST (UTC-5), so add 5 hours to get UTC
    # March-Nov (mostly) = EDT (UTC-4)
    # For simplicity, assume EST (UTC-5) for now
    hour_utc = hour_et + 5
    day_adj = day
    month_adj = month
    year_adj = year
    
    if hour_utc >= 24:
        hour_utc -= 24
        day_adj += 1
        
        # Handle month rollover
        import calendar
        days_in_month = calendar.monthrange(year_adj, month_adj)[1]
        if day_adj > days_in_month:
            day_adj = 1
            month_adj += 1
            if month_adj > 12:
                month_adj = 1
                year_adj += 1
    
    expiry_time = datetime(year_adj, month_adj, day_adj, hour_utc, 0, 0, tzinfo=timezone.utc)
    
    return {
        'expiry_time': expiry_time,
        'strike': float(strike),
        'expiry_hour_et': hour_et,
        'expiry_date': f"{year}-{month:02d}-{day:02d}"
    }


def get_btc_price_at_time(target_time: datetime) -> float:
    """
    Get BTC price at a specific historical time using CoinGecko API.
    Uses hourly granularity for accuracy.
    """
    # CoinGecko market_chart/range endpoint
    # from/to are UNIX timestamps
    start_ts = int((target_time - timedelta(minutes=5)).timestamp())
    end_ts = int((target_time + timedelta(minutes=5)).timestamp())
    
    url = f"https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=usd&from={start_ts}&to={end_ts}"
    
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())
            
            if not data.get('prices'):
                return None
            
            # Find price closest to target time
            target_ts = target_time.timestamp() * 1000  # CoinGecko uses milliseconds
            prices = data['prices']
            
            closest = min(prices, key=lambda p: abs(p[0] - target_ts))
            return closest[1]
            
    except (urllib.error.URLError, json.JSONDecodeError) as e:
        print(f"  Error fetching price: {e}")
        return None


def get_btc_price_binance(target_time: datetime) -> float:
    """
    Get BTC price at a specific time using Binance klines API (backup).
    """
    start_ts = int(target_time.timestamp() * 1000)
    end_ts = start_ts + 60000  # 1 minute later
    
    url = f"https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&startTime={start_ts}&endTime={end_ts}&limit=1"
    
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())
            
            if data and len(data) > 0:
                # Kline format: [open_time, open, high, low, close, ...]
                # Use close price
                return float(data[0][4])
            return None
            
    except (urllib.error.URLError, json.JSONDecodeError) as e:
        print(f"  Binance error: {e}")
        return None


def get_btc_price_cryptocompare(target_time: datetime) -> float:
    """
    Get BTC price at a specific time using CryptoCompare API (no auth needed).
    """
    ts = int(target_time.timestamp())
    
    url = f"https://min-api.cryptocompare.com/data/v2/histominute?fsym=BTC&tsym=USD&limit=1&toTs={ts}"
    
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())
            
            if data.get('Response') == 'Success' and data.get('Data', {}).get('Data'):
                # Use close price from the last data point
                prices = data['Data']['Data']
                if prices:
                    return float(prices[-1]['close'])
            return None
            
    except (urllib.error.URLError, json.JSONDecodeError) as e:
        print(f"  CryptoCompare error: {e}")
        return None


def determine_outcome(trade: dict, settlement_price: float) -> dict:
    """
    Determine if a trade won or lost based on settlement price.
    
    For BTC contracts:
    - YES wins if final_price >= strike
    - NO wins if final_price < strike
    """
    strike = trade.get('strike')
    side = trade.get('side', '').lower()
    contracts = trade.get('contracts', 0)
    price_cents = trade.get('price_cents', 0)
    cost_cents = trade.get('cost_cents', 0)
    
    if settlement_price >= strike:
        # YES wins
        if side == 'yes':
            won = True
            payout_cents = contracts * 100  # $1 per contract
            pnl_cents = payout_cents - cost_cents
        else:  # NO loses
            won = False
            payout_cents = 0
            pnl_cents = -cost_cents
    else:
        # NO wins
        if side == 'no':
            won = True
            payout_cents = contracts * 100
            pnl_cents = payout_cents - cost_cents
        else:  # YES loses
            won = False
            payout_cents = 0
            pnl_cents = -cost_cents
    
    return {
        'won': won,
        'payout_cents': payout_cents,
        'pnl_cents': pnl_cents,
        'settlement_price': settlement_price,
        'strike': strike,
        'side': side
    }


def load_settlements() -> dict:
    """Load existing settlements data."""
    if SETTLEMENTS_FILE.exists():
        try:
            with open(SETTLEMENTS_FILE) as f:
                return json.load(f)
        except json.JSONDecodeError:
            return {}
    return {}


def save_settlements(data: dict):
    """Save settlements data."""
    with open(SETTLEMENTS_FILE, 'w') as f:
        json.dump(data, f, indent=2, default=str)


def process_settlements():
    """Process all pending trades and determine outcomes."""
    now = datetime.now(timezone.utc)
    settlements = load_settlements()
    
    if 'trades' not in settlements:
        settlements['trades'] = {}
    if 'summary' not in settlements:
        settlements['summary'] = {'wins': 0, 'losses': 0, 'pending': 0, 'total_pnl_cents': 0}
    
    # Load all trades
    pending_trades = []
    with open(TRADES_FILE) as f:
        for line in f:
            try:
                entry = json.loads(line.strip())
                if entry.get('type') == 'trade' and entry.get('order_status') == 'executed':
                    ticker = entry.get('ticker')
                    # Skip if already processed
                    if ticker not in settlements['trades']:
                        pending_trades.append(entry)
            except json.JSONDecodeError:
                continue
    
    if not pending_trades:
        print("No new pending trades to process.")
        print(f"\nCurrent stats:")
        print(f"  Wins: {settlements['summary']['wins']}")
        print(f"  Losses: {settlements['summary']['losses']}")
        print(f"  Pending: {settlements['summary']['pending']}")
        print(f"  Total PnL: ${settlements['summary']['total_pnl_cents']/100:.2f}")
        return settlements
    
    print(f"Processing {len(pending_trades)} pending trades...")
    
    newly_settled = 0
    still_pending = 0
    
    for trade in pending_trades:
        ticker = trade.get('ticker')
        parsed = parse_ticker(ticker)
        
        if not parsed:
            print(f"  Skipping unparseable ticker: {ticker}")
            continue
        
        expiry_time = parsed['expiry_time']
        
        # Check if expiry has passed
        if expiry_time > now:
            still_pending += 1
            settlements['trades'][ticker] = {
                'status': 'pending',
                'expiry_time': expiry_time.isoformat(),
                'trade': trade
            }
            continue
        
        # Expiry has passed - get settlement price
        print(f"\n  Processing: {ticker}")
        print(f"    Expiry: {expiry_time.isoformat()}")
        print(f"    Strike: ${parsed['strike']:,.2f}")
        print(f"    Side: {trade.get('side')} @ {trade.get('price_cents')}¢")
        
        # Try multiple sources to get settlement price
        # Add delay to avoid rate limiting
        time.sleep(2)
        settlement_price = get_btc_price_at_time(expiry_time)
        if settlement_price is None:
            time.sleep(1.5)
            settlement_price = get_btc_price_cryptocompare(expiry_time)
        if settlement_price is None:
            time.sleep(1)
            settlement_price = get_btc_price_binance(expiry_time)
        
        if settlement_price is None:
            print(f"    Could not get settlement price - marking for retry")
            settlements['trades'][ticker] = {
                'status': 'price_fetch_failed',
                'expiry_time': expiry_time.isoformat(),
                'trade': trade
            }
            continue
        
        # Determine outcome
        outcome = determine_outcome(trade, settlement_price)
        
        print(f"    Settlement price: ${settlement_price:,.2f}")
        print(f"    Result: {'✅ WIN' if outcome['won'] else '❌ LOSS'}")
        print(f"    PnL: ${outcome['pnl_cents']/100:.2f}")
        
        settlements['trades'][ticker] = {
            'status': 'settled',
            'expiry_time': expiry_time.isoformat(),
            'settlement_price': settlement_price,
            'won': outcome['won'],
            'pnl_cents': outcome['pnl_cents'],
            'payout_cents': outcome['payout_cents'],
            'trade': trade
        }
        
        # Update summary
        if outcome['won']:
            settlements['summary']['wins'] += 1
        else:
            settlements['summary']['losses'] += 1
        settlements['summary']['total_pnl_cents'] += outcome['pnl_cents']
        
        newly_settled += 1
    
    settlements['summary']['pending'] = still_pending
    settlements['summary']['last_updated'] = now.isoformat()
    
    # Save
    save_settlements(settlements)
    
    # Print summary
    print(f"\n{'='*50}")
    print(f"Settlement Summary")
    print(f"{'='*50}")
    print(f"Newly settled: {newly_settled}")
    print(f"Still pending: {still_pending}")
    print(f"\nOverall Stats:")
    print(f"  Wins: {settlements['summary']['wins']}")
    print(f"  Losses: {settlements['summary']['losses']}")
    total = settlements['summary']['wins'] + settlements['summary']['losses']
    if total > 0:
        win_rate = settlements['summary']['wins'] / total * 100
        print(f"  Win Rate: {win_rate:.1f}%")
    print(f"  Total PnL: ${settlements['summary']['total_pnl_cents']/100:.2f}")
    
    return settlements


def main():
    if len(sys.argv) > 1 and sys.argv[1] == '--stats':
        # Just show stats
        settlements = load_settlements()
        summary = settlements.get('summary', {})
        print(f"Wins: {summary.get('wins', 0)}")
        print(f"Losses: {summary.get('losses', 0)}")
        total = summary.get('wins', 0) + summary.get('losses', 0)
        if total > 0:
            print(f"Win Rate: {summary.get('wins', 0) / total * 100:.1f}%")
        print(f"PnL: ${summary.get('total_pnl_cents', 0)/100:.2f}")
        print(f"Pending: {summary.get('pending', 0)}")
    else:
        process_settlements()


if __name__ == '__main__':
    main()
