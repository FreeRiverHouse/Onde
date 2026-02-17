#!/usr/bin/env python3
"""
Hyperliquid Trading Bot - Ultra Conservative
$12 capital, micro-bets, high probability setups only

Strategy: Momentum following with strict risk management
"""

import os
import json
import time
from datetime import datetime
from hyperliquid.info import Info
from hyperliquid.exchange import Exchange
from hyperliquid.utils import constants

# Configuration
TESTNET = True  # Start with testnet!
BASE_URL = constants.TESTNET_API_URL if TESTNET else constants.MAINNET_API_URL

# Risk Management - ULTRA CONSERVATIVE
MAX_POSITION_SIZE = 1.0  # Max $1 per trade
MAX_LOSS_PERCENT = 0.02  # 2% stop loss
TAKE_PROFIT_PERCENT = 0.03  # 3% take profit
MAX_DAILY_LOSS = 3.0  # Stop trading if down $3

# Trading state
class TradingState:
    def __init__(self):
        self.daily_pnl = 0.0
        self.trades_today = 0
        self.positions = {}
        self.last_prices = {}
        
state = TradingState()

def get_market_info():
    """Get all available markets and current prices"""
    info = Info(BASE_URL, skip_ws=True)
    meta = info.meta()
    
    # Get current prices for major assets
    prices = {}
    for market in meta['universe']:
        name = market['name']
        try:
            orderbook = info.l2_snapshot(name)
            if orderbook['levels']:
                bid = float(orderbook['levels'][0][0]['px']) if orderbook['levels'][0] else 0
                ask = float(orderbook['levels'][1][0]['px']) if orderbook['levels'][1] else 0
                mid = (bid + ask) / 2 if bid and ask else 0
                prices[name] = {'bid': bid, 'ask': ask, 'mid': mid}
        except:
            pass
    
    return meta, prices

def calculate_momentum(prices_history, lookback=5):
    """Simple momentum indicator"""
    if len(prices_history) < lookback:
        return 0
    
    recent = prices_history[-lookback:]
    change = (recent[-1] - recent[0]) / recent[0] * 100
    return change

def should_enter_long(symbol, current_price, momentum):
    """
    Entry criteria for LONG:
    - Momentum > 0.5% in last 5 candles
    - Not already in position
    - Daily loss limit not hit
    """
    if state.daily_pnl <= -MAX_DAILY_LOSS:
        print(f"⚠️ Daily loss limit hit. No new trades.")
        return False
    
    if symbol in state.positions:
        return False
    
    if momentum > 0.5:
        return True
    
    return False

def should_enter_short(symbol, current_price, momentum):
    """
    Entry criteria for SHORT:
    - Momentum < -0.5% in last 5 candles
    - Not already in position
    """
    if state.daily_pnl <= -MAX_DAILY_LOSS:
        return False
    
    if symbol in state.positions:
        return False
    
    if momentum < -0.5:
        return True
    
    return False

def execute_trade(exchange, symbol, side, size_usd, price):
    """Execute a trade with proper risk management"""
    
    # Calculate position size
    size = size_usd / price
    
    # Set stop loss and take profit
    if side == "BUY":
        stop_loss = price * (1 - MAX_LOSS_PERCENT)
        take_profit = price * (1 + TAKE_PROFIT_PERCENT)
    else:
        stop_loss = price * (1 + MAX_LOSS_PERCENT)
        take_profit = price * (1 - TAKE_PROFIT_PERCENT)
    
    print(f"""
    🎯 TRADE SIGNAL
    ━━━━━━━━━━━━━━━
    Symbol: {symbol}
    Side: {side}
    Size: ${size_usd:.2f}
    Entry: ${price:.2f}
    Stop Loss: ${stop_loss:.2f}
    Take Profit: ${take_profit:.2f}
    ━━━━━━━━━━━━━━━
    """)
    
    # In testnet mode, we can actually execute
    # In mainnet, uncomment the execution code
    
    if TESTNET:
        # Simulate trade
        state.positions[symbol] = {
            'side': side,
            'entry': price,
            'size': size,
            'size_usd': size_usd,
            'stop_loss': stop_loss,
            'take_profit': take_profit,
            'timestamp': datetime.now()
        }
        print(f"✅ [TESTNET] Trade simulated")
    else:
        # Real execution - uncomment when ready
        # order = exchange.market_order(symbol, side == "BUY", size)
        # print(f"✅ Order placed: {order}")
        pass
    
    state.trades_today += 1
    return True

def check_exit_conditions(symbol, current_price):
    """Check if we should exit a position"""
    if symbol not in state.positions:
        return None
    
    pos = state.positions[symbol]
    
    # Check stop loss
    if pos['side'] == "BUY" and current_price <= pos['stop_loss']:
        return "STOP_LOSS"
    if pos['side'] == "SELL" and current_price >= pos['stop_loss']:
        return "STOP_LOSS"
    
    # Check take profit
    if pos['side'] == "BUY" and current_price >= pos['take_profit']:
        return "TAKE_PROFIT"
    if pos['side'] == "SELL" and current_price <= pos['take_profit']:
        return "TAKE_PROFIT"
    
    return None

