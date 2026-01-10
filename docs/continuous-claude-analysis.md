# Continuous Claude v3 - Analysis for Onde Implementation

**Date**: 2026-01-10
**Priority**: HIGH
**Repository**: https://github.com/parcadei/Continuous-Claude-v3
**Goal**: Never lose track of Mattia's ideas - better context management, automatic saving, never forgetting tasks

---

## Executive Summary

Continuous Claude v3 is a sophisticated system that solves the "compaction problem" - when Claude Code's context fills up, it normally loses critical reasoning and decisions. This system transforms Claude Code into a persistent multi-agent development environment with cross-session memory.

**Key Innovation**: "Compound, don't compact" - instead of losing information during context compaction, the system creates structured handoff documents that preserve actionable context.

**Verdict for Onde**: This system is **highly relevant** to Onde's needs. It directly addresses Mattia's core requirement of never losing ideas. However, given Onde's existing infrastructure, I recommend a **hybrid approach**: adopt the key concepts but integrate them into Onde's existing CLAUDE.md/ROADMAP.md/chat-history system.

---

## 1. What Continuous Claude Does

### Core Problem It Solves

When working with Claude Code:
- Context window fills up over time
- Claude "compacts" conversations to make room
- Critical decisions, reasoning, and context get lost
- Each new session starts nearly from scratch

### Solution Architecture

Continuous Claude creates a **5-layer system** that maintains knowledge across sessions:

#### Layer 1: YAML Handoffs
Instead of losing information during compaction, creates structured handoff documents:
```yaml
session_id: "abc123"
goals_achieved:
  - Fixed authentication bug
  - Added caching layer
goals_remaining:
  - Deploy to production
blockers:
  - Need AWS credentials
decisions_made:
  - Use Redis for caching (reason: existing infrastructure)
thinking_extracted:
  - Key insight about race condition found
```

#### Layer 2: Continuity Ledgers
Markdown files that track within-session state:
- Current goals and progress
- Completed tasks
- Blockers and dependencies
- Strategic decisions

#### Layer 3: Memory Extraction Daemon
When sessions end:
- Daemon spawns Claude Sonnet
- Analyzes "thinking blocks" (reasoning layer)
- Extracts key learnings
- Stores in vector database with embeddings

#### Layer 4: TLDR Code Analysis (95% Context Reduction)
Progressive analysis that dramatically reduces file context:
| Layer | What It Contains | Tokens |
|-------|------------------|--------|
| L1 | AST extraction | ~500 |
| L2 | Call graphs | +440 |
| L3 | Control flow | +110 |
| L4 | Data flow | +130 |
| L5 | Program slicing | +150 |
| **Total** | | ~1,200 |
| **Raw files** | | ~23,000 |

**95% reduction in context used for code understanding!**

#### Layer 5: Vector Database (PostgreSQL + pgvector)
Stores with BGE embeddings:
- Active sessions with heartbeat tracking
- File claims for cross-terminal locking
- Archival memories
- Handoff documents with semantic search

---

## 2. How It Solves Context Problems

### The Continuity Loop

Each session follows this lifecycle:

```
1. SessionStart
   |-- Load ledger from previous session
   |-- Recall relevant memories via semantic search
   |-- Warm TLDR cache for codebase
   |-- Register session in database

2. Working
   |-- Track all file edits
   |-- Index handoffs in real-time
   |-- Increment dirty flags
   |-- Collect agent reports

3. PreCompact (CRITICAL)
   |-- Auto-save state as YAML BEFORE context compaction
   |-- Preserve all decisions and reasoning
   |-- No information loss!

4. SessionEnd
   |-- Daemon awakens
   |-- Extracts thinking blocks
   |-- Stores learnings with embeddings

5. Clear (New Session)
   |-- Fresh context begins
   |-- Previous state accessible via recall
   |-- Seamless continuity
```

### Key Mechanisms

1. **PreCompact Hooks**: Automatically saves state before any compaction event
2. **Semantic Memory**: Uses embeddings to find relevant past context
3. **Structured Handoffs**: YAML format is token-efficient vs raw conversation
4. **Thinking Block Extraction**: Captures reasoning, not just actions

---

## 3. Onde Compatibility Analysis

### What Onde Already Has

Onde has a solid foundation:

