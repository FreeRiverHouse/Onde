#!/usr/bin/env python3
"""
Swap ETH → USDC on Arbitrum using Uniswap V3
Keep some ETH for gas, swap rest to USDC for trading
"""

from web3 import Web3
import json

# Configuration
ARBITRUM_RPC = "https://arb1.arbitrum.io/rpc"
WALLET_ADDRESS = "0x0e7c2d05BaD15CD2A27f8fB0FCdDF9f10Cf1d0C0"
PRIVATE_KEY = "7124f2d94d997042bbfa891dc9cfbbd1d42ba5aed875ff28cf28b746245abc54"

# Tokens on Arbitrum
WETH = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1"
USDC = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831"  # Native USDC on Arbitrum

# Uniswap V3 SwapRouter on Arbitrum
UNISWAP_ROUTER = "0xE592427A0AEce92De3Edee1F18E0157C05861564"

# Connect
w3 = Web3(Web3.HTTPProvider(ARBITRUM_RPC))

# Uniswap V3 Router ABI (simplified)
ROUTER_ABI = [
    {
        "inputs": [
            {
                "components": [
                    {"name": "tokenIn", "type": "address"},
                    {"name": "tokenOut", "type": "address"},
                    {"name": "fee", "type": "uint24"},
                    {"name": "recipient", "type": "address"},
                    {"name": "deadline", "type": "uint256"},
                    {"name": "amountIn", "type": "uint256"},
                    {"name": "amountOutMinimum", "type": "uint256"},
                    {"name": "sqrtPriceLimitX96", "type": "uint160"}
                ],
                "name": "params",
                "type": "tuple"
            }
        ],
        "name": "exactInputSingle",
        "outputs": [{"name": "amountOut", "type": "uint256"}],
        "stateMutability": "payable",
        "type": "function"
    }
]

def get_balances():
    """Get current balances"""
    eth_balance = w3.eth.get_balance(WALLET_ADDRESS)
    
    # USDC balance
    usdc_abi = [{"constant":True,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"type":"function"}]
    usdc_contract = w3.eth.contract(address=USDC, abi=usdc_abi)
    usdc_balance = usdc_contract.functions.balanceOf(WALLET_ADDRESS).call()
    
    return {
        "eth": w3.from_wei(eth_balance, 'ether'),
        "eth_wei": eth_balance,
        "usdc": usdc_balance / 1e6
    }

def swap_eth_to_usdc(amount_eth_to_swap, min_usdc_out):
    """
    Swap ETH to USDC on Uniswap V3
    """
    import time
    
    router = w3.eth.contract(address=UNISWAP_ROUTER, abi=ROUTER_ABI)
    
    amount_in = w3.to_wei(amount_eth_to_swap, 'ether')
    deadline = int(time.time()) + 300  # 5 min deadline
    
    # Swap parameters
    params = (
        WETH,                           # tokenIn
        USDC,                           # tokenOut
        500,                            # fee (0.05% pool)
        WALLET_ADDRESS,                 # recipient
        deadline,                       # deadline
        amount_in,                      # amountIn
        int(min_usdc_out * 1e6),       # amountOutMinimum
        0                               # sqrtPriceLimitX96 (0 = no limit)
    )
    
    # Get gas price
    gas_price = w3.eth.gas_price
    nonce = w3.eth.get_transaction_count(WALLET_ADDRESS)
    
    # Build transaction
    tx = router.functions.exactInputSingle(params).build_transaction({
        'from': WALLET_ADDRESS,
        'value': amount_in,  # Send ETH with the transaction
        'gas': 300000,
        'gasPrice': gas_price,
        'nonce': nonce,
    })
    
    print(f"Swapping {amount_eth_to_swap} ETH for ~{min_usdc_out} USDC...")
    
    # Sign and send
    signed = w3.eth.account.sign_transaction(tx, PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    
    print(f"TX: {tx_hash.hex()}")
    print("Waiting for confirmation...")
    
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
    
    if receipt['status'] == 1:
        print("✅ SWAP SUCCESSFUL!")
    else:
        print("❌ SWAP FAILED!")
    
    return receipt

def main():
    print("=" * 50)
    print("ETH → USDC SWAP ON ARBITRUM")
    print("=" * 50)
    
    # Get current balances
    balances = get_balances()
    print(f"\nCurrent balances:")
    print(f"  ETH:  {balances['eth']:.6f} (${float(balances['eth'])*2927:.2f})")
    print(f"  USDC: ${balances['usdc']:.2f}")
    
    if float(balances['eth']) < 0.001:
        print("\n⚠️ Not enough ETH to swap!")
        return
    
    # Keep 0.001 ETH for gas (~$3), swap rest
    eth_to_keep = 0.001
    eth_to_swap = float(balances['eth']) - eth_to_keep
    
    if eth_to_swap <= 0:
        print("\n⚠️ Not enough ETH after keeping gas reserve!")
        return
    
    # Calculate minimum USDC out (with 1% slippage)
    eth_price = 2927
    expected_usdc = eth_to_swap * eth_price
    min_usdc = expected_usdc * 0.99  # 1% slippage tolerance
    
    print(f"\nSwap plan:")
    print(f"  Swap:     {eth_to_swap:.6f} ETH")
    print(f"  Keep:     {eth_to_keep:.6f} ETH (for gas)")
    print(f"  Expected: ~${expected_usdc:.2f} USDC")
    print(f"  Min out:  ${min_usdc:.2f} USDC")
    
    # Execute swap
    print("\n🔄 Executing swap...")
    receipt = swap_eth_to_usdc(eth_to_swap, min_usdc)
    
    # Check new balances
    new_balances = get_balances()
    print(f"\nNew balances:")
    print(f"  ETH:  {new_balances['eth']:.6f} (${float(new_balances['eth'])*2927:.2f})")
    print(f"  USDC: ${new_balances['usdc']:.2f}")

if __name__ == "__main__":
    main()
