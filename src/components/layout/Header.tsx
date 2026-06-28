import React, { useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import { useUser } from '@/contexts/UserContext';
import UserBar from './UserBar';

const ADMIN_PASSWORD = '1980';

export default function Header() {
  const { isAdmin, setIsAdmin } = useGame();
  const { users } = useUser();
  const loc = useLocation();
  const navigate = useNavigate();
  const totalCoins = users.filter(u => !u.isAdmin).reduce((s, u) => s + u.credits, 0);
  const [showPwPrompt, setShowPwPrompt] = useState(false);
  const [pw, setPw] = useState('');
  const [pwError, setPwError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const openPrompt = () => {
    setPw('');
    setPwError(false);
    setShowPwPrompt(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const submitPassword = () => {
    if (pw === ADMIN_PASSWORD) {
      setShowPwPrompt(false);
      setIsAdmin(true);
      navigate('/admin');
    } else {
      setPwError(true);
      setPw('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  return (
    <header
      className="w-full flex items-center justify-between px-4 py-2 border-b"
      style={{ background: '#cc0000', borderColor: '#000', position: 'sticky', top: 0, zIndex: 100 }}
    >
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 no-underline">
        <span className="text-lg font-black tracking-widest uppercase" style={{ color: '#000' }}>Game Bird</span>
        <span className="text-xs mono" style={{ color: '#fff' }}>beta</span>
      </Link>

      {/* Nav */}
      <nav className="hidden sm:flex items-center gap-1">
        {[
          { to: '/arena', label: 'ARENA' },
          { to: '/postbox', label: 'POSTBOX' },
          { to: '/features', label: 'FEATURES' },
          { to: '/about', label: 'ABOUT' },
          { to: '/faq', label: 'FAQ' },
          { to: '/membership', label: 'GET COINS' },
        ].map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className="px-3 py-1 text-xs font-bold tracking-widest uppercase transition-colors"
            style={{
              color: loc.pathname === to ? '#000' : '#fff',
              borderBottom: loc.pathname === to ? '1px solid #000' : '1px solid transparent',
              textDecoration: 'none',
            }}
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {isAdmin && (
          <Link
            to="/admin"
            className="text-xs mono px-2 py-1 flex items-center gap-2"
            style={{ color: 'var(--gold)', border: '1px solid var(--gold)', opacity: 0.8, textDecoration: 'none' }}
          >
            ADMIN
            <span style={{ color: 'rgba(255,215,0,0.6)', borderLeft: '1px solid rgba(255,215,0,0.3)', paddingLeft: 8 }}>
              {totalCoins.toLocaleString()} coins
            </span>
          </Link>
        )}
        <UserBar />
      </div>

      {/* Admin password prompt */}
      {showPwPrompt && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.8)' }}
          onClick={() => setShowPwPrompt(false)}
        >
          <div
            className="flex flex-col gap-4 p-6 w-72"
            style={{ background: '#0a0a18', border: '1px solid rgba(255,215,0,0.4)', borderRadius: 4 }}
            onClick={e => e.stopPropagation()}
          >
            <span className="mono text-sm font-black tracking-[0.25em]" style={{ color: 'var(--gold)' }}>ADMIN ACCESS</span>
            <input
              ref={inputRef}
              type="password"
              value={pw}
              onChange={e => { setPw(e.target.value); setPwError(false); }}
              onKeyDown={e => { if (e.key === 'Enter') submitPassword(); if (e.key === 'Escape') setShowPwPrompt(false); }}
              placeholder="Enter password"
              className="bg-transparent border px-3 py-2 mono text-sm outline-none w-full"
              style={{ borderColor: pwError ? 'var(--red)' : 'rgba(255,215,0,0.3)', color: 'var(--text)' }}
            />
            {pwError && (
              <span className="mono text-xs" style={{ color: 'var(--red)', marginTop: -8 }}>Incorrect password</span>
            )}
            <div className="flex gap-2">
              <button className="btn btn-ghost flex-1 py-2 text-xs" onClick={() => setShowPwPrompt(false)}>CANCEL</button>
              <button className="btn btn-gold flex-1 py-2 text-xs font-black" onClick={submitPassword}>ENTER</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
