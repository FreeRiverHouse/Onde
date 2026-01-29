#!/usr/bin/env python3
"""
Weather Market Settlement Tracker

Tracks actual temperatures vs our predictions to settle weather trades.

Ticker format: KXHIGH[CITY]-[YY][MMM][DD]-B[TEMP]
Examples:
- KXHIGHCHI-26JAN29-B16.5 = Chicago high temp, Jan 29 2026, threshold 16.5°F
- KXHIGHNY-26JAN29-B23.5 = NYC high temp, Jan 29 2026, threshold 23.5°F

Settlement source: NWS Climatological Data (official)

Author: Clawd
Date: 2026-01-29
"""

import json
import re
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path
import urllib.request
import urllib.error

TRADES_FILE_V2 = Path(__file__).parent / "kalshi-trades-v2.jsonl"
SETTLEMENTS_FILE = Path(__file__).parent / "weather-settlements.json"

# City code mappings for NWS
CITY_CODES = {
    "NYC": {"name": "New York City", "station": "KNYC"},
    "NY": {"name": "New York City", "station": "KNYC"},
    "CHI": {"name": "Chicago", "station": "KORD"},
    "MIA": {"name": "Miami", "station": "KMIA"},
    "DEN": {"name": "Denver", "station": "KDEN"},
    "LAX": {"name": "Los Angeles", "station": "KLAX"},
    "HOU": {"name": "Houston", "station": "KIAH"},
    "AUS": {"name": "Austin", "station": "KAUS"},
    "PHI": {"name": "Philadelphia", "station": "KPHL"},
    "SFO": {"name": "San Francisco", "station": "KSFO"},
}


def parse_weather_ticker(ticker: str) -> dict:
    """
    Parse Kalshi weather ticker.
    
    Format: KXHIGH[CITY]-[YY][MMM][DD]-B[TEMP]
    Examples:
    - KXHIGHCHI-26JAN29-B16.5
    - KXHIGHNY-26JAN29-B23.5
    - KXLOWDEN-26JAN30-B25 (low temp markets)
    """
    # High temp pattern
    high_match = re.match(r'KXHIGH([A-Z]+)-(\d{2})([A-Z]{3})(\d{2})-B([\d.]+)', ticker)
    low_match = re.match(r'KXLOW([A-Z]+)-(\d{2})([A-Z]{3})(\d{2})-B([\d.]+)', ticker)
    
    if high_match:
        city, year_short, month_str, day, threshold = high_match.groups()
        market_type = "high"
    elif low_match:
        city, year_short, month_str, day, threshold = low_match.groups()
        market_type = "low"
    else:
        return None
    
    month_map = {
        'JAN': 1, 'FEB': 2, 'MAR': 3, 'APR': 4, 'MAY': 5, 'JUN': 6,
        'JUL': 7, 'AUG': 8, 'SEP': 9, 'OCT': 10, 'NOV': 11, 'DEC': 12
    }
    
    year = 2000 + int(year_short)
    month = month_map.get(month_str, 1)
    day = int(day)
    threshold = float(threshold)
    
    # Settlement is at end of day (usually midnight local, but we use 23:59 to be safe)
    settlement_date = datetime(year, month, day, 23, 59, 0, tzinfo=timezone.utc)
    
    return {
        "city": city,
        "city_name": CITY_CODES.get(city, {}).get("name", city),
        "station": CITY_CODES.get(city, {}).get("station", f"K{city}"),
        "market_type": market_type,  # "high" or "low"
        "threshold": threshold,
        "settlement_date": settlement_date,
        "year": year,
        "month": month,
        "day": day,
    }


def get_actual_temp_nws(city: str, date: datetime, market_type: str = "high") -> float:
    """
    Fetch actual high/low temperature from NWS for a given city and date.
    
    Uses NWS Climate Data API (GHCN-Daily via weather.gov)
    Settlement uses official NWS Climatological Report (LCD).
    """
    station_id = CITY_CODES.get(city, {}).get("station", f"K{city}")
    
    # Format date for API
    date_str = date.strftime("%Y-%m-%d")
    
    # Try NWS observation history
    # API: https://api.weather.gov/stations/{station}/observations
    url = f"https://api.weather.gov/stations/{station_id}/observations"
    
    try:
        req = urllib.request.Request(url, headers={
            "User-Agent": "(Weather-Settlement-Tracker, research@example.com)",
            "Accept": "application/geo+json"
        })
        
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())
            
        # Find observations for the target date
        observations = data.get("features", [])
        temps = []
        
        for obs in observations:
            props = obs.get("properties", {})
            obs_time = props.get("timestamp", "")
            
            if date_str in obs_time:
                temp_c = props.get("temperature", {}).get("value")
                if temp_c is not None:
                    # Convert Celsius to Fahrenheit
                    temp_f = (temp_c * 9/5) + 32
                    temps.append(temp_f)
        
        if temps:
            if market_type == "high":
                return max(temps)
            else:
                return min(temps)
                
    except Exception as e:
        print(f"❌ Error fetching NWS data for {city}: {e}")
    
    return None


