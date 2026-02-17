#!/usr/bin/env node
/**
 * GMX V2 Token Rescue - Try to recover orphaned USDC from OrderVault
 */

const { ethers } = require('ethers');

const PRIVATE_KEY = '7124f2d94d997042bbfa891dc9cfbbd1d42ba5aed875ff28cf28b746245abc54';
const ARBITRUM_RPC = 'https://arb1.arbitrum.io/rpc';

// Contracts
const EXCHANGE_ROUTER = '0x7C68C7866A64FA2160F78EEaE12217FFbf871fa8';
const ORDER_VAULT = '0x31eF83a530Fde1B38EE9A18093A333D8Bbbc40D5';
const USDC = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831';

// ExchangeRouter ABI (partial - just what we need)
const ROUTER_ABI = [
  'function sendTokens(address token, address receiver, uint256 amount) external payable',
  'function sendWnt(address receiver, uint256 amount) external payable',
  'function claimFundingFees(address[] markets, address[] tokens, address receiver) external returns (uint256[])',
  'function claimCollateral(address[] markets, address[] tokens, uint256[] timeKeys, address receiver) external returns (uint256[])',
  'function multicall(bytes[] data) external payable returns (bytes[])',
  'function externalCall(address target, bytes data) external',
];

// Simple ERC20 ABI
const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
];

async function main() {
  console.log('🚀 GMX V2 Token Rescue\n');
  
  const provider = new ethers.providers.JsonRpcProvider(ARBITRUM_RPC);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  console.log('Wallet:', wallet.address);
  
  // Check balances
  const ethBal = await provider.getBalance(wallet.address);
  console.log('ETH:', ethers.utils.formatEther(ethBal), 'ETH');
  
  const usdc = new ethers.Contract(USDC, ERC20_ABI, wallet);
  const usdcBal = await usdc.balanceOf(wallet.address);
  console.log('USDC:', ethers.utils.formatUnits(usdcBal, 6), 'USDC\n');
  
  // Check gas
  const gasPrice = await provider.getGasPrice();
  console.log('Gas price:', ethers.utils.formatUnits(gasPrice, 'gwei'), 'gwei');
  
  const estimatedGas = 100000n; // Conservative estimate
  const gasCost = gasPrice.mul(estimatedGas);
  console.log('Est. gas cost:', ethers.utils.formatEther(gasCost), 'ETH');
  
  if (ethBal.lt(gasCost)) {
    console.log('\n⚠️ Warning: Low gas, but trying anyway...');
  }
  
  // Try different recovery methods
  const router = new ethers.Contract(EXCHANGE_ROUTER, ROUTER_ABI, wallet);
  
  // Method 1: Try claimCollateral with various timeKeys
  console.log('\n📋 Method 1: claimCollateral...');
  
  // BTC-USDC market
  const BTC_MARKET = '0x47c031236e19d024b42f8AE6780E44A573170703';
  // ETH-USDC market  
  const ETH_MARKET = '0x70d95587d40A2caf56bd97485aB3Eec10Bee6336';
  
  const markets = [BTC_MARKET, ETH_MARKET];
  const tokens = [USDC, USDC];
  
  // Try multiple timeKeys around the failed order time (Jan 27 ~08:43 UTC = 1738000980)
  const baseTime = 1738000980;
  const timeKeys = [
    Math.floor(baseTime / 3600) * 3600,      // Hour
    Math.floor(baseTime / 86400) * 86400,    // Day
    0,                                         // Zero (sometimes used)
  ];
  
  for (const timeKey of timeKeys) {
    try {
      console.log(`  Trying timeKey: ${timeKey}...`);
      const gasEst = await router.estimateGas.claimCollateral(
        markets, tokens, [timeKey, timeKey], wallet.address,
        { gasLimit: 500000 }
      );
      console.log(`  ✅ Gas estimate: ${gasEst.toString()} - This might work!`);
      
      // If estimation succeeds, try the actual call
      const tx = await router.claimCollateral(
        markets, tokens, [timeKey, timeKey], wallet.address,
        { gasLimit: gasEst.mul(120).div(100) } // 20% buffer
      );
      console.log(`  📤 TX sent: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log(`  ✅ TX confirmed! Gas used: ${receipt.gasUsed.toString()}`);
      
      // Check new balance
      const newBal = await usdc.balanceOf(wallet.address);
      console.log(`  New USDC balance: ${ethers.utils.formatUnits(newBal, 6)}`);
      return;
    } catch (e) {
      console.log(`  ❌ Failed: ${e.reason || e.message?.slice(0, 50) || 'unknown'}`);
    }
  }
  
  // Method 2: Try claimFundingFees (might not apply but worth trying)
  console.log('\n📋 Method 2: claimFundingFees...');
  try {
    const gasEst = await router.estimateGas.claimFundingFees(
      markets, tokens, wallet.address,
      { gasLimit: 500000 }
    );
    console.log(`  ✅ Gas estimate: ${gasEst.toString()}`);
    
    const tx = await router.claimFundingFees(
      markets, tokens, wallet.address,
      { gasLimit: gasEst.mul(120).div(100) }
    );
    console.log(`  📤 TX sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`  ✅ TX confirmed!`);
  } catch (e) {
    console.log(`  ❌ Failed: ${e.reason || e.message?.slice(0, 50) || 'unknown'}`);
  }
  
  // Method 3: Check if there's a way to sweep tokens from vault
  console.log('\n📋 Method 3: Direct vault interaction...');
  console.log('  ⚠️ Tokens sent directly to OrderVault without createOrder');
  console.log('  ⚠️ May require GMX admin intervention');
  
  // Final balance check
  console.log('\n📊 Final Status:');
  const finalUsdc = await usdc.balanceOf(wallet.address);
  const finalEth = await provider.getBalance(wallet.address);
  console.log('USDC:', ethers.utils.formatUnits(finalUsdc, 6));
  console.log('ETH:', ethers.utils.formatEther(finalEth));
  
  if (finalUsdc.gt(usdcBal)) {
    console.log('\n🎉 SUCCESS! Recovered some USDC!');
  } else {
    console.log('\n😔 Could not recover tokens automatically.');
    console.log('\n💡 Next steps:');
    console.log('1. Contact GMX Discord support: https://discord.gg/gmx');
    console.log('2. Explain that $10 USDC was transferred to OrderVault');
    console.log('3. But createOrder failed, leaving tokens orphaned');
    console.log('4. TX: 0xf2d59026be3da750e2332fd9c93b991fa41659a930ca0e96c5cb1820ef41ecaf');
  }
}

main().catch(console.error);
