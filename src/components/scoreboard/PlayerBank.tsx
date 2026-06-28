import React from 'react';
import { PiggyBank } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';
import { useUser } from '@/contexts/UserContext';

function PlayerCol({ name, color, credits, tipsReceived }: { name: string; color: string; credits?: number; tipsReceived?: number }) {
  return (
    <div className="flex flex-col items-center py-4 gap-2">
      <div className="flex items-center gap-2">
        <PiggyBank size={28} style={{ color }} />
        <span className="text-xs mono font-black uppercase tracking-widest" style={{ color }}>
          {name}
        </span>
      </div>
      {credits !== undefined ? (
        <div className="flex flex-col items-center gap-1">
          <span className="mono text-3xl font-black" style={{ color: 'var(--green)' }}>{tipsReceived ?? 0}</span>
          <span className="text-xs mono tracking-wider" style={{ color: 'rgba(0,255,65,0.6)' }}>tips received</span>
        </div>
      ) : (
        <span className="text-xs text-[var(--text)] mono italic">no account</span>
      )}
    </div>
  );
}

export default function PlayerBank() {
  const { game } = useGame();
  const { users } = useUser();

  const playerA = users.find(u => u.name.toLowerCase() === game.teamAName.toLowerCase());
  const playerB = users.find(u => u.name.toLowerCase() === game.teamBName.toLowerCase());

  return (
    <div className="hud-panel overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[var(--border)]">
        <span className="w-2 h-2 rounded-full" style={{ background: 'var(--gold)', boxShadow: 'none' }} />
        <span className="text-xs mono font-black tracking-widest" style={{ color: 'var(--gold)' }}>PLAYERS TOKE</span>
      </div>

      <div className="grid grid-cols-2 divide-x divide-[var(--border)]">
        <PlayerCol
          name={game.teamAName}
          color="var(--cyan)"
          credits={playerA?.credits}
          tipsReceived={playerA?.tipsReceived}
        />
        <PlayerCol
          name={game.teamBName}
          color="var(--red)"
          credits={playerB?.credits}
          tipsReceived={playerB?.tipsReceived}
        />
      </div>
    </div>
  );
}
