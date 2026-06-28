import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { useUser } from '@/contexts/UserContext';

type Mode = 'subscription' | 'reload';

const RELOAD_AMOUNTS = [10, 20, 50, 100, 200, 500, 1000];

function fmt(v: string, type: 'card' | 'expiry' | 'cvv') {
  if (type === 'card') return v.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').slice(0, 19);
  if (type === 'expiry') { const d = v.replace(/\D/g, ''); return d.length > 2 ? `${d.slice(0,2)}/${d.slice(2,4)}` : d; }
  return v.replace(/\D/g, '').slice(0, 3);
}

export default function Membership() {
  const { currentUser, addCredits, updateMembership } = useUser();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>('subscription');
  const [reloadAmt, setReloadAmt] = useState(100);
  const [cardNum, setCardNum] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [processing, setProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fillTest = () => { setCardNum('4242 4242 4242 4242'); setExpiry('12/25'); setCvv('123'); setName('Test User'); setAddress('123 Test St, Test City'); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!cardNum || !expiry || !cvv || !name) return;
    setProcessing(true);
    setTimeout(() => {
      if (mode === 'subscription') {
        updateMembership(currentUser.id, {
          tier: 'premium',
          startedAt: Date.now(),
          renewsAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
          cancelledAt: null,
        });
        setSuccessMsg('✓ Membership activated! Welcome to Premium.');
      } else {
        addCredits(currentUser.id, reloadAmt, 'admin_add', `Coin reload — ${reloadAmt} coins purchased`);
        setSuccessMsg(`✓ ${reloadAmt} coins added to ${currentUser.name}'s account!`);
      }
      setProcessing(false);
      setTimeout(() => { setSuccessMsg(''); navigate('/arena'); }, 2500);
    }, 2000);
  };

  return (
    <div className="flex flex-col" style={{ minHeight: "100dvh" }} style={{ position: 'relative' }}>
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1582139329536-e7284fece509?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)', backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0 }} />
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,4,18,0.38)', zIndex: 1 }} />

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />

        <main className="flex-1 w-full max-w-2xl mx-auto px-3 py-6 flex flex-col gap-5">

          {/* Hero */}
          <div className="hud-panel bracket px-6 py-6 text-center flex flex-col items-center gap-2"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}>
            <div className="mono text-xs tracking-[0.4em] text-[var(--text)] uppercase">Game Bird</div>
            <h1 className="font-black uppercase tracking-widest leading-none" style={{ fontSize: 'clamp(1.6rem,6vw,2.6rem)', color: 'var(--cyan)' }}>
              Become a Member
            </h1>
            <p className="text-sm max-w-md leading-relaxed" style={{ color: 'var(--text)' }}>
              Subscribe to our platform to access all betting features and reload your coins anytime.
            </p>
            {!currentUser && (
              <div className="mt-2 px-4 py-3 text-center" style={{ border: '1px solid var(--red)', background: 'rgba(255,0,64,0.08)' }}>
                <div className="text-xs mono text-[var(--red)] uppercase tracking-widest mb-2">No player selected</div>
                <Link to="/arena" className="btn btn-red px-4 py-1.5 text-xs font-black tracking-widest" style={{ textDecoration: 'none' }}>
                  GO TO ARENA
                </Link>
              </div>
            )}
          </div>

          {/* Plan selector */}
          <div className="grid grid-cols-2 gap-3">
            {/* Monthly Membership */}
            <div
              className="hud-panel px-4 py-4 flex flex-col gap-3 cursor-pointer transition-all"
              style={{ background: 'rgba(0,0,0,0.50)', backdropFilter: 'blur(4px)', border: mode === 'subscription' ? '1px solid var(--cyan)' : '1px solid var(--border)' }}
              onClick={() => setMode('subscription')}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs mono font-black uppercase tracking-widest" style={{ color: mode === 'subscription' ? 'var(--cyan)' : 'var(--text)' }}>Monthly Plan</span>
                {mode === 'subscription' && <span className="text-xs mono" style={{ color: 'var(--cyan)' }}>✓ SELECTED</span>}
              </div>
              <div className="mono font-black" style={{ fontSize: '1.8rem', color: 'var(--cyan)', lineHeight: 1 }}>$20<span className="text-sm font-normal text-[var(--text)]">/mo</span></div>
              <ul className="flex flex-col gap-1.5">
                {['Live betting on all matches', 'Complete betting history', 'Priority customer support', 'Required to place bets'].map(f => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-xs mt-0.5" style={{ color: 'var(--green)' }}>✓</span>
                    <span className="text-xs" style={{ color: 'var(--text)' }}>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Reload Coins */}
            <div
              className="hud-panel px-4 py-4 flex flex-col gap-3 cursor-pointer transition-all"
              style={{ background: 'rgba(0,0,0,0.50)', backdropFilter: 'blur(4px)', border: mode === 'reload' ? '1px solid var(--gold)' : '1px solid var(--border)' }}
              onClick={() => setMode('reload')}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs mono font-black uppercase tracking-widest" style={{ color: mode === 'reload' ? 'var(--gold)' : 'var(--text)' }}>Reload Coins</span>
                {mode === 'reload' && <span className="text-xs mono" style={{ color: 'var(--gold)' }}>✓ SELECTED</span>}
              </div>
              <div className="mono font-black" style={{ fontSize: '1.8rem', color: 'var(--gold)', lineHeight: 1 }}>${reloadAmt}<span className="text-sm font-normal text-[var(--text)]"> = {reloadAmt} coins</span></div>
              <div className="grid grid-cols-4 gap-1.5">
                {RELOAD_AMOUNTS.map(a => (
                  <button key={a} type="button" className="btn py-1 text-xs font-black"
                    style={{ border: `1px solid ${reloadAmt === a && mode === 'reload' ? 'var(--gold)' : 'var(--border)'}`, color: reloadAmt === a && mode === 'reload' ? 'var(--gold)' : 'var(--text)', background: reloadAmt === a && mode === 'reload' ? 'rgba(255,215,0,0.08)' : 'transparent' }}
                    onClick={e => { e.stopPropagation(); setReloadAmt(a); setMode('reload'); }}
                  >${a}</button>
                ))}
              </div>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  min="1"
                  placeholder="Custom amount..."
                  className="flex-1 bg-transparent border border-[var(--border)] px-3 py-1.5 text-sm mono outline-none focus:border-[var(--gold)] placeholder:text-[var(--text-dim)]"
                  style={{ color: 'var(--gold)' }}
                  onClick={e => e.stopPropagation()}
                  onChange={e => { const v = Number(e.target.value); if (v > 0) { setReloadAmt(v); setMode('reload'); } }}
                />
              </div>
              <div className="text-xs text-center" style={{ color: 'var(--text)' }}>$1 = 1 coin</div>
            </div>
          </div>

          {/* Payment form */}
          <form onSubmit={handleSubmit} className="hud-panel px-5 py-5 flex flex-col gap-4"
            style={{ background: 'rgba(0,0,0,0.50)', backdropFilter: 'blur(4px)' }}>
            <div className="flex items-center justify-between">
              <div className="text-xs mono tracking-[0.3em] text-[var(--cyan)] uppercase">Payment Information</div>
              <button type="button" className="btn btn-ghost px-3 py-1 text-xs font-black tracking-widest" onClick={fillTest}>
                FILL TEST CARD
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {/* Card number */}
              <div>
                <div className="text-xs mono text-[var(--text)] uppercase tracking-widest mb-1">Card Number</div>
                <input
                  required
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  value={cardNum}
                  onChange={e => setCardNum(fmt(e.target.value, 'card'))}
                  className="w-full bg-transparent border border-[var(--border)] px-3 py-2 text-sm mono outline-none focus:border-[var(--cyan)] placeholder:text-[var(--text)]"
                  style={{ color: 'var(--text)' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs mono text-[var(--text)] uppercase tracking-widest mb-1">Expiry Date</div>
                  <input required type="text" placeholder="MM/YY" maxLength={5}
                    value={expiry} onChange={e => setExpiry(fmt(e.target.value, 'expiry'))}
                    className="w-full bg-transparent border border-[var(--border)] px-3 py-2 text-sm mono outline-none focus:border-[var(--cyan)] placeholder:text-[var(--text)]"
                    style={{ color: 'var(--text)' }} />
                </div>
                <div>
                  <div className="text-xs mono text-[var(--text)] uppercase tracking-widest mb-1">CVV</div>
                  <input required type="text" placeholder="123" maxLength={3}
                    value={cvv} onChange={e => setCvv(fmt(e.target.value, 'cvv'))}
                    className="w-full bg-transparent border border-[var(--border)] px-3 py-2 text-sm mono outline-none focus:border-[var(--cyan)] placeholder:text-[var(--text)]"
                    style={{ color: 'var(--text)' }} />
                </div>
              </div>

              <div>
                <div className="text-xs mono text-[var(--text)] uppercase tracking-widest mb-1">Cardholder Name</div>
                <input required type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)}
                  className="w-full bg-transparent border border-[var(--border)] px-3 py-2 text-sm mono outline-none focus:border-[var(--cyan)] placeholder:text-[var(--text)]"
                  style={{ color: 'var(--text)' }} />
              </div>

              <div>
                <div className="text-xs mono text-[var(--text)] uppercase tracking-widest mb-1">Billing Address</div>
                <textarea placeholder="Enter your billing address" value={address} onChange={e => setAddress(e.target.value)} rows={2}
                  className="w-full bg-transparent border border-[var(--border)] px-3 py-2 text-sm mono outline-none focus:border-[var(--cyan)] placeholder:text-[var(--text)] resize-none"
                  style={{ color: 'var(--text)' }} />
              </div>
            </div>

            {/* Order summary */}
            <div className="border-t border-[var(--border)] pt-3">
              <div className="text-xs mono text-[var(--text)] uppercase tracking-widest mb-2">Order Summary</div>
              {mode === 'subscription' ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: 'var(--text)' }}>Monthly Membership</span>
                  <span className="mono font-black" style={{ color: 'var(--cyan)' }}>$20/month</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm" style={{ color: 'var(--text)' }}>Coin Reload</span>
                    <span className="mono font-black" style={{ color: 'var(--gold)' }}>${reloadAmt}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: 'var(--text)' }}>◈ Coins Added</span>
                    <span className="mono font-black" style={{ color: 'var(--green)' }}>{reloadAmt} coins</span>
                  </div>
                </>
              )}
              <div className="border-t border-[var(--border)] mt-2 pt-2 flex items-center justify-between">
                <span className="text-sm font-black uppercase tracking-wide" style={{ color: 'var(--text)' }}>Total</span>
                <span className="mono font-black text-lg" style={{ color: mode === 'subscription' ? 'var(--cyan)' : 'var(--gold)' }}>
                  ${mode === 'subscription' ? '20/month' : reloadAmt}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button type="button" className="btn btn-ghost flex-1 py-3 text-xs font-black tracking-widest" onClick={() => navigate('/arena')}>
                CANCEL
              </button>
              <button
                type="submit"
                disabled={processing || !currentUser}
                className="btn flex-1 py-3 text-sm font-black tracking-widest"
                style={{
                  border: `1px solid ${mode === 'subscription' ? 'var(--cyan)' : 'var(--gold)'}`,
                  color: mode === 'subscription' ? 'var(--cyan)' : 'var(--gold)',
                  background: mode === 'subscription' ? 'rgba(0,229,255,0.08)' : 'rgba(255,215,0,0.08)',
                  opacity: (processing || !currentUser) ? 0.5 : 1,
                }}
              >
                {processing ? '⟳  PROCESSING...' : mode === 'subscription' ? '★  SUBSCRIBE NOW' : '◈  PURCHASE COINS'}
              </button>
            </div>

            {successMsg && (
              <div className="text-center text-sm mono font-black" style={{ color: 'var(--green)' }}>{successMsg}</div>
            )}

            <div className="text-xs text-center" style={{ color: 'var(--text)' }}>
              By proceeding, you agree to our Terms of Service and Privacy Policy.<br />
              A valid subscription is required to place bets on our platform.
            </div>
          </form>

          {/* Alternative payment */}
          <div className="hud-panel px-5 py-5" style={{ background: 'rgba(0,0,0,0.50)', backdropFilter: 'blur(4px)' }}>
            <div className="text-xs mono tracking-[0.3em] text-[var(--cyan)] uppercase mb-4">Alternative Payment Methods</div>

            {/* Instructions */}
            <div className="hud-panel px-4 py-4 mb-4" style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid var(--border)' }}>
              <div className="font-black uppercase tracking-wide text-sm mb-2" style={{ color: 'var(--cyan)' }}>📝 Payment Instructions</div>
              <p className="text-xs leading-relaxed mb-2" style={{ color: 'var(--text)' }}>
                When paying via QR code, please include a note with your payment specifying:
              </p>
              <div className="px-3 py-2 mb-2" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border)' }}>
                <div className="mono text-xs" style={{ color: 'var(--cyan)' }}><strong>Format:</strong> username-amount</div>
                <div className="mono text-xs mt-1" style={{ color: 'var(--cyan)' }}><strong>Example:</strong> john_doe-1000</div>
              </div>
              <p className="text-xs" style={{ color: 'var(--text)' }}>
                This helps us verify your payment and instantly credit your Sweep Coins!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Venmo */}
              <div className="hud-panel px-4 py-4 flex flex-col items-center gap-3" style={{ background: 'rgba(0,0,0,0.35)' }}>
                <div className="font-black uppercase tracking-widest text-sm" style={{ color: 'var(--cyan)' }}>Venmo</div>
                <div className="p-2 bg-white" style={{ borderRadius: 4 }}>
                  <img src="/venmo.png" alt="Venmo QR Code" style={{ width: 140, height: 140, objectFit: 'contain', display: 'block' }} />
                </div>
                <div className="text-xs mono text-center" style={{ color: 'var(--text)' }}>@gamebird2025</div>
              </div>

              {/* Zelle */}
              <div className="hud-panel px-4 py-4 flex flex-col items-center gap-3" style={{ background: 'rgba(0,0,0,0.35)' }}>
                <div className="font-black uppercase tracking-widest text-sm" style={{ color: 'var(--cyan)' }}>Zelle</div>
                <div className="p-2 bg-white" style={{ borderRadius: 4 }}>
                  <img src="/zelle.png" alt="Zelle QR Code" style={{ width: 140, height: 140, objectFit: 'contain', display: 'block' }} />
                </div>
                <div className="text-xs mono text-center" style={{ color: 'var(--text)' }}>
                  Tag: gamebird<br />gamebird2025@gmail.com
                </div>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
