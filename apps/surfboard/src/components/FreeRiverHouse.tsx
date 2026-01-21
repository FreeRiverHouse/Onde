'use client';

import { useEffect, useState, useRef } from 'react';
import { useToast } from './Toast';

// Agent configuration
interface AgentConfig {
  id: string;
  name: string;
  emoji: string;
  role: string;
  room: 'office' | 'studio' | 'lab' | 'library' | 'lounge' | 'garden';
  color: string;
  skills: string[];
}

interface AgentState extends AgentConfig {
  position: { x: number; y: number };
  targetPosition: { x: number; y: number };
  status: 'working' | 'idle' | 'sleeping';
  currentTask?: string;
  taskCount: number;
}

interface AgentTask {
  id: string;
  type: string;
  description: string;
  status: string;
  assigned_to?: string;
  priority: string;
  created_at: string;
}

const AGENTS_CONFIG: AgentConfig[] = [
  { id: 'editore-capo', name: 'Editore Capo', emoji: '📰', role: 'Content Director', room: 'office', color: '#ef4444', skills: ['content_create', 'book_edit'] },
  { id: 'video-factory', name: 'Video Factory', emoji: '🎬', role: 'Video Production', room: 'studio', color: '#8b5cf6', skills: ['video_generate', 'image_generate'] },
  { id: 'tech-support', name: 'Tech Support', emoji: '🔧', role: 'Technical Ops', room: 'lab', color: '#3b82f6', skills: ['content_create', 'post_edit'] },
  { id: 'onde-pr', name: 'Onde PR', emoji: '📢', role: 'Public Relations', room: 'lounge', color: '#f59e0b', skills: ['post_feedback', 'post_edit'] },
  { id: 'pina-pennello', name: 'Pina Pennello', emoji: '🎨', role: 'Visual Artist', room: 'studio', color: '#ec4899', skills: ['image_generate'] },
  { id: 'gianni-parola', name: 'Gianni Parola', emoji: '✍️', role: 'Copywriter', room: 'library', color: '#10b981', skills: ['content_create', 'book_edit'] },
  { id: 'sally', name: 'Sally', emoji: '🤖', role: 'AI Assistant', room: 'office', color: '#6366f1', skills: ['content_create', 'post_feedback'] },
  { id: 'automation', name: 'Automation', emoji: '⚙️', role: 'Workflow Design', room: 'lab', color: '#64748b', skills: ['content_create'] },
];

const ROOMS: Record<string, { x: number; y: number; width: number; height: number; label: string; emoji: string }> = {
  office: { x: 40, y: 60, width: 180, height: 130, label: 'Ufficio', emoji: '🏢' },
  studio: { x: 250, y: 60, width: 180, height: 130, label: 'Studio', emoji: '🎥' },
  lab: { x: 460, y: 60, width: 180, height: 130, label: 'Lab', emoji: '🔬' },
  library: { x: 40, y: 220, width: 180, height: 130, label: 'Biblioteca', emoji: '📚' },
  lounge: { x: 250, y: 220, width: 180, height: 130, label: 'Salotto', emoji: '☕' },
  garden: { x: 460, y: 220, width: 180, height: 130, label: 'Giardino', emoji: '🌳' },
};

