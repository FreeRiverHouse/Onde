/**
 * Agent Queue - Sistema centrale per gestire lo stato degli agenti
 * Usato da: Dashboard Kanban + Telegram Bot
 */
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
type BlockedCallback = (task: AgentTask) => void;
export declare function onTaskBlocked(callback: BlockedCallback): void;
export declare function getAllTasks(): AgentTask[];
export declare function getTasksByStatus(status: TaskStatus): AgentTask[];
export declare function getBlockedTasks(): AgentTask[];
export declare function getTask(id: string): AgentTask | undefined;
export declare function addTask(task: Omit<AgentTask, 'id' | 'createdAt' | 'updatedAt'>): AgentTask;
export declare function updateTask(id: string, updates: Partial<AgentTask>): AgentTask | null;
export declare function approveTask(id: string): AgentTask | null;
export declare function blockTask(id: string, reason: string): AgentTask | null;
export declare function completeTask(id: string): AgentTask | null;
export declare function deleteTask(id: string): boolean;
export declare function resetTasks(): void;
export {};
