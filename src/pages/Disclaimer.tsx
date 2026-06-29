import React from 'react';
import Header from '@/components/layout/Header';

const sections = [
  {
    title: 'Entertainment Purposes Only',
    body: 'Game Bird is an entertainment platform designed for use in social and recreational settings. All activity on this platform is intended for entertainment purposes only. Game Bird is not a casino, sportsbook, or licensed gambling operator of any kind.',
  },
  {
    title: 'Sweep Coins Are Not Real Currency',
    body: 'Game Bird operates using Sweep Coins — a virtual in-platform currency. Sweep Coins have no cash value outside of the Game Bird platform and are not legal tender, securities, or a form of cryptocurrency. The purchase, use, and exchange of Sweep Coins does not constitute real-money gambling.',
  },
  {
    title: 'No Guarantee of Winnings',
    body: 'Participation in any wagering activity on Game Bird carries inherent risk. Game Bird makes no guarantee of winnings, profits, or returns of any kind. You may lose Sweep Coins. Play responsibly.',
  },
  {
    title: 'User Responsibility',
    body: 'By using Game Bird, you accept full personal responsibility for your activity on the platform. Game Bird is not responsible for any losses, disputes, or consequences arising from the use of this platform — including but not limited to financial loss, interpersonal disputes, or any illegal activity conducted by users. Users are expected to comply with all applicable local, state, and federal laws.',
  },
  {
    title: 'Not Liable for User Conduct',
    body: 'Game Bird facilitates peer-to-peer wagering between consenting users. We are not a party to any wager and are not responsible for the conduct, honesty, or actions of any user — including judges, challengers, or opponents in Postbox challenges.',
  },
  {
    title: 'Right to Refuse Service',
    body: 'Game Bird reserves the right to refuse service to any user at any time, for any reason, without prior notice or explanation. Game Bird may suspend, restrict, or permanently revoke any user\'s account or membership at its sole discretion. Revocation of membership does not entitle the user to a refund of any Sweep Coins purchases.',
  },
  {
    title: 'Age Requirement',
    body: 'You must be 21 years of age or older to use Game Bird. By accessing this platform, you confirm that you meet this requirement.',
  },
  {
    title: 'No Financial Advice',
    body: 'Nothing on Game Bird constitutes financial, legal, or investment advice. Game Bird is not a licensed financial institution and does not provide any form of financial services.',
  },
  {
    title: 'Platform Availability',
    body: 'Game Bird makes no guarantee of uptime, availability, or uninterrupted access to the platform. We reserve the right to perform maintenance, updates, or take the platform offline at any time without notice. Game Bird is not liable for any losses or inconveniences resulting from downtime.',
  },
  {
    title: 'Dispute Resolution',
    body: 'Game Bird is not a mediator or arbitrator of disputes between users. Any disagreements between players — including Postbox challenge outcomes — are the sole responsibility of the parties involved. Game Bird\'s decision on any platform-related matter is final.',
  },
  {
    title: 'Privacy',
    body: 'Game Bird collects minimal user data necessary to operate the platform. We do not sell, share, or distribute personal information to third parties. By using the platform, you consent to the collection and use of data as described herein.',
  },
  {
    title: 'No Affiliation with Professional or Governing Bodies',
    body: 'Game Bird has no affiliation with any professional billiards organization, governing body, or tournament operator.',
  },
  {
    title: 'Responsible Play',
    body: 'Game Bird encourages all users to play responsibly. If wagering is negatively affecting your life or the lives of those around you, please seek help. Resources are available at ncpgambling.org (National Council on Problem Gambling).',
  },
  {
    title: 'Changes to Terms',
    body: 'All terms, conditions, rules, and policies on this platform are subject to change at any time without prior notice. Game Bird reserves the right to modify, update, or replace any part of these terms at its sole discretion. Continued use of the platform following any changes constitutes your acceptance of the revised terms. It is your responsibility to review this page periodically.',
  },
];

export default function Disclaimer() {
  return (
    <div className="flex flex-col" style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
      <Header />
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">

        {/* Title */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black uppercase tracking-widest" style={{ color: 'var(--cyan)', textShadow: '0 0 8px rgba(0,229,255,0.15)' }}>
              Disclaimer
            </h1>
            <div className="flex-1 border-t border-[var(--border)]" />
          </div>
          <p className="mono text-xs" style={{ color: 'var(--text)' }}>TERMS OF USE — Last updated: June 2026</p>
        </div>

        {/* Notice banner */}
        <div className="hud-panel px-4 py-3" style={{ borderColor: 'var(--gold)', background: 'rgba(255,215,0,0.04)' }}>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--gold)' }}>
            By accessing or using Game Bird, you acknowledge that you have read, understood, and agree to be bound by the terms outlined on this page. If you do not agree, do not use this platform.
          </p>
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-4">
          {sections.map((s, i) => (
            <div key={s.title} className="hud-panel overflow-hidden">
              <div className="px-4 py-2.5 border-b border-[var(--border)]" style={{ background: 'rgba(0,229,255,0.03)' }}>
                <div className="flex items-center gap-3">
                  <span className="mono text-xs font-black" style={{ color: 'rgba(0,229,255,0.3)' }}>{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--cyan)' }}>{s.title}</span>
                </div>
              </div>
              <div className="px-4 py-3">
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>{s.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="text-center pb-4">
          <p className="mono text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>© {new Date().getFullYear()} Game Bird. All rights reserved.</p>
        </div>

      </main>
    </div>
  );
}
