import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { useGame } from '@/contexts/GameContext';
import { TransactionType, User } from '@/types';

const QUICK_AMOUNTS = [10, 20, 50, 100, 200, 500];

function GetCoinsPanel({ currentUser, addCredits }: { currentUser: User; addCredits: (id: string, amt: number, type?: TransactionType, desc?: string) => void }) {
  const [amount, setAmount] = useState(100);
  const [processing, setProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = () => {
    if (!amount || amount < 1) return;
    setProcessing(true);
    setTimeout(() => {
      addCredits(currentUser.id, amount, 'admin_add', `Reload — ${amount} coins added`);
      setSuccessMsg(`✓ ${amount} coins added!`);
      setProcessing(false);
      setAmount(100);
      setTimeout(() => setSuccessMsg(''), 3000);
    }, 1000);
  };

  return (
    <div className="p-4 flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2">
        {QUICK_AMOUNTS.map(a => (
          <button
            key={a}
            type="button"
            className="btn py-2 text-sm font-black tracking-widest"
            style={{
              border: `1px solid ${amount === a ? 'var(--gold)' : 'var(--border)'}`,
              color: amount === a ? 'var(--gold)' : 'var(--text)',
              background: amount === a ? 'rgba(255,215,0,0.08)' : 'transparent',
            }}
            onClick={() => setAmount(a)}
          >
            ◈ {a}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="number"
          min="1"
          value={amount}
          onChange={e => setAmount(Number(e.target.value))}
          className="flex-1 bg-transparent border border-[var(--border)] px-3 py-2 text-sm mono outline-none focus:border-[var(--gold)]"
          style={{ color: 'var(--text)' }}
          placeholder="Custom amount..."
        />
        <button
          className="btn btn-gold px-5 py-2 text-sm font-black tracking-widest"
          disabled={!amount || amount < 1 || processing}
          onClick={handleSubmit}
          style={{ opacity: (!amount || processing) ? 0.5 : 1 }}
        >
          {processing ? '⟳' : '◈ RELOAD'}
        </button>
      </div>
      <div className="flex items-center justify-between text-xs mono px-1">
        <span style={{ color: 'var(--text)' }}>Current Balance</span>
        <span className="font-black" style={{ color: 'var(--green)' }}>{currentUser.credits.toLocaleString()} coins</span>
      </div>
      {successMsg && <div className="text-sm mono font-black text-center" style={{ color: 'var(--green)' }}>{successMsg}</div>}
    </div>
  );
}

function CoinsInAction() {
  const { users } = useUser();
  const { game } = useGame();

  const activeUsers = users.filter(u => !u.isAdmin && u.online);
  const totalCoins = activeUsers.reduce((s, u) => s + u.credits, 0);
  const inQueue = [
    ...game.teamAQueue, ...game.teamBQueue,
    ...game.nextTeamAQueue, ...game.nextTeamBQueue,
  ].reduce((s, b) => s + b.amount, 0);

  return (
    <div
      className="hud-panel flex items-center justify-between px-4 py-2"
      style={{ borderColor: 'rgba(255,215,0,0.2)' }}
    >
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--green)', boxShadow: '0 0 6px var(--green)' }} />
        <span className="text-xs mono text-[var(--text)] tracking-widest">COINS IN ACTION</span>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center">
          <span className="mono text-lg font-black" style={{ color: 'var(--green)', textShadow: '0 0 3px rgba(0,255,65,0.5)' }}>
            {totalCoins.toLocaleString()}
          </span>
          <span className="text-xs text-[var(--text)] mono tracking-widest" style={{ fontSize: '0.6rem' }}>ALL USERS</span>
        </div>
        <div className="w-px h-6" style={{ background: 'var(--border)' }} />
        <div className="flex flex-col items-center">
          <span className="mono text-lg font-black" style={{ color: inQueue > 0 ? 'var(--gold)' : 'var(--text)', textShadow: inQueue > 0 ? '0 0 3px rgba(255,215,0,0.5)' : 'none' }}>
            {inQueue.toLocaleString()}
          </span>
          <span className="text-xs text-[var(--text)] mono tracking-widest" style={{ fontSize: '0.6rem' }}>IN QUEUES</span>
        </div>
        <div className="w-px h-6" style={{ background: 'var(--border)' }} />
        <div className="flex flex-col items-center">
          <span className="mono text-lg font-black" style={{ color: 'var(--cyan)', textShadow: '0 0 3px rgba(0,229,255,0.5)' }}>
            {activeUsers.length}
          </span>
          <span className="text-xs text-[var(--text)] mono tracking-widest" style={{ fontSize: '0.6rem' }}>PLAYERS</span>
        </div>
      </div>
    </div>
  );
}

export { CoinsInAction };

type WalletTab = 'receipts' | 'bets' | 'transactions' | 'membership' | 'getcoins';

const typeColor: Record<string, string> = {
  bet_placed: 'var(--cyan)', bet_refund: 'var(--gold)', bet_win: 'var(--green)',
  bet_loss: 'var(--red)', tip_given: 'var(--red)', tip_received: 'var(--green)',
  admin_add: 'var(--green)', admin_deduct: 'var(--red)', cashout: 'var(--gold)',
  membership_activate: 'var(--cyan)', membership_renew: 'var(--cyan)', membership_cancel: 'var(--text)',
};
const typeLabel: Record<string, string> = {
  bet_placed: 'BET', bet_refund: 'REFUND', bet_win: 'WIN', bet_loss: 'LOSS',
  tip_given: 'TIP OUT', tip_received: 'TIP IN', admin_add: 'RELOAD', admin_deduct: 'DEDUCT',
  cashout: 'CASHOUT', membership_activate: 'MEMBER', membership_renew: 'RENEWED', membership_cancel: 'CANCELLED',
};
const txSign: Record<string, string> = {
  bet_placed: '−', bet_loss: '−', tip_given: '−', admin_deduct: '−', cashout: '−',
  bet_refund: '+', bet_win: '+', tip_received: '+', admin_add: '+', membership_activate: '−', membership_renew: '−',
};

export default function WalletWidget() {
  const { currentUser, addCredits, updateMembership, setCurrentUser } = useUser();
  const { game, gameHistory } = useGame();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [walletTab, setWalletTab] = useState<WalletTab>('receipts');
  const [cashoutAmt, setCashoutAmt] = useState('');
  const [cashoutMsg, setCashoutMsg] = useState('');
  const [confirmCancel, setConfirmCancel] = useState(false);

  if (!currentUser) {
    return (
      <div className="hud-panel px-4 py-2 flex items-center gap-2">
        <span className="text-xs mono text-[var(--text)] tracking-widest">NO PLAYER SELECTED</span>
      </div>
    );
  }

  const allQueued = [...game.teamAQueue, ...game.teamBQueue, ...game.nextTeamAQueue, ...game.nextTeamBQueue];
  const myBets = allQueued.filter(b => b.userId === currentUser.id);
  const matchedTotal = myBets.filter(b => b.booked).reduce((s, b) => s + b.amount, 0);
  const unmatchedTotal = myBets.filter(b => !b.booked).reduce((s, b) => s + b.amount, 0);
  const pendingTotal = matchedTotal + unmatchedTotal;
  const total = currentUser.credits + pendingTotal;

  const fallbackA = game.teamAName;
  const fallbackB = game.teamBName;
  const myHistoryBets = gameHistory.flatMap(r => [...r.bets.teamA, ...r.bets.teamB]).filter(b => b.userId === currentUser.id && b.booked);
  const wins = myHistoryBets.filter(b => b.won).length;
  const totalBets = myHistoryBets.length;
  const winPct = totalBets > 0 ? Math.round((wins / totalBets) * 100) : null;

  const liveMatched = [...game.teamAQueue, ...game.teamBQueue]
    .filter(b => b.booked && b.userId === currentUser.id)
    .map(b => ({ type: 'live' as const, id: b.id, gameNumber: game.currentGameNumber, teamSide: b.teamSide, amount: b.amount, nameA: game.teamAName, nameB: game.teamBName }));

  const settled = gameHistory.flatMap(record => {
    const nameA = (!record.teamAName || record.teamAName === 'Player A') ? fallbackA : record.teamAName;
    const nameB = (!record.teamBName || record.teamBName === 'Player B') ? fallbackB : record.teamBName;
    return [...record.bets.teamA.map(b => ({ ...b, teamSide: 'A' as const, nameA, nameB, record })),
            ...record.bets.teamB.map(b => ({ ...b, teamSide: 'B' as const, nameA, nameB, record }))].filter(b => b.userId === currentUser.id && b.booked);
  });

  const receiptCount = liveMatched.length + settled.length;
  const tipsGiven = currentUser.tipsGiven ?? 0;
  const tipsReceived = currentUser.tipsReceived ?? 0;

  // Bet history
  const mySettledBets = gameHistory.flatMap(r => [
    ...r.bets.teamA.map(b => ({ ...b, record: r, side: 'A' as const })),
    ...r.bets.teamB.map(b => ({ ...b, record: r, side: 'B' as const })),
  ]).filter(b => b.userId === currentUser.id && b.booked);

  // Transactions
  const txList = (currentUser.transactions ?? []);

  // Membership
  const mem = currentUser.membership;
  const isPremium = mem?.tier === 'premium' && !mem.cancelledAt;
  const isCancelled = mem?.tier === 'premium' && !!mem.cancelledAt;

  const handleCashout = () => {
    const amt = parseInt(cashoutAmt);
    if (!amt || amt <= 0) { setCashoutMsg('Enter a valid amount.'); return; }
    if (amt > currentUser.credits) { setCashoutMsg('Insufficient coins.'); return; }
    addCredits(currentUser.id, -amt, 'cashout', `Cashout of ${amt} coins`);
    setCashoutMsg(`✓ ${amt} coins cashed out.`);
    setCashoutAmt('');
    setTimeout(() => setCashoutMsg(''), 3000);
  };

  const handleCancelMembership = () => {
    updateMembership(currentUser.id, { ...mem!, cancelledAt: Date.now() });
    setConfirmCancel(false);
  };

  const tabs: { id: WalletTab; label: string; count?: number }[] = [
    { id: 'receipts', label: 'RECEIPTS', count: receiptCount },
    { id: 'bets', label: 'BETS', count: mySettledBets.length },
    { id: 'transactions', label: 'TXN', count: txList.length },
    { id: 'membership', label: 'MEMBERSHIP' },
  ];

  return (
    <div className="hud-panel overflow-hidden w-full" style={{ borderColor: 'rgba(255,215,0,0.3)' }}>
      {/* Stats row */}
      <div className="flex items-center gap-0">
        <button
          className="flex items-center gap-2 px-4 py-2.5 flex-shrink-0 hover:bg-black transition-colors"
          style={{
            borderRight: '1px solid var(--border)',
            backgroundImage: 'url(https://eidk95seyu2.exactdn.com/en/blog/wp-content/uploads/2023/11/apr29-casino-how-to-manage-your-bankroll-for-baccarat-success-header-min.jpg?strip=all)',
            backgroundSize: '100%',
            backgroundPosition: 'center 70%',
          }}
          onClick={() => setOpen(v => !v)}
        >
          <span className="text-base" style={{ color: '#000' }}>◈</span>
          <div className="flex flex-col leading-tight items-start">
            <span className="text-sm mono font-black uppercase tracking-widest" style={{ color: '#000', fontWeight: 900 }}>
              {currentUser.name.toUpperCase()}'S WALLET
            </span>
            <span className="tracking-wider flex items-center gap-1 font-black" style={{ fontSize: '0.7rem', color: '#000', fontWeight: 900 }}>
              {open ? 'CLOSE' : 'EXPAND'}
              <span style={{ color: '#000' }}>{open ? '▲' : '▼'}</span>
            </span>
          </div>
          <Link
            to="/settings"
            onClick={e => e.stopPropagation()}
            className="ml-2 flex items-center justify-center"
            style={{ color: 'var(--cyan)', fontSize: '1.2rem', textDecoration: 'none', opacity: 0.85 }}
            title="Account Settings"
          >
            ⚙
          </Link>
        </button>

        <div className="flex flex-col items-center px-4 py-2.5 flex-1" style={{ borderRight: '1px solid var(--border)' }}>
          <span className="mono text-xl font-black" style={{ color: 'var(--green)', textShadow: '0 0 3px rgba(0,255,65,0.5)' }}>{currentUser.credits}</span>
          <span className="text-xs text-[var(--text)] uppercase tracking-widest" style={{ fontSize: '0.6rem' }}>AVAILABLE</span>
        </div>
        <div className="flex flex-col items-center px-4 py-2.5 flex-1" style={{ borderRight: '1px solid var(--border)' }}>
          <span className="mono text-xl font-black" style={{ color: unmatchedTotal > 0 ? 'var(--cyan)' : 'var(--text)' }}>{unmatchedTotal}</span>
          <span className="text-xs text-[var(--text)] uppercase tracking-widest" style={{ fontSize: '0.6rem' }}>PENDING</span>
        </div>
        <div className="flex flex-col items-center px-4 py-2.5 flex-1" style={{ borderRight: '1px solid var(--border)' }}>
          <span className="mono text-xl font-black" style={{ color: matchedTotal > 0 ? 'var(--green)' : 'var(--text)' }}>{matchedTotal}</span>
          <span className="text-xs text-[var(--text)] uppercase tracking-widest" style={{ fontSize: '0.6rem' }}>MATCHED</span>
        </div>
        <div className="flex flex-col items-center px-4 py-2.5 flex-1" style={{ borderRight: '1px solid var(--border)' }}>
          <span className="mono text-xl font-black" style={{ color: 'var(--gold)', textShadow: '0 0 3px rgba(255,215,0,0.4)' }}>{total}</span>
          <span className="text-xs text-[var(--text)] uppercase tracking-widest" style={{ fontSize: '0.6rem' }}>TOTAL</span>
        </div>
        <div className="flex flex-col items-center px-4 py-2.5 flex-1">
          <span className="mono text-xl font-black" style={{ color: winPct === null ? 'var(--text)' : winPct >= 50 ? 'var(--green)' : 'var(--red)', textShadow: winPct !== null ? `0 0 8px ${winPct >= 50 ? 'var(--green)' : 'var(--red)'}` : 'none' }}>
            {winPct === null ? '—' : `${winPct}%`}
          </span>
          <span className="text-xs text-[var(--text)] uppercase tracking-widest" style={{ fontSize: '0.6rem' }}>
            WIN {totalBets > 0 ? `${wins}W·${totalBets - wins}L` : 'RATE'}
          </span>
        </div>
      </div>

      {/* Expanded panel */}
      {open && (
        <div className="border-t border-[var(--border)]">
          {/* Tab bar */}
          <div className="flex border-b border-[var(--border)]" style={{ background: 'rgba(0,0,0,0.3)' }}>
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setWalletTab(t.id)}
                className="px-4 py-2 text-xs font-black tracking-widest uppercase transition-colors flex items-center gap-1"
                style={{
                  color: walletTab === t.id ? 'var(--cyan)' : 'var(--text)',
                  borderBottom: walletTab === t.id ? '2px solid var(--cyan)' : '2px solid transparent',
                  background: 'transparent',
                  cursor: 'pointer',
                }}
              >
                {t.label}
                {t.count !== undefined && t.count > 0 && (
                  <span className="mono text-xs" style={{ color: walletTab === t.id ? 'var(--cyan)' : 'var(--text)' }}>({t.count})</span>
                )}
              </button>
            ))}
            <Link
              to="/membership"
              onClick={() => setOpen(false)}
              className="px-4 py-2 text-xs font-black tracking-widest uppercase flex items-center"
              style={{ color: 'var(--gold)', textDecoration: 'none', whiteSpace: 'nowrap' }}
            >
              + COINS
            </Link>
            <div className="flex-1" />
            <button
              className="px-4 py-2 text-xs mono tracking-widest"
              style={{ color: 'var(--text)', cursor: 'pointer' }}
              onClick={() => { setCurrentUser(null); navigate('/'); }}
            >
              LOG OUT
            </button>
          </div>

          {/* ── RECEIPTS ── */}
          {walletTab === 'receipts' && (
            <div className="flex flex-col divide-y divide-[var(--border)] max-h-72 overflow-y-auto">
              <div className="flex items-center justify-between px-4 py-2" style={{ background: 'rgba(255,215,0,0.04)' }}>
                <span className="text-xs mono tracking-widest" style={{ color: 'var(--text)' }}>TIPS GIVEN</span>
                <span className="mono font-black text-sm" style={{ color: tipsGiven > 0 ? 'var(--red)' : 'var(--text)' }}>{tipsGiven > 0 ? `-${tipsGiven}` : '—'}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2" style={{ background: 'rgba(255,215,0,0.04)' }}>
                <span className="text-xs mono tracking-widest" style={{ color: 'var(--text)' }}>TIPS RECEIVED</span>
                <span className="mono font-black text-sm" style={{ color: tipsReceived > 0 ? 'var(--green)' : 'var(--text)' }}>{tipsReceived > 0 ? `+${tipsReceived}` : '—'}</span>
              </div>
              {receiptCount === 0 ? (
                <div className="flex items-center justify-center h-14 text-xs mono text-[var(--text)] tracking-widest">NO RECEIPTS YET</div>
              ) : (
                <>
                  {liveMatched.map(r => {
                    const betColor = r.teamSide === 'A' ? 'var(--cyan)' : 'var(--red)';
                    const teamBetOn = r.teamSide === 'A' ? r.nameA : r.nameB;
                    return (
                      <div key={r.id} className="flex items-center justify-between px-4 py-2 hover:bg-black" style={{ borderLeft: '3px solid var(--gold)' }}>
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0" style={{ background: 'var(--gold)', boxShadow: '0 0 4px var(--gold)' }} />
                            <span className="text-xs mono font-black" style={{ color: betColor }}>GAME #{r.gameNumber} — {teamBetOn.toUpperCase()}</span>
                          </div>
                          <span className="text-xs mono tracking-wider" style={{ color: 'var(--gold)', paddingLeft: 14 }}>LIVE · MATCHED</span>
                        </div>
                        <div className="mono font-black text-sm px-2 py-1" style={{ color: 'var(--gold)', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)' }}>{r.amount}</div>
                      </div>
                    );
                  })}
                  {settled.map((r, i) => {
                    const betColor = r.teamSide === 'A' ? 'var(--cyan)' : 'var(--red)';
                    const teamBetOn = r.teamSide === 'A' ? r.nameA : r.nameB;
                    const winner = r.record.winningTeam === 'A' ? r.nameA : r.nameB;
                    const winnerColor = r.record.winningTeam === 'A' ? 'var(--cyan)' : 'var(--red)';
                    return (
                      <div key={`${r.record.id}-${i}`} className="flex items-center justify-between px-4 py-2 hover:bg-black" style={{ borderLeft: `3px solid ${betColor}` }}>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs mono font-black" style={{ color: betColor }}>GAME #{r.record.gameNumber} — {teamBetOn.toUpperCase()}</span>
                          <span className="text-xs mono text-[var(--text)] tracking-wider">
                            {new Date(r.record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{'  ·  '}<span style={{ color: winnerColor }}>W: {winner}</span>
                          </span>
                        </div>
                        <div className="mono font-black text-sm px-2 py-1" style={{ color: r.won ? 'var(--green)' : 'var(--red)', background: r.won ? 'rgba(0,255,65,0.1)' : 'rgba(255,0,64,0.1)', border: `1px solid ${r.won ? 'rgba(0,255,65,0.3)' : 'rgba(255,0,64,0.3)'}` }}>
                          {r.won ? '+' : '-'}{r.amount}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}

          {/* ── BET HISTORY ── */}
          {walletTab === 'bets' && (
            <div className="max-h-72 overflow-y-auto">
              {mySettledBets.length === 0 ? (
                <div className="flex items-center justify-center h-16 text-xs mono text-[var(--text)] tracking-widest">NO BETS YET</div>
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  <div className="grid grid-cols-5 px-4 py-2" style={{ background: 'rgba(0,229,255,0.04)' }}>
                    {['Game', 'Side', 'Amt', 'Result', 'Date'].map(h => (
                      <div key={h} className="text-xs mono text-[var(--text)] tracking-widest uppercase">{h}</div>
                    ))}
                  </div>
                  {[...mySettledBets].reverse().map((b, i) => {
                    const teamName = b.side === 'A' ? b.record.teamAName : b.record.teamBName;
                    const dateStr = new Date(b.record.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
                    return (
                      <div key={i} className="grid grid-cols-5 px-4 py-2 items-center hover:bg-black">
                        <div className="text-xs mono text-[var(--text)]">#{b.record.gameNumber}</div>
                        <div className="text-xs font-black uppercase tracking-wide" style={{ color: b.side === 'A' ? 'var(--cyan)' : 'var(--red)' }}>{teamName}</div>
                        <div className="text-xs mono" style={{ color: 'var(--text)' }}>{b.amount}</div>
                        <div className="text-xs mono font-black" style={{ color: b.won ? 'var(--green)' : 'var(--red)' }}>{b.won ? `+${b.amount}` : `-${b.amount}`}</div>
                        <div className="text-xs mono text-[var(--text)]">{dateStr}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── TRANSACTIONS ── */}
          {walletTab === 'transactions' && (
            <div className="max-h-72 overflow-y-auto">
              {txList.length === 0 ? (
                <div className="flex items-center justify-center h-16 text-xs mono text-[var(--text)] tracking-widest">NO TRANSACTIONS YET</div>
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  <div className="grid grid-cols-4 px-4 py-2" style={{ background: 'rgba(0,229,255,0.04)' }}>
                    {['Type', 'Description', 'Amount', 'Date'].map(h => (
                      <div key={h} className="text-xs mono text-[var(--text)] tracking-widest uppercase">{h}</div>
                    ))}
                  </div>
                  {txList.map((tx, i) => (
                    <div key={`${tx.id}-${i}`} className="grid grid-cols-4 px-4 py-2 items-center hover:bg-black">
                      <div className="text-xs mono font-black" style={{ color: typeColor[tx.type] ?? 'var(--text)' }}>{typeLabel[tx.type] ?? tx.type}</div>
                      <div className="text-xs" style={{ color: 'var(--text)' }}>{tx.description}</div>
                      <div className="text-xs mono font-black" style={{ color: typeColor[tx.type] ?? 'var(--text)' }}>{txSign[tx.type] ?? ''}{tx.amount}</div>
                      <div className="text-xs mono text-[var(--text)]">
                        {new Date(tx.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                        {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── MEMBERSHIP ── */}
          {walletTab === 'membership' && (
            <div className="p-4 flex flex-col gap-3">
              {/* Status */}
              <div className="flex items-center justify-between px-4 py-3 hud-panel" style={{ border: `1px solid ${isPremium ? 'var(--gold)' : 'var(--border)'}`, background: 'rgba(0,0,0,0.3)' }}>
                <div className="flex items-center gap-3">
                  <span style={{ color: isPremium ? 'var(--gold)' : 'var(--text)', fontSize: '1.5rem' }}>
                    {currentUser.isAdmin ? '⚙' : isPremium ? '★' : '◎'}
                  </span>
                  <div>
                    <div className="font-black uppercase tracking-widest text-sm" style={{ color: isPremium ? 'var(--gold)' : 'var(--text)' }}>
                      {currentUser.isAdmin ? 'Admin Account' : isPremium ? 'Premium Member' : isCancelled ? 'Cancelled' : 'Free Account'}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text)' }}>
                      {currentUser.isAdmin && 'Full platform access'}
                      {isPremium && mem?.renewsAt && `Renews ${new Date(mem.renewsAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}`}
                      {isCancelled && mem?.renewsAt && `Active until ${new Date(mem.renewsAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}`}
                      {!mem && !currentUser.isAdmin && 'Upgrade to place bets'}
                    </div>
                  </div>
                </div>
                {isPremium && <span className="mono text-xs px-2 py-0.5 font-black" style={{ border: '1px solid var(--gold)', color: 'var(--gold)' }}>ACTIVE</span>}
                {isCancelled && <span className="mono text-xs px-2 py-0.5 font-black" style={{ border: '1px solid var(--red)', color: 'var(--red)' }}>CANCELLED</span>}
                {!mem && !currentUser.isAdmin && <span className="mono text-xs px-2 py-0.5 font-black" style={{ border: '1px solid var(--text)', color: 'var(--text)' }}>FREE</span>}
              </div>

              {/* Cashout */}
              <div className="hud-panel px-4 py-3" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,215,0,0.2)' }}>
                <div className="text-xs mono tracking-[0.3em] text-[var(--gold)] uppercase mb-2">Cashout</div>
                <div className="flex gap-2 mb-2">
                  {[50, 100, 200].map(amt => (
                    <button key={amt} className="btn btn-ghost flex-1 py-1 text-xs font-black"
                      onClick={() => setCashoutAmt(String(amt))}
                      style={{ borderColor: cashoutAmt === String(amt) ? 'var(--gold)' : undefined, color: cashoutAmt === String(amt) ? 'var(--gold)' : undefined }}>
                      {amt}
                    </button>
                  ))}
                  <button className="btn btn-ghost px-3 text-xs font-black" onClick={() => setCashoutAmt(String(currentUser.credits))}>MAX</button>
                </div>
                <div className="flex gap-2">
                  <input type="number" className="flex-1 bg-transparent border border-[var(--border)] px-2 py-1.5 text-xs mono outline-none placeholder:text-[var(--text)] focus:border-[var(--gold)]"
                    style={{ color: 'var(--text)' }} placeholder="Custom amount..." value={cashoutAmt} onChange={e => setCashoutAmt(e.target.value)} />
                  <button className="btn btn-gold px-4 py-1.5 text-xs font-black tracking-widest" onClick={handleCashout}>CASHOUT</button>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs mono">
                  <span style={{ color: 'var(--text)' }}>Available Balance</span>
                  <span className="font-black" style={{ color: 'var(--green)' }}>{currentUser.credits.toLocaleString()} coins</span>
                </div>
                {cashoutMsg && <div className="mt-1.5 text-xs mono" style={{ color: cashoutMsg.startsWith('✓') ? 'var(--green)' : 'var(--red)' }}>{cashoutMsg}</div>}
              </div>

              {/* Upgrade / Cancel */}
              {!isPremium && !currentUser.isAdmin && (
                <button className="btn btn-gold py-2.5 text-sm font-black tracking-widest w-full" onClick={() => { setOpen(false); navigate('/membership'); }}>
                  ★ UPGRADE TO PREMIUM
                </button>
              )}
              {isPremium && !confirmCancel && (
                <button className="btn btn-ghost py-2 text-xs font-black tracking-widest w-full" style={{ borderColor: 'rgba(255,0,64,0.3)', color: 'var(--red)' }} onClick={() => setConfirmCancel(true)}>
                  CANCEL MEMBERSHIP
                </button>
              )}
              {isPremium && confirmCancel && (
                <div className="flex items-center gap-3">
                  <span className="text-xs mono flex-1" style={{ color: 'var(--text)' }}>Are you sure?</span>
                  <button className="btn btn-red px-4 py-1.5 text-xs font-black" onClick={handleCancelMembership}>YES, CANCEL</button>
                  <button className="btn btn-ghost px-4 py-1.5 text-xs font-black" onClick={() => setConfirmCancel(false)}>KEEP IT</button>
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
