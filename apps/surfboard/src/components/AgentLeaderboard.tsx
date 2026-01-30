'use client';

import Image from 'next/image';
import { formatXP, getLevelColor, getLevelTitle } from '../lib/gamification';

interface AgentForLeaderboard {
  id: string;
  name: string;
  xp: number;
  level: number;
  totalTasksDone: number;
  currentStreak: number;
  badges: string[];
  image: string;
  status: 'working' | 'idle' | 'sleeping';
}

interface AgentLeaderboardProps {
  agents: AgentForLeaderboard[];
  onSelectAgent?: (agentId: string) => void;
  compact?: boolean;
}

// Rank medals for top 3
const RANK_MEDALS: Record<number, { emoji: string; color: string; bg: string }> = {
  1: { emoji: '🥇', color: '#FFD700', bg: 'bg-yellow-500/20' },
  2: { emoji: '🥈', color: '#C0C0C0', bg: 'bg-gray-400/20' },
  3: { emoji: '🥉', color: '#CD7F32', bg: 'bg-orange-500/20' },
};

export function AgentLeaderboard({ agents, onSelectAgent, compact = false }: AgentLeaderboardProps) {
  // Sort agents by XP (highest first)
  const sortedAgents = [...agents].sort((a, b) => b.xp - a.xp);

  if (sortedAgents.length === 0) {
    return (
      <div className="text-center py-8 text-white/40 text-sm">
        Nessun agente trovato
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Header */}
      {!compact && (
        <div className="flex items-center justify-between px-2 py-1 text-[10px] text-white/40 uppercase tracking-wider">
          <span>Rank</span>
          <span className="flex-1 ml-2">Agent</span>
          <span className="w-12 text-right">Level</span>
          <span className="w-14 text-right">XP</span>
        </div>
      )}

      {/* Leaderboard rows */}
      {sortedAgents.map((agent, index) => {
        const rank = index + 1;
        const medal = RANK_MEDALS[rank];
        const levelColor = getLevelColor(agent.level);

        return (
          <div
            key={agent.id}
            onClick={() => onSelectAgent?.(agent.id)}
            className={`
              flex items-center gap-2 p-2 rounded-lg transition-all cursor-pointer
              ${medal ? medal.bg : 'bg-white/5'}
              ${onSelectAgent ? 'hover:bg-white/10 hover:scale-[1.02]' : ''}
              ${agent.status === 'working' ? 'ring-1 ring-emerald-400/30' : ''}
            `}
          >
            {/* Rank */}
            <div className="w-6 flex items-center justify-center">
              {medal ? (
                <span className="text-lg">{medal.emoji}</span>
              ) : (
                <span className="text-white/40 text-sm font-mono">#{rank}</span>
              )}
            </div>

            {/* Avatar */}
            <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-white/10">
              <Image
                src={agent.image}
                alt={agent.name}
                fill
                className="object-cover"
                sizes="32px"
              />
              {/* Status indicator */}
              <div
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-black/50 ${
                  agent.status === 'working'
                    ? 'bg-emerald-400 animate-pulse'
                    : agent.status === 'idle'
                    ? 'bg-amber-400'
                    : 'bg-gray-500'
                }`}
              />
            </div>

            {/* Name & streak */}
            <div className="flex-1 min-w-0">
              <div className="text-white text-xs font-medium truncate">{agent.name}</div>
              <div className="flex items-center gap-1.5 text-[10px] text-white/40">
                <span>{agent.totalTasksDone} tasks</span>
                {agent.currentStreak > 0 && (
                  <span className="text-orange-400">🔥{agent.currentStreak}</span>
                )}
              </div>
            </div>

            {/* Level */}
            <div
              className="w-8 h-6 rounded flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: `${levelColor}30`, color: levelColor }}
              title={getLevelTitle(agent.level)}
            >
              {agent.level}
            </div>

            {/* XP */}
            <div className="w-14 text-right">
              <div className="text-cyan-400 text-xs font-medium">{formatXP(agent.xp)}</div>
              {!compact && (
                <div className="text-[9px] text-white/30">XP</div>
              )}
            </div>
          </div>
        );
      })}

      {/* Total stats footer */}
      {!compact && sortedAgents.length > 1 && (
        <div className="mt-3 pt-2 border-t border-white/10 px-2">
          <div className="flex items-center justify-between text-[10px] text-white/40">
            <span>
              {sortedAgents.length} agents • {sortedAgents.reduce((sum, a) => sum + a.totalTasksDone, 0)} total tasks
            </span>
            <span>
              {formatXP(sortedAgents.reduce((sum, a) => sum + a.xp, 0))} combined XP
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
