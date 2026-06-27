import React, { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { GameRecord } from '@/types';

function formatDuration(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function GameRow({ record, fallbackA, fallbackB }: { record: GameRecord; fallbackA: string; fallbackB: string }) {
  const [expanded, setExpanded] = useState(false);
  const nameA = (!record.teamAName || record.teamAName === 'Player A') ? fallbackA : record.teamAName;
  const nameB = (!record.teamBName || record.teamBName === 'Player B') ? fallbackB : record.teamBName;
  const winnerColor = record.winningTeam === 'A' ? 'var(--cyan)' : 'var(--red)';
  const winnerName = record.winningTeam === 'A' ? nameA : nameB;
  const loserName = record.winningTeam === 'A' ? nameB : nameA;
  const totalBets = record.bets.teamA.length + record.bets.teamB.length;

  return (
    <div style={{ borderLeft: `3px solid ${winnerColor}` }}>
      {/* Row header */}
      <button
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-black transition-colors text-left"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex flex-col gap-0.5">
          <span className="text-xs mono font-black" style={{ color: winnerColor }}>
            GAME #{record.gameNumber} — {winnerName.toUpperCase()} def. {loserName.toUpperCase()}
          </span>
          <span className="text-xs text-[var(--text)] mono">
            {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {'  ·  '}{formatDuration(record.duration ?? 0)}
            {'  ·  '}{totalBets} bet{totalBets !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs mono flex-shrink-0">
          <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{record.totalAmount * 2} ITM</span>
          <span className="text-[var(--text)]">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {/* Expanded bet details */}
      {expanded && (
        <div className="px-4 pb-3 grid grid-cols-2 gap-3 border-t border-[var(--border)]" style={{ paddingTop: '0.75rem' }}>
          {/* Team A bets */}
          <div>
            <div className="text-xs mono tracking-widest mb-2 font-black" style={{ color: 'var(--cyan)' }}>
              {nameA.toUpperCase()}
            </div>
            {record.bets.teamA.length === 0 ? (
              <div className="text-xs text-[var(--text)] mono italic">no bets</div>
            ) : (
              <div className="flex flex-col gap-1">
                {record.bets.teamA.map((bet, i) => (
                  <div key={i} className="flex items-center justify-between px-2 py-1" style={{ background: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.15)' }}>
                    <span className="text-xs mono text-[var(--text)]">{bet.userName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs mono font-bold" style={{ color: 'var(--cyan)' }}>{bet.amount}</span>
                      <span className="text-xs font-black" style={{ color: bet.won ? 'var(--green)' : 'var(--red)' }}>
                        {bet.won ? '✓' : '✗'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Team B bets */}
          <div>
            <div className="text-xs mono tracking-widest mb-2 font-black" style={{ color: 'var(--red)' }}>
              {nameB.toUpperCase()}
            </div>
            {record.bets.teamB.length === 0 ? (
              <div className="text-xs text-[var(--text)] mono italic">no bets</div>
            ) : (
              <div className="flex flex-col gap-1">
                {record.bets.teamB.map((bet, i) => (
                  <div key={i} className="flex items-center justify-between px-2 py-1" style={{ background: 'rgba(255,0,64,0.05)', border: '1px solid rgba(255,0,64,0.15)' }}>
                    <span className="text-xs mono text-[var(--text)]">{bet.userName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs mono font-bold" style={{ color: 'var(--red)' }}>{bet.amount}</span>
                      <span className="text-xs font-black" style={{ color: bet.won ? 'var(--green)' : 'var(--red)' }}>
                        {bet.won ? '✓' : '✗'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BetLedger() {
  const { gameHistory } = useGame();
  const [open, setOpen] = useState(true);
  const [filter, setFilter] = useState<'all' | 'A' | 'B'>('all');

  const filtered = filter === 'all' ? gameHistory : gameHistory.filter(r => r.winningTeam === filter);
  const { game } = useGame();
  const teamAName = game.teamAName;
  const teamBName = game.teamBName;

  return (
    <div className="hud-panel bracket overflow-hidden">
      {/* Header */}
      <button
        className="w-full flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)] hover:bg-black transition-colors"
        onClick={() => setOpen(v => !v)}
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: 'var(--cyan)', boxShadow: '0 0 2px rgba(0,229,255,0.4)' }} />
          <span className="text-xs mono font-black tracking-widest neon-cyan">BET LEDGER</span>
          <span className="text-xs mono text-[var(--text)]">({gameHistory.length} games)</span>
        </div>
        <span className="text-xs text-[var(--text)]">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <>
          {/* Filter tabs */}
          <div className="flex border-b border-[var(--border)]">
            {(['all', 'A', 'B'] as const).map(tab => (
              <button
                key={tab}
                className="flex-1 py-1.5 text-xs mono tracking-widest transition-colors"
                style={{
                  color: filter === tab ? (tab === 'A' ? 'var(--cyan)' : tab === 'B' ? 'var(--red)' : 'var(--text)') : 'var(--text)',
                  background: filter === tab ? 'rgba(255,255,255,0.05)' : 'transparent',
                  borderBottom: filter === tab ? `2px solid ${tab === 'A' ? 'var(--cyan)' : tab === 'B' ? 'var(--red)' : 'var(--text)'}` : '2px solid transparent',
                }}
                onClick={() => setFilter(tab)}
              >
                {tab === 'all' ? 'ALL' : tab === 'A' ? teamAName.toUpperCase() : teamBName.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Records */}
          <div className="flex flex-col divide-y divide-[var(--border)] max-h-96 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex items-center justify-center h-16 text-xs mono text-[var(--text)] tracking-widest">
                NO RECORDS
              </div>
            ) : (
              filtered.map(record => <GameRow key={record.id} record={record} fallbackA={teamAName} fallbackB={teamBName} />)
            )}
          </div>
        </>
      )}
    </div>
  );
}
