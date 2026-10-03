import { FileText, Moon, Sun } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle('dark', next);
    try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch { /* storage unavailable */ }
    setDark(next);
  };
  return (
    <header className="border-b border-line bg-surface/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-[10px] bg-brand text-white"><FileText size={18} aria-hidden /></span>
          <span className="text-[17px] font-semibold tracking-tight text-head">Image → PDF</span>
        </div>
        <button onClick={toggle} aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
          className="grid size-11 place-items-center rounded-[10px] text-muted transition-colors duration-200 hover:bg-soft hover:text-brand">
          {dark ? <Sun size={19} aria-hidden /> : <Moon size={19} aria-hidden />}
        </button>
      </div>
    </header>
  );
}