def get_actual_temp_oikolab(city: str, date: datetime, market_type: str = "high") -> float:
    """
    Fallback: Use Open-Meteo historical API
    https://archive-api.open-meteo.com/v1/archive
    """
    city_coords = {
        "NYC": (40.7829, -73.9654),
        "NY": (40.7829, -73.9654),
        "CHI": (41.8781, -87.6298),
        "MIA": (25.7617, -80.1918),
        "DEN": (39.7392, -104.9903),
        "LAX": (34.0522, -118.2437),
        "HOU": (29.7604, -95.3698),
        "AUS": (30.2672, -97.7431),
        "PHI": (39.9526, -75.1652),
        "SFO": (37.7749, -122.4194),
    }
    
    if city not in city_coords:
        return None
        
    lat, lon = city_coords[city]
    date_str = date.strftime("%Y-%m-%d")
    
    url = f"https://archive-api.open-meteo.com/v1/archive?latitude={lat}&longitude={lon}&start_date={date_str}&end_date={date_str}&daily=temperature_2m_max,temperature_2m_min&timezone=America%2FNew_York&temperature_unit=fahrenheit"
    
    try:
        with urllib.request.urlopen(url, timeout=10) as resp:
            data = json.loads(resp.read().decode())
            
        daily = data.get("daily", {})
        if market_type == "high":
            temps = daily.get("temperature_2m_max", [])
        else:
            temps = daily.get("temperature_2m_min", [])
            
        if temps and temps[0] is not None:
            return temps[0]
            
    except Exception as e:
        print(f"❌ Error fetching Open-Meteo data for {city}: {e}")
    
    return None


def get_actual_temperature(city: str, date: datetime, market_type: str = "high") -> float:
    """Get actual temperature, trying multiple sources."""
    
    # Try NWS first (official settlement source)
    temp = get_actual_temp_nws(city, date, market_type)
    if temp is not None:
        return temp
    
    # Fallback to Open-Meteo
    temp = get_actual_temp_oikolab(city, date, market_type)
    if temp is not None:
        return temp
    
    return None


def settle_trade(trade: dict) -> dict:
    """
    Settle a weather trade by comparing actual temp to threshold.
    
    YES wins if: actual temp >= threshold (for high) or <= threshold (for low)
    NO wins if: actual temp < threshold (for high) or > threshold (for low)
    """
    ticker = trade.get("ticker", "")
    parsed = parse_weather_ticker(ticker)
    
    if not parsed:
        return None
    
    # Check if settlement date has passed
    now = datetime.now(timezone.utc)
    settlement_date = parsed["settlement_date"]
    
    if now < settlement_date:
        return None  # Not yet settled
    
    # Get actual temperature
    actual_temp = get_actual_temperature(
        parsed["city"],
        settlement_date,
        parsed["market_type"]
    )
    
    if actual_temp is None:
        return None  # Couldn't get temp data
    
    # Determine winner
    threshold = parsed["threshold"]
    market_type = parsed["market_type"]
    
    if market_type == "high":
        yes_wins = actual_temp >= threshold
    else:  # low temp market
        yes_wins = actual_temp <= threshold
    
    side = trade.get("side", "").lower()
    
    if side == "yes":
        won = yes_wins
    else:  # NO
        won = not yes_wins
    
    return {
        "ticker": ticker,
        "city": parsed["city"],
        "city_name": parsed["city_name"],
        "market_type": market_type,
        "threshold": threshold,
        "actual_temp": actual_temp,
        "settlement_date": settlement_date.isoformat(),
        "side": side,
        "won": won,
        "contracts": trade.get("contracts", 0),
        "price_cents": trade.get("price_cents", 0),
        "cost_cents": trade.get("cost_cents", 0),
        "forecast_temp": trade.get("forecast_temp"),
        "forecast_uncertainty": trade.get("forecast_uncertainty"),
    }


def calculate_pnl(settlement: dict) -> dict:
    """Calculate PnL for a settled trade."""
    contracts = settlement.get("contracts", 0)
    price_cents = settlement.get("price_cents", 0)
    cost_cents = settlement.get("cost_cents", 0)
    won = settlement.get("won", False)
    
    if won:
        # Win: get (100 - price) per contract
        pnl_cents = contracts * (100 - price_cents)
    else:
        # Loss: lose the cost
        pnl_cents = -cost_cents
    
    settlement["pnl_cents"] = pnl_cents
    settlement["pnl_dollars"] = pnl_cents / 100
    
    return settlement


def load_trades() -> list:
    """Load weather trades from v2 trade log."""
    trades = []
    
    if not TRADES_FILE_V2.exists():
        return trades
    
    with open(TRADES_FILE_V2) as f:
        for line in f:
            try:
                trade = json.loads(line)
                # Only process weather trades
                if trade.get("asset") == "weather":
                    trades.append(trade)
            except:
                continue
    
    return trades


