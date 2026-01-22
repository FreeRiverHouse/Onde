'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useToast } from './Toast';

// Monument Valley color palette
const MV_COLORS = {
  cream: '#F5E6D3',
  terracotta: '#D4A574',
  sage: '#8B9A7B',
  sky: '#87CEEB',
  coral: '#E07A5F',
  stone: '#6B5B4F',
  shadow: 'rgba(0,0,0,0.1)',
};

// Agent configuration
interface AgentConfig {
  id: string;
  name: string;
  role: string;
  room: 'office' | 'studio' | 'lab' | 'library' | 'lounge' | 'garden';
  color: string;
  skills: string[];
  image: string;
}

interface AgentState extends AgentConfig {
  position: { x: number; y: number };
  targetPosition: { x: number; y: number };
  status: 'working' | 'idle' | 'sleeping';
  currentTask?: string;
  taskCount: number;
  lastSeen?: string | null;
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

interface DBAgent {
  id: string;
  name: string;
  type: string;
  description: string;
  capabilities: string;
  status: string;
  last_seen: string | null;
}

// Visual config for agents (room assignments, images, colors)
const AGENT_VISUALS: Record<string, { room: AgentConfig['room']; color: string; image: string }> = {
  'editore-capo': { room: 'office', color: MV_COLORS.coral, image: '/house/agents/editore-capo.png' },
  'video-factory': { room: 'studio', color: MV_COLORS.terracotta, image: '/house/agents/video-factory.png' },
  'engineering-dept': { room: 'lab', color: MV_COLORS.sky, image: '/house/agents/automation.png' },
  'onde-pr': { room: 'lounge', color: MV_COLORS.terracotta, image: '/house/agents/ondepr.png' },
  'pina-pennello': { room: 'studio', color: MV_COLORS.coral, image: '/house/agents/pina-pennello.png' },
  'gianni-parola': { room: 'library', color: MV_COLORS.sage, image: '/house/agents/gianni-parola.png' },
  'sally': { room: 'office', color: MV_COLORS.sage, image: '/house/agents/sally.png' },
  'automation-architect': { room: 'lab', color: MV_COLORS.stone, image: '/house/agents/automation.png' },
  'ceo-orchestrator': { room: 'office', color: MV_COLORS.coral, image: '/house/agents/editore-capo.png' },
  'qa-test-engineer': { room: 'lab', color: MV_COLORS.sky, image: '/house/agents/automation.png' },
};

// Default visual for unknown agents
const DEFAULT_VISUAL = { room: 'garden' as const, color: MV_COLORS.stone, image: '/house/agents/automation.png' };

// Check if agent was seen in last N minutes
function isAgentActive(lastSeen: string | null, minutesThreshold: number = 5): boolean {
  if (!lastSeen) return false;
  const lastSeenDate = new Date(lastSeen);
  const now = new Date();
  const diffMs = now.getTime() - lastSeenDate.getTime();
  const diffMinutes = diffMs / (1000 * 60);
  return diffMinutes <= minutesThreshold;
}

const ROOMS: Record<string, { x: number; y: number; width: number; height: number; label: string; image: string }> = {
  office: { x: 40, y: 60, width: 180, height: 130, label: 'Ufficio', image: '/house/rooms/office.png' },
  studio: { x: 250, y: 60, width: 180, height: 130, label: 'Studio', image: '/house/rooms/studio.png' },
  lab: { x: 460, y: 60, width: 180, height: 130, label: 'Lab', image: '/house/rooms/lab.png' },
  library: { x: 40, y: 220, width: 180, height: 130, label: 'Biblioteca', image: '/house/rooms/library.png' },
  lounge: { x: 250, y: 220, width: 180, height: 130, label: 'Salotto', image: '/house/rooms/lounge.png' },
  garden: { x: 460, y: 220, width: 180, height: 130, label: 'Giardino', image: '/house/rooms/garden.png' },
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

  // Fetch agents and tasks from API - REAL DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch from /api/house which has agents, tasks, and stats
        const res = await fetch('/api/house');
        if (res.ok) {
          const data = await res.json();
          const dbAgents: DBAgent[] = data.agents || [];
          const taskList: AgentTask[] = data.tasks || [];
          setTasks(taskList);

          // Convert DB agents to visual agents with REAL status
          const visualAgents: AgentState[] = dbAgents.map(dbAgent => {
            const visual = AGENT_VISUALS[dbAgent.id] || DEFAULT_VISUAL;
            const room = ROOMS[visual.room];

            // Parse capabilities
            let skills: string[] = [];
            try {
              skills = JSON.parse(dbAgent.capabilities || '[]');
            } catch { skills = []; }

            // Count tasks for this agent
            const agentTasks = taskList.filter(t => t.assigned_to === dbAgent.id);
            const activeTasks = agentTasks.filter(t =>
              t.status === 'in_progress' || t.status === 'claimed'
            );

            // REAL STATUS: based on last_seen (active in last 5 min) OR has active tasks
            const isActive = isAgentActive(dbAgent.last_seen, 5);
            const hasActiveTasks = activeTasks.length > 0;
            const realStatus = (isActive || hasActiveTasks) ? 'working' : 'idle';

            return {
              id: dbAgent.id,
              name: dbAgent.name,
              role: dbAgent.description || dbAgent.type,
              room: visual.room,
              color: visual.color,
              skills,
              image: visual.image,
              position: {
                x: room.x + 30 + Math.random() * (room.width - 60),
                y: room.y + 35 + Math.random() * (room.height - 70)
              },
              targetPosition: {
                x: room.x + 30 + Math.random() * (room.width - 60),
                y: room.y + 35 + Math.random() * (room.height - 70)
              },
              status: realStatus,
              currentTask: activeTasks[0]?.description,
              taskCount: agentTasks.length,
              lastSeen: dbAgent.last_seen,
            };
          });

          setAgents(visualAgents);
        }
      } catch (e) {
        console.error('Failed to fetch house data:', e);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 15000); // Refresh every 15 sec
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
          {/* Map - Monument Valley Style */}
          <div className="flex-1 p-4">
            <div className="relative w-full" style={{ aspectRatio: '680/390' }}>
              {/* Background */}
              <div
                className="absolute inset-0 rounded-xl overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${MV_COLORS.cream} 0%, ${MV_COLORS.sky}40 100%)` }}
              >
                {/* Rooms Grid */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-2 p-3">
                  {Object.entries(ROOMS).map(([id, room]) => (
                    <div
                      key={id}
                      className="relative rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-[1.02]"
                      style={{
                        boxShadow: `0 4px 12px ${MV_COLORS.shadow}`,
                      }}
                    >
                      {/* Room Background Image */}
                      <Image
                        src={room.image}
                        alt={room.label}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 33vw, 200px"
                      />
                      {/* Room Label Overlay */}
                      <div
                        className="absolute bottom-0 left-0 right-0 py-1.5 px-2 text-center"
                        style={{
                          background: 'linear-gradient(transparent, rgba(0,0,0,0.5))',
                        }}
                      >
                        <span className="text-white text-xs font-medium drop-shadow-md">
                          {room.label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Agents Layer */}
                <div className="absolute inset-0 pointer-events-none">
                  {agents.map((agent) => {
                    const roomIndex = Object.keys(ROOMS).indexOf(agent.room);
                    const col = roomIndex % 3;
                    const row = Math.floor(roomIndex / 3);
                    // Position within grid cell
                    const baseX = (col * 33.33) + 16.66;
                    const baseY = (row * 50) + 25;
                    // Add some offset based on agent position for movement
                    const offsetX = ((agent.position.x % 40) - 20) * 0.3;
                    const offsetY = ((agent.position.y % 40) - 20) * 0.3;

                    return (
                      <div
                        key={agent.id}
                        className="absolute pointer-events-auto cursor-pointer transition-all duration-300 hover:scale-110"
                        style={{
                          left: `calc(${baseX}% + ${offsetX}px)`,
                          top: `calc(${baseY}% + ${offsetY}px)`,
                          transform: 'translate(-50%, -50%)',
                          zIndex: selectedAgent?.id === agent.id ? 20 : 10,
                        }}
                        onClick={() => setSelectedAgent(agent)}
                      >
                        {/* Working glow */}
                        {agent.status === 'working' && (
                          <div
                            className="absolute inset-0 rounded-full animate-pulse"
                            style={{
                              background: `radial-gradient(circle, ${agent.color}60 0%, transparent 70%)`,
                              transform: 'scale(2)',
                            }}
                          />
                        )}

                        {/* Agent Avatar */}
                        <div
                          className="relative w-12 h-12 rounded-full overflow-hidden border-2 shadow-lg"
                          style={{
                            borderColor: selectedAgent?.id === agent.id ? '#fff' : agent.color,
                            boxShadow: selectedAgent?.id === agent.id
                              ? '0 0 0 2px #fff, 0 4px 12px rgba(0,0,0,0.3)'
                              : `0 4px 12px ${MV_COLORS.shadow}`,
                          }}
                        >
                          <Image
                            src={agent.image}
                            alt={agent.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>

                        {/* Status dot */}
                        <div
                          className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow ${
                            agent.status === 'working' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                          }`}
                        />

                        {/* Task count badge */}
                        {agent.taskCount > 0 && (
                          <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold shadow">
                            {agent.taskCount}
                          </div>
                        )}

                        {/* Name */}
                        <div
                          className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
                          style={{ color: MV_COLORS.stone }}
                        >
                          <span className="text-[10px] font-medium bg-white/80 px-1.5 py-0.5 rounded shadow-sm">
                            {agent.name.split(' ')[0]}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px]" style={{ color: MV_COLORS.stone }}>
                <div className="flex items-center gap-3 bg-white/80 px-2 py-1 rounded">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                    Working
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-amber-400 rounded-full" />
                    Idle
                  </span>
                </div>
                <span className="bg-white/80 px-2 py-1 rounded opacity-60">Click agent to assign task</span>
              </div>
            </div>
          </div>

          {/* Agent Panel */}
          <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col bg-white/[0.02]">
            {selectedAgent ? (
              <>
                {/* Agent info */}
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="relative w-12 h-12 rounded-xl overflow-hidden"
                      style={{ backgroundColor: `${selectedAgent.color}20` }}
                    >
                      <Image
                        src={selectedAgent.image}
                        alt={selectedAgent.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div>
                      <h3 className="text-white font-medium text-sm">{selectedAgent.name}</h3>
                      <p className="text-white/40 text-xs">{selectedAgent.role}</p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2 flex-wrap">
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
                    {selectedAgent.lastSeen && (
                      <span className="text-[10px] text-white/30">
                        Last: {new Date(selectedAgent.lastSeen).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
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
                className={`px-2 py-1 rounded-lg text-xs flex items-center gap-2 transition-all border ${
                  selectedAgent?.id === agent.id
                    ? 'bg-white/10 text-white border-white/20'
                    : 'bg-white/5 text-white/50 border-transparent hover:bg-white/10 hover:text-white/70'
                }`}
              >
                <div className="relative w-5 h-5 rounded-full overflow-hidden">
                  <Image
                    src={agent.image}
                    alt={agent.name}
                    fill
                    className="object-cover"
                    sizes="20px"
                  />
                </div>
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
