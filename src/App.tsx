import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.getElementById('root')?.scrollTo(0, 0);
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
import { UserProvider } from '@/contexts/UserContext';
import { GameProvider } from '@/contexts/GameContext';
import Landing from '@/pages/Landing';
import Arena from '@/pages/Arena';
import Whitebook from '@/pages/Whitebook';
import Features from '@/pages/Features';
import About from '@/pages/About';
import FAQ from '@/pages/FAQ';
import AccountSettings from '@/pages/AccountSettings';
import GetCoins from '@/pages/GetCoins';
import Membership from '@/pages/Membership';
import Terms from '@/pages/Terms';
import Privacy from '@/pages/Privacy';
import Login from '@/pages/Login';
import AdminArena from '@/pages/AdminArena';
import JudgePage from '@/pages/JudgePage';
import Postbox from '@/pages/Postbox';
import './index.css';

export default function App() {
  return (
    <UserProvider>
      <HashRouter>
        <GameProvider>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/arena" element={<Arena />} />
            <Route path="/admin" element={<AdminArena />} />
            <Route path="/whitebook" element={<Whitebook />} />
            <Route path="/features" element={<Features />} />
            <Route path="/about" element={<About />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/settings" element={<AccountSettings />} />
            <Route path="/get-coins" element={<GetCoins />} />
            <Route path="/membership" element={<Membership />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/judge/:token" element={<JudgePage />} />
            <Route path="/postbox" element={<Postbox />} />
            <Route path="*" element={<Landing />} />
          </Routes>
        </GameProvider>
      </HashRouter>
    </UserProvider>
  );
}