| Onde System | Purpose | Status |
|-------------|---------|--------|
| `CLAUDE.md` | Operational memory, rules | Active |
| `ROADMAP.md` | Strategic tasks, vision | Active |
| `chat-history/` | Daily idea capture | Active |
| `.claude-workers/` | Task management | Active |
| `TASKS.json` | Task queue with dependencies | Active |
| Worker Manager | Claim/complete tasks | Active |
| "Sbrinchi Sbronchi" | Manual save trigger | Working |

### Gaps in Onde's Current System

1. **No automatic pre-compaction save** - relies on manual triggers
2. **No semantic search** - can't find relevant past ideas automatically
3. **No structured handoffs** - session transitions are rough
4. **Chat history is append-only** - no extraction of key insights
5. **No memory daemon** - doesn't learn from thinking blocks
6. **Context filling still causes data loss**

### Recommendation: Hybrid Approach

**Don't replace Onde's system - enhance it with Continuous Claude concepts.**

---

## 4. Implementation Plan for Onde

### Phase 1: Essential Hooks (Week 1)
**Goal**: Never lose ideas even during context compaction

#### 1.1 Create Pre-Compaction Hook
```bash
mkdir -p /Users/mattia/Projects/Onde/.claude/hooks
```

Create `.claude/hooks/precompact.js`:
```javascript
// Automatically called before context compaction
// Saves current session state to handoff file

const fs = require('fs');
const path = require('path');

async function preCompact() {
  const timestamp = new Date().toISOString().split('T')[0];
  const handoffPath = path.join(
    process.env.ONDE_ROOT,
    'chat-history',
    `handoff-${timestamp}.yaml`
  );

  const handoff = {
    session_id: process.env.CLAUDE_SESSION_ID,
    timestamp: new Date().toISOString(),
    current_task: getCurrentTask(),
    ideas_discussed: extractIdeas(),
    decisions_made: extractDecisions(),
    blockers: extractBlockers(),
    next_actions: extractNextActions()
  };

  fs.writeFileSync(handoffPath, yaml.dump(handoff));
  console.log(`[PreCompact] Saved handoff to ${handoffPath}`);
}
```

#### 1.2 Create Session Start Hook
```javascript
// Automatically load previous session context
async function sessionStart() {
  // 1. Read CLAUDE.md (already doing this)
  // 2. Read ROADMAP.md (already doing this)
  // 3. Load latest handoff
  // 4. Check for any ideas from yesterday's chat-history
  // 5. Display summary to Mattia
}
```

### Phase 2: Structured Handoffs (Week 2)
**Goal**: Token-efficient session transfers

#### 2.1 Create Handoff Directory
```bash
mkdir -p /Users/mattia/Projects/Onde/thoughts/handoffs
```

#### 2.2 Handoff Template
```yaml
# /Users/mattia/Projects/Onde/thoughts/handoffs/TEMPLATE.yaml
---
session_meta:
  id: string
  start_time: ISO8601
  end_time: ISO8601
  reason: manual | timeout | compaction

context:
  current_task: string
  task_progress: percentage
  working_files: [paths]

ideas:
  - id: uuid
    content: string
    category: feature | improvement | question | decision
    saved_to_roadmap: boolean

decisions:
  - what: string
    why: string
    alternatives_considered: [string]

blockers:
  - description: string
    severity: high | medium | low
    needs: string

next_session:
  priority_1: string
  priority_2: string
  priority_3: string
```

### Phase 3: Semantic Memory (Week 3-4)
**Goal**: Find relevant past context automatically

#### 3.1 Simple Vector Store (SQLite + embeddings)
For Onde, we don't need full PostgreSQL + pgvector. A simpler solution:

```javascript
// tools/memory/vector-store.js
const sqlite3 = require('better-sqlite3');
const { OpenAI } = require('openai');

class OndeMemory {
  constructor(dbPath) {
    this.db = sqlite3(dbPath);
    this.openai = new OpenAI(); // For embeddings
    this.init();
  }

  async storeIdea(content, metadata) {
    const embedding = await this.embed(content);
    this.db.prepare(`
      INSERT INTO memories (content, embedding, category, date, saved_to_roadmap)
      VALUES (?, ?, ?, ?, ?)
    `).run(content, JSON.stringify(embedding), metadata.category, metadata.date, metadata.saved);
  }

  async recall(query, limit = 5) {
    const queryEmbedding = await this.embed(query);
    // Cosine similarity search
    return this.findSimilar(queryEmbedding, limit);
  }
}
```

