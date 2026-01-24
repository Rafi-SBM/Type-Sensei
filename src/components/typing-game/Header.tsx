import React from 'react';
import { useDarkMode } from '@/hooks/use-dark-mode';

const SunIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M12 4V2M12 22v-2M4 12H2M22 12h-2M5 5l-1.5-1.5M20.5 20.5L19 19M5 19l-1.5 1.5M20.5 3.5L19 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const MoonIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Header component - displays the title with dark mode toggle
const Header: React.FC = React.memo(() => {
  const { isDark, toggleDarkMode } = useDarkMode();

  return (
    <header className="mb-8">
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <h1 className="text-3xl font-semibold text-foreground mb-2">Type Sensei</h1>
          <p className="text-muted-foreground text-sm">Surpass your limits. Right here. Right now.</p>
        </div>
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
          aria-label="Toggle dark mode"
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;