def load_settlements() -> dict:
    """Load existing settlements."""
    if SETTLEMENTS_FILE.exists():
        with open(SETTLEMENTS_FILE) as f:
            return json.load(f)
    return {"settlements": [], "last_updated": None}


def save_settlements(data: dict):
    """Save settlements to file."""
    data["last_updated"] = datetime.now(timezone.utc).isoformat()
    with open(SETTLEMENTS_FILE, 'w') as f:
        json.dump(data, f, indent=2)


def update_trade_file(ticker: str, result: str):
    """Update the trade file with settlement result."""
    if not TRADES_FILE_V2.exists():
        return
    
    lines = []
    updated = False
    
    with open(TRADES_FILE_V2) as f:
        for line in f:
            try:
                trade = json.loads(line)
                if trade.get("ticker") == ticker and trade.get("result_status") == "pending":
                    trade["result_status"] = result
                    updated = True
                lines.append(json.dumps(trade))
            except:
                lines.append(line.strip())
    
    if updated:
        with open(TRADES_FILE_V2, 'w') as f:
            f.write('\n'.join(lines) + '\n')
        print(f"   ✅ Updated {ticker} → {result}")


def main():
    print("=" * 60)
    print("🌡️ WEATHER MARKET SETTLEMENT TRACKER")
    print("=" * 60)
    
    # Load trades
    trades = load_trades()
    print(f"\n📊 Found {len(trades)} weather trades")
    
    if not trades:
        print("   No weather trades to settle.")
        return
    
    # Load existing settlements
    settlement_data = load_settlements()
    settled_tickers = {s["ticker"] for s in settlement_data["settlements"]}
    
    # Process each trade
    new_settlements = []
    wins = 0
    losses = 0
    pending = 0
    total_pnl = 0
    
    for trade in trades:
        ticker = trade.get("ticker", "")
        
        # Skip already settled
        if ticker in settled_tickers:
            # Find existing settlement
            for s in settlement_data["settlements"]:
                if s["ticker"] == ticker:
                    if s.get("won"):
                        wins += 1
                    else:
                        losses += 1
                    total_pnl += s.get("pnl_cents", 0)
            continue
        
        print(f"\n📍 Processing: {ticker}")
        
        # Try to settle
        result = settle_trade(trade)
        
        if result is None:
            pending += 1
            print(f"   ⏳ Pending (not yet settled)")
            continue
        
        # Calculate PnL
        result = calculate_pnl(result)
        
        # Update stats
        if result["won"]:
            wins += 1
            print(f"   ✅ WON! Actual: {result['actual_temp']:.1f}°F vs Threshold: {result['threshold']}°F")
        else:
            losses += 1
            print(f"   ❌ LOST. Actual: {result['actual_temp']:.1f}°F vs Threshold: {result['threshold']}°F")
        
        print(f"   💰 PnL: ${result['pnl_dollars']:.2f}")
        
        if result.get("forecast_temp"):
            forecast_error = abs(result["actual_temp"] - result["forecast_temp"])
            print(f"   📊 Forecast was: {result['forecast_temp']}°F (error: {forecast_error:.1f}°F)")
        
        total_pnl += result["pnl_cents"]
        new_settlements.append(result)
        
        # Update trade file
        update_trade_file(ticker, "won" if result["won"] else "lost")
    
    # Save new settlements
    if new_settlements:
        settlement_data["settlements"].extend(new_settlements)
        save_settlements(settlement_data)
        print(f"\n💾 Saved {len(new_settlements)} new settlements")
    
    # Summary
    total = wins + losses
    print("\n" + "=" * 60)
    print("📈 WEATHER TRADING SUMMARY")
    print("=" * 60)
    print(f"   Settled: {total} trades")
    print(f"   Pending: {pending} trades")
    
    if total > 0:
        win_rate = (wins / total) * 100
        print(f"\n   ✅ Wins: {wins}")
        print(f"   ❌ Losses: {losses}")
        print(f"   📊 Win Rate: {win_rate:.1f}%")
        print(f"   💰 Total PnL: ${total_pnl/100:.2f}")
    
    # Forecast accuracy analysis
    if new_settlements:
        print("\n📊 FORECAST ACCURACY")
        print("-" * 40)
        errors = []
        for s in settlement_data["settlements"]:
            if s.get("forecast_temp") and s.get("actual_temp"):
                error = abs(s["actual_temp"] - s["forecast_temp"])
                errors.append(error)
        
        if errors:
            avg_error = sum(errors) / len(errors)
            max_error = max(errors)
            print(f"   Avg forecast error: {avg_error:.1f}°F")
            print(f"   Max forecast error: {max_error:.1f}°F")
            print(f"   Trades analyzed: {len(errors)}")


if __name__ == "__main__":
    main()
