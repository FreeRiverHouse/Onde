# Agent Memory System - Onde.surf

## Overview

Gli agenti Onde.surf (OndePR, Gianni, Pina, Engineer) attualmente eseguono task in isolamento senza memoria persistente tra le esecuzioni.

## Schema D1

```sql
-- Run this in Cloudflare D1 dashboard or via wrangler d1 execute
CREATE TABLE IF NOT EXISTS agent_memory (
  id TEXT PRIMARY KEY,
  agent_name TEXT NOT NULL,
  memory_type TEXT NOT NULL, -- 'conversation', 'decision', 'lesson', 'context'
  content TEXT NOT NULL,
  task_id TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  expires_at TEXT,
  importance INTEGER DEFAULT 0 -- 0-10, higher = more important
);

CREATE INDEX idx_agent_memory_agent ON agent_memory(agent_name);
CREATE INDEX idx_agent_memory_type ON agent_memory(memory_type);
CREATE INDEX idx_agent_memory_created ON agent_memory(created_at DESC);
```

## Protocollo Memoria (da implementare)

### 1. Prima di ogni task
```typescript
async function loadAgentContext(db: D1Database, agentName: string): Promise<string> {
  // Carica ultimi 10 memory entries per l'agente
  const memories = await db.prepare(`
    SELECT content, memory_type, created_at 
    FROM agent_memory 
    WHERE agent_name = ? 
    ORDER BY importance DESC, created_at DESC 
    LIMIT 10
  `).bind(agentName).all()
  
  if (!memories.results?.length) return ''
  
  return `## Previous Context\n${memories.results.map(m => 
    `- [${m.memory_type}] ${m.content}`
  ).join('\n')}`
}
```

### 2. Dopo ogni task
```typescript
async function saveTaskMemory(
  db: D1Database, 
  agentName: string, 
  taskId: string, 
  result: string
): Promise<void> {
  // Extract key decisions/lessons from result (could use Claude to summarize)
  await db.prepare(`
    INSERT INTO agent_memory (id, agent_name, memory_type, content, task_id, importance)
    VALUES (?, ?, 'task_result', ?, ?, 3)
  `).bind(
    `mem_${Date.now()}`,
    agentName,
    result.substring(0, 500), // Truncate for storage
    taskId
  ).run()
}
```

### 3. Memory Cleanup (cron job)
```typescript
// Delete low-importance memories older than 7 days
await db.prepare(`
  DELETE FROM agent_memory 
  WHERE importance < 5 
  AND created_at < datetime('now', '-7 days')
`).run()
```

## Integrazione in executeTask

Modifica `apps/surfboard/src/app/api/agent-executor/route.ts`:

```typescript
async function executeTask(task: AgentTask, anthropicKey: string, db: D1Database): Promise<string> {
  const client = new Anthropic({ apiKey: anthropicKey })
  
  const agentName = getAgentForTask(task)
  const persona = AGENT_PERSONAS[agentName] || AGENT_PERSONAS['default']
  
  // NEW: Load agent context
  const context = await loadAgentContext(db, agentName)
  
  let prompt = `Task Type: ${task.type}\n`
  prompt += `Description: ${task.description}\n`
  
  // NEW: Add context if available
  if (context) {
    prompt += `\n${context}\n`
  }
  
  // ... rest of execution ...
  
  // NEW: Save memory after completion
  await saveTaskMemory(db, agentName, task.id, result)
  
  return result
}
```

## Regole per Agenti (da aggiungere ai prompt)

Aggiungi a ogni AGENT_PERSONAS:

```
## Memory Rules
- If you learn something important, note it for future reference
- Reference previous context when relevant
- Don't repeat mistakes from previous tasks
- Build on previous work when appropriate
```

## Status

- [ ] Create D1 table `agent_memory`
- [ ] Implement `loadAgentContext`
- [ ] Implement `saveTaskMemory`
- [ ] Add memory rules to agent personas
- [ ] Add cleanup cron job
- [ ] Test with real tasks

---

*Created: 2026-01-29 | Task: T658*
