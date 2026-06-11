import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { DARK_THEME, LIGHT_THEME } from '../theme';

// ── Context ───────────────────────────────────────────────────────────────────
export const ThemeContext = createContext({
  isDark:      true,
  theme:       DARK_THEME,
  toggleTheme: () => {},
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function readStoredTheme() {
  try {
    const v = localStorage.getItem('seismica-theme');
    if (v === 'dark')  return true;
    if (v === 'light') return false;
  } catch {}
  // Fallback: system preference, default dark
  try { return window.matchMedia('(prefers-color-scheme: dark)').matches; } catch {}
  return true;
}

function applyThemeClass(isDark) {
  const root = document.documentElement;
  if (isDark) {
    root.classList.remove('theme-light');
    root.classList.add('theme-dark');
  } else {
    root.classList.remove('theme-dark');
    root.classList.add('theme-light');
  }
}

function persistTheme(isDark) {
  try { localStorage.setItem('seismica-theme', isDark ? 'dark' : 'light'); } catch {}
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const initial = readStoredTheme();
    // Sync the DOM immediately (anti-flash script already did this, but
    // ensure React state is aligned on first render)
    applyThemeClass(initial);
    return initial;
  });

  const toggleTheme = useCallback(() => {
    const root = document.documentElement;

    // 1. Enable the global CSS transition class
    root.classList.add('theme-transitioning');

    // 2. Synchronously flip the DOM theme class (instant CSS var update)
    const nextDark = !isDark;
    applyThemeClass(nextDark);
    persistTheme(nextDark);

    // 3. Update React state (triggers re-renders needing JS color logic)
    setIsDark(nextDark);

    // 4. Remove transition class after animation window
    setTimeout(() => root.classList.remove('theme-transitioning'), 450);
  }, [isDark]);

  // Keep DOM class in sync whenever state changes externally
  useEffect(() => { applyThemeClass(isDark); }, [isDark]);

  return (
    <ThemeContext.Provider value={{
      isDark,
      theme:       isDark ? DARK_THEME : LIGHT_THEME,
      toggleTheme,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useTheme = () => useContext(ThemeContext);
