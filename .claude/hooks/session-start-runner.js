#!/usr/bin/env node
// SessionStart Hook Runner - Carica contesto all'avvio
// Questo script viene chiamato da Claude Code hooks

const fs = require('fs');
const path = require('path');

const ONDE_ROOT = process.env.CLAUDE_PROJECT_DIR || '/Users/mattia/Projects/Onde';
const HANDOFF_DIR = path.join(ONDE_ROOT, 'chat-history', 'handoffs');
const MEMORY_LOG = path.join(ONDE_ROOT, '.claude-memory', 'hooks.log');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function log(message) {
  ensureDir(path.dirname(MEMORY_LOG));
  fs.appendFileSync(MEMORY_LOG, `[${new Date().toISOString()}] ${message}\n`);
}

function getLatestHandoff() {
  if (!fs.existsSync(HANDOFF_DIR)) {
    return null;
  }

  const files = fs.readdirSync(HANDOFF_DIR)
    .filter(f => f.startsWith('handoff-') && f.endsWith('.yaml'))
    .sort()
    .reverse();

  if (files.length === 0) {
    return null;
  }

  const latestPath = path.join(HANDOFF_DIR, files[0]);
  return {
    path: latestPath,
    filename: files[0],
    content: fs.readFileSync(latestPath, 'utf8')
  };
}

function getRecentIdeas() {
  // Cerca idee recenti nel chat-history
  const chatHistoryDir = path.join(ONDE_ROOT, 'chat-history');
  if (!fs.existsSync(chatHistoryDir)) {
    return [];
  }

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const ideas = [];
  for (const date of [today, yesterday]) {
    const filePath = path.join(chatHistoryDir, `${date}.md`);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      // Estrai linee che sembrano idee (iniziano con - o *)
      const matches = content.match(/^[\-\*] .+$/gm);
      if (matches) {
        ideas.push(...matches.slice(0, 5));
      }
    }
  }

  return ideas.slice(0, 10);
}

function getCurrentPriorities() {
  const roadmapPath = path.join(ONDE_ROOT, 'ROADMAP.md');
  if (!fs.existsSync(roadmapPath)) {
    return [];
  }

  const content = fs.readFileSync(roadmapPath, 'utf8');

  // Cerca sezione PRIORITÀ IMMEDIATE
  const priorityMatch = content.match(/## 🔴 PRIORITÀ IMMEDIATE[\s\S]*?(?=\n## |$)/);
  if (priorityMatch) {
    const tasks = priorityMatch[0].match(/- \[ \] .+/g);
    if (tasks) {
      return tasks.slice(0, 5).map(t => t.replace('- [ ] ', ''));
    }
  }

  // Fallback: prendi qualsiasi task non completato
  const allTasks = content.match(/- \[ \] .+/g);
  return allTasks ? allTasks.slice(0, 5).map(t => t.replace('- [ ] ', '')) : [];
}

async function main() {
  const source = process.argv[2] || 'unknown';
  log(`SessionStart (${source}): Hook triggered`);

  try {
    // 1. Carica ultimo handoff
    const handoff = getLatestHandoff();

    // 2. Carica priorità correnti
    const priorities = getCurrentPriorities();

    // 3. Carica idee recenti
    const recentIdeas = getRecentIdeas();

    // 4. Crea summary per il log
    const summary = {
      source,
      timestamp: new Date().toISOString(),
      lastHandoff: handoff ? handoff.filename : 'none',
      prioritiesCount: priorities.length,
      recentIdeasCount: recentIdeas.length
    };

    log(`SessionStart: Loaded context - ${JSON.stringify(summary)}`);

    // 5. Output per Claude (verrà letto come contesto)
    if (handoff) {
      console.log(`[Onde Session] Ultimo handoff: ${handoff.filename}`);
    }
    if (priorities.length > 0) {
      console.log(`[Onde Session] Top priority: ${priorities[0]}`);
    }

    process.exit(0);
  } catch (error) {
    log(`SessionStart ERROR: ${error.message}`);
    // Non bloccare - exit 0
    process.exit(0);
  }
}

main();