#### 3.2 Integration with Session Start
```javascript
// At session start:
const memory = new OndeMemory('/Users/mattia/Projects/Onde/.claude-memory/memories.db');

// Find relevant past context based on current task
const relevantMemories = await memory.recall(currentTask);
console.log("Relevant past ideas:", relevantMemories);
```

### Phase 4: Automatic Idea Extraction (Week 4-5)
**Goal**: Extract ideas from conversations automatically

#### 4.1 Idea Extraction Daemon
After each session, run extraction:

```javascript
// scripts/extract-ideas.js
async function extractIdeasFromSession(sessionLog) {
  // Use Claude to extract structured ideas
  const response = await claude.messages.create({
    model: "claude-sonnet-4-20250514",
    messages: [{
      role: "user",
      content: `Extract all ideas, decisions, and tasks from this session log.

Format as YAML with categories:
- ideas: new concepts or features discussed
- decisions: choices made with reasoning
- tasks: concrete action items
- questions: unresolved questions

Session log:
${sessionLog}`
    }]
  });

  return yaml.parse(response.content[0].text);
}
```

### Phase 5: Full Integration (Week 5-6)
**Goal**: Seamless continuous operation

#### 5.1 Updated CLAUDE.md Rule
Add to CLAUDE.md:
```markdown
## REGOLA #4 - CONTINUITY AUTOMATICA

**Questo sistema NON perde mai idee - anche durante compaction!**

### All'inizio di ogni sessione (AUTOMATICO):
1. Carica ultimo handoff da `thoughts/handoffs/`
2. Cerca memorie rilevanti al task corrente
3. Riassumi contesto a Mattia

### Durante la sessione (AUTOMATICO):
- Ogni idea viene estratta e salvata
- Ogni decisione viene loggata con reasoning
- Dirty flag tracka modifiche non salvate

### Prima di compaction (AUTOMATICO):
- Auto-save completo dello stato
- YAML handoff creato
- Nessuna perdita di informazione

### Fine sessione:
- Daemon estrae insights
- Memorie salvate con embeddings
- Pronto per prossima sessione

**Non serve piu' dire "Sbrinchi Sbronchi" per ogni singola idea!**
```

---

## 5. Step-by-Step Setup

### Prerequisites
```bash
# Check Node version
node --version  # Should be 18+

# Check if Docker is available (optional, for full setup)
docker --version
```

### Minimal Setup (Recommended for Onde)

```bash
# 1. Create directory structure
cd /Users/mattia/Projects/Onde
mkdir -p .claude/hooks
mkdir -p .claude-memory
mkdir -p thoughts/handoffs
mkdir -p thoughts/ledgers

# 2. Install dependencies
npm install better-sqlite3 yaml uuid

# 3. Create initial memory database
cat > scripts/init-memory.js << 'EOF'
const sqlite3 = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', '.claude-memory', 'memories.db');
const db = sqlite3(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS memories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    embedding TEXT,
    category TEXT,
    date TEXT,
    saved_to_roadmap BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS handoffs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT,
    yaml_content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    start_time DATETIME,
    end_time DATETIME,
    status TEXT
  );
`);

console.log('Memory database initialized at:', dbPath);
EOF

node scripts/init-memory.js

# 4. Create the hooks
cat > .claude/hooks/precompact.js << 'EOF'
// Pre-compaction hook - saves state before context compaction
const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

module.exports = async function preCompact(context) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const handoffDir = path.join(__dirname, '..', '..', 'thoughts', 'handoffs');
  const handoffPath = path.join(handoffDir, `handoff-${timestamp}.yaml`);

  const handoff = {
    session_id: context.sessionId || 'unknown',
    timestamp: new Date().toISOString(),
    reason: 'precompact',
    context: {
      current_files: context.openFiles || [],
      recent_changes: context.recentChanges || []
    }
  };

  fs.mkdirSync(handoffDir, { recursive: true });
  fs.writeFileSync(handoffPath, yaml.stringify(handoff));

  console.log(`[Onde] Pre-compaction handoff saved: ${handoffPath}`);
};
EOF

# 5. Create session start hook
cat > .claude/hooks/session-start.js << 'EOF'
const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

