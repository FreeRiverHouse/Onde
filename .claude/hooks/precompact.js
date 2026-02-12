// /Users/mattia/Projects/Onde/.claude/hooks/precompact.js
// Continuous Claude - Pre-compaction Hook
// Salva lo stato PRIMA che il contesto si compatti

const fs = require('fs');
const path = require('path');

const ONDE_ROOT = process.env.CLAUDE_PROJECT_DIR || process.cwd();

function generateSessionId() {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function saveHandoff(context = {}) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const handoffDir = path.join(ONDE_ROOT, 'chat-history', 'handoffs');
  const handoffPath = path.join(handoffDir, `handoff-${timestamp}.yaml`);

  // Ensure directory exists
  if (!fs.existsSync(handoffDir)) {
    fs.mkdirSync(handoffDir, { recursive: true });
  }

  const handoff = {
    session_meta: {
      id: context.sessionId || generateSessionId(),
      timestamp: new Date().toISOString(),
      reason: context.reason || 'precompact'
    },
    context: {
      current_task: context.currentTask || 'unknown',
      working_files: context.workingFiles || []
    },
    ideas: context.ideas || [],
    decisions: context.decisions || [],
    blockers: context.blockers || [],
    next_session: {
      priority_1: context.nextPriority1 || 'Check ROADMAP.md',
      priority_2: context.nextPriority2 || 'Continue pending tasks',
      priority_3: context.nextPriority3 || 'Review chat-history'
    }
  };

  // Convert to YAML format
  const workingFilesYaml = handoff.context.working_files.length > 0
    ? handoff.context.working_files.map(f => `    - "${f}"`).join('\n')
    : '    []';

  const ideasYaml = handoff.ideas.length > 0
    ? handoff.ideas.map(i => `  - content: "${i.content}"\n    category: "${i.category || 'idea'}"\n    saved_to_roadmap: ${i.saved || false}`).join('\n')
    : '  []';

  const decisionsYaml = handoff.decisions.length > 0
    ? handoff.decisions.map(d => `  - what: "${d.what}"\n    why: "${d.why || ''}"`).join('\n')
    : '  []';

  const blockersYaml = handoff.blockers.length > 0
    ? handoff.blockers.map(b => `  - description: "${b.description}"\n    severity: "${b.severity || 'medium'}"`).join('\n')
    : '  []';

  const yamlContent = `# Handoff - ${timestamp}
# Auto-generated before context compaction
# Continuous Claude v1.0

session_meta:
  id: "${handoff.session_meta.id}"
  timestamp: "${handoff.session_meta.timestamp}"
  reason: "${handoff.session_meta.reason}"

context:
  current_task: "${handoff.context.current_task}"
  working_files:
${workingFilesYaml}

ideas:
${ideasYaml}

decisions:
${decisionsYaml}

blockers:
${blockersYaml}

next_session:
  priority_1: "${handoff.next_session.priority_1}"
  priority_2: "${handoff.next_session.priority_2}"
  priority_3: "${handoff.next_session.priority_3}"
`;

  fs.writeFileSync(handoffPath, yamlContent);
  console.log(`[Continuous Claude] Handoff saved: ${handoffPath}`);
  return handoffPath;
}

// Export for use
module.exports = { saveHandoff, generateSessionId };

// If run directly, create a test handoff
if (require.main === module) {
  const testHandoff = saveHandoff({
    currentTask: 'Implementing Continuous Claude',
    ideas: [
      { content: 'Test idea', category: 'feature' }
    ],
    nextPriority1: 'Complete Continuous Claude implementation'
  });
  console.log('Test handoff created:', testHandoff);
}
