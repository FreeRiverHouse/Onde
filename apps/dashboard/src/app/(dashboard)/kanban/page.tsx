'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Bot,
  AlertCircle,
  CheckCircle2,
  Clock,
  Play,
  Pause,
  RotateCcw,
  MessageSquare,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_AGENT_API_URL || 'http://localhost:3002';

type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done';

interface AgentTask {
  id: string;
  agentName: string;
  agentType: 'claude' | 'grok' | 'telegram' | 'pr' | 'gianni' | 'pina';
  task: string;
  status: TaskStatus;
  blockedReason?: string;
  startedAt?: string;
  completedAt?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt?: string;
  updatedAt?: string;
}

const columns: { id: TaskStatus; title: string; icon: React.ReactNode; color: string }[] = [
  { id: 'todo', title: 'Da Fare', icon: <Clock className="h-4 w-4" />, color: 'bg-gray-100' },
  { id: 'in_progress', title: 'In Corso', icon: <Play className="h-4 w-4" />, color: 'bg-blue-100' },
  { id: 'blocked', title: 'Bloccato', icon: <AlertCircle className="h-4 w-4" />, color: 'bg-red-100' },
  { id: 'done', title: 'Completato', icon: <CheckCircle2 className="h-4 w-4" />, color: 'bg-green-100' },
];

export default function KanbanPage() {
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [draggedTask, setDraggedTask] = useState<AgentTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tasks from API
  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/tasks`);
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data = await res.json();
      setTasks(data.tasks || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + polling every 5 seconds
  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 5000);
    return () => clearInterval(interval);
  }, [fetchTasks]);

  const getTasksByStatus = (status: TaskStatus) =>
    tasks.filter(task => task.status === status);

  const handleDragStart = (task: AgentTask) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (status: TaskStatus) => {
    if (draggedTask) {
      setTasks(prev =>
        prev.map(task =>
          task.id === draggedTask.id
            ? {
                ...task,
                status,
                blockedReason: status === 'blocked' ? 'In attesa di input' : undefined,
                startedAt: status === 'in_progress' ? new Date().toISOString() : task.startedAt,
                completedAt: status === 'done' ? new Date().toISOString() : undefined,
              }
            : task
        )
      );
      setDraggedTask(null);
    }
  };

  const moveTask = async (taskId: string, newStatus: TaskStatus) => {
    try {
      let endpoint = '';
      if (newStatus === 'in_progress' || newStatus === 'todo') {
        endpoint = `${API_URL}/tasks/${taskId}/approve`;
      } else if (newStatus === 'blocked') {
        endpoint = `${API_URL}/tasks/${taskId}/block`;
      } else if (newStatus === 'done') {
        endpoint = `${API_URL}/tasks/${taskId}/complete`;
      }

      if (endpoint) {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: newStatus === 'blocked' ? JSON.stringify({ reason: 'In attesa di input' }) : undefined,
        });
        if (res.ok) {
          await fetchTasks();
        }
      }
    } catch (err) {
      console.error('Error moving task:', err);
    }
  };

  const unblockTask = async (taskId: string) => {
    try {
      const res = await fetch(`${API_URL}/tasks/${taskId}/approve`, { method: 'POST' });
      if (res.ok) {
        await fetchTasks();
      }
    } catch (err) {
      console.error('Error unblocking task:', err);
    }
  };

  const getAgentIcon = (type: AgentTask['agentType']) => {
    return <Bot className="h-4 w-4" />;
  };

  const getPriorityColor = (priority: AgentTask['priority']) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-gray-300';
    }
  };

  const blockedCount = tasks.filter(t => t.status === 'blocked').length;

  if (loading) {
    return (
      <>
        <Header title="Kanban Agenti" description="Controlla tutti gli agenti da un unico posto" />
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="Kanban Agenti"
        description="Controlla tutti gli agenti da un unico posto"
      />
      <div className="px-6 pt-2">
        <Button variant="outline" size="sm" onClick={fetchTasks}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Aggiorna
        </Button>
      </div>

      {/* Alert for blocked tasks */}
      {blockedCount > 0 && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <span className="text-red-800 font-medium">
            {blockedCount} {blockedCount === 1 ? 'agente bloccato' : 'agenti bloccati'} - richiede la tua attenzione
          </span>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto border-red-300 text-red-700 hover:bg-red-100"
            onClick={() => {
              const blockedTask = tasks.find(t => t.status === 'blocked');
              if (blockedTask) {
                document.getElementById(`task-${blockedTask.id}`)?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            Vai ai bloccati
          </Button>
        </div>
      )}

      <div className="p-6">
        <div className="grid grid-cols-4 gap-4">
          {columns.map((column) => (
            <div
              key={column.id}
              className={`rounded-lg p-4 min-h-[500px] ${column.color}`}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.id)}
            >
              {/* Column Header */}
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
                {column.icon}
                <h3 className="font-semibold text-gray-900">{column.title}</h3>
                <span className="ml-auto bg-white px-2 py-0.5 rounded-full text-sm text-gray-600">
                  {getTasksByStatus(column.id).length}
                </span>
              </div>

              {/* Tasks */}
              <div className="space-y-3">
                {getTasksByStatus(column.id).map((task) => (
                  <div
                    key={task.id}
                    id={`task-${task.id}`}
                    draggable
                    onDragStart={() => handleDragStart(task)}
                    className={`
                      bg-white rounded-lg shadow-sm border-l-4 cursor-move
                      transition-all hover:shadow-md
                      ${getPriorityColor(task.priority)}
                      ${task.status === 'blocked' ? 'ring-2 ring-red-500 animate-pulse' : ''}
                    `}
                  >
                    <div className="p-3">
                      {/* Agent Info */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`
                          h-6 w-6 rounded-full flex items-center justify-center
                          ${task.status === 'blocked' ? 'bg-red-100' : 'bg-gray-100'}
                        `}>
                          {getAgentIcon(task.agentType)}
                        </div>
                        <span className="text-xs font-medium text-gray-500">
                          {task.agentName}
                        </span>
                      </div>

                      {/* Task Description */}
                      <p className="text-sm font-medium text-gray-900 mb-2">
                        {task.task}
                      </p>

                      {/* Blocked Reason */}
                      {task.status === 'blocked' && task.blockedReason && (
                        <div className="bg-red-50 text-red-700 text-xs p-2 rounded mb-2">
                          <strong>Bloccato:</strong> {task.blockedReason}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-1 mt-2">
                        {task.status === 'blocked' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
                            onClick={() => unblockTask(task.id)}
                          >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Sblocca
                          </Button>
                        )}
                        {task.status === 'todo' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7"
                            onClick={() => moveTask(task.id, 'in_progress')}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Avvia
                          </Button>
                        )}
                        {task.status === 'in_progress' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-7"
                              onClick={() => moveTask(task.id, 'done')}
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Fatto
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-7 border-red-300 text-red-700"
                              onClick={() => moveTask(task.id, 'blocked')}
                            >
                              <Pause className="h-3 w-3 mr-1" />
                              Blocca
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
