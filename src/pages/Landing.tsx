import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { useGame } from '@/contexts/GameContext';
import { useUser } from '@/contexts/UserContext';

export default function Landing() {
  const { game, gameHistory } = useGame();
  const { users } = useUser();

  const players = users.filter(u => !u.isAdmin);
  const totalCoins = players.reduce((s, u) => s + u.credits, 0);
  const totalGames = gameHistory.length;
  const totalMatched = gameHistory.reduce((s, r) => s + r.totalAmount * 2, 0);
  const liveBets = game.teamAQueue.length + game.teamBQueue.length;
  const liveITM = game.totalBookedAmount * 2;

  return (
    <div className="flex flex-col" style={{ minHeight: "100dvh" }} style={{ position: 'relative' }}>
      {/* Background */}
      <div style={{
        position: 'fixed', inset: 0,
        backgroundImage: 'url(/pool-background.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        zIndex: 0,
      }} />
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,4,18,0.38)', zIndex: 1 }} />

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />

        <main className="flex-1 w-full max-w-2xl mx-auto px-3 py-6 flex flex-col gap-6">

          {/* Hero */}
          <div className="hud-panel bracket px-6 py-10 flex flex-col items-center text-center gap-4"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}>
            <div className="mono text-xs tracking-[0.4em] text-[var(--text)] uppercase">
              GameBird Arena
            </div>
            <h1
              className="font-black uppercase tracking-widest leading-none"
              style={{ fontSize: 'clamp(2.5rem,11vw,5rem)', color: 'var(--cyan)', textShadow: '0 0 16px rgba(0,229,255,0.25), ' }}
            >
              The Ultimate<br />
              <span style={{ color: 'var(--gold)', textShadow: '0 0 5px rgba(255,215,0,0.15)' }}>Betting</span>{' '}
              Experience
            </h1>
            <p className="text-sm max-w-lg leading-relaxed" style={{ color: 'var(--text)' }}>
              Join Game Bird for the most exciting peer-to-peer betting platform.
              View live scoreboards &amp; ACTION for free.
              Subscribe to place bets and win real coins!
            </p>
            <div className="flex gap-3 mt-2">
              <Link to="/login" className="btn btn-cyan px-8 py-3 text-sm" style={{ textDecoration: 'none' }}>
                ▶ SIGN IN
              </Link>
              <Link to="/features" className="btn btn-ghost px-8 py-3 text-sm" style={{ textDecoration: 'none' }}>
                LEARN MORE
              </Link>
            </div>
          </div>

          {/* Origin Story */}
          <div className="hud-panel bracket px-6 py-8 flex flex-col gap-5"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}>
            <div className="flex items-center gap-3">
              <span className="mono text-xs font-black tracking-[0.3em] uppercase" style={{ color: 'var(--gold)' }}>The Inception</span>
              <div className="flex-1 border-t border-[var(--border)]" />
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text)', lineHeight: 1.8 }}>
              For as long as pool has been around, betting on the game has always been a thing — and the culture surrounding it has never been for the faint of heart.
              The game itself is precise, disciplined, and deeply competitive — but the environment in which money changes hands has always been something else entirely.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text)', lineHeight: 1.8 }}>
              Whether you are wagering on yourself or backing another player, betting in a pool hall has always carried a significant barrier to entry.
              Approaching a stranger with a proposition requires a level of social confidence that not everyone possesses — and more importantly, it requires trust.
              Two people who have never met are expected to shake hands, put money on the line, and trust that the other will honor the result.
              That trust is rarely guaranteed, and far too often it falls apart exactly when it matters most.
              Disputes over money are common. Tensions escalate. Altercations happen.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text)', lineHeight: 1.8 }}>
              Then there is the crowd. Any given night in a pool hall, there are spectators who want action on a match — people who are watching,
              engaged, and ready to bet — but who simply are not part of the inner circle. They don't know the right people.
              They don't have the connections to get a wager down. So they watch, and they walk away with nothing.
              The demand is there. The access is not.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--gold)', fontWeight: 700, lineHeight: 1.8 }}>
              Game Bird was built specifically to solve this problem — and to provide a service the pool community has always wanted.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text)', lineHeight: 1.8 }}>
              There is no need to approach a stranger, negotiate terms, or take anyone at their word.
              At Game Bird, every wager is placed digitally, matched in real time, and settled automatically the moment the game concludes.
              Your funds are secured before the first ball is struck — no chasing, no confrontation, no uncertainty.
              Bet when you want and walk away whenever you choose.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text)', lineHeight: 1.8 }}>
              And perhaps the greatest luxury Game Bird offers — you do not have to be in the building.
              For the first time, you can follow a live match, track the action as it happens, and have real money on the line —
              all from wherever you are. Your couch, your car, across town, across the country — it does not matter.
              The moment a big match goes down, Game Bird puts you in the middle of it.
              No travel required. No waiting in a smoky room. No missing out because you couldn't make it that night.
              The pool hall comes to you —{' '}
              <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>never miss ACTION again.</span>
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text)', lineHeight: 1.8 }}>
              Game Bird's betting queue is the first of its kind — a unique and innovative format for wagering on billiards
              that will bring excitement to this competitive community. Rather than relying on backroom handshakes or word-of-mouth arrangements,
              the queue gives every participant a transparent, organized, and fair way to get money on a match in real time.
              It is a system built for the game, by people who understand it.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text)', lineHeight: 1.8 }}>
              Game Bird is also built with inclusivity in mind. This platform is not exclusively for the high-stakes gambler
              looking to put serious money on a match. It equally serves the casual fan — someone who simply wants to have
              a little something riding on a game and enjoy the thrill of sweating it out. Whether you are wagering large
              or just putting up a few coins to make the match more interesting, there is a place for you here.
              The experience is the same regardless of the amount. The excitement is real either way.
            </p>
          </div>

          {/* Live snapshot */}
          <div className="hud-panel bracket overflow-hidden" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
            <div className="px-4 py-2.5 border-b border-[var(--border)] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: 'var(--green)', boxShadow: '0 0 6px var(--green)', animation: 'liveDot 1s ease-in-out infinite' }} />
              <span className="mono text-xs tracking-widest" style={{ color: 'var(--green)' }}>LIVE NOW — GAME #{game.currentGameNumber}</span>
            </div>
            <div className="grid grid-cols-2 divide-x divide-[var(--border)]">
              <div className="px-5 py-4 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text)] uppercase tracking-widest">Live Bets</span>
                  <span className="mono text-xs font-bold" style={{ color: liveBets > 0 ? 'var(--gold)' : 'var(--text)' }}>{liveBets}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text)] uppercase tracking-widest">ITM</span>
                  <span className="mono text-xs font-bold" style={{ color: liveITM > 0 ? 'var(--gold)' : 'var(--text)' }}>{liveITM}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text)] uppercase tracking-widest">Users</span>
                  <span className="mono text-xs font-bold" style={{ color: 'var(--cyan)' }}>{players.length}</span>
                </div>
              </div>
              <div className="px-5 py-4 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text)] uppercase tracking-widest">Games Played</span>
                  <span className="mono text-xs font-bold" style={{ color: 'var(--cyan)' }}>{totalGames}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text)] uppercase tracking-widest">All-time ITM</span>
                  <span className="mono text-xs font-bold" style={{ color: 'var(--gold)' }}>{totalMatched.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text)] uppercase tracking-widest">Coins In Play</span>
                  <span className="mono text-xs font-bold" style={{ color: 'var(--gold)' }}>{totalCoins.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Current matchup */}
          <div className="hud-panel bracket px-5 py-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
            <div className="mono text-xs tracking-widest text-[var(--text)] mb-3">CURRENT MATCHUP</div>
            <div className="flex items-center justify-between gap-4">
              {/* Team A */}
              <div className="flex flex-col items-center flex-1 gap-2">
                <div style={{ width: 80, height: 100, overflow: 'hidden', border: '2px solid var(--cyan)', flexShrink: 0 }}>
                  <img src="/alex.png" alt={game.teamAName} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '70% center' }} />
                </div>
                <span className="font-black uppercase tracking-widest text-sm" style={{ color: 'var(--cyan)', textShadow: '0 0 10px var(--cyan)' }}>
                  {game.teamAName}
                </span>
                <span className="mono text-3xl font-black" style={{ color: 'var(--cyan)' }}>{game.teamAGames}</span>
              </div>
              {/* VS */}
              <div className="flex flex-col items-center gap-1">
                <span className="mono font-black" style={{ fontSize: '1.8rem', color: 'var(--text)' }}>VS</span>
              </div>
              {/* Team B */}
              <div className="flex flex-col items-center flex-1 gap-2">
                <div style={{ width: 80, height: 100, overflow: 'hidden', border: '2px solid var(--red)', flexShrink: 0 }}>
                  <img src="/tony.jpg" alt={game.teamBName} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '70% center' }} />
                </div>
                <span className="font-black uppercase tracking-widest text-sm" style={{ color: 'var(--red)', textShadow: '0 0 10px var(--red)' }}>
                  {game.teamBName}
                </span>
                <span className="mono text-3xl font-black" style={{ color: 'var(--red)' }}>{game.teamBGames}</span>
              </div>
            </div>
          </div>

          {/* Why Game Bird */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xl font-black uppercase tracking-widest" style={{ color: 'var(--cyan)', textShadow: '0 0 6px rgba(0,229,255,0.15)', whiteSpace: 'nowrap' }}>
                Why Choose Game Bird
              </h2>
              <div className="flex-1 border-t border-[var(--border)]" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: '◈', color: 'var(--gold)', title: 'Instant Matching', desc: 'Smart algorithm instantly matches your bets with other players for quick, seamless transactions.' },
                { icon: '◉', color: 'var(--cyan)', title: 'Peer-to-Peer', desc: 'Bet directly against other players, not the house. Create and join betting pools with friends.' },
                { icon: '⊘', color: 'var(--green)', title: 'Secure Platform', desc: 'Your transactions and data are protected with state-of-the-art security measures.' },
              ].map(item => (
                <div key={item.title} className="hud-panel px-3 py-4 flex flex-col items-center gap-2 text-center"
                  style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
                  <span style={{ color: item.color, textShadow: `0 0 4px ${item.color}`, fontSize: '1.4rem' }}>{item.icon}</span>
                  <div className="font-black text-xs uppercase tracking-wide" style={{ color: item.color }}>{item.title}</div>
                  <div className="text-xs text-[var(--text)] leading-snug">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Access tiers */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xl font-black uppercase tracking-widest" style={{ color: 'var(--cyan)', textShadow: '0 0 6px rgba(0,229,255,0.15)', whiteSpace: 'nowrap' }}>
                Choose Your Access Level
              </h2>
              <div className="flex-1 border-t border-[var(--border)]" />
            </div>
            <p className="text-xs text-[var(--text)] mb-4">Start with a free account to explore, then upgrade to place bets and win real coins.</p>
            <div className="grid grid-cols-2 gap-3">
              {/* Free */}
              <div className="hud-panel bracket overflow-hidden" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
                <div className="px-4 py-3 border-b border-[var(--border)]" style={{ background: 'rgba(0,229,255,0.04)' }}>
                  <div className="font-black text-sm uppercase tracking-widest" style={{ color: 'var(--cyan)' }}>◎ Free Access</div>
                  <div className="mono text-xs text-[var(--text)] mt-0.5">$0 / month</div>
                </div>
                <div className="px-4 py-3 flex flex-col gap-2">
                  {[
                    [true, 'View live scoreboard'],
                    [true, 'Track game progress'],
                    [false, 'Place bets (requires sub)'],
                    [false, 'Watch betting queues'],
                  ].map(([ok, label]) => (
                    <div key={label as string} className="flex items-center gap-2 text-xs">
                      <span style={{ color: ok ? 'var(--green)' : 'var(--red)', flexShrink: 0 }}>{ok ? '✓' : '✗'}</span>
                      <span style={{ color: ok ? 'var(--text)' : 'var(--text)' }}>{label as string}</span>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5 border-t border-[var(--border)]">
                  <Link to="/arena" className="btn btn-cyan w-full py-2 text-xs" style={{ textDecoration: 'none' }}>
                    GET FREE ACCESS
                  </Link>
                </div>
              </div>

              {/* Premium */}
              <div className="hud-panel overflow-hidden" style={{ border: '1px solid var(--gold)', boxShadow: '0 0 20px rgba(255,215,0,0.12)', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
                <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,215,0,0.3)', background: 'rgba(255,215,0,0.06)' }}>
                  <div>
                    <div className="font-black text-sm uppercase tracking-widest" style={{ color: 'var(--gold)' }}>★ Premium</div>
                    <div className="mono text-xs text-[var(--text)] mt-0.5">$20 / month</div>
                  </div>
                  <span className="mono text-xs px-1.5 py-0.5 font-black" style={{ border: '1px solid var(--gold)', color: 'var(--gold)' }}>HOT</span>
                </div>
                <div className="px-4 py-3 flex flex-col gap-2">
                  {[
                    'Everything in Free',
                    'Place unlimited bets',
                    'Win real coins',
                    'Cash out winnings',
                  ].map(label => (
                    <div key={label} className="flex items-center gap-2 text-xs">
                      <span style={{ color: 'var(--green)', flexShrink: 0 }}>✓</span>
                      <span style={{ color: 'var(--text)' }}>{label}</span>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5 border-t" style={{ borderColor: 'rgba(255,215,0,0.3)' }}>
                  <Link to="/arena" className="btn btn-gold w-full py-2 text-xs" style={{ textDecoration: 'none' }}>
                    SIGN UP & SUBSCRIBE
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Player leaderboard */}
          {/* Player standings hidden */}

          {/* CTA */}
          <div className="hud-panel bracket px-6 py-8 text-center flex flex-col items-center gap-4"
            style={{ border: '1px solid var(--gold)', boxShadow: '0 0 30px rgba(255,215,0,0.1)', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}>
            <div className="text-xl font-black uppercase tracking-widest" style={{ color: 'var(--gold)', textShadow: '0 0 3px rgba(255,215,0,0.15)' }}>
              Ready to Get Started?
            </div>
            <p className="text-sm max-w-md leading-relaxed" style={{ color: 'var(--text)' }}>
              Join players already using Game Bird. Create your free account today and experience the future of pool betting.
            </p>
            <div className="flex gap-3 mt-1">
              <Link to="/arena" className="btn btn-cyan px-8 py-3 text-sm" style={{ textDecoration: 'none' }}>
                ▶ ENTER ARENA
              </Link>
              <Link to="/about" className="btn btn-ghost px-8 py-3 text-sm" style={{ textDecoration: 'none' }}>
                ABOUT US
              </Link>
            </div>
          </div>

          {/* Footer */}
          <footer className="hud-panel px-5 py-6" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}>
            <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
              <div>
                <div className="font-black text-lg uppercase tracking-widest" style={{ color: 'var(--cyan)', textShadow: '0 0 10px var(--cyan)' }}>
                  Game Bird
                </div>
                <div className="mono text-xs text-[var(--text)] mt-1">beta</div>
              </div>
              <div className="flex flex-col gap-1 text-xs">
                <div className="font-black uppercase tracking-widest mb-2" style={{ color: 'var(--gold)' }}>Links</div>
                <Link to="/about" style={{ color: 'var(--text)', textDecoration: 'none' }} className="hover:text-[var(--cyan)] transition-colors">About</Link>
                <Link to="/faq" style={{ color: 'var(--text)', textDecoration: 'none' }} className="hover:text-[var(--cyan)] transition-colors">FAQ</Link>
                <Link to="/terms" style={{ color: 'var(--text)', textDecoration: 'none' }} className="hover:text-[var(--cyan)] transition-colors">Terms of Use</Link>
                <Link to="/privacy" style={{ color: 'var(--text)', textDecoration: 'none' }} className="hover:text-[var(--cyan)] transition-colors">Privacy Policy</Link>
              </div>
            </div>
            <div className="border-t border-[var(--border)] mt-5 pt-4 text-center mono text-xs text-[var(--text)]">
              © {new Date().getFullYear()} Game Bird. All rights reserved.
            </div>
          </footer>

        </main>
      </div>
    </div>
  );
}
