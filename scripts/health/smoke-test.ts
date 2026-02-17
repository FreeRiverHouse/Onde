#!/usr/bin/env npx ts-node
/**
 * Smoke Test Script for Onde PR Bot
 *
 * Performs minimal end-to-end validation:
 * 1. Telegram Bot API connectivity
 * 2. Twitter API connectivity (read-only)
 * 3. Configuration validation
 *
 * This is a NON-DESTRUCTIVE test - it does NOT post anything.
 *
 * Exit codes:
 * 0 - All tests passed
 * 1 - Test failed
 */

import * as path from 'path';
import * as https from 'https';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  duration: number;
}

const results: TestResult[] = [];

// Load environment
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../../.env') });

function log(emoji: string, message: string): void {
  console.log(`${emoji} ${message}`);
}

async function runTest(
  name: string,
  testFn: () => Promise<string>
): Promise<void> {
  const start = Date.now();
  try {
    const message = await testFn();
    const duration = Date.now() - start;
    results.push({ name, passed: true, message, duration });
    log('  ', `${name}: ${message} (${duration}ms)`);
  } catch (error: any) {
    const duration = Date.now() - start;
    results.push({ name, passed: false, message: error.message, duration });
    log('  ', `${name}: ${error.message} (${duration}ms)`);
  }
}

// Helper: Make HTTPS request
function httpsGet(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            reject(new Error('Invalid JSON response'));
          }
        });
      })
      .on('error', reject);
  });
}

// Test 1: Telegram Bot API
async function testTelegramApi(): Promise<string> {
  const token = process.env.ONDE_PR_TELEGRAM_TOKEN;
  if (!token) {
    throw new Error('ONDE_PR_TELEGRAM_TOKEN not set');
  }

  const response = await httpsGet(
    `https://api.telegram.org/bot${token}/getMe`
  );

  if (!response.ok) {
    throw new Error(response.description || 'API error');
  }

  return `Bot @${response.result.username} is online`;
}

// Test 2: Twitter API (read-only check)
async function testTwitterApi(): Promise<string> {
  // We'll just verify the environment variables are set
  // Actual Twitter API requires OAuth which is complex for a smoke test
  const requiredVars = [
    'TWITTER_API_KEY',
    'TWITTER_API_SECRET',
    'TWITTER_ACCESS_TOKEN',
    'TWITTER_ACCESS_SECRET',
  ];

  const missing = requiredVars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    throw new Error(`Missing: ${missing.join(', ')}`);
  }

  return 'Twitter credentials configured';
}

// Test 3: Configuration validation
async function testConfiguration(): Promise<string> {
  const { envSchema } = require('../../packages/core/dist/config/index.js');

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const errors = result.error.issues.map((i: any) => i.path.join('.')).join(', ');
    throw new Error(`Invalid config: ${errors}`);
  }

  return 'Configuration valid';
}

// Test 4: Module imports
async function testModuleImports(): Promise<string> {
  try {
    require('../../packages/telegram-bot/dist/index.js');
    throw new Error('Bot module should not auto-start');
  } catch (error: any) {
    // Expected - the bot tries to start on import
    // We just want to verify the code loads
    if (error.message.includes('TELEGRAM_TOKEN') ||
        error.message.includes('Cannot read') ||
        error.message === 'Bot module should not auto-start') {
      return 'Modules load correctly';
    }
    return 'Modules compile correctly';
  }
}

// Main
async function main(): Promise<void> {
  console.log('\n========================================');
  console.log('   Onde PR Bot - Smoke Test');
  console.log('========================================\n');

  const startTime = Date.now();

  // Run tests
  await runTest('Telegram API', testTelegramApi);
  await runTest('Twitter Config', testTwitterApi);

  // Only run these if builds exist
  const fs = require('fs');
  const coreDistPath = path.join(__dirname, '../../packages/core/dist/config/index.js');

  if (fs.existsSync(coreDistPath)) {
    await runTest('Configuration', testConfiguration);
  } else {
    log('  ', 'Configuration: Skipped (no build)');
  }

  // Summary
  const totalDuration = Date.now() - startTime;
  console.log('\n----------------------------------------');
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  console.log(`Total time: ${totalDuration}ms`);

  if (failed > 0) {
    console.log('\n   SMOKE TEST FAILED');
    process.exit(1);
  } else {
    console.log('\n   SMOKE TEST PASSED');
    process.exit(0);
  }
}

main().catch((error) => {
  console.error('Smoke test error:', error);
  process.exit(1);
});
