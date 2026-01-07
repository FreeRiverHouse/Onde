#!/usr/bin/env node

/**
 * GitHub Status Updater
 * Commits progress updates every 5 minutes
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const INTERVAL = 5 * 60 * 1000; // 5 minutes
const STATUS_FILE = path.join(__dirname, '.status-updates.json');

function getTimestamp() {
  return new Date().toISOString();
}

function getCurrentBranch() {
  try {
    return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  } catch (error) {
    return null;
  }
}

function getRepoStatus() {
  try {
    const status = execSync('git status --short', { encoding: 'utf8' });
    const branch = getCurrentBranch();
    const lastCommit = execSync('git log -1 --oneline', { encoding: 'utf8' }).trim();

    return {
      timestamp: getTimestamp(),
      branch,
      lastCommit,
      hasChanges: status.trim().length > 0,
      changes: status.trim()
    };
  } catch (error) {
    return {
      timestamp: getTimestamp(),
      error: error.message
    };
  }
}

function saveStatus(status) {
  let history = [];

  if (fs.existsSync(STATUS_FILE)) {
    try {
      history = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf8'));
    } catch (e) {
      console.error('Error reading status file:', e.message);
    }
  }

  history.push(status);

  // Keep only last 100 updates
  if (history.length > 100) {
    history = history.slice(-100);
  }

  fs.writeFileSync(STATUS_FILE, JSON.stringify(history, null, 2));
}

function commitStatus() {
  const status = getRepoStatus();
  saveStatus(status);

  console.log(`[${status.timestamp}] Status update:`);
  console.log(`  Branch: ${status.branch}`);
  console.log(`  Last commit: ${status.lastCommit}`);
  console.log(`  Changes: ${status.hasChanges ? 'Yes' : 'No'}`);

  if (status.hasChanges) {
    try {
      // Add status file
      execSync('git add .status-updates.json', { stdio: 'inherit' });

      // Commit with timestamp
      const message = `[status] Auto-update ${status.timestamp}`;
      execSync(`git commit -m "${message}"`, { stdio: 'inherit' });

      console.log(`  ✓ Committed status update`);
    } catch (error) {
      console.error('  ✗ Error committing:', error.message);
    }
  }
}

function start() {
  console.log('GitHub Status Updater started');
  console.log(`Update interval: 5 minutes`);
  console.log(`Branch: ${getCurrentBranch()}`);
  console.log('');

  // First update immediately
  commitStatus();

  // Then every 5 minutes
  setInterval(() => {
    commitStatus();
  }, INTERVAL);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nStopping status updater...');
  process.exit(0);
});

start();
