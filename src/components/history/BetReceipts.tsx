import React, { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useUser } from '@/contexts/UserContext';

export default function BetReceipts() {
  const { gameHistory, game } = useGame();
  const { currentUser } = useUser();
  const [open, setOpen] = useState(true);

  const fallbackA = game.teamAName;
  const fallbackB = game.teamBName;

  if (!currentUser) return null;

  // Live matched bets in current game
  const liveMatched = [...game.teamAQueue, ...game.teamBQueue]
    .filter(b => b.booked && b.userId === currentUser.id)
    .map(b => ({
      type: 'live' as const,
      id: b.id,
      gameNumber: game.currentGameNumber,
      teamSide: b.teamSide,
      amount: b.amount,
      nameA: game.teamAName,
      nameB: game.teamBName,
    }));

  // Settled bets from history
  const settled = gameHistory.flatMap(record => {
    const nameA = (!record.teamAName || record.teamAName === 'Player A') ? fallbackA : record.teamAName;
    const nameB = (!record.teamBName || record.teamBName === 'Player B') ? fallbackB : record.teamBName;
    return [
      ...record.bets.teamA.map(b => ({ ...b, teamSide: 'A' as const, nameA, nameB, record })),
      ...record.bets.teamB.map(b => ({ ...b, teamSide: 'B' as const, nameA, nameB, record })),
    ].filter(b => b.userId === currentUser.id && b.booked);
  });

  const totalCount = liveMatched.length + settled.length;

  return (
    <div className="hud-panel bracket overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)] hover:bg-black transition-colors"
        onClick={() => setOpen(v => !v)}
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: 'var(--cyan)', boxShadow: '0 0 2px rgba(0,229,255,0.4)' }} />
          <span className="text-xs mono font-black tracking-widest" style={{ color: 'var(--cyan)' }}>BET RECEIPTS</span>
          <span className="text-xs mono text-[var(--text)]">({totalCount})</span>
        </div>
        <span className="text-xs text-[var(--text)]">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="flex flex-col divide-y divide-[var(--border)] max-h-72 overflow-y-auto">
          {totalCount === 0 ? (
            <div className="flex items-center justify-center h-16 text-xs mono text-[var(--text)] tracking-widest">
              NO RECEIPTS YET
            </div>
          ) : (
            <>
              {/* Live pending matched bets */}
              {liveMatched.map(r => {
                const betColor = r.teamSide === 'A' ? 'var(--cyan)' : 'var(--red)';
                const teamBetOn = r.teamSide === 'A' ? r.nameA : r.nameB;
                return (
                  <div
                    key={r.id}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-black transition-colors"
                    style={{ borderLeft: '3px solid var(--gold)' }}
                  >
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--gold)', boxShadow: '0 0 4px var(--gold)', flexShrink: 0 }} />
                        <span className="text-xs mono font-black" style={{ color: betColor }}>
                          GAME #{r.gameNumber} — {teamBetOn.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-xs mono tracking-wider" style={{ color: 'var(--gold)', paddingLeft: 14 }}>
                        LIVE · MATCHED
                      </span>
                    </div>
                    <div
                      className="mono font-black text-sm px-2 py-1"
                      style={{
                        color: 'var(--gold)',
                        background: 'rgba(255,215,0,0.1)',
                        border: '1px solid rgba(255,215,0,0.3)',
                      }}
                    >
                      {r.amount}
                    </div>
                  </div>
                );
              })}

              {/* Settled history bets */}
              {settled.map((r, i) => {
                const betColor = r.teamSide === 'A' ? 'var(--cyan)' : 'var(--red)';
                const teamBetOn = r.teamSide === 'A' ? r.nameA : r.nameB;
                const winner = r.record.winningTeam === 'A' ? r.nameA : r.nameB;
                const winnerColor = r.record.winningTeam === 'A' ? 'var(--cyan)' : 'var(--red)';
                return (
                  <div
                    key={`${r.record.id}-${i}`}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-black transition-colors"
                    style={{ borderLeft: `3px solid ${betColor}` }}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs mono font-black" style={{ color: betColor }}>
                        GAME #{r.record.gameNumber} — {teamBetOn.toUpperCase()}
                      </span>
                      <span className="text-xs mono text-[var(--text)] tracking-wider">
                        {new Date(r.record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {'  ·  '}
                        <span style={{ color: winnerColor }}>W: {winner}</span>
                      </span>
                    </div>
                    <div
                      className="mono font-black text-sm px-2 py-1"
                      style={{
                        color: r.won ? 'var(--green)' : 'var(--red)',
                        background: r.won ? 'rgba(0,255,65,0.1)' : 'rgba(255,0,64,0.1)',
                        border: `1px solid ${r.won ? 'rgba(0,255,65,0.3)' : 'rgba(255,0,64,0.3)'}`,
                      }}
                    >
                      {r.won ? '+' : '-'}{r.amount}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}
