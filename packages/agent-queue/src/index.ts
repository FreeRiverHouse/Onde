/**
 * Agent Queue - Sistema centrale per gestire lo stato degli agenti
 * Usato da: Dashboard Kanban + Telegram Bot
 */

import * as fs from 'fs';
import * as path from 'path';

export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done';
export type AgentType = 'claude' | 'grok' | 'telegram' | 'pr' | 'gianni' | 'pina';

export interface AgentTask {
  id: string;
  agentName: string;
  agentType: AgentType;
  task: string;
  status: TaskStatus;
  blockedReason?: string;
  startedAt?: string;
  completedAt?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

// Path per persistenza
const DATA_FILE = path.join(__dirname, '../data/tasks.json');

// Ensure data directory exists
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Load tasks from file
function loadTasks(): AgentTask[] {
  if (fs.existsSync(DATA_FILE)) {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  }
  return getDefaultTasks();
}

// Save tasks to file
function saveTasks(tasks: AgentTask[]): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
}

// Default tasks
function getDefaultTasks(): AgentTask[] {
  const now = new Date().toISOString();
  return [
    {
      id: '1',
      agentName: 'Claude Code',
      agentType: 'claude',
      task: 'Implementare sistema approvazione',
      status: 'in_progress',
      startedAt: now,
      priority: 'high',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: '2',
      agentName: 'Grok',
      agentType: 'grok',
      task: 'Generare immagini Pina Pennello',
      status: 'todo',
      priority: 'high',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: '3',
      agentName: 'PR Agent',
      agentType: 'pr',
      task: 'Schedulare post @Onde_FRH',
      status: 'blocked',
      blockedReason: 'In attesa approvazione contenuto',
      priority: 'high',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: '4',
      agentName: 'Gianni Parola',
      agentType: 'gianni',
      task: 'Revisione capitolo 3 AIKO',
      status: 'todo',
      priority: 'medium',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: '5',
      agentName: 'Pina Pennello',
      agentType: 'pina',
      task: 'Illustrazioni Antologia Poesia',
      status: 'blocked',
      blockedReason: 'Stile visivo non ancora definito',
      priority: 'high',
      createdAt: now,
      updatedAt: now,
    },
  ];
}

// In-memory cache
let tasks: AgentTask[] = loadTasks();

// Callbacks per notifiche
type BlockedCallback = (task: AgentTask) => void;
const blockedCallbacks: BlockedCallback[] = [];

export function onTaskBlocked(callback: BlockedCallback): void {
  blockedCallbacks.push(callback);
}

function notifyBlocked(task: AgentTask): void {
  blockedCallbacks.forEach(cb => cb(task));
}

// API
export function getAllTasks(): AgentTask[] {
  return tasks;
}

export function getTasksByStatus(status: TaskStatus): AgentTask[] {
  return tasks.filter(t => t.status === status);
}

export function getBlockedTasks(): AgentTask[] {
  return tasks.filter(t => t.status === 'blocked');
}

export function getTask(id: string): AgentTask | undefined {
  return tasks.find(t => t.id === id);
}

export function addTask(task: Omit<AgentTask, 'id' | 'createdAt' | 'updatedAt'>): AgentTask {
  const now = new Date().toISOString();
  const newTask: AgentTask = {
    ...task,
    id: Date.now().toString(),
    createdAt: now,
    updatedAt: now,
  };
  tasks.push(newTask);
  saveTasks(tasks);

  if (newTask.status === 'blocked') {
    notifyBlocked(newTask);
  }

  return newTask;
}

export function updateTask(id: string, updates: Partial<AgentTask>): AgentTask | null {
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return null;

  const wasBlocked = tasks[index].status === 'blocked';

  tasks[index] = {
    ...tasks[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  saveTasks(tasks);

  // Notify if newly blocked
  if (!wasBlocked && tasks[index].status === 'blocked') {
    notifyBlocked(tasks[index]);
  }

  return tasks[index];
}

export function approveTask(id: string): AgentTask | null {
  return updateTask(id, {
    status: 'in_progress',
    blockedReason: undefined,
    startedAt: new Date().toISOString(),
  });
}

export function blockTask(id: string, reason: string): AgentTask | null {
  return updateTask(id, {
    status: 'blocked',
    blockedReason: reason,
  });
}

export function completeTask(id: string): AgentTask | null {
  return updateTask(id, {
    status: 'done',
    blockedReason: undefined,
    completedAt: new Date().toISOString(),
  });
}

export function deleteTask(id: string): boolean {
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return false;

  tasks.splice(index, 1);
  saveTasks(tasks);
  return true;
}

// Reset to defaults (useful for testing)
export function resetTasks(): void {
  tasks = getDefaultTasks();
  saveTasks(tasks);
}
