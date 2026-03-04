'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

type ThemeName = 'theme-dark' | 'theme-light';

const STORAGE_KEY = 'chs-theme';

function applyTheme(theme: ThemeName) {
  const root = document.documentElement;
  root.classList.add('theme-transition');
  root.classList.remove('theme-dark', 'theme-light');
  root.classList.add(theme);
  localStorage.setItem(STORAGE_KEY, theme);
  window.setTimeout(() => root.classList.remove('theme-transition'), 250);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeName>('theme-dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeName | null;
    const initial =
      stored === 'theme-light' || stored === 'theme-dark'
        ? stored
        : (document.documentElement.classList.contains('theme-light') ? 'theme-light' : 'theme-dark');
    setTheme(initial);
    applyTheme(initial);
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = theme === 'theme-dark' ? 'theme-light' : 'theme-dark';
    setTheme(next);
    applyTheme(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={mounted && theme === 'theme-dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="inline-flex h-11 w-11 min-h-11 min-w-11 items-center justify-center rounded-full border border-slate-700 bg-slate-900/70 text-white transition hover:border-slate-600 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
    >
      {mounted && theme === 'theme-light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </button>
  );
}
