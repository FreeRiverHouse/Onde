/**
 * LLM Handover System
 *
 * Gestisce il passaggio di contesto tra LLM providers.
 * Quando si switcha, genera un summary con:
 * - Task corrente
 * - File modificati di recente
 * - Procedure rilevanti
 * - Link GitHub
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const HANDOVER_FILE = path.join(__dirname, 'handover-context.json');
const ONDE_ROOT = process.env.ONDE_ROOT || path.resolve(__dirname, '../..');

// Context storage
let currentContext = {
  currentTask: null,
  workingFiles: [],
  recentCommits: [],
  activeIssues: [],
  procedures: [],
  notes: [],
  lastUpdated: null
};

// Load context from file
function loadContext() {
  try {
    if (fs.existsSync(HANDOVER_FILE)) {
      currentContext = JSON.parse(fs.readFileSync(HANDOVER_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error loading handover context:', e.message);
  }
  return currentContext;
}

// Save context to file
function saveContext() {
  currentContext.lastUpdated = new Date().toISOString();
  try {
    fs.writeFileSync(HANDOVER_FILE, JSON.stringify(currentContext, null, 2));
  } catch (e) {
    console.error('Error saving handover context:', e.message);
  }
}

// Update current task
function setCurrentTask(task) {
  currentContext.currentTask = {
    description: task,
    startedAt: new Date().toISOString()
  };
  saveContext();
}

// Add working file
function addWorkingFile(filePath, description = '') {
  const existing = currentContext.workingFiles.find(f => f.path === filePath);
  if (existing) {
    existing.description = description || existing.description;
    existing.lastAccessed = new Date().toISOString();
  } else {
    currentContext.workingFiles.push({
      path: filePath,
      description,
      addedAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString()
    });
  }
  // Keep only last 20 files
  currentContext.workingFiles = currentContext.workingFiles.slice(-20);
  saveContext();
}

// Add note
function addNote(note) {
  currentContext.notes.push({
    content: note,
    addedAt: new Date().toISOString()
  });
  // Keep only last 10 notes
  currentContext.notes = currentContext.notes.slice(-10);
  saveContext();
}

// Add procedure reference
function addProcedure(name, path, description = '') {
  const existing = currentContext.procedures.find(p => p.name === name);
  if (!existing) {
    currentContext.procedures.push({ name, path, description });
    saveContext();
  }
}

// Get recent git activity
function getRecentGitActivity() {
  try {
    // Recent commits
    const commits = execSync(
      `cd "${ONDE_ROOT}" && git log --oneline -10 --format="%h %s" 2>/dev/null`,
      { encoding: 'utf8' }
    ).trim().split('\n').filter(Boolean);

    // Modified files
    const modified = execSync(
      `cd "${ONDE_ROOT}" && git diff --name-only HEAD~5 HEAD 2>/dev/null | head -15`,
      { encoding: 'utf8' }
    ).trim().split('\n').filter(Boolean);

    // Current branch
    const branch = execSync(
      `cd "${ONDE_ROOT}" && git branch --show-current 2>/dev/null`,
      { encoding: 'utf8' }
    ).trim();

    // Remote URL
    const remote = execSync(
      `cd "${ONDE_ROOT}" && git remote get-url origin 2>/dev/null`,
      { encoding: 'utf8' }
    ).trim();

    return { commits, modified, branch, remote };
  } catch (e) {
    return { commits: [], modified: [], branch: 'unknown', remote: '' };
  }
}

// Get relevant procedures from docs
function findRelevantProcedures() {
  const procedures = [];
  const docsDir = path.join(ONDE_ROOT, 'tools');

  try {
    if (fs.existsSync(docsDir)) {
      const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.md'));
      for (const file of files) {
        const content = fs.readFileSync(path.join(docsDir, file), 'utf8');
        const title = content.match(/^#\s+(.+)/m)?.[1] || file;
        procedures.push({
          name: title,
          path: `tools/${file}`,
          preview: content.substring(0, 200).replace(/\n/g, ' ')
        });
      }
    }
  } catch (e) {
    // Ignore errors
  }

  // Add CLAUDE.md
  try {
    const claudeMd = path.join(ONDE_ROOT, 'CLAUDE.md');
    if (fs.existsSync(claudeMd)) {
      procedures.push({
        name: 'CLAUDE.md - Project Instructions',
        path: 'CLAUDE.md',
        preview: 'Main project configuration and instructions'
      });
    }
  } catch (e) {
    // Ignore
  }

  return procedures;
}

// Generate handover summary
function generateHandover(fromProvider, toProvider) {
  loadContext();
  const git = getRecentGitActivity();
  const procedures = findRelevantProcedures();

  const handover = {
    meta: {
      generatedAt: new Date().toISOString(),
      fromProvider,
      toProvider,
      machine: 'Radeon Mac',
      ondeRoot: ONDE_ROOT
    },

    currentWork: {
      task: currentContext.currentTask,
      notes: currentContext.notes.slice(-5)
    },

    files: {
      recentlyWorked: currentContext.workingFiles.slice(-10),
      recentlyModified: git.modified.map(f => ({
        path: f,
        github: `${git.remote.replace('.git', '')}/blob/${git.branch}/${f}`
      }))
    },

    git: {
      branch: git.branch,
      recentCommits: git.commits.slice(0, 5),
      remoteUrl: git.remote,
      prUrl: git.remote.replace('.git', '') + '/compare/' + git.branch
    },

    procedures: procedures.slice(0, 5),

    importantPaths: {
      telegramBot: 'packages/telegram-bot/',
      llmConfig: 'packages/telegram-bot/llm-config.js',
      watchdog: 'packages/telegram-bot/llm-watchdog.js',
      claudeMd: 'CLAUDE.md',
      radeonProcedures: 'tools/RADEON-TINYGRAD-PROCEDURES.md'
    }
  };

  return handover;
}

// Generate markdown handover
function generateHandoverMarkdown(fromProvider, toProvider) {
  const h = generateHandover(fromProvider, toProvider);

  let md = `# 🔄 LLM Handover

**Da:** ${fromProvider || 'Unknown'}
**A:** ${toProvider}
**Data:** ${new Date().toLocaleString()}

---

## 📋 Task Corrente
${h.currentWork.task ? `
**${h.currentWork.task.description}**
Iniziato: ${new Date(h.currentWork.task.startedAt).toLocaleString()}
` : '_Nessun task specifico_'}

${h.currentWork.notes.length > 0 ? `
### Note recenti:
${h.currentWork.notes.map(n => `- ${n.content}`).join('\n')}
` : ''}

---

## 📁 File Rilevanti

### Modificati di recente:
${h.files.recentlyModified.slice(0, 8).map(f => `- \`${f.path}\``).join('\n') || '_Nessuno_'}

### In lavorazione:
${h.files.recentlyWorked.slice(0, 5).map(f => `- \`${f.path}\` ${f.description ? `- ${f.description}` : ''}`).join('\n') || '_Nessuno_'}

---

## 🔗 GitHub

- **Branch:** \`${h.git.branch}\`
- **Remote:** ${h.git.remoteUrl}
- **PR URL:** ${h.git.prUrl}

### Commit recenti:
${h.git.recentCommits.map(c => `- ${c}`).join('\n') || '_Nessuno_'}

---

## 📚 Procedure Rilevanti

${h.procedures.map(p => `- **${p.name}** - \`${p.path}\``).join('\n') || '_Nessuna_'}

---

## 🗂️ Path Importanti

| Cosa | Path |
|------|------|
| Telegram Bot | \`${h.importantPaths.telegramBot}\` |
| LLM Config | \`${h.importantPaths.llmConfig}\` |
| Watchdog | \`${h.importantPaths.watchdog}\` |
| CLAUDE.md | \`${h.importantPaths.claudeMd}\` |
| Radeon Procedures | \`${h.importantPaths.radeonProcedures}\` |

---

_Generato automaticamente dal LLM Handover System_
`;

  return md;
}

// Save handover to file
function saveHandoverFile(fromProvider, toProvider) {
  const md = generateHandoverMarkdown(fromProvider, toProvider);
  const filename = `handover-${new Date().toISOString().replace(/[:.]/g, '-')}.md`;
  const filepath = path.join(__dirname, 'handovers', filename);

  try {
    fs.mkdirSync(path.join(__dirname, 'handovers'), { recursive: true });
    fs.writeFileSync(filepath, md);
    return filepath;
  } catch (e) {
    console.error('Error saving handover:', e.message);
    return null;
  }
}

// Get compact handover for API
function getCompactHandover(fromProvider, toProvider) {
  const h = generateHandover(fromProvider, toProvider);

  return {
    summary: h.currentWork.task?.description || 'No specific task',
    branch: h.git.branch,
    recentFiles: h.files.recentlyModified.slice(0, 5).map(f => f.path),
    recentCommits: h.git.recentCommits.slice(0, 3),
    procedures: h.procedures.slice(0, 3).map(p => p.name),
    prUrl: h.git.prUrl
  };
}

module.exports = {
  loadContext,
  saveContext,
  setCurrentTask,
  addWorkingFile,
  addNote,
  addProcedure,
  generateHandover,
  generateHandoverMarkdown,
  saveHandoverFile,
  getCompactHandover,
  getRecentGitActivity
};
