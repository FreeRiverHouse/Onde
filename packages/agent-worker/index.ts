#!/usr/bin/env npx ts-node
/**
 * Agent Worker - Processa task degli agenti Onde via Claude Code
 *
 * Gira localmente, fa polling dei task pending e li processa con `claude` CLI.
 * Gli agenti hanno accesso completo a file, codice, e capacità Claude.
 *
 * Uso: npx ts-node index.ts
 * Oppure: npm start
 */

import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';

const API_BASE = 'https://onde.surf/api';
const POLL_INTERVAL = 30000; // 30 secondi
const CLAUDE_TIMEOUT = 30000; // 30s max per task (haiku is fast)
const CLAUDE_BIN = process.env.CLAUDE_BIN || '/Users/mattiapetrucciani/.local/bin/claude';

// Agent configs are in the Onde repo content/agents/ directory
const AGENTS_DIR = path.resolve(__dirname, '../../content/agents');
const PROJECT_DIR = path.resolve(__dirname, '../../');

// Map DB agent IDs to filenames when they differ
const AGENT_ID_MAP: Record<string, string> = {
  'engineering-dept': 'code-worker',
  'ceo-orchestrator': 'strategic-advisor',
  'qa-test-engineer': 'tech-support',
};

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

// Carica il system prompt dell'agente da file .md (max 3000 chars per velocità)
const MAX_PROMPT_LENGTH = 3000;

function loadAgentConfig(agentId: string): AgentConfig | null {
  const fileId = AGENT_ID_MAP[agentId] || agentId;
  const mdPath = path.join(AGENTS_DIR, `${fileId}.md`);

  if (!fs.existsSync(mdPath)) {
    console.log(`[WARN] No config found for agent: ${agentId} (looked for ${fileId}.md in ${AGENTS_DIR})`);
    return null;
  }

  let content = fs.readFileSync(mdPath, 'utf-8');
  const nameMatch = content.match(/^#\s+(.+)$/m);
  const name = nameMatch ? nameMatch[1] : agentId;

  // Truncate to keep Claude Code fast (avoid huge context)
  if (content.length > MAX_PROMPT_LENGTH) {
    content = content.substring(0, MAX_PROMPT_LENGTH) + '\n\n[... config truncated for speed]';
  }

  return { name, systemPrompt: content };
}

// Processa un task con Claude Code CLI (prompt via stdin pipe)
function processWithClaude(agentConfig: AgentConfig, task: Task): Promise<string> {
  return new Promise((resolve, reject) => {
    console.log(`[CLAUDE] Processing task for ${agentConfig.name}...`);

    const isCodeTask = ['code_review', 'code_fix', 'code_deploy', 'code_test'].includes(task.type);
    const model = isCodeTask ? 'sonnet' : 'haiku';

    // Full prompt: identity + task
    const prompt = `You are: ${agentConfig.name}\n\n${agentConfig.systemPrompt}\n\n---\nTask: ${task.description}\nType: ${task.type}\n\nRespond concisely, in character.`;

    const start = Date.now();
    let stdout = '';
    let stderr = '';

    // Spawn claude with -p flag, pipe prompt via stdin
    const child = spawn(CLAUDE_BIN, [
      '-p',
      '--model', model,
      '--no-session-persistence',
      '--dangerously-skip-permissions',
    ], {
      cwd: '/tmp',
      env: { ...process.env, CLAUDE_CODE_ENTRYPOINT: 'agent-worker' },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    child.stdout.on('data', (data: Buffer) => { stdout += data.toString(); });
    child.stderr.on('data', (data: Buffer) => { stderr += data.toString(); });

    // Write prompt to stdin and close (this is what claude reads)
    child.stdin.write(prompt);
    child.stdin.end();

    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error(`Claude Code timeout (${CLAUDE_TIMEOUT / 1000}s)`));
    }, CLAUDE_TIMEOUT);

    child.on('close', (code: number | null) => {
      clearTimeout(timer);
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      console.log(`[CLAUDE] Completed in ${elapsed}s (exit ${code})`);

      if (code !== 0) {
        reject(new Error(`Claude Code exit ${code}: ${stderr.substring(0, 200)}`));
        return;
      }

      const result = stdout.trim();
      if (!result) {
        reject(new Error('Claude Code returned empty response'));
        return;
      }

      resolve(result);
    });

    child.on('error', (err: Error) => {
      clearTimeout(timer);
      reject(new Error(`Claude Code spawn error: ${err.message}`));
    });
  });
}

