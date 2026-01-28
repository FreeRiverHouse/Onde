#!/usr/bin/env node
/**
 * Attempt to claim/recover funds from GMX V2 OrderVault
 */

const https = require('https');
const crypto = require('crypto');

const WALLET = '0x0e7c2d05BaD15CD2A27f8fB0FCdDF9f10Cf1d0C0';
const PRIVATE_KEY = '7124f2d94d997042bbfa891dc9cfbbd1d42ba5aed875ff28cf28b746245abc54';
const ARBITRUM_RPC = 'arb1.arbitrum.io';

// GMX V2 Contracts
const EXCHANGE_ROUTER = '0x7C68C7866A64FA2160F78EEaE12217FFbf871fa8';
const ORDER_VAULT = '0x31eF83a530Fde1B38EE9A18093A333D8Bbbc40D5';
const DATASTORE = '0xFD70de6b91282D8017aA4E741e9Ae325CAb992d8';
const USDC = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831';

// BTC-USDC market on GMX (most common)
const BTC_USDC_MARKET = '0x47c031236e19d024b42f8AE6780E44A573170703';

function rpcCall(method, params) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ jsonrpc: '2.0', id: 1, method, params });
    const req = https.request({
      hostname: ARBITRUM_RPC,
      path: '/rpc',
      method: 'POST',
      headers: {'Content-Type': 'application/json'}
    }, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try {
          const r = JSON.parse(body);
          if (r.error) reject(r.error);
          else resolve(r.result);
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Simple ABI encoding helpers
function encodeFunctionCall(selector, params) {
  return selector + params.map(p => p.slice(2).padStart(64, '0')).join('');
}

function encodeAddress(addr) {
  return '0x' + addr.slice(2).toLowerCase().padStart(64, '0');
}

function encodeUint256(num) {
  return '0x' + BigInt(num).toString(16).padStart(64, '0');
}

async function main() {
  console.log('🔍 GMX V2 Recovery Attempt\n');
  
  // 1. Check current balances
  const ethBal = await rpcCall('eth_getBalance', [WALLET, 'latest']);
  const ethAmount = Number(BigInt(ethBal)) / 1e18;
  console.log('ETH Balance:', ethAmount.toFixed(6), 'ETH');
  
  if (ethAmount < 0.00005) {
    console.log('❌ Not enough ETH for gas!');
    return;
  }
  
  // 2. Check USDC in wallet
  const usdcData = '0x70a08231' + WALLET.slice(2).toLowerCase().padStart(64, '0');
  const usdcBal = await rpcCall('eth_call', [{to: USDC, data: usdcData}, 'latest']);
  console.log('USDC in wallet:', (Number(BigInt(usdcBal)) / 1e6).toFixed(2));
  
  // 3. Get nonce
  const nonce = await rpcCall('eth_getTransactionCount', [WALLET, 'latest']);
  console.log('Nonce:', parseInt(nonce, 16));
  
  // 4. Get gas price
  const gasPrice = await rpcCall('eth_gasPrice', []);
  console.log('Gas price:', (Number(BigInt(gasPrice)) / 1e9).toFixed(4), 'Gwei');
  
  // 5. Try different claim methods
  console.log('\n📋 Attempting recovery methods...\n');
  
  // Method 1: Try claimCollateral with common parameters
  // claimCollateral(address[] markets, address[] tokens, uint256[] timeKeys, address receiver)
  // Selector: 0x...
  
  // Method 2: Try to cancel any pending orders
  // cancelOrder(bytes32 key)
  
  // Method 3: Check if there are claimable funding fees
  // claimFundingFees(address[] markets, address[] tokens, address receiver)
  
  // For now, let's try to simulate the claimCollateral call to see if it would work
  // We need to find the right timeKey for our failed order
  
  // The failed order was at block 425707465 (timestamp around 1738000707)
  const timeKey = Math.floor(1738000707 / 3600) * 3600; // Round to hour
  
  console.log('TimeKey guess:', timeKey);
  
  // Build claimCollateral calldata
  // function claimCollateral(address[] memory markets, address[] memory tokens, uint256[] memory timeKeys, address receiver)
  // Selector: 0x54e4ddb7 (need to verify)
  
  // Actually, let me check what the failed claim tx was trying to do
  console.log('\n🔎 Analyzing failed claim transaction...');
  console.log('TX: 0x246b4df19cab6d3a3ed4b0de9453fffb0483c3cf75acea86fa74d933124a47b9');
  
  // Get the failed tx input data
  const tx = await rpcCall('eth_getTransactionByHash', ['0x246b4df19cab6d3a3ed4b0de9453fffb0483c3cf75acea86fa74d933124a47b9']);
  
  if (tx && tx.input) {
    console.log('Input data length:', tx.input.length);
    console.log('Function selector:', tx.input.slice(0, 10));
    
    // Try to simulate the call to see the error
    try {
      const result = await rpcCall('eth_call', [{
        from: WALLET,
        to: tx.to,
        data: tx.input
      }, 'latest']);
      console.log('Simulation result:', result);
    } catch (e) {
      console.log('Simulation error:', e.message || JSON.stringify(e));
    }
  }
  
  // Alternative: Try using GMX's ExternalHandler or other recovery mechanisms
  console.log('\n💡 Recovery Options:');
  console.log('1. If tokens are truly "orphaned" in vault, they may require admin intervention');
  console.log('2. Check GMX Discord for support');
  console.log('3. Tokens might be auto-returned to sender after timeout');
  
  // Check if there's any balance we can sweep
  console.log('\n🧹 Checking for sweepable tokens...');
  
  // Some vaults have externalCall or sweep functions
  // Let's check if OrderVault has any such function
}

main().catch(e => {
  console.error('Error:', e.message || e);
});
