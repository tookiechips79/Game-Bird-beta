import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import { useUser } from '@/contexts/UserContext';
import UserBar from './UserBar';

export default function Header() {
  const { isAdmin, setIsAdmin } = useGame();
  const { users } = useUser();
  const loc = useLocation();
  const totalCoins = users.filter(u => !u.isAdmin).reduce((s, u) => s + u.credits, 0);

  return (
    <header
      className="w-full flex items-center justify-between px-4 py-2 border-b border-[var(--border)]"
      style={{ background: 'rgba(13,13,32,0.95)', backdropFilter: 'blur(8px)', position: 'sticky', top: 0, zIndex: 100 }}
    >
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 no-underline">
        <span className="text-lg font-black tracking-widest neon-cyan uppercase">Game Bird</span>
        <span className="text-xs mono text-[var(--text-dim)]">beta</span>
      </Link>

      {/* Nav */}
      <nav className="hidden sm:flex items-center gap-1">
        {[
          { to: '/arena', label: 'ARENA' },
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
              color: loc.pathname === to ? 'var(--cyan)' : 'var(--text-dim)',
              borderBottom: loc.pathname === to ? '1px solid var(--cyan)' : '1px solid transparent',
              textDecoration: 'none',
            }}
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {!isAdmin && (
          <button
            className="btn btn-ghost px-2 py-1 text-xs"
            onClick={() => setIsAdmin(true)}
            title="Enter admin mode"
          >
            ⚙
          </button>
        )}
        {isAdmin && (
          <span className="text-xs mono px-2 py-1 flex items-center gap-2" style={{ color: 'var(--gold)', border: '1px solid var(--gold)', opacity: 0.8 }}>
            ADMIN
            <span style={{ color: 'rgba(255,215,0,0.6)', borderLeft: '1px solid rgba(255,215,0,0.3)', paddingLeft: 8 }}>
              {totalCoins.toLocaleString()} coins
            </span>
          </span>
        )}
        <UserBar />
      </div>
    </header>
  );
}
