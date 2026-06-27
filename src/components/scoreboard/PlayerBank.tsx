import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { useUser } from '@/contexts/UserContext';

export default function PlayerBank() {
  const { game } = useGame();
  const { users } = useUser();

  const playerA = users.find(u => u.name.toLowerCase() === game.teamAName.toLowerCase());
  const playerB = users.find(u => u.name.toLowerCase() === game.teamBName.toLowerCase());

  return (
    <div className="hud-panel overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[var(--border)]">
        <span className="w-2 h-2 rounded-full" style={{ background: 'var(--gold)', boxShadow: 'none' }} />
        <span className="text-xs mono font-black tracking-widest" style={{ color: 'var(--gold)' }}>PLAYERS TOKE</span>
        <span className="text-xs text-[var(--text)] mono tracking-wider">— tips received</span>
      </div>

      <div className="grid grid-cols-2">
        {/* Team A player */}
        <div
          className="flex flex-col items-center py-4 gap-1"
          style={{ borderRight: '1px solid var(--border)' }}
        >
          <span className="text-xs mono font-black uppercase tracking-widest" style={{ color: 'var(--cyan)' }}>
            {game.teamAName}
          </span>
          {playerA ? (
            <span className="mono text-3xl font-black" style={{ color: 'var(--cyan)', textShadow: 'none' }}>
              {playerA.credits}
            </span>
          ) : (
            <span className="text-xs text-[var(--text)] mono italic">no account</span>
          )}
          <span className="text-xs text-[var(--text)] mono tracking-wider">coins</span>
        </div>

        {/* Team B player */}
        <div className="flex flex-col items-center py-4 gap-1">
          <span className="text-xs mono font-black uppercase tracking-widest" style={{ color: 'var(--red)' }}>
            {game.teamBName}
          </span>
          {playerB ? (
            <span className="mono text-3xl font-black" style={{ color: 'var(--red)', textShadow: 'none' }}>
              {playerB.credits}
            </span>
          ) : (
            <span className="text-xs text-[var(--text)] mono italic">no account</span>
          )}
          <span className="text-xs text-[var(--text)] mono tracking-wider">coins</span>
        </div>
      </div>
    </div>
  );
}
