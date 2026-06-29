import { createRoot } from 'react-dom/client';
import App from './App';

// Unlock audio context on first user gesture so hover sounds work
document.addEventListener('click', () => {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  ctx.resume().catch(() => {});
}, { once: true });

// Global keytype sound on all text inputs
const keytypeSound = new Audio('/keytype.mp3');
document.addEventListener('keydown', (e) => {
  const el = e.target as HTMLElement;
  if (el.matches('input, textarea')) {
    keytypeSound.currentTime = 0;
    keytypeSound.play().catch(() => {});
  }
}, { passive: true });

createRoot(document.getElementById('root')!).render(<App />);
