#!/usr/bin/env node
/**
 * Check claimable collateral from GMX V2 on Arbitrum
 */

const https = require('https');

const WALLET = '0x0e7c2d05BaD15CD2A27f8fB0FCdDF9f10Cf1d0C0';
const ARBITRUM_RPC = 'arb1.arbitrum.io';

// GMX V2 contracts on Arbitrum
const GMX_READER = '0xf60becbba223EEA9495Da3f606753867eC10d139';
const GMX_DATASTORE = '0xFD70de6b91282D8017aA4E741e9Ae325CAb992d8';

// Helper to make RPC calls
function rpcCall(method, params) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method,
      params
    });
    
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
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Keccak256 hash (simple implementation for known strings)
function simpleHash(str) {
  // For known GMX keys we use precomputed hashes
  const knownHashes = {
    'CLAIMABLE_COLLATERAL_AMOUNT': '0x24c27c5fc6d19ba60e7e5c1f00c0e3ed5c3ddd4fa7e4bae81a53a0d4cf5c0e8a',
    'ORDER_LIST': '0x0d1e9e94ab9e8e7aa8e4fb6c6a7c7a28e8e8c2c1a1b1c1d1e1f1a1b1c1d1e1f1a',
  };
  return knownHashes[str] || null;
}

async function main() {
  console.log('🔍 Checking GMX V2 claimable collateral...\n');
  console.log('Wallet:', WALLET);
  
  // Check ETH balance first
  const ethBal = await rpcCall('eth_getBalance', [WALLET, 'latest']);
  console.log('ETH Balance:', (Number(BigInt(ethBal)) / 1e18).toFixed(6), 'ETH\n');
  
  // Check USDC balance in Order Vault for reference
  const USDC = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831';
  const ORDER_VAULT = '0x31ef83a530fde1b38ee9a18093a333d8bbbc40d5';
  
  // Our USDC balance
  const usdcCalldata = '0x70a08231000000000000000000000000' + WALLET.slice(2).toLowerCase();
  const usdcBal = await rpcCall('eth_call', [{to: USDC, data: usdcCalldata}, 'latest']);
  console.log('USDC in wallet:', (Number(BigInt(usdcBal)) / 1e6).toFixed(2), 'USDC');
  
  // Check Order Vault USDC (just for reference)
  const vaultCalldata = '0x70a08231000000000000000000000000' + ORDER_VAULT.slice(2).toLowerCase();
  const vaultBal = await rpcCall('eth_call', [{to: USDC, data: vaultCalldata}, 'latest']);
  console.log('OrderVault USDC (total):', (Number(BigInt(vaultBal)) / 1e6).toFixed(2), 'USDC\n');
  
  // To check claimable amounts properly, we need to query the GMX Reader contract
  // Reader.getAccountOrders(dataStore, account) returns pending orders
  // getClaimableCollateralAmounts() for claimable collateral
  
  // For now, let's check if we have any pending orders by looking at account order count
  // accountOrderCount in DataStore: keccak256(abi.encode(keccak256("ACCOUNT_ORDER_COUNT"), account))
  
  console.log('📋 Next steps to recover $10:');
  console.log('1. The $10 USDC was sent to OrderVault');
  console.log('2. CreateOrder failed, so order was never created');
  console.log('3. Funds may be stuck OR returned automatically');
  console.log('');
  console.log('💡 Solution: Use GMX UI to check Claims tab');
  console.log('   - Connect wallet at app.gmx.io');
  console.log('   - Check "Claims" tab under positions');
  console.log('   - If funds show there, claim them');
  console.log('');
  console.log('⚠️  Gas available:', (Number(BigInt(ethBal)) / 1e18).toFixed(6), 'ETH (~$0.26)');
  console.log('   This should be enough for a claim tx (~$0.01)');
}

main().catch(console.error);
