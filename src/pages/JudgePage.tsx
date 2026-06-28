import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Challenge } from '@/types';

const SERVER_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3001'
  : 'https://gamebird-app-production.up.railway.app';

type PageState = 'loading' | 'ready' | 'confirming' | 'done' | 'error';

export default function JudgePage() {
  const { token } = useParams<{ token: string }>();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [pageState, setPageState] = useState<PageState>('loading');
  const [error, setError] = useState('');
  const [winner, setWinner] = useState<{ id: string; name: string } | null>(null);
  const [confirming, setConfirming] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (!token) { setError('No judge token provided.'); setPageState('error'); return; }
    fetch(`${SERVER_URL}/api/judge/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); setPageState('error'); return; }
        setChallenge(data.challenge);
        if (data.alreadyJudged) {
          setWinner({ id: data.challenge.winnerId!, name: data.challenge.winnerName! });
          setPageState('done');
        } else {
          setPageState('ready');
        }
      })
      .catch(() => { setError('Could not reach server. Check your connection.'); setPageState('error'); });
  }, [token]);

  const decide = async (winnerId: string, winnerName: string) => {
    setPageState('confirming');
    try {
      const r = await fetch(`${SERVER_URL}/api/judge/${token}/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winnerId }),
      });
      const data = await r.json();
      if (data.error) { setError(data.error); setPageState('error'); return; }
      setWinner({ id: winnerId, name: winnerName });
      setPageState('done');
    } catch {
      setError('Submission failed. Please try again.');
      setPageState('ready');
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
      style={{
        fontFamily: 'monospace',
        position: 'relative',
      }}
    >
      {/* Background image with brightness boost */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'url(https://assets.aclu.org/live/uploads/2024/03/gavel-data-privacy-blog.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(1.4)', zIndex: 0 }} />
      {/* Overlay */}
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.48)', zIndex: 1 }} />
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="text-3xl mb-2">⚖️</div>
        <div className="text-2xl font-black tracking-widest uppercase" style={{ color: '#ffffff' }}>
          Game Bird
        </div>
        <div className="text-xs tracking-widest mt-1" style={{ color: '#ffffff' }}>
          JUDGE PANEL
        </div>
        <div className="text-xs mt-3 max-w-xs leading-relaxed text-center" style={{ color: 'rgba(255,255,255,0.65)' }}>
          You've been selected as the official judge for this match. Review the players below and declare the winner — your decision is final and will release the coins immediately.
        </div>
      </div>

      {pageState === 'loading' && (
        <div className="text-sm tracking-widest animate-pulse" style={{ color: 'rgba(255,255,255,0.6)' }}>
          LOADING...
        </div>
      )}

      {pageState === 'error' && (
        <div
          className="w-full max-w-sm p-6 text-center flex flex-col gap-3"
          style={{ border: '1px solid rgba(255,0,64,0.4)', background: 'rgba(255,0,64,0.05)' }}
        >
          <div className="text-lg font-black" style={{ color: '#ff0040' }}>⚠ ERROR</div>
          <div className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{error}</div>
        </div>
      )}

      {(pageState === 'ready' || pageState === 'confirming') && challenge && (
        <div className="w-full max-w-sm flex flex-col gap-5">
          {/* Pot */}
          <div
            className="p-5 text-center flex flex-col gap-1"
            style={{ border: '1px solid rgba(0,255,65,0.6)', background: 'rgba(4,10,20,0.92)' }}
          >
            <div className="text-xs tracking-widest" style={{ color: '#ffffff' }}>ESCROW POT</div>
            <div className="text-4xl font-black" style={{ color: '#00ff41', textShadow: '0 0 20px rgba(0,255,65,0.4)' }}>
              {challenge.amount * 2}
            </div>
            <div className="text-xs tracking-widest" style={{ color: '#ffffff' }}>SWEEP COINS</div>
          </div>

          {/* VS */}
          <div className="text-center text-xs tracking-widest" style={{ color: '#ffffff' }}>
            SELECT THE WINNER
          </div>

          <div className="flex flex-col gap-3">
            {[
              { id: challenge.creatorId, name: challenge.myPlayer || challenge.creatorName, color: '#00e5ff' },
              { id: challenge.opponentId, name: challenge.theirPlayer || challenge.opponentName, color: '#ff4444' },
            ].map(player => (
              <button
                key={player.id}
                disabled={pageState === 'confirming'}
                onClick={() => setConfirming({ id: player.id, name: player.name })}
                style={{
                  padding: '20px 16px',
                  border: `2px solid ${confirming?.id === player.id ? player.color : 'rgba(255,255,255,0.3)'}`,
                  background: confirming?.id === player.id ? `${player.color}30` : 'rgba(4,10,20,0.92)',
                  color: player.color,
                  fontSize: '1.1rem',
                  fontWeight: 900,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  cursor: pageState === 'confirming' ? 'not-allowed' : 'pointer',
                  width: '100%',
                  fontFamily: 'monospace',
                  transition: 'all 0.15s',
                }}
              >
                {player.name}
              </button>
            ))}
          </div>

          {/* Confirm step */}
          {confirming && (
            <div
              className="flex flex-col gap-3 p-4 mt-1"
              style={{ border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(4,10,20,0.92)' }}
            >
              <div className="text-sm text-center" style={{ color: '#ffffff' }}>
                Confirm <span style={{ color: '#ffd700', fontWeight: 700 }}>{confirming.name}</span> as the winner?
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirming(null)}
                  style={{
                    flex: 1, padding: '10px', border: '1px solid rgba(255,255,255,0.5)',
                    background: 'rgba(4,10,20,0.92)', color: '#ffffff',
                    fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.1em',
                    cursor: 'pointer', fontSize: '0.75rem',
                  }}
                >
                  BACK
                </button>
                <button
                  onClick={() => decide(confirming.id, confirming.name)}
                  style={{
                    flex: 2, padding: '10px', border: '1px solid #ffd700',
                    background: 'rgba(255,215,0,0.2)', color: '#ffd700',
                    fontFamily: 'monospace', fontWeight: 900, letterSpacing: '0.15em',
                    cursor: 'pointer', fontSize: '0.85rem',
                  }}
                >
                  YES
                </button>
              </div>
            </div>
          )}

          <div className="text-xs text-center" style={{ color: '#ffffff' }}>
            This decision is final and cannot be undone.
          </div>
        </div>
      )}

      {pageState === 'done' && challenge && winner && (
        <div className="w-full max-w-sm flex flex-col gap-5 text-center">
          <div className="text-5xl">🏆</div>
          <div
            className="p-6 flex flex-col gap-2"
            style={{ border: '1px solid rgba(0,255,65,0.6)', background: 'rgba(4,10,20,0.92)' }}
          >
            <div className="text-xs tracking-widest" style={{ color: '#ffffff' }}>WINNER</div>
            <div className="text-2xl font-black tracking-widest uppercase" style={{ color: '#00ff41', textShadow: '0 0 12px rgba(0,255,65,0.5)' }}>
              {winner.name}
            </div>
            <div className="text-sm mt-1" style={{ color: '#ffffff' }}>
              {challenge.amount * 2} coins have been awarded
            </div>
          </div>
          <div className="text-xs" style={{ color: '#ffffff' }}>
            Result recorded. You may close this tab.
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
