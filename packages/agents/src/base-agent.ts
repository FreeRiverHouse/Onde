import * as fs from 'fs';
import * as path from 'path';

export interface AgentMemory {
  name: string;
  personality: string;
  created: string;
  lastActive: string;
  conversations: ConversationEntry[];
  learnings: string[];
  preferences: Record<string, string>;
  workLog: WorkLogEntry[];
}

export interface ConversationEntry {
  date: string;
  topic: string;
  summary: string;
  feedback?: string;
}

export interface WorkLogEntry {
  date: string;
  project: string;
  task: string;
  status: 'pending' | 'in_progress' | 'done';
  output?: string;
}

export abstract class BaseAgent {
  protected name: string;
  protected memoryPath: string;
  protected memory: AgentMemory;

  constructor(name: string, memoryDir: string) {
    this.name = name;
    this.memoryPath = path.join(memoryDir, `${name.toLowerCase().replace(' ', '-')}.memory.json`);
    this.memory = this.loadMemory();
  }

  protected loadMemory(): AgentMemory {
    if (fs.existsSync(this.memoryPath)) {
      const data = fs.readFileSync(this.memoryPath, 'utf-8');
      return JSON.parse(data);
    }
    return this.createInitialMemory();
  }

  protected abstract createInitialMemory(): AgentMemory;

  protected saveMemory(): void {
    this.memory.lastActive = new Date().toISOString();
    fs.writeFileSync(this.memoryPath, JSON.stringify(this.memory, null, 2));
  }

  public addLearning(learning: string): void {
    this.memory.learnings.push(learning);
    this.saveMemory();
  }

  public logWork(project: string, task: string, status: WorkLogEntry['status'], output?: string): void {
    this.memory.workLog.push({
      date: new Date().toISOString(),
      project,
      task,
      status,
      output
    });
    this.saveMemory();
  }

  public getRecentWork(limit: number = 10): WorkLogEntry[] {
    return this.memory.workLog.slice(-limit);
  }

  public abstract getSystemPrompt(): string;

  public abstract processRequest(request: string): Promise<string>;

  public introduce(): string {
    return `Ciao! Sono ${this.name}. ${this.memory.personality}`;
  }

  public getStatus(): string {
    const recentWork = this.getRecentWork(3);
    const pending = recentWork.filter(w => w.status === 'pending').length;
    const inProgress = recentWork.filter(w => w.status === 'in_progress').length;

    return `${this.name} - Ultimo attivo: ${this.memory.lastActive}
Lavori recenti: ${recentWork.length} (${pending} pending, ${inProgress} in corso)
Learnings: ${this.memory.learnings.length}`;
  }
}
