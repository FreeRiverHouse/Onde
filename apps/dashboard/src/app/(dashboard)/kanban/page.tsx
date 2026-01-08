'use client';

import { useState, useEffect } from 'react';
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
  ChevronRight
} from 'lucide-react';

type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done';

interface AgentTask {
  id: string;
  agentName: string;
  agentType: 'claude' | 'grok' | 'telegram' | 'pr' | 'editor' | 'illustrator';
  task: string;
  status: TaskStatus;
  blockedReason?: string;
  startedAt?: string;
  completedAt?: string;
  priority: 'low' | 'medium' | 'high';
}

const initialTasks: AgentTask[] = [
  {
    id: '1',
    agentName: 'Claude Code',
    agentType: 'claude',
    task: 'Implementare Kanban Dashboard',
    status: 'in_progress',
    startedAt: new Date().toISOString(),
    priority: 'high',
  },
  {
    id: '2',
    agentName: 'Grok',
    agentType: 'grok',
    task: 'Generare immagini Pina Pennello',
    status: 'todo',
    priority: 'high',
  },
  {
    id: '3',
    agentName: 'Telegram Bot',
    agentType: 'telegram',
    task: 'Inviare report giornaliero',
    status: 'done',
    completedAt: new Date().toISOString(),
    priority: 'medium',
  },
  {
    id: '4',
    agentName: 'PR Agent',
    agentType: 'pr',
    task: 'Schedulare post @Onde_FRH',
    status: 'blocked',
    blockedReason: 'In attesa approvazione contenuto',
    priority: 'high',
  },
  {
    id: '5',
    agentName: 'Gianni Parola',
    agentType: 'editor',
    task: 'Revisione capitolo 3 AIKO',
    status: 'todo',
    priority: 'medium',
  },
  {
    id: '6',
    agentName: 'Pina Pennello',
    agentType: 'illustrator',
    task: 'Illustrazioni Antologia Poesia',
    status: 'blocked',
    blockedReason: 'Stile visivo non ancora definito',
    priority: 'high',
  },
];

const columns: { id: TaskStatus; title: string; icon: React.ReactNode; color: string }[] = [
  { id: 'todo', title: 'Da Fare', icon: <Clock className="h-4 w-4" />, color: 'bg-gray-100' },
  { id: 'in_progress', title: 'In Corso', icon: <Play className="h-4 w-4" />, color: 'bg-blue-100' },
  { id: 'blocked', title: 'Bloccato', icon: <AlertCircle className="h-4 w-4" />, color: 'bg-red-100' },
  { id: 'done', title: 'Completato', icon: <CheckCircle2 className="h-4 w-4" />, color: 'bg-green-100' },
];

export default function KanbanPage() {
  const [tasks, setTasks] = useState<AgentTask[]>(initialTasks);
  const [draggedTask, setDraggedTask] = useState<AgentTask | null>(null);

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

  const moveTask = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? {
              ...task,
              status: newStatus,
              blockedReason: newStatus === 'blocked' ? 'In attesa di input' : undefined,
              startedAt: newStatus === 'in_progress' ? new Date().toISOString() : task.startedAt,
              completedAt: newStatus === 'done' ? new Date().toISOString() : undefined,
            }
          : task
      )
    );
  };

  const unblockTask = (taskId: string) => {
    moveTask(taskId, 'in_progress');
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

  return (
    <>
      <Header
        title="Kanban Agenti"
        description="Controlla tutti gli agenti da un unico posto"
      />

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
