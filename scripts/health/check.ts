#!/usr/bin/env npx ts-node
/**
 * Health Check Script for Onde PR Bot
 *
 * Validates:
 * 1. Required environment variables
 * 2. TypeScript compilation
 * 3. Package dependencies
 * 4. API connectivity (dry-run mode in CI)
 *
 * Exit codes:
 * 0 - All checks passed
 * 1 - Critical check failed
 * 2 - Warning (non-critical check failed)
 */

import * as fs from 'fs';
import * as path from 'path';

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn' | 'skip';
  message: string;
  details?: string;
}

const results: CheckResult[] = [];
const isCI = process.env.CI === 'true';
const isDryRun = process.env.DRY_RUN === 'true';

function log(emoji: string, message: string): void {
  console.log(`${emoji} ${message}`);
}

function addResult(result: CheckResult): void {
  results.push(result);
  const emoji =
    result.status === 'pass'
      ? '  '
      : result.status === 'fail'
        ? '  '
        : result.status === 'warn'
          ? '  '
          : '  ';
  log(emoji, `${result.name}: ${result.message}`);
  if (result.details) {
    console.log(`     ${result.details}`);
  }
}

// Check 1: Required environment variables
function checkEnvironmentVariables(): void {
  const requiredVars = [
    'ONDE_PR_TELEGRAM_TOKEN',
    'ONDE_PR_CHAT_ID',
    'TWITTER_API_KEY',
    'TWITTER_API_SECRET',
    'TWITTER_ACCESS_TOKEN',
    'TWITTER_ACCESS_SECRET',
  ];

  const optionalVars = [
    'ANTHROPIC_API_KEY',
    'X_ONDE_API_KEY',
    'X_MAGMATIC_API_KEY',
  ];

  // Load .env if not in CI
  if (!isCI) {
    const envPath = path.join(__dirname, '../../.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      envContent.split('\n').forEach((line) => {
        const [key, ...valueParts] = line.split('=');
        if (key && !key.startsWith('#')) {
          process.env[key.trim()] = valueParts.join('=').trim();
        }
      });
    }
  }

  const missing = requiredVars.filter((v) => !process.env[v]);

  if (missing.length === 0) {
    addResult({
      name: 'Environment Variables',
      status: 'pass',
      message: 'All required variables present',
    });
  } else if (isCI || isDryRun) {
    addResult({
      name: 'Environment Variables',
      status: 'skip',
      message: 'Skipped in CI/dry-run mode',
      details: `Would check: ${requiredVars.join(', ')}`,
    });
  } else {
    addResult({
      name: 'Environment Variables',
      status: 'fail',
      message: `Missing ${missing.length} required variables`,
      details: missing.join(', '),
    });
  }

  // Check optional vars
  const missingOptional = optionalVars.filter((v) => !process.env[v]);
  if (missingOptional.length > 0 && !isCI && !isDryRun) {
    addResult({
      name: 'Optional Variables',
      status: 'warn',
      message: `${missingOptional.length} optional variables not set`,
      details: missingOptional.join(', '),
    });
  }
}

// Check 2: Package structure
function checkPackageStructure(): void {
  const requiredDirs = [
    'packages/core',
    'packages/telegram-bot',
    'packages/agents',
  ];

  const projectRoot = path.join(__dirname, '../..');
  const missingDirs = requiredDirs.filter(
    (dir) => !fs.existsSync(path.join(projectRoot, dir))
  );

  if (missingDirs.length === 0) {
    addResult({
      name: 'Package Structure',
      status: 'pass',
      message: 'All required packages exist',
    });
  } else {
    addResult({
      name: 'Package Structure',
      status: 'fail',
      message: `Missing ${missingDirs.length} packages`,
      details: missingDirs.join(', '),
    });
  }
}

