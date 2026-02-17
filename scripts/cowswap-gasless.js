#!/usr/bin/env node
/**
 * CowSwap Gasless Swap on Arbitrum
 * Swaps USDC -> ETH without needing ETH for gas!
 * Fee is paid from the sell token.
 */

const { ethers } = require('ethers');
const https = require('https');
require('dotenv').config({ path: '/Users/mattia/.clawdbot/.env.trading' });

const COWSWAP_API = 'https://api.cow.fi/arbitrum_one/api/v1';
const TOKENS = {
  USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  WETH: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
};

// CowSwap Settlement contract for approvals
const COWSWAP_VAULT = '0xC92E8bdf79f0507f65a392b0ab4667716BFE0110';

async function httpPost(url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const postData = JSON.stringify(data);
    
    const req = https.request({
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length,
      },
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function main() {
  const sellToken = process.argv[2] || 'USDC';
  const buyToken = process.argv[3] || 'WETH';
  const amount = parseFloat(process.argv[4]) || 0.5; // USDC amount
  
  console.log(`\n🐄 CowSwap Gasless Swap`);
  console.log(`   ${amount} ${sellToken} → ${buyToken}\n`);
  
  const provider = new ethers.providers.JsonRpcProvider('https://arbitrum-one.publicnode.com');
  const pk = process.env.POLY_PRIVATE_KEY;
  const wallet = new ethers.Wallet(pk.startsWith('0x') ? pk : '0x' + pk, provider);
  
  console.log(`📍 Wallet: ${wallet.address}`);
  
  // Get quote
  console.log('\n📊 Getting quote...');
  const sellTokenAddr = TOKENS[sellToken] || sellToken;
  const buyTokenAddr = TOKENS[buyToken] || buyToken;
  const sellAmount = Math.floor(amount * 1e6).toString(); // USDC has 6 decimals
  
  const quote = await httpPost(`${COWSWAP_API}/quote`, {
    sellToken: sellTokenAddr,
    buyToken: buyTokenAddr,
    sellAmountBeforeFee: sellAmount,
    from: wallet.address,
    kind: 'sell',
  });
  
  if (quote.errorType) {
    console.error('❌ Quote error:', quote.description);
    process.exit(1);
  }
  
  console.log(`   Sell: ${parseInt(quote.quote.sellAmount) / 1e6} USDC`);
  console.log(`   Buy: ${parseInt(quote.quote.buyAmount) / 1e18} ETH`);
  console.log(`   Fee: ${parseInt(quote.quote.feeAmount) / 1e6} USDC (gasless!)`);
  
  // Check USDC allowance for CowSwap
  const usdc = new ethers.Contract(sellTokenAddr, [
    'function allowance(address,address) view returns (uint256)',
    'function approve(address,uint256) returns (bool)',
  ], wallet);
  
  const allowance = await usdc.allowance(wallet.address, COWSWAP_VAULT);
  console.log(`\n📝 CowSwap allowance: ${ethers.utils.formatUnits(allowance, 6)} USDC`);
  
  if (allowance.lt(sellAmount)) {
    console.log('⏳ Approving USDC for CowSwap...');
    const gasPrice = await provider.getGasPrice();
    const approveTx = await usdc.approve(COWSWAP_VAULT, ethers.constants.MaxUint256, {
      gasLimit: 60000,
      maxFeePerGas: gasPrice.mul(3),
      maxPriorityFeePerGas: ethers.utils.parseUnits('0.01', 'gwei'),
    });
    console.log(`   TX: ${approveTx.hash}`);
    await approveTx.wait();
    console.log('   ✅ Approved!');
  }
  
  // Sign the order (EIP-712)
  console.log('\n✍️ Signing order...');
  
  const order = {
    sellToken: quote.quote.sellToken,
    buyToken: quote.quote.buyToken,
    receiver: wallet.address,
    sellAmount: quote.quote.sellAmount,
    buyAmount: quote.quote.buyAmount,
    validTo: quote.quote.validTo,
    appData: quote.quote.appData,
    feeAmount: quote.quote.feeAmount,
    kind: quote.quote.kind,
    partiallyFillable: quote.quote.partiallyFillable,
    sellTokenBalance: quote.quote.sellTokenBalance,
    buyTokenBalance: quote.quote.buyTokenBalance,
  };
  
  // EIP-712 domain for CowSwap on Arbitrum
  const domain = {
    name: 'Gnosis Protocol',
    version: 'v2',
    chainId: 42161,
    verifyingContract: '0x9008D19f58AAbD9eD0D60971565AA8510560ab41', // GPv2Settlement
  };
  
  const types = {
    Order: [
      { name: 'sellToken', type: 'address' },
      { name: 'buyToken', type: 'address' },
      { name: 'receiver', type: 'address' },
      { name: 'sellAmount', type: 'uint256' },
      { name: 'buyAmount', type: 'uint256' },
      { name: 'validTo', type: 'uint32' },
      { name: 'appData', type: 'bytes32' },
      { name: 'feeAmount', type: 'uint256' },
      { name: 'kind', type: 'string' },
      { name: 'partiallyFillable', type: 'bool' },
      { name: 'sellTokenBalance', type: 'string' },
      { name: 'buyTokenBalance', type: 'string' },
    ],
  };
  
  const signature = await wallet._signTypedData(domain, types, order);
  console.log('   Signature:', signature.slice(0, 20) + '...');
  
  // Submit order
  console.log('\n📤 Submitting order...');
  
  const orderResponse = await httpPost(`${COWSWAP_API}/orders`, {
    ...order,
    signature,
    signingScheme: 'eip712',
    from: wallet.address,
    quoteId: quote.id,
  });
  
  if (typeof orderResponse === 'string' && orderResponse.startsWith('0x')) {
    console.log(`\n✅ Order submitted!`);
    console.log(`   Order ID: ${orderResponse}`);
    console.log(`   Track: https://explorer.cow.fi/arbitrum_one/orders/${orderResponse}`);
  } else {
    console.log('\n📋 Response:', JSON.stringify(orderResponse, null, 2));
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