module.exports = async function sessionStart() {
  const handoffDir = path.join(__dirname, '..', '..', 'thoughts', 'handoffs');

  // Find latest handoff
  if (fs.existsSync(handoffDir)) {
    const files = fs.readdirSync(handoffDir)
      .filter(f => f.endsWith('.yaml'))
      .sort()
      .reverse();

    if (files.length > 0) {
      const latest = fs.readFileSync(path.join(handoffDir, files[0]), 'utf8');
      const handoff = yaml.parse(latest);
      console.log('[Onde] Loaded previous session context');
      return handoff;
    }
  }

  return null;
};
EOF

echo "Setup complete! Onde Continuous Claude is ready."
```

### Full Setup (If You Want Everything)

If you want to try the full Continuous Claude v3 system:

```bash
# Clone the repo
git clone https://github.com/parcadei/Continuous-Claude-v3.git ~/Continuous-Claude-v3

# Navigate to opc directory
cd ~/Continuous-Claude-v3/opc

# Run the setup wizard (requires Python 3.11+, uv, Docker)
uv run python -m scripts.setup.wizard

# Then run /onboard in Claude Code to analyze your codebase
```

---

## 6. Key Features to Adopt

### Must Have (Phase 1-2)
- [x] Pre-compaction hooks - auto-save before losing context
- [x] YAML handoffs - structured session transfers
- [x] Session start loading - restore previous context

### Should Have (Phase 3-4)
- [ ] Vector memory store - semantic search for past ideas
- [ ] Idea extraction daemon - automatic insight capture
- [ ] Continuity ledgers - within-session state tracking

### Nice to Have (Future)
- [ ] TLDR code analysis - 95% context reduction
- [ ] Multi-agent orchestration - parallel workers
- [ ] Braintrust integration - session tracing
- [ ] Full PostgreSQL + pgvector - production-grade storage

---

## 7. Comparison: Current vs Enhanced

| Aspect | Current Onde | With Continuous Claude |
|--------|--------------|------------------------|
| Session handoff | Manual ("Sbrinchi Sbronchi") | Automatic pre-compaction |
| Idea capture | Append to chat-history | Extracted + categorized + searchable |
| Context recovery | Read CLAUDE.md + ROADMAP.md | + Semantic search for relevant memories |
| Compaction handling | Data loss possible | Zero data loss |
| Cross-session learning | None | Daemon extracts insights |
| Finding past decisions | Grep through files | Vector similarity search |

---

## 8. Risk Assessment

### Low Risk
- Hooks are additive - don't break existing system
- SQLite is self-contained - no external dependencies
- YAML is human-readable - can manually inspect/edit

### Medium Risk
- Embeddings require API calls (cost) - can cache aggressively
- Daemon needs to run reliably - add to PM2

### Mitigation
- Keep "Sbrinchi Sbronchi" as backup manual save
- Keep existing ROADMAP.md/CLAUDE.md as source of truth
- New system supplements, doesn't replace

---

## 9. Next Actions

### Immediate (This Week)
1. Create the directory structure (5 min)
2. Install minimal dependencies (5 min)
3. Create pre-compaction hook (30 min)
4. Test with a real session (1 hour)

### This Month
1. Implement session start loading
2. Create YAML handoff template
3. Build simple vector store
4. Add idea extraction

### Future
1. Consider full Continuous Claude v3 adoption
2. Evaluate PostgreSQL + pgvector if SQLite insufficient
3. Add more sophisticated agent orchestration

---

## Appendix: Continuous Claude v3 Feature List

### 109 Skills Available
- `/build greenfield` / `/build brownfield` - Feature development
- `/fix bug` - Bug investigation
- `/explore quick|deep|architecture` - Codebase understanding
- `/premortem` - Risk analysis (TIGERS/ELEPHANTS)
- `/prove` - Lean4 formal verification
- And 100+ more...

### 32 Specialized Agents
- Planners: architect, phoenix, plan-agent
- Explorers: scout, oracle, pathfinder
- Implementers: kraken (TDD), spark
- Debuggers: sleuth, debug-agent, profiler
- Validators: arbiter, critic, judge

### 30 Hooks
- SessionStart, PreToolUse, PostToolUse
- UserPromptSubmit, PreCompact, SessionEnd
- Lifecycle interception at every critical point

---

*Analysis by Claude Code for Onde - 2026-01-10*
