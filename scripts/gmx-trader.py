#!/usr/bin/env python3
"""
GMX Trading Bot - Arbitrum
$12 capital, micro-bets, conservative strategy

GMX V2 on Arbitrum - Perpetual trading
"""

import os
import json
import time
from datetime import datetime
from web3 import Web3

# Configuration
ARBITRUM_RPC = "https://arb1.arbitrum.io/rpc"
WALLET_ADDRESS = "0x0e7c2d05BaD15CD2A27f8fB0FCdDF9f10Cf1d0C0"
PRIVATE_KEY = "7124f2d94d997042bbfa891dc9cfbbd1d42ba5aed875ff28cf28b746245abc54"

# GMX V2 Contracts on Arbitrum
GMX_CONTRACTS = {
    "Router": "0x7452c558d45f8afc8c83dae62c3f8a5be19c71f6",
    "OrderVault": "0x31ef83a530fde1b38ee9a18093a333d8bbbc40d5",
    "DataStore": "0xFD70de6b91282D8017aA4E741e9Ae325CAb992d8",
    "Reader": "0xf60becbba223EEA9495Da3f606753867eC10d139",
}

# Risk Management - ULTRA CONSERVATIVE
MAX_POSITION_USD = 2.0   # Max $2 per trade (with leverage = larger exposure)
MAX_LEVERAGE = 5         # Max 5x leverage (conservative)
STOP_LOSS_PCT = 0.03     # 3% stop loss
TAKE_PROFIT_PCT = 0.05   # 5% take profit
MAX_DAILY_LOSS = 3.0     # Stop if down $3

# Connect to Arbitrum
w3 = Web3(Web3.HTTPProvider(ARBITRUM_RPC))

class GMXTrader:
    def __init__(self):
        self.daily_pnl = 0.0
        self.trades_today = 0
        self.positions = {}
        
    def get_eth_balance(self):
        """Get ETH balance on Arbitrum"""
        balance = w3.eth.get_balance(WALLET_ADDRESS)
        return w3.from_wei(balance, 'ether')
    
    def get_usdc_balance(self):
        """Get USDC balance on Arbitrum"""
        # USDC on Arbitrum
        USDC_ADDRESS = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831"
        USDC_ABI = [{"constant":True,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"type":"function"}]
        
        usdc = w3.eth.contract(address=USDC_ADDRESS, abi=USDC_ABI)
        balance = usdc.functions.balanceOf(WALLET_ADDRESS).call()
        return balance / 1e6  # USDC has 6 decimals
    
    def get_prices(self):
        """Get current prices from GMX"""
        # For now, use external price feed
        # In production, read from GMX DataStore
        try:
            import requests
            resp = requests.get("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd", timeout=5)
            data = resp.json()
            return {
                "BTC": data["bitcoin"]["usd"],
                "ETH": data["ethereum"]["usd"]
            }
        except:
            return {"BTC": 88000, "ETH": 2900}  # Fallback
    
    def analyze_market(self, symbol, price):
        """Simple momentum analysis"""
        # TODO: Implement proper technical analysis
        # For now, return neutral
        return {
            "signal": "NEUTRAL",
            "strength": 0,
            "reason": "Initial analysis"
        }
    
    def should_trade(self, analysis):
        """Determine if we should enter a trade"""
        if self.daily_pnl <= -MAX_DAILY_LOSS:
            return False, "Daily loss limit reached"
        
        if analysis["signal"] == "NEUTRAL":
            return False, "No clear signal"
        
        if analysis["strength"] < 0.7:
            return False, "Signal not strong enough"
        
        return True, "Signal confirmed"
    
    def log_status(self):
        """Log current status"""
        eth_bal = self.get_eth_balance()
        usdc_bal = self.get_usdc_balance()
        prices = self.get_prices()
        
        print(f"""
╔══════════════════════════════════════╗
║      GMX TRADING BOT STATUS          ║
╠══════════════════════════════════════╣
║ Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}         ║
║                                      ║
║ BALANCES:                            ║
║   ETH:  {float(eth_bal):.6f} (${float(eth_bal)*prices['ETH']:.2f})        ║
║   USDC: ${usdc_bal:.2f}                      ║
║                                      ║
║ PRICES:                              ║
║   BTC: ${prices['BTC']:,.0f}                    ║
║   ETH: ${prices['ETH']:,.0f}                     ║
║                                      ║
║ TRADING:                             ║
║   Daily PnL: ${self.daily_pnl:.2f}                 ║
║   Trades today: {self.trades_today}                    ║
║   Open positions: {len(self.positions)}                  ║
╚══════════════════════════════════════╝
        """)
        
        return {
            "eth": float(eth_bal),
            "usdc": usdc_bal,
            "prices": prices,
            "pnl": self.daily_pnl
        }

def main():
    print("🚀 GMX Trading Bot Starting...")
    print(f"Wallet: {WALLET_ADDRESS}")
    print(f"Chain: Arbitrum One")
    
    trader = GMXTrader()
    
    # Initial status
    status = trader.log_status()
    
    if status["eth"] < 0.001 and status["usdc"] < 1:
        print("\n⚠️ Waiting for funds to arrive...")
        return
    
    print("\n✅ Funds available! Ready to trade.")
    print("📊 Monitoring markets...")
    
    # Main loop
    while True:
        try:
            prices = trader.get_prices()
            
            for symbol in ["BTC", "ETH"]:
                analysis = trader.analyze_market(symbol, prices[symbol])
                should, reason = trader.should_trade(analysis)
                
                if should:
                    print(f"\n🎯 TRADE SIGNAL: {symbol} {analysis['signal']}")
                    # TODO: Execute trade via GMX contracts
                else:
                    pass  # No signal
            
            time.sleep(60)  # Check every minute
            
        except KeyboardInterrupt:
            print("\n\n🛑 Bot stopped")
            trader.log_status()
            break
        except Exception as e:
            print(f"Error: {e}")
            time.sleep(30)

if __name__ == "__main__":
    main()
