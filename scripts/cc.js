#!/usr/bin/env node
// /Users/mattia/Projects/Onde/scripts/cc.js
// Continuous Claude CLI - Comando principale

const fs = require('fs');
const path = require('path');

const ONDE_ROOT = '/Users/mattia/Projects/Onde';

const commands = {
  start: () => {
    try {
      const sessionStart = require(path.join(ONDE_ROOT, '.claude/hooks/session-start.js'));
      sessionStart.sessionStart();
    } catch (e) {
      console.error('Error loading session-start hook:', e.message);
    }
  },

  save: (message) => {
    try {
      const precompact = require(path.join(ONDE_ROOT, '.claude/hooks/precompact.js'));
      precompact.saveHandoff({
        currentTask: message || 'Manual save',
        reason: 'manual'
      });
    } catch (e) {
      console.error('Error saving handoff:', e.message);
    }
  },

  handoff: () => {
    try {
      const precompact = require(path.join(ONDE_ROOT, '.claude/hooks/precompact.js'));
      precompact.saveHandoff({ reason: 'session_end' });
      console.log('✅ Handoff created. Safe to end session.');
    } catch (e) {
      console.error('Error creating handoff:', e.message);
    }
  },

  status: () => {
    const handoffDir = path.join(ONDE_ROOT, 'chat-history', 'handoffs');
    const memoryDir = path.join(ONDE_ROOT, '.claude-memory');

    console.log('\n📊 CONTINUOUS CLAUDE STATUS\n');

    if (fs.existsSync(handoffDir)) {
      const handoffs = fs.readdirSync(handoffDir).filter(f => f.endsWith('.yaml'));
      console.log(`📋 Handoffs: ${handoffs.length}`);
      if (handoffs.length > 0) {
        console.log(`   Latest: ${handoffs.sort().reverse()[0]}`);
      }
    } else {
      console.log('📋 Handoffs: 0');
    }

    const dbPath = path.join(memoryDir, 'memories.db');
    if (fs.existsSync(dbPath)) {
      const stats = fs.statSync(dbPath);
      console.log(`🧠 Memory DB: ${(stats.size / 1024).toFixed(1)} KB`);
    } else {
      console.log('🧠 Memory DB: not initialized');
    }

    const chatHistoryDir = path.join(ONDE_ROOT, 'chat-history');
    if (fs.existsSync(chatHistoryDir)) {
      const ideaFiles = fs.readdirSync(chatHistoryDir).filter(f => f.endsWith('-ideas.md'));
      console.log(`💡 Idea files: ${ideaFiles.length}`);
    }

    const hooksDir = path.join(ONDE_ROOT, '.claude', 'hooks');
    if (fs.existsSync(hooksDir)) {
      const hooks = fs.readdirSync(hooksDir).filter(f => f.endsWith('.js'));
      console.log(`🪝 Hooks: ${hooks.length} (${hooks.join(', ')})`);
    }
    console.log('');
  },

  test: () => {
    console.log('\n🧪 TESTING CONTINUOUS CLAUDE...\n');
    try {
      const precompact = require(path.join(ONDE_ROOT, '.claude/hooks/precompact.js'));
      const handoffPath = precompact.saveHandoff({ currentTask: 'Test', reason: 'test' });
      console.log(`✅ Precompact OK: ${handoffPath}`);
    } catch (e) {
      console.log(`❌ Precompact FAILED: ${e.message}`);
    }
    try {
      const sessionStart = require(path.join(ONDE_ROOT, '.claude/hooks/session-start.js'));
      const result = sessionStart.getLatestHandoff();
      console.log(`✅ Session-start OK: Found ${result ? 'handoff' : 'no handoff'}`);
    } catch (e) {
      console.log(`❌ Session-start FAILED: ${e.message}`);
    }
    console.log('\n✅ All tests completed!\n');
  },

  help: () => {
    console.log(`
🌊 Continuous Claude CLI v1.0

Usage: node scripts/cc.js <command>

Commands:
  start     Load previous context (session start)
  save      Quick save current state
  handoff   Create handoff before ending session
  status    Show status
  test      Test all components
  help      Show this help
`);
  }
};

const args = process.argv.slice(2);
const command = args[0] || 'help';
const params = args.slice(1).join(' ');
if (commands[command]) commands[command](params);
else { console.log(`Unknown: ${command}`); commands.help(); }
