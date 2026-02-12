#!/usr/bin/env node
// PreCompact Hook Runner - Salva stato PRIMA della compaction
// Questo script viene chiamato da Claude Code hooks

const fs = require('fs');
const path = require('path');

const ONDE_ROOT = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const HANDOFF_DIR = path.join(ONDE_ROOT, 'chat-history', 'handoffs');
const MEMORY_DB = path.join(ONDE_ROOT, '.claude-memory', 'memories.db');

// Legge stdin per ottenere il contesto dal hook
async function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('readable', () => {
      let chunk;
      while ((chunk = process.stdin.read()) !== null) {
        data += chunk;
      }
    });
    process.stdin.on('end', () => {
      try {
        resolve(JSON.parse(data));
      } catch {
        resolve({});
      }
    });
    // Timeout dopo 1 secondo se non c'è input
    setTimeout(() => resolve({}), 1000);
  });
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function generateSessionId() {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
}

async function saveHandoff(trigger, context = {}) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  ensureDir(HANDOFF_DIR);

  const handoffPath = path.join(HANDOFF_DIR, `handoff-${timestamp}.yaml`);

  // Leggi ROADMAP per capire le priorità attuali
  let currentPriorities = [];
  try {
    const roadmapPath = path.join(ONDE_ROOT, 'ROADMAP.md');
    if (fs.existsSync(roadmapPath)) {
      const roadmap = fs.readFileSync(roadmapPath, 'utf8');
      // Estrai le prime 3 priorità non completate
      const matches = roadmap.match(/- \[ \] .+/g);
      if (matches) {
        currentPriorities = matches.slice(0, 5).map(m => m.replace('- [ ] ', ''));
      }
    }
  } catch (e) {
    // Ignora errori
  }

  // Leggi ultimi file modificati
  let recentFiles = [];
  try {
    const gitStatus = require('child_process').execSync(
      'git diff --name-only HEAD~5 2>/dev/null || echo ""',
      { cwd: ONDE_ROOT, encoding: 'utf8' }
    );
    recentFiles = gitStatus.split('\n').filter(f => f.trim()).slice(0, 10);
  } catch (e) {
    // Ignora errori git
  }

  const handoff = {
    session_id: context.session_id || generateSessionId(),
    timestamp: new Date().toISOString(),
    trigger: trigger,
    transcript_path: context.transcript_path || '',
    recent_files: recentFiles,
    priorities: currentPriorities
  };

  const yamlContent = `# Onde Continuous Claude - Handoff
# Generated: ${handoff.timestamp}
# Trigger: ${handoff.trigger}

session_meta:
  id: "${handoff.session_id}"
  timestamp: "${handoff.timestamp}"
  trigger: "${handoff.trigger}"
  transcript: "${handoff.transcript_path}"

recent_files:
${recentFiles.map(f => `  - "${f}"`).join('\n') || '  []'}

current_priorities:
${currentPriorities.map(p => `  - "${p.replace(/"/g, '\\"')}"`).join('\n') || '  []'}

notes: |
  Questo handoff e' stato salvato automaticamente prima della compaction.
  Al prossimo avvio, Claude vedra' questo contesto.
`;

  fs.writeFileSync(handoffPath, yamlContent);

  // Log per debug
  const logPath = path.join(ONDE_ROOT, '.claude-memory', 'hooks.log');
  ensureDir(path.dirname(logPath));
  fs.appendFileSync(logPath, `[${new Date().toISOString()}] PreCompact (${trigger}): Saved ${handoffPath}\n`);

  console.log(`[Onde] Handoff saved: ${handoffPath}`);
  return handoffPath;
}

async function main() {
  const trigger = process.argv[2] || 'unknown';
  const context = await readStdin();

  try {
    await saveHandoff(trigger, context);
    process.exit(0);
  } catch (error) {
    console.error('[Onde] PreCompact error:', error.message);
    // Non bloccare - exit 0 per non interrompere Claude
    process.exit(0);
  }
}

main();