def close_position(symbol, current_price, reason):
    """Close a position and update PnL"""
    if symbol not in state.positions:
        return
    
    pos = state.positions[symbol]
    
    # Calculate PnL
    if pos['side'] == "BUY":
        pnl = (current_price - pos['entry']) / pos['entry'] * pos['size_usd']
    else:
        pnl = (pos['entry'] - current_price) / pos['entry'] * pos['size_usd']
    
    state.daily_pnl += pnl
    
    emoji = "🟢" if pnl > 0 else "🔴"
    print(f"""
    {emoji} POSITION CLOSED
    ━━━━━━━━━━━━━━━
    Symbol: {symbol}
    Reason: {reason}
    Entry: ${pos['entry']:.2f}
    Exit: ${current_price:.2f}
    PnL: ${pnl:.2f}
    Daily PnL: ${state.daily_pnl:.2f}
    ━━━━━━━━━━━━━━━
    """)
    
    del state.positions[symbol]

def run_trading_loop():
    """Main trading loop"""
    print("""
    ╔═══════════════════════════════════════╗
    ║  HYPERLIQUID TRADING BOT v0.1         ║
    ║  Ultra Conservative Mode              ║
    ║  {'TESTNET' if TESTNET else 'MAINNET ⚠️'}                           ║
    ╚═══════════════════════════════════════╝
    """)
    
    info = Info(BASE_URL, skip_ws=True)
    
    # Track price history for momentum
    price_history = {'BTC': [], 'ETH': []}
    
    # Symbols to trade
    symbols = ['BTC', 'ETH']
    
    print(f"📊 Monitoring: {', '.join(symbols)}")
    print(f"💰 Max position: ${MAX_POSITION_SIZE}")
    print(f"🛑 Stop loss: {MAX_LOSS_PERCENT*100}%")
    print(f"🎯 Take profit: {TAKE_PROFIT_PERCENT*100}%")
    print(f"⏹️ Daily loss limit: ${MAX_DAILY_LOSS}")
    print("\n" + "="*50 + "\n")
    
    iteration = 0
    while True:
        try:
            iteration += 1
            
            for symbol in symbols:
                # Get current price
                orderbook = info.l2_snapshot(symbol)
                if not orderbook['levels'][0] or not orderbook['levels'][1]:
                    continue
                
                bid = float(orderbook['levels'][0][0]['px'])
                ask = float(orderbook['levels'][1][0]['px'])
                mid = (bid + ask) / 2
                
                # Update price history
                price_history[symbol].append(mid)
                if len(price_history[symbol]) > 20:
                    price_history[symbol] = price_history[symbol][-20:]
                
                # Calculate momentum
                momentum = calculate_momentum(price_history[symbol])
                
                # Check exit conditions for existing positions
                exit_reason = check_exit_conditions(symbol, mid)
                if exit_reason:
                    close_position(symbol, mid, exit_reason)
                
                # Check entry conditions
                if should_enter_long(symbol, mid, momentum):
                    execute_trade(None, symbol, "BUY", MAX_POSITION_SIZE, mid)
                elif should_enter_short(symbol, mid, momentum):
                    execute_trade(None, symbol, "SELL", MAX_POSITION_SIZE, mid)
                
                # Log every 10 iterations
                if iteration % 10 == 0:
                    pos_str = "LONG" if symbol in state.positions and state.positions[symbol]['side'] == "BUY" else \
                              "SHORT" if symbol in state.positions else "FLAT"
                    print(f"[{datetime.now().strftime('%H:%M:%S')}] {symbol}: ${mid:.2f} | Mom: {momentum:.2f}% | Pos: {pos_str}")
            
            # Sleep between iterations
            time.sleep(5)
            
        except KeyboardInterrupt:
            print("\n\n🛑 Bot stopped by user")
            print(f"📊 Final daily PnL: ${state.daily_pnl:.2f}")
            print(f"📈 Total trades: {state.trades_today}")
            break
        except Exception as e:
            print(f"❌ Error: {e}")
            time.sleep(10)

if __name__ == "__main__":
    # Quick test
    print("🔍 Testing API connection...")
    meta, prices = get_market_info()
    print(f"✅ Connected! {len(meta['universe'])} markets available")
    
    if 'BTC' in prices:
        print(f"📊 BTC: ${prices['BTC']['mid']:.2f}")
    if 'ETH' in prices:
        print(f"📊 ETH: ${prices['ETH']['mid']:.2f}")
    
    print("\n🚀 Starting trading loop...")
    run_trading_loop()
