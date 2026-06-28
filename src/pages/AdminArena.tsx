import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { useGame } from '@/contexts/GameContext';
import Scoreboard from '@/components/scoreboard/Scoreboard';
import BettingQueue from '@/components/betting/BettingQueue';
import Header from '@/components/layout/Header';
import GameDescription from '@/components/game/GameDescription';
import UserManager from '@/components/admin/UserManager';
import CoinAuditLog from '@/components/admin/CoinAuditLog';

function Divider() {
  return <div style={{ width: 1, alignSelf: 'stretch', background: 'rgba(255,215,0,0.15)', margin: '0 4px' }} />;
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="mono text-xs font-black tracking-[0.3em] uppercase" style={{ color: 'rgba(255,215,0,0.6)' }}>{label}</span>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

export default function AdminArena() {
  const { game, declareWinner, isAdmin, setIsAdmin, resetQueues, updateGame } = useGame();
  const { users, currentUser, coinAuditLog } = useUser();
  const navigate = useNavigate();

  const [winFlash, setWinFlash] = useState<'A' | 'B' | null>(null);
  const [showUserManager, setShowUserManager] = useState(false);
  const [showAuditLog, setShowAuditLog] = useState(false);

  const unackedAlerts = coinAuditLog.filter(e => !e.acknowledged).length;

  
  if (!isAdmin) return <Navigate to="/arena" replace />;

  const totalAllCoins = users.filter(u => !u.isAdmin).reduce((s, u) => s + u.credits, 0);

  const handleWin = (team: 'A' | 'B') => {
    setWinFlash(team);
    declareWinner(team);
    setTimeout(() => setWinFlash(null), 600);
  };

  return (
    <div style={{ background: 'var(--bg)', height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Header />

      {/* Win flash overlay */}
      {winFlash && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center" style={{ background: 'rgba(0,255,65,0.06)' }}>
          <div className="text-5xl font-black uppercase tracking-widest" style={{ color: 'var(--green)', textShadow: '0 0 24px rgba(0,255,65,0.4)' }}>
            {winFlash === 'A' ? game.teamAName : game.teamBName} WINS
          </div>
        </div>
      )}

      {showUserManager && <UserManager onClose={() => setShowUserManager(false)} />}
      {showAuditLog && <CoinAuditLog onClose={() => setShowAuditLog(false)} />}

      {/* ── Admin Controls Panel ── */}
      <div style={{ background: '#0a0a18', borderBottom: '1px solid rgba(255,215,0,0.25)', flexShrink: 0, padding: '10px 16px' }}>
        <div className="flex items-start gap-5 flex-wrap">

          {/* Identity */}
          <div className="flex flex-col gap-1 justify-center" style={{ minWidth: 90 }}>
            <span className="mono text-sm font-black tracking-[0.25em]" style={{ color: 'var(--gold)' }}>⚙ ADMIN</span>
            <span className="mono text-xs" style={{ color: 'var(--text-dim)' }}>
              {totalAllCoins.toLocaleString()} <span style={{ color: 'rgba(255,215,0,0.5)' }}>coins</span>
            </span>
          </div>

          <Divider />

          {/* Declare Winner */}
          <Section label="Declare Winner">
            <button
              className="btn btn-cyan px-4 py-2 text-xs font-black tracking-widest"
              onClick={() => handleWin('A')}
            >
              ✓ {game.teamAName}
            </button>
            <button
              className="btn btn-red px-4 py-2 text-xs font-black tracking-widest"
              onClick={() => handleWin('B')}
            >
              ✓ {game.teamBName}
            </button>
          </Section>

          <Divider />

          {/* Balls — Player A */}
          <Section label={`${game.teamAName} Balls`}>
            <button className="btn btn-ghost w-8 h-8 text-sm font-black" onClick={() => updateGame({ teamABalls: game.teamABalls - 1 })}>−</button>
            <span className="mono font-black text-xl w-8 text-center" style={{ color: 'var(--cyan)' }}>{game.teamABalls}</span>
            <button className="btn btn-cyan w-8 h-8 text-sm font-black" onClick={() => updateGame({ teamABalls: game.teamABalls + 1 })}>+</button>
          </Section>

          {/* Balls — Player B */}
          <Section label={`${game.teamBName} Balls`}>
            <button className="btn btn-ghost w-8 h-8 text-sm font-black" onClick={() => updateGame({ teamBBalls: game.teamBBalls - 1 })}>−</button>
            <span className="mono font-black text-xl w-8 text-center" style={{ color: 'var(--red)' }}>{game.teamBBalls}</span>
            <button className="btn btn-red w-8 h-8 text-sm font-black" onClick={() => updateGame({ teamBBalls: game.teamBBalls + 1 })}>+</button>
          </Section>

          <Divider />

          {/* Management */}
          <Section label="Management">
            <button className="btn btn-cyan px-3 py-2 text-xs font-black tracking-widest" onClick={() => setShowUserManager(true)}>
              USERS
            </button>
            <button
              className="btn px-3 py-2 text-xs font-black tracking-widest relative"
              style={{ color: unackedAlerts > 0 ? 'var(--red)' : 'var(--text-dim)', border: `1px solid ${unackedAlerts > 0 ? 'var(--red)' : 'rgba(255,255,255,0.15)'}`, background: unackedAlerts > 0 ? 'rgba(255,0,64,0.08)' : 'transparent' }}
              onClick={() => setShowAuditLog(true)}
            >
              {unackedAlerts > 0 ? `⚠ AUDIT (${unackedAlerts})` : 'AUDIT LOG'}
            </button>
            <Link to="/whitebook" className="btn btn-ghost px-3 py-2 text-xs font-black tracking-widest" style={{ textDecoration: 'none' }}>
              WHITEBOOK
            </Link>
            <button className="btn btn-ghost px-3 py-2 text-xs font-black tracking-widest" onClick={() => resetQueues()}>
              CLEAR QUEUE
            </button>
            <button
              className="btn btn-ghost px-3 py-2 text-xs font-black tracking-widest"
              onClick={() => { if (confirm('Reset all scores to 0?')) updateGame({ teamAGames: 0, teamBGames: 0, teamABalls: 0, teamBBalls: 0, currentGameNumber: 1 }); }}
            >
              RESET SCORES
            </button>
          </Section>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'flex-end', paddingBottom: 2 }}>
            <button
              className="btn px-4 py-2 text-xs font-black tracking-widest"
              style={{ color: 'var(--red)', border: '1px solid var(--red)' }}
              onClick={() => { setIsAdmin(false); navigate('/arena'); }}
            >
              EXIT ADMIN
            </button>
          </div>

        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 200px 1fr', gap: 8, padding: 8, minHeight: 0, overflow: 'hidden' }}>

        {/* Scoreboard */}
        <div style={{ minHeight: 0, overflow: 'hidden' }}>
          <div style={{ transform: 'scale(0.82)', transformOrigin: 'top left', width: '122%' }}>
            <Scoreboard onTeamAWin={() => handleWin('A')} onTeamBWin={() => handleWin('B')} stackedLayout />
          </div>
        </div>

        {/* Game Description */}
        <div style={{ minHeight: 0, overflow: 'auto' }}>
          <GameDescription />
        </div>

        {/* Betting Queue */}
        <div style={{ minHeight: 0, overflow: 'auto' }}>
          <BettingQueue compactInput />
        </div>

      </div>
    </div>
  );
}