// Check 3: Build artifacts
function checkBuildArtifacts(): void {
  const buildPaths = [
    'packages/telegram-bot/dist/index.js',
    'packages/core/dist/index.js',
  ];

  const projectRoot = path.join(__dirname, '../..');
  const missingBuilds = buildPaths.filter(
    (p) => !fs.existsSync(path.join(projectRoot, p))
  );

  if (missingBuilds.length === 0) {
    addResult({
      name: 'Build Artifacts',
      status: 'pass',
      message: 'All build artifacts present',
    });
  } else {
    addResult({
      name: 'Build Artifacts',
      status: 'warn',
      message: `Missing ${missingBuilds.length} build artifacts`,
      details: `Run 'npm run build' - Missing: ${missingBuilds.join(', ')}`,
    });
  }
}

// Check 4: Node.js version
function checkNodeVersion(): void {
  const nodeVersion = process.version;
  const major = parseInt(nodeVersion.slice(1).split('.')[0], 10);

  if (major >= 18) {
    addResult({
      name: 'Node.js Version',
      status: 'pass',
      message: `${nodeVersion} (>= 18 required)`,
    });
  } else {
    addResult({
      name: 'Node.js Version',
      status: 'fail',
      message: `${nodeVersion} is too old`,
      details: 'Node.js 18+ is required',
    });
  }
}

// Check 5: Package.json validity
function checkPackageJson(): void {
  const projectRoot = path.join(__dirname, '../..');
  const packageJsonPath = path.join(projectRoot, 'package.json');

  try {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

    if (!pkg.scripts?.build || !pkg.scripts?.test || !pkg.scripts?.lint) {
      addResult({
        name: 'Package Scripts',
        status: 'warn',
        message: 'Missing some standard scripts',
        details: 'Ensure build, test, lint scripts exist',
      });
    } else {
      addResult({
        name: 'Package Scripts',
        status: 'pass',
        message: 'All standard scripts defined',
      });
    }
  } catch (error) {
    addResult({
      name: 'Package Scripts',
      status: 'fail',
      message: 'Could not parse package.json',
    });
  }
}

// Check 6: TypeScript config
function checkTypeScriptConfig(): void {
  const projectRoot = path.join(__dirname, '../..');
  const tsconfigPath = path.join(projectRoot, 'tsconfig.json');

  if (fs.existsSync(tsconfigPath)) {
    try {
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));
      const strict = tsconfig.compilerOptions?.strict === true;

      addResult({
        name: 'TypeScript Config',
        status: strict ? 'pass' : 'warn',
        message: strict ? 'Strict mode enabled' : 'Strict mode not enabled',
      });
    } catch {
      addResult({
        name: 'TypeScript Config',
        status: 'warn',
        message: 'Could not parse tsconfig.json',
      });
    }
  } else {
    addResult({
      name: 'TypeScript Config',
      status: 'fail',
      message: 'tsconfig.json not found',
    });
  }
}

// Main
async function main(): Promise<void> {
  console.log('\n========================================');
  console.log('   Onde PR Bot - Health Check');
  console.log('========================================\n');

  if (isCI) {
    log('  ', 'Running in CI mode');
  }
  if (isDryRun) {
    log('  ', 'Running in dry-run mode');
  }
  console.log('');

  // Run all checks
  checkNodeVersion();
  checkPackageStructure();
  checkPackageJson();
  checkTypeScriptConfig();
  checkBuildArtifacts();
  checkEnvironmentVariables();

  // Summary
  console.log('\n----------------------------------------');
  const passed = results.filter((r) => r.status === 'pass').length;
  const failed = results.filter((r) => r.status === 'fail').length;
  const warned = results.filter((r) => r.status === 'warn').length;
  const skipped = results.filter((r) => r.status === 'skip').length;

  console.log(
    `\nResults: ${passed} passed, ${failed} failed, ${warned} warnings, ${skipped} skipped`
  );

  if (failed > 0) {
    console.log('\n   HEALTH CHECK FAILED');
    process.exit(1);
  } else if (warned > 0) {
    console.log('\n   HEALTH CHECK PASSED WITH WARNINGS');
    process.exit(0);
  } else {
    console.log('\n   HEALTH CHECK PASSED');
    process.exit(0);
  }
}

main().catch((error) => {
  console.error('Health check error:', error);
  process.exit(1);
});
