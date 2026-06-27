import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '@/contexts/GameContext';

interface Metadata {
  playerA: string;
  playerB: string;
  spot: string;
  raceTo: string;
  amountBet: string;
  location: string;
}

const empty: Metadata = { playerA: '', playerB: '', spot: '', raceTo: '', amountBet: '', location: '' };

function formatDescription(m: Metadata): string {
  const parts = [
    m.playerA && m.playerB ? `${m.playerA} VS ${m.playerB}` : '',
    m.spot,
    m.raceTo ? `RACE TO ${m.raceTo}` : '',
    m.amountBet ? `$${m.amountBet}` : '',
    m.location,
  ].filter(Boolean);
  return parts.join('  ★  ');
}

export default function GameDescription() {
  const { game, isAdmin, updateGame } = useGame();
  const description = game.gameDescription || '';
  const [editing, setEditing] = useState(false);
  const [meta, setMeta] = useState<Metadata>(empty);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);

  const handleEdit = () => {
    // Pre-fill fields from current description (best-effort, stored as formatted string)
    setMeta(empty);
    setEditing(true);
  };

  const handleSave = () => {
    updateGame({ gameDescription: formatDescription(meta) });
    setEditing(false);
  };

  const handleClear = () => {
    updateGame({ gameDescription: '' });
    setEditing(false);
  };

  // Auto-scroll ticker
  useEffect(() => {
    if (!description || editing) return;
    const el = scrollerRef.current;
    if (!el) return;

    let pos = 0;
    const tick = () => {
      pos += 1.2;
      const half = el.scrollWidth / 3;
      if (pos >= half) pos = 0;
      el.scrollLeft = pos;
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [description, editing]);

  if (editing) {
    return (
      <div className="hud-panel bracket w-full px-4 py-3 flex flex-col gap-3">
        <div className="text-xs mono text-[var(--text)] tracking-widest">GAME INFO</div>

        <div className="grid grid-cols-2 gap-2">
          {[
            { key: 'playerA', label: 'Player A' },
            { key: 'playerB', label: 'Player B' },
          ].map(({ key, label }) => (
            <div key={key} className="flex flex-col gap-1">
              <span className="text-xs text-[var(--text)] mono tracking-wider">{label}</span>
              <input
                className="bg-transparent border border-[var(--border)] px-3 py-1.5 text-sm mono outline-none placeholder:text-[var(--text)] focus:border-[var(--cyan)]"
                placeholder={label}
                value={(meta as any)[key]}
                onChange={e => setMeta(p => ({ ...p, [key]: e.target.value }))}
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { key: 'spot', label: 'Spot / Game Type' },
            { key: 'raceTo', label: 'Race To' },
            { key: 'amountBet', label: 'Stake ($)' },
          ].map(({ key, label }) => (
            <div key={key} className="flex flex-col gap-1">
              <span className="text-xs text-[var(--text)] mono tracking-wider">{label}</span>
              <input
                className="bg-transparent border border-[var(--border)] px-3 py-1.5 text-sm mono outline-none placeholder:text-[var(--text)] focus:border-[var(--cyan)]"
                placeholder={label}
                value={(meta as any)[key]}
                onChange={e => setMeta(p => ({ ...p, [key]: e.target.value }))}
              />
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-[var(--text)] mono tracking-wider">Location</span>
          <input
            className="bg-transparent border border-[var(--border)] px-3 py-1.5 text-sm mono outline-none placeholder:text-[var(--text)] focus:border-[var(--cyan)]"
            placeholder="Location"
            value={meta.location}
            onChange={e => setMeta(p => ({ ...p, location: e.target.value }))}
          />
        </div>

        <div className="flex gap-2 justify-end">
          <button className="btn btn-ghost px-4 py-1.5 text-xs" onClick={handleClear}>CLEAR</button>
          <button className="btn btn-ghost px-4 py-1.5 text-xs" onClick={() => setEditing(false)}>CANCEL</button>
          <button className="btn btn-cyan px-4 py-1.5 text-xs font-black" onClick={handleSave}>SAVE</button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="hud-panel w-full flex items-center overflow-hidden relative"
      style={{ minHeight: 42 }}
    >
      {/* Scrolling ticker */}
      <div
        ref={scrollerRef}
        className="flex-1 overflow-hidden whitespace-nowrap px-4 py-2.5"
        style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' } as React.CSSProperties}
      >
        {description ? (
          <span>
            {[description, description, description].map((d, i) => (
              <span
                key={i}
                className="mono font-black text-sm uppercase tracking-widest"
                style={{ color: 'var(--gold)', textShadow: '0 0 3px rgba(255,215,0,0.5)', marginRight: '4rem' }}
              >
                {d}
              </span>
            ))}
          </span>
        ) : (
          <span className="text-xs mono text-[var(--text)] tracking-widest">
            {isAdmin ? 'NO GAME INFO — CLICK EDIT TO ADD' : 'NO GAME INFO'}
          </span>
        )}
      </div>

      {/* Edit button (admin only) */}
      {isAdmin && (
        <button
          className="flex-shrink-0 btn btn-ghost px-3 py-1.5 text-xs mr-2"
          onClick={handleEdit}
        >
          EDIT
        </button>
      )}
    </div>
  );
}