export function FreeRiverHouse() {
  const [agents, setAgents] = useState<AgentState[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentState | null>(null);
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [message, setMessage] = useState('');
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const animationRef = useRef<number>();
  const { showToast } = useToast();

  // Initialize agents
  useEffect(() => {
    const initialized = AGENTS_CONFIG.map(config => {
      const room = ROOMS[config.room];
      const x = room.x + 30 + Math.random() * (room.width - 60);
      const y = room.y + 35 + Math.random() * (room.height - 70);
      return {
        ...config,
        position: { x, y },
        targetPosition: { x, y },
        status: 'idle' as const,
        taskCount: 0,
      };
    });
    setAgents(initialized);
  }, []);

  // Fetch tasks and update agent status
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch('/api/agent-tasks?status=pending,claimed,in_progress&limit=50');
        if (res.ok) {
          const data = await res.json();
          const taskList = data.tasks || [];
          setTasks(taskList);

          // Update agents based on tasks
          setAgents(prev => prev.map(agent => {
            const agentTasks = taskList.filter((t: AgentTask) =>
              t.assigned_to === agent.id ||
              t.description?.toLowerCase().includes(agent.name.toLowerCase())
            );
            const activeTasks = agentTasks.filter((t: AgentTask) =>
              t.status === 'in_progress' || t.status === 'claimed'
            );

            return {
              ...agent,
              status: activeTasks.length > 0 ? 'working' : 'idle',
              currentTask: activeTasks[0]?.description,
              taskCount: agentTasks.length,
            };
          }));
        }
      } catch (e) {
        console.error('Failed to fetch tasks:', e);
      }
    };

    fetchTasks();
    const interval = setInterval(fetchTasks, 20000);
    return () => clearInterval(interval);
  }, []);

  // Animate agents
  useEffect(() => {
    const animate = () => {
      setAgents(prev => prev.map(agent => {
        // Random movement
        if (Math.random() < 0.015) {
          const room = ROOMS[agent.room];
          return {
            ...agent,
            targetPosition: {
              x: room.x + 30 + Math.random() * (room.width - 60),
              y: room.y + 35 + Math.random() * (room.height - 70),
            }
          };
        }

        const dx = agent.targetPosition.x - agent.position.x;
        const dy = agent.targetPosition.y - agent.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 1) {
          const speed = agent.status === 'working' ? 1.2 : 0.4;
          return {
            ...agent,
            position: {
              x: agent.position.x + (dx / dist) * speed,
              y: agent.position.y + (dy / dist) * speed,
            }
          };
        }
        return agent;
      }));
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const handleCreateTask = async () => {
    if (!selectedAgent || !message.trim()) return;

    setIsCreatingTask(true);
    try {
      const res = await fetch('/api/agent-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedAgent.skills[0] || 'content_create',
          description: message,
          priority: 'normal',
          assigned_to: selectedAgent.id,
          created_by: 'free-river-house'
        })
      });

      if (res.ok) {
        showToast(`Task assegnato a ${selectedAgent.name}`, 'success');
        setMessage('');
        // Refresh tasks
        const tasksRes = await fetch('/api/agent-tasks?status=pending,claimed,in_progress&limit=50');
        if (tasksRes.ok) {
          const data = await tasksRes.json();
          setTasks(data.tasks || []);
        }
      } else {
        showToast('Errore nella creazione del task', 'error');
      }
    } catch {
      showToast('Errore di connessione', 'error');
    } finally {
      setIsCreatingTask(false);
    }
  };

  const workingCount = agents.filter(a => a.status === 'working').length;
  const selectedAgentTasks = tasks.filter(t =>
    t.assigned_to === selectedAgent?.id ||
    t.description?.toLowerCase().includes(selectedAgent?.name.toLowerCase() || '')
  );

  return (
    <section
      aria-label="Free River House"
      className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 border-b border-white/10 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏠</span>
          <h2 className="text-sm font-medium text-white">Free River House</h2>
          {workingCount > 0 && (
            <span className="px-2 py-0.5 text-xs bg-emerald-400/20 text-emerald-400 rounded-full animate-pulse">
              {workingCount} al lavoro
            </span>
          )}
        </div>
        <span className="text-white/40 text-xs">{expanded ? '▼' : '▶'}</span>
      </button>

      {expanded && (
        <div className="flex flex-col lg:flex-row">
          {/* Map */}
          <div className="flex-1 p-4">
            <svg viewBox="0 0 680 390" className="w-full h-auto">
              {/* Background */}
              <defs>
                <linearGradient id="houseBg" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0f172a" />
                  <stop offset="100%" stopColor="#1e293b" />
                </linearGradient>
              </defs>
              <rect x="0" y="0" width="680" height="390" fill="url(#houseBg)" rx="12" />

              {/* Rooms */}
              {Object.entries(ROOMS).map(([id, room]) => (
                <g key={id}>
                  <rect
                    x={room.x}
                    y={room.y}
                    width={room.width}
                    height={room.height}
                    fill="rgba(255,255,255,0.03)"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="1"
                    rx="8"
                  />
                  <text
                    x={room.x + room.width / 2}
                    y={room.y + 20}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.3)"
                    fontSize="11"
                    fontWeight="500"
                  >
                    {room.emoji} {room.label}
                  </text>
                </g>
              ))}

              {/* Corridors */}
              <path
                d="M 220 125 H 250 M 430 125 H 460 M 130 190 V 220 M 340 190 V 220 M 550 190 V 220"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="16"
                strokeLinecap="round"
              />

              {/* Agents */}
              {agents.map((agent) => (
                <g
                  key={agent.id}
                  transform={`translate(${agent.position.x}, ${agent.position.y})`}
                  onClick={() => setSelectedAgent(agent)}
                  className="cursor-pointer"
                  style={{ transition: 'transform 0.05s linear' }}
                >
                  {/* Working glow */}
                  {agent.status === 'working' && (
                    <circle
                      r="20"
                      fill={agent.color}
                      opacity="0.2"
                      className="animate-pulse"
                    />
                  )}

                  {/* Agent body */}
                  <circle
                    r="14"
                    fill={agent.color}
                    stroke={selectedAgent?.id === agent.id ? '#fff' : 'rgba(0,0,0,0.3)'}
                    strokeWidth={selectedAgent?.id === agent.id ? 2 : 1}
                  />

                  {/* Emoji */}
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="12"
                  >
                    {agent.emoji}
                  </text>

                  {/* Status dot */}
                  <circle
                    cx="10"
                    cy="-10"
                    r="4"
                    fill={agent.status === 'working' ? '#22c55e' : '#eab308'}
                    stroke="rgba(0,0,0,0.5)"
                    strokeWidth="1"
                    className={agent.status === 'working' ? 'animate-pulse' : ''}
                  />

                  {/* Task count badge */}
                  {agent.taskCount > 0 && (
                    <>
                      <circle cx="-10" cy="-10" r="7" fill="#3b82f6" />
                      <text
                        x="-10"
                        y="-10"
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="#fff"
                        fontSize="8"
                        fontWeight="bold"
                      >
                        {agent.taskCount}
                      </text>
                    </>
                  )}

                  {/* Name */}
                  <text
                    y="26"
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.7)"
                    fontSize="9"
                    fontWeight="500"
                  >
                    {agent.name.split(' ')[0]}
                  </text>
                </g>
              ))}

              {/* Legend */}
              <g transform="translate(20, 370)">
                <circle cx="0" cy="0" r="4" fill="#22c55e" />
                <text x="8" y="3" fill="rgba(255,255,255,0.4)" fontSize="9">Working</text>
                <circle cx="70" cy="0" r="4" fill="#eab308" />
                <text x="78" y="3" fill="rgba(255,255,255,0.4)" fontSize="9">Idle</text>
                <text x="550" y="3" fill="rgba(255,255,255,0.2)" fontSize="9">Click agent to assign task</text>
              </g>
            </svg>
          </div>

          {/* Agent Panel */}
          <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col bg-white/[0.02]">
            {selectedAgent ? (
              <>
                {/* Agent info */}
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                      style={{ backgroundColor: `${selectedAgent.color}20` }}
                    >
                      {selectedAgent.emoji}
                    </div>
                    <div>
                      <h3 className="text-white font-medium text-sm">{selectedAgent.name}</h3>
                      <p className="text-white/40 text-xs">{selectedAgent.role}</p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs ${
                    selectedAgent.status === 'working'
                      ? 'bg-emerald-400/10 text-emerald-400'
                      : 'bg-amber-400/10 text-amber-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      selectedAgent.status === 'working' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                    }`} />
                    {selectedAgent.status === 'working' ? 'Al lavoro' : 'Disponibile'}
                  </div>

                  {selectedAgent.currentTask && (
                    <p className="mt-2 text-xs text-white/50 truncate">
                      Task: {selectedAgent.currentTask.slice(0, 40)}...
                    </p>
                  )}
                </div>

                {/* Agent tasks */}
                <div className="flex-1 overflow-y-auto max-h-40 p-2">
                  {selectedAgentTasks.length > 0 ? (
                    <div className="space-y-1">
                      {selectedAgentTasks.slice(0, 5).map(task => (
                        <div key={task.id} className="p-2 rounded-lg bg-white/5 text-xs">
                          <div className="text-white/70 truncate">{task.description}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-1.5 py-0.5 rounded ${
                              task.status === 'in_progress' ? 'bg-blue-400/20 text-blue-400' :
                              task.status === 'pending' ? 'bg-amber-400/20 text-amber-400' :
                              'bg-white/10 text-white/50'
                            }`}>
                              {task.status}
                            </span>
                            <span className="text-white/30">{task.priority}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/30 text-xs text-center py-4">
                      Nessun task assegnato
                    </p>
                  )}
                </div>

                {/* New task form */}
                <div className="p-3 border-t border-white/10">
                  <label className="block text-xs text-white/40 mb-1">
                    Nuovo task per {selectedAgent.name.split(' ')[0]}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateTask()}
                      placeholder="Descrivi il task..."
                      className="flex-1 bg-white/5 border border-white/10 text-white px-3 py-2 rounded-lg text-xs placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
                    />
                    <button
                      onClick={handleCreateTask}
                      disabled={!message.trim() || isCreatingTask}
                      className="px-3 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isCreatingTask ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-6 text-white/30 text-center text-sm">
                <div>
                  <span className="text-3xl mb-3 block">👆</span>
                  <p>Clicca un agente<br />per assegnare task</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Agent quick buttons */}
      {expanded && (
        <div className="px-4 py-3 border-t border-white/10 bg-white/[0.01]">
          <div className="flex flex-wrap gap-2">
            {agents.map(agent => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 transition-all border ${
                  selectedAgent?.id === agent.id
                    ? 'bg-white/10 text-white border-white/20'
                    : 'bg-white/5 text-white/50 border-transparent hover:bg-white/10 hover:text-white/70'
                }`}
              >
                <span>{agent.emoji}</span>
                <span>{agent.name.split(' ')[0]}</span>
                {agent.status === 'working' && (
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
