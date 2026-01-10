'use client'

interface WorkerStatusProps {
  activeWorkers: number
}

export default function WorkerStatus({ activeWorkers }: WorkerStatusProps) {
  // Sample worker data - in production this would come from the tasks
  const workers = [
    { id: 'claude-primary', name: 'Claude Opus', status: 'active', task: 'Building BIB Dashboard', color: 'from-amber-500 to-orange-600' },
    { id: 'claude-worker-1', name: 'Worker #1', status: 'idle', task: 'Waiting for task', color: 'from-gray-500 to-gray-600' },
    { id: 'claude-worker-2', name: 'Worker #2', status: 'idle', task: 'Waiting for task', color: 'from-gray-500 to-gray-600' },
  ]

  const agentTypes = [
    { name: 'Editore Capo', role: 'Book production orchestration', icon: '📚' },
    { name: 'Gianni Parola', role: 'Writing & storytelling', icon: '✍️' },
    { name: 'Pina Pennello', role: 'Illustrations & visual', icon: '🎨' },
    { name: 'Code Worker', role: 'App & tools development', icon: '💻' },
    { name: 'PR Agent', role: 'Social media & marketing', icon: '📢' },
  ]

  return (
    <div className="chart-container">
      {/* Active Workers Count */}
      <div className="flex items-center justify-center mb-6 pb-6 border-b border-white/10">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-onde-gold/20 to-amber-600/10 flex items-center justify-center mx-auto">
              <span className="text-4xl font-bold text-onde-gold glow-text">{activeWorkers}</span>
            </div>
            {activeWorkers > 0 && (
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-onde-green flex items-center justify-center animate-pulse">
                <span className="text-xs font-bold">!</span>
              </div>
            )}
          </div>
          <p className="text-sm opacity-60 mt-3">Active AI Workers</p>
        </div>
      </div>

      {/* Current Workers */}
      <div className="space-y-3 mb-6">
        {workers.slice(0, 3).map((worker) => (
          <div
            key={worker.id}
            className={`p-3 rounded-xl transition-all ${
              worker.status === 'active' ? 'bg-onde-gold/10 border border-onde-gold/20' : 'bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${worker.color} flex items-center justify-center text-lg`}>
                🤖
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{worker.name}</p>
                  <div className={`w-2 h-2 rounded-full ${
                    worker.status === 'active' ? 'bg-onde-green animate-pulse' : 'bg-gray-500'
                  }`} />
                </div>
                <p className="text-xs opacity-40 truncate">{worker.task}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Agent Types */}
      <div className="border-t border-white/10 pt-6">
        <h4 className="text-xs font-semibold opacity-60 mb-4">AVAILABLE AGENT TYPES</h4>
        <div className="space-y-2">
          {agentTypes.map((agent) => (
            <div
              key={agent.name}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-all"
            >
              <span className="text-lg">{agent.icon}</span>
              <div>
                <p className="text-sm font-medium">{agent.name}</p>
                <p className="text-xs opacity-40">{agent.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Factory Status */}
      <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse" />
          <p className="text-sm">
            <span className="text-blue-400 font-semibold">Factory Online</span>
            {' '}- Workers ready for parallel execution
          </p>
        </div>
      </div>
    </div>
  )
}