// Fetch task pending
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
      body: JSON.stringify({ action: 'claim', agent_name: agentName })
    });
    return res.ok;
  } catch (err) {
    console.error('[ERROR] Failed to claim task:', err);
    return false;
  }
}

// Start un task
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

// Completa un task
async function completeTask(taskId: string, result: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/agent-tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'complete', result })
    });
    return res.ok;
  } catch (err) {
    console.error('[ERROR] Failed to complete task:', err);
    return false;
  }
}

// Aggiorna last_seen dell'agente
async function updateAgentLastSeen(agentId: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/agents/${agentId}/heartbeat`, { method: 'POST' });
  } catch { /* ignore */ }
}

// Main loop
async function main() {
  console.log('========================================');
  console.log('  ONDE AGENT WORKER');
  console.log('  Backend: Claude Code (claude CLI)');
  console.log('========================================\n');

  // Verifica claude CLI disponibile
  try {
    const { execFileSync } = require('child_process');
    const ver = execFileSync(CLAUDE_BIN, ['--version'], { timeout: 5000 }).toString().trim();
    console.log(`[INFO] Claude CLI: ${ver} (${CLAUDE_BIN})`);
  } catch {
    console.error(`[ERROR] claude CLI not found at ${CLAUDE_BIN}!`);
    console.log('Set CLAUDE_BIN env var or install: npm install -g @anthropic-ai/claude-code');
    process.exit(1);
  }

  console.log(`[INFO] Polling ${API_BASE} every ${POLL_INTERVAL / 1000}s`);
  console.log(`[INFO] Agents dir: ${AGENTS_DIR}`);
  console.log(`[INFO] Project dir: ${PROJECT_DIR}\n`);

  let processing = false;

  const poll = async () => {
    if (processing) return; // Skip if still processing previous batch
    processing = true;

    try {
      const tasks = await fetchPendingTasks();
      const assignedTasks = tasks.filter(t => t.assigned_to);

      if (assignedTasks.length > 0) {
        console.log(`[POLL] Found ${assignedTasks.length} pending tasks`);
      }

      // Process one task at a time (Claude Code is heavy)
      for (const task of assignedTasks) {
        const agentConfig = loadAgentConfig(task.assigned_to);

        if (!agentConfig) {
          console.log(`[SKIP] No config for agent: ${task.assigned_to}`);
          continue;
        }

        console.log(`\n[TASK] ${task.id}`);
        console.log(`       Agent: ${task.assigned_to} (${agentConfig.name})`);
        console.log(`       Desc: ${task.description}`);

        const claimed = await claimTask(task.id, task.assigned_to);
        if (!claimed) {
          console.log(`[WARN] Could not claim task, skipping`);
          continue;
        }

        await startTask(task.id);

        try {
          const result = await processWithClaude(agentConfig, task);

          console.log(`[DONE] Response (${result.length} chars)`);
          console.log(`       Preview: ${result.substring(0, 120)}...`);

          await completeTask(task.id, result);
          await updateAgentLastSeen(task.assigned_to);

        } catch (err) {
          console.error(`[ERROR] Failed to process task:`, err);
          try {
            await fetch(`${API_BASE}/agent-tasks/${task.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'fail', error: String(err) })
            });
          } catch { /* ignore */ }
        }
      }
    } finally {
      processing = false;
    }
  };

  await poll();
  setInterval(poll, POLL_INTERVAL);
  console.log('\n[RUNNING] Press Ctrl+C to stop\n');
}

main().catch(console.error);
