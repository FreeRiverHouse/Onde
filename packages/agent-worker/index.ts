#!/usr/bin/env npx ts-node
/**
 * Agent Worker - Processa task degli agenti Onde
 *
 * Gira localmente, fa polling dei task pending e li processa con Z.ai (gratis!).
 *
 * Uso: npx ts-node index.ts
 * Oppure: npm start
 */

import * as fs from 'fs';
import * as path from 'path';

// Z.ai API (free tier!)
const ZAI_API_URL = 'https://api.z.ai/api/paas/v4/chat/completions';
const ZAI_MODEL = 'glm-4.7-flash';

const API_BASE = 'https://onde.surf/api';
const POLL_INTERVAL = 30000; // 30 secondi
// Agent configs are at CascadeProjects root level
const AGENTS_DIR = '/Users/mattiapetrucciani/CascadeProjects/.claude/agents';

interface Task {
  id: string;
  type: string;
  description: string;
  assigned_to: string;
  status: string;
  created_at: string;
  payload?: any;
}

interface AgentConfig {
  name: string;
  systemPrompt: string;
}

// Carica il system prompt dell'agente da file .md
function loadAgentConfig(agentId: string): AgentConfig | null {
  const mdPath = path.join(AGENTS_DIR, `${agentId}.md`);

  if (!fs.existsSync(mdPath)) {
    console.log(`[WARN] No config found for agent: ${agentId}`);
    return null;
  }

  const content = fs.readFileSync(mdPath, 'utf-8');

  // Estrai il nome dal primo heading
  const nameMatch = content.match(/^#\s+(.+)$/m);
  const name = nameMatch ? nameMatch[1] : agentId;

  return {
    name,
    systemPrompt: content
  };
}

// Fetch task pending per un agente
async function fetchPendingTasks(): Promise<Task[]> {
  try {
    const res = await fetch(`${API_BASE}/agent-tasks?status=pending`);
    const data = await res.json() as { tasks?: Task[] };
    return data.tasks || [];
  } catch (err) {
    console.error('[ERROR] Failed to fetch tasks:', err);
    return [];
  }
}

// Claim un task
async function claimTask(taskId: string, agentName: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/agent-tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'claim',
        agent_name: agentName
      })
    });
    return res.ok;
  } catch (err) {
    console.error('[ERROR] Failed to claim task:', err);
    return false;
  }
}

// Start un task (claimed → in_progress)
async function startTask(taskId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/agent-tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'start' })
    });
    return res.ok;
  } catch (err) {
    console.error('[ERROR] Failed to start task:', err);
    return false;
  }
}

// Completa un task con il risultato
async function completeTask(taskId: string, result: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/agent-tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'complete',
        result
      })
    });
    return res.ok;
  } catch (err) {
    console.error('[ERROR] Failed to complete task:', err);
    return false;
  }
}

// Processa un task con Z.ai (gratis!)
async function processWithZai(
  apiKey: string,
  agentConfig: AgentConfig,
  task: Task
): Promise<string> {
  console.log(`[Z.ai] Processing task for ${agentConfig.name}...`);

  const response = await fetch(ZAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: ZAI_MODEL,
      messages: [
        { role: 'system', content: agentConfig.systemPrompt },
        { role: 'user', content: `Task: ${task.description}\n\nTask ID: ${task.id}\nType: ${task.type}\nCreated: ${task.created_at}` }
      ],
      max_tokens: 1024,
      temperature: 0.7,
      thinking: { type: 'disabled' }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Z.ai API error (${response.status}): ${error}`);
  }

  const data = await response.json() as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  return data.choices?.[0]?.message?.content || 'No response generated';
}

// Aggiorna last_seen dell'agente
async function updateAgentLastSeen(agentId: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/agents/${agentId}/heartbeat`, {
      method: 'POST'
    });
  } catch (err) {
    // Ignora errori di heartbeat
  }
}

// Main loop
async function main() {
  console.log('========================================');
  console.log('🤖 ONDE AGENT WORKER');
  console.log('   Processing tasks with Grok (XAI)');
  console.log('========================================\n');

  // Verifica API key - Z.ai (gratis!)
  const apiKey = process.env.ZAI_API_KEY;
  if (!apiKey) {
    console.error('[ERROR] ZAI_API_KEY not set!');
    console.log('Set it with: export ZAI_API_KEY=your_key');
    process.exit(1);
  }

  console.log(`[INFO] Using Z.ai (free) API with ${ZAI_MODEL}`);

  console.log(`[INFO] Polling ${API_BASE} every ${POLL_INTERVAL/1000}s`);
  console.log(`[INFO] Agents dir: ${AGENTS_DIR}\n`);

  // Poll loop
  const poll = async () => {
    const tasks = await fetchPendingTasks();

    // Filtra solo task con agente assegnato
    const assignedTasks = tasks.filter(t => t.assigned_to);

    if (assignedTasks.length > 0) {
      console.log(`[POLL] Found ${assignedTasks.length} pending tasks`);
    }

    for (const task of assignedTasks) {
      const agentConfig = loadAgentConfig(task.assigned_to);

      if (!agentConfig) {
        console.log(`[SKIP] No config for agent: ${task.assigned_to}`);
        continue;
      }

      console.log(`\n[TASK] ${task.id}`);
      console.log(`       Agent: ${task.assigned_to}`);
      console.log(`       Desc: ${task.description}`);

      // Claim the task
      const claimed = await claimTask(task.id, task.assigned_to);
      if (!claimed) {
        console.log(`[WARN] Could not claim task, skipping`);
        continue;
      }

      // Start the task
      await startTask(task.id);

      try {
        // Process with Z.ai
        const result = await processWithZai(apiKey, agentConfig, task);

        // Clean the result for JSON (remove problematic chars)
        const cleanResult = result.replace(/[\n\r]/g, ' ').replace(/"/g, '\\"');

        console.log(`[DONE] Response (${result.length} chars)`);
        console.log(`       Preview: ${result.substring(0, 100)}...`);

        // Complete the task
        await completeTask(task.id, result);

        // Update agent heartbeat
        await updateAgentLastSeen(task.assigned_to);

      } catch (err) {
        console.error(`[ERROR] Failed to process task:`, err);
        // Mark task as failed
        try {
          await fetch(`${API_BASE}/agent-tasks/${task.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'fail', error: String(err) })
          });
        } catch { /* ignore */ }
      }
    }
  };

  // Initial poll
  await poll();

  // Continue polling
  setInterval(poll, POLL_INTERVAL);

  console.log('\n[RUNNING] Press Ctrl+C to stop\n');
}

main().catch(console.error);
