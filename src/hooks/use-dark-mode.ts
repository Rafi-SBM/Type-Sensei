import { useState, useEffect } from 'react';

export function useDarkMode() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const stored = localStorage.getItem('theme-mode');
    if (stored) {
      return stored === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add('dark');
      localStorage.setItem('theme-mode', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('theme-mode', 'light');
    }
  }, [isDark]);

  return {
    isDark,
    toggleDarkMode: () => setIsDark(!isDark),
  };
}
