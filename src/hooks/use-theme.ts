
"use client";

import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'app-theme';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme | undefined>(undefined);

  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    setThemeState(storedTheme || preferredTheme);
  }, []);

  useEffect(() => {
    if (theme) {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  return { theme, setTheme, toggleTheme, isThemeLoaded: theme !== undefined };
}
