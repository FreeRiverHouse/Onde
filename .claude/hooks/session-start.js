// /Users/mattia/Projects/Onde/.claude/hooks/session-start.js
// Continuous Claude - Session Start Hook
// Carica il contesto della sessione precedente

const fs = require('fs');
const path = require('path');

const ONDE_ROOT = '/Users/mattia/Projects/Onde';

function getLatestHandoff() {
  const handoffDir = path.join(ONDE_ROOT, 'chat-history', 'handoffs');

  if (!fs.existsSync(handoffDir)) {
    return null;
  }

  const files = fs.readdirSync(handoffDir)
    .filter(f => f.startsWith('handoff-') && f.endsWith('.yaml'))
    .sort()
    .reverse();

  if (files.length === 0) {
    return null;
  }

  const latestPath = path.join(handoffDir, files[0]);
  const content = fs.readFileSync(latestPath, 'utf8');

  return {
    path: latestPath,
    filename: files[0],
    content: content
  };
}

function getTodayIdeas() {
  const today = new Date().toISOString().split('T')[0];
  const ideasPath = path.join(ONDE_ROOT, 'chat-history', `${today}-ideas.md`);

  if (!fs.existsSync(ideasPath)) {
    return null;
  }

  return fs.readFileSync(ideasPath, 'utf8');
}

function getRecentIdeas(days = 3) {
  const chatHistoryDir = path.join(ONDE_ROOT, 'chat-history');
  const ideas = [];

  if (!fs.existsSync(chatHistoryDir)) {
    return ideas;
  }

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const ideasPath = path.join(chatHistoryDir, `${dateStr}-ideas.md`);

    if (fs.existsSync(ideasPath)) {
      const content = fs.readFileSync(ideasPath, 'utf8');
      ideas.push({
        date: dateStr,
        path: ideasPath,
        preview: content.slice(0, 500) + (content.length > 500 ? '...' : '')
      });
    }
  }

  return ideas;
}

function sessionStart() {
  console.log('\n========================================');
  console.log('🌊 ONDE - SESSION START');
  console.log('   Continuous Claude v1.0');
  console.log('========================================\n');

  // 1. Check for latest handoff
  const handoff = getLatestHandoff();
  if (handoff) {
    console.log(`📋 ULTIMO HANDOFF: ${handoff.filename}`);
    console.log('---');
    console.log(handoff.content);
    console.log('---\n');
  } else {
    console.log('📋 Nessun handoff precedente trovato\n');
  }

  // 2. Check today's ideas
  const todayIdeas = getTodayIdeas();
  if (todayIdeas) {
    console.log('💡 IDEE DI OGGI:');
    console.log(todayIdeas.slice(0, 1000));
    if (todayIdeas.length > 1000) console.log('...');
    console.log('\n');
  }

  // 3. Recent ideas
  const recentIdeas = getRecentIdeas(3);
  if (recentIdeas.length > 0) {
    console.log('📚 IDEE RECENTI:');
    recentIdeas.forEach(i => {
      console.log(`  - ${i.date}: ${i.path}`);
    });
    console.log('');
  }

  // 4. Reminder
  console.log('⚠️  RICORDA:');
  console.log('  1. Leggi ROADMAP.md');
  console.log('  2. Leggi CLAUDE.md');
  console.log('  3. Non perdere le idee di Mattia!');
  console.log('\n========================================\n');

  return {
    handoff,
    todayIdeas,
    recentIdeas
  };
}

module.exports = { sessionStart, getLatestHandoff, getTodayIdeas, getRecentIdeas };

// If run directly
if (require.main === module) {
  sessionStart();
}
