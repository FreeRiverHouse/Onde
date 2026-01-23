#!/usr/bin/env node
// SessionStart Hook - Inietta contesto e regole all'avvio
// Output va a stdout → Claude lo vede nel contesto

const fs = require('fs');
const path = require('path');

const ONDE_ROOT = process.env.CLAUDE_PROJECT_DIR || '/Users/mattiapetrucciani/CascadeProjects/Onde';
const HANDOFF_DIR = path.join(ONDE_ROOT, 'chat-history', 'handoffs');
const CHEATSHEET_PATH = path.join(ONDE_ROOT, 'CHEATSHEET.md');

function getLatestHandoff() {
  if (!fs.existsSync(HANDOFF_DIR)) return null;
  const files = fs.readdirSync(HANDOFF_DIR)
    .filter(f => f.startsWith('handoff-') && f.endsWith('.yaml'))
    .sort().reverse();
  if (files.length === 0) return null;
  return {
    filename: files[0],
    content: fs.readFileSync(path.join(HANDOFF_DIR, files[0]), 'utf8')
  };
}

function getRecentIdeas() {
  const chatDir = path.join(ONDE_ROOT, 'chat-history');
  if (!fs.existsSync(chatDir)) return null;
  const today = new Date().toISOString().split('T')[0];
  const todayFile = path.join(chatDir, `${today}-ideas.md`);
  if (fs.existsSync(todayFile)) {
    return fs.readFileSync(todayFile, 'utf8').substring(0, 500);
  }
  // Try yesterday
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const yesterdayFile = path.join(chatDir, `${yesterday}-ideas.md`);
  if (fs.existsSync(yesterdayFile)) {
    return `[${yesterday}] ` + fs.readFileSync(yesterdayFile, 'utf8').substring(0, 500);
  }
  return null;
}

function main() {
  const source = process.argv[2] || 'unknown';
  const output = [];

  output.push('=== ONDE CONTINUOUS CLAUDE ===');
  output.push('');

  // 1. Regole critiche (dal CHEATSHEET)
  output.push('REGOLE SESSIONE:');
  output.push('- LEGGI CHEATSHEET.md e ROADMAP.md');
  output.push('- "Sbrinchi sbronchi" = FINE SESSIONE: aggiorna chat-history/YYYY-MM-DD-ideas.md, ROADMAP.md, git commit+push, conferma');
  output.push('- SEMPRE git pull PRIMA di lavorare');
  output.push('- MAI spendere soldi senza autorizzazione');
  output.push('- Telegram bot per comunicare con Mattia (chat 7505631979)');
  output.push('');

  // 2. Ultimo handoff
  const handoff = getLatestHandoff();
  if (handoff) {
    output.push(`ULTIMO HANDOFF: ${handoff.filename}`);
    output.push(handoff.content.substring(0, 800));
    output.push('');
  }

  // 3. Idee recenti
  const ideas = getRecentIdeas();
  if (ideas) {
    output.push('IDEE RECENTI:');
    output.push(ideas);
    output.push('');
  }

  output.push('=== FINE CONTEXT INJECTION ===');

  // Output to stdout - Claude will see this
  console.log(output.join('\n'));
}

main();
