import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { useUser } from '@/contexts/UserContext';
import { useGame } from '@/contexts/GameContext';
import { Challenge } from '@/types';

const SERVER_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3001'
  : 'https://gamebird-app-production.up.railway.app';

function CopyButton({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex-shrink-0 px-3 py-1.5 text-xs font-black mono tracking-widest"
      style={{
        border: `1px solid ${copied ? 'var(--green)' : 'var(--cyan)'}`,
        color: copied ? 'var(--green)' : 'var(--cyan)',
        background: copied ? 'rgba(0,255,65,0.08)' : 'rgba(0,229,255,0.08)',
        cursor: 'pointer', whiteSpace: 'nowrap',
      }}
    >
      {copied ? '✓ COPIED' : 'COPY LINK'}
    </button>
  );
}

function statusColor(s: string) {
  if (s === 'accepted') return 'var(--gold)';
  if (s === 'judged') return 'var(--green)';
  if (s === 'cancelled') return 'var(--red)';
  return 'var(--cyan)';
}

export default function Postbox() {
  const { currentUser, users, challenges, createChallenge, acceptChallenge, cancelChallenge } = useUser();
  const { isAdmin } = useGame();
  const navigate = useNavigate();

  const [chOpponent, setChOpponent] = useState('');
  const [chMyPlayer, setChMyPlayer] = useState('');
  const [chTheirPlayer, setChTheirPlayer] = useState('');
  const [chAmt, setChAmt] = useState('');
  const [chPhone, setChPhone] = useState('');
  const [chMsg, setChMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [chBusy, setChBusy] = useState(false);
  const [generatingLink, setGeneratingLink] = useState<string | null>(null);
  const [localLinks, setLocalLinks] = useState<Record<string, string>>({});

  if (!currentUser && !isAdmin) {
    return (
      <div className="flex flex-col" style={{ minHeight: '100dvh' }}>
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-sm mono tracking-widest" style={{ color: 'var(--text)' }}>SELECT A PLAYER TO VIEW POSTBOX</div>
        </div>
      </div>
    );
  }

  const uid = currentUser?.id ?? '';
  const myChallenges = challenges.filter(c => c.creatorId === uid || c.opponentId === uid);
  const incoming = myChallenges.filter(c => c.opponentId === uid && c.status === 'pending');
  const outgoing = myChallenges.filter(c => c.creatorId === uid && c.status === 'pending');
  const active = myChallenges.filter(c => c.status === 'accepted');
  const history = myChallenges.filter(c => c.status === 'judged' || c.status === 'cancelled');
  const judged = myChallenges.filter(c => c.status === 'judged');
  const chWins = judged.filter(c => c.winnerId === uid).length;
  const chLosses = judged.filter(c => c.winnerId && c.winnerId !== uid).length;
  const chTotal = chWins + chLosses;
  const chWinPct = chTotal > 0 ? Math.round((chWins / chTotal) * 100) : null;

  const sendChallenge = async () => {
    setChBusy(true); setChMsg(null);
    const result = await createChallenge(chOpponent, parseInt(chAmt), chPhone, chMyPlayer, chTheirPlayer);
    setChBusy(false);
    if (result.success) {
      setChMsg({ text: `✓ Challenge sent to ${chOpponent}! Waiting for them to accept.`, ok: true });
      setChOpponent(''); setChAmt(''); setChPhone(''); setChMyPlayer(''); setChTheirPlayer('');
    } else {
      setChMsg({ text: result.error ?? 'Failed.', ok: false });
    }
  };

  return (
    <div className="flex flex-col" style={{ minHeight: '100dvh', position: 'relative' }}>
      <div style={{ position: 'fixed', inset: 0, background: '#04040f', zIndex: 0 }} />
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
        <Header />

        <main className="flex-1 w-full max-w-2xl mx-auto px-3 py-6 flex flex-col gap-6">

          {/* Header */}
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black uppercase tracking-widest" style={{ color: 'var(--cyan)', textShadow: '0 0 8px rgba(0,229,255,0.15)' }}>
              POSTBOX
            </h1>
            <div className="flex-1 border-t border-[var(--border)]" />
            {incoming.length > 0 && (
              <span className="mono text-xs px-2 py-0.5 font-black" style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid var(--gold)', color: 'var(--gold)' }}>
                {incoming.length} INCOMING
              </span>
            )}
          </div>

          {/* How it works */}
          <div className="hud-panel overflow-hidden">
            <div className="px-4 py-2 border-b border-[var(--border)]" style={{ background: 'rgba(0,229,255,0.04)' }}>
              <span className="text-xs mono tracking-widest" style={{ color: 'var(--cyan)' }}>HOW IT WORKS</span>
            </div>
            <div className="flex flex-col divide-y divide-[var(--border)]">
              {[
                { step: '01', label: 'SEND A CHALLENGE', desc: 'Enter your opponent\'s username, the two players in the match, and how many coins each of you are putting up.' },
                { step: '02', label: 'OPPONENT ACCEPTS', desc: 'Your opponent sees the challenge in their Postbox. When they accept, both bets lock into escrow automatically.' },
                { step: '03', label: 'SHARE THE JUDGE LINK', desc: 'Once accepted, a unique judge link is generated. Copy it and send it to your agreed-upon judge — anyone with the link can access it.' },
                { step: '04', label: 'JUDGE DECIDES', desc: 'The judge opens the link, picks the winner, and confirms. Coins are released to the winner instantly — no manual payout needed.' },
              ].map(({ step, label, desc }) => (
                <div key={step} className="flex items-start gap-4 px-4 py-3">
                  <span className="mono font-black text-lg flex-shrink-0" style={{ color: 'rgba(0,229,255,0.3)' }}>{step}</span>
                  <div className="flex flex-col gap-0.5">
                    <span className="mono text-xs font-black tracking-widest" style={{ color: 'var(--cyan)' }}>{label}</span>
                    <span className="text-xs leading-relaxed" style={{ color: 'var(--text)' }}>{desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* W/L Record */}
          <div className="hud-panel overflow-hidden">
            <div className="px-4 py-2 border-b border-[var(--border)]" style={{ background: 'rgba(0,229,255,0.04)' }}>
              <span className="text-xs mono tracking-widest" style={{ color: 'var(--cyan)' }}>CHALLENGE RECORD</span>
            </div>
            <div className="flex items-center divide-x divide-[var(--border)]">
              {[
                { label: 'WINS', value: chWins, color: 'var(--green)' },
                { label: 'LOSSES', value: chLosses, color: 'var(--red)' },
                { label: 'PLAYED', value: chTotal, color: 'var(--text)' },
                { label: 'WIN RATE', value: chWinPct !== null ? `${chWinPct}%` : '—', color: chWinPct !== null && chWinPct >= 50 ? 'var(--green)' : chWinPct !== null ? 'var(--red)' : 'var(--text)' },
              ].map(item => (
                <div key={item.label} className="flex flex-col items-center px-4 py-4 flex-1 gap-1">
                  <span className="mono text-2xl font-black" style={{ color: item.color }}>{item.value}</span>
                  <span className="mono tracking-widest" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.6rem' }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Incoming */}
          {incoming.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs mono tracking-widest font-black" style={{ color: 'var(--gold)' }}>INCOMING CHALLENGES</span>
                <div className="flex-1 border-t border-[var(--border)]" />
              </div>
              {incoming.map(c => (
                <div key={c.id} className="hud-panel p-4 flex flex-col gap-3" style={{ borderColor: 'rgba(255,215,0,0.3)', background: 'rgba(255,215,0,0.03)' }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-sm font-black" style={{ color: 'var(--gold)' }}>{c.creatorName} is challenging you</span>
                      {(c.myPlayer || c.theirPlayer) && (
                        <div className="flex items-center gap-2 text-sm mono font-black">
                          <span style={{ color: 'var(--cyan)' }}>{c.myPlayer}</span>
                          <span style={{ color: 'var(--text)' }}>vs</span>
                          <span style={{ color: 'var(--red)' }}>{c.theirPlayer}</span>
                        </div>
                      )}
                      <span className="text-xs" style={{ color: 'var(--text)' }}>
                        {c.myPlayer && <>They're betting on <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>{c.myPlayer}</span> · </>}
                        <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{c.amount} coins</span> each · pot: <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{c.amount * 2}</span>
                      </span>
                      <span className="mono text-xs" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem' }}>
                        {new Date(c.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        className="btn btn-ghost px-3 py-1.5 text-xs"
                        onClick={async () => { setChBusy(true); await cancelChallenge(c.id); setChBusy(false); }}
                      >DECLINE</button>
                      <button
                        className="btn btn-gold px-3 py-1.5 text-xs font-black"
                        disabled={chBusy}
                        onClick={async () => {
                          setChBusy(true);
                          const result = await acceptChallenge(c.id);
                          setChBusy(false);
                          if (!result.success) setChMsg({ text: result.error ?? 'Failed.', ok: false });
                        }}
                      >ACCEPT</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Awaiting judge */}
          {active.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs mono tracking-widest font-black" style={{ color: 'var(--gold)' }}>AWAITING JUDGE</span>
                <div className="flex-1 border-t border-[var(--border)]" />
              </div>
              {active.map(c => (
                <div key={c.id} className="hud-panel p-4 flex flex-col gap-3" style={{ borderColor: 'rgba(255,215,0,0.2)' }}>
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-sm mono font-black">
                        <span style={{ color: 'var(--cyan)' }}>{c.myPlayer}</span>
                        <span style={{ color: 'var(--text)' }}>vs</span>
                        <span style={{ color: 'var(--red)' }}>{c.theirPlayer}</span>
                      </div>
                      <span className="text-xs" style={{ color: 'var(--text)' }}>
                        {c.creatorName} vs {c.opponentName} · <span style={{ color: 'var(--gold)', fontWeight: 700 }}>pot: {c.amount * 2} coins</span>
                      </span>
                      <span className="mono text-xs" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem' }}>
                        Accepted {c.acceptedAt ? new Date(c.acceptedAt).toLocaleString() : ''}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className="mono text-xs animate-pulse" style={{ color: 'var(--gold)' }}>⏳ PENDING</span>
                      <button className="btn btn-ghost px-3 py-1 text-xs" onClick={() => cancelChallenge(c.id)}>CANCEL</button>
                    </div>
                  </div>
                  {(() => {
                    const link = localLinks[c.id] || c.judgeLink;
                    if (link) return (
                      <div className="flex flex-col gap-2">
                        <span className="text-xs mono tracking-widest" style={{ color: 'var(--text)' }}>JUDGE LINK — share this with the judge</span>
                        <div className="flex items-center gap-2 p-3" style={{ background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.2)' }}>
                          <span className="text-xs break-all flex-1 mono" style={{ color: 'var(--cyan)' }}>{link}</span>
                          <CopyButton link={link} />
                        </div>
                      </div>
                    );
                    return (
                      <button
                        className="btn btn-cyan w-full py-2 text-xs font-black tracking-widest"
                        disabled={generatingLink === c.id}
                        onClick={async () => {
                          setGeneratingLink(c.id);
                          try {
                            const r = await fetch(`${SERVER_URL}/api/challenges/${c.id}/judgelink`);
                            const data = await r.json();
                            if (data.judgeLink) setLocalLinks(prev => ({ ...prev, [c.id]: data.judgeLink }));
                          } finally {
                            setGeneratingLink(null);
                          }
                        }}
                      >
                        {generatingLink === c.id ? 'GENERATING...' : '⚡ GENERATE JUDGE LINK'}
                      </button>
                    );
                  })()}
                </div>
              ))}
            </div>
          )}

          {/* Outgoing pending */}
          {outgoing.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs mono tracking-widest font-black" style={{ color: 'var(--text)' }}>SENT — AWAITING ACCEPT</span>
                <div className="flex-1 border-t border-[var(--border)]" />
              </div>
              {outgoing.map(c => (
                <div key={c.id} className="hud-panel p-4 flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-black" style={{ color: 'var(--cyan)' }}>Challenge to {c.opponentName}</span>
                    {(c.myPlayer || c.theirPlayer) && (
                      <div className="flex items-center gap-2 text-sm mono font-black">
                        <span style={{ color: 'var(--cyan)' }}>{c.myPlayer}</span>
                        <span style={{ color: 'var(--text)' }}>vs</span>
                        <span style={{ color: 'var(--red)' }}>{c.theirPlayer}</span>
                      </div>
                    )}
                    <span className="text-xs" style={{ color: 'var(--text)' }}>
                      You're on <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>{c.myPlayer}</span> · <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{c.amount} coins</span> each
                    </span>
                    <span className="mono text-xs" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem' }}>
                      Sent {new Date(c.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <button className="btn btn-ghost px-3 py-1.5 text-xs flex-shrink-0" onClick={() => cancelChallenge(c.id)}>CANCEL</button>
                </div>
              ))}
            </div>
          )}

          {/* New Challenge */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs mono tracking-widest font-black" style={{ color: 'var(--cyan)' }}>NEW CHALLENGE</span>
              <div className="flex-1 border-t border-[var(--border)]" />
            </div>
            <div className="hud-panel p-4 flex flex-col gap-3">
              <input
                className="bg-transparent border px-3 py-2.5 mono text-sm outline-none w-full"
                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                placeholder="Opponent username..."
                value={chOpponent}
                onChange={e => { setChOpponent(e.target.value); setChMsg(null); }}
                list="pb-users"
              />
              <datalist id="pb-users">
                {users.filter(u => u.id !== uid).map(u => <option key={u.id} value={u.name} />)}
              </datalist>
              <div className="flex flex-col gap-1">
                <span className="text-xs mono tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>PLAYERS IN ACTION</span>
                <div className="flex gap-3">
                  <input
                    className="flex-1 bg-transparent border px-3 py-2.5 mono text-sm outline-none"
                    style={{ borderColor: 'var(--cyan)', color: 'var(--text)' }}
                    placeholder="My player..."
                    value={chMyPlayer}
                    onChange={e => { setChMyPlayer(e.target.value); setChMsg(null); }}
                  />
                  <input
                    className="flex-1 bg-transparent border px-3 py-2.5 mono text-sm outline-none"
                    style={{ borderColor: 'var(--red)', color: 'var(--text)' }}
                    placeholder="Their player..."
                    value={chTheirPlayer}
                    onChange={e => { setChTheirPlayer(e.target.value); setChMsg(null); }}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <input
                  type="number" min={1}
                  className="flex-1 bg-transparent border px-3 py-2.5 mono text-sm outline-none"
                  style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                  placeholder="Amount each..."
                  value={chAmt}
                  onChange={e => { setChAmt(e.target.value); setChMsg(null); }}
                />
                <input
                  type="tel"
                  className="flex-1 bg-transparent border px-3 py-2.5 mono text-sm outline-none"
                  style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                  placeholder="Judge phone # (optional)"
                  value={chPhone}
                  onChange={e => { setChPhone(e.target.value); setChMsg(null); }}
                />
              </div>
              <button
                className="btn btn-cyan w-full py-3 text-sm font-black tracking-widest"
                disabled={chBusy}
                onClick={sendChallenge}
              >
                {chBusy ? 'SENDING...' : 'SEND CHALLENGE'}
              </button>
              {chMsg && (
                <div className="mono text-xs text-center py-1" style={{ color: chMsg.ok ? 'var(--green)' : 'var(--red)' }}>
                  {chMsg.text}
                </div>
              )}
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs mono tracking-widest font-black" style={{ color: 'var(--text)' }}>HISTORY</span>
                <div className="flex-1 border-t border-[var(--border)]" />
              </div>
              <div className="hud-panel overflow-hidden divide-y divide-[var(--border)]">
                {history.map(c => (
                  <div key={c.id} className="flex items-start justify-between p-4 gap-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-sm mono font-black">
                        <span style={{ color: c.winnerName === c.myPlayer ? 'var(--green)' : 'var(--text)' }}>{c.myPlayer}</span>
                        <span style={{ color: 'var(--text)' }}>vs</span>
                        <span style={{ color: c.winnerName === c.theirPlayer ? 'var(--green)' : 'var(--text)' }}>{c.theirPlayer}</span>
                      </div>
                      <span className="text-xs" style={{ color: 'var(--text)' }}>{c.creatorName} vs {c.opponentName} · {c.amount} coins each</span>
                      {c.winnerName && <span className="text-xs font-black" style={{ color: 'var(--green)' }}>🏆 {c.winnerName} won</span>}
                      <span className="mono text-xs" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem' }}>
                        {new Date(c.judgedAt ?? c.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <span className="mono text-xs font-black flex-shrink-0" style={{ color: statusColor(c.status) }}>
                      {c.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
